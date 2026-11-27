---
title: 'API más rápida en Node.js: caché, compresión y peticiones en paralelo'
description: 'Las optimizaciones que más impacto tienen en una API de Node: hacer en paralelo lo que no depende entre sí, evitar consultas N+1, caché en memoria con caducidad, caché HTTP con Cache-Control y ETag, Redis para varios servidores, compresión, keep-alive y paginación.'
date: 2026-11-27
series: backend
tags: [Node.js, Rendimiento, Caché, Express, Avanzado]
draft: true
---

En los posts anteriores del módulo viste cómo **no bloquear** el event loop, cómo **medir** y cómo usar **varios núcleos**. Pero en la mayoría de APIs reales, el tiempo no se va en cálculos: se va en **esperar** a la base de datos y a otras APIs. Y ahí es donde están las mejoras más grandes, a menudo con muy poco código.

Este post recoge las optimizaciones con **mejor relación esfuerzo/resultado**, en el orden en que conviene probarlas.

## 1. Lo que no depende entre sí, en paralelo

El error de rendimiento más común en Node es esperar **una cosa detrás de otra** cuando podrían hacerse **a la vez**:

```js
// ❌ Secuencial: 150 + 200 + 100 = 450 ms
app.get('/api/inicio', async (req, res) => {
  const usuario = await obtenerUsuario(req.usuarioId)       // 150 ms
  const productos = await obtenerDestacados()              // 200 ms
  const notificaciones = await obtenerNotificaciones(req.usuarioId) // 100 ms
  res.json({ usuario, productos, notificaciones })
})

// ✅ En paralelo: lo que tarde la más lenta, 200 ms
app.get('/api/inicio', async (req, res) => {
  const [usuario, productos, notificaciones] = await Promise.all([
    obtenerUsuario(req.usuarioId),
    obtenerDestacados(),
    obtenerNotificaciones(req.usuarioId)
  ])
  res.json({ usuario, productos, notificaciones })
})
```

Las tres consultas no dependen entre sí, así que **`Promise.all`** (lo viste en el post de `Promise.all`, `allSettled` y `race`) las lanza a la vez. De 450 ms a 200 ms cambiando cuatro líneas.

Pregúntate en cada ruta: **¿este `await` necesita el resultado del anterior?** Si no, pueden ir en paralelo.

> Si alguna de las tareas puede fallar sin que eso deba romper la respuesta entera (las notificaciones, por ejemplo), usa `Promise.allSettled` y responde con lo que sí llegó.

## 2. El problema N+1

Muestras una lista de 50 pedidos, cada uno con el nombre de su cliente:

```js
// ❌ 1 consulta para los pedidos + 50 consultas, una por cliente = 51 consultas
const pedidos = await db.execute('SELECT * FROM pedidos LIMIT 50')
for (const pedido of pedidos.rows) {
  const cliente = await db.execute({ sql: 'SELECT nombre FROM clientes WHERE id = ?', args: [pedido.cliente_id] })
  pedido.cliente = cliente.rows[0].nombre
}
```

Es el **problema N+1**: una consulta para la lista y **N** consultas más, una por elemento. Cada consulta tiene un coste fijo (ida y vuelta por la red), así que 51 consultas de 5 ms son más de 250 ms. Y crece con el tamaño de la lista.

La solución: **una sola consulta** con `JOIN` (lo viste en el post de SQL):

```js
// ✅ 1 consulta
const { rows } = await db.execute(`
  SELECT pedidos.*, clientes.nombre AS cliente
  FROM pedidos
  JOIN clientes ON clientes.id = pedidos.cliente_id
  LIMIT 50
`)
```

O, si los datos vienen de otro servicio, **pide todos a la vez** (`WHERE id IN (...)`, o un endpoint que acepte varios ids) en lugar de uno por uno. Los ORM tienen opciones para esto (`include`, `with`...), y es lo primero que hay que revisar cuando una lista va lenta.

Y asegúrate de que las columnas por las que filtras y unes tienen **índices** (como el `CREATE INDEX` del post de Turso con Express): una consulta sin índice sobre una tabla grande puede pasar de 2 ms a 2 segundos.

## 3. Caché en memoria

