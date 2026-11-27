---
title: 'AWS Lambda: crea una API serverless con Node.js'
description: 'Qué es serverless y cómo funciona Lambda, tu primera función con Node.js, el objeto event, publicarla con una Function URL, leer parámetros y el body, variables de entorno, logs en CloudWatch, CORS y cuándo conviene (y cuándo no).'
date: 2026-11-27
series: devops
tags: [AWS, Lambda, Serverless, Node.js, Avanzado]
draft: true
---

Para tener tu API de Express en internet necesitas un servidor **encendido 24 horas**, aunque solo reciba diez peticiones al día. Lo pagas, lo actualizas, lo vigilas.

**AWS Lambda** propone otra cosa: subes **solo una función**, y AWS la ejecuta **cada vez que alguien la llama**. Si nadie la llama, no se ejecuta y no pagas. Si de repente la llaman mil veces por segundo, AWS ejecuta mil copias a la vez. A esto se le llama **serverless** (sin servidor): los servidores existen, pero no los ves ni los gestionas.

## Cómo funciona Lambda

1. Escribes una función, el **handler**, que recibe un **evento** (lo que ha pasado) y devuelve una respuesta.
2. La subes a Lambda.
3. Le conectas un **disparador** (*trigger*): una URL, un archivo subido a S3, un horario (cada día a las 8:00), un mensaje en una cola...
4. Cuando ocurre el disparador, AWS **arranca** un entorno con tu código, ejecuta el handler y te cobra por los **milisegundos** que tardó.

Hoy el disparador será una **URL**: tu función se convierte en una API.

## Paso 1: crear la función

> Necesitas tu cuenta de AWS configurada de forma segura, con su presupuesto de gasto cero (está en el primer post del módulo).

1. En la consola, busca **Lambda** → **Crear función**.
2. **Crear desde cero**.
3. **Nombre**: `saludo-api`.
4. **Tiempo de ejecución**: **Node.js** (la versión más reciente que aparezca, por ejemplo Node.js 22.x o superior).
5. **Arquitectura**: `arm64` (un poco más barata y rápida para este caso; `x86_64` también vale).
6. Pulsa **Crear función**.

AWS crea la función con un código de ejemplo en un editor dentro de la consola. Reemplázalo por este (el archivo se llama `index.mjs`):

```js
export const handler = async (event) => {
  const nombre = event.queryStringParameters?.nombre ?? 'mundo'

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensaje: `¡Hola, ${nombre}!`, hora: new Date().toISOString() })
  }
}
```

Pulsa **Deploy** para guardar.

- **`handler`** es la función que Lambda ejecuta. Se exporta y es `async`.
- **`event`** trae la información de la petición.
- Devuelves un objeto con el **código de estado**, las **cabeceras** y el **cuerpo**, que debe ser un **texto** (por eso el `JSON.stringify`).

## Paso 2: darle una URL

1. En la función, pestaña **Configuración** → **URL de la función** → **Crear URL de función**.
2. **Tipo de autenticación**: `NONE` (pública, cualquiera puede llamarla).
3. Guarda.

Te dará una URL como `https://abc123xyz.lambda-url.us-east-1.on.aws/`. Ábrela en el navegador:

```json
{ "mensaje": "¡Hola, mundo!", "hora": "2026-11-27T15:04:05.123Z" }
```

Y con un parámetro: `https://abc123xyz.lambda-url.us-east-1.on.aws/?nombre=Ana`.

**Tienes una API en la nube** sin servidores, sin Docker y sin Express.

> ⚠️ Una URL con autenticación `NONE` la puede llamar cualquiera, todas las veces que quiera, y cada llamada cuenta. Para practicar está bien (tienes el presupuesto de gasto cero), pero en un proyecto real añade protección: **API Gateway** con límites de peticiones, autenticación, o al menos un límite de concurrencia en la función (**Configuración → Simultaneidad**).

## El objeto `event`

Para entender qué llega, lo más fácil es **mirarlo**. Cambia el handler:

