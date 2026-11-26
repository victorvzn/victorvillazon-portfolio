---
title: '?. y ??: adiós al "Cannot read properties of undefined"'
description: 'El optional chaining (?.) lee datos que podrían no existir sin romper tu app, y el operador ?? pone valores por defecto mejor que ||. Con datos reales de una API.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ES6, Fundamentos]
draft: true
---

Si has trabajado con datos de una API, seguro que te has encontrado con este error:

```
TypeError: Cannot read properties of undefined (reading 'ciudad')
```

Pasa cuando intentas leer una propiedad de algo que **no existe**. Por ejemplo, un usuario que todavía no ha rellenado su dirección. Dos operadores modernos lo resuelven en una línea: **`?.`** y **`??`**.

## El problema

```js playground=problema
const usuario = {
  nombre: 'Ana',
  direccion: null // todavía no la ha rellenado
}

console.log(usuario.nombre)           // 'Ana'
console.log(usuario.direccion.ciudad) // 💥 TypeError
```

`usuario.direccion` es `null`, y no se puede leer `.ciudad` de `null`. La app se rompe.

La solución antigua era comprobar cada nivel a mano:

```js
const ciudad = usuario.direccion && usuario.direccion.ciudad
```

Funciona, pero con tres o cuatro niveles se vuelve ilegible.

## ?.: el optional chaining

Con **`?.`** le dices a JavaScript: "si lo de la izquierda es `null` o `undefined`, para aquí y devuelve `undefined`; si existe, sigue":

```js playground=optional
const usuario = {
  nombre: 'Ana',
  direccion: null,
  redes: { github: 'ana-dev' }
}

console.log(usuario.direccion?.ciudad)  // undefined, sin error
console.log(usuario.redes?.github)      // 'ana-dev'
console.log(usuario.redes?.twitter)     // undefined
console.log(usuario.pedidos?.length)    // undefined

const otro = null
console.log(otro?.nombre)               // undefined: ni siquiera existe el usuario
```

Se llama **optional chaining** (encadenamiento opcional): cada `?.` es un punto que puede "fallar" sin romper nada.

## ?. con arrays y funciones

También funciona con corchetes y con llamadas a funciones:

```js playground=formas
const respuesta = {
  resultados: [{ titulo: 'Primer post' }]
}

// Con corchetes: arrays o claves dinámicas
console.log(respuesta.resultados?.[0]?.titulo) // 'Primer post'
console.log(respuesta.comentarios?.[0])        // undefined

// Con funciones: llámala solo si existe
const config = {
  alTerminar: () => console.log('Terminado ✅')
}

config.alTerminar?.()  // 'Terminado ✅'
config.alEmpezar?.()   // no existe: no hace nada, sin error
```

`funcion?.()` es muy útil para *callbacks* opcionales: "si me pasaron una función, la llamo".

## ??: el valor por defecto

`?.` evita el error, pero te deja un `undefined`. Normalmente quieres mostrar **algo** en su lugar: "Sin ciudad", "0", "Anónimo". Para eso está **`??`** (el operador *nullish coalescing*):

```js playground=nullish
const usuario = { nombre: 'Ana', direccion: null }

const ciudad = usuario.direccion?.ciudad ?? 'Ciudad no indicada'
console.log(ciudad) // 'Ciudad no indicada'

const apodo = usuario.apodo ?? usuario.nombre
console.log(apodo)  // 'Ana'
```

`a ?? b` se lee: "usa `a`, pero si es `null` o `undefined`, usa `b`".

`?.` y `??` son la pareja perfecta: el primero lee sin romper y el segundo pone un valor por defecto.

## ¿?? o ||? La diferencia importa

Antes de que existiera `??`, se usaba `||` para los valores por defecto. Pero `||` tiene una trampa: salta con **cualquier** valor *falsy*, incluidos `0`, `''` y `false`, que muchas veces **son datos válidos**:

```js playground=diferencia
const producto = { nombre: 'Polo', stock: 0, descuento: 0, descripcion: '' }

console.log(producto.stock || 'Sin datos')       // 'Sin datos' 😬 ¡el stock es 0, no "sin datos"!
console.log(producto.stock ?? 'Sin datos')       // 0 ✅

console.log(producto.descuento || 10)            // 10 😬 le pusimos un descuento que no tiene
console.log(producto.descuento ?? 10)            // 0 ✅

console.log(producto.descripcion || 'Sin descripción') // 'Sin descripción'
console.log(producto.descripcion ?? 'Sin descripción') // '' (texto vacío)
```

| Valor de `a` | `a \|\| 'otro'` | `a ?? 'otro'` |
| --- | --- | --- |
| `null` | `'otro'` | `'otro'` |
| `undefined` | `'otro'` | `'otro'` |
| `0` | `'otro'` | `0` |
| `''` | `'otro'` | `''` |
| `false` | `'otro'` | `false` |

Regla práctica: **usa `??` para valores por defecto**. Usa `||` solo cuando de verdad quieras que `0` o `''` también se reemplacen (por ejemplo, un nombre vacío que debe mostrarse como "Anónimo").

## ??=: asignar solo si está vacío

Hay una versión con `=` que asigna un valor **solo si la variable es `null` o `undefined`**:

```js playground=asignacion
const opciones = { tema: 'oscuro' }

opciones.tema ??= 'claro'   // ya tenía valor: no cambia
opciones.idioma ??= 'es'    // no existía: se asigna

console.log(opciones) // { tema: 'oscuro', idioma: 'es' }
```

Es perfecta para rellenar opciones por defecto o para el patrón de contar (`cuenta[letra] ??= 0`).

## Un ejemplo con datos reales

Las APIs suelen devolver datos incompletos. Con `?.` y `??` los muestras sin miedo:

```js playground=api
const comentarios = [
  { autor: { nombre: 'Ana', avatar: 'ana.png' }, texto: '¡Muy útil!', likes: 12 },
  { autor: null, texto: 'Gracias por el post', likes: 0 },
  { autor: { nombre: 'Luis' }, texto: 'Me sirvió para mi proyecto' }
]

for (const comentario of comentarios) {
  const nombre = comentario.autor?.nombre ?? 'Anónimo'
  const avatar = comentario.autor?.avatar ?? 'avatar-por-defecto.png'
  const likes = comentario.likes ?? 0

  console.log(`${nombre} (${avatar}): "${comentario.texto}" · ${likes} ❤️`)
}
```

Sin `?.`, el segundo comentario rompería todo el bucle. Sin `??`, el primero mostraría "undefined" donde falta un avatar.

## Errores comunes

- **Llenar todo de `?.`.** Si un dato **siempre** tiene que existir, no le pongas `?.`: si falta, es mejor que el error salte y te enteres del bug. Úsalo solo donde un dato puede faltar de verdad.
- **Usar `||` con números.** Un `0` válido se convierte en el valor por defecto.
- **Usar `?.` para asignar.** `usuario?.nombre = 'Ana'` es un error de sintaxis: `?.` solo sirve para **leer**.
- **Mezclar `??` con `||` o `&&` sin paréntesis.** `a || b ?? c` es un error de sintaxis; escribe `(a || b) ?? c`.

## Para profundizar

- [Encadenamiento opcional (`?.`) en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [Operador de coalescencia nula (`??`) en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

En resumen: **`?.`** lee propiedades, posiciones o funciones que podrían no existir, sin romper; **`??`** pone un valor por defecto **solo** si algo es `null` o `undefined` (a diferencia de `||`, respeta el `0` y el texto vacío); y **`??=`** asigna solo si falta.
