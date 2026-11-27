---
title: 'Ordenar arrays con sort: números, textos con tildes y objetos'
description: 'Por qué [10, 9, 1].sort() da [1, 10, 9], cómo funciona la función de comparación, ordenar textos en español con localeCompare y ordenar objetos por varias propiedades.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Arrays]
draft: true
---

Ordenar productos por precio, una lista de alumnos por apellido, las tareas por fecha... `sort` es uno de los métodos más usados. Y también uno de los que más sorprenden la primera vez:

```js playground=sorpresa
const precios = [10, 9, 1, 100, 25]
console.log(precios.sort()) // [1, 10, 100, 25, 9] 🤨
```

¿10 antes que 9? Vamos a ver por qué y cómo hacerlo bien.

## Por qué falla: `sort` ordena como texto

Sin argumentos, `sort` **convierte cada elemento en texto** y los ordena alfabéticamente, carácter a carácter. Y en un diccionario, `"10"` va antes que `"9"` porque `"1"` va antes que `"9"`. Igual que "casa" va antes que "perro" aunque tenga más letras.

Para ordenar bien, tienes que decirle a `sort` **cómo comparar**.

## La función de comparación

Le pasas a `sort` una función que recibe **dos elementos** (`a` y `b`) y devuelve un número:

| Devuelve | Significa |
| --- | --- |
| Un número **negativo** | `a` va **antes** que `b` |
| Un número **positivo** | `a` va **después** que `b` |
| `0` | Da igual, se quedan como están |

Para números hay un truco: **restarlos**.

```js playground=numeros
const precios = [10, 9, 1, 100, 25]

const ascendente = [...precios].sort((a, b) => a - b)
console.log(ascendente) // [1, 9, 10, 25, 100]

const descendente = [...precios].sort((a, b) => b - a)
console.log(descendente) // [100, 25, 10, 9, 1]
```

¿Por qué funciona `a - b`? Si `a` es 1 y `b` es 9, da `-8` (negativo): el 1 va antes. Si `a` es 100 y `b` es 25, da `75` (positivo): el 100 va después. Para invertir el orden, `b - a`.

## ⚠️ `sort` modifica el array original

`sort` no devuelve un array nuevo: **reordena el mismo** array. Eso puede darte bugs si el array original se usa en otro sitio:

```js playground=muta
const original = [3, 1, 2]
const ordenado = original.sort((a, b) => a - b)

console.log(ordenado) // [1, 2, 3]
console.log(original) // [1, 2, 3] 😱 el original también cambió
```

Por eso en los ejemplos copiamos primero con `[...precios]`. Hoy existe una alternativa mejor: **`toSorted()`**, que hace lo mismo pero **devuelve un array nuevo** sin tocar el original (lo vimos en el post de arrays sin mutar):

```js playground=tosorted
const original = [3, 1, 2]
const ordenado = original.toSorted((a, b) => a - b)

console.log(ordenado) // [1, 2, 3]
console.log(original) // [3, 1, 2] ✅
```

## Ordenar textos: `localeCompare`

Para textos, `sort()` sin argumentos parece funcionar... hasta que aparecen mayúsculas o tildes:

```js playground=textos-mal
const nombres = ['álvaro', 'Beatriz', 'ana', 'Óscar', 'carlos']
console.log(nombres.toSorted())
// ['Beatriz', 'ana', 'carlos', 'Óscar', 'álvaro'] ❌
```

Las mayúsculas van antes que las minúsculas, y las letras con tilde van al final de todo. El orden real de las letras en el ordenador no coincide con el del diccionario.

La solución es **`localeCompare`**, que compara textos **según las reglas de un idioma**:

```js playground=textos-bien
const nombres = ['álvaro', 'Beatriz', 'ana', 'Óscar', 'carlos', 'ñandú', 'nube']

const ordenados = nombres.toSorted((a, b) => a.localeCompare(b, 'es'))
console.log(ordenados)
// ['álvaro', 'ana', 'Beatriz', 'carlos', 'nube', 'ñandú', 'Óscar'] ✅
```

`a.localeCompare(b, 'es')` devuelve un número negativo, positivo o cero, justo lo que necesita `sort`. Y conoce las reglas del español: la `ñ` va después de la `n` y las tildes no mandan las palabras al final.