```js
export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2))
  return { statusCode: 200, body: 'Mira los logs' }
}
```

Llama a la URL y ve a **Monitor** → **Ver registros de CloudWatch**. Encontrarás algo así (resumido):

```json
{
  "rawPath": "/tareas",
  "rawQueryString": "hecha=true",
  "queryStringParameters": { "hecha": "true" },
  "headers": { "content-type": "application/json", "user-agent": "..." },
  "requestContext": {
    "http": { "method": "POST", "path": "/tareas" }
  },
  "body": "{\"texto\":\"Aprender Lambda\"}",
  "isBase64Encoded": false
}
```

Lo que más usarás:

| Dato | Dónde está |
| --- | --- |
| Método HTTP | `event.requestContext.http.method` |
| Ruta | `event.rawPath` |
| Query string | `event.queryStringParameters` (puede ser `undefined`) |
| Cabeceras | `event.headers` (en minúsculas) |
| Cuerpo | `event.body` (un **texto**: hay que hacer `JSON.parse`) |

Fíjate: **`console.log` en Lambda escribe en CloudWatch**, el servicio de logs de AWS. Es tu forma de depurar.

## Paso 3: una mini API con rutas

Una función puede atender varias rutas mirando el método y la ruta:

```js
const tareas = [{ id: 1, texto: 'Crear mi primera Lambda', hecha: true }]

function responder(statusCode, datos) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: datos === undefined ? '' : JSON.stringify(datos)
  }
}

function leerCuerpo(event) {
  if (!event.body) return {}
  const texto = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body
  return JSON.parse(texto)
}

export const handler = async (event) => {
  const metodo = event.requestContext.http.method
  const ruta = event.rawPath

  try {
    if (metodo === 'GET' && ruta === '/tareas') {
      return responder(200, tareas)
    }

    if (metodo === 'POST' && ruta === '/tareas') {
      const { texto } = leerCuerpo(event)
      if (typeof texto !== 'string' || !texto.trim()) {
        return responder(400, { error: 'El texto es obligatorio' })
      }
      const nueva = { id: tareas.length + 1, texto: texto.trim(), hecha: false }
      tareas.push(nueva)
      return responder(201, nueva)
    }

    return responder(404, { error: `No existe ${metodo} ${ruta}` })
  } catch (error) {
    console.error(error)
    return responder(500, { error: 'Error interno' })
  }
}
```

Pruébala:

```bash
curl https://abc123xyz.lambda-url.us-east-1.on.aws/tareas

curl -X POST https://abc123xyz.lambda-url.us-east-1.on.aws/tareas \
  -H "Content-Type: application/json" \
  -d '{"texto": "Probar desde curl"}'
```

### ⚠️ La trampa de la memoria

Llama varias veces al `POST` y luego al `GET`. A veces verás las tareas nuevas... y a veces no. ¿Por qué?

Lambda **reutiliza** el entorno de ejecución entre llamadas cercanas (por eso `tareas` "recuerda" cosas), pero puede crear **otros entornos en paralelo** o **destruirlos** cuando quiera. Cada uno tiene su propia copia de `tareas`.

**Regla: una Lambda no guarda estado.** Los datos van a una base de datos: **DynamoDB** (la de AWS) o, por ejemplo, **Turso**, que encaja muy bien con serverless porque se conecta por HTTP.

## Variables de entorno y secretos

En **Configuración** → **Variables de entorno**, añade por ejemplo `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`. En el código:

```js
const url = process.env.TURSO_DATABASE_URL
```

Para secretos importantes en proyectos serios, AWS tiene **Secrets Manager** y **Parameter Store**, que los guardan cifrados.

### Usar librerías (como `@libsql/client` o Zod)

El editor de la consola solo vale para código sin dependencias. Con librerías, en tu ordenador:

```bash
npm init -y
npm install @libsql/client zod
# escribe tu index.mjs
```

Comprime en un `.zip` el **contenido** de la carpeta (`index.mjs`, `package.json` y `node_modules`) y súbelo en **Código** → **Cargar desde** → **Archivo .zip**. Herramientas como **AWS SAM**, **SST** o **Serverless Framework** automatizan todo esto (y crean la infraestructura con código) cuando el proyecto crece.

