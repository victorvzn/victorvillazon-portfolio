---
title: 'Maqueta una landing completa con Flexbox y Grid, paso a paso'
description: 'Juntamos todo lo aprendido de CSS en un proyecto real: cabecera, hero, tarjetas de características, testimonios y pie de página, responsive y mobile first.'
date: 2026-11-26
series: css
tags: [CSS, HTML, Flexbox, Grid, Responsive]
draft: true
---

Ya conoces Flexbox, Grid, las media queries y `clamp()` por separado. Pero cuando te enfrentas a un diseño completo surge la duda: **¿por dónde empiezo? ¿Uso Flexbox o Grid aquí?**

Hoy vamos a maquetar una **landing page** completa (la página de presentación de un producto) sección por sección. Todos los bloques de código de este post forman **un solo ejemplo**: el enlace al playground del final lo tiene todo junto.

## Antes de escribir código: divide el diseño en cajas

Este es el paso que más se salta y el que más tiempo ahorra. Mira el diseño y dibuja rectángulos:

```
┌──────────────────────────────────────┐
│ Logo                Menú     Botón   │  ← header: Flexbox (una fila)
├──────────────────────────────────────┤
│  Título grande         │             │
│  Texto                 │   Imagen    │  ← hero: Grid (2 columnas)
│  [Botón]               │             │
├──────────────────────────────────────┤
│  [Tarjeta] [Tarjeta] [Tarjeta]       │  ← características: Grid (auto-fit)
├──────────────────────────────────────┤
│  "Testimonio"   "Testimonio"         │  ← testimonios: Grid
├──────────────────────────────────────┤
│  © 2026               Enlaces        │  ← footer: Flexbox
└──────────────────────────────────────┘
```

La regla para elegir:

- **Flexbox**: cuando colocas cosas **en una sola dirección** (una fila de enlaces, un botón junto a un texto).
- **Grid**: cuando piensas en **filas y columnas a la vez** (una galería, un layout de dos columnas).

Y en el móvil, todo se apila en **una columna**. Por eso escribimos **mobile first**: primero el CSS del móvil y luego, con media queries, lo que cambia en pantallas grandes.

## Paso 1: la base

Variables para los colores, un pequeño reset y un contenedor que centra el contenido y limita su ancho:

```css playground=landing
:root {
  --color-texto: #18181b;
  --color-suave: #52525b;
  --color-fondo: #fafafa;
  --color-marca: #4f46e5;
  --radio: 14px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: var(--color-texto);
  background: var(--color-fondo);
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Centra el contenido y le da aire a los lados */
.contenedor {
  width: min(100% - 32px, 1100px);
  margin-inline: auto;
}

section {
  padding-block: clamp(48px, 8vw, 96px);
}

.boton {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 999px;
  background: var(--color-marca);
  color: white;
  font-weight: 600;
  text-decoration: none;
}

.boton:hover {
  filter: brightness(1.1);
}

a:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 3px;
}
```

`width: min(100% - 32px, 1100px)` es un truco muy útil: en el móvil ocupa todo el ancho menos 16px por lado, y en pantallas grandes se queda en 1100px como máximo. `margin-inline: auto` lo centra.

## Paso 2: la cabecera (Flexbox)

```html playground=landing
<header class="cabecera">
  <div class="contenedor cabecera__dentro">
    <a class="logo" href="#">Tarea<span>Fácil</span></a>

    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="#caracteristicas">Características</a></li>
        <li><a href="#opiniones">Opiniones</a></li>
      </ul>
    </nav>

    <a class="boton" href="#">Probar gratis</a>
  </div>
</header>
```

```css playground=landing
.cabecera {
  border-bottom: 1px solid #e4e4e7;
  background: white;
}

.cabecera__dentro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding-block: 14px;
}

.logo {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-texto);
  text-decoration: none;
}

.logo span {
  color: var(--color-marca);
}

.menu {
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu a {
  color: var(--color-suave);
  text-decoration: none;
}

.menu a:hover {
  color: var(--color-texto);
}
```

