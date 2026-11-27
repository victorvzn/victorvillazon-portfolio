---
title: 'Vue avanzado: composables y estado global con Pinia'
description: 'Cómo reutilizar lógica con composables (useFetch, useLocalStorage), cuándo necesitas estado global, crear un store de Pinia con state, getters y actions en estilo setup, storeToRefs, persistir el carrito y probar un store con Vitest.'
date: 2026-11-27
series: frameworks
tags: [Vue, Pinia, Composables, Estado, Avanzado]
draft: true
---

Tu app de Vue crece. Tres componentes piden datos a una API con el mismo patrón de carga y error. El carrito se usa en la cabecera, en cada producto y en la página de pago. Copiar la lógica en cada componente, o pasarla por props y `provide`, ya no escala.

Vue tiene dos respuestas, una para cada problema:

- **Composables** para reutilizar **lógica** (cada componente tiene su propia copia del estado).
- **Pinia** para compartir **estado** global (una sola copia para toda la app).

## Composables: lógica reutilizable

Un **composable** es una función que usa la reactividad de Vue (`ref`, `computed`, `watch`...) y devuelve lo que necesita el componente. Por convención, su nombre empieza por `use`. Es la idea de los custom hooks de React, en versión Vue.

### `useContador`, el más sencillo

```js
// src/composables/useContador.js
import { ref, computed } from 'vue'

export function useContador(inicial = 0) {
  const cuenta = ref(inicial)
  const esPar = computed(() => cuenta.value % 2 === 0)

  const sumar = () => cuenta.value++
  const reiniciar = () => (cuenta.value = inicial)

  return { cuenta, esPar, sumar, reiniciar }
}
```

```html
<script setup>
import { useContador } from '@/composables/useContador'

const { cuenta, esPar, sumar } = useContador(10)
</script>

<template>
  <button @click="sumar">{{ cuenta }} ({{ esPar ? 'par' : 'impar' }})</button>
</template>
```

Devolvemos los **`ref`** tal cual (no `cuenta.value`) para que sigan siendo reactivos al desestructurarlos. El `@/` es un alias de `src/` que viene configurado en los proyectos creados con `npm create vue@latest`.

### `useLocalStorage`

```js
// src/composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(clave, valorInicial) {
  let guardado = null
  try {
    guardado = JSON.parse(localStorage.getItem(clave))
  } catch {}

  const valor = ref(guardado ?? valorInicial)

  watch(valor, (nuevo) => {
    localStorage.setItem(clave, JSON.stringify(nuevo))
  }, { deep: true })

  return valor
}
```

```js
const tareas = useLocalStorage('tareas', [])
tareas.value.push({ id: 1, texto: 'Aprender composables' }) // se guarda solo
```

### `useFetch` con URL reactiva

Lo que hiciste en el post de `watch`, ahora reutilizable. Con **`toValue`**, el composable acepta un valor normal, un `ref` o una función, y vuelve a pedir los datos cuando cambian:

```js
// src/composables/useFetch.js
import { ref, toValue, watchEffect, onWatcherCleanup } from 'vue'

export function useFetch(url) {
  const datos = ref(null)
  const error = ref(null)
  const cargando = ref(false)

  watchEffect(async () => {
    const direccion = toValue(url) // lee el ref o la función: watchEffect la rastrea
    if (!direccion) return

    const controlador = new AbortController()
    onWatcherCleanup(() => controlador.abort())

    cargando.value = true
    error.value = null
    try {
      const respuesta = await fetch(direccion, { signal: controlador.signal })
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
      datos.value = await respuesta.json()
      cargando.value = false
    } catch (err) {
      if (err.name === 'AbortError') return
      error.value = err.message
      cargando.value = false
    }
  })

  return { datos, error, cargando }
}
```

```html
<script setup>
import { ref } from 'vue'
import { useFetch } from '@/composables/useFetch'

const id = ref(1)
const { datos: usuario, cargando, error } = useFetch(() => `https://dummyjson.com/users/${id.value}`)
</script>

<template>
  <button @click="id--" :disabled="id === 1">Anterior</button>
  <button @click="id++">Siguiente</button>

  <p v-if="cargando">Cargando...</p>
  <p v-else-if="error" role="alert">{{ error }}</p>
  <h2 v-else-if="usuario">{{ usuario.firstName }} {{ usuario.lastName }}</h2>
