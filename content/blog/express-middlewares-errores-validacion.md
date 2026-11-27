---
title: 'Express avanzado: middlewares, manejo de errores y validación con Zod'
description: 'Qué es un middleware y cómo funciona next(), escribir un logger, activar CORS, un middleware de validación reutilizable con Zod, el manejador de errores central, el 404 y una estructura de proyecto en capas.'
date: 2026-11-27
series: backend
tags: [Express, Zod, Middlewares, Backend, Avanzado]
draft: true
---

Tu API CRUD funciona, pero tiene tres problemas que verás en cuanto crezca:

1. **Validación repetida**: cada ruta tiene su montón de `if (typeof ... )`.
2. **Errores sin control**: si algo lanza un error, el cliente recibe un HTML feo con detalles internos.
3. **Código repetido** en todas las rutas: registrar las peticiones, comprobar permisos...

La solución a los tres es la pieza central de Express: los **middlewares**.

## ¿Qué es un middleware?

Un middleware es una función que se ejecuta **entre** que llega la petición y que se envía la respuesta. Recibe tres parámetros: `req`, `res` y **`next`**.

```js
function miMiddleware(req, res, next) {
  // hacer algo con la petición...
  next() // ...y pasar al siguiente
}
```

Imagina una **cadena de montaje**: la petición pasa por cada middleware en orden. Cada uno puede:

- **Modificar** `req` o `res` y llamar a `next()` para seguir.
- **Responder** directamente (`res.status(401).json(...)`) y cortar la cadena.
- **Pasar un error** con `next(error)` para saltar al manejador de errores.

¡Ya has usado middlewares! `express.json()` y `express.static()` lo son. Y tus rutas también: son el último eslabón.

## Tu primer middleware: un logger

```js
function logger(req, res, next) {
  const inicio = Date.now()

  res.on('finish', () => {
    const duracion = Date.now() - inicio
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duracion} ms)`)
  })

  next()
}

app.use(logger)
```

```bash
GET /api/tareas → 200 (3 ms)
POST /api/tareas → 201 (5 ms)
GET /api/tareas/99 → 404 (1 ms)
```

`app.use(middleware)` lo aplica a **todas** las peticiones. `res.on('finish')` espera a que la respuesta termine para saber el código de estado.

## El orden lo es todo

Los middlewares se ejecutan **en el orden en que los registras**:

```js
app.use(logger)            // 1. registra todo
app.use(express.json())    // 2. lee el body
app.use('/api/tareas', tareasRouter) // 3. las rutas
app.use(noEncontrado)      // 4. si ninguna ruta respondió: 404
app.use(manejarErrores)    // 5. si alguien llamó a next(error)
```

Si pusieras `express.json()` después de las rutas, `req.body` llegaría vacío.

## Middleware solo para algunas rutas

Puedes pasar middlewares **a una ruta concreta**, antes del manejador:

```js
function soloAdmin(req, res, next) {
  if (req.headers['x-rol'] !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso' })
  }
  next()
}

app.delete('/api/tareas/:id', soloAdmin, (req, res) => {
  // solo llega aquí si soloAdmin llamó a next()
})
```

(Esto es solo un ejemplo para entender el flujo: una cabecera la puede falsificar cualquiera. La autenticación real usa sesiones o tokens firmados, como JWT.)

## CORS: dejar que tu frontend llame a tu API

Si tu frontend está en `http://localhost:5173` (Vite) y tu API en `http://localhost:3000`, el navegador bloqueará las peticiones por **CORS** (lo viste en el post del error de CORS). Se soluciona en el servidor, con un middleware:

```bash
npm install cors
```

```js
import cors from 'cors'

app.use(cors({ origin: ['http://localhost:5173', 'https://mi-web.com'] }))
```

Indica **qué orígenes** pueden llamar a tu API. Evita `cors()` sin opciones en producción: permitiría a **cualquier** web usar tu API desde el navegador.

## Validación con Zod: un middleware reutilizable

Aquí está el gran ahorro. En lugar de validar a mano en cada ruta, escribimos **un** middleware que recibe un esquema de Zod (lo viste en la serie de TypeScript):

```bash
npm install zod
```

```js
// middlewares/validar.js
import * as z from 'zod'

export function validar(esquema) {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req.body)

    if (!resultado.success) {
      return res.status(400).json({
        error: 'Datos no válidos',
        detalles: z.flattenError(resultado.error).fieldErrors
      })
    }

    req.body = resultado.data // los datos ya limpios (trim, valores por defecto...)
    next()
  }
}
```

`validar(esquema)` es una función que **devuelve un middleware**. Así se puede configurar con un esquema distinto en cada ruta:

```js
// esquemas/tarea.js
import * as z from 'zod'

const TareaSchema = z.object({
  texto: z.string().trim().min(1, { error: 'El texto es obligatorio' }).max(200),
  prioridad: z.enum(['baja', 'media', 'alta']),
  hecha: z.boolean()
})

// Al crear: sin "hecha" (empieza en false) y con prioridad "media" si no la envían
export const CrearTareaSchema = TareaSchema.omit({ hecha: true }).extend({
  prioridad: TareaSchema.shape.prioridad.default('media')
})

// Al actualizar: cualquier campo, todos opcionales
export const ActualizarTareaSchema = TareaSchema.partial()
```

¿Por qué el valor por defecto solo va en `CrearTareaSchema`? Porque si estuviera en el esquema de actualizar, un `PATCH` que solo envía `{ "hecha": true }` **devolvería la prioridad a "media"** sin que nadie lo pidiera.

