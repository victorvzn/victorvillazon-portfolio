---
title: 'Vue: computed, watch, ciclo de vida y pedir datos a una API'
description: 'Cuándo usar computed y cuándo watch, watchEffect, las opciones immediate y deep, limpiar peticiones con onWatcherCleanup, los hooks de ciclo de vida como onMounted, referencias al DOM con useTemplateRef y cargar datos con estados de carga y error.'
date: 2026-11-27
series: frameworks
tags: [Vue, Reactividad, Fetch, Intermedio]
draft: true
---

En Vue desde cero viste que con `ref` la página se actualiza sola, y que **`computed`** calcula valores a partir de otros. Pero ¿qué pasa cuando, al cambiar un dato, no quieres *calcular* algo sino *hacer* algo: pedir datos a una API, guardar en `localStorage`, enfocar un input? Para eso está **`watch`**. Y para lo que pasa al **aparecer** un componente, los hooks del **ciclo de vida**.

## `computed` a fondo

Un `computed` es un valor **derivado**: se calcula a partir de otros datos reactivos y Vue lo **guarda en caché**. Solo se recalcula cuando cambia algo de lo que depende.

```html
<script setup>
import { ref, computed } from 'vue'

const productos = ref([
  { id: 1, nombre: 'Teclado', precio: 120, categoria: 'perifericos' },
  { id: 2, nombre: 'Mouse', precio: 45, categoria: 'perifericos' },
  { id: 3, nombre: 'Monitor', precio: 800, categoria: 'pantallas' }
])
const busqueda = ref('')
const orden = ref('precio')

const filtrados = computed(() => {
  const texto = busqueda.value.toLowerCase()
  return productos.value
    .filter((p) => p.nombre.toLowerCase().includes(texto))
    .toSorted((a, b) => (orden.value === 'precio' ? a.precio - b.precio : a.nombre.localeCompare(b.nombre)))
})

const total = computed(() => filtrados.value.reduce((suma, p) => suma + p.precio, 0))
</script>

<template>
  <input v-model="busqueda" aria-label="Buscar">
  <select v-model="orden" aria-label="Ordenar por">
    <option value="precio">Precio</option>
    <option value="nombre">Nombre</option>
  </select>

  <ul>
    <li v-for="p in filtrados" :key="p.id">{{ p.nombre }}: S/ {{ p.precio }}</li>
  </ul>
  <p>Total: S/ {{ total }}</p>
</template>
```

- `total` depende de `filtrados`, que depende de `productos`, `busqueda` y `orden`. Vue sigue esa cadena solo.
- En el `<script>`, un `computed` se lee con **`.value`**; en el `<template>`, sin él.

### Las reglas de un `computed`

- **Sin efectos secundarios.** Un `computed` solo **calcula y devuelve**. Nada de `fetch`, ni modificar otros `ref`, ni tocar el DOM.
- **No modifiques lo que devuelve.** Usa `toSorted` y no `sort`, que cambiaría el array original (lo viste en el post de arrays sin mutar).

### `computed` contra una función

Esto también funciona en el template:

```html
<p>Total: {{ calcularTotal() }}</p>
```

Pero una función se ejecuta **en cada render**; un `computed` solo cuando cambian sus dependencias. Para valores derivados, usa siempre `computed`.

## `watch`: reaccionar a un cambio con un efecto

`watch` **observa** un dato y ejecuta una función cuando cambia. Es para **efectos secundarios**, justo lo que `computed` no debe hacer.

```html
<script setup>
import { ref, watch } from 'vue'

const tema = ref(localStorage.getItem('tema') ?? 'claro')

watch(tema, (nuevo, anterior) => {
  console.log(`Tema: ${anterior} → ${nuevo}`)
  localStorage.setItem('tema', nuevo)
  document.documentElement.dataset.tema = nuevo
})
</script>
```

La función recibe el **valor nuevo** y el **anterior**. Lo que puedes observar:

```js
watch(tema, ...)                          // un ref
watch(() => usuario.value.id, ...)        // una propiedad concreta: con una función
watch([busqueda, orden], ([b, o]) => ...) // varios a la vez
```

> ⚠️ Para observar **una propiedad** de un objeto, pasa una función (`() => usuario.value.id`). Si pasas `usuario.value.id` directamente, le estás pasando un número, y un número no puede "cambiar".

### `immediate` y `deep`

Por defecto, `watch` **no** se ejecuta al principio, solo cuando hay un cambio. Y si observas un objeto, solo reacciona si lo **reemplazas**, no si cambia una propiedad de dentro.

```js
// Ejecutar también al crear el componente
watch(idUsuario, cargarUsuario, { immediate: true })

// Reaccionar a cambios dentro del objeto (o array)
watch(carrito, (nuevo) => {
  localStorage.setItem('carrito', JSON.stringify(nuevo))
}, { deep: true })
```

`deep` recorre todo el objeto en cada cambio: con datos muy grandes, puede ser costoso.

## `watchEffect`: dependencias automáticas

`watchEffect` ejecuta la función **inmediatamente** y vuelve a ejecutarla cuando cambia **cualquier** dato reactivo que lea dentro. No hace falta decirle qué observar:

```js
import { watchEffect } from 'vue'

watchEffect(() => {
  document.title = `(${pendientes.value}) Mis tareas`
})
```

| | `watch` | `watchEffect` |
| --- | --- | --- |
| Qué observa | Lo que le indicas | Todo lo que lee dentro |
| ¿Se ejecuta al empezar? | No (salvo `immediate: true`) | Sí, siempre |
| Valor anterior | Sí | No |
| Ideal para | Reaccionar a un dato concreto | Sincronizar algo con varios datos |

## Pedir datos a una API

Ahora el caso más habitual: cargar datos y volver a cargarlos cuando cambia algo (el equivalente al `useEffect` con dependencias de React).

```html
<script setup>
import { ref, watch, onWatcherCleanup } from 'vue'

const busqueda = ref('phone')
const productos = ref([])
const cargando = ref(false)
const error = ref(null)

watch(busqueda, async (texto) => {
  const controlador = new AbortController()
  onWatcherCleanup(() => controlador.abort())

  cargando.value = true
  error.value = null
  try {
    const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(texto)}`
    const respuesta = await fetch(url, { signal: controlador.signal })
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
    productos.value = (await respuesta.json()).products
    cargando.value = false
  } catch (err) {
    if (err.name === 'AbortError') return
    error.value = err.message
    cargando.value = false
  }
}, { immediate: true })
</script>

<template>
  <input v-model="busqueda" aria-label="Buscar productos">

  <p v-if="cargando">Cargando...</p>
  <p v-else-if="error" role="alert">No se pudieron cargar: {{ error }}</p>
  <p v-else-if="productos.length === 0">Sin resultados.</p>
  <ul v-else>
    <li v-for="p in productos" :key="p.id">{{ p.title }}</li>
  </ul>
</template>
```

- **`immediate: true`** hace la primera carga al crear el componente.
- **`onWatcherCleanup`** (desde Vue 3.5) registra una limpieza que Vue ejecuta **antes de la siguiente ejecución** del watcher o cuando el componente desaparece. Aquí cancela la petición anterior para que una respuesta lenta y vieja no pise a la nueva. Es la misma idea que la función de limpieza de `useEffect`.
- `v-if` / `v-else-if` / `v-else` muestran un solo estado cada vez.

## El ciclo de vida

Un componente **se crea**, **se monta** (aparece en el DOM), **se actualiza** y **se desmonta** (desaparece). Vue te deja ejecutar código en cada momento:

```js
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // el componente ya está en el DOM
  window.addEventListener('resize', alCambiarTamano)
})

