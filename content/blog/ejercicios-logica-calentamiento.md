---
title: '5 ejercicios de lógica para calentar (con solución oculta)'
description: 'FizzBuzz, palíndromos, vocales y más: cinco ejercicios clásicos para entrenar la lógica en JavaScript. Intenta resolverlos antes de mirar.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Lógica, Ejercicios]
draft: false
---

Programar no es memorizar métodos: es **partir un problema en pasos pequeños**. Y eso se entrena como un músculo, con ejercicios.

Aquí tienes cinco clásicos, de menos a más difícil. Cada uno tiene la solución **escondida**: ábrela solo cuando lo hayas intentado de verdad (o lleves un buen rato atascado, que también cuenta).

## Cómo comprobar tus soluciones

Todos los ejemplos llevan esta pequeña función `probar`. Compara lo que devuelve tu función con lo esperado y muestra ✅ o ❌ en la consola:

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

No tienes que copiarla: ya viene incluida en cada enlace al playground. Escribe tu solución dentro de la función y pulsa ejecutar hasta que todo salga en verde.

## 1. Invertir un texto

Escribe `invertir(texto)`, que devuelva el texto al revés.

```js playground=invertir
function invertir(texto) {
  // tu código aquí
}

probar('hola', invertir('hola'), 'aloh')
probar('una sola letra', invertir('a'), 'a')
probar('texto vacío', invertir(''), '')
```

<!-- solucion -->

Un texto no tiene `.reverse()`, pero un array sí. Así que: texto → array de letras → invertir → texto otra vez.

```js playground=invertir-solucion
function invertir(texto) {
  return texto.split('').reverse().join('')
}

probar('hola', invertir('hola'), 'aloh')
probar('una sola letra', invertir('a'), 'a')
probar('texto vacío', invertir(''), '')
```

- `split('')` parte el texto en letras: `['h', 'o', 'l', 'a']`.
- `reverse()` les da la vuelta.
- `join('')` las vuelve a unir sin nada entre medias.

Si te piden hacerlo **sin** esos métodos, recorre el texto desde el final con un `for` y ve sumando letras a un texto nuevo.

<!-- /solucion -->

## 2. FizzBuzz

El ejercicio más famoso de las entrevistas. Escribe `fizzBuzz(n)`, que devuelva un array del 1 al `n` donde:

- los múltiplos de 3 son `'Fizz'`,
- los múltiplos de 5 son `'Buzz'`,
- los múltiplos de 3 **y** de 5 son `'FizzBuzz'`,
- el resto, el propio número.

```js playground=fizzbuzz
function fizzBuzz(n) {
  // tu código aquí
}

probar('hasta 5', fizzBuzz(5), [1, 2, 'Fizz', 4, 'Buzz'])
probar('el 15', fizzBuzz(15).at(-1), 'FizzBuzz')
probar('el 9', fizzBuzz(9).at(-1), 'Fizz')
```

<!-- solucion: Ver una pista -->

Para saber si un número es múltiplo de otro usa el operador **resto** `%`: `9 % 3` es `0`, así que 9 es múltiplo de 3. Y piensa bien **en qué orden** compruebas las condiciones.

<!-- /solucion -->

<!-- solucion -->

```js playground=fizzbuzz-solucion
function fizzBuzz(n) {
  const resultado = []

  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) resultado.push('FizzBuzz')
    else if (i % 3 === 0) resultado.push('Fizz')
    else if (i % 5 === 0) resultado.push('Buzz')
    else resultado.push(i)
  }

  return resultado
}

probar('hasta 5', fizzBuzz(5), [1, 2, 'Fizz', 4, 'Buzz'])
probar('el 15', fizzBuzz(15).at(-1), 'FizzBuzz')
probar('el 9', fizzBuzz(9).at(-1), 'Fizz')
```

La trampa está en el **orden**: si compruebas primero `i % 3`, el 15 entra ahí y nunca llega a ser `'FizzBuzz'`. Por eso el caso más específico (múltiplo de 3 y de 5, es decir, de 15) va primero.

<!-- /solucion -->

## 3. Contar vocales

Escribe `contarVocales(texto)`, que devuelva cuántas vocales tiene. Debe contar mayúsculas y vocales con tilde.

