---
title: 'position en CSS sin miedo: relative, absolute, fixed y sticky'
description: 'Un badge en la esquina de una tarjeta, un botón flotante y un menú que se queda pegado. Los 4 valores de position con ejemplos.'
date: 2026-11-25
series: css
tags: [CSS, Fundamentos]
draft: true
order: 14
---

`position` es esa propiedad que todos usamos a prueba y error hasta que algo queda donde queremos. Hoy lo vamos a entender de verdad, con tres casos que vas a necesitar sí o sí.

## `static`: el valor por defecto

Todos los elementos son `position: static` si no dices nada. Siguen el flujo normal: uno debajo del otro. `top`, `left`, etc. **no hacen nada** en un elemento `static`.

## `relative` + `absolute`: el badge en la esquina

Esta es la pareja más importante.

- `absolute` saca al elemento del flujo y lo coloca con `top`, `right`, `bottom` y `left`… **respecto a su ancestro posicionado más cercano**.
- `relative` en el padre lo convierte en ese "ancestro posicionado". Es decir: **el padre pone las reglas, el hijo se mueve dentro**.

```html playground=badge
<article class="tarjeta">
  <span class="badge">-20%</span>
  <img src="https://placehold.co/280x160" alt="">
  <h2>Audífonos</h2>
  <p>S/ 72 <s>S/ 90</s></p>
</article>
```

```css playground=badge
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjeta {
  position: relative; /* el punto de referencia para el badge */
  width: 280px;
  padding: 12px;
  border-radius: 12px;
  background: #f4f4f5;
}

.tarjeta img {
  width: 100%;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dc2626;
  color: white;
  font-weight: bold;
}
```

Quita el `position: relative` de `.tarjeta` en el playground. El badge sale volando a la esquina de la página, porque ya no tiene un padre que le ponga las reglas.

## `fixed`: el botón flotante de WhatsApp

`fixed` se posiciona respecto a la **ventana** y se queda ahí aunque hagas scroll.

```html playground=fixed
<p>Haz scroll... el botón se queda en su lugar.</p>
<div class="relleno"></div>
<a class="flotante" href="#">💬</a>
```

```css playground=fixed
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.relleno {
  height: 1500px;
  background: linear-gradient(#f4f4f5, #d4d4d8);
}

.flotante {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #16a34a;
  font-size: 24px;
  text-decoration: none;
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.2);
}
```

## `sticky`: el menú que se pega

`sticky` es un híbrido: se comporta normal hasta que, al hacer scroll, llega a la posición que le diste (`top: 0`), y ahí **se queda pegado**.

```html playground=sticky
<header class="menu">Mi menú pegajoso</header>
<p>Haz scroll hacia abajo.</p>
<div class="relleno"></div>
```

```css playground=sticky
body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

.menu {
  position: sticky;
  top: 0;
  padding: 16px;
  background: #18181b;
  color: white;
}

p {
  padding: 0 16px;
}

.relleno {
  height: 1500px;
}
```

A diferencia de `fixed`, `sticky` **ocupa su espacio** en la página, así que no tapa el contenido de abajo.

## ¿Y `z-index`?

Cuando dos elementos posicionados se enciman, `z-index` decide cuál queda arriba: el número más alto gana. Solo funciona en elementos con `position` distinto de `static` (o hijos de flex/grid).

## Errores comunes

- **Usar `absolute` para maquetar toda la página.** Para poner cosas lado a lado usa Flexbox o Grid. `absolute` es para detalles: badges, íconos, decoraciones.
- **Olvidar el `relative` en el padre.** El clásico "mi elemento se fue a cualquier lado".
- **`sticky` que no se pega.** Le falta `top`, o algún padre tiene `overflow: hidden`.

## Para profundizar

- [`position` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/position)
- [Posicionamiento en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning)

En resumen: **`relative` en el padre + `absolute` en el hijo** para detalles en esquinas, **`fixed`** para lo que flota sobre la ventana y **`sticky`** para lo que se pega al hacer scroll.
