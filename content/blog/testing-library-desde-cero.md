---
title: 'Testing Library desde cero: prueba tus componentes como un usuario'
description: 'Cómo configurar Vitest con jsdom y React Testing Library, renderizar un componente, buscar elementos con getByRole, getByText y getByLabelText, y cuándo usar getBy, queryBy o findBy.'
date: 2026-11-27
series: testing
tags: [Testing Library, React, Vitest, Testing]
draft: true
---

Con Vitest ya sabes probar funciones. Pero en el frontend, lo que el usuario ve son **componentes**: botones, formularios, listas. ¿Cómo compruebas que un botón aparece, que muestra el texto correcto o que un mensaje de error se ve?

**Testing Library** es una familia de librerías para probar interfaces con una filosofía muy clara:

> Cuanto más se parezcan tus tests a la forma en que se usa tu app, más confianza te darán.

Un usuario no sabe que tu botón tiene la clase `.btn-primary` ni que está dentro de un `<div>`. Sabe que hay **un botón que dice "Comprar"**. Así es como Testing Library busca los elementos.

## Paso 1: preparar el proyecto

Partimos de un proyecto de React creado con Vite (lo viste en el post de Vite). Instala las herramientas:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

Qué es cada una:

- **`vitest`**: ejecuta los tests.
- **`jsdom`**: simula un navegador (con su `document`, el DOM...) dentro de Node, para que tus componentes puedan "pintarse" sin abrir Chrome.
- **`@testing-library/react`**: renderiza componentes de React en ese DOM simulado.
- **`@testing-library/jest-dom`**: añade matchers para el DOM, como `toBeInTheDocument()` o `toBeDisabled()`.
- **`@testing-library/user-event`**: simula clics y escritura (lo usarás en el siguiente post).

> Para Vue existe `@testing-library/vue`, y para HTML sin framework, `@testing-library/dom`. La forma de buscar elementos es **idéntica** en todas.

Configura Vitest en `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js'
  }
})
```

Crea `src/setupTests.js`, que se ejecuta antes de cada archivo de tests:

```js
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Desmonta los componentes después de cada test, para que no se acumulen
afterEach(() => {
  cleanup()
})
```

Y añade el script en `package.json`: `"test": "vitest"`.

## Paso 2: un componente para probar

```jsx
// src/TarjetaProducto.jsx
export default function TarjetaProducto({ nombre, precio, stock }) {
  const agotado = stock === 0

  return (
    <article>
      <h2>{nombre}</h2>
      <p>S/ {precio.toFixed(2)}</p>
      {agotado && <p role="status">Agotado</p>}
      <button disabled={agotado}>Añadir al carrito</button>
    </article>
  )
}
```

## Paso 3: tu primer test de un componente

```jsx
// src/TarjetaProducto.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TarjetaProducto from './TarjetaProducto'

describe('TarjetaProducto', () => {
  it('muestra el nombre y el precio', () => {
    render(<TarjetaProducto nombre="Teclado" precio={120} stock={5} />)

    expect(screen.getByRole('heading', { name: 'Teclado' })).toBeInTheDocument()
    expect(screen.getByText('S/ 120.00')).toBeInTheDocument()
  })

  it('desactiva el botón si no hay stock', () => {
    render(<TarjetaProducto nombre="Teclado" precio={120} stock={0} />)

    expect(screen.getByText('Agotado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Añadir al carrito' })).toBeDisabled()
  })
})
```

- **`render(<Componente />)`** pinta el componente en el DOM simulado.
- **`screen`** representa "la pantalla": desde ahí buscas elementos.
- **`getByRole('button', { name: 'Añadir al carrito' })`** busca un elemento con el **rol** de botón y ese **nombre accesible** (su texto).

Ejecuta `npm test` y deberías ver los dos tests en verde.

## Cómo buscar elementos: el orden de prioridad

Testing Library recomienda buscar en este orden, de lo más parecido a un usuario real a lo menos:

| Prioridad | Consulta | Cuándo |
| --- | --- | --- |
| 1 | `getByRole` | **Casi siempre.** Botones, enlaces, títulos, inputs, listas... |
| 2 | `getByLabelText` | Campos de formulario, por el texto de su `<label>` |
| 3 | `getByPlaceholderText` | Si un input no tiene label (aunque debería tenerlo) |
| 4 | `getByText` | Textos que no son interactivos: párrafos, mensajes |
| 5 | `getByDisplayValue` | Un input por el valor que tiene escrito |
| 6 | `getByAltText` | Imágenes, por su `alt` |
| Último recurso | `getByTestId` | Cuando no hay otra forma: `data-testid="..."` |

### Los roles más comunes

Cada etiqueta HTML tiene un **rol implícito** (lo viste en el post de ARIA):

| HTML | Rol |
| --- | --- |
| `<button>` | `button` |
| `<a href="...">` | `link` |
| `<h1>` a `<h6>` | `heading` (con `level: 1`...) |
| `<input type="text">` | `textbox` |
| `<input type="checkbox">` | `checkbox` |
| `<select>` | `combobox` |
| `<ul>`, `<li>` | `list`, `listitem` |
| `<img alt="...">` | `img` |
| `<nav>`, `<main>` | `navigation`, `main` |

```jsx
screen.getByRole('heading', { level: 1 })
screen.getByRole('link', { name: 'Ver más' })
screen.getByRole('textbox', { name: 'Email' })   // el name sale del <label>
screen.getAllByRole('listitem')                   // todos los <li>
```

