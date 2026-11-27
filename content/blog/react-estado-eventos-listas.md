---
title: 'React: estado con useState, eventos y listas con key'
description: 'Dale vida a tus componentes: guarda datos que cambian con useState, reacciona a clics y formularios y pinta listas desde un array con map y key.'
date: 2026-11-26
series: frameworks
tags: [React, Frameworks, JavaScript]
draft: true
---

En el post anterior hiciste componentes que reciben **props** y muestran datos. Pero eran estáticos: no cambiaban nunca. Hoy vamos a hacer que **reaccionen** a lo que hace el usuario: contar clics, escribir en un formulario y añadir o borrar elementos de una lista.

Si hiciste el post de "pintar una lista desde un array" con JavaScript puro, vas a reconocer todas las ideas.

## El problema: una variable normal no basta

Intenta esto:

```jsx
export default function Contador() {
  let clics = 0

  return (
    <button onClick={() => { clics++; console.log(clics) }}>
      Clics: {clics}
    </button>
  )
}
```

En la consola, `clics` sube: 1, 2, 3... Pero el botón **siempre dice 0**. ¿Por qué?

Porque React no sabe que algo cambió. Cambiar una variable normal **no vuelve a pintar** el componente. Y aunque lo repintara, el componente es una función que se ejecuta de nuevo y vuelve a hacer `let clics = 0`.

## La solución: `useState`

`useState` guarda un dato que **sobrevive entre pintadas** y que, al cambiarlo, **hace que React vuelva a pintar** el componente:

```jsx
import { useState } from 'react'

export default function Contador() {
  const [clics, setClics] = useState(0)

  return (
    <button onClick={() => setClics(clics + 1)}>
      Clics: {clics}
    </button>
  )
}
```

Línea por línea:

- **`useState(0)`**: crea un estado con valor inicial `0`.
- Devuelve un array con dos cosas, que sacamos con **destructuring**:
  - **`clics`**: el valor actual.
  - **`setClics`**: la función para cambiarlo. Por convención se llama `set` + el nombre.
- **`setClics(clics + 1)`**: guarda el nuevo valor y React **vuelve a ejecutar** la función `Contador`, esta vez con `clics` valiendo 1.

Es el mismo patrón que hicimos a mano con `render()`, pero automático: **cambias el estado y la interfaz se actualiza sola**.

> Las funciones que empiezan por `use` (`useState`, `useEffect`...) se llaman **hooks**. Regla: llámalas siempre **al principio del componente**, nunca dentro de un `if` o de un bucle.

## Eventos

Los eventos se escriben en camelCase (`onClick`, `onChange`, `onSubmit`) y reciben **una función**:

```jsx
function Botones() {
  function saludar() {
    alert('¡Hola!')
  }

  return (
    <>
      <button onClick={saludar}>Saludar</button>
      <button onClick={() => alert('Adiós')}>Despedirse</button>
    </>
  )
}
```

**Cuidado:** `onClick={saludar}` pasa la función; `onClick={saludar()}` la **ejecuta** al pintar, sin que nadie haga clic. Es el mismo error que con `addEventListener`.

## Formularios: inputs controlados

Para leer lo que escribe el usuario, guardas el valor del campo en el estado y lo actualizas en cada tecla:

```jsx
import { useState } from 'react'

export default function Saludo() {
  const [nombre, setNombre] = useState('')

  return (
    <>
      <label htmlFor="nombre">¿Cómo te llamas?</label>
      <input
        id="nombre"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
      />
      <p>Hola, {nombre || 'desconocido'} 👋</p>
    </>
  )
}
```

- **`value={nombre}`**: el campo muestra lo que hay en el estado.
- **`onChange`**: en cada tecla, guardamos el nuevo texto. `evento.target` es el input y `.value` lo que tiene escrito.

A esto se le llama **input controlado**: el estado de React es la única fuente de verdad, y el campo solo lo refleja.

## Listas: `map` y `key`

Para pintar un array, usa **`map`** dentro del JSX. Transforma cada dato en un elemento:

```jsx
const productos = [
  { id: 1, nombre: 'Teclado', precio: 120 },
  { id: 2, nombre: 'Mouse', precio: 45 },
  { id: 3, nombre: 'Monitor', precio: 650 }
]

export default function Lista() {
  return (
    <ul>
      {productos.map((producto) => (
        <li key={producto.id}>
          {producto.nombre}: S/ {producto.precio}
        </li>
      ))}
    </ul>
  )
}
```

**`key`** es obligatorio en las listas. Le dice a React **qué elemento es cuál**, para que al añadir, borrar o reordenar sepa qué cambió y no repinte todo. Debe ser **único** y **estable**: usa el `id` del dato.

No uses la posición (`map((producto, i) => <li key={i}>`) si la lista puede cambiar: al borrar el primero, todos los demás cambian de posición y React se confunde (verás inputs con el texto que no toca, por ejemplo).

## Todo junto: una lista de la compra

