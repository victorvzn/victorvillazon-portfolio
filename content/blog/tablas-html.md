---
title: 'Tablas en HTML bien hechas: una tabla de precios'
description: 'thead, tbody, th, scope y caption: cómo armar una tabla accesible y con buen estilo, y cuándo no usar una tabla.'
date: 2026-11-25
series: html
tags: [HTML, CSS, Accesibilidad]
draft: true
order: 10
---

Hace años, las páginas web enteras se maquetaban con tablas. Hoy eso es un error: las tablas son **solo para datos en filas y columnas**. Un horario, una comparación de planes, una lista de notas. Y para eso, son perfectas.

## Las piezas de una tabla

- `<table>`: la tabla.
- `<caption>`: el título de la tabla.
- `<thead>`, `<tbody>`, `<tfoot>`: la cabecera, el cuerpo y el pie.
- `<tr>`: una fila (*table row*).
- `<th>`: una celda de **encabezado** (*table header*).
- `<td>`: una celda de **dato** (*table data*).

## Una tabla de precios

```html playground=precios
<table>
  <caption>Comparación de planes</caption>
  <thead>
    <tr>
      <th scope="col">Plan</th>
      <th scope="col">Proyectos</th>
      <th scope="col">Soporte</th>
      <th scope="col">Precio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Básico</th>
      <td>1</td>
      <td>Email</td>
      <td>S/ 29</td>
    </tr>
    <tr>
      <th scope="row">Pro</th>
      <td>10</td>
      <td>Chat</td>
      <td>S/ 79</td>
    </tr>
    <tr>
      <th scope="row">Empresa</th>
      <td>Ilimitados</td>
      <td>24/7</td>
      <td>S/ 199</td>
    </tr>
  </tbody>
</table>
```

```css playground=precios
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

table {
  width: 100%;
  max-width: 560px;
  border-collapse: collapse; /* une los bordes de las celdas */
}

caption {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  text-align: left;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #e4e4e7;
  text-align: left;
}

thead th {
  background: #18181b;
  color: white;
}

/* Filas de colores alternos */
tbody tr:nth-child(even) {
  background: #f4f4f5;
}

tbody tr:hover {
  background: #fef3c7;
}

/* Los precios alineados a la derecha, como los números en una factura */
td:last-child {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
```

## ¿Para qué sirve `scope`?

`scope="col"` dice "este encabezado es de **la columna**" y `scope="row"` dice "este es de **la fila**". Así, un lector de pantalla en la celda "Chat" puede decir: *"Pro, Soporte: Chat"*. Sin `scope`, la persona escucha datos sueltos sin saber a qué pertenecen.

## Los CSS que más vas a usar

- `border-collapse: collapse`: sin esto, cada celda tiene su borde separado y queda una doble línea.
- `tr:nth-child(even)`: pinta las filas pares. Ayuda muchísimo a leer filas largas.
- `font-variant-numeric: tabular-nums`: hace que todos los números midan lo mismo y queden alineados.

## Tablas en el celular

Una tabla ancha se sale de la pantalla. La solución más simple es meterla en un contenedor que haga scroll:

```html
<div class="tabla-scroll">
  <table>...</table>
</div>
```

```css
.tabla-scroll {
  overflow-x: auto;
}
```

## Errores comunes

- **Usar tablas para maquetar.** Para poner cosas lado a lado usa Flexbox o Grid.
- **Usar `<td>` con negrita en vez de `<th>`.** Se ve igual, pero pierdes el significado de encabezado.
- **Saltarte el `<caption>`.** Es el título de la tabla. Si no lo quieres visible, igual es mejor tenerlo.

## Para profundizar

- [Conceptos básicos de tablas en MDN](https://developer.mozilla.org/es/docs/Learn/HTML/Tables/Basics)
- [`<table>` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Element/table)

En resumen: **tablas solo para datos**, **`<th>` con `scope`** para los encabezados, y **`border-collapse`** más filas alternas para que se lean bien.
