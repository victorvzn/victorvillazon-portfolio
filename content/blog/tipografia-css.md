---
title: 'Tipografía en CSS: fuentes, tamaños y textos que se leen bien'
description: 'Cómo elegir y cargar una fuente (también de Google Fonts), qué tamaño usar, por qué line-height importa tanto y el truco del ancho de línea.'
date: 2026-11-26
series: css
tags: [CSS, Fundamentos, Diseño]
draft: true
---

La mayor parte de una web es **texto**. Una buena tipografía no se nota: simplemente lees sin esfuerzo. Una mala hace que la gente abandone la página sin saber por qué. Con cinco propiedades de CSS se nota muchísimo la diferencia.

## font-family: qué fuente usar

```css
body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

Se escribe una **lista** de fuentes separadas por comas. El navegador usa la primera que tenga disponible y, si no, pasa a la siguiente. Siempre termina con una **familia genérica**:

- `sans-serif`: sin remates, como Arial. Lo más usado en pantallas.
- `serif`: con remates, como Times New Roman. Para textos más clásicos.
- `monospace`: todas las letras miden lo mismo. Para código.

`system-ui` usa la fuente del sistema operativo del usuario (San Francisco en Mac, Segoe UI en Windows, Roboto en Android). Carga al instante porque ya está instalada.

Los nombres con espacios van entre comillas: `'Open Sans'`.

## Cargar una fuente de Google Fonts

[Google Fonts](https://fonts.google.com) tiene cientos de fuentes gratuitas. Eliges una, marcas los grosores que necesitas y te da un código como este para el `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

Y luego la usas en tu CSS:

```css
body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

Dos consejos:

- **Carga solo los grosores que uses.** Cada grosor es un archivo más que descargar. Normalmente bastan dos o tres (400, 600 y 700).
- **`display=swap`** (ya viene en la URL) hace que el texto se muestre al instante con una fuente del sistema y se cambie cuando la tuya termine de cargar. Así nadie ve una página en blanco.

## font-size: el tamaño

Para el texto de lectura, **16px es el mínimo** en pantalla. Por debajo cuesta leer en el móvil.

Mejor que en `px`, escribe los tamaños en **`rem`**: `1rem` es el tamaño de letra que el usuario eligió en su navegador (16px por defecto). Si alguien con problemas de visión sube ese tamaño, tu web lo respeta:

```css
body { font-size: 1rem; }      /* 16px por defecto */
h1 { font-size: 2.5rem; }      /* 40px */
h2 { font-size: 1.75rem; }     /* 28px */
small { font-size: 0.875rem; } /* 14px */
```

Tienes más detalle en el post de unidades CSS.

## line-height: el aire entre líneas

Es la propiedad que más mejora la lectura y la que más se olvida. Controla la **altura de cada línea**:

```html playground=line-height
<p class="apretado">Con line-height: 1 las líneas casi se tocan. Leer un párrafo largo así cansa mucho la vista, porque al terminar una línea cuesta encontrar el principio de la siguiente.</p>

<p class="comodo">Con line-height: 1.6 hay aire entre las líneas. El ojo salta con facilidad de una línea a la siguiente y el párrafo se lee sin esfuerzo.</p>
```

```css playground=line-height
body {
  font-family: system-ui, sans-serif;
  max-width: 480px;
  padding: 16px;
}

.apretado {
  line-height: 1;
  background: #fee2e2;
}

.comodo {
  line-height: 1.6;
  background: #dcfce7;
}
```

Escríbelo **sin unidades** (`1.6`, no `1.6px` ni `1.6em`): así es proporcional al tamaño de letra de cada elemento. Valores recomendados:

- **Párrafos**: entre `1.5` y `1.7`.
- **Títulos**: más apretado, entre `1.1` y `1.3`, porque son grandes y van en pocas líneas.

## El ancho de línea: no más de 75 caracteres

Una línea demasiado larga es difícil de seguir. Lo ideal son entre **45 y 75 caracteres** por línea. Con la unidad **`ch`** (el ancho de un carácter) es facilísimo:

```css
.articulo p {
  max-width: 65ch;
}
```

Es la razón por la que los blogs y periódicos tienen columnas de texto estrechas aunque la pantalla sea enorme.

## font-weight y otras propiedades útiles

```css
h1 {
  font-weight: 700;        /* grosor: 400 normal, 600 seminegrita, 700 negrita */
  letter-spacing: -0.02em; /* espacio entre letras: los títulos grandes quedan mejor algo apretados */
}

.etiqueta {
  text-transform: uppercase; /* MAYÚSCULAS sin cambiar el HTML */
  letter-spacing: 0.08em;    /* las mayúsculas necesitan algo más de espacio */
}

.centrado {
  text-align: center;
}
```

Usa `text-transform: uppercase` en vez de escribir el texto en mayúsculas en el HTML: algunos lectores de pantalla deletrean letra por letra las palabras en mayúsculas.

## Una base que funciona

Si no sabes por dónde empezar, esta base sirve para casi cualquier proyecto:

```html playground=base
<article>
  <h1>Un título que se lee bien</h1>
  <p>Este párrafo usa una fuente del sistema, 1rem de tamaño, un interlineado de 1.6 y un ancho máximo de 65 caracteres. Son cuatro líneas de CSS y la diferencia con los valores por defecto del navegador es enorme.</p>
  <p>Prueba a cambiar el line-height o el max-width en el playground para ver cómo afecta a la lectura.</p>
</article>
```

```css playground=base
body {
  margin: 0;
  padding: 24px;
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #27272a;
}

article {
  max-width: 65ch;
  margin: 0 auto;
}

h1 {
  font-size: 2.25rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #09090b;
}
```

## Errores comunes

- **Demasiadas fuentes.** Con una (o dos: una para títulos y otra para texto) es suficiente.
- **Texto por debajo de 16px** en párrafos.
- **Olvidar el `line-height`.** El valor por defecto (alrededor de 1.2) es demasiado apretado para leer párrafos.
- **Líneas kilométricas** en pantallas grandes. Ponle un `max-width` en `ch`.
- **No poner una fuente de respaldo.** Si tu fuente no carga, el navegador usará Times New Roman.

## Para profundizar

- [Estilizar texto y fuentes, en MDN](https://developer.mozilla.org/es/docs/Learn/CSS/Styling_text/Fundamentals)

En resumen: una **lista de fuentes** que termine en una genérica, tamaños en **`rem`** (mínimo 16px), **`line-height` de 1.5 a 1.7** sin unidades y un **ancho de línea de unos 65ch**. Con eso, cualquier texto se lee bien.