onUnmounted(() => {
  // limpieza: imprescindible para no acumular listeners
  window.removeEventListener('resize', alCambiarTamano)
})
```

| Hook | Cuándo | Para |
| --- | --- | --- |
| `onMounted` | Tras aparecer en el DOM | Acceder al DOM, listeners, librerías externas |
| `onUpdated` | Tras actualizar el DOM | Casos raros; casi siempre hay una opción mejor |
| `onUnmounted` | Al desaparecer | Limpiar temporizadores, listeners, conexiones |

> El código que escribes directamente en `<script setup>` ya se ejecuta al **crear** el componente. Puedes hacer `fetch` ahí mismo, sin `onMounted`. Usa `onMounted` cuando necesites que el **DOM** ya exista.

## Referencias al DOM: `useTemplateRef`

A veces necesitas el elemento real del DOM: enfocar un input, medir un tamaño, usar una librería de gráficos.

```html
<script setup>
import { onMounted, useTemplateRef } from 'vue'

const campo = useTemplateRef('campo-busqueda')

onMounted(() => {
  campo.value.focus()
})
</script>

<template>
  <input ref="campo-busqueda" aria-label="Buscar">
</template>
```

El atributo `ref="campo-busqueda"` conecta el elemento con `useTemplateRef('campo-busqueda')` (desde Vue 3.5; en versiones anteriores se usaba un `ref(null)` con el mismo nombre que la variable). El valor solo existe **después** de montar, por eso se usa en `onMounted`.

## ¿`computed` o `watch`?

La duda más común en Vue, resuelta en una frase:

- **¿Quieres un valor nuevo a partir de otros?** → `computed`.
- **¿Quieres *hacer* algo cuando cambia un valor?** (pedir datos, guardar, tocar el DOM) → `watch`.

```js
// ❌ watch para calcular: estado duplicado y más código
const total = ref(0)
watch(carrito, (c) => { total.value = c.reduce((s, p) => s + p.precio, 0) }, { deep: true })

// ✅ computed
const total = computed(() => carrito.value.reduce((s, p) => s + p.precio, 0))
```

## Tu turno

1. Crea un conversor de soles a dólares con un `computed` escribible: busca en la documentación cómo hacer un `computed` con `get` y `set` para que puedas escribir en cualquiera de los dos campos.
2. Guarda una lista de tareas en `localStorage` con un `watch` `deep`, y cárgala al crear el componente.
3. Carga `https://dummyjson.com/users/${id}` con un `watch` sobre `id` e `immediate`, y añade botones "Anterior" y "Siguiente".
4. Enfoca automáticamente el input de un formulario al abrirlo con `useTemplateRef`.

## Errores comunes

- **Efectos dentro de un `computed`** (`fetch`, modificar otros `ref`). Van en un `watch`.
- **Usar `watch` para calcular** un valor que podría ser un `computed`.
- **`watch(objeto.propiedad, ...)`** en lugar de `watch(() => objeto.propiedad, ...)`.
- **Esperar que `watch` se ejecute al principio** sin `immediate: true`.
- **No limpiar** listeners y temporizadores en `onUnmounted`, ni cancelar peticiones viejas.
- **Leer un template ref antes de `onMounted`**: todavía es `null`.

## Para profundizar

- [Propiedades computadas (documentación oficial, en inglés)](https://vuejs.org/guide/essentials/computed.html)
- [Watchers (documentación oficial, en inglés)](https://vuejs.org/guide/essentials/watchers.html)

En resumen: **`computed`** crea valores **derivados** y cacheados, sin efectos secundarios. **`watch`** ejecuta **efectos** cuando cambia un dato concreto (con `immediate` y `deep` si hace falta), y **`watchEffect`** reacciona a todo lo que lee. Cancela las peticiones viejas con **`onWatcherCleanup`**, usa **`onMounted`** y **`onUnmounted`** para el DOM y su limpieza, y **`useTemplateRef`** para acceder a un elemento.
