---
title: '"this" en JavaScript explicado sin dolor'
description: 'Qué vale this en un método, en una función suelta, en una arrow function y en un evento. Por qué se "pierde" al pasar un método como callback y cómo arreglarlo.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Objetos, Funciones]
draft: true
---

`this` es probablemente la palabra más confusa de JavaScript. En otros lenguajes siempre significa "este objeto", pero en JavaScript **cambia según cómo llames a la función**. La buena noticia: con cuatro reglas lo tienes dominado.

## La idea clave

`this` **no depende de dónde escribes la función**, sino de **cómo la llamas**. La pregunta que tienes que hacerte siempre es: **¿qué hay a la izquierda del punto cuando llamo a la función?**

## Regla 1: en un método, `this` es el objeto del punto

Un **método** es una función guardada dentro de un objeto. Cuando la llamas con `objeto.metodo()`, `this` es ese objeto:

```js playground=metodo
const carrito = {
  productos: ['Teclado', 'Mouse'],
  total: 165,

  resumen() {
    console.log(`Tienes ${this.productos.length} productos por S/ ${this.total}`)
  }
}

carrito.resumen() // this === carrito
```

`this` te permite que el método use los datos de **su propio objeto** sin escribir su nombre. Así, el mismo método sirve para muchos objetos:

```js playground=compartido
function presentarse() {
  console.log(`Hola, soy ${this.nombre}`)
}

const ana = { nombre: 'Ana', presentarse }
const luis = { nombre: 'Luis', presentarse }

ana.presentarse()  // Hola, soy Ana
luis.presentarse() // Hola, soy Luis
```

La **misma función** da resultados distintos según el objeto que está a la izquierda del punto.

## Regla 2: una función suelta no tiene `this`

Si llamas a la función **sin nada a la izquierda del punto**, `this` es `undefined` (en el modo estricto, que es el de los módulos y las clases):

```js playground=suelta
'use strict'

const carrito = {
  total: 165,
  mostrarTotal() {
    console.log(this.total)
  }
}

carrito.mostrarTotal() // 165 ✅

const mostrar = carrito.mostrarTotal // copiamos la función, sin el objeto
mostrar() // ❌ TypeError: Cannot read properties of undefined (reading 'total')
```

Al guardar el método en una variable, **se pierde el objeto**. Ya no hay nada a la izquierda del punto.

## El caso típico: el método que "pierde" su `this`

Esto pasa sobre todo cuando pasas un método como **callback** (a `setTimeout`, a `addEventListener`, a `map`...):

```js playground=perdido
'use strict'

const temporizador = {
  segundos: 3,
  avisar() {
    console.log(`Han pasado ${this.segundos} segundos`)
  }
}

setTimeout(temporizador.avisar, 1000) // ❌ this ya no es temporizador
```

`setTimeout` recibe la función "suelta" y la llama sin objeto. Tres formas de arreglarlo:

```js playground=arreglos
const temporizador = {
  segundos: 3,
  avisar() {
    console.log(`Han pasado ${this.segundos} segundos`)
  }
}

// 1. Envolverla en una arrow function (la más usada)
setTimeout(() => temporizador.avisar(), 1000)

// 2. Fijar el this con bind
setTimeout(temporizador.avisar.bind(temporizador), 1500)
```

- **Arrow function**: dentro, vuelves a llamar al método con el punto (`temporizador.avisar()`), así que la regla 1 vuelve a funcionar.
- **`bind(objeto)`**: crea una copia de la función con el `this` **fijado para siempre** a ese objeto.

## Regla 3: las arrow functions no tienen `this` propio

Las arrow functions **no tienen su propio `this`**: usan el del sitio donde se **escribieron**. Esto tiene dos consecuencias.

**La buena:** dentro de un método, una arrow function "hereda" el `this` del método. Perfecto para callbacks:

```js playground=arrow-buena
const tienda = {
  nombre: 'Mi Tienda',
  productos: ['Teclado', 'Mouse'],

  listar() {
    this.productos.forEach((producto) => {
      // la arrow usa el this de listar(), que es tienda
      console.log(`${this.nombre} vende: ${producto}`)
    })
  }
}

tienda.listar()
```

**La mala:** no uses una arrow function **como método** de un objeto, porque no tendrá el `this` del objeto:

```js playground=arrow-mala
const usuario = {
  nombre: 'Ana',
  saludar: () => {
    console.log(`Hola, soy ${this?.nombre}`) // ❌ this no es usuario
  }
}

usuario.saludar() // Hola, soy undefined
```

**Regla práctica:** para **métodos**, usa la sintaxis corta `metodo() {}`. Para **callbacks dentro** de los métodos, usa arrow functions.

## Regla 4: en un evento, `this` es el elemento

Con `addEventListener` y una función normal, `this` es el elemento que tiene el listener:

```html playground=evento
<button>Botón 1</button>
<button>Botón 2</button>
```

```js playground=evento
document.querySelectorAll('button').forEach((boton) => {
  boton.addEventListener('click', function () {
    this.textContent = '¡Pulsado!' // this === el botón
  })
})
```

Pero en código moderno es más claro usar `evento.currentTarget` (o la propia variable), que funciona igual con arrow functions:

```js
boton.addEventListener('click', (evento) => {
  evento.currentTarget.textContent = '¡Pulsado!'
})
```

## En las clases

En las clases, `this` es **la instancia** que se está creando o usando (lo vimos en el post de clases). Y tienen el mismo problema al pasar un método como callback. La solución moderna es declarar el método como una **propiedad con arrow function**:

```js playground=clase
class Contador {
  valor = 0

  // propiedad con arrow: su this queda fijado a la instancia
  incrementar = () => {
    this.valor++
    console.log(this.valor)
  }
}

const contador = new Contador()
setTimeout(contador.incrementar, 500) // ✅ 1, sin perder el this
```

## Chuleta

| Cómo llamas a la función | `this` vale |
| --- | --- |
| `objeto.metodo()` | `objeto` |
| `funcion()` (suelta) | `undefined` (modo estricto) |
| Arrow function | El `this` del sitio donde se escribió |
| `funcion.bind(obj)` | `obj`, siempre |
| `addEventListener` con `function` | El elemento |
| `new Clase()` | La instancia nueva |

## Tu turno

Este código falla. Encuentra por qué y arréglalo de dos formas distintas:

```js playground=ejercicio
'use strict'

const reloj = {
  hora: '10:30',
  mostrar() {
    console.log(`Son las ${this.hora}`)
  }
}

const botones = [reloj.mostrar]
botones.forEach((accion) => accion())
```

## Errores comunes

- **Pasar un método como callback** (`setTimeout(obj.metodo)`). Pierde el `this`. Envuélvelo: `() => obj.metodo()`.
- **Usar una arrow function como método** de un objeto. Usa `metodo() {}`.
- **Usar `function` dentro de un método** como callback de `forEach` o `setTimeout`. Tiene su propio `this`. Usa una arrow.
- **Usar `this` cuando no lo necesitas.** Si una función no está en un objeto ni en una clase, no tiene sentido usar `this`.

## Para profundizar

- [`this` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/this)
- [`bind` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

En resumen: `this` depende de **cómo llamas** a la función. Con **`objeto.metodo()`** es el objeto; con una función **suelta** es `undefined`; las **arrow functions** usan el `this` de donde se escribieron. Usa **métodos normales** en los objetos y **arrow functions para los callbacks** de dentro, y cuando pases un método como callback, envuélvelo en una arrow.
