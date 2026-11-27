---
title: 'Prueba técnica: implementa curry en JavaScript'
description: 'Qué es el currying, para qué sirve en la vida real (funciones configurables y reutilizables) y cómo implementar tu propia función curry con closures, length y recursión. Una pregunta clásica de entrevistas, con solución oculta.'
date: 2026-11-27
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Closures, Funciones]
draft: true
---

En una entrevista te preguntan: "¿qué es el *currying*?". Y luego: "impleméntalo". Es una de esas preguntas que parecen de teoría pura pero que, en realidad, comprueban si entiendes de verdad los **closures** y las **funciones de orden superior** (los dos tienen su propio post).

**Currying** es transformar una función que recibe varios argumentos en una cadena de funciones que reciben **uno cada vez**:

```js
const sumar = (a, b, c) => a + b + c
sumar(1, 2, 3)        // 6

const sumarCurry = curry(sumar)
sumarCurry(1)(2)(3)   // 6
```

¿Para qué sirve? Para crear **funciones especializadas** a partir de una general, fijando algunos argumentos:

```js
const descuento = curry((porcentaje, precio) => precio - precio * porcentaje / 100)

const descuentoEstudiante = descuento(20)   // fija el porcentaje
const descuentoBlackFriday = descuento(50)

console.log(descuentoEstudiante(100))   // 80
console.log([100, 200].map(descuentoBlackFriday))   // [50, 100]
```

Tiempo recomendado: **35 minutos**.

## El enunciado

> Escribe una función `curry(fn)` que reciba una función con un número fijo de parámetros y devuelva su versión currificada. La versión currificada debe aceptar los argumentos **de uno en uno o de varios en varios**, y ejecutar `fn` cuando tenga **todos**.

```js
const sumar3 = curry((a, b, c) => a + b + c)

sumar3(1)(2)(3)   // 6
sumar3(1, 2)(3)   // 6
sumar3(1)(2, 3)   // 6
sumar3(1, 2, 3)   // 6
```

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function curry(fn) {
  // tu código aquí
}

const sumar3 = curry((a, b, c) => a + b + c)

probar('de uno en uno', sumar3(1)(2)(3), 6)
probar('dos y uno', sumar3(1, 2)(3), 6)
probar('uno y dos', sumar3(1)(2, 3), 6)
probar('todos a la vez', sumar3(1, 2, 3), 6)

const parcial = sumar3(10)
probar('reutilizable (1)', parcial(1)(1), 12)
probar('reutilizable (2)', parcial(5, 5), 20)

const saludar = curry((saludo, nombre) => `${saludo}, ${nombre}`)
probar('textos', saludar('Hola')('Ana'), 'Hola, Ana')
probar('con map', ['Ana', 'Luis'].map(saludar('Buenas')), ['Buenas, Ana', 'Buenas, Luis'])
```

El caso "reutilizable" es importante: `parcial` se usa **dos veces**. Si tu solución guarda los argumentos en una variable compartida, la segunda llamada se mezclará con la primera.

<!-- solucion: Ver una pista -->

Dos ideas:

1. **`fn.length`** te dice cuántos parámetros declara una función: `((a, b, c) => {}).length` es `3`. Así sabes cuándo tienes "todos".
2. La función que devuelves recibe unos argumentos. Si con ellos ya hay suficientes, llama a `fn`. Si no, **devuelve otra función** que, cuando reciba más, los junte con los anteriores y vuelva a comprobar. Esa "otra función" es... la misma idea otra vez: recursión.

Para que `parcial` sea reutilizable, no modifiques los argumentos guardados: crea un array **nuevo** en cada llamada (`[...anteriores, ...nuevos]`).

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
function curry(fn) {
  return function currificada(...argumentos) {
    if (argumentos.length >= fn.length) {
      return fn(...argumentos)
    }
    return (...siguientes) => currificada(...argumentos, ...siguientes)
  }
}

const sumar3 = curry((a, b, c) => a + b + c)

probar('de uno en uno', sumar3(1)(2)(3), 6)
probar('dos y uno', sumar3(1, 2)(3), 6)
probar('uno y dos', sumar3(1)(2, 3), 6)
probar('todos a la vez', sumar3(1, 2, 3), 6)

const parcial = sumar3(10)
probar('reutilizable (1)', parcial(1)(1), 12)
probar('reutilizable (2)', parcial(5, 5), 20)

const saludar = curry((saludo, nombre) => `${saludo}, ${nombre}`)
probar('textos', saludar('Hola')('Ana'), 'Hola, Ana')
probar('con map', ['Ana', 'Luis'].map(saludar('Buenas')), ['Buenas, Ana', 'Buenas, Luis'])
```

