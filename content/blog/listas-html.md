---
title: 'Listas en HTML: ul, ol y dl (y por qué los menús son listas)'
description: 'Cuándo usar una lista con viñetas, una numerada o una de definiciones, cómo anidarlas y por qué casi todos los menús de navegación son un ul.'
date: 2026-11-26
series: html
tags: [HTML, Fundamentos, Accesibilidad]
draft: true
---

Las listas son de las etiquetas más usadas de HTML, y muchas veces sin que se note: los menús de navegación, las migas de pan, los pasos de una receta, las características de un producto o los comentarios de un post suelen ser listas por dentro.

HTML tiene tres tipos. Elegir bien no es solo cuestión de aspecto: un lector de pantalla anuncia "lista de 4 elementos", y eso ayuda muchísimo a entender la página.

## ul: lista sin orden (con viñetas)

**`<ul>`** (*unordered list*) es para elementos donde **el orden no importa**. Cada elemento va en un **`<li>`** (*list item*):

```html playground=ul
<h2>Ingredientes</h2>
<ul>
  <li>2 tazas de harina</li>
  <li>1 huevo</li>
  <li>1 taza de leche</li>
  <li>Una pizca de sal</li>
</ul>
```

Si cambias el orden de los ingredientes, la receta sigue siendo la misma. Eso es una `<ul>`.

## ol: lista ordenada (numerada)

**`<ol>`** (*ordered list*) es para elementos donde **el orden sí importa**: pasos, rankings, instrucciones.

```html playground=ol
<h2>Preparación</h2>
<ol>
  <li>Mezcla la harina con la sal.</li>
  <li>Añade el huevo y la leche.</li>
  <li>Bate hasta que no queden grumos.</li>
  <li>Cocina en una sartén caliente.</li>
</ol>

<h2>Top 3 del ranking</h2>
<ol reversed>
  <li>Bronce</li>
  <li>Plata</li>
  <li>Oro</li>
</ol>

<h2>Continúa desde el paso 5</h2>
<ol start="5">
  <li>Sirve con fruta.</li>
  <li>¡A comer!</li>
</ol>
```

`<ol>` tiene atributos útiles:

- **`start="5"`**: empieza a contar desde el 5.
- **`reversed`**: cuenta hacia atrás.
- **`type="a"`** o **`type="I"`**: usa letras (a, b, c) o números romanos (I, II, III).

La pregunta para elegir: **¿si cambio el orden, cambia el significado?** Si la respuesta es sí, `<ol>`. Si no, `<ul>`.

## Listas dentro de listas

Una lista puede tener otras listas dentro. La lista interior va **dentro del `<li>`**, no suelta:

```html playground=anidadas
<ul>
  <li>Frontend
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>
  </li>
  <li>Backend
    <ul>
      <li>Python</li>
      <li>Bases de datos</li>
    </ul>
  </li>
</ul>
```

Un error muy común es cerrar el `</li>` **antes** de la lista interior. Dentro de un `<ul>` u `<ol>` solo pueden ir `<li>` directamente.

## dl: lista de definiciones

**`<dl>`** (*description list*) es para pares **término y descripción**: un glosario, preguntas frecuentes, la ficha técnica de un producto.

```html playground=dl
<h2>Ficha técnica</h2>
<dl class="ficha">
  <dt>Pantalla</dt>
  <dd>6,1 pulgadas</dd>

  <dt>Batería</dt>
  <dd>4000 mAh</dd>

  <dt>Colores</dt>
  <dd>Negro</dd>
  <dd>Blanco</dd>
</dl>
```

```css playground=dl
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.ficha {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 8px 24px;
}

.ficha dt {
  font-weight: 600;
}

.ficha dd {
  margin: 0;
  grid-column: 2;
}
```

- **`<dt>`** es el término.
- **`<dd>`** es su descripción. Un término puede tener varias, como los colores.

Con un poco de Grid queda como una tabla de dos columnas, pero con el significado correcto.

## Los menús de navegación son listas

Un menú es, al fin y al cabo, una **lista de enlaces**. Por eso la estructura estándar es esta:

```html playground=menu
<nav aria-label="Principal">
  <ul class="menu">
    <li><a href="#">Inicio</a></li>
    <li><a href="#">Cursos</a></li>
    <li><a href="#">Blog</a></li>
    <li><a href="#">Contacto</a></li>
  </ul>
</nav>
```

```css playground=menu
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.menu {
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none; /* quita las viñetas */
}

.menu a {
  display: block;
  padding: 8px 14px;
  border-radius: 8px;
  background: #f4f4f5;
  color: #18181b;
  text-decoration: none;
}

.menu a:hover {
  background: #e4e4e7;
}
```

Con `list-style: none` y Flexbox deja de parecer una lista, pero el lector de pantalla sigue anunciando "lista de 4 elementos": el usuario sabe cuántas opciones hay antes de recorrerlas.

## Dar estilo a las viñetas

```css
ul {
  list-style-type: square;  /* disc (por defecto), circle, square, none */
}

ol {
  list-style-type: upper-roman; /* I, II, III */
}

li::marker {
  color: #f59e0b;  /* el color de la viñeta o el número */
}
```

Una cosa a saber: en Safari, una lista con `list-style: none` puede dejar de anunciarse como lista en el lector de pantalla. Si en tu caso importa, añade `role="list"` al `<ul>`.

## Errores comunes

- **Poner otra cosa que no sea `<li>` directamente dentro de un `<ul>` u `<ol>`.** Ni `<div>`, ni `<p>`, ni texto suelto.
- **Usar `<br>` para simular una lista.** Pierdes el significado y el estilo.
- **Anidar mal**: la lista interior va dentro del `<li>`, antes de su cierre.
- **Usar `<ol>` por cómo se ve** (porque quieres números). Si el orden no importa, es una `<ul>`; los números se pueden poner con CSS.

## Para profundizar

- [`<ul>` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Element/ul)
- [`<ol>` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Element/ol)
- [`<dl>` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Element/dl)

En resumen: **`<ul>`** si el orden no importa, **`<ol>`** si importa y **`<dl>`** para pares de término y descripción. Dentro solo van **`<li>`** (o `<dt>`/`<dd>`), y los menús de navegación son **listas de enlaces** dentro de un `<nav>`.
