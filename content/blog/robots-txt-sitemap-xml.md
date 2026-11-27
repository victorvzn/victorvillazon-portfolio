---
title: 'robots.txt y sitemap.xml: dile a Google qué rastrear y qué páginas tienes'
description: 'Qué es el robots.txt, cómo se escriben sus reglas y en qué se diferencia de noindex. Qué es un sitemap, cómo crearlo a mano o generarlo y cómo avisar a Google.'
date: 2026-11-26
series: html
tags: [SEO, HTML, Herramientas]
draft: true
---

En el post de cómo funciona Google vimos que los buscadores **rastrean** la web siguiendo enlaces. Hay dos archivos que te ayudan a guiar ese rastreo:

- **`robots.txt`**: le dice a los bots **qué partes de tu web pueden visitar**.
- **`sitemap.xml`**: les da **la lista de páginas** que quieres que conozcan.

Los dos son archivos de texto que viven en la **raíz** de tu dominio, y los dos tienen nombres fijos.

## `robots.txt`: las normas de la casa

Cuando un bot llega a tu web, lo primero que hace es pedir `https://tudominio.com/robots.txt` y leer las normas. Un ejemplo real, el de este blog:

```bash
User-agent: *
Allow: /
Disallow: /api/
Allow: /api/og

Sitemap: https://www.victorvillazon.com/sitemap.xml
```

Línea por línea:

- **`User-agent: *`**: estas normas son para **todos** los bots (`*` significa "cualquiera"). Podrías poner normas solo para uno, por ejemplo `User-agent: Googlebot`.
- **`Allow: /`**: pueden rastrear todo...
- **`Disallow: /api/`**: ...menos lo que empieza por `/api/` (las rutas de la API no son páginas para personas).
- **`Allow: /api/og`**: excepto `/api/og`, que genera las imágenes para compartir en redes. Cuando dos reglas chocan, gana **la más específica** (la más larga).
- **`Sitemap: ...`**: dónde está el sitemap.

### Dónde ponerlo

En la **raíz** del sitio: tiene que responder en `tudominio.com/robots.txt`, no en `tudominio.com/blog/robots.txt`. En la mayoría de proyectos (Vite, Next.js...) basta con dejarlo en la carpeta **`public`**.

### Reglas que te vas a encontrar

```bash
# No rastrear nada (típico en una web de pruebas)
User-agent: *
Disallow: /

# Rastrear todo
User-agent: *
Disallow:

# No rastrear una carpeta ni los PDF
User-agent: *
Disallow: /privado/
Disallow: /*.pdf$
```

`*` dentro de una ruta significa "cualquier cosa" y `$` "termina aquí".

## ⚠️ robots.txt no esconde nada

Dos malentendidos muy peligrosos:

1. **No es seguridad.** `robots.txt` es una **petición amable**. Los buscadores serios la respetan, pero un bot malicioso puede ignorarla. Y el archivo es **público**: si escribes `Disallow: /panel-secreto/`, le estás diciendo a todo el mundo dónde está tu panel secreto. Lo privado se protege con contraseña, no con `robots.txt`.
2. **No saca páginas de Google.** `Disallow` impide **rastrear** la página, pero Google puede **indexarla igualmente** si otras webs la enlazan (aparecerá sin descripción). Para que una página **no aparezca** en los resultados, se usa `noindex`.

## `noindex`: "no me muestres en los resultados"

```html
<meta name="robots" content="noindex">
```

Esta meta tag en el `<head>` le dice a Google: "puedes leer esta página, pero **no la muestres** en los resultados". Úsala en páginas que no aportan nada en una búsqueda: un "gracias por tu compra", resultados de búsquedas internas, páginas de pruebas.

**La trampa:** para que Google vea el `noindex`, **tiene que poder rastrear la página**. Si además la bloqueas en `robots.txt`, nunca leerá el `noindex`. Para sacar una página de Google: `noindex` **sin** bloquearla en `robots.txt`.

| Quiero que Google... | Uso |
| --- | --- |
| No gaste tiempo en una sección (la API, filtros infinitos) | `Disallow` en `robots.txt` |
| No muestre una página en los resultados | `<meta name="robots" content="noindex">` |
| No vea algo privado | Contraseña / inicio de sesión |

