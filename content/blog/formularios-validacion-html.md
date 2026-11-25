---
title: 'Formularios que se validan solos (sin JavaScript)'
description: 'required, type, minlength y pattern: el navegador revisa tus formularios antes de enviarlos. Y con CSS los pintas de rojo o verde.'
date: 2026-11-25
series: html
tags: [HTML, CSS, Formularios]
draft: true
order: 7
---

Antes de escribir una sola línea de JavaScript para validar un formulario, mira todo lo que el **navegador ya hace por ti**. Con unos cuantos atributos, no deja enviar el formulario hasta que esté bien lleno.

## `label` primero, siempre

Antes de validar, lo básico: cada campo con su `<label>`. El `for` del label tiene que coincidir con el `id` del input. Así, al hacer clic en el texto se enfoca el campo, y los lectores de pantalla saben qué se pide.

```html
<label for="email">Correo</label>
<input id="email" type="email">
```

## Los atributos que validan

- `required`: el campo no puede quedar vacío.
- `type="email"`, `type="url"`, `type="number"`: revisa que el formato sea el correcto. En el celular, además, muestra el teclado adecuado.
- `minlength` / `maxlength`: mínimo y máximo de caracteres.
- `min` / `max`: mínimo y máximo para números y fechas.
- `pattern`: una expresión regular que el valor debe cumplir.

```html playground=atributos
<form>
  <label for="nombre">Nombre</label>
  <input id="nombre" required minlength="2">

  <label for="correo">Correo</label>
  <input id="correo" type="email" required>

  <label for="edad">Edad</label>
  <input id="edad" type="number" min="18" max="99">

  <label for="dni">DNI (8 dígitos)</label>
  <input id="dni" required pattern="[0-9]{8}" title="Escribe 8 números">

  <button>Enviar</button>
</form>
```

```css playground=atributos
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 320px;
}

input {
  margin-bottom: 10px;
  padding: 8px;
  font: inherit;
}

button {
  padding: 10px;
  font: inherit;
}
```

Haz clic en **Enviar** con todo vacío: el navegador te avisa en el primer campo con error. Prueba un correo sin `@` o un DNI con letras.

El atributo `title` en el DNI sirve para que el mensaje de error explique qué se espera.

## Pintarlos con CSS

CSS tiene pseudo-clases para el estado de validación:

- `:invalid` / `:valid`: si el valor cumple o no.
- `:user-invalid` / `:user-valid`: lo mismo, pero **solo después de que el usuario interactuó** con el campo. Es la que quieres, para no llenar de rojo un formulario que nadie ha tocado.

```html playground=estilos
<form>
  <label for="correo">Correo</label>
  <input id="correo" type="email" required placeholder="tu@correo.com">
  <span class="error">Escribe un correo válido</span>

  <label for="clave">Contraseña (mínimo 8)</label>
  <input id="clave" type="password" required minlength="8">
  <span class="error">Debe tener al menos 8 caracteres</span>

  <button>Crear cuenta</button>
</form>
```

```css playground=estilos
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 320px;
}

input {
  padding: 10px;
  border: 2px solid #d4d4d8;
  border-radius: 8px;
  font: inherit;
  outline: none;
}

input:focus {
  border-color: #2563eb;
}

/* Solo después de que el usuario escribió y salió del campo */
input:user-invalid {
  border-color: #dc2626;
}

input:user-valid {
  border-color: #16a34a;
}

/* El mensaje está oculto y aparece cuando el campo anterior es inválido */
.error {
  display: none;
  margin-bottom: 8px;
  color: #dc2626;
  font-size: 14px;
}

input:user-invalid + .error {
  display: block;
}

button {
  margin-top: 8px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #18181b;
  color: white;
  font: inherit;
}
```

El selector `input:user-invalid + .error` significa: "el `.error` que está **justo después** de un input inválido".

## La validación del navegador no es suficiente

Esto es importantísimo: cualquiera puede abrir DevTools y borrar el `required`. La validación en HTML es para **ayudar al usuario**, no para proteger tu app. El servidor **siempre** tiene que volver a validar los datos.

## Errores comunes

- **Usar `placeholder` en vez de `label`.** El placeholder desaparece al escribir y la persona olvida qué era el campo.
- **`type="number"` para teléfonos o DNI.** No son números para hacer cuentas. Usa `type="tel"` o `inputmode="numeric"` con `pattern`.
- **Pintar de rojo con `:invalid`.** El formulario aparece todo rojo antes de que el usuario haga nada. Usa `:user-invalid`.

## Para profundizar

- [Validación de formularios en MDN](https://developer.mozilla.org/es/docs/Learn/Forms/Form_validation)
- [`:user-invalid` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/:user-invalid)

En resumen: **atributos** como `required`, `type` y `pattern` validan, **`:user-invalid`** pinta los errores en el momento justo, y el **servidor** siempre valida otra vez.
