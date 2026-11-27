---
title: 'Cargando, error y vacío: los estados que toda interfaz con fetch necesita'
description: 'Una petición no solo "funciona": tarda, falla o devuelve una lista vacía. Cómo mostrar cada estado con JavaScript puro, con botón de reintentar y accesible.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fetch, APIs, UX]
draft: true
---

Cuando haces tu primer `fetch` y los datos aparecen en pantalla, parece que ya está. Pero en la vida real:

- La conexión es lenta y durante 3 segundos **no se ve nada**. ¿Se rompió?
- La API falla y la página se queda **en blanco**, sin explicación.
- La búsqueda no encuentra nada y aparece... **una lista vacía**, sin un mensaje.

La diferencia entre un proyecto de estudiante y uno profesional está en cubrir **los cuatro estados** de cualquier petición. Y es una de las cosas que más miran en las pruebas técnicas.

## Los cuatro estados

| Estado | Qué ve el usuario |
| --- | --- |
| **Cargando** | Un indicador ("Cargando...", un spinner, tarjetas grises) |
| **Error** | Un mensaje claro y una forma de **reintentar** |
| **Vacío** | Un mensaje que explique que no hay resultados |
| **Éxito** | Los datos |

Una petición **siempre** está en uno de estos estados. Si tu interfaz no tiene algo que mostrar en alguno, ahí hay un hueco.

## Paso 1: un contenedor para cada estado

Una forma sencilla y clara: un elemento por estado en el HTML, y JavaScript muestra solo el que toca con el atributo `hidden`.

```html playground=estados
<form id="buscador">
  <input name="q" value="phone" aria-label="Buscar productos">
  <button>Buscar</button>
  <label><input type="checkbox" name="romper"> Simular error</label>
</form>

<p id="cargando" hidden>Cargando productos...</p>

<div id="error" role="alert" hidden>
  <p>No pudimos cargar los productos. Revisa tu conexión.</p>
  <button id="reintentar">Reintentar</button>
</div>

<p id="vacio" hidden>No encontramos productos para tu búsqueda. Prueba con otra palabra.</p>

<ul id="lista" aria-live="polite"></ul>
```

```css playground=estados
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

input,
button {
  padding: 6px 10px;
  font: inherit;
}

#error {
  padding: 12px 16px;
  border-radius: 10px;
  background: #fef2f2;
  color: #991b1b;
}

#error p {
  margin: 0 0 8px;
}

#cargando {
  color: #71717a;
}
```

## Paso 2: una función que cambia de estado

En vez de mostrar y ocultar cosas por todo el código, centralizamos en **una** función:

```js playground=estados
const elementos = {
  cargando: document.querySelector('#cargando'),
  error: document.querySelector('#error'),
  vacio: document.querySelector('#vacio'),
  lista: document.querySelector('#lista')
}

const formulario = document.querySelector('#buscador')
const botonBuscar = formulario.querySelector('button')

function mostrarEstado(estado) {
  elementos.cargando.hidden = estado !== 'cargando'
  elementos.error.hidden = estado !== 'error'
  elementos.vacio.hidden = estado !== 'vacio'
  elementos.lista.hidden = estado !== 'exito'

  // Mientras carga, no dejamos buscar otra vez
  botonBuscar.disabled = estado === 'cargando'
}
```

Así es **imposible** que se vean el error y el spinner a la vez: cada llamada deja visible un solo estado.

## Paso 3: la petición, cubriendo cada caso

```js playground=estados
async function buscar() {
  const termino = formulario.q.value.trim()
  const romper = formulario.romper.checked

  mostrarEstado('cargando')

  try {
    const url = romper
      ? 'https://dummyjson.com/ruta-que-no-existe'
      : `https://dummyjson.com/products/search?q=${encodeURIComponent(termino)}`

    const respuesta = await fetch(url)
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)

    const { products } = await respuesta.json()

    if (products.length === 0) {
      mostrarEstado('vacio')
      return
    }

    elementos.lista.replaceChildren(...products.map((producto) => {
      const item = document.createElement('li')
      item.textContent = `${producto.title}: $${producto.price}`
      return item
    }))
    mostrarEstado('exito')
  } catch (error) {
    console.error(error) // para ti, en la consola
    mostrarEstado('error') // para el usuario, un mensaje entendible
  }
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault()
  buscar()
})

