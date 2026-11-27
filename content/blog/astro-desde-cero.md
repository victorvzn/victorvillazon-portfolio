---
title: 'Astro en la práctica: crea un blog rapidísimo paso a paso'
description: 'Qué es Astro y por qué es ideal para blogs, portfolios y landings, cómo crear un proyecto, componentes .astro, layouts, rutas por archivos, colecciones de contenido con Markdown, rutas dinámicas, imágenes optimizadas, islas interactivas con React o Vue y cómo publicarlo.'
date: 2026-11-27
series: frameworks
tags: [Astro, Frameworks, SEO, Rendimiento]
draft: true
---

Para una web de contenido (un blog, un portfolio, la web de un negocio, una documentación) React o Vue suelen ser **demasiado**: envían al navegador un montón de JavaScript para mostrar páginas que, en el fondo, son texto e imágenes. La web tarda más en cargar y el SEO sufre (lo viste en el post de SEO en React: SPA frente a SSR).

**Astro** es un framework pensado justo para eso: genera **HTML puro**, sin JavaScript por defecto, y solo añade JavaScript en las partes que de verdad lo necesitan. El resultado son webs **rapidísimas**, que Google entiende a la primera.

En este post vas a crear un **blog completo** con Astro, paso a paso.

## La idea clave: cero JavaScript por defecto

Con React, aunque tu página sea un artículo sin interacción, el navegador descarga React, descarga tu código y lo ejecuta para pintar la página. Con Astro, el trabajo se hace **al construir la web**: cada página se convierte en un archivo HTML ya terminado.

¿Y si una parte necesita interacción, como un buscador o un carrito? Astro usa las **islas** (*islands*): componentes interactivos sueltos dentro de una página estática, como islas en un mar de HTML. Solo esas islas cargan JavaScript. Y pueden estar hechas con **React, Vue, Svelte**... o varias a la vez.

| | SPA con React o Vue | Astro |
| --- | --- | --- |
| JavaScript por defecto | Toda la app | **Ninguno** |
| Interactividad | En toda la página | Solo en las **islas** |
| Ideal para | Apps muy interactivas (dashboards, editores) | Webs de contenido (blogs, portfolios, landings, docs) |
| SEO | Necesita SSR o pre-renderizado | Perfecto de serie |

## Paso 1: crear el proyecto

Necesitas Node.js (el post de Node.js desde cero te lo explica):

```bash
npm create astro@latest mi-blog
```

El asistente te pregunta:

- **Plantilla**: elige la mínima (*empty* o *minimal*) para entender cada pieza. (Hay una plantilla de blog lista para usar; pruébala después.)
- **Instalar dependencias**: sí.
- **Git**: sí.

```bash
cd mi-blog
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321). El puerto por defecto de Astro es el 4321.

Instala también la extensión oficial **Astro** en VS Code, para tener colores y autocompletado en los archivos `.astro`.

## Paso 2: la estructura

```bash
mi-blog/
├── public/            # archivos que se copian tal cual (favicon, robots.txt)
├── src/
│   ├── pages/         # cada archivo es una página (las rutas)
│   ├── components/    # componentes reutilizables
│   ├── layouts/       # plantillas de página
│   └── content/       # tu contenido en Markdown (lo crearemos)
├── astro.config.mjs   # la configuración
└── package.json
```

## Paso 3: los componentes `.astro`

Abre `src/pages/index.astro`. Un componente de Astro tiene **dos partes**:

```html
---
// 1. El "frontmatter": JavaScript que se ejecuta AL CONSTRUIR la página (no en el navegador)
const nombre = 'Ana'
const tecnologias = ['HTML', 'CSS', 'JavaScript', 'Astro']
const anio = new Date().getFullYear()
---

<!-- 2. La plantilla: HTML con expresiones entre llaves -->
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>El blog de {nombre}</title>
  </head>
  <body>
    <h1>Hola, soy {nombre} 👋</h1>
    <ul>
      {tecnologias.map((tecnologia) => <li>{tecnologia}</li>)}
    </ul>
    <footer>© {anio}</footer>
  </body>
</html>
```

- Entre las dos líneas **`---`** va **JavaScript**. Se ejecuta **una vez, al construir**, nunca en el navegador. Ahí puedes importar componentes, leer archivos o hacer `fetch` a una API.
- Debajo va la **plantilla**: HTML normal con **expresiones entre `{}`**, muy parecido al JSX de React. Para listas, `map`; para condiciones, `{condicion && <p>...</p>}`.
- El resultado es **HTML puro**: abre las DevTools y verás que la página no tiene ningún `<script>`.

### Estilos con alcance

```html
<h1>Hola</h1>

