---
title: 'Eventos de teclado: detecta qué tecla pulsa el usuario'
description: 'keydown, keyup, event.key y event.code explicados con tres mini proyectos: un detector de teclas, un contador de caracteres y atajos de teclado.'
date: 2026-11-26
series: javascript
tags: [JavaScript, DOM, Eventos]
draft: true
---

Ya sabes reaccionar a un clic. Pero muchas cosas pasan con el **teclado**: buscar mientras escribes, cerrar un modal con `Esc`, enviar con `Enter` o los atajos tipo `Ctrl + S`. Este post te enseña a escucharlo.

## Los dos eventos que importan

- **`keydown`**: se dispara al **pulsar** una tecla (y se repite si la mantienes pulsada).
- **`keyup`**: se dispara al **soltarla**.

En el 90 % de los casos vas a usar `keydown`.

## Proyecto 1: un detector de teclas

Pulsa cualquier tecla y la página te dice cuál fue:

```html playground=detector
<p>Pulsa cualquier tecla 👇</p>
<div class="tecla" id="tecla">—</div>
<p id="detalle"></p>
```

```css playground=detector
body {
  font-family: system-ui, sans-serif;
  text-align: center;
  padding: 32px;
}

.tecla {
  display: inline-grid;
  place-items: center;
  min-width: 120px;
  height: 120px;
  padding: 0 24px;
  border: 2px solid #18181b;
  border-radius: 16px;
  font-size: 40px;
  font-weight: 700;
}
```

```js playground=detector
const tecla = document.querySelector('#tecla')
const detalle = document.querySelector('#detalle')

document.addEventListener('keydown', (event) => {
  tecla.textContent = event.key === ' ' ? 'Espacio' : event.key
  detalle.textContent = `event.key: "${event.key}" · event.code: "${event.code}"`
})
```

El objeto `event` trae toda la información de lo que pasó. Las dos propiedades más útiles:

- **`event.key`**: el **carácter** que se escribió: `'a'`, `'A'`, `'Enter'`, `'Escape'`, `'ArrowUp'`...
- **`event.code`**: la **tecla física** del teclado: `'KeyA'`, `'Enter'`, `'Space'`...

Pulsa la `a` con y sin `Shift`: `key` cambia (`a` / `A`), pero `code` es siempre `KeyA`. Para casi todo usarás `key`.

## Proyecto 2: contador de caracteres

Un clásico de cualquier formulario con límite, como los comentarios o las biografías:

```html playground=contador
<label for="bio">Tu biografía</label>
<textarea id="bio" maxlength="140" rows="4"></textarea>
<p id="restantes">140 caracteres restantes</p>
```

```css playground=contador
body {
  font-family: system-ui, sans-serif;
  display: grid;
  gap: 8px;
  max-width: 360px;
  padding: 24px;
}

textarea {
  font: inherit;
  padding: 8px;
}

.alerta {
  color: #dc2626;
  font-weight: 600;
}
```

```js playground=contador
const bio = document.querySelector('#bio')
const restantes = document.querySelector('#restantes')
const LIMITE = 140

bio.addEventListener('input', () => {
  const quedan = LIMITE - bio.value.length
  restantes.textContent = `${quedan} caracteres restantes`
  restantes.classList.toggle('alerta', quedan <= 20)
})
```

Aquí usamos el evento **`input`** en vez de `keydown`. ¿Por qué? Porque `input` se dispara **cada vez que cambia el contenido**, también si el usuario pega texto con el ratón o usa el dictado del móvil. Para "reaccionar a lo que hay escrito", `input` es la opción correcta.

`classList.toggle('alerta', condicion)` añade la clase si la condición es `true` y la quita si es `false`.

## Proyecto 3: atajos de teclado

Mueve una caja con las flechas y vuelve al centro con `Esc`:

```html playground=atajos
<p>Usa las flechas para mover la caja. <kbd>Esc</kbd> la devuelve al centro.</p>
<div class="zona">
  <div class="caja" id="caja"></div>
</div>
```

```css playground=atajos
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.zona {
  position: relative;
  height: 240px;
  border: 1px dashed #a1a1aa;
  border-radius: 12px;
  overflow: hidden;
}

.caja {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f59e0b;
  transform: translate(-50%, -50%);
  transition: transform 100ms;
}
```

```js playground=atajos
const caja = document.querySelector('#caja')
let x = 0
let y = 0
const PASO = 20

const movimientos = {
  ArrowUp: () => { y -= PASO },
  ArrowDown: () => { y += PASO },
  ArrowLeft: () => { x -= PASO },
  ArrowRight: () => { x += PASO },
  Escape: () => { x = 0; y = 0 }
}

document.addEventListener('keydown', (event) => {
  const mover = movimientos[event.key]
  if (!mover) return // otra tecla: no hacemos nada

  event.preventDefault() // evita que las flechas hagan scroll en la página
  mover()
  caja.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
})
```

Dos ideas que vas a reutilizar:

- **Un objeto como "mapa" de teclas.** En vez de cinco `if`, cada tecla apunta a su función. Añadir un atajo nuevo es añadir una línea.
- **`event.preventDefault()`** cancela lo que el navegador haría por defecto con esa tecla. Sin él, las flechas también moverían la página.

## Combinaciones: Ctrl, Shift y Alt

El evento te dice si había teclas modificadoras pulsadas con `event.ctrlKey`, `event.shiftKey`, `event.altKey` y `event.metaKey` (la tecla ⌘ en Mac):

```js
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault() // evita el "Guardar página" del navegador
    console.log('Guardando tu documento...')
  }
})
```

## Errores comunes

- **Usar `keydown` para leer lo que hay en un input.** Cuando se dispara `keydown`, la letra **todavía no** se ha escrito. Usa `input`.
- **Comparar con mayúsculas o minúsculas equivocadas.** `event.key` es `'Enter'`, `'Escape'` y `'ArrowUp'`, con mayúscula inicial. Una letra con `Shift` llega en mayúscula.
- **Atajos que pisan la escritura.** Si escuchas la tecla `/` en todo el documento, el usuario no podrá escribirla en un input. Comprueba antes si está escribiendo: `if (event.target.tagName === 'INPUT') return`.
- **Usar el viejo `keyCode`.** Verás `event.keyCode === 13` en tutoriales antiguos. Está obsoleto: usa `event.key === 'Enter'`.

## Para profundizar

- [`KeyboardEvent.key` en MDN](https://developer.mozilla.org/es/docs/Web/API/KeyboardEvent/key)
- [El evento `input` en MDN](https://developer.mozilla.org/es/docs/Web/API/Element/input_event)

En resumen: **`keydown`** para reaccionar a una tecla, **`event.key`** para saber cuál fue, **`input`** para reaccionar a lo que hay escrito y **`preventDefault()`** para que el navegador no haga lo suyo.
