---
title: 'Formularios con JavaScript: leer datos, validar y mostrar errores'
description: 'Escucha el submit, lee todos los campos de una vez con FormData, añade validaciones propias con setCustomValidity y muestra los errores de forma accesible.'
date: 2026-11-26
series: javascript
tags: [JavaScript, DOM, Formularios]
draft: true
---

En el post de formularios con HTML vimos que el navegador valida muchas cosas solo: campos obligatorios, emails, longitudes mínimas. Pero tarde o temprano necesitarás JavaScript para **leer los datos**, comprobar cosas que HTML no sabe (que dos contraseñas coincidan) y **hacer algo** con ellos: enviarlos a una API o mostrarlos en pantalla.

## Paso 1: escuchar el submit

Escucha el evento **`submit` del formulario**, no el `click` del botón:

```html playground=submit
<form id="contacto">
  <label for="nombre">Nombre</label>
  <input id="nombre" name="nombre" required>
  <button>Enviar</button>
</form>
<p id="salida"></p>
```

```js playground=submit
const formulario = document.querySelector('#contacto')
const salida = document.querySelector('#salida')

formulario.addEventListener('submit', (event) => {
  event.preventDefault() // evita que la página se recargue

  const nombre = formulario.elements.nombre.value.trim()
  salida.textContent = `¡Gracias, ${nombre}! Recibimos tu mensaje.`
  formulario.reset() // vacía los campos
})
```

¿Por qué `submit` y no `click`?

- Funciona también al pulsar **`Enter`** dentro de un campo.
- **Solo se dispara si la validación de HTML pasa.** Si un campo `required` está vacío, el navegador muestra su aviso y tu código ni se ejecuta.

`event.preventDefault()` es imprescindible: sin él, el navegador recarga la página (es lo que hacían los formularios antes de JavaScript) y pierdes todo.

## Paso 2: leer todos los campos con FormData

Leer los campos de uno en uno se vuelve pesado con formularios grandes. **`FormData`** los lee todos de una vez, usando el atributo **`name`** de cada campo:

```html playground=formdata
<form id="registro">
  <label for="nombre">Nombre</label>
  <input id="nombre" name="nombre" required>

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <label for="plan">Plan</label>
  <select id="plan" name="plan">
    <option value="gratis">Gratis</option>
    <option value="pro">Pro</option>
  </select>

  <label><input type="checkbox" name="boletin"> Quiero recibir el boletín</label>

  <button>Registrarme</button>
</form>
```

```css playground=formdata
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: grid;
  gap: 8px;
  max-width: 320px;
}

input, select, button {
  padding: 8px;
  font: inherit;
}
```

```js playground=formdata
const formulario = document.querySelector('#registro')

formulario.addEventListener('submit', (event) => {
  event.preventDefault()

  const datos = Object.fromEntries(new FormData(formulario))
  console.log(datos)
  // { nombre: 'Ana', email: 'ana@mail.com', plan: 'pro', boletin: 'on' }
})
```

- **`new FormData(formulario)`** recoge todos los campos que tengan `name`.
- **`Object.fromEntries(...)`** lo convierte en un objeto normal, listo para enviarlo a una API con `JSON.stringify`.

Dos detalles:

- Un campo **sin `name` no aparece**. Si te falta un dato, revisa eso primero.
- Una casilla marcada llega como `'on'`, y una **sin marcar no aparece**. Para un booleano: `const boletin = datos.boletin === 'on'`.

## Paso 3: validaciones que HTML no sabe hacer

HTML no sabe comprobar que dos contraseñas coincidan. Con **`setCustomValidity`** puedes añadir tu propia regla y aprovechar los avisos del navegador:

```html playground=custom
<form id="clave">
  <label for="pass">Contraseña</label>
  <input id="pass" name="pass" type="password" minlength="8" required>

  <label for="repetir">Repite la contraseña</label>
  <input id="repetir" name="repetir" type="password" required>

  <button>Crear cuenta</button>
</form>
<p id="ok"></p>
```

```css playground=custom
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: grid;
  gap: 8px;
  max-width: 320px;
}

input, button {
  padding: 8px;
  font: inherit;
}
```

