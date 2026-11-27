---
title: 'Container queries: componentes que se adaptan a su contenedor, no a la pantalla'
description: 'Las media queries miran la pantalla; las container queries miran el espacio que tiene el componente. Cómo usar container-type, @container y las unidades cqi con una tarjeta real.'
date: 2026-11-26
series: css
tags: [CSS, CSS moderno, Responsive]
draft: true
---

Tienes una tarjeta de producto. En el listado principal, con mucho espacio, quieres la imagen **a la izquierda** y el texto a la derecha. En la barra lateral, estrecha, quieres la imagen **arriba**. Pero la pantalla es la misma: una media query no sabe distinguirlas.

El problema es que las **media queries miran la pantalla**, y a un componente lo que le importa es **cuánto espacio tiene él**. Para eso existen las **container queries**.

## Media query vs container query

| | Media query | Container query |
| --- | --- | --- |
| ¿Qué mira? | El ancho de la **pantalla** | El ancho del **contenedor** del componente |
| Sintaxis | `@media (min-width: 600px)` | `@container (min-width: 400px)` |
| Ideal para | El layout general de la página | Componentes que se reutilizan en sitios distintos |

## Paso 1: declarar el contenedor

Primero, le dices a CSS **qué elemento es el contenedor** que se va a "medir":

```css
.envoltorio-tarjeta {
  container-type: inline-size;
}
```

`inline-size` significa "mide el **ancho**" (en idiomas como el español, que se escriben en horizontal). Es el valor que usarás casi siempre.

## Paso 2: preguntar por su tamaño

Ahora, los elementos de **dentro** pueden cambiar según el ancho de ese contenedor:

```css
@container (min-width: 420px) {
  .tarjeta {
    grid-template-columns: 160px 1fr;
  }
}
```

"Cuando el contenedor tenga al menos 420px de ancho, la tarjeta pasa a dos columnas."

## El ejemplo completo

La **misma tarjeta**, con el **mismo HTML y CSS**, en dos sitios con distinto espacio:

```html playground=tarjeta
<div class="pagina">
  <main class="contenedor">
    <h2>Listado principal</h2>
    <article class="tarjeta">
      <img src="https://picsum.photos/seed/auriculares/400/300" alt="" width="400" height="300">
      <div>
        <h3>Auriculares inalámbricos</h3>
        <p>Cancelación de ruido y 30 horas de batería.</p>
        <strong>S/ 249</strong>
      </div>
    </article>
  </main>

  <aside class="contenedor">
    <h2>Recomendado</h2>
    <article class="tarjeta">
      <img src="https://picsum.photos/seed/auriculares/400/300" alt="" width="400" height="300">
      <div>
        <h3>Auriculares inalámbricos</h3>
        <p>Cancelación de ruido y 30 horas de batería.</p>
        <strong>S/ 249</strong>
      </div>
    </article>
  </aside>
</div>
```

```css playground=tarjeta
body {
  margin: 0;
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #f4f4f5;
}

.pagina {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* 1. Los dos huecos son contenedores medibles */
.contenedor {
  container-type: inline-size;
}

/* 2. Estilo base de la tarjeta: imagen arriba (para espacios estrechos) */
.tarjeta {
  display: grid;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: white;
}

.tarjeta img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}

.tarjeta h3 {
  margin: 0 0 4px;
}

.tarjeta p {
  margin: 0 0 8px;
  color: #52525b;
}

/* 3. Si el contenedor tiene espacio: imagen a la izquierda */
@container (min-width: 340px) {
  .tarjeta {
    grid-template-columns: 140px 1fr;
    align-items: center;
  }
}
```

En el listado principal (ancho), la tarjeta sale en horizontal. En la barra lateral (estrecha), en vertical. **Sin tocar el HTML** y sin saber nada de la pantalla.

Y lo mejor: si mañana pones la tarjeta en un modal, en un carrusel o en una cuadrícula de cuatro columnas, **se adapta sola**.

## Contenedores con nombre

Si hay contenedores dentro de otros contenedores, `@container` usa **el más cercano**. Para apuntar a uno concreto, ponle nombre:

```css
.barra-lateral {
  container-type: inline-size;
  container-name: lateral;
}

/* Atajo: container: nombre / tipo */
.listado {
  container: listado / inline-size;
}

@container lateral (max-width: 250px) {
  .tarjeta p {
    display: none; /* en una barra lateral muy estrecha, sin descripción */
  }
}
```

## Unidades de contenedor: `cqi`

Igual que `vw` es un 1 % del ancho de la pantalla, **`cqi`** es un 1 % del ancho **del contenedor**. Perfecto para tipografía que se adapta al componente:

```css
.tarjeta h3 {
  font-size: clamp(1rem, 5cqi, 1.5rem);
}
```

El título crece cuando la tarjeta tiene más espacio, esté donde esté. Es la combinación de `clamp()` (que tiene su propio post) con las unidades de contenedor.

## Una limitación importante

Un elemento **no puede preguntar por su propio tamaño**, solo por el de un contenedor **ancestro**. Por eso necesitas un envoltorio:

```css
/* ❌ La tarjeta no puede medirse a sí misma para cambiar su propio display */
.tarjeta {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .tarjeta { grid-template-columns: 1fr 1fr; } /* no funciona */
}

/* ✅ Se mide el padre y se cambia la tarjeta */
.envoltorio { container-type: inline-size; }

@container (min-width: 400px) {
  .tarjeta { grid-template-columns: 1fr 1fr; }
}
```

Lo que sí puedes hacer es cambiar los **hijos** de la tarjeta preguntando por la propia tarjeta, si es contenedor.

## ¿Entonces ya no uso media queries?

Sí. Se complementan:

- **Media queries** para el **layout de la página**: cuántas columnas tiene, si el menú es hamburguesa, el tamaño de la letra base.
- **Container queries** para los **componentes**: tarjetas, widgets, formularios que aparecen en distintos sitios.

## Tu turno

Partiendo del ejemplo:

1. Añade un tercer estado: si el contenedor tiene más de 650px, que la descripción se vea más grande y el precio vaya a la derecha.
2. Haz que el título use `cqi` para crecer con la tarjeta.
3. Cambia la `.pagina` a una sola columna en pantallas pequeñas (con una media query) y comprueba que las tarjetas se adaptan solas.

## Errores comunes

- **Olvidar `container-type`.** Sin él, `@container` no encuentra ningún contenedor y no hace nada.
- **Intentar que un elemento se mida a sí mismo.** Necesitas un contenedor padre.
- **Usar `container-type: size`** sin necesitarlo. Mide también el alto, y obliga a que el contenedor tenga un alto definido (si no, se queda en 0). Usa `inline-size`.
- **Sustituir todas las media queries.** El layout general de la página sigue siendo cosa de las media queries.

## Para profundizar

- [Container queries en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_containment/Container_queries)
- [`container-type` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/container-type)

En resumen: las **container queries** adaptan un componente al **espacio de su contenedor**, no a la pantalla. Marca el contenedor con **`container-type: inline-size`**, pregunta por su ancho con **`@container (min-width: ...)`** y usa **`cqi`** para tamaños relativos al contenedor. Son perfectas para componentes reutilizables; las media queries siguen siendo para el layout de la página.
