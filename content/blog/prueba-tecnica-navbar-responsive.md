---
title: 'Prueba técnica de maquetación: un menú de navegación responsive'
description: 'El ejercicio de maquetación más pedido: un navbar que en el móvil se convierte en un menú hamburguesa accesible. Enunciado, pistas y solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, JavaScript, Pruebas técnicas, Accesibilidad]
draft: true
---

Casi todas las webs tienen un menú de navegación que en el escritorio muestra los enlaces en línea y en el móvil los esconde detrás de un botón "hamburguesa" (☰). Es el ejercicio de maquetación más pedido en las pruebas para frontend junior, porque mezcla HTML semántico, Flexbox, media queries, un poco de JavaScript y accesibilidad.

Tiempo recomendado: **45 minutos**.

## El enunciado

> Maqueta la cabecera de una web con:
>
> 1. El **logo** (un texto) a la izquierda, que enlace a la página de inicio.
> 2. Cuatro enlaces: **Inicio, Servicios, Proyectos y Contacto**.
> 3. En **escritorio** (768px o más), los enlaces se ven en línea a la derecha.
> 4. En **móvil**, los enlaces se esconden y aparece un **botón de menú**. Al pulsarlo, el menú se despliega debajo de la cabecera; al pulsarlo otra vez, se cierra.
>
> Requisitos:
>
> - Se debe poder abrir, recorrer y cerrar **solo con el teclado**.
> - Un lector de pantalla tiene que saber si el menú está **abierto o cerrado**.
> - El enlace de la página actual debe distinguirse.

## Tu turno

```html playground=reto
<header class="cabecera">
  <!-- logo -->
  <!-- botón de menú -->
  <!-- navegación -->
</header>

<main>
  <h1>Contenido de la página</h1>
</main>
```

```css playground=reto
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

/* tu CSS aquí: empieza por el móvil */
```

```js playground=reto
// tu JavaScript aquí
```

Haz la ventana del playground estrecha y ancha para probar los dos diseños.

<!-- solucion: Ver la pista 1 (el HTML) -->

- La navegación va en un `<nav>` con un `<ul>` de enlaces: es la estructura que esperan los lectores de pantalla.
- El botón de menú tiene que ser un **`<button>`**, no un `<div>` ni un `<a>`: así funciona con `Enter` y la barra espaciadora sin hacer nada más.
- Dos atributos en el botón: **`aria-expanded="false"`** (dice si el menú está abierto) y **`aria-controls`** con el `id` del menú (dice qué controla).
- Para el enlace actual: **`aria-current="page"`**.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (CSS y JavaScript) -->

- Trabaja **mobile first**: en la base, el menú está oculto y el botón visible. Con `@media (min-width: 768px)`, al revés.
- El JavaScript solo tiene que hacer una cosa: al pulsar el botón, cambiar `aria-expanded` entre `"true"` y `"false"`.
- Y en el CSS, usa ese mismo atributo para mostrar el menú: `.boton[aria-expanded="true"] + .menu { ... }`. Así el estado visual y el accesible nunca se desincronizan.

<!-- /solucion -->

<!-- solucion: Ver la solución completa -->

```html playground=solucion
<header class="cabecera">
  <a href="#" class="logo">Estudio<span>Web</span></a>

  <button class="menu-boton" type="button" aria-expanded="false" aria-controls="menu-principal">
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
    <span class="menu-texto">Menú</span>
  </button>

  <nav id="menu-principal" class="menu" aria-label="Principal">
    <ul>
      <li><a href="#" aria-current="page">Inicio</a></li>
      <li><a href="#">Servicios</a></li>
      <li><a href="#">Proyectos</a></li>
      <li><a href="#">Contacto</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>Contenido de la página</h1>
</main>
```

