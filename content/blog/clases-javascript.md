---
title: 'Clases en JavaScript: una introducción a la programación orientada a objetos'
description: 'Qué es una clase, cómo crear objetos con new y constructor, qué es this, cómo heredar con extends y para qué sirven las propiedades privadas con #.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ES6, POO]
draft: true
---

Imagina que tu app maneja muchos productos. Cada uno tiene nombre, precio y stock, y con todos haces lo mismo: aplicar un descuento, comprobar si queda stock, mostrar el precio con formato. Podrías crear cada objeto a mano y repetir esas funciones... o crear **una plantilla** que fabrique productos con todo eso incluido.

Esa plantilla es una **clase**. Es la base de la **programación orientada a objetos (POO)**, una forma de organizar el código muy usada en muchos lenguajes.

## Clase e instancia: el molde y las galletas

- Una **clase** es el **molde**: define qué datos y qué acciones tendrá cada objeto.
- Una **instancia** es cada **galleta** que sale del molde: un objeto concreto, con sus propios datos.

```js playground=basica
class Producto {
  constructor(nombre, precio) {
    this.nombre = nombre
    this.precio = precio
  }

  mostrar() {
    return `${this.nombre}: S/ ${this.precio.toFixed(2)}`
  }
}

const polo = new Producto('Polo', 35)
const gorra = new Producto('Gorra', 25)

console.log(polo.mostrar())   // 'Polo: S/ 35.00'
console.log(gorra.mostrar())  // 'Gorra: S/ 25.00'
console.log(polo.nombre)      // 'Polo'
```

- **`class Producto { ... }`** define la clase. Por convención, su nombre empieza por **mayúscula**.
- **`new Producto('Polo', 35)`** crea una instancia nueva.
- **`constructor`** es una función especial que se ejecuta **al hacer `new`**. Recibe los datos iniciales y los guarda.
- **`mostrar()`** es un **método**: una función que tienen todas las instancias.

## this: "este objeto"

Dentro de una clase, **`this`** se refiere a **la instancia concreta** con la que estás trabajando. Cuando llamas a `polo.mostrar()`, dentro del método `this` es `polo`; cuando llamas a `gorra.mostrar()`, es `gorra`.

Por eso el mismo método da resultados distintos: cada instancia tiene sus propios datos en `this`.

## Métodos que cambian los datos

Los métodos también pueden **modificar** la instancia:

```js playground=metodos
class Producto {
  constructor(nombre, precio, stock = 0) {
    this.nombre = nombre
    this.precio = precio
    this.stock = stock
  }

  aplicarDescuento(porcentaje) {
    this.precio = this.precio - (this.precio * porcentaje) / 100
  }

  vender(cantidad) {
    if (cantidad > this.stock) {
      throw new Error(`Stock insuficiente de ${this.nombre}: quedan ${this.stock}`)
    }
    this.stock -= cantidad
  }

  hayStock() {
    return this.stock > 0
  }
}

const mochila = new Producto('Mochila', 120, 3)

mochila.aplicarDescuento(25)
console.log(mochila.precio)     // 90

mochila.vender(2)
console.log(mochila.stock)      // 1
console.log(mochila.hayStock()) // true

try {
  mochila.vender(5)
} catch (error) {
  console.log(error.message)    // 'Stock insuficiente de Mochila: quedan 1'
}
```

Fíjate en la ventaja: **la lógica vive junto a los datos**. Cualquiera que use un `Producto` vende con `vender()`, y la comprobación del stock no se puede olvidar.

## Herencia: extends y super

A veces un tipo de objeto es una **versión más específica** de otro. Un producto digital es un producto, pero no tiene stock físico y se descarga. Con **`extends`**, una clase **hereda** todo lo de otra y añade o cambia lo que necesite:

```js playground=herencia
class Producto {
  constructor(nombre, precio) {
    this.nombre = nombre
    this.precio = precio
  }

  mostrar() {
    return `${this.nombre}: S/ ${this.precio}`
  }
}

class ProductoDigital extends Producto {
  constructor(nombre, precio, enlace) {
    super(nombre, precio) // llama al constructor de Producto
    this.enlace = enlace
  }

  mostrar() {
    return `${super.mostrar()} · descarga en ${this.enlace}`
  }
}

const curso = new ProductoDigital('Curso de CSS', 49, 'cursos.com/css')
console.log(curso.mostrar())
// 'Curso de CSS: S/ 49 · descarga en cursos.com/css'
console.log(curso instanceof Producto) // true: también es un Producto
```

- **`extends Producto`**: `ProductoDigital` tiene todo lo que tiene `Producto`.
- **`super(nombre, precio)`**: en el constructor, llama al constructor de la clase padre. Es **obligatorio** antes de usar `this`.
- **`super.mostrar()`**: llama al método del padre, para ampliarlo en vez de reescribirlo entero.

No abuses de la herencia: una cadena de cinco clases que heredan unas de otras se vuelve difícil de entender. Uno o dos niveles suele ser suficiente.

## Propiedades privadas con #

Por defecto, cualquiera puede cambiar los datos de una instancia desde fuera: `mochila.stock = -500`. Para proteger un dato, ponle **`#`** delante: solo se podrá usar **dentro** de la clase:

```js playground=privadas
class CuentaBancaria {
  #saldo = 0 // privado: no se puede tocar desde fuera

  constructor(titular) {
    this.titular = titular
  }

  depositar(monto) {
    if (monto <= 0) throw new Error('El monto debe ser positivo')
    this.#saldo += monto
  }

  get saldo() {
    return this.#saldo // se puede leer, pero solo a través de este método
  }
}

const cuenta = new CuentaBancaria('Ana')
cuenta.depositar(500)
console.log(cuenta.saldo) // 500

cuenta.saldo = 1000000    // no tiene efecto: solo hay un "get"
console.log(cuenta.saldo) // 500
```

- **`#saldo`** solo existe dentro de la clase. Intentar leer `cuenta.#saldo` desde fuera es un error de sintaxis.
- **`get saldo()`** es un *getter*: se usa como una propiedad (`cuenta.saldo`, sin paréntesis), pero por dentro es una función. Permite **leer** sin permitir **escribir**. Asignarle un valor no tiene efecto (y en modo estricto, por ejemplo dentro de un módulo, lanza un error).

Es la misma idea que vimos con los closures: datos que solo se cambian por los caminos que tú decides.

## ¿Cuándo usar clases?

- **Sí**: cuando tienes muchos objetos del mismo tipo con datos **y** comportamiento (productos de un carrito, personajes de un juego, cuentas de un banco).
- **Sí**: cuando una librería te lo pide (muchas librerías y APIs del navegador usan clases).
- **No hace falta**: para agrupar datos sin comportamiento. Un objeto literal `{ nombre, precio }` es más sencillo.

En el frontend moderno (React, por ejemplo) se usan sobre todo funciones, así que no te preocupes si no usas clases a diario. Pero las verás en otros lenguajes y en entrevistas, y entenderlas te hace mejor programador.

## Errores comunes

- **Olvidar `new`.** `Producto('Polo', 35)` lanza `Class constructor Producto cannot be invoked without 'new'`.
- **Olvidar `this`.** Dentro de un método, `precio` (a secas) no existe: es `this.precio`.
- **Usar `this` antes de `super()`** en una clase hija: es un error.
- **Comas entre los métodos.** En una clase **no** van comas entre métodos, a diferencia de un objeto literal.

## Para profundizar

- [Clases en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes)

En resumen: una **clase** es un molde, **`new`** fabrica instancias, el **`constructor`** guarda los datos iniciales, **`this`** es "esta instancia", **`extends`** y **`super`** sirven para heredar y **`#`** hace privado un dato. Úsalas cuando tengas muchos objetos con datos **y** comportamiento.
