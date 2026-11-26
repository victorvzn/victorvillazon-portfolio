---
title: 'Media queries y mobile first: tu web en cualquier pantalla'
description: 'Qué son las media queries, cómo se escriben, por qué conviene empezar por el móvil y qué puntos de corte usar. Con un layout real paso a paso.'
date: 2026-11-26
series: css
tags: [CSS, Responsive, Fundamentos]
draft: true
---

Más de la mitad de las visitas a una web llegan desde un móvil. Una web **responsive** es la que se adapta a cualquier pantalla: una columna en el teléfono, dos en la tablet, tres en el ordenador. La herramienta clásica para conseguirlo son las **media queries**.

Antes de empezar, asegúrate de que tu HTML tiene esta línea en el `<head>`. Sin ella, el móvil finge ser una pantalla de escritorio y nada de esto funciona:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Qué es una media query

Es un bloque de CSS que **solo se aplica si se cumple una condición** sobre la pantalla:

```css
/* Estas reglas solo se aplican cuando la pantalla mide 768px o más */
@media (min-width: 768px) {
  .tarjetas {
    grid-template-columns: 1fr 1fr;
  }
}
```

Léelo como un `if` de CSS: "si el ancho mínimo es 768px, aplica esto".

## Mobile first: empieza por el móvil

Hay dos formas de pensar el responsive:

- **Desktop first**: escribes el diseño de escritorio y luego lo "arreglas" para el móvil con `max-width`.
- **Mobile first**: escribes primero el diseño del **móvil** (sin media queries) y vas **añadiendo** cosas para pantallas grandes con `min-width`.

Usa **mobile first**. Los diseños de móvil suelen ser más simples (todo en una columna), así que el CSS base es corto, y cada media query solo **añade** cambios en vez de deshacerlos.

## Un layout real paso a paso

Una página con cabecera, menú, contenido y tarjetas. Haz la ventana del playground más estrecha y más ancha para ver cómo cambia:

```html playground=layout
<header class="cabecera">
  <strong>MiTienda</strong>
  <nav class="menu">
    <a href="#">Inicio</a>
    <a href="#">Productos</a>
    <a href="#">Contacto</a>
  </nav>
</header>

<main class="tarjetas">
  <article class="tarjeta">Producto 1</article>
  <article class="tarjeta">Producto 2</article>
  <article class="tarjeta">Producto 3</article>
  <article class="tarjeta">Producto 4</article>
  <article class="tarjeta">Producto 5</article>
  <article class="tarjeta">Producto 6</article>
</main>
```

```css playground=layout
/* 1. Base: el móvil (sin media queries) */
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.cabecera {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #18181b;
  color: white;
}

.menu {
  display: flex;
  gap: 16px;
}

.menu a {
  color: white;
}

.tarjetas {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px;
}

.tarjeta {
  padding: 32px 16px;
  border-radius: 12px;
  background: #fef3c7;
  text-align: center;
}

/* 2. Tablet: dos columnas */
@media (min-width: 600px) {
  .cabecera {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .tarjetas {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 3. Escritorio: tres columnas y un ancho máximo */
@media (min-width: 1000px) {
  .tarjetas {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1100px;
    margin: 0 auto;
  }
}
```

Fíjate en que cada media query **solo cambia lo necesario**. El color de las tarjetas, el padding o la fuente se escriben una vez, en la base.

## ¿Qué puntos de corte uso?

Los **puntos de corte** (*breakpoints*) son los anchos donde cambia el diseño. Unos valores habituales:

| Nombre | Desde | Pantallas típicas |
| --- | --- | --- |
| Base | 0 | Móviles |
| `sm` | 640px | Móviles grandes en horizontal |
| `md` | 768px | Tablets |
| `lg` | 1024px | Portátiles |
| `xl` | 1280px | Pantallas grandes |

Pero la mejor regla es otra: **no elijas el punto de corte por dispositivos, sino por tu contenido**. Haz la ventana más ancha poco a poco y, cuando el diseño empiece a verse raro (líneas demasiado largas, mucho espacio vacío), ahí va una media query.

## Más allá del ancho

Las media queries pueden preguntar por otras cosas, además del tamaño:

```css
/* El usuario tiene el modo oscuro activado en su sistema */
@media (prefers-color-scheme: dark) {
  body {
    background: #18181b;
    color: #fafafa;
  }
}

/* El usuario pidió reducir las animaciones */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* La pantalla está en horizontal */
@media (orientation: landscape) {
  .galeria {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

`prefers-reduced-motion` es importante para la accesibilidad: hay personas a las que las animaciones les provocan mareos.

## La sintaxis moderna

Los navegadores actuales también entienden una forma más legible, con símbolos de comparación:

```css
@media (width >= 768px) { /* igual que (min-width: 768px) */ }
@media (600px <= width < 1000px) { /* solo entre esos dos anchos */ }
```

Funciona en todos los navegadores modernos. Si tu proyecto tiene que soportar navegadores viejos, sigue con `min-width`.

## Errores comunes

- **Olvidar la etiqueta `viewport`.** El error número uno: las media queries "no funcionan" en el móvil.
- **Mezclar `min-width` y `max-width` sin orden.** Elige mobile first y usa solo `min-width`, ordenadas de menor a mayor.
- **Poner la media query antes de la regla base.** Si la base va después, la pisa. Las media queries van **al final** (o justo debajo de la regla que modifican).
- **Una media query para cada móvil del mercado.** Con 2 o 3 puntos de corte bien elegidos es suficiente.

## Para profundizar

- [Usar media queries, en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_media_queries/Using_media_queries)

En resumen: una **media query** aplica CSS solo si se cumple una condición. Trabaja **mobile first**: el móvil en la base y **`min-width`** para ir añadiendo cambios en pantallas grandes. Y para algunos casos ni siquiera las necesitas: mira el post de responsive sin media queries.
