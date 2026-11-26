---
title: 'Funciones en JavaScript: escribe una vez, usa mil veces'
description: 'Qué es una función, cómo pasarle datos con parámetros, para qué sirve return y cómo darle valores por defecto. Explicado con una receta de cocina.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos, Funciones]
draft: true
---

Una **función** es un bloque de código con nombre que puedes ejecutar cuando quieras. Es como una **receta**: la escribes una vez y la usas cada vez que quieras cocinar ese plato, cambiando los ingredientes si hace falta.

Piensa en ella como una máquina: **entran datos → hace algo → sale un resultado**.

## La función más simple

```js playground=basica
function saludar() {
  console.log('¡Hola! Bienvenido a la tienda')
}

saludar()
saludar()
```

- Con **`function saludar() { ... }`** la **declaras**: le dices a JavaScript qué hace. Todavía no se ejecuta.
- Con **`saludar()`** la **llamas**: ahora sí se ejecuta. Los paréntesis son obligatorios.

## Parámetros: los ingredientes

Una función se vuelve útil cuando le pasas datos. Los **parámetros** son las variables que la función recibe:

```js playground=parametros
function saludar(nombre) {
  console.log(`¡Hola, ${nombre}!`)
}

saludar('Ana')
saludar('Luis')

function presentar(nombre, ciudad) {
  console.log(`Soy ${nombre} y vivo en ${ciudad}`)
}

presentar('Marta', 'Arequipa')
```

Cuando escribes `saludar('Ana')`, el valor `'Ana'` (el **argumento**) se guarda en el parámetro `nombre` mientras la función se ejecuta.

## `return`: el plato terminado

Hasta ahora las funciones solo mostraban cosas en la consola. Pero lo normal es que **devuelvan un resultado** para usarlo después. Para eso está `return`:

```js playground=return
function calcularIgv(precio) {
  return precio * 0.18
}

const igv = calcularIgv(100)
console.log(igv) // 18

const total = 100 + calcularIgv(100)
console.log(total) // 118
```

La diferencia es importante:

- **`console.log`** solo **muestra** el valor. Después se pierde.
- **`return`** **entrega** el valor a quien llamó a la función, que puede guardarlo en una variable, sumarlo o pasárselo a otra función.

Además, `return` **termina** la función: lo que haya debajo ya no se ejecuta.

```js playground=return-temprano
function dividir(a, b) {
  if (b === 0) {
    return 'No se puede dividir entre 0'
  }
  return a / b
}

console.log(dividir(10, 2)) // 5
console.log(dividir(10, 0)) // No se puede dividir entre 0
```

Este patrón de "salir pronto si algo está mal" se usa muchísimo: hace que el resto de la función sea más fácil de leer.

## Valores por defecto

Puedes darle a un parámetro un valor que se use si no te pasan nada:

```js playground=defecto
function calcularPrecio(precio, descuento = 0) {
  return precio - precio * descuento
}

console.log(calcularPrecio(100))       // 100 (sin descuento)
console.log(calcularPrecio(100, 0.2))  // 80
```

## Funciones que usan otras funciones

Las funciones pequeñas se combinan para resolver problemas grandes. Cada una hace **una sola cosa**:

```js playground=combinar
function calcularSubtotal(precio, cantidad) {
  return precio * cantidad
}

function aplicarDescuento(monto, porcentaje) {
  return monto - (monto * porcentaje) / 100
}

function formatearSoles(monto) {
  return `S/ ${monto.toFixed(2)}`
}

const subtotal = calcularSubtotal(35, 3)
const conDescuento = aplicarDescuento(subtotal, 10)

console.log(formatearSoles(conDescuento)) // S/ 94.50
```

Si mañana cambia cómo se aplica el descuento, solo tocas `aplicarDescuento`. Eso es lo que hace a las funciones tan valiosas.

## Ponerles buen nombre

Un buen nombre explica qué hace la función sin leer su código:

- Empieza por un **verbo**: `calcularTotal`, `mostrarError`, `esMayorDeEdad`.
- Las que devuelven `true`/`false` suelen empezar por `es` o `tiene`: `esPar(numero)`, `tieneStock(producto)`.
- Evita nombres genéricos como `hacerCosa` o `funcion1`.

## Errores comunes

- **Olvidar los paréntesis al llamarla.** `saludar` (sin paréntesis) no la ejecuta: solo hace referencia a la función.
- **Olvidar el `return`.** Si la función no tiene `return`, devuelve `undefined`. Si ves `undefined` donde esperabas un número, revisa esto primero.
- **Confundir `console.log` con `return`.** Mostrar no es devolver.
- **Funciones que hacen de todo.** Si tu función tiene 50 líneas, probablemente sean varias funciones.

## Para profundizar

- [Funciones en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Functions)

En resumen: una función **se declara** una vez y **se llama** las veces que quieras. Recibe datos por **parámetros**, entrega su resultado con **`return`** y puede tener **valores por defecto**. Cuando domines esto, el siguiente paso son las arrow functions.
