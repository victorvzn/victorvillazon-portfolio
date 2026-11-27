---
title: 'Comparar en JavaScript: ===, ==, coerción y truthy/falsy a fondo'
description: 'Por qué 0 == "" es true, por qué [] === [] es false y cómo comparar sin sorpresas. La coerción de tipos explicada con ejemplos.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos]
draft: true
---

En los posts de tipos de datos y de condicionales te dije "usa siempre `===`" y te presenté los valores *falsy*. Hoy vamos a ver **por qué**, porque comparar mal es una de las fuentes de bugs más típicas de un junior: un `if` que entra cuando no debería, un `0` que se trata como "vacío" o dos objetos iguales que JavaScript dice que son distintos.

## La coerción: JavaScript convierte tipos por su cuenta

**Coerción** significa que JavaScript convierte un valor de un tipo a otro **sin que se lo pidas**. Pasa cuando mezclas tipos en una operación:

```js playground=coercion
console.log('5' + 1)   // '51'  → el + con un texto concatena
console.log('5' - 1)   // 4     → el - solo funciona con números, así que convierte '5'
console.log('5' * '2') // 10
console.log(true + 1)  // 2     → true se convierte en 1
console.log('hola' - 1) // NaN  → 'hola' no se puede convertir en número
```

No tienes que memorizar todas las reglas. Basta con saber que **existen** y evitar mezclar tipos.

## `==` vs `===`

- **`===` (igualdad estricta)** compara **valor y tipo**. Si los tipos son distintos, es `false` sin más.
- **`==` (igualdad débil)** primero **convierte** los dos valores a un tipo común y luego compara.

```js playground=igualdad
console.log(5 === '5')  // false: number vs string
console.log(5 == '5')   // true: convierte '5' en 5

// Donde == se vuelve peligroso
console.log(0 == '')         // true 😱
console.log(0 == '0')        // true
console.log('' == '0')       // false (¡y los dos de arriba eran true!)
console.log(false == '0')    // true
console.log(null == undefined)  // true
console.log(null === undefined) // false
```

Fíjate en las tres primeras: `0` es igual a `''`, `0` es igual a `'0'`, pero `''` **no** es igual a `'0'`. Con `==` la igualdad ni siquiera es lógica. Por eso la regla es: **usa siempre `===` y `!==`**.

> La única excepción que verás en código profesional es `valor == null`, que comprueba a la vez si algo es `null` **o** `undefined`. Si te confunde, usa `valor === null || valor === undefined`, que hace lo mismo.

## Comparar objetos y arrays: se compara la referencia

Esto sorprende a todo el mundo la primera vez:

```js playground=referencias
console.log([1, 2] === [1, 2])           // false
console.log({ id: 1 } === { id: 1 })     // false

const a = { id: 1 }
const b = a
console.log(a === b) // true: son el MISMO objeto
```

Con objetos y arrays, `===` no mira el contenido: pregunta "¿es **el mismo objeto** en memoria?". Dos objetos creados por separado son dos cajas distintas, aunque tengan lo mismo dentro. `b = a` no copia la caja: hace que las dos variables apunten a la misma.

¿Cómo comparas el contenido entonces?

```js playground=contenido
const carrito1 = [1, 2, 3]
const carrito2 = [1, 2, 3]

// Para arrays sencillos de números o textos
const mismoContenido = carrito1.length === carrito2.length &&
  carrito1.every((valor, i) => valor === carrito2[i])
console.log(mismoContenido) // true

// Para objetos: compara las propiedades que te importan
const usuario1 = { id: 7, nombre: 'Ana' }
const usuario2 = { id: 7, nombre: 'Ana María' }
console.log(usuario1.id === usuario2.id) // true: es el mismo usuario
```

Casi siempre, en vez de comparar objetos enteros, comparas **su `id`**.

## `NaN`, el único valor distinto de sí mismo

`NaN` significa *Not a Number* y aparece cuando una operación matemática no tiene sentido:

```js playground=nan
const precio = Number('gratis')
console.log(precio)               // NaN
console.log(precio === NaN)       // false 🤯
console.log(Number.isNaN(precio)) // true ✅
```

Para saber si algo es `NaN`, usa **`Number.isNaN()`**. Nunca `=== NaN`.

## Truthy y falsy a fondo

En una condición, JavaScript convierte el valor a booleano. Estos son los únicos **falsy**:

| Valor | Tipo |
| --- | --- |
| `false` | boolean |
| `0` (y `-0`) | number |
| `''` (texto vacío) | string |
| `null` | null |
| `undefined` | undefined |
| `NaN` | number |

**Todo lo demás es truthy**, incluidos estos, que engañan:

```js playground=truthy
const valores = ['0', 'false', ' ', [], {}, -1]

valores.forEach((valor) => {
  console.log(JSON.stringify(valor), '→', Boolean(valor))
})
// Todos dan true: un texto con algo dentro, un array vacío
// y un objeto vacío son truthy
```

`Boolean(valor)` (o `!!valor`) te dice si un valor es truthy o falsy. Úsalo en la consola cuando dudes.

Una consecuencia práctica: para saber si un array está vacío **no basta** con `if (lista)`, porque `[]` es truthy. Tienes que preguntar `if (lista.length === 0)`.

## El problema del `0` con `||`

`||` devuelve el primer valor truthy. Por eso se usa mucho para poner valores por defecto... y por eso falla con el `0`:

```js playground=defecto
const cantidadElegida = 0

const conOr = cantidadElegida || 1
console.log(conOr) // 1 ❌ el usuario eligió 0 y lo hemos cambiado

const conNullish = cantidadElegida ?? 1
console.log(conNullish) // 0 ✅
```

**`??`** (*nullish coalescing*) solo usa el valor por defecto si lo de la izquierda es `null` o `undefined`, no si es `0` o `''`. Lo vimos en el post de optional chaining.

## Tu turno

Antes de ejecutarlo, escribe en un papel qué crees que va a salir en cada línea. Luego compruébalo:

```js playground=ejercicio
console.log(1 == '1')
console.log(1 === '1')
console.log('' == 0)
console.log([] === [])
console.log(Boolean('0'))
console.log(Boolean(0))
console.log(null ?? 'por defecto')
console.log(0 ?? 'por defecto')
console.log(0 || 'por defecto')
```

## Errores comunes

- **Usar `==` "porque funciona".** Funciona hasta el día que llega un `0` o un `''`. Usa `===`.
- **Comparar objetos o arrays con `===`** esperando que compare el contenido. Compara el `id` o cada elemento.
- **`if (lista)` para ver si un array está vacío.** `[]` es truthy. Usa `lista.length`.
- **`valor === NaN`.** Siempre es `false`. Usa `Number.isNaN(valor)`.
- **`||` para valores por defecto cuando `0` o `''` son válidos.** Usa `??`.

## Para profundizar

- [Comparaciones de igualdad en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- [Falsy en MDN](https://developer.mozilla.org/es/docs/Glossary/Falsy)
- [Truthy en MDN](https://developer.mozilla.org/es/docs/Glossary/Truthy)

En resumen: JavaScript **convierte tipos por su cuenta** (coerción), y `==` se aprovecha de eso con resultados absurdos, así que usa **`===`**. Los objetos y arrays se comparan **por referencia**, no por contenido. Solo hay **seis valores falsy**, y `[]`, `{}` y `'0'` no son uno de ellos.
