---
title: 'Next.js desde cero: páginas, rutas, componentes de servidor y deploy'
description: 'Qué añade Next.js a React, cómo crear un proyecto, el sistema de rutas con carpetas, layouts, enlaces, rutas dinámicas, pedir datos en el servidor y publicarlo en Vercel.'
date: 2026-11-26
series: frameworks
tags: [Next.js, React, Frameworks]
draft: true
---

React te da los componentes, el estado y los eventos. Pero no te dice cómo tener **varias páginas**, cómo hacer que Google lea tu contenido o dónde pedir los datos. **Next.js** es un framework construido **encima de React** que resuelve todo eso, y es una de las formas más habituales de usar React en empresas.

Antes de empezar, asegúrate de haber hecho los posts de React: Next.js da por hecho que sabes qué son los componentes, las props y `useState`.

## Qué añade Next.js a React

| Con React (y Vite) | Con Next.js |
| --- | --- |
| Una sola página; para tener varias, instalas un *router* aparte | **Rutas con carpetas**: cada carpeta es una página |
| Todo se pinta en el navegador: Google y las redes sociales ven una página vacía al principio | **Se puede pintar en el servidor**: el HTML llega ya con el contenido |
| Los datos se piden con `useEffect` desde el navegador | Los datos se pueden pedir **en el servidor**, antes de enviar la página |
| Imágenes y fuentes "a mano" | Componentes que **optimizan** imágenes y fuentes |
| Un proyecto solo de frontend | Puede tener su propio **backend** (rutas de API) |

## Paso 1: crear el proyecto

Necesitas **Node.js** (versión 20.9 o superior). En la terminal:

```bash
npx create-next-app@latest mi-tienda --js --yes
cd mi-tienda
npm run dev
```

- **`--js`**: el proyecto en JavaScript (por defecto lo crea en TypeScript).
- **`--yes`**: acepta las opciones recomendadas para todo lo demás (Tailwind, ESLint y el **App Router**, que es el sistema de rutas actual).

Abre [http://localhost:3000](http://localhost:3000): tu app de Next.js está funcionando.

## Paso 2: los archivos que importan

```bash
mi-tienda/
├── app/
│   ├── layout.js     # la estructura común de todas las páginas
│   ├── page.js       # la página de inicio: /
│   └── globals.css
├── public/           # imágenes y archivos estáticos
└── package.json
```

Todo gira alrededor de la carpeta **`app`**.

## Paso 3: las rutas son carpetas

En Next.js no configuras las rutas: **las creas con carpetas**. Cada carpeta dentro de `app` es un trozo de la URL, y el archivo **`page.js`** de dentro es lo que se ve:

| Archivo | URL |
| --- | --- |
| `app/page.js` | `/` |
| `app/contacto/page.js` | `/contacto` |
| `app/productos/page.js` | `/productos` |
| `app/productos/ofertas/page.js` | `/productos/ofertas` |

Crea `app/contacto/page.js`:

```jsx
export default function Contacto() {
  return (
    <main>
      <h1>Contacto</h1>
      <p>Escríbenos a hola@mitienda.com</p>
    </main>
  )
}
```

Abre `/contacto`. Ya está: una página nueva, sin configurar nada. El archivo **tiene** que llamarse `page.js` y exportar el componente con `export default`.

## Paso 4: el layout, lo que se repite

El archivo **`app/layout.js`** envuelve **todas** las páginas. Es el sitio de la cabecera, el menú y el pie:

```jsx
import Link from 'next/link'
import './globals.css'

export const metadata = {
  title: 'Mi Tienda',
  description: 'La mejor tienda de tecnología'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header>
          <nav>
            <Link href="/">Inicio</Link>
            <Link href="/productos">Productos</Link>
            <Link href="/contacto">Contacto</Link>
          </nav>
        </header>

        {children}

        <footer>© 2026 Mi Tienda</footer>
      </body>
    </html>
  )
}
```

- **`children`** es la página que toca en cada momento.
- **`metadata`** genera el `<title>` y las meta tags del `<head>` (lo vimos en el post del `<head>`). Cada página puede exportar el suyo.
- Fíjate en que **el layout tiene `<html>` y `<body>`**: en Next.js no hay un `index.html`, lo genera este archivo.

### `<Link>` en vez de `<a>`

Para enlazar páginas de tu propia web, usa el componente **`<Link>`**. Por debajo es un `<a>`, pero Next.js carga la página nueva **sin recargar** todo y hasta la **precarga** cuando el enlace aparece en pantalla. La navegación es instantánea. Para enlaces a otras webs, usa un `<a>` normal.

## Paso 5: componentes de servidor y de cliente

Esta es la gran novedad de Next.js, y la que más confunde al principio.

**Por defecto, los componentes de Next.js son componentes de servidor**: se ejecutan **en el servidor** y al navegador solo llega el HTML resultante. Ventajas: la página llega ya con el contenido, se envía menos JavaScript y puedes pedir datos directamente.

Pero los componentes de servidor **no pueden ser interactivos**: no pueden usar `useState`, `useEffect` ni `onClick`, porque eso pasa en el navegador. Si lo intentas, verás un error.

Para un componente interactivo, añade **`'use client'`** en la primera línea del archivo. Por ejemplo, `app/componentes/BotonCarrito.js`:

```jsx
'use client'

import { useState } from 'react'

export default function BotonCarrito() {
  const [cantidad, setCantidad] = useState(0)

  return (
    <button onClick={() => setCantidad(cantidad + 1)}>
      🛒 Añadir al carrito ({cantidad})
    </button>
  )
}
```

Y lo usas en cualquier página, que puede seguir siendo de servidor:

```jsx
import BotonCarrito from '../componentes/BotonCarrito'

export default function Producto() {
  return (
    <main>
      <h1>Teclado mecánico</h1>
      <p>S/ 120</p>
      <BotonCarrito />
    </main>
  )
}
```

**La regla práctica:** deja todo como componente de servidor y añade `'use client'` solo en las **piezas pequeñas** que necesitan interacción (un botón, un formulario, un menú desplegable).

## Paso 6: pedir datos en el servidor

En un componente de servidor puedes hacer `fetch` **directamente**, con `async`/`await`, sin `useEffect` ni estados de carga:

```jsx
// app/productos/page.js
import Link from 'next/link'

export const metadata = { title: 'Productos | Mi Tienda' }

export default async function Productos() {
  const respuesta = await fetch('https://dummyjson.com/products?limit=10')
  const { products } = await respuesta.json()

  return (
    <main>
      <h1>Productos</h1>
      <ul>
        {products.map((producto) => (
          <li key={producto.id}>
            <Link href={`/productos/${producto.id}`}>{producto.title}</Link> · ${producto.price}
          </li>
        ))}
      </ul>
    </main>
  )
}
```

¿Ves la diferencia con el post de `useEffect`? Aquí el componente **es** `async` y espera los datos. Cuando la página llega al navegador, la lista ya está en el HTML. Google la lee sin problemas.

Para mostrar algo mientras carga, crea un archivo **`loading.js`** en la misma carpeta. Y para los errores, un **`error.js`** (que tiene que ser un componente de cliente). Next.js los usa automáticamente.

## Paso 7: rutas dinámicas

¿Una página para cada producto? No vas a crear mil carpetas. Una carpeta con el nombre **entre corchetes** crea una **ruta dinámica**: `app/productos/[id]/page.js` responde a `/productos/1`, `/productos/2`, `/productos/lo-que-sea`...

```jsx
// app/productos/[id]/page.js
import { notFound } from 'next/navigation'

export default async function DetalleProducto({ params }) {
  const { id } = await params // el trozo de la URL entre corchetes

  const respuesta = await fetch(`https://dummyjson.com/products/${id}`)
  if (!respuesta.ok) notFound() // muestra la página 404

  const producto = await respuesta.json()

  return (
    <main>
      <h1>{producto.title}</h1>
      <p>{producto.description}</p>
      <p>Precio: ${producto.price}</p>
    </main>
  )
}
```

- **`params`** trae los trozos dinámicos de la URL. En las versiones actuales de Next.js es una **promesa**, por eso el `await`.
- **`notFound()`** muestra la página 404 si el producto no existe.

## Paso 8: imágenes optimizadas

El componente **`<Image>`** de Next.js hace por ti lo que vimos en el post de rendimiento de imágenes: las convierte a formatos modernos, genera varios tamaños, las carga con *lazy loading* y reserva su espacio:

```jsx
import Image from 'next/image'

