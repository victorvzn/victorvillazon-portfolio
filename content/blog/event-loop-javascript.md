---
title: 'El event loop explicado con dibujos: cómo JavaScript hace varias cosas a la vez'
description: 'La pila de llamadas, las APIs del navegador, la cola de tareas y las microtareas. Por qué un setTimeout de 0 ms no se ejecuta al instante y por qué tu página se congela.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Asincronía, Event loop]
draft: true
---

JavaScript tiene una característica que sorprende: **solo puede hacer una cosa a la vez**. Y sin embargo, mientras espera la respuesta de un `fetch`, puedes seguir haciendo clic en botones, y las animaciones siguen funcionando. ¿Cómo es posible?

La respuesta es el **event loop** (el bucle de eventos). Es una pregunta típica de entrevista, y entenderla te ahorra muchos bugs con código asíncrono.

## Una sola cocinera

Imagina un restaurante con **una sola cocinera** (JavaScript). Solo puede cocinar un plato a la vez. Pero tiene ayudantes:

- Si un plato necesita **20 minutos en el horno**, no se queda mirándolo: lo mete, pone un temporizador y sigue con otro plato.
- Cuando suena el temporizador, un ayudante deja el plato en una **bandeja de "listos para terminar"**.
- Cuando la cocinera termina lo que tiene entre manos, mira la bandeja y lo termina.

Eso es exactamente lo que pasa en el navegador:

- **La cocinera** es el hilo de JavaScript, con su **pila de llamadas**.
- **El horno y los temporizadores** son las **APIs del navegador** (`setTimeout`, `fetch`, los eventos de clic...), que trabajan **por fuera** de JavaScript.
- **La bandeja** es la **cola de tareas**.
- **El event loop** es la cocinera mirando la bandeja cada vez que tiene las manos libres.

## Pieza 1: la pila de llamadas (call stack)

La **pila de llamadas** es donde JavaScript apunta qué función se está ejecutando. Cuando llamas a una función, se pone **encima** de la pila; cuando termina, se **quita**:

```js playground=pila
function saludar(nombre) {
  console.log(`Hola, ${nombre}`)
}

function empezar() {
  saludar('Ana')
  console.log('Fin')
}

empezar()
```

```
1. empezar()          2. saludar('Ana')      3. termina saludar    4. termina empezar
                         ┌──────────────┐
┌──────────────┐         │ saludar      │       ┌──────────────┐
│ empezar      │         │ empezar      │       │ empezar      │       (pila vacía)
└──────────────┘         └──────────────┘       └──────────────┘
```

Mientras la pila **no esté vacía**, JavaScript está ocupado y no puede hacer nada más.

## Pieza 2: las APIs del navegador

Cuando llamas a `setTimeout`, JavaScript **no espera**. Le pasa el temporizador al navegador y sigue con la siguiente línea:

```js playground=timeout
console.log('1. Pido la pizza')

setTimeout(() => {
  console.log('3. ¡Llegó la pizza!')
}, 2000)

console.log('2. Mientras tanto, pongo la mesa')
```

El orden es 1, 2, 3. El temporizador cuenta los 2 segundos **fuera** de JavaScript, mientras la pila sigue ejecutando el resto.

## Pieza 3: la cola de tareas y el event loop

Cuando el temporizador termina, el navegador **no** interrumpe lo que esté haciendo JavaScript. Deja la función en la **cola de tareas**. Y el **event loop** hace esto todo el rato:

> ¿La pila está vacía? → Saca la primera tarea de la cola y ejecútala.

```
                 ┌─────────────────────────┐
                 │   APIs del navegador    │
 setTimeout ───▶ │  ⏱ temporizador 2000ms  │
                 └────────────┬────────────┘
                              │ cuando termina
                              ▼
┌───────────┐        ┌──────────────────┐
│   Pila    │ ◀───── │ Cola de tareas   │
│ (vacía?)  │  event │ [ () => pizza ]  │
└───────────┘  loop  └──────────────────┘
```

## La prueba: `setTimeout` con 0 milisegundos

Si lo anterior es cierto, esto debería ser sorprendente:

```js playground=cero
console.log('A')

setTimeout(() => {
  console.log('B')
}, 0)

console.log('C')
```

