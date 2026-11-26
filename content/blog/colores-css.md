---
title: 'Colores en CSS: hex, rgb, hsl y transparencias'
description: 'Las formas de escribir un color en CSS, cuándo usar cada una, cómo hacer transparencias y cómo comprobar que tu texto se lee bien (contraste).'
date: 2026-11-26
series: css
tags: [CSS, Fundamentos, Diseño]
draft: true
---

En CSS puedes escribir el mismo color de varias formas: `red`, `#ff0000`, `rgb(255 0 0)` o `hsl(0 100% 50%)` son exactamente el mismo rojo. ¿Por qué tantas? Porque cada una es cómoda para una cosa distinta.

## Nombres de colores

CSS entiende unos 140 nombres en inglés: `red`, `tomato`, `navy`, `gold`, `rebeccapurple`...

```css
h1 { color: tomato; }
```

Son útiles para probar rápido, pero en un proyecto real casi nunca coinciden con los colores exactos de un diseño.

## Hexadecimal: el más común

Es el formato que verás en Figma y en casi cualquier diseño: un `#` y seis caracteres.

```css
.boton { background: #f59e0b; }
```

Los seis caracteres son tres parejas: **rojo**, **verde** y **azul** (RGB). Cada pareja va de `00` (nada) a `ff` (el máximo). Así, `#ff0000` es rojo puro, `#000000` es negro y `#ffffff` es blanco.

Si las parejas se repiten, puedes abreviar: `#ffcc00` se puede escribir `#fc0`.

## rgb(): rojo, verde y azul con números

Lo mismo que el hexadecimal, pero con números del 0 al 255:

```css
.boton { background: rgb(245 158 11); }
```

Su gran ventaja: es muy fácil añadir **transparencia** con una barra y un valor de 0 a 1:

```css
.fondo-oscuro { background: rgb(0 0 0 / 0.5); } /* negro al 50 % */
```

Verás también la sintaxis antigua con comas, `rgba(0, 0, 0, 0.5)`. Hace lo mismo.

## hsl(): el más fácil de entender para las personas

**HSL** describe el color como lo pensaríamos nosotros:

- **H (*hue*, tono)**: el color en la rueda cromática, de 0 a 360. 0 es rojo, 120 es verde, 240 es azul.
- **S (*saturation*, saturación)**: lo intenso que es, de 0% (gris) a 100% (vivo).
- **L (*lightness*, luminosidad)**: de 0% (negro) a 100% (blanco). 50% es el color "puro".

```css
.boton { background: hsl(38 92% 50%); }
```

Lo mejor de HSL es crear **variaciones** de un color cambiando solo la luminosidad:

```html playground=hsl
<div class="paleta">
  <div style="background: hsl(210 80% 90%)">90%</div>
  <div style="background: hsl(210 80% 70%)">70%</div>
  <div style="background: hsl(210 80% 50%)">50%</div>
  <div style="background: hsl(210 80% 35%); color: white">35%</div>
  <div style="background: hsl(210 80% 20%); color: white">20%</div>
</div>
```

```css playground=hsl
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.paleta {
  display: flex;
  gap: 8px;
}

.paleta div {
  flex: 1;
  padding: 32px 0;
  border-radius: 8px;
  text-align: center;
}
```

Mismo tono (210, azul), misma saturación: solo cambia la luz. Así se construye una paleta para un botón y sus estados `:hover` o desactivado.

## Transparencias

Hay dos formas de hacer algo semitransparente, y no son iguales:

```html playground=transparencia
<div class="fondo">
  <div class="caja con-alpha">Fondo con rgb(... / 0.5): el texto se ve perfecto</div>
  <div class="caja con-opacity">Con opacity: 0.5 todo se vuelve transparente, también el texto</div>
</div>
```

```css playground=transparencia
body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

.fondo {
  display: grid;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #f59e0b, #db2777);
}

.caja {
  padding: 16px;
  font-weight: 600;
}

.con-alpha {
  background: rgb(255 255 255 / 0.5);
}

.con-opacity {
  background: white;
  opacity: 0.5;
}
```

- **Transparencia en el color** (`rgb(... / 0.5)`): solo afecta a esa propiedad, por ejemplo al fondo.
- **`opacity`**: afecta al elemento **entero**, con su texto y sus hijos.

Para un fondo semitransparente con texto encima, usa la transparencia en el color.

## currentColor: el color del texto

`currentColor` significa "el mismo color que el texto de este elemento". Es muy útil para bordes e iconos:

```css
.alerta {
  color: #b91c1c;
  border: 2px solid currentColor; /* el borde sale del mismo rojo */
}
```

Si mañana cambias el `color`, el borde cambia solo.

## Contraste: que se lea

Un color bonito no sirve si el texto no se lee. La regla de accesibilidad es que el **contraste** entre texto y fondo sea de al menos:

- **4.5 a 1** para texto normal.
- **3 a 1** para texto grande (unos 24px o más, o 19px en negrita).

No hace falta calcularlo a mano: las **DevTools** del navegador lo muestran al inspeccionar un texto (haz clic en el cuadradito del color), y hay webs como el [comprobador de contraste de WebAIM](https://webaim.org/resources/contrastchecker/).

El error más típico: texto gris claro sobre fondo blanco. Queda "elegante" pero mucha gente no lo lee bien, sobre todo en el móvil y al sol.

## ¿Cuál uso?

- **Hex**: cuando copias colores de un diseño (Figma te los da así).
- **rgb con `/`**: cuando necesitas transparencia.
- **hsl**: cuando construyes una paleta o variaciones de un color.

Y guarda tus colores en **variables CSS** (`--color-primario: #f59e0b`) para no repetirlos: tienes un post sobre eso.

## Errores comunes

- **Olvidar el `#`** en un hexadecimal: `color: f59e0b` no funciona.
- **Usar `opacity` para un fondo transparente** y que el texto también se desvanezca.
- **No comprobar el contraste.** Revísalo siempre en los textos pequeños.
- **Colores sueltos por todo el CSS.** Si el mismo hex aparece diez veces, va a una variable.

## Para profundizar

- [Valores de color en MDN](https://developer.mozilla.org/es/docs/Web/CSS/color_value)

En resumen: **hex** para copiar de un diseño, **rgb con `/`** para transparencias y **hsl** para crear paletas. Usa la transparencia en el color (no `opacity`) para fondos y comprueba siempre el **contraste**: 4.5 a 1 como mínimo.
