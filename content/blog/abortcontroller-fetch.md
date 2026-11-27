---
title: 'Cancelar peticiones con AbortController (y poner un tiempo máximo a fetch)'
description: 'Cómo cancelar un fetch que ya no necesitas, evitar que una respuesta vieja pise a la nueva en un buscador y abortar una petición que tarda demasiado con AbortSignal.timeout.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fetch, Asincronía]
draft: true
---

Escribes en un buscador: `t`, `te`, `tec`, `tecl`, `tecla`. Cada letra lanza una petición. Pero las respuestas no siempre llegan en orden: si la de `te` tarda más que la de `tecla`, llega **después** y **pisa** los resultados buenos. El usuario ve resultados de "te" con "tecla" escrito en el buscador.

Este bug se llama **condición de carrera** (*race condition*), y la solución es **cancelar** las peticiones que ya no sirven. Para eso existe `AbortController`.

## Cómo funciona

`AbortController` tiene dos piezas:

- **`controlador.signal`**: una "señal" que le pasas al `fetch`.
- **`controlador.abort()`**: cuando lo llamas, la señal avisa y el `fetch` **se cancela**.

```js playground=basico
const controlador = new AbortController()

fetch('https://dummyjson.com/products?delay=3000', { signal: controlador.signal })
  .then((respuesta) => respuesta.json())
  .then((datos) => console.log('Llegaron los datos', datos))
  .catch((error) => {
    if (error.name === 'AbortError') {
      console.log('Petición cancelada 🛑')
    } else {
      console.log('Otro error:', error.message)
    }
  })

// Cancelamos al segundo, antes de que llegue la respuesta
setTimeout(() => controlador.abort(), 1000)
```

`?delay=3000` le pide a DummyJSON que tarde 3 segundos en responder, para que nos dé tiempo a cancelarla.

Cuando se cancela, el `fetch` se **rechaza** con un error cuyo `name` es **`'AbortError'`**. Compruébalo en el `catch`: una cancelación **no es un error real**, así que normalmente no quieres mostrarle nada al usuario.

Abre la pestaña **Network** de las DevTools: verás la petición marcada como **(canceled)**.

## Caso 1: un buscador sin respuestas viejas

Guardamos el controlador de la última búsqueda. Antes de lanzar una nueva, **cancelamos la anterior**:

```html playground=buscador
<input id="buscar" placeholder="Busca un producto: phone, laptop..." aria-label="Buscar">
<ul id="resultados"></ul>
```

```css playground=buscador
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

input {
  width: 100%;
  max-width: 360px;
  padding: 8px 12px;
  font: inherit;
}
```

```js playground=buscador
const campo = document.querySelector('#buscar')
const lista = document.querySelector('#resultados')
let controladorActual = null

campo.addEventListener('input', async () => {
  const termino = campo.value.trim()

  // 1. Cancelamos la búsqueda anterior, si sigue en marcha
  controladorActual?.abort()

  if (!termino) {
    lista.replaceChildren()
    return
  }

  // 2. Creamos un controlador nuevo para esta búsqueda
  controladorActual = new AbortController()

  try {
    const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(termino)}`
    const respuesta = await fetch(url, { signal: controladorActual.signal })
    const { products } = await respuesta.json()

    lista.replaceChildren(...products.map((producto) => {
      const item = document.createElement('li')
      item.textContent = producto.title
      return item
    }))
  } catch (error) {
    if (error.name === 'AbortError') return // cancelada a propósito: no pasa nada
    console.error(error)
  }
})
```

Escribe rápido y mira la pestaña Network: todas las peticiones menos la última aparecen como canceladas. Ahora es **imposible** que una respuesta vieja pise a la nueva.

> Combinado con un **debounce** (esperar a que el usuario deje de escribir, como en la prueba técnica de debounce), además de no pisarse, haces muchas menos peticiones.

`controladorActual?.abort()` usa **optional chaining**: la primera vez, `controladorActual` es `null` y no hace nada.

## Caso 2: un tiempo máximo con `AbortSignal.timeout`

Si la API no responde, `fetch` puede quedarse esperando muchísimo. Con **`AbortSignal.timeout(ms)`** creas una señal que se cancela sola pasado ese tiempo:

```js playground=timeout
async function cargarConLimite() {
  try {
    const respuesta = await fetch('https://dummyjson.com/products?delay=5000', {
      signal: AbortSignal.timeout(2000) // máximo 2 segundos
    })
    const datos = await respuesta.json()
    console.log(datos)
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.log('La API tardó demasiado. Inténtalo más tarde ⏱️')
    } else {
      console.log('Error:', error.message)
    }
  }
}

