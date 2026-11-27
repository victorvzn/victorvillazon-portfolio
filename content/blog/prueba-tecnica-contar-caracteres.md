---
title: 'Prueba técnica: la letra que más se repite'
description: 'Cuenta cuántas veces aparece cada carácter de un texto y encuentra el más repetido. El patrón de "contar con un objeto" que sirve para medio centenar de ejercicios.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica, Strings]
draft: true
---

Este ejercicio te enseña un **patrón** que vas a usar en un montón de pruebas técnicas: **contar con un objeto** (o con un `Map`). Contar letras, palabras repetidas, votos, productos vendidos... todos se resuelven igual. Si lo dominas, tienes media prueba técnica ganada.

Tiempo recomendado: **20 minutos**.

## El enunciado

> **Parte 1.** Escribe `contarCaracteres(texto)`, que devuelva un objeto con cuántas veces aparece cada letra. Ignora las mayúsculas y los espacios.
>
> **Parte 2.** Escribe `masRepetida(texto)`, que devuelva la letra que más veces aparece. Si hay empate, la que aparece **primero** en el texto. Si el texto está vacío, `null`.

```js
contarCaracteres('Hola mundo') // { h: 1, o: 2, l: 1, a: 1, m: 1, u: 1, n: 1, d: 1 }
masRepetida('Hola mundo')      // 'o'
```

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function contarCaracteres(texto) {
  // tu código aquí
}

function masRepetida(texto) {
  // tu código aquí
}

probar('contar', contarCaracteres('Hola mundo'), { h: 1, o: 2, l: 1, a: 1, m: 1, u: 1, n: 1, d: 1 })
probar('contar con mayúsculas', contarCaracteres('AaBb a'), { a: 3, b: 2 })
probar('contar vacío', contarCaracteres(''), {})
probar('más repetida', masRepetida('Hola mundo'), 'o')
probar('más repetida (banana)', masRepetida('banana'), 'a')
probar('empate: la primera', masRepetida('abab'), 'a')
probar('empate con mayúsculas', masRepetida('Bbaa'), 'b')
probar('vacío', masRepetida(''), null)
```

<!-- solucion: Ver una pista -->

Recorre el texto letra por letra con `for...of`. Para cada letra, suma 1 a su contador en un objeto:

```js
cuenta[letra] = (cuenta[letra] ?? 0) + 1
```

`cuenta[letra] ?? 0` usa `0` si esa letra todavía no tenía contador.

Para la parte 2, recorre las letras **en el orden del texto** y quédate con la que tenga el contador más alto. Usa `>` (y no `>=`) para que, en un empate, gane la primera.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
function contarCaracteres(texto) {
  const cuenta = {}

  for (const letra of texto.toLowerCase()) {
    if (letra === ' ') continue
    cuenta[letra] = (cuenta[letra] ?? 0) + 1
  }

  return cuenta
}

function masRepetida(texto) {
  const cuenta = contarCaracteres(texto)
  let ganadora = null

  // Object.keys respeta el orden en que se añadieron las letras: el del texto
  for (const letra of Object.keys(cuenta)) {
    if (ganadora === null || cuenta[letra] > cuenta[ganadora]) {
      ganadora = letra
    }
  }

  return ganadora
}

probar('contar', contarCaracteres('Hola mundo'), { h: 1, o: 2, l: 1, a: 1, m: 1, u: 1, n: 1, d: 1 })
probar('contar con mayúsculas', contarCaracteres('AaBb a'), { a: 3, b: 2 })
probar('contar vacío', contarCaracteres(''), {})
probar('más repetida', masRepetida('Hola mundo'), 'o')
probar('más repetida (banana)', masRepetida('banana'), 'a')
probar('empate: la primera', masRepetida('abab'), 'a')
probar('empate con mayúsculas', masRepetida('Bbaa'), 'b')
probar('vacío', masRepetida(''), null)
```

Lo que más se valora:

- **`masRepetida` reutiliza `contarCaracteres`.** No vuelve a contar: primero cuenta y luego busca el máximo. Dos pasos, dos funciones.
- **El desempate sale "gratis".** Las claves de un objeto (que no son números) se guardan en el orden en que se añadieron, que es el orden del texto. Con `>` estricto, en un empate la primera no se sustituye.
- **`for...of` sobre el texto** recorre letra a letra, sin índices.
- **`continue`** salta los espacios sin anidar el resto del código en un `if`.

Una variante igual de válida es usar un **`Map`** en vez de un objeto (lo vimos en el post de `Map` y `Set`): `cuenta.set(letra, (cuenta.get(letra) ?? 0) + 1)`.

<!-- /solucion -->

## El patrón, en otros problemas

La misma idea resuelve un montón de ejercicios:

| Problema | Qué cuentas |
| --- | --- |
| La palabra más repetida de un texto | Palabras (`texto.split(' ')`) |
| ¿Son anagramas? | Letras de las dos palabras, y comparas |
| El primer carácter que no se repite | Letras, y buscas la primera con cuenta 1 |
| El producto más vendido | Productos de una lista de pedidos |
| ¿Hay algún elemento repetido? | Elementos, y miras si alguno tiene más de 1 |

## Lo que evalúa el entrevistador

- **Que conozcas el patrón de contar** con un objeto o un `Map`.
- **Que pienses en el empate y en el texto vacío** sin que te lo digan.
- **Que no recorras el texto más veces de las necesarias.** Una vez para contar y otra (sobre las letras únicas) para el máximo.

## Pregunta de seguimiento

Escribe `primeraSinRepetir(texto)`: el primer carácter que aparece **una sola vez**. Para `'abacabad'` es `'c'`. Si no hay ninguno, `null`.

<!-- solucion: Ver la respuesta -->

```js playground=seguimiento
function contarCaracteres(texto) {
  const cuenta = {}
  for (const letra of texto.toLowerCase()) {
    if (letra === ' ') continue
    cuenta[letra] = (cuenta[letra] ?? 0) + 1
  }
  return cuenta
}

function primeraSinRepetir(texto) {
  const cuenta = contarCaracteres(texto)
  return Object.keys(cuenta).find((letra) => cuenta[letra] === 1) ?? null
}

console.log(primeraSinRepetir('abacabad')) // 'c'
console.log(primeraSinRepetir('aabb'))     // null
```

Otra vez el mismo patrón: contar y luego buscar. Con `find` nos quedamos con la primera letra cuya cuenta es 1.

<!-- /solucion -->
