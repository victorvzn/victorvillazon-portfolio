---
title: 'Valida tu HTML: encuentra los errores que el navegador esconde'
description: 'El navegador perdona casi todo, y eso esconde errores. Cómo usar el validador del W3C, entender sus mensajes y corregir los fallos más típicos de un junior.'
date: 2026-11-26
series: html
tags: [HTML, Fundamentos, Herramientas]
draft: true
---

Escribe un HTML con una etiqueta sin cerrar, un `id` repetido o un `<li>` fuera de su lista. Ábrelo en el navegador. ¿Qué pasa? **Nada**: se ve bien.

Los navegadores son **muy tolerantes**. Si encuentran un error, intentan adivinar qué querías y siguen adelante. Eso parece una ventaja, pero tiene un precio: los errores quedan **escondidos** y aparecen después como bugs extraños. Un estilo que no se aplica en un navegador. Un `querySelector` que coge el elemento equivocado. Un lector de pantalla que lee algo sin sentido.

La solución es **validar** tu HTML.

## ¿Qué es validar?

**Validar** es pasar tu HTML por una herramienta que comprueba que sigue las **reglas oficiales** del lenguaje: que las etiquetas estén bien cerradas, que cada una esté donde puede estar, que los atributos sean correctos.

La herramienta oficial es el **validador del W3C** (el W3C es el consorcio que publica los estándares de la web): [validator.w3.org/nu](https://validator.w3.org/nu/). Es gratis y no hace falta registrarse.

## Tres formas de usarlo

1. **Por URL** (*Check by address*): si tu web ya está publicada, pega la dirección.
2. **Subiendo el archivo** (*Check by file upload*).
3. **Pegando el código** (*Check by text input*): copia tu HTML y pégalo. Es la más rápida mientras trabajas.

Pulsa **Check** y verás una lista de mensajes:

- **Error** (en rojo): algo que incumple las reglas. Hay que corregirlo.
- **Warning** (advertencia, en amarillo): no es un error, pero probablemente es un descuido. Revísalo.
- **Info**: información, sin más.

Y si todo está bien: *"Document checking completed. No errors or warnings to show."* 🎉

## Los errores más típicos (y qué significan)

Vamos a validar este HTML lleno de errores típicos. Pégalo en el validador:

```html playground=errores
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Mi tienda</title>
  </head>
  <body>
    <h1>Bienvenidos</h1>

    <p>Nuestros productos <strong>más vendidos</p></strong>

    <li>Teclado</li>
    <li>Mouse</li>

    <img src="logo.png">

    <div id="contacto">Contacto</div>
    <div id="contacto">Escríbenos</div>

    <a href="#"><button>Ver ofertas</button></a>

    <p>
      <div>Un div dentro de un párrafo</div>
    </p>
  </body>
</html>
```

El validador te dará errores como estos. Así se interpretan y se arreglan:

### "End tag `p` seen, but there were open elements"

Etiquetas **cruzadas**: abriste `<p>` y luego `<strong>`, pero cerraste primero el `</p>`. La última que abres es la primera que cierras:

```html
<p>Nuestros productos <strong>más vendidos</strong></p>
```

### "Element `li` not allowed as child of element `body`"

Un `<li>` solo puede estar dentro de una lista (`<ul>` u `<ol>`):

```html
<ul>
  <li>Teclado</li>
  <li>Mouse</li>
</ul>
```

### "An `img` element must have an `alt` attribute"

Toda imagen necesita su texto alternativo (o `alt=""` si es decorativa). Lo vimos a fondo en el post del texto alternativo:

```html
<img src="logo.png" alt="Logo de Mi Tienda">
```

### "Duplicate ID `contacto`"

Un `id` debe ser **único** en toda la página. Si hay dos iguales, `querySelector('#contacto')` solo encontrará el primero, y los enlaces `#contacto` irán a uno cualquiera. Si quieres marcar varios elementos, usa una **clase**.

### "The element `button` must not appear as a descendant of the `a` element"

No puedes meter un elemento interactivo dentro de otro (un botón dentro de un enlace, un enlace dentro de un botón). ¿Lleva a otra página? Es un **enlace**, y le das aspecto de botón con CSS:

```html
<a href="/ofertas" class="boton">Ver ofertas</a>
```

### "No `p` element in scope but a `p` end tag seen"

Un `<p>` **no puede contener bloques** como `<div>`, `<ul>` o `<h2>`. El navegador cierra el párrafo automáticamente al ver el `<div>`, y el `</p>` del final se queda huérfano. Usa un `<div>` como contenedor, o pon el texto en el `<p>` y el resto fuera.

### Warning: "Consider adding a `lang` attribute to the `html` start tag"

Si olvidas el `lang`, te lo recuerda (y es importante para los lectores de pantalla, como vimos en el post de la anatomía de un documento).

## Valida mientras programas

Copiar y pegar en la web del W3C cada vez es incómodo. Algunas opciones para tenerlo más a mano:

- **Extensiones de VS Code**: busca "HTMLHint" o "W3C Web Validator" en el panel de extensiones. Te subrayan los errores mientras escribes, como un corrector ortográfico.
- **Lighthouse** (en las DevTools de Chrome) no es un validador, pero detecta muchos de los problemas que más importan: imágenes sin `alt`, `id` duplicados, falta de `lang`...

## ¿Tiene que salir todo perfecto?

Un HTML válido es una **base sólida**, pero no lo es todo:

- **Validar no comprueba la accesibilidad completa.** Un HTML válido puede usar `<div>` para todo y ser muy difícil de usar con un lector de pantalla.
- **Validar no comprueba la semántica.** Que `<h1>` y `<h4>` sean válidos no significa que estén bien elegidos.
- **Algunas advertencias son discutibles.** Léelas y decide.

Piensa en el validador como el **corrector ortográfico** de tu HTML: no te dice si tu texto es bueno, pero te avisa de las faltas.

## Tu turno

1. Pega el HTML del ejemplo en [validator.w3.org/nu](https://validator.w3.org/nu/#textarea) y corrige todos los errores hasta que no quede ninguno.
2. Valida tu portafolio o tu último proyecto publicado. ¿Cuántos errores tiene?

## Errores comunes

- **Pensar que "si se ve bien, está bien".** El navegador esconde los errores.
- **Ignorar los warnings.** Muchos avisan de problemas reales (como la falta de `lang`).
- **Corregir solo el primer error.** A veces un error provoca varios más en cascada: corrige el primero, vuelve a validar y repite.
- **Validar una sola vez al final.** Valida mientras construyes; es más fácil corregir pocos errores que cincuenta.

## Para profundizar

- [El validador del W3C](https://validator.w3.org/nu/)
- [Depurar HTML en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML)

En resumen: el navegador **perdona tus errores** y los esconde. **Valida tu HTML** con [validator.w3.org/nu](https://validator.w3.org/nu/) para encontrar etiquetas cruzadas, elementos fuera de su sitio, `alt` olvidados e `id` repetidos. Corrige los errores, revisa los warnings y repite hasta que salga limpio. Es el corrector ortográfico de tu HTML.
