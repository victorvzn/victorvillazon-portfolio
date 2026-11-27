---
title: 'Prueba técnica de maquetación: el layout de un dashboard'
description: 'Maqueta la estructura de un panel de administración con barra lateral, cabecera fija, tarjetas de métricas y una zona de contenido con scroll propio, con grid-template-areas.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, Pruebas técnicas, Grid, Layout]
draft: true
---

Muchas empresas trabajan en **paneles de administración** (*dashboards*): la pantalla de una app de facturación, de un CRM, de una tienda online por dentro. Por eso es habitual que te pidan maquetar su **esqueleto**: no el contenido, sino la estructura. Aquí se ve si dominas **Grid** de verdad.

Tiempo recomendado: **60 minutos**.

## El enunciado

> Maqueta el layout de un dashboard con:
>
> 1. Una **barra lateral** a la izquierda (240px de ancho) con el logo y un menú de navegación.
> 2. Una **cabecera** arriba, a la derecha de la barra lateral, con un buscador y el avatar del usuario.
> 3. Una **zona principal** con:
>    - Una fila de **4 tarjetas de métricas** (ventas, pedidos, clientes, conversión).
>    - Debajo, una tarjeta grande "Ventas del mes" (que ocupa 2/3 del ancho) y otra "Últimos pedidos" (1/3).
>
> Requisitos:
>
> - La barra lateral y la cabecera **no se mueven** al hacer scroll; solo la zona principal tiene scroll.
> - En el móvil (menos de 768px), la barra lateral **desaparece** y se sustituye por un botón de menú en la cabecera. Las tarjetas se apilan.
> - Las tarjetas de métricas se adaptan: 4 por fila en grande, 2 en tablet, 1 en el móvil.

```
┌──────────┬───────────────────────────────────┐
│  Logo    │  🔍 Buscar...              (👤)  │
│          ├───────────────────────────────────┤
│  Inicio  │ [Ventas] [Pedidos] [Clientes] [%] │
│  Pedidos │                                   │
│  Clientes│ ┌──────────────────┐ ┌──────────┐ │
│  Ajustes │ │ Ventas del mes   │ │ Últimos  │ │
│          │ │                  │ │ pedidos  │ │
│          │ └──────────────────┘ └──────────┘ │
└──────────┴───────────────────────────────────┘
```

## Tu turno

```html playground=reto
<div class="app">
  <!-- barra lateral, cabecera y zona principal -->
</div>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: #f4f4f5;
}

/* tu CSS aquí */
```

<!-- solucion: Ver la pista 1 (la estructura) -->

**`grid-template-areas`** te deja "dibujar" el layout con nombres:

```css
.app {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "lateral cabecera"
    "lateral principal";
  height: 100vh;
}

.lateral { grid-area: lateral; }
.cabecera { grid-area: cabecera; }
.principal { grid-area: principal; }
```

En el móvil, basta con redibujar las áreas en una media query.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (solo un scroll) -->

Para que solo la zona principal haga scroll: la `.app` ocupa exactamente la altura de la pantalla (`height: 100vh` o mejor `100dvh`) y la zona principal tiene `overflow-y: auto`. Así lo que no cabe se desplaza **dentro** de ella, y la barra lateral y la cabecera se quedan quietas.

Hay una trampa: los elementos de un grid tienen por defecto un tamaño mínimo igual a su contenido, y no se encogen. Añade `min-height: 0` a la zona principal para que pueda ser más pequeña que su contenido y aparezca el scroll.

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<div class="app">
  <aside class="lateral" id="lateral">
    <p class="logo">Panel<span>Pro</span></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="#" aria-current="page">📊 Inicio</a></li>
        <li><a href="#">📦 Pedidos</a></li>
        <li><a href="#">👥 Clientes</a></li>
        <li><a href="#">⚙️ Ajustes</a></li>
      </ul>
    </nav>
  </aside>

  <header class="cabecera">
    <button class="cabecera__menu" aria-label="Abrir menú" aria-expanded="false" aria-controls="lateral">☰</button>
    <label class="buscador">
      <span class="sr-only">Buscar</span>
      <input type="search" placeholder="🔍 Buscar pedidos, clientes...">
    </label>
    <img class="avatar" src="https://i.pravatar.cc/80?img=32" alt="Tu perfil" width="40" height="40">
  </header>

  <main class="principal">
    <h1>Inicio</h1>

    <section class="metricas" aria-label="Resumen">
      <article class="tarjeta metrica"><h2>Ventas</h2><p>S/ 48 250</p></article>
      <article class="tarjeta metrica"><h2>Pedidos</h2><p>1 284</p></article>
      <article class="tarjeta metrica"><h2>Clientes</h2><p>932</p></article>
      <article class="tarjeta metrica"><h2>Conversión</h2><p>3,4 %</p></article>
    </section>

    <section class="paneles">
      <article class="tarjeta panel-ventas">
        <h2>Ventas del mes</h2>
        <div class="grafico" role="img" aria-label="Gráfico de ventas: crecen de forma constante durante el mes"></div>
      </article>

      <article class="tarjeta">
        <h2>Últimos pedidos</h2>
        <ul class="pedidos">
          <li>#1284 · Ana Torres <strong>S/ 120</strong></li>
          <li>#1283 · Luis Rojas <strong>S/ 89</strong></li>
          <li>#1282 · Marta Díaz <strong>S/ 340</strong></li>
          <li>#1281 · Jorge Pérez <strong>S/ 45</strong></li>
          <li>#1280 · Sara León <strong>S/ 210</strong></li>
        </ul>
      </article>
    </section>
  </main>
