---
title: 'Rendimiento en React: memo, useMemo, useCallback y React Compiler'
description: 'Cuándo y por qué se vuelve a pintar un componente, cómo medir con el Profiler, memo, useMemo y useCallback bien usados, useDeferredValue para listas lentas, lazy y Suspense para cargar menos JavaScript, y qué cambia con React Compiler.'
date: 2026-11-27
series: frameworks
tags: [React, Rendimiento, Avanzado]
draft: true
---

Tu app va lenta. Escribes en el buscador y las letras aparecen con retraso; abres el carrito y todo tiembla. Lo primero que te dirán es "ponle `useMemo`". Pero si no sabes **por qué** va lenta, llenarás el código de `useMemo` y seguirá igual (o peor).

Hoy aprendes primero a **entender** y **medir**, y después las herramientas, en el orden en que conviene usarlas.

## ¿Cuándo se vuelve a pintar un componente?

En React, "pintar" (*render*) significa **ejecutar la función del componente** para calcular qué debe mostrarse. Un componente se vuelve a pintar cuando:

1. **Cambia su estado** (`setAlgo`).
2. **Se vuelve a pintar su padre**, aunque sus props no hayan cambiado.
3. **Cambia un contexto** que lee.

La segunda sorprende a casi todo el mundo:

```jsx
function App() {
  const [texto, setTexto] = useState('')

  return (
    <>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <ListaEnorme /> {/* se vuelve a pintar en cada tecla, aunque no use "texto" */}
    </>
  )
}
```

Un render **no es malo** por sí mismo: React compara el resultado con el anterior y solo toca el DOM real donde algo cambió. Casi siempre es rapidísimo. Solo es un problema cuando el componente es **caro** (miles de elementos, cálculos pesados) y se pinta **muy a menudo**.

## Paso 1: medir, no adivinar

Instala la extensión **React Developer Tools** en tu navegador. Te añade dos pestañas a las DevTools:

- **Components**: en la rueda de ajustes, activa **"Highlight updates when components render"**. Cada componente que se pinta parpadea en pantalla. Verás enseguida si medio árbol parpadea con cada tecla.
- **Profiler**: pulsa grabar, usa la app y para. Te muestra **qué componentes se pintaron, cuántas veces y cuánto tardó cada uno**, y por qué.

> Mide siempre con la **build de producción** (`npm run build && npm run preview`). En desarrollo React hace comprobaciones extra y todo es más lento.

## Paso 2: la solución más barata, mover el estado

Antes de memorizar nada, mira **dónde vive el estado**. En el ejemplo de arriba, `texto` está en `App`, así que cada tecla pinta todo `App`. Si lo bajas a un componente propio:

```jsx
function Buscador() {
  const [texto, setTexto] = useState('')
  return <input value={texto} onChange={(e) => setTexto(e.target.value)} />
}

function App() {
  return (
    <>
      <Buscador />
      <ListaEnorme /> {/* ya no se pinta al escribir */}
    </>
  )
}
```

Ahora cada tecla solo pinta `Buscador`. **Mantener el estado lo más abajo posible** es la optimización más efectiva y no añade ni una línea de complejidad.

Otro truco: pasar componentes como **`children`**. Los hijos que recibes como prop ya vienen creados por el padre y no se vuelven a pintar cuando cambia tu estado.

## Paso 3: `memo`, saltarse renders si las props no cambian

`memo` envuelve un componente y le dice a React: "si sus props son las mismas que la última vez, no lo vuelvas a pintar".

```jsx
import { memo } from 'react'

const FilaProducto = memo(function FilaProducto({ producto, alAgregar }) {
  return (
    <li>
      {producto.nombre} <button onClick={() => alAgregar(producto)}>Añadir</button>
    </li>
  )
})
```

Pero hay una trampa. React compara las props con `===` (lo viste en el post de igualdad). Y en cada render del padre, **los objetos y funciones se crean de nuevo**:

```jsx
function Lista({ productos }) {
  const [carrito, setCarrito] = useState([])

  const agregar = (producto) => setCarrito((c) => [...c, producto]) // ⚠️ una función NUEVA en cada render

  return productos.map((p) => <FilaProducto key={p.id} producto={p} alAgregar={agregar} />)
}
```

