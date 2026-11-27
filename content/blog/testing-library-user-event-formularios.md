---
title: 'Testing Library: simula clics y escritura con user-event'
description: 'Cómo probar interacciones con user-event: clics, escribir en inputs, el teclado y los formularios. Un contador, un formulario de login con validación y cómo comprobar lo que se envía.'
date: 2026-11-27
series: testing
tags: [Testing Library, React, Formularios, Testing]
draft: true
---

En el post anterior comprobaste que un componente **se pinta bien**. Pero las apps no son estáticas: el usuario hace clic, escribe, marca casillas, envía formularios. Esos son los tests que de verdad te dan confianza: **"cuando el usuario hace X, pasa Y"**.

Para simular a ese usuario se usa **`user-event`**.

## `user-event` contra `fireEvent`

Testing Library trae `fireEvent`, que dispara **un solo evento**. Pero cuando una persona hace clic en un botón, el navegador dispara varios: `pointerdown`, `mousedown`, `focus`, `pointerup`, `mouseup`, `click`... Y al escribir, un `keydown`, un `input` y un `keyup` **por cada letra**.

`user-event` simula **todo eso**, como pasaría de verdad. Por eso es la opción recomendada:

```jsx
import userEvent from '@testing-library/user-event'

const usuario = userEvent.setup() // crea un "usuario" virtual
await usuario.click(boton)
await usuario.type(input, 'Hola')
```

Todos sus métodos devuelven una promesa, así que **siempre** van con `await` y el test debe ser `async`.

## Ejemplo 1: un contador

```jsx
// src/Contador.jsx
import { useState } from 'react'

export default function Contador({ maximo = 5 }) {
  const [cuenta, setCuenta] = useState(0)

  return (
    <div>
      <p>Has hecho clic {cuenta} veces</p>
      <button onClick={() => setCuenta(cuenta + 1)} disabled={cuenta >= maximo}>
        Sumar
      </button>
      <button onClick={() => setCuenta(0)}>Reiniciar</button>
    </div>
  )
}
```

```jsx
// src/Contador.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contador from './Contador'

describe('Contador', () => {
  it('suma uno con cada clic', async () => {
    const usuario = userEvent.setup()
    render(<Contador />)

    await usuario.click(screen.getByRole('button', { name: 'Sumar' }))
    await usuario.click(screen.getByRole('button', { name: 'Sumar' }))

    expect(screen.getByText('Has hecho clic 2 veces')).toBeInTheDocument()
  })

  it('se bloquea al llegar al máximo', async () => {
    const usuario = userEvent.setup()
    render(<Contador maximo={2} />)
    const sumar = screen.getByRole('button', { name: 'Sumar' })

    await usuario.click(sumar)
    await usuario.click(sumar)

    expect(sumar).toBeDisabled()
  })

  it('vuelve a 0 al reiniciar', async () => {
    const usuario = userEvent.setup()
    render(<Contador />)

    await usuario.click(screen.getByRole('button', { name: 'Sumar' }))
    await usuario.click(screen.getByRole('button', { name: 'Reiniciar' }))

    expect(screen.getByText('Has hecho clic 0 veces')).toBeInTheDocument()
  })
})
```

Fíjate: **no comprobamos el estado** (`cuenta`) ni llamamos a `setCuenta`. Comprobamos lo que **ve el usuario**: el texto y el botón desactivado. Si mañana cambias `useState` por `useReducer`, estos tests siguen sirviendo.

## Ejemplo 2: un formulario de login

```jsx
// src/Login.jsx
import { useState } from 'react'

export default function Login({ alEnviar }) {
  const [error, setError] = useState('')

  function manejarEnvio(evento) {
    evento.preventDefault()
    const datos = Object.fromEntries(new FormData(evento.currentTarget))

    if (!datos.email.includes('@')) {
      setError('Escribe un email válido')
      return
    }
    if (datos.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setError('')
    alEnviar({ email: datos.email, password: datos.password, recordar: datos.recordar === 'on' })
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" />

      <label htmlFor="password">Contraseña</label>
      <input id="password" name="password" type="password" />

      <label>
        <input name="recordar" type="checkbox" /> Recordarme
      </label>

      {error && <p role="alert">{error}</p>}

      <button type="submit">Entrar</button>
    </form>
  )
}
```

El componente recibe `alEnviar` como prop: así, en el test, podemos pasarle un `vi.fn()` y comprobar **qué datos envía** (lo viste en el post de mocks).