<Image src="/teclado.jpg" alt="Teclado mecánico con luces RGB" width={800} height={600} />
```

Las imágenes de tu proyecto van en la carpeta `public` y se usan con una ruta que empieza por `/`. (Para imágenes de otras webs, hay que permitir su dominio en `next.config.js`).

## Paso 9: publicarlo

Next.js está hecho por **Vercel**, y publicarlo ahí es lo más fácil:

1. Sube tu proyecto a GitHub (tienes un post de Git y GitHub).
2. Entra en [vercel.com](https://vercel.com) con tu cuenta de GitHub.
3. **Add New → Project**, elige el repositorio y pulsa **Deploy**.

En un par de minutos tienes una URL pública. Y cada vez que hagas `git push`, se vuelve a publicar solo. (También se puede publicar en otros servicios, como Netlify o un servidor propio con `npm run build` y `npm run start`).

## Tu turno

1. Crea un proyecto con `create-next-app`.
2. Añade las páginas `/productos` y `/productos/[id]` con los datos de DummyJSON.
3. Crea un `loading.js` en `app/productos` que muestre "Cargando productos...".
4. Añade un componente de cliente `BotonFavorito` que alterne entre ☆ y ★ y úsalo en el detalle.
5. Publícalo en Vercel.

## Errores comunes

- **Usar `useState` o `onClick` sin `'use client'`.** Error: los componentes son de servidor por defecto.
- **Poner `'use client'` en todo** "para que funcione". Pierdes las ventajas del servidor. Úsalo solo donde hace falta interacción.
- **Llamar al archivo de otra forma** que `page.js`: la ruta no existe.
- **Usar `<a>` para enlaces internos.** Usa `<Link>`.
- **Olvidar el `await` en `params`** en versiones recientes.
- **Mezclar tutoriales del "Pages Router"** (la forma antigua, con la carpeta `pages/`) con el **App Router** (la carpeta `app/`). Fíjate en cuál usa cada tutorial: funcionan distinto.

## Para profundizar

- [Aprende Next.js, el curso oficial (en inglés)](https://nextjs.org/learn)
- [La documentación de Next.js (en inglés)](https://nextjs.org/docs)

En resumen: **Next.js** es React con superpoderes. Las **rutas son carpetas** con un `page.js`, el **`layout.js`** envuelve todas las páginas, los componentes son **de servidor** por defecto (pueden pedir datos con `await fetch`) y añades **`'use client'`** solo a lo interactivo. Con **`[id]`** creas rutas dinámicas, con **`<Link>`** e **`<Image>`** navegas y optimizas, y con **Vercel** lo publicas en minutos.
