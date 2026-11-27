---
title: 'Prueba técnica: FizzBuzz, el clásico de las entrevistas'
description: 'El ejercicio más famoso de las entrevistas de programación. Parece trivial, pero el orden de las condiciones lo complica. Enunciado, casos de prueba y soluciones ocultas.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica]
draft: true
---

**FizzBuzz** es probablemente el ejercicio de programación más famoso del mundo. Se usa como "filtro" en muchas entrevistas: es corto y sencillo, pero un sorprendente número de candidatos se equivoca en el detalle clave. Si es tu primera prueba técnica, empieza por aquí.

Tiempo recomendado: **10 minutos**.

## El enunciado

> Escribe una función `fizzBuzz(n)` que devuelva un array con los números del **1 al `n`**, pero:
>
> - Si el número es múltiplo de **3**, en su lugar va el texto `'Fizz'`.
> - Si es múltiplo de **5**, va `'Buzz'`.
> - Si es múltiplo de **3 y de 5** a la vez, va `'FizzBuzz'`.
> - En cualquier otro caso, va el número.

Por ejemplo, `fizzBuzz(15)` devuelve:

```js
[1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']
```

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function fizzBuzz(n) {
  // tu código aquí
}

probar('hasta 5', fizzBuzz(5), [1, 2, 'Fizz', 4, 'Buzz'])
probar('hasta 15', fizzBuzz(15), [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz'])
probar('el 30 es FizzBuzz', fizzBuzz(30)[29], 'FizzBuzz')
probar('solo el 1', fizzBuzz(1), [1])
probar('n = 0', fizzBuzz(0), [])
```

<!-- solucion: Ver una pista -->

Para saber si un número es múltiplo de otro, usa el operador **resto** `%`: `15 % 3` es `0`, así que 15 es múltiplo de 3.

Y piensa en el **orden** de las condiciones: si preguntas primero "¿es múltiplo de 3?", el 15 entraría ahí y nunca llegaría a ser `'FizzBuzz'`.

<!-- /solucion -->

<!-- solucion: Ver la solución 1 (if / else if) -->

```js playground=solucion-if
function fizzBuzz(n) {
  const resultado = []

  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      resultado.push('FizzBuzz')
    } else if (i % 3 === 0) {
      resultado.push('Fizz')
    } else if (i % 5 === 0) {
      resultado.push('Buzz')
    } else {
      resultado.push(i)
    }
  }

  return resultado
}

probar('hasta 5', fizzBuzz(5), [1, 2, 'Fizz', 4, 'Buzz'])
probar('hasta 15', fizzBuzz(15), [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz'])
probar('el 30 es FizzBuzz', fizzBuzz(30)[29], 'FizzBuzz')
probar('solo el 1', fizzBuzz(1), [1])
probar('n = 0', fizzBuzz(0), [])
```

La clave es **comprobar primero el caso más específico**: múltiplo de 3 y de 5 a la vez. Un número múltiplo de 3 y de 5 es múltiplo de 15, por eso `i % 15 === 0`. (También vale `i % 3 === 0 && i % 5 === 0`, que se lee más claro).

Es lo que vimos en el post de condicionales: JavaScript se queda con **la primera** condición que se cumple, así que el orden importa.

<!-- /solucion -->

<!-- solucion: Ver la solución 2 (construir el texto) -->

```js playground=solucion-texto
function fizzBuzz(n) {
  return Array.from({ length: n }, (_, indice) => {
    const numero = indice + 1
    let texto = ''
    if (numero % 3 === 0) texto += 'Fizz'
    if (numero % 5 === 0) texto += 'Buzz'
    return texto || numero
  })
}

probar('hasta 5', fizzBuzz(5), [1, 2, 'Fizz', 4, 'Buzz'])
probar('hasta 15', fizzBuzz(15), [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz'])
probar('el 30 es FizzBuzz', fizzBuzz(30)[29], 'FizzBuzz')
probar('solo el 1', fizzBuzz(1), [1])
probar('n = 0', fizzBuzz(0), [])
```

En vez de tres casos, **vamos sumando textos**: si es múltiplo de 3, añadimos `'Fizz'`; si es de 5, añadimos `'Buzz'`. El 15 recibe las dos y queda `'FizzBuzz'` solo. Si no recibió ninguna, `texto` está vacío (falsy) y `texto || numero` devuelve el número.

`Array.from({ length: n }, fn)` crea un array de `n` elementos llamando a `fn` para cada uno; el segundo parámetro es el índice (empieza en 0, por eso `indice + 1`).

La gran ventaja: si te piden añadir **"Bazz" para los múltiplos de 7**, es **una línea más**. En la solución 1 tendrías que añadir los casos 21, 35 y 105 (3×7, 5×7 y 3×5×7).

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **El orden de las condiciones.** Es el error número uno: preguntar primero por el 3 y que el 15 salga `'Fizz'`.
- **Los límites**: que empiece en 1 (no en 0) y que incluya `n`.
- **Que devuelvas los números como números** (`1`, no `'1'`).
- **Que puedas ampliarlo.** Una pregunta de seguimiento muy habitual es: "¿y si añadimos el 7?".

## Pregunta de seguimiento

¿Cómo lo escribirías para que las reglas (3 → Fizz, 5 → Buzz, 7 → Bazz...) se pasen como **datos**, sin tocar la función?

<!-- solucion: Ver la respuesta -->

```js playground=seguimiento
function fizzBuzz(n, reglas = [[3, 'Fizz'], [5, 'Buzz']]) {
  return Array.from({ length: n }, (_, indice) => {
    const numero = indice + 1
    const texto = reglas
      .filter(([divisor]) => numero % divisor === 0)
      .map(([, palabra]) => palabra)
      .join('')
    return texto || numero
  })
}

console.log(fizzBuzz(21, [[3, 'Fizz'], [5, 'Buzz'], [7, 'Bazz']]))
```

Las reglas son un array de pares `[divisor, palabra]`. Para cada número, nos quedamos con las palabras de los divisores que encajan y las juntamos. Añadir una regla ya no es programar: es añadir un dato.

<!-- /solucion -->