```jsx
// src/Login.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'

function renderLogin() {
  const alEnviar = vi.fn()
  const usuario = userEvent.setup()
  render(<Login alEnviar={alEnviar} />)
  return { alEnviar, usuario }
}

describe('Login', () => {
  it('envía el email, la contraseña y la casilla marcada', async () => {
    const { alEnviar, usuario } = renderLogin()

    await usuario.type(screen.getByLabelText('Email'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'secreto123')
    await usuario.click(screen.getByRole('checkbox', { name: 'Recordarme' }))
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(alEnviar).toHaveBeenCalledWith({
      email: 'ana@correo.com',
      password: 'secreto123',
      recordar: true
    })
  })

  it('muestra un error si el email no es válido', async () => {
    const { alEnviar, usuario } = renderLogin()

    await usuario.type(screen.getByLabelText('Email'), 'ana')
    await usuario.type(screen.getByLabelText('Contraseña'), 'secreto123')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Escribe un email válido')
    expect(alEnviar).not.toHaveBeenCalled()
  })

  it('se puede enviar pulsando Enter', async () => {
    const { alEnviar, usuario } = renderLogin()

    await usuario.type(screen.getByLabelText('Email'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'secreto123{Enter}')

    expect(alEnviar).toHaveBeenCalledOnce()
  })
})
```

Varias cosas que vale la pena mirar:

- **`getByLabelText('Email')`** funciona porque el `<label>` está conectado al input con `htmlFor`/`id`. Si los desconectas, el test falla... y tu formulario deja de ser accesible. Otra vez, los tests y la accesibilidad van de la mano.
- **`{Enter}`** dentro de `type` pulsa esa tecla. Funcionan también `{Tab}`, `{Escape}`, `{Backspace}`...
- **`renderLogin()`** es una pequeña función de ayuda para no repetir la preparación en cada test.
- El mensaje de error tiene **`role="alert"`**, así que lo encontramos por su rol y, de paso, los lectores de pantalla lo anuncian.

## Más acciones de `user-event`

```jsx
await usuario.click(elemento)
await usuario.dblClick(elemento)
await usuario.type(input, 'texto')
await usuario.clear(input)                       // borra el contenido
await usuario.selectOptions(select, 'peru')      // elige una opción de un <select>
await usuario.keyboard('{Shift>}A{/Shift}')      // teclas en el elemento con foco
await usuario.tab()                              // mueve el foco al siguiente elemento
await usuario.hover(elemento)
await usuario.upload(inputArchivo, archivo)      // subir un archivo
```

### Probar la navegación con el teclado

```jsx
it('se puede recorrer con Tab', async () => {
  const { usuario } = renderLogin()

  await usuario.tab()
  expect(screen.getByLabelText('Email')).toHaveFocus()

  await usuario.tab()
  expect(screen.getByLabelText('Contraseña')).toHaveFocus()
})
```

Un test así protege la accesibilidad con teclado (lo viste en el post de foco y teclado): si alguien añade un `tabIndex` raro, lo detectarás.

## ¿Qué probar en un formulario?

Una buena lista de comprobación:

1. ✅ El camino feliz: datos correctos → se envía con los datos correctos.
2. ❌ Cada validación importante: dato inválido → mensaje de error **y no se envía**.
3. ⌨️ Se puede enviar con Enter y recorrer con Tab.
4. 🔄 Estados: el botón se desactiva mientras se envía, se muestra "Enviando...".

No hace falta probar cada combinación posible: para la lógica de validación pura (por ejemplo, un esquema de Zod), mejor tests unitarios con Vitest, que son más rápidos.

## Tu turno

1. Crea un componente `Buscador` con un input y una lista de nombres que se filtra al escribir. Prueba que al escribir `"an"` solo quedan los nombres que lo contienen, y que al borrar (`usuario.clear`) vuelven todos.
2. Añade al `Login` un botón "Mostrar contraseña" que cambie el `type` del input. Pruébalo con `toHaveAttribute('type', 'text')`.
3. Haz que, mientras `alEnviar` se resuelve (devuélvele una promesa con `vi.fn().mockReturnValue(new Promise(() => {}))`), el botón muestre "Entrando..." y esté desactivado.

## Errores comunes

- **Olvidar el `await`** en las acciones de `user-event`. La acción no termina y el `expect` mira la pantalla antes de tiempo.
- **Olvidar `userEvent.setup()`** y llamar directamente a `userEvent.click`. Funciona, pero `setup()` es la forma recomendada.
- **Comprobar el estado interno** (`useState`) en vez de lo que se ve.
- **Labels sin conectar** al input: `getByLabelText` falla.
- **Un test gigante que prueba todo.** Un test por comportamiento, con un nombre que lo explique.

## Para profundizar

- [Introducción a user-event (documentación oficial, en inglés)](https://testing-library.com/docs/user-event/intro)
- [Lista de acciones de user-event (en inglés)](https://testing-library.com/docs/user-event/convenience)

En resumen: **`user-event`** simula a un usuario real: crea uno con **`userEvent.setup()`** y usa **`click`**, **`type`**, **`tab`**... siempre con **`await`**. Busca los campos con **`getByLabelText`**, pasa los callbacks como props para comprobarlos con **`vi.fn()`** y prueba lo que **ve el usuario**, no el estado interno.
