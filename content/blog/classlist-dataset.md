---
title: 'classList y dataset: cambia estilos y guarda datos en el HTML desde JavaScript'
description: 'Añade, quita y alterna clases con classList en vez de tocar el style, y usa los atributos data-* y dataset para que el HTML y el JavaScript se entiendan.'
date: 2026-11-26
series: javascript
tags: [JavaScript, DOM, CSS]
draft: true
---

Cuando empiezas con el DOM, es tentador cambiar los estilos así:

```js
boton.style.backgroundColor = 'green'
boton.style.color = 'white'
boton.style.borderRadius = '8px'
```

Funciona, pero mezcla el diseño con la lógica. Si mañana cambias el color de la marca, tienes que buscarlo en el CSS **y** en el JavaScript. Hay una forma mucho más limpia: **que el CSS defina los estilos y el JavaScript solo ponga o quite clases**.

## `classList`: las clases de un elemento

Cada elemento tiene una propiedad `classList` con métodos para manejar sus clases:

| Método | Qué hace |
| --- | --- |
| `el.classList.add('activo')` | Añade la clase |
| `el.classList.remove('activo')` | La quita |
| `el.classList.toggle('activo')` | La pone si no está, la quita si está |
| `el.classList.contains('activo')` | ¿La tiene? `true` / `false` |
| `el.classList.replace('a', 'b')` | Cambia una por otra |

```html playground=classlist
<article class="tarjeta">
  <h2>Modo de lectura</h2>
  <p>Pulsa el botón para resaltar esta tarjeta.</p>
  <button id="resaltar">Resaltar</button>
</article>
```

```css playground=classlist
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjeta {
  max-width: 320px;
  padding: 16px;
  border: 2px solid #e4e4e7;
  border-radius: 12px;
  transition: border-color 0.2s, background 0.2s;
}

/* Todo el diseño del estado "resaltada" vive en el CSS */
.tarjeta.resaltada {
  border-color: #f59e0b;
  background: #fffbeb;
}
```

```js playground=classlist
const tarjeta = document.querySelector('.tarjeta')
const boton = document.querySelector('#resaltar')

boton.addEventListener('click', () => {
  tarjeta.classList.toggle('resaltada')

  const activa = tarjeta.classList.contains('resaltada')
  boton.textContent = activa ? 'Quitar resaltado' : 'Resaltar'
})
```

Ventajas:

- **El diseño está en un solo sitio** (el CSS). El JavaScript solo dice "ahora está resaltada".
- **Las transiciones funcionan solas**: el `transition` del CSS anima el cambio.
- **Es fácil de depurar**: en las DevTools ves la clase aparecer y desaparecer.

### `toggle` con condición

`toggle` acepta un segundo argumento: si es `true` pone la clase y si es `false` la quita. Muy útil cuando la clase depende de un dato:

```js
// Marca el campo como inválido si está vacío
campo.classList.toggle('invalido', campo.value.trim() === '')

// Marca el producto como agotado según su stock
tarjeta.classList.toggle('agotado', producto.stock === 0)
```

Una línea en vez de un `if` con `add` y `remove`.

### ¿Y `className`?

`el.className = 'tarjeta resaltada'` **reemplaza todas** las clases por ese texto. Si el elemento tenía otras clases, las pierdes. Usa `classList`, que toca solo la que le dices.

## ¿Cuándo sí usar `style`?

Cuando el valor **se calcula en el momento** y no puedes saberlo de antemano en el CSS: la posición del ratón, el porcentaje de una barra de progreso, un color que elige el usuario. Y aun así, lo más limpio es pasarlo como **variable CSS**:

```html playground=variable
<div class="barra"><div class="barra__relleno"></div></div>
<input type="range" min="0" max="100" value="30" id="progreso" aria-label="Progreso">
```

```css playground=variable
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.barra {
  height: 16px;
  max-width: 320px;
  margin-bottom: 12px;
  border-radius: 999px;
  background: #e4e4e7;
  overflow: hidden;
}

.barra__relleno {
  width: calc(var(--progreso, 0) * 1%);
  height: 100%;
  background: #22c55e;
}
```

```js playground=variable
const barra = document.querySelector('.barra')
const control = document.querySelector('#progreso')

function actualizar() {
  barra.style.setProperty('--progreso', control.value)
}

control.addEventListener('input', actualizar)
actualizar()
```

El JavaScript solo pasa un número; cómo se usa ese número lo decide el CSS.

## Atributos `data-*`: datos guardados en el HTML

Muchas veces un elemento necesita llevar información extra: el `id` del producto que representa, su precio, la acción de un botón. Para eso existen los atributos **`data-*`**: inventas el nombre después de `data-`, y el HTML sigue siendo válido.

