---
title: 'Promesas y async/await explicados con un pedido de delivery'
description: 'Qué es una promesa, cómo usar then y catch, y cómo async/await hace que el código asíncrono se lea como una receta.'
date: 2026-11-25
series: javascript
tags: [JavaScript, ES6, Asincronía]
draft: true
order: 28
---

Pides una pizza por una app. No te quedas mirando la puerta sin hacer nada: sigues con tu vida, y **cuando llega**, la recibes. Y si algo sale mal, te avisan.

Eso es una **promesa** en JavaScript.

## El problema: cosas que tardan

Hay operaciones que no terminan al instante: pedir datos a un servidor, leer un archivo, esperar un tiempo. Si JavaScript se quedara **congelado** esperando, la página no respondería a nada.

Por eso esas operaciones devuelven una **promesa**: un objeto que dice "todavía no tengo el resultado, pero te lo daré".

## Los tres estados de una promesa

- **pending** (pendiente): la pizza está en camino.
- **fulfilled** (cumplida): llegó la pizza. 🍕
- **rejected** (rechazada): se canceló el pedido. 😢

## Creamos nuestro delivery

Esta función simula un pedido que tarda 2 segundos. No te preocupes si no entiendes cada línea de cómo se crea; lo importante es **cómo se usa**:

```js playground-setup
const pedirPizza = (sabor) => new Promise((resolve, reject) => {
  console.log(`🛵 Pedido de pizza ${sabor} en camino...`)

  setTimeout(() => {
    if (sabor === 'piña') {
      reject(new Error('Lo siento, no hacemos pizza con piña'))
    } else {
      resolve(`🍕 Llegó tu pizza ${sabor}`)
    }
  }, 2000)
})
```

## Forma 1: `then` y `catch`

`then` se ejecuta cuando la promesa **se cumple**, y `catch` cuando **falla**:

```js playground=then
pedirPizza('pepperoni')
  .then((resultado) => console.log(resultado))
  .catch((error) => console.log('❌', error.message))

console.log('Mientras tanto, pongo la mesa 🍽️')
```

Mira el orden en la consola: "pongo la mesa" sale **antes** que la pizza. JavaScript no se quedó esperando. Cambia `'pepperoni'` por `'piña'` para ver el `catch`.

## Forma 2: `async` / `await`

`await` significa "**espera** aquí a que esta promesa termine". Solo se puede usar dentro de una función marcada con `async`. Los errores se atrapan con `try` / `catch`:

```js playground=await
const cenar = async () => {
  try {
    const pizza = await pedirPizza('hawaiana')
    console.log(pizza)
    console.log('😋 A comer')
  } catch (error) {
    console.log('❌', error.message)
    console.log('🍳 Mejor cocino algo')
  }
}

cenar()
```

Se lee de arriba a abajo, como una receta. Por eso hoy casi todo el mundo prefiere `async`/`await`.

## Varias cosas a la vez: `Promise.all`

¿Pides pizza y bebida a dos lugares distintos? No esperes una para pedir la otra. `Promise.all` lanza **todas a la vez** y espera a que terminen:

```js playground=all
const pedirBebida = () => new Promise((resolve) => {
  setTimeout(() => resolve('🥤 Llegó la bebida'), 1000)
})

const pedirTodo = async () => {
  console.time('tiempo total')
  const [pizza, bebida] = await Promise.all([pedirPizza('americana'), pedirBebida()])
  console.log(pizza)
  console.log(bebida)
  console.timeEnd('tiempo total') // ~2 segundos, no 3
}

pedirTodo()
```

Tarda lo que tarde **la más lenta**, no la suma de todas.

## Errores comunes

- **Olvidar el `await`.** `const pizza = pedirPizza('queso')` te da la **promesa**, no la pizza. Verás `Promise { <pending> }`.
- **Usar `await` fuera de una función `async`.** Da error (salvo en módulos, pero eso es otro tema).
- **No manejar el error.** Si una promesa falla y no hay `catch`, verás un `Uncaught (in promise)` en la consola. Siempre usa `try`/`catch` o `.catch()`.

## Para profundizar

- [Usar promesas en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Using_promises)
- [`async function` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/async_function)
- [`Promise.all` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

En resumen: una **promesa** es un resultado que llegará después, **`then`/`catch`** o **`async`/`await`** para usarla, y **`Promise.all`** para esperar varias a la vez.
