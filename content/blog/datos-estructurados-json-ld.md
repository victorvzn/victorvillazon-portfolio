---
title: 'Datos estructurados con JSON-LD: resultados enriquecidos en Google'
description: 'Cómo explicarle a Google con un bloque de JSON que tu página es un artículo, una receta, un producto o una persona, para optar a resultados con estrellas, fechas e imágenes.'
date: 2026-11-26
series: html
tags: [SEO, HTML, JSON]
draft: true
---

Busca una receta en Google: algunos resultados muestran **estrellas, el tiempo de preparación y una foto**. Busca un producto: aparecen el **precio** y si hay **stock**. Busca una noticia: la **fecha** y el medio. A esos resultados se les llama **resultados enriquecidos** (*rich results*), y destacan muchísimo más que un enlace azul.

Para optar a ellos, tu página tiene que explicarle a Google **qué es** con **datos estructurados**. La forma recomendada se llama **JSON-LD**.

## El problema: Google lee, pero no siempre entiende

En tu HTML pone "4,8 ★ (230 opiniones)" y "S/ 49,90". Tú sabes que es una valoración y un precio. Google ve texto, y tiene que adivinar. Con los datos estructurados se lo dices **explícitamente**, en un formato que una máquina entiende sin dudas.

## JSON-LD: un bloque de JSON en el `<head>`

**JSON-LD** (*JSON for Linked Data*) es un bloque de **JSON** (el mismo formato de las APIs) dentro de una etiqueta `<script>` especial. No se ve en la página: es solo para los buscadores.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Aprende CSS Grid con 5 layouts reales",
  "datePublished": "2026-11-26",
  "author": {
    "@type": "Person",
    "name": "Ana Torres",
    "url": "https://anatorres.dev"
  },
  "image": "https://anatorres.dev/og/css-grid.png"
}
</script>
```

- **`"@context": "https://schema.org"`**: el "diccionario" que usamos. **Schema.org** es un vocabulario compartido por Google, Bing y otros buscadores, con cientos de tipos (`Article`, `Product`, `Recipe`, `Person`, `Event`...) y sus propiedades.
- **`"@type"`**: qué es la cosa que describes.
- El resto, sus **propiedades**: cada tipo tiene las suyas, y Schema.org las documenta todas.
- Fíjate en que los objetos se pueden **anidar**: el autor es otro objeto de tipo `Person`.

Al ser un `<script>` con otro `type`, el navegador **no lo ejecuta**: solo lo guarda en la página para quien quiera leerlo.

## Los tipos más útiles

### Una persona (tu portafolio)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ana Torres",
  "jobTitle": "Desarrolladora frontend",
  "url": "https://anatorres.dev",
  "image": "https://anatorres.dev/ana.jpg",
  "sameAs": [
    "https://www.linkedin.com/in/anatorres",
    "https://github.com/anatorres"
  ]
}
</script>
```

`sameAs` enlaza tus perfiles: le ayuda a Google a entender que todos son **la misma persona**. Es justo lo que hace la portada de este blog con los datos de su autor.

### Un artículo de blog

El ejemplo de arriba. Añade `dateModified` si lo actualizas. Este blog, en su índice, declara un `Blog` con la lista de sus posts publicados (`blogPost`), cada uno como `BlogPosting` con su título, URL y fecha.

### Un producto

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Auriculares inalámbricos Pro",
  "image": "https://mitienda.com/img/auriculares.jpg",
  "offers": {
    "@type": "Offer",
    "price": "249.00",
    "priceCurrency": "PEN",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "230"
  }
}
```

### Preguntas frecuentes, migas de pan, eventos...

Hay tipos para casi todo: `BreadcrumbList` (las "migas de pan" del tipo Inicio › Blog › CSS), `Event`, `Recipe`, `Course`, `JobPosting`, `LocalBusiness` (un negocio con dirección y horario)... Google mantiene una [galería con los que puede mostrar](https://developers.google.com/search/docs/appearance/structured-data/search-gallery?hl=es) y qué propiedades necesita cada uno.

## La regla de oro: solo lo que se ve

Los datos estructurados tienen que **describir lo que hay en la página**. Si dices que tu producto tiene 4,8 estrellas, esa valoración tiene que **aparecer en la página** y ser real. Inventar datos (estrellas falsas, ofertas que no existen) va contra las normas de Google y puede hacer que **penalice** tu web.

## Generarlo desde JavaScript

Escribir JSON a mano dentro del HTML es incómodo y es fácil romperlo con una coma. Lo habitual es **construir un objeto** de JavaScript y convertirlo con `JSON.stringify`:

```js
const datos = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.titulo,
  datePublished: post.fecha,
  author: { '@type': 'Person', name: 'Ana Torres' }
}

const script = `<script type="application/ld+json">${JSON.stringify(datos).replace(/</g, '\\u003c')}</script>`
```

¿Y ese `.replace(/</g, '\\u003c')`? Si el título de un post contuviera `</script>`, cerraría la etiqueta antes de tiempo y rompería la página (o abriría la puerta a un ataque XSS, como vimos en el post de crear elementos). Cambiar `<` por su código `\u003c` hace que el JSON siga siendo válido pero nunca pueda cerrar el `<script>`. El componente que genera el SEO de este blog hace exactamente eso.

En **React** o **Next.js**, se suele pintar con `dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}` dentro de un `<script type="application/ld+json">`, aplicando el mismo `replace`.

## Cómo comprobarlo

1. **[Prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results)**: pega tu URL (o tu código) y te dice qué tipos detecta, si son válidos y si pueden mostrarse como resultado enriquecido.
2. **[Validador de Schema.org](https://validator.schema.org)**: comprueba que el JSON-LD es correcto según el vocabulario, aunque Google no use ese tipo.
3. En **Google Search Console** (tiene su post), la sección **Mejoras** te avisa de errores en los datos estructurados de toda tu web.

> Que tus datos sean válidos **no garantiza** que Google muestre el resultado enriquecido: él decide cuándo mostrarlo. Pero sin datos, no hay ninguna opción.

## Tu turno

1. Añade a la página principal de tu portafolio un JSON-LD de tipo `Person` con tu nombre, tu puesto, tu web y tus perfiles en `sameAs`.
2. Pásalo por el validador de Schema.org y corrige los avisos.
3. Si tienes un blog o una página de proyecto, añade un `Article` con su título, fecha y autor.

## Errores comunes

- **JSON mal escrito**: comas al final, comillas simples, comentarios. JSON es estricto. Genéralo con `JSON.stringify`.
- **Datos que no están en la página** o que no son reales. Va contra las normas.
- **Olvidar `@context`** o escribir mal el `@type` (con mayúsculas: `Article`, no `article`).
- **URL relativas** en `url` o `image`. Usa URL completas.
- **Meter texto del usuario sin escapar `<`** dentro del `<script>`.
- **Esperar estrellas en los resultados al día siguiente.** Google tarda y decide cuándo mostrarlas.

## Para profundizar

- [Introducción a los datos estructurados (Google)](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=es)
- [Schema.org: todos los tipos (en inglés)](https://schema.org/docs/full.html)

En resumen: los **datos estructurados** le explican a Google **qué es** tu página. Se escriben en **JSON-LD**, un bloque `<script type="application/ld+json">` con el vocabulario de **Schema.org** (`Person`, `Article`, `Product`...). Describe **solo lo que se ve** en la página, genéralo con `JSON.stringify` escapando `<` y compruébalo con la **Prueba de resultados enriquecidos**.
