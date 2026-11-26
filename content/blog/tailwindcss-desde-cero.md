---
title: 'Tailwind CSS desde cero: estilos sin salir del HTML'
description: 'Qué es Tailwind, cómo se lee una clase como px-4 o md:flex, cómo hacer diseños responsive, estados hover y modo oscuro, y cómo instalarlo en un proyecto con Vite.'
date: 2026-11-26
series: frameworks
tags: [CSS, Tailwind, Frameworks]
draft: true
---

**Tailwind CSS** es una de las herramientas más usadas hoy para dar estilo a webs y aplicaciones. Si buscas trabajo como frontend, la vas a ver en muchísimas ofertas, sobre todo junto a React.

Pero un aviso antes de empezar: **Tailwind no sustituye a saber CSS**. Cada clase de Tailwind es una propiedad de CSS con otro nombre. Si sabes qué hacen `padding`, `display: flex` o una media query, aprenderás Tailwind en una tarde. Si no, primero repasa la serie de CSS.

## Qué es Tailwind

Tailwind es un framework de CSS **utility-first** (primero las utilidades). En vez de escribir tus propias clases en un archivo CSS, usas **clases pequeñas que hacen una sola cosa**, directamente en el HTML:

| Clase de Tailwind | CSS que aplica |
| --- | --- |
| `p-4` | `padding: 1rem` |
| `text-center` | `text-align: center` |
| `bg-white` | `background-color: white` |
| `rounded-lg` | `border-radius: 0.5rem` |
| `flex` | `display: flex` |

Míralo con un mismo botón hecho de las dos formas.

**Con CSS normal:**

```html
<button class="boton">Comprar</button>
```

```css
.boton {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
}

.boton:hover {
  background-color: #1d4ed8;
}
```

**Con Tailwind:**

```html
<button class="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
  Comprar
</button>
```

Mismo resultado, sin escribir ni una línea en un archivo CSS y sin inventar el nombre `.boton`.

## Pruébalo sin instalar nada

Todos los ejemplos de este post abren el playground con Tailwind ya cargado, así que solo tienes que escribir las clases:

```html playground=primero libs=tailwind
<div class="p-8">
  <h1 class="text-3xl font-bold text-blue-600">¡Hola, Tailwind!</h1>
  <p class="mt-2 text-gray-600">Si este texto es gris y el título azul, todo funciona.</p>
</div>
```

Para practicar en un archivo HTML propio, Tailwind tiene un **script para el navegador**. Pégalo en el `<head>` y ya puedes usar las clases:

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

Este script es solo para **aprender y hacer pruebas**: genera el CSS en el navegador cada vez que carga la página. En un proyecto real se instala (te lo explico al final).

## Cómo se lee una clase

Casi todas las clases siguen el patrón **`propiedad-valor`**. Aprendiendo unos pocos prefijos, puedes adivinar el resto.

### Espaciado: p y m

- **`p`** es *padding* y **`m`** es *margin*.
- Después puede ir un lado: **`t`** (top, arriba), **`b`** (bottom, abajo), **`l`** (left), **`r`** (right), **`x`** (izquierda y derecha) o **`y`** (arriba y abajo).
- Y luego el tamaño: cada número equivale a **0.25rem** (4px). Así, `4` son 16px, `8` son 32px.

| Clase | Significa |
| --- | --- |
| `p-4` | padding de 16px en los cuatro lados |
| `px-6` | padding de 24px a izquierda y derecha |
| `mt-2` | margin-top de 8px |
| `mb-8` | margin-bottom de 32px |
| `mx-auto` | margin izquierdo y derecho automáticos (para centrar) |
| `gap-4` | separación de 16px entre hijos de un flex o grid |

### Colores

El patrón es **`propiedad-color-intensidad`**. La intensidad va de **50** (casi blanco) a **950** (casi negro):

```html playground=colores libs=tailwind
<div class="flex gap-2 p-6">
  <div class="h-16 flex-1 rounded bg-amber-100"></div>
  <div class="h-16 flex-1 rounded bg-amber-300"></div>
  <div class="h-16 flex-1 rounded bg-amber-500"></div>
  <div class="h-16 flex-1 rounded bg-amber-700"></div>
  <div class="h-16 flex-1 rounded bg-amber-900"></div>
</div>

<p class="px-6 text-red-600">Texto rojo</p>
<p class="mx-6 mt-2 border-2 border-green-500 p-2">Borde verde</p>
```

- **`bg-`** es el fondo, **`text-`** el color del texto y **`border-`** el del borde.
- Colores disponibles: `slate`, `gray`, `zinc`, `red`, `orange`, `amber`, `yellow`, `green`, `emerald`, `blue`, `indigo`, `purple`, `pink` y más.
- Transparencia con una barra: `bg-black/50` es negro al 50 %.

### Texto

