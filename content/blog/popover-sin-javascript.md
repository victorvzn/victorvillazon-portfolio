---
title: 'Popover: menús y avisos flotantes sin JavaScript'
description: 'Con el atributo popover, HTML abre y cierra paneles flotantes por ti. Ideal para menús, avisos y notificaciones.'
date: 2026-11-25
series: html
tags: [HTML, CSS]
draft: true
order: 1
---

En el post del modal vimos `<dialog>`. Pero no todo lo que flota tiene que bloquear la página: un menú, un panel de notificaciones o un aviso solo necesitan **aparecer encima y cerrarse fácil**. Para eso existe el atributo `popover`.

## El popover más simple

Le pones `popover` y un `id` a cualquier elemento, y un botón con `popovertarget` que apunte a ese `id`. Listo.

```html playground=basico
<button popovertarget="ayuda">¿Necesitas ayuda?</button>

<div id="ayuda" popover>
  <p>Escríbenos a soporte@ejemplo.com</p>
</div>
```

```css playground=basico
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}
```

Haz clic en el botón y luego **haz clic fuera** o pulsa `Esc`: se cierra solo. A eso se le llama *light dismiss* (cierre ligero) y es lo que lo diferencia del modal.

## Popover o dialog: ¿cuál uso?

| | `popover` | `<dialog>` modal |
| --- | --- | --- |
| Bloquea la página | No | Sí |
| Se cierra al hacer clic fuera | Sí | No |
| Úsalo para | Menús, avisos, tooltips | Confirmaciones, formularios importantes |

Regla rápida: si el usuario **tiene que** responder, es un modal. Si solo es información de paso, es un popover.

## Un panel de notificaciones con estilo

Por defecto el popover aparece centrado. Con unas líneas de CSS lo mandamos a la esquina superior derecha:

```html playground=notificaciones
<header>
  <strong>MiApp</strong>
  <button class="btn" popovertarget="notis">🔔 3</button>
</header>

<div id="notis" class="panel" popover>
  <h2>Notificaciones</h2>
  <ul>
    <li>Ana comentó tu post</li>
    <li>Tienes un nuevo seguidor</li>
    <li>Tu pedido está en camino</li>
  </ul>
</div>
```

```css playground=notificaciones
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: #f4f4f5;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
}

.btn {
  padding: 8px 14px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  background: white;
  font: inherit;
  cursor: pointer;
}

.panel {
  /* Quitamos el centrado por defecto y lo pegamos arriba a la derecha */
  inset: auto;
  top: 72px;
  right: 24px;
  margin: 0;

  width: 260px;
  padding: 16px;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgb(0 0 0 / 0.12);
}

.panel h2 {
  margin: 0 0 8px;
  font-size: 16px;
}

.panel ul {
  margin: 0;
  padding-left: 18px;
}
```

La línea clave es `inset: auto`: borra la posición centrada que trae el navegador para que `top` y `right` funcionen.

## Un aviso que no se cierra solo

A veces no quieres que un clic fuera lo cierre, como en un aviso de cookies. Para eso está `popover="manual"`: solo se cierra con un botón.

```html playground=manual
<button popovertarget="cookies">Mostrar aviso</button>

<div id="cookies" class="aviso" popover="manual">
  <p>Usamos cookies para mejorar tu experiencia.</p>
  <button popovertarget="cookies" popovertargetaction="hide">Aceptar</button>
</div>
```

```css playground=manual
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.aviso {
  inset: auto 16px 16px 16px;
  margin: 0;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: #18181b;
  color: white;
}

.aviso p {
  margin: 0 0 12px;
}
```

`popovertargetaction` acepta tres valores: `toggle` (el de siempre), `show` y `hide`.

## Errores comunes

- **Olvidar el `id`.** `popovertarget` busca por `id`; si no coincide exacto, el botón no hace nada.
- **Pelear con `position` o `z-index`.** El popover ya vive en una capa por encima de todo (la *top layer*). No necesitas `z-index`.
- **Usarlo para algo importante.** Si se cierra con un clic fuera, el usuario puede perderlo. Para eso, `<dialog>`.

## Para profundizar

- [El atributo `popover` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover)
- [Popover API en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)

En resumen: **`popover`** convierte cualquier elemento en un panel flotante, **`popovertarget`** lo abre desde un botón y **`popover="manual"`** evita que se cierre solo.
