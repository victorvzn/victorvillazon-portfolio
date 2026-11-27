---
title: 'Prueba técnica: programa tu propio map, filter y reduce'
description: 'Una pregunta muy común para comprobar si entiendes los métodos de array por dentro: implementar map, filter y reduce desde cero, sin usar los originales.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Arrays, Funciones]
draft: true
---

Usar `map`, `filter` y `reduce` es una cosa. Saber **cómo funcionan por dentro** es otra, y es justo lo que algunos entrevistadores quieren comprobar: "Muy bien, ahora escríbeme tú un `map` sin usar el `map` de JavaScript".

Es un ejercicio buenísimo para entender de verdad las **funciones que reciben funciones** (lo que se llama *funciones de orden superior*).

Tiempo recomendado: **30 minutos** para los tres.

## El enunciado

> Escribe tres funciones que se comporten como los métodos originales, **sin usar** `map`, `filter`, `reduce` ni `forEach`:
>
> 1. **`miMap(array, fn)`**: devuelve un array **nuevo** con el resultado de llamar a `fn(elemento, indice, array)` para cada elemento.
> 2. **`miFilter(array, fn)`**: devuelve un array **nuevo** con los elementos para los que `fn(elemento, indice, array)` devuelve un valor truthy.
> 3. **`miReduce(array, fn, valorInicial)`**: recorre el array acumulando un valor con `fn(acumulador, elemento, indice, array)` y devuelve el resultado. Si no se pasa `valorInicial`, se usa el **primer elemento** como valor inicial y se empieza desde el segundo.
>
> Ninguna debe modificar el array original.

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function miMap(array, fn) {
  // tu código aquí
}

function miFilter(array, fn) {
  // tu código aquí
}

function miReduce(array, fn, valorInicial) {
  // tu código aquí
}

const numeros = [1, 2, 3, 4]

probar('map: doble', miMap(numeros, (n) => n * 2), [2, 4, 6, 8])
probar('map: recibe el índice', miMap(['a', 'b'], (letra, i) => `${i}:${letra}`), ['0:a', '1:b'])
probar('filter: pares', miFilter(numeros, (n) => n % 2 === 0), [2, 4])
probar('filter: ninguno', miFilter(numeros, (n) => n > 10), [])
probar('reduce: suma con inicial', miReduce(numeros, (acc, n) => acc + n, 0), 10)
probar('reduce: suma sin inicial', miReduce(numeros, (acc, n) => acc + n), 10)
probar('reduce: a objeto', miReduce(['a', 'b', 'a'], (acc, l) => ({ ...acc, [l]: (acc[l] ?? 0) + 1 }), {}), { a: 2, b: 1 })
probar('no modifica el original', numeros, [1, 2, 3, 4])
```

<!-- solucion: Ver una pista -->

Los tres siguen la misma estructura: un **bucle `for`** clásico que recorre el array con un índice, y una variable donde vas guardando el resultado (un array nuevo en `map` y `filter`, el acumulador en `reduce`).

La "magia" es que **no sabes qué hace `fn`**: solo la llamas con los argumentos correctos y usas lo que devuelve.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
function miMap(array, fn) {
  const resultado = []
  for (let i = 0; i < array.length; i++) {
    resultado.push(fn(array[i], i, array))
  }
  return resultado
}

function miFilter(array, fn) {
  const resultado = []
  for (let i = 0; i < array.length; i++) {
    if (fn(array[i], i, array)) {
      resultado.push(array[i])
    }
  }
  return resultado
}

function miReduce(array, fn, ...resto) {
  const hayInicial = resto.length > 0
  if (!hayInicial && array.length === 0) {
    throw new TypeError('miReduce de un array vacío sin valor inicial')
  }

  let acumulador = hayInicial ? resto[0] : array[0]
  const inicio = hayInicial ? 0 : 1

  for (let i = inicio; i < array.length; i++) {
    acumulador = fn(acumulador, array[i], i, array)
  }
  return acumulador
}

const numeros = [1, 2, 3, 4]

probar('map: doble', miMap(numeros, (n) => n * 2), [2, 4, 6, 8])
probar('map: recibe el índice', miMap(['a', 'b'], (letra, i) => `${i}:${letra}`), ['0:a', '1:b'])
probar('filter: pares', miFilter(numeros, (n) => n % 2 === 0), [2, 4])
probar('filter: ninguno', miFilter(numeros, (n) => n > 10), [])
probar('reduce: suma con inicial', miReduce(numeros, (acc, n) => acc + n, 0), 10)
probar('reduce: suma sin inicial', miReduce(numeros, (acc, n) => acc + n), 10)
probar('reduce: a objeto', miReduce(['a', 'b', 'a'], (acc, l) => ({ ...acc, [l]: (acc[l] ?? 0) + 1 }), {}), { a: 2, b: 1 })
probar('no modifica el original', numeros, [1, 2, 3, 4])
```

