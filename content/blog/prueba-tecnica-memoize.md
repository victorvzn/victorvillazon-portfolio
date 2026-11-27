---
title: 'Prueba técnica: implementa memoize para no repetir cálculos'
description: 'Guarda los resultados de una función para no volver a calcularlos con los mismos argumentos. Closures, Map y caché en un ejercicio de entrevista clásico, con Fibonacci de bonus.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Closures, Rendimiento]
draft: true
---

Imagina una función que tarda mucho: un cálculo pesado, una conversión de precios con muchas reglas, una petición a una API que no cambia. Si la llamas diez veces **con los mismos datos**, haces el mismo trabajo diez veces.

**Memoizar** una función es enseñarle a **recordar sus resultados**: la primera vez calcula y lo apunta; las siguientes, con los mismos argumentos, devuelve lo apuntado al instante. Es una pregunta clásica de entrevista porque mezcla **closures**, **estructuras de datos** y **rendimiento**.

Tiempo recomendado: **25 minutos**.

## El enunciado

> Escribe `memoize(funcion)`, que devuelva una **nueva función** que se comporte igual que `funcion`, pero que:
>
> - La primera vez que reciba unos argumentos, llame a `funcion` y **guarde** el resultado.
> - Las siguientes veces con **los mismos argumentos**, devuelva el resultado guardado **sin llamar** a `funcion`.
>
> Puedes suponer que los argumentos son números o textos.

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function memoize(funcion) {
  // tu código aquí
}

let llamadas = 0
const sumarLento = (a, b) => {
  llamadas++
  return a + b
}

const sumar = memoize(sumarLento)

probar('primer resultado', sumar(2, 3), 5)
probar('mismo resultado', sumar(2, 3), 5)
probar('solo se calculó una vez', llamadas, 1)
probar('otros argumentos', sumar(3, 2), 5)
probar('se calculó otra vez', llamadas, 2)
probar('textos y números no se mezclan', sumar('2', 3), '23')
probar('y se cuentan aparte', llamadas, 3)
```

<!-- solucion: Ver una pista -->

La función que devuelves necesita una **caché**: un sitio donde guardar "estos argumentos → este resultado". Créala **dentro** de `memoize` y fuera de la función que devuelves, para que el closure la recuerde entre llamadas.

Un `Map` es ideal. Como clave, necesitas convertir **todos los argumentos** en un solo valor: `JSON.stringify(argumentos)` funciona y distingue `'2'` de `2`.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
function memoize(funcion) {
  const cache = new Map()

  return function (...argumentos) {
    const clave = JSON.stringify(argumentos)

    if (cache.has(clave)) return cache.get(clave)

    const resultado = funcion.apply(this, argumentos)
    cache.set(clave, resultado)
    return resultado
  }
}

let llamadas = 0
const sumarLento = (a, b) => {
  llamadas++
  return a + b
}

const sumar = memoize(sumarLento)

probar('primer resultado', sumar(2, 3), 5)
probar('mismo resultado', sumar(2, 3), 5)
probar('solo se calculó una vez', llamadas, 1)
probar('otros argumentos', sumar(3, 2), 5)
probar('se calculó otra vez', llamadas, 2)
probar('textos y números no se mezclan', sumar('2', 3), '23')
probar('y se cuentan aparte', llamadas, 3)
```

Lo que más se valora:

- **La caché vive en el closure.** Cada función memoizada tiene la suya y nadie puede tocarla desde fuera.
- **`cache.has` antes de `cache.get`.** Si compruebas con `if (cache.get(clave))`, fallaría con resultados falsy como `0`, `''` o `false`: los recalcularías siempre.
- **`JSON.stringify(argumentos)` como clave.** `[2, 3]` se convierte en `'[2,3]'` y `['2', 3]` en `'["2",3]'`: claves distintas. Si usaras `argumentos.join(',')`, las dos darían `'2,3'` y devolverías un resultado equivocado.
- **`(3, 2)` es otra clave**, aunque la suma dé lo mismo. `memoize` no sabe qué hace la función: no puede suponer que el orden da igual.

<!-- /solucion -->

## ¿Cuándo se puede memoizar una función?

