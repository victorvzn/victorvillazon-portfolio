---
title: 'Pintar una lista desde un array: estado y render con JavaScript puro'
description: 'El patrón que usan todas las apps: guardas los datos en un array, una función render los pinta y cada cambio vuelve a pintar. La base para entender React o Vue.'
date: 2026-11-26
series: javascript
tags: [JavaScript, DOM, Arrays]
draft: true
---

Una tienda muestra productos. Un chat muestra mensajes. Una app de tareas muestra tareas. Todas hacen lo mismo: tienen **una lista de datos** y la **pintan** en la página. Y cuando los datos cambian, la página cambia.

Hoy vas a aprender el patrón que hay detrás. Es la idea más importante para entender después cualquier framework.

## La idea: los datos mandan

El error típico de un junior es tratar la página como si fuera la "base de datos": añadir un `<li>` aquí, borrar otro allá, y luego no saber cuántos elementos hay ni cuáles están marcados.

El patrón correcto separa dos cosas:

1. **El estado**: los datos, en un array de JavaScript. Es la **única fuente de verdad**.
2. **El render**: una función que **lee el estado y pinta** la página desde cero.

Y la regla de oro: **nunca cambias la página directamente. Cambias el estado y vuelves a llamar a `render()`.**

```
el usuario hace algo → cambias el array → render() → la página refleja el array
```

## Paso 1: el estado y la primera pintada

```html playground=render
<ul id="lista"></ul>
```

```css playground=render
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}
```

```js playground=render
// 1. El estado
const productos = [
  { id: 1, nombre: 'Teclado', precio: 120 },
  { id: 2, nombre: 'Mouse', precio: 45 },
  { id: 3, nombre: 'Monitor', precio: 650 }
]

const lista = document.querySelector('#lista')

// 2. El render: borra y vuelve a pintar todo a partir del array
function render() {
  lista.replaceChildren() // vacía la lista

  productos.forEach((producto) => {
    const item = document.createElement('li')
    item.textContent = `${producto.nombre}: S/ ${producto.precio}`
    lista.append(item)
  })
}

render()
```

`replaceChildren()` sin argumentos borra todo lo que hay dentro. Es más seguro que `innerHTML = ''` y se lee mejor.

## Paso 2: cambiar el estado y volver a pintar

Ahora añadimos productos con un formulario. Fíjate en que el `submit` **no toca la lista**: solo hace `push` al array y llama a `render()`.

```html playground=agregar
<form id="formulario">
  <input id="nombre" placeholder="Producto" required>
  <input id="precio" type="number" placeholder="Precio" min="0" required>
  <button>Añadir</button>
</form>
<ul id="lista"></ul>
<p id="total"></p>
```

```css playground=agregar
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: flex;
  gap: 8px;
}

input,
button {
  padding: 6px 10px;
  font: inherit;
}
```

```js playground=agregar
const productos = [
  { id: 1, nombre: 'Teclado', precio: 120 },
  { id: 2, nombre: 'Mouse', precio: 45 }
]

const formulario = document.querySelector('#formulario')
const lista = document.querySelector('#lista')
const total = document.querySelector('#total')

function render() {
  lista.replaceChildren()

  productos.forEach((producto) => {
    const item = document.createElement('li')
    item.textContent = `${producto.nombre}: S/ ${producto.precio}`
    lista.append(item)
  })

  // Todo lo que depende de los datos se calcula en el render
  const suma = productos.reduce((acc, producto) => acc + producto.precio, 0)
  total.textContent = `${productos.length} productos · Total: S/ ${suma}`
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault()

  productos.push({
    id: Date.now(),
    nombre: formulario.nombre.value.trim(),
    precio: Number(formulario.precio.value)
  })

  formulario.reset()
  render()
})

render()
```

¿Ves la ventaja? El total **siempre** cuadra con la lista, porque los dos se calculan desde el mismo array. Nunca se desincronizan.

> `formulario.nombre` es un atajo: dentro de un `<form>`, puedes acceder a cada campo por su `id` o su `name`.

## Paso 3: borrar y editar con `id`

