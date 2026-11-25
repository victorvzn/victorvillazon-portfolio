---
title: 'clamp(): la línea de CSS que reemplaza tus media queries'
description: 'Títulos, espacios y tarjetas que se adaptan solos a cualquier pantalla con clamp(), min() y max(). Sin saltos y sin media queries.'
date: 2026-11-25
series: css
tags: [CSS, Responsive]
draft: true
# youtube: ID_DEL_VIDEO
---

¿Cuántas media queries escribes solo para que un título no se vea gigante en el celular?

```css
h1 { font-size: 32px; }
@media (min-width: 768px) { h1 { font-size: 48px; } }
@media (min-width: 1200px) { h1 { font-size: 64px; } }
```

Tres reglas, y aun así el título **salta** de golpe de un tamaño a otro. Con `clamp()` lo resuelves en una línea, y el tamaño cambia de forma suave:

```css
h1 { font-size: clamp(2rem, 1rem + 4vw, 4rem); }
```

## Cómo se lee `clamp()`

`clamp()` recibe tres valores: **mínimo, ideal y máximo**.

```css
clamp(MÍNIMO, IDEAL, MÁXIMO)
```

Piensa en el volumen de tu celular: puedes subirlo y bajarlo, pero nunca pasa del 0 ni del 100. `clamp()` hace lo mismo: usa el valor **ideal** mientras esté entre el mínimo y el máximo. Si se pasa, se queda en el límite.

El truco está en que el valor ideal **cambie con la pantalla**. Para eso usamos `vw`: `1vw` es el 1% del ancho de la ventana.

## Ejemplo 1: un título fluido

Abre el ejemplo y cambia el ancho de la vista previa. El título crece y se encoge sin saltos.

```html playground=titulo
<h1>Pulseras que cuentan tu historia</h1>
<p>Este texto también se adapta, pero con límites más pequeños.</p>
```

```css playground=titulo
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

h1 {
  /* nunca menos de 2rem, nunca más de 4rem */
  font-size: clamp(2rem, 1rem + 4vw, 4rem);
  line-height: 1.05;
}

p {
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
}
```

¿Por qué `1rem + 4vw` y no solo `5vw`? Porque si el valor depende **solo** de la pantalla, cuando alguien hace zoom en el navegador el texto no crece. Sumar un poco de `rem` mantiene el zoom funcionando. Es un detalle de accesibilidad que casi nadie conoce.

## `min()` y `max()`: los hermanos de `clamp()`

- `min(a, b)` usa **el más pequeño** de los dos. Sirve para poner un **tope**.
- `max(a, b)` usa **el más grande**. Sirve para poner un **piso**.

Es fácil confundirlos, así que piénsalo así: `min()` pone el **máximo** y `max()` pone el **mínimo**. Sí, al revés de lo que dice el nombre.

```css
.contenedor {
  /* mide 1100px, pero nunca más que la pantalla menos 32px */
  width: min(1100px, 100% - 32px);
  margin-inline: auto;
}

.seccion {
  /* al menos 16px de padding, más si la pantalla es grande */
  padding: max(16px, 4vw);
}
```

De hecho, `clamp(MIN, IDEAL, MAX)` es lo mismo que `max(MIN, min(IDEAL, MAX))`. Solo que mucho más fácil de leer.

## Ejemplo 2: una tarjeta que respira

`clamp()` no es solo para letras. También funciona con `padding`, `gap`, `border-radius` y cualquier medida:

```html playground=tarjeta
<article class="tarjeta">
  <h2>Set Dúo</h2>
  <p>Dos pulseras tejidas a mano para compartir con alguien especial.</p>
  <a href="#">Ver producto</a>
</article>
```

```css playground=tarjeta
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: max(16px, 4vw);
  background: #f6f1ea;
}

.tarjeta {
  width: min(480px, 100%);
  padding: clamp(16px, 4vw, 40px);
  border-radius: clamp(12px, 2vw, 24px);
  background: white;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vw, 16px);
}

.tarjeta h2 {
  margin: 0;
  font-size: clamp(1.5rem, 1rem + 2vw, 2.25rem);
}

.tarjeta p {
  margin: 0;
}

.tarjeta a {
  color: #a6461f;
  font-weight: 600;
}
```

En el celular la tarjeta es compacta, y en el escritorio gana espacio poco a poco. Todo sin una sola media query.

## ¿Entonces adiós a las media queries?

No del todo. `clamp()`, `min()` y `max()` son perfectos para que algo **crezca o se achique**. Pero si algo tiene que **cambiar de forma** (un menú que pasa a hamburguesa, dos columnas que pasan a una), eso sigue siendo trabajo de una media query.

## Errores comunes

- **Poner el mínimo más grande que el máximo.** En `clamp(4rem, 5vw, 2rem)` siempre gana el mínimo: `4rem`. Revisa el orden.
- **Usar solo `vw` en el valor ideal.** `clamp(1rem, 3vw, 2rem)` funciona, pero el texto no crece con el zoom. Mezcla `rem` + `vw`.
- **Olvidar las unidades.** `clamp(16, 4vw, 40)` no hace nada. Los tres valores necesitan unidad.
- **Escribir `min(100%-32px)` sin espacios.** Dentro de las funciones de CSS, el `+` y el `-` necesitan un espacio a cada lado: `100% - 32px`.

## Para profundizar

- [`clamp()` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp)
- [`min()` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Reference/Values/min)
- [`max()` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/max)

En resumen: **`clamp(mínimo, ideal, máximo)`** hace que las medidas fluyan con la pantalla, **`min()`** pone un tope, **`max()`** pone un piso, y las media queries quedan para los cambios de forma.
