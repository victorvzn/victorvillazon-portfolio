---
title: 'Copiar objetos y arrays: referencias, copia superficial y structuredClone'
description: 'Por qué cambiar una "copia" cambia también el original, la diferencia entre copia superficial y profunda y cuándo usar spread o structuredClone.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Objetos, Arrays]
draft: true
---

Este bug le pasa a todo el mundo:

```js playground=bug
const original = { nombre: 'Ana', edad: 25 }
const copia = original

copia.nombre = 'Luis'

console.log(original.nombre) // 'Luis' 😱
```

Cambiaste la "copia"... y el original también cambió. No es un error de JavaScript: es que **no hiciste ninguna copia**. Hoy vamos a ver por qué y cómo copiar de verdad.

## Valores primitivos vs referencias

Los tipos de JavaScript se dividen en dos grupos:

- **Primitivos** (`number`, `string`, `boolean`, `null`, `undefined`): la variable guarda **el valor mismo**. Al asignarla a otra, se copia el valor.
- **Objetos** (incluidos arrays y funciones): la variable guarda **una referencia**, como una dirección que apunta a dónde está el objeto en memoria. Al asignarla a otra, se copia **la dirección**, no el objeto.

```js playground=primitivos
let a = 10
let b = a   // b recibe una copia del 10
b = 20
console.log(a) // 10 ✅ a no cambia

const lista1 = [1, 2, 3]
const lista2 = lista1 // lista2 recibe la MISMA dirección
lista2.push(4)
console.log(lista1) // [1, 2, 3, 4] 😱
```

Piensa en una **llave de casa**. `const lista2 = lista1` no construye una casa nueva: hace una **copia de la llave**. Las dos llaves abren la misma casa, y si alguien mueve los muebles, lo ve todo el que entre.

Lo mismo pasa al pasar un objeto a una función: la función recibe la llave, y si modifica el objeto, modifica el original.

```js playground=funcion
function aplicarDescuento(producto) {
  producto.precio = producto.precio * 0.9 // ⚠️ modifica el original
  return producto
}

const teclado = { nombre: 'Teclado', precio: 100 }
const rebajado = aplicarDescuento(teclado)

console.log(teclado.precio) // 90 😱 el original también cambió
```

## Copia superficial con spread

Para crear un objeto o array **nuevo**, usa el **spread** (`...`), que vimos en su propio post:

```js playground=spread
const original = { nombre: 'Ana', edad: 25 }
const copia = { ...original }

copia.nombre = 'Luis'
console.log(original.nombre) // 'Ana' ✅
console.log(copia.nombre)    // 'Luis'

const numeros = [1, 2, 3]
const otros = [...numeros]
otros.push(4)
console.log(numeros) // [1, 2, 3] ✅
```

Y así queda la función del descuento, sin efectos sorpresa:

```js playground=funcion-bien
function aplicarDescuento(producto) {
  return { ...producto, precio: producto.precio * 0.9 }
}

const teclado = { nombre: 'Teclado', precio: 100 }
const rebajado = aplicarDescuento(teclado)

console.log(teclado.precio)  // 100 ✅
console.log(rebajado.precio) // 90
```

`{ ...producto, precio: ... }` copia todas las propiedades y **sobrescribe** `precio`. Es el patrón más usado en React y en cualquier código moderno.

## El problema: la copia superficial solo copia el primer nivel

El spread hace una **copia superficial** (*shallow copy*): copia el primer nivel, pero si una propiedad es **otro objeto**, copia **su llave**, no el objeto:

```js playground=superficial
const usuario = {
  nombre: 'Ana',
  direccion: { ciudad: 'Lima', distrito: 'Miraflores' }
}

const copia = { ...usuario }
copia.nombre = 'Luis'              // primer nivel: ✅ independiente
copia.direccion.ciudad = 'Cusco'   // segundo nivel: ⚠️ compartido

console.log(usuario.nombre)          // 'Ana' ✅
console.log(usuario.direccion.ciudad) // 'Cusco' 😱
```

`usuario` y `copia` son dos objetos distintos, pero los dos tienen la llave de **la misma** `direccion`.

Con spread puedes copiar también el nivel de dentro, a mano:

