---
title: 'Transform en CSS: mover, escalar y rotar elementos sin romper el layout'
description: 'translate, scale y rotate a fondo, el origen de la transformación, por qué animar transform es más fluido que animar top o width y efectos reales para botones y tarjetas.'
date: 2026-11-26
series: css
tags: [CSS, Animación]
draft: true
---

El botón que "crece" un poco al pasar el ratón. La tarjeta que se eleva. El icono de la flecha que gira al abrir un acordeón. El menú que entra deslizándose desde un lado. Todo eso se hace con **transformaciones**.

## Qué tiene de especial `transform`

Una transformación **cambia cómo se ve** un elemento (su posición, su tamaño, su ángulo), pero **no cambia su lugar en el layout**. Los demás elementos se quedan donde estaban, como si el elemento no se hubiera movido.

```html playground=layout
<div class="fila">
  <div class="caja">1</div>
  <div class="caja movida">2</div>
  <div class="caja">3</div>
</div>
```

```css playground=layout
body {
  font-family: system-ui, sans-serif;
  padding: 40px;
}

.fila {
  display: flex;
  gap: 12px;
}

.caja {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  background: #6366f1;
  color: white;
  font-size: 24px;
}

/* Se mueve 40px abajo y crece, pero la 1 y la 3 no se enteran */
.movida {
  translate: 0 40px;
  scale: 1.3;
  background: #f59e0b;
}
```

Si hubieras cambiado su `margin` o su `width`, las cajas 1 y 3 se habrían movido. Con transformaciones, no.

## Las tres transformaciones

Hoy cada una tiene **su propia propiedad**:

### `translate`: mover

```css
.elemento {
  translate: 20px;        /* 20px a la derecha */
  translate: 20px -10px;  /* 20px a la derecha y 10px arriba */
  translate: -50% 0;      /* la mitad de SU PROPIO ancho a la izquierda */
}
```

Los porcentajes en `translate` son **del propio elemento**, no del padre. Es muy útil: `translate: -100% 0` lo saca justo por la izquierda, mida lo que mida.

### `scale`: escalar

```css
.elemento {
  scale: 1.1;   /* un 10 % más grande */
  scale: 0.9;   /* un 10 % más pequeño */
  scale: 2 1;   /* el doble de ancho, mismo alto */
  scale: -1 1;  /* lo voltea horizontalmente, como un espejo */
}
```

### `rotate`: rotar

```css
.elemento {
  rotate: 45deg;   /* 45 grados en el sentido de las agujas del reloj */
  rotate: -90deg;  /* 90 grados en sentido contrario */
  rotate: 0.5turn; /* media vuelta */
}
```

> **La propiedad `transform`.** En muchos tutoriales verás todo junto en una sola propiedad: `transform: translateY(-4px) scale(1.05) rotate(5deg)`. Funciona igual y sigue siendo válido (y la necesitas para funciones como `skew`). Las propiedades separadas son más modernas y tienen una ventaja: puedes cambiar una sin tener que reescribir las demás.

## El punto de origen: `transform-origin`

Por defecto, `scale` y `rotate` se hacen **desde el centro** del elemento. Con `transform-origin` cambias ese punto:

```html playground=origen
<div class="demo">
  <div class="caja centro">centro</div>
  <div class="caja esquina">top left</div>
  <div class="caja abajo">bottom</div>
</div>
```

```css playground=origen
body {
  font-family: system-ui, sans-serif;
  padding: 60px;
}

.demo {
  display: flex;
  gap: 80px;
}

.caja {
  display: grid;
  place-items: center;
  width: 90px;
  height: 90px;
  border-radius: 10px;
  background: #22c55e;
  color: white;
  font-size: 13px;
  transition: rotate 0.6s;
}

.demo:hover .caja {
  rotate: 45deg;
}

.centro  { transform-origin: center; }
.esquina { transform-origin: top left; }
.abajo   { transform-origin: bottom; }
```

Pasa el ratón por encima: cada una gira alrededor de un punto distinto. `transform-origin: top` es lo que usarías, por ejemplo, para un menú que se "despliega" hacia abajo con `scale`.

## Por qué animar `transform` es más fluido

Puedes mover un elemento animando `left` o `margin`, o hacerlo crecer animando `width`. Pero cada cambio obliga al navegador a **recalcular el layout** de la página (dónde va cada cosa) en cada fotograma. Con muchos elementos, la animación va a saltos.

`transform` y `opacity` son especiales: el navegador los anima **sin recalcular el layout**, normalmente con la tarjeta gráfica. Resultado: animaciones fluidas incluso en móviles modestos.

**Regla:** para animar, usa **`translate`, `scale`, `rotate` y `opacity`** siempre que puedas.

## Efectos reales

