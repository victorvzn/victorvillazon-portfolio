---
title: 'Accesibilidad básica: que tu web se pueda usar con el teclado'
description: 'Qué es la accesibilidad web, cómo navegar una página solo con el teclado, el orden del foco, tabindex, :focus-visible y el enlace "Saltar al contenido".'
date: 2026-11-26
series: html
tags: [HTML, CSS, Accesibilidad]
draft: true
---

Haz una prueba ahora mismo: **suelta el ratón** e intenta usar tu última web solo con el teclado. ¿Puedes llegar al menú? ¿Ves dónde estás? ¿Puedes abrir el modal y cerrarlo?

Mucha gente navega así todos los días: personas con movilidad reducida, con temblores, con lesiones en la mano, o usuarios de lectores de pantalla. Y también los usuarios "avanzados" que van más rápido con el teclado. Hoy vamos a ver cómo hacer que tu web funcione para todos.

## ¿Qué es la accesibilidad web?

La **accesibilidad** (se abrevia **a11y**: una "a", 11 letras y una "y") consiste en que **cualquier persona pueda usar tu web**, tenga o no una discapacidad. Incluye a personas ciegas que usan un **lector de pantalla** (un programa que lee la página en voz alta), personas con baja visión, daltonismo, sordera, o que no pueden usar un ratón.

No es un extra: en muchos países es **obligatoria por ley** para administraciones y empresas grandes. Y casi todo lo que la mejora también hace tu web mejor para todo el mundo.

## Cómo se navega con el teclado

| Tecla | Qué hace |
| --- | --- |
| `Tab` | Va al siguiente elemento interactivo |
| `Shift + Tab` | Vuelve al anterior |
| `Enter` | Activa un enlace o un botón |
| `Espacio` | Activa un botón, marca un checkbox |
| Flechas | Se mueven dentro de un grupo de radios, un `<select>`, un menú... |
| `Esc` | Cierra un modal o un desplegable |

Con `Tab` solo se visita lo que es **interactivo**: enlaces, botones, campos de formulario. Al elemento en el que estás se le llama el que **tiene el foco**.

## Regla 1: usa los elementos correctos

Esta es la regla más importante, y es gratis. Los elementos nativos de HTML **ya funcionan con teclado**:

```html playground=nativos
<!-- ✅ Se puede usar con Tab + Enter, sin hacer nada -->
<button type="button" onclick="alert('¡Funciona!')">Botón de verdad</button>

<!-- ❌ No se puede alcanzar con Tab ni activar con Enter -->
<div class="boton-falso" onclick="alert('¡Funciona!')">Div que parece botón</div>
```

```css playground=nativos
body {
  font-family: system-ui, sans-serif;
  display: flex;
  gap: 12px;
  padding: 24px;
}

button,
.boton-falso {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font: inherit;
  cursor: pointer;
}
```

Pulsa `Tab` en el ejemplo: el foco va al botón, pero **se salta el div**. Para un usuario de teclado, ese "botón" no existe. Y un lector de pantalla lo leería como texto normal, no como botón.

La regla práctica:

- ¿Lleva a **otra página** o a otra parte de la página? → `<a href="...">`.
- ¿**Hace algo** (abre un menú, envía, borra)? → `<button>`.

## Regla 2: que el foco siempre se vea

Cuando navegas con `Tab`, el navegador dibuja un borde alrededor del elemento con foco (el **anillo de foco**). Muchos diseñadores lo quitan porque "es feo":

```css
/* ❌ Nunca hagas esto sin poner otra cosa en su lugar */
button:focus {
  outline: none;
}
```

Sin anillo, quien usa el teclado **no sabe dónde está**. Es como mover un ratón invisible.

La solución moderna es **`:focus-visible`**: se activa cuando navegas con el teclado, pero **no** cuando haces clic con el ratón. Lo mejor de los dos mundos:

```html playground=foco
<nav>
  <a href="#">Inicio</a>
  <a href="#">Blog</a>
  <a href="#">Contacto</a>
  <button>Iniciar sesión</button>
</nav>
```

```css playground=foco
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

a {
  color: #111827;
}

button {
  padding: 8px 14px;
  font: inherit;
}

/* Un anillo de foco claro y con espacio, solo al usar el teclado */
a:focus-visible,
button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 3px;
  border-radius: 4px;
}
```

Haz clic en un enlace (no aparece el anillo) y luego navega con `Tab` (sí aparece).

## Regla 3: el orden del foco sigue el orden del HTML

