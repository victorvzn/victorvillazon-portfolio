---
title: 'CSS nesting nativo: anida selectores sin Sass'
description: 'Escribe los estilos de un componente agrupados, con & para los estados y las media queries dentro. Cómo funciona el anidamiento nativo de CSS y qué no conviene hacer.'
date: 2026-11-26
series: css
tags: [CSS, CSS moderno]
draft: true
---

Durante años, una de las razones para usar **Sass** (un lenguaje que se convierte en CSS) era poder **anidar selectores**: escribir los estilos de un componente "unos dentro de otros". Hoy, **el CSS normal lo hace solo**, en todos los navegadores modernos.

## El problema: repetir el mismo selector

```css
.tarjeta {
  padding: 16px;
  border-radius: 12px;
}

.tarjeta h2 {
  margin: 0;
}

.tarjeta p {
  color: #52525b;
}

.tarjeta:hover {
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.1);
}
```

`.tarjeta` aparece cuatro veces. Y si mañana la clase cambia de nombre, tienes que cambiarlo en cuatro sitios.

## La solución: anidar

```html playground=basico
<article class="tarjeta">
  <h2>Curso de CSS</h2>
  <p>Aprende Flexbox, Grid y CSS moderno.</p>
  <a href="#">Ver curso</a>
</article>
```

```css playground=basico
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjeta {
  max-width: 300px;
  padding: 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.08);
  transition: box-shadow 0.2s;

  /* Equivale a ".tarjeta h2" */
  h2 {
    margin: 0 0 8px;
  }

  /* Equivale a ".tarjeta p" */
  p {
    color: #52525b;
  }

  /* & es "el selector de fuera": equivale a ".tarjeta:hover" */
  &:hover {
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  }

  a {
    color: #4f46e5;

    /* Se puede anidar dentro de lo anidado: ".tarjeta a:hover" */
    &:hover {
      text-decoration: none;
    }
  }
}
```

Todo lo de la tarjeta queda **en un solo bloque**. Se lee como un índice: "la tarjeta tiene esto, sus títulos esto, sus enlaces esto".

## El `&`: "aquí va el selector de fuera"

El símbolo **`&`** representa el selector del bloque en el que estás. Es imprescindible para los **estados** y las **variantes**:

```css
.boton {
  background: #4f46e5;

  &:hover { background: #4338ca; }          /* .boton:hover */
  &:focus-visible { outline: 3px solid; }   /* .boton:focus-visible */
  &.peligro { background: #dc2626; }        /* .boton.peligro */
  &::after { content: ' →'; }               /* .boton::after */

  .icono + & { margin-left: 8px; }          /* .icono + .boton */
}
```

**Cuidado con el espacio**: `&:hover` (sin espacio) es "el botón cuando tiene el ratón encima". `& :hover` (con espacio) sería "cualquier cosa **dentro** del botón que tenga el ratón encima". Un espacio cambia todo.

### Sin `&`, se sobreentiende un espacio

Cuando anidas una etiqueta o una clase sin `&`, CSS entiende que es un **descendiente**:

```css
.menu {
  a { ... }    /* .menu a */
  .activo { ... } /* .menu .activo (un descendiente con la clase activo) */
  &.activo { ... } /* .menu.activo (el propio menú con la clase activo) */
}
```

## Media queries dentro del componente

Esto es lo que más se nota en el día a día: las media queries pueden ir **dentro** del selector, junto a los estilos a los que afectan:

```css
.galeria {
  display: grid;
  gap: 16px;

  @media (min-width: 700px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (prefers-reduced-motion: no-preference) {
    img {
      transition: scale 0.3s;

      &:hover {
        scale: 1.03;
      }
    }
  }
}
```

Antes, la media query estaba al final del archivo, lejos de la `.galeria`, y tenías que repetir el selector. Ahora todo lo de la galería está junto.

## No anides demasiado

Anidar es tan cómodo que es fácil pasarse:

```css
/* ❌ Demasiado: el selector resultante es ".pagina .contenido .lista .item .titulo a" */
.pagina {
  .contenido {
    .lista {
      .item {
        .titulo {
          a { color: red; }
        }
      }
    }
  }
}
```

Problemas:

1. **Especificidad altísima.** Ese selector tiene 5 clases. Para sobrescribirlo después necesitarás otro igual de largo o un `!important` (lo vimos en el post de especificidad).
2. **Acoplado al HTML.** Si mueves el título fuera de la lista, el estilo deja de funcionar.
3. **Difícil de leer.**

**Regla práctica:** no pases de **2 o 3 niveles**. Anida para **estados** (`&:hover`), **variantes** (`&.grande`), **media queries** y los **hijos directos** de un componente. Si necesitas más, probablemente sea otro componente con su propia clase.

## ¿Y Sass?

Sass sigue teniendo cosas que el CSS no tiene (como *mixins* o bucles), pero para la mayoría de los proyectos, entre el **anidamiento nativo** y las **variables CSS**, ya no lo necesitas. Un paso menos en tu proyecto.

## Tu turno

Reescribe este CSS usando anidamiento:

```html playground=ejercicio
<nav class="menu">
  <a href="#" class="activo">Inicio</a>
  <a href="#">Blog</a>
  <a href="#">Contacto</a>
</nav>
```

```css playground=ejercicio
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu a {
  padding: 8px 12px;
  border-radius: 8px;
  color: #3f3f46;
  text-decoration: none;
}

.menu a:hover {
  background: #f4f4f5;
}

.menu a.activo {
  background: #18181b;
  color: white;
}

@media (min-width: 600px) {
  .menu {
    flex-direction: row;
  }
}
```

## Errores comunes

- **Anidar demasiados niveles.** Especificidad alta y CSS frágil. Máximo 2 o 3.
- **Olvidar el `&` en los estados.** `:hover` anidado sin `&` funciona (CSS añade el espacio implícito... y lo aplica a los descendientes). Escribe siempre `&:hover`.
- **Confundir `&.clase` con `.clase`** anidada: el primero es el mismo elemento; el segundo, un descendiente.
- **Copiar código de Sass tal cual.** Casi todo funciona igual, pero cosas como `&-titulo` (para construir `.tarjeta-titulo`) **no** funcionan en CSS nativo.

## Para profundizar

- [Anidamiento en CSS en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_nesting/Using_CSS_nesting)
- [El selector de anidamiento `&` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Nesting_selector)

En resumen: el **CSS nativo ya permite anidar** selectores. Usa **`&`** para referirte al selector de fuera (`&:hover`, `&.activa`), mete las **media queries dentro** del componente y **no pases de 2 o 3 niveles** para no disparar la especificidad. Para muchos proyectos, ya no necesitas Sass.
