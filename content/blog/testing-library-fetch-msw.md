---
title: 'Testing Library avanzado: componentes que llaman a APIs, con MSW'
description: 'Cómo probar un componente que hace fetch: findBy y waitFor para esperar, MSW para simular la API a nivel de red, probar los estados de carga, error y lista vacía, y un helper de render reutilizable.'
date: 2026-11-27
series: testing
tags: [Testing Library, MSW, React, Fetch, Avanzado]
draft: true
---

Casi todos los componentes de una app real **piden datos a una API**. Y son justo los más propensos a fallar: la API tarda, devuelve un error, viene vacía... Hoy aprendes a probar todos esos casos **sin llamar a ninguna API real**.

## El componente

Una lista de productos que pide los datos al aparecer (como en el post de `useEffect`):

```jsx
// src/Productos.jsx
import { useEffect, useState } from 'react'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [estado, setEstado] = useState('cargando')

  useEffect(() => {
    async function cargar() {
      try {
        const respuesta = await fetch('https://dummyjson.com/products?limit=3')
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
        const datos = await respuesta.json()
        setProductos(datos.products)
        setEstado('listo')
      } catch {
        setEstado('error')
      }
    }
    cargar()
  }, [])

  if (estado === 'cargando') return <p>Cargando productos...</p>
  if (estado === 'error') return <p role="alert">No se pudieron cargar los productos</p>
  if (productos.length === 0) return <p>No hay productos todavía</p>

  return (
    <ul aria-label="Productos">
      {productos.map((p) => (
        <li key={p.id}>{p.title} - S/ {p.price}</li>
      ))}
    </ul>
  )
}
```

## Esperar a que aparezca algo: `findBy` y `waitFor`

Cuando haces `render(<Productos />)`, lo primero que se pinta es "Cargando productos...". Los productos aparecen **después**, cuando responde la API. Si usas `getByText`, el test mira **demasiado pronto** y falla.

- **`findBy...`** espera (por defecto hasta 1 segundo) a que el elemento aparezca:

```jsx
expect(await screen.findByText(/Teclado/)).toBeInTheDocument()
```

- **`waitFor`** repite una comprobación hasta que pase (o se acabe el tiempo). Úsalo para cosas que no son "encontrar un elemento":

```jsx
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.queryByText('Cargando productos...')).not.toBeInTheDocument()
})
```

La regla: para **esperar un elemento**, `findBy`; para **cualquier otra cosa**, `waitFor`.

## El problema de mockear `fetch` a mano

En el post de mocks reemplazaste `fetch` con `vi.stubGlobal`. Funciona, pero tiene problemas:

- Tienes que imitar a mano el objeto `Response` (`ok`, `status`, `json()`...).
- Si el componente cambia `fetch` por `axios` o por TanStack Query, todos los tests se rompen, aunque la app funcione igual.
- Estás probando *cómo* se piden los datos, no *qué* pasa con ellos.

## MSW: simular la API en la red

**MSW** (*Mock Service Worker*) intercepta las peticiones **a nivel de red**. Tu componente hace un `fetch` normal, MSW lo captura y responde lo que tú le digas. El componente no sabe que está en un test.

```bash
npm install --save-dev msw
```

### Paso 1: define los handlers

Un **handler** dice "para esta URL y este método, responde esto":

```js
// src/mocks/handlers.js
import { http, HttpResponse } from 'msw'

export const productosDePrueba = [
  { id: 1, title: 'Teclado', price: 120 },
  { id: 2, title: 'Mouse', price: 45 },
  { id: 3, title: 'Monitor', price: 800 }
]

export const handlers = [
  http.get('https://dummyjson.com/products', () => {
    return HttpResponse.json({ products: productosDePrueba, total: 3 })
  })
]
```

Fíjate: la URL va **sin** `?limit=3`. MSW compara la ruta e ignora los parámetros de búsqueda; si los necesitas, los lees dentro del handler con `new URL(request.url).searchParams`.

### Paso 2: crea el servidor para Node

```js
// src/mocks/server.js
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### Paso 3: enciéndelo en el setup de los tests

```js
// src/setupTests.js
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers() // quita los cambios que haga cada test
})
afterAll(() => server.close())
```

`onUnhandledRequest: 'error'` hace que un test falle si el componente llama a una URL que no tiene handler. Así nunca llamas por accidente a una API real.

## Los tests: todos los estados

```jsx
// src/Productos.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/server'
import Productos from './Productos'

