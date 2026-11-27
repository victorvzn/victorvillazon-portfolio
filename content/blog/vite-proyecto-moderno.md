---
title: 'Vite: crea un proyecto frontend moderno en un minuto'
description: 'Qué es un bundler, qué hace Vite por ti, cómo crear un proyecto con JavaScript puro o con React, importar CSS y archivos, usar variables de entorno y preparar la versión para publicar.'
date: 2026-11-26
series: frameworks
tags: [Vite, Herramientas, Frameworks]
draft: true
---

Hasta ahora, tus proyectos eran un `index.html`, un `estilos.css` y un `app.js`, que abrías haciendo doble clic. Funciona perfectamente para aprender. Pero en cuanto empiezas a usar paquetes de npm, React o Tailwind, necesitas una herramienta que **prepare tu código** para el navegador. La más usada hoy es **Vite**.

## El problema que resuelve

Imagina que instalas una librería con `npm install dayjs` y escribes:

```js
import dayjs from 'dayjs'
```

Si abres tu HTML en el navegador, falla: el navegador no sabe qué es `'dayjs'` ni dónde está `node_modules`. Y hay más cosas que el navegador no entiende por sí solo: el **JSX** de React, los archivos `.vue`, TypeScript...

Aquí entra un **bundler** (empaquetador): una herramienta que coge todos tus archivos y los de tus librerías y los **convierte en archivos que el navegador entiende**, optimizados para que carguen rápido.

Vite (se pronuncia "vit", significa "rápido" en francés) hace eso y más:

- **Un servidor de desarrollo** que se arranca en segundos.
- **Recarga instantánea** (*Hot Module Replacement*, HMR): guardas un archivo y el cambio aparece en el navegador al momento, **sin perder** lo que tenías en pantalla.
- **Entiende `import` de paquetes de npm**, JSX, TypeScript y CSS.
- **Prepara la versión de producción**: minimiza el código (le quita espacios y comentarios para que pese menos) y lo divide en archivos óptimos.

React, Vue, Svelte y muchos otros recomiendan Vite para empezar.

## Paso 1: crear el proyecto

Necesitas **Node.js** instalado. En la terminal, en la carpeta donde guardes tus proyectos:

```bash
npm create vite@latest
```

Te hará unas preguntas:

1. **Project name**: el nombre de la carpeta, por ejemplo `mi-proyecto`.
2. **Select a framework**: elige **Vanilla** para JavaScript puro (o **React**, **Vue**...).
3. **Select a variant**: elige **JavaScript**.

Y después:

```bash
cd mi-proyecto
npm install
npm run dev
```

Abre la dirección que aparece en la terminal, normalmente **http://localhost:5173**. Ya tienes un proyecto funcionando.

> Si ya sabes lo que quieres, puedes saltarte las preguntas: `npm create vite@latest mi-proyecto -- --template vanilla` (o `react`, `vue`...).

## Paso 2: lo que te ha creado

```bash
mi-proyecto/
├── index.html         # la página de entrada
├── package.json       # scripts y dependencias
├── public/            # archivos que se copian tal cual (favicon, robots.txt...)
└── src/
    ├── main.js        # tu JavaScript principal
    ├── style.css
    └── counter.js     # un ejemplo de módulo
```

Fíjate en el `index.html`: carga tu JavaScript como **módulo**:

```html
<script type="module" src="/src/main.js"></script>
```

Desde `main.js`, Vite sigue todos los `import` y se encarga del resto.

## Paso 3: importar de todo

Con Vite puedes importar no solo JavaScript, sino también **CSS, imágenes y JSON**:

```js
// src/main.js
import './style.css'                 // aplica el CSS a la página
import logo from './assets/logo.svg' // te da la URL final de la imagen
import productos from './productos.json' // te da el contenido ya convertido en objeto
import dayjs from 'dayjs'            // un paquete de npm

const app = document.querySelector('#app')

const img = document.createElement('img')
img.src = logo
img.alt = 'Logo de la tienda'
app.append(img)

console.log(`Tenemos ${productos.length} productos`)
console.log(`Hoy es ${dayjs().format('DD/MM/YYYY')}`)
```

