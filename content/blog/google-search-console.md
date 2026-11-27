---
title: 'Google Search Console: da de alta tu web y descubre cómo te encuentran'
description: 'La herramienta gratuita de Google para ver tu web como la ve el buscador: verificar el dominio, enviar el sitemap, pedir que indexe una página y entender con qué búsquedas te encuentran.'
date: 2026-11-26
series: html
tags: [SEO, Herramientas]
draft: true
---

Has hecho todo lo de los posts anteriores: títulos, Open Graph, sitemap, canónicas. Pero ¿cómo sabes si Google ya conoce tu web? ¿Qué páginas tiene? ¿Con qué búsquedas apareces? ¿Hay algún error?

Para eso existe **Google Search Console**: una herramienta **gratuita** de Google que te enseña **tu web tal como la ve el buscador**. Si tienes una web publicada, deberías tenerla dada de alta.

## Paso 1: añadir tu web

1. Entra en [search.google.com/search-console](https://search.google.com/search-console) con tu cuenta de Google.
2. Pulsa **Añadir propiedad**. Te ofrecerá dos tipos:

| Tipo | Qué cubre | Cómo se verifica |
| --- | --- | --- |
| **Dominio** (recomendado) | Todo: `http`, `https`, con y sin `www`, subdominios | Un registro DNS en el proveedor de tu dominio |
| **Prefijo de URL** | Solo esa dirección exacta (`https://www.anatorres.dev`) | Varias opciones: un archivo HTML, una meta tag... |

Si tienes **dominio propio**, elige **Dominio**: así ves todas las variantes juntas.

## Paso 2: verificar que la web es tuya

Google necesita comprobar que eres el dueño antes de enseñarte nada.

**Con el tipo Dominio:** Google te da un texto que empieza por `google-site-verification=...`. Tienes que añadirlo como un registro **TXT** en la configuración **DNS** de tu dominio (donde lo compraste, o en Vercel o Netlify si gestionan tu dominio). Busca "DNS", añade un registro de tipo **TXT** con ese valor y guarda. Vuelve a Search Console y pulsa **Verificar**. A veces tarda unos minutos (o unas horas) en propagarse.

**Con Prefijo de URL**, la forma más sencilla es la **meta tag**: Google te da una etiqueta así, que pegas en el `<head>` de tu página principal:

```html
<meta name="google-site-verification" content="código-que-te-da-google">
```

Publicas la web y pulsas **Verificar**. **No borres** la etiqueta después: Google la comprueba de vez en cuando.

> ¿Tu web está en `tu-proyecto.vercel.app` o en GitHub Pages, sin dominio propio? Usa **Prefijo de URL** con la meta tag.

## Paso 3: enviar el sitemap

En el menú, **Sitemaps** → escribe la dirección de tu sitemap (normalmente `sitemap.xml`) → **Enviar**. En unos días verás cuántas URL ha descubierto. Si hay errores (URL que no existen, formato incorrecto), aparecen aquí. Tienes todo sobre el sitemap en su propio post.

## Paso 4: comprobar una página concreta

La herramienta más útil para el día a día es la **Inspección de URLs** (la barra de búsqueda de arriba). Pega la URL de una página y te dirá:

- **Si está en Google** ("La URL está en Google") o no, y por qué.
- **Cuándo la rastreó** por última vez.
- **Qué canónica eligió Google**: si no coincide con la tuya, revisa tus canónicas.
- **Si es apta para móviles** y si tiene datos estructurados válidos.

Y dos botones clave:

- **Probar URL publicada**: rastrea la página **ahora** y te enseña el HTML que ve Google y una captura. Ideal para comprobar que tu contenido está en el HTML (y no solo en el JavaScript).
- **Solicitar indexación**: le pide a Google que la rastree pronto. Úsalo cuando publiques una página nueva importante o cambies una mucho. No hace falta pedirlo para cada página: tiene un límite diario y Google acaba llegando igual.

## Paso 5: los informes que importan

### Rendimiento: cómo te encuentran

El informe **Rendimiento** (*Resultados de búsqueda*) es el más interesante. Te muestra, para los últimos meses:

- **Clics**: cuántas veces alguien hizo clic en tu web desde Google.
- **Impresiones**: cuántas veces apareció tu web en los resultados (aunque no hicieran clic).
- **CTR**: el porcentaje de impresiones que acabaron en clic.
- **Posición media**: en qué puesto sales de media.

Y lo mejor: puedes ver **con qué búsquedas** (pestaña **Consultas**) y **en qué páginas** (pestaña **Páginas**).

Cómo usarlo:

- **Búsquedas con muchas impresiones y pocos clics**: apareces, pero tu título o tu descripción no convencen. Mejóralos.
- **Búsquedas en las posiciones 8-20**: estás cerca de la primera página. Amplía y mejora ese contenido.
- **Búsquedas que no esperabas**: ideas para tu siguiente artículo o proyecto.

### Páginas (indexación): qué tiene Google

El informe **Páginas** te dice cuántas de tus páginas están **indexadas** y cuántas **no**, con el motivo. Los motivos más comunes:

| Motivo | Qué significa | ¿Hay que hacer algo? |
| --- | --- | --- |
| Excluida por la etiqueta "noindex" | Tiene `noindex` | Solo si no lo pusiste a propósito |
| Página con redirección | Es una URL que redirige | No, es normal (`http` → `https`) |
| Página alternativa con etiqueta canónica adecuada | Es un duplicado y Google respeta tu canónica | No, está bien |
| No se ha encontrado (404) | La URL no existe | Si eran páginas reales, redirígelas |
| Descubierta: actualmente sin indexar | Google la conoce pero aún no la ha rastreado | Paciencia (o mejora el contenido) |
| Rastreada: actualmente sin indexar | La leyó y decidió no guardarla | Suele ser contenido poco útil o duplicado |

### Experiencia y Mejoras

- **Métricas web principales**: el estado de las **Core Web Vitals** de tus páginas, con datos reales de usuarios (tienen su propio post).
- **Mejoras**: errores en tus **datos estructurados** (JSON-LD).
- **HTTPS**: si alguna página se sirve sin conexión segura.

## Paciencia: los datos tardan

Una web recién dada de alta tarda **unos días** en mostrar datos, y el informe de Rendimiento se actualiza con **2 o 3 días de retraso**. Si tu web es nueva y casi nadie la enlaza, es normal ver muy pocas impresiones durante las primeras semanas.

## Tu turno

1. Da de alta tu portafolio en Search Console y verifícalo.
2. Envía tu sitemap.
3. Inspecciona la URL de tu página principal y pulsa **Probar URL publicada**. Mira el HTML que ve Google: ¿aparecen tu nombre y tus proyectos?
4. Dentro de dos semanas, entra en **Rendimiento** y apunta con qué búsquedas apareces.

## Errores comunes

- **No darse de alta** y adivinar qué pasa con tu web en Google.
- **Borrar la meta tag de verificación** tras verificar. Google deja de reconocerte.
- **Pulsar "Solicitar indexación" a diario** en todas las páginas. No acelera nada y tiene límite.
- **Asustarse con "páginas no indexadas".** Muchas lo son a propósito (redirecciones, duplicados con canónica). Revisa el motivo.
- **Verificar solo `https://anatorres.dev`** cuando tu web redirige a `www`. Con el tipo Dominio no te pasa.

## Para profundizar

- [Primeros pasos con Search Console (Google)](https://support.google.com/webmasters/answer/9128668?hl=es)
- [Herramienta de inspección de URLs](https://support.google.com/webmasters/answer/9012289?hl=es)

En resumen: **Google Search Console** te enseña tu web como la ve Google. **Añade tu propiedad** (mejor de tipo Dominio), **verifícala** con un registro DNS o una meta tag, **envía tu sitemap**, usa la **Inspección de URLs** para comprobar páginas concretas y el informe de **Rendimiento** para saber con qué búsquedas te encuentran. Es gratis, y es la diferencia entre adivinar y saber.