`agregar` es una función distinta en cada render, así que `memo` ve props "nuevas" y **pinta igualmente**. El `memo` no sirve para nada... hasta que estabilizas la función.

## Paso 4: `useCallback` y `useMemo`, valores estables

**`useCallback`** guarda **la misma función** entre renders mientras no cambien sus dependencias:

```jsx
import { useCallback } from 'react'

const agregar = useCallback((producto) => {
  setCarrito((c) => [...c, producto])
}, []) // no depende de nada: siempre la misma función
```

Ahora sí, `FilaProducto` (con `memo`) recibe la misma función y se salta el render.

**`useMemo`** guarda **el resultado de un cálculo** y solo lo repite si cambian sus dependencias:

```jsx
import { useMemo } from 'react'

const productosFiltrados = useMemo(() => {
  return productos
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .toSorted((a, b) => a.precio - b.precio)
}, [productos, busqueda])
```

Tiene dos usos:

1. **Evitar un cálculo caro** en cada render (filtrar y ordenar 10.000 productos).
2. **Mantener la misma referencia** de un objeto o array que pasas a un componente con `memo` o a las dependencias de un `useEffect`.

| Herramienta | Qué guarda | Para |
| --- | --- | --- |
| `memo(Componente)` | El resultado del render | Saltarse renders si las props no cambian |
| `useMemo(() => valor, deps)` | Un valor calculado | Cálculos caros o referencias estables |
| `useCallback(fn, deps)` | Una función | Pasar funciones estables a componentes con `memo` |

### No los pongas en todas partes

Cada `useMemo` y `useCallback` tiene un coste: memoria, comparar dependencias y, sobre todo, **código más difícil de leer**. Para filtrar 20 elementos, `useMemo` es más lento que no usarlo. Úsalos **cuando el Profiler te diga que hace falta**.

## React Compiler: la memorización automática

Escribir `memo`, `useMemo` y `useCallback` a mano es tedioso y fácil de equivocar (olvidas una dependencia, o la pones de más). Por eso el equipo de React creó **React Compiler**: una herramienta que analiza tu código **al compilar** y añade la memorización automáticamente, donde hace falta.

Con el compilador activado, el código "ingenuo" (sin ningún `useMemo`) se comporta como si estuviera bien optimizado. Se instala como un plugin de Babel:

```bash
npm install --save-dev babel-plugin-react-compiler
```