- `justify-content: space-between` separa logo, menú y botón a los extremos.
- `flex-wrap: wrap` deja que bajen de línea en pantallas estrechas en vez de desbordarse. Así no necesitamos media query aquí.
- `gap: 12px 24px` es el espacio entre filas (12px) y entre columnas (24px).

## Paso 3: el hero (Grid de dos columnas)

El **hero** es la primera sección, la que "vende" el producto.

```html playground=landing
<main>
  <section class="contenedor hero">
    <div>
      <h1 class="hero__titulo">Organiza tu día sin esfuerzo</h1>
      <p class="hero__texto">Apunta tus tareas, ordénalas por prioridad y recibe un recordatorio antes de que se te olviden.</p>
      <a class="boton" href="#">Empieza gratis</a>
    </div>

    <img src="https://picsum.photos/seed/tareas/640/480" alt="La app mostrando una lista de tareas del día" width="640" height="480" class="hero__imagen">
  </section>
```

```css playground=landing
.hero {
  display: grid;
  gap: 40px;
  align-items: center;
}

.hero__titulo {
  margin: 0 0 16px;
  font-size: clamp(2rem, 5vw + 1rem, 3.5rem);
  line-height: 1.1;
}

.hero__texto {
  margin: 0 0 28px;
  font-size: 1.15rem;
  color: var(--color-suave);
}

.hero__imagen {
  border-radius: var(--radio);
}

/* A partir de 800px: dos columnas */
@media (min-width: 800px) {
  .hero {
    grid-template-columns: 1fr 1fr;
  }
}
```

En el móvil, `display: grid` sin columnas apila todo (texto arriba, imagen abajo). A partir de 800px, dos columnas iguales. Es la única media query que necesitamos en toda la landing. El título usa `clamp()`: crece con la pantalla, pero sin pasarse del mínimo ni del máximo.

## Paso 4: las características (Grid sin media queries)

```html playground=landing
  <section id="caracteristicas" class="contenedor">
    <h2 class="seccion__titulo">Todo lo que necesitas</h2>

    <div class="tarjetas">
      <article class="tarjeta">
        <span class="tarjeta__icono" aria-hidden="true">⚡</span>
        <h3>Rápida</h3>
        <p>Añade una tarea en dos segundos, desde cualquier dispositivo.</p>
      </article>

      <article class="tarjeta">
        <span class="tarjeta__icono" aria-hidden="true">🔔</span>
        <h3>Recordatorios</h3>
        <p>Te avisamos antes de que venza cada tarea.</p>
      </article>

      <article class="tarjeta">
        <span class="tarjeta__icono" aria-hidden="true">👥</span>
        <h3>En equipo</h3>
        <p>Comparte listas con tu familia o tu equipo de trabajo.</p>
      </article>
    </div>
  </section>
```

```css playground=landing
.seccion__titulo {
  margin: 0 0 32px;
  font-size: clamp(1.6rem, 3vw + 1rem, 2.4rem);
  text-align: center;
}

/* Tantas columnas de mínimo 240px como quepan */
.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.tarjeta {
  padding: 24px;
  border: 1px solid #e4e4e7;
  border-radius: var(--radio);
  background: white;
}

.tarjeta__icono {
  font-size: 28px;
}

.tarjeta h3 {
  margin: 12px 0 8px;
}

.tarjeta p {
  margin: 0;
  color: var(--color-suave);
}
```

`repeat(auto-fit, minmax(240px, 1fr))` es el truco estrella del responsive sin media queries: en el móvil cabe una tarjeta por fila, en una tablet dos y en el ordenador tres. Lo vimos a fondo en su propio post.

## Paso 5: los testimonios

