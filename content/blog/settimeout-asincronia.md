---
title: 'setTimeout, setInterval y la asincronía explicada desde cero'
description: '¿Por qué el código dentro de un setTimeout se ejecuta al final? Qué es la asincronía, cómo funcionan los temporizadores y qué es un callback, con una cuenta regresiva.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Asincronía, Fundamentos]
draft: true
---

Mira este código y adivina en qué orden salen los mensajes:

```js playground=adivina
console.log('1. Empiezo')

setTimeout(() => {
  console.log('2. Han pasado 0 segundos')
}, 0)

console.log('3. Termino')
```

Ejecútalo. Sale **1, 3, 2**. Aunque el temporizador es de 0 milisegundos, su mensaje aparece el último. Entender por qué es entender la **asincronía**, la base de las promesas, `fetch` y `async/await`.

## JavaScript hace una cosa a la vez

JavaScript es **de un solo hilo** (*single thread*): ejecuta **una línea detrás de otra**, nunca dos a la vez. Si una tarea tardara 5 segundos (como esperar a un servidor), la página entera se congelaría: no podrías hacer clic ni hacer scroll.

Para evitarlo, las tareas que tardan **se delegan**. JavaScript le dice al navegador: "avísame cuando termine" y **sigue con lo siguiente**. Cuando la tarea acaba, su código se ejecuta... pero solo cuando JavaScript haya terminado lo que estaba haciendo.

Piensa en un restaurante con **un solo camarero**. Toma tu pedido, lo lleva a la cocina y, mientras se cocina, **atiende otras mesas**. No se queda parado delante del horno. Cuando el plato está listo, te lo trae en cuanto tenga un momento libre.

Por eso, en el ejemplo, el `setTimeout` de 0 ms espera a que termine **todo** el código que está en marcha (el mensaje 3) antes de ejecutarse.

## setTimeout: ejecutar algo más tarde

```js playground=timeout
console.log('Pedido recibido')

setTimeout(() => {
  console.log('🍕 Tu pizza está lista')
}, 2000) // 2000 milisegundos = 2 segundos

console.log('Mientras tanto, puedes seguir navegando')
```

`setTimeout(funcion, milisegundos)` recibe dos cosas:

1. **Una función**: lo que se ejecutará más tarde.
2. **El tiempo de espera** en milisegundos (1000 ms = 1 segundo).

## Callback: una función que pasas para que la llamen después

A esa función que le pasas a `setTimeout` se le llama **callback** (en inglés, "devolver la llamada"): no la ejecutas tú, se la das a otro para que **la llame cuando toque**. Es como dejar tu número de teléfono para que te avisen.

Ya has usado callbacks sin saberlo:

```js
boton.addEventListener('click', () => { ... })  // se llama cuando hagas clic
numeros.map(n => n * 2)                        // se llama una vez por elemento
setTimeout(() => { ... }, 1000)                // se llama dentro de 1 segundo
```

Puedes pasar una función con nombre en vez de escribirla ahí mismo. Fíjate: se pasa **sin paréntesis**, porque no la quieres ejecutar ahora:

```js playground=callback-nombre
function avisar() {
  console.log('⏰ ¡Tiempo!')
}

setTimeout(avisar, 1000)    // ✅ le pasas la función
// setTimeout(avisar(), 1000) ❌ la ejecutarías ya y pasarías su resultado (undefined)
```

## Cancelar un setTimeout

`setTimeout` devuelve un **identificador**. Si lo guardas, puedes cancelar el temporizador antes de que se cumpla con `clearTimeout`:

```js playground=cancelar
const aviso = setTimeout(() => {
  console.log('Esto no llegará a mostrarse')
}, 3000)

clearTimeout(aviso)
console.log('Temporizador cancelado')
```

Es la base de cosas como el *debounce* de un buscador (tienes una prueba técnica sobre eso).

## setInterval: repetir cada cierto tiempo

`setInterval` es como `setTimeout`, pero **se repite** cada X milisegundos hasta que lo pares con `clearInterval`:

```js playground=interval
let segundos = 0

const reloj = setInterval(() => {
  segundos++
  console.log(`Segundos: ${segundos}`)

  if (segundos === 5) {
    clearInterval(reloj)
    console.log('Reloj detenido')
  }
}, 1000)
```

**Siempre** guarda el identificador y para el intervalo cuando ya no lo necesites. Un `setInterval` olvidado sigue ejecutándose para siempre.

## Proyecto: una cuenta regresiva

Juntamos `setInterval`, `clearInterval` y el DOM:

```html playground=cuenta
<p class="numero" id="numero">10</p>
<button id="empezar">Empezar</button>
<button id="parar">Parar</button>
```

```css playground=cuenta
body {
  font-family: system-ui, sans-serif;
  text-align: center;
  padding: 32px;
}

.numero {
  margin: 0 0 16px;
  font-size: 72px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

button {
  min-height: 44px;
  padding: 0 20px;
  font: inherit;
  cursor: pointer;
}
```

```js playground=cuenta
const numero = document.querySelector('#numero')
const botonEmpezar = document.querySelector('#empezar')
const botonParar = document.querySelector('#parar')

let restantes = 10
let intervalo = null

botonEmpezar.addEventListener('click', () => {
  if (intervalo) return // ya está en marcha: no creamos otro

  restantes = 10
  numero.textContent = restantes

  intervalo = setInterval(() => {
    restantes--
    numero.textContent = restantes

    if (restantes === 0) {
      clearInterval(intervalo)
      intervalo = null
      numero.textContent = '🚀'
    }
  }, 1000)
})

botonParar.addEventListener('click', () => {
  clearInterval(intervalo)
  intervalo = null
})
```

El detalle más importante es el `if (intervalo) return`. Sin él, cada clic en "Empezar" crearía **otro** intervalo, y la cuenta iría el doble de rápido, luego el triple... Es uno de los bugs más típicos con temporizadores.

## ¿Y las promesas?

Los callbacks funcionan, pero cuando una tarea depende de otra, que depende de otra, el código se llena de funciones dentro de funciones. A eso se le llama *callback hell* (el infierno de los callbacks). Las **promesas** y **`async/await`** nacieron para escribir lo mismo de forma ordenada. Son el siguiente paso, y tienen su propio post.

## Errores comunes

- **Esperar que el código de un `setTimeout` se ejecute antes que lo de abajo.** Siempre va después, aunque el tiempo sea 0.
- **Poner paréntesis al pasar la función**: `setTimeout(avisar(), 1000)` la ejecuta en el momento.
- **Olvidar `clearInterval`.** El intervalo nunca para.
- **Crear varios intervalos sin querer** al pulsar un botón varias veces.
- **Confiar en que el tiempo es exacto.** `setTimeout(fn, 1000)` espera **como mínimo** 1 segundo; si JavaScript está ocupado, puede tardar algo más.

## Para profundizar

- [`setTimeout()` en MDN](https://developer.mozilla.org/es/docs/Web/API/setTimeout)
- [Introducción a JavaScript asíncrono, en MDN](https://developer.mozilla.org/es/docs/Learn/JavaScript/Asynchronous/Introducing)

En resumen: JavaScript hace **una cosa a la vez**, así que las tareas que tardan se **delegan** y su código se ejecuta **después**. **`setTimeout`** ejecuta algo una vez más tarde, **`setInterval`** lo repite, y a la función que les pasas se le llama **callback**. Guarda siempre el identificador para poder cancelarlos.
