---
title: 'Prueba técnica: implementa tu propio Promise.all'
description: 'Una de las preguntas de asincronía más pedidas: escribir Promise.all desde cero. Ejecutar promesas en paralelo, mantener el orden de los resultados, rechazar con el primer error y aceptar valores que no son promesas. Con solución oculta y Promise.allSettled de seguimiento.'
date: 2026-11-27
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Promesas, Asincronía]
draft: true
---

En el post de `Promise.all`, `allSettled` y `race` aprendiste a **usarlos**. En una entrevista de nivel medio, la pregunta va un paso más allá: "**impleméntalo tú**, sin usar `Promise.all`".

No es por capricho: para hacerlo bien tienes que entender de verdad cómo funcionan las promesas, qué pasa cuando se resuelven en un orden distinto al que se crearon y cómo manejar un error. Es la mejor forma de demostrar que dominas la asincronía.

Tiempo recomendado: **40 minutos**.

## El enunciado

> Escribe una función `todas(promesas)` que se comporte como `Promise.all`:
>
> 1. Recibe un array de promesas (o de valores normales).
> 2. Devuelve **una promesa** que se resuelve con un **array de resultados en el mismo orden** que el array de entrada, cuando **todas** se han resuelto.
> 3. Si **cualquiera** se rechaza, la promesa devuelta se **rechaza con ese error**, sin esperar a las demás.
> 4. Con un array vacío, se resuelve al momento con `[]`.

```js
const resultados = await todas([esperar(300, 'a'), esperar(100, 'b')])
// ['a', 'b'] (en el orden del array, aunque 'b' termine antes)
```

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}

// Una promesa que se resuelve con "valor" después de "ms" milisegundos
const esperar = (ms, valor) => new Promise((resolve) => setTimeout(() => resolve(valor), ms))

// Una promesa que se rechaza con un error después de "ms" milisegundos
const fallar = (ms, mensaje) => new Promise((_, reject) => setTimeout(() => reject(new Error(mensaje)), ms))
```

```js playground=reto
function todas(promesas) {
  // tu código aquí
}

async function pruebas() {
  probar('mantiene el orden', await todas([esperar(300, 'a'), esperar(100, 'b'), esperar(200, 'c')]), ['a', 'b', 'c'])
  probar('array vacío', await todas([]), [])
  probar('valores normales', await todas([1, esperar(50, 2), 3]), [1, 2, 3])

  const inicio = Date.now()
  const tres = await todas([esperar(200, 1), esperar(200, 2), esperar(200, 3)])
  probar('en paralelo (unos 200 ms, no 600)', tres?.length === 3 && Date.now() - inicio < 400, true)

  try {
    await todas([esperar(300, 'a'), fallar(100, '¡falló!'), esperar(200, 'c')])
    probar('rechaza si una falla', 'no rechazó', '¡falló!')
  } catch (error) {
    probar('rechaza si una falla', error.message, '¡falló!')
  }

  probar('devuelve una promesa', todas([]) instanceof Promise, true)
}

pruebas()
```

<!-- solucion: Ver una pista -->

Devuelve un `new Promise((resolve, reject) => ...)` y, dentro:

1. Crea un array `resultados` del mismo tamaño que la entrada, y un contador de cuántas han terminado.
2. Recorre las promesas **con su índice**. A cada una, engánchale un `.then` que guarde su resultado **en su posición** (`resultados[indice] = valor`), sume uno al contador y, si ya han terminado todas, llame a `resolve(resultados)`.
3. Engánchale también el `reject` para el primer error.

No uses `await` dentro de un bucle: las esperarías **una detrás de otra**, en vez de en paralelo. Y para aceptar valores normales, `Promise.resolve(valor)` convierte cualquier cosa en una promesa.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
function todas(promesas) {
  return new Promise((resolve, reject) => {
    const resultados = new Array(promesas.length)
    let terminadas = 0

    if (promesas.length === 0) {
      resolve([])
      return
    }

    promesas.forEach((promesa, indice) => {
      Promise.resolve(promesa).then((valor) => {
        resultados[indice] = valor
        terminadas++
        if (terminadas === promesas.length) resolve(resultados)
      }, reject)
    })
  })
}

async function pruebas() {
  probar('mantiene el orden', await todas([esperar(300, 'a'), esperar(100, 'b'), esperar(200, 'c')]), ['a', 'b', 'c'])
  probar('array vacío', await todas([]), [])
  probar('valores normales', await todas([1, esperar(50, 2), 3]), [1, 2, 3])

  const inicio = Date.now()
  const tres = await todas([esperar(200, 1), esperar(200, 2), esperar(200, 3)])
  probar('en paralelo (unos 200 ms, no 600)', tres?.length === 3 && Date.now() - inicio < 400, true)

  try {
    await todas([esperar(300, 'a'), fallar(100, '¡falló!'), esperar(200, 'c')])
    probar('rechaza si una falla', 'no rechazó', '¡falló!')
  } catch (error) {
    probar('rechaza si una falla', error.message, '¡falló!')
  }

  probar('devuelve una promesa', todas([]) instanceof Promise, true)
}

pruebas()
```

