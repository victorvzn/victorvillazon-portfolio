---
title: 'Crear y borrar elementos con JavaScript: createElement, append y remove'
description: 'Cómo añadir y quitar elementos de la página desde JavaScript, la diferencia entre textContent e innerHTML y cómo usar <template> para no escribir HTML en strings.'
date: 2026-11-26
series: javascript
tags: [JavaScript, DOM, Fundamentos]
draft: true
---

En el post del primer botón aprendiste a **cambiar** elementos que ya estaban en el HTML. Pero en una app real casi todo **aparece y desaparece**: un comentario nuevo, un producto que añades al carrito, una notificación que se cierra. Hoy vamos a crear y borrar elementos desde JavaScript.

## Paso 1: crear un elemento

`document.createElement('etiqueta')` crea un elemento nuevo... pero **todavía no está en la página**. Existe solo en memoria, como una pieza de Lego que aún no has encajado:

```js
const parrafo = document.createElement('p')
parrafo.textContent = 'Soy un párrafo nuevo'
parrafo.classList.add('nota')
```

## Paso 2: meterlo en la página

Para que se vea, tienes que **encajarlo** dentro de otro elemento que ya exista:

| Método | Dónde lo pone |
| --- | --- |
| `padre.append(hijo)` | al final, dentro del padre |
| `padre.prepend(hijo)` | al principio, dentro del padre |
| `elemento.before(nuevo)` | justo antes del elemento, fuera de él |
| `elemento.after(nuevo)` | justo después del elemento, fuera de él |

```html playground=crear
<button id="agregar">Añadir nota</button>
<div id="notas"></div>
```

```css playground=crear
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.nota {
  padding: 10px 14px;
  margin: 8px 0;
  border-left: 4px solid #f59e0b;
  background: #fef3c7;
}
```

```js playground=crear
const boton = document.querySelector('#agregar')
const notas = document.querySelector('#notas')
let contador = 0

boton.addEventListener('click', () => {
  contador++

  const nota = document.createElement('p')
  nota.textContent = `Nota número ${contador}`
  nota.classList.add('nota')

  notas.append(nota)
})
```

Cambia `append` por `prepend` y verás que las notas nuevas aparecen arriba.

## Paso 3: borrar un elemento

`elemento.remove()` lo quita de la página. Lo normal es crear el botón de borrar **junto con** el elemento:

```html playground=borrar
<button id="agregar">Añadir tarea</button>
<ul id="lista"></ul>
```

```css playground=borrar
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

li {
  display: flex;
  justify-content: space-between;
  max-width: 300px;
  padding: 8px 0;
  border-bottom: 1px solid #e4e4e7;
}
```

```js playground=borrar
const boton = document.querySelector('#agregar')
const lista = document.querySelector('#lista')
let contador = 0

boton.addEventListener('click', () => {
  contador++

  const tarea = document.createElement('li')
  const texto = document.createElement('span')
  texto.textContent = `Tarea ${contador}`

  const borrar = document.createElement('button')
  borrar.textContent = '✕'
  borrar.setAttribute('aria-label', `Borrar tarea ${contador}`)
  borrar.addEventListener('click', () => tarea.remove())

  tarea.append(texto, borrar) // append acepta varios elementos a la vez
  lista.append(tarea)
})
```

Fíjate en el `aria-label`: un lector de pantalla leería "botón equis", que no dice nada. Con `aria-label` lee "Borrar tarea 3".

## `textContent` vs `innerHTML`

Hay un atajo muy tentador: escribir el HTML como un texto con `innerHTML`.

```js
lista.innerHTML += `<li>${tarea}</li>`
```

Funciona, pero tiene dos problemas:

1. **Seguridad.** Si `tarea` viene de lo que escribió el usuario y contiene `<img src=x onerror="alert('hackeado')">`, el navegador **lo ejecuta**. Este ataque se llama **XSS** (*Cross-Site Scripting*). `textContent` trata todo como texto plano, así que no hay peligro.
2. **Rendimiento y bugs.** `innerHTML +=` vuelve a crear **todo** el contenido del padre cada vez, y se pierden los `addEventListener` que tenían los elementos de dentro.

