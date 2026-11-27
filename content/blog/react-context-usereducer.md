---
title: 'React avanzado: estado global con Context y useReducer'
description: 'El problema del prop drilling, cómo compartir datos con createContext y useContext, organizar lógica compleja con useReducer y acciones, combinarlos en un carrito global con un hook propio y cuándo pasar a una librería como Zustand.'
date: 2026-11-27
series: frameworks
tags: [React, Context, useReducer, Estado, Avanzado]
draft: true
---

Tu tienda tiene un **carrito**. El contador del icono está en el `Header`; el botón "Añadir" está en cada `TarjetaProducto`, dentro de `ListaProductos`, dentro de `PaginaTienda`; y el resumen está en `PaginaCarrito`. Todos necesitan **el mismo carrito**.

Con lo que sabes, el estado vive en `App` y lo pasas como props... por cuatro niveles de componentes que ni siquiera lo usan, solo lo reenvían. A eso se le llama **prop drilling** (taladrar props), y se vuelve inmanejable muy rápido.

```jsx
<App carrito={carrito} agregar={agregar}>
  <PaginaTienda carrito={carrito} agregar={agregar}>       {/* no lo usa */}
    <ListaProductos carrito={carrito} agregar={agregar}>   {/* no lo usa */}
      <TarjetaProducto agregar={agregar} />                {/* ¡por fin! */}
```

Hoy lo resuelves con dos herramientas de React: **Context** para compartir datos sin pasarlos a mano y **`useReducer`** para organizar la lógica cuando el estado se complica.

## Context: datos disponibles para todo un árbol

**Context** crea un "canal" por el que cualquier componente de un árbol puede leer un valor directamente, sin props intermedias.

Tres pasos: **crear**, **proveer** y **consumir**.

```jsx
import { createContext, useContext, useState } from 'react'

// 1. Crear el contexto
const TemaContext = createContext('claro')

// 2. Proveer un valor a todo lo que haya dentro
export default function App() {
  const [tema, setTema] = useState('oscuro')

  return (
    <TemaContext value={tema}>
      <Pagina />
      <button onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')}>Cambiar tema</button>
    </TemaContext>
  )
}

function Pagina() {
  return <Boton>Comprar</Boton> // Pagina no sabe nada del tema
}

// 3. Consumirlo donde haga falta
function Boton({ children }) {
  const tema = useContext(TemaContext)
  return <button className={`boton boton--${tema}`}>{children}</button>
}
```

- **`createContext(valorPorDefecto)`** crea el contexto. El valor por defecto solo se usa si un componente lo lee **sin** un proveedor por encima.
- **`<TemaContext value={...}>`** provee el valor a todos sus descendientes, a cualquier profundidad. (En React 18 y anteriores se escribía `<TemaContext.Provider value={...}>`, que todavía funciona.)
- **`useContext(TemaContext)`** lo lee. Cuando el valor cambia, **todos** los componentes que lo leen se vuelven a pintar.

Context es ideal para datos que **muchos componentes** necesitan y que **cambian poco**: el tema, el idioma, el usuario conectado, el carrito.

## `useReducer`: cuando `useState` se queda corto

El carrito tiene muchas operaciones: añadir, quitar, cambiar cantidad, vaciar, aplicar cupón... Con `useState`, esa lógica acaba **repartida** en funciones por todo el componente.

**`useReducer`** la centraliza en **una sola función pura**, el **reducer**: recibe el estado actual y una **acción** (qué ha pasado), y devuelve el estado nuevo.

```jsx
function carritoReducer(estado, accion) {
  switch (accion.tipo) {
    case 'agregar': {
      const existente = estado.find((linea) => linea.id === accion.producto.id)
      if (existente) {
        return estado.map((linea) =>
          linea.id === accion.producto.id ? { ...linea, cantidad: linea.cantidad + 1 } : linea
        )
      }
      return [...estado, { ...accion.producto, cantidad: 1 }]
    }
    case 'quitar':
      return estado.filter((linea) => linea.id !== accion.id)
    case 'cambiarCantidad':
      return estado
        .map((linea) => (linea.id === accion.id ? { ...linea, cantidad: accion.cantidad } : linea))
        .filter((linea) => linea.cantidad > 0)
    case 'vaciar':
      return []
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`)
  }
}
```

Y en el componente:

```jsx
import { useReducer } from 'react'