cargarConLimite()
```

Ojo: cuando la cancelación es por tiempo, el error se llama **`'TimeoutError'`**, no `'AbortError'`. Así puedes distinguir "el usuario canceló" de "tardó demasiado".

## Caso 3: un botón "Cancelar"

Para descargas o peticiones largas, darle al usuario un botón para cancelar es muy buena experiencia:

```html playground=boton
<button id="cargar">Cargar informe</button>
<button id="cancelar" disabled>Cancelar</button>
<p id="estado"></p>
```

```js playground=boton
const botonCargar = document.querySelector('#cargar')
const botonCancelar = document.querySelector('#cancelar')
const estado = document.querySelector('#estado')
let controlador

botonCargar.addEventListener('click', async () => {
  controlador = new AbortController()
  botonCargar.disabled = true
  botonCancelar.disabled = false
  estado.textContent = 'Generando informe...'

  try {
    const respuesta = await fetch('https://dummyjson.com/products?delay=4000', { signal: controlador.signal })
    const { total } = await respuesta.json()
    estado.textContent = `Informe listo: ${total} productos ✅`
  } catch (error) {
    estado.textContent = error.name === 'AbortError' ? 'Cancelado por el usuario' : 'Algo salió mal'
  } finally {
    botonCargar.disabled = false
    botonCancelar.disabled = true
  }
})

botonCancelar.addEventListener('click', () => controlador.abort())
```

## Bonus: quitar varios event listeners de golpe

La `signal` no es solo para `fetch`. `addEventListener` también la acepta: al abortar, **se quitan todos los listeners** que la usaron. Muy útil para limpiar un modal o un componente:

```js
const controlador = new AbortController()

window.addEventListener('keydown', alPulsarTecla, { signal: controlador.signal })
window.addEventListener('resize', alRedimensionar, { signal: controlador.signal })

// Al cerrar el modal: fuera los dos listeners
controlador.abort()
```

## Una regla importante: un controlador sirve una vez

Una vez que llamas a `abort()`, ese controlador queda **abortado para siempre**. Si le pasas su `signal` a otro `fetch`, se cancelará al instante. Por eso, en el buscador creamos **un controlador nuevo** en cada búsqueda.

## Tu turno

Partiendo del buscador:

1. Muestra "Buscando..." mientras la petición está en marcha y quítalo al terminar (cuidado: si la petición se canceló, no lo quites, porque hay otra en marcha).
2. Añade un tiempo máximo de 3 segundos a cada búsqueda. Pista: `AbortSignal.any([controlador.signal, AbortSignal.timeout(3000)])` combina dos señales en una.

## Errores comunes

- **Mostrar un error al usuario cuando la petición se canceló a propósito.** Comprueba `error.name === 'AbortError'` y no hagas nada.
- **Reutilizar un controlador ya abortado.** Crea uno nuevo para cada petición.
- **Olvidar pasar el `signal` al `fetch`.** Sin él, `abort()` no cancela nada.
- **Confundir `AbortError` y `TimeoutError`.** El primero es cancelación manual; el segundo, por tiempo.
- **Pensar que cancelar deshace la petición en el servidor.** Cancela la **espera** en el navegador. Si era un `POST` que ya llegó, el servidor puede haberlo procesado.

## Para profundizar

- [`AbortController` en MDN](https://developer.mozilla.org/es/docs/Web/API/AbortController)
- [`AbortSignal.timeout` en MDN](https://developer.mozilla.org/es/docs/Web/API/AbortSignal/timeout_static)

En resumen: crea un **`AbortController`**, pasa su **`signal`** al `fetch` y llama a **`abort()`** para cancelarlo. Úsalo para que las **respuestas viejas no pisen a las nuevas** en un buscador, para dar un botón de **cancelar** y, con **`AbortSignal.timeout(ms)`**, para poner un **tiempo máximo**. Y en el `catch`, ignora los `AbortError`: no son errores de verdad.
