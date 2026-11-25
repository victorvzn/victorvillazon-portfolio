---
title: 'Enlaces en HTML: lo que casi todos hacemos mal'
description: 'target="_blank", anclas a secciones, mailto, tel y descargas. Todo lo que puede hacer la etiqueta a.'
date: 2026-11-25
series: html
tags: [HTML, Fundamentos]
draft: true
order: 8
---

La etiqueta `<a>` parece la más fácil de HTML. Un `href`, un texto y listo. Pero tiene más trucos de los que crees, y un par de errores que se repiten muchísimo.

## Lo básico: rutas absolutas y relativas

```html
<!-- Absoluta: a otro sitio -->
<a href="https://developer.mozilla.org">MDN</a>

<!-- Relativa: dentro de tu propio sitio -->
<a href="/blog">Blog</a>
<a href="contacto.html">Contacto</a>
```

Usa absolutas para sitios externos y relativas para tus páginas. Si mañana cambias de dominio, las relativas siguen funcionando.

## Abrir en otra pestaña

`target="_blank"` abre el enlace en una pestaña nueva:

```html
<a href="https://github.com" target="_blank" rel="noopener noreferrer">Mi GitHub</a>
```

¿Y ese `rel`? `noopener` evita que la página nueva pueda controlar la tuya, y `noreferrer` no le cuenta de dónde vienes. Los navegadores modernos ya aplican `noopener` solos, pero ponerlo no cuesta nada.

**Úsalo con cuidado:** abrir pestañas sin avisar molesta. Resérvalo para enlaces externos o cuando el usuario perdería algo (por ejemplo, a mitad de un formulario).

## Saltar a una parte de la página

Si un elemento tiene `id`, puedes enlazarlo con `#`:

```html playground=anclas
<nav>
  <a href="#precios">Precios</a>
  <a href="#contacto">Contacto</a>
</nav>

<section id="precios">
  <h2>Precios</h2>
  <p>Desde S/ 29 al mes.</p>
</section>

<section id="contacto">
  <h2>Contacto</h2>
  <p>Escríbenos cuando quieras.</p>
  <a href="#">Volver arriba</a>
</section>
```

```css playground=anclas
html {
  scroll-behavior: smooth; /* el salto se hace con animación */
}

body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

nav {
  position: sticky;
  top: 0;
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #18181b;
}

nav a {
  color: white;
}

section {
  min-height: 90vh;
  padding: 24px;
}

#contacto {
  background: #f4f4f5;
}
```

Con `scroll-behavior: smooth` el salto se hace deslizando en vez de golpe. Así funciona el menú de esta misma web.

## Enlaces que no abren páginas

```html
<a href="mailto:hola@ejemplo.com">Escríbeme</a>
<a href="tel:+51999888777">Llámame</a>
<a href="/cv.pdf" download>Descargar mi CV</a>
```

- `mailto:` abre el programa de correo.
- `tel:` en el celular abre la llamada.
- `download` descarga el archivo en vez de abrirlo (solo funciona con archivos de tu mismo sitio).

## ¿Enlace o botón?

La confusión más común:

- **Enlace (`<a>`)**: te **lleva a otro lugar** (otra página, otra sección).
- **Botón (`<button>`)**: **hace algo** aquí (enviar, abrir un modal, dar "me gusta").

Un `<a href="#" onclick="...">` para hacer algo es un botón disfrazado. Usa `<button>`.

## Errores comunes

- **"Haz clic aquí".** Un lector de pantalla puede listar todos los enlaces; diez "clic aquí" no dicen nada. Escribe el destino: "Descarga la guía de CSS".
- **Olvidar el `https://`.** `href="google.com"` es una ruta relativa: te lleva a `tusitio.com/google.com`.
- **Quitar el subrayado sin dar otra pista.** Si el enlace no se distingue del texto normal, nadie sabe que se puede hacer clic.

## Para profundizar

- [`<a>` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Element/a)
- [Crear hipervínculos en MDN](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks)

En resumen: **`href`** dice a dónde ir, **`#id`** salta dentro de la página, **`target="_blank"`** solo cuando hace falta, y si **hace algo** en vez de llevarte a algún sitio, es un `<button>`.
