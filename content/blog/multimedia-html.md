---
title: 'Imágenes, video y audio en HTML: img, figure, video, audio e iframe'
description: 'Cómo poner imágenes con su pie de foto, videos con controles y subtítulos, audio y un video de YouTube, sin que tu página se vuelva lenta.'
date: 2026-11-26
series: html
tags: [HTML, Multimedia, Accesibilidad]
draft: true
---

Una web sin imágenes ni videos se queda muy plana. HTML tiene etiquetas para todo tipo de contenido multimedia, y cada una tiene un par de atributos que marcan la diferencia entre una página que vuela y una que tarda una eternidad en cargar.

## img: imágenes

```html playground=img
<img
  src="https://picsum.photos/seed/montana/600/400"
  alt="Montañas nevadas al amanecer, reflejadas en un lago"
  width="600"
  height="400"
  loading="lazy">
```

```css playground=img
body {
  padding: 16px;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}
```

Los atributos importantes:

- **`src`**: la ruta o URL de la imagen.
- **`alt`**: el texto alternativo. Lo lee el lector de pantalla y aparece si la imagen no carga. Es **obligatorio** (tienes un post entero sobre cómo escribirlo bien).
- **`width` y `height`**: el tamaño original. Con ellos, el navegador **reserva el hueco** antes de que la imagen cargue y la página no "salta" mientras lees.
- **`loading="lazy"`**: la imagen no se descarga hasta que el usuario se acerca a ella al hacer scroll. Úsalo en todas las imágenes **menos** en las que se ven nada más abrir la página.

Y en el CSS, la línea que hace las imágenes responsive: `max-width: 100%; height: auto;`. Así nunca se salen de su contenedor en el móvil.

`<img>` no tiene etiqueta de cierre: es un elemento *vacío*.

## figure y figcaption: imagen con pie de foto

Cuando una imagen tiene una **leyenda**, envuélvela en un **`<figure>`** con su **`<figcaption>`**:

```html playground=figure
<figure>
  <img
    src="https://picsum.photos/seed/cafe/600/400"
    alt="Taza de café humeante sobre una mesa de madera"
    width="600"
    height="400">
  <figcaption>Nuestro café de especialidad, tostado cada semana.</figcaption>
</figure>
```

```css playground=figure
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

figure {
  max-width: 600px;
  margin: 0;
}

figure img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

figcaption {
  margin-top: 8px;
  color: #52525b;
  font-size: 14px;
}
```

`<figure>` no es solo para fotos: sirve para gráficos, diagramas, fragmentos de código o citas que tengan su propia leyenda.

El `alt` y el `figcaption` no son lo mismo: el `alt` **describe** la imagen para quien no la ve; el `figcaption` es un **pie de foto** que ve todo el mundo.

## video: tu propio video

```html playground=video
<video
  controls
  width="640"
  poster="https://picsum.photos/seed/poster/640/360"
  preload="metadata">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
  Tu navegador no puede reproducir este video.
</video>
```

```css playground=video
body {
  padding: 16px;
}

video {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}
```

- **`controls`**: muestra los botones de reproducir, volumen y pantalla completa. Sin él, el usuario no puede controlar el video.
- **`poster`**: la imagen que se ve antes de darle a reproducir.
- **`preload="metadata"`**: descarga solo la información básica (duración, tamaño), no el video entero, hasta que el usuario lo reproduzca.
- **Varios `<source>`**: el navegador usa el primer formato que sepa reproducir. `mp4` funciona en todos; `webm` suele pesar menos.
- **El texto de dentro** solo aparece si el navegador no soporta `<video>`.

### Videos que se reproducen solos

Si quieres un video de fondo que empiece solo, los navegadores **solo lo permiten si está silenciado**:

```html
<video autoplay muted loop playsinline>
  <source src="fondo.mp4" type="video/mp4">
</video>
```

`playsinline` evita que en el iPhone se abra a pantalla completa.

### Subtítulos

Los subtítulos hacen tu video accesible para personas sordas y para quien lo ve sin sonido (¡casi todo el mundo en el móvil!). Se añaden con **`<track>`** y un archivo `.vtt`:

```html
<video controls>
  <source src="clase.mp4" type="video/mp4">
  <track src="subtitulos-es.vtt" kind="subtitles" srclang="es" label="Español" default>
</video>
```

## audio: sonido

Funciona igual que `<video>`:

```html playground=audio
<audio controls preload="none">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" type="audio/mpeg">
  Tu navegador no puede reproducir este audio.
</audio>
```

Pon siempre `controls`. Y **nunca** hagas que un audio suene solo al abrir la página: es de lo más molesto que hay, y además los navegadores lo bloquean.

## iframe: incrustar un video de YouTube o un mapa

Para meter dentro de tu página contenido de otra web, como un video de YouTube o un mapa, se usa **`<iframe>`**. Esas webs te dan el código en su botón de **Compartir → Insertar**. Por ejemplo, un mapa de OpenStreetMap:

```html playground=iframe
<iframe
  src="https://www.openstreetmap.org/export/embed.html?bbox=-77.05%2C-12.13%2C-77.01%2C-12.10&amp;layer=mapnik"
  title="Mapa de la zona de Miraflores, Lima"
  loading="lazy"></iframe>
```

```css playground=iframe
body {
  padding: 16px;
}

iframe {
  width: 100%;
  max-width: 560px;
  height: auto;
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: 12px;
}
```

Y así se ve el código que te da YouTube (cambiando `ID_DEL_VIDEO` por el del tuyo):

```html
<iframe
  src="https://www.youtube-nocookie.com/embed/ID_DEL_VIDEO"
  title="Video: cómo crear tu primera página web"
  loading="lazy"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen></iframe>
```

- **`title`** es obligatorio para la accesibilidad: es lo que anuncia el lector de pantalla al llegar al iframe.
- **`loading="lazy"`** también funciona en iframes, y en uno de YouTube se nota muchísimo: cada video incrustado carga bastante código.
- **`youtube-nocookie.com`** en vez de `youtube.com` evita que YouTube guarde cookies hasta que el usuario reproduzca el video.
- **`aspect-ratio: 16 / 9`** en el CSS mantiene la proporción al cambiar el ancho.

## Errores comunes

- **Imágenes sin `alt`**, o con `alt="imagen"`.
- **Imágenes sin `width` y `height`**: la página da saltos mientras carga.
- **Subir una foto de 5 MB** directamente de la cámara. Redúcela y conviértela a WebP (tienes un post sobre imágenes rápidas).
- **Videos sin `controls`**, o que suenan solos.
- **`loading="lazy"` en la imagen principal** de la página: la hace aparecer más tarde. Úsalo solo en las que están más abajo.
- **Un iframe sin `title`.**

## Para profundizar

- [Imágenes en HTML, en MDN](https://developer.mozilla.org/es/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML)
- [Video y audio, en MDN](https://developer.mozilla.org/es/docs/Learn/HTML/Multimedia_and_embedding/Video_and_audio_content)

En resumen: **`<img>`** con `alt`, `width`, `height` y `loading="lazy"`; **`<figure>`** para imágenes con pie de foto; **`<video>`** y **`<audio>`** siempre con `controls`; y **`<iframe>`** con `title` para incrustar YouTube o mapas.
