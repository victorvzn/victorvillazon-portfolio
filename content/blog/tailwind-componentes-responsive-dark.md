---
title: 'Tailwind en proyectos reales: componentes, group, peer y modo oscuro con botón'
description: 'El siguiente paso tras lo básico: no repetir clases, estilos que dependen del padre (group) o de un hermano (peer), variantes con has- y data-, y un interruptor de modo oscuro.'
date: 2026-11-26
series: frameworks
tags: [Tailwind, CSS, Frameworks]
draft: true
---

En el post de Tailwind desde cero vimos las clases básicas, los prefijos `md:` y `hover:` y el modo oscuro automático. Cuando empiezas a usarlo en un proyecto de verdad, aparecen preguntas nuevas:

- "Tengo el mismo botón en 20 sitios, con 12 clases cada uno. ¿Lo copio 20 veces?"
- "¿Cómo cambio el icono cuando paso el ratón por **la tarjeta**, no por el icono?"
- "¿Cómo pongo un botón para cambiar entre modo claro y oscuro?"

Vamos con ellas.

## 1. No repitas clases: crea componentes

El HTML con Tailwind se llena de clases, y es normal. El problema no es que sean muchas, sino **repetirlas**:

```html
<!-- ❌ Las mismas 9 clases copiadas en cada botón -->
<button class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Guardar</button>
<button class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 focus-visible:outline ...">Enviar</button>
```

Si mañana cambia el radio del botón, tienes que cambiarlo en todos. Hay tres soluciones, de mejor a peor:

### a) Un componente de tu framework (la mejor)

Si usas React, Vue o cualquier framework, el botón se convierte en un componente y las clases se escriben **una sola vez**:

```jsx
function Boton({ children, ...props }) {
  return (
    <button
      className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      {...props}
    >
      {children}
    </button>
  )
}

// Y lo usas así, en todas partes:
<Boton>Guardar</Boton>
```

Esta es la forma en que Tailwind está pensado para usarse.

### b) Un bucle

Si la repetición viene de una lista, píntala con un bucle (`map` en JavaScript, `v-for` en Vue): las clases aparecen una sola vez en el código.

### c) `@apply`, con moderación

Si no usas un framework (una web con HTML puro), puedes crear una clase propia que **agrupe** clases de Tailwind:

```css
@import "tailwindcss";

@layer components {
  .boton {
    @apply rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700;
  }
}
```

```html
<button class="boton">Guardar</button>
```

Úsalo para **unas pocas piezas muy repetidas** (botones, campos de formulario). Si acabas creando una clase con `@apply` para cada elemento, estás escribiendo CSS normal con un paso extra.

## 2. `group`: estilos que dependen del padre

Quieres que, al pasar el ratón por **toda la tarjeta**, el título cambie de color y la flecha se mueva. Pero `hover:` solo mira al propio elemento.

La solución: marca el padre con **`group`** y usa **`group-hover:`** en los hijos:

```html playground=group libs=tailwind
<a href="#" class="group block max-w-sm rounded-xl border border-gray-200 p-6 transition hover:border-indigo-500 hover:shadow-lg">
  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
    Curso de CSS moderno
  </h3>
  <p class="mt-2 text-gray-600">Grid, container queries y mucho más.</p>
  <p class="mt-4 font-medium text-indigo-600">
    Ver curso
    <span class="inline-block transition group-hover:translate-x-1" aria-hidden="true">→</span>
  </p>
</a>
```

Funciona con todos los estados: `group-focus-visible:`, `group-active:`... Y si hay grupos dentro de grupos, puedes ponerles nombre: `group/tarjeta` en el padre y `group-hover/tarjeta:` en el hijo.

## 3. `peer`: estilos que dependen de un hermano

**`peer`** es lo mismo, pero para un elemento **hermano anterior**. El uso estrella: mostrar un mensaje de error cuando un campo no es válido, **sin JavaScript**:

```html playground=peer libs=tailwind
<div class="max-w-sm p-6">
  <label for="email" class="block font-medium">Email</label>
  <input
    id="email"
    type="email"
    placeholder="ana@correo.com"
    class="peer mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 user-invalid:border-red-500"
  >
  <p class="mt-1 hidden text-sm text-red-600 peer-user-invalid:block">
    Escribe un email válido, como nombre@dominio.com.
  </p>
</div>
```

Escribe algo sin `@` y sal del campo: aparece el error. `user-invalid` corresponde a la pseudoclase CSS `:user-invalid`, que solo se activa **después de que el usuario haya interactuado** con el campo (y no nada más cargar la página, como `:invalid`).

El `peer` tiene que ir **antes** en el HTML que el elemento que reacciona, porque CSS solo puede mirar a los hermanos anteriores.

## 4. `has-*`, `data-*` y `aria-*`: estilos según el estado

Tailwind tiene variantes para los selectores modernos de CSS:

```html playground=variantes libs=tailwind
<div class="grid max-w-sm gap-3 p-6">
  <!-- has-checked: el label cambia si contiene un input marcado (el selector :has de CSS) -->
  <label class="flex items-center gap-3 rounded-lg border border-gray-200 p-4 has-checked:border-indigo-500 has-checked:bg-indigo-50">
    <input type="radio" name="plan" class="accent-indigo-600" checked>
    Plan mensual
  </label>
  <label class="flex items-center gap-3 rounded-lg border border-gray-200 p-4 has-checked:border-indigo-500 has-checked:bg-indigo-50">
    <input type="radio" name="plan" class="accent-indigo-600">
    Plan anual
  </label>

  <!-- aria-*: el estilo sale del atributo de accesibilidad -->
  <button aria-pressed="true" class="rounded-lg border px-4 py-2 aria-pressed:bg-gray-900 aria-pressed:text-white">
    Favorito
  </button>

  <!-- data-*: estilos según un atributo data -->
  <span data-estado="pagado" class="rounded-full px-3 py-1 text-sm data-[estado=pagado]:bg-green-100 data-[estado=pagado]:text-green-800">
    Pagado
  </span>
</div>
```

