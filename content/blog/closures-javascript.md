---
title: 'Closures explicados con una mochila'
description: 'Un closure es una función que recuerda las variables del lugar donde nació. Lo vas a usar a diario y te lo van a preguntar en entrevistas.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Funciones, Fundamentos]
draft: true
---

"¿Qué es un closure?" es una de las preguntas más típicas en entrevistas para junior. La definición oficial suena complicada, pero la idea es sencilla:

> Una función **recuerda las variables** que había a su alrededor cuando fue creada, aunque se ejecute mucho después y en otro sitio.

Piensa que cada función lleva una **mochila**. Cuando nace, mete dentro las variables que tiene cerca. Vaya donde vaya, la mochila va con ella.

## El ejemplo más pequeño

```js playground=saludo
function crearSaludo(nombre) {
  // `nombre` vive aquí dentro...
  return function () {
    console.log(`Hola, ${nombre}`)
  }
}

const saludarAna = crearSaludo('Ana')
const saludarLuis = crearSaludo('Luis')

// ...y crearSaludo ya terminó, pero las funciones lo recuerdan
saludarAna()  // Hola, Ana
saludarLuis() // Hola, Luis
```

`crearSaludo` terminó de ejecutarse, así que en teoría `nombre` debería desaparecer. Pero la función que devolvió se lo llevó en su mochila. Cada llamada a `crearSaludo` crea **una mochila nueva**: por eso Ana y Luis no se mezclan.

## Para qué sirve: variables privadas

El uso más útil es guardar un dato que **nadie de fuera puede tocar** directamente. Un contador:

```js playground=contador
function crearContador() {
  let cuenta = 0 // nadie fuera puede cambiarla a mano

  return {
    sumar: () => ++cuenta,
    restar: () => --cuenta,
    valor: () => cuenta
  }
}

const clics = crearContador()
clics.sumar()
clics.sumar()
clics.restar()

console.log(clics.valor()) // 1
console.log(clics.cuenta)  // undefined: no existe desde fuera
```

La única forma de cambiar `cuenta` es usar `sumar` y `restar`. Así nadie la pone en `-500` por accidente.

## Funciones que fabrican funciones

Otro uso diario: crear funciones configuradas de antemano.

```js playground=fabrica
const crearMultiplicador = (factor) => (numero) => numero * factor

const doble = crearMultiplicador(2)
const triple = crearMultiplicador(3)

console.log(doble(5))  // 10
console.log(triple(5)) // 15
console.log([1, 2, 3].map(doble)) // [2, 4, 6]
```

Cada función recuerda su propio `factor`. Si ya usaste `addEventListener` con una función que usa variables de fuera, **ya estabas usando closures** sin saberlo.

## La pregunta trampa de las entrevistas

Esta te la pueden poner tal cual. ¿Qué muestra?

```js playground=trampa
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(`var: ${i}`), 100)
}

for (let j = 1; j <= 3; j++) {
  setTimeout(() => console.log(`let: ${j}`), 100)
}
```

Piénsalo antes de ejecutarlo.

<!-- solucion: Ver la respuesta -->

Muestra `var: 4` tres veces y luego `let: 1`, `let: 2`, `let: 3`.

- Con **`var`** solo existe **una** variable `i` para todo el bucle. Las tres funciones guardan en su mochila la misma `i`, y cuando se ejecutan (100 ms después) el bucle ya terminó y `i` vale `4`.
- Con **`let`** cada vuelta del bucle crea **una `j` nueva**. Cada función guarda la suya: 1, 2 y 3.

Es uno de los motivos por los que ya no usamos `var` (lo vimos en el post de let, const y var).

<!-- /solucion -->

## Errores comunes

- **Creer que la mochila guarda una copia.** Guarda la **variable**, no su valor de ese momento. Si la variable cambia, la función ve el valor nuevo (justo lo que pasa con `var` arriba).
- **Pensar que es algo raro.** Todas las funciones de JavaScript son closures. Lo especial es cuando la función se usa fuera de donde nació.

## Para profundizar

- [Closures en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Closures)

En resumen: un **closure** es una función con su **mochila** de variables. Sirve para datos privados y para fabricar funciones, y es la clave de la famosa pregunta del `for` con `var`.
