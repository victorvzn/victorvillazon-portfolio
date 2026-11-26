---
title: 'Prueba técnica de maquetación: una tarjeta de producto'
description: 'Una prueba técnica de HTML y CSS como las de las entrevistas: maqueta una tarjeta de producto accesible y responsive. Con solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, Pruebas técnicas, Accesibilidad]
draft: true
---

No todas las pruebas técnicas son de algoritmos. Para puestos de frontend junior es muy común que te den un diseño y te pidan **maquetarlo** con HTML y CSS. Ahí se ve si usas HTML semántico, si sabes Flexbox o Grid y si piensas en el móvil.

Tiempo recomendado: **45 minutos**.

## El enunciado

> Maqueta una tarjeta de producto para una tienda online con:
>
> 1. Una imagen del producto.
> 2. Una etiqueta "Oferta" encima de la imagen, en la esquina superior izquierda.
> 3. El nombre del producto, que es un enlace a su página.
> 4. Una valoración de 4 de 5 estrellas.
> 5. El precio actual y el precio anterior tachado.
> 6. Un botón "Añadir al carrito".
>
> Requisitos:
>
> - El botón debe quedar **siempre abajo**, aunque el nombre ocupe dos líneas.
> - Las tarjetas deben verse en **una columna en el móvil** y en varias en pantallas grandes, sin media queries.
> - Debe ser **accesible**: navegable con teclado y entendible con un lector de pantalla.

## Tu turno

Te dejo el punto de partida con dos productos. Escribe el HTML de las tarjetas y todo el CSS:

```html playground=reto
<main class="productos">
  <!--
    Producto 1: Auriculares inalámbricos Pro · 49,99 € (antes 79,99 €) · 4/5 · en oferta
    Producto 2: Teclado mecánico compacto con retroiluminación RGB · 89,00 € (antes 109,00 €) · 4/5 · en oferta
    Imágenes: https://picsum.photos/seed/auriculares/400/300
              https://picsum.photos/seed/teclado/400/300
  -->
</main>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #f4f4f5;
}

/* tu CSS aquí */
```

Antes de mirar la solución, revisa tu trabajo con estas preguntas:

- ¿Puedes llegar al enlace y al botón solo con la tecla `Tab`? ¿Se ve dónde está el foco?
- ¿Qué leería un lector de pantalla en las estrellas? ¿Y en el precio tachado?
- Si haces la ventana muy estrecha, ¿se rompe algo?

<!-- solucion: Ver una pista para el botón abajo -->

Haz que la tarjeta sea una columna flex (`display: flex; flex-direction: column`) y dale al botón `margin-top: auto`. Ese margen automático "empuja" el botón hasta el final del espacio disponible.

Para que todas las tarjetas de una fila midan lo mismo, no tienes que hacer nada: los elementos de un grid se estiran a la altura de la fila por defecto.

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<main class="productos">
  <article class="producto">
    <div class="producto__imagen">
      <img src="https://picsum.photos/seed/auriculares/400/300" alt="" width="400" height="300">
      <span class="producto__oferta">Oferta</span>
    </div>

    <h2 class="producto__nombre">
      <a href="#auriculares">Auriculares inalámbricos Pro</a>
    </h2>

    <p class="producto__valoracion">
      <span aria-hidden="true">★★★★☆</span>
      <span class="sr-only">Valoración: 4 de 5 estrellas</span>
    </p>

    <p class="producto__precio">
      <strong>49,99 €</strong>
      <del><span class="sr-only">Antes:</span> 79,99 €</del>
    </p>

    <button class="producto__boton" type="button">Añadir al carrito</button>
  </article>

  <article class="producto">
    <div class="producto__imagen">
      <img src="https://picsum.photos/seed/teclado/400/300" alt="" width="400" height="300">
      <span class="producto__oferta">Oferta</span>
    </div>

    <h2 class="producto__nombre">
      <a href="#teclado">Teclado mecánico compacto con retroiluminación RGB</a>
    </h2>

    <p class="producto__valoracion">
      <span aria-hidden="true">★★★★☆</span>
      <span class="sr-only">Valoración: 4 de 5 estrellas</span>
    </p>

    <p class="producto__precio">
      <strong>89,00 €</strong>
      <del><span class="sr-only">Antes:</span> 109,00 €</del>
    </p>

    <button class="producto__boton" type="button">Añadir al carrito</button>
  </article>
</main>
```

```css playground=solucion
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #f4f4f5;
}

/* Responsive sin media queries: tantas columnas de mínimo 220px como quepan */
.productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.producto {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.06);
}

/* La imagen es la referencia para colocar la etiqueta */
.producto__imagen {
  position: relative;
}

.producto__imagen img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 10px;
}

.producto__oferta {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dc2626;
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.producto__nombre {
  margin: 4px 0 0;
  font-size: 16px;
  line-height: 1.3;
}

.producto__nombre a {
  color: #18181b;
  text-decoration: none;
}

.producto__nombre a:hover {
  text-decoration: underline;
}

.producto__valoracion,
.producto__precio {
  margin: 0;
}

.producto__valoracion {
  color: #f59e0b;
}

.producto__precio strong {
  font-size: 20px;
}

.producto__precio del {
  margin-left: 6px;
  color: #71717a;
}

/* margin-top: auto empuja el botón al final de la tarjeta */
.producto__boton {
  margin-top: auto;
  min-height: 44px;
  border: none;
  border-radius: 10px;
  background: #18181b;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.producto__boton:hover {
  background: #3f3f46;
}

.producto a:focus-visible,
.producto__boton:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}

/* Visible para lectores de pantalla, invisible en pantalla */
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

**HTML**

- **`<article>`** para cada tarjeta: es un contenido que tiene sentido por sí solo.
- **`<h2>` con un `<a>` dentro**: los usuarios de lector de pantalla navegan saltando de título en título.
- **`alt=""` en la imagen**: es decorativa, porque el nombre del producto ya está justo debajo. Si el alt repitiera el nombre, el lector lo diría dos veces (lo vimos en el post del texto alternativo).
- **`width` y `height` en la imagen**: el navegador reserva el espacio antes de que cargue y la página no "salta".
- **Las estrellas con `aria-hidden`** y un texto oculto: un lector de pantalla leería "estrella negra, estrella negra..." en vez de "4 de 5".
- **`<del>`** para el precio anterior, con "Antes:" oculto para dar contexto.
- **`<button type="button">`**, no un `<div>` con un clic: se puede usar con teclado sin hacer nada más.

**CSS**

- **`repeat(auto-fill, minmax(220px, 1fr))`**: el responsive sin media queries que vimos en su propio post.
- **`position: relative` en el contenedor + `absolute` en la etiqueta**: la etiqueta se coloca respecto a la imagen, no a la página.
- **`flex-direction: column` + `margin-top: auto`**: el botón siempre abajo.
- **`:focus-visible`**: el foco se ve al navegar con teclado.
- **Nombres de clase tipo BEM** (`producto__nombre`): fácil saber a qué tarjeta pertenece cada pieza.

<!-- /solucion -->

## Lo que evalúa el entrevistador

En una prueba de maquetación casi nunca buscan un resultado idéntico al píxel. Lo que se mira es:

- **HTML semántico** frente a un montón de `div`.
- **Accesibilidad**: teclado, foco visible y textos para lectores de pantalla.
- **Responsive** que no se rompe en ningún ancho.
- **CSS ordenado**, con nombres claros y sin valores mágicos repetidos.

Un consejo final: si te da tiempo, añade un **README** corto explicando tus decisiones ("puse `alt=""` porque..."). Muchas veces eso pesa tanto como el código.
