---
title: 'Arrow functions explicadas sin complicarte'
description: 'Qué son las funciones flecha, cómo se escriben, cuándo llevan return y cuándo no. Paso a paso.'
date: 2026-11-27
series: javascript
tags: [JavaScript, ES6, Funciones]
draft: false
order: 22
---

Las **arrow functions** (funciones flecha) son una forma más corta de escribir funciones. Las vas a ver en todas partes: en `map`, en `filter`, en React… Así que vale la pena entenderlas bien.

## De función normal a función flecha

Esta es una función de toda la vida:

```js
function duplicar(numero) {
  return numero * 2
}
```

Vamos a convertirla paso a paso:

```js playground=pasos
// 1. Quitamos "function", la guardamos en una const y ponemos una flecha =>
const duplicar1 = (numero) => {
  return numero * 2
}

// 2. Si solo hace un return, quitamos las llaves Y la palabra return
const duplicar2 = (numero) => numero * 2

// 3. Si tiene un solo parámetro, los paréntesis son opcionales
const duplicar3 = numero => numero * 2

console.log(duplicar1(5), duplicar2(5), duplicar3(5)) // 10 10 10
```

Las tres hacen exactamente lo mismo.

## La regla de oro: llaves y `return`

Esto es lo que más errores causa, así que memorízalo:

- **Sin llaves** → el return es **automático** (*return implícito*).
- **Con llaves** → tienes que escribir **`return`**.

```js playground=return
const sumarBien = (a, b) => a + b
const sumarConLlaves = (a, b) => { return a + b }
const sumarMal = (a, b) => { a + b } // olvidamos el return

console.log(sumarBien(2, 3))      // 5
console.log(sumarConLlaves(2, 3)) // 5
console.log(sumarMal(2, 3))       // undefined 😬
```

¿Cuándo usar llaves? Cuando la función necesita **más de una línea**.

## Parámetros: cuántos paréntesis

```js playground=parametros
const saludar = () => 'Hola'              // sin parámetros: paréntesis vacíos
const gritar = texto => texto + '!'       // uno: paréntesis opcionales
const sumar = (a, b) => a + b             // dos o más: paréntesis obligatorios

console.log(saludar(), gritar('Hola'), sumar(2, 3))
```

## El caso raro: devolver un objeto

Si quieres devolver un objeto sin llaves de función, JavaScript confunde las llaves del objeto con las de la función. La solución es envolverlo en **paréntesis**:

```js playground=objeto
const crearUsuario = (nombre) => ({ nombre, activo: true })

console.log(crearUsuario('Ana')) // { nombre: 'Ana', activo: true }
```

## Donde más las vas a usar

Como funciones que se pasan a otras funciones (*callbacks*):

```js playground=callbacks
const precios = [120, 45, 650, 90]

const conIgv = precios.map(precio => Math.round(precio * 1.18))
const baratos = precios.filter(precio => precio < 100)

console.log(conIgv)  // [142, 53, 767, 106]
console.log(baratos) // [45, 90]
```

Si quieres profundizar en `map` y `filter`, tengo un post entero sobre eso.

## ¿Son iguales a las funciones normales?

Casi. La gran diferencia es que una arrow function **no tiene su propio `this`**: usa el `this` del lugar donde se escribió. Si estás empezando no te preocupes mucho por eso. Por ahora, una regla práctica: para los **métodos de un objeto** usa la sintaxis normal.

## Errores comunes

- **Llaves sin `return`.** El error número uno. Si ves un `undefined` inesperado, revisa esto primero.
- **Devolver un objeto sin paréntesis.** `() => { nombre: 'Ana' }` devuelve `undefined`.
- **Usarla antes de declararla.** Una `const` con arrow function no existe hasta la línea donde se declara. Las funciones con `function` sí se pueden usar antes.

## Para profundizar

- [Funciones flecha en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

En resumen: **`(parámetros) => resultado`**, sin llaves el `return` es automático, con llaves lo escribes tú, y para devolver un objeto lo envuelves en **paréntesis**.
