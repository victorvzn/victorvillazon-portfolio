---
title: 'SEO en apps de React: por qué una SPA le cuesta a Google y cómo arreglarlo'
description: 'La diferencia entre renderizar en el navegador (CSR), en el servidor (SSR) y al construir (SSG), qué ve Google y las redes sociales en cada caso y qué elegir para tu proyecto.'
date: 2026-11-26
series: frameworks
tags: [React, Next.js, SEO, Rendimiento]
draft: true
---

Has hecho tu portafolio con React y Vite. Funciona genial. Pero lo compartes en LinkedIn y la tarjeta sale vacía, y Google tarda semanas en mostrar tus proyectos. Abres el código fuente de tu página (`Ctrl + U`) y descubres por qué:

```html
<!doctype html>
<html lang="es">
  <head>
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index-a1b2c3.js"></script>
  </body>
</html>
```

**No hay nada.** Ni tu nombre, ni tus proyectos, ni tu descripción. Todo el contenido lo pinta JavaScript **después**, en el navegador. Hoy vamos a ver por qué eso es un problema para el SEO y qué alternativas hay.

## Las tres formas de renderizar

"Renderizar" es convertir tus componentes en el HTML que se ve. La gran pregunta es **dónde y cuándo** se hace.

### CSR: en el navegador (*Client-Side Rendering*)

Es lo que hace una app de React con Vite (una **SPA**, *Single Page Application*):

1. El servidor envía un HTML **vacío** y un archivo de JavaScript.
2. El navegador descarga el JavaScript, lo ejecuta y **pinta** la página.
3. Si hay datos, hace los `fetch` y vuelve a pintar.

**Ventajas:** muy sencilla de publicar (son archivos estáticos) y muy fluida una vez cargada.
**Inconvenientes:** hasta que el JavaScript termina, **no hay contenido**. Y eso afecta a tres cosas.

### SSR: en el servidor, en cada visita (*Server-Side Rendering*)

1. El servidor ejecuta tus componentes **en cada petición**, con sus datos.
2. Envía el HTML **ya completo**.
3. En el navegador, React "**hidrata**" la página: conecta los eventos para que los botones funcionen.

**Ventajas:** el contenido llega en el HTML, siempre actualizado.
**Inconvenientes:** necesitas un servidor que trabaje en cada visita.

### SSG: al construir la web (*Static Site Generation*)

1. Al hacer `npm run build`, se genera el HTML completo **de cada página una sola vez**.
2. Esos archivos se sirven tal cual, rapidísimo.

**Ventajas:** lo mejor de los dos mundos: contenido en el HTML y archivos estáticos baratos de servir.
**Inconvenientes:** si los datos cambian, hay que volver a construir (o usar técnicas para regenerar páginas sueltas).

Así funcionan los posts de este blog: se generan al construir el sitio, y por eso el HTML de cada artículo ya trae todo el texto.

## Qué ve cada uno

| | CSR (React + Vite) | SSR / SSG (Next.js, Astro...) |
| --- | --- | --- |
| **Googlebot** | Al principio, un HTML vacío. Ejecuta el JavaScript **más tarde**, en una segunda fase, y a veces falla | El contenido completo, a la primera |
| **Redes sociales** (WhatsApp, LinkedIn, X) | **Nada**: no ejecutan JavaScript. Tarjeta sin título ni imagen, o con los de la página genérica | La tarjeta correcta de cada página |
| **El usuario** | Pantalla en blanco o un "Cargando..." hasta que llega el JavaScript | Ve el contenido enseguida (mejor **LCP**) |

El punto de las **redes sociales** es el que más sorprende: aunque Google acabe indexando tu SPA, LinkedIn y WhatsApp **nunca** verán las meta tags que añadas con JavaScript. Para ellos, todas tus páginas son la misma página vacía.

## ¿Google no ejecuta JavaScript?

Sí lo hace, pero:

- **En dos fases**: primero lee el HTML; el renderizado con JavaScript va a una **cola** y puede tardar horas o días.
- **Con límites**: si tu JavaScript tarda mucho, falla, o depende de algo que el bot no tiene (un clic, un inicio de sesión), esa parte no se ve.
- **Los otros buscadores** (Bing, DuckDuckGo) y casi todos los demás bots lo hacen peor o no lo hacen.