Si un dato **se pide mucho y cambia poco** (las categorías de la tienda, la configuración, los productos destacados), no tiene sentido ir a la base de datos en cada petición. Guárdalo en memoria un tiempo:

```js
function crearCache({ duracionMs }) {
  const datos = new Map()

  return async function obtener(clave, cargar) {
    const guardado = datos.get(clave)
    if (guardado && guardado.caduca > Date.now()) return guardado.valor

    const promesa = cargar()
    datos.set(clave, { valor: promesa, caduca: Date.now() + duracionMs })

    try {
      return await promesa
    } catch (error) {
      datos.delete(clave) // si falló, no guardamos el error en la caché
      throw error
    }
  }
}

const cache = crearCache({ duracionMs: 60_000 }) // 1 minuto

app.get('/api/categorias', async (req, res) => {
  const categorias = await cache('categorias', () => repositorio.listarCategorias())
  res.json(categorias)
})
```

Detalles que marcan la diferencia:

- **Caducidad** (*TTL*, *time to live*): pasado un minuto, se vuelve a cargar. Así los cambios acaban apareciendo. Elige la duración según cuánto te importa que el dato esté al día.
- **Guardamos la promesa, no el resultado.** Si llegan 100 peticiones a la vez con la caché vacía, todas reciben **la misma promesa** y solo se hace **una** consulta. Sin esto, las 100 irían a la base de datos a la vez (se llama *cache stampede*, estampida).
- **Los errores no se guardan.**
- **Invalida al cambiar**: si un administrador edita las categorías, borra la entrada (`datos.delete('categorias')`) para que se recargue.

> ⚠️ Una caché en memoria **crece sin límite** si las claves son infinitas (por ejemplo, una por usuario o por búsqueda). Limita su tamaño (la librería **lru-cache** lo hace) o tendrás una fuga de memoria, el tema del siguiente post. Y recuerda que con **cluster** o varios contenedores, **cada proceso tiene su propia caché**.

## 4. Caché HTTP: que ni siquiera te pidan

La petición más rápida es la que **no llega** a tu servidor. Con las cabeceras de caché de HTTP, le dices al navegador (y a las CDN) que pueden **reutilizar** una respuesta:

```js
app.get('/api/categorias', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300') // el navegador y las CDN pueden reutilizarla 5 minutos
  res.json(await cache('categorias', () => repositorio.listarCategorias()))
})

app.get('/api/perfil', async (req, res) => {
  res.set('Cache-Control', 'private, no-cache') // datos de un usuario: nunca en una caché compartida
  res.json(await obtenerPerfil(req.usuarioId))
})
```

| Directiva | Significa |
| --- | --- |
| `max-age=300` | Reutilízala durante 300 segundos sin preguntar |
| `public` | Puede guardarla también una CDN o un proxy |
| `private` | Solo el navegador del usuario (datos personales) |
| `no-cache` | Guárdala, pero **pregunta** si sigue valiendo antes de usarla |
| `no-store` | No la guardes nunca (datos sensibles) |

### ETag: "¿ha cambiado?"

Express calcula automáticamente un **ETag** (una huella de la respuesta) para `res.json` y `res.send`. Cuando el navegador vuelve a pedir el recurso, envía esa huella; si la respuesta no ha cambiado, Express responde **304 Not Modified** sin cuerpo. Ahorras transferir los datos, aunque tu servidor sigue haciendo el trabajo de calcularlos.

Para los archivos estáticos (JS, CSS e imágenes con un hash en el nombre, como los que genera Vite), lo ideal es una caché muy larga:

```js
app.use('/assets', express.static('dist/assets', { maxAge: '1y', immutable: true }))
```

Como el nombre del archivo cambia con cada versión, nunca se servirá uno viejo.

## 5. Redis: caché compartida

Cuando tienes **varios procesos o servidores** (el post de cluster), la caché en memoria de cada uno no se comparte. **Redis** es una base de datos en memoria, rapidísima, que todos pueden usar como caché común:

```js
import { createClient } from 'redis'

const redis = createClient({ url: process.env.REDIS_URL })
await redis.connect()

async function conCache(clave, segundos, cargar) {
  const guardado = await redis.get(clave)
  if (guardado) return JSON.parse(guardado)

  const valor = await cargar()
  await redis.set(clave, JSON.stringify(valor), { EX: segundos }) // EX: caduca en esos segundos
  return valor
}

app.get('/api/productos/destacados', async (req, res) => {
  res.json(await conCache('destacados', 120, () => repositorio.listarDestacados()))
})
```

