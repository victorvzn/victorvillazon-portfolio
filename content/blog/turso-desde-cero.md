---
title: 'Turso desde cero: SQLite en la nube para tus proyectos'
description: 'Qué es Turso y por qué encaja con proyectos personales, cómo crear una base de datos desde la web o la CLI, conectarte desde Node.js con @libsql/client, guardar el token en .env y escribir consultas seguras con parámetros.'
date: 2026-11-27
series: backend
tags: [Turso, SQLite, Bases de datos, Node.js]
draft: true
---

En el post anterior aprendiste SQL con un archivo SQLite en tu ordenador. Pero cuando publiques tu API en internet, ese archivo se queda en tu máquina. Necesitas una base de datos **en la nube**, accesible desde tu servidor esté donde esté.

**Turso** es exactamente eso: **SQLite en la nube**. Escribes el mismo SQL que ya sabes y te conectas con la misma librería que usaste ayer. Solo cambia la URL.

## ¿Por qué Turso?

- **Es SQLite**: todo lo que aprendiste sirve tal cual.
- **Plan gratuito** generoso, de sobra para proyectos personales y portfolios (revisa los límites actuales en su web).
- **Sin servidor que mantener**: creas la base de datos y te conectas, sin instalar nada.
- **La misma librería en local y en la nube**: `@libsql/client` habla con un archivo local (`file:...`) o con Turso (`libsql://...`). Desarrollas en local y despliegas sin cambiar el código.

## Paso 1: crear la cuenta y la base de datos

### Opción A: desde la web (la más fácil)

1. Entra en [turso.tech](https://turso.tech) y regístrate (puedes usar tu cuenta de GitHub).
2. En el panel, crea una base de datos. Ponle un nombre, por ejemplo `tareas-app`, y elige la región más cercana a donde vaya a estar tu servidor.
3. En la página de la base de datos encontrarás su **URL** (empieza por `libsql://`) y un botón para **crear un token**.

### Opción B: desde la terminal, con la CLI

En macOS (con Homebrew) o Linux:

```bash
brew install tursodatabase/tap/turso    # macOS
curl -sSfL https://get.tur.so/install.sh | bash   # Linux
```

En **Windows**, la CLI se usa dentro de **WSL** (el Linux integrado de Windows); si no lo tienes, usa la opción A.

```bash
turso auth login
turso db create tareas-app
turso db show tareas-app --url      # la URL de conexión
turso db tokens create tareas-app   # el token de acceso
turso db shell tareas-app           # una consola SQL interactiva
```

`turso db shell` abre una consola donde puedes escribir SQL directamente, como con tu `sql.js` del post anterior. Escribe `.quit` para salir.

## Paso 2: el proyecto y las credenciales

```bash
mkdir tareas-turso
cd tareas-turso
npm init -y
npm install @libsql/client
```

Añade `"type": "module"` al `package.json`. Ahora, las credenciales. La URL y el token son como la dirección y la llave de tu base de datos: **nunca** deben estar en el código ni subirse a GitHub. Se guardan en un archivo **`.env`**:

```bash
# .env
TURSO_DATABASE_URL=libsql://tareas-app-tuusuario.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...tu-token
```

Y lo primero de todo, añade `.env` al `.gitignore`:

```bash
# .gitignore
node_modules
.env
*.db
```

> Si alguna vez subes un token por error, **revócalo** enseguida desde el panel de Turso (o con `turso db tokens invalidate tareas-app`) y crea otro. Borrar el commit no basta: el historial de Git lo conserva.

Node.js lee el archivo `.env` con la opción `--env-file`, sin instalar nada:

```json
"scripts": {
  "dev": "node --watch --env-file=.env server.js",
  "db": "node --env-file=.env db.js"
}
```

## Paso 3: conectarte

Crea `db.js`:

```js
import { createClient } from '@libsql/client'

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

const resultado = await db.execute('SELECT sqlite_version() AS version')
console.log('Conectado. Versión de SQLite:', resultado.rows[0].version)
```

```bash
npm run db
```

Si ves la versión, estás conectado a tu base de datos en la nube.

> **Para desarrollar sin internet**, cambia la URL en tu `.env` por `TURSO_DATABASE_URL=file:local.db` y quita el token. El resto del código no cambia.

## Paso 4: crear la tabla e insertar

```js
import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    hecha INTEGER NOT NULL DEFAULT 0,
    creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`)

const insercion = await db.execute({
  sql: 'INSERT INTO tareas (texto) VALUES (?)',
  args: ['Aprender Turso']
})
console.log('Nueva tarea con id', insercion.lastInsertRowid)

