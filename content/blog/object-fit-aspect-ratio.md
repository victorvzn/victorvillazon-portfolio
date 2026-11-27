---
title: 'Imágenes que no se deforman: object-fit y aspect-ratio'
description: 'Cómo hacer que fotos de distintos tamaños encajen en tarjetas iguales sin estirarse, controlar la proporción de cualquier caja con aspect-ratio y elegir qué parte de la imagen se ve.'
date: 2026-11-26
series: css
tags: [CSS, Imágenes, Responsive]
draft: true
---

Tienes una galería de productos. Una foto es horizontal, otra vertical, otra cuadrada. Les pones a todas `width: 100%` y `height: 200px` para que las tarjetas queden iguales... y las fotos quedan **estiradas** o **aplastadas**. Las caras parecen de un espejo de feria.

Dos propiedades lo arreglan: **`object-fit`** y **`aspect-ratio`**.

## El problema

```html playground=problema
<div class="galeria">
  <img src="https://picsum.photos/seed/horizontal/800/400" alt="Foto horizontal">
  <img src="https://picsum.photos/seed/vertical/400/800" alt="Foto vertical">
  <img src="https://picsum.photos/seed/cuadrada/500/500" alt="Foto cuadrada">
</div>
```

```css playground=problema
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.galeria img {
  width: 100%;
  height: 200px; /* forzamos el mismo alto: se deforman */
}
```

La imagen tiene su propia **proporción** (ancho ÷ alto): 2:1, 1:2, 1:1. Al obligarla a encajar en otra proporción, el navegador la estira.

## `object-fit`: cómo encaja la imagen en su caja

`object-fit` funciona con `<img>` y `<video>`, como el `background-size` de las imágenes de fondo:

```html playground=fit
<div class="galeria">
  <figure><img class="fill" src="https://picsum.photos/seed/vertical/400/800" alt=""><figcaption>fill</figcaption></figure>
  <figure><img class="cover" src="https://picsum.photos/seed/vertical/400/800" alt=""><figcaption>cover</figcaption></figure>
  <figure><img class="contain" src="https://picsum.photos/seed/vertical/400/800" alt=""><figcaption>contain</figcaption></figure>
</div>
```

```css playground=fit
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

figure {
  margin: 0;
}

img {
  display: block;
  width: 100%;
  height: 200px;
  background: #e4e4e7;
}

.fill { object-fit: fill; }       /* por defecto: estira */
.cover { object-fit: cover; }     /* llena la caja y recorta lo que sobra */
.contain { object-fit: contain; } /* muestra la imagen entera, deja huecos */

figcaption {
  margin-top: 4px;
  font-family: monospace;
}
```

| Valor | Qué hace | Úsalo para |
| --- | --- | --- |
| `fill` | Estira la imagen hasta llenar la caja (por defecto) | Casi nunca |
| `cover` | Llena la caja manteniendo la proporción; **recorta** lo que sobra | Fotos de productos, avatares, portadas. El más usado |
| `contain` | Muestra la imagen **entera** manteniendo la proporción; puede dejar huecos | Logos, capturas de pantalla, productos que se deben ver completos |

### `object-position`: qué parte se ve

Con `cover`, por defecto se ve el **centro** de la imagen. Si lo importante está arriba (una cara en una foto vertical, por ejemplo), cámbialo:

```css
img {
  object-fit: cover;
  object-position: top; /* también: bottom, left, 30% 20%... */
}
```

## `aspect-ratio`: la proporción de cualquier caja

Fijar un alto en píxeles tiene otro problema: en el móvil, las columnas son estrechas y una imagen de 200px de alto se ve muy alargada. Lo ideal es fijar la **proporción**, no el alto. Para eso está **`aspect-ratio`**:

```css
img {
  width: 100%;
  aspect-ratio: 4 / 3; /* 4 de ancho por cada 3 de alto */
  object-fit: cover;
}
```

Ahora el alto se calcula a partir del ancho: si la imagen mide 300px de ancho, tendrá 225px de alto; si mide 600px, 450px. Siempre la misma forma.

