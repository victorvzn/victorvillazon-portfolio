---
title: 'Cómo centrar un div: todas las formas (y cuál usar)'
description: 'El meme más famoso de CSS, resuelto de una vez. Centrar en horizontal, en vertical y en las dos direcciones.'
date: 2026-11-25
series: css
tags: [CSS, Layout]
draft: true
order: 18
---

"¿Cómo centro un div?" es el chiste más viejo de CSS. Durante años fue difícil de verdad. Hoy tienes varias formas fáciles; solo hay que saber cuál usar en cada caso.

## Primero: ¿centrar qué?

- **Texto** dentro de una caja.
- Una **caja** en horizontal.
- Una caja en **horizontal y vertical** a la vez.

Cada caso tiene su solución.

## Centrar texto

```css
.titulo {
  text-align: center;
}
```

`text-align` centra el **contenido en línea** (texto, imágenes, enlaces), no la caja en sí.

## Centrar una caja en horizontal

Dale un ancho y `margin-inline: auto` (márgenes automáticos a izquierda y derecha):

```css
.contenedor {
  max-width: 600px;
  margin-inline: auto;
}
```

El navegador reparte el espacio sobrante en partes iguales a cada lado. Es la forma clásica de centrar el contenido de una página.

## Centrar en las dos direcciones: Grid

La forma más corta que existe:

```html playground=grid
<div class="contenedor">
  <div class="caja">¡Centrado!</div>
</div>
```

```css playground=grid
body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

.contenedor {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: #f4f4f5;
}

.caja {
  padding: 24px 32px;
  border-radius: 12px;
  background: #18181b;
  color: white;
}
```

`place-items: center` centra en horizontal y vertical a la vez. Fíjate en el `min-height`: si el contenedor no tiene alto, no hay espacio vertical donde centrar.

## Centrar en las dos direcciones: Flexbox

Igual de válido, y útil si el contenedor ya es flex:

```html playground=flex
<div class="contenedor">
  <div class="caja">También centrado</div>
</div>
```

```css playground=flex
body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

.contenedor {
  display: flex;
  justify-content: center; /* horizontal */
  align-items: center;     /* vertical */
  min-height: 100vh;
  background: #f4f4f5;
}

.caja {
  padding: 24px 32px;
  border-radius: 12px;
  background: #2563eb;
  color: white;
}
```

## Centrar algo encima de todo: `position`

Para un elemento con `position: absolute` o `fixed` (un loader o un aviso):

```css
.loader {
  position: fixed;
  inset: 0;
  margin: auto;
  width: 80px;
  height: 80px;
}
```

`inset: 0` lo estira a los cuatro lados, y `margin: auto` lo centra porque tiene ancho y alto fijos. Este truco es el mismo que usa `<dialog>` por dentro.

## ¿Cuál uso?

| Quiero centrar… | Usa |
| --- | --- |
| Texto | `text-align: center` |
| La página en horizontal | `max-width` + `margin-inline: auto` |
| Algo en las dos direcciones | `display: grid` + `place-items: center` |
| Varios elementos en fila | Flexbox con `justify-content` y `align-items` |
| Algo flotante encima de todo | `position: fixed` + `inset: 0` + `margin: auto` |

## Errores comunes

- **Centrar en vertical sin alto.** Si el contenedor mide lo mismo que su contenido, no hay nada que centrar. Dale `min-height`.
- **`margin: auto` sin ancho.** Un bloque sin `width` ni `max-width` ya ocupa todo el ancho; no queda espacio que repartir.
- **El viejo truco de `top: 50%; transform: translate(-50%, -50%)`.** Funciona, pero hoy casi nunca lo necesitas.

## Para profundizar

- [Centrar un elemento en MDN](https://developer.mozilla.org/es/docs/Web/CSS/How_to/Layout_cookbook/Center_an_element)
- [`place-items` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/place-items)

En resumen: **`display: grid; place-items: center`** resuelve el 90% de los casos. El meme ya no tiene gracia.
