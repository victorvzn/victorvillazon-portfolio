---
title: 'Recorrer objetos: Object.keys, values, entries y fromEntries'
description: 'Cómo recorrer las propiedades de un objeto, convertirlo en array para usar map y filter y volver a convertirlo en objeto. Con ejemplos de carritos, formularios y traducciones.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Objetos, Arrays]
draft: true
---

Los arrays tienen `map`, `filter`, `forEach`... pero ¿cómo recorres un **objeto**? Si tienes `{ teclado: 2, mouse: 1, monitor: 1 }` y quieres saber cuántos productos hay en total, no puedes hacer `objeto.map(...)`: los objetos no tienen esos métodos.

La solución es **convertir el objeto en un array**, trabajar con él y, si hace falta, volver a convertirlo en objeto. Para eso hay cuatro herramientas.

```js playground-setup
const carrito = {
  teclado: 2,
  mouse: 1,
  monitor: 1
}
```

## `Object.keys`: las claves

Devuelve un array con los **nombres** de las propiedades:

```js playground=keys
console.log(Object.keys(carrito)) // ['teclado', 'mouse', 'monitor']

// ¿Cuántos productos distintos hay?
console.log(Object.keys(carrito).length) // 3
```

`Object.keys(objeto).length` es la forma de saber cuántas propiedades tiene un objeto, y de comprobar si está vacío:

```js playground=vacio
const filtros = {}
console.log(Object.keys(filtros).length === 0) // true: no hay filtros
```

## `Object.values`: los valores

Devuelve un array con los **valores**:

```js playground=values
console.log(Object.values(carrito)) // [2, 1, 1]

// Total de unidades en el carrito
const unidades = Object.values(carrito).reduce((suma, cantidad) => suma + cantidad, 0)
console.log(unidades) // 4
```

## `Object.entries`: clave y valor juntos

Devuelve un array de **pares** `[clave, valor]`. Es el más útil de los tres:

```js playground=entries
console.log(Object.entries(carrito))
// [['teclado', 2], ['mouse', 1], ['monitor', 1]]

// Con destructuring, recorrerlo se lee muy bien
for (const [producto, cantidad] of Object.entries(carrito)) {
  console.log(`${producto}: ${cantidad} unidades`)
}
```

`[producto, cantidad]` es **destructuring de arrays**: saca el primer elemento del par en `producto` y el segundo en `cantidad`.

Y como es un array, puedes usar todos sus métodos:

```js playground=entries-metodos
// Solo los productos con más de una unidad
const repetidos = Object.entries(carrito)
  .filter(([, cantidad]) => cantidad > 1)
  .map(([producto]) => producto)

console.log(repetidos) // ['teclado']
```

La coma al principio de `[, cantidad]` significa "salta el primer elemento, no lo necesito".

## `Object.fromEntries`: de vuelta a objeto

Es el camino contrario a `entries`: recibe un array de pares y **construye un objeto**. Juntos te dejan "hacer `map` a un objeto":

```js playground=fromentries
const precios = { teclado: 120, mouse: 45, monitor: 650 }

// Aplicar un 10 % de descuento a todos los precios
const conDescuento = Object.fromEntries(
  Object.entries(precios).map(([producto, precio]) => [producto, precio * 0.9])
)

console.log(conDescuento) // { teclado: 108, mouse: 40.5, monitor: 585 }
```

El patrón completo es: **objeto → `entries` → métodos de array → `fromEntries` → objeto**.

Otro ejemplo: quitar las propiedades vacías de un formulario antes de enviarlo:

```js playground=limpiar
const formulario = { nombre: 'Ana', email: 'ana@correo.com', telefono: '', empresa: '' }

const limpio = Object.fromEntries(
  Object.entries(formulario).filter(([, valor]) => valor !== '')
)

console.log(limpio) // { nombre: 'Ana', email: 'ana@correo.com' }
```

## Un caso real: datos de un formulario

`fromEntries` combina genial con `FormData`, que lee todos los campos de un formulario:

```html playground=formdata
<form id="registro">
  <input name="nombre" value="Ana">
  <input name="email" value="ana@correo.com">
  <select name="plan">
    <option>Gratis</option>
    <option selected>Pro</option>
  </select>
  <button>Enviar</button>
</form>
```

```js playground=formdata
document.querySelector('#registro').addEventListener('submit', (evento) => {
  evento.preventDefault()

  const datos = Object.fromEntries(new FormData(evento.target))
  console.log(datos) // { nombre: 'Ana', email: 'ana@correo.com', plan: 'Pro' }
})
```

Una línea, y tienes un objeto listo para enviar con `fetch`. Cada campo necesita su atributo `name`.

## ¿Y `for...in`?

Verás este bucle en código antiguo:

```js
for (const clave in carrito) {
  console.log(clave, carrito[clave])
}
```

Funciona, pero tiene trampas (recorre también propiedades heredadas en algunos casos). Hoy se prefiere `Object.entries` con `for...of`, que además te da la clave y el valor a la vez.

## Chuleta

| Método | Devuelve | Ejemplo con `{ a: 1, b: 2 }` |
| --- | --- | --- |
| `Object.keys(obj)` | Array de claves | `['a', 'b']` |
| `Object.values(obj)` | Array de valores | `[1, 2]` |
| `Object.entries(obj)` | Array de pares | `[['a', 1], ['b', 2]]` |
| `Object.fromEntries(pares)` | Un objeto | `{ a: 1, b: 2 }` |

## Tu turno

```js playground=ejercicio
const notas = {
  matematicas: 15,
  lenguaje: 9,
  historia: 18,
  ciencias: 10
}

// 1. ¿Cuántos cursos hay?

// 2. ¿Cuál es el promedio de las notas?

// 3. Muestra un array con los cursos aprobados (nota >= 11)

// 4. Crea un objeto nuevo con las mismas claves, pero con 'Aprobado' o 'Desaprobado' como valor
```

## Errores comunes

- **Intentar usar `map` o `filter` directamente en un objeto.** Conviértelo primero con `Object.entries`.
- **Usar `objeto.length`.** Los objetos no tienen `length`. Usa `Object.keys(objeto).length`.
- **Olvidar que las claves siempre son textos.** En `{ 1: 'uno' }`, `Object.keys` devuelve `['1']`, no `[1]`.
- **Comprobar si un objeto está vacío con `if (objeto)`.** `{}` es truthy. Usa `Object.keys(objeto).length === 0`.

## Para profundizar

- [`Object.entries` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
- [`Object.fromEntries` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)

En resumen: **`Object.keys`** te da las claves, **`Object.values`** los valores y **`Object.entries`** los pares. Con ellos conviertes un objeto en array para usar **`map`, `filter` y `reduce`**, y con **`Object.fromEntries`** lo vuelves a convertir en objeto.