```jsx
import { useState } from 'react'

export default function ListaCompra() {
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Pan', comprado: false },
    { id: 2, nombre: 'Leche', comprado: true }
  ])
  const [texto, setTexto] = useState('')

  function agregar(evento) {
    evento.preventDefault()
    if (!texto.trim()) return

    setProductos([...productos, { id: Date.now(), nombre: texto.trim(), comprado: false }])
    setTexto('')
  }

  function alternar(id) {
    setProductos(productos.map((producto) =>
      producto.id === id ? { ...producto, comprado: !producto.comprado } : producto
    ))
  }

  function borrar(id) {
    setProductos(productos.filter((producto) => producto.id !== id))
  }

  const pendientes = productos.filter((producto) => !producto.comprado).length

  return (
    <section>
      <h1>Lista de la compra</h1>

      <form onSubmit={agregar}>
        <input
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="¿Qué necesitas?"
          aria-label="Producto"
        />
        <button>Añadir</button>
      </form>

      <ul>
        {productos.map((producto) => (
          <li key={producto.id}>
            <label>
              <input
                type="checkbox"
                checked={producto.comprado}
                onChange={() => alternar(producto.id)}
              />
              {producto.nombre}
            </label>
            <button onClick={() => borrar(producto.id)} aria-label={`Borrar ${producto.nombre}`}>✕</button>
          </li>
        ))}
      </ul>

      {productos.length === 0 && <p>Tu lista está vacía 🛒</p>}
      <p>Te quedan {pendientes} productos por comprar.</p>
    </section>
  )
}
```

Fíjate en tres cosas:

1. **Nunca modificamos el array directamente.** Nada de `productos.push(...)`. Creamos **un array nuevo** con spread, `map` o `filter`, y se lo pasamos a `setProductos`. React detecta el cambio comparando si es un array distinto; si modificas el mismo, no se entera.
2. **`pendientes` no es un estado.** Se calcula a partir de `productos` en cada pintada. Si un dato se puede calcular a partir de otro, no lo guardes aparte: así nunca se desincronizan.
3. **`onClick={() => borrar(producto.id)}`**: cuando necesitas pasarle un argumento, la envuelves en una arrow function.

## Las tres operaciones de siempre

| Quieres... | Con `setEstado` |
| --- | --- |
| Añadir | `setLista([...lista, nuevo])` |
| Borrar | `setLista(lista.filter(item => item.id !== id))` |
| Editar | `setLista(lista.map(item => item.id === id ? { ...item, cambio } : item))` |
| Cambiar una propiedad de un objeto | `setUsuario({ ...usuario, nombre: 'Ana' })` |

## Compartir estado entre componentes

¿Y si el contador del carrito está en la `<Cabecera>` y el botón de añadir en una `<Tarjeta>`? El estado se pone en el **componente padre común** y se baja con props. Incluida la función para cambiarlo:

```jsx
function App() {
  const [carrito, setCarrito] = useState(0)

  return (
    <>
      <Cabecera cantidad={carrito} />
      <Tarjeta nombre="Teclado" onAgregar={() => setCarrito(carrito + 1)} />
    </>
  )
}

function Cabecera({ cantidad }) {
  return <header>🛒 {cantidad}</header>
}

function Tarjeta({ nombre, onAgregar }) {
  return (
    <article>
      <h2>{nombre}</h2>
      <button onClick={onAgregar}>Añadir</button>
    </article>
  )
}
```

A esto se le llama **"levantar el estado"**. Los datos bajan por las props y los eventos "suben" mediante funciones.

## Tu turno

Partiendo de la lista de la compra:

1. Añade un botón "Borrar comprados" que elimine todos los marcados.
2. Añade un filtro con tres botones: "Todos", "Pendientes" y "Comprados". Pista: guarda el filtro elegido en otro `useState` y filtra **al pintar**, sin modificar `productos`.
3. Separa cada `<li>` en un componente `ItemProducto` que reciba el producto y las funciones `onAlternar` y `onBorrar` por props.

## Errores comunes

- **Modificar el estado directamente** (`productos.push(...)`, `usuario.nombre = 'Ana'`). La pantalla no se actualiza. Crea siempre una copia.
- **Esperar que el estado cambie al instante.** Después de `setClics(clics + 1)`, `clics` todavía tiene el valor viejo hasta la siguiente pintada.
- **Olvidar la `key`** o usar la posición del array. Usa el `id`.
- **`onClick={funcion()}`** en vez de `onClick={funcion}`.
- **Guardar en el estado algo que se puede calcular** (totales, contadores, listas filtradas). Calcúlalo al pintar.
- **Llamar a `useState` dentro de un `if`.** Los hooks siempre van arriba del componente.

## Para profundizar

- [El estado: la memoria de un componente](https://es.react.dev/learn/state-a-components-memory)
- [Responder a eventos](https://es.react.dev/learn/responding-to-events)
- [Renderizado de listas](https://es.react.dev/learn/rendering-lists)
- [Actualizar arrays en el estado](https://es.react.dev/learn/updating-arrays-in-state)

En resumen: **`useState`** guarda datos que cambian y, al cambiarlos con su `set`, React **vuelve a pintar** el componente. Los eventos (`onClick`, `onChange`, `onSubmit`) reciben **funciones**. Las listas se pintan con **`map`** y cada elemento necesita una **`key` única**. Y la regla de oro: **nunca modifiques el estado**, crea siempre una copia nueva.
