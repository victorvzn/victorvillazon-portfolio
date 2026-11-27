---
title: 'Tres formas de añadir CSS a tu HTML (y cuál usar)'
description: 'CSS en línea, en una etiqueta style o en un archivo aparte: cómo funciona cada forma, cuál gana si chocan y por qué casi siempre usarás un archivo .css.'
date: 2026-11-26
series: css
tags: [CSS, Fundamentos]
draft: false
---

Antes de aprender selectores, colores o Flexbox, hay una pregunta básica: **¿dónde escribo el CSS?** Hay tres sitios posibles. Los tres funcionan, pero no son igual de buenos.

## 1. En línea: con el atributo `style`

Escribes el CSS directamente en la etiqueta, dentro del atributo `style`:

```html playground=en-linea
<h1 style="color: tomato; font-family: system-ui;">Hola, mundo</h1>
<p style="color: gray;">Este párrafo tiene su estilo pegado.</p>
```

Es rápido para una prueba, pero tiene problemas serios:

- **Mezcla** contenido y diseño en la misma línea: el HTML se vuelve difícil de leer.
- **No se reutiliza.** Si tienes 20 párrafos grises, escribes `style="color: gray"` 20 veces. Y si mañana quieres que sean azules, cambias 20 sitios.
- **Gana a casi todo** (por especificidad), así que luego cuesta sobrescribirlo.

## 2. Interno: en una etiqueta `<style>`

Escribes el CSS dentro de una etiqueta `<style>`, normalmente en el `<head>`:

```html playground=interno
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>CSS interno</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
    }

    h1 {
      color: tomato;
    }

    p {
      color: gray;
    }
  </style>
</head>
<body>
  <h1>Hola, mundo</h1>
  <p>Todos los párrafos de esta página son grises.</p>
  <p>Y este también, sin repetir nada.</p>
</body>
</html>
```

Ahora el diseño está separado del contenido y una regla afecta a todos los párrafos. Pero solo sirve **para esa página**. Si tu web tiene 5 páginas, copias el mismo `<style>` en las 5.

## 3. Externo: en un archivo `.css` (la buena)

Escribes el CSS en un archivo aparte, por ejemplo `estilos.css`, y lo conectas desde el HTML con una etiqueta `<link>`:

```html
<!-- index.html -->
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>CSS externo</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
  <h1>Hola, mundo</h1>
  <p>Mis estilos viven en otro archivo.</p>
</body>
</html>
```

```css
/* estilos.css */
body {
  font-family: system-ui, sans-serif;
}

h1 {
  color: tomato;
}
```

Esta es la forma que usarás en el 99 % de tus proyectos:

- **Un solo archivo para toda la web.** Cambias un color y cambia en todas las páginas.
- **El HTML queda limpio**: solo contenido.
- **El navegador lo guarda en caché**: la primera página lo descarga y las siguientes cargan más rápido.

El `href` es la **ruta** al archivo. Si `estilos.css` está en una carpeta `css/`, sería `href="css/estilos.css"`.

## ¿Y si chocan? Quién gana

Si el mismo elemento recibe estilos de varios sitios, el navegador decide con dos reglas:

1. **Especificidad**: el estilo en línea (`style="..."`) gana a los estilos de `<style>` y de los archivos `.css`.
2. **Orden**: entre `<style>` y `<link>` con la misma especificidad, gana **el que aparece después** en el HTML.

```html playground=quien-gana
<style>
  p { color: blue; }
  p { color: green; } /* misma especificidad, va después: gana el verde */
</style>

<p>Soy verde.</p>
<p style="color: tomato;">Yo soy tomate: el estilo en línea gana.</p>
```

De ahí viene la "C" de CSS: *Cascading Style Sheets*, hojas de estilo **en cascada**. Si quieres entender bien quién gana y por qué, lee el post de especificidad.

## ¿Cuándo usar cada una?

| Forma | Úsala para |
| --- | --- |
| Externa (`<link>`) | Siempre, por defecto |
| Interna (`<style>`) | Una prueba rápida, un ejemplo de una sola página, un email |
| En línea (`style=""`) | Casi nunca a mano. La verás cuando JavaScript cambia un estilo (`elemento.style.color = 'red'`) |

## Errores comunes

- **La ruta del `href` está mal.** Si los estilos no se aplican, es lo primero que debes revisar. Abre las DevTools (F12) → pestaña **Red** y busca el `.css`: si sale un 404, la ruta no es correcta.
- **Olvidar `rel="stylesheet"`.** Sin él, el navegador no sabe que el enlace es una hoja de estilos.
- **Poner el `<link>` en el `<body>`.** Va en el `<head>`, para que la página no se vea un instante sin estilos.
- **Abusar de `style=""`.** Si te encuentras escribiendo el mismo estilo en línea varias veces, muévelo a una clase.

## Para profundizar

- [Cómo funciona CSS, en MDN](https://developer.mozilla.org/es/docs/Learn/CSS/First_steps/How_CSS_works)

En resumen: el CSS puede ir **en línea**, **interno** o **externo**. Usa un **archivo `.css` enlazado con `<link>`** por defecto: se reutiliza en toda la web, deja el HTML limpio y carga más rápido.
