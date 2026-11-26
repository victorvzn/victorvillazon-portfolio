---
title: 'Módulos en JavaScript: import y export para ordenar tu código'
description: 'Cuando tu main.js pasa de 300 líneas, toca dividirlo. Cómo funcionan import y export, la diferencia entre export default y con nombre, y cómo usarlos en el navegador.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ES6, Buenas prácticas]
draft: true
---

Al principio todo cabe en un `main.js`. Pero el proyecto crece: funciones para la API, para pintar el DOM, para validar formularios, para formatear precios... y un día tienes un archivo de 600 líneas donde no encuentras nada.

Los **módulos** te dejan **dividir** el código en varios archivos, cada uno con su responsabilidad, y conectarlos con **`export`** e **`import`**. Además, es exactamente como se trabaja en React, Vue o cualquier proyecto moderno, así que conviene dominarlo antes de dar ese salto.

## La idea

- Cada archivo `.js` es un **módulo** con su propio "espacio": sus variables no se ven desde fuera.
- Con **`export`** decides qué cosas **compartes**.
- Con **`import`** **traes** lo que otro archivo compartió.

## export con nombre

Supón un archivo con utilidades para mostrar precios:

```js
// utils/formato.js
export function formatearPrecio(numero) {
  return `S/ ${numero.toFixed(2)}`
}

export function calcularIgv(precio) {
  return precio * 0.18
}

const SECRETO = 'esto no se exporta' // solo existe dentro de este archivo
```

Y otro archivo que lo usa:

```js
// main.js
import { formatearPrecio, calcularIgv } from './utils/formato.js'

const precio = 100
console.log(formatearPrecio(precio + calcularIgv(precio))) // 'S/ 118.00'
```

- En el `import`, los nombres van **entre llaves** y tienen que coincidir **exactamente** con los exportados.
- La ruta empieza por **`./`** (la carpeta actual) o **`../`** (la de arriba), y en el navegador **lleva la extensión `.js`**.
- `SECRETO` no se puede importar: no tiene `export`. Así cada archivo esconde lo que es solo suyo.

También puedes exportar varias cosas al final del archivo, todas juntas:

```js
function formatearPrecio(numero) { /* ... */ }
function calcularIgv(precio) { /* ... */ }

export { formatearPrecio, calcularIgv }
```

## export default: lo principal del archivo

Cuando un archivo tiene **una cosa principal**, se suele exportar con **`default`**. Solo puede haber **un** `export default` por archivo:

```js
// servicios/productos.js
const API = 'https://fakestoreapi.com/products'

export default async function obtenerProductos() {
  const respuesta = await fetch(API)
  return respuesta.json()
}
```

Y se importa **sin llaves**, con el nombre que tú quieras:

```js
// main.js
import obtenerProductos from './servicios/productos.js'
import cargarTodo from './servicios/productos.js' // también vale: el nombre lo eliges tú
```

## ¿Con nombre o default?

| | `export` con nombre | `export default` |
| --- | --- | --- |
| Cuántos por archivo | Los que quieras | Solo uno |
| Cómo se importa | `import { nombre } from '...'` | `import loQueQuieras from '...'` |
| Ideal para | Archivos de utilidades con varias funciones | Un archivo = una cosa (un componente, un servicio) |

Puedes combinar los dos en un mismo archivo:

```js
import obtenerProductos, { formatearPrecio } from './tienda.js'
```

## Renombrar al importar

Si dos archivos exportan algo con el mismo nombre, o el nombre es muy largo, puedes renombrarlo con **`as`**:

```js
import { formatearPrecio as precio } from './utils/formato.js'
import * as formato from './utils/formato.js' // todo junto en un objeto

console.log(precio(10))
console.log(formato.calcularIgv(100))
```

## Usarlos en el navegador

Para que el navegador entienda `import` y `export`, el `<script>` necesita **`type="module"`**:

```html
<script type="module" src="main.js"></script>
```

Y solo hace falta enlazar el archivo principal: él importará a los demás.

Un script con `type="module"` tiene además algunas diferencias:

- **Se ejecuta cuando el HTML ya está cargado** (como si tuviera `defer`), así que puedes ponerlo en el `<head>` y usar `document.querySelector` sin problemas.
- **Sus variables no son globales.** Si declaras `const total` en un módulo, no aparece en la consola del navegador como `total`.
- **Usa el modo estricto** automáticamente.

## El error que te va a salir: CORS y file://

Si abres el `index.html` con doble clic (la dirección empieza por `file://`), los módulos **no funcionan** y verás un error de **CORS** en la consola. Por seguridad, el navegador solo carga módulos desde un **servidor**.

La solución es usar un servidor local:

- En VS Code, la extensión **Live Server**: clic derecho en el `index.html` → **Open with Live Server**.
- O, si tienes Node.js instalado, en la terminal: `npx serve`.

La dirección pasará a ser algo como `http://127.0.0.1:5500` y todo funcionará. Las herramientas como **Vite** (las que se usan con React) ya traen su propio servidor, por eso allí nunca verás este problema.

## Cómo organizar un proyecto pequeño

Una estructura sencilla para un proyecto con módulos:

```bash
mi-tienda/
├── index.html
├── main.js              # el punto de entrada: conecta todo
├── servicios/
│   └── productos.js     # las peticiones a la API
├── ui/
│   └── pintarProductos.js  # todo lo que toca el DOM
└── utils/
    └── formato.js       # funciones pequeñas reutilizables
```

Cada archivo tiene **una responsabilidad**. Cuando algo falla en la API, sabes exactamente dónde mirar.

## Errores comunes

- **Olvidar `type="module"`** en el `<script>`: sale `Cannot use import statement outside a module`.
- **Abrir el HTML con doble clic**: error de CORS. Usa Live Server.
- **Olvidar la extensión `.js`** en la ruta del `import`. En el navegador es obligatoria (en Vite o Node a veces no, por eso confunde).
- **Olvidar el `./`**: `import ... from 'utils/formato.js'` no funciona; tiene que ser `'./utils/formato.js'`.
- **Poner llaves a un `default`**, o quitárselas a uno con nombre. `import { obtenerProductos }` no encuentra un `export default`.

## Para profundizar

- [Módulos de JavaScript en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)

En resumen: divide tu código en archivos con una responsabilidad cada uno, comparte con **`export`** (con nombre o **`default`**), trae con **`import`**, usa **`<script type="module">`** y abre el proyecto con un **servidor local**. Es la base de cómo se organiza cualquier proyecto moderno.
