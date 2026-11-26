---
title: 'Arrays desde cero: listas que puedes leer, cambiar y recorrer'
description: 'Qué es un array, cómo leer y modificar sus elementos, y los métodos básicos: push, pop, unshift, shift, splice, slice, includes e indexOf.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos, Arrays]
draft: true
---

Si tienes que guardar el nombre de un alumno, usas una variable. ¿Y si son 30 alumnos? No vas a crear 30 variables. Para eso existen los **arrays** (o arreglos): una sola variable que guarda **una lista ordenada** de valores.

## Crear un array

Se escribe entre corchetes `[ ]`, con los elementos separados por comas:

```js playground=crear
const frutas = ['manzana', 'pera', 'mango']
const notas = [15, 18, 12, 20]
const mezcla = ['Ana', 25, true, null] // puede mezclar tipos, aunque no es lo habitual
const vacio = []

console.log(frutas)
console.log(notas.length) // 4: cuántos elementos tiene
```

`length` te dice cuántos elementos hay. Lo vas a usar constantemente.

## Leer elementos: las posiciones empiezan en 0

Cada elemento tiene una **posición** (o índice). La primera es la **0**, no la 1:

```js playground=leer
const frutas = ['manzana', 'pera', 'mango']

console.log(frutas[0]) // 'manzana'
console.log(frutas[1]) // 'pera'
console.log(frutas[2]) // 'mango'
console.log(frutas[3]) // undefined: no existe esa posición

// El último elemento
console.log(frutas[frutas.length - 1]) // 'mango'
console.log(frutas.at(-1))             // 'mango' (forma moderna)
```

Piensa en los asientos de un bus numerados desde el 0: el bus tiene 3 asientos, pero el último es el número 2.

## Cambiar un elemento

```js playground=cambiar
const frutas = ['manzana', 'pera', 'mango']

frutas[1] = 'plátano'
console.log(frutas) // ['manzana', 'plátano', 'mango']
```

Aunque el array se declaró con `const`, **sí puedes cambiar su contenido**. `const` solo impide reemplazar el array entero (`frutas = [...]`), no modificar lo que hay dentro.

## Añadir y quitar elementos

Cuatro métodos para trabajar con los extremos de la lista:

| Método | Qué hace | Dónde |
| --- | --- | --- |
| `push(x)` | Añade | al final |
| `pop()` | Quita y devuelve el último | al final |
| `unshift(x)` | Añade | al principio |
| `shift()` | Quita y devuelve el primero | al principio |

```js playground=extremos
const cola = ['Ana', 'Luis']

cola.push('Marta')       // llega alguien nuevo al final
console.log(cola)        // ['Ana', 'Luis', 'Marta']

const atendido = cola.shift() // atendemos al primero
console.log(atendido)    // 'Ana'
console.log(cola)        // ['Luis', 'Marta']

cola.unshift('Pedro')    // alguien con prioridad, al principio
console.log(cola)        // ['Pedro', 'Luis', 'Marta']

const ultimo = cola.pop()
console.log(ultimo)      // 'Marta'
console.log(cola)        // ['Pedro', 'Luis']
```

## `splice`: quitar o insertar en medio

Para tocar una posición concreta usa `splice(posición, cuántosBorrar, ...loQueInsertar)`:

```js playground=splice
const tareas = ['Estudiar', 'Cocinar', 'Comprar', 'Dormir']

// Borrar 1 elemento en la posición 1
tareas.splice(1, 1)
console.log(tareas) // ['Estudiar', 'Comprar', 'Dormir']

// Insertar en la posición 1 sin borrar nada (0)
tareas.splice(1, 0, 'Hacer ejercicio')
console.log(tareas) // ['Estudiar', 'Hacer ejercicio', 'Comprar', 'Dormir']
```

## `slice`: copiar un trozo sin tocar el original

No confundas `splice` con `slice`. **`slice(desde, hasta)`** devuelve una **copia** de un trozo y deja el original como estaba:

```js playground=slice
const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun']

const primerTrimestre = meses.slice(0, 3) // desde 0 hasta 3 (sin incluir el 3)
console.log(primerTrimestre) // ['ene', 'feb', 'mar']
console.log(meses)           // intacto

const ultimosDos = meses.slice(-2)
console.log(ultimosDos)      // ['may', 'jun']
```

Truco para recordarlo: **s*p*lice** tiene una *p* de más porque **p**ica (corta) el array original.

## Buscar: `includes` e `indexOf`

```js playground=buscar
const inscritos = ['ana', 'luis', 'marta']

console.log(inscritos.includes('luis'))   // true
console.log(inscritos.includes('pedro'))  // false

console.log(inscritos.indexOf('marta'))   // 2: la posición
console.log(inscritos.indexOf('pedro'))   // -1: no está
```

- **`includes`** responde "¿está o no?" con `true` / `false`.
- **`indexOf`** te da la **posición**, o `-1` si no lo encuentra. Útil para luego borrarlo con `splice`.

## Recorrer un array

Para pasar por cada elemento, lo más claro es `for...of`:

```js playground=recorrer
const notas = [15, 18, 12, 20]
let suma = 0

for (const nota of notas) {
  suma += nota
}

console.log(`Promedio: ${suma / notas.length}`)
```

Cuando ya te sientas cómodo, aprende `map`, `filter` y `reduce`: hacen este tipo de tareas en una línea (tienen su propio post).

## Errores comunes

- **Empezar a contar en 1.** La primera posición es `[0]` y la última es `[length - 1]`.
- **Confundir `splice` y `slice`.** `splice` modifica el original; `slice` hace una copia.
- **Esperar que `push` devuelva el array.** Devuelve la nueva **longitud**. `const lista = frutas.push('kiwi')` guarda un número, no el array.
- **Comparar arrays con `===`.** `[1, 2] === [1, 2]` es `false`: son dos arrays distintos aunque tengan lo mismo.

## Para profundizar

- [Arrays en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array)

En resumen: un **array** es una lista ordenada que empieza en la posición **0**. Usa **`push` / `pop`** y **`unshift` / `shift`** para los extremos, **`splice`** para cambiar el medio, **`slice`** para copiar un trozo e **`includes` / `indexOf`** para buscar.
