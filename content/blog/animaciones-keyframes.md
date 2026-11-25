---
title: 'Animaciones con @keyframes: un loader, un skeleton y un botón que late'
description: 'Aprende a crear animaciones con CSS puro: define los pasos con @keyframes y aplícalos con animation.'
date: 2026-11-25
series: css
tags: [CSS, Animaciones]
draft: true
order: 19
---

En el post de botones usamos `transition`, que anima **de un estado a otro** (por ejemplo, al hacer hover). Pero ¿y si quieres algo que se mueva **solo**, en bucle, sin que nadie lo toque? Para eso está `@keyframes`.

## Cómo funciona

Son dos pasos:

1. **Defines la animación** con `@keyframes` y le das un nombre. Ahí dices cómo se ve al principio (`from`) y al final (`to`), o en porcentajes.
2. **La aplicas** a un elemento con la propiedad `animation`.

```css
/* 1. Definir */
@keyframes girar {
  from { rotate: 0deg; }
  to   { rotate: 360deg; }
}

/* 2. Aplicar: nombre, duración, ritmo, repeticiones */
.loader {
  animation: girar 1s linear infinite;
}
```

## 1. Un loader que gira

```html playground=loader
<div class="loader" role="status" aria-label="Cargando"></div>
```

```css playground=loader
body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #e4e4e7;
  border-top-color: #2563eb; /* solo un lado de color: eso es lo que "gira" */
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to {
    rotate: 360deg;
  }
}
```

Si solo pones `to`, el navegador usa como punto de partida el estado normal del elemento.

## 2. Un skeleton (la tarjeta "cargando")

Esas cajas grises que brillan mientras carga el contenido, como en YouTube o LinkedIn:

```html playground=skeleton
<article class="tarjeta">
  <div class="skeleton imagen"></div>
  <div class="skeleton linea"></div>
  <div class="skeleton linea corta"></div>
</article>
```

```css playground=skeleton
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjeta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 280px;
}

.skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, #e4e4e7 25%, #f4f4f5 50%, #e4e4e7 75%);
  background-size: 200% 100%;
  animation: brillo 1.4s ease-in-out infinite;
}

.imagen { height: 150px; }
.linea { height: 16px; }
.corta { width: 60%; }

@keyframes brillo {
  from { background-position: 100% 0; }
  to   { background-position: -100% 0; }
}
```

El truco: un degradado el doble de ancho que la caja, y la animación lo **desliza** de derecha a izquierda.

## 3. Un botón que late

Usando porcentajes puedes tener más de dos pasos:

```html playground=latido
<button class="btn">❤️ Suscríbete</button>
```

```css playground=latido
body {
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 999px;
  background: #dc2626;
  color: white;
  font: inherit;
  font-weight: 600;
  animation: latido 1.5s ease-in-out infinite;
}

@keyframes latido {
  0%, 100% { scale: 1; }
  15%      { scale: 1.08; }
  30%      { scale: 1; }
  45%      { scale: 1.08; }
}
```

## Las partes de `animation`

```css
animation: latido 1.5s ease-in-out infinite;
/*         nombre  duración  ritmo   repeticiones */
```

- **Ritmo** (*timing function*): `linear` (constante, ideal para girar), `ease-in-out` (arranca y termina suave).
- **Repeticiones**: un número (`3`) o `infinite`.
- Otros útiles: `animation-delay` (esperar antes de empezar) y `alternate` (ir y volver).

## Errores comunes

- **Animar `width`, `top` o `margin`.** Obligas al navegador a recalcular toda la página y puede ir a saltos. Anima `transform` (`rotate`, `scale`, `translate`) y `opacity`.
- **Animaciones infinitas por todos lados.** Distraen. Úsalas para estados de carga o para llamar la atención **una** vez.
- **Ignorar `prefers-reduced-motion`.** Si el usuario pidió menos movimiento, apágalas.

```css
@media (prefers-reduced-motion: reduce) {
  .btn { animation: none; }
}
```

## Para profundizar

- [Usar animaciones CSS en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_animations/Using_CSS_animations)
- [`@keyframes` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/@keyframes)

En resumen: **`@keyframes`** define los pasos, **`animation`** los aplica, y anima siempre **`transform` y `opacity`** para que vaya fluido.
