---
title: 'React: crea tus propios hooks (custom hooks)'
description: 'Qué es un custom hook y cuándo crear uno, las reglas de los hooks, y cuatro hooks útiles paso a paso: useLocalStorage, useFetch, useDebounce y useMediaQuery, más cómo probarlos.'
date: 2026-11-27
series: frameworks
tags: [React, Hooks, Intermedio]
draft: true
---

Ya usas `useState` y `useEffect` con soltura. Pero empiezas a ver **el mismo patrón repetido**: en tres componentes cargas datos con `fetch` y gestionas carga y error; en dos guardas algo en `localStorage`. Copiar y pegar ese código es pedir bugs.

En React, la forma de **reutilizar lógica** (no interfaz, lógica) entre componentes es crear **tus propios hooks**.

## ¿Qué es un custom hook?

Un custom hook es simplemente **una función de JavaScript cuyo nombre empieza por `use`** y que usa otros hooks dentro. Nada más. No hay que registrarlo ni importar nada especial.

```jsx
function useContador(inicial = 0) {
  const [cuenta, setCuenta] = useState(inicial)

  const sumar = () => setCuenta((c) => c + 1)
  const restar = () => setCuenta((c) => c - 1)
  const reiniciar = () => setCuenta(inicial)

  return { cuenta, sumar, restar, reiniciar }
}
```

```jsx
function Carrito() {
  const { cuenta, sumar, restar } = useContador(1)

  return (
    <div>
      <button onClick={restar} disabled={cuenta <= 1}>−</button>
      <span>{cuenta}</span>
      <button onClick={sumar}>+</button>
    </div>
  )
}
```

Lo importante: **cada componente que usa el hook tiene su propio estado**. Si dos componentes llaman a `useContador()`, cada uno tiene su `cuenta`. Los hooks comparten **lógica**, no datos. (Para compartir datos está Context, en el siguiente post.)

## Las reglas de los hooks

Todos los hooks (los de React y los tuyos) siguen dos reglas:

1. **Solo se llaman en el nivel superior** del componente o de otro hook. Nunca dentro de un `if`, un bucle o una función anidada.
2. **Solo se llaman desde componentes de React o desde otros hooks**, no desde funciones normales.

```jsx
// ❌ Mal: un hook dentro de un if
function Perfil({ usuario }) {
  if (!usuario) return null
  const [abierto, setAbierto] = useState(false) // a veces se llama y a veces no
}

// ✅ Bien: los hooks arriba, las condiciones después
function Perfil({ usuario }) {
  const [abierto, setAbierto] = useState(false)
  if (!usuario) return null
}
```

¿Por qué? React identifica cada `useState` **por el orden** en que se llaman. Si un `if` se salta uno, el orden cambia y React mezcla los estados. Por eso el nombre empieza por `use`: así React (y el linter) saben que deben aplicar estas reglas.

## Hook 1: `useLocalStorage`

Un `useState` que **recuerda** su valor aunque recargues la página:

```jsx
import { useEffect, useState } from 'react'

export function useLocalStorage(clave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave)
      return guardado !== null ? JSON.parse(guardado) : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    localStorage.setItem(clave, JSON.stringify(valor))
  }, [clave, valor])

  return [valor, setValor]
}
```

Se usa **exactamente igual que `useState`**:

```jsx
function Ajustes() {
  const [tema, setTema] = useLocalStorage('tema', 'oscuro')

  return (
    <button onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')}>
      Tema: {tema}
    </button>
  )
}
```

- **`useState(() => ...)`** con una función es la **inicialización perezosa**: la función solo se ejecuta en el primer render. Leer `localStorage` en cada render sería un desperdicio.
- El `try/catch` protege de un JSON corrupto (lo viste en el post de `localStorage`).
- Devolvemos un **array** `[valor, setValor]` para imitar a `useState`. Si devuelves varias cosas sin un orden obvio, mejor un objeto, como en `useContador`.

## Hook 2: `useFetch`

El patrón del post de `useEffect` (carga, error, datos y cancelación) en un hook:

```jsx
import { useEffect, useState } from 'react'

export function useFetch(url) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return
    const controlador = new AbortController()

    async function cargar() {
      setCargando(true)
      setError(null)
      try {
        const respuesta = await fetch(url, { signal: controlador.signal })
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
        setDatos(await respuesta.json())
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    cargar()
    return () => controlador.abort()
  }, [url])

  return { datos, cargando, error }
}
```

Y los componentes quedan limpísimos:

```jsx
function Usuario({ id }) {
  const { datos: usuario, cargando, error } = useFetch(`https://dummyjson.com/users/${id}`)

  if (cargando) return <p>Cargando...</p>
  if (error) return <p role="alert">{error}</p>

  return <h2>{usuario.firstName} {usuario.lastName}</h2>
}
```

Toda la complejidad está en **un sitio**. Si mañana quieres añadir reintentos o caché, lo cambias en el hook y lo ganan todos los componentes.

> `useFetch` es perfecto para aprender. En apps grandes, **TanStack Query** (o las herramientas de datos de tu framework) resuelve además caché, reintentos, datos compartidos entre componentes y recarga al volver a la pestaña.

## Hook 3: `useDebounce`

Para el buscador en vivo: no quieres pedir datos **en cada tecla**, sino cuando el usuario **deja de escribir** (lo viste en la prueba técnica de debounce).

```jsx
import { useEffect, useState } from 'react'

