---
title: 'Open Graph y Twitter Cards: cómo se ve tu enlace al compartirlo'
description: 'Las meta tags que deciden el título, el texto y la imagen de la tarjeta que aparece al compartir tu web en WhatsApp, LinkedIn o X. Tamaños, cómo probarlas y por qué no se actualizan.'
date: 2026-11-26
series: html
tags: [HTML, SEO, Open Graph]
draft: true
---

Compartes el enlace de tu proyecto en LinkedIn o en un grupo de WhatsApp y aparece... un texto azul feo, sin imagen. O una imagen cualquiera de la página, cortada. En cambio, otros enlaces aparecen como una **tarjeta** bonita con imagen grande, título y descripción.

Esa tarjeta la controlas tú, con unas meta tags en el `<head>`: **Open Graph** y **Twitter Cards**. En el post del `<head>` vimos las básicas; hoy vamos a fondo.

## ¿Qué es Open Graph?

**Open Graph** es un protocolo que creó Facebook para que cualquier web pueda decir **cómo quiere verse al compartirse**. Hoy lo leen casi todas las plataformas: WhatsApp, LinkedIn, Facebook, Telegram, Slack, Discord, X (Twitter)...

Cuando pegas un enlace, la plataforma descarga tu página, busca estas etiquetas en el `<head>` y monta la tarjeta con ellas.

## Las etiquetas imprescindibles

```html
<head>
  <title>Mi app de tareas | Ana Torres</title>
  <meta name="description" content="Una app de tareas con filtros, modo oscuro y guardado automático.">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Ana Torres">
  <meta property="og:title" content="Mi app de tareas">
  <meta property="og:description" content="Una app de tareas con filtros, modo oscuro y guardado automático.">
  <meta property="og:url" content="https://anatorres.dev/proyectos/tareas">
  <meta property="og:image" content="https://anatorres.dev/og/tareas.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Captura de la app de tareas en modo oscuro">
  <meta property="og:locale" content="es_PE">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
</head>
```

| Etiqueta | Para qué |
| --- | --- |
| `og:title` | El título de la tarjeta. Puede ser más corto que el `<title>` (sin el nombre del sitio) |
| `og:description` | El texto de debajo. Una o dos frases |
| `og:image` | La imagen. **La más importante**: es lo que hace que alguien se fije |
| `og:url` | La URL "oficial" de la página (la canónica) |
| `og:type` | `website` para páginas normales, `article` para posts de un blog |
| `og:site_name` | El nombre de tu web |
| `og:image:width` / `height` | El tamaño: ayuda a que la tarjeta se pinte bien a la primera |
| `og:image:alt` | La descripción de la imagen, para lectores de pantalla |
| `og:locale` | El idioma: `es_PE`, `es_ES`, `en_US`... (con guion bajo) |

Fíjate en que Open Graph usa **`property`**, y no `name` como las meta normales.

## La imagen: lo que más importa

- **Tamaño recomendado: 1200 × 630 píxeles** (proporción 1,91:1). Es el que funciona bien en todas las plataformas.
- **URL absoluta**: tiene que empezar por `https://`. Una ruta como `/og.png` **no funciona**, porque la plataforma no sabe de qué web es.
- **Formato**: PNG o JPG. Algunas plataformas no muestran WebP ni SVG en las tarjetas.
- **Peso**: menos de 1 MB, mejor alrededor de 300 KB. Si pesa mucho, WhatsApp no la muestra.
- **Lo importante, en el centro**: algunas plataformas recortan los bordes o la muestran cuadrada. Deja márgenes amplios y no pongas texto pegado a los lados.
- **Texto grande y legible**: muchas veces se ve en un móvil, pequeña.

Puedes diseñarla en Figma o Canva con una plantilla de 1200 × 630. Si tienes muchas páginas (un blog con 100 posts), lo ideal es **generarlas automáticamente**, como verás en el post de imágenes para compartir con Next.js.

## Twitter Cards (X)