```html playground=xss
<input id="campo" value="<b>hola</b>">
<button id="btn">Mostrar</button>
<p>Con textContent: <span id="seguro"></span></p>
<p>Con innerHTML: <span id="peligroso"></span></p>
```

```js playground=xss
document.querySelector('#btn').addEventListener('click', () => {
  const valor = document.querySelector('#campo').value
  document.querySelector('#seguro').textContent = valor
  document.querySelector('#peligroso').innerHTML = valor
})
```

Con `textContent` ves literalmente `<b>hola</b>`. Con `innerHTML` el navegador lo interpreta como HTML. **Regla:** para texto que venga del usuario o de una API, `textContent`. `innerHTML` solo con HTML que escribiste tú.

## `<template>`: HTML de molde, sin strings

Cuando el elemento que creas tiene muchas piezas, crear cada una con `createElement` se hace largo. La etiqueta **`<template>`** te deja escribir el molde en HTML. Lo que hay dentro **no se muestra**: lo copias desde JavaScript las veces que quieras.

```html playground=template
<template id="molde-tarjeta">
  <article class="tarjeta">
    <h3 class="tarjeta__nombre"></h3>
    <p class="tarjeta__precio"></p>
  </article>
</template>

<div id="productos"></div>
```

```css playground=template
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

#productos {
  display: flex;
  gap: 12px;
}

.tarjeta {
  padding: 12px 16px;
  border: 1px solid #d4d4d8;
  border-radius: 10px;
}

.tarjeta__nombre {
  margin: 0 0 4px;
}

.tarjeta__precio {
  margin: 0;
  color: #16a34a;
}
```

```js playground=template
const molde = document.querySelector('#molde-tarjeta')
const contenedor = document.querySelector('#productos')

const productos = [
  { nombre: 'Teclado', precio: 120 },
  { nombre: 'Mouse', precio: 45 }
]

productos.forEach((producto) => {
  // cloneNode(true) copia el molde con todo lo que tiene dentro
  const tarjeta = molde.content.cloneNode(true)
  tarjeta.querySelector('.tarjeta__nombre').textContent = producto.nombre
  tarjeta.querySelector('.tarjeta__precio').textContent = `S/ ${producto.precio}`
  contenedor.append(tarjeta)
})
```

Lo mejor de los dos mundos: el HTML se queda en el HTML y sigues usando `textContent`, así que es seguro.

## Tu turno

```html playground=ejercicio
<form id="formulario">
  <input id="comentario" placeholder="Escribe un comentario" required>
  <button>Publicar</button>
</form>
<ul id="comentarios"></ul>
```

```js playground=ejercicio
const formulario = document.querySelector('#formulario')
const campo = document.querySelector('#comentario')
const lista = document.querySelector('#comentarios')

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault()
  // 1. Crea un <li> con el texto del campo (¡con textContent!)
  // 2. Añádelo al PRINCIPIO de la lista
  // 3. Añade un botón para borrarlo
  // 4. Vacía el campo
})
```

## Errores comunes

- **Crear el elemento y olvidar meterlo en la página.** `createElement` solo lo crea en memoria. Falta el `append`.
- **`innerHTML` con texto del usuario.** Riesgo de XSS. Usa `textContent`.
- **`innerHTML +=` en un bucle.** Reconstruye todo cada vez y borra los eventos.
- **Olvidar el `true` en `cloneNode(true)`.** Sin él, copia la etiqueta vacía, sin lo que tiene dentro.

## Para profundizar

- [`createElement` en MDN](https://developer.mozilla.org/es/docs/Web/API/Document/createElement)
- [`append` en MDN](https://developer.mozilla.org/es/docs/Web/API/Element/append)
- [`<template>` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/template)

En resumen: **`createElement`** crea, **`append` / `prepend`** encaja en la página y **`remove`** quita. Usa **`textContent`** para el texto y **`<template>`** cuando el elemento tenga muchas piezas. En el siguiente post usaremos todo esto para pintar una lista completa a partir de un array.