</template>
```

Al pulsar "Siguiente", `id` cambia, la función devuelve otra URL, `watchEffect` vuelve a ejecutarse y la petición anterior se cancela. Todo en el composable.

> Hay una librería entera de composables listos para usar: **VueUse** (`useLocalStorage`, `useFetch`, `useDebounceFn`, `useMediaQuery`, `useDark`... más de 200). Antes de escribir uno, mira si ya existe.

### Composables y estado compartido

Importante: si dos componentes llaman a `useContador()`, **cada uno tiene su propia `cuenta`**, porque el `ref` se crea **dentro** de la función.

Técnicamente, si sacas el `ref` **fuera** de la función, se comparte entre todos... pero eso trae problemas (con el renderizado en el servidor, con las DevTools, con los tests). Para compartir estado, usa **Pinia**.

## Pinia: el estado global oficial de Vue

**Pinia** es la librería oficial de Vue para estado global (sustituyó a Vuex). Un **store** es un "almacén" de estado que cualquier componente puede usar, con una sola copia para toda la app.

Si creaste el proyecto con `npm create vue@latest` y elegiste Pinia, ya está instalado. Si no:

```bash
npm install pinia
```

```js
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
```

### Tu primer store: el carrito

Pinia tiene dos estilos. El **estilo setup** se escribe exactamente como un composable, así que ya lo sabes:

```js
// src/stores/carrito.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCarritoStore = defineStore('carrito', () => {
  // state: los datos
  const lineas = ref([])

  // getters: valores calculados
  const unidades = computed(() => lineas.value.reduce((suma, l) => suma + l.cantidad, 0))
  const total = computed(() => lineas.value.reduce((suma, l) => suma + l.precio * l.cantidad, 0))

  // actions: las funciones que cambian el estado
  function agregar(producto) {
    const existente = lineas.value.find((l) => l.id === producto.id)
    if (existente) existente.cantidad++
    else lineas.value.push({ ...producto, cantidad: 1 })
  }

  function quitar(id) {
    lineas.value = lineas.value.filter((l) => l.id !== id)
  }

  function vaciar() {
    lineas.value = []
  }

  return { lineas, unidades, total, agregar, quitar, vaciar }
})
```

| Parte | En el store | Equivale a |
| --- | --- | --- |
| **state** | `ref(...)` | Los datos |
| **getters** | `computed(...)` | Valores derivados |
| **actions** | funciones | Operaciones que cambian el estado (también `async`) |

`'carrito'` es el **id** del store: único en la app, y es el nombre que verás en las Vue DevTools.

### Usarlo en cualquier componente

```html
<!-- components/IconoCarrito.vue -->
<script setup>
import { useCarritoStore } from '@/stores/carrito'

const carrito = useCarritoStore()
</script>

<template>
  <span :aria-label="`${carrito.unidades} productos en el carrito`">🛒 {{ carrito.unidades }}</span>
</template>
```

```html
<!-- components/TarjetaProducto.vue -->
<script setup>
import { useCarritoStore } from '@/stores/carrito'

defineProps({ producto: { type: Object, required: true } })
const carrito = useCarritoStore()
</script>

<template>
  <article>
    <h3>{{ producto.nombre }}</h3>
    <button @click="carrito.agregar(producto)">Añadir al carrito</button>
  </article>
</template>
```

Dos componentes en partes distintas de la app, **sin props ni `provide`**, compartiendo el mismo carrito. Al pulsar "Añadir", el icono se actualiza al instante.

### `storeToRefs`: desestructurar sin perder la reactividad

```js
const carrito = useCarritoStore()

// ❌ unidades y total pierden la reactividad: son una foto del momento
const { unidades, total } = carrito