<style>
  h1 {
    color: #fbbf24;
    font-family: system-ui, sans-serif;
  }
</style>
```

Un `<style>` dentro de un componente **solo afecta a ese componente** (como el `scoped` de Vue). Ese `h1` amarillo no cambia los `h1` del resto de la web. Para estilos globales, usa `<style is:global>` o importa un archivo CSS.

## Paso 4: componentes con props y slots

Crea `src/components/Tarjeta.astro`:

```html
---
const { titulo, enlace, fecha } = Astro.props
---

<article class="tarjeta">
  <h2><a href={enlace}>{titulo}</a></h2>
  {fecha && <time datetime={fecha.toISOString()}>{fecha.toLocaleDateString('es-PE')}</time>}
  <slot />
</article>

<style>
  .tarjeta {
    padding: 1rem;
    border: 1px solid #3f3f46;
    border-radius: 12px;
  }
</style>
```

- **`Astro.props`** contiene las props que recibe el componente.
- **`<slot />`** es el hueco donde va el contenido que pongas dentro (como los slots de Vue o los Web Components, que tienen su propio post).

Y se usa importándolo en el frontmatter:

```html
---
import Tarjeta from '../components/Tarjeta.astro'
---

<Tarjeta titulo="Mi primer post" enlace="/blog/primer-post">
  <p>Un resumen corto del post.</p>
</Tarjeta>
```

## Paso 5: un layout para todas las páginas

Todas las páginas comparten el `<head>`, la cabecera y el pie. Crea `src/layouts/Base.astro`:

```html
---
const { titulo, descripcion = 'El blog donde aprendo en público' } = Astro.props
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titulo} · Mi blog</title>
    <meta name="description" content={descripcion} />
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Inicio</a>
        <a href="/blog">Blog</a>
        <a href="/sobre-mi">Sobre mí</a>
      </nav>
    </header>
    <main>
      <slot />
    </main>
    <footer>Hecho con Astro</footer>
  </body>
</html>

<style is:global>
  body {
    max-width: 720px;
    margin: 0 auto;
    padding: 1rem;
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }
  nav { display: flex; gap: 1rem; }
</style>
```

Ahora cada página solo necesita su contenido:

```html
---
import Base from '../layouts/Base.astro'
---

<Base titulo="Sobre mí" descripcion="Quién soy y qué estoy aprendiendo">
  <h1>Sobre mí</h1>
  <p>Soy desarrolladora frontend en formación. Me encanta el CSS.</p>
</Base>
```

Guárdala como `src/pages/sobre-mi.astro`.

## Paso 6: las rutas son archivos

En Astro, **la ruta de cada página es la ruta de su archivo** dentro de `src/pages`:

| Archivo | URL |
| --- | --- |
| `src/pages/index.astro` | `/` |
| `src/pages/sobre-mi.astro` | `/sobre-mi` |
| `src/pages/blog/index.astro` | `/blog` |
| `src/pages/blog/[slug].astro` | `/blog/cualquier-cosa` (ruta dinámica) |

Sin configurar ningún router. Los enlaces son `<a href>` normales.

## Paso 7: los posts, en Markdown

Escribir cada post como un componente sería incómodo. Lo cómodo es **Markdown**, y Astro lo gestiona con las **colecciones de contenido**: una carpeta de archivos con un **esquema** que valida sus datos.

Crea algunos posts en `src/content/blog/`, por ejemplo `primer-post.md`:

```markdown
---
titulo: 'Mi primer post con Astro'
descripcion: 'Por qué elegí Astro para mi blog'
fecha: 2026-11-27
etiquetas: ['astro', 'aprendizaje']
---

¡Hola! Este es mi **primer post**. Lo escribo en Markdown y Astro lo convierte en HTML.

## Lo que más me gusta

- Las páginas son HTML puro.
- Puedo usar React solo donde lo necesito.
```

Y define la colección en `src/content.config.ts` (o `.js`):

```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    fecha: z.coerce.date(),
    etiquetas: z.array(z.string()).default([]),
    borrador: z.boolean().default(false)
  })
})

export const collections = { blog }
```

¿Te suena? Es **Zod** (lo viste en la serie de TypeScript). Astro valida el frontmatter de cada post con ese esquema: si a un post le falta el título o la fecha está mal escrita, **el build falla con un mensaje claro**, en lugar de publicar una página rota. Y en el código tendrás autocompletado de cada campo.

> El código de este post está probado con **Astro 7**. La forma de definir las colecciones ha cambiado entre versiones (antes se hacía en `src/content/config.ts`, sin `loader`). Si sigues un tutorial antiguo, revisa la [guía de colecciones](https://docs.astro.build/es/guides/content-collections/) de tu versión.

## Paso 8: la lista de posts

`src/pages/blog/index.astro`:

```html
---
import { getCollection } from 'astro:content'
import Base from '../../layouts/Base.astro'
import Tarjeta from '../../components/Tarjeta.astro'

