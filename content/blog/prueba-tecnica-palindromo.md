---
title: 'Prueba técnica: ¿es un palíndromo?'
description: 'Comprueba si una palabra o frase se lee igual al derecho y al revés, ignorando mayúsculas, espacios, tildes y signos. Enunciado, casos de prueba y dos soluciones ocultas.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica, Strings]
draft: true
---

Un **palíndromo** es una palabra o frase que se lee igual de izquierda a derecha que de derecha a izquierda: `oso`, `reconocer`, `Anita lava la tina`. Es un ejercicio de entrevista muy típico porque combina **manipular textos** con **pensar en los casos raros**.

Tiempo recomendado: **20 minutos**.

## El enunciado

> Escribe una función `esPalindromo(texto)` que devuelva `true` si el texto es un palíndromo y `false` si no.
>
> Hay que ignorar las **mayúsculas**, los **espacios**, las **tildes** y los **signos de puntuación**.

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function esPalindromo(texto) {
  // tu código aquí
}

probar('una palabra', esPalindromo('oso'), true)
probar('no es palíndromo', esPalindromo('hola'), false)
probar('mayúsculas', esPalindromo('Reconocer'), true)
probar('frase con espacios', esPalindromo('Anita lava la tina'), true)
probar('con tildes y signos', esPalindromo('¿Acaso hubo búhos acá?'), true)
probar('una letra', esPalindromo('a'), true)
probar('texto vacío', esPalindromo(''), true)
probar('números', esPalindromo('12321'), true)
```

Antes de programar, divide el problema en dos partes: **limpiar** el texto y **comprobar** si es palíndromo.

<!-- solucion: Ver una pista -->

Para dar la vuelta a un texto: conviértelo en array de letras con `split('')`, invierte el array con `reverse()` (o `toReversed()`) y vuelve a unirlo con `join('')`.

Para quitar las tildes: `texto.normalize('NFD')` separa cada letra de su tilde, y luego puedes borrar las tildes sueltas con `replace(/[̀-ͯ]/g, '')`.

<!-- /solucion -->

<!-- solucion: Ver la solución 1 (dar la vuelta) -->

```js playground=solucion-reverse
const limpiar = (texto) => texto
  .toLowerCase()
  .normalize('NFD')                 // 'á' → 'a' + tilde suelta
  .replace(/[̀-ͯ]/g, '')  // borra las tildes sueltas
  .replace(/[^a-z0-9ñ]/g, '')       // deja solo letras y números

function esPalindromo(texto) {
  const limpio = limpiar(texto)
  return limpio === limpio.split('').reverse().join('')
}

probar('una palabra', esPalindromo('oso'), true)
probar('no es palíndromo', esPalindromo('hola'), false)
probar('mayúsculas', esPalindromo('Reconocer'), true)
probar('frase con espacios', esPalindromo('Anita lava la tina'), true)
probar('con tildes y signos', esPalindromo('¿Acaso hubo búhos acá?'), true)
probar('una letra', esPalindromo('a'), true)
probar('texto vacío', esPalindromo(''), true)
probar('números', esPalindromo('12321'), true)
```

Primero **normalizamos** el texto (minúsculas, sin tildes, solo letras y números) y después comparamos el texto con su versión al revés.

Un detalle con la `ñ`: `normalize('NFD')` también la separa en `n` + virgulilla, y el `replace` de las tildes la convierte en `n`. Para este ejercicio no importa (seguimos comparando el texto consigo mismo), pero si necesitaras conservarla, tendrías que tratarla aparte.

<!-- /solucion -->

<!-- solucion: Ver la solución 2 (dos punteros) -->

```js playground=solucion-punteros
const limpiar = (texto) => texto
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9ñ]/g, '')

function esPalindromo(texto) {
  const limpio = limpiar(texto)
  let izquierda = 0
  let derecha = limpio.length - 1

  while (izquierda < derecha) {
    if (limpio[izquierda] !== limpio[derecha]) return false
    izquierda++
    derecha--
  }

  return true
}

probar('una palabra', esPalindromo('oso'), true)
probar('no es palíndromo', esPalindromo('hola'), false)
probar('mayúsculas', esPalindromo('Reconocer'), true)
probar('frase con espacios', esPalindromo('Anita lava la tina'), true)
probar('con tildes y signos', esPalindromo('¿Acaso hubo búhos acá?'), true)
probar('una letra', esPalindromo('a'), true)
probar('texto vacío', esPalindromo(''), true)
probar('números', esPalindromo('12321'), true)
```

La técnica de los **dos punteros**: uno empieza por el principio y otro por el final, y avanzan hacia el centro comparando letras. En cuanto encuentran dos distintas, ya sabemos que **no** es palíndromo y paramos.

¿Por qué es mejor? La solución 1 crea **un array y un texto nuevos** del mismo tamaño y siempre recorre todo. Esta no crea nada extra y, si el texto no es palíndromo, suele terminar mucho antes. Con palabras cortas no se nota, pero es justo la mejora que el entrevistador quiere que sepas explicar.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que limpies el texto** antes de comparar, y que lo hagas en una función aparte.
- **Los casos límite**: una letra, el texto vacío, números.
- **Que conozcas más de una solución** y sepas explicar la diferencia: la primera es más corta y legible; la de dos punteros, más eficiente.
- **Que preguntes**: "¿cuentan los números? ¿y la ñ?".

## Pregunta de seguimiento

Escribe `palindromoMasLargo(texto)`, que devuelva la palabra palíndroma más larga de una frase. Por ejemplo, en `'el oso y la anilina se reconocen'` sería `'anilina'`.

<!-- solucion: Ver la respuesta -->

```js playground=seguimiento
const limpiar = (texto) => texto
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9ñ]/g, '')

const esPalindromo = (texto) => {
  const limpio = limpiar(texto)
  return limpio === limpio.split('').reverse().join('')
}

function palindromoMasLargo(frase) {
  return frase
    .split(' ')
    .filter((palabra) => palabra && esPalindromo(palabra))
    .reduce((masLarga, palabra) => (palabra.length > masLarga.length ? palabra : masLarga), '')
}

console.log(palindromoMasLargo('el oso y la anilina se reconocen')) // 'anilina'
```

Fíjate en que **reutilizamos** `esPalindromo`: tenerla como una función independiente y bien probada hace que el siguiente problema sea casi trivial.

<!-- /solucion -->