| Clase | CSS |
| --- | --- |
| `text-sm`, `text-base`, `text-lg`, `text-2xl`… | tamaño de letra |
| `font-normal`, `font-semibold`, `font-bold` | grosor |
| `text-center`, `text-left` | alineación |
| `leading-relaxed` | `line-height` amplio |
| `uppercase`, `tracking-wide` | mayúsculas y espacio entre letras |

### Tamaños, bordes y sombras

| Clase | CSS |
| --- | --- |
| `w-full`, `w-64`, `w-1/2` | ancho: 100 %, 16rem, la mitad |
| `h-12`, `min-h-screen` | alto |
| `max-w-md`, `max-w-3xl` | ancho máximo |
| `border`, `border-2` | borde de 1px o 2px |
| `rounded`, `rounded-lg`, `rounded-full` | esquinas redondeadas |
| `shadow`, `shadow-lg` | sombra |

## Flexbox y Grid

Las clases de layout son casi idénticas a las propiedades de CSS:

```html playground=layout libs=tailwind
<!-- Flexbox: una barra con logo a la izquierda y botones a la derecha -->
<header class="flex items-center justify-between bg-gray-900 p-4 text-white">
  <strong class="text-xl">MiTienda</strong>
  <nav class="flex gap-4">
    <a href="#" class="hover:text-amber-400">Inicio</a>
    <a href="#" class="hover:text-amber-400">Productos</a>
  </nav>
</header>

<!-- Grid: tres columnas con separación -->
<main class="grid grid-cols-3 gap-4 p-4">
  <div class="rounded-lg bg-amber-100 p-6 text-center">1</div>
  <div class="rounded-lg bg-amber-100 p-6 text-center">2</div>
  <div class="rounded-lg bg-amber-100 p-6 text-center">3</div>
</main>
```

| Tailwind | CSS |
| --- | --- |
| `flex` | `display: flex` |
| `flex-col` | `flex-direction: column` |
| `items-center` | `align-items: center` |
| `justify-between` | `justify-content: space-between` |
| `grid` + `grid-cols-3` | `display: grid; grid-template-columns: repeat(3, minmax(0, 1fr))` |

Si ya leíste los posts de Flexbox y Grid, aquí no hay nada nuevo: solo nombres más cortos.

## Responsive: los prefijos sm, md y lg

Aquí es donde Tailwind brilla. En vez de escribir media queries, pones un **prefijo** delante de la clase:

| Prefijo | Se aplica desde |
| --- | --- |
| *(sin prefijo)* | siempre (móvil) |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |

Funciona **mobile first**, igual que en el post de media queries: la clase sin prefijo es para el móvil, y los prefijos **añaden** cambios en pantallas más grandes.

```html playground=responsive libs=tailwind
<div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
  <div class="rounded-lg bg-blue-100 p-6">A</div>
  <div class="rounded-lg bg-blue-100 p-6">B</div>
  <div class="rounded-lg bg-blue-100 p-6">C</div>
  <div class="rounded-lg bg-blue-100 p-6">D</div>
</div>

<p class="px-4 text-sm md:text-lg">Este texto es pequeño en el móvil y grande desde 768px.</p>
```

Se lee así: "una columna; desde `sm`, dos; desde `lg`, cuatro". Haz la ventana del playground más ancha y más estrecha para verlo.

## Estados: hover, focus y más

Igual que los tamaños de pantalla, los **estados** también son prefijos:

```html playground=estados libs=tailwind
<div class="flex flex-col gap-4 p-6 max-w-xs">
  <button class="rounded-lg bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95">
    Pasa el ratón y pulsa
  </button>

  <input
    type="email"
    placeholder="tu@email.com"
    class="rounded-lg border-2 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">

  <button disabled class="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed">
    Desactivado
  </button>
</div>
```

`hover:`, `focus:`, `focus-visible:`, `active:` y `disabled:` corresponden a las pseudo-clases de CSS con el mismo nombre. Y se pueden **combinar** con los de pantalla: `md:hover:bg-blue-700`.

## Modo oscuro con dark:

El prefijo **`dark:`** aplica la clase cuando el usuario tiene el **modo oscuro** activado en su sistema:

```html playground=oscuro libs=tailwind
<div class="min-h-screen bg-white p-8 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  <div class="rounded-xl border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
    <h2 class="text-xl font-bold">Mi tarjeta</h2>
    <p class="mt-2 text-gray-600 dark:text-gray-400">Cambia tu sistema a modo oscuro y mira qué pasa.</p>
  </div>
</div>
```

## Todo junto: una tarjeta de perfil

