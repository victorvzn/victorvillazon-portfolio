---
title: 'Prueba técnica de maquetación: pasar un diseño de Figma a código'
description: 'Cómo enfrentarte a la prueba más típica de frontend: te dan un diseño y tienes que maquetarlo. Inspeccionar medidas en Figma, sacar variables, dividir en componentes y qué entregar.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, Pruebas técnicas, Figma, Carrera]
draft: true
---

Es, probablemente, la prueba técnica más habitual para un puesto de **frontend junior**: te mandan un enlace a un diseño en **Figma** (o una imagen) y te piden que lo conviertas en una página real con HTML y CSS. A veces en un par de horas, a veces en unos días.

Este post no es un ejercicio con solución, sino **el método** para hacer cualquiera de estas pruebas. Al final tienes un reto para practicarlo.

## Qué es Figma (y qué hacer con el enlace)

**Figma** es la herramienta de diseño más usada para webs y apps. Los diseñadores dibujan ahí cada pantalla, y los desarrolladores la consultan para saber cómo tiene que quedar.

Cuando te pasan un enlace:

1. Ábrelo en el navegador. **No necesitas pagar**: con una cuenta gratuita puedes ver e inspeccionar el diseño.
2. Si tienes permiso, cambia al **Dev Mode** (modo desarrollador, arriba a la derecha) o al panel **Inspect**. Al seleccionar cualquier elemento, verás sus medidas, colores, tipografía e incluso un trozo de CSS.
3. Usa `Alt` (o `Option` en Mac) mientras pasas el ratón entre dos elementos para ver la **distancia** entre ellos.

> El CSS que genera Figma es una **referencia**, no código para copiar y pegar. Suele usar posiciones absolutas y medidas fijas que no son responsive. Úsalo para sacar los valores (colores, tamaños, sombras), pero escribe tú la estructura.

## Paso 1: mira el diseño entero antes de tocar el código (10 minutos)

Antes de escribir una línea:

- **¿Cuántas pantallas o tamaños hay?** ¿Hay versión móvil y de escritorio? Si solo hay una, pregunta (o decide y explícalo en el README).
- **¿Qué se repite?** Tarjetas, botones, títulos de sección. Cada cosa que se repite es un **componente** (una clase CSS reutilizable).
- **¿Qué es interactivo?** Menús, botones, formularios, pestañas. ¿Hay estados (*hover*, activo, error) dibujados?

Igual que en el post de maquetar una landing, **divide el diseño en cajas** y decide dónde va Flexbox y dónde Grid.

## Paso 2: saca el sistema de diseño a variables (15 minutos)

Un buen diseño no usa 40 colores y 25 tamaños distintos: usa unos pocos que se repiten. Recórrelo y apunta:

- **Colores**: el principal, el de los textos, el de los fondos, los bordes, el de error...
- **Tipografía**: la fuente, y los tamaños de títulos, texto normal y texto pequeño.
- **Espaciados**: casi siempre siguen una escala (4, 8, 16, 24, 32, 48...).
- **Bordes redondeados y sombras.**

Y conviértelos en **variables CSS** antes de empezar:

```css
:root {
  /* Colores */
  --color-primario: #4f46e5;
  --color-texto: #18181b;
  --color-texto-suave: #52525b;
  --color-fondo: #fafafa;
  --color-borde: #e4e4e7;

  /* Tipografía */
  --fuente: 'Inter', system-ui, sans-serif;
  --texto-sm: 0.875rem;
  --texto-base: 1rem;
  --texto-lg: 1.25rem;
  --texto-titulo: clamp(2rem, 5vw, 3rem);

  /* Espaciado */
  --espacio-1: 4px;
  --espacio-2: 8px;
  --espacio-3: 16px;
  --espacio-4: 24px;
  --espacio-5: 48px;

  /* Otros */
  --radio: 12px;
  --sombra: 0 4px 16px rgb(0 0 0 / 0.08);
}
```

Esto es lo que más diferencia a un junior que "copia píxeles" de uno que **entiende el diseño**. Si el revisor cambia `--color-primario`, toda la página debería cambiar.

### Las fuentes

Si el diseño usa una fuente de **Google Fonts** (Figma te dice su nombre), cárgala en el `<head>` con lo que te da Google Fonts al elegirla, o descárgala y usa `@font-face`. Carga **solo los pesos que se usan** (por ejemplo, 400 y 700), no la familia entera.

### Las imágenes y los iconos

