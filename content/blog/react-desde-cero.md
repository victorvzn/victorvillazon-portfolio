---
title: 'React desde cero: tu primer proyecto, JSX, componentes y props'
description: 'Crea un proyecto de React con Vite, entiende qué es JSX y construye tus primeros componentes reutilizables pasándoles datos con props.'
date: 2026-11-26
series: frameworks
tags: [React, Frameworks, JavaScript]
draft: true
---

En el post "¿Por qué un framework?" vimos qué problema resuelve React: mantener la interfaz sincronizada con los datos sin hacerlo a mano. Hoy toca ponerse manos a la obra. Vas a crear tu primer proyecto y tus primeros **componentes**.

**Antes de empezar**, asegúrate de que te sientes cómodo con: arrow functions, template literals, destructuring, `map` y `import`/`export`. React los usa en cada línea.

## Paso 1: crear el proyecto

Necesitas tener **Node.js** instalado (tienes un post sobre eso). Abre una terminal en la carpeta donde guardes tus proyectos y ejecuta:

```bash
npm create vite@latest mi-tienda -- --template react
cd mi-tienda
npm install
npm run dev
```

1. **`npm create vite@latest`** crea un proyecto nuevo con **Vite**, la herramienta que prepara y sirve tu código (tiene su propio post).
2. **`npm install`** descarga React y las demás dependencias en la carpeta `node_modules`.
3. **`npm run dev`** arranca un servidor de desarrollo. Abre la dirección que aparece (normalmente `http://localhost:5173`).

Cada vez que guardes un archivo, la página se actualizará sola.

> Si te pregunta algo durante la instalación (por ejemplo, si quieres instalar el paquete `create-vite`), responde que sí con `y`.

## Paso 2: los archivos que importan

```bash
mi-tienda/
├── index.html        # la única página HTML, con un <div id="root">
├── package.json
└── src/
    ├── main.jsx      # conecta React con ese div
    ├── App.jsx       # tu componente principal
    └── App.css
```

`main.jsx` hace una sola cosa: **meter tu aplicación dentro del `<div id="root">`** del `index.html`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

`<StrictMode>` es un modo de desarrollo que te avisa de errores comunes. No se ve en la página: déjalo como está.

Todo lo demás lo construyes en componentes, empezando por `App.jsx`. Borra su contenido y escribe esto:

```jsx
export default function App() {
  return <h1>¡Hola, React!</h1>
}
```

Guarda y mira el navegador. Ese es tu primer componente.

## ¿Qué es un componente?

Un **componente** es una **función que devuelve un trozo de interfaz**. Así de simple. Dos reglas:

1. Su nombre empieza con **mayúscula** (`App`, `Tarjeta`, `BotonComprar`). Así React distingue tus componentes de las etiquetas HTML normales.
2. Devuelve **JSX**.

## JSX: HTML dentro de JavaScript

**JSX** parece HTML, pero está dentro de JavaScript. Vite lo convierte en JavaScript normal antes de que llegue al navegador. Las diferencias con el HTML que conoces:

| HTML | JSX | Por qué |
| --- | --- | --- |
| `class="..."` | `className="..."` | `class` es una palabra reservada de JavaScript |
| `for="..."` (en `<label>`) | `htmlFor="..."` | Igual: `for` es de los bucles |
| `<img>` | `<img />` | En JSX **todas** las etiquetas se cierran |
| `onclick="..."` | `onClick={...}` | Los eventos van en camelCase y reciben una función |
| `style="color: red"` | `style={{ color: 'red' }}` | El estilo es un objeto de JavaScript |

### Las llaves `{}`: JavaScript dentro del JSX

Dentro del JSX, todo lo que va entre **llaves** es JavaScript. Es como el `${}` de los template literals:

```jsx
export default function App() {
  const nombre = 'Ana'
  const productos = 3

  return (
    <div>
      <h1>Hola, {nombre}</h1>
      <p>Tienes {productos} productos en el carrito.</p>
      <p>Total: S/ {productos * 25}</p>
    </div>
  )
}
```

Dentro de las llaves puedes poner **cualquier expresión** (algo que da un valor): una variable, una operación, una llamada a una función, un ternario. Lo que **no** puedes poner es un `if` o un `for`, porque no dan un valor.

### Un solo elemento raíz

Un componente tiene que devolver **un solo elemento** que envuelva todo. Si no quieres añadir un `<div>` extra, usa un **fragmento**, `<>...</>`:

```jsx
// ❌ Error: dos elementos sueltos
return (
  <h1>Título</h1>
  <p>Texto</p>
)

// ✅ Bien: envueltos en un fragmento
return (
  <>
    <h1>Título</h1>
    <p>Texto</p>
  </>
)
```

Los paréntesis alrededor del JSX sirven para poder escribirlo en varias líneas.

## Paso 3: tu primer componente reutilizable

Crea un archivo `src/Tarjeta.jsx`:

```jsx
export default function Tarjeta() {
  return (
    <article className="tarjeta">
      <h2>Teclado mecánico</h2>
      <p>S/ 120</p>
      <button>Añadir al carrito</button>
    </article>
  )
}
```

