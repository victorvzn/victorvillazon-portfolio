---
title: 'Express desde cero: tu primer servidor sin sufrir'
description: 'Qué es Express y qué te ahorra frente a node:http, cómo instalarlo, crear rutas, leer parámetros de la URL y query strings, responder JSON y servir archivos estáticos.'
date: 2026-11-27
series: backend
tags: [Express, Node.js, Backend, Fundamentos]
draft: true
---

En el post de Node.js desde cero creaste un servidor con `node:http`. Funcionaba, pero para cada ruta tenías que comparar `peticion.url` a mano, escribir las cabeceras, convertir a JSON... Con diez rutas, ese archivo se vuelve un laberinto de `if`.

**Express** es el framework de servidores más usado de Node.js. Hace exactamente lo mismo que `node:http` (de hecho, lo usa por debajo), pero con una forma mucho más cómoda de definir rutas y respuestas.

## Antes y después

Con `node:http`:

```js
const servidor = createServer((peticion, respuesta) => {
  if (peticion.method === 'GET' && peticion.url === '/api/productos') {
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    respuesta.end(JSON.stringify(productos))
    return
  }
  // ...un if por cada ruta
})
```

Con Express:

```js
app.get('/api/productos', (req, res) => {
  res.json(productos)
})
```

Una ruta, tres líneas, y Express pone la cabecera `Content-Type` y convierte a JSON por ti.

## Paso 1: crear el proyecto

```bash
mkdir mi-api
cd mi-api
npm init -y
npm install express
```

En `package.json`, añade `"type": "module"` (para usar `import`) y un script `dev`:

```json
{
  "name": "mi-api",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

> Este post usa **Express 5**, la versión actual. Si ves tutoriales antiguos con Express 4, la mayoría del código es igual; la diferencia más importante es que Express 5 maneja mejor los errores de las funciones `async`.

## Paso 2: el servidor mínimo

Crea `server.js`:

```js
import express from 'express'

const app = express()
const PUERTO = 3000

app.get('/', (req, res) => {
  res.send('<h1>¡Hola desde Express!</h1>')
})

app.listen(PUERTO, () => {
  console.log(`Servidor en http://localhost:${PUERTO}`)
})
```

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Ya tienes un servidor.

- **`express()`** crea la aplicación.
- **`app.get(ruta, manejador)`** dice: "cuando llegue una petición **GET** a esta ruta, ejecuta esta función".
- **`req`** (*request*) es la petición; **`res`** (*response*), la respuesta. Son los mismos `peticion` y `respuesta` de `node:http`, con métodos extra.
- **`app.listen`** enciende el servidor en un puerto.

## Paso 3: responder JSON

```js
const productos = [
  { id: 1, nombre: 'Teclado', precio: 120, categoria: 'perifericos' },
  { id: 2, nombre: 'Mouse', precio: 45, categoria: 'perifericos' },
  { id: 3, nombre: 'Monitor', precio: 800, categoria: 'pantallas' }
]