```js
// rutas/tareas.js
import { validar } from '../middlewares/validar.js'
import { CrearTareaSchema, ActualizarTareaSchema } from '../esquemas/tarea.js'

tareasRouter.post('/', validar(CrearTareaSchema), (req, res) => {
  const nueva = { id: siguienteId++, hecha: false, ...req.body }
  tareas.push(nueva)
  res.status(201).json(nueva)
})

tareasRouter.patch('/:id', validar(ActualizarTareaSchema), (req, res) => {
  // req.body ya está validado: solo contiene campos permitidos y del tipo correcto
})
```

Compara con el `PATCH` del post anterior: **toda la validación desaparece de la ruta**. Y si alguien envía datos inválidos, recibe una respuesta clara:

```json
{
  "error": "Datos no válidos",
  "detalles": { "texto": ["El texto es obligatorio"] }
}
```

Bonus: si tu frontend usa los mismos esquemas, validas **igual en los dos lados**.

## Manejo de errores centralizado

¿Qué pasa si una ruta lanza un error (la base de datos falla, un bug)? Por defecto, Express responde un 500 con un HTML que, en desarrollo, incluye el *stack trace*: detalles internos de tu código que no deberían ver los usuarios.

La solución: **un manejador de errores**, un middleware especial con **cuatro** parámetros. El primero es el error:

```js
// middlewares/errores.js
export class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje)
    this.status = status
  }
}

export function noEncontrado(req, res) {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` })
}

export function manejarErrores(error, req, res, next) {
  if (error instanceof ErrorHttp) {
    return res.status(error.status).json({ error: error.message })
  }

  console.error(error) // el detalle, solo en los logs del servidor
  res.status(500).json({ error: 'Error interno del servidor' })
}
```

- **`ErrorHttp`** es un error propio con código de estado. Lánzalo desde cualquier sitio: `throw new ErrorHttp(404, 'Tarea no encontrada')`.
- **Cualquier otro error** es inesperado: se registra en el servidor y el cliente solo recibe un mensaje genérico.
- Express reconoce el manejador de errores **porque tiene cuatro parámetros**. Aunque no uses `next`, tiene que estar.

Con esto, las rutas quedan limpias:

```js
tareasRouter.get('/:id', async (req, res) => {
  const tarea = await repositorio.buscar(Number(req.params.id))
  if (!tarea) throw new ErrorHttp(404, 'Tarea no encontrada')
  res.json(tarea)
})
```

> **Express 5** pasa automáticamente al manejador de errores cualquier error lanzado en una función `async` (o una promesa rechazada). En Express 4 tenías que envolver cada ruta en un `try/catch` y llamar a `next(error)`. Es una de las mejoras más importantes de la versión 5.

## La estructura de un proyecto real

Con todo esto, un proyecto de Express suele organizarse así:

```bash
mi-api/
├── src/
│   ├── app.js            # crea la app y registra middlewares y routers
│   ├── server.js         # solo hace app.listen
│   ├── env.js            # valida las variables de entorno con Zod
│   ├── rutas/
│   │   └── tareas.js     # el Router: qué URL llama a qué
│   ├── esquemas/
│   │   └── tarea.js      # esquemas de Zod
│   ├── repositorios/
│   │   └── tareas.js     # habla con la base de datos
│   └── middlewares/
│       ├── validar.js
│       └── errores.js
└── package.json
```

```js
// src/app.js
import express from 'express'
import cors from 'cors'
import { tareasRouter } from './rutas/tareas.js'
import { noEncontrado, manejarErrores } from './middlewares/errores.js'

export function crearApp() {
  const app = express()

  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json())

  app.get('/api/salud', (req, res) => res.json({ ok: true }))
  app.use('/api/tareas', tareasRouter)

  app.use(noEncontrado)
  app.use(manejarErrores)

  return app
}
```

Cada archivo tiene **una sola responsabilidad**: las rutas no saben de SQL, los repositorios no saben de HTTP. Separar `app.js` de `server.js` además te permite probar la app con Supertest (está en el post de TDD con Express).

La ruta `/api/salud` (*health check*) es una costumbre útil: los servicios de despliegue la llaman para saber si tu API está viva.

## Tu turno

1. Añade un middleware que mida el tiempo y añada la cabecera `X-Tiempo-Respuesta` a cada respuesta.
2. Crea `validarParams(esquema)` para validar `req.params` y úsalo para que `/api/tareas/abc` responda 400 en vez de 404. (Pista: `z.coerce.number().int().positive()`.)
3. Haz que `manejarErrores` incluya el `stack` del error en la respuesta **solo** cuando `process.env.NODE_ENV !== 'production'`.
4. Escribe un middleware de *rate limiting* sencillo: máximo 100 peticiones por minuto por IP (`req.ip`), guardando la cuenta en un `Map`.

## Errores comunes

- **Olvidar llamar a `next()`.** La petición se queda colgada hasta que el navegador se cansa.
- **Llamar a `next()` después de responder.** Error: `Cannot set headers after they are sent`.
- **Registrar el manejador de errores antes de las rutas**, o con tres parámetros: Express no lo reconoce como manejador de errores.
- **Enviar el `stack` del error al cliente en producción.** Da pistas a un atacante.
- **`cors()` abierto a todos** en una API con datos privados.

## Para profundizar

- [Usar middlewares (documentación oficial, en español)](https://expressjs.com/es/guide/using-middleware.html)
- [Manejo de errores en Express (documentación oficial, en inglés)](https://expressjs.com/en/guide/error-handling.html)

En resumen: un **middleware** es una función `(req, res, next)` que se ejecuta en cadena, **en el orden en que la registras**. Úsalos para tareas comunes (logs, CORS), para **validar con un esquema de Zod** reutilizable y para un **manejador de errores central** con cuatro parámetros, que en Express 5 captura también los errores `async`. Organiza el proyecto en capas: rutas, esquemas, repositorios y middlewares.