## `sitemap.xml`: el índice de tu web

Un **sitemap** es una lista de las URL de tu web en un formato que entienden los buscadores (XML). Es especialmente útil si tu web es **nueva** (nadie la enlaza todavía), **grande** o tiene páginas a las que se llega con pocos enlaces.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://anatorres.dev/</loc>
    <lastmod>2026-11-20</lastmod>
  </url>
  <url>
    <loc>https://anatorres.dev/proyectos/tareas</loc>
    <lastmod>2026-11-26</lastmod>
  </url>
  <url>
    <loc>https://anatorres.dev/contacto</loc>
  </url>
</urlset>
```

- **`<loc>`**: la URL completa, con `https://`. Pon la versión **definitiva** (la canónica): si tu web redirige a `www`, usa las URL con `www`.
- **`<lastmod>`**: la fecha del último cambio importante, en formato `AAAA-MM-DD`. Es opcional, pero ayuda a Google a saber qué volver a rastrear. **Pon fechas reales**: si cambias todas cada día sin motivo, Google deja de fiarse.

Verás también etiquetas `<priority>` y `<changefreq>` en tutoriales: Google las **ignora**, así que no hace falta ponerlas.

En el sitemap van **solo las páginas que quieres en Google**: nada de páginas con `noindex`, redirecciones o errores 404.

### Generarlo automáticamente

Escribirlo a mano está bien para una web de cinco páginas. Para un blog que crece cada semana, se **genera con código**. Este blog, por ejemplo, tiene una ruta `/sitemap.xml` que lee la lista de posts publicados y monta el XML en cada petición: cuando se publica un post nuevo, aparece solo en el sitemap, con su fecha.

Los frameworks lo ponen fácil:

- **Next.js** (App Router): un archivo `app/sitemap.js` que devuelve un array de URL.
- **Astro**: la integración `@astrojs/sitemap`.
- **WordPress** y otros gestores lo generan solos.

## Avisar a Google

Tres formas, de menos a más directa:

1. La línea **`Sitemap:`** en tu `robots.txt` (Google la lee).
2. Enlaces desde otras webs a la tuya.
3. **Google Search Console** → **Sitemaps** → pegas la URL del sitemap. Ahí además ves cuántas páginas ha leído y si hubo errores (tiene su propio post).

## Tu turno

1. Crea un `robots.txt` para tu portafolio que permita rastrear todo y apunte a tu sitemap.
2. Crea un `sitemap.xml` con todas sus páginas (la principal y la de cada proyecto).
3. Publícalo y comprueba que se abren en `tudominio.com/robots.txt` y `tudominio.com/sitemap.xml`.
4. Valida el XML con un validador de sitemaps (busca "sitemap validator").

## Errores comunes

- **Dejar `Disallow: /` de la versión de pruebas** al publicar. Tu web desaparece de Google. Es más habitual de lo que parece.
- **Usar `robots.txt` para esconder cosas privadas.** Es público y no protege nada.
- **Bloquear en `robots.txt` una página con `noindex`.** Google no podrá leer el `noindex`.
- **Bloquear los archivos CSS o JS.** Google los necesita para ver la página como un usuario.
- **URL relativas en el sitemap** (`/contacto`). Tienen que ser completas.
- **Meter en el sitemap páginas que redirigen** o que dan error.

## Para profundizar

- [Introducción a robots.txt (Google)](https://developers.google.com/search/docs/crawling-indexing/robots/intro?hl=es)
- [Cómo crear y enviar un sitemap (Google)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=es)
- [La meta tag robots y noindex (Google)](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=es)

En resumen: **`robots.txt`** (en la raíz) dice qué pueden **rastrear** los bots, pero **no esconde nada** ni saca páginas de Google; para eso está **`noindex`**. **`sitemap.xml`** es la **lista de URL** que quieres que Google conozca, con su `lastmod`. Genéralo automáticamente si tu web crece, enlázalo desde el `robots.txt` y envíalo en Search Console.
