---
title: 'Spread y rest: los tres puntitos mágicos de JavaScript'
description: 'El operador ... sirve para copiar, unir y agregar datos a arrays y objetos, y también para recibir argumentos. Te explico los dos usos.'
date: 2026-11-25
series: javascript
tags: [JavaScript, ES6]
draft: true
order: 23
---

Tres puntos (`...`) y dos superpoderes opuestos:

- **Spread** (esparcir): **saca** los elementos de un array u objeto.
- **Rest** (el resto): **junta** varios elementos en un array.

Mismo símbolo, distinto trabajo según dónde lo pongas. Vamos con ejemplos.

## Spread en arrays

Piensa en spread como **abrir una bolsa y vaciar su contenido** en otro lugar:

```js playground=arrays
const frutas = ['manzana', 'pera']
const verduras = ['zanahoria', 'lechuga']

// Unir dos arrays
const compras = [...frutas, ...verduras]
console.log(compras) // ['manzana', 'pera', 'zanahoria', 'lechuga']

// Agregar al principio o al final
const masFrutas = ['plátano', ...frutas, 'uva']
console.log(masFrutas)

// Copiar un array
const copia = [...frutas]
copia.push('mango')
console.log(frutas) // ['manzana', 'pera'] — el original no cambió
console.log(copia)  // ['manzana', 'pera', 'mango']
```

## ¿Por qué copiar con spread?

Porque si haces `const copia = frutas`, **no** estás copiando: las dos variables apuntan **al mismo array**. Cambias uno y cambias el otro:

```js playground=referencia
const original = [1, 2, 3]
const noEsCopia = original
noEsCopia.push(4)
console.log(original) // [1, 2, 3, 4] 😱

const original2 = [1, 2, 3]
const siEsCopia = [...original2]
siEsCopia.push(4)
console.log(original2) // [1, 2, 3] ✅
```

En React esto es clave: para actualizar el estado **siempre** creas un array nuevo con spread en vez de modificar el viejo.

## Spread en objetos

Funciona igual con objetos, y es perfecto para **actualizar una propiedad** sin tocar el original:

```js playground=objetos
const usuario = { nombre: 'Ana', ciudad: 'Lima', edad: 25 }

// Copiar y cambiar una propiedad (la que va después gana)
const mudada = { ...usuario, ciudad: 'Cusco' }
console.log(mudada)  // { nombre: 'Ana', ciudad: 'Cusco', edad: 25 }
console.log(usuario) // el original sigue en Lima

// Unir dos objetos
const contacto = { email: 'ana@ejemplo.com' }
const completo = { ...usuario, ...contacto }
console.log(completo)
```

El orden importa: si dos objetos tienen la misma propiedad, **gana el que va al final**.

## Rest: juntar "el resto"

Rest hace lo contrario: **recoge** varios valores en un array. Se usa en dos lugares.

**En los parámetros de una función**, para recibir cuantos argumentos quieran mandarte:

```js playground=rest-funcion
const sumarTodo = (...numeros) => numeros.reduce((total, n) => total + n, 0)

console.log(sumarTodo(1, 2))          // 3
console.log(sumarTodo(1, 2, 3, 4, 5)) // 15
```

**Con destructuring**, para quedarte con "lo que sobra":

```js playground=rest-destructuring
const [ganador, ...demas] = ['Ana', 'Luis', 'Sofía', 'Pedro']
console.log(ganador) // 'Ana'
console.log(demas)   // ['Luis', 'Sofía', 'Pedro']

const { edad, ...sinEdad } = { nombre: 'Ana', ciudad: 'Lima', edad: 25 }
console.log(sinEdad) // { nombre: 'Ana', ciudad: 'Lima' }
```

Ese último truco es muy útil para **quitar una propiedad** de un objeto sin modificarlo.

## ¿Cómo sé si es spread o rest?

- Si está a la **derecha** del `=` o dentro de `[]`/`{}` que estás **creando** → **spread** (saca).
- Si está a la **izquierda** del `=` o en los **parámetros** → **rest** (junta).

## Errores comunes

- **Creer que la copia es profunda.** Spread copia solo el primer nivel. Si un objeto tiene otro objeto dentro, ese de adentro se sigue compartiendo. Para una copia completa existe `structuredClone()`.
- **Poner rest en medio.** `(...todo, ultimo)` da error: rest siempre va **al final**.
- **Confundir el orden al unir objetos.** `{ ...nuevo, ...viejo }` deja los valores viejos. Lo nuevo va al final.

## Para profundizar

- [Sintaxis spread en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [Parámetros rest en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/rest_parameters)

En resumen: **spread** saca y sirve para **copiar y unir**, **rest** junta y sirve para **recibir el resto**. Y en los dos casos el original no se toca.
