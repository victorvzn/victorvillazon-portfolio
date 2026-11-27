---
title: 'Anatomía de un documento HTML: tu primera página, línea por línea'
description: 'Qué significa cada línea del esqueleto de una página web: doctype, html lang, head, body. Cómo lee el navegador tu HTML y cómo crear tu primer archivo.'
date: 2026-11-26
series: html
tags: [HTML, Fundamentos]
draft: false
---

Toda página web, desde un blog personal hasta YouTube, empieza con el mismo **esqueleto** de HTML. Cuando eres nuevo, ese bloque de líneas parece un conjuro que copias sin entender. Hoy vamos a ver qué significa cada línea, para que nunca más sea magia.

## ¿Qué es HTML?

**HTML** (*HyperText Markup Language*) no es un lenguaje de programación: es un lenguaje de **marcado**. No da órdenes ni hace cálculos; **describe** el contenido. Le dice al navegador "esto es un título", "esto es un párrafo", "esto es una imagen".

Se escribe con **etiquetas** entre `< >`:

```html
<p>Esto es un párrafo.</p>
```

- `<p>` es la **etiqueta de apertura**.
- `</p>` es la **etiqueta de cierre** (con la barra `/`).
- Lo de dentro es el **contenido**.
- Todo junto es un **elemento**.

Algunas etiquetas no tienen contenido ni cierre, como `<img>` o `<br>`. Se llaman **elementos vacíos**.

Y las etiquetas pueden llevar **atributos**, que dan información extra. Siempre van en la etiqueta de apertura, con la forma `nombre="valor"`:

```html
<a href="https://developer.mozilla.org">Ir a MDN</a>
```

## El esqueleto completo

Este es el punto de partida de cualquier página:

```html playground=esqueleto
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mi primera página</title>
  </head>
  <body>
    <h1>¡Hola, mundo!</h1>
    <p>Esta es mi primera página web.</p>
  </body>
</html>
```

Vamos línea por línea.

### `<!doctype html>`

Le dice al navegador: "este documento es **HTML moderno**". No es una etiqueta, es una declaración. Sin ella, el navegador entra en el llamado **modo quirks** (modo de compatibilidad con webs de los años 90) y algunos estilos se comportan de forma rara. Va siempre en la primera línea.

### `<html lang="es">`

El **elemento raíz**: todo lo demás va dentro de él. El atributo `lang` dice en qué **idioma** está el contenido, y es más importante de lo que parece:

- Los **lectores de pantalla** lo usan para pronunciar bien. Sin él, podrían leer tu texto en español con acento inglés.
- Los **traductores automáticos** y los buscadores saben en qué idioma está.

Usa `es` para español o algo más concreto si quieres, como `es-PE` (Perú) o `es-MX` (México).

### `<head>`: la información que no se ve

Dentro del `<head>` va la información **sobre** la página: su título, su codificación, los archivos CSS que usa... Nada de lo que pongas aquí aparece en la página. Lo mínimo:

- **`<meta charset="utf-8">`**: la **codificación de caracteres**. Sin ella, las tildes y la ñ pueden verse como `Ã±` o `ï¿½`. Ponla siempre la primera dentro del `<head>`.
- **`<meta name="viewport" ...>`**: imprescindible para que la página se vea bien en el **móvil**. Sin ella, el móvil muestra la página como si fuera un ordenador, en miniatura. Es la base de cualquier diseño responsive.
- **`<title>`**: el texto que aparece en la **pestaña del navegador** y como título en los resultados de Google. Cada página debe tener uno distinto y descriptivo.

En el post del `<head>` y las meta tags vemos todo lo demás que puede ir aquí (descripción, favicon, imagen para compartir en redes...).

### `<body>`: lo que se ve

Todo lo que el usuario ve va dentro del `<body>`: textos, imágenes, enlaces, botones. Solo hay un `<body>` por página.

## Anidar: cajas dentro de cajas