</div>
```

```css playground=solucion
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: #f4f4f5;
  color: #18181b;
}

/* ── La estructura ── */
.app {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "lateral cabecera"
    "lateral principal";
  height: 100vh;
  height: 100dvh; /* en el móvil, descuenta la barra del navegador */
}

.lateral {
  grid-area: lateral;
  padding: 20px 12px;
  background: #18181b;
  color: white;
  overflow-y: auto;
}

.cabecera {
  grid-area: cabecera;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid #e4e4e7;
  background: white;
}

.principal {
  grid-area: principal;
  min-height: 0;    /* deja que el área sea más pequeña que su contenido... */
  overflow-y: auto; /* ...y que lo que sobra haga scroll aquí dentro */
  padding: 24px;
}

/* ── Barra lateral ── */
.logo {
  margin: 0 12px 24px;
  font-size: 20px;
  font-weight: 800;
}

.logo span {
  color: #a5b4fc;
}

.menu {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu a {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  color: #d4d4d8;
  text-decoration: none;
}

.menu a:hover,
.menu a[aria-current="page"] {
  background: #3f3f46;
  color: white;
}

/* ── Cabecera ── */
.cabecera__menu {
  display: none; /* solo en el móvil */
  padding: 6px 10px;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  background: white;
  font-size: 20px;
  cursor: pointer;
}

.buscador {
  flex: 1;
  max-width: 420px;
}

.buscador input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e4e4e7;
  border-radius: 999px;
  font: inherit;
}

.avatar {
  margin-left: auto;
  border-radius: 50%;
}

/* ── Contenido ── */
.principal h1 {
  margin: 0 0 20px;
}

.tarjeta {
  padding: 20px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
}

.tarjeta h2 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #71717a;
}

/* 4, 2 o 1 columnas según el espacio, sin media queries */
.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.metrica p {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.paneles {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.grafico {
  height: 240px;
  border-radius: 10px;
  background: linear-gradient(to top right, #e0e7ff 0 50%, transparent 50%), #f4f4f5;
}

.pedidos {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pedidos li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

/* ── Tablet: los paneles en una columna ── */
@media (max-width: 1024px) {
  .paneles {
    grid-template-columns: 1fr;
  }
}

/* ── Móvil: sin barra lateral ── */
@media (max-width: 767px) {
  .app {
    grid-template-columns: 1fr;
    grid-template-areas:
      "cabecera"
      "principal";
  }

  .lateral {
    display: none;
  }

  .cabecera__menu {
    display: block;
  }

  .principal {
    padding: 16px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

Las decisiones que más se valoran:

- **`grid-template-areas`**: el layout se lee como un dibujo, y en el móvil se redibuja cambiando solo las áreas. El HTML no cambia.
- **Un solo scroll, el de la zona principal**: `height: 100dvh` en la `.app`, `overflow-y: auto` y **`min-height: 0`** en `.principal`. Ese `min-height: 0` es el detalle que casi todo el mundo olvida (y sin él, toda la página hace scroll).
- **`100dvh` con `100vh` de respaldo**: en el móvil, `100vh` no tiene en cuenta la barra de direcciones del navegador y la parte de abajo queda escondida. `dvh` (*dynamic viewport height*) sí. El navegador que no lo entienda se queda con la línea anterior.
- **Métricas con `auto-fit` + `minmax`**: 4, 2 o 1 columnas sin media queries.
- **Semántica**: `<aside>`, `<header>`, `<nav>` con `aria-label`, `<main>` y `aria-current="page"` en la sección activa del menú.
- **El "gráfico" tiene un texto alternativo** con `role="img"` y `aria-label`: un lector de pantalla no puede "ver" un gráfico, así que hay que contarle lo importante.

Para el menú del móvil, el botón ☰ ya tiene `aria-expanded` y `aria-controls`; mostrar la barra lateral como un panel al pulsarlo sería el siguiente paso (lo más sencillo es convertirla en un `<dialog>`, o usar el atributo `popover`, como en el post del popover sin JavaScript).

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Dominio de Grid**: áreas con nombre, `fr`, `auto-fit` y `minmax`.
- **El scroll interno** sin que se mueva toda la página.
- **Responsive real**: qué desaparece, qué se reorganiza y qué se apila en cada tamaño.
- **Semántica** de las regiones de la página: los usuarios de lector de pantalla saltan entre ellas.
- **No usar `position: fixed`** para la barra lateral y la cabecera (funciona, pero obliga a compensar márgenes a mano y es más frágil que Grid).
