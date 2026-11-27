---
title: 'ARIA: cuándo usarlo y, sobre todo, cuándo no'
description: 'Qué es ARIA, la primera regla de ARIA, los atributos que sí vas a usar (aria-label, aria-expanded, aria-hidden, aria-live) y los errores que empeoran la accesibilidad.'
date: 2026-11-26
series: html
tags: [HTML, Accesibilidad, ARIA]
draft: true
---

Cuando empiezas a preocuparte por la accesibilidad, descubres **ARIA**: unos atributos que empiezan por `aria-` y `role`. Parecen la solución mágica para todo, y es fácil acabar llenando el HTML de ellos.

Pero hay un dato que sorprende: los estudios sobre millones de webs muestran que **las páginas con ARIA tienen, de media, más errores de accesibilidad** que las que no lo usan. No porque ARIA sea malo, sino porque **se usa mal**. Vamos a ver cómo usarlo bien.

## ¿Qué es ARIA?

**ARIA** (*Accessible Rich Internet Applications*) es un conjunto de atributos que **añaden información para las tecnologías de asistencia**, como los lectores de pantalla. Sirve para decir:

- **Qué es** un elemento (`role="dialog"`, `role="tab"`).
- **Cómo se llama** (`aria-label="Cerrar"`).
- **En qué estado está** (`aria-expanded="true"`, `aria-pressed="false"`).

Lo importante: **ARIA no cambia nada de lo que se ve ni de cómo funciona**. Solo cambia lo que **anuncia** el lector de pantalla. Si pones `role="button"` a un `<div>`, el lector dirá "botón"... pero seguirá sin poder usarse con el teclado.

## La primera regla de ARIA: no uses ARIA

Así se llama, literalmente, la primera regla oficial:

> Si puedes usar un elemento HTML nativo que ya tiene el significado y el comportamiento que necesitas, **úsalo**, en vez de reutilizar otro elemento y añadirle ARIA.

```html
<!-- ❌ Un div disfrazado de botón -->
<div role="button" tabindex="0" onclick="guardar()" onkeydown="...">Guardar</div>

<!-- ✅ Un botón -->
<button type="button" onclick="guardar()">Guardar</button>
```

El `<button>` ya es un botón para el lector de pantalla, ya se alcanza con `Tab`, ya se activa con `Enter` y `Espacio`, y ya funciona con un formulario. Para que el `<div>` hiciera todo eso, tendrías que programarlo a mano... y casi siempre te olvidas de algo.

| En vez de... | Usa |
| --- | --- |
| `<div role="button">` | `<button>` |
| `<span role="link">` | `<a href="...">` |
| `<div role="heading" aria-level="2">` | `<h2>` |
| `<div role="navigation">` | `<nav>` |
| `<div role="checkbox" aria-checked>` | `<input type="checkbox">` |
| `<div role="dialog">` | `<dialog>` |

## Cuándo SÍ necesitas ARIA

ARIA es para lo que el HTML **no puede expresar solo**. Estos son los atributos que realmente vas a usar como junior:

### `aria-label`: un nombre para lo que no tiene texto

Un botón con solo un icono no tiene texto que el lector pueda leer:

```html
<!-- ❌ El lector dice "botón" (o "botón, equis") -->
<button>✕</button>

<!-- ✅ El lector dice "Cerrar, botón" -->
<button aria-label="Cerrar">✕</button>
```

Úsalo en botones de icono (cerrar, buscar, menú, redes sociales) y en elementos que necesitan distinguirse:

```html
<nav aria-label="Principal">...</nav>
<nav aria-label="Pie de página">...</nav>
```

Si hay dos `<nav>`, el lector los anunciará como "navegación Principal" y "navegación Pie de página".

**Pero ojo:** si el elemento ya tiene texto visible, no le pongas un `aria-label` distinto. El `aria-label` **sustituye** al texto, y las personas que usan control por voz dicen en voz alta lo que **ven** ("pulsar Enviar"); si el nombre real es otro, no funcionará.

### `aria-expanded`: abierto o cerrado

Para botones que abren y cierran algo (un menú, un acordeón hecho a mano):

```html playground=expanded
<button id="menu-boton" aria-expanded="false" aria-controls="menu">Menú</button>

<ul id="menu" hidden>
  <li><a href="#">Inicio</a></li>
  <li><a href="#">Blog</a></li>
  <li><a href="#">Contacto</a></li>
</ul>
```

```js playground=expanded
const boton = document.querySelector('#menu-boton')
const menu = document.querySelector('#menu')

boton.addEventListener('click', () => {
  const abierto = boton.getAttribute('aria-expanded') === 'true'
  boton.setAttribute('aria-expanded', String(!abierto))
  menu.hidden = abierto
})
```

El lector dirá "Menú, botón, contraído" y, tras pulsarlo, "expandido". Sin `aria-expanded`, quien no ve la pantalla no sabría que algo se abrió.

> Recuerda que `<details>` y `<summary>` (tiene su post) ya hacen esto **sin ARIA ni JavaScript**. Primera regla de ARIA otra vez.

### `aria-hidden="true"`: esconder lo decorativo

Oculta un elemento **solo para los lectores de pantalla**. Úsalo con iconos y adornos que no aportan nada o que repiten información:

```html
<button>
  <svg aria-hidden="true">...</svg>
  Descargar
</button>

<p><span aria-hidden="true">⭐⭐⭐⭐☆</span> 4 de 5 estrellas</p>
```