```html playground=efectos
<div class="ejemplos">
  <button class="boton">Botón que crece</button>

  <article class="tarjeta">
    <h3>Tarjeta que se eleva</h3>
    <p>Pasa el ratón por encima.</p>
  </article>

  <details class="acordeon">
    <summary>Acordeón con flecha <span class="flecha" aria-hidden="true">▼</span></summary>
    <p>La flecha gira cuando se abre.</p>
  </details>
</div>
```

```css playground=efectos
body {
  font-family: system-ui, sans-serif;
  padding: 32px;
  background: #f4f4f5;
}

.ejemplos {
  display: grid;
  gap: 32px;
  max-width: 320px;
}

/* 1. Botón: crece al pasar el ratón y "se hunde" al pulsarlo */
.boton {
  justify-self: start;
  padding: 12px 22px;
  border: none;
  border-radius: 999px;
  background: #4f46e5;
  color: white;
  font: inherit;
  cursor: pointer;
  transition: scale 0.15s;
}

.boton:hover {
  scale: 1.05;
}

.boton:active {
  scale: 0.96;
}

/* 2. Tarjeta: sube un poco y gana sombra */
.tarjeta {
  padding: 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.06);
  transition: translate 0.2s, box-shadow 0.2s;
}

.tarjeta:hover {
  translate: 0 -6px;
  box-shadow: 0 14px 30px rgb(0 0 0 / 0.12);
}

.tarjeta h3 {
  margin: 0 0 4px;
}

/* 3. Acordeón: la flecha gira al abrir */
.acordeon summary {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  list-style: none;
}

.flecha {
  transition: rotate 0.2s;
}

.acordeon[open] .flecha {
  rotate: 180deg;
}
```

## Centrar con `translate`

Un truco clásico que verás en mucho código: centrar un elemento posicionado de forma absoluta.

```css
.centrado {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
}
```

`top: 50%` y `left: 50%` colocan la **esquina superior izquierda** en el centro del padre; `translate: -50% -50%` lo mueve hacia atrás la mitad de **su propio** tamaño. Hoy, con Grid o Flexbox (`place-items: center`) suele ser más sencillo, como vimos en el post de centrar un div.

## Transformaciones y accesibilidad

Los movimientos grandes (elementos que entran desde fuera de la pantalla, rotaciones, zooms) pueden **marear** a personas con trastornos vestibulares. Respeta la preferencia de **movimiento reducido** del sistema, que tiene su propio post:

```css
@media (prefers-reduced-motion: reduce) {
  .tarjeta,
  .boton {
    transition: none;
  }
}
```

## Tu turno

```html playground=ejercicio
<button class="menu-boton" aria-expanded="false" aria-label="Abrir menú">
  <span></span>
  <span></span>
  <span></span>
</button>
```

```css playground=ejercicio
body {
  padding: 40px;
}

.menu-boton {
  display: grid;
  gap: 6px;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
}

.menu-boton span {
  display: block;
  width: 28px;
  height: 3px;
  border-radius: 2px;
  background: #18181b;
  transition: translate 0.2s, rotate 0.2s, opacity 0.2s;
}

/* Cuando aria-expanded="true", convierte las tres rayas en una X:
   - la primera baja 9px y gira 45deg
   - la segunda desaparece (opacity)
   - la tercera sube 9px y gira -45deg */
```

```js playground=ejercicio
const boton = document.querySelector('.menu-boton')

boton.addEventListener('click', () => {
  const abierto = boton.getAttribute('aria-expanded') === 'true'
  boton.setAttribute('aria-expanded', String(!abierto))
})
```

## Errores comunes

- **Animar `width`, `height`, `top` o `margin`** para mover o agrandar. Usa `translate` y `scale`.
- **Usar `transform` en `:hover` y otra transformación en otro sitio.** Con la propiedad `transform`, la segunda **sustituye** a la primera. Con `translate`, `scale` y `rotate` separadas, no pasa.
- **Olvidar el `transform-origin`** cuando una rotación o un escalado "se va" hacia un lado.
- **Esperar que una transformación empuje a los demás.** No ocupa más sitio en el layout.
- **Transformaciones en elementos `inline`** (como un `<span>`). No funcionan; dale `display: inline-block` o `block`.
- **Crear contextos de apilamiento sin saberlo.** Una transformación crea uno, y puede cambiar qué queda encima (lo vimos en el post de `z-index`).

## Para profundizar

- [`translate` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/translate)
- [`scale` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/scale)
- [`rotate` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/rotate)
- [`transform-origin` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/transform-origin)

En resumen: **`translate`** mueve, **`scale`** escala y **`rotate`** gira, **sin cambiar el layout**. Usa **`transform-origin`** para elegir desde dónde, combínalas con **`transition`** para animarlas y recuerda que **`transform` y `opacity`** son las propiedades más fluidas para animar.
