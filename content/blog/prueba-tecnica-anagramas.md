---
title: 'Prueba técnica: ¿son anagramas?'
description: 'Un ejercicio clásico de entrevista para junior: comprobar si dos palabras tienen las mismas letras. Enunciado, casos de prueba y solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica]
draft: false
---

Este ejercicio aparece en muchísimas pruebas técnicas para junior. Es corto, pero deja ver cómo piensas: si limpias los datos, si piensas en casos raros y si conoces más de una forma de resolverlo.

Ponte un temporizador de **20 minutos** y trátalo como si fuera la entrevista de verdad.

## El enunciado

> Escribe una función `sonAnagramas(a, b)` que devuelva `true` si las dos palabras o frases son anagramas, y `false` si no.
>
> Dos textos son **anagramas** si tienen exactamente las mismas letras, la misma cantidad de veces, en cualquier orden. Se ignoran las mayúsculas y los espacios.

Ejemplos: `amor` y `roma` son anagramas. `Listen` y `Silent` también. `hola` y `holaa` no (hay una `a` de más).

## Tu turno

La función `probar` muestra ✅ o ❌ en la consola para cada caso:

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function sonAnagramas(a, b) {
  // tu código aquí
}

probar('amor / roma', sonAnagramas('amor', 'roma'), true)
probar('mayúsculas', sonAnagramas('Listen', 'Silent'), true)
probar('con espacios', sonAnagramas('el saco', 'la cose'), true)
probar('letra de más', sonAnagramas('hola', 'holaa'), false)
probar('mismas letras, distinta cantidad', sonAnagramas('aab', 'abb'), false)
probar('nada que ver', sonAnagramas('gato', 'perro'), false)
```

Antes de escribir código, **dilo en voz alta** (en una entrevista real, el entrevistador quiere oírte pensar): ¿qué pasos necesitas?

<!-- solucion: Ver una pista -->

Si ordenas las letras de dos anagramas alfabéticamente, ¿qué obtienes? Prueba con `amor` y `roma`.

<!-- /solucion -->

<!-- solucion: Ver la solución 1 (ordenar) -->

```js playground=solucion-ordenar
const normalizar = (texto) => texto
  .toLowerCase()
  .replaceAll(' ', '')
  .split('')
  .sort()
  .join('')

function sonAnagramas(a, b) {
  return normalizar(a) === normalizar(b)
}

probar('amor / roma', sonAnagramas('amor', 'roma'), true)
probar('mayúsculas', sonAnagramas('Listen', 'Silent'), true)
probar('con espacios', sonAnagramas('el saco', 'la cose'), true)
probar('letra de más', sonAnagramas('hola', 'holaa'), false)
probar('mismas letras, distinta cantidad', sonAnagramas('aab', 'abb'), false)
probar('nada que ver', sonAnagramas('gato', 'perro'), false)
```

`amor` ordenado es `amor` y `roma` ordenado también es `amor`. Si dos textos ordenados son iguales, tienen las mismas letras en la misma cantidad.

Fíjate en que la limpieza va en **una función aparte** (`normalizar`). Así no repites el mismo código para `a` y para `b`, y la función principal se lee como una frase.

<!-- /solucion -->

<!-- solucion: Ver la solución 2 (contar letras) -->

```js playground=solucion-contar
const contarLetras = (texto) => {
  const cuenta = {}
  for (const letra of texto.toLowerCase().replaceAll(' ', '')) {
    cuenta[letra] = (cuenta[letra] ?? 0) + 1
  }
  return cuenta
}

function sonAnagramas(a, b) {
  const letrasA = contarLetras(a)
  const letrasB = contarLetras(b)

  const clavesA = Object.keys(letrasA)
  if (clavesA.length !== Object.keys(letrasB).length) return false

  return clavesA.every(letra => letrasA[letra] === letrasB[letra])
}

probar('amor / roma', sonAnagramas('amor', 'roma'), true)
probar('mayúsculas', sonAnagramas('Listen', 'Silent'), true)
probar('con espacios', sonAnagramas('el saco', 'la cose'), true)
probar('letra de más', sonAnagramas('hola', 'holaa'), false)
probar('mismas letras, distinta cantidad', sonAnagramas('aab', 'abb'), false)
probar('nada que ver', sonAnagramas('gato', 'perro'), false)
```

Cuentas cuántas veces aparece cada letra en los dos textos (el patrón de "contar con un objeto") y compruebas que las cuentas coinciden.

Es más largo, pero **más rápido** con textos muy largos: ordenar cuesta más que recorrer una sola vez. Con palabras normales no se nota; lo importante es que sepas explicar la diferencia.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que preguntes antes de programar.** "¿Cuentan las tildes? ¿Y los signos de puntuación?" Hacer preguntas no es debilidad: es lo que hace un buen profesional.
- **Que normalices los datos** (minúsculas, espacios) en vez de olvidarlo.
- **Que pruebes casos límite**, como `aab` / `abb`: tienen las mismas letras, pero no la misma cantidad.
- **Que el código se lea bien**: nombres claros y funciones pequeñas.

## Preguntas de seguimiento

Si terminas rápido, es probable que te hagan alguna de estas. Intenta responderlas:

1. ¿Qué pasa con `'Ángel'` y `'glena'`?
2. ¿Y si los textos tienen signos, como `'¡Roma!'` y `'amor'`?

<!-- solucion: Ver las respuestas -->

1. Devuelve `false`, porque `á` y `a` son letras distintas para JavaScript. Para ignorar tildes: `texto.normalize('NFD').replace(/[̀-ͯ]/g, '')`. `normalize('NFD')` separa la letra de su tilde y la expresión regular borra las tildes sueltas.
2. También `false`. Puedes quedarte solo con letras y números: `texto.replace(/[^a-z0-9ñ]/g, '')` (después de pasarlo a minúsculas y quitar las tildes).

No hace falta que te sepas estas expresiones de memoria. Basta con saber que **existen** y explicar qué harías: "normalizaría el texto quitando tildes y signos antes de comparar".

<!-- /solucion -->