Sale **A, C, B**. Aunque el tiempo sea 0, la función pasa por la cola y tiene que **esperar a que la pila se vacíe**. El `0` no significa "ahora", sino "en cuanto puedas".

## Pieza 4: las microtareas (promesas)

Hay una segunda cola, con **prioridad**: la de **microtareas**. Ahí van los `.then()` de las promesas y lo que viene después de un `await`. La regla:

> Cuando la pila se vacía, se ejecutan **todas** las microtareas antes de la siguiente tarea normal.

```js playground=micro
console.log('1. Síncrono')

setTimeout(() => console.log('4. Tarea (setTimeout)'), 0)

Promise.resolve().then(() => console.log('3. Microtarea (promesa)'))

console.log('2. Síncrono')
```

El orden es 1, 2, 3, 4. Las promesas "se cuelan" antes que el `setTimeout`, aunque las dos estuvieran listas a la vez.

El orden completo:

1. Todo el código **síncrono** (la pila).
2. **Todas** las microtareas (promesas, `await`).
3. **Una** tarea de la cola (`setTimeout`, eventos...).
4. El navegador **repinta** la pantalla si hace falta.
5. Vuelta al paso 2.

## Por qué tu página se congela

Si la cocinera se pone a hacer algo que tarda mucho, **nadie más come**. Si JavaScript ejecuta un bucle muy largo, la pila nunca se vacía: no se atienden los clics, no se repinta la pantalla y la página se **congela**.

```html playground=bloqueo
<button id="bloquear">Bloquear 3 segundos</button>
<button id="contar">Contar clics: <span id="clics">0</span></button>
```

```js playground=bloqueo
let clics = 0

document.querySelector('#contar').addEventListener('click', () => {
  clics++
  document.querySelector('#clics').textContent = clics
})

document.querySelector('#bloquear').addEventListener('click', () => {
  const fin = Date.now() + 3000
  while (Date.now() < fin) {
    // un bucle que no deja hacer nada más durante 3 segundos
  }
  console.log('¡Desbloqueado!')
})
```

Pulsa "Bloquear" y luego, rápido, varias veces "Contar clics". Durante 3 segundos no pasa nada; después, todos los clics se procesan de golpe. Estaban esperando en la cola.

Por eso las operaciones que tardan (pedir datos, leer archivos) son **asíncronas**: no ocupan la pila mientras esperan.

## Tu turno

Antes de ejecutarlo, escribe en papel el orden en que crees que saldrán los números. Luego compruébalo:

```js playground=ejercicio
console.log(1)

setTimeout(() => console.log(2), 0)

Promise.resolve().then(() => console.log(3))

setTimeout(() => console.log(4), 0)

Promise.resolve().then(() => {
  console.log(5)
  setTimeout(() => console.log(6), 0)
})

console.log(7)
```

## Errores comunes

- **Pensar que `setTimeout(fn, 0)` se ejecuta al instante.** Espera a que la pila se vacíe y a que pasen las microtareas.
- **Pensar que el tiempo de `setTimeout` es exacto.** Es el tiempo **mínimo**. Si JavaScript está ocupado, tardará más.
- **Usar una variable que se llena en un callback asíncrono justo después de lanzarlo.** Todavía no tiene valor: el callback se ejecutará más tarde. Usa `await` o trabaja dentro del callback.
- **Bucles pesados en el hilo principal.** Congelan la página. Divide el trabajo o muévelo a un *Web Worker* (un hilo aparte, para cuando lo necesites).

## Para profundizar

- [El event loop en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Execution_model)
- [Loupe](http://latentflip.com/loupe/): una herramienta que dibuja el event loop paso a paso con tu propio código.
- [La charla "What the heck is the event loop anyway?" de Philip Roberts](https://www.youtube.com/watch?v=8aGhZQkoFbQ) (en inglés, con subtítulos): la explicación más famosa del tema.

En resumen: JavaScript tiene **una sola pila** y hace una cosa a la vez. Las esperas (`setTimeout`, `fetch`, eventos) las hace el **navegador por fuera**, y cuando terminan dejan su función en una **cola**. El **event loop** la ejecuta cuando la pila está vacía, dando prioridad a las **microtareas** (promesas). Y si bloqueas la pila con un bucle largo, la página se congela.