Seis líneas. Sigamos `sumar3(1)(2, 3)`:

1. `sumar3(1)`: `argumentos` es `[1]`. Como `1 < 3`, devuelve una función nueva que **recuerda** `[1]` (un closure).
2. Esa función recibe `(2, 3)` y llama a `currificada(1, 2, 3)`.
3. Ahora `argumentos` es `[1, 2, 3]`. Como `3 >= 3`, ejecuta `fn(1, 2, 3)` → `6`.

Claves:

- **El closure** guarda los argumentos acumulados en cada paso, sin variables globales.
- **`...argumentos, ...siguientes`** crea un array **nuevo** cada vez: por eso `parcial` se puede reutilizar sin que una llamada afecte a la otra.
- **Recursión**: la función devuelta vuelve a llamar a `currificada`, que vuelve a decidir si ya hay suficientes.
- **`>=`** y no `===`: si te pasan argumentos de más, se ejecuta igualmente (como haría la función original).

### El caso de `map`

¿Por qué `['Ana', 'Luis'].map(saludar('Buenas'))` funciona? `map` llama a la función con **tres** argumentos: el elemento, el índice y el array. `saludar('Buenas')` recibe `('Ana', 0, [...])`, así que tiene `['Buenas', 'Ana', 0, [...]]`: cuatro, más que suficientes. Se ejecuta `fn` con todos, y como `fn` solo usa los dos primeros, el resultado es correcto. Gracias al `>=`.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que expliques qué es el currying y para qué sirve**, con un ejemplo real (funciones especializadas, componer con `map`).
- **Closures**: que entiendas cómo se recuerdan los argumentos entre llamadas.
- **Recursión** y el uso de **`fn.length`**.
- **Inmutabilidad**: que las funciones parciales sean reutilizables.
- **Saber sus límites**: ver la pregunta de seguimiento.

## Pregunta de seguimiento

¿Qué pasa si usas tu `curry` con una función que tiene **parámetros con valor por defecto** o **parámetros rest**, como `(a, b = 2) => a + b` o `(...numeros) => ...`? ¿Cómo lo resolverías?

<!-- solucion: Ver la respuesta -->

`fn.length` **no cuenta** los parámetros con valor por defecto ni el rest:

```js playground=seguimiento
console.log(((a, b, c) => {}).length)    // 3
console.log(((a, b = 2) => {}).length)   // 1: se para en el primero con valor por defecto
console.log(((...numeros) => {}).length) // 0
```

Así que `curry((a, b = 2) => a + b)(5)` se ejecutaría al momento con `b = 2`, y `curry((...n) => ...)` nunca esperaría argumentos.

La solución habitual es permitir indicar **cuántos argumentos esperar**:

```js playground=seguimiento
function curry(fn, aridad = fn.length) {
  return function currificada(...argumentos) {
    if (argumentos.length >= aridad) return fn(...argumentos)
    return (...siguientes) => currificada(...argumentos, ...siguientes)
  }
}

const sumarTodos = curry((...numeros) => numeros.reduce((a, b) => a + b, 0), 3)
probar('rest con aridad', sumarTodos(1)(2)(3), 6)
```

Al número de argumentos de una función se le llama **aridad**. Las librerías de programación funcional, como Ramda o Lodash, aceptan esta misma opción.

<!-- /solucion -->