export function useDebounce(valor, espera = 300) {
  const [valorRetrasado, setValorRetrasado] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setValorRetrasado(valor), espera)
    return () => clearTimeout(temporizador)
  }, [valor, espera])

  return valorRetrasado
}
```

Cada vez que `valor` cambia, la limpieza cancela el temporizador anterior y se programa uno nuevo. Solo cuando pasan `espera` milisegundos sin cambios, se actualiza `valorRetrasado`.

Y aquí viene lo bonito: **los hooks se combinan**.

```jsx
function Buscador() {
  const [texto, setTexto] = useState('')
  const busqueda = useDebounce(texto, 400)
  const url = busqueda ? `https://dummyjson.com/products/search?q=${encodeURIComponent(busqueda)}` : null
  const { datos, cargando } = useFetch(url)

  return (
    <>
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        aria-label="Buscar productos"
      />
      {cargando && busqueda && <p>Buscando...</p>}
      <ul>
        {datos?.products.map((p) => <li key={p.id}>{p.title}</li>)}
      </ul>
    </>
  )
}
```

Un buscador con debounce, cancelación de peticiones viejas, carga y error, en 20 líneas. Por eso `useFetch` acepta `url = null`: así no pide nada mientras no hay búsqueda.

## Hook 4: `useMediaQuery`

Saber desde JavaScript si la pantalla es de móvil, o si el usuario prefiere el modo oscuro o menos animaciones:

```jsx
import { useEffect, useState } from 'react'

export function useMediaQuery(consulta) {
  const [coincide, setCoincide] = useState(() => window.matchMedia(consulta).matches)

  useEffect(() => {
    const lista = window.matchMedia(consulta)
    const alCambiar = () => setCoincide(lista.matches)

    alCambiar()
    lista.addEventListener('change', alCambiar)
    return () => lista.removeEventListener('change', alCambiar)
  }, [consulta])

  return coincide
}
```

```jsx
const esMovil = useMediaQuery('(max-width: 640px)')
const reducirMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)')
```

Es el mismo `prefers-reduced-motion` del post de CSS, ahora disponible en tu lógica. (Ojo: `window` no existe en el servidor. En Next.js, este hook solo funciona en componentes de cliente.)

## ¿Cuándo crear un hook?

- ✅ Cuando **repites la misma combinación de hooks** en dos o más componentes.
- ✅ Cuando un componente tiene **mucha lógica** y quieres que se lea mejor: mover la lógica a `useCarrito()` deja el componente centrado en la interfaz.
- ❌ No para envolver un solo `useState` sin lógica: `useNombre()` que solo devuelve `useState('')` no aporta nada.
- ❌ Si no usa ningún hook dentro, no es un hook: es una función normal. No le pongas `use`.

## Probar un hook

Testing Library tiene **`renderHook`** para probar hooks sin crear un componente:

```jsx
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContador } from './useContador'

describe('useContador', () => {
  it('suma y reinicia', () => {
    const { result } = renderHook(() => useContador(5))

    act(() => result.current.sumar())
    expect(result.current.cuenta).toBe(6)

    act(() => result.current.reiniciar())
    expect(result.current.cuenta).toBe(5)
  })
})
```

`result.current` es lo que devuelve el hook en el último render. `act()` envuelve las acciones que cambian el estado para que React termine de actualizar antes de comprobar. (La configuración de Vitest con Testing Library está en la serie de Testing.)

## Tu turno

1. Crea `useToggle(inicial)` que devuelva `[valor, alternar]` y úsalo para abrir y cerrar un menú.
2. Crea `useTitulo(texto)` que cambie `document.title` con un `useEffect`.
3. Crea `useEnLinea()` que devuelva si hay conexión, escuchando los eventos `online` y `offline` de `window`.
4. Refactoriza un componente tuyo con mucha lógica moviéndola a un hook y compara cómo se lee.

## Errores comunes

- **Llamar a un hook dentro de un `if`** o de un bucle. Siempre en el nivel superior.
- **Pensar que los hooks comparten estado.** Cada componente tiene el suyo; para compartir datos, usa Context.
- **Nombrar `useAlgo` a una función sin hooks**, o no empezar por `use` un hook de verdad (el linter no podrá avisarte).
- **Olvidar la limpieza** en los hooks con temporizadores, eventos o peticiones.
- **Dejar fuera de las dependencias** del `useEffect` un parámetro del hook (como `espera` o `consulta`).

## Para profundizar

- [Reutilizar lógica con hooks personalizados (documentación oficial, en español)](https://es.react.dev/learn/reusing-logic-with-custom-hooks)
- [Las reglas de los hooks (documentación oficial, en español)](https://es.react.dev/reference/rules/rules-of-hooks)

En resumen: un **custom hook** es una función que empieza por **`use`** y usa otros hooks para **reutilizar lógica** entre componentes; cada componente que lo usa tiene **su propio estado**. Respeta las **reglas de los hooks** (nivel superior, solo en componentes u otros hooks), **combínalos** como piezas (`useDebounce` + `useFetch`) y pruébalos con **`renderHook`**.