```html
<button data-id="42" data-accion="borrar" data-nombre-producto="Teclado">Borrar</button>
```

Desde JavaScript se leen con **`dataset`**:

```js
boton.dataset.id              // '42'
boton.dataset.accion          // 'borrar'
boton.dataset.nombreProducto  // 'Teclado' (los guiones pasan a camelCase)
```

Fíjate en el último: `data-nombre-producto` en el HTML se convierte en `dataset.nombreProducto` en JavaScript.

### Un ejemplo completo: filtros

```html playground=dataset
<div class="filtros">
  <button data-categoria="todos" class="activo">Todos</button>
  <button data-categoria="audio">Audio</button>
  <button data-categoria="pantallas">Pantallas</button>
</div>

<ul class="productos">
  <li data-categoria="audio">Audífonos</li>
  <li data-categoria="pantallas">Monitor 24"</li>
  <li data-categoria="audio">Parlante</li>
  <li data-categoria="pantallas">Monitor 27"</li>
</ul>
```

```css playground=dataset
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.filtros {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filtros button {
  padding: 6px 14px;
  border: 1px solid #d4d4d8;
  border-radius: 999px;
  background: white;
  font: inherit;
  cursor: pointer;
}

.filtros button.activo {
  border-color: #18181b;
  background: #18181b;
  color: white;
}

.oculto {
  display: none;
}
```

```js playground=dataset
const botones = document.querySelectorAll('.filtros button')
const productos = document.querySelectorAll('.productos li')

botones.forEach((boton) => {
  boton.addEventListener('click', () => {
    const categoria = boton.dataset.categoria

    // Marca el botón activo
    botones.forEach((otro) => otro.classList.toggle('activo', otro === boton))

    // Muestra u oculta cada producto
    productos.forEach((producto) => {
      const coincide = categoria === 'todos' || producto.dataset.categoria === categoria
      producto.classList.toggle('oculto', !coincide)
    })
  })
})
```

Todo el filtrado se apoya en dos ideas: `dataset` para saber **qué** es cada cosa y `classList.toggle` para **mostrar u ocultar**.

### `data-*` también sirve en el CSS

Puedes seleccionar elementos por sus atributos `data-*`, y hasta mostrar su valor:

```css
/* Los productos de audio llevan un borde distinto */
li[data-categoria="audio"] {
  border-left: 3px solid #8b5cf6;
}

/* Muestra el valor del atributo como contenido */
.etiqueta::after {
  content: attr(data-estado);
}
```

## Dos reglas importantes con `dataset`

1. **Todo es texto.** `dataset.id` es `'42'`, no `42`. Conviértelo con `Number()` antes de compararlo con `===` con un número.
2. **No guardes datos privados.** Cualquiera puede verlos inspeccionando la página. Los `data-*` son para datos de la interfaz, no para contraseñas ni tokens.

## Tu turno

```html playground=ejercicio
<ul class="tareas">
  <li data-prioridad="alta">Entregar el proyecto</li>
  <li data-prioridad="baja">Ordenar el escritorio</li>
  <li data-prioridad="media">Responder correos</li>
</ul>
<button id="solo-alta">Ver solo prioridad alta</button>
```

```css playground=ejercicio
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

/* 1. Con CSS: pon un color distinto a cada prioridad usando [data-prioridad="..."] */
```

```js playground=ejercicio
// 2. Al hacer clic en una tarea, alterna la clase "hecha" (y dale estilo tachado en el CSS)
// 3. El botón debe ocultar o mostrar las tareas que NO son de prioridad alta
```

## Errores comunes

- **Cambiar muchos estilos con `.style`** en vez de una clase. Pon el diseño en el CSS.
- **Usar `className =`** y borrar sin querer otras clases. Usa `classList`.
- **Escribir el punto en `classList`**: `classList.add('.activo')` añade una clase llamada `.activo`. Sin punto.
- **Olvidar que `data-mi-dato` es `dataset.miDato`** en JavaScript.
- **Comparar `dataset.id === 42`.** `dataset` siempre devuelve textos.

## Para profundizar

- [`classList` en MDN](https://developer.mozilla.org/es/docs/Web/API/Element/classList)
- [Usar atributos de datos en MDN](https://developer.mozilla.org/es/docs/Web/HTML/How_to/Use_data_attributes)

En resumen: deja el diseño en el CSS y usa **`classList`** (`add`, `remove`, `toggle`, `contains`) para cambiar el estado visual. Usa atributos **`data-*`** para guardar datos de la interfaz en el HTML y léelos con **`dataset`**, recordando que siempre son textos.
