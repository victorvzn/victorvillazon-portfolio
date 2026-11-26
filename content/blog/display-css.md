---
title: 'display en CSS: block, inline, inline-block y none'
description: '¿Por qué no funciona el width en mi span? La propiedad display explica cómo se comporta cada elemento. Block, inline, inline-block, none y cuándo usar cada uno.'
date: 2026-11-26
series: css
tags: [CSS, Fundamentos, Layout]
draft: true
---

Le pones `width: 200px` a un `<span>` y no pasa nada. Le pones `margin-top` a un enlace y tampoco. No es un bug: es la propiedad **`display`**, que decide **cómo se comporta** cada elemento en la página.

## Block: ocupa toda la fila

Los elementos **block** (bloque) se comportan como ladrillos apilados:

- Empiezan en una **línea nueva**.
- Ocupan **todo el ancho** disponible, aunque su contenido sea corto.
- Respetan `width`, `height`, `margin` y `padding` en todas las direcciones.

Son block por defecto: `div`, `p`, `h1`…`h6`, `section`, `article`, `header`, `ul`, `li`, `form`...

## Inline: fluye con el texto

Los elementos **inline** (en línea) se comportan como palabras dentro de un párrafo:

- **No** empiezan línea nueva: se colocan uno al lado del otro.
- Ocupan **solo lo que mide su contenido**.
- **Ignoran `width` y `height`**, y el `margin` vertical no empuja a nada.

Son inline por defecto: `span`, `a`, `strong`, `em`, `code`, `img`...

Míralo en acción:

```html playground=block-inline
<div class="caja">Soy un div (block)</div>
<div class="caja">Yo también, por eso estoy debajo</div>

<p>
  Esto es un párrafo con
  <span class="etiqueta">un span</span>
  y <span class="etiqueta">otro span</span> dentro.
  A los span les puse width y margin-top, pero los ignoran.
</p>
```

```css playground=block-inline
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.caja {
  margin-bottom: 8px;
  padding: 12px;
  background: #dbeafe;
}

.etiqueta {
  width: 300px;      /* ignorado: es inline */
  margin-top: 40px;  /* ignorado en vertical */
  padding: 4px 8px;
  background: #fef3c7;
}
```

## Inline-block: lo mejor de los dos

**`inline-block`** se coloca en línea (como un inline) pero **respeta** `width`, `height` y los márgenes (como un block). Es perfecto para botones, etiquetas o insignias:

```html playground=inline-block
<p>
  Etiquetas:
  <a href="#" class="chip">HTML</a>
  <a href="#" class="chip">CSS</a>
  <a href="#" class="chip">JavaScript</a>
</p>
```

```css playground=inline-block
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.chip {
  display: inline-block;
  min-width: 80px;
  margin: 4px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #18181b;
  color: white;
  text-align: center;
  text-decoration: none;
}
```

Los enlaces siguen uno al lado del otro, pero ahora tienen un ancho mínimo y un área de clic más grande.

## None: desaparecer del todo

**`display: none`** quita el elemento de la página: no se ve, no ocupa espacio y los lectores de pantalla lo ignoran. Se usa muchísimo con JavaScript para mostrar y ocultar cosas (menús, modales, mensajes).

No lo confundas con **`visibility: hidden`**, que lo hace invisible pero **sigue ocupando su hueco**:

```html playground=none
<div class="fila">
  <div class="cuadro">1</div>
  <div class="cuadro oculto-none">2</div>
  <div class="cuadro">3</div>
</div>

<div class="fila">
  <div class="cuadro">1</div>
  <div class="cuadro oculto-visibility">2</div>
  <div class="cuadro">3</div>
</div>
```

```css playground=none
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.fila {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.cuadro {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  background: #dcfce7;
}

.oculto-none {
  display: none;        /* desaparece y el 3 se mueve */
}

.oculto-visibility {
  visibility: hidden;   /* invisible, pero deja su hueco */
}
```

En HTML también existe el atributo **`hidden`** (`<div hidden>`), que hace lo mismo que `display: none`. Es muy cómodo desde JavaScript: `elemento.hidden = true`.

## Flex y grid: display para colocar a los hijos

`display: flex` y `display: grid` también son valores de `display`, pero hacen algo distinto: el elemento sigue siendo un bloque, y lo que cambia es **cómo coloca a sus hijos**. Tienen sus propios posts (Flexbox y Grid), así que aquí solo te quedas con la idea.

## Resumen en una tabla

| Valor | ¿Línea nueva? | ¿Respeta width/height? | Úsalo para |
| --- | --- | --- | --- |
| `block` | Sí | Sí | Secciones, contenedores, párrafos |
| `inline` | No | No | Texto dentro de texto: negritas, enlaces |
| `inline-block` | No | Sí | Botones, etiquetas, insignias |
| `none` | — | — | Ocultar por completo |
| `flex` / `grid` | Sí | Sí | Colocar a los hijos |

## Errores comunes

- **Poner `width` a un inline.** Si no funciona, revisa el `display`. Cámbialo a `inline-block` o `block`.
- **Un enlace con área de clic diminuta.** Un `<a>` es inline: dale `display: inline-block` y padding para que sea fácil de pulsar en el móvil.
- **Ocultar con `display: none` algo que debería leer un lector de pantalla.** Para eso hay una clase `.sr-only` (la ves en el post de la tarjeta de producto).
- **Pensar que `display` lo cambia todo.** Un `<div>` con `display: inline` sigue siendo un `div` para el HTML: solo cambia cómo se ve.

## Para profundizar

- [La propiedad `display` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/display)

En resumen: **block** ocupa toda la fila, **inline** fluye con el texto e ignora `width`, **inline-block** fluye pero respeta tamaños y **none** hace desaparecer. Cuando un tamaño "no funciona", lo primero que debes revisar es el `display`.
