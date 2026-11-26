---
title: 'El <head> de tu HTML: las etiquetas que sí importan'
description: 'charset, viewport, title, description y Open Graph: qué hace cada etiqueta del head y por qué tu web se ve rara en el móvil sin ellas.'
date: 2026-11-26
series: html
tags: [HTML, SEO, Fundamentos]
draft: true
---

El `<head>` es la parte del HTML que **no se ve**, pero decide cómo se ve todo lo demás: si las tildes salen bien, si la web se adapta al móvil, qué título aparece en Google y qué imagen sale cuando compartes el enlace por WhatsApp.

Este es un `<head>` mínimo y correcto. Vamos línea por línea:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pizzería Don Mario · Pizzas al horno de leña</title>
  <meta name="description" content="Pizzas artesanales en el centro de Lima. Pide online y recoge en 20 minutos.">
  <link rel="icon" href="/favicon.svg">
  <link rel="stylesheet" href="/estilos.css">
</head>
```

## `lang="es"`: el idioma

Va en la etiqueta `<html>`, no en el head, pero es igual de importante. Le dice al navegador y a los lectores de pantalla en qué idioma está la página. Sin él, un lector de pantalla puede leer tu texto en español **con pronunciación inglesa**.

## `charset="utf-8"`: que las tildes salgan bien

Le dice al navegador cómo convertir los bytes del archivo en letras. Si falta, puedes ver cosas como `CafÃ©` en vez de `Café`. Debe ser **lo primero** del head.

## `viewport`: la que arregla el móvil

Sin esta línea, el móvil finge ser una pantalla de escritorio de unos 980 px de ancho y encoge toda tu página. Resultado: texto diminuto y tus media queries no funcionan.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

- `width=device-width`: usa el ancho real de la pantalla.
- `initial-scale=1`: empieza sin zoom.

Si alguna vez tu web "responsive" se veía como escritorio en el móvil, casi seguro faltaba esta línea.

## `<title>`: el nombre de la pestaña (y de Google)

Es lo que se ve en la pestaña del navegador y el título azul en los resultados de Google. Consejos:

- Único para cada página. "Inicio" en todas no ayuda a nadie.
- Lo importante primero: `Contacto · Pizzería Don Mario`, no al revés.
- Unos 50-60 caracteres; Google corta los más largos.

## `description`: el texto bajo el título en Google

No mejora tu posición en Google directamente, pero es lo que la gente lee para decidir si hace clic. Escríbelo como un anuncio corto de unos 150 caracteres.

## Open Graph: cómo se ve tu enlace al compartirlo

Cuando pegas un enlace en WhatsApp, LinkedIn o Discord, ellos leen estas etiquetas para armar la tarjeta con imagen:

```html
<meta property="og:title" content="Pizzería Don Mario">
<meta property="og:description" content="Pizzas al horno de leña en el centro de Lima.">
<meta property="og:image" content="https://donmario.com/compartir.jpg">
<meta property="og:url" content="https://donmario.com/">
<meta property="og:type" content="website">
```

La imagen debe ser una **URL completa** (con `https://`), idealmente de 1200 × 630 px. Una ruta como `/compartir.jpg` no funciona porque la red social no sabe de qué dominio viene.

## Pruébalo

Copia este head en el playground y cambia el `<title>`: verás que el contenido de la página no cambia, porque el head no se muestra. Luego borra el `charset` y fíjate en las tildes.

```html playground=head
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mi primera página</title>
</head>
<body>
  <h1>Café, piñata y acción</h1>
  <p>Si ves bien las tildes y la ñ, el charset está funcionando.</p>
</body>
</html>
```

## Errores comunes

- **Olvidar el viewport.** Es el error número uno de quien empieza con responsive.
- **El mismo title en todas las páginas.** En Google y en las pestañas no se distinguen.
- **Poner contenido visible en el head.** Un `<h1>` dentro del head no tiene sentido: el navegador lo mueve al body y tu HTML queda inválido.
- **Imagen de Open Graph con ruta relativa.** Siempre URL completa.

## Para profundizar

- [Qué hay en el head en MDN](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML)
- [El protocolo Open Graph (en inglés)](https://ogp.me/)

En resumen: **`charset`** para las letras, **`viewport`** para el móvil, **`title`** y **`description`** para Google y **Open Graph** para cuando compartes el enlace.
