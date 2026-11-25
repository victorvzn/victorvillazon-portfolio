---
title: 'El DOM: tu primer botón que hace algo'
description: 'Qué es el DOM, cómo seleccionar elementos con querySelector y cómo reaccionar a un clic con addEventListener.'
date: 2026-11-25
series: javascript
tags: [JavaScript, DOM, Fundamentos]
draft: true
order: 24
---

Hasta ahora, nuestro JavaScript vivía en la consola. Hoy vamos a hacer que **toque la página**: cambiar un texto, reaccionar a un clic. Para eso necesitas conocer el **DOM**.

## ¿Qué es el DOM?

Cuando el navegador lee tu HTML, construye un **árbol de objetos** en memoria, uno por cada etiqueta. Ese árbol es el **DOM** (*Document Object Model*). JavaScript no modifica tu archivo HTML: modifica **ese árbol**, y el navegador redibuja la página.

El punto de entrada es el objeto `document`.

## Paso 1: seleccionar un elemento

`document.querySelector()` recibe un **selector CSS**, igualito a los que ya usas en tus estilos, y te devuelve el primer elemento que coincida:

```js
document.querySelector('h1')        // la primera etiqueta h1
document.querySelector('.titulo')   // el primero con class="titulo"
document.querySelector('#saludo')   // el que tiene id="saludo"
```

Si necesitas **todos**, usa `querySelectorAll()`.

## Paso 2: cambiar algo

Una vez que tienes el elemento, puedes cambiar su texto, sus clases o sus estilos:

```js
const titulo = document.querySelector('#saludo')

titulo.textContent = '¡Hola desde JavaScript!' // el texto
titulo.classList.add('destacado')              // agregar una clase
```

Un consejo: en vez de cambiar estilos uno por uno con `.style`, **agrega o quita clases** y deja el diseño en el CSS. Así cada cosa queda en su sitio.

## Paso 3: escuchar un evento

Un **evento** es algo que pasa: un clic, una tecla, el envío de un formulario. Con `addEventListener` le dices a un elemento: "cuando pase **esto**, ejecuta **esta función**".

```html playground=boton
<h1 id="saludo">Hola</h1>
<button id="btn">Cambiar saludo</button>
```

```css playground=boton
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.destacado {
  color: #2563eb;
}

button {
  padding: 10px 18px;
  font: inherit;
  cursor: pointer;
}
```

```js playground=boton
const titulo = document.querySelector('#saludo')
const boton = document.querySelector('#btn')

boton.addEventListener('click', () => {
  titulo.textContent = '¡Hola desde JavaScript! 👋'
  titulo.classList.add('destacado')
})
```

Esos son los tres pasos de casi todo lo que harás con el DOM: **seleccionar**, **escuchar** y **cambiar**.

## Leer lo que escribe el usuario

Con el evento `input` puedes reaccionar a cada tecla, y con `.value` lees lo que hay en un campo:

```html playground=input
<label for="nombre">¿Cómo te llamas?</label>
<input id="nombre" placeholder="Escribe tu nombre">
<p id="resultado">Hola, desconocido</p>
```

```css playground=input
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

input {
  display: block;
  margin-top: 8px;
  padding: 8px;
  font: inherit;
}
```

```js playground=input
const campo = document.querySelector('#nombre')
const resultado = document.querySelector('#resultado')

campo.addEventListener('input', () => {
  const nombre = campo.value.trim()
  resultado.textContent = `Hola, ${nombre || 'desconocido'}`
})
```

## Errores comunes

- **`null` al seleccionar.** Si `querySelector` no encuentra nada, devuelve `null`, y al usarlo verás `Cannot read properties of null`. Revisa el selector (¿olvidaste el `#` o el `.`?) y que tu `<script>` esté **al final del `<body>`** o tenga `defer`, para que el HTML ya exista.
- **Ejecutar la función en vez de pasarla.** `addEventListener('click', saludar())` la ejecuta **al instante**. Sin paréntesis: `addEventListener('click', saludar)`.
- **Usar `innerHTML` con texto del usuario.** Usa `textContent`; `innerHTML` interpreta el texto como HTML y puede ser peligroso.

## Para profundizar

- [Introducción al DOM en MDN](https://developer.mozilla.org/es/docs/Web/API/Document_Object_Model/Introduction)
- [`querySelector` en MDN](https://developer.mozilla.org/es/docs/Web/API/Document/querySelector)
- [`addEventListener` en MDN](https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener)

En resumen: **`querySelector`** para seleccionar, **`addEventListener`** para escuchar y **`textContent`/`classList`** para cambiar. Con eso ya puedes darle vida a una página.