Redis también se usa para sesiones, límites de peticiones (*rate limiting*) y colas de tareas. Puedes probarlo en local con Docker (`docker run -p 6379:6379 redis`) o con servicios gestionados con plan gratuito.

## 6. Comprimir las respuestas

Un JSON de 500 KB comprimido con gzip o Brotli puede quedar en 50 KB: diez veces menos que transferir. Para respuestas grandes, la diferencia en móviles con mala conexión es enorme.

```bash
npm install compression
```

```js
import compression from 'compression'

app.use(compression()) // comprime las respuestas de más de 1 KB si el navegador lo acepta
```

Comprimir **cuesta CPU**. Si tu API está detrás de un proxy (Nginx), una CDN o una plataforma que ya comprime (muchas lo hacen), mejor que lo haga ella y no tu proceso de Node.

## 7. Reutilizar conexiones

Abrir una conexión nueva (TCP y, encima, el saludo de HTTPS) cuesta bastante tiempo. Para no repetirlo en cada petición:

- **Crea los clientes una vez**, al arrancar: el de la base de datos, el de Redis, el SDK de otro servicio. Nunca dentro de la ruta (lo viste en el post de Turso con Express y en el de Lambda).
- El `fetch` de Node ya **reutiliza conexiones** (*keep-alive*) por defecto. Muchas librerías también; revísalo en las que hagan muchas peticiones al mismo servicio.

## 8. Enviar menos datos

- **Pagina** las listas: nadie necesita 10.000 productos de golpe.
- **Elige las columnas**: `SELECT id, nombre, precio` en lugar de `SELECT *` si la tabla tiene una descripción enorme que la lista no muestra.
- **No devuelvas campos que el frontend no usa.**
- Para exportaciones muy grandes, usa **streams** (tiene su propio post en este módulo).

## El orden para optimizar una ruta lenta

1. **Mide** dónde se va el tiempo (el post de medir el rendimiento).
2. ¿Esperas cosas **una detrás de otra**? → `Promise.all`.
3. ¿Muchas consultas pequeñas? → Arregla el **N+1** y revisa los **índices**.
4. ¿Datos que cambian poco? → **Caché** (en memoria, HTTP o Redis).
5. ¿Respuestas grandes? → **Pagina**, elige columnas y **comprime**.
6. ¿Cálculo pesado? → **Worker threads**.

## Tu turno

1. Simula tres consultas con `setTimeout` (100, 200 y 300 ms) y mide la ruta en secuencial y con `Promise.all`.
2. Implementa la caché en memoria y lanza 100 peticiones simultáneas con la caché vacía. Cuenta cuántas veces se llama a `cargar` con y sin "guardar la promesa".
3. Añade `Cache-Control` a una ruta y comprueba en la pestaña Network que la segunda petición sale "(disk cache)" o "(memory cache)".
4. Mide con autocannon una ruta que devuelva un JSON grande, con y sin `compression()`, y compara los bytes transferidos.

## Errores comunes

- **`await` en secuencia** de cosas independientes.
- **Consultas dentro de un bucle** (N+1).
- **Cachés sin caducidad ni límite de tamaño**: datos viejos para siempre o una fuga de memoria.
- **`Cache-Control: public` en datos de un usuario**: una CDN podría mostrar el perfil de un usuario a otro.
- **Olvidar invalidar la caché** cuando el dato cambia.
- **Crear el cliente de la base de datos en cada petición.**

## Para profundizar

- [Caché HTTP en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Caching)
- [Buenas prácticas de rendimiento en Express (documentación oficial, en inglés)](https://expressjs.com/en/advanced/best-practice-performance.html)

En resumen: en una API, el tiempo suele irse **esperando**. Lanza en **paralelo** con `Promise.all` lo que no depende entre sí, elimina las **consultas N+1** con `JOIN` e **índices**, guarda en **caché** lo que cambia poco (en memoria con caducidad, en el navegador con **`Cache-Control`** o compartida en **Redis**), **comprime** las respuestas grandes, **reutiliza conexiones** y **envía menos datos**. Y mide antes y después de cada cambio.
