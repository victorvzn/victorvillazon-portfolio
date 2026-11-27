---
title: 'Mini proyecto: haz una auditoría SEO de tu portafolio'
description: 'Un ejercicio práctico para repasar toda la serie de SEO: una checklist de 25 puntos para revisar tu propia web, las herramientas para comprobar cada uno y una plantilla para apuntar lo que arreglas.'
date: 2026-11-26
series: ejercicios
tags: [SEO, HTML, Proyectos, Herramientas]
draft: true
---

Leer sobre SEO está bien. Aplicarlo a **tu propia web** es lo que de verdad enseña. En este mini proyecto vas a hacer una **auditoría**: revisar tu portafolio punto por punto, como lo haría un profesional, apuntar lo que falla y arreglarlo.

Además, es un ejercicio buenísimo para una entrevista: "Hice una auditoría SEO de mi web, encontré estos problemas y así los arreglé" demuestra que sabes ir más allá de "que se vea bien".

Tiempo recomendado: **2 horas** (revisar y arreglar).

## Antes de empezar

- Tu web tiene que estar **publicada** (muchas herramientas no pueden ver tu `localhost`). Si no lo está, tienes un post sobre cómo publicarla gratis.
- Abre un documento o un archivo `AUDITORIA.md` en tu repositorio para ir apuntando.
- Ten a mano: las **DevTools** de Chrome, **`Ctrl + U`** (ver el código fuente) y una ventana de incógnito.

## El enunciado

> Revisa los 25 puntos de esta checklist en tu portafolio. Para cada uno, apunta:
>
> - ✅ si está bien, ❌ si falla o ⚠️ si es mejorable.
> - Qué herramienta usaste para comprobarlo.
> - Si falla, cómo lo arreglaste.
>
> Al terminar, vuelve a pasar **Lighthouse** y compara la puntuación de antes y de después.

## La checklist

### 1. Lo básico de cada página

| # | Comprueba | Cómo |
| --- | --- | --- |
| 1 | Cada página tiene un **`<title>` único** y descriptivo (50-60 caracteres) | `Ctrl + U` en cada página |
| 2 | Cada página tiene una **`meta description`** única (120-160 caracteres) | `Ctrl + U` |
| 3 | El `<html>` tiene **`lang`** con el idioma correcto | `Ctrl + U` |
| 4 | Está la meta **`viewport`** | `Ctrl + U` |
| 5 | Hay **un solo `<h1>`** por página y los títulos no se saltan niveles | DevTools, o la extensión "HeadingsMap" |

### 2. El contenido

| # | Comprueba | Cómo |
| --- | --- | --- |
| 6 | El contenido importante **está en el HTML** (no solo lo pinta JavaScript) | `Ctrl + U` y desactivar JavaScript |
| 7 | **Todas las imágenes tienen `alt`** (vacío si son decorativas) | Lighthouse → Accesibilidad |
| 8 | Los **enlaces tienen texto descriptivo** (nada de "clic aquí") | Leer los enlaces de la página |
| 9 | Los enlaces internos son **`<a href>`** de verdad | DevTools |
| 10 | No hay **enlaces rotos** (404) | Hacer clic en todos, o un comprobador de enlaces en línea |

### 3. Compartir en redes

