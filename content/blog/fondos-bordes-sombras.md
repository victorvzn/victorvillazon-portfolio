---
title: 'Fondos, bordes y sombras en CSS: background, border-radius y box-shadow'
description: 'Colores e imágenes de fondo, degradados, esquinas redondeadas y sombras suaves. Las propiedades que hacen que una caja deje de parecer un rectángulo gris.'
date: 2026-11-26
series: css
tags: [CSS, Fundamentos, Diseño]
draft: true
---

Ya sabes cómo funciona el modelo de caja: contenido, `padding`, `border` y `margin`. Hoy vamos a **decorar** esas cajas. Con tres propiedades (`background`, `border-radius` y `box-shadow`) se hace el 90 % del aspecto de una interfaz moderna: tarjetas, botones, avatares, banners.

## `background-color`: el fondo más simple

```css
.tarjeta {
  background-color: #fef3c7;
}
```

El fondo pinta el **contenido y el padding**, pero no el margin. Por eso, si quieres más fondo alrededor del texto, aumenta el `padding`.

## Imágenes de fondo

```html playground=imagen
<header class="banner">
  <h1>Ofertas de verano</h1>
</header>
```

```css playground=imagen
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.banner {
  display: grid;
  place-items: center;
  min-height: 300px;
  color: white;

  background-image: url('https://picsum.photos/seed/verano/1200/600');
  background-size: cover;       /* cubre toda la caja, recortando si hace falta */
  background-position: center;  /* centra la imagen */
  background-repeat: no-repeat; /* no la repite como un mosaico */
}

.banner h1 {
  margin: 0;
  font-size: clamp(2rem, 6vw, 4rem);
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.6);
}
```

Las tres propiedades que casi siempre necesitas:

| Propiedad | Valores típicos | Qué hace |
| --- | --- | --- |
| `background-size` | `cover`, `contain`, `100px` | `cover` llena la caja (recorta); `contain` muestra la imagen entera (puede dejar huecos) |
| `background-position` | `center`, `top`, `left bottom` | Qué parte de la imagen se ve |
| `background-repeat` | `no-repeat`, `repeat` | Si se repite como un mosaico |

> **¿Imagen de fondo o `<img>`?** Si la imagen es **contenido** (la foto de un producto, de un artículo), usa `<img>` con su `alt`. Si es **decoración** (una textura, un fondo de banner), usa `background-image`. Las imágenes de fondo no tienen texto alternativo, así que un lector de pantalla no las anuncia.

### Texto legible sobre una imagen

Un texto blanco sobre una foto puede ser imposible de leer si la foto tiene zonas claras. El truco: poner un **degradado oscuro encima** de la imagen. `background-image` acepta varias capas separadas por comas, y **la primera va encima**:

```css
.banner {
  background-image:
    linear-gradient(rgb(0 0 0 / 0.5), rgb(0 0 0 / 0.5)),
    url('https://picsum.photos/seed/verano/1200/600');
}
```

## Degradados

Un **degradado** (*gradient*) es una transición entre colores. En CSS se usa como una imagen de fondo:

```html playground=degradados
<div class="caja lineal">linear-gradient</div>
<div class="caja angulo">con ángulo</div>
<div class="caja radial">radial-gradient</div>
<div class="caja cortado">con cortes duros</div>
```

```css playground=degradados
body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.caja {
  display: grid;
  place-items: center;
  height: 120px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
}

/* De arriba a abajo (la dirección por defecto) */
.lineal {
  background: linear-gradient(#6366f1, #ec4899);
}

/* En diagonal */
.angulo {
  background: linear-gradient(135deg, #22c55e, #0ea5e9);
}

/* Desde el centro hacia fuera */
.radial {
  background: radial-gradient(circle, #f59e0b, #b45309);
}

/* Dos colores en el mismo punto = un corte sin transición */
.cortado {
  background: linear-gradient(90deg, #18181b 50%, #f43f5e 50%);
}
```

## `background`: el atajo

Todo lo anterior se puede escribir en una sola propiedad. Es muy común verlo así:

```css
.banner {
  background: url('foto.jpg') center / cover no-repeat;
}
```

La `/` separa la posición (`center`) del tamaño (`cover`).

## Bordes

```css
.tarjeta {
  border: 1px solid #e4e4e7;   /* grosor, estilo y color */
}

.aviso {
  border-left: 4px solid #f59e0b; /* solo un lado */
}
```

Los estilos más usados son `solid` (línea continua), `dashed` (guiones) y `dotted` (puntos).

## `border-radius`: esquinas redondeadas

