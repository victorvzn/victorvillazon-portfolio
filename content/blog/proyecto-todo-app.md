---
title: 'Mini proyecto: una lista de tareas que recuerda todo (con localStorage)'
description: 'El proyecto clásico para practicar JavaScript: añadir, completar, borrar y filtrar tareas, y que sigan ahí al recargar. Enunciado, pistas y solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, DOM, Proyectos]
draft: true
---

La lista de tareas (*to-do app*) es el proyecto que todo el mundo hace al aprender JavaScript, y no es casualidad: obliga a usar **todo** lo importante. Arrays de objetos, el DOM, eventos, formularios y `localStorage` para guardar los datos.

Si lo terminas, puedes decir con confianza que sabes JavaScript del lado del navegador.

Tiempo recomendado: **90 minutos**.

## El enunciado

> Crea una lista de tareas con estas funciones:
>
> 1. **Añadir** una tarea escribiendo su texto en un formulario.
> 2. **Marcar** una tarea como completada (y desmarcarla).
> 3. **Borrar** una tarea.
> 4. **Filtrar**: ver todas, solo las pendientes o solo las completadas.
> 5. Mostrar **cuántas tareas quedan pendientes**.
> 6. Las tareas **se guardan** en `localStorage`: al recargar la página siguen ahí.

**Requisitos:**

- No se pueden añadir tareas vacías (ni solo con espacios).
- Debe poder usarse por completo con el teclado.

## Cómo pensarlo antes de programar

El error más común en este proyecto es ir modificando el HTML a mano (añadir un `<li>` aquí, quitar otro allá). Se vuelve un lío enseguida. La idea que lo simplifica todo es:

> **Los datos mandan.** Guarda las tareas en un **array de objetos** y escribe **una sola función, `pintar()`**, que dibuja la lista entera a partir de ese array.

Así, cada acción hace siempre lo mismo: **1)** cambiar el array, **2)** guardar, **3)** volver a pintar.

```js
let tareas = [
  { id: 1, texto: 'Estudiar JavaScript', hecha: false },
  { id: 2, texto: 'Comprar pan', hecha: true }
]
```

## Tu turno

```html playground=reto
<main class="app">
  <h1>Mis tareas</h1>
  <!-- Formulario para añadir -->
  <!-- Botones de filtro: Todas, Pendientes, Completadas -->
  <!-- La lista -->
  <!-- Contador de pendientes -->
</main>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #f4f4f5;
}

/* tu CSS aquí */
```

```js playground=reto
// tu JavaScript aquí
```

<!-- solucion: Ver la pista 1 (añadir y pintar) -->

- Para crear una tarea, genera un `id` único con `Date.now()` (los milisegundos actuales: no se repiten).
- En `pintar()`, vacía la lista con `lista.innerHTML = ''` y crea un `<li>` por cada tarea con `document.createElement`. Usa `textContent` para el texto de la tarea, nunca `innerHTML`.
- Para que el checkbox y el botón de borrar sepan a qué tarea pertenecen, guarda el `id` en el `<li>` con `li.dataset.id = tarea.id`.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (completar, borrar y guardar) -->

- **Delegación de eventos**: en vez de un listener por botón, pon **uno solo** en la lista y averigua con `event.target.closest('li')` en qué tarea se hizo clic.
- Completar: busca la tarea con `find` y cambia `hecha = !hecha`.
- Borrar: `tareas = tareas.filter(tarea => tarea.id !== id)`.
- Guardar: `localStorage.setItem('tareas', JSON.stringify(tareas))`. Al cargar: `JSON.parse(localStorage.getItem('tareas')) ?? []`.

<!-- /solucion -->

<!-- solucion: Ver la solución completa -->

```html playground=solucion
<main class="app">
  <h1>Mis tareas</h1>

  <form id="nueva" class="nueva">
    <label for="texto" class="sr-only">Nueva tarea</label>
    <input id="texto" placeholder="¿Qué tienes que hacer?" autocomplete="off" maxlength="120">
    <button>Añadir</button>
  </form>

  <div class="filtros" role="group" aria-label="Filtrar tareas">
    <button type="button" data-filtro="todas" aria-pressed="true">Todas</button>
    <button type="button" data-filtro="pendientes" aria-pressed="false">Pendientes</button>
    <button type="button" data-filtro="completadas" aria-pressed="false">Completadas</button>
  </div>

  <ul id="lista" class="lista"></ul>

  <p id="contador" class="contador" aria-live="polite"></p>
</main>
```

```css playground=solucion
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #f4f4f5;
}

.app {
  max-width: 440px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);
}

h1 {
  margin: 0 0 16px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.nueva {
  display: flex;
  gap: 8px;
}

.nueva input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  font: inherit;
}

button {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  background: white;
  font: inherit;
  cursor: pointer;
}

.nueva button {
  border-color: #18181b;
  background: #18181b;
  color: white;
}

.filtros {
  display: flex;
  gap: 6px;
  margin: 16px 0;
}

.filtros button[aria-pressed="true"] {
  border-color: #18181b;
  background: #18181b;
  color: white;
}

.lista {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lista li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #e4e4e7;
}

.lista label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.lista input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.lista li.hecha span {
  color: #71717a;
  text-decoration: line-through;
}

.borrar {
  min-height: 32px;
  border: none;
  color: #b91c1c;
}

.vacia {
  color: #71717a;
  text-align: center;
}

.contador {
  margin: 16px 0 0;
  color: #52525b;
  font-size: 14px;
}

button:focus-visible,
input:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
```