| # | Comprueba | Cómo |
| --- | --- | --- |
| 11 | Están **`og:title`**, **`og:description`**, **`og:image`** y **`og:url`** | `Ctrl + U` |
| 12 | La imagen mide **1200 × 630** y su URL es **absoluta** | Abrir la URL de la imagen |
| 13 | Está **`twitter:card`** con `summary_large_image` | `Ctrl + U` |
| 14 | La tarjeta **se ve bien** al compartir | [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) y [opengraph.xyz](https://www.opengraph.xyz) |

### 4. Rastreo e indexación

| # | Comprueba | Cómo |
| --- | --- | --- |
| 15 | Existe **`/robots.txt`** y **no bloquea** tu web por error | Abrir `tudominio.com/robots.txt` |
| 16 | Existe **`/sitemap.xml`** con todas tus páginas, con URL absolutas | Abrirlo en el navegador |
| 17 | Ninguna página que quieres en Google tiene **`noindex`** | `Ctrl + U` y buscar "noindex" |
| 18 | Tu web está **dada de alta en Search Console** y el sitemap enviado | Search Console |
| 19 | Google tiene tus páginas **indexadas** | Buscar `site:tudominio.com` en Google |

### 5. Una sola dirección

| # | Comprueba | Cómo |
| --- | --- | --- |
| 20 | `http` → `https` y con/sin `www` acaban **en la misma URL** con una redirección permanente | DevTools → Network |
| 21 | Cada página tiene una **canónica absoluta** que apunta a sí misma | `Ctrl + U` |

### 6. Velocidad y experiencia

| # | Comprueba | Cómo |
| --- | --- | --- |
| 22 | **LCP** por debajo de 2,5 s y **CLS** por debajo de 0,1 en móvil | Lighthouse (modo móvil) o [PageSpeed Insights](https://pagespeed.web.dev) |
| 23 | Las imágenes son **WebP** (o AVIF), con **`width` y `height`**, y la principal **sin** `loading="lazy"` | DevTools → Network y `Ctrl + U` |
| 24 | La web se ve bien en el **móvil** y **no hay scroll horizontal** | DevTools → modo dispositivo, a 360 px |

### 7. Datos estructurados

| # | Comprueba | Cómo |
| --- | --- | --- |
| 25 | La portada tiene un **JSON-LD de tipo `Person`** con tu nombre y tus perfiles (`sameAs`) | [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) |

## La plantilla para tu informe

Copia esta tabla en tu `AUDITORIA.md`:

```markdown
# Auditoría SEO de mi portafolio — 26/11/2026

Lighthouse antes: Rendimiento 72 · Accesibilidad 85 · SEO 83
Lighthouse después: Rendimiento __ · Accesibilidad __ · SEO __

| # | Punto | Estado | Herramienta | Arreglo |
| --- | --- | --- | --- | --- |
| 1 | Título único | ❌ | Ctrl + U | Todas las páginas decían "Portfolio". Ahora cada una tiene el suyo |
| 7 | Alt en imágenes | ⚠️ | Lighthouse | 3 capturas sin alt. Añadido |
| 12 | Imagen OG | ❌ | LinkedIn Post Inspector | No había. Creada en Figma, 1200 × 630 |
| ... | | | | |

## Lo que aprendí
-
```

## Pistas para los fallos más típicos

<!-- solucion: Ver las pistas -->

- **Todas las páginas con el mismo título**: si usas un framework, crea un componente o una función que reciba el título de cada página (como el `Seo.jsx` de este blog, o el `metadata` de Next.js). En HTML puro, revisa cada archivo.
- **La tarjeta de LinkedIn sale vacía o sin imagen**: casi siempre es una `og:image` con ruta relativa (`/og.png`) o que pesa demasiado. Ponla absoluta, por debajo de 1 MB, y vuelve a pasar el inspector para refrescar la caché.
- **`Ctrl + U` no muestra tu contenido**: tu web es una SPA. Lee el post de SEO en apps de React: como mínimo, pon el título, la descripción y Open Graph en el `index.html`.
- **El CLS sale mal**: busca imágenes sin `width` y `height`. Es la causa número uno.
- **El LCP sale mal**: la imagen principal pesa mucho, no es WebP o tiene `loading="lazy"`.
- **`site:` no devuelve nada**: tu web es nueva. Da de alta Search Console, envía el sitemap y pide la indexación de la portada con la Inspección de URLs. Y paciencia: puede tardar días o semanas.
- **Hay dos versiones de tu web (con y sin `www`)**: en Vercel o Netlify, añade los dos dominios y haz que uno redirija al otro (post de canónicas y redirecciones).

<!-- /solucion -->

## Lo que se valora

Si enseñas esta auditoría en una entrevista o en tu README:

- **Que cada punto tenga su comprobación**: no "creo que está bien", sino "lo comprobé con tal herramienta".
- **El antes y el después** con números (Lighthouse, Core Web Vitals).
- **Que expliques el porqué** de cada arreglo, no solo el qué.
- **Que reconozcas lo que no depende del código**: que tu web suba en Google también depende del contenido, de los enlaces que recibe y del tiempo.

## Ideas para ampliarlo

1. Repite la auditoría con la web de un amigo o de un negocio pequeño de tu barrio, y mándales el informe. Es una forma estupenda de practicar (y a veces, de conseguir un primer cliente).
2. Automatiza parte de la checklist con un script de Node que descargue cada página de tu sitemap y compruebe que tiene `<title>`, `description`, `og:image` y canónica.
3. Vuelve a Search Console dentro de un mes y compara las impresiones y los clics.
