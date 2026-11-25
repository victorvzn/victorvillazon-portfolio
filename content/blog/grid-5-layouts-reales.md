---
title: 'CSS Grid: 5 layouts reales que puedes copiar'
description: 'Una galería, una página con sidebar, un dashboard, la clásica estructura de página y un hero centrado. Todo con CSS Grid.'
date: 2026-11-25
series: css
tags: [CSS, Grid, Layout]
draft: true
order: 15
---

Si ya leíste el post de Flexbox, este es su hermano. La diferencia en una línea:

- **Flexbox** ordena cosas en **una dirección** (una fila o una columna).
- **Grid** ordena cosas en **dos direcciones a la vez** (filas y columnas).

Vamos con 5 layouts que vas a usar en proyectos reales.

## 1. Una galería que se acomoda sola

El patrón más útil de Grid. Las tarjetas se reacomodan según el ancho de la pantalla, **sin media queries**:

```html playground=galeria
<div class="galeria">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

```css playground=galeria
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.item {
  display: grid;
  place-items: center;
  height: 120px;
  border-radius: 12px;
  background: #fde68a;
  font-size: 24px;
  font-weight: bold;
}
```

Léelo así: "repite **tantas columnas como quepan**, cada una de **mínimo 160px** y como máximo **una fracción** (`1fr`) del espacio sobrante".

`fr` es la unidad estrella de Grid: una **fracción** del espacio libre.

## 2. Contenido con sidebar

```html playground=sidebar
<div class="layout">
  <aside>Sidebar</aside>
  <main>Contenido principal</main>
</div>
```

```css playground=sidebar
body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

.layout {
  display: grid;
  grid-template-columns: 240px 1fr; /* fija + el resto */
  min-height: 100vh;
}

aside {
  padding: 24px;
  background: #18181b;
  color: white;
}

main {
  padding: 24px;
}
```

`240px 1fr` significa: la primera columna mide 240px y la segunda se queda con **todo lo que sobra**.

## 3. La estructura de toda la página

Con `grid-template-areas` dibujas el layout con nombres, casi como un mapa:

```html playground=areas
<div class="pagina">
  <header>Header</header>
  <nav>Menú</nav>
  <main>Contenido</main>
  <footer>Footer</footer>
</div>
```

```css playground=areas
body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

.pagina {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  min-height: 100vh;
}

header { grid-area: header; background: #fde68a; }
nav    { grid-area: nav;    background: #e4e4e7; }
main   { grid-area: main; }
footer { grid-area: footer; background: #18181b; color: white; }

header, nav, main, footer {
  padding: 16px;
}
```

Para cambiar el orden en el celular, solo cambias el "dibujo" dentro de una media query. El HTML no se toca.

## 4. Un dashboard con tarjetas de distinto tamaño

Con `grid-column: span 2` una tarjeta ocupa **dos columnas**:

```html playground=dashboard
<div class="dashboard">
  <div class="card ancha">Ventas del mes</div>
  <div class="card">Usuarios</div>
  <div class="card">Pedidos</div>
  <div class="card alta">Actividad</div>
  <div class="card ancha">Gráfico</div>
</div>
```

```css playground=dashboard
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  background: #f4f4f5;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 100px;
  gap: 16px;
}

.card {
  padding: 16px;
  border-radius: 12px;
  background: white;
  font-weight: 600;
}

.ancha {
  grid-column: span 2;
}

.alta {
  grid-row: span 2;
}
```

## 5. Centrar algo (otra vez)

Dos líneas, el truco más corto de CSS:

```css
.contenedor {
  display: grid;
  place-items: center;
}
```

## Errores comunes

- **Usar Grid para todo.** Para una fila de botones o un menú, Flexbox es más simple.
- **Confundir `auto-fill` con `auto-fit`.** Con pocos elementos, `auto-fill` deja columnas vacías y `auto-fit` estira los que hay. Prueba los dos en el ejemplo 1.
- **Olvidar el `gap`.** Nada de `margin` entre celdas: `gap` separa sin dejar espacios raros en los bordes.

## Para profundizar

- [Grid en MDN](https://developer.mozilla.org/es/docs/Learn/CSS/CSS_layout/Grids)
- [`grid-template-areas` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/grid-template-areas)
- [Grid Garden](https://cssgridgarden.com/#es), un juego para practicar Grid regando zanahorias.

En resumen: **`display: grid`** + **`grid-template-columns`** para las columnas, **`fr`** para repartir espacio, **`repeat(auto-fill, minmax())`** para que se acomode solo y **`grid-template-areas`** para dibujar el layout.
