---
title: 'Vue desde cero: componentes, reactividad y directivas'
description: 'Crea tu primer proyecto de Vue con Vite y aprende lo esencial: componentes de un solo archivo, ref y computed, v-if, v-for, v-model, eventos y props, con una lista de la compra.'
date: 2026-11-26
series: frameworks
tags: [Vue, Frameworks, JavaScript]
draft: true
---

En el post "¿Por qué un framework?" vimos el mismo carrito en React y en **Vue**. Vue tiene fama de ser el framework más **amable para empezar**: su sintaxis se parece mucho al HTML que ya conoces, y lo usan muchísimas empresas y agencias.

Hoy vas a crear tu primer proyecto y a aprender todo lo esencial con un ejemplo: una lista de la compra.

## Paso 1: crear el proyecto

Necesitas **Node.js**. En la terminal:

```bash
npm create vue@latest
```

Te hará unas preguntas. Para empezar:

- **Project name**: `mi-lista`.
- **TypeScript, JSX, Router, Pinia, tests...**: responde **No** a todo por ahora (con las flechas y la barra espaciadora, según te indique).

Después:

```bash
cd mi-lista
npm install
npm run dev
```

Abre la dirección que aparece (normalmente `http://localhost:5173`). Por debajo, el proyecto usa **Vite** (tiene su propio post).

## Paso 2: los componentes de un solo archivo

En Vue, cada componente es un archivo **`.vue`** con tres partes, como una mini página web:

```html
<script setup>
// 1. La lógica (JavaScript)
const nombre = 'Ana'
</script>

<template>
  <!-- 2. El HTML -->
  <h1>Hola, {{ nombre }}</h1>
</template>

<style scoped>
/* 3. Los estilos */
h1 {
  color: #42b883;
}
</style>
```

- **`<script setup>`**: el JavaScript del componente. Todo lo que declares aquí se puede usar en el template.
- **`<template>`**: el HTML. Las **llaves dobles `{{ }}`** muestran un valor de JavaScript, como el `${}` de los template literals.
- **`<style scoped>`**: el CSS. Con **`scoped`**, los estilos **solo afectan a este componente**: el `h1` de aquí no cambia los `h1` de otros componentes.

Abre `src/App.vue`, borra su contenido, pega el ejemplo y guarda.

## Paso 3: reactividad con `ref`

Una variable normal no actualiza la página al cambiar (igual que en React). Para que Vue "vigile" un dato, créalo con **`ref`**:

```html
<script setup>
import { ref } from 'vue'

const clics = ref(0)
</script>

<template>
  <button @click="clics++">Clics: {{ clics }}</button>
</template>
```

- **`ref(0)`** crea un dato **reactivo** con valor inicial 0. Cuando cambia, Vue actualiza **solo** las partes de la página que lo usan.
- En el **template**, lo usas directamente: `clics`.
- En el **script**, su valor está en **`.value`**: `clics.value++`. Es el detalle que más se olvida al principio.

```js
function sumar() {
  clics.value++ // en el script, con .value
}
```

Comparado con React: no hay `setClics`. **Cambias el valor y Vue se entera solo.**

## Paso 4: las directivas

Las **directivas** son atributos especiales que empiezan por `v-` y le dan superpoderes al HTML:

| Directiva | Para qué | Ejemplo |
| --- | --- | --- |
| `v-if` / `v-else` | Mostrar algo **solo si** se cumple una condición | `<p v-if="vacia">No hay nada</p>` |
| `v-for` | Repetir un elemento por cada dato de una lista | `<li v-for="item in lista" :key="item.id">` |
| `v-model` | Conectar un input con un dato, en los dos sentidos | `<input v-model="texto">` |
| `v-on` o `@` | Escuchar un evento | `<button @click="guardar">` |
| `v-bind` o `:` | Dar a un atributo el valor de un dato | `<img :src="foto" :alt="nombre">` |

Fíjate en los atajos, que son los que verás siempre: **`@click`** en vez de `v-on:click` y **`:src`** en vez de `v-bind:src`.

`v-model` es una de las joyas de Vue: con una sola palabra, el input muestra el dato **y** el dato se actualiza al escribir. En React, eso son un `value` y un `onChange`.

## Paso 5: todo junto, una lista de la compra

```html
<script setup>
import { ref, computed } from 'vue'

const productos = ref([
  { id: 1, nombre: 'Pan', comprado: false },
  { id: 2, nombre: 'Leche', comprado: true }
])
const texto = ref('')

// computed: un valor que se calcula a partir de otros y se actualiza solo
const pendientes = computed(() => productos.value.filter((p) => !p.comprado).length)

function agregar() {
  const nombre = texto.value.trim()
  if (!nombre) return

  productos.value.push({ id: Date.now(), nombre, comprado: false })
  texto.value = ''
}

function borrar(id) {
  productos.value = productos.value.filter((p) => p.id !== id)
}
</script>

<template>
  <main>
    <h1>Lista de la compra</h1>

    <form @submit.prevent="agregar">
      <input v-model="texto" placeholder="¿Qué necesitas?" aria-label="Producto">
      <button>Añadir</button>
    </form>

    <ul v-if="productos.length > 0">
      <li v-for="producto in productos" :key="producto.id" :class="{ comprado: producto.comprado }">
        <label>
          <input type="checkbox" v-model="producto.comprado">
          {{ producto.nombre }}
        </label>
        <button @click="borrar(producto.id)" :aria-label="`Borrar ${producto.nombre}`">✕</button>
      </li>
    </ul>
    <p v-else>Tu lista está vacía 🛒</p>

    <p>Te quedan {{ pendientes }} productos por comprar.</p>
  </main>
</template>

<style scoped>
main {
  max-width: 400px;
  margin: 40px auto;
  font-family: system-ui, sans-serif;
}

form {
  display: flex;
  gap: 8px;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.comprado {
  color: #a1a1aa;
  text-decoration: line-through;
}
</style>
```