El `Tab` recorre los elementos **en el orden en que aparecen en el HTML**, no en el orden en que se ven. Si con CSS (`order` en Flexbox, `grid-area`, `position: absolute`) colocas las cosas en otro orden visual, el foco "salta" de forma extraña.

**Regla:** escribe el HTML en el orden lógico de lectura y usa CSS solo para retoques.

## `tabindex`: úsalo con cuidado

El atributo `tabindex` cambia cómo se comporta un elemento con el `Tab`:

| Valor | Efecto | ¿Cuándo? |
| --- | --- | --- |
| `tabindex="0"` | El elemento entra en el orden normal del `Tab` | Componentes propios muy concretos (y casi siempre hay una etiqueta nativa mejor) |
| `tabindex="-1"` | No se alcanza con `Tab`, pero se le puede dar el foco con JavaScript (`elemento.focus()`) | Mover el foco a un título o a un mensaje de error |
| `tabindex="1"` o más | Se salta el orden natural y va **primero** | **Nunca.** Rompe el orden de toda la página |

## El enlace "Saltar al contenido"

Imagina que el menú tiene 20 enlaces. Con el teclado, tienes que pulsar `Tab` 20 veces **en cada página** antes de llegar al contenido. La solución es un enlace oculto que aparece al recibir el foco:

```html playground=saltar
<a class="saltar" href="#contenido">Saltar al contenido</a>

<header>
  <nav>
    <a href="#">Inicio</a> ·
    <a href="#">Productos</a> ·
    <a href="#">Ofertas</a> ·
    <a href="#">Blog</a> ·
    <a href="#">Contacto</a>
  </nav>
</header>

<main id="contenido" tabindex="-1">
  <h1>Bienvenido a la tienda</h1>
  <a href="#">Ver ofertas de hoy</a>
</main>
```

```css playground=saltar
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

/* Fuera de la pantalla hasta que recibe el foco */
.saltar {
  position: absolute;
  left: 8px;
  top: -100px;
  padding: 8px 12px;
  background: #111827;
  color: white;
}

.saltar:focus {
  top: 8px;
}

main:focus {
  outline: none;
}
```

Pulsa `Tab` una vez dentro del ejemplo: aparece "Saltar al contenido". Pulsa `Enter` y el siguiente `Tab` te lleva directo a "Ver ofertas de hoy". Es lo primero que se pone en las webs accesibles, incluidas las de los gobiernos.

## Cómo comprobar tu web en 5 minutos

1. **Prueba del teclado.** Recorre toda la página solo con `Tab`, `Shift + Tab`, `Enter`, `Espacio` y `Esc`. ¿Llegas a todo? ¿Ves siempre el foco? ¿El orden tiene sentido?
2. **Lighthouse.** En las DevTools de Chrome, pestaña **Lighthouse** → marca **Accessibility** → **Analyze page load**. Te da una puntuación y una lista de problemas.
3. **Zoom al 200 %.** Pulsa `Ctrl` + `+` varias veces. ¿Se sigue leyendo todo sin que se monte?

## Tu turno

Este menú tiene tres problemas de accesibilidad. Encuéntralos y arréglalos:

```html playground=ejercicio
<nav class="menu">
  <div class="item" onclick="location.href='#inicio'">Inicio</div>
  <a href="#blog" tabindex="1">Blog</a>
  <a href="#contacto">Contacto</a>
</nav>
```

```css playground=ejercicio
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.menu {
  display: flex;
  gap: 16px;
}

.item,
.menu a {
  color: #111827;
  cursor: pointer;
}

*:focus {
  outline: none;
}
```

## Errores comunes

- **`<div>` o `<span>` con `onclick`** en vez de `<button>` o `<a>`. No funcionan con teclado.
- **`outline: none` sin alternativa.** Usa `:focus-visible` con un estilo propio.
- **`tabindex` positivo.** Rompe el orden de toda la página.
- **Cambiar el orden visual con CSS** sin cambiar el HTML.
- **Modales y menús que no se cierran con `Esc`** o que dejan el foco detrás. El `<dialog>` nativo ya lo resuelve (lo vimos en el post del modal sin JavaScript).

## Para profundizar

- [Accesibilidad en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Accessibility)
- [`:focus-visible` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/:focus-visible)
- [`tabindex` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Global_attributes/tabindex)

En resumen: **usa los elementos nativos** (`<button>`, `<a>`, `<input>`), que ya funcionan con teclado; **no escondas el foco**, dale estilo con `:focus-visible`; escribe el HTML **en el orden de lectura**; evita los `tabindex` positivos y añade un enlace **"Saltar al contenido"**. Y antes de publicar, **suelta el ratón** y prueba tu web.
