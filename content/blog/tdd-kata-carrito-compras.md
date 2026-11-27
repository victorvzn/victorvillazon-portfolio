---
title: 'Kata de TDD: un carrito de compras paso a paso'
description: 'Practica TDD con un ejercicio completo: la lista de tests, empezar por el caso más simple, triangular, refactorizar con red de seguridad y añadir requisitos nuevos (descuentos y envío) sin romper nada.'
date: 2026-11-27
series: testing
tags: [TDD, Testing, Vitest, Ejercicio]
draft: true
---

Una **kata** es un ejercicio pequeño que se repite para practicar una técnica, como en las artes marciales. Hoy vas a construir la lógica de un **carrito de compras** con TDD, desde cero, aplicando las técnicas que usan los equipos en el día a día.

Prepara un proyecto con Vitest, crea `src/carrito.js` y `src/carrito.test.js` vacíos y deja `npm test` en modo watch.

## Antes de empezar: la lista de tests

Kent Beck, el creador del TDD, empieza cada tarea escribiendo una **lista de tests**: los comportamientos que se le ocurren, en un papel o en un comentario. No hace falta que esté completa; irá creciendo.

```js
// Lista de tests:
// - un carrito nuevo está vacío y su total es 0
// - al añadir un producto, el total es su precio
// - se pueden añadir varias unidades
// - añadir el mismo producto suma unidades en lugar de duplicarlo
// - se puede quitar un producto
// - no se pueden añadir cantidades negativas o cero
// - cupón DESCUENTO10: 10% menos
// - envío gratis desde S/ 100; si no, cuesta S/ 15
```

Con `it.todo` puedes ponerla directamente en el archivo de tests: Vitest las muestra como pendientes.

La regla para elegir el siguiente: **el más sencillo que te enseñe algo**.

## Ciclo 1: un carrito vacío

🔴

```js
import { describe, it, expect } from 'vitest'
import { crearCarrito } from './carrito.js'

describe('carrito', () => {
  it('empieza vacío y con total 0', () => {
    const carrito = crearCarrito()

    expect(carrito.productos()).toEqual([])
    expect(carrito.total()).toBe(0)
  })
})
```

🟢

```js
export function crearCarrito() {
  return {
    productos: () => [],
    total: () => 0
  }
}
```

Fíjate en que **el test decidió la forma de la API**: una función `crearCarrito()` que devuelve un objeto con métodos. Lo pensamos desde el punto de vista de quien la usa.

## Ciclo 2: añadir un producto

🔴

```js
it('al añadir un producto, el total es su precio', () => {
  const carrito = crearCarrito()

  carrito.agregar({ id: 'teclado', precio: 120 })

  expect(carrito.total()).toBe(120)
})
```

🟢 Lo mínimo... sería devolver `120`. Pero eso rompería el ciclo 1. Necesitamos guardar algo:

```js
export function crearCarrito() {
  const lineas = []

  return {
    agregar(producto) {
      lineas.push(producto)
    },
    productos: () => lineas,
    total: () => lineas.reduce((suma, p) => suma + p.precio, 0)
  }
}
```

## Ciclo 3: varias unidades (triangular)

Cuando no tienes claro cómo generalizar, añade **otro ejemplo** que obligue a hacerlo. A esto se le llama **triangular**.

🔴

```js
it('se pueden añadir varias unidades', () => {
  const carrito = crearCarrito()

  carrito.agregar({ id: 'mouse', precio: 25 }, 3)

  expect(carrito.total()).toBe(75)
})
```

🟢

```js
agregar(producto, cantidad = 1) {
  lineas.push({ ...producto, cantidad })
},
total: () => lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0)
```

El valor por defecto `cantidad = 1` mantiene en verde el ciclo 2.

## Ciclo 4: el mismo producto dos veces

🔴

```js
it('añadir el mismo producto suma unidades', () => {
  const carrito = crearCarrito()

  carrito.agregar({ id: 'mouse', precio: 25 })
  carrito.agregar({ id: 'mouse', precio: 25 }, 2)

  expect(carrito.productos()).toEqual([{ id: 'mouse', precio: 25, cantidad: 3 }])
})
```

