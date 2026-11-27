---
title: 'Funciones puras e inmutabilidad: código que no te da sorpresas'
description: 'Qué es una función pura, qué son los efectos secundarios y por qué no modificar los datos hace tu código más fácil de probar, de depurar y de usar en React.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Funciones, Buenas prácticas]
draft: true
---

¿Alguna vez una función te ha devuelto un resultado distinto con los mismos datos? ¿O has llamado a una función para calcular algo y, de paso, te ha cambiado un array que usabas en otro sitio? Son dos de los bugs más difíciles de encontrar, y los dos se evitan con dos ideas: **funciones puras** e **inmutabilidad**.

## ¿Qué es una función pura?

Una función es **pura** si cumple dos reglas:

1. **Con los mismos datos de entrada, devuelve siempre el mismo resultado.**
2. **No tiene efectos secundarios**: no cambia nada fuera de ella.

```js playground=pura
// ✅ Pura: solo depende de sus parámetros y solo devuelve un valor
function calcularTotal(precio, cantidad) {
  return precio * cantidad
}

console.log(calcularTotal(10, 3)) // 30
console.log(calcularTotal(10, 3)) // 30, siempre
```

Es como una función matemática: `2 + 2` es `4` hoy, mañana y siempre.

## Lo que hace que una función NO sea pura

### Depender de algo de fuera que puede cambiar

```js playground=impura-externa
let descuento = 0.1

// ❌ Impura: el resultado depende de una variable global
function precioFinal(precio) {
  return precio * (1 - descuento)
}

console.log(precioFinal(100)) // 90
descuento = 0.5
console.log(precioFinal(100)) // 50: mismos datos, distinto resultado
```

La solución: pasa todo lo que necesita **como parámetro**.

```js playground=pura-parametro
// ✅ Pura
function precioFinal(precio, descuento) {
  return precio * (1 - descuento)
}

console.log(precioFinal(100, 0.1)) // 90, siempre
```

### Modificar los datos que recibe

```js playground=impura-muta
// ❌ Impura: modifica el array que le pasan
function agregarProducto(carrito, producto) {
  carrito.push(producto)
  return carrito
}

const miCarrito = ['Teclado']
const nuevoCarrito = agregarProducto(miCarrito, 'Mouse')

console.log(miCarrito) // ['Teclado', 'Mouse'] 😱 el original cambió
console.log(miCarrito === nuevoCarrito) // true: es el mismo array
```

Recuerda el post de copiar objetos: los arrays y objetos se pasan **por referencia**. Si la función los modifica, modifica el original.

### Otros efectos secundarios

Hacer `console.log`, cambiar el DOM, guardar en `localStorage`, hacer un `fetch` o usar `Math.random()` y `Date.now()` también son efectos secundarios o hacen que el resultado cambie.

**Esto no significa que sean malos.** Una aplicación sin efectos secundarios no serviría para nada: tiene que pintar la pantalla y guardar datos. La idea es **separarlos**: mantener la lógica en funciones puras y dejar los efectos en unos pocos sitios bien localizados.

## La inmutabilidad: no modificar, crear uno nuevo

**Inmutable** significa "que no cambia". En la práctica: en vez de **modificar** un array u objeto, creas **uno nuevo** con el cambio.

```js playground=inmutable
// ✅ Pura e inmutable: devuelve un array nuevo
function agregarProducto(carrito, producto) {
  return [...carrito, producto]
}

const miCarrito = ['Teclado']
const nuevoCarrito = agregarProducto(miCarrito, 'Mouse')

console.log(miCarrito)    // ['Teclado'] ✅ intacto
console.log(nuevoCarrito) // ['Teclado', 'Mouse']
```

La chuleta de operaciones inmutables:

| Operación | ❌ Muta el original | ✅ Crea uno nuevo |
| --- | --- | --- |
| Añadir al final | `array.push(x)` | `[...array, x]` |
| Añadir al principio | `array.unshift(x)` | `[x, ...array]` |
| Quitar | `array.splice(i, 1)` | `array.filter(...)` o `array.toSpliced(i, 1)` |
| Cambiar un elemento | `array[i] = x` | `array.map(...)` o `array.with(i, x)` |
| Ordenar | `array.sort()` | `array.toSorted()` |
| Invertir | `array.reverse()` | `array.toReversed()` |
| Cambiar una propiedad | `obj.nombre = 'Ana'` | `{ ...obj, nombre: 'Ana' }` |
| Quitar una propiedad | `delete obj.clave` | `const { clave, ...resto } = obj` |

`toSorted`, `toReversed`, `toSpliced` y `with` son los métodos modernos que vimos en el post de arrays sin mutar.

