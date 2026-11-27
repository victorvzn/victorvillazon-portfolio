---
title: 'Formularios en React: varios campos, validación y useActionState'
description: 'Cómo manejar un formulario con muchos campos usando un solo estado, checkboxes, selects y radios, validar y mostrar errores por campo, la alternativa no controlada con FormData y las acciones de formulario de React 19 con useActionState.'
date: 2026-11-27
series: frameworks
tags: [React, Formularios, Validación, Intermedio]
draft: true
---

En el post de estado y eventos aprendiste los **inputs controlados**: un `useState` por campo y un `onChange` que lo actualiza. Perfecto para un buscador. Pero un formulario de registro tiene nombre, email, contraseña, país, intereses, aceptar términos... ¿Diez `useState` y diez `onChange`? Hay formas mucho mejores.

## Un solo estado para todo el formulario

Guarda todos los campos en **un objeto** y usa **un solo manejador** para todos:

```jsx
import { useState } from 'react'

const VALORES_INICIALES = { nombre: '', email: '', pais: 'PE', plan: 'gratis', boletin: false }

export default function Registro() {
  const [datos, setDatos] = useState(VALORES_INICIALES)

  function manejarCambio(evento) {
    const { name, value, type, checked } = evento.target
    setDatos((anteriores) => ({
      ...anteriores,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <form>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={datos.nombre} onChange={manejarCambio} />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={datos.email} onChange={manejarCambio} />

      <pre>{JSON.stringify(datos, null, 2)}</pre>
    </form>
  )
}
```

Las claves del truco:

- Cada input tiene un **`name`** igual a su propiedad en el objeto.
- **`[name]: value`** es una *propiedad computada*: usa el valor de la variable `name` como nombre de la propiedad. Si escribes en el input `email`, actualiza `datos.email`.
- **`...anteriores`** copia el resto de campos para no perderlos (el estado no se modifica, se **reemplaza** por un objeto nuevo).
- La **forma de función** `setDatos((anteriores) => ...)` garantiza que trabajas con el valor más reciente.

El `<pre>` del final es un truco de depuración: ves el estado en vivo mientras escribes.

## Checkbox, select y radio

Cada tipo de campo se controla con una propiedad distinta:

```jsx
{/* Select: igual que un input */}
<label htmlFor="pais">País</label>
<select id="pais" name="pais" value={datos.pais} onChange={manejarCambio}>
  <option value="PE">Perú</option>
  <option value="MX">México</option>
  <option value="CO">Colombia</option>
</select>

{/* Radio: checked según si su value coincide */}
<fieldset>
  <legend>Plan</legend>
  {['gratis', 'pro'].map((plan) => (
    <label key={plan}>
      <input
        type="radio"
        name="plan"
        value={plan}
        checked={datos.plan === plan}
        onChange={manejarCambio}
      />
      {plan}
    </label>
  ))}
</fieldset>

{/* Checkbox: checked en vez de value */}
<label>
  <input type="checkbox" name="boletin" checked={datos.boletin} onChange={manejarCambio} />
  Quiero recibir novedades
</label>
```

| Campo | Se controla con | Se lee con |
| --- | --- | --- |
| `input`, `textarea`, `select` | `value` | `evento.target.value` |
| `checkbox` | `checked` | `evento.target.checked` |
| `radio` | `checked={estado === valor}` | `evento.target.value` |

Por eso `manejarCambio` mira el `type`: los checkbox se leen con `checked`.

## Validar y mostrar errores

Escribe la validación como una **función pura** (fuera del componente): recibe los datos y devuelve un objeto con los errores. Así es fácil de probar con Vitest.

```jsx
function validar(datos) {
  const errores = {}
  if (datos.nombre.trim().length < 2) errores.nombre = 'Escribe al menos 2 letras'
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) errores.email = 'Escribe un email válido'
  return errores
}
```

Y en el componente:

```jsx
export default function Registro() {
  const [datos, setDatos] = useState(VALORES_INICIALES)
  const [tocados, setTocados] = useState({})
  const [enviado, setEnviado] = useState(false)

  const errores = validar(datos) // se calcula al pintar: no necesita estado
  const hayErrores = Object.keys(errores).length > 0

  function manejarCambio(evento) { /* como antes */ }

  function manejarBlur(evento) {
    setTocados((anteriores) => ({ ...anteriores, [evento.target.name]: true }))
  }

  function manejarEnvio(evento) {
    evento.preventDefault()
    setEnviado(true)
    if (hayErrores) return
    console.log('Enviando', datos)
  }

  const mostrarError = (campo) => (tocados[campo] || enviado) && errores[campo]

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input
        id="nombre"
        name="nombre"
        value={datos.nombre}
        onChange={manejarCambio}
        onBlur={manejarBlur}
        aria-invalid={Boolean(mostrarError('nombre'))}
        aria-describedby="error-nombre"
      />
      {mostrarError('nombre') && <p id="error-nombre" className="error">{errores.nombre}</p>}

      {/* ...el resto de campos igual */}

      <button type="submit">Crear cuenta</button>
    </form>
  )
}
```

Tres decisiones de experiencia de usuario:

- **Los errores se calculan, no se guardan.** Igual que viste en el post de `useEffect`: si algo se puede calcular a partir del estado, no necesita estado propio.
- **No gritar antes de tiempo.** Nadie quiere ver "email inválido" mientras escribe la primera letra. El error de cada campo aparece cuando el usuario **sale del campo** (`onBlur`, lo guardamos en `tocados`) o cuando **intenta enviar**.
- **Accesibilidad**: `aria-invalid` marca el campo con error y `aria-describedby` conecta el mensaje con su campo, para que un lector de pantalla lo lea (lo viste en el post de formularios accesibles).