```js playground=solucion
const CLAVE = 'tareas'

const formulario = document.querySelector('#nueva')
const input = document.querySelector('#texto')
const lista = document.querySelector('#lista')
const contador = document.querySelector('#contador')
const filtros = document.querySelector('.filtros')

// 1. El estado: los datos mandan
let tareas = cargar()
let filtro = 'todas'

function cargar() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? []
  } catch {
    return [] // si lo guardado está roto, empezamos de cero
  }
}

function guardar() {
  localStorage.setItem(CLAVE, JSON.stringify(tareas))
}

// 2. Una sola función que dibuja todo a partir del estado
function pintar() {
  const visibles = tareas.filter(tarea => {
    if (filtro === 'pendientes') return !tarea.hecha
    if (filtro === 'completadas') return tarea.hecha
    return true
  })

  lista.innerHTML = ''

  if (visibles.length === 0) {
    const vacia = document.createElement('li')
    vacia.className = 'vacia'
    vacia.textContent = 'No hay tareas aquí'
    lista.append(vacia)
  }

  for (const tarea of visibles) {
    const li = document.createElement('li')
    li.dataset.id = tarea.id
    li.classList.toggle('hecha', tarea.hecha)

    const label = document.createElement('label')
    const check = document.createElement('input')
    check.type = 'checkbox'
    check.checked = tarea.hecha
    const texto = document.createElement('span')
    texto.textContent = tarea.texto
    label.append(check, texto)

    const borrar = document.createElement('button')
    borrar.type = 'button'
    borrar.className = 'borrar'
    borrar.textContent = 'Borrar'
    borrar.setAttribute('aria-label', `Borrar «${tarea.texto}»`)

    li.append(label, borrar)
    lista.append(li)
  }

  const pendientes = tareas.filter(tarea => !tarea.hecha).length
  contador.textContent = pendientes === 1 ? 'Te queda 1 tarea' : `Te quedan ${pendientes} tareas`

  for (const boton of filtros.querySelectorAll('button')) {
    boton.setAttribute('aria-pressed', boton.dataset.filtro === filtro)
  }
}

// 3. Cada acción: cambiar el estado → guardar → pintar
formulario.addEventListener('submit', (event) => {
  event.preventDefault()
  const texto = input.value.trim()
  if (!texto) return

  tareas.push({ id: Date.now(), texto, hecha: false })
  input.value = ''
  guardar()
  pintar()
})

// Delegación: un solo listener para todas las tareas
lista.addEventListener('change', (event) => {
  if (event.target.type !== 'checkbox') return
  const id = Number(event.target.closest('li').dataset.id)
  const tarea = tareas.find(t => t.id === id)
  tarea.hecha = event.target.checked
  guardar()
  pintar()
})

lista.addEventListener('click', (event) => {
  const boton = event.target.closest('.borrar')
  if (!boton) return
  const id = Number(boton.closest('li').dataset.id)
  tareas = tareas.filter(t => t.id !== id)
  guardar()
  pintar()
  input.focus() // el botón desapareció: devolvemos el foco a un sitio útil
})

filtros.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-filtro]')
  if (!boton) return
  filtro = boton.dataset.filtro
  pintar()
})

pintar()
```

Añade unas tareas y **recarga el playground**: siguen ahí.

Las decisiones que más se valoran:

- **El estado es un array y `pintar()` lo dibuja todo.** Ninguna acción toca el HTML directamente; solo cambian el array. Es exactamente la idea en la que se basa React, así que este proyecto es la mejor preparación para aprenderlo.
- **Delegación de eventos**: un listener en la lista sirve para todas las tareas, incluso las que se crean después.
- **El `id` va en `data-id`** y se convierte con `Number()`, porque `dataset` siempre devuelve textos.
- **`cargar()` usa `try/catch`**: si alguien guardó algo roto en `localStorage`, la app no se rompe.
- **El filtro no se guarda en las tareas.** Es solo una forma de **ver** los datos: se aplica al pintar.
- **Accesibilidad**: cada casilla está dentro de su `<label>` (al pulsar el texto se marca), los botones de borrar dicen qué tarea borran, los filtros usan `aria-pressed` y el contador se anuncia con `aria-live`.

<!-- /solucion -->

## Retos extra

1. **Editar** una tarea con doble clic sobre su texto.
2. Un botón **"Borrar completadas"**.
3. Guardar también el **filtro** elegido, para que se mantenga al recargar.

<!-- solucion: Ver la solución del reto 2 -->

Con el patrón "cambiar el estado → guardar → pintar" es una línea de lógica:

```js
botonLimpiar.addEventListener('click', () => {
  tareas = tareas.filter(tarea => !tarea.hecha)
  guardar()
  pintar()
})
```

Fíjate en que no tienes que buscar ni borrar ningún `<li>`: `pintar()` se encarga.

<!-- /solucion -->
