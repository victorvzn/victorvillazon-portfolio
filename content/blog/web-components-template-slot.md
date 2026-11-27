---
title: 'Web Components: crea tus propias etiquetas HTML con template, slot y Shadow DOM'
description: 'Qué son los Web Components, la etiqueta <template> para clonar HTML, crear un custom element con customElements.define, aislar sus estilos con Shadow DOM, rellenarlo con <slot> y reaccionar a atributos, sin ningún framework.'
date: 2026-11-27
series: html
tags: [HTML, Web Components, JavaScript, Avanzado]
draft: true
---

En React o Vue creas componentes como `<TarjetaProducto>`. Pero ¿sabías que **el navegador** también te deja crear tus propias etiquetas, sin instalar nada? Puedes escribir esto en un HTML normal:

```html
<tarjeta-perfil nombre="Ana Torres" rol="Frontend developer"></tarjeta-perfil>
```

y que el navegador lo entienda. Eso son los **Web Components**: un conjunto de tecnologías nativas para crear componentes reutilizables que funcionan en cualquier web, con o sin framework.

Son tres piezas:

1. **`<template>`**: HTML que no se muestra, listo para clonar.
2. **Custom elements**: tus propias etiquetas, con su comportamiento en JavaScript.
3. **Shadow DOM**: un DOM "privado" con estilos que no se mezclan con los de la página.

## Pieza 1: `<template>`

Todo lo que hay dentro de `<template>` **no se pinta ni se ejecuta**: es un molde. Con JavaScript lo **clonas** tantas veces como quieras.

```html playground=template
<template id="plantilla-tarea">
  <li class="tarea">
    <input type="checkbox">
    <span class="texto"></span>
  </li>
</template>

<ul id="lista"></ul>
```

```js playground=template
const plantilla = document.querySelector('#plantilla-tarea')
const lista = document.querySelector('#lista')

const tareas = ['Aprender template', 'Crear un custom element', 'Probar Shadow DOM']

for (const texto of tareas) {
  const copia = plantilla.content.cloneNode(true) // true = con todo su contenido
  copia.querySelector('.texto').textContent = texto
  lista.append(copia)
}
```

- **`plantilla.content`** es el contenido del template (un *DocumentFragment*).
- **`cloneNode(true)`** hace una copia completa.
- Rellenamos con **`textContent`**, que es seguro: si el texto tuviera `<script>`, se mostraría como texto, no se ejecutaría. Más limpio y seguro que construir HTML con *template literals* e `innerHTML` (como viste en el post de pintar listas).

## Pieza 2: custom elements

Un **custom element** es una etiqueta propia, definida con una **clase** de JavaScript (lo viste en el post de clases):

```html playground=saludo
<saludo-usuario></saludo-usuario>
<saludo-usuario></saludo-usuario>
```

```js playground=saludo
class SaludoUsuario extends HTMLElement {
  connectedCallback() {
    this.textContent = `👋 ¡Hola! Son las ${new Date().toLocaleTimeString('es-PE')}`
  }
}

customElements.define('saludo-usuario', SaludoUsuario)
```

- La clase **extiende `HTMLElement`**: tu etiqueta es un elemento HTML más, con todo lo que eso implica (`addEventListener`, `classList`...).
- **`connectedCallback`** se ejecuta cuando el elemento **aparece en la página**. Es como el `onMounted` de Vue.
- **`customElements.define('nombre', Clase)`** registra la etiqueta.

> **El nombre debe llevar un guion**: `saludo-usuario`, `mi-boton`, `tarjeta-perfil`. Así nunca chocará con una etiqueta futura de HTML (que nunca llevan guion).

## Pieza 3: Shadow DOM

Si tu componente tiene estilos, ¿qué pasa si la página también tiene una regla para `h2` o `.boton`? Se mezclan. Y al revés: los estilos de tu componente podrían romper la página.

El **Shadow DOM** le da a tu componente un **DOM propio y aislado**. Los estilos de dentro **no salen**, y los de fuera **no entran**. Es lo que usan las propias etiquetas del navegador: un `<video>` tiene botones dentro que no ves en las DevTools... salvo que actives "Mostrar Shadow DOM".

```html playground=perfil
<style>
  /* Estilos de la página: NO afectan al interior del componente */
  h2 { color: crimson; font-family: serif; }
</style>

<h2>Un título de la página</h2>

<tarjeta-perfil nombre="Ana Torres" rol="Frontend developer"></tarjeta-perfil>
<tarjeta-perfil nombre="Luis Ramos" rol="Backend developer"></tarjeta-perfil>
```

