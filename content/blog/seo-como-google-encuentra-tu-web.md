---
title: 'SEO desde cero: cómo Google encuentra, entiende y muestra tu web'
description: 'Qué es el SEO, las tres fases de un buscador (rastrear, indexar y posicionar) y las cosas que dependen de ti como desarrollador frontend: HTML semántico, títulos, velocidad y enlaces.'
date: 2026-11-26
series: html
tags: [HTML, SEO, Fundamentos]
draft: true
---

Publicas tu portafolio, lo buscas en Google con tu nombre... y no aparece. O aparece en la página 5. Es normal: que una web exista no significa que Google la conozca, ni que la muestre.

El **SEO** (*Search Engine Optimization*, optimización para buscadores) es el conjunto de cosas que haces para que los buscadores **encuentren** tu web, la **entiendan** y la **muestren** cuando alguien busca algo relacionado. Una parte es de marketing y contenido, pero otra muy grande es **técnica**, y esa es responsabilidad del desarrollador.

Este post abre una serie corta sobre SEO. Empezamos por entender cómo funciona un buscador.

## Las tres fases de un buscador

### 1. Rastrear (*crawling*)

Google tiene programas llamados **rastreadores** (*crawlers* o *bots*; el suyo se llama **Googlebot**) que recorren internet sin parar. Llegan a una página, la descargan, buscan **los enlaces** que contiene y los siguen para descubrir páginas nuevas.

Por eso los **enlaces** importan tanto: si ninguna página enlaza a la tuya, Googlebot tardará en encontrarla. Y por eso existe el **sitemap**, una lista de tus páginas que le das directamente (tiene su propio post).

### 2. Indexar (*indexing*)

Después de descargar una página, Google intenta **entenderla**: de qué trata, cuál es el título, qué texto contiene, qué imágenes tiene, en qué idioma está. Si le parece útil, la guarda en su **índice**: una base de datos gigantesca con cientos de miles de millones de páginas.

Aquí es donde **tu HTML** marca la diferencia. Google lee el código, no "ve" la página como tú.

### 3. Posicionar (*ranking*)

Cuando alguien busca "aprender css grid", Google mira en su índice todas las páginas que hablan de eso y las **ordena**: las más útiles y relevantes, arriba. Para ordenarlas tiene en cuenta cientos de señales: si el contenido responde a la búsqueda, si otras webs enlazan a esa página, si carga rápido, si se ve bien en el móvil...

Nadie conoce la fórmula exacta, y cambia a menudo. Pero lo básico lleva años siendo lo mismo.

## Lo que depende de ti (el SEO técnico)

### Un HTML que se entienda

Google lee tu HTML igual que un lector de pantalla. Lo que es bueno para la accesibilidad casi siempre es bueno para el SEO:

- **Un `<h1>` por página** con el tema principal, y los títulos en orden (lo vimos en el post de etiquetas de texto).
- **Etiquetas semánticas**: `<main>`, `<article>`, `<nav>`, `<header>` (post de HTML semántico).
- **Texto alternativo** en las imágenes, que es lo que Google "ve" de ellas.
- **Enlaces con texto descriptivo**: "Ver el curso de CSS Grid" le dice mucho más a Google que "haz clic aquí".

### El `<title>` y la `description`

Son lo que aparece en el resultado de Google:

```html
<title>Curso de CSS Grid desde cero | Mi Escuela</title>
<meta name="description" content="Aprende CSS Grid con 5 layouts reales: galerías, dashboards y landings. Con ejemplos para practicar en el navegador.">
```

- El **título**: único en cada página, con lo importante al principio y unos 50-60 caracteres (lo que no quepa, Google lo corta con "...").
- La **descripción**: un resumen de 120-160 caracteres que invite a hacer clic. Google no siempre la usa (a veces elige un trozo del texto), pero si es buena, suele respetarla.

Lo vimos en el post del `<head>` y las meta tags.

### Que se pueda leer sin JavaScript (o casi)