Lo que más se valora:

**`map` y `filter` crean un array nuevo** y nunca tocan el original. Por eso el `push` va al array `resultado`, no a `array`.

**`filter` guarda el elemento original**, no lo que devuelve `fn`. `fn` solo **decide** si entra o no.

**El caso difícil de `reduce`: saber si te pasaron valor inicial.** Fíjate en el truco `...resto`: no podemos comprobar `valorInicial === undefined`, porque alguien podría pasar `undefined` **a propósito** como valor inicial. Con el parámetro rest, contamos **cuántos argumentos** llegaron de verdad.

**El error del array vacío.** El `reduce` original lanza un `TypeError` si el array está vacío y no hay valor inicial (no hay nada con qué empezar). Copiamos ese comportamiento. Mencionarlo en la entrevista suma muchos puntos.

**Pasar los tres argumentos** (`elemento, indice, array`). Muchas soluciones olvidan el índice, y `map((x, i) => ...)` dejaría de funcionar.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que entiendas que `fn` es una función** que tú llamas, y que puedes pasarle lo que necesite.
- **La inmutabilidad**: no modificar el original.
- **El detalle del valor inicial** en `reduce`. Es la parte que separa una solución buena de una regular.
- **Que puedas explicar** qué hace cada uno en una frase: `map` transforma, `filter` selecciona, `reduce` acumula.

## Preguntas de seguimiento

1. ¿Podrías escribir `miMap` y `miFilter` **usando tu `miReduce`**?
2. ¿Cómo los añadirías como métodos de todos los arrays, para poder escribir `numeros.miMap(...)`? ¿Es buena idea?

<!-- solucion: Ver las respuestas -->

```js playground=seguimiento
function miReduce(array, fn, ...resto) {
  const hayInicial = resto.length > 0
  if (!hayInicial && array.length === 0) throw new TypeError('Array vacío sin valor inicial')
  let acumulador = hayInicial ? resto[0] : array[0]
  for (let i = hayInicial ? 0 : 1; i < array.length; i++) acumulador = fn(acumulador, array[i], i, array)
  return acumulador
}

// 1. map y filter son casos particulares de reduce: el acumulador es un array
const miMap = (array, fn) => miReduce(array, (acc, el, i, arr) => [...acc, fn(el, i, arr)], [])
const miFilter = (array, fn) => miReduce(array, (acc, el, i, arr) => (fn(el, i, arr) ? [...acc, el] : acc), [])

console.log(miMap([1, 2, 3], (n) => n * 10))      // [10, 20, 30]
console.log(miFilter([1, 2, 3, 4], (n) => n > 2)) // [3, 4]
```

1. Sí: `reduce` es el más general de los tres. `map` es un `reduce` que va añadiendo `fn(elemento)` a un array, y `filter` uno que añade el elemento solo si cumple. (Crear un array nuevo con spread en cada paso es menos eficiente; para una entrevista basta con explicarlo).
2. Con `Array.prototype.miMap = function (fn) { ... }`, usando `this` como el array. Funciona, pero **modificar los prototipos de los objetos nativos no es buena idea** en código real: puedes chocar con otras librerías o con métodos futuros del lenguaje. Saber que se puede **y** por qué no se debe es la respuesta que buscan.

<!-- /solucion -->
