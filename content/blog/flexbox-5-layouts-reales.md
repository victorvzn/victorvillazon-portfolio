---
title: 'Flexbox con 5 layouts reales'
description: 'Entiende Flexbox de una vez con cinco diseños que vas a usar en casi cualquier proyecto.'
date: 2026-11-24
series: css
tags: [CSS, Flexbox, Layout]
draft: false
# youtube: ID_DEL_VIDEO
---

¿Te ha pasado que quieres poner el logo a un lado y el menú al otro, y terminas peleándote con `margin` y `float`? A mí me pasó muchas veces, hasta que entendí **Flexbox**.

Flexbox sirve para una cosa: **acomodar elementos en una fila o en una columna** y repartir el espacio entre ellos. Te explico cómo piensa y luego lo usamos en cinco layouts reales. Cada ejemplo tiene un botón para probarlo en el playground: rómpelo, cambia valores, así se aprende.

## Cómo piensa Flexbox

Pones `display: flex` en el **padre** (el contenedor) y se acomodan sus **hijos directos** (los ítems):

```html playground=intro
<div class="contenedor">
  <div>Uno</div>
  <div>Dos</div>
  <div>Tres</div>
</div>
```

```css playground=intro
.contenedor {
  display: flex;
}
```

Solo con eso, los tres `<div>` pasan de estar uno debajo del otro a estar en fila.

Lo más importante es entender los **dos ejes**:

- **Eje principal**: hacia donde se colocan los ítems. Por defecto, horizontal.
- **Eje transversal**: el perpendicular. Por defecto, vertical.

Y las propiedades que vas a usar casi siempre:

- `justify-content`: reparte los ítems en el **eje principal**.
- `align-items`: los alinea en el **eje transversal**.
- `gap`: el espacio entre ellos.
- `flex-direction: column`: los pone en columna, y **los ejes se intercambian**.

Truco para no olvidarlo: **justify = principal, align = transversal**.

## 1. La barra de navegación

Logo a la izquierda, enlaces a la derecha:

```html playground=navbar
<header class="navbar">
  <a href="/" class="logo">MiSitio</a>
  <nav>
    <ul class="menu">
      <li><a href="/blog">Blog</a></li>
      <li><a href="/proyectos">Proyectos</a></li>
    </ul>
  </nav>
</header>
```

```css playground=navbar
.navbar {
  display: flex;
  justify-content: space-between; /* uno a cada extremo */
  align-items: center;            /* centrados en vertical */
}

.menu {
  display: flex; /* otro flex para los enlaces */
  gap: 24px;
  list-style: none;
}
```

Fíjate que hay **dos flex**, uno dentro del otro. Es normal y lo vas a hacer todo el tiempo.

## 2. Centrar algo

El famoso "¿cómo centro un div?". Con Flexbox son tres líneas:

```html playground=centrar
<section class="hero">
  <div>Estoy en el centro</div>
</section>
```

```css playground=centrar
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

Ojo con el `min-height`: sin altura no hay espacio que repartir y no verás el centrado vertical.

## 3. Tarjetas que se adaptan solas

Tres tarjetas en fila en la compu y en columna en el celular, **sin media queries**:

```html playground=tarjetas
<div class="tarjetas">
  <article class="tarjeta">HTML</article>
  <article class="tarjeta">CSS</article>
  <article class="tarjeta">JavaScript</article>
</div>
```

```css playground=tarjetas
.tarjetas {
  display: flex;
  flex-wrap: wrap; /* si no caben, bajan */
  gap: 16px;
}

.tarjeta {
  flex: 1 1 250px;
  padding: 24px;
  border: 1px solid #ddd;
}
```

`flex: 1 1 250px` se lee así: "quiero medir 250px, pero puedo crecer y encogerme". Achica la vista previa en el playground y mira cómo bajan.

## 4. El footer pegado abajo

Si la página tiene poco contenido, el footer queda flotando a la mitad. Así lo mandas al fondo:

```html playground=footer
<body>
  <header>Encabezado</header>
  <main>Poco contenido…</main>
  <footer>Pie de página</footer>
</body>
```

```css playground=footer
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
}

main {
  flex: 1; /* ocupa todo el espacio que sobra */
}
```

Como ahora el eje principal es vertical, `flex: 1` hace crecer el `<main>` hacia abajo y empuja el footer.

## 5. Avatar + texto

El clásico de comentarios y chats:

```html playground=media
<div class="comentario">
  <div class="avatar" aria-hidden="true">A</div>
  <p>Por fin entendí justify-content.</p>
</div>
```

```css playground=media
.comentario {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.avatar {
  flex-shrink: 0; /* nunca se aplasta */
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fbbf24;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

Prueba esto en el playground: borra `flex-shrink: 0` y escribe un comentario larguísimo. Verás cómo el avatar se deforma.

## Errores que yo también cometí

- **Poner `display: flex` en el hijo.** Va en el padre.
- **Confundir justify y align en columna.** Con `flex-direction: column` se intercambian.
- **Separar con `margin` en vez de `gap`.** `gap` es más limpio y no deja espacio sobrante en los bordes.

## Tu turno

Arma una página con una navbar, un título centrado, tres tarjetas y un footer pegado abajo. Después abre DevTools (F12): junto a cada elemento flex aparece una etiqueta **flex**, y si le das clic te dibuja los ejes sobre la página.

En resumen: `display: flex` en el padre, **justify** para el eje principal, **align** para el transversal, y `gap` para separar. Con eso ya resuelves la mayoría de layouts.