Falla: hay dos líneas.

🟢

```js
agregar(producto, cantidad = 1) {
  const existente = lineas.find((linea) => linea.id === producto.id)
  if (existente) {
    existente.cantidad += cantidad
  } else {
    lineas.push({ ...producto, cantidad })
  }
},
```

## Ciclo 5: datos inválidos

🔴

```js
it.each([0, -1, 1.5])('no acepta la cantidad %s', (cantidad) => {
  const carrito = crearCarrito()

  expect(() => carrito.agregar({ id: 'mouse', precio: 25 }, cantidad)).toThrow('Cantidad no válida')
})
```

🟢

```js
agregar(producto, cantidad = 1) {
  if (!Number.isInteger(cantidad) || cantidad < 1) throw new Error('Cantidad no válida')
  // ...lo de antes
},
```

## Ciclo 6: quitar un producto

🔴

```js
it('se puede quitar un producto', () => {
  const carrito = crearCarrito()
  carrito.agregar({ id: 'teclado', precio: 120 })
  carrito.agregar({ id: 'mouse', precio: 25 })

  carrito.quitar('teclado')

  expect(carrito.total()).toBe(25)
})
```

🟢

```js
export function crearCarrito() {
  let lineas = []

  return {
    // ...
    quitar(id) {
      lineas = lineas.filter((linea) => linea.id !== id)
    },
    productos: () => lineas,
    // ...
  }
}
```

## Refactor: una sorpresa

Con todos en verde, revisamos. Hay un problema escondido: `productos()` devuelve **el array interno**. Quien lo use podría modificarlo desde fuera (`carrito.productos().push(...)`) y saltarse nuestras validaciones.

Primero escribimos un test que demuestre el problema 🔴:

```js
it('no se puede modificar el carrito desde fuera', () => {
  const carrito = crearCarrito()
  carrito.agregar({ id: 'mouse', precio: 25 })

  carrito.productos()[0].cantidad = 999

  expect(carrito.total()).toBe(25)
})
```

🟢 Devolvemos una copia:

```js
productos: () => structuredClone(lineas),
```

Y ordenamos el código en el 🔵 refactor. Así queda:

```js
// src/carrito.js
export function crearCarrito() {
  let lineas = []

  const buscar = (id) => lineas.find((linea) => linea.id === id)

  return {
    agregar(producto, cantidad = 1) {
      if (!Number.isInteger(cantidad) || cantidad < 1) throw new Error('Cantidad no válida')

      const existente = buscar(producto.id)
      if (existente) existente.cantidad += cantidad
      else lineas.push({ ...producto, cantidad })
    },

    quitar(id) {
      lineas = lineas.filter((linea) => linea.id !== id)
    },

    productos: () => structuredClone(lineas),

    subtotal: () => lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0),

    total() {
      return this.subtotal()
    }
  }
}
```

Separamos `subtotal` y `total` **porque sabemos lo que viene** en la lista: descuentos y envío. Todos los tests siguen en verde.

## Llega un requisito nuevo

Tu jefa pasa por tu mesa: "Necesitamos el cupón `DESCUENTO10` y envío gratis desde S/ 100". Sin tests, este es el momento en que algo se rompe. Con tests, es otro ciclo.

🔴

```js
describe('descuentos y envío', () => {
  it('cobra S/ 15 de envío si el subtotal es menor de 100', () => {
    const carrito = crearCarrito()
    carrito.agregar({ id: 'mouse', precio: 25 })

    expect(carrito.total()).toBe(40)
  })

  it('el envío es gratis desde 100', () => {
    const carrito = crearCarrito()
    carrito.agregar({ id: 'teclado', precio: 100 })

    expect(carrito.total()).toBe(100)
  })

  it('DESCUENTO10 resta un 10% del subtotal', () => {
    const carrito = crearCarrito()
    carrito.agregar({ id: 'monitor', precio: 500 })

    carrito.aplicarCupon('DESCUENTO10')

    expect(carrito.total()).toBe(450)
  })

  it('un cupón desconocido lanza un error', () => {
    expect(() => crearCarrito().aplicarCupon('GRATIS')).toThrow('Cupón no válido')
  })
})
```

