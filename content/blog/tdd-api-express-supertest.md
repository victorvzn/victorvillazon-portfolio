---
title: 'TDD avanzado: construye una API con Express, Vitest y Supertest'
description: 'Aplica TDD a un backend: separar app y servidor, probar endpoints con Supertest, códigos de estado y validación, aislar la base de datos con un repositorio en memoria y tests de integración rápidos.'
date: 2026-11-27
series: testing
tags: [TDD, Express, Supertest, Backend, Avanzado]
draft: true
---

Ya hiciste TDD con funciones y con un carrito. Ahora el siguiente nivel: una **API** de verdad. Probar un backend tiene sus propios retos: peticiones HTTP, códigos de estado, validación y, sobre todo, la **base de datos**. Hoy construyes una API de tareas con Express **empezando siempre por el test**.

> Si todavía no conoces Express, lee antes los posts de Express del módulo de Backend.

## Preparar el proyecto

```bash
npm init -y
npm install express
npm install --save-dev vitest supertest
```

En `package.json`, añade `"type": "module"` y los scripts:

```json
"scripts": {
  "dev": "node --watch src/server.js",
  "test": "vitest"
}
```

**Supertest** permite hacer peticiones HTTP a tu app de Express **sin encender el servidor** en un puerto: le pasas la app y hace la petición directamente. Rápido y sin conflictos de puertos.

## La clave: separar la app del servidor

Para poder probar la app, **no** debe llamar a `listen` en el mismo archivo. Separa la **creación** de la app del **arranque**:

```js
// src/app.js
import express from 'express'

export function crearApp() {
  const app = express()
  app.use(express.json())
  return app
}
```

```js
// src/server.js
import { crearApp } from './app.js'

crearApp().listen(3000, () => console.log('API en http://localhost:3000'))
```

Los tests importan `crearApp`; solo `server.js` ocupa un puerto.

## Ciclo 1 🔴 listar tareas devuelve un array vacío

```js
// src/app.test.js
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { crearApp } from './app.js'

describe('GET /api/tareas', () => {
  it('devuelve una lista vacía al principio', async () => {
    const app = crearApp()

    const respuesta = await request(app).get('/api/tareas')

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toEqual([])
  })
})
```

Falla con un 404: la ruta no existe.

🟢

```js
export function crearApp() {
  const app = express()
  app.use(express.json())

  app.get('/api/tareas', (req, res) => {
    res.json([])
  })

  return app
}
```

## El problema de la base de datos

El siguiente test será "crear una tarea". Pero ¿dónde se guarda? Si la app usa directamente una base de datos real (como Turso), cada test:

- Sería **lento** (peticiones de red).
- **Ensuciaría** los datos: las tareas de un test aparecerían en el siguiente.
- **Fallaría sin conexión.**

La solución es la **inyección de dependencias** que viste en el post de mocks, aplicada a la app entera. La app recibe un **repositorio**: un objeto que sabe guardar y leer tareas. En producción, uno que habla con la base de datos; en los tests, uno **en memoria**.

```js
// src/repositorioMemoria.js
export function crearRepositorioMemoria(tareasIniciales = []) {
  let tareas = structuredClone(tareasIniciales)
  let siguienteId = tareas.length + 1

  return {
    async listar() {
      return tareas
    },
    async crear(datos) {
      const tarea = { id: siguienteId++, hecha: false, ...datos }
      tareas.push(tarea)
      return tarea
    },
    async buscar(id) {
      return tareas.find((t) => t.id === id) ?? null
    },
    async actualizar(id, cambios) {
      const tarea = tareas.find((t) => t.id === id)
      if (!tarea) return null
      Object.assign(tarea, cambios)
      return tarea
    },
    async borrar(id) {
      const antes = tareas.length
      tareas = tareas.filter((t) => t.id !== id)
      return tareas.length < antes
    }
  }
}
```

Los métodos son `async` aunque no lo necesiten: así tienen **la misma forma** que el repositorio real, que sí tendrá que esperar a la base de datos.

> En TDD estricto, este repositorio también crecería test a test. Aquí lo mostramos completo para centrarnos en la API.

Ahora `crearApp` recibe el repositorio:

```js
export function crearApp({ repositorio }) {
  const app = express()
  app.use(express.json())

  app.get('/api/tareas', async (req, res) => {
    res.json(await repositorio.listar())
  })

  return app
}
```

Y en el test, una función de ayuda que crea una app limpia **en cada test**:

```js
import { crearRepositorioMemoria } from './repositorioMemoria.js'

function preparar(tareasIniciales) {
  const repositorio = crearRepositorioMemoria(tareasIniciales)
  return request(crearApp({ repositorio }))
}
```

## Ciclo 2 🔴 crear una tarea

```js
describe('POST /api/tareas', () => {
  it('crea una tarea y la devuelve con 201', async () => {
    const api = preparar()

    const respuesta = await api.post('/api/tareas').send({ texto: 'Aprender TDD' })

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toEqual({ id: 1, texto: 'Aprender TDD', hecha: false })
  })

  it('la tarea creada aparece en la lista', async () => {
    const api = preparar()

    await api.post('/api/tareas').send({ texto: 'Aprender TDD' })
    const lista = await api.get('/api/tareas')

    expect(lista.body).toHaveLength(1)
  })
})
```

🟢

```js
app.post('/api/tareas', async (req, res) => {
  const tarea = await repositorio.crear({ texto: req.body.texto })
  res.status(201).json(tarea)
})
```

**201 Created** es el código correcto al crear algo (lo viste en el post de HTTP).

## Ciclo 3 🔴 validar los datos