const posts = (await getCollection('blog', ({ data }) => !data.borrador))
  .sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf())
---

<Base titulo="Blog">
  <h1>Blog</h1>
  {posts.map((post) => (
    <Tarjeta titulo={post.data.titulo} enlace={`/blog/${post.id}`} fecha={post.data.fecha}>
      <p>{post.data.descripcion}</p>
    </Tarjeta>
  ))}
</Base>
```

- **`getCollection('blog', filtro)`** devuelve todos los posts (aquí, sin los borradores). Fíjate en el `await` directamente en el frontmatter: se ejecuta al construir.
- **`post.data`** es el frontmatter ya validado; **`post.id`** es el nombre del archivo sin extensión (`primer-post`).

## Paso 9: una página por post (rutas dinámicas)

`src/pages/blog/[slug].astro`. Los corchetes significan "una parte variable de la URL":

```html
---
import { getCollection, render } from 'astro:content'
import Base from '../../layouts/Base.astro'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post }
  }))
}

const { post } = Astro.props
const { Content } = await render(post)
---

<Base titulo={post.data.titulo} descripcion={post.data.descripcion}>
  <article>
    <h1>{post.data.titulo}</h1>
    <time datetime={post.data.fecha.toISOString()}>
      {post.data.fecha.toLocaleDateString('es-PE', { dateStyle: 'long' })}
    </time>
    <Content />
  </article>
</Base>
```

- **`getStaticPaths`** le dice a Astro **qué páginas crear**: una por post, con su `slug` en la URL. Al construir, Astro genera `/blog/primer-post/index.html` y uno más por cada post.
- **`render(post)`** convierte el Markdown en un componente, **`<Content />`**, que pintas donde quieras.

Ya tienes un blog completo: lista de posts, páginas individuales, layout y validación del contenido. Y **cero JavaScript** en el navegador.

## Paso 10: imágenes optimizadas

Guarda una imagen en `src/assets/portada.jpg` y usa el componente `Image`:

```html
---
import { Image } from 'astro:assets'
import portada from '../assets/portada.jpg'
---

<Image src={portada} alt="Mi escritorio con el portátil y un café" width={800} />
```

Al construir, Astro **convierte la imagen a WebP**, la **redimensiona** al tamaño que usas y añade `width`, `height`, `loading="lazy"` y `decoding="async"`. Todo lo que aprendiste a mano en el post de rendimiento de imágenes, automático.

## Paso 11: islas interactivas

Tu blog necesita un botón de "me gusta" con contador. Eso sí requiere JavaScript. Añade React (o Vue, o Svelte) con un comando:

```bash
npx astro add react
```

Instala lo necesario y configura `astro.config.mjs` solo. Crea un componente de React normal, `src/components/MeGusta.jsx`:

```jsx
import { useState } from 'react'

export default function MeGusta() {
  const [likes, setLikes] = useState(0)
  return <button onClick={() => setLikes(likes + 1)}>❤️ {likes}</button>
}
```

Y úsalo en el post **con una directiva `client:`**:

```html
---
import MeGusta from '../../components/MeGusta.jsx'
---

<Content />
<MeGusta client:visible />
```

La directiva decide **cuándo** se carga el JavaScript de esa isla:

| Directiva | Carga el JavaScript... | Para |
| --- | --- | --- |
| *(ninguna)* | **Nunca**: se pinta como HTML estático | Componentes sin interacción |
| `client:load` | Al cargar la página | Lo que debe funcionar desde el primer momento (un menú) |
| `client:idle` | Cuando el navegador está libre | Lo que no corre prisa (un chat) |
| `client:visible` | Cuando el componente **entra en pantalla** | Lo que está más abajo (comentarios, "me gusta") |
| `client:media="(max-width: 640px)"` | Solo si se cumple la media query | Un menú solo para móvil |

**Sin directiva, un componente de React se pinta como HTML y no funciona**: el botón aparecería, pero el clic no haría nada. Es el error más común al empezar con Astro.

Con `client:visible`, el JavaScript de React solo se descarga si el lector llega al final del post. Mira la pestaña Network: no se pide nada hasta que haces scroll.

## Paso 12: más integraciones

Las más útiles, todas con `npx astro add`:

```bash
npx astro add tailwind   # Tailwind CSS (tiene su propio post en esta serie)
npx astro add sitemap    # genera sitemap.xml automáticamente (necesita "site" en la config)
npx astro add mdx        # Markdown con componentes dentro
```

Para el sitemap y las URLs absolutas, indica tu dominio en `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://mi-blog.com',
  integrations: [sitemap()]
})
```

(Lo que hace el sitemap y por qué importa está en el post de `robots.txt` y `sitemap.xml`.)

### Transiciones entre páginas

Con un solo componente en el layout, la navegación entre páginas se vuelve suave, con animaciones, usando la View Transitions API (lo viste en su post de CSS):

```html
---
import { ClientRouter } from 'astro:transitions'
---