document.querySelector('#reintentar').addEventListener('click', buscar)

buscar()
```

Prueba en el playground:

- Busca `phone` → **éxito**.
- Busca `xyzxyz` → **vacío**.
- Marca "Simular error" y busca → **error**, con su botón de reintentar.
- Para ver bien el estado de **carga**, abre las DevTools, pestaña **Network**, y elige **Slow 4G** en el desplegable de velocidad.

Fíjate en el `catch`: el error **técnico** va a la consola, para ti. El usuario ve un mensaje **humano** y una salida. Nunca le muestres `TypeError: Failed to fetch`.

## Accesibilidad de los estados

Un usuario de lector de pantalla no **ve** que apareció el error o la lista. Por eso:

- **`role="alert"`** en el error: el lector lo anuncia en cuanto aparece.
- **`aria-live="polite"`** en la lista: el lector anuncia los cambios cuando termine de hablar.
- **El botón deshabilitado** mientras carga evita peticiones duplicadas.

## Mejoras que se notan

### Esqueletos en vez de "Cargando..."

Muchas apps muestran **tarjetas grises** con la forma del contenido mientras carga (*skeletons*). Se perciben como más rápidas que un spinner, porque el usuario ya ve dónde aparecerá cada cosa:

```css
.esqueleto {
  height: 20px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e4e4e7 25%, #f4f4f5 50%, #e4e4e7 75%);
  background-size: 200% 100%;
  animation: brillo 1.2s infinite;
}

@keyframes brillo {
  to {
    background-position: -200% 0;
  }
}
```

### No mostrar el "Cargando..." si la respuesta es instantánea

Si la API responde en 50 ms, el "Cargando..." aparece y desaparece en un parpadeo, y molesta. Un truco: mostrarlo solo si la petición tarda más de 300 ms:

```js
const temporizador = setTimeout(() => mostrarEstado('cargando'), 300)
// ... await fetch ...
clearTimeout(temporizador)
```

### Mensajes de vacío útiles

"No hay resultados" está bien. "No encontramos productos para **xyzxyz**. Prueba con otra palabra o [mira todas las ofertas](#)" está mucho mejor: le da al usuario algo que hacer.

## Tu turno

Partiendo del ejemplo:

1. Cambia el "Cargando productos..." por tres esqueletos grises.
2. Muestra en el mensaje de vacío la palabra que se buscó.
3. Si el error es un 404, muestra "No encontramos lo que buscas"; si es cualquier otro, "Algo salió mal, inténtalo de nuevo". Pista: guarda `respuesta.status` en el error.

## Errores comunes

- **Solo programar el caso de éxito.** Cubre siempre carga, error y vacío.
- **Mostrar el error técnico al usuario.** El detalle, a la consola; al usuario, un mensaje claro.
- **Errores sin salida.** Añade siempre un botón de reintentar.
- **Olvidar comprobar `respuesta.ok`.** `fetch` no falla con un 404 o un 500: tienes que comprobarlo tú.
- **Dejar que se lancen varias peticiones a la vez** pulsando el botón muchas veces. Deshabilítalo mientras carga (o cancela la anterior con `AbortController`, que tiene su post).
- **Estados que se pisan** (el spinner y el error a la vez). Centraliza en una función `mostrarEstado`.

## Para profundizar

- [`fetch` en MDN](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch)
- [Regiones vivas ARIA en MDN](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Guides/Live_regions)

En resumen: toda petición pasa por **cargando**, y termina en **éxito**, **vacío** o **error**. Ten una interfaz para cada estado, cámbialos desde **una sola función**, da siempre un **botón de reintentar** y anuncia los cambios a los lectores de pantalla con **`role="alert"`** y **`aria-live`**.