¿Qué pasa si el texto viene vacío o no viene? Una API debe responder **400 Bad Request** con un mensaje claro:

```js
it.each([
  { caso: 'sin texto', cuerpo: {} },
  { caso: 'texto vacío', cuerpo: { texto: '   ' } },
  { caso: 'texto que no es string', cuerpo: { texto: 42 } }
])('responde 400 $caso', async ({ cuerpo }) => {
  const api = preparar()

  const respuesta = await api.post('/api/tareas').send(cuerpo)

  expect(respuesta.status).toBe(400)
  expect(respuesta.body).toHaveProperty('error')
})
```

🟢

```js
app.post('/api/tareas', async (req, res) => {
  const { texto } = req.body ?? {}
  if (typeof texto !== 'string' || texto.trim() === '') {
    return res.status(400).json({ error: 'El texto es obligatorio' })
  }

  const tarea = await repositorio.crear({ texto: texto.trim() })
  res.status(201).json(tarea)
})
```

(En el post de validación de Express, este `if` se convierte en un esquema de Zod. Gracias a los tests, ese cambio será un refactor seguro.)

## Ciclo 4 🔴 marcar como hecha y el 404

```js
describe('PATCH /api/tareas/:id', () => {
  it('marca una tarea como hecha', async () => {
    const api = preparar([{ id: 1, texto: 'Estudiar', hecha: false }])

    const respuesta = await api.patch('/api/tareas/1').send({ hecha: true })

    expect(respuesta.status).toBe(200)
    expect(respuesta.body.hecha).toBe(true)
  })

  it('responde 404 si la tarea no existe', async () => {
    const api = preparar()

    const respuesta = await api.patch('/api/tareas/99').send({ hecha: true })

    expect(respuesta.status).toBe(404)
  })
})
```

Fíjate en `preparar([...])`: cada test **define su propio punto de partida**. No depende de que otro test haya creado la tarea antes.

🟢

```js
app.patch('/api/tareas/:id', async (req, res) => {
  const id = Number(req.params.id)
  const tarea = await repositorio.actualizar(id, { hecha: Boolean(req.body.hecha) })

  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' })
  res.json(tarea)
})
```

## Ciclo 5 🔴 borrar

```js
describe('DELETE /api/tareas/:id', () => {
  it('borra la tarea y responde 204', async () => {
    const api = preparar([{ id: 1, texto: 'Estudiar', hecha: false }])

    const respuesta = await api.delete('/api/tareas/1')
    const lista = await api.get('/api/tareas')

    expect(respuesta.status).toBe(204)
    expect(lista.body).toEqual([])
  })
})
```

🟢

```js
app.delete('/api/tareas/:id', async (req, res) => {
  const borrada = await repositorio.borrar(Number(req.params.id))
  if (!borrada) return res.status(404).json({ error: 'Tarea no encontrada' })
  res.status(204).end()
})
```

**204 No Content** significa "hecho, y no hay nada que devolver".

## 🔵 Refactor: el repositorio real

Ahora la pieza que hace que todo esto valga la pena. Escribes un repositorio que usa la base de datos de verdad (en el post de Turso con Express lo verás completo) **con los mismos métodos**:

```js
// src/server.js
import { crearApp } from './app.js'
import { crearRepositorioTurso } from './repositorioTurso.js'

const repositorio = crearRepositorioTurso()
crearApp({ repositorio }).listen(3000)
```

La app **no cambia ni una línea**. Y tus tests de la API siguen siendo rápidos y sin red, porque usan el repositorio en memoria.

¿Y quién prueba el repositorio real? Unos pocos **tests de integración** específicos, contra una base de datos de pruebas (por ejemplo, un SQLite local en un archivo temporal o en memoria). Así cada capa se prueba donde es más barato.

## Lo que has construido

- Una API con 4 endpoints, **toda probada**, y ningún test tarda más de unos milisegundos.
- Una arquitectura en capas que salió **sola** de querer probarla: la app no sabe qué base de datos usa.
- Una red de seguridad para el siguiente paso: validar con Zod, añadir autenticación, cambiar de base de datos...

## Tu turno

1. Con TDD, añade `GET /api/tareas/:id` con su 404.
2. Añade el filtro `GET /api/tareas?hecha=true`. Empieza por el test.
3. Haz que `PATCH` responda 400 si `hecha` no es un booleano. ¿Qué test escribirías primero?
4. Escribe un test que compruebe que, si el repositorio lanza un error, la API responde **500** sin mostrar detalles internos. (Pista: pásale un repositorio cuyo `listar` sea `vi.fn().mockRejectedValue(new Error('boom'))` y añade un middleware de errores.)

## Errores comunes

- **Llamar a `listen` en el mismo archivo que crea la app.** Los tests abren un puerto y chocan entre ellos.
- **Compartir datos entre tests.** Crea una app con un repositorio nuevo en cada test.
- **Probar contra la base de datos real en cada test.** Lento, frágil y ensucia los datos.
- **Comprobar solo el `body`** y olvidar el código de estado. Un 200 cuando debería ser 201 o 404 es un bug.
- **`req.params.id` es texto.** Conviértelo con `Number()` antes de compararlo con ids numéricos.

## Para profundizar

- [Supertest en GitHub (en inglés)](https://github.com/ladjs/supertest)
- [Códigos de estado HTTP en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Status)

En resumen: separa la **creación de la app** del **`listen`** para probarla con **Supertest** sin abrir puertos. Inyecta un **repositorio** y usa uno **en memoria** en los tests: rápidos, aislados y sin red. Con TDD, cada endpoint nace de un test que comprueba **el código de estado y la respuesta**, y la arquitectura en capas aparece sola.