<head>
  <!-- ... -->
  <ClientRouter />
</head>
```

## Paso 13: publicarlo

```bash
npm run build     # genera la web en la carpeta dist/
npm run preview   # la sirve en local para comprobarla
```

La carpeta **`dist/`** es una web estática: HTML, CSS e imágenes. Puedes subirla a **cualquier sitio**: Netlify, Vercel, Cloudflare Pages, GitHub Pages (en el post de publicar tu web gratis) o un bucket de S3 (en la serie de DevOps). En Netlify y Vercel basta con conectar el repositorio: detectan Astro solos.

> ¿Necesitas páginas que se generen **en cada petición** (un área de usuario, datos en tiempo real)? Astro también puede hacerlo, con un **adaptador** para tu plataforma (`npx astro add vercel`, `netlify`, `node`...) y rutas renderizadas en el servidor. Para un blog, el modo estático es lo ideal.

## ¿Cuándo elegir Astro?

- ✅ **Blogs, portfolios, documentación, landings, webs de negocios**: contenido con algo de interacción.
- ✅ Cuando el **SEO y la velocidad** son prioritarios.
- ✅ Cuando quieres usar **componentes de varios frameworks** o pasar poco a poco de uno a otro.
- ❌ **Apps muy interactivas**, donde casi todo es estado y eventos (un editor, un dashboard en tiempo real, una red social): ahí encajan mejor React con Next.js, Vue con Nuxt o una SPA.

## Tu turno

1. Crea el blog del post con tres artículos en Markdown y comprueba en las DevTools que las páginas no cargan JavaScript.
2. Añade el campo `etiquetas` a la lista de posts y crea una página `src/pages/etiquetas/[etiqueta].astro` con `getStaticPaths` que liste los posts de cada etiqueta.
3. Rompe a propósito el frontmatter de un post (quita el título) y lee el error del build.
4. Añade una isla de React con `client:visible` y otra sin directiva. ¿Cuál funciona?
5. Publica tu blog en Netlify o Vercel y pasa la URL por [PageSpeed Insights](https://pagespeed.web.dev): compara la nota con una SPA.

## Errores comunes

- **Olvidar la directiva `client:`** en un componente interactivo: se ve, pero no funciona.
- **Usar `window` o `document` en el frontmatter**: se ejecuta al construir, en Node, donde no existen. Ese código va en un `<script>` del componente o en una isla.
- **Poner `client:load` en todo** "por si acaso": vuelves a enviar JavaScript innecesario y pierdes la ventaja de Astro.
- **Esperar que un `fetch` del frontmatter se actualice solo**: en modo estático, los datos se leen **al construir**. Para datos nuevos, vuelve a construir (o usa renderizado en el servidor).
- **Rutas dinámicas sin `getStaticPaths`** en modo estático: Astro no sabe qué páginas crear.
- **Seguir tutoriales de versiones antiguas** sin comprobar la versión, sobre todo con las colecciones de contenido.

## Para profundizar

- [Documentación oficial de Astro (en español)](https://docs.astro.build/es/getting-started/)
- [Tutorial oficial: crea tu primer blog con Astro (en español)](https://docs.astro.build/es/tutorial/0-introduction/)

En resumen: **Astro** genera **HTML puro sin JavaScript por defecto**, ideal para blogs, portfolios y webs de contenido. Un componente **`.astro`** tiene un **frontmatter** (JavaScript que se ejecuta al construir) y una **plantilla** con `{}`; las **rutas son archivos** en `src/pages`, los **layouts** comparten la estructura y las **colecciones de contenido** convierten tu Markdown en páginas validadas con **Zod**. Para la interactividad, **islas** de React o Vue con directivas como **`client:visible`**, y para publicarlo, **`npm run build`** y la carpeta `dist/` a cualquier hosting.
