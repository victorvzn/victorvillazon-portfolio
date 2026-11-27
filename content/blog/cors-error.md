---
title: 'El error de CORS: qué significa y cómo se soluciona de verdad'
description: '"Blocked by CORS policy" es el error más confuso de fetch. Qué es el mismo origen, por qué el navegador bloquea la respuesta y por qué la solución casi siempre está en el servidor.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fetch, APIs, HTTP]
draft: true
---

Haces un `fetch` a una API, abres la consola y aparece esto en rojo:

```bash
Access to fetch at 'https://api.ejemplo.com/datos' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

Pruebas la misma URL en el navegador y funciona. La pruebas en Postman y funciona. Pero desde tu JavaScript, no. ¿Qué está pasando?

## Primero: qué es un "origen"

Un **origen** es la combinación de tres cosas de una URL:

```
https://www.mitienda.com:443/productos
└─┬──┘   └──────┬──────┘ └┬┘
protocolo    dominio    puerto
```

Dos URL tienen **el mismo origen** solo si coinciden **las tres**:

| Desde `https://mitienda.com` hacia... | ¿Mismo origen? | Por qué |
| --- | --- | --- |
| `https://mitienda.com/api/productos` | ✅ Sí | Solo cambia la ruta |
| `http://mitienda.com` | ❌ No | Cambia el protocolo |
| `https://api.mitienda.com` | ❌ No | Cambia el dominio (un subdominio cuenta como distinto) |
| `https://mitienda.com:8080` | ❌ No | Cambia el puerto |

Ojo: `http://localhost:5173` (tu proyecto de Vite) y `http://localhost:3000` (tu servidor de Node) **son orígenes distintos**, porque cambia el puerto.

## La política del mismo origen

Por seguridad, los navegadores aplican la **política del mismo origen**: el JavaScript de una página **no puede leer las respuestas** de otro origen... salvo que **ese otro origen lo permita**.

¿Por qué? Imagina que estás conectado a tu banco en una pestaña y entras en una web maliciosa en otra. Sin esta política, el JavaScript de la web maliciosa podría hacer `fetch('https://mibanco.com/movimientos')`: el navegador enviaría **tus cookies** del banco y la web leería tus movimientos. La política del mismo origen lo impide.

## Qué es CORS

**CORS** (*Cross-Origin Resource Sharing*, intercambio de recursos entre orígenes) es la forma en que **un servidor dice "sí, dejo que estos orígenes lean mis respuestas"**. Lo hace con **cabeceras** HTTP en la respuesta:

```bash
Access-Control-Allow-Origin: https://mitienda.com
```

Así funciona el proceso:

1. Tu JavaScript hace `fetch` a otro origen.
2. El navegador envía la petición y añade una cabecera `Origin: http://localhost:5173`.
3. El servidor responde. Si incluye `Access-Control-Allow-Origin` con tu origen (o `*`, que significa "cualquiera"), el navegador te deja leer la respuesta.
4. Si **no** la incluye, el navegador **bloquea la respuesta** y te muestra el error de CORS.

**La clave para entenderlo:** el error de CORS **no** lo da el servidor, lo da **tu navegador**, que te protege. La petición sí llegó al servidor; lo que el navegador no te deja es **leer** la respuesta. Por eso en Postman o en Node funciona: no son navegadores y no aplican esta política.

## Las peticiones "preflight"

Para algunas peticiones, el navegador **pregunta antes** con una petición especial de tipo `OPTIONS`, llamada **preflight** (verificación previa). Pasa cuando:

- Usas métodos como `PUT`, `PATCH` o `DELETE`.
- Envías cabeceras propias, como `Authorization` o `Content-Type: application/json`.

El servidor tiene que responder a ese `OPTIONS` diciendo qué permite:

```bash
Access-Control-Allow-Origin: https://mitienda.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

Si en la pestaña **Network** ves una petición `OPTIONS` fallida antes de la tuya, el problema está en el preflight.

## Cómo se soluciona (de verdad)

### Si la API es tuya: configura el servidor

La solución correcta está **en el servidor**: añadir las cabeceras CORS. Con el servidor de Node del post de Node.js, sería así:

```js
import { createServer } from 'node:http'

