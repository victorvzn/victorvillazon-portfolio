---
title: 'Iteradores y generadores en JavaScript: function*, yield y for await'
description: 'Qué hace que algo se pueda recorrer con for...of, el protocolo de iteración, cómo crear tus propios iterables, funciones generadoras con yield, secuencias infinitas y perezosas, y generadores asíncronos para paginar una API con for await.'
date: 2026-11-27
series: javascript
tags: [JavaScript, Generadores, Iteradores, Avanzado]
draft: true
---

Con `for...of` recorres un array, un texto, un `Map` o un `Set`. Pero no un objeto normal: `for (const x of { a: 1 })` da error. ¿Qué tienen los primeros que no tenga el último? Todos siguen el **protocolo de iteración**.

Entenderlo te permite crear **tus propias cosas recorribles** y te abre la puerta a una de las herramientas más curiosas del lenguaje: los **generadores**, funciones que se pueden **pausar** y **reanudar**. Con ellos puedes crear secuencias infinitas, procesar datos de uno en uno o recorrer una API paginada como si fuera un array.

## El protocolo de iteración

Un **iterador** es un objeto con un método **`next()`** que, cada vez que lo llamas, devuelve el siguiente valor con esta forma:

```js
{ value: 'el valor', done: false } // hay más
{ value: undefined, done: true }   // se acabó
```

Puedes verlo con cualquier array:

```js playground=protocolo
const frutas = ['🍎', '🍌', '🍇']
const iterador = frutas[Symbol.iterator]()

console.log(iterador.next()) // { value: '🍎', done: false }
console.log(iterador.next()) // { value: '🍌', done: false }
console.log(iterador.next()) // { value: '🍇', done: false }
console.log(iterador.next()) // { value: undefined, done: true }
```

Un **iterable** es un objeto que tiene un método **`[Symbol.iterator]()`** que devuelve un iterador. Arrays, textos, `Map`, `Set` y `NodeList` (lo que devuelve `querySelectorAll`) lo tienen. Los objetos normales, no.

Y aquí está la clave: **`for...of`, el *spread* (`...`), `Array.from` y la desestructuración de arrays funcionan con cualquier iterable**. Por dentro, llaman a `next()` hasta que `done` es `true`.

## Tu propio iterable

Un rango de números, como el `range` de Python:

```js playground=rango
const rango = {
  desde: 1,
  hasta: 5,
  [Symbol.iterator]() {
    let actual = this.desde
    const hasta = this.hasta
    return {
      next() {
        if (actual <= hasta) return { value: actual++, done: false }
        return { value: undefined, done: true }
      }
    }
  }
}

for (const numero of rango) {
  console.log(numero) // 1, 2, 3, 4, 5
}

console.log([...rango])            // [1, 2, 3, 4, 5]
const [primero, segundo] = rango
console.log(primero, segundo)      // 1 2
```

Funciona, pero es mucho código para algo tan simple. Para eso existen los generadores.

## Funciones generadoras: `function*` y `yield`

Una **función generadora** se escribe con un asterisco (`function*`) y usa **`yield`** para "entregar" valores de uno en uno. Al llamarla **no se ejecuta**: devuelve un iterador. Cada `next()` ejecuta el código **hasta el siguiente `yield`** y se **pausa** ahí.

```js playground=generador
function* saludos() {
  console.log('Empiezo')
  yield 'Hola'
  console.log('Sigo después del primer yield')
  yield 'Qué tal'
  console.log('Termino')
}

const generador = saludos() // todavía no se ha ejecutado nada

console.log(generador.next()) // "Empiezo" → { value: 'Hola', done: false }
console.log(generador.next()) // "Sigo..." → { value: 'Qué tal', done: false }
console.log(generador.next()) // "Termino" → { value: undefined, done: true }
```

Mira el orden de los mensajes en la consola: la función **se para** en cada `yield` y **continúa** justo donde se quedó en el siguiente `next()`. Sus variables locales se conservan entre pausas.

Y como el generador es un iterable, funciona con todo lo anterior. El rango, ahora en tres líneas:

```js playground=rango-generador
function* rango(desde, hasta, paso = 1) {
  for (let i = desde; i <= hasta; i += paso) yield i
}

console.log([...rango(1, 5)])      // [1, 2, 3, 4, 5]
console.log([...rango(0, 20, 5)])  // [0, 5, 10, 15, 20]

for (const n of rango(1, 3)) console.log(`Vuelta ${n}`)
```

## Secuencias perezosas e infinitas

Un generador calcula cada valor **solo cuando se lo pides**: es **perezoso** (*lazy*). Por eso puede representar secuencias **infinitas** sin colgar el navegador:

```js playground=infinito
function* idsUnicos(prefijo = 'id') {
  let n = 1
  while (true) yield `${prefijo}-${n++}` // nunca termina... y no pasa nada
}

const generarId = idsUnicos('tarea')
console.log(generarId.next().value) // 'tarea-1'
console.log(generarId.next().value) // 'tarea-2'
console.log(generarId.next().value) // 'tarea-3'

function* fibonacci() {
  let [a, b] = [0, 1]
  while (true) {
    yield a
    ;[a, b] = [b, a + b]
  }
}

// Tomar solo los primeros 10, y parar
const primeros = []
for (const numero of fibonacci()) {
  if (primeros.length === 10) break
  primeros.push(numero)
}
console.log(primeros) // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

⚠️ Nunca hagas `[...fibonacci()]`: intentaría crear un array infinito. Con secuencias infinitas, sal del bucle con `break` o toma solo lo que necesites.

> Desde 2025, los iteradores tienen métodos como `map`, `filter` y `take` (los **iterator helpers**, con su propio post en esta serie): `fibonacci().filter((n) => n % 2 === 0).take(5).toArray()` toma los 5 primeros pares **sin** calcular nada de más.

## Hacer iterable una clase

Un generador puede ser el método `[Symbol.iterator]` de una clase. Así tus objetos funcionan con `for...of`:

```js playground=clase
class Playlist {
  #canciones = []