```html playground=tarjeta libs=tailwind
<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
  <article class="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
    <img
      src="https://i.pravatar.cc/150?img=47"
      alt="Foto de perfil de Ana Torres"
      class="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-amber-400">

    <h2 class="mt-4 text-xl font-bold text-gray-900">Ana Torres</h2>
    <p class="text-sm text-gray-500">Desarrolladora frontend · Lima</p>

    <p class="mt-4 leading-relaxed text-gray-600">
      Me encanta crear interfaces accesibles y enseñar a quienes empiezan a programar.
    </p>

    <div class="mt-6 flex flex-col gap-2 sm:flex-row">
      <a href="#" class="flex-1 rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white hover:bg-gray-700">Seguir</a>
      <a href="#" class="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Mensaje</a>
    </div>
  </article>
</div>
```

Lee las clases de una en una y verás que cada una es algo que ya sabías hacer con CSS.

## Valores a medida

Si necesitas un valor que no está en la escala, ponlo **entre corchetes**:

```html
<div class="w-[350px] bg-[#1da1f2] mt-[13px] grid-cols-[200px_1fr]">
```

Úsalo con moderación: si escribes el mismo valor a medida muchas veces, es mejor añadirlo a tu tema.

## Personalizar los colores de tu marca

Desde la versión 4, Tailwind se configura **en el propio CSS**, con variables dentro de `@theme`. Cada variable `--color-algo` crea las clases `bg-algo`, `text-algo`, `border-algo`...:

```css
@import "tailwindcss";

@theme {
  --color-marca: #f59e0b;
  --color-marca-oscuro: #b45309;
  --font-titulos: "Space Grotesk", sans-serif;
}
```

```html
<h1 class="font-titulos text-marca-oscuro">Mi marca</h1>
<button class="bg-marca text-white">Comprar</button>
```

Si has leído el post de `:root` y custom properties, esto te sonará: son variables CSS de toda la vida.

## Instalarlo en un proyecto con Vite

Para un proyecto real (por ejemplo, con React) se instala con npm. Con **Vite**:

1. Instala Tailwind y su plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

2. Añade el plugin en `vite.config.js`:

```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()]
})
```

3. Importa Tailwind al principio de tu CSS principal:

```css
@import "tailwindcss";
```

4. Arranca el proyecto con `npm run dev` y ya puedes usar las clases.

Al hacer el *build*, Tailwind revisa tus archivos y **solo incluye las clases que usas**, así que el CSS final pesa muy poco.

Dos extensiones de VS Code que te ahorrarán mucho tiempo:

- **Tailwind CSS IntelliSense**: autocompleta las clases y, al pasar el ratón, te enseña el CSS que generan.
- El plugin de **Prettier para Tailwind** (`prettier-plugin-tailwindcss`) ordena las clases automáticamente.

## ¿Tailwind o CSS normal?

**A favor de Tailwind:**

- **No tienes que inventar nombres** de clases.
- **Ves el estilo en el mismo sitio** que el HTML: no saltas entre archivos.
- **Un sistema consistente**: espacios, colores y tamaños salen de una escala, así no acabas con `padding: 13px` en un sitio y `14px` en otro.
- **Se combina genial con componentes** de React o Vue: el componente se escribe una vez y las clases van con él.

**En contra:**

- **El HTML se llena de clases** y cuesta leerlo al principio.
- **Necesitas saber CSS** de todas formas para entender qué hace cada clase.
- En una página HTML sin componentes, repetirás las mismas clases en muchos elementos.

Lo que no deberías hacer es aprender Tailwind **en lugar de** CSS. Aprende CSS primero, y luego Tailwind te parecerá un atajo, no magia.

## Errores comunes

- **Construir clases con variables.** `` `bg-${color}-500` `` no funciona: Tailwind busca las clases **completas** en tu código para generarlas, y ese texto no aparece entero. Escribe las clases completas, por ejemplo con un objeto: `{ rojo: 'bg-red-500', verde: 'bg-green-500' }`.
- **Pensar en escritorio primero.** `md:` significa "desde 768px", no "solo en tablet". La clase sin prefijo es la del móvil.
- **Abusar de `@apply`.** Tailwind permite agrupar clases en una clase propia con `@apply`, pero si lo haces con todo, vuelves al CSS normal con un paso extra. Mejor crea componentes.
- **Usar el script del navegador en producción.** Es solo para practicar: en un proyecto real, instálalo.
- **Olvidar la accesibilidad.** Tailwind no la añade por ti: sigue haciendo falta un `alt`, `focus-visible:` y buen contraste.

## Para profundizar

- [Documentación oficial de Tailwind CSS (en inglés)](https://tailwindcss.com/docs)
- [Tailwind Play: un playground oficial en el navegador](https://play.tailwindcss.com)

En resumen: Tailwind son **clases pequeñas que hacen una sola cosa** (`p-4`, `flex`, `bg-blue-600`), con **prefijos** para pantallas (`md:`), estados (`hover:`) y modo oscuro (`dark:`). Se personaliza con **`@theme`** y se instala con npm. Y funciona mejor cuanto más CSS sabes.