```css playground=solucion
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

/* ---------- Base: móvil ---------- */
.cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #18181b;
  color: white;
}

.logo {
  color: white;
  font-size: 20px;
  font-weight: 800;
  text-decoration: none;
}

.logo span {
  color: #f59e0b;
}

.menu-boton {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid #52525b;
  border-radius: 8px;
  background: transparent;
  color: white;
  font: inherit;
  cursor: pointer;
}

/* El menú, oculto por defecto en el móvil */
.menu {
  display: none;
  flex-basis: 100%; /* ocupa toda la fila, debajo del logo */
}

/* ...y visible cuando el botón dice que está abierto */
.menu-boton[aria-expanded="true"] + .menu {
  display: block;
}

.menu ul {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.menu a {
  display: block;
  padding: 12px 4px;
  border-top: 1px solid #3f3f46;
  color: #e4e4e7;
  text-decoration: none;
}

.menu a:hover {
  color: white;
}

.menu a[aria-current="page"] {
  color: #f59e0b;
  font-weight: 700;
}

.logo:focus-visible,
.menu-boton:focus-visible,
.menu a:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 3px;
}

main {
  padding: 24px 20px;
}

/* ---------- Escritorio ---------- */
@media (min-width: 768px) {
  .menu-boton {
    display: none;
  }

  .menu {
    display: block;
    flex-basis: auto;
  }

  .menu ul {
    display: flex;
    gap: 8px;
    margin: 0;
  }

  .menu a {
    padding: 8px 12px;
    border-top: none;
    border-radius: 6px;
  }

  .menu a[aria-current="page"] {
    background: #27272a;
  }
}
```

```js playground=solucion
const boton = document.querySelector('.menu-boton')
const menu = document.querySelector('#menu-principal')

boton.addEventListener('click', () => {
  const abierto = boton.getAttribute('aria-expanded') === 'true'
  boton.setAttribute('aria-expanded', String(!abierto))
})

// Esc cierra el menú y devuelve el foco al botón
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
    boton.setAttribute('aria-expanded', 'false')
    boton.focus()
  }
})

// Al elegir un enlace en el móvil, el menú se cierra
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) boton.setAttribute('aria-expanded', 'false')
})
```

Las decisiones que más se valoran:

**HTML**

- **`<header>`, `<nav>` y `<ul>`**: estructura semántica. Con `aria-label="Principal"`, el lector de pantalla anuncia "navegación principal".
- **Un `<button>` de verdad**: funciona con teclado sin código extra.
- **El botón tiene texto ("Menú")**, no solo el icono. El SVG lleva `aria-hidden="true"` porque es decoración. Si quisieras solo el icono, el botón necesitaría un `aria-label="Menú"`.
- **`aria-expanded`** dice si está abierto; **`aria-controls`** une el botón con el menú.
- **`aria-current="page"`** marca el enlace actual, y el CSS lo usa también para el estilo.

**CSS**

- **Mobile first**: la base es el móvil y la media query solo cambia lo necesario para el escritorio.
- **`flex-wrap: wrap` + `flex-basis: 100%`**: en el móvil, el menú baja a su propia fila debajo del logo y el botón.
- **El estado visual sale de `aria-expanded`**: el selector `.menu-boton[aria-expanded="true"] + .menu` muestra el menú. No hace falta una clase `.abierto` aparte que pueda desincronizarse.
- **Enlaces con `display: block` y padding**: en el móvil, toda la fila es pulsable y mide al menos 44px.

**JavaScript**

- **Solo cambia un atributo.** Todo lo visual lo resuelve el CSS.
- **`Esc` cierra el menú** y **devuelve el foco al botón**, para que el usuario de teclado no se pierda.
- **El menú se cierra al elegir un enlace**, útil en webs de una sola página con enlaces a secciones (`#contacto`).

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **HTML semántico y un `<button>` real** para el menú.
- **Mobile first** con una sola media query bien colocada.
- **`aria-expanded`** y foco visible: es lo que separa una maqueta "bonita" de una profesional.
- **Poco JavaScript**: si escribes 50 líneas para abrir y cerrar un menú, algo sobra.

Un consejo: si te sobra tiempo, explica en un README qué decisiones de accesibilidad tomaste y por qué. Muchos candidatos no las mencionan, y suma muchísimo.
