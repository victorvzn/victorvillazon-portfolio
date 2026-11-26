---
title: 'Prueba técnica: aplana un array sin usar .flat()'
description: 'Convertir [1, [2, [3]]] en [1, 2, 3] sin .flat() es una pregunta típica para hablar de recursividad. Enunciado, pistas y solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Arrays, Recursividad]
draft: true
---

JavaScript ya trae `.flat()`, así que ¿por qué te lo preguntan en una entrevista? Porque quieren ver si entiendes la **recursividad**: una función que se llama a sí misma.

Tiempo recomendado: **25 minutos**.

## El enunciado

> Escribe una función `aplanar(lista)` que reciba un array que puede tener arrays dentro (a cualquier profundidad) y devuelva un array nuevo con todos los elementos en un solo nivel.
>
> No puedes usar `.flat()` ni `.flatMap()`.

```js
aplanar([1, [2, 3], [4, [5, [6]]]]) // [1, 2, 3, 4, 5, 6]
```

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function aplanar(lista) {
  // tu código aquí
}

probar('ya plano', aplanar([1, 2, 3]), [1, 2, 3])
probar('un nivel', aplanar([1, [2, 3]]), [1, 2, 3])
probar('muy profundo', aplanar([1, [2, [3, [4, [5]]]]]), [1, 2, 3, 4, 5])
probar('arrays vacíos', aplanar([[], [1], [[]]]), [1])
probar('textos', aplanar(['a', ['b', ['c']]]), ['a', 'b', 'c'])
```

<!-- solucion: Ver una pista -->

Recorre la lista. Para cada elemento hay dos casos:

- **No es un array**: lo añades al resultado tal cual.
- **Es un array**: necesitas aplanarlo... ¿y qué función aplana arrays?

Para saber si algo es un array, usa `Array.isArray(elemento)`. (`typeof` no sirve: para un array devuelve `'object'`).

<!-- /solucion -->

<!-- solucion: Ver la solución (recursiva) -->

```js playground=solucion
function aplanar(lista) {
  const resultado = []

  for (const elemento of lista) {
    if (Array.isArray(elemento)) {
      // Aplanamos el sub-array con la misma función y añadimos sus elementos
      resultado.push(...aplanar(elemento))
    } else {
      resultado.push(elemento)
    }
  }

  return resultado
}

probar('ya plano', aplanar([1, 2, 3]), [1, 2, 3])
probar('un nivel', aplanar([1, [2, 3]]), [1, 2, 3])
probar('muy profundo', aplanar([1, [2, [3, [4, [5]]]]]), [1, 2, 3, 4, 5])
probar('arrays vacíos', aplanar([[], [1], [[]]]), [1])
probar('textos', aplanar(['a', ['b', ['c']]]), ['a', 'b', 'c'])
```

La función **se llama a sí misma** con cada sub-array. Cada llamada resuelve un nivel y devuelve su trocito ya plano. Para `[1, [2, [3]]]`:

1. `aplanar([1, [2, [3]]])` ve el `1` y lo guarda. Ve `[2, [3]]` y llama a...
2. `aplanar([2, [3]])`, que guarda el `2` y llama a...
3. `aplanar([3])`, que devuelve `[3]`.
4. El paso 2 recibe `[3]` y devuelve `[2, 3]`.
5. El paso 1 recibe `[2, 3]` y devuelve `[1, 2, 3]`.

Toda función recursiva necesita un **caso base**: el momento en que deja de llamarse. Aquí es cuando el elemento no es un array. Sin caso base, se llamaría infinitamente y verías el error `Maximum call stack size exceeded`.

El `...` en `push(...aplanar(elemento))` es el *spread*: añade los elementos uno a uno en vez de meter el array entero.

<!-- /solucion -->

<!-- solucion: Ver la solución alternativa (sin recursividad) -->

Algunos entrevistadores preguntan después: "¿y sin recursividad?". Se puede hacer con una **pila**:

```js playground=solucion-pila
function aplanar(lista) {
  const pendientes = [...lista]
  const resultado = []

  while (pendientes.length) {
    const elemento = pendientes.shift()

    if (Array.isArray(elemento)) {
      // Lo "desempaquetamos" al principio de la cola, manteniendo el orden
      pendientes.unshift(...elemento)
    } else {
      resultado.push(elemento)
    }
  }

  return resultado
}

probar('ya plano', aplanar([1, 2, 3]), [1, 2, 3])
probar('un nivel', aplanar([1, [2, 3]]), [1, 2, 3])
probar('muy profundo', aplanar([1, [2, [3, [4, [5]]]]]), [1, 2, 3, 4, 5])
probar('arrays vacíos', aplanar([[], [1], [[]]]), [1])
probar('textos', aplanar(['a', ['b', ['c']]]), ['a', 'b', 'c'])
```

Sacas el primer elemento pendiente. Si es un array, lo abres y pones su contenido al principio de la lista de pendientes. Si no, va al resultado.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que identifiques el caso base** y el caso recursivo, y sepas explicarlos.
- **Que uses `Array.isArray`** y no `typeof` (que da `'object'` para arrays).
- **Que no modifiques el array original.** Las dos soluciones devuelven un array nuevo.
- **Que pruebes casos límite**: arrays vacíos dentro, lista ya plana.

## Pregunta de seguimiento

`.flat()` acepta una profundidad: `[1, [2, [3]]].flat(1)` da `[1, 2, [3]]`. ¿Cómo añadirías un parámetro `profundidad` a tu función?

<!-- solucion: Ver la respuesta -->

Cada vez que bajas un nivel, restas uno. Cuando llega a `0`, dejas de aplanar y guardas el elemento tal cual:

```js playground=seguimiento
function aplanar(lista, profundidad = Infinity) {
  const resultado = []

  for (const elemento of lista) {
    if (Array.isArray(elemento) && profundidad > 0) {
      resultado.push(...aplanar(elemento, profundidad - 1))
    } else {
      resultado.push(elemento)
    }
  }

  return resultado
}

probar('profundidad 1', aplanar([1, [2, [3]]], 1), [1, 2, [3]])
probar('sin límite', aplanar([1, [2, [3]]]), [1, 2, 3])
probar('profundidad 0', aplanar([1, [2]], 0), [1, [2]])
```

El valor por defecto `Infinity` hace que, si no pasas profundidad, aplane todo.

<!-- /solucion -->
