---
title: 'Pseudo-clases y pseudo-elementos: :hover, :nth-child, ::before y compañía'
description: 'Da estilo a los elementos según su estado o su posición, y añade decoraciones sin tocar el HTML. Las pseudo-clases y pseudo-elementos más útiles.'
date: 2026-11-27
series: css
tags: [CSS, Selectores, Fundamentos]
draft: false
---

Con los selectores normales apuntas a elementos: "todos los botones", "los elementos con la clase `.tarjeta`". Pero a veces necesitas algo más fino: el botón **cuando pasas el ratón**, la **primera** fila de una tabla, o un adorno **antes** de un título. Para eso están las pseudo-clases y los pseudo-elementos.

- Una **pseudo-clase** (con **un** `:`) selecciona un elemento en un **estado** o **posición** concretos: `:hover`, `:first-child`.
- Un **pseudo-elemento** (con **dos** `::`) crea o selecciona una **parte** de un elemento: `::before`, `::placeholder`.

## Pseudo-clases de estado

Reaccionan a lo que hace el usuario:

```html playground=estado
<a href="#" class="boton">Pasa el ratón o usa Tab</a>
<input type="email" placeholder="Escribe un email" required>
<button disabled>Desactivado</button>
```

```css playground=estado
body {
  font-family: system-ui, sans-serif;
  display: grid;
  gap: 16px;
  max-width: 280px;
  padding: 24px;
}

.boton {
  padding: 10px 16px;
  border-radius: 8px;
  background: #18181b;
  color: white;
  text-align: center;
  text-decoration: none;
}

.boton:hover {
  background: #3f3f46; /* el ratón está encima */
}

.boton:focus-visible {
  outline: 3px solid #2563eb; /* llegaste con el teclado */
  outline-offset: 2px;
}

.boton:active {
  transform: scale(0.97); /* mientras lo pulsas */
}

input {
  padding: 8px;
  border: 2px solid #d4d4d8;
  font: inherit;
}

input:focus {
  border-color: #2563eb;
  outline: none;
}

input:invalid:not(:placeholder-shown) {
  border-color: #dc2626; /* escribió algo y no es un email válido */
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

| Pseudo-clase | Se aplica cuando... |
| --- | --- |
| `:hover` | el ratón está encima |
| `:focus` | el elemento tiene el foco (clic o teclado) |
| `:focus-visible` | tiene el foco **y** conviene mostrarlo (sobre todo con teclado) |
| `:active` | se está pulsando |
| `:checked` | una casilla o radio está marcado |
| `:disabled` | el campo está desactivado |
| `:invalid` / `:valid` | el campo no cumple / sí cumple sus reglas |

Usa **`:focus-visible`** para el anillo de foco: se muestra al navegar con teclado pero no al hacer clic con el ratón. Y **nunca** quites el foco sin poner otro estilo en su lugar: hay personas que solo usan el teclado.

## Pseudo-clases de posición

Seleccionan según el **lugar** que ocupa el elemento entre sus hermanos:

```html playground=posicion
<ul class="lista">
  <li>Primero</li>
  <li>Segundo</li>
  <li>Tercero</li>
  <li>Cuarto</li>
  <li>Quinto</li>
  <li>Sexto</li>
</ul>
```

```css playground=posicion
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.lista {
  max-width: 280px;
  padding: 0;
  list-style: none;
}

.lista li {
  padding: 10px 12px;
  border-bottom: 1px solid #e4e4e7;
}

.lista li:first-child {
  font-weight: 700;          /* el primero */
}

.lista li:last-child {
  border-bottom: none;       /* el último, sin línea */
}

.lista li:nth-child(even) {
  background: #f4f4f5;       /* los pares: efecto cebra */
}

.lista li:nth-child(3) {
  color: #b45309;            /* exactamente el tercero */
}
```

`:nth-child()` acepta:

- Un número: `:nth-child(3)` es el tercero.
- `odd` (impares) o `even` (pares): perfecto para tablas con filas alternas.
- Una fórmula: `:nth-child(3n)` es uno de cada tres (el 3, el 6, el 9...).

## :not(): todos menos estos

`:not()` excluye elementos. Muy útil para separar elementos sin que el último tenga separador de más:

```css
/* Una línea debajo de cada elemento, menos del último */
.menu li:not(:last-child) {
  border-bottom: 1px solid #e4e4e7;
}
```

## Pseudo-elementos: ::before y ::after

`::before` y `::after` **crean** un elemento "falso" al principio o al final del contenido. Necesitan siempre la propiedad **`content`** (aunque esté vacía, `content: ''`), o no aparecen:

```html playground=before-after
<h2 class="titulo">Ofertas de la semana</h2>
<p><a href="https://developer.mozilla.org" class="externo">Documentación de MDN</a></p>
<p class="requerido">Email</p>
```

```css playground=before-after
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

/* Una barrita decorativa debajo del título */
.titulo::after {
  content: '';
  display: block;
  width: 48px;
  height: 4px;
  margin-top: 8px;
  border-radius: 2px;
  background: #f59e0b;
}

/* Una flecha tras los enlaces externos */
.externo::after {
  content: ' ↗';
}

/* Un asterisco rojo en los campos obligatorios */
.requerido::after {
  content: ' *';
  color: #dc2626;
}
```

Se usan para **decoraciones**: líneas, iconos, comillas, flechas. No pongas ahí información importante: el texto de `content` no se puede seleccionar y algunos lectores de pantalla no lo leen.

## Otros pseudo-elementos útiles

```css
input::placeholder {
  color: #71717a;        /* el texto de ayuda de un input */
}

::selection {
  background: #fef3c7;   /* el texto que selecciona el usuario */
}

li::marker {
  color: #f59e0b;        /* la viñeta o el número de una lista */
}

p::first-letter {
  font-size: 2em;        /* la primera letra, estilo revista */
}
```

## Errores comunes

- **Olvidar `content` en `::before` o `::after`.** Sin él, el pseudo-elemento no existe.
- **Quitar el foco con `outline: none` sin poner nada a cambio.** Los usuarios de teclado se pierden.
- **Confundir `:nth-child` con "el n-ésimo de esta clase".** Cuenta **todos** los hermanos, sean de la clase que sean. Si mezclas elementos distintos, prueba `:nth-of-type`.
- **Usar un solo `:` en los pseudo-elementos.** Funciona por compatibilidad con navegadores viejos, pero la forma correcta es `::before`.

## Para profundizar

- [Pseudo-clases en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Pseudo-classes)
- [Pseudo-elementos en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Pseudo-elements)

En resumen: las **pseudo-clases** (`:`) seleccionan por **estado** (`:hover`, `:focus-visible`, `:checked`) o **posición** (`:first-child`, `:nth-child`), y los **pseudo-elementos** (`::`) crean o seleccionan **partes** (`::before`, `::after`, `::placeholder`). Con ellos haces muchísimo sin tocar el HTML.