X lee las etiquetas de Open Graph, pero tiene una suya obligatoria: el **tipo de tarjeta**.

```html
<!-- Imagen grande (la que quieres casi siempre) -->
<meta name="twitter:card" content="summary_large_image">

<!-- O imagen pequeña cuadrada a un lado -->
<meta name="twitter:card" content="summary">
```

Si quieres textos distintos para X, existen `twitter:title`, `twitter:description` y `twitter:image`; si no las pones, usa las de Open Graph.

## Para un post de blog

```html
<meta property="og:type" content="article">
<meta property="article:published_time" content="2026-11-26">
<meta property="article:author" content="https://anatorres.dev">
```

## Un ejemplo real: este blog

Este mismo blog genera sus etiquetas desde un componente de React (`Seo.jsx`). Para cada página pone el título, la descripción, la URL canónica, el idioma y una imagen de 1200 × 630 generada al vuelo con el título del post. Si compartes este artículo, verás su tarjeta con su propio título. Y como el componente lo hace igual en todas las páginas, es imposible olvidarse de alguna etiqueta.

Esa es la idea a la que conviene llegar: **un solo sitio en tu código** que genere todas las etiquetas a partir de unos pocos datos (título, descripción, imagen).

## Cómo probar tus tarjetas

No compartas el enlace en un grupo para ver si funciona. Usa los validadores:

- **[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)**: muestra la tarjeta de LinkedIn y **refresca su caché**.
- **[Depurador de Facebook](https://developers.facebook.com/tools/debug/)**: lo mismo para Facebook (y le sirve a WhatsApp).
- **[opengraph.xyz](https://www.opengraph.xyz)**: una vista previa de cómo se ve en varias plataformas a la vez.

Todos te avisan si falta alguna etiqueta o si la imagen no carga.

> Para probar, tu web tiene que estar **publicada**: las plataformas no pueden ver tu `localhost`.

## "Cambié la imagen y sigue saliendo la vieja"

Es el problema más típico. Las plataformas **guardan en caché** la tarjeta de cada URL durante días. Para forzar que se actualice:

1. Pasa la URL por el **LinkedIn Post Inspector** y el **depurador de Facebook**: los dos vuelven a descargarla.
2. **Cambia el nombre de la imagen** (`og-v2.png`) o añádele un parámetro (`og.png?v=2`). Como es otra URL, se descarga de nuevo.
3. Para WhatsApp no hay herramienta: suele bastar con el truco anterior o esperar.

## Errores comunes

- **`og:image` con una ruta relativa** (`/img/og.png`). Tiene que ser una URL completa con `https://`.
- **Usar `name` en vez de `property`** en las etiquetas `og:`.
- **Imágenes enormes** (varios MB) o en formatos que no todas las plataformas muestran.
- **La misma tarjeta para todas las páginas.** Cada página importante debería tener su título, su descripción y, si puede ser, su imagen.
- **Ponerlas con JavaScript en una SPA.** La mayoría de plataformas **no ejecutan JavaScript**: solo leen el HTML que envía el servidor. Si tus etiquetas se añaden con JavaScript, no las verán (lo explicamos en el post de SEO en apps de React).
- **Probar en un grupo de WhatsApp** en vez de en los validadores, y quedarte con la caché de una versión rota.

## Para profundizar

- [El protocolo Open Graph (en inglés)](https://ogp.me/)
- [Twitter Cards (documentación de X, en inglés)](https://developer.x.com/en/docs/x-for-websites/cards/overview/abouts-cards)

En resumen: las etiquetas **`og:title`**, **`og:description`**, **`og:image`** y **`og:url`** deciden cómo se ve tu enlace en WhatsApp, LinkedIn y compañía, y **`twitter:card`** con `summary_large_image` hace lo mismo en X. Usa una imagen de **1200 × 630** con **URL absoluta**, pruébalo con los **validadores** y, si cambias la imagen, **cambia también su URL** para saltarte la caché.
