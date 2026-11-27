---
title: 'Etiquetas de texto en HTML: títulos, párrafos, strong, em y compañía'
description: 'h1 a h6 y su jerarquía, párrafos, strong vs b, em vs i, citas, código, abreviaturas y saltos de línea. Cuándo usar cada etiqueta de texto y por qué no es lo mismo que darle estilo.'
date: 2026-11-27
series: html
tags: [HTML, Fundamentos, Accesibilidad]
draft: false
---

La mayor parte de una web es **texto**: títulos, párrafos, listas, citas. HTML tiene una etiqueta para cada tipo de texto, y elegir la correcta no es una cuestión de estética: le dice al navegador, a Google y a los lectores de pantalla **qué es** cada cosa.

## La regla de oro

**HTML dice qué es el contenido. CSS dice cómo se ve.**

Que un texto sea grande y en negrita no lo convierte en un título. Y que algo sea un título no significa que tenga que verse enorme. Elige la etiqueta por **su significado**, y luego dale el aspecto que quieras con CSS.

## Títulos: `<h1>` a `<h6>`

Hay seis niveles de títulos, del más importante (`<h1>`) al menos (`<h6>`):

```html playground=titulos
<h1>Guía de viaje a Perú</h1>

<h2>Lima</h2>
<p>La capital, famosa por su gastronomía.</p>

<h3>Qué comer</h3>
<p>Ceviche, lomo saltado y anticuchos.</p>

<h3>Dónde alojarse</h3>
<p>Miraflores y Barranco son los barrios más elegidos.</p>

<h2>Cusco</h2>
<p>La puerta de entrada a Machu Picchu.</p>
```

Los títulos forman un **índice** de tu página, como el de un libro:

```
Guía de viaje a Perú (h1)
├── Lima (h2)
│   ├── Qué comer (h3)
│   └── Dónde alojarse (h3)
└── Cusco (h2)
```

Las reglas:

1. **Un solo `<h1>` por página**: el título principal, lo que es la página.
2. **No te saltes niveles**: después de un `<h2>` va un `<h3>`, no un `<h4>`. Igual que en un índice no pasas del capítulo 2 al apartado 2.1.1.
3. **No elijas el nivel por el tamaño.** Si un `<h3>` te parece grande, cámbiale el tamaño con CSS, pero no lo cambies por un `<h5>`.

¿Por qué importa? Los usuarios de **lectores de pantalla** navegan saltando de título en título, como quien hojea un libro: es la forma más rápida de encontrar algo. Y Google usa los títulos para entender de qué trata tu página.

## Párrafos: `<p>`

Cada bloque de texto va en su propio `<p>`:

```html
<p>Este es el primer párrafo.</p>
<p>Este es el segundo. El navegador añade un espacio entre los dos.</p>
```

Los espacios y saltos de línea que escribas **dentro** del HTML no se ven: el navegador los junta en un solo espacio. Para separar bloques, usa párrafos distintos, no `<br>` repetidos.

## Importancia y énfasis: `<strong>` y `<em>`

```html playground=enfasis
<p><strong>Atención:</strong> la oferta termina hoy.</p>
<p>No es que no quiera ir, es que <em>no puedo</em>.</p>
```

- **`<strong>`**: el texto es **importante**, serio o urgente. Se ve en negrita.
- **`<em>`** (*emphasis*): el texto se **pronuncia con énfasis**, cambiando el sentido de la frase. Se ve en cursiva.

Fíjate en la diferencia: "No es que no quiera ir, es que **no puedo**" no significa lo mismo que con el énfasis en otra palabra.

### ¿Y `<b>` e `<i>`?

También existen, y no están "prohibidos", pero significan otra cosa:

| Etiqueta | Significado | Ejemplo |
| --- | --- | --- |
| `<strong>` | Importante | Avisos, advertencias |
| `<b>` | Llamar la atención **sin** importancia extra | Palabras clave en un resumen, el nombre de un producto en una reseña |
| `<em>` | Énfasis al pronunciar | "Te dije que *no* lo tocaras" |
| `<i>` | Otra "voz": términos técnicos, palabras en otro idioma, pensamientos | El nombre científico *Felis catus*, una palabra en inglés como *frontend* |

En la duda: **`<strong>` y `<em>`** son los que usarás el 90 % de las veces. Y si solo quieres que algo se vea en negrita por diseño, usa CSS (`font-weight: 700`).

## Otras etiquetas de texto que conviene conocer

