---
title: 'Prueba técnica: implementa un throttle para el scroll'
description: 'El hermano del debounce: limitar cuántas veces se ejecuta una función por segundo. Enunciado, diferencia con debounce, casos de prueba y solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Eventos, Closures]
draft: true
---

Si hiciste la prueba técnica del **debounce**, esta es su pareja natural, y en las entrevistas suelen preguntarlas juntas: "¿Qué diferencia hay entre debounce y throttle? Implementa el throttle".

Tiempo recomendado: **25 minutos**. Necesitas tener claros los closures y `setTimeout`.

## El problema

Eventos como `scroll`, `mousemove` o `resize` se disparan **decenas de veces por segundo**. Si en cada uno haces algo costoso (calcular posiciones, pedir datos, actualizar la página), todo se vuelve lento.

```html playground=problema
<div id="zona">Mueve el ratón por aquí</div>
<p>Eventos recibidos: <strong id="contador">0</strong></p>
```

```css playground=problema
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

#zona {
  display: grid;
  place-items: center;
  height: 180px;
  border: 2px dashed #a1a1aa;
  border-radius: 12px;
}
```

```js playground=problema
let eventos = 0

document.querySelector('#zona').addEventListener('mousemove', () => {
  eventos++
  document.querySelector('#contador').textContent = eventos
})
```

Mueve el ratón un par de segundos: cientos de eventos.

## Debounce vs throttle

| | Debounce | Throttle |
| --- | --- | --- |
| Idea | "Espera a que **paren** de llamarme" | "Ejecútame **como mucho una vez cada X ms**" |
| Mientras el usuario sigue... | No se ejecuta nunca | Se ejecuta a ritmo constante |
| Ejemplo cotidiano | El ascensor que espera a que no entre nadie más para cerrar | Un grifo que gotea una gota por segundo, por mucho que abras |
| Ideal para | Buscadores, guardar un borrador al dejar de escribir | Scroll, `mousemove`, `resize`, botones que se pulsan muchas veces |

## El enunciado

> Escribe `throttle(funcion, espera)`, que devuelva una **nueva función**. Al llamarla:
>
> - Si han pasado al menos `espera` milisegundos desde la última vez que se **ejecutó** `funcion` (o nunca se ha ejecutado), ejecútala **inmediatamente** con los argumentos recibidos.
> - Si no, **ignora** la llamada.

## Tu turno

Esta prueba lanza llamadas en momentos concretos y comprueba cuáles se ejecutaron:

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}

// Llama a "fn" con cada letra en el milisegundo indicado y, al final, comprueba el resultado
const simular = (fn, llamadas, alTerminar) => {
  llamadas.forEach(([ms, letra]) => setTimeout(() => fn(letra), ms))
  setTimeout(alTerminar, Math.max(...llamadas.map(([ms]) => ms)) + 100)
}
```

```js playground=reto
function throttle(funcion, espera) {
  // tu código aquí
}

const ejecutadas = []
const registrar = throttle((letra) => ejecutadas.push(letra), 100)

simular(registrar, [[0, 'a'], [20, 'b'], [40, 'c'], [60, 'd'], [150, 'e'], [160, 'f'], [300, 'g']], () => {
  probar('una ejecución cada 100 ms como mucho', ejecutadas, ['a', 'e', 'g'])
})
```

Fíjate en el resultado esperado: `a` se ejecuta al instante; `b`, `c` y `d` llegan antes de 100 ms y se ignoran; `e` llega a los 150 ms (ya pasaron más de 100 desde `a`) y se ejecuta; `f` llega solo 10 ms después de `e` y se ignora; y `g`, a los 300 ms, se ejecuta.

<!-- solucion: Ver una pista -->

Igual que en el debounce, la nueva función necesita **recordar algo entre llamadas** gracias a un closure. Pero aquí no guardas un temporizador: guardas **cuándo fue la última ejecución**.

`Date.now()` te da el momento actual en milisegundos. Si `Date.now() - ultimaEjecucion >= espera`, toca ejecutar.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
function throttle(funcion, espera) {
  let ultimaEjecucion = 0

  return function (...argumentos) {
    const ahora = Date.now()
    if (ahora - ultimaEjecucion < espera) return // demasiado pronto: ignoramos

    ultimaEjecucion = ahora
    funcion.apply(this, argumentos)
  }
}

const ejecutadas = []
const registrar = throttle((letra) => ejecutadas.push(letra), 100)

simular(registrar, [[0, 'a'], [20, 'b'], [40, 'c'], [60, 'd'], [150, 'e'], [160, 'f'], [300, 'g']], () => {
  probar('una ejecución cada 100 ms como mucho', ejecutadas, ['a', 'e', 'g'])
})
```

