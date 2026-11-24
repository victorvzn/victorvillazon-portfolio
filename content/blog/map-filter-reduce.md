---
title: 'map, filter y reduce con ejemplos de la vida real'
description: 'Los tres métodos de arrays que más vas a usar en JavaScript, explicados con una tienda online.'
date: 2026-11-24
series: javascript
tags: [JavaScript, ES6, Arrays]
draft: true
# youtube: ID_DEL_VIDEO
---

Si vas a trabajar con JavaScript (y más aún con React), vas a ver `map`, `filter` y `reduce` en todas partes. Al principio me costaba leerlos, así que te los explico como me hubiera gustado que me los explicaran: con una tienda online.

Estos son los datos que usaremos:

```js playground-setup
const productos = [
  { nombre: 'Teclado', precio: 120, categoria: 'perifericos', stock: 5 },
  { nombre: 'Mouse', precio: 45, categoria: 'perifericos', stock: 0 },
  { nombre: 'Monitor', precio: 650, categoria: 'pantallas', stock: 2 },
  { nombre: 'Audífonos', precio: 90, categoria: 'audio', stock: 8 }
]
```

Cada ejemplo tiene un botón para abrirlo en el playground, con estos datos ya cargados y una consola que muestra el resultado mientras escribes.

## Dos ideas antes de empezar

1. **Reciben una función** que se ejecuta una vez por cada elemento. Casi siempre la escribirás como arrow function: `(producto) => producto.nombre`.
2. **No modifican el array original.** Te devuelven algo nuevo y `productos` queda intacto.

## `map`: transformar cada elemento

Úsalo cuando quieras **convertir cada elemento en otra cosa**. Siempre devuelve un array del mismo tamaño.

```js playground=map
const nombres = productos.map((producto) => producto.nombre)
console.log(nombres) // ['Teclado', 'Mouse', 'Monitor', 'Audífonos']

const etiquetas = productos.map((producto) => `${producto.nombre}: S/ ${producto.precio}`)
console.log(etiquetas) // ['Teclado: S/ 120', 'Mouse: S/ 45', ...]
```

Sin `map` tendrías que crear un array vacío, hacer un `for` y un `push`. Con `map` es una línea.

## `filter`: quedarte con algunos

Úsalo cuando quieras **quedarte solo con los que cumplen una condición**. Si la función devuelve `true`, el elemento se queda.

```js playground=filter
const conStock = productos.filter((producto) => producto.stock > 0)
console.log(conStock) // Teclado, Monitor y Audífonos

const busqueda = 'mo'
const resultados = productos.filter((producto) =>
  producto.nombre.toLowerCase().includes(busqueda)
)
console.log(resultados) // Mouse y Monitor
```

Ese segundo ejemplo es, literalmente, el buscador de una tienda.

## `reduce`: todo en un solo valor

Úsalo cuando quieras **resumir la lista en un único resultado**: un total, un conteo, un objeto. Recibe la función y un **valor inicial**.

```js playground=reduce
const carrito = [
  { nombre: 'Teclado', precio: 120, cantidad: 1 },
  { nombre: 'Audífonos', precio: 90, cantidad: 2 }
]

const total = carrito.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0)
console.log(total) // 300
```

En la primera vuelta, `acumulado` vale `0` y suma el teclado: `120`. En la segunda, parte de `120` y suma los audífonos: `120 + 180 = 300`. Lo que devuelves en cada vuelta es el `acumulado` de la siguiente.

## Combinarlos

Lo mejor viene cuando los encadenas. ¿Cuánto vale todo el inventario disponible?

```js playground=encadenar
const valorInventario = productos
  .filter((producto) => producto.stock > 0)            // los que tienen stock
  .map((producto) => producto.precio * producto.stock) // [600, 1300, 720]
  .reduce((suma, valor) => suma + valor, 0)            // los sumo

console.log(valorInventario) // 2620
```

Cada línea hace una sola cosa y se lee como una receta.

## Errores que yo también cometí

- **Olvidar el `return` con llaves.** `(p) => { p.nombre }` devuelve `undefined`. Con llaves necesitas `return`; sin llaves, no.
- **No poner el valor inicial en `reduce`.** Ponlo siempre: `0`, `[]` o `{}`.
- **Usar `map` solo para recorrer.** Si no usas el resultado, lo que buscas es `forEach`.

## Tu turno

```js playground=ejercicio
// 1. Nombres en mayúsculas (map)
const mayusculas = []

// 2. Solo los de la categoría 'perifericos' (filter)
const perifericos = []

// 3. Precio promedio (reduce y divide entre productos.length). Debe dar 226.25
const promedio = 0

console.log({ mayusculas, perifericos, promedio })
```

En resumen: **`map`** transforma, **`filter`** selecciona y **`reduce`** resume. Ninguno toca tu array original, y juntos resuelven casi cualquier problema con listas.