Conclusión: confiar en que "Google ya lo ejecutará" funciona a medias. Si el contenido importa para el SEO, **ponlo en el HTML**.

## Entonces, ¿qué uso?

| Tipo de proyecto | Recomendación |
| --- | --- |
| Portafolio, blog, landing, web de un negocio, tienda | **SSG o SSR**: Next.js, Astro o similar. El SEO importa |
| Panel de administración, app interna, algo detrás de un login | **CSR** con Vite está perfecto: Google no tiene que verlo |
| Un juego, una herramienta interactiva | CSR, con una página de presentación estática si quieres que se encuentre |

Para el SEO, el factor decisivo es: **¿la página tiene que aparecer en Google o verse bien al compartirla?** Si sí, renderiza en el servidor (o al construir).

## Si ya tienes una SPA y no quieres migrar

Algunas mejoras con poco esfuerzo:

1. **Pon lo básico en el `index.html`**: un `<title>`, una `description` y las etiquetas de **Open Graph** de tu web escritas a mano. Al menos la portada se compartirá bien.
2. **Usa rutas de verdad** (`/proyectos/tareas`), no rutas con almohadilla (`/#/proyectos`): Google ignora lo que va detrás de `#`.
3. **Enlaces con `<a href>`**: el `<Link>` de React Router los genera; un `onClick` con `navigate()` en un `<div>`, no.
4. **Comprueba qué ve Google** con la Inspección de URLs de Search Console ("Probar URL publicada"): te enseña el HTML después de ejecutar el JavaScript.
5. **Prerrenderizado**: algunas herramientas de Vite generan el HTML estático de tus rutas al construir. Es un paso intermedio hacia SSG.

Y si el proyecto va a crecer, migrar a **Next.js** (tiene su post) suele ser lo más sencillo: es React, solo cambia dónde se ejecuta.

## Cómo comprobar lo que envía tu servidor

- **`Ctrl + U`** (ver código fuente): muestra el HTML **tal como llegó del servidor**, sin JavaScript. Si tu contenido no está ahí, los bots que no ejecutan JavaScript no lo ven.
- **Desactiva JavaScript** en las DevTools (`Ctrl + Shift + P` → "Disable JavaScript") y recarga: lo que quede es lo que ve un bot "básico".

Ojo: la pestaña **Elements** de las DevTools muestra el DOM **después** de ejecutar JavaScript, así que ahí siempre verás el contenido. Para esto, usa `Ctrl + U`.

## Tu turno

1. Abre tu portafolio y pulsa `Ctrl + U`. ¿Aparecen tu nombre y tus proyectos en el HTML?
2. Desactiva JavaScript y recarga. ¿Qué queda?
3. Pásalo por el **LinkedIn Post Inspector**: ¿sale tu título y tu imagen?
4. Si es una SPA, añade al `index.html` el título, la descripción y las etiquetas de Open Graph.

## Errores comunes

- **Pensar que "Google ya ejecuta JavaScript"** y no comprobarlo.
- **Añadir las meta tags de Open Graph con JavaScript** en una SPA. Las redes sociales no las verán.
- **Rutas con `#`** en webs que necesitan SEO.
- **Usar un framework de servidor para todo**, también para un panel privado que no necesita SEO. Elige según el proyecto.
- **Mirar la pestaña Elements** para comprobar el SEO, en vez del código fuente.

## Para profundizar

- [Conceptos básicos de JavaScript SEO (Google)](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=es)
- [Renderizado en la web (web.dev, en inglés)](https://web.dev/articles/rendering-on-the-web)

En resumen: una **SPA** (React con Vite) envía un HTML **vacío** y pinta todo con JavaScript: Google lo indexa **tarde y a medias**, y las **redes sociales no ven nada**. Con **SSR** (en cada visita) o **SSG** (al construir), el HTML llega **completo**. Para webs públicas que deben aparecer en Google y compartirse bien, usa un framework como **Next.js** o **Astro**; para apps privadas, una SPA está perfecta. Y compruébalo siempre con **`Ctrl + U`**.