describe('Productos', () => {
  it('muestra "cargando" mientras llegan los datos', () => {
    render(<Productos />)

    expect(screen.getByText('Cargando productos...')).toBeInTheDocument()
  })

  it('pinta los productos cuando responde la API', async () => {
    render(<Productos />)

    const filas = await screen.findAllByRole('listitem')
    expect(filas).toHaveLength(3)
    expect(filas[0]).toHaveTextContent('Teclado - S/ 120')
    expect(screen.queryByText('Cargando productos...')).not.toBeInTheDocument()
  })

  it('muestra un error si la API falla', async () => {
    server.use(
      http.get('https://dummyjson.com/products', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    render(<Productos />)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar')
  })

  it('muestra un error si no hay conexión', async () => {
    server.use(
      http.get('https://dummyjson.com/products', () => HttpResponse.error())
    )

    render(<Productos />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('avisa si no hay productos', async () => {
    server.use(
      http.get('https://dummyjson.com/products', () => {
        return HttpResponse.json({ products: [], total: 0 })
      })
    )

    render(<Productos />)

    expect(await screen.findByText('No hay productos todavía')).toBeInTheDocument()
  })
})
```

- Los handlers de `handlers.js` son el **camino feliz** por defecto.
- **`server.use(...)`** sobrescribe un handler **solo para ese test**. Gracias a `resetHandlers()` en el `afterEach`, el siguiente test vuelve al camino feliz.
- **`HttpResponse.error()`** simula un fallo de red (sin conexión), que es distinto de un 500.

Ahora, si mañana cambias `fetch` por otra librería, **estos tests no cambian**: siguen simulando la misma API.

## Probar lo que se envía: un POST

```jsx
it('envía el comentario y lo muestra', async () => {
  let cuerpoRecibido
  server.use(
    http.post('https://api.ejemplo.com/comentarios', async ({ request }) => {
      cuerpoRecibido = await request.json()
      return HttpResponse.json({ id: 99, ...cuerpoRecibido }, { status: 201 })
    })
  )

  const usuario = userEvent.setup()
  render(<FormularioComentario />)

  await usuario.type(screen.getByLabelText('Comentario'), '¡Muy útil!')
  await usuario.click(screen.getByRole('button', { name: 'Publicar' }))

  expect(await screen.findByText('¡Muy útil!')).toBeInTheDocument()
  expect(cuerpoRecibido).toEqual({ texto: '¡Muy útil!' })
})
```

El handler guarda el cuerpo de la petición en una variable para comprobarlo después.

## Simular una API lenta

```jsx
import { delay } from 'msw'

http.get('https://dummyjson.com/products', async () => {
  await delay(200)
  return HttpResponse.json({ products: productosDePrueba })
})
```

Útil para comprobar que el botón se desactiva o que aparece un *spinner* mientras se espera.

## Un helper de render para toda la app

En una app real, los componentes necesitan **proveedores** alrededor: el router, un contexto de tema, el usuario conectado... En vez de repetirlos en cada test, crea tu propio `render`:

```jsx
// src/test-utils.jsx
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemaProvider } from './contextos/TemaContext'

export function renderConApp(componente) {
  return {
    usuario: userEvent.setup(),
    ...render(<TemaProvider>{componente}</TemaProvider>)
  }
}
```

```jsx
const { usuario } = renderConApp(<Ajustes />)
```

> MSW también funciona **en el navegador** (con un *Service Worker*): puedes desarrollar el frontend contra una API que todavía no existe, usando los mismos handlers que en los tests.

## Tu turno

1. Crea un componente `Usuario` que cargue `https://dummyjson.com/users/1` y muestre su nombre. Escribe tests para el camino feliz, un 404 y un fallo de red con MSW.
2. Añade un botón "Reintentar" en el estado de error. Prueba que, si el primer intento falla y el segundo funciona, al pulsar "Reintentar" aparecen los datos. (Pista: un handler con un contador de llamadas.)
3. Añade `delay()` a un handler y comprueba que se ve "Cargando..." antes de los datos.

## Errores comunes

- **Usar `getBy` para datos que llegan después.** Usa `findBy`.
- **Poner un `expect` de `getBy` dentro de `waitFor`** cuando bastaba con `findBy`.
- **No resetear los handlers** entre tests: el error de un test se cuela en el siguiente.
- **Olvidar `onUnhandledRequest: 'error'`** y llamar a una API real sin darte cuenta.
- **Escribir la URL del handler distinta** a la del `fetch` (con o sin `www`, `http` o `https`): MSW no la intercepta.
- **Esperar con `setTimeout` en los tests.** Nunca esperes un tiempo fijo; usa `findBy` o `waitFor`.

## Para profundizar

- [Documentación de MSW (en inglés)](https://mswjs.io/docs)
- [Métodos asíncronos de Testing Library (en inglés)](https://testing-library.com/docs/dom-testing-library/api-async)

En resumen: para lo que aparece **más tarde** usa **`findBy`** (o **`waitFor`** para otras comprobaciones). **MSW** simula la API a nivel de red: defines **handlers** con el camino feliz, los sobrescribes con **`server.use`** para probar errores y listas vacías, y los reseteas después de cada test. Tus tests dejan de depender de *cómo* pides los datos y prueban *qué* ve el usuario en cada caso.