```html playground=otras
<p>Usa <code>console.log()</code> para ver valores en la consola.</p>

<p>Pulsa <kbd>Ctrl</kbd> + <kbd>C</kbd> para copiar.</p>

<p>La <abbr title="Organización Mundial de la Salud">OMS</abbr> recomienda dormir 8 horas.</p>

<p>Precio: <del>S/ 120</del> <ins>S/ 90</ins></p>

<p>Busca la palabra <mark>accesibilidad</mark> en el texto.</p>

<p>El agua es H<sub>2</sub>O y el área se mide en m<sup>2</sup>.</p>

<p><small>Precios con IGV incluido.</small></p>

<blockquote cite="https://es.wikipedia.org/wiki/Tim_Berners-Lee">
  <p>El poder de la web está en su universalidad.</p>
</blockquote>
<p>— Tim Berners-Lee</p>
```

| Etiqueta | Para |
| --- | --- |
| `<code>` | Código dentro de un texto |
| `<pre>` | Texto que respeta los espacios y saltos de línea (bloques de código) |
| `<kbd>` | Teclas que hay que pulsar |
| `<abbr title="...">` | Abreviaturas, con su significado completo |
| `<del>` / `<ins>` | Texto eliminado / añadido (precios rebajados, cambios) |
| `<mark>` | Texto resaltado, como con un rotulador (resultados de búsqueda) |
| `<sub>` / `<sup>` | Subíndice / superíndice |
| `<small>` | Letra pequeña: avisos legales, aclaraciones |
| `<blockquote>` | Una cita larga, en su propio bloque |
| `<q>` | Una cita corta, dentro de un párrafo (añade comillas) |
| `<time datetime="...">` | Fechas y horas, en un formato que entienden las máquinas |

## Saltos de línea y separadores

- **`<br>`**: un salto de línea **dentro** de un mismo bloque. Úsalo solo donde el salto sea parte del contenido: una dirección postal, los versos de un poema.
- **`<hr>`**: un **cambio de tema** dentro de una sección. Se ve como una línea horizontal.

```html
<address>
  Av. Larco 123<br>
  Miraflores, Lima<br>
  Perú
</address>
```

**No uses `<br>` para separar párrafos ni para dejar espacio.** El espacio se controla con `margin` en CSS.

## `<div>` y `<span>`: cuando no hay una etiqueta mejor

- **`<div>`**: un bloque genérico, sin significado. Para agrupar cosas y darles estilo.
- **`<span>`**: lo mismo, pero dentro de una línea de texto.

Son útiles, pero son el **último recurso**: antes de usar un `<div>`, pregúntate si hay una etiqueta con significado (`<article>`, `<section>`, `<nav>`... lo vimos en el post de HTML semántico).

## Tu turno

Convierte este texto plano en HTML con las etiquetas correctas:

```html playground=ejercicio
<!--
RECETA: CEVICHE CLÁSICO

Ingredientes
- 500 g de pescado blanco
- 10 limones
- 1 cebolla roja

Preparación
Corta el pescado en cubos. IMPORTANTE: el pescado debe ser fresco.
Exprime los limones (el jugo se llama "leche de tigre" cuando se mezcla con el pescado).

Nota: receta para 4 personas. Tiempo: 20 minutos.
-->
```

## Errores comunes

- **Elegir el título por su tamaño** (un `<h4>` porque "se ve mejor"). Elige por jerarquía y ajusta el tamaño con CSS.
- **Varios `<h1>`** o saltarse niveles.
- **Usar `<br><br>` para separar párrafos.** Usa `<p>`.
- **Usar `<strong>` para todo lo que quieres en negrita** por diseño. Si no es importante, usa CSS.
- **Usar `<blockquote>` solo para meter sangría.** Es para citas.
- **Textos sueltos sin etiqueta** dentro de un `<div>`. Mételos en un `<p>`.

## Para profundizar

- [Títulos y párrafos en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Structuring_content/Headings_and_paragraphs)
- [Énfasis e importancia en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Structuring_content/Emphasis_and_importance)
- [Formato de texto avanzado en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Structuring_content/Advanced_text_features)

En resumen: elige cada etiqueta por **lo que significa**, no por cómo se ve. Un **`<h1>`** por página y títulos **sin saltar niveles**; **`<p>`** para cada párrafo; **`<strong>`** para lo importante y **`<em>`** para el énfasis; y `<code>`, `<abbr>`, `<blockquote>` o `<time>` cuando el texto sea eso. El aspecto, siempre con CSS.
