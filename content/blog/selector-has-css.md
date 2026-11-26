---
title: ':has(): por fin un "selector padre" en CSS'
description: 'Con :has() un elemento cambia de estilo según lo que tiene dentro. Tarjetas, formularios y menús sin una sola línea de JavaScript.'
date: 2026-11-26
series: css
tags: [CSS, Selectores]
draft: true
---

Durante años CSS solo pudo mirar **hacia abajo**: "pinta los `p` que están dentro de un `article`". Nunca al revés: "pinta el `article` que **tiene** un `p` dentro". Para eso había que usar JavaScript y añadir clases a mano.

Ahora existe `:has()`. Se lee como "que tiene":

```css
/* Las tarjetas QUE TIENEN una imagen */
.card:has(img) {
  padding: 0;
}
```

Si ya leíste el post de selectores, piensa en `:has()` como una pregunta que le haces al elemento: "¿tienes dentro algo que cumpla esto?". Si la respuesta es sí, se aplica el estilo.

## Ejemplo 1: tarjetas que se adaptan a su contenido

Tenemos dos tarjetas: una con imagen y otra sin ella. Queremos que la que tiene imagen use dos columnas. Sin `:has()` necesitarías dos clases distintas. Con `:has()`, el CSS lo decide solo:

```html playground=tarjetas
<article class="card">
  <img src="https://picsum.photos/seed/cafe/200/200" alt="Taza de café sobre una mesa">
  <div>
    <h2>Café de especialidad</h2>
    <p>Granos tostados esta semana.</p>
  </div>
</article>

<article class="card">
  <div>
    <h2>Aviso</h2>
    <p>Esta tarjeta no tiene imagen.</p>
  </div>
</article>
```

```css playground=tarjetas
body {
  font-family: system-ui, sans-serif;
  display: grid;
  gap: 16px;
  padding: 24px;
  max-width: 480px;
}

.card {
  padding: 16px;
  border: 1px solid #d4d4d8;
  border-radius: 12px;
}

/* Solo las tarjetas que tienen una imagen */
.card:has(img) {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 16px;
  align-items: center;
}

.card img {
  width: 100%;
  border-radius: 8px;
}

.card h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.card p {
  margin: 0;
}
```

Borra el `<img>` de la primera tarjeta en el playground y mira cómo vuelve a una sola columna.

## Ejemplo 2: un formulario que avisa cuando algo está mal

`:has()` se combina con las pseudoclases de formularios, como `:invalid` (el campo no cumple sus reglas) o `:checked` (casilla marcada). Aquí el **campo completo** (etiqueta incluida) se pone rojo cuando el email está mal escrito:

```html playground=formulario
<form>
  <label class="campo">
    Email
    <input type="email" placeholder="tu@email.com" required>
  </label>

  <label class="check">
    <input type="checkbox">
    Acepto los términos
  </label>

  <button>Enviar</button>
</form>
```

```css playground=formulario
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: grid;
  gap: 16px;
  max-width: 320px;
}

.campo {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 2px solid #e4e4e7;
  border-radius: 10px;
}

.campo input {
  padding: 8px;
  font: inherit;
}

/* El label que tiene un input inválido (y que ya escribiste) */
.campo:has(input:invalid:not(:placeholder-shown)) {
  border-color: #ef4444;
  color: #b91c1c;
}

/* El botón se apaga mientras la casilla no esté marcada */
form:has(.check input:not(:checked)) button {
  opacity: 0.4;
  pointer-events: none;
}
```

El truco de `:not(:placeholder-shown)` evita que el campo salga rojo **antes** de que el usuario escriba: mientras se ve el placeholder, el campo está vacío y no lo marcamos.

Ojo: `pointer-events: none` solo es un efecto visual. Con el teclado todavía se puede enviar, así que la validación de verdad sigue siendo `required` (y la del servidor).

## Ejemplo 3: modo oscuro con una casilla

Como `:has()` funciona en cualquier elemento, puedes preguntarle a toda la página si tiene una casilla marcada:

```html playground=tema
<label>
  <input type="checkbox" id="oscuro">
  Modo oscuro
</label>

<p>Marca la casilla y toda la página cambia de colores.</p>
```

```css playground=tema
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  background: white;
  color: #18181b;
  transition: background 200ms, color 200ms;
}

body:has(#oscuro:checked) {
  background: #18181b;
  color: #fafafa;
}
```

Esto no recuerda tu elección al recargar (para eso, mira el post de localStorage), pero muestra lo potente que es: **un elemento hijo controla el estilo de un ancestro**.

## Errores comunes

- **Pensar que solo mira a los hijos directos.** `:has(img)` busca en cualquier nivel. Si solo quieres hijos directos, usa `:has(> img)`.
- **Abusar de `body:has(...)`.** Funciona, pero obliga al navegador a revisar mucho. Úsalo en el contenedor más cercano posible.
- **Olvidar el soporte.** Todos los navegadores modernos lo soportan, pero si tu proyecto tiene que funcionar en navegadores muy viejos, compruébalo en [caniuse](https://caniuse.com/css-has).

## Para profundizar

- [`:has()` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/:has)

En resumen: **`:has()`** pregunta "¿tienes dentro esto?" y aplica el estilo al elemento de fuera. Tarjetas que se adaptan, formularios que avisan y menús que reaccionan, sin JavaScript.
