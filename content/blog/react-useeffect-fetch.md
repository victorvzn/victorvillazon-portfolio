---
title: 'React: useEffect y pedir datos a una API con fetch'
description: 'Para qué sirve useEffect, cómo cargar datos de una API al abrir un componente, mostrar estados de carga y error y por qué el array de dependencias importa tanto.'
date: 2026-11-26
series: frameworks
tags: [React, Frameworks, Fetch, APIs]
draft: true
---

Ya sabes pintar componentes con props y darles vida con `useState`. Pero en una app real los datos casi nunca están escritos en el código: **vienen de una API**. ¿Dónde pongo el `fetch` en un componente de React? La respuesta es **`useEffect`**.

## Por qué no puedes hacer el `fetch` "sin más"

Un componente es una función que React ejecuta **cada vez que pinta**. Si pones un `fetch` directamente dentro:

```jsx
// ❌ No hagas esto
function Productos() {
  const [productos, setProductos] = useState([])

  fetch('https://dummyjson.com/products')
    .then((respuesta) => respuesta.json())
    .then((datos) => setProductos(datos.products))

  return <p>{productos.length} productos</p>
}
```

Pasa esto: React pinta → se hace el `fetch` → llegan los datos → `setProductos` → React **vuelve a pintar** → se hace **otro** `fetch` → `setProductos` → vuelve a pintar... Un **bucle infinito** de peticiones.

Pedir datos, poner un temporizador o escuchar el scroll son **efectos secundarios** (*side effects*): cosas que pasan **fuera** de pintar la interfaz. Para eso existe `useEffect`.

## `useEffect`: "haz esto después de pintar"

```jsx
import { useEffect } from 'react'

useEffect(() => {
  // el efecto: lo que quieres hacer
}, [/* dependencias */])
```

Recibe dos cosas:

1. **Una función** con el efecto. React la ejecuta **después** de pintar el componente.
2. **Un array de dependencias**: le dice a React **cuándo** volver a ejecutar el efecto.

| Dependencias | Cuándo se ejecuta |
| --- | --- |
| `[]` (vacío) | **Una sola vez**, cuando el componente aparece |
| `[ciudad]` | Al aparecer **y** cada vez que cambie `ciudad` |
| Sin array | Después de **cada** pintada (casi nunca es lo que quieres) |

## Cargar datos al abrir el componente

Usaremos [DummyJSON](https://dummyjson.com), una API gratuita de datos de prueba:

```jsx
import { useEffect, useState } from 'react'

export default function Productos() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=5')
      .then((respuesta) => respuesta.json())
      .then((datos) => setProductos(datos.products))
  }, []) // [] → solo una vez, al aparecer

  return (
    <ul>
      {productos.map((producto) => (
        <li key={producto.id}>{producto.title}</li>
      ))}
    </ul>
  )
}
```

Ahora el orden es: React pinta (lista vacía) → se ejecuta el efecto → llegan los datos → `setProductos` → React vuelve a pintar (con los productos) → el efecto **no** se repite, porque sus dependencias (`[]`) no cambiaron.

> Si miras la pestaña **Network** de las DevTools con `npm run dev`, verás la petición **dos veces**. No es un bug: en desarrollo, el `<StrictMode>` de `main.jsx` monta cada componente dos veces a propósito para ayudarte a detectar efectos sin limpieza. En producción solo ocurre una vez.

## Con `async` / `await`, carga y error

La función del `useEffect` **no puede ser `async`** directamente. El truco es crear una función `async` dentro y llamarla. Y ya que estamos, manejamos los tres estados que toda petición necesita: **cargando**, **error** y **datos**:

```jsx
import { useEffect, useState } from 'react'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      try {
        const respuesta = await fetch('https://dummyjson.com/products?limit=5')
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)

        const datos = await respuesta.json()
        setProductos(datos.products)
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }

    cargar()
  }, [])

  if (cargando) return <p>Cargando productos...</p>
  if (error) return <p role="alert">No se pudieron cargar los productos: {error}</p>
  if (productos.length === 0) return <p>No hay productos.</p>

  return (
    <ul>
      {productos.map((producto) => (
        <li key={producto.id}>
          {producto.title}: ${producto.price}
        </li>
      ))}
    </ul>
  )
}
```

Fíjate en los **`return` tempranos**: cada estado tiene su propia interfaz, y el código principal queda limpio al final. `fetch` no lanza un error con un 404 o un 500, así que comprobamos `respuesta.ok` a mano (lo vimos en el post de `fetch`).

## Volver a pedir datos cuando algo cambia

Ahora un buscador: cada vez que cambie el texto buscado, queremos pedir otros resultados. Ponemos `busqueda` en las dependencias:

```jsx
import { useEffect, useState } from 'react'

export default function Buscador() {
  const [busqueda, setBusqueda] = useState('phone')
  const [resultados, setResultados] = useState([])

  useEffect(() => {
    const controlador = new AbortController()

    async function buscar() {
      try {
        const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(busqueda)}`
        const respuesta = await fetch(url, { signal: controlador.signal })
        const datos = await respuesta.json()
        setResultados(datos.products)
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err)
      }
    }

    buscar()

    // Limpieza: si la búsqueda cambia antes de que llegue la respuesta, cancelamos la anterior
    return () => controlador.abort()
  }, [busqueda])

  return (
    <>
      <input
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        aria-label="Buscar productos"
      />
      <ul>
        {resultados.map((producto) => (
          <li key={producto.id}>{producto.title}</li>
        ))}
      </ul>
    </>
  )
}
```

## La función de limpieza

¿Viste el `return () => controlador.abort()`? Si el efecto **devuelve una función**, React la ejecuta:

- **Antes de volver a ejecutar el efecto** (cuando cambian las dependencias).
- **Cuando el componente desaparece** de la pantalla.

Sirve para **deshacer** lo que hizo el efecto. En el buscador, cancela la petición anterior para que una respuesta lenta y vieja no pise a la nueva. Otros ejemplos típicos:

```jsx
// Un temporizador
useEffect(() => {
  const id = setInterval(() => setSegundos((s) => s + 1), 1000)
  return () => clearInterval(id)
}, [])

