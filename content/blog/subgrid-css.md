---
title: 'CSS subgrid: alinea el contenido de tarjetas distintas'
description: 'El problema de las tarjetas con títulos de distinta longitud, qué es subgrid, cómo hacer que los hijos de un elemento usen las filas o columnas de la cuadrícula padre, un formulario alineado y cuándo usarlo frente a otras soluciones.'
date: 2026-11-27
series: css
tags: [CSS, Grid, Subgrid, Avanzado]
draft: true
---

Tienes una fila de tarjetas de producto con Grid (lo viste en Grid: 5 layouts reales). Pero uno de los productos tiene un título largo que ocupa dos líneas, y su descripción, su precio y su botón quedan **más abajo** que los de las tarjetas de al lado. Los botones no están alineados y todo se ve desordenado.

Lo has intentado todo: alturas fijas (que se rompen con títulos aún más largos), `min-height`, `margin-top: auto` en el botón (que alinea el botón pero no los precios)... La solución de verdad se llama **subgrid**.

## El problema, en vivo

```html playground=sin-subgrid
<div class="tarjetas">
  <article class="tarjeta">
    <h3>Teclado</h3>
    <p>Mecánico, switches rojos.</p>
    <strong>S/ 120</strong>
    <button>Añadir</button>
  </article>
  <article class="tarjeta">
    <h3>Monitor curvo ultrapanorámico de 34 pulgadas</h3>
    <p>Para programar con diez pestañas abiertas a la vez sin perder detalle.</p>
    <strong>S/ 1 450</strong>
    <button>Añadir</button>
  </article>
  <article class="tarjeta">
    <h3>Mouse</h3>
    <p>Inalámbrico.</p>
    <strong>S/ 45</strong>
    <button>Añadir</button>
  </article>
</div>
```

```css playground=sin-subgrid
body {
  margin: 0;
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #f4f4f5;
}

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.tarjeta {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background: white;
}

.tarjeta h3,
.tarjeta p {
  margin: 0;
}
```

Ábrelo: los precios y los botones están a alturas distintas en cada tarjeta. ¿Por qué? Porque **cada tarjeta es su propia cuadrícula**: sus filas solo conocen su propio contenido. La tarjeta del monitor no tiene forma de decirle a la del teclado "mi título ocupa dos líneas, haz tu fila igual de alta".

## La idea de subgrid

Con **subgrid**, un elemento que está dentro de una cuadrícula puede **usar las filas (o columnas) de la cuadrícula padre** en lugar de crear las suyas.

Si las tres tarjetas comparten **las mismas filas**, la fila del título medirá lo que mida el título más largo, en todas las tarjetas a la vez. Y todo lo de abajo queda alineado.

Dos pasos:

1. La cuadrícula padre crea las filas.
2. Cada tarjeta ocupa esas filas y dice "usa las de mi padre" con `grid-template-rows: subgrid`.

## La solución

Solo cambia el CSS de las dos reglas principales:

```html playground=con-subgrid
<div class="tarjetas">
  <article class="tarjeta">
    <h3>Teclado</h3>
    <p>Mecánico, switches rojos.</p>
    <strong>S/ 120</strong>
    <button>Añadir</button>
  </article>
  <article class="tarjeta">
    <h3>Monitor curvo ultrapanorámico de 34 pulgadas</h3>
    <p>Para programar con diez pestañas abiertas a la vez sin perder detalle.</p>
    <strong>S/ 1 450</strong>
    <button>Añadir</button>
  </article>
  <article class="tarjeta">
    <h3>Mouse</h3>
    <p>Inalámbrico.</p>
    <strong>S/ 45</strong>
    <button>Añadir</button>
  </article>
</div>
```

```css playground=con-subgrid
body {
  margin: 0;
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #f4f4f5;
}

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.tarjeta {
  /* 1. Ocupa 4 filas de la cuadrícula padre (título, texto, precio, botón) */
  grid-row: span 4;

  /* 2. Y usa esas filas para colocar sus hijos */
  display: grid;
  grid-template-rows: subgrid;
  gap: 8px;

  padding: 16px;
  border-radius: 12px;
  background: white;
}

.tarjeta h3,
.tarjeta p {
  margin: 0;
}

.tarjeta button {
  align-self: end; /* el botón, pegado abajo de su fila */
}
```

Ahora todos los títulos, descripciones, precios y botones están **en la misma línea**, aunque cada tarjeta tenga textos distintos. Y si añades un producto con un título de tres líneas, las demás se ajustan solas.

Qué pasa por dentro:

- **`grid-row: span 4`**: cada tarjeta ocupa 4 filas del padre. Como el padre no define filas, Grid las crea automáticamente (`grid-auto-rows`), y cada fila crece según **el contenido más alto de esa fila en todas las tarjetas**.
- **`grid-template-rows: subgrid`**: los 4 hijos de la tarjeta (`h3`, `p`, `strong`, `button`) se colocan en esas 4 filas compartidas, en lugar de en filas propias.
- **`gap: 8px`** en la tarjeta: un subgrid hereda el `gap` del padre, pero puedes sobrescribirlo. Aquí separa los elementos de dentro de la tarjeta con 8px, mientras las tarjetas siguen separadas 16px entre ellas.

> Abre las DevTools, selecciona `.tarjetas` y activa la cuadrícula (el botón `grid` junto al elemento en el panel de elementos). Verás las filas compartidas cruzando todas las tarjetas.

## Columnas con subgrid: un formulario alineado

Subgrid también funciona con **columnas**. Un caso clásico: un formulario con etiquetas de distinto largo, donde quieres que todos los inputs empiecen en la misma vertical, pero cada campo está envuelto en su propio `<div>` (porque lleva también su mensaje de error).

```html playground=formulario
<form class="formulario">
  <div class="campo">
    <label for="nombre">Nombre</label>
    <input id="nombre">
  </div>
  <div class="campo">
    <label for="email">Correo electrónico</label>
    <input id="email" type="email">
    <small>Nunca lo compartiremos.</small>
  </div>
  <div class="campo">
    <label for="tel">Teléfono de contacto</label>
    <input id="tel" type="tel">
  </div>
</form>
```

```css playground=formulario
body {
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.formulario {
  display: grid;
  grid-template-columns: max-content 1fr; /* etiqueta | input */
  gap: 12px 16px;
  max-inline-size: 520px;
}

.campo {
  grid-column: span 2;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
}

.campo small {
  grid-column: 2; /* la ayuda, debajo del input */
  color: #71717a;
}
```

La primera columna mide lo que mide **la etiqueta más larga** ("Teléfono de contacto"), y todos los inputs empiezan en la misma línea. Sin anchos fijos.

## ¿Y sin subgrid?

Antes de subgrid había dos trucos, los dos con pegas:

- **`display: contents`** en la tarjeta: hace que sus hijos "suban" a la cuadrícula padre. Funciona, pero la tarjeta **deja de existir como caja**: pierdes su fondo, su borde y su padding.
- **Alturas fijas o `min-height`**: se rompen en cuanto el contenido es más largo de lo previsto, o al traducir la web.

Subgrid resuelve el problema sin perder la tarjeta y sin números mágicos. Funciona en todos los navegadores modernos desde 2023.

## ¿Cuándo usarlo?

- ✅ **Tarjetas en fila** con partes que deben alinearse (títulos, precios, botones).
- ✅ **Formularios** con etiquetas y campos alineados.
- ✅ **Listas tipo tabla** hechas con `div` (una cabecera y filas con columnas alineadas).
- ❌ Si solo necesitas el botón abajo y no importa el resto, `margin-top: auto` en un Flexbox en columna es más sencillo.

## Tu turno

1. Añade una imagen arriba de cada tarjeta y cambia `span 4` por `span 5`. ¿Qué pasa si te olvidas de cambiarlo?
2. Haz que las tarjetas tengan una etiqueta opcional ("Oferta") que solo algunas llevan. Pista: el elemento tiene que existir en todas (aunque esté vacío) para que las filas coincidan, o colócalo con `grid-row`.
3. Crea una "tabla" de pedidos con `div`: una fila de cabecera y varias filas de datos, con columnas alineadas usando `grid-template-columns: subgrid`.

## Errores comunes

- **El `span` no coincide con el número de hijos.** Si la tarjeta tiene 5 hijos y ocupa 4 filas, el quinto crea una fila implícita y se descoloca.
- **Olvidar `display: grid`** en el elemento que usa `subgrid`: `grid-template-rows: subgrid` solo funciona en una cuadrícula.
- **El elemento con subgrid no es hijo directo** de la cuadrícula padre. Subgrid solo mira un nivel hacia arriba (aunque puedes encadenar subgrids).
- **Poner filas de tamaño fijo en el padre** (`grid-auto-rows: 200px`): entonces no crecen con el contenido y no sirve de nada.

## Para profundizar

- [Subgrid en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_grid_layout/Subgrid)
- [Brand New Layouts with CSS Subgrid, de Josh W. Comeau (en inglés)](https://www.joshwcomeau.com/css/subgrid/)

En resumen: cuando cada tarjeta es su propia cuadrícula, sus filas no se alinean con las de las demás. Con **subgrid**, el hijo ocupa varias filas del padre (**`grid-row: span N`**) y las usa para sus propios hijos (**`grid-template-rows: subgrid`**), así cada fila mide lo que el contenido más alto de **todas** las tarjetas. Funciona igual con columnas (**`grid-template-columns: subgrid`**) para formularios y tablas alineadas.