// ✅ storeToRefs los convierte en refs reactivos
import { storeToRefs } from 'pinia'
const { unidades, total } = storeToRefs(carrito)
const { agregar, vaciar } = carrito // las acciones sí se pueden desestructurar directamente
```

### Acciones asíncronas

Las acciones pueden ser `async`, perfectas para hablar con una API:

```js
export const useProductosStore = defineStore('productos', () => {
  const lista = ref([])
  const cargando = ref(false)
  const error = ref(null)

  async function cargar() {
    if (lista.value.length > 0) return // ya los tenemos: caché sencilla
    cargando.value = true
    error.value = null
    try {
      const respuesta = await fetch('https://dummyjson.com/products?limit=12')
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
      lista.value = (await respuesta.json()).products
    } catch (err) {
      error.value = err.message
    } finally {
      cargando.value = false
    }
  }

  return { lista, cargando, error, cargar }
})
```

Como el store vive mientras vive la app, si el usuario va a otra página y vuelve, **los productos ya están cargados**.

### Persistir el carrito

Combinando con lo que ya sabes: un `watch` dentro del store.

```js
export const useCarritoStore = defineStore('carrito', () => {
  const lineas = ref(JSON.parse(localStorage.getItem('carrito') ?? '[]'))

  watch(lineas, (nuevas) => {
    localStorage.setItem('carrito', JSON.stringify(nuevas))
  }, { deep: true })

  // ...getters y actions
})
```

(Existe el plugin `pinia-plugin-persistedstate` que lo hace con una opción, si lo necesitas en muchos stores.)

## Probar un store con Vitest

Un store es lógica pura: se prueba sin montar componentes.

```js
// src/stores/carrito.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCarritoStore } from './carrito'

describe('carrito', () => {
  beforeEach(() => {
    setActivePinia(createPinia()) // una Pinia nueva y limpia para cada test
  })

  it('agregar el mismo producto suma unidades', () => {
    const carrito = useCarritoStore()
    const teclado = { id: 1, nombre: 'Teclado', precio: 120 }

    carrito.agregar(teclado)
    carrito.agregar(teclado)

    expect(carrito.unidades).toBe(2)
    expect(carrito.total).toBe(240)
  })

  it('vaciar deja el carrito sin productos', () => {
    const carrito = useCarritoStore()
    carrito.agregar({ id: 1, nombre: 'Mouse', precio: 45 })

    carrito.vaciar()

    expect(carrito.lineas).toEqual([])
  })
})
```

`setActivePinia(createPinia())` en el `beforeEach` garantiza que cada test empieza con un store vacío. (La configuración de Vitest está en la serie de Testing; para componentes de Vue se usa `@testing-library/vue` igual que la versión de React.)

## ¿Composable, `provide` o Pinia?

| Necesitas... | Usa |
| --- | --- |
| Reutilizar **lógica**, cada componente con su estado | Un **composable** |
| Compartir datos dentro de **una rama** de componentes que trabajan juntos | **`provide`/`inject`** |
| Compartir **estado global** en toda la app | **Pinia** |
| Estado de un solo componente | Un `ref` normal |

Y como en React: **no todo tiene que ser global**. El texto de un buscador o si un menú está abierto suelen ser estado local.

## Tu turno

1. Crea un composable `useEnLinea()` que devuelva un `ref` con `navigator.onLine` y lo actualice con los eventos `online` y `offline` (no olvides limpiarlos en `onUnmounted`).
2. Crea un store `useUsuarioStore` con `usuario`, un getter `estaConectado` y acciones `iniciarSesion(nombre)` y `cerrarSesion()`. Muestra el nombre en la cabecera y protege un botón para que solo se vea con sesión.
3. Añade al carrito una acción `cambiarCantidad(id, cantidad)` (con 0, se quita) y sus tests.
4. Abre las **Vue DevTools** en el navegador, ve a la pestaña de Pinia y observa cómo cambia el estado al usar la tienda.

## Errores comunes

- **Desestructurar un store** sin `storeToRefs`: los valores dejan de actualizarse.
- **Devolver `.value`** desde un composable en vez del `ref`: pierde la reactividad.
- **Usar un store fuera de un componente** antes de `app.use(createPinia())`: error `getActivePinia was called with no active Pinia`.
- **Meter todo en un store gigante.** Un store por tema: carrito, usuario, productos.
- **Modificar el estado del store desde cualquier componente** directamente. Funciona, pero centraliza los cambios en **acciones**: así sabes dónde se modifica cada cosa.

## Para profundizar

- [Composables (documentación oficial, en inglés)](https://vuejs.org/guide/reusability/composables.html)
- [Documentación de Pinia (en inglés)](https://pinia.vuejs.org/core-concepts/)

En resumen: un **composable** es una función `useAlgo()` que reutiliza **lógica** reactiva; cada componente tiene su propio estado (y **VueUse** trae cientos hechos). **Pinia** guarda el **estado global**: un store en estilo setup tiene **state** (`ref`), **getters** (`computed`) y **actions** (funciones, también `async`). Desestructúralo con **`storeToRefs`**, persiste con un `watch` y pruébalo con **`setActivePinia(createPinia())`**.