// Un evento de la ventana
useEffect(() => {
  const alCambiarTamano = () => setAncho(window.innerWidth)
  window.addEventListener('resize', alCambiarTamano)
  return () => window.removeEventListener('resize', alCambiarTamano)
}, [])
```

Sin la limpieza, cada vez que el componente apareciera se añadiría **otro** temporizador u otro listener, y se acumularían.

`setSegundos((s) => s + 1)` usa la **forma de función** del `set`: recibe el valor anterior y devuelve el nuevo. Úsala cuando el nuevo valor dependa del anterior dentro de un efecto o un temporizador.

## ¿Cuándo NO necesitas `useEffect`?

Un error muy común es usar `useEffect` para todo. **No** lo necesitas para:

- **Calcular datos a partir de otros.** Ni `useEffect` ni estado extra: calcúlalo al pintar.

```jsx
// ❌ Innecesario
const [total, setTotal] = useState(0)
useEffect(() => {
  setTotal(carrito.reduce((suma, p) => suma + p.precio, 0))
}, [carrito])

// ✅ Mejor
const total = carrito.reduce((suma, p) => suma + p.precio, 0)
```

- **Responder a un clic o a un envío.** Eso va en el manejador del evento (`onClick`, `onSubmit`), no en un efecto.

`useEffect` es para **sincronizar con algo de fuera de React**: una API, un temporizador, el navegador.

> En proyectos grandes, para pedir datos se suele usar una librería como **TanStack Query** o las herramientas de un framework como **Next.js**, que resuelven la caché, los reintentos y la carga. Pero por debajo hacen lo que acabas de aprender.

## Tu turno

1. Crea un componente `Usuario` que cargue `https://dummyjson.com/users/1` y muestre su nombre, su email y su foto (`image`).
2. Añade botones "Anterior" y "Siguiente" que cambien el `id` del usuario (guárdalo en un `useState`) y vuelve a cargar los datos al cambiar.
3. Muestra "Cargando..." mientras llega cada usuario.

## Errores comunes

- **Olvidar el array de dependencias.** El efecto se ejecuta tras cada pintada, y con un `setState` dentro, en bucle infinito.
- **Dejar fuera de las dependencias una variable que usas dentro.** El efecto trabajará con un valor viejo. La regla: todo lo que uses dentro y pueda cambiar, va en el array.
- **Hacer `async` la función del `useEffect`.** Crea una función `async` dentro y llámala.
- **No limpiar** temporizadores, listeners o peticiones.
- **Usar `useEffect` para calcular datos** que podrías calcular al pintar.
- **No manejar la carga y el error.** El usuario ve una pantalla en blanco.

## Para profundizar

- [Sincronizar con efectos](https://es.react.dev/learn/synchronizing-with-effects)
- [Quizás no necesites un efecto](https://es.react.dev/learn/you-might-not-need-an-effect)

En resumen: **`useEffect`** ejecuta código **después de pintar**, para sincronizar con cosas de fuera de React como una API. El **array de dependencias** decide cuándo se repite (`[]` = una vez). Gestiona siempre **carga, error y datos**, **limpia** lo que el efecto deje abierto y no lo uses para lo que puedas **calcular al pintar**.
