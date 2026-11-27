---
title: 'Overflow en CSS: qué pasa cuando el contenido no cabe'
description: 'overflow hidden, auto y scroll, cortar textos largos con puntos suspensivos, limitar un párrafo a varias líneas y encontrar qué elemento provoca el scroll horizontal.'
date: 2026-11-26
series: css
tags: [CSS, Fundamentos]
draft: true
---

Un nombre de producto larguísimo que se sale de la tarjeta. Una tabla que rompe el diseño en el móvil. Una página que, de repente, se mueve hacia los lados. Todos son problemas de **overflow** (desbordamiento): el contenido no cabe en su caja.

## ¿Qué es el overflow?

Cuando una caja tiene un tamaño fijo (o máximo) y su contenido es más grande, el contenido **se sale** por fuera. Por defecto, CSS **lo deja verse** aunque se salga, para que no pierdas información:

```html playground=desborda
<div class="caja">
  Este texto es demasiado largo para una caja tan pequeña y se sale por abajo, pisando lo que haya después.
</div>
<p>Texto que viene después</p>
```

```css playground=desborda
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.caja {
  width: 200px;
  height: 60px;
  padding: 8px;
  border: 2px solid #6366f1;
}
```

La propiedad `overflow` decide qué hacer con lo que sobra.

## Los cuatro valores

```html playground=valores
<div class="caja visible"><strong>visible</strong>: lo que no cabe se sale de la caja y se ve por encima de lo demás.</div>
<div class="caja hidden"><strong>hidden</strong>: lo que no cabe se recorta y no se ve. Nadie podrá leer el final de este texto.</div>
<div class="caja scroll"><strong>scroll</strong>: siempre muestra barras de desplazamiento, aunque no hagan falta en algunos casos.</div>
<div class="caja auto"><strong>auto</strong>: muestra la barra de desplazamiento solo si el contenido no cabe. Es el que usarás casi siempre.</div>
```

```css playground=valores
body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 48px 24px;
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.caja {
  height: 70px;
  padding: 8px;
  border: 2px solid #6366f1;
}

.visible { overflow: visible; }
.hidden  { overflow: hidden; }
.scroll  { overflow: scroll; }
.auto    { overflow: auto; }
```

| Valor | Qué hace | Cuándo usarlo |
| --- | --- | --- |
| `visible` | Se sale y se ve (por defecto) | Casi nunca a propósito |
| `hidden` | Recorta lo que sobra | Imágenes con esquinas redondeadas, efectos, recortes decorativos |
| `scroll` | Barras de scroll siempre | Raramente |
| `auto` | Barra de scroll solo si hace falta | Listas, tablas, chats, menús largos |

También puedes controlar cada eje por separado con **`overflow-x`** (horizontal) y **`overflow-y`** (vertical).

## Caso 1: una lista con su propio scroll

Un chat o un menú lateral con muchos elementos: queremos que tenga un alto máximo y que su contenido se desplace **dentro**:

```css
.mensajes {
  max-height: 400px;
  overflow-y: auto;
}
```

## Caso 2: tablas que no rompen el móvil

Las tablas con muchas columnas no caben en una pantalla pequeña. En vez de romper la página, envuélvela en un contenedor con scroll horizontal:

```html playground=tabla
<div class="tabla-scroll">
  <table>
    <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Proveedor</th><th>Última venta</th></tr>
    <tr><td>Teclado mecánico</td><td>Periféricos</td><td>S/ 120</td><td>15</td><td>TecnoPerú</td><td>26/11/2026</td></tr>
    <tr><td>Monitor 27"</td><td>Pantallas</td><td>S/ 650</td><td>4</td><td>VisionMax</td><td>25/11/2026</td></tr>
  </table>
</div>
```

```css playground=tabla
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.tabla-scroll {
  overflow-x: auto;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
}

table {
  border-collapse: collapse;
  white-space: nowrap; /* que las celdas no partan su texto en varias líneas */
}

th,
td {
  padding: 8px 14px;
  text-align: left;
  border-bottom: 1px solid #e4e4e7;
}
```

Haz estrecha la vista del playground: la página no se rompe, solo la tabla se desplaza.

## Caso 3: recortar con `hidden`

`overflow: hidden` es muy útil para que el contenido respete las **esquinas redondeadas** del padre:

```css
.tarjeta {
  border-radius: 16px;
  overflow: hidden; /* la imagen de arriba también queda con las esquinas redondeadas */
}
```

Sin el `overflow: hidden`, la imagen de dentro tendría esquinas cuadradas y "se saldría" de las curvas de la tarjeta.

## Cortar un texto con puntos suspensivos

Un nombre de producto o un email muy largo, en **una sola línea**, cortado con `…`:

```html playground=ellipsis
<p class="corto">Teclado mecánico inalámbrico con retroiluminación RGB y switches intercambiables</p>
```

```css playground=ellipsis
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.corto {
  max-width: 260px;
  white-space: nowrap;     /* 1. todo en una línea */
  overflow: hidden;        /* 2. recorta lo que sobra */
  text-overflow: ellipsis; /* 3. pone "…" al final */
}
```

Las **tres** propiedades son necesarias. Si falta una, no funciona. Y el elemento necesita un ancho limitado (`width` o `max-width`, o estar dentro de un contenedor con ancho).

> Accesibilidad: el texto completo sigue en el HTML, así que un lector de pantalla lo lee entero. Para los usuarios que ven la pantalla, puedes añadir un atributo `title` con el texto completo para que lo vean al pasar el ratón.

## Limitar a varias líneas

¿Y si quieres mostrar **tres líneas** de la descripción y cortar el resto? Para eso está `line-clamp`:

```html playground=clamp
<p class="descripcion">Estos auriculares inalámbricos tienen cancelación de ruido activa, hasta 30 horas de batería, carga rápida por USB-C y un diseño plegable para llevarlos a cualquier parte. Incluyen estuche rígido y cable de audio.</p>
```

```css playground=clamp
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.descripcion {
  max-width: 280px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}
```

El prefijo `-webkit-` parece antiguo, pero es la forma que funciona en **todos** los navegadores modernos. Ponemos también `line-clamp` sin prefijo para el futuro.

## El enemigo: el scroll horizontal de toda la página

Si tu página se mueve hacia los lados en el móvil, **algún elemento es más ancho que la pantalla**. Las causas típicas:

- Un elemento con un **ancho fijo** (`width: 500px`).
- Una **imagen** sin `max-width: 100%`.
- Una palabra o URL **muy larga** sin espacios.
- Un elemento con `100vw` de ancho (que incluye la barra de scroll y se pasa unos píxeles).

**Cómo encontrar al culpable:** pega esto en la consola de las DevTools. Te dice qué elementos son más anchos que la pantalla:

```js
document.querySelectorAll('*').forEach((el) => {
  if (el.getBoundingClientRect().right > document.documentElement.clientWidth) {
    console.log(el)
  }
})
```

Para las palabras larguísimas (URL, emails), usa:

```css
.contenido {
  overflow-wrap: anywhere; /* permite partir palabras largas si no caben */
}
```

> **No lo arregles con `body { overflow-x: hidden }`.** Esconde el síntoma, pero el elemento sigue roto, y además puede estropear `position: sticky`. Encuentra el elemento y corrígelo.

## Tu turno

```html playground=ejercicio
<article class="tarjeta">
  <img src="https://picsum.photos/seed/cafe/600/400" alt="" width="600" height="400">
  <h2 class="tarjeta__titulo">Cafetera espresso automática con molinillo integrado y espumador de leche</h2>
  <p class="tarjeta__texto">Prepara cafés como en una cafetería. Ajusta la molienda, la intensidad y la temperatura. Su depósito de 1,8 litros permite preparar varias tazas seguidas sin rellenar.</p>
</article>
```

```css playground=ejercicio
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjeta {
  max-width: 300px;
  border-radius: 16px;
  background: #f4f4f5;
}

.tarjeta img {
  display: block;
  width: 100%;
  height: auto;
}

/* 1. Que la imagen respete las esquinas redondeadas de la tarjeta
   2. Que el título ocupe una sola línea con "…"
   3. Que el texto muestre solo 2 líneas */
```

## Errores comunes

- **`text-overflow: ellipsis` solo.** Necesita también `white-space: nowrap` y `overflow: hidden`.
- **`overflow: scroll` cuando querías `auto`.** Saldrán barras aunque no hagan falta.
- **Arreglar el scroll horizontal con `overflow-x: hidden` en el `body`.** Busca al elemento culpable.
- **`overflow: hidden` en un padre con menús desplegables o tooltips.** Los recortará. Quítalo o mueve el desplegable fuera.
- **Imágenes sin `max-width: 100%`.** Son la causa número uno del scroll horizontal.

## Para profundizar

- [`overflow` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/overflow)
- [`text-overflow` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/text-overflow)
- [`line-clamp` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/line-clamp)

En resumen: **`overflow`** decide qué pasa con el contenido que no cabe: **`auto`** para scroll solo si hace falta y **`hidden`** para recortar. Para cortar textos, **`white-space: nowrap` + `overflow: hidden` + `text-overflow: ellipsis`** (una línea) o **`line-clamp`** (varias). Y si toda tu página se desplaza hacia los lados, **busca al elemento culpable** en vez de esconderlo.
