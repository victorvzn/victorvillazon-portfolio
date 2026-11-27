---
title: 'Node.js desde cero: JavaScript fuera del navegador'
description: 'Qué es Node.js, cómo instalarlo y ejecutar tu primer script, leer y escribir archivos y montar un servidor web que responde JSON, sin librerías.'
date: 2026-11-26
series: backend
tags: [Node.js, Backend, JavaScript, Fundamentos]
draft: true
---

Hasta ahora todo tu JavaScript se ejecutaba **en el navegador**: botones, formularios, `fetch` a una API. Pero ¿quién programa esa API que responde con JSON? Muchas veces, alguien con **JavaScript también**, gracias a **Node.js**.

Hoy vas a ejecutar JavaScript en tu ordenador, leer y escribir archivos y crear tu propio servidor web. Con el JavaScript que ya sabes.

## ¿Qué es Node.js?

**Node.js** es un programa que ejecuta JavaScript **fuera del navegador**. Toma el mismo motor que usa Chrome (se llama V8) y le añade cosas que el navegador no te deja hacer, como leer archivos del disco o recibir peticiones de internet.

| En el navegador tienes | En Node.js tienes |
| --- | --- |
| `document`, `window`, el DOM | ❌ No hay página, así que no hay DOM |
| `localStorage` | Archivos de verdad, con el módulo `fs` |
| `fetch` | `fetch` también ✅ |
| `console.log` en las DevTools | `console.log` en la **terminal** |

El lenguaje es el mismo: variables, funciones, arrays, objetos, `async`/`await`... Todo lo que aprendiste sirve.

¿Para qué se usa? Para crear **APIs y servidores** (el *backend*), herramientas de línea de comandos y, aunque no lo sepas, para todo el *tooling* del frontend: `npm`, Vite, Tailwind o Next.js funcionan con Node.

## Paso 1: instalarlo

