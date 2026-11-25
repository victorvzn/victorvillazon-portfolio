---
title: 'Un modal sin JavaScript: solo HTML y CSS'
description: 'Abre, cierra y anima un modal con la etiqueta <dialog>, sin escribir una sola línea de JavaScript.'
date: 2026-11-24
series: html
tags: [HTML, CSS, Accesibilidad]
draft: false
# youtube: ID_DEL_VIDEO
---

Durante años, hacer un modal significaba escribir JavaScript: un `div` encima de todo, un `z-index` gigante, escuchar la tecla `Esc`, bloquear el scroll… y casi siempre se te olvidaba algo.

Hoy HTML trae su propio modal, la etiqueta `<dialog>`. Y con los atributos `command` y `commandfor` puedes abrirlo y cerrarlo **sin JavaScript**. Vamos paso a paso.

## El modal más simple

Necesitas dos piezas: el `<dialog>` con un `id`, y un botón que diga **qué hacer** (`command`) y **con quién** (`commandfor`).

```html playground=basico
<button commandfor="mi-modal" command="show-modal">Abrir modal</button>

<dialog id="mi-modal">
  <h2>¡Hola!</h2>
  <p>Este modal no usa nada de JavaScript.</p>
  <button commandfor="mi-modal" command="close">Cerrar</button>
</dialog>
```

```css playground=basico
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}
```

Fíjate en todo lo que el navegador hace por ti:

- Lo pone **encima de todo**, sin pelear con `z-index`.
- Lo cierra con la tecla **`Esc`**.
- **Bloquea el resto de la página**: no puedes hacer clic ni tabular fuera del modal.
- Manda el **foco** dentro del modal al abrirlo y lo devuelve al botón al cerrarlo.

Eso último es accesibilidad que antes tenías que programar a mano.

## Darle estilo

Por defecto se ve bastante feo. Con unas pocas líneas de CSS queda listo para producción. La clave es `::backdrop`, el pseudo-elemento que pinta el fondo oscuro detrás del modal.

```html playground=estilos
<button class="btn" commandfor="mi-modal" command="show-modal">Ver oferta</button>

<dialog id="mi-modal" class="modal">
  <h2>20% de descuento</h2>
  <p>Solo por hoy, en todos los cursos de frontend.</p>
  <button class="btn" commandfor="mi-modal" command="close">Entendido</button>
</dialog>
```

```css playground=estilos
body {
  font-family: system-ui, sans-serif;
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  background: #f4f4f5;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #18181b;
  color: white;
  font: inherit;
  cursor: pointer;
}

.modal {
  width: min(400px, 100% - 32px);
  padding: 24px;
  border: none;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25);
}

.modal h2 {
  margin-top: 0;
}

/* El fondo detrás del modal */
.modal::backdrop {
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(3px);
}
```

`width: min(400px, 100% - 32px)` significa: "mide 400px, pero si la pantalla es pequeña deja 16px a cada lado". Así funciona bien en el celular sin media queries.

## Animarlo al abrir y cerrar

Un modal que aparece de golpe se siente brusco. Con `transition` y `@starting-style` (el estado "antes de aparecer") le das una entrada suave:

```html playground=animacion
<button class="btn" commandfor="mi-modal" command="show-modal">Abrir con animación</button>

<dialog id="mi-modal" class="modal">
  <h2>Mucho mejor</h2>
  <p>Entra deslizándose y sale con un fundido.</p>
  <button class="btn" commandfor="mi-modal" command="close">Cerrar</button>
</dialog>
```

```css playground=animacion
body {
  font-family: system-ui, sans-serif;
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  background: #f4f4f5;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #18181b;
  color: white;
  font: inherit;
  cursor: pointer;
}

.modal {
  width: min(400px, 100% - 32px);
  padding: 24px;
  border: none;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25);

  /* Estado cerrado */
  opacity: 0;
  translate: 0 20px;
  transition: opacity 0.25s, translate 0.25s, display 0.25s allow-discrete, overlay 0.25s allow-discrete;
}

/* Estado abierto */
.modal[open] {
  opacity: 1;
  translate: 0 0;
}

/* Desde dónde empieza la animación al abrir */
@starting-style {
  .modal[open] {
    opacity: 0;
    translate: 0 20px;
  }
}

.modal::backdrop {
  background: rgb(0 0 0 / 0.5);
}
```

¿Por qué `display ... allow-discrete`? Porque al cerrarse, el `<dialog>` pasa a `display: none` y eso normalmente corta la animación. `allow-discrete` le dice al navegador que espere a que termine el fundido. Si un navegador no lo entiende, simplemente no anima, pero el modal sigue funcionando.

## Un modal de confirmación

El caso más común: "¿Seguro que quieres eliminar esto?". Aquí usamos un `<form method="dialog">`. Cualquier botón de ese formulario **cierra el modal** sin recargar la página.

```html playground=confirmar
<button class="btn btn-danger" commandfor="confirmar" command="show-modal">Eliminar proyecto</button>

<dialog id="confirmar" class="modal">
  <form method="dialog">
    <h2>¿Eliminar proyecto?</h2>
    <p>Esta acción no se puede deshacer.</p>
    <div class="acciones">
      <button class="btn btn-secundario" value="cancelar">Cancelar</button>
      <button class="btn btn-danger" value="eliminar">Sí, eliminar</button>
    </div>
  </form>
</dialog>
```

```css playground=confirmar
body {
  font-family: system-ui, sans-serif;
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  background: #f4f4f5;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-secundario {
  background: #e4e4e7;
  color: #18181b;
}

.modal {
  width: min(400px, 100% - 32px);
  padding: 24px;
  border: none;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25);
}

.modal h2 {
  margin-top: 0;
}

.modal::backdrop {
  background: rgb(0 0 0 / 0.5);
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}
```

El `value` de cada botón no se ve, pero queda guardado en el modal. Cuando más adelante conectes esto con JavaScript, lo leerás para saber qué eligió el usuario. Por ahora, sin una línea de JS, ya tienes el modal completo.

## Errores que yo también cometí

- **Poner el atributo `open` a mano.** `<dialog open>` lo muestra, pero **no como modal**: sin fondo oscuro, sin `Esc` y sin bloquear la página. Ábrelo siempre con `command="show-modal"`.
- **No dejar una forma de cerrarlo.** `Esc` no existe en el celular. Pon siempre un botón visible para cerrar.
- **Quitarle el `padding` y el `border` y olvidar el `max-width`.** En pantallas pequeñas el modal se sale. Por eso usamos `min(400px, 100% - 32px)`.

## ¿Y en qué navegadores funciona?

`<dialog>` funciona en todos desde hace años. Los atributos `command` y `commandfor` son más nuevos: llegaron a Chrome, Edge, Firefox y Safari durante 2025. Si necesitas soportar navegadores viejos, ahí sí te tocará un poquito de JavaScript (`dialog.showModal()`), pero el HTML y el CSS de este post te sirven igual.

En resumen: **`<dialog>`** es el modal, **`command`/`commandfor`** lo abren y cierran, **`::backdrop`** pinta el fondo y **`@starting-style`** lo anima. Menos código, y más accesible que casi cualquier modal hecho a mano.