> Para validaciones más complejas, en vez de `validar` a mano puedes usar un esquema de **Zod** (tiene su propio módulo en la serie de TypeScript) y obtener los errores por campo con `z.flattenError`.

## La alternativa no controlada: `FormData`

No siempre necesitas que React controle cada tecla. Si solo te importan los datos **al enviar**, deja que el navegador guarde los valores y léelos al final con **`FormData`**, como en JavaScript puro:

```jsx
export default function Contacto() {
  function manejarEnvio(evento) {
    evento.preventDefault()
    const datos = Object.fromEntries(new FormData(evento.currentTarget))
    console.log(datos) // { nombre: '...', mensaje: '...' }
  }

  return (
    <form onSubmit={manejarEnvio}>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" required />

      <label htmlFor="mensaje">Mensaje</label>
      <textarea id="mensaje" name="mensaje" required />

      <button type="submit">Enviar</button>
    </form>
  )
}
```

Sin `value`, sin `onChange`, sin estado: los campos son **no controlados**. Menos código, y además funcionan las validaciones nativas del navegador (`required`, `type="email"`...).

| Controlado (`value` + `onChange`) | No controlado (`FormData`) |
| --- | --- |
| Necesitas el valor **mientras** se escribe | Solo lo necesitas **al enviar** |
| Validación en vivo, campos que dependen de otros | Formularios sencillos |
| Formatear lo que se escribe (por ejemplo, una tarjeta) | Menos código y menos renders |

## React 19: acciones de formulario con `useActionState`

React 19 permite pasar una **función** a la prop `action` del `<form>`. React la llama con los datos del formulario y se encarga del estado de "enviando". Con **`useActionState`** además guardas el resultado:

```jsx
import { useActionState } from 'react'

async function suscribirse(estadoAnterior, formData) {
  const email = formData.get('email')

  if (!email.includes('@')) {
    return { error: 'Escribe un email válido', email }
  }

  const respuesta = await fetch('/api/suscripciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  if (!respuesta.ok) return { error: 'No se pudo completar la suscripción', email }
  return { exito: true }
}

export default function Boletin() {
  const [estado, accion, enviando] = useActionState(suscribirse, {})

  if (estado.exito) return <p role="status">¡Listo! Revisa tu correo 📬</p>

  return (
    <form action={accion}>
      <label htmlFor="email">Tu email</label>
      <input id="email" name="email" type="email" defaultValue={estado.email} />

      {estado.error && <p role="alert">{estado.error}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? 'Enviando...' : 'Suscribirme'}
      </button>
    </form>
  )
}
```

- **`useActionState(funcion, estadoInicial)`** devuelve el **estado actual**, la **acción** para el `<form>` y un booleano **`enviando`**.
- La función recibe el **estado anterior** y el **`formData`**, y lo que devuelve se convierte en el nuevo estado.
- **Sin `preventDefault`**, sin `useState` para "cargando" y sin `try/finally`: React lo gestiona.
- Tras la acción, React **reinicia** los campos no controlados. Por eso devolvemos `email` en el error y lo usamos como `defaultValue`: así el usuario no pierde lo que escribió.

En frameworks como **Next.js**, esa misma función puede ejecutarse **en el servidor** (*Server Actions*), y el formulario funciona incluso antes de que cargue JavaScript.

## ¿Y las librerías de formularios?

Para formularios grandes (decenas de campos, pasos, campos dinámicos), los equipos suelen usar **React Hook Form** o **TanStack Form**, normalmente con Zod para validar. Todo lo de este post es lo que esas librerías hacen por dentro, así que podrás usarlas sabiendo qué pasa.

## Tu turno

1. Crea un formulario de reserva con nombre, fecha (`type="date"`), número de personas (`select` del 1 al 6) y un checkbox "Necesito silla de bebé", con un solo estado y un solo `manejarCambio`.
2. Valida que la fecha no esté en el pasado y muestra el error al salir del campo.
3. Desactiva el botón de enviar mientras haya errores.
4. Rehaz el formulario con `useActionState` y una función que simule una petición lenta con `await new Promise((r) => setTimeout(r, 1500))`.

## Errores comunes

- **Olvidar el `name`** en un input con el manejador único: no se actualiza nada.
- **Usar `value` en un checkbox.** Se controla con `checked`.
- **Mutar el estado**: `datos.nombre = 'Ana'`. Crea un objeto nuevo con `...`.
- **Guardar los errores en un estado aparte** y que se desincronicen. Calcúlalos al pintar.
- **Mezclar controlado y no controlado**: un input con `value` pero sin `onChange` no deja escribir (React te avisa en la consola).
- **Mostrar todos los errores al cargar la página.** Espera al `blur` o al envío.

## Para profundizar

- [Reaccionar a la entrada con el estado (documentación oficial, en español)](https://es.react.dev/learn/reacting-to-input-with-state)
- [`useActionState` (documentación oficial, en español)](https://es.react.dev/reference/react/useActionState)

En resumen: para formularios grandes usa **un objeto de estado** y **un solo `manejarCambio`** con `[name]: value` (y `checked` para los checkbox). **Calcula los errores** al pintar y muéstralos al salir del campo o al enviar, con `aria-invalid`. Si solo necesitas los datos al final, usa campos **no controlados** con **`FormData`**, y en React 19, **`useActionState`** gestiona el envío, el estado de carga y el resultado por ti.
