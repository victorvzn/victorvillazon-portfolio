---
title: 'Tres mini proyectos con eventos: contador, toggle y me gusta'
description: 'Practica el DOM con tres componentes que vas a encontrar en cualquier app: un contador, un interruptor y un botón de me gusta.'
date: 2026-11-25
series: javascript
tags: [JavaScript, DOM, Proyectos]
draft: true
order: 25
---

En el post anterior vimos los tres pasos del DOM: **seleccionar**, **escuchar** y **cambiar**. Hoy los practicamos con tres mini proyectos. Cada uno agrega una idea nueva.

## 1. Un contador

La idea nueva: **guardar un estado** en una variable y **redibujar** la página cada vez que cambia.

```html playground=contador
<div class="contador">
  <button id="restar" aria-label="Restar">−</button>
  <output id="valor">0</output>
  <button id="sumar" aria-label="Sumar">+</button>
</div>
```

```css playground=contador
body {
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
}

.contador {
  display: flex;
  align-items: center;
  gap: 16px;
}

button {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: #18181b;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

output {
  min-width: 2ch;
  font-size: 40px;
  font-weight: bold;
  text-align: center;
}
```

```js playground=contador
let cantidad = 0

const valor = document.querySelector('#valor')
const restar = document.querySelector('#restar')
const sumar = document.querySelector('#sumar')

// Una sola función que pinta el estado actual
const pintar = () => {
  valor.textContent = cantidad
  restar.disabled = cantidad === 0 // no dejamos bajar de 0
}

sumar.addEventListener('click', () => {
  cantidad++
  pintar()
})

restar.addEventListener('click', () => {
  cantidad--
  pintar()
})

pintar()
```

El patrón **estado → función que pinta** es exactamente lo que hace React por ti. Si lo entiendes aquí, React te va a costar mucho menos.

## 2. Un toggle (interruptor)

La idea nueva: `classList.toggle()`, que **pone la clase si no está y la quita si está**.

```html playground=toggle
<button id="menu-btn" aria-expanded="false" aria-controls="menu">☰ Menú</button>

<nav id="menu" class="menu">
  <a href="#">Inicio</a>
  <a href="#">Cursos</a>
  <a href="#">Contacto</a>
</nav>
```

```css playground=toggle
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

button {
  padding: 10px 16px;
  font: inherit;
  cursor: pointer;
}

.menu {
  display: none;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #f4f4f5;
}

.menu.abierto {
  display: flex;
}
```

```js playground=toggle
const boton = document.querySelector('#menu-btn')
const menu = document.querySelector('#menu')

boton.addEventListener('click', () => {
  const abierto = menu.classList.toggle('abierto') // devuelve true si quedó puesta
  boton.setAttribute('aria-expanded', abierto)
})
```

¿Y ese `aria-expanded`? Le dice a los lectores de pantalla si el menú está abierto o cerrado. Un detalle de una línea que marca la diferencia.

## 3. Un botón de me gusta

La idea nueva: **varios botones con el mismo código**, usando `querySelectorAll` y `forEach`.

```html playground=like
<article class="post">
  <p>Aprendí CSS Grid hoy 🎉</p>
  <button class="like" aria-pressed="false">🤍 <span>12</span></button>
</article>

<article class="post">
  <p>Mi primer proyecto con JavaScript</p>
  <button class="like" aria-pressed="false">🤍 <span>5</span></button>
</article>
```

```css playground=like
body {
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: #f4f4f5;
}

.post {
  padding: 16px;
  border-radius: 12px;
  background: white;
}

.like {
  padding: 6px 12px;
  border: 1px solid #e4e4e7;
  border-radius: 999px;
  background: white;
  font: inherit;
  cursor: pointer;
  transition: transform 0.1s;
}

.like:active {
  transform: scale(0.9);
}

.like[aria-pressed="true"] {
  border-color: #fca5a5;
  background: #fef2f2;
}
```

```js playground=like
document.querySelectorAll('.like').forEach((boton) => {
  const contador = boton.querySelector('span')

  boton.addEventListener('click', () => {
    const marcado = boton.getAttribute('aria-pressed') === 'true'
    const total = Number(contador.textContent)

    boton.setAttribute('aria-pressed', !marcado)
    boton.firstChild.textContent = marcado ? '🤍 ' : '❤️ '
    contador.textContent = marcado ? total - 1 : total + 1
  })
})
```

Fíjate que el CSS usa `[aria-pressed="true"]` para el estilo. Así, el mismo atributo sirve para la accesibilidad **y** para el diseño.

## Errores comunes

- **Sumar texto en vez de números.** `textContent` siempre es texto: `'12' + 1` da `'121'`. Conviértelo con `Number()`.
- **Cambiar la página en muchos lugares distintos.** Ten una función que pinte el estado y llámala siempre. Menos bugs.
- **`querySelector` cuando hay varios.** Solo te da el primero. Para todos, `querySelectorAll` + `forEach`.

## Para profundizar

- [`classList` en MDN](https://developer.mozilla.org/es/docs/Web/API/Element/classList)
- [`querySelectorAll` en MDN](https://developer.mozilla.org/es/docs/Web/API/Document/querySelectorAll)
- [`aria-expanded` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded)

En resumen: **guarda el estado en una variable**, **píntalo con una función**, usa **`classList.toggle`** para los interruptores y **`querySelectorAll` + `forEach`** cuando haya muchos iguales.
