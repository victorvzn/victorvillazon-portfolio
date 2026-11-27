---
title: 'Prueba técnica: comparar dos objetos en profundidad (deep equal)'
description: 'Por qué {a: 1} === {a: 1} es false y cómo escribir tu propia función de igualdad profunda con recursión: primitivos, arrays, objetos anidados, NaN y los casos trampa que buscan los entrevistadores. Con solución oculta.'
date: 2026-11-27
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Recursión, Objetos]
draft: true
---

```js
console.log({ a: 1 } === { a: 1 }) // false
```

Si esto te sorprende, repasa el post de igualdad y coerción: `===` con objetos compara si son **el mismo objeto en memoria**, no si tienen el mismo contenido. Por eso, para saber si dos objetos "son iguales", hace falta una **comparación profunda** (*deep equal*): mirar dentro, propiedad a propiedad, y dentro de cada propiedad si a su vez es un objeto.

Es lo que hace el `toEqual` de Vitest (lo viste en la serie de Testing), y es una pregunta muy habitual en entrevistas de nivel medio porque combina **recursión**, **tipos** y **casos límite**.

Tiempo recomendado: **40 minutos**.

## El enunciado

> Escribe una función `sonIguales(a, b)` que devuelva `true` si los dos valores son **iguales en profundidad**: mismos tipos, mismos valores y, si son objetos o arrays, las mismas claves con valores iguales en profundidad.

- `sonIguales({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 })` → `true` (el orden de las claves no importa)
- `sonIguales([1, 2], [2, 1])` → `false` (en los arrays, el orden sí importa)
- `sonIguales({ a: 1 }, { a: 1, b: undefined })` → `false` (tienen claves distintas)

No hace falta soportar `Map`, `Set`, fechas ni clases: con primitivos, arrays y objetos normales es suficiente.

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function sonIguales(a, b) {
  // tu código aquí
}

probar('números', sonIguales(1, 1), true)
probar('textos distintos', sonIguales('a', 'b'), false)
probar('número y texto', sonIguales(1, '1'), false)
probar('NaN', sonIguales(NaN, NaN), true)
probar('objetos iguales', sonIguales({ a: 1, b: 2 }, { b: 2, a: 1 }), true)
probar('objetos distintos', sonIguales({ a: 1 }, { a: 2 }), false)
probar('anidados', sonIguales({ a: { b: [1, { c: 3 }] } }, { a: { b: [1, { c: 3 }] } }), true)
probar('anidados distintos', sonIguales({ a: { b: [1, { c: 3 }] } }, { a: { b: [1, { c: 4 }] } }), false)
probar('arrays en otro orden', sonIguales([1, 2], [2, 1]), false)
probar('clave de más', sonIguales({ a: 1 }, { a: 1, b: undefined }), false)
probar('null y objeto', sonIguales(null, {}), false)
probar('array y objeto', sonIguales([], {}), false)
probar('null y null', sonIguales(null, null), true)
```

Antes de programar, lee los casos con calma: varios están pensados para tumbar las soluciones rápidas.

<!-- solucion: Ver una pista -->

Divide el problema:

1. Si los dos valores son **primitivos** (números, textos, booleanos, `null`...), basta con compararlos. Ojo: `NaN === NaN` es `false`, pero `Object.is(NaN, NaN)` es `true`.
2. Si son **objetos**, comprueba que los dos son del mismo "tipo" (los dos arrays o los dos objetos), que tienen **las mismas claves** y que el valor de cada clave es igual... usando **la propia función** (recursión).

Y recuerda la trampa de JavaScript: `typeof null` es `'object'`.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
const esObjeto = (valor) => typeof valor === 'object' && valor !== null

function sonIguales(a, b) {
  // 1. Mismo valor (incluye NaN con NaN)
  if (Object.is(a, b)) return true

  // 2. Si alguno no es un objeto, y no eran iguales en el paso 1, son distintos
  if (!esObjeto(a) || !esObjeto(b)) return false

  // 3. Un array y un objeto no son iguales aunque estén "vacíos" los dos
  if (Array.isArray(a) !== Array.isArray(b)) return false

  // 4. Mismas claves, y cada valor igual en profundidad
  const clavesA = Object.keys(a)
  const clavesB = Object.keys(b)
  if (clavesA.length !== clavesB.length) return false

  return clavesA.every((clave) => Object.hasOwn(b, clave) && sonIguales(a[clave], b[clave]))
}

probar('números', sonIguales(1, 1), true)
probar('textos distintos', sonIguales('a', 'b'), false)
probar('número y texto', sonIguales(1, '1'), false)
probar('NaN', sonIguales(NaN, NaN), true)
probar('objetos iguales', sonIguales({ a: 1, b: 2 }, { b: 2, a: 1 }), true)
probar('objetos distintos', sonIguales({ a: 1 }, { a: 2 }), false)
probar('anidados', sonIguales({ a: { b: [1, { c: 3 }] } }, { a: { b: [1, { c: 3 }] } }), true)
probar('anidados distintos', sonIguales({ a: { b: [1, { c: 3 }] } }, { a: { b: [1, { c: 4 }] } }), false)
probar('arrays en otro orden', sonIguales([1, 2], [2, 1]), false)
probar('clave de más', sonIguales({ a: 1 }, { a: 1, b: undefined }), false)
probar('null y objeto', sonIguales(null, {}), false)
probar('array y objeto', sonIguales([], {}), false)
probar('null y null', sonIguales(null, null), true)
```

