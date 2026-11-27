---
title: 'HTML semántico: deja de usar div para todo'
description: 'header, nav, main, article, footer: qué significa cada uno, por qué importa y cómo rehacer una página llena de divs.'
date: 2026-11-27
series: html
tags: [HTML, Accesibilidad, Fundamentos]
draft: false
order: 6
---

Si tu HTML se parece a esto, no estás solo. Así empezamos casi todos:

```html
<div class="header">
  <div class="menu">...</div>
</div>
<div class="contenido">
  <div class="post">...</div>
</div>
<div class="footer">...</div>
```

Funciona y se ve bien. Pero para Google, para un lector de pantalla o para el próximo programador que lea tu código, todo es lo mismo: **cajas sin significado**.

## ¿Qué es "semántico"?

Semántico quiere decir **"que tiene significado"**. Una etiqueta semántica no solo agrupa cosas: dice **qué es** lo que hay adentro.

- `<header>`: la cabecera (logo, título, menú).
- `<nav>`: un grupo de enlaces de navegación.
- `<main>`: el contenido principal. Solo uno por página.
- `<article>`: algo que tiene sentido por sí solo: un post, una tarjeta de producto, un comentario.
- `<section>`: una sección temática, normalmente con su propio título.
- `<aside>`: contenido secundario, como una barra lateral.
- `<footer>`: el pie (contacto, derechos, enlaces).

## La misma página, bien hecha

```html playground=semantico
<header>
  <strong>Mi Blog</strong>
  <nav>
    <a href="#">Inicio</a>
    <a href="#">Artículos</a>
    <a href="#">Contacto</a>
  </nav>
</header>

<main>
  <article>
    <h1>Mi primer post</h1>
    <p>Hoy aprendí que el HTML semántico es importante.</p>
  </article>

  <aside>
    <h2>Sobre mí</h2>
    <p>Programador junior aprendiendo cada día.</p>
  </aside>
</main>

<footer>
  <p>© 2026 Mi Blog</p>
</footer>
```

```css playground=semantico
body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

header,
footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  background: #18181b;
  color: white;
}

nav {
  display: flex;
  gap: 16px;
}

nav a {
  color: white;
}

main {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 24px;
}

article {
  flex: 1 1 300px;
}

aside {
  flex: 0 1 220px;
  padding: 16px;
  border-radius: 12px;
  background: #f4f4f5;
}
```

Visualmente es lo mismo que con `div`. La diferencia está en lo que **no se ve**.

## ¿Por qué importa si se ve igual?

1. **Accesibilidad.** Una persona que usa lector de pantalla puede saltar directo al `<main>` o al `<nav>`. Con `div` tiene que escuchar toda la página.
2. **SEO.** Google entiende mejor qué es lo importante de tu página.
3. **Tu código se lee mejor.** `</article>` dice mucho más que `</div>` número 14.

## ¿Entonces nunca más uso div?

¡Sí lo usas! `<div>` sigue siendo perfecto cuando solo necesitas **agrupar cosas para darles estilo**, sin ningún significado especial. La regla:

> Primero busca una etiqueta que describa el contenido. Si ninguna encaja, usa `div`.

## Los títulos también son semánticos

`<h1>` a `<h6>` no son "tamaños de letra": son **niveles de importancia**, como el índice de un libro.

- Un solo `<h1>` por página: el título principal.
- No te saltes niveles: después de un `<h2>` viene un `<h3>`, no un `<h5>`.
- Si quieres un título más pequeño, cámbialo con CSS, no con otra etiqueta.

## Errores comunes

- **Usar `<section>` como si fuera un `div`.** Si esa sección no tendría un título, probablemente es un `div`.
- **Varios `<main>` en la misma página.** Solo uno.
- **Un botón hecho con `<div onclick>`.** Usa `<button>`: ya funciona con el teclado y se anuncia como botón.

## Para profundizar

- [Semántica en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)
- [Estructura de documentos y sitios web en MDN](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure)

En resumen: elige la etiqueta por **lo que es** el contenido, no por cómo se ve. El aspecto ya lo pone el CSS.
