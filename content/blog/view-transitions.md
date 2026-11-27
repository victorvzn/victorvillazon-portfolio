---
title: 'View Transitions: animaciones entre estados y entre páginas con una línea'
description: 'La API de View Transitions anima automáticamente el cambio de una vista a otra: filtrar una lista, abrir un detalle o navegar entre páginas, con document.startViewTransition y CSS.'
date: 2026-11-26
series: css
tags: [CSS, CSS moderno, Animación, JavaScript]
draft: true
---

Filtras una lista de productos y los elementos **desaparecen de golpe** y los demás **saltan** a su nueva posición. Haces clic en una foto pequeña y la página de detalle aparece de repente. Funciona, pero se siente brusco.

Animar esos cambios a mano es muy difícil: tendrías que saber dónde estaba cada elemento antes, dónde va a estar después y moverlo entre los dos puntos. La **API de View Transitions** lo hace por ti.

## La idea

1. El navegador hace una **foto** de cómo se ve la página ahora.
2. Tú cambias el DOM (filtras, reordenas, cambias de vista).
3. El navegador hace otra **foto** del resultado.
4. Anima la transición **entre las dos fotos**: por defecto, un fundido suave.

## Paso 1: un fundido con una línea

Envuelve el código que cambia el DOM en **`document.startViewTransition()`**:

```html playground=basico
<button id="cambiar">Cambiar tema</button>
<div class="tarjeta" id="tarjeta">
  <h2>Modo claro ☀️</h2>
  <p>Pulsa el botón para ver la transición.</p>
</div>
```

```css playground=basico
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjeta {
  max-width: 300px;
  margin-top: 16px;
  padding: 20px;
  border-radius: 14px;
  background: #fef3c7;
}

.tarjeta.oscura {
  background: #1e1b4b;
  color: white;
}
```

```js playground=basico
const tarjeta = document.querySelector('#tarjeta')

function cambiarTema() {
  const oscura = tarjeta.classList.toggle('oscura')
  tarjeta.querySelector('h2').textContent = oscura ? 'Modo oscuro 🌙' : 'Modo claro ☀️'
}

document.querySelector('#cambiar').addEventListener('click', () => {
  // Si el navegador no lo soporta, cambiamos sin animación
  if (!document.startViewTransition) {
    cambiarTema()
    return
  }

  document.startViewTransition(() => cambiarTema())
})
```

Sin escribir ni una animación, el cambio es un **fundido**. Fíjate en la comprobación del principio: si el navegador no soporta la API, la página **sigue funcionando**, solo que sin animación. Esto se llama **mejora progresiva**.

## Paso 2: que cada elemento se mueva a su sitio

Lo espectacular llega cuando le pones un **nombre** a un elemento con la propiedad CSS **`view-transition-name`**. El navegador lo sigue entre las dos fotos y lo **mueve y redimensiona** de su posición antigua a la nueva:

```html playground=lista
<div class="filtros">
  <button data-filtro="todos">Todos</button>
  <button data-filtro="fruta">Frutas</button>
  <button data-filtro="verdura">Verduras</button>
</div>

<ul class="productos">
  <li data-tipo="fruta" style="view-transition-name: item-1">🍎 Manzana</li>
  <li data-tipo="verdura" style="view-transition-name: item-2">🥕 Zanahoria</li>
  <li data-tipo="fruta" style="view-transition-name: item-3">🍌 Plátano</li>
  <li data-tipo="verdura" style="view-transition-name: item-4">🥦 Brócoli</li>
  <li data-tipo="fruta" style="view-transition-name: item-5">🍇 Uvas</li>
  <li data-tipo="verdura" style="view-transition-name: item-6">🍆 Berenjena</li>
</ul>
```

```css playground=lista
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.filtros {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filtros button {
  padding: 6px 14px;
  font: inherit;
}

.productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 0;
  list-style: none;
}

.productos li {
  padding: 20px 12px;
  border-radius: 12px;
  background: #f4f4f5;
  text-align: center;
}

.productos li[hidden] {
  display: none;
}
```

```js playground=lista
const items = document.querySelectorAll('.productos li')

function filtrar(filtro) {
  items.forEach((item) => {
    item.hidden = filtro !== 'todos' && item.dataset.tipo !== filtro
  })
}

document.querySelector('.filtros').addEventListener('click', (evento) => {
  const boton = evento.target.closest('button')
  if (!boton) return

  const filtro = boton.dataset.filtro
  if (!document.startViewTransition) return filtrar(filtro)
  document.startViewTransition(() => filtrar(filtro))
})
```