```js playground=vocales
function contarVocales(texto) {
  // tu código aquí
}

probar('murciélago', contarVocales('murciélago'), 5)
probar('mayúsculas', contarVocales('AEIOU'), 5)
probar('sin vocales', contarVocales('rhythm'), 0)
```

<!-- solucion -->

```js playground=vocales-solucion
function contarVocales(texto) {
  const vocales = 'aeiouáéíóúü'
  let cuenta = 0

  for (const letra of texto.toLowerCase()) {
    if (vocales.includes(letra)) cuenta++
  }

  return cuenta
}

probar('murciélago', contarVocales('murciélago'), 5)
probar('mayúsculas', contarVocales('AEIOU'), 5)
probar('sin vocales', contarVocales('rhythm'), 0)
```

- `toLowerCase()` primero, así no tienes que listar también las mayúsculas.
- `for...of` recorre un texto letra por letra.
- `includes` pregunta si la letra está en nuestra lista de vocales.

Versión corta con lo que vimos en el post de `filter`: `[...texto.toLowerCase()].filter(letra => vocales.includes(letra)).length`.

<!-- /solucion -->

## 4. ¿Es palíndromo?

Un palíndromo se lee igual al derecho y al revés, como *"Anita lava la tina"*. Escribe `esPalindromo(texto)`, que devuelva `true` o `false`. Ignora mayúsculas y espacios.

```js playground=palindromo
function esPalindromo(texto) {
  // tu código aquí
}

probar('oso', esPalindromo('oso'), true)
probar('con espacios', esPalindromo('Anita lava la tina'), true)
probar('no lo es', esPalindromo('hola'), false)
```

<!-- solucion: Ver una pista -->

Primero **limpia** el texto (minúsculas, sin espacios). Luego reutiliza lo que hiciste en el ejercicio 1.

<!-- /solucion -->

<!-- solucion -->

```js playground=palindromo-solucion
function esPalindromo(texto) {
  const limpio = texto.toLowerCase().replaceAll(' ', '')
  const alReves = limpio.split('').reverse().join('')
  return limpio === alReves
}

probar('oso', esPalindromo('oso'), true)
probar('con espacios', esPalindromo('Anita lava la tina'), true)
probar('no lo es', esPalindromo('hola'), false)
```

Fíjate en que el ejercicio se resolvió **combinando** el anterior con un paso de limpieza. Así se resuelven casi todos los problemas: con piezas pequeñas que ya sabes hacer.

<!-- /solucion -->

## 5. El mayor sin `Math.max`

Escribe `mayor(numeros)`, que devuelva el número más grande del array **sin** usar `Math.max` ni `sort`.

```js playground=mayor
function mayor(numeros) {
  // tu código aquí
}

probar('positivos', mayor([3, 9, 2, 7]), 9)
probar('negativos', mayor([-5, -2, -9]), -2)
probar('uno solo', mayor([42]), 42)
```

<!-- solucion -->

```js playground=mayor-solucion
function mayor(numeros) {
  let elMayor = numeros[0]

  for (const numero of numeros) {
    if (numero > elMayor) elMayor = numero
  }

  return elMayor
}

probar('positivos', mayor([3, 9, 2, 7]), 9)
probar('negativos', mayor([-5, -2, -9]), -2)
probar('uno solo', mayor([42]), 42)
```

La idea: "el primero es el mayor... hasta que alguien me demuestre lo contrario". Recorres el array y, si encuentras uno más grande, lo cambias.

El error típico es empezar con `let elMayor = 0`. Funciona con positivos, pero con `[-5, -2, -9]` devuelve `0`, ¡que ni siquiera está en el array! Por eso el caso de prueba de negativos.

<!-- /solucion -->

## Qué entrenaste

- Convertir entre **texto y array** (`split`, `join`).
- El operador **resto** `%` y el **orden** de las condiciones.
- Recorrer con **`for...of`** y llevar una cuenta.
- **Combinar** soluciones pequeñas.
- Pensar en **casos límite**: vacío, un solo elemento, negativos.

Ese último punto es el que más se valora en una prueba técnica: no solo que funcione, sino que pienses en qué podría romperlo.
