---
title: 'Prueba técnica: encuentra los dos números que suman X'
description: 'El ejercicio más famoso de las entrevistas (Two Sum). Primero la solución con dos bucles, luego la rápida con un Map. Enunciado, pistas y solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica]
draft: true
---

Si buscas "pruebas técnicas de programación", este ejercicio aparece el primero. En inglés se llama **Two Sum** y es famoso por una razón: tiene una solución **sencilla** y una solución **rápida**, y el entrevistador quiere ver si llegas de una a la otra.

Tiempo recomendado: **20 minutos**.

## El enunciado

> Escribe una función `dosSuman(numeros, objetivo)` que reciba un array de números y un número objetivo, y devuelva las **posiciones** de los dos números que sumados dan el objetivo.
>
> - Siempre hay exactamente una solución.
> - No puedes usar el mismo elemento dos veces.
> - Devuelve las posiciones en orden: la menor primero.

```js
dosSuman([2, 7, 11, 15], 9) // [0, 1] porque 2 + 7 = 9
```

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function dosSuman(numeros, objetivo) {
  // tu código aquí
}

probar('al principio', dosSuman([2, 7, 11, 15], 9), [0, 1])
probar('al final', dosSuman([3, 2, 4], 6), [1, 2])
probar('números repetidos', dosSuman([3, 3], 6), [0, 1])
probar('con negativos', dosSuman([-1, 8, 4, 6], 3), [0, 2])
```

Fíjate en el segundo caso: `[3, 2, 4]` con objetivo `6`. El `3 + 3` daría 6, pero no puedes usar el mismo elemento dos veces.

<!-- solucion: Ver una pista -->

La forma más directa: prueba **todas las parejas posibles**. Un bucle elige el primer número y otro bucle, dentro, elige el segundo. ¿Desde dónde tiene que empezar el segundo bucle para no repetir el mismo elemento?

<!-- /solucion -->

<!-- solucion: Ver la solución 1 (dos bucles) -->

```js playground=solucion-bucles
function dosSuman(numeros, objetivo) {
  for (let i = 0; i < numeros.length; i++) {
    for (let j = i + 1; j < numeros.length; j++) {
      if (numeros[i] + numeros[j] === objetivo) {
        return [i, j]
      }
    }
  }
}

probar('al principio', dosSuman([2, 7, 11, 15], 9), [0, 1])
probar('al final', dosSuman([3, 2, 4], 6), [1, 2])
probar('números repetidos', dosSuman([3, 3], 6), [0, 1])
probar('con negativos', dosSuman([-1, 8, 4, 6], 3), [0, 2])
```

El segundo bucle empieza en **`i + 1`**: así nunca compara un número consigo mismo y no prueba la misma pareja dos veces (`2 + 7` y luego `7 + 2`).

Funciona, pero tiene un problema: con un array de 10 000 números, hace unos **50 millones** de comparaciones. Cada número se compara con todos los demás. Es lo que el entrevistador te va a preguntar ahora: "¿se puede hacer más rápido?".

<!-- /solucion -->

<!-- solucion: Ver una pista para la versión rápida -->

Si estás mirando el número `7` y el objetivo es `9`, ya sabes **exactamente** qué número necesitas: `9 - 7 = 2`. La pregunta ya no es "¿con quién sumo?", sino "**¿he visto antes un 2?**".

¿Qué estructura te permite responder "¿he visto este número y en qué posición?" al instante, sin recorrer nada?

<!-- /solucion -->

<!-- solucion: Ver la solución 2 (con un Map) -->

```js playground=solucion-map
function dosSuman(numeros, objetivo) {
  const vistos = new Map() // número → posición donde lo vimos

  for (let i = 0; i < numeros.length; i++) {
    const necesito = objetivo - numeros[i]

    if (vistos.has(necesito)) {
      return [vistos.get(necesito), i]
    }

    vistos.set(numeros[i], i)
  }
}

probar('al principio', dosSuman([2, 7, 11, 15], 9), [0, 1])
probar('al final', dosSuman([3, 2, 4], 6), [1, 2])
probar('números repetidos', dosSuman([3, 3], 6), [0, 1])
probar('con negativos', dosSuman([-1, 8, 4, 6], 3), [0, 2])
```

Sigamos `[2, 7, 11, 15]` con objetivo `9`:

| Posición | Número | Necesito | ¿Lo he visto? | `vistos` después |
| --- | --- | --- | --- | --- |
| 0 | 2 | 7 | No | `{ 2 → 0 }` |
| 1 | 7 | 2 | **Sí, en la posición 0** | — devuelve `[0, 1]` |

Ahora recorremos el array **una sola vez**. Con 10 000 números, son 10 000 pasos en vez de 50 millones.

Un **`Map`** es como un objeto, pero pensado para buscar por clave: `has()` y `get()` responden al instante, tenga el tamaño que tenga.

Detalle importante: primero **comprobamos** y después **guardamos** el número actual. Si lo guardáramos antes, en `[3, 2, 4]` con objetivo 6, el 3 se encontraría a sí mismo.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que llegues primero a una solución que funcione.** La de dos bucles es perfectamente válida para empezar. Mejor una solución lenta que funciona que una rápida a medias.
- **Que expliques por qué es lenta**: compara cada número con todos los demás.
- **Que encuentres la idea clave**: "sé qué número necesito, solo tengo que recordar los que ya vi".
- **Que hables en voz alta** mientras piensas. En una entrevista, el razonamiento vale tanto como el código.

Si te hablan de **complejidad** o de la "notación O grande": la primera solución es **O(n²)** (crece con el cuadrado del tamaño) y la segunda **O(n)** (crece en línea recta). No hace falta dominarlo para un puesto junior, pero suma mucho saber explicar la diferencia con tus palabras.

## Pregunta de seguimiento

¿Y si en vez de las posiciones te piden **los números**, y el array está **ordenado** de menor a mayor? ¿Se te ocurre una forma de hacerlo sin `Map`?

<!-- solucion: Ver la respuesta -->

Con el array ordenado puedes usar **dos punteros**: uno al principio y otro al final.

```js playground=seguimiento
function dosSumanOrdenado(numeros, objetivo) {
  let izquierda = 0
  let derecha = numeros.length - 1

  while (izquierda < derecha) {
    const suma = numeros[izquierda] + numeros[derecha]

    if (suma === objetivo) return [numeros[izquierda], numeros[derecha]]
    if (suma < objetivo) izquierda++ // necesito una suma mayor
    else derecha--                   // necesito una suma menor
  }

  return null
}

probar('ordenado', dosSumanOrdenado([1, 3, 4, 6, 9], 10), [1, 9])
probar('sin solución', dosSumanOrdenado([1, 2, 3], 10), null)
```

Si la suma se queda corta, mueves el puntero izquierdo hacia números más grandes; si se pasa, mueves el derecho hacia números más pequeños. También recorre el array una sola vez y no necesita memoria extra.

<!-- /solucion -->