function Carrito() {
  const [carrito, dispatch] = useReducer(carritoReducer, [])

  return (
    <>
      <button onClick={() => dispatch({ tipo: 'agregar', producto: { id: 1, nombre: 'Teclado', precio: 120 } })}>
        Añadir teclado
      </button>
      <button onClick={() => dispatch({ tipo: 'vaciar' })}>Vaciar</button>
      <p>{carrito.length} productos distintos</p>
    </>
  )
}
```

- **`useReducer(reducer, estadoInicial)`** devuelve el estado y **`dispatch`**.
- **`dispatch(accion)`** "envía" una acción: un objeto que describe **qué pasó** (`{ tipo: 'vaciar' }`), no **cómo** cambiar el estado.
- El reducer es una **función pura**: no hace `fetch`, no modifica `estado` (devuelve uno nuevo con `...`, `map` y `filter`), y con los mismos datos devuelve siempre lo mismo.

¿Ventajas? Toda la lógica del carrito está **en un solo sitio**, se lee como una lista de casos y, como es una función pura, **se prueba sin React**:

```js
import { it, expect } from 'vitest'

it('agregar dos veces el mismo producto suma la cantidad', () => {
  const teclado = { id: 1, nombre: 'Teclado', precio: 120 }
  let estado = carritoReducer([], { tipo: 'agregar', producto: teclado })
  estado = carritoReducer(estado, { tipo: 'agregar', producto: teclado })

  expect(estado).toEqual([{ ...teclado, cantidad: 2 }])
})
```

> Si usas TypeScript, las acciones son una **unión discriminada** por `tipo` (está en la serie de TypeScript): el editor te avisa si envías una acción mal escrita o si te falta un caso en el `switch`.

| | `useState` | `useReducer` |
| --- | --- | --- |
| Estado | Simple (un texto, un booleano, un número) | Complejo, con muchas formas de cambiar |
| Lógica | Repartida en manejadores | Centralizada en el reducer |
| Probar | Con el componente | El reducer, sin React |

## Juntos: un carrito global

Context reparte los datos; `useReducer` organiza la lógica. Juntos, tienes un **estado global** sin librerías.

```jsx
// src/carrito/CarritoContext.jsx
import { createContext, useContext, useReducer } from 'react'
import { carritoReducer } from './carritoReducer'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [lineas, dispatch] = useReducer(carritoReducer, [])

  const total = lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0)
  const unidades = lineas.reduce((suma, linea) => suma + linea.cantidad, 0)

  const valor = {
    lineas,
    total,
    unidades,
    agregar: (producto) => dispatch({ tipo: 'agregar', producto }),
    quitar: (id) => dispatch({ tipo: 'quitar', id }),
    cambiarCantidad: (id, cantidad) => dispatch({ tipo: 'cambiarCantidad', id, cantidad }),
    vaciar: () => dispatch({ tipo: 'vaciar' })
  }

  return <CarritoContext value={valor}>{children}</CarritoContext>
}

export function useCarrito() {
  const contexto = useContext(CarritoContext)
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  }
  return contexto
}
```

Tres buenas prácticas en este archivo:

- **Un hook propio, `useCarrito()`**, en lugar de exportar el contexto. Los componentes no necesitan saber que hay un Context por debajo (lo viste en el post de custom hooks).
- **Un error claro** si alguien usa `useCarrito` fuera del proveedor. Sin él, recibirías un `null` y un error confuso más tarde.
- **Datos derivados** (`total`, `unidades`) calculados en el proveedor, no guardados en el estado.

Se envuelve la app una vez:

```jsx
// src/main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CarritoProvider>
      <App />
    </CarritoProvider>
  </StrictMode>
)
```

Y **cualquier** componente, a cualquier profundidad, lo usa sin props:

```jsx
function IconoCarrito() {
  const { unidades } = useCarrito()
  return <span aria-label={`${unidades} productos en el carrito`}>🛒 {unidades}</span>
}

