---
title: 'find, some, every e includes: buscar en arrays sin un for'
description: 'Los cuatro métodos para responder preguntas sobre un array: ¿está?, ¿cuál es?, ¿alguno cumple?, ¿todos cumplen?'
date: 2026-11-25
series: javascript
tags: [JavaScript, ES6, Arrays]
draft: true
order: 26
---

En el post de `map`, `filter` y `reduce` vimos cómo **transformar** arrays. Hoy vamos con cuatro métodos para **hacerle preguntas** a un array. Cada uno responde una pregunta distinta, y eso es lo que te ayuda a elegir.

Volvemos a nuestra tienda online:

```js playground-setup
const productos = [
  { id: 1, nombre: 'Teclado', precio: 120, stock: 5 },
  { id: 2, nombre: 'Mouse', precio: 45, stock: 0 },
  { id: 3, nombre: 'Monitor', precio: 650, stock: 2 },
  { id: 4, nombre: 'Audífonos', precio: 90, stock: 8 }
]
```

## `includes`: ¿está este valor?

Devuelve `true` o `false`. Es el más simple y funciona con valores directos (textos, números):

```js playground=includes
const categorias = ['audio', 'pantallas', 'perifericos']

console.log(categorias.includes('audio'))   // true
console.log(categorias.includes('cámaras')) // false

// También sirve con textos
console.log('Teclado mecánico'.includes('mecánico')) // true
```

Con objetos no sirve así: `productos.includes({ id: 1 })` da `false`, porque compara si es **el mismo objeto**, no si se parece. Para eso están los siguientes.

## `find`: ¿cuál es?

Devuelve **el primer elemento** que cumple la condición. Si no encuentra ninguno, devuelve `undefined`.

```js playground=find
const monitor = productos.find((producto) => producto.id === 3)
console.log(monitor) // { id: 3, nombre: 'Monitor', ... }

const carisimo = productos.find((producto) => producto.precio > 1000)
console.log(carisimo) // undefined
```

Es lo que usas cuando tienes un `id` y quieres el producto completo, como en la página de detalle de una tienda.

**`find` vs `filter`:** `find` devuelve **un elemento** (el primero) y deja de buscar. `filter` devuelve **un array** con todos los que cumplen.

¿Necesitas la posición en vez del elemento? Usa `findIndex`, que devuelve el índice (o `-1` si no lo encuentra).

## `some`: ¿alguno cumple?

Devuelve `true` si **al menos uno** cumple la condición:

```js playground=some
const hayAgotados = productos.some((producto) => producto.stock === 0)
console.log(hayAgotados) // true (el Mouse)

const hayGratis = productos.some((producto) => producto.precio === 0)
console.log(hayGratis) // false
```

Ideal para preguntas tipo "¿hay algún error en el formulario?" o "¿el carrito tiene algún producto en oferta?".

## `every`: ¿todos cumplen?

Devuelve `true` solo si **todos** cumplen:

```js playground=every
const todosConPrecio = productos.every((producto) => producto.precio > 0)
console.log(todosConPrecio) // true

const todosConStock = productos.every((producto) => producto.stock > 0)
console.log(todosConStock) // false (el Mouse)
```

Ideal para "¿están todos los campos llenos?" o "¿aceptó todas las condiciones?".

## Chuleta rápida

| Pregunta | Método | Devuelve |
| --- | --- | --- |
| ¿Está este valor? | `includes` | `true` / `false` |
| ¿Cuál es el primero que cumple? | `find` | el elemento o `undefined` |
| ¿En qué posición está? | `findIndex` | el índice o `-1` |
| ¿Alguno cumple? | `some` | `true` / `false` |
| ¿Todos cumplen? | `every` | `true` / `false` |
| ¿Cuáles cumplen? | `filter` | un array |

## Tu turno

```js playground=ejercicio
// 1. Encuentra el producto que se llama 'Audífonos' (find)
const audifonos = null

// 2. ¿Hay algún producto de más de S/ 500? (some)
const hayCaros = null

// 3. ¿Todos cuestan menos de S/ 1000? (every)
const todosBaratos = null

console.log({ audifonos, hayCaros, todosBaratos })
```

## Errores comunes

- **Usar `filter(...)[0]` para buscar uno.** Funciona, pero recorre todo el array. `find` se detiene en cuanto lo encuentra.
- **No contemplar el `undefined` de `find`.** Si no lo encuentra y haces `resultado.nombre`, error. Comprueba antes: `if (resultado)`.
- **`includes` con objetos.** Compara referencias, no contenido. Usa `some`.

## Para profundizar

- [`find` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
- [`some` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
- [`every` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
- [`includes` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)

En resumen: **`includes`** pregunta si está, **`find`** te da cuál es, **`some`** pregunta si alguno cumple y **`every`** si todos cumplen.
