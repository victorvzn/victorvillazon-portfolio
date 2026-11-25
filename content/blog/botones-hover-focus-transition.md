---
title: 'Botones que se sienten bien: hover, focus-visible y transition'
description: 'Microinteracciones con puro CSS: cómo hacer que un botón responda al mouse, al teclado y al clic.'
date: 2026-11-25
series: css
tags: [CSS, Accesibilidad, UX]
draft: true
order: 16
---

Un buen botón **responde**: cuando pasas el mouse, cuando lo navegas con el teclado y cuando haces clic. Esas pequeñas reacciones se llaman *microinteracciones* y hacen que una web se sienta viva. Todo con CSS.

## Los 4 estados de un botón

- `:hover`: el mouse está encima.
- `:active`: lo estás presionando.
- `:focus-visible`: está seleccionado **con el teclado** (con `Tab`).
- `:disabled`: no se puede usar.

## De botón soso a botón con vida

```html playground=estados
<button class="btn">Comprar ahora</button>
<button class="btn" disabled>Agotado</button>
```

```css playground=estados
body {
  font-family: system-ui, sans-serif;
  display: flex;
  gap: 12px;
  padding: 24px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  /* Anima los cambios en vez de hacerlos de golpe */
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
}

.btn:hover {
  background: #1d4ed8;
  box-shadow: 0 6px 16px rgb(37 99 235 / 0.35);
}

/* Al presionar, se "hunde" un poquito */
.btn:active {
  transform: scale(0.96);
}

/* Solo cuando llegas con el teclado */
.btn:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 3px;
}

.btn:disabled {
  background: #a1a1aa;
  box-shadow: none;
  cursor: not-allowed;
}
```

Prueba pasar el mouse, hacer clic, y luego **pulsa `Tab`** para llegar al botón con el teclado. Verás el anillo amarillo.

## `transition`: la magia de lo suave

Sin `transition`, el color cambia de golpe. Con ella, el navegador anima el cambio:

```css
transition: background 0.2s;
/*          qué anima   cuánto dura */
```

Puedes animar varias propiedades separándolas con comas. Las que mejor se animan (más fluidas) son `transform` y `opacity`.

## `:focus` vs `:focus-visible`

Antes, mucha gente ponía `outline: none` porque el anillo de foco "se veía feo" al hacer clic. Eso deja a quien usa teclado **sin saber dónde está**.

`:focus-visible` resuelve el problema: el navegador muestra el foco **solo cuando hace falta** (con el teclado), no al hacer clic con el mouse. Así nadie pierde.

## Bonus: un botón con flecha que se mueve

```html playground=flecha
<a class="link" href="#">Ver todos los cursos <span>→</span></a>
```

```css playground=flecha
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.link {
  color: #18181b;
  font-weight: 600;
  text-decoration: none;
}

.link span {
  display: inline-block; /* transform no funciona en elementos inline */
  transition: transform 0.2s;
}

.link:hover span {
  transform: translateX(6px);
}
```

## Respeta a quien no quiere animaciones

Algunas personas sienten mareo con el movimiento y lo desactivan en su sistema. Puedes respetarlo así:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
```

Uno de los pocos casos donde `!important` está justificado.

## Errores comunes

- **`outline: none` sin poner otra cosa.** Rompes la navegación por teclado. Usa `:focus-visible`.
- **Transiciones lentas.** Más de 300ms en un botón se siente pesado. Entre 150ms y 250ms va bien.
- **`transition: all`.** Anima cosas que no esperabas y puede ir lento. Di qué propiedades animar.

## Para profundizar

- [`:focus-visible` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/:focus-visible)
- [Usar transiciones CSS en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_transitions/Using_CSS_transitions)
- [`prefers-reduced-motion` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)

En resumen: **`:hover`**, **`:active`** y **`:focus-visible`** para cada estado, **`transition`** para que los cambios sean suaves, y **nunca** quites el foco sin reemplazarlo.