Por qué cada paso:

- **`Object.is`** es como `===`, pero considera `NaN` igual a `NaN` (y distingue `0` de `-0`). Además, si `a` y `b` son **el mismo objeto**, devuelve `true` al momento, sin recorrerlo.
- **`esObjeto`** evita la trampa de `typeof null === 'object'`: sin el `valor !== null`, `sonIguales(null, {})` intentaría leer las claves de `null`.
- **`Array.isArray`** distingue `[]` de `{}`: los dos son objetos sin claves, pero no son iguales.
- **Comparar el número de claves** detecta claves de más. Y **`Object.hasOwn(b, clave)`** detecta claves que están en `a` pero no en `b`. Sin esa comprobación, `{ a: undefined }` y `{ b: undefined }` parecerían iguales, porque `b.a` también es `undefined`.
- **La recursión**: `sonIguales(a[clave], b[clave])` vuelve a aplicar las mismas reglas un nivel más adentro. Si es un primitivo, se resuelve en el paso 1 o 2; si es otro objeto, se vuelve a recorrer. Los arrays funcionan con el mismo código, porque sus índices (`'0'`, `'1'`...) son sus claves, y por eso el orden importa.

### ¿Y `JSON.stringify(a) === JSON.stringify(b)`?

Es lo primero que se le ocurre a mucha gente, y el entrevistador lo sabe. Falla porque:

- **El orden de las claves importa**: `{ a: 1, b: 2 }` y `{ b: 2, a: 1 }` dan textos distintos.
- **Pierde información**: `undefined` y las funciones desaparecen, y `NaN` se convierte en `null`.

Mencionarlo y explicar por qué no sirve es una buena forma de empezar tu respuesta.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que entiendas por qué `===` no sirve** con objetos (referencias frente a valores).
- **Recursión**: un caso base (los primitivos) y un caso recursivo (los objetos).
- **Conocer las rarezas del lenguaje**: `typeof null`, `NaN !== NaN`, arrays frente a objetos.
- **Los casos límite**: claves de más, claves con `undefined`, el mismo objeto dos veces.
- **Saber hasta dónde llegar**: preguntar si hay que soportar fechas, `Map` o referencias circulares, en vez de asumirlo.

## Pregunta de seguimiento

¿Qué pasa con tu función si un objeto se contiene a sí mismo (una **referencia circular**)? Por ejemplo, `const a = {}; a.yo = a`. ¿Cómo lo evitarías?

<!-- solucion: Ver la respuesta -->

La recursión entraría en un **bucle infinito** (`a.yo.yo.yo...`) hasta lanzar `Maximum call stack size exceeded`.

La solución es recordar qué **parejas de objetos** ya estás comparando, por ejemplo con un `WeakMap` (lo viste en el post de `WeakMap` y `WeakSet`). Si te encuentras otra vez con la misma pareja, la das por igual (si hubiera una diferencia, se encontrará en otra rama de la comparación):

```js playground=seguimiento
const esObjeto = (valor) => typeof valor === 'object' && valor !== null

function sonIguales(a, b, vistos = new WeakMap()) {
  if (Object.is(a, b)) return true
  if (!esObjeto(a) || !esObjeto(b)) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (vistos.get(a) === b) return true // ya estamos comparando esta pareja
  vistos.set(a, b)

  const clavesA = Object.keys(a)
  if (clavesA.length !== Object.keys(b).length) return false
  return clavesA.every((clave) => Object.hasOwn(b, clave) && sonIguales(a[clave], b[clave], vistos))
}

const a = { nombre: 'Ana' }
a.yo = a
const b = { nombre: 'Ana' }
b.yo = b

probar('circulares iguales', sonIguales(a, b), true)
probar('circular distinto', sonIguales(a, { nombre: 'Luis', yo: a }), false)
```

<!-- /solucion -->
