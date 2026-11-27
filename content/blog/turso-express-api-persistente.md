---
title: 'Turso + Express: una API que guarda los datos de verdad'
description: 'Conecta tu API de Express a Turso con un repositorio, migraciones sencillas para crear y cambiar tablas, convertir filas de SQLite a JSON, transacciones, paginación y relaciones entre usuarios y tareas.'
date: 2026-11-27
series: backend
tags: [Turso, Express, SQL, Backend, Avanzado]
draft: true
---

Ya tienes las piezas: una API REST con Express, validación con Zod y una base de datos en Turso. Hoy las juntas en una API que **guarda los datos de verdad**: reinicias el servidor y las tareas siguen ahí.

Y lo haremos como en un proyecto profesional: con un **repositorio** que aísla el SQL, **migraciones** para gestionar las tablas y **transacciones** para no dejar datos a medias.

## El punto de partida

Partimos de la estructura del post de middlewares (`app.js`, `server.js`, `rutas/`, `esquemas/`, `middlewares/`) y de un `.env` con `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.

```bash
npm install express zod @libsql/client
```

## Paso 1: un solo cliente para toda la app

```js
// src/db.js
import { createClient } from '@libsql/client'

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
})
```

Se crea **una vez** y se importa donde haga falta. Si no hay URL, usa un archivo local: perfecto para desarrollar.

## Paso 2: migraciones

Tu base de datos va a cambiar con el tiempo: hoy creas la tabla `tareas`, el mes que viene añades una columna `prioridad`. Si cada cambio lo haces a mano en la consola de Turso, en algún momento tu base de datos local y la de producción no coincidirán.

Una **migración** es un cambio en la estructura de la base de datos, escrito en un archivo y con un número de orden. Se ejecutan **una vez cada una**, en orden, y la base de datos recuerda cuáles ya se aplicaron.

```bash
migraciones/
├── 001_crear_usuarios.sql
├── 002_crear_tareas.sql
└── 003_tareas_prioridad.sql
```

```sql
-- migraciones/001_crear_usuarios.sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
```

```sql
-- migraciones/002_crear_tareas.sql
CREATE TABLE tareas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  texto TEXT NOT NULL,
  hecha INTEGER NOT NULL DEFAULT 0,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tareas_usuario ON tareas(usuario_id);
```

```sql
-- migraciones/003_tareas_prioridad.sql
ALTER TABLE tareas ADD COLUMN prioridad TEXT NOT NULL DEFAULT 'media';
```

- **`ON DELETE CASCADE`**: si se borra un usuario, se borran sus tareas.
- **`CREATE INDEX`** crea un **índice**: como el índice de un libro, hace que buscar las tareas de un usuario sea rápido aunque haya millones.

El script que las ejecuta:

```js
// scripts/migrar.js
import { readdir, readFile } from 'node:fs/promises'
import { db } from '../src/db.js'

await db.execute(`
  CREATE TABLE IF NOT EXISTS _migraciones (
    nombre TEXT PRIMARY KEY,
    aplicada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`)

const { rows } = await db.execute('SELECT nombre FROM _migraciones')
const aplicadas = new Set(rows.map((fila) => fila.nombre))

const archivos = (await readdir('migraciones')).filter((a) => a.endsWith('.sql')).sort()

for (const archivo of archivos) {
  if (aplicadas.has(archivo)) continue

  const sql = await readFile(`migraciones/${archivo}`, 'utf8')
  await db.executeMultiple(sql)
  await db.execute({ sql: 'INSERT INTO _migraciones (nombre) VALUES (?)', args: [archivo] })
  console.log(`✅ ${archivo}`)
}

console.log('Base de datos al día.')
```

```json
"scripts": {
  "dev": "node --watch --env-file=.env src/server.js",
  "migrar": "node --env-file=.env scripts/migrar.js"
}
```

```bash
npm run migrar
```

La tabla `_migraciones` guarda qué archivos ya se ejecutaron. Ejecútalo cuantas veces quieras: solo aplica los nuevos. `executeMultiple` ejecuta un archivo con varias sentencias separadas por `;`.

> **La regla de las migraciones: nunca edites una que ya se aplicó.** Si necesitas cambiar algo, crea una nueva (`004_...`). Y en proyectos grandes se usan herramientas como **Drizzle** o **Prisma**, que generan las migraciones por ti a partir de tu código; por debajo hacen esto mismo.

## Paso 3: el repositorio

El **repositorio** es el único archivo que sabe SQL. Las rutas le piden cosas ("dame las tareas del usuario 1") sin saber cómo se guardan. Es el mismo patrón del post de TDD con Express, ahora con Turso.

Primero, un detalle: SQLite devuelve `hecha` como `0` o `1` y los ids pueden venir como números grandes. Una función convierte cada fila en el objeto que espera el frontend:

```js
// src/repositorios/tareas.js
import { db } from '../db.js'

