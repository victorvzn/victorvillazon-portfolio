---
title: 'Delegación de eventos: un solo listener para 100 botones'
description: 'En vez de poner un addEventListener a cada botón, escucha en el padre y pregunta quién fue. Menos código y funciona con elementos nuevos.'
date: 2026-11-26
series: javascript
tags: [JavaScript, DOM, Eventos]
draft: true
---

Imagina una lista de tareas con un botón "Borrar" en cada una. Lo primero que se nos ocurre es esto:

```js
document.querySelectorAll('.borrar').forEach(boton => {
  boton.addEventListener('click', () => {
    boton.parentElement.remove()
  })
})
```

Funciona... hasta que **añades una tarea nueva**. Su botón no hace nada, porque el `forEach` se ejecutó antes de que existiera. La solución se llama **delegación de eventos**.

## Primero: los eventos "burbujean"

Cuando haces clic en un botón, el evento no se queda ahí. Sube por todos sus padres: el `li`, el `ul`, el `body`... hasta el `document`. A eso se le llama **bubbling** (burbujeo), como una burbuja que sube a la superficie.

```html playground=burbuja
<ul id="lista">
  <li><button>Haz clic aquí</button></li>
</ul>
```

```js playground=burbuja
document.querySelector('button').addEventListener('click', () => {
  console.log('1. El botón recibió el clic')
})

document.querySelector('li').addEventListener('click', () => {
  console.log('2. El li también se enteró')
})

document.querySelector('#lista').addEventListener('click', () => {
  console.log('3. Y el ul también')
})
```

Un solo clic, tres mensajes. Eso significa que **el padre se entera de los clics de sus hijos**.

## La idea: escuchar en el padre

Si el `ul` se entera de todos los clics, basta con **un** listener en el `ul`. Dentro, `event.target` nos dice en qué elemento exacto se hizo clic.

```html playground=tareas
<form id="nueva">
  <input placeholder="Nueva tarea" required>
  <button>Añadir</button>
</form>

<ul id="tareas">
  <li>Estudiar CSS <button class="borrar">Borrar</button></li>
  <li>Hacer la compra <button class="borrar">Borrar</button></li>
</ul>
```

```js playground=tareas
const lista = document.querySelector('#tareas')
const form = document.querySelector('#nueva')

// Un único listener para TODOS los botones, presentes y futuros
lista.addEventListener('click', (event) => {
  const boton = event.target.closest('.borrar')
  if (!boton) return // el clic no fue en un botón de borrar

  boton.closest('li').remove()
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const input = form.querySelector('input')

  const li = document.createElement('li')
  li.textContent = `${input.value} `

  const boton = document.createElement('button')
  boton.className = 'borrar'
  boton.textContent = 'Borrar'

  li.append(boton)
  lista.append(li)
  input.value = ''
})
```

Añade una tarea y bórrala: funciona, aunque el botón no existía cuando se registró el listener.

## ¿Por qué `closest()` y no solo `event.target`?

`event.target` es el elemento **más profundo** donde hiciste clic. Si tu botón tuviera un icono dentro (`<button><span>🗑</span> Borrar</button>`), el `target` podría ser el `span`, no el botón.

`closest('.borrar')` sube desde el `target` hasta encontrar el primer elemento que cumpla el selector (o devuelve `null`). Así no importa si hiciste clic en el texto o en el icono.

## Varias acciones con `data-*`

Cuando hay varios tipos de botón, un atributo `data-accion` te dice cuál fue:

```html playground=acciones
<div id="contador">
  <button data-accion="restar">−</button>
  <output>0</output>
  <button data-accion="sumar">+</button>
  <button data-accion="reiniciar">Reiniciar</button>
</div>
```

```js playground=acciones
const contador = document.querySelector('#contador')
const salida = contador.querySelector('output')
let valor = 0

const acciones = {
  sumar: () => valor++,
  restar: () => valor--,
  reiniciar: () => { valor = 0 }
}

contador.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-accion]')
  if (!boton) return

  acciones[boton.dataset.accion]()
  salida.textContent = valor
  console.log(`Acción: ${boton.dataset.accion} → ${valor}`)
})
```

`boton.dataset.accion` lee el valor de `data-accion`. Añadir una acción nueva es añadir un botón y una línea al objeto.

## Errores comunes

- **Olvidar el `if (!boton) return`.** Sin él, un clic en el espacio vacío del `ul` intenta borrar `null` y salta un error en consola.
- **Escuchar en `document` para todo.** Funciona, pero escucha en el contenedor más cercano: es más claro saber qué controla cada listener.
- **Usar delegación con eventos que no burbujean**, como `focus` o `blur`. Para esos existen `focusin` y `focusout`, que sí burbujean.

## Para profundizar

- [Introducción a los eventos en MDN](https://developer.mozilla.org/es/docs/Learn/JavaScript/Building_blocks/Events)
- [`Element.closest()` en MDN](https://developer.mozilla.org/es/docs/Web/API/Element/closest)

En resumen: los eventos **burbujean** hacia los padres, así que un solo listener en el contenedor, con **`event.target.closest()`**, maneja todos los botones, incluso los que crees después.
