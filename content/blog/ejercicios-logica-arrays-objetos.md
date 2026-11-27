---
title: '5 ejercicios con arrays y objetos (con solución oculta)'
description: 'Eliminar duplicados, contar palabras, agrupar por categoría y más. Los ejercicios que de verdad vas a usar en tu trabajo diario.'
date: 2026-11-27
series: ejercicios
tags: [JavaScript, Lógica, Ejercicios, Arrays]
draft: false
---

Si en el día a día como frontend hay algo que vas a hacer **siempre**, es transformar datos: una lista que llega de una API y que tienes que filtrar, contar o agrupar antes de mostrarla.

Estos cinco ejercicios son exactamente eso. Intenta cada uno antes de abrir la solución.

## Cómo comprobar tus soluciones

Cada ejemplo trae la función `probar`, que muestra ✅ o ❌ en la consola del playground:

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

## 1. Eliminar duplicados

Escribe `sinDuplicados(lista)`, que devuelva un array nuevo sin elementos repetidos, en el orden en que aparecieron.

```js playground=duplicados
function sinDuplicados(lista) {
  // tu código aquí
}

probar('números', sinDuplicados([1, 2, 2, 3, 1]), [1, 2, 3])
probar('textos', sinDuplicados(['a', 'b', 'a']), ['a', 'b'])
probar('vacío', sinDuplicados([]), [])
```

<!-- solucion -->

```js playground=duplicados-solucion
function sinDuplicados(lista) {
  return [...new Set(lista)]
}

probar('números', sinDuplicados([1, 2, 2, 3, 1]), [1, 2, 3])
probar('textos', sinDuplicados(['a', 'b', 'a']), ['a', 'b'])
probar('vacío', sinDuplicados([]), [])
```

Un **`Set`** es una colección que, por definición, no admite repetidos. Metes la lista dentro y los duplicados desaparecen. Luego, con el *spread* `[...]`, lo vuelves a convertir en array.

Si en la entrevista te piden hacerlo "a mano":

```js
function sinDuplicados(lista) {
  const resultado = []
  for (const item of lista) {
    if (!resultado.includes(item)) resultado.push(item)
  }
  return resultado
}
```

<!-- /solucion -->

## 2. Contar palabras

Escribe `contarPalabras(texto)`, que devuelva un objeto con cuántas veces aparece cada palabra (en minúsculas).

```js playground=contar
function contarPalabras(texto) {
  // tu código aquí
}

probar('repetidas', contarPalabras('el gato y el perro'), { el: 2, gato: 1, y: 1, perro: 1 })
probar('mayúsculas', contarPalabras('Hola hola'), { hola: 2 })
```

<!-- solucion: Ver una pista -->

Usa un objeto vacío como "libreta de apuntes". Para cada palabra: si ya está en la libreta, súmale 1; si no, apúntala con un 1.

<!-- /solucion -->

<!-- solucion -->

```js playground=contar-solucion
function contarPalabras(texto) {
  const cuenta = {}

  for (const palabra of texto.toLowerCase().split(' ')) {
    cuenta[palabra] = (cuenta[palabra] ?? 0) + 1
  }

  return cuenta
}

probar('repetidas', contarPalabras('el gato y el perro'), { el: 2, gato: 1, y: 1, perro: 1 })
probar('mayúsculas', contarPalabras('Hola hola'), { hola: 2 })
```

La línea clave es `(cuenta[palabra] ?? 0) + 1`. La primera vez, `cuenta['gato']` es `undefined`, y `?? 0` lo convierte en `0`. Las siguientes, ya tiene un número y le suma uno.

Este patrón de "contar con un objeto" aparece en muchísimos ejercicios. Apréndetelo.

<!-- /solucion -->

## 3. Agrupar por categoría

Tienes una lista de productos. Escribe `agruparPor(productos, campo)`, que devuelva un objeto donde cada clave es un valor de ese campo y cada valor es la lista de nombres.

```js playground=agrupar
const productos = [
  { nombre: 'Manzana', categoria: 'fruta' },
  { nombre: 'Lechuga', categoria: 'verdura' },
  { nombre: 'Pera', categoria: 'fruta' }
]

function agruparPor(lista, campo) {
  // tu código aquí
}

probar('por categoría', agruparPor(productos, 'categoria'), {
  fruta: ['Manzana', 'Pera'],
  verdura: ['Lechuga']
})
```