Un extra muy útil: con la opción `numeric`, ordena bien los textos que llevan números:

```js playground=numeric
const archivos = ['foto10.jpg', 'foto2.jpg', 'foto1.jpg']

console.log(archivos.toSorted())
// ['foto1.jpg', 'foto10.jpg', 'foto2.jpg'] ❌

console.log(archivos.toSorted((a, b) => a.localeCompare(b, 'es', { numeric: true })))
// ['foto1.jpg', 'foto2.jpg', 'foto10.jpg'] ✅
```

## Ordenar objetos por una propiedad

Lo más habitual en una app: ordenar una lista de objetos. Comparas **la propiedad** que te interesa:

```js playground-setup
const productos = [
  { nombre: 'Teclado', precio: 120, categoria: 'periféricos' },
  { nombre: 'Monitor', precio: 650, categoria: 'pantallas' },
  { nombre: 'Mouse', precio: 45, categoria: 'periféricos' },
  { nombre: 'Audífonos', precio: 90, categoria: 'audio' },
  { nombre: 'Alfombrilla', precio: 45, categoria: 'periféricos' }
]
```

```js playground=objetos
const porPrecio = productos.toSorted((a, b) => a.precio - b.precio)
console.table(porPrecio)

const porNombre = productos.toSorted((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
console.table(porNombre)
```

`console.table` muestra arrays de objetos como una tabla. Muy cómodo para comprobar el orden.

## Ordenar por varias propiedades

¿Y si dos productos cuestan lo mismo? Puedes desempatar con una segunda propiedad. El truco es usar `||`: si la primera comparación da `0` (empate), se usa la segunda:

```js playground=varias
const ordenados = productos.toSorted((a, b) =>
  a.precio - b.precio || a.nombre.localeCompare(b.nombre, 'es')
)

console.table(ordenados)
// Alfombrilla (45) y Mouse (45) empatan en precio,
// así que se ordenan por nombre
```

## Ordenar por fechas

Las fechas también se pueden restar (por dentro son números, como vimos en el post de fechas):

```js playground=fechas
const pedidos = [
  { id: 1, fecha: '2026-11-20' },
  { id: 2, fecha: '2026-11-25' },
  { id: 3, fecha: '2026-11-02' }
]

// Los más recientes primero
const recientes = pedidos.toSorted((a, b) => new Date(b.fecha) - new Date(a.fecha))
console.log(recientes.map((pedido) => pedido.id)) // [2, 1, 3]
```

## Tu turno

```js playground=ejercicio
const alumnos = [
  { nombre: 'Óscar', nota: 15 },
  { nombre: 'ana', nota: 18 },
  { nombre: 'Lucía', nota: 15 },
  { nombre: 'beatriz', nota: 11 },
  { nombre: 'Ángel', nota: 18 }
]

// 1. Ordena por nota de mayor a menor

// 2. Ordena por nombre alfabéticamente (respetando tildes y mayúsculas)

// 3. Ordena por nota de mayor a menor y, si empatan, por nombre

// 4. Comprueba que el array original no cambió
```

## Errores comunes

- **`sort()` sin función para números.** Los ordena como texto. Usa `(a, b) => a - b`.
- **Olvidar que `sort` modifica el original.** Usa `toSorted` o copia antes con `[...array]`.
- **Ordenar textos con `<` y `>`** o con `sort()` a secas. Las tildes y mayúsculas salen mal. Usa `localeCompare`.
- **Devolver `true` o `false`** en la función de comparación (`(a, b) => a > b`). Tiene que devolver un número negativo, positivo o cero.
- **Restar textos** (`a.nombre - b.nombre`). Da `NaN`. Para textos, `localeCompare`.

## Para profundizar

- [`sort` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [`toSorted` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
- [`localeCompare` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)

En resumen: pásale siempre una **función de comparación** a `sort`: **`a - b`** para números y fechas y **`a.localeCompare(b, 'es')`** para textos. Para objetos, compara la propiedad que te interesa y desempata con `||`. Y como `sort` **modifica el original**, prefiere **`toSorted`**.