- Exporta las imágenes desde Figma (panel **Export**, abajo a la derecha). Para fotos, **WebP** (lo vimos en el post de rendimiento de imágenes); para iconos y logos, **SVG**.
- Pon a cada imagen su `alt` mientras la colocas, no "al final".

## Paso 3: HTML primero, y semántico (20 % del tiempo)

Escribe **todo el HTML** de la página antes de empezar con el CSS. Sin estilos, la página debería poder leerse de arriba a abajo y tener sentido:

- Un `<header>` con el `<nav>`, un `<main>` con sus `<section>` y un `<footer>`.
- **Un solo `<h1>`** y los títulos en orden.
- Botones que son `<button>` y enlaces que son `<a>`.
- Formularios con sus `<label>`.

## Paso 4: CSS mobile first, componente a componente

1. **Estilos base**: el reset, el `body` con la fuente y los colores, los enlaces y las imágenes.
2. **Layout general**: el contenedor centrado, las secciones.
3. **Componente por componente**, de arriba a abajo: cabecera, hero, tarjetas...
4. **Las media queries** para pantallas grandes, al final de cada componente (o dentro, con anidamiento).

Ve comparando con el diseño **a menudo**. Un truco: haz una captura del diseño, ábrela en otra pestaña y alterna entre las dos. Algunas extensiones del navegador (como "PerfectPixel") superponen la imagen del diseño sobre tu página con transparencia.

### ¿Hasta dónde hay que ser exacto?

**No se busca la perfección al píxel.** Se busca que:

- Se vea **igual a simple vista**: mismos colores, mismas fuentes, misma estructura, proporciones parecidas.
- **Se adapte bien** a los tamaños que no estaban dibujados. El diseño muestra 375px y 1440px, pero tu web también se verá a 800px. Ahí es donde se nota si usaste `max-width`, `auto-fit` y `clamp()` o medidas fijas.

## Paso 5: los detalles que suman puntos

Cuando la página ya se parece al diseño, repasa:

- [ ] Estados **`:hover`** y **`:focus-visible`** en todo lo que se puede pulsar.
- [ ] Se puede usar **solo con el teclado**.
- [ ] No hay **scroll horizontal** en ningún ancho (de 320px en adelante).
- [ ] Las imágenes tienen `alt`, `width` y `height`.
- [ ] El HTML **valida** (validator.w3.org).
- [ ] **Lighthouse** da buena nota en accesibilidad y rendimiento.
- [ ] Funciona en otro navegador además del tuyo.

## Paso 6: qué entregar

1. **Un repositorio en GitHub** con commits pequeños y con sentido (no un único commit "prueba terminada").
2. **La web publicada** (Vercel, Netlify o GitHub Pages; tienes un post sobre cómo hacerlo gratis), con el enlace bien visible.
3. **Un README** corto con:
   - Cómo ejecutarlo en local.
   - **Las decisiones que tomaste** y por qué ("El diseño no tenía versión de tablet; a partir de 768px pasé a dos columnas").
   - **Lo que mejorarías** con más tiempo.

El README es tu oportunidad de **explicar tu forma de pensar**. Muchas veces pesa tanto como el código.

## Errores que más restan

- **Copiar el CSS de Figma tal cual**: posiciones absolutas y anchos fijos que se rompen en cuanto cambias el tamaño de la ventana.
- **Todo con `<div>`** y sin títulos ni etiquetas semánticas.
- **Colores y tamaños repetidos** a mano por todo el CSS, sin variables.
- **Que solo funcione en el tamaño del diseño.**
- **Imágenes enormes** sin optimizar.
- **Entregar sin README** o sin la web publicada.
- **Añadir cosas que no estaban en el diseño** (animaciones llamativas, colores "mejores"). Si algo te parece mejorable, propónlo en el README, pero respeta el diseño.

## Tu turno: practica con un diseño real

La mejor forma de prepararte es hacer varias. Algunas fuentes de diseños gratuitos pensados para practicar:

- **[Frontend Mentor](https://www.frontendmentor.io)**: desafíos con el diseño (en imagen y, en muchos, en Figma), los recursos y distintos niveles de dificultad. Los primeros son perfectos para empezar.
- **La [Comunidad de Figma](https://www.figma.com/community)**: busca "landing page" o "portfolio" y filtra por recursos gratuitos.

Elige uno de nivel básico, ponte un tiempo límite (por ejemplo, **3 horas**) y sigue los seis pasos de este post. Al terminar, compara tu resultado con el diseño y anota qué te costó más: esa es tu lista de cosas para estudiar.