Y úsalo en `App.jsx` como si fuera una etiqueta HTML:

```jsx
import Tarjeta from './Tarjeta.jsx'

export default function App() {
  return (
    <main>
      <h1>Mi tienda</h1>
      <Tarjeta />
      <Tarjeta />
      <Tarjeta />
    </main>
  )
}
```

Tres tarjetas con una línea cada una. Pero todas dicen "Teclado mecánico". Necesitamos pasarles datos.

## Paso 4: props, los datos que recibe un componente

Las **props** (de *properties*) son a los componentes lo que los **atributos** a las etiquetas HTML. Igual que `<img src="...">` recibe un `src`, tu `<Tarjeta>` puede recibir un `nombre` y un `precio`:

```jsx
import Tarjeta from './Tarjeta.jsx'

export default function App() {
  return (
    <main>
      <h1>Mi tienda</h1>
      <Tarjeta nombre="Teclado mecánico" precio={120} />
      <Tarjeta nombre="Mouse inalámbrico" precio={45} />
      <Tarjeta nombre="Monitor 27 pulgadas" precio={650} agotado />
    </main>
  )
}
```

- Los **textos** van entre comillas: `nombre="..."`.
- **Todo lo demás** (números, booleanos, arrays, objetos, funciones) va entre llaves: `precio={120}`.
- Una prop **sin valor**, como `agotado`, vale `true`.

El componente recibe todas las props en **un objeto**. Lo normal es sacarlas con **destructuring** directamente en los parámetros:

```jsx
export default function Tarjeta({ nombre, precio, agotado = false }) {
  return (
    <article className="tarjeta">
      <h2>{nombre}</h2>
      <p>S/ {precio}</p>
      {agotado ? <p className="agotado">Agotado</p> : <button>Añadir al carrito</button>}
    </article>
  )
}
```

`agotado = false` es un **valor por defecto**: si no te pasan esa prop, vale `false`.

El ternario elige qué mostrar: si está agotado, un aviso; si no, el botón. Esto se llama **renderizado condicional**. Cuando solo quieres mostrar algo o nada, se usa `&&`:

```jsx
{agotado && <p className="agotado">Agotado</p>}
```

**Regla importante:** un componente **nunca modifica sus props**. Son de solo lectura, como los parámetros de una función que no deberías cambiar. Si un dato tiene que cambiar, eso es **estado**, y lo vemos en el siguiente post.

## Paso 5: los estilos

Puedes importar un CSS normal en cualquier componente:

```jsx
import './Tarjeta.css'
```

```css
.tarjeta {
  padding: 16px;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
}

.agotado {
  color: #dc2626;
  font-weight: 600;
}
```

Recuerda que en JSX se escribe `className`, no `class`.

## Pensar en componentes

Cuando veas un diseño, divídelo en piezas, igual que dividías una maqueta en cajas:

```
<App>
├── <Cabecera />
│   └── <IconoCarrito cantidad={3} />
├── <ListaProductos>
│   ├── <Tarjeta ... />
│   ├── <Tarjeta ... />
│   └── <Tarjeta ... />
└── <Pie />
```

Una buena señal de que algo debería ser un componente: **se repite** (como las tarjetas) o es **lo bastante grande** para tener sentido por sí solo (como la cabecera).

## Tu turno

1. Crea un componente `Perfil` que reciba `nombre`, `puesto` y `foto` (una URL) y los muestre en una tarjeta.
2. Úsalo tres veces en `App` con personas distintas. Para las fotos puedes usar `https://i.pravatar.cc/150?img=1` (cambia el número).
3. Añade una prop `disponible`: si es `true`, muestra un punto verde y el texto "Disponible para trabajar".

## Errores comunes

- **Componentes con minúscula** (`function tarjeta()`). React los trata como etiquetas HTML desconocidas y no se ven. Usa mayúscula.
- **`class` en vez de `className`.** Funciona a medias y la consola muestra un aviso.
- **Olvidar cerrar etiquetas** como `<img>` o `<input>`. En JSX: `<img />`.
- **Devolver dos elementos sin envolverlos.** Usa `<>...</>`.
- **Pasar números como texto**: `precio="120"` es un string. Usa `precio={120}`.
- **Poner un `if` dentro de las llaves.** Usa un ternario o `&&`.

## Para profundizar

- [Tu primer componente (documentación oficial de React)](https://es.react.dev/learn/your-first-component)
- [Escribir marcado con JSX](https://es.react.dev/learn/writing-markup-with-jsx)
- [Pasar props a un componente](https://es.react.dev/learn/passing-props-to-a-component)

En resumen: un **componente** es una **función con nombre en mayúscula que devuelve JSX**. El **JSX** es HTML con algunas diferencias (`className`, etiquetas cerradas) y con **llaves** para meter JavaScript. Las **props** son los datos que le pasas a un componente, como atributos, y nunca se modifican. En el siguiente post le daremos vida con el **estado** y los **eventos**.
