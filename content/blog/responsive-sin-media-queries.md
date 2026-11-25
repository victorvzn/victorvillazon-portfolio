---
title: 'Responsive sin media queries: clamp(), min() y auto-fit'
description: 'Títulos que crecen solos, contenedores que nunca se salen y grids que se reacomodan. Diseño responsive con muy poco código.'
date: 2026-11-25
series: css
tags: [CSS, Responsive]
draft: true
order: 17
---

Cuando aprendes responsive, lo primero que ves son las media queries:

```css
h1 { font-size: 24px; }
@media (min-width: 768px) { h1 { font-size: 36px; } }
@media (min-width: 1200px) { h1 { font-size: 48px; } }
```

Funciona, pero el título **salta** de un tamaño a otro. Hoy CSS tiene funciones que hacen que las cosas se adapten **de forma fluida**, sin saltos y con una sola línea.

## `min()`: el más pequeño de los dos

`min()` elige el valor **más pequeño**. Perfecto para contenedores:

```css
.contenedor {
  width: min(1100px, 100% - 32px);
  margin-inline: auto;
}
```

Léelo así: "mide 1100px, pero **nunca más que** la pantalla menos 16px a cada lado". En el celular ocupa casi todo; en el escritorio se queda en 1100px y centrado.

También existe `max()`, que elige el más grande.

## `clamp()`: un valor con mínimo y máximo

`clamp(mínimo, ideal, máximo)` es la estrella del responsive fluido:

```html playground=clamp
<h1>Este título crece con la pantalla</h1>
<p>Cambia el ancho de la vista previa y míralo crecer o encogerse sin saltos.</p>
```

```css playground=clamp
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

h1 {
  /* nunca menos de 1.75rem, nunca más de 3.5rem, y en medio crece con el ancho */
  font-size: clamp(1.75rem, 1rem + 4vw, 3.5rem);
  line-height: 1.1;
}

p {
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  max-width: 60ch;
}
```

El valor del medio (`1rem + 4vw`) mezcla una base fija con un poco del ancho de pantalla. `clamp()` se asegura de que nunca baje del mínimo ni pase del máximo.

¿Y `60ch`? Es el ancho de unos 60 caracteres. Las líneas de texto se leen mejor entre 45 y 75 caracteres.

## `auto-fit` + `minmax()`: el grid que se acomoda solo

Ya lo vimos en el post de Grid, pero merece estar aquí:

```html playground=grid
<div class="tarjetas">
  <article>Tarjeta 1</article>
  <article>Tarjeta 2</article>
  <article>Tarjeta 3</article>
  <article>Tarjeta 4</article>
</div>
```

```css playground=grid
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 16px;
}

article {
  padding: 24px;
  border-radius: 12px;
  background: #e0e7ff;
}
```

4 columnas en el escritorio, 2 en una tablet, 1 en el celular. Sin una sola media query.

El `min(220px, 100%)` de adentro evita que en pantallas **muy** pequeñas (menos de 220px) la tarjeta se salga.

## `flex-wrap`: el responsive de Flexbox

Si los elementos están en flex, `flex-wrap: wrap` los pasa a la siguiente línea cuando no caben:

```css
.botones {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
```

## ¿Entonces ya no uso media queries?

Sí las usas, pero **menos**. Siguen siendo la mejor opción para cambios grandes de estructura: esconder un menú y mostrar un botón de hamburguesa, o pasar una sidebar abajo.

## Errores comunes

- **Usar solo `vw` para el tamaño de letra.** `font-size: 5vw` queda diminuto en el celular y gigante en una pantalla grande. Usa `clamp()`.
- **Olvidar la unidad en `clamp()`.** Las tres partes necesitan unidad: `clamp(1rem, 2vw, 2rem)`.
- **Texto que ocupa todo el ancho.** Líneas de 150 caracteres cansan. Ponle `max-width` en `ch`.

## Para profundizar

- [`clamp()` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp)
- [`min()` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/min)
- [Diseño responsive en MDN](https://developer.mozilla.org/es/docs/Learn/CSS/CSS_layout/Responsive_Design)

En resumen: **`min()`** para contenedores, **`clamp()`** para letras y espacios fluidos, **`auto-fit` + `minmax()`** para grids, y media queries solo para los cambios grandes.
