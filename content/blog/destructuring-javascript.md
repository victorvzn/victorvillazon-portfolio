---
title: 'Destructuring: saca datos de objetos y arrays como un pro'
description: 'Deja de escribir usuario.nombre, usuario.email, usuario.edad. Con destructuring lo haces en una línea.'
date: 2026-11-25
series: javascript
tags: [JavaScript, ES6]
draft: true
order: 3
---

Si alguna vez escribiste algo así, este post es para ti:

```js
const nombre = usuario.nombre
const email = usuario.email
const ciudad = usuario.ciudad
```

Con **destructuring** (desestructuración) haces lo mismo en una sola línea. Y en React lo vas a ver en todos lados.

Estos son los datos de los ejemplos:

```js playground-setup
const usuario = {
  nombre: 'Ana',
  email: 'ana@ejemplo.com',
  ciudad: 'Lima',
  redes: { github: 'ana-dev' }
}
```

## Destructuring de objetos

Pones llaves `{}` del lado izquierdo con los nombres de las propiedades que quieres sacar:

```js playground=objetos
const { nombre, email } = usuario

console.log(nombre) // 'Ana'
console.log(email)  // 'ana@ejemplo.com'
```

El nombre de la variable **tiene que coincidir** con el de la propiedad. Si pides algo que no existe, te da `undefined`.

## Renombrar y valores por defecto

¿Quieres otro nombre? Usa `:`. ¿Quieres un valor por si no existe? Usa `=`.

```js playground=renombrar
const { nombre: nombreUsuario, pais = 'Perú' } = usuario

console.log(nombreUsuario) // 'Ana'
console.log(pais)          // 'Perú' (no existía, usa el valor por defecto)

// También puedes entrar en objetos anidados
const { redes: { github } } = usuario
console.log(github) // 'ana-dev'
```

## Destructuring de arrays

Con arrays usas corchetes `[]` y lo que importa es la **posición**, no el nombre:

```js playground=arrays
const podio = ['Ana', 'Luis', 'Sofía', 'Pedro']

const [primero, segundo] = podio
console.log(primero, segundo) // 'Ana' 'Luis'

// Saltar posiciones con una coma
const [, , tercero] = podio
console.log(tercero) // 'Sofía'

// Truco: intercambiar dos variables sin una variable temporal
let a = 1
let b = 2;
[a, b] = [b, a]
console.log(a, b) // 2 1
```

Si ya usaste `useState` en React, esto te suena: `const [contador, setContador] = useState(0)` es destructuring de un array.

## En los parámetros de una función

Aquí es donde más brilla. En vez de recibir el objeto entero y sacar cosas adentro, las sacas directo en los paréntesis:

```js playground=funciones
// Sin destructuring
function saludar(persona) {
  return `Hola ${persona.nombre} de ${persona.ciudad}`
}

// Con destructuring
function saludarMejor({ nombre, ciudad }) {
  return `Hola ${nombre} de ${ciudad}`
}

console.log(saludarMejor(usuario)) // 'Hola Ana de Lima'
```

Así se reciben las *props* en un componente de React: `function Tarjeta({ titulo, precio }) { ... }`.

## Errores comunes

- **Destructurar `undefined` o `null`.** `const { nombre } = undefined` lanza un error. Asegúrate de que el objeto exista.
- **Olvidar que en arrays manda el orden.** `const [segundo, primero] = podio` no los reordena: solo les cambia el nombre.
- **El punto y coma antes de `[a, b] = [b, a]`.** Si la línea anterior no termina en `;`, JavaScript puede unirlas. Por eso lo puse en el ejemplo.

## Para profundizar

- [Desestructuración en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

En resumen: **`{}`** saca propiedades de un objeto por nombre, **`[]`** saca elementos de un array por posición, y en los parámetros de una función te ahorra un montón de código.
