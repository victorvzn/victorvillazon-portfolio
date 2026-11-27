---
title: 'Selectores CSS: aprende a apuntar a lo que quieres'
description: 'Clases, ids, descendientes, hijos, hermanos, pseudo-clases y :has(). Con un mini juego para practicar.'
date: 2026-11-27
series: css
tags: [CSS, Fundamentos]
draft: false
order: 11
---

Un selector es la parte del CSS que dice **a quién** le aplicas el estilo. Si dominas los selectores, escribes menos clases y tu HTML queda más limpio.

## Los básicos

```css
p { }           /* todos los <p> (selector de tipo) */
.tarjeta { }    /* los que tienen class="tarjeta" */
#menu { }       /* el que tiene id="menu" */
* { }           /* todos los elementos */
```

Usa sobre todo **clases**. Los `id` son únicos en la página y, como veremos en el post de especificidad, cuesta mucho sobrescribirlos.

## Combinar: la familia del HTML

El HTML es como un árbol genealógico: hay padres, hijos y hermanos. Los selectores combinados usan esa familia.

```css
.menu a { }      /* cualquier <a> DENTRO de .menu (descendiente, con espacio) */
.menu > a { }    /* solo los <a> HIJOS DIRECTOS de .menu */
h2 + p { }       /* el <p> que va JUSTO DESPUÉS de un <h2> */
h2 ~ p { }       /* todos los <p> hermanos que van después de un <h2> */
.btn.activo { }  /* un elemento con LAS DOS clases (sin espacio) */
```

Ese último es un clásico: `.btn.activo` (sin espacio) no es lo mismo que `.btn .activo` (con espacio). Un espacio cambia todo.

## Pseudo-clases: según el estado

Las pseudo-clases empiezan con `:` y seleccionan según **el estado** o **la posición**:

```html playground=pseudo
<ul class="lista">
  <li>Aprender HTML</li>
  <li>Aprender CSS</li>
  <li>Aprender JavaScript</li>
  <li>Aprender React</li>
</ul>

<a href="#">Pasa el mouse por aquí</a>
```

```css playground=pseudo
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.lista li:first-child {
  font-weight: bold;
}

.lista li:last-child {
  color: #a1a1aa;
}

.lista li:nth-child(even) {
  background: #f4f4f5;
}

/* Todos menos el último */
.lista li:not(:last-child) {
  border-bottom: 1px solid #e4e4e7;
}

a:hover {
  color: #dc2626;
}
```

## `:has()`, el selector "padre"

Durante años no había forma de decir "selecciona el padre **si contiene** algo". Ahora existe `:has()`:

```html playground=has
<article class="tarjeta">
  <h2>Sin imagen</h2>
  <p>Una tarjeta normal.</p>
</article>

<article class="tarjeta">
  <img src="https://placehold.co/300x120" alt="">
  <h2>Con imagen</h2>
  <p>Esta tiene borde porque contiene una imagen.</p>
</article>
```

```css playground=has
body {
  font-family: system-ui, sans-serif;
  display: flex;
  gap: 16px;
  padding: 24px;
}

.tarjeta {
  width: 300px;
  padding: 16px;
  border-radius: 12px;
  background: #f4f4f5;
}

/* Si la tarjeta TIENE una imagen, le ponemos borde */
.tarjeta:has(img) {
  border: 3px solid #f59e0b;
}

.tarjeta img {
  width: 100%;
  border-radius: 8px;
}
```

## Mini juego: ¿a quién selecciona?

Con este HTML:

```html
<nav class="menu">
  <a href="#">Inicio</a>
  <div><a href="#">Blog</a></div>
</nav>
```

1. `.menu a` → **Inicio y Blog** (los dos están dentro).
2. `.menu > a` → **solo Inicio** (Blog está dentro de un `div`).
3. `.menu a:first-child` → **Inicio y Blog** (cada uno es el primer hijo de su padre). ¿Te pillé?

## Errores comunes

- **Selectores larguísimos** como `body main .contenido ul li a`. Son frágiles: si cambias el HTML, se rompen. Usa una clase.
- **Confundir `.a.b` con `.a .b`.** Sin espacio: el mismo elemento. Con espacio: uno dentro del otro.
- **Olvidar el punto.** `tarjeta { }` busca una etiqueta `<tarjeta>`, que no existe.

## Para profundizar

- [Selectores CSS en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_selectors)
- [Pseudo-clases en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Pseudo-classes)
- [`:has()` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/:has)

En resumen: **clases** para casi todo, **espacio** para descendientes, **`>`** para hijos directos, **`:`** para estados, y **`:has()`** cuando necesitas mirar hacia adentro.