```js playground=anidado
const usuario = {
  nombre: 'Ana',
  direccion: { ciudad: 'Lima', distrito: 'Miraflores' }
}

const copia = {
  ...usuario,
  direccion: { ...usuario.direccion, ciudad: 'Cusco' }
}

console.log(usuario.direccion.ciudad) // 'Lima' ✅
console.log(copia.direccion.ciudad)   // 'Cusco'
```

Funciona y es lo que se hace normalmente cuando solo cambias una cosa. Pero con objetos muy anidados se vuelve pesado.

## Copia profunda con `structuredClone`

**`structuredClone`** hace una **copia profunda** (*deep copy*): copia el objeto **y todo lo que tiene dentro**, en todos los niveles. Viene incluido en el navegador y en Node:

```js playground=structured
const pedido = {
  id: 1,
  cliente: { nombre: 'Ana', direccion: { ciudad: 'Lima' } },
  productos: [{ nombre: 'Teclado', cantidad: 1 }],
  fecha: new Date('2026-11-26T10:00:00')
}

const copia = structuredClone(pedido)

copia.cliente.direccion.ciudad = 'Cusco'
copia.productos[0].cantidad = 5

console.log(pedido.cliente.direccion.ciudad) // 'Lima' ✅
console.log(pedido.productos[0].cantidad)    // 1 ✅
console.log(copia.fecha instanceof Date)     // true: las fechas se copian bien
```

### ¿Y el truco de `JSON.parse(JSON.stringify(...))`?

En código antiguo verás esto para copiar en profundidad:

```js
const copia = JSON.parse(JSON.stringify(objeto))
```

Funciona en casos simples, pero **rompe** cosas: las fechas se convierten en textos, y los `undefined` y las funciones desaparecen. `structuredClone` no tiene esos problemas (salvo con las funciones, que no puede copiar: da error). Usa `structuredClone`.

## Cuándo usar cada una

| Necesitas... | Usa |
| --- | --- |
| Compartir el mismo objeto a propósito | `const b = a` |
| Copiar y cambiar algo en el primer nivel | `{ ...obj, cambio }` / `[...array]` |
| Cambiar algo en un nivel anidado | Spread en cada nivel que cambias |
| Una copia totalmente independiente | `structuredClone(obj)` |

## Cómo comprobar si es el mismo objeto

`===` con objetos compara **las llaves**, no el contenido:

```js playground=comparar
const a = { id: 1 }
const b = a
const c = { ...a }

console.log(a === b) // true: misma llave, mismo objeto
console.log(a === c) // false: objeto nuevo, aunque tenga lo mismo
```

Esta es justo la forma en que React detecta si cambiaste el estado: si le pasas el **mismo** objeto modificado, `===` da `true` y cree que no cambió nada. Si le pasas una **copia nueva**, se entera.

## Tu turno

```js playground=ejercicio
const configuracion = {
  tema: 'oscuro',
  idioma: 'es',
  notificaciones: { email: true, push: false }
}

// 1. Crea "nuevaConfig" con el tema 'claro', sin modificar "configuracion"

// 2. Crea "conPush" con notificaciones.push en true, sin modificar "configuracion"
//    (hazlo primero con spread y luego con structuredClone)

// 3. Comprueba con console.log que "configuracion" sigue igual
console.log(configuracion)
```

## Errores comunes

- **Creer que `const copia = original` copia.** Solo copia la referencia.
- **Modificar un objeto que recibe una función** sin querer. Devuelve una copia nueva con spread.
- **Pensar que el spread copia todo.** Solo el primer nivel. Los objetos de dentro siguen compartidos.
- **Usar `JSON.parse(JSON.stringify())`** y perder las fechas. Usa `structuredClone`.
- **Usar `structuredClone` para todo.** Copiar en profundidad un objeto enorme es costoso. Si solo cambias una propiedad, basta el spread.

## Para profundizar

- [`structuredClone` en MDN](https://developer.mozilla.org/es/docs/Web/API/Window/structuredClone)
- [Copia superficial en MDN](https://developer.mozilla.org/es/docs/Glossary/Shallow_copy)
- [Copia profunda en MDN](https://developer.mozilla.org/es/docs/Glossary/Deep_copy)

En resumen: asignar un objeto **copia la referencia**, no el objeto. El **spread** (`{ ...obj }`, `[...array]`) hace una **copia superficial**, suficiente casi siempre; para copiar **todos los niveles**, usa **`structuredClone`**. Y para no tener sorpresas, tus funciones deberían **devolver copias** en vez de modificar lo que reciben.
