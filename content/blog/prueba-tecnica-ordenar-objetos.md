---
title: 'Prueba técnica: ordena una lista de productos por varios campos'
description: 'Ordenar por precio, por nombre con tildes y por dos criterios a la vez. Un ejercicio muy de trabajo real para dominar sort, toSorted y localeCompare.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Arrays]
draft: true
---

Ordenar una tabla por precio, una lista de alumnos por apellido o unos resultados por fecha: lo vas a hacer en cualquier trabajo. Por eso es tan común en las pruebas técnicas, y tiene más trampas de las que parece.

Tiempo recomendado: **25 minutos**.

## El enunciado

> Tienes esta lista de productos. Escribe tres funciones que devuelvan **una lista nueva** ordenada, **sin modificar la original**:
>
> 1. `porPrecio(productos)`: del más barato al más caro.
> 2. `porNombre(productos)`: alfabéticamente, respetando tildes y la ñ.
> 3. `porCategoriaYPrecio(productos)`: por categoría (A→Z) y, dentro de cada categoría, del más caro al más barato.

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}

const productos = [
  { nombre: 'Ñoquis', categoria: 'pasta', precio: 12 },
  { nombre: 'arroz', categoria: 'granos', precio: 5 },
  { nombre: 'Café', categoria: 'bebidas', precio: 25 },
  { nombre: 'Agua', categoria: 'bebidas', precio: 2 },
  { nombre: 'Espaguetis', categoria: 'pasta', precio: 8 },
  { nombre: 'Lentejas', categoria: 'granos', precio: 7 }
]

const nombres = (lista) => lista?.map(p => p.nombre)
```

```js playground=reto
function porPrecio(lista) {
  // tu código aquí
}

function porNombre(lista) {
  // tu código aquí
}

function porCategoriaYPrecio(lista) {
  // tu código aquí
}

probar('por precio', nombres(porPrecio(productos)), ['Agua', 'arroz', 'Lentejas', 'Espaguetis', 'Ñoquis', 'Café'])
probar('por nombre', nombres(porNombre(productos)), ['Agua', 'arroz', 'Café', 'Espaguetis', 'Lentejas', 'Ñoquis'])
probar('por categoría y precio', nombres(porCategoriaYPrecio(productos)), ['Café', 'Agua', 'Lentejas', 'arroz', 'Ñoquis', 'Espaguetis'])
probar('la original no cambia', productos[0].nombre, 'Ñoquis')
```

Antes de empezar, fíjate en dos trampas del enunciado: `'arroz'` está en minúscula y `'Ñoquis'` empieza por Ñ.

<!-- solucion: Ver una pista -->

- `sort` recibe una función que compara dos elementos, `(a, b) => ...`, y devuelve un número: **negativo** si `a` va antes, **positivo** si `b` va antes y **0** si da igual.
- Para números: `a.precio - b.precio`.
- Para textos, no restes ni uses `<`: usa `a.nombre.localeCompare(b.nombre)`.
- `sort` **modifica** el array original. Busca su versión que devuelve una copia.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
function porPrecio(lista) {
  return lista.toSorted((a, b) => a.precio - b.precio)
}

function porNombre(lista) {
  return lista.toSorted((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
}

function porCategoriaYPrecio(lista) {
  return lista.toSorted((a, b) =>
    a.categoria.localeCompare(b.categoria) || b.precio - a.precio
  )
}

probar('por precio', nombres(porPrecio(productos)), ['Agua', 'arroz', 'Lentejas', 'Espaguetis', 'Ñoquis', 'Café'])
probar('por nombre', nombres(porNombre(productos)), ['Agua', 'arroz', 'Café', 'Espaguetis', 'Lentejas', 'Ñoquis'])
probar('por categoría y precio', nombres(porCategoriaYPrecio(productos)), ['Café', 'Agua', 'Lentejas', 'arroz', 'Ñoquis', 'Espaguetis'])
probar('la original no cambia', productos[0].nombre, 'Ñoquis')
```

**1. Por precio.** `a.precio - b.precio` es negativo si `a` es más barato, así que `a` va antes. Para el orden contrario, `b.precio - a.precio`.

**2. Por nombre.** Aquí están las dos trampas:

- Con `<` o con `sort()` sin función, JavaScript compara por el código de cada carácter: **todas las mayúsculas van antes que las minúsculas** (`'Café'` antes que `'arroz'`) y la **Ñ va al final de todo**, detrás de la Z.
- **`localeCompare`** compara como lo haría una persona en ese idioma. Con `'es'` la Ñ va entre la N y la O, y con `sensitivity: 'base'` no importan las mayúsculas ni las tildes.

**3. Por dos criterios.** El truco es el **`||`**:

- Si las categorías son distintas, `localeCompare` devuelve un número distinto de 0 y ese es el resultado.
- Si son iguales, devuelve **0**, que es *falsy*, así que el `||` pasa al segundo criterio: el precio, de mayor a menor.

Puedes encadenar tantos criterios como necesites: `criterio1 || criterio2 || criterio3`.

**¿Por qué `toSorted` y no `sort`?** Porque `sort` **modifica** el array original. Si esos productos vinieran del estado de React o de una prop, cambiarlos a escondidas provocaría bugs muy difíciles de encontrar. `toSorted` devuelve una copia. Si tienes que soportar navegadores antiguos, el equivalente es `[...lista].sort(...)`.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que no mutes el original.** Es lo primero que miran.
- **Que sepas por qué `sort()` sin función ordena mal los números**: `[10, 9, 1].sort()` da `[1, 10, 9]`, porque los compara como textos.
- **Que uses `localeCompare` para textos** y conozcas el problema de mayúsculas y tildes.
- **El truco del `||`** para varios criterios, o una forma igual de clara de escribirlo.

## Pregunta de seguimiento

En una tabla, el usuario hace clic en la cabecera de una columna para ordenar por ella, y otro clic invierte el orden. ¿Cómo escribirías **una sola** función `ordenar(lista, campo, direccion)` que sirva para cualquier columna?

<!-- solucion: Ver la respuesta -->

```js playground=seguimiento
function ordenar(lista, campo, direccion = 'asc') {
  const signo = direccion === 'asc' ? 1 : -1

  return lista.toSorted((a, b) => {
    const valorA = a[campo]
    const valorB = b[campo]

    const resultado = typeof valorA === 'number'
      ? valorA - valorB
      : String(valorA).localeCompare(String(valorB), 'es', { sensitivity: 'base' })

    return resultado * signo
  })
}

probar('precio desc', nombres(ordenar(productos, 'precio', 'desc')), ['Café', 'Ñoquis', 'Espaguetis', 'Lentejas', 'arroz', 'Agua'])
probar('nombre asc', nombres(ordenar(productos, 'nombre')), ['Agua', 'arroz', 'Café', 'Espaguetis', 'Lentejas', 'Ñoquis'])
```

- **`a[campo]`** lee la propiedad cuyo nombre está en la variable (notación de corchetes).
- Compara como **número** o como **texto** según el tipo del valor.
- **Multiplicar por `signo`** (1 o -1) invierte el orden sin duplicar código.

<!-- /solucion -->