Prueba a cambiar un color en `style.css` y guarda: el cambio aparece al instante, sin recargar.

### ¿`src/assets` o `public`?

- **`src/assets`** (y en general dentro de `src`): archivos que **importas** desde tu código. Vite los optimiza y les añade un código al nombre (`logo-a1b2c3.svg`) para que el navegador no use una versión vieja guardada en caché.
- **`public`**: archivos que se copian **tal cual** y se usan con una ruta absoluta (`/favicon.svg`). Ideal para el favicon, `robots.txt` o archivos que necesitan un nombre fijo.

## Paso 4: variables de entorno

A veces necesitas datos que cambian según dónde se ejecute el proyecto, como la URL de tu API. Crea un archivo **`.env`** en la raíz:

```bash
VITE_API_URL=https://api.mitienda.com
```

Y úsalo en tu código:

```js
const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/productos`)
```

Solo las variables que empiezan por **`VITE_`** llegan a tu código. Es una protección para que no expongas por error otras variables de tu sistema.

⚠️ **Importante:** todo lo que llega a tu código del frontend **lo puede ver cualquiera** que abra las DevTools. **Nunca** pongas en un `.env` de frontend contraseñas ni claves secretas de APIs. Y añade `.env` a tu `.gitignore`.

## Paso 5: preparar la versión para publicar

Cuando quieras publicar tu web:

```bash
npm run build
```

Vite crea una carpeta **`dist`** con todo optimizado: HTML, CSS y JavaScript minimizados, listos para subir a cualquier hosting (Vercel, Netlify, GitHub Pages...). Lo vimos en el post de publicar tu web gratis.

Para comprobar que la versión final funciona antes de subirla:

```bash
npm run preview
```

| Script | Para qué |
| --- | --- |
| `npm run dev` | Trabajar: servidor rápido con recarga instantánea |
| `npm run build` | Generar la carpeta `dist` para publicar |
| `npm run preview` | Probar en local lo que hay en `dist` |

## ¿Y Webpack, Parcel, Create React App...?

Vas a ver estos nombres en tutoriales:

- **Webpack**: el bundler más usado durante años. Muy potente, pero más lento y complejo de configurar. Lo encontrarás en proyectos que ya existen.
- **Create React App**: la forma antigua de crear proyectos de React. Está **abandonado**; no lo uses en proyectos nuevos.
- **Parcel, esbuild, Rolldown**: otras herramientas parecidas o piezas que usan otras herramientas por dentro.

Para un proyecto nuevo, Vite es hoy la opción por defecto.

## Tu turno

1. Crea un proyecto con la plantilla **Vanilla**.
2. Borra el contenido de ejemplo de `main.js` y `style.css`.
3. Crea un archivo `src/productos.json` con un array de tres productos, impórtalo y píntalo en una lista (con lo que aprendiste en el post de pintar listas).
4. Ejecuta `npm run build` y mira qué hay dentro de `dist`.

## Errores comunes

- **Abrir el `index.html` con doble clic en un proyecto de Vite.** No funciona: tienes que usar `npm run dev`.
- **Subir la carpeta `src` al hosting.** Lo que se publica es la carpeta **`dist`**, después de `npm run build`.
- **Variables de entorno sin el prefijo `VITE_`.** Llegan como `undefined`.
- **Poner claves secretas en el `.env` del frontend.** Se verán en el navegador.
- **Rutas a imágenes que funcionan en `dev` pero no tras el `build`.** Importa las imágenes desde `src` o ponlas en `public` y usa rutas que empiecen por `/`.
- **Olvidar reiniciar `npm run dev`** después de cambiar el `.env`.

## Para profundizar

- [Guía de inicio de Vite (en inglés)](https://vite.dev/guide/)
- [Variables de entorno en Vite (en inglés)](https://vite.dev/guide/env-and-mode)

En resumen: **Vite** prepara tu código para el navegador. Con **`npm create vite@latest`** creas un proyecto en un minuto, con **`npm run dev`** trabajas con recarga instantánea y con **`npm run build`** generas la carpeta **`dist`** lista para publicar. Te deja importar CSS, imágenes, JSON y paquetes de npm, y es la base de los proyectos modernos de React, Vue y compañía.
