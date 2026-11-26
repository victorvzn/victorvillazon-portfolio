---
title: 'toSorted, with y compañía: ordena arrays sin romper nada'
description: 'sort() y reverse() modifican el array original y causan bugs difíciles de encontrar. ES2023 trae versiones que devuelven una copia.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ESNext, Arrays]
draft: true
---

Este bug aparece en casi todos los proyectos, y suele aparecer en tu primera semana de trabajo:

```js playground=bug
const productos = [
  { nombre: 'Teclado', precio: 89 },
  { nombre: 'Ratón', precio: 25 },
  { nombre: 'Monitor', precio: 199 }
]

// Queremos mostrar una copia ordenada por precio...
const masBaratos = productos.sort((a, b) => a.precio - b.precio)

// ...pero el original también cambió
console.log('Original:', productos.map(p => p.nombre))
console.log('Ordenado:', masBaratos.map(p => p.nombre))
console.log('¿Es el mismo array?', productos === masBaratos)
```

`sort()` **no crea un array nuevo**: ordena el original y te lo devuelve. A eso se le llama **mutar** el array. En React o Vue esto es un problema serio: si mutas el estado, la pantalla puede no actualizarse, o se actualiza otra parte que no esperabas.

La solución de siempre era copiar primero: `[...productos].sort(...)`. Funciona, pero es fácil olvidarlo. ES2023 trae métodos que **siempre devuelven una copia**.

## Las cuatro versiones "que no mutan"

| Muta el original | Devuelve una copia (ES2023) |
| --- | --- |
| `sort()` | `toSorted()` |
| `reverse()` | `toReversed()` |
| `splice()` | `toSpliced()` |
| `lista[i] = valor` | `with(i, valor)` |

## `toSorted()`: ordenar una tabla

Caso típico: una tabla de productos con un selector "Ordenar por precio". Los datos originales tienen que quedar intactos, por si el usuario quiere volver al orden inicial.

```js playground=tosorted
const productos = [
  { nombre: 'Teclado', precio: 89 },
  { nombre: 'Ratón', precio: 25 },
  { nombre: 'Monitor', precio: 199 }
]

const porPrecio = productos.toSorted((a, b) => a.precio - b.precio)
const porNombre = productos.toSorted((a, b) => a.nombre.localeCompare(b.nombre))

console.log('Original:', productos.map(p => p.nombre))
console.log('Por precio:', porPrecio.map(p => p.nombre))
console.log('Por nombre:', porNombre.map(p => p.nombre))
```

`localeCompare` compara textos teniendo en cuenta el idioma: ordena bien las tildes y la ñ, cosa que `<` y `>` no hacen.

## `with()`: cambiar un elemento

Marcar una tarea como completada en una lista. Antes había que copiar el array y luego asignar:

```js playground=with
const tareas = ['Diseñar', 'Programar', 'Probar']

// Antes
const copia = [...tareas]
copia[1] = 'Programar ✅'

// Ahora, en una sola expresión
const actualizadas = tareas.with(1, 'Programar ✅')

console.log(tareas)       // intacto
console.log(actualizadas)

// También acepta índices negativos: -1 es el último
console.log(tareas.with(-1, 'Probar ✅'))
```

"Una sola expresión" importa más de lo que parece: puedes usarla directamente dentro de un `setState(tareas.with(i, nueva))` en React.

## `toSpliced()`: quitar o insertar

Borrar el elemento de la posición `1` sin tocar el original:

```js playground=tospliced
const carrito = ['Camiseta', 'Pantalón', 'Zapatillas']

const sinPantalon = carrito.toSpliced(1, 1)
const conGorra = carrito.toSpliced(1, 0, 'Gorra')

console.log(carrito)
console.log(sinPantalon)
console.log(conGorra)
```

Los parámetros son los mismos que en `splice`: posición, cuántos borrar y (opcional) qué insertar.

## Bonus: `findLast()` y `at()`

Dos más que te ahorran código a diario:

```js playground=findlast
const pedidos = [
  { id: 1, estado: 'pagado' },
  { id: 2, estado: 'pagado' },
  { id: 3, estado: 'pendiente' }
]

// El último pedido pagado (busca desde el final)
console.log(pedidos.findLast(p => p.estado === 'pagado'))

// El último pedido, sin escribir pedidos[pedidos.length - 1]
console.log(pedidos.at(-1))
```

`findLast` y `findLastIndex` son como `find` y `findIndex`, pero empiezan por el final. Útiles para "el último mensaje no leído" o "el último paso completado".

## Errores comunes

- **Pensar que copian en profundidad.** Copian el array, pero los objetos de dentro son **los mismos**. Si haces `porPrecio[0].precio = 0`, también cambia en `productos`. Para editar un objeto, crea uno nuevo: `lista.with(i, { ...lista[i], precio: 0 })`.
- **Seguir usando `sort()` por costumbre** en el estado de React. Si ves un `.sort(` sobre algo que viene de props o del estado, sospecha.

## Para profundizar

- [`Array.prototype.toSorted()` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
- [`Array.prototype.with()` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/with)

En resumen: **`toSorted`**, **`toReversed`**, **`toSpliced`** y **`with`** hacen lo mismo que sus versiones de siempre, pero **sin tocar el original**. Es la forma segura de trabajar con el estado.