Lo que hay que entender:

- **El orden se mantiene por el índice**, no por quién termina antes. `'b'` termina primero, pero se guarda en `resultados[1]`. Por eso no vale `resultados.push(valor)`: el array quedaría en el orden de llegada.
- **El contador, no `resultados.length`**: el array se crea con su tamaño desde el principio (`new Array(3)` ya tiene `length` 3), así que su longitud no dice cuántas han terminado.
- **En paralelo**: el `forEach` engancha los `.then` a todas las promesas **sin esperar** a ninguna. Todas avanzan a la vez y el total tarda lo que la más lenta.
- **El primer error gana**: pasar `reject` como segundo argumento del `.then` rechaza la promesa con el primer error que llegue. Los siguientes errores o resultados llaman a `resolve` o `reject` otra vez, pero **una promesa solo cambia de estado una vez**: esas llamadas se ignoran. No hace falta ninguna comprobación extra.
- **`Promise.resolve(promesa)`** convierte los valores normales (`1`) en promesas ya resueltas, y deja las promesas tal cual.
- **El array vacío** necesita su caso: sin él, ningún `.then` llegaría a llamar a `resolve` y la promesa se quedaría pendiente para siempre.

### El error más común: `await` en un bucle

```js
// ❌ Funciona... pero en serie, no en paralelo
async function todasMal(promesas) {
  const resultados = []
  for (const promesa of promesas) {
    resultados.push(await promesa)
  }
  return resultados
}
```

Con promesas **ya creadas**, como en las pruebas, esta versión tarda lo mismo (todas estaban en marcha). Pero no rechaza al primer error: si la primera tarda 300 ms y la segunda falla a los 100 ms, no te enterarás del error hasta pasados 300 ms. Y el entrevistador te preguntará por qué lo hiciste así. La versión con `.then` y el contador es la que demuestra que entiendes las promesas.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que devuelvas una promesa** con `new Promise`.
- **El orden de los resultados** por índice, aunque terminen desordenadas.
- **Paralelismo real**: nada de `await` en un bucle.
- **El rechazo**: con el primer error, y sabiendo que una promesa solo cambia de estado una vez.
- **Los casos límite**: array vacío y valores que no son promesas.

## Pregunta de seguimiento

Implementa ahora `todasSinFallar(promesas)`, que se comporte como **`Promise.allSettled`**: espera a todas, **nunca se rechaza**, y devuelve un array con objetos `{ status: 'fulfilled', value }` o `{ status: 'rejected', reason }`.

<!-- solucion: Ver la respuesta -->

Es la misma estructura, pero tanto el éxito como el error **guardan un resultado** y cuentan como "terminada":

```js playground=seguimiento
function todasSinFallar(promesas) {
  return new Promise((resolve) => {
    const resultados = new Array(promesas.length)
    let terminadas = 0

    if (promesas.length === 0) return resolve([])

    const guardar = (indice, resultado) => {
      resultados[indice] = resultado
      terminadas++
      if (terminadas === promesas.length) resolve(resultados)
    }

    promesas.forEach((promesa, indice) => {
      Promise.resolve(promesa).then(
        (value) => guardar(indice, { status: 'fulfilled', value }),
        (error) => guardar(indice, { status: 'rejected', reason: error.message })
      )
    })
  })
}

todasSinFallar([esperar(100, 'ok'), fallar(50, 'sin conexión'), 42]).then((resultados) => {
  probar('allSettled propio', resultados, [
    { status: 'fulfilled', value: 'ok' },
    { status: 'rejected', reason: 'sin conexión' },
    { status: 'fulfilled', value: 42 }
  ])
})
```

(El `Promise.allSettled` real guarda el **error completo** en `reason`; aquí guardamos `error.message` para que la comparación de la prueba sea más sencilla.)

Otras variantes que te pueden pedir con la misma idea: **`Promise.race`** (resuelve o rechaza con la primera que termine, sin contador) y **`Promise.any`** (resuelve con la primera que **funcione**, y solo rechaza si fallan todas).

<!-- /solucion -->
