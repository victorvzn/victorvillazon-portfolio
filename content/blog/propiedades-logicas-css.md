---
title: 'Propiedades lógicas en CSS: margin-inline, padding-block e inset'
description: 'Qué son las propiedades lógicas de CSS, la diferencia entre inline y block, margin-inline, padding-block, inset, inline-size y block-size, por qué hacen tu CSS más corto y cómo funcionan en idiomas que se escriben de derecha a izquierda.'
date: 2026-11-27
series: css
tags: [CSS, Propiedades lógicas, Fundamentos]
draft: true
---

¿Cuántas veces has escrito esto?

```css
.contenedor {
  margin-left: auto;
  margin-right: auto;
  padding-top: 24px;
  padding-bottom: 24px;
}
```

Hay una forma más corta, más moderna y que además funciona en **cualquier idioma**:

```css
.contenedor {
  margin-inline: auto;
  padding-block: 24px;
}
```

Son las **propiedades lógicas**. Hoy aprendes qué significan *inline* y *block*, y por qué cada vez más CSS profesional se escribe así.

## Físico contra lógico

Las propiedades que conoces (`left`, `right`, `top`, `bottom`, `width`, `height`) son **físicas**: se refieren a los lados de la **pantalla**.

Las **lógicas** se refieren a la **dirección del texto**:

- **Inline** (*en línea*): la dirección en la que se escribe una línea de texto. En español, de izquierda a derecha → **horizontal**.
- **Block** (*en bloque*): la dirección en la que se apilan los párrafos, uno debajo de otro → **vertical**.

Y cada una tiene un **inicio** (*start*) y un **final** (*end*):

| Lógica | En español (de izquierda a derecha) |
| --- | --- |
| `inline-start` | izquierda |
| `inline-end` | derecha |
| `block-start` | arriba |
| `block-end` | abajo |
| `inline-size` | `width` |
| `block-size` | `height` |

En una web en español, `margin-inline-start` es exactamente lo mismo que `margin-left`. Entonces, ¿para qué cambiar? Por dos motivos.

## Motivo 1: escribes menos

Las propiedades lógicas tienen versiones **abreviadas** para los dos lados de un eje a la vez:

```css
/* Antes */
margin-left: auto;
margin-right: auto;

/* Ahora */
margin-inline: auto;
```

```css
/* Antes */
padding-top: 16px;
padding-bottom: 32px;

/* Ahora: primero el inicio, luego el final */
padding-block: 16px 32px;
```

Todas las combinaciones:

| Propiedad | Qué hace |
| --- | --- |
| `margin-inline` / `margin-block` | Márgenes a los dos lados del eje |
| `padding-inline` / `padding-block` | Relleno a los dos lados del eje |
| `border-inline` / `border-block` | Bordes a los dos lados |
| `inset` | `top`, `right`, `bottom` y `left` a la vez |
| `inset-inline` / `inset-block` | Las posiciones de un eje |
| `inline-size` / `block-size` | Ancho y alto |
| `max-inline-size` / `min-block-size` | Máximos y mínimos |

### Un ejemplo de los que usas cada día

```html playground=logicas
<header class="cabecera">
  <strong>MiTienda</strong>
  <nav class="menu">
    <a href="#">Inicio</a>
    <a href="#">Productos</a>
    <a href="#">Contacto</a>
  </nav>
</header>

<main class="contenedor">
  <h1>Ofertas de la semana</h1>
  <p class="destacado">Envío gratis en compras desde S/ 100.</p>
  <p>Encuentra teclados, monitores y todo lo que necesitas para tu escritorio.</p>
</main>

<div class="modal-fondo">
  <div class="modal">Soy un modal centrado con <code>inset: 0</code></div>
</div>
```

```css playground=logicas
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.cabecera {
  display: flex;
  justify-content: space-between;
  padding-block: 12px;
  padding-inline: 24px;
  border-block-end: 1px solid #e4e4e7;
}

.menu a {
  margin-inline-start: 16px; /* separa cada enlace del anterior */
}

.contenedor {
  max-inline-size: 640px;  /* max-width */
  margin-inline: auto;     /* centrado horizontal */
  padding-inline: 16px;
}

.destacado {
  padding-block: 8px;
  padding-inline-start: 12px;
  border-inline-start: 4px solid #fbbf24; /* la barrita a la izquierda */
  background: #fef3c7;
}

.modal-fondo {
  position: fixed;
  inset: 0; /* top: 0; right: 0; bottom: 0; left: 0; */
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 0.4);
}

.modal {
  padding: 24px;
  border-radius: 12px;
  background: white;
}
```