Y al escribir el código pasa algo interesante: **fallan también tests antiguos**. "Varias unidades" esperaba 75 y ahora el total es 90 (75 + 15 de envío), y los de quitar un producto y de la copia defensiva esperaban 25 y ahora dan 40. Un requisito nuevo cambió el comportamiento de los antiguos, y los tests **te lo avisan**. Toca decidir: esos tests hablaban del precio de los productos, no del envío, así que los cambiamos a `carrito.subtotal()`.

Y el del carrito vacío destapa una pregunta: ¿un carrito vacío cuesta S/ 15 de envío? Claro que no. Ese test se queda tal cual (`total()` debe ser 0) y obliga a contemplar el caso. Sin tests, ninguno de estos cambios se habría notado.

🟢

```js
const CUPONES = { DESCUENTO10: 0.1 }
const ENVIO = 15
const ENVIO_GRATIS_DESDE = 100

export function crearCarrito() {
  let lineas = []
  let descuento = 0

  // ...agregar, quitar, productos y subtotal como antes

  return {
    // ...
    aplicarCupon(codigo) {
      if (!(codigo in CUPONES)) throw new Error('Cupón no válido')
      descuento = CUPONES[codigo]
    },

    total() {
      const subtotal = this.subtotal()
      if (subtotal === 0) return 0

      const conDescuento = subtotal - subtotal * descuento
      const envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : ENVIO
      return conDescuento + envio
    }
  }
}
```

Al escribirlo surge otra pregunta: ¿el envío gratis se calcula **antes** o **después** del descuento? Un carrito de S/ 105 con `DESCUENTO10` queda en 94.50: ¿paga envío? No es una decisión técnica, es **de negocio**: pregúntala. Y cuando tengas la respuesta, escríbela como test para que nadie la cambie por accidente.

## Lo que has practicado

- **Lista de tests** para no perder el foco.
- **Empezar por lo más simple** y dejar que los tests diseñen la API.
- **Hacer trampa a propósito** en verde y **triangular** con otro ejemplo.
- **Refactorizar** solo en verde, y descubrir problemas de diseño (la copia defensiva).
- **Requisitos nuevos** sin miedo: los tests te dicen exactamente qué comportamiento cambia.

## Tu turno

Continúa la kata con TDD, sin saltarte el rojo:

1. Decide la regla del envío con descuento y escribe su test.
2. Añade `cambiarCantidad(id, cantidad)`. Con cantidad 0, el producto se quita.
3. Añade un cupón `2X1` que haga gratis una de cada dos unidades del producto más barato.
4. Repite la kata **desde cero** dentro de una semana, sin mirar este post. Te sorprenderá lo distinto (y mejor) que sale.

## Errores comunes

- **Pensar toda la solución antes de empezar** y usar los tests solo para confirmarla. Deja que los tests te guíen.
- **Saltar a un test difícil** (el cupón 2x1) antes que los simples.
- **Cambiar un test antiguo solo para que pase**, sin preguntarte si el comportamiento debía cambiar.
- **No refactorizar** porque "ya funciona".
- **Probar el array interno** (`lineas`) en vez de lo que devuelve la API pública (`productos()`, `total()`).

## Para profundizar

- [Kata del carrito de compras y otras katas en Coding Dojo (en inglés)](https://codingdojo.org/kata/)
- [Canon TDD, de Kent Beck (en inglés)](https://tidyfirst.substack.com/p/canon-tdd)

En resumen: empieza con una **lista de tests**, elige siempre **el más simple**, haz el mínimo para pasar y **triangula** cuando necesites generalizar. **Refactoriza en verde** y, cuando llegue un requisito nuevo, escribe sus tests primero: te dirán qué comportamiento antiguo cambia y te harán las preguntas de negocio que nadie había pensado.