Los elementos se meten unos dentro de otros. Al elemento de fuera se le llama **padre** y a los de dentro, **hijos**:

```html
<body>
  <article>
    <h2>Título del artículo</h2>
    <p>Un párrafo con un <strong>texto importante</strong> dentro.</p>
  </article>
</body>
```

La regla de oro: **lo último que abres es lo primero que cierras**. Como unas muñecas rusas.

```html
<!-- ❌ Mal: se cruzan -->
<p>Texto <strong>importante</p></strong>

<!-- ✅ Bien -->
<p>Texto <strong>importante</strong></p>
```

La **sangría** (los espacios al principio de las líneas) no cambia nada para el navegador, pero te ayuda a ti a ver quién está dentro de quién. Úsala siempre.

## Comentarios

Lo que escribas entre `<!--` y `-->` el navegador lo ignora. Sirve para dejarte notas:

```html
<!-- Aquí irá el menú de navegación -->
```

Ojo: los comentarios **sí** se ven si alguien mira el código fuente de tu página. No escribas nada privado en ellos.

## Cómo lee el navegador tu HTML

Cuando abres una página, el navegador:

1. **Descarga** el archivo HTML.
2. Lo **lee de arriba a abajo** y construye un árbol con todos los elementos (el **DOM**, que usarás mucho con JavaScript).
3. Cuando encuentra un `<link>` a un CSS, lo descarga y aplica los estilos.
4. **Pinta** la página en la pantalla.

Una consecuencia curiosa: el navegador es **muy tolerante**. Si olvidas cerrar una etiqueta, intenta adivinar qué querías. Eso parece bueno, pero esconde errores que luego dan problemas raros. Por eso conviene validar tu HTML (tienes un post sobre eso).

## Crea tu primera página en tu ordenador

1. Crea una carpeta llamada `mi-web`.
2. Ábrela en **VS Code** (o el editor que uses).
3. Crea un archivo llamado **`index.html`**. Se llama así porque los servidores lo buscan por defecto como página principal.
4. **Atajo de VS Code:** escribe `!` y pulsa `Tab`. Te genera el esqueleto completo. (Cambia `lang="en"` por `lang="es"`).
5. Escribe algo dentro del `<body>`, guarda y haz doble clic en el archivo: se abre en tu navegador.

Cada vez que cambies algo, **guarda** y **recarga** el navegador (`F5`). Si instalas la extensión **Live Server** en VS Code, la página se recarga sola al guardar.

## Tu turno

Crea una página sobre ti con:

```html playground=ejercicio
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sobre mí</title>
  </head>
  <body>
    <!-- 1. Un título principal con tu nombre (h1) -->
    <!-- 2. Un párrafo que diga a qué te dedicas o qué estás aprendiendo -->
    <!-- 3. Un enlace a tu GitHub o a tu web favorita -->
  </body>
</html>
```

## Errores comunes

- **Olvidar el `<!doctype html>`.** La página entra en modo quirks y el CSS se comporta raro.
- **Olvidar `<meta charset="utf-8">`.** Las tildes y la ñ se ven mal.
- **Olvidar la meta `viewport`.** La página se ve diminuta en el móvil.
- **Poner contenido visible en el `<head>`.** Va en el `<body>`.
- **Cruzar etiquetas** (`<p><strong></p></strong>`). Cierra primero la última que abriste.
- **Llamar al archivo `Index.HTML` o `inicio.html`.** Usa `index.html`, en minúsculas.

## Para profundizar

- [Introducción a HTML en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax)
- [`<!doctype>` en MDN](https://developer.mozilla.org/es/docs/Glossary/Doctype)

En resumen: toda página empieza con **`<!doctype html>`**, un **`<html lang="es">`** que lo envuelve todo, un **`<head>`** con la información que no se ve (`charset`, `viewport` y `title` como mínimo) y un **`<body>`** con todo lo que sí se ve. Las etiquetas se anidan como muñecas rusas: la última que abres es la primera que cierras.
