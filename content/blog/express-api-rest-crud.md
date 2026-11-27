---
title: 'Express: crea una API REST completa (CRUD)'
description: 'Qué es una API REST, cómo diseñar las rutas de un recurso, crear, leer, actualizar y borrar con GET, POST, PUT, PATCH y DELETE, leer el body con express.json, los códigos de estado correctos y organizar las rutas con Router.'
date: 2026-11-27
series: backend
tags: [Express, API REST, Backend, Node.js]
draft: true
---

En el post anterior tu API solo **leía** datos. Una app real también necesita **crear**, **modificar** y **borrar**: publicar un comentario, editar tu perfil, eliminar una tarea. Esas cuatro operaciones se conocen como **CRUD** (*Create, Read, Update, Delete*), y hoy construyes una API que las hace todas, siguiendo las convenciones **REST**.

## ¿Qué es una API REST?

**REST** es una forma de diseñar APIs que casi todo el mundo sigue. La idea: tu API expone **recursos** (tareas, usuarios, productos) en URLs, y el **método HTTP** dice qué quieres hacer con ellos.

| Método | Ruta | Acción | Respuesta típica |
| --- | --- | --- | --- |
| `GET` | `/api/tareas` | Listar todas | `200` con un array |
| `GET` | `/api/tareas/:id` | Ver una | `200` o `404` |
| `POST` | `/api/tareas` | Crear | `201` con la nueva |
| `PUT` | `/api/tareas/:id` | Reemplazarla entera | `200` o `404` |
| `PATCH` | `/api/tareas/:id` | Cambiar algunos campos | `200` o `404` |
| `DELETE` | `/api/tareas/:id` | Borrar | `204` o `404` |

Reglas de estilo:

- Los recursos van en **plural** y son **sustantivos**: `/api/tareas`, no `/api/obtenerTareas` ni `/api/crear-tarea`. El verbo ya lo pone el método.
- El **código de estado** importa tanto como el cuerpo: es lo primero que mira quien usa tu API.

## Preparar el proyecto

Parte del proyecto del post anterior (o crea uno nuevo con `npm install express` y `"type": "module"`). En `server.js`:

```js
import express from 'express'

const app = express()
app.use(express.json())

let tareas = [
  { id: 1, texto: 'Aprender Express', hecha: false },
  { id: 2, texto: 'Crear una API', hecha: false }
]
let siguienteId = 3

app.listen(3000, () => console.log('API en http://localhost:3000'))
```

**`app.use(express.json())`** es clave: lee el cuerpo de las peticiones que envían JSON y lo deja en **`req.body`**. Sin esta línea, `req.body` es `undefined`.

> Los datos están en una variable, así que **se pierden al reiniciar el servidor**. Está bien para aprender; en el módulo de bases de datos los guardarás en Turso.

## Leer: GET

```js
app.get('/api/tareas', (req, res) => {
  res.json(tareas)
})

app.get('/api/tareas/:id', (req, res) => {
  const tarea = tareas.find((t) => t.id === Number(req.params.id))
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' })
  res.json(tarea)
})
```

## Crear: POST

```js
app.post('/api/tareas', (req, res) => {
  const { texto } = req.body ?? {}

  if (typeof texto !== 'string' || texto.trim() === '') {
    return res.status(400).json({ error: 'El campo "texto" es obligatorio' })
  }

  const nueva = { id: siguienteId++, texto: texto.trim(), hecha: false }
  tareas.push(nueva)

  res.status(201).json(nueva)
})
```

- **Nunca te fíes del cliente.** Comprueba que `texto` existe y es un texto. Si no, **400 Bad Request**.
- **El servidor decide el `id`**, no el cliente.
- Responde **201 Created** con el recurso creado, para que el frontend tenga su `id`.

## Actualizar: PUT y PATCH

La diferencia:

- **`PUT`** reemplaza el recurso **entero**: envías todos los campos.
- **`PATCH`** cambia **solo los campos que envías**.

En la práctica, `PATCH` es el más usado (por ejemplo, para marcar una tarea como hecha):

```js
app.patch('/api/tareas/:id', (req, res) => {
  const tarea = tareas.find((t) => t.id === Number(req.params.id))
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' })

  const { texto, hecha } = req.body ?? {}

  if (texto !== undefined) {
    if (typeof texto !== 'string' || texto.trim() === '') {
      return res.status(400).json({ error: '"texto" no puede estar vacío' })
    }
    tarea.texto = texto.trim()
  }

  if (hecha !== undefined) {
    if (typeof hecha !== 'boolean') {
      return res.status(400).json({ error: '"hecha" debe ser true o false' })
    }
    tarea.hecha = hecha
  }

  res.json(tarea)
})
```