## CORS: llamarla desde tu web

Si tu frontend (por ejemplo, en S3 o Vercel) llama a la función con `fetch`, el navegador exigirá cabeceras CORS. Con Function URLs se configuran sin tocar el código: en **URL de la función** → **Editar** → **Configurar uso compartido de recursos entre orígenes (CORS)**:

- **Origen permitido**: `https://tu-web.com` (y `http://localhost:5173` mientras desarrollas).
- **Métodos permitidos**: `GET`, `POST`.
- **Encabezados permitidos**: `content-type`.

## Arranques en frío

La primera llamada tras un rato sin uso tarda más (de cientos de milisegundos a algún segundo): AWS tiene que preparar un entorno nuevo y cargar tu código. Es el **arranque en frío** (*cold start*). Las siguientes llamadas reutilizan el entorno y son rápidas.

Para reducirlo: pocas dependencias, código pequeño y crear los clientes (de base de datos, por ejemplo) **fuera** del handler, para que se reutilicen entre llamadas:

```js
import { createClient } from '@libsql/client'

// Se ejecuta una vez por entorno, no en cada llamada
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })

export const handler = async (event) => {
  const { rows } = await db.execute('SELECT * FROM tareas')
  return { statusCode: 200, body: JSON.stringify(rows) }
}
```

## ¿Cuándo usar Lambda?

| ✅ Encaja bien | ❌ Encaja peor |
| --- | --- |
| APIs con tráfico irregular o bajo | Tráfico alto y constante (un servidor sale más barato) |
| Tareas programadas (un informe cada noche) | Procesos que duran más de 15 minutos (el máximo de Lambda) |
| Reaccionar a eventos (redimensionar cada imagen subida a S3) | Conexiones permanentes, como WebSockets propios |
| Prototipos y proyectos personales | Apps que necesitan respuestas siempre instantáneas, sin arranques en frío |

## Tu turno

1. Crea la función `saludo-api` con su URL y llámala con distintos `?nombre=`.
2. Añade una ruta `GET /hora` que devuelva la hora de Lima. (Pista: `toLocaleString('es-PE', { timeZone: 'America/Lima' })`.)
3. Comprueba en CloudWatch los logs de tus llamadas y encuentra cuánto tardó cada una (*Duration*) y si hubo arranque en frío (*Init Duration*).
4. Reto: conecta la mini API a Turso con un `.zip` para que las tareas se guarden de verdad.
5. Cuando termines, borra la URL de la función (o la función entera) si no la vas a usar.

## Errores comunes

- **Devolver un objeto como `body`.** Tiene que ser un texto: `JSON.stringify(datos)`.
- **Olvidar el `JSON.parse(event.body)`.** El cuerpo llega como texto.
- **Guardar datos en variables** y esperar que sigan ahí. Usa una base de datos.
- **Dejar una URL pública sin límites** en un proyecto real.
- **Poner secretos en el código.** Usa variables de entorno o Secrets Manager.
- **Tiempo de espera agotado** (*Task timed out after 3.00 seconds*). El límite por defecto es de 3 segundos; súbelo en **Configuración general** si tu función llama a APIs lentas.

## Para profundizar

- [Primeros pasos con Lambda (documentación oficial, en español)](https://docs.aws.amazon.com/es_es/lambda/latest/dg/getting-started.html)
- [URLs de función de Lambda (documentación oficial, en inglés)](https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html)

En resumen: **Lambda** ejecuta una función **solo cuando la llaman** y cobra por milisegundos. El **handler** recibe un **`event`** (método, ruta, query, `body` como texto) y devuelve `{ statusCode, headers, body }`. Con una **Function URL** se convierte en API, **`console.log`** va a **CloudWatch** y los secretos van en **variables de entorno**. Recuerda: **no guarda estado** (usa una base de datos), tiene **arranques en frío** y una URL pública necesita **límites**.