Sin el `aria-hidden`, el lector leería "estrella, estrella, estrella, estrella, estrella blanca, 4 de 5 estrellas".

⚠️ **Nunca** pongas `aria-hidden` en algo que se pueda **enfocar** (un enlace, un botón) ni en contenido importante: la persona podría llegar con el teclado a un elemento que el lector no anuncia.

### `aria-live`: anunciar cambios

Cuando algo cambia en la página **sin que el usuario mueva el foco** (un mensaje de "Guardado", el número de resultados de una búsqueda, un contador del carrito), el lector de pantalla no se entera. Una **región viva** lo anuncia:

```html playground=live
<button id="agregar">Añadir al carrito</button>
<p id="estado" aria-live="polite"></p>
```

```js playground=live
let cantidad = 0

document.querySelector('#agregar').addEventListener('click', () => {
  cantidad++
  document.querySelector('#estado').textContent = `Producto añadido. Tienes ${cantidad} en el carrito.`
})
```

- **`aria-live="polite"`**: lo anuncia cuando el lector termine lo que está diciendo. Es el que usarás casi siempre.
- **`role="alert"`** (equivale a `aria-live="assertive"`): lo anuncia **inmediatamente**, interrumpiendo. Solo para errores importantes.

La región debe **existir en la página desde el principio** (aunque esté vacía). Si la creas y la rellenas a la vez, muchos lectores no la anuncian.

### `aria-current`: dónde estoy

Marca el enlace de la página actual en un menú:

```html
<nav aria-label="Principal">
  <a href="/" aria-current="page">Inicio</a>
  <a href="/blog">Blog</a>
</nav>
```

El lector dirá "Inicio, enlace, página actual". Y puedes usarlo en el CSS: `a[aria-current="page"] { font-weight: 700; }`.

### `aria-describedby` y `aria-invalid`

Para conectar textos de ayuda y errores con los campos de un formulario. Los vimos en detalle en el post de formularios accesibles.

## Los errores que más daño hacen

```html
<!-- ❌ 1. role que contradice al elemento -->
<button role="link">Ver más</button>
<h2 role="button">Título</h2>

<!-- ❌ 2. Prometer un comportamiento que no programas -->
<div role="tab">Pestaña</div> <!-- sin flechas del teclado, sin aria-selected... -->

<!-- ❌ 3. aria-label en algo que no lo admite -->
<div aria-label="Información del producto">...</div> <!-- un div sin rol se ignora -->

<!-- ❌ 4. Esconder algo enfocable -->
<a href="/carrito" aria-hidden="true">Carrito</a>

<!-- ❌ 5. Repetir lo que el HTML ya dice -->
<button role="button">Enviar</button>
<nav role="navigation">...</nav>
```

El segundo es el más peligroso: un `role` es una **promesa**. Si dices que algo es una pestaña (`role="tab"`), el usuario espera poder moverse entre pestañas con las flechas, como en cualquier aplicación. Si no lo programas, has creado algo **más confuso** que no poner nada. Para componentes complejos (pestañas, menús, combobox), sigue las pautas oficiales de la [Guía de prácticas de autoría de ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/).

## Cómo comprobar lo que anuncia el lector

- **Las DevTools**: en Chrome, panel **Elements** → pestaña **Accessibility**. Te muestra el nombre, el rol y el estado que recibe el lector de pantalla para cada elemento.
- **Un lector de pantalla de verdad**: **NVDA** (gratis, para Windows), **VoiceOver** (viene en Mac e iPhone: `Cmd + F5`) o **TalkBack** (Android). Diez minutos navegando tu web con uno te enseñan más que cualquier artículo.

## Tu turno

Arregla este código. Pista: la mayoría de los arreglos consisten en **quitar** ARIA, no en añadirlo:

```html playground=ejercicio
<div role="navigation">
  <span role="link" onclick="location.href='/'">Inicio</span>
  <a href="/blog" role="link">Blog</a>
</div>

<div role="button" onclick="abrir()">☰</div>

<h2 role="heading">Ofertas</h2>

<button>🔍</button>

<p>Tienes <span id="contador">0</span> productos</p>
<!-- Este contador cambia con JavaScript cuando añades productos -->
```

## Errores comunes

- **Usar ARIA en vez de HTML nativo.** Primera regla: si existe una etiqueta, úsala.
- **Poner un `role` sin programar el comportamiento** que promete.
- **`aria-hidden` en elementos enfocables.**
- **`aria-label` que no coincide con el texto visible.**
- **Crear la región `aria-live` justo cuando cambia.** Debe existir desde el principio.
- **Añadir ARIA "por si acaso".** Si no sabes para qué sirve un atributo, no lo pongas: mal usado, es peor que no tenerlo.

## Para profundizar

- [ARIA en MDN](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA)
- [Guía de prácticas de autoría de ARIA (en inglés)](https://www.w3.org/WAI/ARIA/apg/)

En resumen: **ARIA solo cambia lo que anuncia el lector de pantalla**, no cómo funciona el elemento. **Primera regla: usa HTML nativo** siempre que puedas. Reserva ARIA para lo que el HTML no expresa: **`aria-label`** en botones de icono, **`aria-expanded`** en lo que se abre y se cierra, **`aria-hidden`** en lo decorativo, **`aria-live`** para anunciar cambios y **`aria-current`** para la página actual. Y comprueba el resultado en la pestaña **Accessibility** de las DevTools.