<!-- solucion -->

```js playground=agrupar-solucion
const productos = [
  { nombre: 'Manzana', categoria: 'fruta' },
  { nombre: 'Lechuga', categoria: 'verdura' },
  { nombre: 'Pera', categoria: 'fruta' }
]

function agruparPor(lista, campo) {
  const grupos = {}

  for (const item of lista) {
    const clave = item[campo]
    if (!grupos[clave]) grupos[clave] = []
    grupos[clave].push(item.nombre)
  }

  return grupos
}

probar('por categoría', agruparPor(productos, 'categoria'), {
  fruta: ['Manzana', 'Pera'],
  verdura: ['Lechuga']
})
```

Es el mismo patrón que contar palabras, pero en vez de sumar 1, **empujas al array** del grupo. Primero te aseguras de que el array existe; luego le añades el elemento.

`item[campo]` (con corchetes) permite leer una propiedad cuyo nombre está en una variable. `item.campo` buscaría literalmente una propiedad llamada "campo".

<!-- /solucion -->

## 4. El segundo mayor

Escribe `segundoMayor(numeros)`, que devuelva el segundo número más grande **distinto** del mayor. Si no existe, devuelve `null`.

```js playground=segundo
function segundoMayor(numeros) {
  // tu código aquí
}

probar('normal', segundoMayor([4, 9, 7, 1]), 7)
probar('mayor repetido', segundoMayor([9, 9, 5]), 5)
probar('todos iguales', segundoMayor([3, 3, 3]), null)
```

<!-- solucion -->

```js playground=segundo-solucion
function segundoMayor(numeros) {
  const unicos = [...new Set(numeros)].sort((a, b) => b - a)
  return unicos[1] ?? null
}

probar('normal', segundoMayor([4, 9, 7, 1]), 7)
probar('mayor repetido', segundoMayor([9, 9, 5]), 5)
probar('todos iguales', segundoMayor([3, 3, 3]), null)
```

Tres pasos que ya conoces: quitar duplicados (ejercicio 1), ordenar de mayor a menor y coger la posición `1`. Si no hay posición `1`, `?? null`.

**Cuidado con `sort()` sin función**: ordena como si fueran textos, así que `[10, 9, 1].sort()` da `[1, 10, 9]`. Con números, pasa siempre `(a, b) => a - b` (menor a mayor) o `(a, b) => b - a` (mayor a menor).

<!-- /solucion -->

## 5. Elementos en común

Escribe `enComun(a, b)`, que devuelva los elementos que están en los dos arrays, sin repetir.

```js playground=comun
function enComun(a, b) {
  // tu código aquí
}

probar('algunos', enComun([1, 2, 3, 4], [3, 4, 5]), [3, 4])
probar('ninguno', enComun([1, 2], [3, 4]), [])
probar('con repetidos', enComun([1, 1, 2], [1, 1]), [1])
```

<!-- solucion -->

```js playground=comun-solucion
function enComun(a, b) {
  const enB = new Set(b)
  return [...new Set(a)].filter(item => enB.has(item))
}

probar('algunos', enComun([1, 2, 3, 4], [3, 4, 5]), [3, 4])
probar('ninguno', enComun([1, 2], [3, 4]), [])
probar('con repetidos', enComun([1, 1, 2], [1, 1]), [1])
```

Filtras `a` y te quedas con lo que también está en `b`. Podrías usar `b.includes(item)`, pero `Set.has()` es mucho más rápido cuando las listas son grandes: `includes` recorre el array entero cada vez, `has` va directo.

Mencionar esto en una entrevista suma puntos: demuestra que piensas en **rendimiento**, no solo en que funcione.

<!-- /solucion -->

## Qué entrenaste

- **`Set`** para quitar duplicados y buscar rápido.
- El patrón de **contar** y **agrupar** con un objeto.
- Leer propiedades dinámicas con **`objeto[variable]`**.
- **`sort`** con números (y su trampa).
- Combinar pasos pequeños para resolver uno grande.