Pulsa "Frutas": las verduras se desvanecen y las frutas **se deslizan** hasta sus nuevas posiciones. Todo eso sale de dar a cada elemento un `view-transition-name` **único**.

> **Cada nombre debe ser único** en la página. Si dos elementos visibles tienen el mismo `view-transition-name`, la transición falla y no se anima nada.

## Paso 3: personalizar la animación

Durante la transición, el navegador crea unos **pseudo-elementos** que puedes estilizar con CSS:

- **`::view-transition-old(nombre)`**: la foto **antigua** de ese elemento.
- **`::view-transition-new(nombre)`**: la foto **nueva**.
- **`::view-transition-group(nombre)`**: el grupo que se mueve entre las dos posiciones.

`root` es el nombre de la página entera. Por ejemplo, para que toda la transición dure más:

```css
::view-transition-group(*) {
  animation-duration: 0.5s;
}
```

O para que, en vez de un fundido, la vista antigua salga por la izquierda y la nueva entre por la derecha:

```css
@keyframes salir {
  to { translate: -100% 0; }
}

@keyframes entrar {
  from { translate: 100% 0; }
}

::view-transition-old(root) {
  animation: salir 0.4s ease-in both;
}

::view-transition-new(root) {
  animation: entrar 0.4s ease-out both;
}
```

## Entre páginas distintas, ¡sin JavaScript!

Hasta aquí, la transición ocurría dentro de una misma página. Pero también funciona al **navegar entre páginas** de tu web (un sitio con varios archivos HTML, sin React ni nada). Basta con añadir esto al CSS de **las dos** páginas:

```css
@view-transition {
  navigation: auto;
}
```

Ahora, al hacer clic en un enlace a otra página de tu mismo sitio, el cambio es un fundido en vez de un parpadeo blanco. Y si en las dos páginas hay un elemento con el **mismo** `view-transition-name` (por ejemplo, la foto del producto en el listado y en el detalle), **se anima de una a otra**: la miniatura crece hasta convertirse en la foto grande.

```css
/* En el listado (solo en la tarjeta del producto que se abre) y en la página de detalle */
.foto-producto {
  view-transition-name: foto-producto;
}
```

Funciona en páginas del **mismo origen** (lo vimos en el post de CORS).

## Respeta el movimiento reducido

Las transiciones que mueven o deslizan elementos deben respetar la preferencia de **movimiento reducido** (tiene su propio post):

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

## Compatibilidad

Las transiciones dentro de una página (`startViewTransition`) funcionan en los navegadores modernos más usados, y las transiciones entre páginas se están extendiendo. Como hemos hecho en los ejemplos, úsalas siempre como **mejora progresiva**: comprueba si existen, y si no, la web funciona igual, solo que sin animación.

## Tu turno

Partiendo del ejemplo de la lista:

1. Haz que la animación dure 0.6 segundos.
2. Añade un botón "Ordenar A-Z" que reordene los elementos (muévelos con `append` en el orden nuevo) dentro de un `startViewTransition`. Verás cómo cada uno se desliza a su nueva posición.
3. Desactiva las animaciones con `prefers-reduced-motion`.

## Errores comunes

- **No comprobar si `startViewTransition` existe.** En navegadores sin soporte, el código fallaría. Envuelve siempre con la comprobación.
- **Repetir un `view-transition-name`** en dos elementos visibles. La transición se cancela.
- **Cambiar el DOM fuera del callback.** Lo que quieras animar debe ocurrir **dentro** de la función que pasas a `startViewTransition`.
- **Animar transiciones muy largas.** Más de medio segundo hace que la interfaz parezca lenta.
- **Olvidar el movimiento reducido.**

## Para profundizar

- [View Transitions API en MDN](https://developer.mozilla.org/es/docs/Web/API/View_Transition_API)
- [`view-transition-name` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/view-transition-name)

En resumen: envuelve tus cambios del DOM en **`document.startViewTransition(() => ...)`** y el navegador los animará con un fundido. Dale un **`view-transition-name` único** a un elemento para que **se deslice** a su nueva posición, personaliza la animación con los pseudo-elementos **`::view-transition-*`** y activa las transiciones **entre páginas** con **`@view-transition { navigation: auto; }`**. Siempre como mejora progresiva y respetando el movimiento reducido.