Cómo se conecta depende de tu herramienta: Next.js tiene una opción `reactCompiler` en su configuración, y en Vite se añade el plugin a la configuración de `@vitejs/plugin-react` (la forma exacta ha cambiado entre versiones, así que sigue la [guía de instalación oficial](https://react.dev/learn/react-compiler/installation)). Las plantillas recientes de `npm create vite@latest` también ofrecen una variante de React con el compilador ya activado.

En proyectos nuevos, lo recomendable es **activar el compilador** y escribir código claro; reserva `useMemo` y compañía para casos concretos que el Profiler señale. Pero entender qué hacen (como en este post) sigue siendo imprescindible: te los encontrarás en todo el código existente y en las entrevistas.

> Para que el compilador funcione, tu código tiene que seguir las **reglas de React**: componentes puros, no mutar props ni estado y respetar las reglas de los hooks. El plugin de ESLint `eslint-plugin-react-hooks` te avisa de lo que lo impide.

## Mantener la interfaz fluida: `useDeferredValue`

A veces el problema no es renderizar de más, sino que **un render es lento de verdad** (una lista de miles de elementos) y bloquea el input mientras escribes. **`useDeferredValue`** le dice a React: "pinta primero lo urgente (el input) y la lista cuando puedas":

```jsx
import { useDeferredValue, useState } from 'react'

function Buscador({ productos }) {
  const [texto, setTexto] = useState('')
  const textoDiferido = useDeferredValue(texto)
  const desactualizado = texto !== textoDiferido

  return (
    <>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar" />
      <div style={{ opacity: desactualizado ? 0.5 : 1 }}>
        <ListaLenta productos={productos} busqueda={textoDiferido} />
      </div>
    </>
  )
}
```

El input responde **al instante** y la lista se actualiza justo después (atenuada mientras tanto). Para que funcione, `ListaLenta` debe estar envuelta en `memo`, así puede saltarse los renders con el valor antiguo. Su primo, **`useTransition`**, hace lo mismo pero con una actualización de estado concreta (`startTransition(() => setPestana('fotos'))`).

## Cargar menos JavaScript: `lazy` y `Suspense`

Otro tipo de lentitud: la app tarda en **arrancar** porque descarga todo el JavaScript de golpe, incluido el del panel de administración que el 99% de los usuarios nunca abre.

Con **`lazy`**, un componente se descarga **solo cuando se va a mostrar**:

```jsx
import { lazy, Suspense, useState } from 'react'

const EditorAvanzado = lazy(() => import('./EditorAvanzado'))

function Pagina() {
  const [editando, setEditando] = useState(false)

  return (
    <>
      <button onClick={() => setEditando(true)}>Editar</button>
      {editando && (
        <Suspense fallback={<p>Cargando editor...</p>}>
          <EditorAvanzado />
        </Suspense>
      )}
    </>
  )
}
```

- **`import('./EditorAvanzado')`** (con paréntesis) es un **import dinámico**: Vite separa ese componente en un archivo JS aparte (*code splitting*).
- **`Suspense`** muestra el `fallback` mientras se descarga.

Úsalo para rutas completas, modales pesados, gráficos o editores. Mira el resultado en la pestaña **Network**: el archivo del editor solo se descarga al pulsar el botón.

## Listas muy largas: virtualización

Si pintas 10.000 filas, el problema no es React, es que el navegador tiene **10.000 elementos** en el DOM. La solución es la **virtualización**: pintar solo las filas **visibles** en pantalla (unas 20) y cambiarlas al hacer scroll. Librerías como **TanStack Virtual** lo hacen por ti. (Y para contenido largo pero sencillo, la propiedad CSS `content-visibility: auto` ayuda mucho.)

## El orden para optimizar

1. **Mide** con el Profiler, en producción.
2. **Mueve el estado** hacia abajo o usa `children`.
3. Activa **React Compiler**.
4. Si un render concreto sigue siendo lento: **`memo`** + **`useCallback`/`useMemo`**, o **`useDeferredValue`**.
5. ¿La app tarda en arrancar? **`lazy`** + **`Suspense`**.
6. ¿Listas enormes? **Virtualización**.

Y revisa también lo que no es React: imágenes pesadas (lo viste en el post de imágenes WebP), demasiadas peticiones o librerías enormes para una sola función.

## Tu turno

1. Crea una lista de 5.000 productos generados con `Array.from({ length: 5000 }, (_, i) => ...)` y un buscador. Mide con el Profiler cuánto tarda cada tecla.
2. Optimízala **por pasos**: primero mueve el estado, luego `memo` en la fila, luego `useCallback`. Mide después de cada paso.
3. Prueba `useDeferredValue` y compara la sensación al escribir.
4. Separa una página de tu app con `lazy` y comprueba en la pestaña Network que su JS se descarga aparte.

## Errores comunes

- **Optimizar sin medir.** Pones `useMemo` en todo y no mejora nada.
- **`memo` con props que cambian siempre** (objetos o funciones creados en cada render). No sirve de nada sin `useMemo`/`useCallback`.
- **Dependencias mal puestas** en `useMemo`/`useCallback`: valores viejos o recálculos constantes.
- **Medir en modo desarrollo**, que es mucho más lento que producción.
- **Usar el índice como `key`** en listas que se reordenan o filtran: React reutiliza mal los elementos y pinta de más.
- **Pensar que un render es un problema.** Solo lo es si es caro y frecuente.

## Para profundizar

- [`memo`, `useMemo` y `useCallback` (documentación oficial, en español)](https://es.react.dev/reference/react/memo)
- [React Compiler (documentación oficial, en inglés)](https://react.dev/learn/react-compiler)

En resumen: un componente se pinta cuando cambia **su estado, su padre o un contexto**, y casi siempre es barato. **Mide con el Profiler** antes de tocar nada, **baja el estado** hacia donde se usa y activa **React Compiler**. Cuando haga falta: **`memo`** para saltarse renders, **`useMemo`/`useCallback`** para valores y funciones estables, **`useDeferredValue`** para mantener fluido el input, y **`lazy` + `Suspense`** para descargar menos JavaScript.