const { rows } = await db.execute('SELECT * FROM tareas ORDER BY id DESC')
console.table(rows)
```

- **`CREATE TABLE IF NOT EXISTS`** no da error si la tabla ya existe, así puedes ejecutar el script varias veces.
- **`rows`** es un array de objetos: `rows[0].texto`.
- **`lastInsertRowid`** es el `id` de la fila que acabas de insertar. Viene como `BigInt` (`1n`); conviértelo con `Number()` si lo vas a enviar como JSON.
- **`rowsAffected`** dice cuántas filas cambió un `INSERT`, `UPDATE` o `DELETE`.

## Lo más importante del post: consultas con parámetros

Mira el `INSERT` de arriba: el texto no va **dentro** del SQL, sino en `args`, y en su lugar hay un `?`. Esto no es un detalle de estilo. Mira qué pasa si construyes el SQL juntando textos:

```js
// ❌ NUNCA hagas esto
const busqueda = req.query.q
await db.execute(`SELECT * FROM tareas WHERE texto = '${busqueda}'`)
```

Si un usuario busca `' OR '1'='1`, la consulta queda:

```sql
SELECT * FROM tareas WHERE texto = '' OR '1'='1'
```

Y `'1'='1'` es siempre verdadero: **devuelve todas las tareas**, también las de otros usuarios. Con un texto más malicioso podría hasta **borrar tablas**. Esto se llama **inyección SQL** y es una de las vulnerabilidades más famosas y peligrosas de la web.

La solución es **siempre** usar parámetros:

```js
// ✅ Con ? en orden
await db.execute({
  sql: 'SELECT * FROM tareas WHERE texto = ? AND hecha = ?',
  args: [busqueda, 0]
})

// ✅ O con nombres
await db.execute({
  sql: 'SELECT * FROM tareas WHERE texto = :texto',
  args: { texto: busqueda }
})
```

Con parámetros, la base de datos trata lo que envía el usuario **siempre como un dato**, nunca como parte del SQL. Da igual lo que escriba.

**Regla de oro: nunca metas un valor que viene de fuera dentro del texto de una consulta.** Ni de un formulario, ni de la URL, ni de una API.

## Varias consultas a la vez: `batch`

Si necesitas ejecutar varias sentencias, **`batch`** las envía juntas en un solo viaje a la base de datos, y además como una **transacción**: o se aplican todas, o ninguna.

```js
await db.batch(
  [
    { sql: 'INSERT INTO tareas (texto) VALUES (?)', args: ['Comprar pan'] },
    { sql: 'INSERT INTO tareas (texto) VALUES (?)', args: ['Llamar a mamá'] },
    { sql: 'UPDATE tareas SET hecha = 1 WHERE id = ?', args: [1] }
  ],
  'write'
)
```

Si la tercera falla, las dos primeras se deshacen. Lo verás con más detalle en el siguiente post.

## Tu turno

1. Crea tu base de datos en Turso y conéctate desde Node.
2. Escribe un script `semilla.js` que cree la tabla `tareas` e inserte 5 tareas con un `batch`.
3. Escribe un script `buscar.js` que reciba un texto por la terminal (`process.argv[2]`) y busque las tareas que lo contienen con `LIKE`, **usando parámetros**. Pista: `args: [`%${texto}%`]`.
4. Prueba la inyección: busca `' OR '1'='1` con tu versión con parámetros y comprueba que no devuelve nada raro.

## Errores comunes

- **Subir el `.env` a GitHub.** Añádelo al `.gitignore` antes del primer commit.
- **`URL_INVALID` o `undefined`.** Node no está leyendo el `.env`: falta `--env-file=.env` en el comando.
- **Concatenar valores en el SQL.** Usa siempre `?` y `args`.
- **Enviar `lastInsertRowid` como JSON directamente.** `JSON.stringify` no sabe convertir un `BigInt`; usa `Number()`.
- **Usar `true`/`false` en SQLite.** Se guardan como `1` y `0`; convierte al leer.

## Para profundizar

- [Documentación de Turso (en inglés)](https://docs.turso.tech)
- [Inyección SQL, explicada por OWASP (en inglés)](https://owasp.org/www-community/attacks/SQL_Injection)

En resumen: **Turso** es **SQLite en la nube**: creas la base de datos desde la web o la CLI y te conectas con **`@libsql/client`** usando una **URL y un token** guardados en **`.env`** (nunca en el código). Cambiando la URL a `file:local.db` desarrollas en local. Y la regla más importante: **usa siempre parámetros** (`?` y `args`) para evitar la **inyección SQL**.