  agregar(titulo, segundos) {
    this.#canciones.push({ titulo, segundos })
    return this
  }

  *[Symbol.iterator]() {
    yield* this.#canciones // yield* entrega uno a uno los valores de otro iterable
  }

  *masLargasQue(segundos) {
    for (const cancion of this.#canciones) {
      if (cancion.segundos > segundos) yield cancion
    }
  }
}

const lista = new Playlist()
  .agregar('Intro', 95)
  .agregar('Tema principal', 240)
  .agregar('Final', 310)

for (const cancion of lista) console.log(cancion.titulo)

console.log([...lista.masLargasQue(200)].map((c) => c.titulo)) // ['Tema principal', 'Final']
```

- **`*[Symbol.iterator]()`** es un método generador (el `*` va delante del nombre).
- **`yield*`** delega en otro iterable: entrega todos sus valores, uno a uno.
- El array `#canciones` es **privado** (lo viste en el post de clases), pero se puede recorrer sin exponerlo.

## Generadores asíncronos y `for await`

Aquí los generadores se vuelven realmente útiles en el trabajo. Muchas APIs devuelven los datos **por páginas**: los 30 primeros, luego los 30 siguientes... Con un **generador asíncrono** (`async function*`) puedes esconder toda la paginación y recorrer los resultados como si fueran una sola lista:

```js playground=paginar
async function* todosLosProductos(porPagina = 30) {
  let saltar = 0
  let total = Infinity

  while (saltar < total) {
    const url = `https://dummyjson.com/products?limit=${porPagina}&skip=${saltar}&select=title,price`
    const respuesta = await fetch(url)
    const datos = await respuesta.json()

    total = datos.total
    saltar += porPagina
    console.log(`📦 Página descargada (${saltar} de ${total})`)

    yield* datos.products
  }
}

async function buscarCaro(minimo) {
  for await (const producto of todosLosProductos()) {
    if (producto.price > minimo) {
      console.log(`Encontrado: ${producto.title} (${producto.price})`)
      return producto // al salir, el generador se detiene y no pide más páginas
    }
  }
  console.log('No hay ninguno')
}

buscarCaro(1000)
```

- **`async function*`** combina `async` (puede usar `await`) con generador (puede usar `yield`).
- **`for await...of`** recorre un iterable asíncrono: espera cada valor antes de seguir.
- **Perezoso**: solo pide la siguiente página cuando ha consumido la anterior. Y en cuanto encuentra el producto, el `return` detiene el bucle y **no se descargan más páginas**. Mira en la consola cuántas páginas pidió.

`for await` también sirve para leer **streams** (por ejemplo, el cuerpo de una respuesta grande que llega en trozos, o la respuesta de una IA que se va escribiendo palabra a palabra).

## ¿Cuándo usar generadores?

Siendo honestos: en el día a día de una app web no los escribirás a menudo. Pero brillan en:

- ✅ **Paginación y streams**: recorrer datos que llegan por partes.
- ✅ **Secuencias perezosas o infinitas**: ids, rangos, combinaciones.
- ✅ **Hacer recorribles tus estructuras de datos** (una lista, un árbol).
- ✅ **Entender librerías**: Redux-Saga, algunas herramientas de testing y los propios `async`/`await` (que por dentro se parecen mucho a un generador) usan estas ideas.

Y en las **entrevistas técnicas** de nivel medio aparecen preguntas como "¿qué es un iterable?" o "implementa un `range` con un generador".

## Tu turno

1. Escribe `function* ciclo(array)` que devuelva los elementos del array **una y otra vez** sin fin, y úsalo para alternar colores en una lista.
2. Escribe `function* trozos(array, tamano)` que entregue el array en grupos: `[...trozos([1,2,3,4,5], 2)]` → `[[1,2],[3,4],[5]]`.
3. Haz iterable una clase `Arbol` con hijos anidados, recorriéndolo en profundidad con `yield*` y recursión.
4. Escribe un generador asíncrono que recorra `https://dummyjson.com/users` por páginas de 10 y cuenta cuántos usuarios tienen más de 40 años.

## Errores comunes

- **Esperar que el generador se ejecute al llamarlo.** `saludos()` no ejecuta nada hasta el primer `next()` o `for...of`.
- **`[...generadorInfinito()]`**: cuelga la pestaña. Usa `break`, `take` o un límite.
- **Reutilizar un generador ya recorrido.** Se agota: un segundo `for...of` no hace nada. Llama otra vez a la función para tener uno nuevo.
- **Usar `for...of` con un generador `async`.** Necesita `for await...of` (dentro de una función `async`).
- **`for...of` con un objeto normal.** No es iterable: usa `Object.entries(objeto)` (lo viste en el post de `Object.keys`, `values` y `entries`).

## Para profundizar

- [Iteradores y generadores en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Iterators_and_generators)
- [`for await...of` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/for-await...of)

En resumen: un **iterable** tiene un método **`[Symbol.iterator]`** que devuelve un **iterador** con **`next()`**, y eso es lo que usan **`for...of`**, el *spread* y la desestructuración. Una **función generadora** (`function*`) se **pausa** en cada **`yield`** y se reanuda en el siguiente `next()`: perfecta para secuencias **perezosas e infinitas** y para hacer iterables tus clases. Con **`async function*`** y **`for await`** recorres datos que llegan por partes, como una API paginada.
