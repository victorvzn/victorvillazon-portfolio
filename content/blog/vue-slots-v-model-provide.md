---
title: 'Vue: componentes flexibles con slots, defineModel y provide/inject'
description: 'Cómo crear componentes reutilizables de verdad en Vue: slots por defecto, con nombre y con datos, v-model en tus propios componentes con defineModel, props con validación y provide/inject para pasar datos a toda una rama.'
date: 2026-11-27
series: frameworks
tags: [Vue, Componentes, Intermedio]
draft: true
---

En Vue desde cero aprendiste que **los datos bajan por las props** y **los avisos suben con `emit`**. Con eso puedes crear un `ItemProducto`. Pero cuando intentas crear componentes **de verdad reutilizables** (una tarjeta, un modal, un campo de formulario, una tabla) te encuentras con preguntas como:

- ¿Cómo hago una `Tarjeta` que pueda contener **cualquier cosa** dentro?
- ¿Cómo uso `v-model` en **mi propio** componente de input?
- ¿Cómo paso un dato a un componente nieto sin pasarlo por cinco niveles?

Las respuestas son **slots**, **`defineModel`** y **`provide`/`inject`**.

## Slots: contenido que pone el padre

Un **slot** es un hueco en tu componente que **rellena quien lo usa**. Como `children` en React.

```html
<!-- components/Tarjeta.vue -->
<template>
  <article class="tarjeta">
    <slot />
  </article>
</template>

<style scoped>
.tarjeta {
  padding: 1rem;
  border: 1px solid #3f3f46;
  border-radius: 12px;
}
</style>
```

```html
<!-- Usándola -->
<Tarjeta>
  <h2>Teclado mecánico</h2>
  <p>Switches rojos, retroiluminado.</p>
  <button>Comprar</button>
</Tarjeta>
```

Todo lo que pongas entre `<Tarjeta>` y `</Tarjeta>` aparece donde está `<slot />`. La tarjeta pone el **marco** (bordes, espaciado) y el padre pone el **contenido**.

### Contenido por defecto

```html
<button class="boton">
  <slot>Aceptar</slot>
</button>
```

Si usas `<Boton />` sin contenido, muestra "Aceptar". Si usas `<Boton>Guardar</Boton>`, muestra "Guardar".

### Slots con nombre

¿Y si el componente tiene **varios** huecos? Por ejemplo, un modal con cabecera, cuerpo y pie:

```html
<!-- components/Modal.vue -->
<template>
  <div class="modal">
    <header>
      <slot name="titulo" />
    </header>

    <div class="cuerpo">
      <slot />
    </div>

    <footer v-if="$slots.acciones">
      <slot name="acciones" />
    </footer>
  </div>
</template>
```

```html
<Modal>
  <template #titulo>
    <h2>¿Borrar la tarea?</h2>
  </template>

  <p>Esta acción no se puede deshacer.</p>

  <template #acciones>
    <button @click="cancelar">Cancelar</button>
    <button @click="borrar">Borrar</button>
  </template>
</Modal>
```

- **`<slot name="titulo" />`** define un hueco con nombre.
- **`<template #titulo>`** lo rellena (`#titulo` es la forma corta de `v-slot:titulo`).
- Lo que no va en ningún `<template #...>` va al slot **por defecto**.
- **`$slots.acciones`** dice si el padre rellenó ese slot: así no pintas un `<footer>` vacío.

### Slots con datos (scoped slots)

El caso más potente: el componente **le pasa datos** al contenido del slot. Imagina una lista genérica que gestiona la carga y el "no hay datos", pero deja que el padre decida **cómo se pinta cada elemento**:

```html
<!-- components/ListaDatos.vue -->
<script setup>
defineProps({
  elementos: { type: Array, required: true },
  cargando: { type: Boolean, default: false }
})
</script>

<template>
  <p v-if="cargando">Cargando...</p>
  <p v-else-if="elementos.length === 0">
    <slot name="vacio">No hay nada que mostrar.</slot>
  </p>
  <ul v-else>
    <li v-for="(elemento, indice) in elementos" :key="elemento.id">
      <slot :elemento="elemento" :indice="indice" />
    </li>
  </ul>
</template>
```

```html
<ListaDatos :elementos="usuarios" :cargando="cargando">
  <template #default="{ elemento }">
    <strong>{{ elemento.nombre }}</strong> · {{ elemento.email }}
  </template>

  <template #vacio>Todavía no hay usuarios registrados.</template>
</ListaDatos>
```

`<slot :elemento="elemento">` envía datos al slot, y `#default="{ elemento }"` los recibe (con *destructuring*). La misma `ListaDatos` sirve para usuarios, productos o tareas: cada padre decide cómo se ve cada fila.

## Props con validación

Antes de seguir, un repaso a las props, que en componentes reutilizables conviene definir bien:

```html
<script setup>
const props = defineProps({
  texto: { type: String, required: true },
  variante: {
    type: String,
    default: 'primario',
    validator: (valor) => ['primario', 'secundario', 'peligro'].includes(valor)
  },
  desactivado: Boolean
})
</script>
```

Si alguien usa `variante="azul"`, Vue avisa en la consola durante el desarrollo. Desde Vue 3.5 también puedes desestructurar las props con valores por defecto, y siguen siendo reactivas:

```js
const { texto, variante = 'primario', desactivado = false } = defineProps(['texto', 'variante', 'desactivado'])
```

> Con TypeScript (`<script setup lang="ts">`) se escribe aún más claro: `defineProps<{ texto: string; variante?: 'primario' | 'secundario' }>()`.

## `v-model` en tus componentes: `defineModel`

Ya usas `v-model` en los inputs. ¿Y si creas un componente `CampoTexto` con su label y su mensaje de error? Quieres poder escribir:

```html
<CampoTexto v-model="email" etiqueta="Email" />
```

Desde Vue 3.4, **`defineModel`** lo hace en una línea:

```html
<!-- components/CampoTexto.vue -->
<script setup>
import { useId } from 'vue'

const modelo = defineModel({ type: String, default: '' })
defineProps({ etiqueta: String, error: String })

const id = useId()
</script>

<template>
  <div class="campo">
    <label :for="id">{{ etiqueta }}</label>
    <input
      :id="id"
      v-model="modelo"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
    >
    <p v-if="error" :id="`${id}-error`" class="error">{{ error }}</p>
  </div>
</template>
```

- **`defineModel()`** devuelve un `ref` conectado al `v-model` del padre. Si lo cambias (aquí, al escribir en el input), cambia la variable del padre.
- **`useId()`** (Vue 3.5) genera un id único para conectar el label y el mensaje de error con el input, aunque uses el componente diez veces en la misma página.

Por debajo, `v-model="email"` es una prop `modelValue` más un evento `update:modelValue`: `defineModel` te ahorra escribir los dos.

### Varios `v-model`

```html
<RangoPrecios v-model:minimo="precioMin" v-model:maximo="precioMax" />
```

```js
const minimo = defineModel('minimo', { type: Number, default: 0 })
const maximo = defineModel('maximo', { type: Number, default: 1000 })
```

## `provide` / `inject`: datos para toda una rama

El mismo problema que en React se resuelve con Context: un dato que necesitan **muchos** componentes **a mucha profundidad**. Pasarlo por props en cada nivel es *prop drilling*.

```html
<!-- App.vue -->
<script setup>
import { ref, provide, readonly } from 'vue'

const usuario = ref({ nombre: 'Ana', rol: 'admin' })

function cerrarSesion() {
  usuario.value = null
}

provide('sesion', { usuario: readonly(usuario), cerrarSesion })
</script>
```

```html
<!-- components/MenuUsuario.vue, a cualquier profundidad -->
<script setup>
import { inject } from 'vue'

const { usuario, cerrarSesion } = inject('sesion')
</script>

<template>
  <div v-if="usuario">
    Hola, {{ usuario.nombre }}
    <button @click="cerrarSesion">Salir</button>
  </div>
</template>
```

- **`provide(clave, valor)`** pone un valor a disposición de **todos los descendientes**.
- **`inject(clave)`** lo recoge, sin importar cuántos niveles haya en medio.
- Si provees un `ref`, los descendientes reciben la versión **reactiva**: cuando cambia, se actualizan.
- **`readonly(usuario)`** impide que un componente nieto lo modifique por su cuenta: los cambios pasan por funciones como `cerrarSesion`, que provee el dueño del dato. Así sabes siempre **quién** cambia el estado.

`provide`/`inject` es perfecto para componentes que trabajan juntos (unas `Pestanas` y sus `Pestana`, un `Formulario` y sus campos) o para datos como el tema. Para **estado global de toda la app**, en Vue se usa **Pinia**, que verás en el siguiente post.

## Tu turno

1. Crea un componente `Alerta` con un slot por defecto, un slot `icono` con un emoji por defecto y una prop `tipo` (`'info' | 'exito' | 'error'`) validada.
2. Crea un `CampoTexto` con `defineModel` y úsalo tres veces en un formulario de registro. Comprueba que cada label enfoca su input.
3. Crea un componente `Tabla` con un scoped slot por columna para personalizar cómo se pinta cada celda.
4. Crea un `TemaProvider` con `provide` que comparta el tema y una función `alternar`, y úsalo en un botón dentro de un componente nieto.

## Errores comunes

- **Pasar contenido HTML como prop** (`:contenido="'<b>hola</b>'"`) en vez de usar un slot.
- **Modificar una prop** dentro del hijo (`props.valor = ...`). Las props son de solo lectura; usa `defineModel` o `emit`.
- **Olvidar el `:key`** en un `v-for` con slots dentro.
- **`inject` sin `provide`** por encima: recibes `undefined`. Pasa un valor por defecto: `inject('sesion', null)`.
- **Usar `provide`/`inject` para todo el estado de la app.** Para eso está Pinia.

## Para profundizar

- [Slots (documentación oficial, en inglés)](https://vuejs.org/guide/components/slots.html)
- [v-model en componentes (documentación oficial, en inglés)](https://vuejs.org/guide/components/v-model.html)

En resumen: los **slots** dejan que el padre ponga el contenido de tu componente (por defecto, con nombre o recibiendo datos con los **scoped slots**). **`defineModel`** añade `v-model` a tus propios componentes en una línea, y **`useId`** conecta labels e inputs. **`provide`/`inject`** comparte datos con toda una rama sin prop drilling; provee los datos como **`readonly`** y las funciones para cambiarlos.