**El efecto secundario más bonito:** si no puedes encontrar un elemento con `getByRole`, probablemente tu HTML **no es accesible**. Por ejemplo, un `<div onClick>` no tiene rol de botón, y un lector de pantalla tampoco lo reconocería. Los tests te empujan a escribir mejor HTML.

## `getBy`, `queryBy` y `findBy`

Cada consulta tiene tres variantes:

| Variante | Si no lo encuentra | Si encuentra varios | Para |
| --- | --- | --- | --- |
| `getBy...` | **Lanza un error** | Lanza un error | Algo que **debe** estar |
| `queryBy...` | Devuelve `null` | Lanza un error | Comprobar que algo **no** está |
| `findBy...` | Rechaza la promesa (tras esperar) | Rechaza | Algo que **aparecerá** más tarde (asíncrono) |

Y todas tienen su versión `All` (`getAllBy`, `queryAllBy`, `findAllBy`) que devuelve un array.

```jsx
it('no muestra "Agotado" si hay stock', () => {
  render(<TarjetaProducto nombre="Teclado" precio={120} stock={5} />)

  // getByText lanzaría un error; queryByText devuelve null
  expect(screen.queryByText('Agotado')).not.toBeInTheDocument()
})
```

`findBy` lo usarás cuando el contenido llegue de una API (está en el post de MSW):

```jsx
expect(await screen.findByText('Teclado')).toBeInTheDocument()
```

## Los matchers de jest-dom

```jsx
expect(elemento).toBeInTheDocument()
expect(boton).toBeDisabled()
expect(boton).toBeEnabled()
expect(checkbox).toBeChecked()
expect(input).toHaveValue('Ana')
expect(enlace).toHaveAttribute('href', '/productos')
expect(mensaje).toHaveTextContent('Guardado')
expect(menu).toBeVisible()
expect(input).toHaveAccessibleName('Email')
```

Se leen como una frase, y los mensajes de error son mucho más claros que comparar a mano.

## Depurar: ¿qué hay en la pantalla?

Si un test no encuentra algo, mira qué se ha pintado:

```jsx
screen.debug()               // imprime el HTML actual en la terminal
screen.logTestingPlaygroundURL() // un enlace a una web que te sugiere la mejor consulta
```

Además, cuando `getByRole` falla, el mensaje de error **lista todos los roles disponibles** en la pantalla. Léelo: casi siempre ahí está la respuesta.

## Probar una lista

```jsx
// src/ListaTareas.jsx
export default function ListaTareas({ tareas }) {
  if (tareas.length === 0) return <p>No tienes tareas pendientes 🎉</p>

  return (
    <ul aria-label="Tareas">
      {tareas.map((tarea) => (
        <li key={tarea.id}>{tarea.texto}</li>
      ))}
    </ul>
  )
}
```

```jsx
// src/ListaTareas.test.jsx
import { it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ListaTareas from './ListaTareas'

it('pinta una fila por tarea', () => {
  const tareas = [
    { id: 1, texto: 'Estudiar' },
    { id: 2, texto: 'Correr' }
  ]
  render(<ListaTareas tareas={tareas} />)

  const filas = screen.getAllByRole('listitem')
  expect(filas).toHaveLength(2)
  expect(filas[0]).toHaveTextContent('Estudiar')
})

it('muestra un mensaje si no hay tareas', () => {
  render(<ListaTareas tareas={[]} />)

  expect(screen.getByText(/no tienes tareas/i)).toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
})
```

`/no tienes tareas/i` es una **expresión regular**: busca ese texto sin importar mayúsculas y aunque haya más texto alrededor (como el emoji). Es más robusto que copiar el texto exacto.

## Tu turno

1. Crea un componente `Perfil` que reciba `{ nombre, email, avatar }` y muestre un `<h2>`, el email como enlace `mailto:` y la imagen con `alt`. Pruébalo usando solo `getByRole`.
2. Si `avatar` no viene, que muestre las iniciales. Escribe un test para cada caso, con `queryByRole('img')` en el segundo.
3. Rompe el HTML a propósito (cambia el `<h2>` por un `<div>`) y lee el mensaje de error.

## Errores comunes

- **Buscar por clases o etiquetas** (`container.querySelector('.btn')`). Si cambias el CSS, el test se rompe aunque la app funcione.
- **Usar `getBy` para comprobar que algo NO está.** Lanza un error; usa `queryBy`.
- **Abusar de `data-testid`.** Es el último recurso, no el primero.
- **Olvidar `environment: 'jsdom'`**: verás `document is not defined`.
- **No importar `@testing-library/jest-dom/vitest`**: `toBeInTheDocument is not a function`.

## Para profundizar

- [Qué consulta debo usar (documentación oficial, en inglés)](https://testing-library.com/docs/queries/about#priority)
- [Errores comunes con React Testing Library, de Kent C. Dodds (en inglés)](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

En resumen: **Testing Library** prueba tus componentes **como un usuario**: los renderizas con **`render`** y los buscas en **`screen`** por su **rol y su texto**, no por clases. Usa **`getBy`** para lo que debe estar, **`queryBy`** para lo que no debe estar y **`findBy`** para lo que aparece después. Si no encuentras algo con `getByRole`, revisa la accesibilidad de tu HTML.