La ventaja de `aria-pressed:` o `aria-expanded:`: el estilo **sale del mismo atributo** que anuncia el estado a los lectores de pantalla, así que nunca se desincronizan. Lo mismo hicimos en CSS puro en el post de formularios accesibles con `aria-invalid`.

## 5. Un botón para cambiar el modo oscuro

Por defecto, `dark:` sigue la preferencia del **sistema operativo**. Si quieres que el usuario lo elija con un botón, dile a Tailwind que el modo oscuro depende de una **clase** en el `<html>`. En tu CSS:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Ahora, `dark:bg-gray-900` se aplica cuando el `<html>` (o cualquier antepasado) tiene la clase `dark`. Y el botón solo tiene que ponerla o quitarla:

```html
<button id="tema" class="rounded-lg border px-3 py-2 dark:border-gray-600" aria-pressed="false">
  🌙 Modo oscuro
</button>
```

```js
const boton = document.querySelector('#tema')
const raiz = document.documentElement

// 1. Al cargar: lo que eligió antes el usuario o, si no, la preferencia del sistema
const guardado = localStorage.getItem('tema')
const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
aplicar(guardado ? guardado === 'oscuro' : prefiereOscuro)

function aplicar(oscuro) {
  raiz.classList.toggle('dark', oscuro)
  boton.setAttribute('aria-pressed', String(oscuro))
  boton.textContent = oscuro ? '☀️ Modo claro' : '🌙 Modo oscuro'
}

// 2. Al pulsar: cambiamos y lo recordamos
boton.addEventListener('click', () => {
  const oscuro = !raiz.classList.contains('dark')
  aplicar(oscuro)
  localStorage.setItem('tema', oscuro ? 'oscuro' : 'claro')
})
```

> Para que no se vea un "parpadeo" en claro antes de que cargue tu JavaScript, mueve la parte de "al cargar" a un `<script>` pequeño **dentro del `<head>`**, antes del CSS: así la clase `dark` está puesta antes de que se pinte la página.

Es el mismo patrón que vimos en CSS puro en el post de variables CSS y modo oscuro: una clase en la raíz decide el tema.

## 6. Clases condicionales sin líos

En un framework, a menudo una clase depende de un dato. Con template literals se puede:

```jsx
<span className={`rounded-full px-3 py-1 ${pagado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
```

Pero hay una regla **muy importante**: **escribe siempre las clases completas**. Tailwind encuentra las clases que usas **leyendo tu código como texto**, sin ejecutarlo:

```jsx
// ❌ Tailwind no ve "bg-green-100" ni "bg-red-100" en el código: no las genera
<span className={`bg-${color}-100`}>

// ✅ Las dos clases aparecen completas: se generan
const COLORES = { pagado: 'bg-green-100', pendiente: 'bg-red-100' }
<span className={COLORES[estado]}>
```

En proyectos de React es muy común usar una pequeña librería como **`clsx`** para combinar clases condicionales de forma legible: `clsx('px-3 py-1', pagado && 'bg-green-100')`.

## 7. Ordena las clases automáticamente

Con tantas clases, ayuda que siempre estén en el **mismo orden**. El plugin oficial **`prettier-plugin-tailwindcss`** las ordena solo al guardar (layout primero, luego espaciado, tipografía, colores...). Y la extensión **Tailwind CSS IntelliSense** para VS Code te autocompleta las clases y te muestra el CSS que genera cada una al pasar el ratón. Las dos son casi obligatorias.

## Tu turno

Con Tailwind, crea una lista de tareas en la que:

1. Cada tarea es un `<label>` con un checkbox; cuando está marcado, el texto se tacha y se pone gris (`has-checked:`).
2. Al pasar el ratón por una tarea, aparece un botón "Borrar" que normalmente está oculto (`group` y `group-hover:`), y que también aparece al navegar con el teclado (`group-focus-within:`).
3. Todo tiene versión oscura (`dark:`).

## Errores comunes

- **Copiar la misma lista de clases** en muchos sitios. Crea un componente, un bucle o, con moderación, `@apply`.
- **Construir nombres de clases por partes** (`bg-${color}-500`). Tailwind no los encuentra. Escribe las clases completas.
- **`peer` después del elemento** que debe reaccionar. Tiene que ir antes.
- **Olvidar `group` en el padre** al usar `group-hover:`.
- **Usar `:invalid` (o `invalid:`) para los errores**: aparecen nada más cargar la página, antes de que el usuario escriba. Usa `user-invalid:`.

## Para profundizar

- [Estados: hover, focus, group y peer (documentación oficial, en inglés)](https://tailwindcss.com/docs/hover-focus-and-other-states)
- [Modo oscuro (documentación oficial, en inglés)](https://tailwindcss.com/docs/dark-mode)
- [Reutilizar estilos (documentación oficial, en inglés)](https://tailwindcss.com/docs/styling-with-utility-classes#managing-duplication)

En resumen: **no repitas clases**, crea componentes (o, con moderación, `@apply`). Usa **`group`** para reaccionar al padre y **`peer`** a un hermano anterior; **`has-*`**, **`aria-*`** y **`data-*`** para estilos según el estado; y **`@custom-variant dark`** para un modo oscuro con botón. Escribe siempre **las clases completas** y deja que Prettier las ordene.
