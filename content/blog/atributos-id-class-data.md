---
title: 'id, class y data-*: tres atributos de HTML y cuándo usar cada uno'
description: 'id es único, class se repite y data-* guarda datos para JavaScript. Qué hace cada atributo, cómo se usan desde CSS y JavaScript y los errores más típicos.'
date: 2026-11-26
series: html
tags: [HTML, CSS, JavaScript, Fundamentos]
draft: true
---

Tres atributos que vas a escribir constantemente y que se confunden muchísimo al empezar: **`id`**, **`class`** y **`data-*`**. Los tres sirven para "marcar" elementos, pero cada uno tiene su trabajo.

## id: el DNI del elemento

Un **`id`** identifica a **un único** elemento en toda la página. Como el DNI de una persona: no puede haber dos iguales.

```html
<form id="formulario-contacto">...</form>
```

Se usa para:

**1. Conectar un `<label>` con su campo.** El `for` del label apunta al `id` del input. Al pulsar la etiqueta, se enfoca el campo, y el lector de pantalla sabe qué es:

```html
<label for="email">Email</label>
<input id="email" type="email">
```

**2. Enlaces a una sección de la misma página.** Un enlace con `#` y el `id` salta directamente a ese elemento:

```html playground=anclas
<nav>
  <a href="#precios">Ver precios</a>
  <a href="#contacto">Contacto</a>
</nav>

<section id="precios" style="min-height: 400px; padding: 16px; background: #fef3c7">
  <h2>Precios</h2>
</section>

<section id="contacto" style="min-height: 400px; padding: 16px; background: #dbeafe">
  <h2>Contacto</h2>
</section>
```

**3. Encontrar un elemento concreto desde JavaScript:**

```js
const formulario = document.querySelector('#formulario-contacto')
// o también:
const mismo = document.getElementById('formulario-contacto')
```

**4. Atributos de accesibilidad** como `aria-controls` o `aria-describedby`, que apuntan a otro elemento por su `id`.

## class: la etiqueta reutilizable

Una **`class`** se puede poner a **todos los elementos que quieras**, y un elemento puede tener **varias** clases separadas por espacios. Es la forma normal de dar estilo con CSS:

```html playground=class
<button class="boton">Normal</button>
<button class="boton boton--primario">Primario</button>
<button class="boton boton--peligro">Borrar</button>
```

```css playground=class
body {
  font-family: system-ui, sans-serif;
  display: flex;
  gap: 8px;
  padding: 16px;
}

.boton {
  padding: 10px 16px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  background: white;
  font: inherit;
  cursor: pointer;
}

.boton--primario {
  border-color: #18181b;
  background: #18181b;
  color: white;
}

.boton--peligro {
  border-color: #dc2626;
  background: #dc2626;
  color: white;
}
```

Los tres botones comparten la clase `.boton` (la base) y dos de ellos añaden una **variante**. Así no repites el padding, el borde y la fuente en cada uno.

Desde JavaScript, **`classList`** añade, quita o alterna clases. Es la forma habitual de cambiar el aspecto de algo:

```js
boton.classList.add('activo')
boton.classList.remove('activo')
boton.classList.toggle('activo')         // si la tiene la quita, si no la pone
boton.classList.contains('activo')       // true o false
```

## ¿id o class para dar estilo?

**Para el CSS, usa clases.** Aunque `#formulario-contacto { ... }` funciona, tiene dos problemas:

- **No se reutiliza.** Si mañana hay dos formularios, no puedes repetir el `id`.
- **Tiene muchísima especificidad**: un selector de `id` gana a casi cualquier clase, y luego cuesta sobrescribirlo (lo explico en el post de especificidad).

Regla práctica: **`class` para estilos, `id` para enlaces, formularios y JavaScript.**

## data-*: datos para JavaScript

A veces necesitas guardar un dato en un elemento para usarlo desde JavaScript: el `id` de un producto, su precio o qué acción hace un botón. Para eso existen los atributos **`data-`**, a los que pones el nombre que quieras:

```html playground=data
<ul id="productos">
  <li>Polo <button data-id="101" data-precio="35">Añadir</button></li>
  <li>Gorra <button data-id="102" data-precio="25">Añadir</button></li>
  <li>Mochila <button data-id="103" data-precio="90">Añadir</button></li>
</ul>
<p id="total">Total: S/ 0</p>
```

```js playground=data
const productos = document.querySelector('#productos')
const total = document.querySelector('#total')
let suma = 0

productos.addEventListener('click', (event) => {
  const boton = event.target.closest('button')
  if (!boton) return

  const precio = Number(boton.dataset.precio)
  suma += precio
  total.textContent = `Total: S/ ${suma}`
  console.log(`Añadido el producto ${boton.dataset.id} (S/ ${precio})`)
})
```

Desde JavaScript se leen con **`elemento.dataset`**:

- `data-precio` se lee como `dataset.precio`.
- Los nombres con guiones pasan a *camelCase*: `data-fecha-limite` se lee como `dataset.fechaLimite`.
- **Siempre llegan como texto**: convierte con `Number()` si los necesitas como número.

También puedes usarlos desde CSS para dar estilo según su valor:

```css
[data-estado="agotado"] {
  opacity: 0.5;
}
```

## Resumen en una tabla

| Atributo | ¿Se repite? | Para qué |
| --- | --- | --- |
| `id` | No, único en la página | Labels, enlaces `#`, encontrar un elemento con JS, ARIA |
| `class` | Sí, y varias por elemento | Estilos con CSS y cambiar el aspecto con JS |
| `data-*` | Sí | Guardar datos para JavaScript |

## Errores comunes

- **Repetir un `id`.** El HTML deja de ser válido y `querySelector` solo encontrará el primero. Si se repite, es una `class`.
- **Poner varias clases en varios atributos.** `<div class="a" class="b">` solo aplica la primera. Se escriben juntas: `class="a b"`.
- **Olvidar el punto o la almohadilla en el selector.** En CSS y en `querySelector`: `.boton` para clases y `#email` para ids.
- **Nombres sin sentido.** `class="rojo-grande"` deja de tener sentido el día que el botón sea azul. Nombra por **qué es** (`boton--peligro`), no por cómo se ve.
- **Olvidar que `dataset` devuelve textos.** `'35' + '25'` es `'3525'`.

## Para profundizar

- [El atributo `id` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Global_attributes/id)
- [Usar atributos de datos, en MDN](https://developer.mozilla.org/es/docs/Learn/HTML/Howto/Use_data_attributes)

En resumen: **`id`** es único y sirve para labels, enlaces y encontrar un elemento concreto; **`class`** se repite y es la forma de dar estilos; y **`data-*`** guarda datos para leerlos con **`dataset`** desde JavaScript.
