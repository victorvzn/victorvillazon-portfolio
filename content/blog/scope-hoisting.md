---
title: 'Scope y hoisting en JavaScript: dónde vive cada variable'
description: 'Qué es el scope global, de función y de bloque, por qué una variable "no está definida" y qué es el hoisting con var, let, const y las funciones.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos]
draft: true
---

`ReferenceError: total is not defined`. Declaraste `total`, lo ves ahí mismo en tu código... pero JavaScript dice que no existe. Casi siempre, el problema es el **scope**: la variable existe, pero **no desde donde la estás usando**.

## ¿Qué es el scope?

El **scope** (alcance o ámbito) es **la zona del código donde una variable existe** y se puede usar. Piensa en las habitaciones de una casa: lo que dejas en tu habitación no se ve desde la cocina, pero lo que está en el salón (el espacio común) se ve desde todas partes.

Hay tres tipos:

## 1. Scope global

Una variable declarada **fuera de cualquier función o bloque** es global: se puede usar desde cualquier parte.

```js playground=global
const tienda = 'Mi Tienda'

function saludar() {
  console.log(`Bienvenido a ${tienda}`) // ✅ la ve
}

saludar()
```

Útil para constantes que usa todo el programa, pero **úsalo poco**: si todo es global, cualquier parte del código puede cambiar cualquier cosa, y los bugs son muy difíciles de encontrar.

## 2. Scope de función

Lo que declaras **dentro de una función** solo existe dentro de ella:

```js playground=funcion
function calcularTotal() {
  const iva = 0.18
  const total = 100 * (1 + iva)
  console.log(total) // ✅ 118
}

calcularTotal()
console.log(iva) // ❌ ReferenceError: iva is not defined
```

Es algo bueno: cada función tiene sus propias variables y no choca con las de otras. Dos funciones pueden tener una variable `total` cada una sin problema.

## 3. Scope de bloque

Un **bloque** es cualquier trozo de código entre llaves `{ }`: un `if`, un `for`, un `while`. Las variables declaradas con **`let` y `const`** dentro de un bloque solo existen dentro de él:

```js playground=bloque
const edad = 20

if (edad >= 18) {
  const mensaje = 'Eres mayor de edad'
  console.log(mensaje) // ✅
}

console.log(mensaje) // ❌ ReferenceError
```

La solución, si la necesitas fuera, es declararla **antes** del bloque:

```js playground=bloque-bien
const edad = 20
let mensaje

if (edad >= 18) {
  mensaje = 'Eres mayor de edad'
} else {
  mensaje = 'Eres menor de edad'
}

console.log(mensaje) // ✅
```

## Los scopes se anidan: de dentro hacia fuera

Cuando usas una variable, JavaScript la busca **primero en el scope actual**, luego en el de fuera, luego en el de más fuera... hasta llegar al global. A esto se le llama **cadena de scopes**. Desde dentro se ve hacia fuera, pero **nunca al revés**:

```js playground=cadena
const pais = 'Perú'          // global

function exterior() {
  const ciudad = 'Lima'      // scope de exterior

  function interior() {
    const barrio = 'Miraflores' // scope de interior
    console.log(barrio, ciudad, pais) // ✅ ve las tres
  }

  interior()
  console.log(barrio) // ❌ desde fuera no se ve lo de dentro
}

exterior()
```

## Sombreado: la misma variable en dos sitios

Si declaras una variable con el mismo nombre dentro de un scope interior, **tapa** a la de fuera mientras estés dentro:

```js playground=sombra
const color = 'azul'

function pintar() {
  const color = 'rojo' // otra variable distinta, solo vive aquí
  console.log(color)   // 'rojo'
}

pintar()
console.log(color) // 'azul': la de fuera no cambió
```

Funciona, pero confunde. Mejor usa nombres distintos.

## `var` no respeta los bloques

Esta es una de las razones por las que ya no se usa `var` (lo vimos en el post de `let`, `const` y `var`). `var` solo entiende el scope de **función**, no el de bloque:

```js playground=var
if (true) {
  var conVar = 'me escapo del bloque'
  let conLet = 'yo me quedo dentro'
}

console.log(conVar) // 'me escapo del bloque' 😬
console.log(conLet) // ❌ ReferenceError
```

Con `var`, una variable de un `if` o de un `for` "se escapa" y puede pisar otra con el mismo nombre. Usa siempre `let` o `const`.

## Hoisting: lo que JavaScript "sube"

Antes de ejecutar tu código, JavaScript lo **lee entero** y apunta todas las declaraciones de su scope. A ese efecto de "subir" las declaraciones al principio se le llama **hoisting** (elevación). Cada tipo de declaración se comporta distinto:

### Las declaraciones de función se pueden usar antes

```js playground=hoisting-funcion
saludar('Ana') // ✅ funciona, aunque la función está abajo

function saludar(nombre) {
  console.log(`Hola, ${nombre}`)
}
```

Las funciones declaradas con `function nombre() {}` se elevan **completas**. Por eso puedes organizar tu archivo con el código principal arriba y las funciones auxiliares abajo.

### `var` se eleva, pero vacía

```js playground=hoisting-var
console.log(precio) // undefined (no da error, pero tampoco el valor)
var precio = 100
console.log(precio) // 100
```

JavaScript sube la declaración (`var precio`), pero **no el valor**. Por eso da `undefined`: un bug silencioso.

### `let` y `const`: la zona muerta

```js playground=hoisting-let
console.log(total) // ❌ ReferenceError: Cannot access 'total' before initialization
const total = 100
```

`let` y `const` también se elevan, pero **no se pueden usar hasta la línea donde se declaran**. El tramo entre el principio del bloque y la declaración se llama **zona muerta temporal** (*temporal dead zone*). El error es bueno: te avisa en vez de darte un `undefined` silencioso.

### Las arrow functions siguen las reglas de su variable

```js playground=hoisting-arrow
despedir('Ana') // ❌ ReferenceError

const despedir = (nombre) => {
  console.log(`Adiós, ${nombre}`)
}
```

Una arrow function guardada en una `const` es una variable más: no se puede usar antes de su línea.

| Declaración | ¿Se puede usar antes de su línea? |
| --- | --- |
| `function nombre() {}` | ✅ Sí, completa |
| `var x = 1` | ⚠️ Sí, pero vale `undefined` |
| `let x = 1` / `const x = 1` | ❌ No, `ReferenceError` |
| `const fn = () => {}` | ❌ No, `ReferenceError` |

## Tu turno

Sin ejecutarlo, ¿qué saldrá en cada `console.log`? ¿Cuáles darán error? Después, compruébalo (comenta las líneas que fallen para ver las siguientes):

```js playground=ejercicio
const nivel = 'global'

function probar() {
  console.log(nivel)

  if (true) {
    const nivel = 'bloque'
    console.log(nivel)
  }

  for (let i = 0; i < 2; i++) {}
  console.log(typeof i)
}

probar()
console.log(sumar(2, 3))

function sumar(a, b) {
  return a + b
}
```

## Errores comunes

- **Declarar una variable dentro de un `if` y usarla fuera.** Declárala antes del bloque.
- **Usar `var`.** Se escapa de los bloques y se eleva con `undefined`. Usa `let` y `const`.
- **Usar una arrow function antes de declararla.** Muévela arriba o usa `function`.
- **Llenar el scope global de variables.** Mételas en las funciones que las usan.
- **Reutilizar el mismo nombre en scopes anidados** sin darte cuenta. Usa nombres más descriptivos.

## Para profundizar

- [Scope en MDN](https://developer.mozilla.org/es/docs/Glossary/Scope)
- [Hoisting en MDN](https://developer.mozilla.org/es/docs/Glossary/Hoisting)

En resumen: el **scope** es dónde existe una variable: **global**, de **función** o de **bloque** (con `let` y `const`). Desde dentro se ve hacia fuera, nunca al revés. El **hoisting** sube las declaraciones: las **funciones** se pueden usar antes, `var` vale `undefined` y `let`/`const` dan error hasta su línea. Entender esto es la base para el siguiente gran tema: los **closures**.