Para borrar, cada elemento necesita saber **a qué dato corresponde**. Para eso está el `id`. Lo guardamos en un atributo `data-id` y usamos **delegación de eventos** (un solo listener en la lista, como vimos en su post):

```html playground=borrar
<ul id="lista"></ul>
<p id="vacio" hidden>No quedan productos 🛒</p>
```

```css playground=borrar
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

li {
  display: flex;
  justify-content: space-between;
  max-width: 320px;
  padding: 8px 0;
  border-bottom: 1px solid #e4e4e7;
}

.agotado span {
  text-decoration: line-through;
  color: #a1a1aa;
}
```

```js playground=borrar
let productos = [
  { id: 1, nombre: 'Teclado', agotado: false },
  { id: 2, nombre: 'Mouse', agotado: true },
  { id: 3, nombre: 'Monitor', agotado: false }
]

const lista = document.querySelector('#lista')
const vacio = document.querySelector('#vacio')

function render() {
  lista.replaceChildren()

  productos.forEach((producto) => {
    const item = document.createElement('li')
    item.dataset.id = producto.id
    item.classList.toggle('agotado', producto.agotado)

    const nombre = document.createElement('span')
    nombre.textContent = producto.nombre

    const alternar = document.createElement('button')
    alternar.dataset.accion = 'alternar'
    alternar.textContent = producto.agotado ? 'Reponer' : 'Agotar'

    const borrar = document.createElement('button')
    borrar.dataset.accion = 'borrar'
    borrar.textContent = 'Borrar'

    item.append(nombre, alternar, borrar)
    lista.append(item)
  })

  vacio.hidden = productos.length > 0
}

lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button')
  if (!boton) return

  const id = Number(boton.closest('li').dataset.id)

  if (boton.dataset.accion === 'borrar') {
    productos = productos.filter((producto) => producto.id !== id)
  }

  if (boton.dataset.accion === 'alternar') {
    productos = productos.map((producto) =>
      producto.id === id ? { ...producto, agotado: !producto.agotado } : producto
    )
  }

  render()
})

render()
```

Las tres operaciones de siempre, en versión array:

| Quieres... | Con el array |
| --- | --- |
| Añadir | `push` (o `[...productos, nuevo]`) |
| Borrar | `filter` quedándote con los que **no** tienen ese `id` |
| Editar | `map` devolviendo una copia modificada del que tiene ese `id` |

## Esto es lo que hace React (o Vue)

Si mañana aprendes React, vas a ver exactamente esta idea:

- El **estado** es tu array (en React, `useState`).
- El **render** es tu función que pinta (en React, el componente).
- Cuando cambias el estado, **se vuelve a pintar solo**.

La diferencia es que React no borra y repinta todo como nuestro `replaceChildren()`: compara qué cambió y toca solo eso. Pero la forma de pensar es la misma. Si entiendes este post, ya entiendes la mitad de React.

## Tu turno

Partiendo del último ejemplo:

1. Añade un `<input>` de búsqueda que filtre los productos por nombre mientras escribes. Pista: guarda el texto buscado en una variable de estado y usa `filter` **dentro de `render`**, sin modificar el array original.
2. Muestra cuántos productos hay agotados.

## Errores comunes

- **Modificar la página y olvidar el array** (o al revés). Siempre: cambias el array y llamas a `render()`.
- **Olvidar vaciar la lista en el render.** Cada pintada duplica los elementos.
- **Usar la posición del array como identificador.** Si borras uno, las posiciones cambian. Usa un `id`.
- **Un `addEventListener` por cada elemento dentro del render.** Funciona, pero con delegación basta uno solo en la lista.
- **`data-id` es siempre un texto.** Conviértelo con `Number()` antes de compararlo con `===`.

## Para profundizar

- [`replaceChildren` en MDN](https://developer.mozilla.org/es/docs/Web/API/Element/replaceChildren)
- [`dataset` en MDN](https://developer.mozilla.org/es/docs/Web/API/HTMLElement/dataset)

En resumen: guarda los datos en un **array (el estado)**, escribe una función **`render()`** que lo pinte desde cero y, ante cualquier acción del usuario, **cambia el array y vuelve a llamar a `render()`**. Es el corazón de todas las interfaces modernas.