function aTarea(fila) {
  return {
    id: Number(fila.id),
    texto: fila.texto,
    hecha: fila.hecha === 1,
    prioridad: fila.prioridad,
    usuarioId: Number(fila.usuario_id),
    creadaEn: fila.creada_en
  }
}

export function crearRepositorioTareas() {
  return {
    async listar({ usuarioId, hecha, pagina = 1, porPagina = 20 }) {
      const condiciones = ['usuario_id = ?']
      const args = [usuarioId]

      if (hecha !== undefined) {
        condiciones.push('hecha = ?')
        args.push(hecha ? 1 : 0)
      }

      const { rows } = await db.execute({
        sql: `SELECT * FROM tareas
              WHERE ${condiciones.join(' AND ')}
              ORDER BY creada_en DESC, id DESC
              LIMIT ? OFFSET ?`,
        args: [...args, porPagina, (pagina - 1) * porPagina]
      })
      return rows.map(aTarea)
    },

    async buscar(id) {
      const { rows } = await db.execute({ sql: 'SELECT * FROM tareas WHERE id = ?', args: [id] })
      return rows[0] ? aTarea(rows[0]) : null
    },

    async crear({ texto, prioridad, usuarioId }) {
      const { rows } = await db.execute({
        sql: 'INSERT INTO tareas (texto, prioridad, usuario_id) VALUES (?, ?, ?) RETURNING *',
        args: [texto, prioridad, usuarioId]
      })
      return aTarea(rows[0])
    },

    async actualizar(id, cambios) {
      const columnas = { texto: 'texto', hecha: 'hecha', prioridad: 'prioridad' }
      const sets = []
      const args = []

      for (const [campo, valor] of Object.entries(cambios)) {
        if (!(campo in columnas)) continue
        sets.push(`${columnas[campo]} = ?`)
        args.push(typeof valor === 'boolean' ? Number(valor) : valor)
      }
      if (sets.length === 0) return this.buscar(id)

      const { rows } = await db.execute({
        sql: `UPDATE tareas SET ${sets.join(', ')} WHERE id = ? RETURNING *`,
        args: [...args, id]
      })
      return rows[0] ? aTarea(rows[0]) : null
    },

    async borrar(id) {
      const { rowsAffected } = await db.execute({ sql: 'DELETE FROM tareas WHERE id = ?', args: [id] })
      return rowsAffected > 0
    }
  }
}
```

Detalles importantes:

- **`RETURNING *`** hace que `INSERT` y `UPDATE` devuelvan la fila resultante. Te ahorras una segunda consulta.
- En `listar` y `actualizar` construimos el SQL por partes, **pero los valores siempre van en `args`**. Lo único que se mete en el texto son nombres de columnas **de una lista fija** (`columnas`), nunca algo que escriba el usuario. Así no hay riesgo de inyección SQL.
- **Paginación** con `LIMIT` y `OFFSET`: la página 3 de 20 en 20 salta las primeras 40 filas.

## Paso 4: las rutas

Las rutas casi no cambian respecto al post de middlewares; ahora usan el repositorio:

```js
// src/rutas/tareas.js
import { Router } from 'express'
import * as z from 'zod'
import { validar } from '../middlewares/validar.js'
import { ErrorHttp } from '../middlewares/errores.js'
import { CrearTareaSchema, ActualizarTareaSchema } from '../esquemas/tarea.js'

const FiltrosSchema = z.object({
  hecha: z.stringbool().optional(),
  pagina: z.coerce.number().int().min(1).default(1)
})

export function crearRutasTareas({ repositorio }) {
  const router = Router()

  router.get('/', async (req, res) => {
    const filtros = FiltrosSchema.parse(req.query)
    const usuarioId = 1 // hasta que haya autenticación, todas son del usuario 1
    res.json(await repositorio.listar({ usuarioId, ...filtros }))
  })

  router.post('/', validar(CrearTareaSchema), async (req, res) => {
    const tarea = await repositorio.crear({ ...req.body, usuarioId: 1 })
    res.status(201).json(tarea)
  })

  router.patch('/:id', validar(ActualizarTareaSchema), async (req, res) => {
    const tarea = await repositorio.actualizar(Number(req.params.id), req.body)
    if (!tarea) throw new ErrorHttp(404, 'Tarea no encontrada')
    res.json(tarea)
  })

  router.delete('/:id', async (req, res) => {
    const borrada = await repositorio.borrar(Number(req.params.id))
    if (!borrada) throw new ErrorHttp(404, 'Tarea no encontrada')
    res.status(204).end()
  })

  return router
}
```

```js
// src/app.js (lo relevante)
import { crearRutasTareas } from './rutas/tareas.js'

