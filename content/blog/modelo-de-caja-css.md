---
title: 'El modelo de caja de CSS explicado con una caja de pizza'
description: 'margin, border, padding y content: entiende por qué tus elementos miden más de lo que dices y cómo lo arregla box-sizing.'
date: 2026-11-25
series: css
tags: [CSS, Fundamentos]
draft: true
order: 2
---

Para CSS, **todo es una caja**. Un párrafo, un botón, una imagen: todos son rectángulos. Si entiendes cómo se mide esa caja, la mitad de tus problemas de diseño desaparecen.

## La caja de pizza

Imagina que pides una pizza:

- **content**: la pizza. Es el contenido (texto, imagen).
- **padding**: el espacio entre la pizza y el borde de la caja. Es espacio **dentro** de la caja.
- **border**: el cartón de la caja.
- **margin**: el espacio entre tu caja y la del vecino. Es espacio **fuera** de la caja.

```html playground=partes
<div class="caja">Soy el contenido</div>
<div class="caja">Soy otra caja</div>
```

```css playground=partes
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.caja {
  padding: 20px;              /* espacio dentro */
  border: 4px solid #f59e0b;  /* el cartón */
  margin-bottom: 24px;        /* espacio con la siguiente caja */
  background: #fef3c7;        /* el fondo llega hasta el borde */
}
```

Fíjate que el color de fondo cubre el `padding`, pero no el `margin`. El `margin` siempre es transparente.

## El problema: tu caja mide más de lo que dices

Le das `width: 200px` a una caja, le pones `padding` y `border`… y mide más de 200px. ¿Por qué?

Porque por defecto, `width` solo mide la **pizza** (el content). El padding y el borde se **suman** por fuera.

```html playground=box-sizing
<div class="caja content-box">content-box</div>
<div class="caja border-box">border-box</div>
```

```css playground=box-sizing
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.caja {
  width: 200px;
  padding: 20px;
  border: 4px solid #18181b;
  margin-bottom: 16px;
  background: #e4e4e7;
}

/* El valor por defecto: 200 + 40 de padding + 8 de borde = 248px */
.content-box {
  box-sizing: content-box;
}

/* El padding y el borde se meten DENTRO de los 200px */
.border-box {
  box-sizing: border-box;
}
```

La segunda caja mide exactamente 200px. Mucho más fácil de razonar, ¿no?

## La línea que va en todos tus proyectos

Por eso casi todos los proyectos empiezan con esto:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

Así, cuando digas `width: 200px`, va a medir 200px. Punto.

## Truco: mira la caja en DevTools

Haz clic derecho en cualquier elemento → **Inspeccionar**. En la pestaña de estilos (abajo del todo) verás un dibujo con el content, el padding, el borde y el margin, cada uno de un color. Es la forma más rápida de descubrir de dónde sale un espacio raro.

## Errores comunes

- **Usar `margin` para separar el texto del borde.** Eso es `padding`. El `margin` separa cajas entre sí.
- **Márgenes que "desaparecen".** Si una caja tiene `margin-bottom: 20px` y la siguiente `margin-top: 30px`, la separación es **30px**, no 50. Los márgenes verticales se fusionan (*margin collapsing*).
- **Olvidar `box-sizing: border-box`** y luego pelear con anchos que nunca cuadran.

## Para profundizar

- [Introducción al modelo de caja en MDN](https://developer.mozilla.org/es/docs/Learn/CSS/Building_blocks/The_box_model)
- [`box-sizing` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/box-sizing)
- [Fusión de márgenes en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)

En resumen: **padding** es espacio dentro, **margin** es espacio fuera, y **`box-sizing: border-box`** hace que `width` mida lo que tú dices.
