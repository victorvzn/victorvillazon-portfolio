---
title: 'Prueba técnica: implementa un debounce para un buscador'
description: 'Un buscador que llama a la API con cada tecla es lento y caro. Implementa tu propia función debounce: enunciado, pistas y solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Eventos, Closures]
draft: true
---

Esta es una pregunta muy frecuente en entrevistas de **frontend**, porque mezcla tres cosas que se usan a diario: eventos, temporizadores (`setTimeout`) y closures.

Tiempo recomendado: **30 minutos**. Si todavía no te suenan los closures, lee antes el post de closures: aquí los vas a necesitar.

## El problema

Tienes un buscador. Cada vez que el usuario escribe una letra, se hace una búsqueda. Si escribe "javascript", son **10 búsquedas** en un segundo, y solo la última importa.

```html playground=problema
<input id="buscador" placeholder="Escribe rápido...">
<p>Búsquedas hechas: <strong id="contador">0</strong></p>
```

```js playground=problema
const buscador = document.querySelector('#buscador')
const contador = document.querySelector('#contador')
let busquedas = 0

const buscar = (texto) => {
  busquedas++
  contador.textContent = busquedas
  console.log(`Buscando: "${texto}"`)
}

buscador.addEventListener('input', (event) => buscar(event.target.value))
```

Escribe una palabra y mira el contador. En una app real, cada una de esas búsquedas es una petición al servidor.

## El enunciado

> Escribe una función `debounce(funcion, espera)` que devuelva una **nueva función**. Al llamar a esa nueva función, `funcion` no se ejecuta enseguida: espera `espera` milisegundos. Si se vuelve a llamar antes de que pase ese tiempo, la espera **se reinicia**.
>
> Resultado: `funcion` solo se ejecuta cuando el usuario **deja de escribir** durante `espera` ms, y recibe los argumentos de la última llamada.

Piensa en el ascensor: la puerta espera unos segundos antes de cerrarse, y si alguien entra, vuelve a esperar desde cero.

## Tu turno

```html playground=reto
<input id="buscador" placeholder="Escribe rápido...">
<p>Búsquedas hechas: <strong id="contador">0</strong></p>
```

```js playground=reto
function debounce(funcion, espera) {
  // tu código aquí
}

const buscador = document.querySelector('#buscador')
const contador = document.querySelector('#contador')
let busquedas = 0

const buscar = (texto) => {
  busquedas++
  contador.textContent = busquedas
  console.log(`Buscando: "${texto}"`)
}

const buscarConCalma = debounce(buscar, 400)

buscador.addEventListener('input', (event) => buscarConCalma(event.target.value))
```

Sabrás que funciona cuando escribas "javascript" de seguido y el contador solo suba **una vez**, con el texto completo.

<!-- solucion: Ver la pista 1 -->

`debounce` no ejecuta nada: **devuelve una función**. Empieza por ahí:

```js
function debounce(funcion, espera) {
  return (...args) => {
    // esto se ejecuta con cada tecla
  }
}
```

`...args` recoge todos los argumentos que te pasen, sean los que sean.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 -->

`setTimeout` devuelve un identificador, y `clearTimeout(identificador)` cancela ese temporizador si aún no se ejecutó. Necesitas guardar el identificador en un sitio que **sobreviva entre llamadas**... ¿dónde?

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<input id="buscador" placeholder="Escribe rápido...">
<p>Búsquedas hechas: <strong id="contador">0</strong></p>
```

```js playground=solucion
function debounce(funcion, espera) {
  let temporizador // vive en el closure: se comparte entre todas las llamadas

  return (...args) => {
    clearTimeout(temporizador) // cancela la espera anterior, si la había
    temporizador = setTimeout(() => funcion(...args), espera)
  }
}

const buscador = document.querySelector('#buscador')
const contador = document.querySelector('#contador')
let busquedas = 0

const buscar = (texto) => {
  busquedas++
  contador.textContent = busquedas
  console.log(`Buscando: "${texto}"`)
}

const buscarConCalma = debounce(buscar, 400)

buscador.addEventListener('input', (event) => buscarConCalma(event.target.value))
```

Cuatro líneas, pero cada una importa:

1. **`let temporizador`** está fuera de la función devuelta. Gracias al closure, todas las llamadas ven **la misma** variable. Si la pusieras dentro, cada tecla tendría la suya y no podría cancelar la anterior.
2. **`clearTimeout(temporizador)`** cancela la búsqueda que estaba esperando. La primera vez, `temporizador` es `undefined` y `clearTimeout` simplemente no hace nada.
3. **`setTimeout(...)`** programa una búsqueda nueva para dentro de `espera` ms.
4. **`funcion(...args)`** pasa los argumentos de la última llamada, es decir, el texto completo.

Así, mientras escribes, cada tecla cancela la búsqueda anterior y programa otra. Solo la última llega a ejecutarse.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que entiendas que `debounce` devuelve una función** y no ejecuta nada por sí misma.
- **Dónde guardas el temporizador.** Es el punto clave y demuestra que entiendes los closures.
- **Que pases los argumentos** (`...args`). Muchas soluciones olvidan que la función original necesita el texto.
- **Que sepas cuándo usarlo**: buscadores, guardado automático, redimensionar la ventana (`resize`).

## Preguntas de seguimiento

1. ¿Qué diferencia hay entre **debounce** y **throttle**?
2. ¿Qué valor de `espera` elegirías para un buscador y por qué?

<!-- solucion: Ver las respuestas -->

1. **Debounce** espera a que el usuario **pare** y ejecuta una sola vez al final. **Throttle** ejecuta **como mucho una vez cada X ms**, aunque el usuario no pare. Debounce es ideal para un buscador; throttle, para algo continuo como el `scroll`, donde quieres actualizar mientras se mueve, pero no 60 veces por segundo.
2. Entre **250 y 500 ms** suele funcionar bien. Menos, y sigues haciendo muchas peticiones. Más, y el usuario siente que el buscador va lento. Lo importante es explicar que es un equilibrio entre **rendimiento** y **sensación de respuesta**.

<!-- /solucion -->