const ORIGENES_PERMITIDOS = ['http://localhost:5173', 'https://mitienda.com']

const servidor = createServer((peticion, respuesta) => {
  const origen = peticion.headers.origin

  if (ORIGENES_PERMITIDOS.includes(origen)) {
    respuesta.setHeader('Access-Control-Allow-Origin', origen)
    respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  // Responder al preflight
  if (peticion.method === 'OPTIONS') {
    respuesta.writeHead(204)
    respuesta.end()
    return
  }

  respuesta.writeHead(200, { 'Content-Type': 'application/json' })
  respuesta.end(JSON.stringify({ mensaje: 'Hola desde la API' }))
})

servidor.listen(3000)
```

Con un framework como Express es una línea con el paquete `cors`. En Next.js, se configura en el propio proyecto.

### Si la API no es tuya

- **Lee su documentación.** Muchas APIs públicas solo se pueden usar **desde un servidor**, no desde el navegador, a propósito (por ejemplo, porque necesitan una clave secreta que no debe verse en el frontend).
- **Haz la petición desde tu propio backend.** Tu frontend llama a **tu** servidor (mismo origen, o con CORS configurado), y tu servidor llama a la API externa. Entre servidores no hay CORS. A esto se le llama hacer de **proxy**.

### En desarrollo: el proxy de Vite

Si tu frontend (`localhost:5173`) y tu API (`localhost:3000`) están en puertos distintos solo mientras desarrollas, Vite puede hacer de proxy:

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

Ahora en tu código haces `fetch('/api/productos')` (mismo origen: `localhost:5173`), y Vite reenvía la petición a `localhost:3000` por detrás. Sin CORS.

## Lo que NO soluciona CORS

- **`mode: 'no-cors'` en el `fetch`.** El error desaparece... pero la respuesta llega **vacía** y no puedes leerla. No sirve para lo que quieres.
- **Extensiones del navegador que "desactivan CORS".** Funcionan solo en **tu** navegador. Tus usuarios seguirán viendo el error.
- **Cambiar cosas en tu `fetch`.** El permiso lo da **el servidor**. Desde el frontend no puedes concederte permiso a ti mismo (si pudieras, la protección no serviría para nada).

## Cómo diagnosticarlo

1. Abre las DevTools → pestaña **Network**.
2. Haz clic en la petición fallida (y en la `OPTIONS` anterior, si existe).
3. En **Response Headers**, busca `Access-Control-Allow-Origin`.
   - ¿No está? El servidor no permite CORS → hay que configurarlo en el servidor.
   - ¿Está, pero con otro origen? Hay que añadir el tuyo.
4. Comprueba en **Request Headers** qué `Origin` envió tu navegador.

## Errores comunes

- **Buscar la solución en el frontend.** CORS se configura **en el servidor**.
- **Usar `mode: 'no-cors'`.** Oculta el error, pero no puedes leer la respuesta.
- **Poner `Access-Control-Allow-Origin: *` en una API con usuarios y cookies.** Abres tu API a cualquier web. Lista los orígenes permitidos.
- **Olvidar que cambiar de puerto es cambiar de origen.** `localhost:5173` y `localhost:3000` son distintos.
- **Llamar desde el frontend a APIs que piden una clave secreta.** Esa llamada tiene que ir desde tu servidor.

## Para profundizar

- [CORS en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Guides/CORS)
- [Política del mismo origen en MDN](https://developer.mozilla.org/es/docs/Web/Security/Same-origin_policy)

En resumen: un **origen** es protocolo + dominio + puerto. Por seguridad, **el navegador no deja leer respuestas de otro origen** salvo que el servidor lo permita con **`Access-Control-Allow-Origin`**. El error de CORS lo da tu navegador para protegerte, y **se arregla en el servidor**: configurando sus cabeceras, usando tu propio backend como intermediario o, en desarrollo, con el **proxy de Vite**.