## Un ejemplo completo: el carrito

```js playground=carrito
// Lógica pura: fácil de leer y de probar
const agregar = (carrito, producto) => {
  const existente = carrito.find((item) => item.id === producto.id)
  if (existente) {
    return carrito.map((item) =>
      item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
    )
  }
  return [...carrito, { ...producto, cantidad: 1 }]
}

const quitar = (carrito, id) => carrito.filter((item) => item.id !== id)

const total = (carrito) => carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0)

// Usándolas
const teclado = { id: 1, nombre: 'Teclado', precio: 120 }
const mouse = { id: 2, nombre: 'Mouse', precio: 45 }

const paso1 = agregar([], teclado)
const paso2 = agregar(paso1, mouse)
const paso3 = agregar(paso2, teclado)
const paso4 = quitar(paso3, 2)

console.log(paso3) // teclado ×2, mouse ×1
console.log(total(paso3)) // 285
console.log(paso4) // solo el teclado ×2
console.log(paso1) // sigue con un solo teclado: ningún paso modificó el anterior
```

Fíjate en que **cada paso se conserva**. Eso permite cosas muy útiles, como un botón de **deshacer**: basta con volver al estado anterior, porque sigue intacto.

## Por qué vale la pena

1. **Fáciles de probar.** Le das unos datos y compruebas el resultado. No hace falta preparar variables globales ni el DOM.
2. **Fáciles de entender.** Para saber qué hace una función, solo miras sus parámetros y su `return`.
3. **Sin sorpresas.** Ninguna función cambia tus datos a escondidas.
4. **Imprescindible en React.** React detecta los cambios comparando si el estado es **un objeto nuevo**. Si lo modificas, no se entera y no repinta (lo vimos en el post de `useState`).

## La estructura ideal

Separa tu código en dos capas:

```js
// 🧠 Lógica pura: calcula, transforma y decide
const filtrarDisponibles = (productos) => productos.filter((producto) => producto.stock > 0)
const formatearPrecio = (precio) => `S/ ${precio.toFixed(2)}`

// 🔌 Efectos: lee, pinta, guarda (en pocos sitios y bien localizados)
async function iniciar() {
  const respuesta = await fetch('/api/productos')        // efecto
  const productos = await respuesta.json()
  const disponibles = filtrarDisponibles(productos)       // puro
  pintar(disponibles.map((p) => formatearPrecio(p.precio))) // efecto
}
```

## Tu turno

Estas funciones tienen problemas. Conviértelas en funciones puras e inmutables:

```js playground=ejercicio
let tasaIva = 0.18

function precioConIva(precio) {
  return precio * (1 + tasaIva)
}

function marcarComoLeido(mensajes, id) {
  const mensaje = mensajes.find((m) => m.id === id)
  mensaje.leido = true
  return mensajes
}

function ordenarPorFecha(publicaciones) {
  return publicaciones.sort((a, b) => b.fecha - a.fecha)
}

// Prueba que tus versiones no modifican los datos originales
const mensajes = [{ id: 1, leido: false }, { id: 2, leido: false }]
const actualizados = marcarComoLeido(mensajes, 1)
console.log(mensajes[0].leido) // debería ser false
console.log(actualizados[0].leido) // debería ser true
```

## Errores comunes

- **Usar variables globales dentro de una función.** Pásalas como parámetros.
- **Modificar los parámetros** (`push`, `sort`, `obj.x = ...`). Devuelve copias nuevas.
- **Creer que `const` hace un array inmutable.** `const` impide **reasignar** la variable, pero puedes seguir haciendo `push`. Son cosas distintas.
- **Obsesionarse con que todo sea puro.** Los efectos son necesarios. Solo sepáralos de la lógica.
- **Copiar en profundidad para cada cambio pequeño.** Basta con copiar lo que cambia (spread en el nivel que tocas).

## Para profundizar

- [Mantener los componentes puros (documentación de React)](https://es.react.dev/learn/keeping-components-pure)
- [Métodos que copian vs métodos que mutan en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array#m%C3%A9todos_de_copia_y_m%C3%A9todos_de_mutaci%C3%B3n)

En resumen: una **función pura** siempre devuelve lo mismo con los mismos datos y **no cambia nada de fuera**. La **inmutabilidad** consiste en **crear datos nuevos** en vez de modificar los existentes, con spread, `map`, `filter` y los métodos `to...`. Pon la **lógica en funciones puras** y deja los **efectos** (DOM, `fetch`, `localStorage`) en pocos sitios: tu código será más fácil de probar, de depurar y de llevar a React.
