---
title: '¿Por qué un framework? Del DOM "a mano" a los componentes'
description: 'Qué problema resuelven React, Vue y compañía, explicado con el mismo ejemplo en JavaScript puro y en componentes. Y cuándo NO necesitas uno.'
date: 2026-11-26
series: frameworks
tags: [Frameworks, React, Vue, Fundamentos]
draft: true
---

Si miras ofertas de trabajo de frontend, casi todas piden React, Vue o Angular. Y es fácil caer en la tentación de saltarte el JavaScript "normal" e ir directo al framework. Hoy vamos a ver **qué problema resuelven**, con un ejemplo, para que cuando llegues a React sepas por qué hace lo que hace.

## Primero, ¿qué es un framework?

Un **framework** es un conjunto de herramientas y reglas para construir aplicaciones. Te da una **forma de organizar** el código y resuelve por ti los problemas que todo el mundo tiene.

Una **librería** es parecida, pero más pequeña: la llamas tú cuando la necesitas. React técnicamente se presenta como librería; Vue, Angular o Svelte, como frameworks. En el día a día se dice "framework" para todos, y no pasa nada.

## El problema: la interfaz se desincroniza

Hagamos un carrito muy simple en JavaScript puro, con un contador de productos en dos sitios: el botón del carrito y el resumen.

```html playground=manual
<header>
  🛒 <span id="contador-cabecera">0</span>
</header>

<button id="agregar">Añadir producto</button>
<button id="vaciar">Vaciar carrito</button>

<p>Tienes <span id="contador-resumen">0</span> productos.</p>
<p id="aviso" hidden>¡Envío gratis a partir de 3 productos! 🎉</p>
```

```css playground=manual
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

header {
  font-size: 24px;
  margin-bottom: 16px;
}
```

```js playground=manual
let cantidad = 0

const cabecera = document.querySelector('#contador-cabecera')
const resumen = document.querySelector('#contador-resumen')
const aviso = document.querySelector('#aviso')

document.querySelector('#agregar').addEventListener('click', () => {
  cantidad++
  cabecera.textContent = cantidad
  resumen.textContent = cantidad
  aviso.hidden = cantidad < 3
})

document.querySelector('#vaciar').addEventListener('click', () => {
  cantidad = 0
  cabecera.textContent = cantidad
  resumen.textContent = cantidad
  // 🐛 ¡Se nos olvidó actualizar el aviso!
})
```

Añade tres productos y luego vacía el carrito. El aviso de envío gratis **sigue ahí**, con 0 productos. Nos olvidamos de una línea.

Ahora imagina una app real: el carrito aparece en la cabecera, en el menú del móvil, en el resumen y en el botón de pagar; hay descuentos, stock y usuarios. Cada vez que algo cambia tienes que **acordarte de actualizar a mano** todos los sitios que dependen de ese dato. Tarde o temprano, te olvidas de uno.

## La solución en JavaScript puro: estado + render

En el post de pintar listas vimos el arreglo: una función `render()` que pinta **todo** a partir del estado, y la llamamos tras cada cambio.

```html playground=render
<header>
  🛒 <span id="contador-cabecera">0</span>
</header>

<button id="agregar">Añadir producto</button>
<button id="vaciar">Vaciar carrito</button>

<p>Tienes <span id="contador-resumen">0</span> productos.</p>
<p id="aviso" hidden>¡Envío gratis a partir de 3 productos! 🎉</p>
```

```js playground=render
let cantidad = 0

function render() {
  document.querySelector('#contador-cabecera').textContent = cantidad
  document.querySelector('#contador-resumen').textContent = cantidad
  document.querySelector('#aviso').hidden = cantidad < 3
}

document.querySelector('#agregar').addEventListener('click', () => {
  cantidad++
  render()
})

document.querySelector('#vaciar').addEventListener('click', () => {
  cantidad = 0
  render()
})

render()
```

Mucho mejor: ya no te puedes olvidar de nada, porque `render()` lo actualiza todo. Pero quedan problemas cuando la app crece:

1. **Te sigues pudiendo olvidar de llamar a `render()`.**
2. **Repintar todo es lento** con muchos elementos (y se pierde, por ejemplo, el foco del input en el que estabas escribiendo).
3. **Un solo `render()` gigante** para toda la página es imposible de mantener.
4. **El HTML y la lógica están separados**: para entender un botón, saltas del HTML al JS buscando ids.

## Lo que hace un framework

Un framework resuelve exactamente esos cuatro problemas:

1. **Reactividad**: cambias el dato y la interfaz se actualiza **sola**. No llamas a `render()`.
2. **Actualiza solo lo que cambió**: compara la interfaz nueva con la anterior y toca lo mínimo.
3. **Componentes**: divides la página en piezas pequeñas e independientes (`<Cabecera />`, `<Carrito />`, `<BotonPagar />`), cada una con su HTML, su lógica y, a veces, sus estilos.
4. **Declarativo**: describes **cómo debe verse** la interfaz para cada estado, en vez de dar instrucciones paso a paso.

Así se vería el mismo carrito en **React** (no lo ejecutes todavía, solo léelo):

```jsx
function Carrito() {
  const [cantidad, setCantidad] = useState(0)

  return (
    <>
      <header>🛒 {cantidad}</header>

      <button onClick={() => setCantidad(cantidad + 1)}>Añadir producto</button>
      <button onClick={() => setCantidad(0)}>Vaciar carrito</button>

      <p>Tienes {cantidad} productos.</p>
      {cantidad >= 3 && <p>¡Envío gratis a partir de 3 productos! 🎉</p>}
    </>
  )
}
```

Y en **Vue**:

```html
<script setup>
import { ref } from 'vue'
const cantidad = ref(0)
</script>

<template>
  <header>🛒 {{ cantidad }}</header>

  <button @click="cantidad++">Añadir producto</button>
  <button @click="cantidad = 0">Vaciar carrito</button>

  <p>Tienes {{ cantidad }} productos.</p>
  <p v-if="cantidad >= 3">¡Envío gratis a partir de 3 productos! 🎉</p>
</template>
```

Fíjate en lo que **no** hay: ni `querySelector`, ni `textContent`, ni `render()`. Solo dices "aquí va la cantidad" y "el aviso aparece si hay 3 o más". El framework se encarga del resto.

## Imperativo vs declarativo

Es la gran diferencia de mentalidad, y te la van a preguntar en entrevistas:

| Imperativo (DOM a mano) | Declarativo (framework) |
| --- | --- |
| Das **órdenes**: "busca este elemento, cambia su texto, ocúltalo" | **Describes el resultado**: "con 3 productos, se ve el aviso" |
| Tú decides **cuándo** actualizar | El framework decide cuándo |
| Fácil de empezar, difícil de mantener | Cuesta un poco aprenderlo, escala mucho mejor |

Es como pedir un taxi: imperativo es "gira a la derecha, sigue recto, para aquí"; declarativo es "lléveme a esta dirección".

## ¿Cuál aprender?

- **React**: el más pedido en ofertas de trabajo, con diferencia. Si buscas tu primer empleo, es la apuesta segura.
- **Vue**: muy amable para empezar, con una sintaxis cercana al HTML. Muy usado en muchas empresas y agencias.
- **Angular**: más grande y estructurado, típico de empresas grandes y bancos.
- **Svelte**: pequeño y elegante, creciendo poco a poco.

Lo importante: **los conceptos se repiten en todos** (componentes, props, estado, eventos, renderizado condicional y listas). El que aprendas primero te hará el segundo muchísimo más fácil.

## ¿Cuándo NO necesitas un framework?

- Una **landing page** o una web informativa sin apenas interacción.
- Un formulario de contacto, un acordeón o un menú móvil.
- Un **blog** o un portafolio sencillo.

Para eso, HTML + CSS + un poco de JavaScript es más rápido de hacer, carga más rápido y no necesitas instalar nada. Un buen desarrollador sabe elegir la herramienta, no usa siempre la más grande.

## Antes de empezar con un framework, asegúrate de dominar...

Los frameworks usan JavaScript moderno constantemente. Si estos temas te suenan raros, repásalos primero (todos tienen su post en el blog):

- `let` y `const`, arrow functions y template literals
- Destructuring y spread / rest
- `map`, `filter` y `find`
- Módulos (`import` / `export`)
- Promesas, `async` / `await` y `fetch`
- Estado + render con JavaScript puro

## Errores comunes

- **Saltarte JavaScript para ir directo a React.** Te bloquearás con errores que en realidad son de JavaScript, no de React.
- **Usar un framework para todo**, incluso para una web de una página.
- **Pensar que aprender un framework es aprender "otro lenguaje".** Sigue siendo JavaScript, con una forma de organizarlo.
- **Cambiar de framework cada semana.** Elige uno y construye proyectos con él.

## Para profundizar

- [Pensar en React (documentación oficial)](https://es.react.dev/learn/thinking-in-react)
- [Introducción a Vue (documentación oficial, en inglés)](https://vuejs.org/guide/introduction.html)

En resumen: un framework resuelve el problema de **mantener la interfaz sincronizada con los datos**. Te da **reactividad**, **componentes** y una forma **declarativa** de describir la interfaz. Domina primero JavaScript, aprende un framework (React es la apuesta más segura para encontrar trabajo) y úsalo solo cuando el proyecto lo merezca.
