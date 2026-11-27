---
title: 'Formularios accesibles: labels, grupos, ayudas y mensajes de error'
description: 'Cómo hacer un formulario que cualquiera pueda rellenar: label en cada campo, fieldset y legend para agrupar, textos de ayuda con aria-describedby y errores que se anuncian.'
date: 2026-11-26
series: html
tags: [HTML, Formularios, Accesibilidad]
draft: true
---

Un formulario es donde tu web **le pide algo al usuario**: registrarse, comprar, contactar. Si una persona no puede rellenarlo, no puede hacer lo más importante de tu web. Y los formularios son, con diferencia, donde más fallos de accesibilidad hay.

En el post de formularios y validación vimos los tipos de campos y la validación nativa. Hoy nos centramos en que **cualquiera** pueda usarlos: con lector de pantalla, con teclado, con baja visión o simplemente con prisa desde el móvil.

## Regla 1: cada campo tiene su `<label>`

Un **`<label>`** es el nombre visible de un campo. Y conectarlo bien con su campo es lo más importante de todo el post:

```html
<label for="email">Correo electrónico</label>
<input id="email" type="email" name="email">
```

El `for` del label tiene que coincidir con el `id` del campo. Con eso:

- Un **lector de pantalla** dice "Correo electrónico, campo de edición" al llegar al campo. Sin label, solo diría "campo de edición", y la persona no sabría qué escribir.
- **Hacer clic en el texto** del label lleva el foco al campo. Es muy útil en el móvil y, sobre todo, en checkboxes y radios, que son diminutos.

### El `placeholder` no es un label

Esta es la trampa más común:

```html
<!-- ❌ Sin label: solo un placeholder -->
<input type="email" placeholder="Correo electrónico">
```

El `placeholder` (el texto gris de dentro):

- **Desaparece** en cuanto empiezas a escribir. Si te distraes, ya no sabes qué era el campo.
- Suele tener **poco contraste** y cuesta leerlo.
- No todos los lectores de pantalla lo anuncian.

Úsalo, como mucho, para un **ejemplo** del formato (`ej. ana@correo.com`), pero siempre **además** del label.

## Regla 2: agrupa lo que va junto con `<fieldset>` y `<legend>`

Cuando varios campos responden a **una misma pregunta** (un grupo de radios, varios checkboxes, los campos de una dirección), agrúpalos:

```html playground=fieldset
<form>
  <fieldset>
    <legend>¿Cómo prefieres que te contactemos?</legend>

    <label><input type="radio" name="contacto" value="email" checked> Por email</label>
    <label><input type="radio" name="contacto" value="telefono"> Por teléfono</label>
    <label><input type="radio" name="contacto" value="whatsapp"> Por WhatsApp</label>
  </fieldset>
</form>
```

```css playground=fieldset
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

fieldset {
  display: grid;
  gap: 8px;
  max-width: 320px;
  padding: 16px;
  border: 1px solid #d4d4d8;
  border-radius: 10px;
}

legend {
  padding: 0 6px;
  font-weight: 600;
}
```

Sin el `<legend>`, un lector de pantalla diría "Por teléfono, botón de radio"... ¿por teléfono qué? Con el `<legend>`, dice "¿Cómo prefieres que te contactemos?, grupo. Por teléfono, botón de radio". Ahora tiene sentido.

Fíjate también en el truco de **meter el input dentro del label**: así no necesitas `for` ni `id`, y todo el texto es clicable.

## Regla 3: los textos de ayuda, conectados con `aria-describedby`

A veces un campo necesita una explicación: el formato de la contraseña, para qué se usa el teléfono. Si la escribes debajo sin más, quien usa un lector de pantalla puede no enterarse. Conéctala con **`aria-describedby`**:

```html
<label for="clave">Contraseña</label>
<input id="clave" type="password" aria-describedby="clave-ayuda" minlength="8" required>
<p id="clave-ayuda">Mínimo 8 caracteres, con al menos un número.</p>
```

`aria-describedby` apunta al `id` del texto de ayuda. El lector de pantalla leerá: "Contraseña, campo protegido, obligatorio. Mínimo 8 caracteres, con al menos un número."

## Regla 4: los campos obligatorios, claros para todos

```html
<label for="nombre">Nombre <span aria-hidden="true">*</span></label>
<input id="nombre" name="nombre" required>
```

- El atributo **`required`** ya hace que el lector de pantalla diga "obligatorio".
- El **asterisco** es para quien ve la pantalla. Le ponemos `aria-hidden="true"` para que el lector no diga "asterisco" (ya dice "obligatorio").
- Explica al principio del formulario qué significa: "Los campos marcados con * son obligatorios".

## Regla 5: errores que se ven, se entienden y se anuncian

Un buen mensaje de error:

1. Aparece **junto al campo** que falla.
2. Dice **qué pasó y cómo arreglarlo**: "El email debe tener una @", no "Campo inválido".
3. **No depende solo del color.** Un borde rojo no lo ve alguien con daltonismo. Añade un icono y texto.
4. Se **anuncia** a los lectores de pantalla.

Así se monta con JavaScript:

```html playground=errores
<form id="registro" novalidate>
  <p>Los campos marcados con <span aria-hidden="true">*</span><span class="sr-only">asterisco</span> son obligatorios.</p>

  <div class="campo">
    <label for="email">Correo electrónico <span aria-hidden="true">*</span></label>
    <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-error">
    <p class="error" id="email-error"></p>
  </div>

  <div class="campo">
    <label for="clave">Contraseña <span aria-hidden="true">*</span></label>
    <input id="clave" name="clave" type="password" required minlength="8" autocomplete="new-password" aria-describedby="clave-ayuda clave-error">
    <p class="ayuda" id="clave-ayuda">Mínimo 8 caracteres.</p>
    <p class="error" id="clave-error"></p>
  </div>

  <button>Crear cuenta</button>
</form>
```