```js playground=custom
const formulario = document.querySelector('#clave')
const pass = document.querySelector('#pass')
const repetir = document.querySelector('#repetir')
const ok = document.querySelector('#ok')

function comprobarCoinciden() {
  if (repetir.value !== pass.value) {
    repetir.setCustomValidity('Las contraseñas no coinciden')
  } else {
    repetir.setCustomValidity('') // texto vacío = el campo es válido
  }
}

pass.addEventListener('input', comprobarCoinciden)
repetir.addEventListener('input', comprobarCoinciden)

formulario.addEventListener('submit', (event) => {
  event.preventDefault()
  ok.textContent = '✅ Cuenta creada'
})
```

- **`setCustomValidity('mensaje')`** marca el campo como inválido con tu mensaje. El navegador lo mostrará al intentar enviar, y el `submit` no se disparará.
- **`setCustomValidity('')`** lo vuelve a marcar como válido. No lo olvides, o el campo se quedará inválido para siempre.

## Paso 4: mostrar los errores dentro de la página

Los avisos del navegador funcionan, pero no se pueden diseñar. Si quieres mostrar los errores con tu propio estilo, desactiva los avisos con **`novalidate`** y pinta tú los mensajes. Mantén los atributos `required`, `type="email"`, etc.: siguen sirviendo para comprobar la validez desde JavaScript.

```html playground=errores
<form id="form" novalidate>
  <div class="campo">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required aria-describedby="email-error">
    <p class="error" id="email-error"></p>
  </div>
  <button>Suscribirme</button>
</form>
```

```css playground=errores
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.campo {
  display: grid;
  gap: 6px;
  max-width: 320px;
  margin-bottom: 12px;
}

input {
  padding: 8px;
  border: 2px solid #d4d4d8;
  font: inherit;
}

input[aria-invalid="true"] {
  border-color: #dc2626;
}

.error {
  min-height: 1.2em;
  margin: 0;
  color: #b91c1c;
  font-size: 14px;
}
```

```js playground=errores
const formulario = document.querySelector('#form')
const email = document.querySelector('#email')
const error = document.querySelector('#email-error')

function mensajeDeError(campo) {
  if (campo.validity.valueMissing) return 'Escribe tu email'
  if (campo.validity.typeMismatch) return 'Ese email no parece válido'
  return ''
}

formulario.addEventListener('submit', (event) => {
  event.preventDefault()

  const mensaje = mensajeDeError(email)
  error.textContent = mensaje
  email.setAttribute('aria-invalid', mensaje ? 'true' : 'false')

  if (mensaje) {
    email.focus() // lleva al usuario al campo con el problema
    return
  }

  error.textContent = ''
  console.log('Suscrito:', email.value)
})
```

- **`campo.validity`** te dice **qué** regla falló: `valueMissing` (vacío), `typeMismatch` (no es un email), `tooShort`, `rangeOverflow`...
- **`aria-invalid`** y **`aria-describedby`** hacen que un lector de pantalla anuncie que el campo tiene un error y lea el mensaje.
- **`focus()`** lleva al usuario directamente al campo que tiene que corregir.

## Errores comunes

- **Olvidar `event.preventDefault()`.** La página se recarga y parece que "no pasa nada".
- **Campos sin `name`.** `FormData` los ignora.
- **Escuchar el `click` del botón.** Te pierdes el `Enter` y la validación de HTML.
- **Validar solo en el frontend.** Cualquiera puede saltarse tu JavaScript. El servidor siempre tiene que volver a validar.
- **Olvidar `setCustomValidity('')`** cuando el dato ya es correcto.

## Para profundizar

- [`FormData` en MDN](https://developer.mozilla.org/es/docs/Web/API/FormData)
- [Validación de formularios en MDN](https://developer.mozilla.org/es/docs/Learn/Forms/Form_validation)

En resumen: escucha el **`submit`** con **`preventDefault()`**, lee todo con **`Object.fromEntries(new FormData(form))`**, añade tus reglas con **`setCustomValidity`** y, si muestras tus propios errores, usa **`validity`**, **`aria-invalid`** y **`focus()`**.