app.get('/api/productos', (req, res) => {
  res.json(productos)
})
```

Abre [http://localhost:3000/api/productos](http://localhost:3000/api/productos): tu API respondiendo JSON.

Los métodos de respuesta que más usarás:

| Método | Qué hace |
| --- | --- |
| `res.json(datos)` | Envía JSON (y pone la cabecera correcta) |
| `res.send(texto)` | Envía texto o HTML |
| `res.status(404)` | Cambia el código de estado (se encadena: `res.status(404).json(...)`) |
| `res.sendFile(ruta)` | Envía un archivo |
| `res.redirect('/otra')` | Redirige a otra URL |

## Paso 4: parámetros de ruta

Para pedir **un** producto por su id, la ruta lleva una parte variable con `:`:

```js
app.get('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id)
  const producto = productos.find((p) => p.id === id)

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  res.json(producto)
})
```

- [http://localhost:3000/api/productos/2](http://localhost:3000/api/productos/2) → el Mouse.
- [http://localhost:3000/api/productos/99](http://localhost:3000/api/productos/99) → un 404 con su mensaje.

`req.params.id` es siempre **texto** (`'2'`), por eso lo convertimos con `Number()`. El `return` evita que se ejecute el `res.json(producto)` de abajo: **solo se puede responder una vez** por petición.

## Paso 5: query strings para filtrar

Los parámetros después del `?` (lo viste en el post de HTTP) llegan en `req.query`:

```js
app.get('/api/productos', (req, res) => {
  const { categoria, max } = req.query
  let resultado = productos

  if (categoria) {
    resultado = resultado.filter((p) => p.categoria === categoria)
  }
  if (max) {
    resultado = resultado.filter((p) => p.precio <= Number(max))
  }

  res.json(resultado)
})
```

Prueba:

- `/api/productos?categoria=perifericos`
- `/api/productos?max=100`
- `/api/productos?categoria=perifericos&max=50`

¿Cuándo usar uno u otro? **Parámetros de ruta** para identificar *un recurso* (`/productos/2`); **query strings** para *filtrar, ordenar o paginar* una lista (`/productos?orden=precio`).

## Paso 6: servir tu frontend

Express también puede servir archivos estáticos (HTML, CSS, JS, imágenes). Crea una carpeta `public` con un `index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Mi tienda</title>
  </head>
  <body>
    <h1>Productos</h1>
    <ul id="lista"></ul>
    <script>
      fetch('/api/productos')
        .then((respuesta) => respuesta.json())
        .then((productos) => {
          document.querySelector('#lista').innerHTML = productos
            .map((p) => `<li>${p.nombre}: S/ ${p.precio}</li>`)
            .join('')
        })
    </script>
  </body>
</html>
```

Y en `server.js`, **antes** de las rutas:

```js
app.use(express.static('public'))
```

Ahora [http://localhost:3000](http://localhost:3000) muestra tu `index.html`, que pide los datos a **tu propia API**. Como frontend y API están en el mismo servidor (mismo origen), **no hay problemas de CORS**. (Borra la ruta `app.get('/')` del paso 2, o tendrá prioridad sobre el `index.html` si la pones antes.)

## El orden importa

Express revisa las rutas **de arriba abajo** y usa la primera que coincide. Por ejemplo:

```js
app.get('/api/productos/:id', ...)      // captura también /api/productos/ofertas
app.get('/api/productos/ofertas', ...)  // ❌ nunca se llega aquí
```

Pon las rutas **más específicas primero**.

## Tu turno

1. Añade `GET /api/categorias` que devuelva las categorías **sin repetir**. (Pista: `new Set()`.)
2. Añade el filtro `?q=tec` que busque productos cuyo nombre contenga ese texto, sin importar mayúsculas.
3. Añade `?orden=precio` y `?orden=-precio` para ordenar de menor a mayor y de mayor a menor.
4. Crea una página `public/producto.html` que lea el `id` de la URL (`?id=2`) y muestre ese producto.

## Errores comunes

- **`Cannot GET /ruta`.** No existe esa ruta, o el método no coincide (definiste `app.post` y abres la URL en el navegador, que hace `GET`).
- **`Cannot set headers after they are sent to the client`.** Respondiste dos veces. Usa `return` al responder dentro de un `if`.
- **Comparar `req.params.id` con un número** sin convertirlo: `'2' === 2` es `false`.
- **Olvidar reiniciar el servidor.** Sin `--watch`, los cambios no se aplican hasta que lo paras y lo vuelves a arrancar.
- **`EADDRINUSE`.** Ya hay otro servidor en ese puerto. Ciérralo o usa otro.

## Para profundizar

- [Primeros pasos con Express (documentación oficial, en español)](https://expressjs.com/es/starter/hello-world.html)
- [Rutas en Express (documentación oficial, en español)](https://expressjs.com/es/guide/routing.html)

En resumen: **Express** simplifica `node:http`: con **`app.get(ruta, (req, res) => ...)`** defines rutas, con **`res.json()`** respondes JSON y con **`res.status()`** eliges el código. Lee la parte variable de la URL en **`req.params`** y los filtros en **`req.query`**, sirve tu frontend con **`express.static`** y recuerda que las rutas se revisan **en orden**.