`inset: 0` es probablemente la propiedad lógica que más se usa: cubrir toda la pantalla (un fondo de modal, una capa encima de una imagen) en una línea en lugar de cuatro.

## Motivo 2: funciona en todos los idiomas

Hay idiomas que se escriben **de derecha a izquierda** (RTL, *right to left*), como el árabe o el hebreo. Y otros, como el japonés, pueden escribirse **en vertical**.

Si tu `.destacado` tiene `border-left`, en árabe la barrita quedaría en el lado **equivocado**: al final de la línea, en vez de al principio. Con `border-inline-start`, el navegador la pone **siempre al inicio del texto**, sea cual sea el idioma.

Pruébalo: en el ejemplo del playground, añade `dir="rtl"` a la etiqueta `<main>`:

```html
<main class="contenedor" dir="rtl">
```

La barrita amarilla salta a la derecha, que es donde **empieza** el texto en un idioma RTL. Sin tocar el CSS.

Aunque tu web solo esté en español, escribir CSS lógico te prepara para traducirla (lo viste en el post de hreflang y sitios multiidioma) y es lo que verás cada vez más en el código profesional y en frameworks como Tailwind (`ms-4`, `pe-2`, `ps-6` son *margin-start*, *padding-end* y *padding-start*).

## Flexbox y Grid ya eran lógicos

¿Te has fijado en que en Flexbox usas `justify-content: flex-start` y no `left`? ¿Y en `align-items: start`? Flexbox y Grid **siempre** han usado inicio y final. Las propiedades lógicas llevan esa misma idea al resto de CSS.

## ¿Lo uso siempre?

Una guía práctica:

- ✅ **Úsalas por defecto** para márgenes, rellenos, bordes y tamaños: `margin-inline`, `padding-block`, `inline-size`.
- ✅ **`inset`** para posicionar con `position: absolute` o `fixed`.
- 🤔 **Mantén las físicas** cuando de verdad te refieres a la pantalla y no al texto. Una sombra que siempre cae hacia abajo, o una animación que entra por la izquierda, no deberían cambiar con el idioma.
- ⚠️ Las esquinas también tienen versión lógica, con nombres más largos: `border-start-start-radius` es la esquina de inicio de bloque e inicio de línea (arriba a la izquierda en español).

## Tu turno

En el playground:

1. Reescribe con propiedades lógicas este CSS: `width: 300px; margin-top: 0; margin-bottom: 24px; padding-left: 16px; padding-right: 16px; border-left: 2px solid;`.
2. Crea una tarjeta con una "etiqueta" en la esquina superior final usando `position: absolute` e `inset-block-start` / `inset-inline-end`.
3. Añade `dir="rtl"` a tu tarjeta y comprueba que la etiqueta cambia de esquina.

## Errores comunes

- **Confundir el orden de los valores**: `padding-block: 8px 16px` es inicio (arriba) y final (abajo), no izquierda y derecha.
- **Mezclar físicas y lógicas** para el mismo lado (`margin-left` y `margin-inline-start`): gana la que va después, y cuesta entender qué pasa.
- **Pensar que `inline` siempre es horizontal.** Lo es en español; en un texto vertical no.
- **Usar `inset` sin `position`.** Como `top` o `left`, solo funciona en elementos posicionados.

## Para profundizar

- [Propiedades y valores lógicos en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_logical_properties_and_values)
- [Conceptos básicos de las propiedades lógicas (MDN, en inglés)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values/Basic_concepts_of_logical_properties_and_values)

En resumen: las **propiedades lógicas** usan la dirección del texto en lugar de los lados de la pantalla: **inline** es la línea de texto (horizontal en español) y **block**, la dirección en la que se apilan los párrafos (vertical). **`margin-inline`**, **`padding-block`**, **`inline-size`** e **`inset`** hacen tu CSS más corto y, con **`start`** y **`end`**, se adaptan solos a idiomas de derecha a izquierda.
