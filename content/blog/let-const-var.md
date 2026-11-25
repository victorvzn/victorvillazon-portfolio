---
title: 'let, const y por qué ya no usamos var'
description: 'Las tres formas de declarar variables en JavaScript, sus diferencias y una regla simple para elegir.'
date: 2026-11-25
series: javascript
tags: [JavaScript, ES6, Fundamentos]
draft: true
order: 20
---

En JavaScript puedes crear una variable de tres formas: `var`, `let` y `const`. Si estás empezando, la regla es muy sencilla, y al final de este post sabrás por qué.

> Usa **`const`** siempre. Si necesitas cambiar el valor, usa **`let`**. Y olvídate de **`var`**.

## `const`: no se puede reasignar

`const` crea una variable que **no puedes volver a asignar**:

```js playground=const
const nombre = 'Ana'
console.log(nombre)

// Descomenta la siguiente línea y mira el error en la consola:
// nombre = 'Luis'
```

¿Por qué usarla por defecto? Porque al leer el código sabes que ese valor **no va a cambiar más abajo**. Una cosa menos que vigilar.

## Ojo: `const` no congela objetos

Esto confunde a todos al principio. `const` impide **reasignar** la variable, pero si guarda un objeto o un array, **su contenido sí puede cambiar**:

```js playground=objetos
const carrito = ['Teclado']
carrito.push('Mouse')   // ✅ esto funciona: cambiamos el contenido
console.log(carrito)    // ['Teclado', 'Mouse']

const usuario = { nombre: 'Ana' }
usuario.nombre = 'Luis' // ✅ también funciona
console.log(usuario)

// carrito = []         // ❌ esto no: es reasignar la variable
```

Piensa en `const` como una etiqueta pegada a una caja: no puedes despegar la etiqueta y ponerla en otra caja, pero sí puedes meter y sacar cosas de la caja.

## `let`: cuando el valor cambia

Usa `let` cuando **sí** necesitas reasignar: un contador, un total que vas sumando, un valor que depende de una condición.

```js playground=let
let puntos = 0
puntos = puntos + 10
puntos += 5
console.log(puntos) // 15

let mensaje
if (puntos > 10) {
  mensaje = '¡Ganaste!'
} else {
  mensaje = 'Sigue intentando'
}
console.log(mensaje)
```

## ¿Y qué tiene de malo `var`?

`var` es la forma antigua (antes de 2015). Tiene dos comportamientos raros que causan errores difíciles de encontrar.

**1. Ignora los bloques `{}`.** Una variable `var` creada dentro de un `if` o un `for` **se escapa** del bloque:

```js playground=var
if (true) {
  var conVar = 'me escapé'
  let conLet = 'yo me quedo'
}

console.log(conVar) // 'me escapé' 😬
// console.log(conLet) // ❌ error: conLet no existe aquí
```

`let` y `const` respetan el bloque: lo que nace entre llaves, muere entre llaves. A eso se le llama **ámbito de bloque** (*block scope*).

**2. Se puede usar antes de declararla** (y vale `undefined`):

```js playground=hoisting
console.log(fruta) // undefined, sin error. Raro, ¿no?
var fruta = 'manzana'

// Con let, JavaScript te avisa del error:
// console.log(verdura)
// let verdura = 'zanahoria'
```

Con `var`, ese error pasa en silencio. Con `let` y `const`, JavaScript te avisa. Prefieres que te avise.

## Errores comunes

- **Usar `let` para todo "por si acaso".** Si nunca reasignas, usa `const`. Comunica mejor tu intención.
- **Pensar que `const` hace un objeto inmutable.** Solo bloquea la reasignación. Para congelarlo existe `Object.freeze()`, pero casi nunca lo necesitarás.
- **Copiar código viejo con `var`.** Mucho tutorial antiguo lo usa. Cámbialo por `let` o `const`.

## Para profundizar

- [`const` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/const)
- [`let` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/let)
- [`var` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/var)

En resumen: **`const`** por defecto, **`let`** cuando el valor cambia, y **`var`** solo en el museo.
