---
title: 'px, rem, em, %, vh: qué unidad CSS usar y cuándo'
description: 'Una guía rápida de las unidades de CSS con una regla simple para cada caso.'
date: 2026-11-25
series: css
tags: [CSS, Fundamentos, Responsive]
draft: true
order: 13
---

En CSS puedes escribir `16px`, `1rem`, `1em`, `50%` o `100vh`, y a veces se ven igual. Pero se comportan distinto cuando cambia la pantalla o el tamaño de letra del usuario. Vamos con una regla para cada una.

## `px`: tamaño fijo

Un píxel es un píxel. No cambia con nada.

**Úsalo para:** bordes, sombras y detalles pequeños que no tienen que crecer. `border: 1px solid`.

## `rem`: relativo a la letra de la página

`1rem` es el tamaño de letra del elemento raíz (`<html>`), que por defecto es **16px**. Entonces `2rem = 32px`, `0.5rem = 8px`.

La gracia: si una persona con problemas de visión sube el tamaño de letra de su navegador a 20px, **todo lo que esté en `rem` crece con ella**. Con `px`, no.

**Úsalo para:** tamaños de letra, y en general espacios (`padding`, `margin`, `gap`).

## `em`: relativo a la letra del propio elemento

`1em` es el tamaño de letra **del elemento donde lo usas** (o de su padre, si lo usas en `font-size`).

**Úsalo para:** cosas que tienen que crecer con su propio texto, como el `padding` de un botón.

```html playground=em
<button class="btn">Normal</button>
<button class="btn grande">Grande</button>
<button class="btn gigante">Gigante</button>
```

```css playground=em
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.btn {
  /* El padding crece con el tamaño de letra de cada botón */
  padding: 0.5em 1em;
  border: none;
  border-radius: 0.4em;
  background: #2563eb;
  color: white;
  font-size: 1rem;
}

.grande {
  font-size: 1.5rem;
}

.gigante {
  font-size: 2rem;
}
```

Solo cambiamos `font-size` y el botón entero se escaló: padding y bordes redondeados incluidos.

**Cuidado:** `em` se multiplica si anidas elementos. Un `font-size: 1.2em` dentro de otro `1.2em` da `1.44em`. Por eso para letras es más seguro `rem`.

## `%`: relativo al padre

`width: 50%` es la mitad del ancho **del contenedor**.

**Úsalo para:** anchos dentro de un contenedor. `width: 100%` en una imagen para que nunca se salga.

## `vw` y `vh`: relativos a la pantalla

`1vw` es el 1% del **ancho** de la ventana y `1vh` el 1% del **alto**.

**Úsalo para:** secciones de pantalla completa, como un hero.

```css
.hero {
  min-height: 100vh;
}
```

**Ojo en el celular:** `100vh` a veces queda más alto que la pantalla porque no cuenta la barra del navegador. Usa `100dvh` (*dynamic viewport height*), que se ajusta cuando la barra aparece y desaparece.

## Chuleta rápida

| Para… | Usa |
| --- | --- |
| Tamaño de letra | `rem` |
| Espacios (padding, margin, gap) | `rem` |
| Padding de un botón | `em` |
| Bordes y sombras | `px` |
| Ancho dentro de un contenedor | `%` |
| Alto de pantalla completa | `dvh` |

## Errores comunes

- **Todo en `px`.** Tu web ignora el tamaño de letra que eligió el usuario.
- **`height: 100%` que no funciona.** El `%` en alto necesita que el padre tenga un alto definido. Muchas veces lo que buscas es `min-height: 100dvh`.
- **`width: 100vw` y aparece scroll horizontal.** `100vw` incluye la barra de scroll. Usa `width: 100%`.

## Para profundizar

- [Valores y unidades de CSS en MDN](https://developer.mozilla.org/es/docs/Learn/CSS/Building_blocks/Values_and_units)
- [`<length>` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/length)

En resumen: **`rem`** para letras y espacios, **`em`** para lo que crece con su texto, **`px`** para detalles, **`%`** dentro del contenedor y **`dvh`** para la pantalla.
