---
title: 'Objetos en JavaScript: agrupa datos con clave y valor'
description: 'Un objeto guarda en un solo lugar todo lo que describe a algo: un alumno, un producto, un pedido. Cómo crearlos, leerlos, cambiarlos y recorrerlos.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos]
draft: true
---

Un array es una lista. Pero ¿cómo guardas **todo lo que describe a una persona**: su nombre, su edad, su ciudad y si está inscrita? Podrías usar cuatro variables sueltas... o un **objeto**, que las agrupa en un solo lugar.

Piensa en una **ficha** de inscripción: cada campo tiene un nombre (la **clave**) y lo que escribiste en él (el **valor**).

## Crear un objeto

Se escribe entre llaves `{ }`, con pares `clave: valor` separados por comas:

```js playground=crear
const alumno = {
  nombre: 'Ana',
  edad: 22,
  ciudad: 'Cusco',
  inscrito: true,
  cursos: ['HTML', 'CSS']
}

console.log(alumno)
```

Los valores pueden ser de cualquier tipo: textos, números, booleanos, arrays... e incluso otros objetos.

## Leer propiedades: punto o corchetes

```js playground=leer
const producto = {
  nombre: 'Polo básico',
  precio: 35,
  'talla disponible': 'M'
}

// Notación de punto: la más común
console.log(producto.nombre)  // 'Polo básico'
console.log(producto.precio)  // 35

// Notación de corchetes: cuando la clave tiene espacios...
console.log(producto['talla disponible']) // 'M'

// ...o cuando la clave está guardada en una variable
const campo = 'precio'
console.log(producto[campo]) // 35

// Si la propiedad no existe, devuelve undefined
console.log(producto.color) // undefined
```

La notación de corchetes es la que te permite leer una propiedad "dinámica": por ejemplo, el campo que el usuario eligió en un desplegable.

## Añadir, cambiar y borrar propiedades

```js playground=modificar
const pedido = {
  cliente: 'Luis',
  total: 80
}

pedido.total = 95          // cambiar
pedido.estado = 'pagado'   // añadir (si no existe, se crea)
delete pedido.cliente      // borrar

console.log(pedido) // { total: 95, estado: 'pagado' }
```

Igual que con los arrays, un objeto declarado con `const` **sí** puede cambiar por dentro. Lo que no puedes es reemplazarlo entero.

## Objetos dentro de objetos

Los datos reales suelen tener varios niveles. Para llegar al fondo, encadenas puntos:

```js playground=anidados
const usuario = {
  nombre: 'Marta',
  direccion: {
    calle: 'Av. Los Olivos 123',
    distrito: 'Miraflores'
  },
  pedidos: [
    { id: 1, total: 50 },
    { id: 2, total: 120 }
  ]
}

console.log(usuario.direccion.distrito)  // 'Miraflores'
console.log(usuario.pedidos[1].total)    // 120
console.log(usuario.pedidos.length)      // 2
```

Así es exactamente como llegan los datos cuando los pides a una API: objetos con arrays de objetos dentro.

## Una lista de objetos

La combinación más habitual: un **array de objetos**. Cada objeto es un elemento con la misma "forma":

```js playground=lista
const alumnos = [
  { nombre: 'Ana', nota: 18 },
  { nombre: 'Luis', nota: 9 },
  { nombre: 'Marta', nota: 15 }
]

for (const alumno of alumnos) {
  const estado = alumno.nota >= 11 ? 'aprobado' : 'desaprobado'
  console.log(`${alumno.nombre}: ${alumno.nota} (${estado})`)
}
```

Una tabla en la pantalla, una lista de productos o un listado de tareas: casi siempre detrás hay un array de objetos.

## Recorrer las propiedades de un objeto

A veces quieres pasar por **todas** las claves de un objeto. Para eso están `Object.keys`, `Object.values` y `Object.entries`:

```js playground=recorrer
const notas = { html: 18, css: 15, javascript: 17 }

console.log(Object.keys(notas))    // ['html', 'css', 'javascript']
console.log(Object.values(notas))  // [18, 15, 17]

for (const [curso, nota] of Object.entries(notas)) {
  console.log(`${curso}: ${nota}`)
}
```

`Object.entries` te da pares `[clave, valor]`. El `[curso, nota]` del `for` los separa en dos variables (eso se llama *destructuring* y tiene su propio post).

## Métodos: funciones dentro de un objeto

Un objeto también puede guardar funciones. Se les llama **métodos**:

```js playground=metodos
const carrito = {
  productos: [],
  agregar(nombre) {
    this.productos.push(nombre)
  },
  cantidad() {
    return this.productos.length
  }
}

carrito.agregar('Polo')
carrito.agregar('Gorra')
console.log(carrito.cantidad()) // 2
```

`this` se refiere al propio objeto: `this.productos` es "los productos de este carrito".

## Errores comunes

- **Leer una propiedad de algo que no existe.** `usuario.direccion.distrito` falla con `Cannot read properties of undefined` si `direccion` no existe. Con `usuario.direccion?.distrito` (el `?.` se llama *optional chaining*) obtienes `undefined` en vez de un error.
- **Usar el punto con una clave en una variable.** `producto.campo` busca una propiedad llamada literalmente "campo". Usa `producto[campo]`.
- **Olvidar las comas entre propiedades.** Es el error de sintaxis más típico al escribir objetos.
- **Comparar objetos con `===`.** Dos objetos con el mismo contenido no son iguales: `{ a: 1 } === { a: 1 }` es `false`.

## Para profundizar

- [Trabajando con objetos en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Working_with_objects)

En resumen: un **objeto** agrupa datos relacionados en pares **clave: valor**. Léelos con **punto** o **corchetes**, cámbialos asignando y recórrelos con **`Object.entries`**. Y recuerda: casi todo lo que llega de una API es un **array de objetos**.