```css playground=errores
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: grid;
  gap: 16px;
  max-width: 340px;
}

.campo {
  display: grid;
  gap: 4px;
}

input {
  padding: 8px 10px;
  border: 2px solid #a1a1aa;
  border-radius: 8px;
  font: inherit;
}

/* El estado de error se marca con aria-invalid, no con una clase aparte */
input[aria-invalid="true"] {
  border-color: #dc2626;
}

.ayuda,
.error {
  margin: 0;
  font-size: 14px;
}

.ayuda {
  color: #52525b;
}

.error {
  color: #b91c1c;
}

.error:not(:empty)::before {
  content: '⚠️ ';
}

button {
  padding: 10px;
  font: inherit;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

```js playground=errores
const formulario = document.querySelector('#registro')

const mensajes = {
  email: (campo) => {
    if (campo.validity.valueMissing) return 'Escribe tu correo electrónico.'
    if (campo.validity.typeMismatch) return 'El correo debe tener el formato nombre@dominio.com.'
    return ''
  },
  clave: (campo) => {
    if (campo.validity.valueMissing) return 'Escribe una contraseña.'
    if (campo.validity.tooShort) return `La contraseña debe tener al menos 8 caracteres (llevas ${campo.value.length}).`
    return ''
  }
}

function validarCampo(campo) {
  const mensaje = mensajes[campo.name](campo)
  document.querySelector(`#${campo.id}-error`).textContent = mensaje
  campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false')
  return !mensaje
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault()

  const campos = [...formulario.querySelectorAll('input')]
  const invalidos = campos.filter((campo) => !validarCampo(campo))

  if (invalidos.length > 0) {
    invalidos[0].focus() // llevamos al usuario al primer error
    return
  }

  alert('¡Cuenta creada! 🎉')
})

// Revalidamos al salir de cada campo, para que el error desaparezca al corregirlo
formulario.querySelectorAll('input').forEach((campo) => {
  campo.addEventListener('blur', () => {
    if (campo.getAttribute('aria-invalid')) validarCampo(campo)
  })
})
```

Las claves:

- **`aria-invalid="true"`**: el lector de pantalla dice "no válido" al llegar al campo. Y lo usamos también **para el estilo** en CSS, así nunca se desincronizan.
- **`aria-describedby`** apunta al mensaje de error (y a la ayuda, separados por un espacio). Al volver al campo, el lector lee el error.
- **Llevar el foco al primer error** con `focus()`: el usuario sabe inmediatamente dónde está el problema.
- **`novalidate`** en el `<form>` desactiva las burbujas de error del navegador, para mostrar las nuestras. La validación de los atributos (`required`, `type`, `minlength`) la seguimos aprovechando con `campo.validity`.

## Regla 6: `autocomplete`, el regalo para todos

El atributo **`autocomplete`** le dice al navegador qué dato va en cada campo, para que pueda **rellenarlo solo**:

```html
<input name="nombre" autocomplete="name">
<input name="email" type="email" autocomplete="email">
<input name="telefono" type="tel" autocomplete="tel">
<input name="direccion" autocomplete="street-address">
<input name="clave" type="password" autocomplete="current-password">
```

Ahorra tiempo a todo el mundo, y es una ayuda enorme para personas con dificultades motoras o cognitivas. Para la contraseña de un registro, usa `new-password`; para un inicio de sesión, `current-password`.

## Checklist rápido

- [ ] ¿Cada campo tiene un `<label>` conectado (o el input dentro del label)?
- [ ] ¿Los grupos de radios o checkboxes están en un `<fieldset>` con `<legend>`?
- [ ] ¿Las ayudas y los errores están conectados con `aria-describedby`?
- [ ] ¿Los errores dicen cómo arreglarlo y no dependen solo del color?
- [ ] ¿El foco va al primer error al enviar?
- [ ] ¿Los campos tienen el `type` y el `autocomplete` correctos?
- [ ] ¿Se puede rellenar y enviar todo solo con el teclado?

## Tu turno

Arregla los problemas de accesibilidad de este formulario:

```html playground=ejercicio
<form>
  <input type="text" placeholder="Nombre">
  <input type="text" placeholder="Email">

  <p>Talla:</p>
  <input type="radio" name="talla" value="s"> S
  <input type="radio" name="talla" value="m"> M
  <input type="radio" name="talla" value="l"> L

  <input type="checkbox"> Acepto los términos

  <div onclick="alert('Enviado')">Enviar</div>
</form>
```

## Errores comunes

- **Usar `placeholder` en vez de `<label>`.**
- **`for` e `id` que no coinciden** (un error de tipeo y el label deja de estar conectado).
- **Grupos de radios sin `<fieldset>` y `<legend>`.**
- **Errores solo en rojo** o genéricos ("Error en el formulario").
- **Botones de envío hechos con `<div>`.** Usa `<button>`.
- **Quitar el contorno del foco** en los campos (lo vimos en el post de accesibilidad y teclado).

## Para profundizar

- [Formularios accesibles en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Extensions/Forms/Your_first_form)
- [`autocomplete` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Attributes/autocomplete)
- [`aria-describedby` en MDN](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby)

En resumen: dale a **cada campo su `<label>`** (el placeholder no vale), agrupa con **`<fieldset>` y `<legend>`**, conecta ayudas y errores con **`aria-describedby`**, marca los errores con **`aria-invalid`**, escribe mensajes que digan **cómo arreglarlo**, lleva el **foco al primer error** y usa **`autocomplete`**. Un formulario accesible es, sencillamente, un formulario mejor para todos.