export function crearApp({ repositorio }) {
  // ...middlewares
  app.use('/api/tareas', crearRutasTareas({ repositorio }))
  // ...noEncontrado y manejarErrores
}
```

```js
// src/server.js
import { crearApp } from './app.js'
import { crearRepositorioTareas } from './repositorios/tareas.js'

const app = crearApp({ repositorio: crearRepositorioTareas() })
app.listen(process.env.PORT ?? 3000, () => console.log('API lista'))
```

Si `FiltrosSchema.parse` falla (por ejemplo, `?pagina=abc`), lanza un error. Puedes hacer que tu `manejarErrores` convierta los `ZodError` en un 400.

Antes de probarla, crea el usuario 1 en la consola de Turso o en un script: `INSERT INTO usuarios (nombre, email) VALUES ('Ana', 'ana@correo.com')`. Si no, el `REFERENCES usuarios(id)` impedirá crear tareas.

> En SQLite "puro", las claves foráneas solo se comprueban si activas `PRAGMA foreign_keys = ON`. `@libsql/client` las activa por defecto, así que con esta librería la protección funciona tanto con Turso como con un archivo local.

## Transacciones: todo o nada

Algunas operaciones son varios pasos que **deben** ir juntos. Ejemplo: borrar un usuario y guardar un registro de auditoría. Si lo primero funciona y lo segundo falla, te queda un borrado sin registrar.

Una **transacción** agrupa varios pasos: si alguno falla, **se deshacen todos**.

```js
export async function borrarUsuarioConAuditoria(usuarioId, motivo) {
  const transaccion = await db.transaction('write')
  try {
    await transaccion.execute({ sql: 'DELETE FROM usuarios WHERE id = ?', args: [usuarioId] })
    await transaccion.execute({
      sql: 'INSERT INTO auditoria (accion, detalle) VALUES (?, ?)',
      args: ['borrar_usuario', `${usuarioId}: ${motivo}`]
    })
    await transaccion.commit()   // confirma los cambios
  } catch (error) {
    await transaccion.rollback() // deshace todo
    throw error
  } finally {
    transaccion.close()
  }
}
```

Si los pasos no dependen de resultados anteriores, `db.batch([...], 'write')` (del post anterior) es más sencillo y también es una transacción.

## ¿Y los tests?

Gracias al repositorio, tienes dos niveles:

- **Tests de la API**, rápidos, con un repositorio **en memoria** (como en el post de TDD con Express).
- **Tests del repositorio**, contra una base de datos local de pruebas: crea un cliente con `file::memory:` (SQLite en memoria, se borra al terminar), ejecuta las migraciones y prueba cada método.

## Desplegar

Cuando subas tu API a un servicio como Render, Railway o Fly.io (o a un contenedor de Docker, en la serie de DevOps), configura `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` como **variables de entorno** en su panel y ejecuta `npm run migrar` antes de arrancar. El código es el mismo.

## Tu turno

1. Añade `GET /api/tareas/:id` y el filtro `?q=texto` con `LIKE`, usando parámetros.
2. Escribe la migración `004_crear_etiquetas.sql` con una tabla `etiquetas` y otra `tareas_etiquetas` (una tarea puede tener varias etiquetas y una etiqueta varias tareas: es una relación **muchos a muchos**).
3. Añade a `listar` el total de resultados (`SELECT COUNT(*)`) y devuelve `{ datos, total, pagina }` para que el frontend pueda pintar la paginación.
4. Haz que `manejarErrores` responda 409 (*Conflict*) cuando SQLite lance un error de `UNIQUE constraint failed`.

## Errores comunes

- **Meter valores del usuario en el texto del SQL.** Siempre en `args`; en el texto, solo nombres de columnas de una lista fija.
- **Editar una migración ya aplicada.** Crea una nueva.
- **Devolver las filas tal cual**: `hecha: 1` en vez de `true`, `usuario_id` en vez de `usuarioId`. Convierte en el repositorio.
- **Crear un cliente nuevo en cada petición.** Crea uno al arrancar y reutilízalo.
- **`FOREIGN KEY constraint failed`**: intentas crear una tarea de un usuario que no existe.
- **Paginar sin `ORDER BY`.** Sin orden, SQL no garantiza que las páginas salgan siempre igual.

## Para profundizar

- [Cliente de TypeScript de Turso: execute, batch y transacciones (en inglés)](https://docs.turso.tech/sdk/ts/reference)
- [`RETURNING` en SQLite (en inglés)](https://www.sqlite.org/lang_returning.html)

En resumen: crea **un cliente** de Turso para toda la app, gestiona las tablas con **migraciones** numeradas que se aplican una sola vez, y encierra todo el SQL en un **repositorio** que convierte las filas en objetos limpios. Usa **`RETURNING`** para ahorrar consultas, **`LIMIT`/`OFFSET`** para paginar y **transacciones** para operaciones que deben ir juntas. Las rutas no saben de SQL, y tus tests pueden usar un repositorio en memoria.