Solo cuando es una **función pura** (lo vimos en su post): con los mismos argumentos devuelve **siempre** lo mismo y no tiene efectos secundarios.

```js
// ✅ Se puede memoizar
const precioConIva = (precio) => precio * 1.18

// ❌ No: depende de la hora, cada llamada debe dar un resultado distinto
const saludo = (nombre) => `Son las ${new Date().getHours()}, ${nombre}`

// ❌ No: su trabajo es el efecto (guardar), no el resultado
const guardar = (dato) => localStorage.setItem('dato', dato)
```

## El bonus clásico: Fibonacci

La **sucesión de Fibonacci** empieza en 0 y 1, y cada número es la suma de los dos anteriores: 0, 1, 1, 2, 3, 5, 8, 13... La versión recursiva (una función que se llama a sí misma) es muy elegante, pero **lentísima**:

```js playground=fibonacci
let calculos = 0

function fibLento(n) {
  calculos++
  if (n < 2) return n
  return fibLento(n - 1) + fibLento(n - 2)
}

console.log(fibLento(25), `→ ${calculos} llamadas`) // 75025 → 242785 llamadas 😱
```

¿Por qué tantas? Para calcular `fib(25)` calcula `fib(24)` y `fib(23)`; pero `fib(24)` **vuelve a calcular** `fib(23)`, y así hacia abajo: los mismos valores, miles de veces.

¿Puedes arreglarlo con `memoize`?

<!-- solucion: Ver la respuesta -->

```js playground=fibonacci-memo
function memoize(funcion) {
  const cache = new Map()
  return function (...argumentos) {
    const clave = JSON.stringify(argumentos)
    if (cache.has(clave)) return cache.get(clave)
    const resultado = funcion.apply(this, argumentos)
    cache.set(clave, resultado)
    return resultado
  }
}

let calculos = 0

// ¡Ojo! Las llamadas recursivas deben ir a la versión memoizada
const fib = memoize((n) => {
  calculos++
  if (n < 2) return n
  return fib(n - 1) + fib(n - 2)
})

console.log(fib(25), `→ ${calculos} cálculos`) // 75025 → 26 cálculos 🚀
console.log(fib(80)) // 23416728348467684, al instante
```

De más de 240 000 llamadas a **26**: cada valor de 0 a 25 se calcula **una sola vez**.

La trampa está en la recursión: si hicieras `const fib = memoize(fibLento)`, solo se memoizaría la **primera** llamada, porque dentro, `fibLento` se sigue llamando a sí misma sin caché. Las llamadas internas tienen que ir a la versión memoizada (`fib`).

`fib(80)` ya supera el número entero más grande que JavaScript representa con exactitud (`Number.MAX_SAFE_INTEGER`), así que el resultado puede no ser exacto en los últimos dígitos. Para números tan grandes se usaría `BigInt`. Mencionarlo en una entrevista da puntos extra.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **El closure** con la caché dentro.
- **La clave**: que distinga argumentos distintos (`'2'` y `2`) y funcione con varios argumentos.
- **El detalle de `has`** frente a comprobar si `get` es truthy.
- **Saber cuándo NO memoizar**: funciones impuras, y el coste en **memoria** (la caché crece sin límite; en un caso real habría que limitar su tamaño o vaciarla).

## Pregunta de seguimiento

¿Qué problema tiene usar `JSON.stringify` como clave si los argumentos son **objetos**?

<!-- solucion: Ver la respuesta -->

Dos problemas:

1. **El orden de las propiedades**: `{ a: 1, b: 2 }` y `{ b: 2, a: 1 }` son iguales para nosotros, pero `JSON.stringify` da textos distintos, así que se calcularían dos veces.
2. **Lo que JSON no sabe representar**: funciones, `undefined`, fechas (se convierten en texto), `Map`, `Set`... Dos argumentos distintos podrían producir la misma clave.

Para un solo argumento que es un objeto, una alternativa es usar **el propio objeto como clave** de un `Map` (compara por referencia: el mismo objeto, el mismo resultado). Y si el objeto puede dejar de usarse, un **`WeakMap`**, que no impide que el objeto se libere de la memoria.

<!-- /solucion -->