Si tu página es una aplicación de React que pinta todo con JavaScript, el HTML que descarga Googlebot está **casi vacío**. Google sabe ejecutar JavaScript, pero lo hace más tarde y no siempre bien. Las webs que envían el contenido **ya en el HTML** se indexan mejor y antes. Tiene su propio post: "SEO en apps de React".

### Que cargue rápido y se vea bien en el móvil

Google rastrea las webs **como si fuera un móvil** (*mobile-first indexing*). Si tu web no es responsive o tarda mucho, sale perjudicada. La velocidad se mide con las **Core Web Vitals**, que también tienen su post.

### Que tenga una sola dirección

Si tu misma página se puede abrir en `http://`, `https://`, con `www` y sin `www`, Google ve cuatro páginas iguales y no sabe cuál mostrar. Se arregla con **redirecciones** y la **URL canónica** (otro post de la serie).

### Que la conexión sea segura

Usa **HTTPS** (el candado del navegador). Los hostings gratuitos como Vercel, Netlify o GitHub Pages lo activan solos.

## Lo que no depende del código (pero importa más)

Ser técnicamente perfecto no sirve de mucho si el contenido no interesa. Lo que más pesa en el posicionamiento:

- **Contenido útil y original** que responda a lo que la gente busca.
- **Enlaces desde otras webs**: cada enlace es como un "voto de confianza". Comparte tus proyectos en LinkedIn, en tu GitHub, en comunidades.
- **Tiempo**: una web nueva tarda semanas en aparecer y meses en posicionarse.

## Mitos que todavía circulan

- **"Hay que repetir la palabra clave muchas veces."** Hace más de diez años que eso perjudica en vez de ayudar. Escribe para personas.
- **"La meta tag `keywords` sirve para el SEO."** Google la ignora desde 2009. No hace falta.
- **"Pagar a Google te sube en los resultados."** Los anuncios son aparte, y se marcan como "Patrocinado". Los resultados normales (orgánicos) no se pueden comprar.
- **"El SEO es un truco que se hace una vez."** Es la suma de hacer bien muchas cosas pequeñas, todo el tiempo.

## Cómo saber si Google conoce tu web

Busca en Google:

```bash
site:tudominio.com
```

Te muestra las páginas de tu web que Google tiene indexadas. Si no sale nada, todavía no te ha encontrado. La herramienta oficial para ver todo esto en detalle (y pedirle a Google que te rastree) es **Google Search Console**, que tiene su propio post.

## Los posts de esta serie

1. **Este**: cómo funciona un buscador.
2. Open Graph y Twitter Cards: cómo se ve tu enlace al compartirlo.
3. `robots.txt` y `sitemap.xml`: qué puede rastrear Google y qué páginas tienes.
4. URLs canónicas y redirecciones: una sola dirección para cada página.
5. Datos estructurados con JSON-LD: resultados enriquecidos.
6. Core Web Vitals: la velocidad que mide Google.
7. Google Search Console: dar de alta tu web y ver cómo te encuentran.
8. Webs en varios idiomas con `hreflang`.

## Errores comunes

- **El mismo `<title>` en todas las páginas.** Cada página necesita el suyo.
- **Contenido importante solo en imágenes.** Google no lee el texto de una imagen (o lo hace mal). Escríbelo en HTML.
- **Enlaces que no son enlaces**: un `<div onclick>` no lo sigue Googlebot. Usa `<a href>`.
- **Olvidar un `noindex`** que pusiste en pruebas: le dice a Google que no muestre la página.
- **Esperar resultados en dos días.** El SEO tarda semanas.

## Para profundizar

- [Guía de SEO para principiantes de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=es)
- [Cómo funciona la Búsqueda de Google](https://developers.google.com/search/docs/fundamentals/how-search-works?hl=es)

En resumen: un buscador **rastrea** (sigue enlaces), **indexa** (entiende y guarda tus páginas) y **posiciona** (las ordena en los resultados). Como desarrollador, tu parte es que el HTML sea **semántico**, que cada página tenga un **título y una descripción** únicos, que el contenido esté **en el HTML**, que cargue **rápido** en el móvil y que cada página tenga **una sola URL**. El resto es contenido útil y paciencia.