```html playground=radio
<div class="ejemplo suave">8px</div>
<div class="ejemplo pildora">Píldora</div>
<img class="avatar" src="https://i.pravatar.cc/120?img=5" alt="Foto de perfil de Lucía" width="120" height="120">
<div class="ejemplo esquina">Una esquina</div>
```

```css playground=radio
body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.ejemplo {
  padding: 16px 24px;
  background: #e0e7ff;
}

.suave {
  border-radius: 8px;
}

/* Un valor enorme convierte los lados cortos en semicírculos */
.pildora {
  border-radius: 999px;
}

/* 50 % en un elemento cuadrado = un círculo */
.avatar {
  border-radius: 50%;
}

/* Arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda */
.esquina {
  border-radius: 24px 0 24px 0;
}
```

- **`border-radius: 999px`** es el truco para botones y etiquetas en forma de **píldora**, midan lo que midan.
- **`border-radius: 50%`** en algo cuadrado hace un **círculo**. Perfecto para avatares.

## `box-shadow`: sombras

```css
box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
/*          x  y  difuminado  color */
```

1. **Desplazamiento horizontal** (`x`): positivo hacia la derecha.
2. **Desplazamiento vertical** (`y`): positivo hacia abajo. Las sombras realistas van **hacia abajo**, porque la luz suele venir de arriba.
3. **Difuminado**: cuánto se suaviza el borde de la sombra.
4. **Color**: casi siempre negro con **mucha transparencia**.

```html playground=sombras
<div class="tarjeta dura">Sombra dura</div>
<div class="tarjeta suave">Sombra suave</div>
<div class="tarjeta capas">Varias capas</div>
<div class="tarjeta interior">Interior</div>
```

```css playground=sombras
body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 24px;
  padding: 32px;
  background: #f4f4f5;
  font-family: system-ui, sans-serif;
}

.tarjeta {
  padding: 32px 16px;
  border-radius: 12px;
  background: white;
  text-align: center;
}

/* ❌ Muy marcada: parece de los años 2000 */
.dura {
  box-shadow: 4px 4px 0 black;
}

/* ✅ Suave y transparente: la más usada */
.suave {
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.08);
}

/* ✅ Dos sombras: una cercana y nítida, otra lejana y difusa. Muy realista */
.capas {
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.06),
    0 8px 24px rgb(0 0 0 / 0.08);
}

/* inset: la sombra va hacia dentro */
.interior {
  box-shadow: inset 0 2px 6px rgb(0 0 0 / 0.15);
}
```

La regla de diseño: **las sombras sutiles se ven profesionales**. Si la sombra llama la atención, es demasiado fuerte.

### Efecto de "elevarse" al pasar el ratón

```css
.tarjeta {
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.06);
  transition: box-shadow 0.2s, translate 0.2s;
}

.tarjeta:hover {
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.12);
  translate: 0 -4px;
}
```

## Tu turno

Diseña una tarjeta de perfil con:

```html playground=ejercicio
<article class="perfil">
  <div class="perfil__portada"></div>
  <img class="perfil__foto" src="https://i.pravatar.cc/160?img=12" alt="Foto de perfil de Diego" width="80" height="80">
  <h2>Diego Ramos</h2>
  <p>Desarrollador frontend</p>
  <a class="perfil__boton" href="#">Seguir</a>
</article>
```

```css playground=ejercicio
body {
  font-family: system-ui, sans-serif;
  padding: 32px;
  background: #f4f4f5;
}

/* 1. La tarjeta: fondo blanco, esquinas redondeadas y una sombra suave
   2. La portada: 100px de alto con un degradado diagonal
   3. La foto: circular, con un borde blanco de 4px
   4. El botón: en forma de píldora
   5. Extra: que la tarjeta se eleve al pasar el ratón */
```

## Errores comunes

- **Imágenes de contenido como `background-image`.** No tienen `alt`. Usa `<img>`.
- **Olvidar `background-size: cover`.** La imagen se muestra a su tamaño original y se repite.
- **Sombras negras y opacas.** Usa negro con poca opacidad: `rgb(0 0 0 / 0.1)`.
- **`border-radius: 50%` en algo que no es cuadrado.** Sale un óvalo. Asegúrate de que el ancho y el alto sean iguales.
- **Texto sobre imágenes sin contraste.** Añade un degradado oscuro encima o una sombra al texto.

## Para profundizar

- [`background` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/background)
- [`border-radius` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/border-radius)
- [`box-shadow` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/box-shadow)

En resumen: **`background`** pinta colores, imágenes (con `cover` y `center`) y **degradados**; **`border-radius`** redondea esquinas (`999px` para píldoras, `50%` para círculos) y **`box-shadow`** añade sombras, que deben ser **suaves y transparentes**. Con estas tres propiedades ya puedes dar a tus interfaces un aspecto profesional.