1. Entra en [nodejs.org](https://nodejs.org) y descarga la versión **LTS** (*Long Term Support*: la estable, la recomendada).
2. Instálala con las opciones por defecto.
3. Abre una terminal (en VS Code: **Terminal → Nueva terminal**) y comprueba:

```bash
node --version
npm --version
```

Si ves dos números de versión, está listo. `npm` se instala junto con Node; es el gestor de paquetes, y tiene su propio post.

## Paso 2: tu primer script

Crea una carpeta `hola-node`, ábrela en VS Code y crea un archivo `app.js`:

```js
const nombre = 'Node'
const lenguajes = ['HTML', 'CSS', 'JavaScript']

console.log(`¡Hola desde ${nombre}!`)
console.log(`Ya sabes ${lenguajes.length} lenguajes:`, lenguajes.join(', '))
```

Ejecútalo desde la terminal, dentro de esa carpeta:

```bash
node app.js
```

El resultado aparece **en la terminal**. Ya estás ejecutando JavaScript sin navegador.

> **Truco:** `node --watch app.js` vuelve a ejecutar el archivo cada vez que guardas. Para salir, pulsa `Ctrl + C`.

## Paso 3: preparar el proyecto con `package.json`

Casi todos los proyectos de Node tienen un archivo `package.json` con su nombre, sus scripts y sus dependencias. Créalo con:

```bash
npm init -y
```

Ábrelo y añade la línea `"type": "module"`. Así podrás usar `import` y `export`, como en el navegador moderno:

```json
{
  "name": "hola-node",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js"
  }
}
```

En `scripts` guardas los comandos que usas a menudo. Con eso, `npm run dev` ejecutará `node --watch server.js`.

## Paso 4: leer y escribir archivos

Node trae **módulos incluidos** (no hay que instalar nada). Para trabajar con archivos se usa `node:fs`. Crea `tareas.js`:

```js
import { readFile, writeFile } from 'node:fs/promises'

const ARCHIVO = './tareas.json'

async function leerTareas() {
  try {
    const texto = await readFile(ARCHIVO, 'utf8')
    return JSON.parse(texto)
  } catch {
    return [] // si el archivo no existe todavía, empezamos con una lista vacía
  }
}

async function guardarTareas(tareas) {
  await writeFile(ARCHIVO, JSON.stringify(tareas, null, 2))
}

const tareas = await leerTareas()
tareas.push({ id: Date.now(), texto: 'Aprender Node.js', hecha: false })
await guardarTareas(tareas)

console.log(`Hay ${tareas.length} tareas guardadas`)
```

```bash
node tareas.js
node tareas.js
node tareas.js
```

Cada vez que lo ejecutas se añade una tarea, y aparece un archivo `tareas.json` en la carpeta. Es como `localStorage`, pero con un archivo real.

Fíjate en tres cosas:

- **`await` fuera de una función.** En los módulos (`"type": "module"`) puedes usar `await` directamente en el nivel superior.
- **`JSON.stringify(datos, null, 2)`** guarda el JSON con sangría, para que se pueda leer.
- **`node:fs/promises`**: la versión con promesas, la que se usa hoy. El prefijo `node:` indica que es un módulo incluido en Node.

## Paso 5: leer lo que escribes en la terminal

`process.argv` es un array con lo que escribiste al ejecutar el script. Los dos primeros elementos son la ruta de Node y la de tu archivo; lo tuyo empieza en la posición 2. Crea `saludo.js`:

```js
const nombre = process.argv[2] ?? 'desconocido'
console.log(`Hola, ${nombre} 👋`)
```

```bash
node saludo.js Ana
# Hola, Ana 👋
```

## Paso 6: tu propio servidor web

Ahora lo más interesante. Con el módulo `node:http` creas un servidor que **responde a peticiones**, como las APIs a las que haces `fetch`. Crea `server.js`:

```js
import { createServer } from 'node:http'

const productos = [
  { id: 1, nombre: 'Teclado', precio: 120 },
  { id: 2, nombre: 'Mouse', precio: 45 }
]

const servidor = createServer((peticion, respuesta) => {
  console.log(`${peticion.method} ${peticion.url}`)

  if (peticion.method === 'GET' && peticion.url === '/api/productos') {
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    respuesta.end(JSON.stringify(productos))
    return
  }

  if (peticion.url === '/') {
    respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    respuesta.end('<h1>¡Mi primer servidor con Node!</h1>')
    return
  }

  respuesta.writeHead(404, { 'Content-Type': 'application/json' })
  respuesta.end(JSON.stringify({ error: 'Ruta no encontrada' }))
})

servidor.listen(3000, () => {
  console.log('Servidor en http://localhost:3000')
})
```

```bash
npm run dev
```

Abre en el navegador:

- [http://localhost:3000](http://localhost:3000) → tu página.
- [http://localhost:3000/api/productos](http://localhost:3000/api/productos) → **tu propia API** respondiendo JSON.
- `http://localhost:3000/lo-que-sea` → un 404.

Y mira la terminal: cada visita se registra con su método y su ruta.

Cómo funciona:

- **`createServer`** recibe una función que se ejecuta **en cada petición**.
- **`peticion`** (*request*) trae lo que pide el navegador: el método (`GET`, `POST`...) y la URL.
- **`respuesta`** (*response*) es lo que devuelves: el **código de estado** (200 = bien, 404 = no existe) con `writeHead` y el contenido con `end`.
- **`localhost:3000`** significa "este ordenador, puerto 3000". El servidor sigue encendido hasta que pulsas `Ctrl + C`.

Si vuelves al post de HTTP y APIs, ahora estás **al otro lado**: ya no consumes una API, la sirves tú.

## ¿Y ahora qué?

Escribir un servidor así con `node:http` está muy bien para entender cómo funciona. En proyectos reales se usa un framework que simplifica las rutas, como **Express**, **Fastify** o **Hono**, o un framework fullstack como **Next.js**. Pero todos hacen por debajo lo que acabas de hacer: recibir una petición y devolver una respuesta.

## Tu turno

Amplía `server.js`:

1. Añade la ruta `GET /api/productos/1` que devuelva solo el producto con ese `id`. Pista: `peticion.url.split('/')` te da las partes de la URL, y `find` busca el producto.
2. Si el producto no existe, responde con un 404 y `{ "error": "Producto no encontrado" }`.
3. Crea un `index.html` aparte que haga `fetch('http://localhost:3000/api/productos')` y pinte la lista. (Te encontrarás con un error de **CORS**; buscar cómo resolverlo con la cabecera `Access-Control-Allow-Origin` es parte del ejercicio.)

## Errores comunes

- **`document is not defined`.** En Node no hay página ni DOM. Ese código es del navegador.
- **`Cannot use import statement outside a module`.** Falta `"type": "module"` en el `package.json`.
- **`EADDRINUSE: address already in use :::3000`.** Ya tienes otro servidor usando ese puerto (quizá en otra terminal). Ciérralo con `Ctrl + C` o usa otro puerto.
- **Ejecutar `node app.js` en la carpeta equivocada.** `Cannot find module` suele significar eso. Revisa en qué carpeta está la terminal.
- **Cambiar el código y no ver el cambio.** Sin `--watch`, tienes que parar el servidor y arrancarlo de nuevo.

## Para profundizar

- [Introducción a Node.js (documentación oficial, en inglés)](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [El módulo `fs` (documentación oficial, en inglés)](https://nodejs.org/api/fs.html)
- [El módulo `http` (documentación oficial, en inglés)](https://nodejs.org/api/http.html)

En resumen: **Node.js** ejecuta JavaScript fuera del navegador. Con **`node archivo.js`** ejecutas un script, con **`node:fs`** lees y escribes archivos y con **`node:http`** creas un servidor que responde a peticiones. Es la puerta de entrada al backend con el lenguaje que ya conoces.
