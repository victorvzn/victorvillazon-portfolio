---
title: 'Tipos de datos en JavaScript: números, textos, booleanos y los dos "vacíos"'
description: 'Antes de programar nada necesitas saber con qué trabajas. Los tipos de datos de JavaScript, typeof y por qué == te puede engañar.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos]
draft: true
---

Todo lo que maneja un programa es un **dato**: el precio de un producto, el nombre de un usuario, si está conectado o no. Y cada dato tiene un **tipo**, que decide qué puedes hacer con él. No es lo mismo sumar `2 + 2` que sumar `'2' + '2'`.

Este es el primer paso antes de condicionales, bucles o funciones.

## Los tipos que vas a usar a diario

| Tipo | Para qué | Ejemplos |
| --- | --- | --- |
| `number` | Números, con o sin decimales | `42`, `3.14`, `-7` |
| `string` | Texto, siempre entre comillas | `'Hola'`, `"Ana"`, `` `Lima` `` |
| `boolean` | Sí o no | `true`, `false` |
| `undefined` | "Todavía no tiene valor" | una variable que declaraste sin asignar |
| `null` | "Vacío a propósito" | un usuario que aún no eligió foto |

Luego están los tipos **no primitivos**, que agrupan varios datos: los **arrays** (listas) y los **objetos** (fichas con propiedades). Los veremos en sus propios posts.

## `typeof`: pregúntale a un dato qué es

`typeof` te dice el tipo de cualquier valor. Úsalo cuando no estés seguro de qué tienes entre manos:

```js playground=typeof
console.log(typeof 42)          // 'number'
console.log(typeof 3.5)         // 'number' (no hay un tipo aparte para decimales)
console.log(typeof 'Hola')      // 'string'
console.log(typeof '42')        // 'string' ¡ojo! las comillas lo convierten en texto
console.log(typeof true)        // 'boolean'

let sinValor
console.log(typeof sinValor)    // 'undefined'

console.log(typeof null)        // 'object' 😅
console.log(typeof [1, 2, 3])   // 'object'
console.log(typeof { a: 1 })    // 'object'
```

Dos rarezas que conviene conocer desde ya:

- **`typeof null` devuelve `'object'`.** Es un error histórico de JavaScript que nunca se arregló para no romper webs antiguas. Para saber si algo es `null`, compara directamente: `valor === null`.
- **Los arrays también dicen `'object'`.** Para saber si algo es un array usa `Array.isArray(valor)`.

## `undefined` y `null`: los dos "vacíos"

Parecen lo mismo, pero cuentan historias distintas:

```js playground=vacios
let telefono            // undefined: nadie le ha dado valor todavía
let fotoDePerfil = null // null: lo dejamos vacío a propósito

console.log(telefono)      // undefined
console.log(fotoDePerfil)  // null

const usuario = { nombre: 'Ana' }
console.log(usuario.edad)  // undefined: esa propiedad no existe
```

Regla práctica: **`undefined` lo pone JavaScript** cuando falta algo; **`null` lo pones tú** cuando quieres decir "aquí no hay nada, y es intencional".

## El problema de los números que son texto

Esto le pasa a todo el mundo con los formularios: lo que escribe el usuario en un `<input>` **siempre llega como texto**, aunque sean números.

```js playground=texto-numero
const cantidad = '2'  // así llega de un input
const precio = 10

console.log(cantidad + precio)          // '210' 😱 junta textos
console.log(cantidad * precio)          // 20   aquí sí convierte
console.log(Number(cantidad) + precio)  // 12   ✅ lo correcto

console.log(Number('hola'))  // NaN: "Not a Number", no se pudo convertir
```

El `+` con un texto **concatena** (une) en vez de sumar. Por eso, cuando leas números de un formulario, conviértelos primero con `Number()`.

`NaN` es un valor especial que significa "esto debía ser un número, pero no lo es". Si ves `NaN` en pantalla, casi seguro intentaste convertir algo que no era un número.

## `==` contra `===`: usa siempre los tres iguales

JavaScript tiene dos formas de comparar:

- **`==` (igualdad débil)** convierte los tipos antes de comparar.
- **`===` (igualdad estricta)** compara valor **y** tipo.

```js playground=igualdad
console.log(5 == '5')    // true  😬 convierte el texto en número
console.log(5 === '5')   // false ✅ uno es number y el otro string

console.log(0 == false)  // true  😬
console.log(0 === false) // false ✅

console.log(null == undefined)  // true
console.log(null === undefined) // false
```

`==` da resultados sorprendentes que generan bugs difíciles de encontrar. **Usa siempre `===`** (y `!==` para "distinto de"). Es lo que verás en cualquier proyecto profesional.

## Errores comunes

- **Sumar textos sin querer.** Si el resultado parece "pegado" (`'210'`), uno de los datos era texto. Conviértelo con `Number()`.
- **Usar `typeof` para detectar arrays o `null`.** Usa `Array.isArray()` y `=== null`.
- **Comparar con `==`.** Siempre `===`.
- **Olvidar las comillas en un texto.** `const nombre = Ana` busca una variable llamada `Ana`, no el texto. Saldrá el error `ReferenceError: Ana is not defined`.

## Para profundizar

- [Tipos de datos en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Data_structures)
- [El operador `typeof` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/typeof)

En resumen: los datos básicos son **`number`**, **`string`**, **`boolean`**, **`undefined`** y **`null`**. Pregunta con **`typeof`**, convierte los textos con **`Number()`** antes de sumar y compara siempre con **`===`**.