function TarjetaProducto({ producto }) {
  const { agregar } = useCarrito()
  return (
    <article>
      <h3>{producto.nombre}</h3>
      <button onClick={() => agregar(producto)}>Añadir al carrito</button>
    </article>
  )
}
```

Adiós al prop drilling.

## Persistir el carrito

Combinado con lo del post de custom hooks: el tercer argumento de `useReducer` es una función de **inicialización perezosa**, y un `useEffect` guarda cada cambio.

```jsx
const [lineas, dispatch] = useReducer(carritoReducer, [], () => {
  try {
    return JSON.parse(localStorage.getItem('carrito')) ?? []
  } catch {
    return []
  }
})

useEffect(() => {
  localStorage.setItem('carrito', JSON.stringify(lineas))
}, [lineas])
```

## Los límites de Context

Context tiene un coste: **cuando su valor cambia, se vuelven a pintar todos los componentes que lo leen**. Aunque un componente solo use `agregar` (que nunca cambia), se pintará de nuevo cada vez que cambie `lineas`.

Para la mayoría de apps esto no importa. Si se nota (lo verás en el post de rendimiento):

- **Divide los contextos**: uno para los datos que cambian y otro para las funciones.
- **No metas todo en un contexto gigante.** Un contexto por tema: tema, usuario, carrito.
- Si el estado global es grande y cambia mucho, usa una librería pensada para eso, como **Zustand** o **Redux Toolkit**: permiten que cada componente se suscriba **solo** a la parte que usa.

Y recuerda: **no todo tiene que ser global.** Si un estado solo lo usan un componente y sus hijos directos, déjalo local con `useState`.

## Tu turno

1. Crea un `TemaProvider` con un hook `useTema()` que devuelva el tema y una función `alternar`, y guárdalo en `localStorage`.
2. Añade al `carritoReducer` la acción `aplicarCupon` (cambia el estado a un objeto `{ lineas, cupon }`) y escribe sus tests con Vitest.
3. Crea un `UsuarioProvider` que simule un inicio de sesión (`iniciarSesion(nombre)`, `cerrarSesion()`) y muestra el nombre en el `Header` y un mensaje en otra página.
4. Prueba un componente que use `useCarrito` con Testing Library, envolviéndolo en el proveedor dentro del `render`.

## Errores comunes

- **Usar `useContext` fuera del proveedor** y recibir el valor por defecto (`null`). Lanza un error claro en tu hook.
- **Mutar el estado en el reducer** (`estado.push(...)`). Devuelve siempre uno nuevo.
- **Poner efectos en el reducer** (`fetch`, `localStorage`). El reducer es puro; los efectos van en `useEffect` o en los manejadores.
- **Un solo contexto para todo**, y toda la app se vuelve a pintar con cada cambio.
- **Hacer global lo que es local.** Context no reemplaza a `useState`.
- **Olvidar el `default`** en el `switch`: una acción mal escrita no hace nada y no te enteras.

## Para profundizar

- [Pasar datos en profundidad con Context (documentación oficial, en español)](https://es.react.dev/learn/passing-data-deeply-with-context)
- [Escalar con reducer y context (documentación oficial, en español)](https://es.react.dev/learn/scaling-up-with-reducer-and-context)

En resumen: **Context** comparte datos con todo un árbol de componentes sin **prop drilling** (`createContext`, un proveedor y `useContext`). **`useReducer`** centraliza la lógica de un estado complejo en un **reducer puro** que recibe **acciones**, y se prueba sin React. Juntos, envueltos en un **proveedor** y un **hook propio** como `useCarrito()`, te dan un estado global sin librerías. Úsalo para datos que muchos componentes necesitan, divídelo por temas y pasa a **Zustand** o **Redux Toolkit** si crece mucho.
