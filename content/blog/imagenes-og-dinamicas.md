---
title: 'Imágenes para compartir generadas con código: Open Graph dinámico con Next.js'
description: 'Cómo generar automáticamente la imagen de 1200x630 de cada post o página con su propio título, usando ImageResponse de Next.js, JSX y estilos en línea. Con el ejemplo real de este blog.'
date: 2026-11-26
series: frameworks
tags: [Next.js, SEO, Open Graph]
draft: true
---

En el post de Open Graph vimos que la imagen de 1200 × 630 es lo que más llama la atención cuando compartes un enlace. Para una web de cinco páginas, puedes diseñarlas a mano en Figma. Pero ¿y para un blog con 150 posts? ¿Vas a diseñar 150 imágenes, y otra más cada vez que publiques?

La solución es **generarlas con código**: una ruta de tu web que, al pedirle `/api/og?title=Mi post`, **dibuja** una imagen con ese título. Es exactamente lo que hace este blog para cada artículo.

## Cómo funciona

1. Cada página pone en su `og:image` una URL que incluye su título: `https://misitio.com/api/og?title=Aprende%20CSS%20Grid`.
2. Cuando LinkedIn o WhatsApp piden esa URL, tu servidor **genera la imagen** en ese momento: un diseño con el título.
3. La imagen se guarda en **caché**, así que solo se genera una vez por título.

Para dibujar la imagen, Next.js trae **`ImageResponse`**: le pasas **JSX** (como en un componente de React) y lo convierte en una imagen PNG.

## Paso 1: la ruta que genera la imagen

En un proyecto con el **App Router**, crea `app/api/og/route.js`:

```jsx
import { ImageResponse } from 'next/og'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const titulo = (searchParams.get('title') ?? 'Mi blog').slice(0, 100)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: '#c7d2fe' }}>BLOG DE ANA TORRES</div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{titulo}</div>
        <div style={{ display: 'flex', fontSize: 28 }}>anatorres.dev</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

Arranca el proyecto y abre `http://localhost:3000/api/og?title=Hola mundo`: verás tu imagen.

Lo importante:

- **`searchParams.get('title')`**: el título llega en la URL. El `slice(0, 100)` evita que alguien te pase un texto de 10 000 caracteres.
- **`{ width: 1200, height: 630 }`**: el tamaño recomendado para Open Graph.
- **JSX con estilos en línea** (`style={{ ... }}`): no hay archivos CSS ni Tailwind por defecto. Se escribe CSS con nombres en camelCase (`fontSize`, `flexDirection`).

> Este blog usa el Pages Router, así que su versión vive en `pages/api/og.js` con un `handler(req, res)` en vez de `GET(request)`, pero la parte de `ImageResponse` es la misma.

## Las limitaciones del "CSS" de ImageResponse

`ImageResponse` no es un navegador: usa un motor más simple, que solo entiende **un subconjunto de CSS**. Las reglas que más te van a afectar:

- **Todo es Flexbox.** Cada `<div>` con más de un hijo necesita `display: 'flex'`. Grid **no** funciona.
- **Nada de clases ni hojas de estilo**: solo `style` en línea.
- **Fuentes**: por defecto trae una. Para usar la tuya, tienes que cargar el archivo de la fuente y pasárselo en la opción `fonts`.
- **Imágenes**: puedes usar `<img>`, pero con una URL absoluta (o los datos de la imagen) y con su `width` y `height`.

Si algo no se ve como esperas, el primer sospechoso es un `display: 'flex'` que falta.

## Paso 2: usarla en cada página

En cada página o post, la imagen es esa URL con su título. Con el sistema de metadatos del App Router:

```jsx
// app/blog/[slug]/page.js
const SITE_URL = 'https://www.anatorres.dev'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await obtenerPost(slug) // tu función para leer el post

  const imagen = `${SITE_URL}/api/og?${new URLSearchParams({ title: post.titulo })}`

  return {
    title: post.titulo,
    description: post.descripcion,
    openGraph: {
      title: post.titulo,
      description: post.descripcion,
      images: [{ url: imagen, width: 1200, height: 630, alt: post.titulo }]
    },
    twitter: { card: 'summary_large_image' }
  }
}
```

- **`new URLSearchParams({ title })`** codifica el título para la URL: espacios, tildes, `?` y `&` no rompen nada.
- **La URL es absoluta**: las redes sociales la necesitan completa, con `https://` (lo vimos en el post de Open Graph).
- **`generateMetadata`** es la forma de Next.js de calcular las meta tags de una página a partir de sus datos.

> **Atajo de Next.js:** si creas un archivo `opengraph-image.js` dentro de la carpeta de una ruta (por ejemplo, `app/blog/[slug]/opengraph-image.js`) que devuelve un `ImageResponse`, Next.js lo usa como imagen de esa página **y añade las meta tags solo**. Es aún más cómodo; la ventaja de la ruta `/api/og` es que puedes reutilizarla para cualquier página, con cualquier título.

## Paso 3: la caché

Generar una imagen cuesta un poco de tiempo y de servidor. Como el mismo título siempre produce la misma imagen, dile al navegador y al CDN que la guarden:

```js
return new ImageResponse(/* ... */, {
  width: 1200,
  height: 630,
  headers: {
    'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable'
  }
})
```

- **`max-age=86400`**: el navegador la guarda un día.
- **`s-maxage=31536000`**: el CDN (la red de servidores de Vercel) la guarda un año. Así solo se genera la primera vez que alguien la pide.

Si un día cambias el diseño, añade un parámetro de versión a la URL (`&v=2`) para que se generen de nuevo.

## Diseñar una buena imagen OG

- **El título grande**, legible en un móvil. Si es muy largo, reduce el tamaño de letra (este blog baja de 76 a 60 píxeles cuando el título pasa de 60 caracteres).
- **Tu marca**: el nombre de la web o tu nombre, y tus colores.
- **Márgenes amplios**: algunas plataformas recortan los bordes.
- **Poco texto**: el título y, como mucho, una etiqueta (la categoría del post). La descripción ya va en la tarjeta.

## Tu turno

1. En un proyecto de Next.js, crea la ruta `/api/og` del paso 1.
2. Añádele un parámetro `serie` que se muestre como etiqueta arriba (por ejemplo, "CSS").
3. Haz que el tamaño de la letra baje si el título es largo.
4. Úsala en el `generateMetadata` de tus posts y pruébala, ya publicada, con el **LinkedIn Post Inspector**.

## Errores comunes

- **Olvidar `display: 'flex'`** en un `<div>` con varios hijos. Error o diseño roto.
- **Usar Grid, clases o Tailwind** sin configurarlo. No funcionan por defecto.
- **URL relativa en `og:image`** (`/api/og?...`). Tiene que ser absoluta.
- **No codificar el título** en la URL. Un `&` o un `?` en el título rompe los parámetros. Usa `URLSearchParams`.
- **No limitar la longitud del texto** que llega por la URL.
- **Sin caché**, la imagen se regenera en cada petición.

## Para profundizar

- [Imágenes de Open Graph en Next.js (documentación oficial, en inglés)](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [`ImageResponse` (documentación oficial, en inglés)](https://nextjs.org/docs/app/api-reference/functions/image-response)

En resumen: en vez de diseñar una imagen para cada página, crea una ruta como **`/api/og?title=...`** que la **genere** con **`ImageResponse`** a partir de JSX (todo con **Flexbox** y estilos en línea). Úsala en el **`og:image`** de cada página con una **URL absoluta** y el título codificado con **`URLSearchParams`**, y ponle **caché** para que solo se genere una vez.