¿Ves cuánto código de validación? Y solo son dos campos. En el siguiente post lo reemplazarás por un esquema de **Zod** de tres líneas.

## Borrar: DELETE

```js
app.delete('/api/tareas/:id', (req, res) => {
  const id = Number(req.params.id)
  const existe = tareas.some((t) => t.id === id)
  if (!existe) return res.status(404).json({ error: 'Tarea no encontrada' })

  tareas = tareas.filter((t) => t.id !== id)
  res.status(204).end()
})
```

**204 No Content**: "hecho, no hay nada que devolver". Por eso se usa `.end()` en vez de `.json()`.

## Probar la API

El navegador solo hace peticiones `GET` desde la barra de direcciones. Para el resto tienes varias opciones:

**1. Con `curl` desde la terminal:**

```bash
curl http://localhost:3000/api/tareas

curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -d '{"texto": "Probar con curl"}'

curl -X PATCH http://localhost:3000/api/tareas/1 \
  -H "Content-Type: application/json" \
  -d '{"hecha": true}'

curl -X DELETE http://localhost:3000/api/tareas/2 -i
```

(En PowerShell de Windows, escribe cada comando en una sola línea, sin las `\`, y usa `curl.exe` en lugar de `curl`.)

**2. Con un archivo `.http`** y la extensión **REST Client** de VS Code: escribes las peticiones en un archivo y las ejecutas con un clic.

```http
### Listar
GET http://localhost:3000/api/tareas

### Crear
POST http://localhost:3000/api/tareas
Content-Type: application/json

{ "texto": "Probar con REST Client" }
```

**3. Con `fetch` desde el frontend** (lo que hiciste en el post de CRUD con fetch, ahora contra tu propia API):

```js
const respuesta = await fetch('/api/tareas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ texto: 'Desde el navegador' })
})
console.log(respuesta.status, await respuesta.json())
```

**4. Con tests automáticos**, usando Supertest. Está en el post de TDD con Express de la serie de Testing.

## Organizar las rutas con `Router`

Con varios recursos (tareas, usuarios, productos), `server.js` se vuelve enorme. **`express.Router()`** agrupa las rutas de un recurso en su propio archivo:

```js
// rutas/tareas.js
import { Router } from 'express'

export const tareasRouter = Router()

let tareas = []
let siguienteId = 1

tareasRouter.get('/', (req, res) => {
  res.json(tareas)
})

tareasRouter.post('/', (req, res) => {
  // ...
})

tareasRouter.get('/:id', (req, res) => {
  // ...
})
```

```js
// server.js
import express from 'express'
import { tareasRouter } from './rutas/tareas.js'

const app = express()
app.use(express.json())

app.use('/api/tareas', tareasRouter)

app.listen(3000)
```

`app.use('/api/tareas', tareasRouter)` "monta" el router en ese prefijo: el `'/'` del router es `/api/tareas` y el `'/:id'` es `/api/tareas/:id`.

## Tu turno

1. Añade `PUT /api/tareas/:id`, que exija `texto` y `hecha` y reemplace la tarea entera.
2. Añade `GET /api/tareas?hecha=true` para filtrar. Ojo: `req.query.hecha` es el texto `'true'`, no el booleano.
3. Crea un segundo recurso, `/api/notas`, en su propio `Router`.
4. Conecta la todo app del post de proyectos para que use tu API en vez de `localStorage`.

## Errores comunes

- **`req.body` es `undefined`.** Falta `app.use(express.json())` o el cliente no envía la cabecera `Content-Type: application/json`.
- **Responder 200 a todo.** Crear es 201, borrar es 204, no encontrado es 404 y datos inválidos es 400.
- **Verbos en las URLs** (`/api/borrarTarea/1`). Usa el método: `DELETE /api/tareas/1`.
- **Confiar en los datos del cliente** sin validarlos.
- **Dejar que el cliente envíe el `id`** al crear.

## Para profundizar

- [Métodos de petición HTTP en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Methods)
- [`express.Router` (documentación oficial, en inglés)](https://expressjs.com/en/5x/api.html#router)

En resumen: una **API REST** expone **recursos** en URLs en plural y usa el **método HTTP** para la acción: **GET** lee, **POST** crea, **PATCH/PUT** actualiza y **DELETE** borra. Activa **`express.json()`** para leer `req.body`, **valida siempre** lo que llega, responde con el **código de estado** correcto y organiza cada recurso en su propio **`Router`**.