```js playground=perfil
const plantilla = document.createElement('template')
plantilla.innerHTML = `
  <style>
    :host {
      display: block;
      max-width: 320px;
      margin-block: 12px;
      padding: 16px;
      border-radius: 12px;
      background: #18181b;
      color: #fafafa;
      font-family: system-ui, sans-serif;
    }
    h2 { margin: 0; font-size: 1.2rem; color: #fbbf24; }
    p { margin: 4px 0 0; color: #a1a1aa; }
  </style>
  <h2></h2>
  <p></p>
`

class TarjetaPerfil extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(plantilla.content.cloneNode(true))
  }

  connectedCallback() {
    this.shadowRoot.querySelector('h2').textContent = this.getAttribute('nombre')
    this.shadowRoot.querySelector('p').textContent = this.getAttribute('rol')
  }
}

customElements.define('tarjeta-perfil', TarjetaPerfil)
```

Ábrelo en el playground: el `h2` de la página es rojo y con serifa, y los de las tarjetas, amarillos. **Ninguno pisa al otro.**

- **`this.attachShadow({ mode: 'open' })`** crea el Shadow DOM, accesible en `this.shadowRoot`.
- **`:host`** es el selector para **el propio componente** (la etiqueta `<tarjeta-perfil>`). Por defecto, un custom element es `display: inline`: casi siempre querrás cambiarlo.
- **`getAttribute('nombre')`** lee los atributos, como en cualquier elemento.

> Las variables CSS (*custom properties*) **sí atraviesan** el Shadow DOM. Es la forma de dejar que la página personalice tu componente: dentro usas `color: var(--tarjeta-acento, #fbbf24)` y fuera alguien escribe `tarjeta-perfil { --tarjeta-acento: hotpink; }`.

## `<slot>`: el contenido lo pone quien lo usa

Leer todo de atributos es limitado: ¿y si quieres poner un enlace, una imagen o un texto con negritas? Para eso está **`<slot>`**: un hueco que se rellena con lo que escribas **dentro** de la etiqueta. (Es justo de donde vienen los slots de Vue.)

```html playground=aviso
<mi-aviso tipo="exito">
  <strong slot="titulo">¡Guardado!</strong>
  Tus cambios se han guardado correctamente. <a href="#">Ver historial</a>
</mi-aviso>

<mi-aviso tipo="error">
  <strong slot="titulo">Algo salió mal</strong>
  No pudimos conectar con el servidor.
</mi-aviso>

<mi-aviso>Un aviso sin título ni tipo.</mi-aviso>
```

```js playground=aviso
const plantillaAviso = document.createElement('template')
plantillaAviso.innerHTML = `
  <style>
    :host {
      display: block;
      margin-block: 12px;
      padding: 12px 16px;
      border-left: 4px solid var(--color, #3b82f6);
      border-radius: 8px;
      background: color-mix(in oklch, var(--color, #3b82f6) 12%, white);
      font-family: system-ui, sans-serif;
    }
    :host([tipo="exito"]) { --color: #16a34a; }
    :host([tipo="error"]) { --color: #dc2626; }
    .titulo { display: block; margin-bottom: 4px; }
  </style>
  <span class="titulo"><slot name="titulo">ℹ️ Aviso</slot></span>
  <slot></slot>
`

class MiAviso extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' }).append(plantillaAviso.content.cloneNode(true))
    this.setAttribute('role', 'status')
  }
}

customElements.define('mi-aviso', MiAviso)
```

- **`<slot name="titulo">`** recibe el elemento con `slot="titulo"`. Si no hay ninguno, muestra su contenido por defecto ("ℹ️ Aviso").
- **`<slot></slot>`** (sin nombre) recibe todo lo demás.
- **`:host([tipo="exito"])`** aplica estilos según un atributo del componente.
- El contenido de los slots **sigue siendo de la página**: los estilos de fuera sí le afectan (el enlace se ve como los demás enlaces de tu web).

## Reaccionar a cambios de atributos

Si alguien cambia un atributo con JavaScript (`tarjeta.setAttribute('nombre', 'Otra')`), tu componente debe enterarse. Declara qué atributos observar y el navegador te avisará:

```html playground=contador
<contador-clics inicio="5"></contador-clics>
<button id="reiniciar">Reiniciar a 0 desde fuera</button>
```

```js playground=contador
class ContadorClics extends HTMLElement {
  static observedAttributes = ['inicio']

  constructor() {
    super()
    this.cuenta = 0
    this.attachShadow({ mode: 'open' }).innerHTML = `<button part="boton">Clics: 0</button>`
    this.boton = this.shadowRoot.querySelector('button')
    this.boton.addEventListener('click', () => {
      this.cuenta++
      this.pintar()
      this.dispatchEvent(new CustomEvent('cambio', { detail: this.cuenta, bubbles: true }))
    })
  }

  attributeChangedCallback(nombre, anterior, nuevo) {
    this.cuenta = Number(nuevo) || 0
    this.pintar()
  }

  pintar() {
    this.boton.textContent = `Clics: ${this.cuenta}`
  }
}

customElements.define('contador-clics', ContadorClics)

const contador = document.querySelector('contador-clics')
contador.addEventListener('cambio', (evento) => console.log('Nueva cuenta:', evento.detail))
document.querySelector('#reiniciar').addEventListener('click', () => contador.setAttribute('inicio', '0'))
```

- **`static observedAttributes`** lista los atributos que te interesan.
- **`attributeChangedCallback`** se ejecuta cuando cambia alguno (y también al principio, si viene en el HTML).
- **`CustomEvent`** permite que tu componente **emita eventos propios** (como el `emit` de Vue), con datos en `detail`.
- **`part="boton"`** deja que la página estile esa parte desde fuera con `contador-clics::part(boton) { ... }`.

Otros momentos del ciclo de vida: **`disconnectedCallback`** se ejecuta al quitar el elemento de la página. Úsalo para limpiar temporizadores y listeners globales.

## ¿Web Components o un framework?

| ✅ Brillan en | ❌ Peor que un framework para |
| --- | --- |
| Componentes que deben funcionar **en cualquier web** (con React, Vue o sin nada) | Apps enteras con mucho estado |
| **Sistemas de diseño** de empresas grandes | Reactividad: aquí actualizas el DOM a mano |
| Widgets para incrustar (un chat, un reproductor) | Renderizado en el servidor (es posible, pero más complejo) |

Muchas empresas hacen su librería de componentes con Web Components (a veces con ayuda de **Lit**, una pequeña librería que añade reactividad) para usarla en todos sus proyectos, sea cual sea el framework.

## Tu turno

1. Crea `<boton-copiar texto="...">` que, al hacer clic, copie su atributo `texto` al portapapeles (`navigator.clipboard.writeText`) y cambie a "¡Copiado!" durante 2 segundos.
2. Crea `<tarjeta-producto>` con slots para `imagen`, `titulo` y el contenido por defecto, y una variable CSS `--acento` para personalizarla.
3. Haz que `<tarjeta-perfil>` reaccione a cambios en `nombre` y `rol` con `observedAttributes`.
4. Usa tu componente dentro de un proyecto de React o Vue. ¿Funciona sin cambiar nada?

## Errores comunes

- **Un nombre sin guion** (`customElements.define('tarjeta', ...)`): da error.
- **Definir el mismo elemento dos veces**: `has already been defined`. Comprueba antes con `customElements.get('mi-aviso')`.
- **Olvidar `super()`** en el `constructor`.
- **Leer atributos en el `constructor`**: todavía pueden no estar disponibles. Léelos en `connectedCallback` o `attributeChangedCallback`.
- **Esperar que los estilos de la página entren al Shadow DOM.** No entran: usa variables CSS o `::part()`.
- **Etiquetas de cierre olvidadas**: un custom element **nunca** se cierra solo. `<mi-aviso />` no vale; escribe `<mi-aviso></mi-aviso>`.

## Para profundizar

- [Web Components en MDN](https://developer.mozilla.org/es/docs/Web/API/Web_components)
- [Usar shadow DOM (MDN, en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)

En resumen: los **Web Components** te dejan crear **etiquetas propias** sin framework. **`<template>`** guarda HTML para clonar, **`customElements.define`** registra una clase que **extiende `HTMLElement`** (con `connectedCallback` y `attributeChangedCallback`), el **Shadow DOM** aísla sus estilos (`:host`, variables CSS y `::part()` para personalizar) y **`<slot>`** deja que quien lo usa ponga el contenido. Funcionan en cualquier web, con o sin React o Vue.