Lo nuevo de este ejemplo:

- **`@submit.prevent`**: el `.prevent` es un **modificador** que hace el `event.preventDefault()` por ti. Hay otros, como `@keyup.enter` (solo al pulsar `Enter`).
- **`computed`**: un valor **calculado** a partir de otros. Vue lo recalcula solo cuando cambian los datos de los que depende. Es el equivalente a calcular `pendientes` al pintar en React.
- **`v-for` con `:key`**: igual que en React, cada elemento necesita una clave única y estable.
- **`v-model` en el checkbox**: marcarlo cambia `producto.comprado` directamente.
- **`:class="{ comprado: producto.comprado }"`**: un objeto donde cada clase se pone si su valor es `true`.
- **`productos.value.push(...)`** funciona: a diferencia de React, en Vue **sí** puedes modificar los arrays y objetos reactivos directamente, y la página se actualiza.

## Paso 6: componentes con props y eventos

Para separar cada elemento en su propio componente, crea `src/components/ItemProducto.vue`:

```html
<script setup>
// Las props: los datos que recibe del padre
const props = defineProps({
  producto: { type: Object, required: true }
})

// Los eventos que puede enviar al padre
const emit = defineEmits(['borrar'])
</script>

<template>
  <li>
    {{ props.producto.nombre }}
    <button @click="emit('borrar', props.producto.id)">✕</button>
  </li>
</template>
```

Y en `App.vue`:

```html
<script setup>
import ItemProducto from './components/ItemProducto.vue'
// ...el resto igual
</script>

<template>
  <ul>
    <ItemProducto
      v-for="producto in productos"
      :key="producto.id"
      :producto="producto"
      @borrar="borrar"
    />
  </ul>
</template>
```

La idea es la misma que en React: **los datos bajan por las props** y **los avisos suben con eventos** (`emit`). El hijo no borra nada: avisa al padre, que es el dueño de la lista.

## React vs Vue en una tabla

| | React | Vue |
| --- | --- | --- |
| Plantillas | JSX (HTML dentro de JavaScript) | `<template>` (HTML con directivas) |
| Estado | `const [x, setX] = useState(0)` | `const x = ref(0)` |
| Cambiar el estado | `setX(x + 1)` (crear copia nueva) | `x.value++` (modificar directamente) |
| Valores calculados | Calcular al pintar | `computed` |
| Listas | `{lista.map(...)}` | `v-for` |
| Condicionales | `{cond && ...}` o ternario | `v-if` / `v-else` |
| Inputs | `value` + `onChange` | `v-model` |
| Estilos del componente | Archivos CSS aparte, CSS Modules... | `<style scoped>` incluido |

Ninguno es mejor: son dos formas distintas de resolver lo mismo. Y lo que aprendes en uno te sirve muchísimo en el otro.

## Tu turno

Partiendo de la lista de la compra:

1. Añade un botón "Borrar comprados".
2. Añade tres botones de filtro: Todos, Pendientes y Comprados. Guarda el filtro en un `ref` y usa un `computed` para la lista filtrada.
3. Guarda la lista en `localStorage`. Pista: busca `watch` en la documentación de Vue, que ejecuta código cada vez que cambia un dato.

## Errores comunes

- **Olvidar `.value` en el script.** `clics++` en el script no funciona: es `clics.value++`. En el template, **sin** `.value`.
- **Usar variables normales** para datos que cambian. Usa `ref`.
- **Olvidar `:key` en `v-for`.**
- **Poner `v-if` y `v-for` en el mismo elemento.** Se lía la prioridad. Usa un `computed` con la lista filtrada, o un `<template v-if>` envolviendo.
- **Olvidar los dos puntos** al pasar datos: `producto="producto"` pasa el **texto** "producto"; `:producto="producto"` pasa **el dato**.
- **Modificar una prop en el hijo.** Las props son de solo lectura: emite un evento y que cambie el padre.

## Para profundizar

- [Guía oficial de Vue (en inglés)](https://vuejs.org/guide/introduction.html)
- [El tutorial interactivo oficial (en inglés)](https://vuejs.org/tutorial/)

En resumen: en **Vue** cada componente es un archivo **`.vue`** con `<script setup>`, `<template>` y `<style scoped>`. Los datos que cambian se crean con **`ref`** (con `.value` en el script), los calculados con **`computed`** y el HTML cobra vida con **directivas**: `v-if`, `v-for`, `v-model`, **`@`** para eventos y **`:`** para atributos. Los datos bajan por **props** y los avisos suben con **`emit`**.