```html playground=landing
  <section id="opiniones" class="opiniones">
    <div class="contenedor">
      <h2 class="seccion__titulo">Lo que dicen nuestros usuarios</h2>

      <div class="tarjetas">
        <figure class="opinion">
          <blockquote>"Por fin dejé de olvidarme de pagar las facturas."</blockquote>
          <figcaption>— Lucía, diseñadora</figcaption>
        </figure>

        <figure class="opinion">
          <blockquote>"La usamos en todo el equipo para repartir el trabajo de la semana."</blockquote>
          <figcaption>— Andrés, jefe de proyecto</figcaption>
        </figure>
      </div>
    </div>
  </section>
</main>
```

```css playground=landing
/* El fondo ocupa todo el ancho; el contenido sigue centrado gracias a .contenedor */
.opiniones {
  background: #eef2ff;
}

.opinion {
  margin: 0;
  padding: 24px;
  border-radius: var(--radio);
  background: white;
}

.opinion blockquote {
  margin: 0 0 12px;
  font-size: 1.1rem;
}

.opinion figcaption {
  color: var(--color-suave);
}
```

Fíjate en el truco: la `<section>` lleva el fondo de color a **todo el ancho**, y el `.contenedor` de dentro mantiene el contenido centrado. Reutilizamos la clase `.tarjetas` del paso anterior: el mismo grid sirve para otra cosa.

## Paso 6: el pie de página (Flexbox)

```html playground=landing
<footer class="pie">
  <div class="contenedor pie__dentro">
    <p>© 2026 TareaFácil</p>
    <ul class="menu">
      <li><a href="#">Privacidad</a></li>
      <li><a href="#">Contacto</a></li>
    </ul>
  </div>
</footer>
```

```css playground=landing
.pie {
  border-top: 1px solid #e4e4e7;
}

.pie__dentro {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-block: 24px;
  color: var(--color-suave);
}

.pie__dentro p {
  margin: 0;
}
```

Reutilizamos `.menu` de la cabecera. Abre el playground y cambia el ancho de la ventana para ver cómo se adapta cada sección.

## Repaso: qué herramienta usamos en cada sitio

| Sección | Herramienta | Por qué |
| --- | --- | --- |
| Cabecera y pie | Flexbox + `flex-wrap` | Elementos en una fila que pueden bajar de línea |
| Hero | Grid + una media query | Dos columnas en grande, una en el móvil |
| Tarjetas y testimonios | Grid con `auto-fit` + `minmax` | Columnas que se adaptan solas |
| Títulos | `clamp()` | Tamaño fluido sin media queries |
| Contenedor | `min()` + `margin-inline: auto` | Ancho máximo y centrado |

## Tu turno

Añade una sección de **precios** entre los testimonios y el pie, con tres planes (Gratis, Pro y Equipo). Cada plan tiene un nombre, un precio, una lista de ventajas y un botón. Requisitos:

1. El botón de cada plan debe quedar **abajo**, aunque las listas tengan distinta longitud. Pista: `display: flex; flex-direction: column` en la tarjeta y `margin-top: auto` en el botón.
2. El plan Pro debe destacar (otro color de borde, una etiqueta "Más popular").

## Errores comunes

- **Empezar a escribir CSS sin dividir el diseño en cajas.** Dedica dos minutos a dibujarlo.
- **Usar Grid para todo o Flexbox para todo.** Usa cada uno para lo que mejor hace.
- **Escribir primero el CSS de escritorio** y luego "arreglar" el móvil. Empieza por el móvil.
- **Anchos fijos** (`width: 1100px`). Usa `max-width` o `min(100%, 1100px)`.
- **Una media query por cada sección.** Con `flex-wrap`, `auto-fit` y `clamp()`, casi no hacen falta.

## Para profundizar

- [Flexbox en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/CSS_layout/Flexbox)
- [Grid en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/CSS_layout/Grids)

En resumen: **divide el diseño en cajas** antes de programar, usa **Flexbox para filas** y **Grid para filas y columnas**, empieza **por el móvil** y apóyate en **`auto-fit`, `flex-wrap` y `clamp()`** para necesitar las mínimas media queries. Con eso puedes maquetar casi cualquier landing.