Paso a paso:

- **`ultimaEjecucion` vive en el closure**: cada función que devuelve `throttle` tiene la suya, y se mantiene entre llamadas.
- **Empieza en `0`**, así que la primera llamada siempre se ejecuta (`Date.now()` es un número enorme).
- **Retorno temprano** si es demasiado pronto: el resto de la función solo se lee en el caso que importa.
- **`...argumentos` y `apply(this, ...)`**: la función original recibe los mismos argumentos y el mismo `this` que la llamada, como si no hubiera nada en medio. Así funciona también con `addEventListener` y con métodos de objetos.

Y en la página:

```html playground=demo
<div id="zona">Mueve el ratón por aquí</div>
<p>Eventos recibidos: <strong id="todos">0</strong></p>
<p>Ejecuciones con throttle (200 ms): <strong id="limitados">0</strong></p>
```

```css playground=demo
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

#zona {
  display: grid;
  place-items: center;
  height: 180px;
  border: 2px dashed #a1a1aa;
  border-radius: 12px;
}
```

```js playground=demo
function throttle(funcion, espera) {
  let ultimaEjecucion = 0
  return function (...argumentos) {
    const ahora = Date.now()
    if (ahora - ultimaEjecucion < espera) return
    ultimaEjecucion = ahora
    funcion.apply(this, argumentos)
  }
}

let todos = 0
let limitados = 0
const zona = document.querySelector('#zona')

zona.addEventListener('mousemove', () => {
  document.querySelector('#todos').textContent = ++todos
})

zona.addEventListener('mousemove', throttle(() => {
  document.querySelector('#limitados').textContent = ++limitados
}, 200))
```

Mueve el ratón: el primer contador se dispara, y el segundo sube como mucho 5 veces por segundo.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que sepas explicar la diferencia con el debounce** con un ejemplo de cuándo usar cada uno.
- **El closure**: que el estado (`ultimaEjecucion`) viva dentro de `throttle` y no en una variable global.
- **Que respetes los argumentos y el `this`** de la llamada original.
- **Que uses `addEventListener` con la función ya "throttleada"**, creada **una vez** (no `throttle(...)` dentro del listener en cada evento, que crearía una función nueva cada vez y no limitaría nada).

## Pregunta de seguimiento

Con esta versión, si el usuario hace scroll durante 150 ms y para, la **última** posición nunca se procesa (la llamada de los 120 ms se ignoró). ¿Cómo harías que, además, se ejecute **una última vez** al final con los argumentos más recientes?

<!-- solucion: Ver la respuesta -->

```js playground=seguimiento
function throttle(funcion, espera) {
  let ultimaEjecucion = 0
  let temporizador = null

  return function (...argumentos) {
    const ahora = Date.now()
    const restante = espera - (ahora - ultimaEjecucion)

    if (restante <= 0) {
      clearTimeout(temporizador)
      temporizador = null
      ultimaEjecucion = ahora
      funcion.apply(this, argumentos)
    } else {
      // Programamos (o reprogramamos) una ejecución final con los últimos argumentos
      clearTimeout(temporizador)
      temporizador = setTimeout(() => {
        ultimaEjecucion = Date.now()
        temporizador = null
        funcion.apply(this, argumentos)
      }, restante)
    }
  }
}

const ejecutadas = []
const registrar = throttle((letra) => ejecutadas.push(letra), 100)
registrar('a') // se ejecuta ya
registrar('b') // se ignora...
registrar('c') // ...pero c queda programada para cuando pasen los 100 ms

setTimeout(() => console.log(ejecutadas), 300) // ['a', 'c']
```

Cuando una llamada llega "demasiado pronto", en vez de ignorarla sin más, **programamos** una ejecución para cuando termine la espera. Si llegan más llamadas mientras tanto, reprogramamos con los argumentos nuevos. A esto se le llama ejecución ***trailing*** (al final), y la de la versión anterior, ***leading*** (al principio). Librerías como Lodash ofrecen las dos opciones.

<!-- /solucion -->
