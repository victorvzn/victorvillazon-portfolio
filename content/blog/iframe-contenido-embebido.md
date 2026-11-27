---
title: 'Iframes: inserta vídeos de YouTube, mapas y otras webs en tu página'
description: 'Cómo embeber un vídeo de YouTube o un mapa de Google Maps, hacerlo responsive con aspect-ratio, cargarlo solo cuando se ve y protegerte con sandbox.'
date: 2026-11-26
series: html
tags: [HTML, Multimedia, Rendimiento]
draft: true
---

El vídeo de presentación de tu proyecto en YouTube. Un mapa con la dirección de un negocio. Un formulario de Google Forms. Una presentación de Canva. Todos se insertan en tu página de la misma forma: con un **`<iframe>`**.

## ¿Qué es un iframe?

Un **`<iframe>`** (*inline frame*) es una **ventana a otra página web** dentro de la tuya. Lo que hay dentro es una página completa e independiente, con su propio HTML, CSS y JavaScript.

```html
<iframe src="https://ejemplo.com" title="Descripción del contenido"></iframe>
```

- **`src`**: la dirección de la página que se muestra dentro.
- **`title`**: una descripción del contenido. **Es obligatorio para la accesibilidad**: es lo que anuncia un lector de pantalla al llegar al iframe. Sin él, solo diría "marco".

## Insertar un vídeo de YouTube

No hace falta escribir el iframe a mano. En YouTube:

1. Debajo del vídeo, pulsa **Compartir**.
2. Elige **Insertar**.
3. Copia el código que aparece.

Te dará algo así:

```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/ID_DEL_VIDEO"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen></iframe>
```

Antes de pegarlo, mejóralo un poco:

```html
<iframe
  class="video"
  src="https://www.youtube-nocookie.com/embed/ID_DEL_VIDEO"
  title="Vídeo: demostración de mi app de tareas"
  loading="lazy"
  allow="encrypted-media; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen></iframe>
```

- **`title` descriptivo**: "YouTube video player" no dice nada. Cuenta de qué trata el vídeo.
- **`youtube-nocookie.com`**: el modo de privacidad mejorada de YouTube. No guarda cookies del visitante hasta que reproduce el vídeo.
- **`loading="lazy"`**: el iframe no se carga hasta que el usuario se acerca a él con el scroll. Igual que con las imágenes (lo vimos en el post de rendimiento de imágenes), y en los iframes importa todavía más: **un vídeo de YouTube descarga mucho JavaScript**, aunque nadie le dé al play.
- **`frameborder`** sobra: es un atributo antiguo. El borde se quita con CSS.
- **`width` y `height`** fijos: los quitamos para hacerlo responsive.

## Hacerlo responsive

Un iframe con `width="560"` se sale de la pantalla en un móvil. Y si solo le pones `width: 100%`, el alto no se adapta y el vídeo queda aplastado. La solución moderna es **`aspect-ratio`** (tiene su propio post):

```html playground=video
<h2>Mi proyecto en vídeo</h2>
<iframe
  class="video"
  src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"
  title="Vídeo de ejemplo: Big Buck Bunny"
  loading="lazy"
  allow="encrypted-media; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen></iframe>
```

```css playground=video
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  max-width: 800px;
}

.video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9; /* la proporción de los vídeos de YouTube */
  border: 0;
  border-radius: 12px;
}
```

Cambia el ancho de la vista: el vídeo siempre mantiene su forma.

> En tutoriales antiguos verás un truco con un `div` envolvente y `padding-top: 56.25%`. Era la forma de conseguir esto antes de que existiera `aspect-ratio`. Ya no hace falta.

## Insertar un mapa de Google Maps

1. Busca el lugar en Google Maps.
2. Pulsa **Compartir** → **Insertar un mapa**.
3. Copia el HTML.

Y aplícale lo mismo: un `title` descriptivo, `loading="lazy"` y tamaño con CSS:

```html
<iframe
  class="mapa"
  src="https://www.google.com/maps/embed?pb=..."
  title="Mapa: cómo llegar a nuestra tienda en Miraflores, Lima"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"></iframe>
```

```css
.mapa {
  width: 100%;
  height: 360px;
  border: 0;
}
```

**Consejo de accesibilidad:** pon también la dirección **en texto** junto al mapa. Un mapa embebido es difícil de usar con un lector de pantalla o con el teclado, y alguien puede querer copiar la dirección.

## Seguridad: no todo se puede (ni se debe) embeber

### Muchas webs no se dejan

Si intentas poner `<iframe src="https://www.google.com">`, verás un hueco vacío o un error. Muchas webs **prohíben** que las metan en un iframe (con una cabecera llamada `X-Frame-Options` o `Content-Security-Policy`). Es una protección contra un ataque llamado ***clickjacking***: meter una web real en un iframe invisible para engañar al usuario y que haga clic donde no quiere.

Por eso los servicios que sí lo permiten te dan una **URL especial para insertar** (`/embed/` en YouTube, `maps/embed` en Google Maps). Usa siempre esa.

### `sandbox`: limita lo que puede hacer el iframe

Si embebes contenido de un sitio en el que no confías del todo, el atributo **`sandbox`** lo encierra en una "caja de arena" con todo bloqueado: sin JavaScript, sin formularios, sin poder abrir ventanas.

```html
<!-- Todo bloqueado -->
<iframe src="..." title="..." sandbox></iframe>

<!-- Permitimos solo lo necesario -->
<iframe src="..." title="..." sandbox="allow-scripts allow-same-origin"></iframe>
```

Empieza con todo bloqueado y añade solo los permisos que hagan falta.

### `allow`: permisos del navegador

El atributo **`allow`** controla a qué funciones del navegador puede acceder el iframe: pantalla completa, cámara, micrófono, ubicación... Dale solo lo que necesita. Un vídeo no necesita tu cámara.

## Iframes y rendimiento

Cada iframe es **una página entera** cargándose dentro de la tuya. Tres o cuatro vídeos de YouTube pueden hacer tu página mucho más lenta. Por eso:

- Usa **`loading="lazy"`** en todos los iframes que no estén arriba del todo.
- Si tienes **muchos vídeos**, una técnica muy usada es mostrar solo una **imagen de portada** con un botón de play, y cambiarla por el iframe cuando el usuario hace clic. Se llama *facade* (fachada) o "lite embed".

## Tu turno

1. Inserta un vídeo de YouTube que te guste en una página, con un `title` descriptivo, `loading="lazy"` y responsive con `aspect-ratio`.
2. Inserta debajo un mapa de tu ciudad, con la dirección también en texto.
3. Comprueba con las DevTools (pestaña **Network**) que el iframe no se carga hasta que haces scroll hasta él. Pista: pon mucho contenido encima para que quede fuera de la pantalla.

## Errores comunes

- **Iframes sin `title`.** Un lector de pantalla no sabe qué hay dentro.
- **Dejar el `width="560" height="315"` fijo.** Se sale en el móvil. Usa CSS con `aspect-ratio`.
- **No usar `loading="lazy"`.** Un iframe pesa mucho aunque nadie lo mire.
- **Intentar embeber webs que no lo permiten.** Busca su URL de inserción oficial.
- **Dar más permisos de los necesarios** con `allow` o sin `sandbox` en contenido de terceros.
- **Un mapa sin la dirección en texto.**

## Para profundizar

- [`<iframe>` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/iframe)
- [De objeto a iframe: otras tecnologías de inserción en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Structuring_content/General_embedding_technologies)

En resumen: un **`<iframe>`** es una ventana a otra web dentro de la tuya. Úsalo con la **URL de inserción** del servicio (YouTube, Google Maps...), dale siempre un **`title`** descriptivo, cárgalo solo cuando se vea con **`loading="lazy"`**, hazlo responsive con **`aspect-ratio`** y limita lo que puede hacer con **`sandbox`** y **`allow`** cuando el contenido no es de confianza.