```html playground=ratio
<div class="tarjetas">
  <article class="tarjeta">
    <img src="https://picsum.photos/seed/horizontal/800/400" alt="">
    <h3>Producto horizontal</h3>
  </article>
  <article class="tarjeta">
    <img src="https://picsum.photos/seed/vertical/400/800" alt="">
    <h3>Producto vertical</h3>
  </article>
  <article class="tarjeta">
    <img src="https://picsum.photos/seed/cuadrada/500/500" alt="">
    <h3>Producto cuadrado</h3>
  </article>
</div>
```

```css playground=ratio
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.tarjeta {
  border-radius: 12px;
  overflow: hidden;
  background: #f4f4f5;
}

.tarjeta img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.tarjeta h3 {
  margin: 0;
  padding: 12px;
  font-size: 16px;
}
```

Cambia el ancho de la vista del playground: las tarjetas cambian de tamaño, pero las fotos **nunca** se deforman y siempre tienen la misma forma.

Las proporciones más habituales:

| Proporción | Uso típico |
| --- | --- |
| `1 / 1` | Avatares, miniaturas de producto, publicaciones de Instagram |
| `4 / 3` | Fotos de producto, tarjetas |
| `16 / 9` | Vídeos, portadas, banners |
| `3 / 4` o `9 / 16` | Pósteres, *stories*, fotos verticales |

## `aspect-ratio` no es solo para imágenes

Funciona en **cualquier** elemento. Por ejemplo, para vídeos embebidos de YouTube, que antes necesitaban un truco con `padding-top: 56.25%`:

```css
iframe {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}
```

O para hacer un cuadrado perfecto que se adapta:

```css
.casilla {
  aspect-ratio: 1;
}
```

## La pareja con `width` y `height` en el HTML

Recuerda poner **`width` y `height`** en tus etiquetas `<img>` (lo vimos en el post de rendimiento de imágenes):

```html
<img src="producto.webp" alt="..." width="800" height="600">
```

El navegador los usa para **calcular la proporción** y reservar el hueco antes de que la imagen cargue, para que la página no "salte". Y con `width: 100%; height: auto` en el CSS, la imagen sigue siendo responsive.

## Tu turno

```html playground=ejercicio
<div class="equipo">
  <figure><img src="https://picsum.photos/seed/ana/300/500" alt="Ana, diseñadora"><figcaption>Ana</figcaption></figure>
  <figure><img src="https://picsum.photos/seed/luis/600/300" alt="Luis, desarrollador"><figcaption>Luis</figcaption></figure>
  <figure><img src="https://picsum.photos/seed/marta/400/400" alt="Marta, producto"><figcaption>Marta</figcaption></figure>
</div>
```

```css playground=ejercicio
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.equipo {
  display: flex;
  gap: 24px;
}

figure {
  margin: 0;
  text-align: center;
}

/* Convierte las tres fotos en avatares circulares de 120px,
   sin deformarlas y mostrando la parte de arriba de cada foto */
```

## Errores comunes

- **Fijar `width` y `height` sin `object-fit`.** La imagen se deforma.
- **Usar `cover` en logos o en productos que deben verse enteros.** Se recortan. Usa `contain`.
- **Fijar el alto en píxeles** en layouts responsive. Usa `aspect-ratio`.
- **Olvidar `display: block` en las imágenes.** Las imágenes son elementos en línea y dejan un pequeño hueco debajo.
- **Poner `aspect-ratio` y también `height` fijo.** El `height` gana y la proporción se ignora.

## Para profundizar

- [`object-fit` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/object-fit)
- [`aspect-ratio` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/aspect-ratio)

En resumen: **`object-fit: cover`** hace que una imagen llene su caja sin deformarse (recortando lo que sobra) y **`contain`** la muestra entera. **`object-position`** elige qué parte se ve. Y **`aspect-ratio`** fija la **proporción** de cualquier caja, para que tus imágenes, vídeos y tarjetas mantengan su forma en cualquier pantalla.
