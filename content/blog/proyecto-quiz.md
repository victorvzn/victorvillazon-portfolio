---
title: 'Mini proyecto: un quiz de preguntas con puntuación'
description: 'Un juego de preguntas con varias opciones, una pregunta cada vez, respuesta correcta o incorrecta al instante y una pantalla final con la puntuación. Estado, render y accesibilidad.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, JavaScript, Proyectos]
draft: true
---

Un quiz es el proyecto perfecto para practicar la idea más importante del frontend: **guardar el estado y pintar la interfaz a partir de él** (lo vimos en el post de pintar listas desde un array). Aquí la pantalla cambia entera según en qué pregunta estés, y si no tienes el estado claro, el código se vuelve un lío enseguida.

Tiempo recomendado: **90 minutos**.

## El enunciado

> Crea un quiz de preguntas con estas reglas:
>
> 1. Las preguntas están en un **array de objetos**, cada uno con el texto, las opciones y cuál es la correcta.
> 2. Se muestra **una pregunta cada vez**, con el progreso ("Pregunta 2 de 5").
> 3. Al elegir una opción, se marca si es **correcta o incorrecta** (y cuál era la buena), y ya no se puede cambiar.
> 4. Un botón **"Siguiente"** pasa a la siguiente pregunta (solo aparece después de responder).
> 5. Al terminar, se muestra la **puntuación** y un botón para **volver a empezar**.

**Requisitos:**

- Añadir o quitar preguntas no debe obligar a cambiar el código, solo el array.
- Se puede jugar solo con el teclado.
- Lo correcto y lo incorrecto no se indica **solo con color**.

Usa estas preguntas:

```js
const PREGUNTAS = [
  {
    texto: '¿Qué etiqueta HTML se usa para el título más importante de una página?',
    opciones: ['<title>', '<h1>', '<header>', '<strong>'],
    correcta: 1
  },
  {
    texto: '¿Qué propiedad de CSS cambia el color del texto?',
    opciones: ['font-color', 'text-color', 'color', 'foreground'],
    correcta: 2
  },
  {
    texto: '¿Qué devuelve [1, 2, 3].map(n => n * 2)?',
    opciones: ['[2, 4, 6]', '6', '[1, 2, 3]', 'undefined'],
    correcta: 0
  },
  {
    texto: '¿Cuál de estos valores es falsy en JavaScript?',
    opciones: ["'0'", '[]', '0', "'false'"],
    correcta: 2
  },
  {
    texto: '¿Qué método convierte un objeto en texto JSON?',
    opciones: ['JSON.parse', 'JSON.stringify', 'toString', 'JSON.text'],
    correcta: 1
  }
]
```

## Tu turno

```html playground=reto
<main class="quiz" id="quiz">
  <!-- Todo el contenido se pinta desde JavaScript -->
</main>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #eef2ff;
}

/* tu CSS aquí */
```

```js playground=reto
const PREGUNTAS = [
  { texto: '¿Qué etiqueta HTML se usa para el título más importante de una página?', opciones: ['<title>', '<h1>', '<header>', '<strong>'], correcta: 1 },
  { texto: '¿Qué propiedad de CSS cambia el color del texto?', opciones: ['font-color', 'text-color', 'color', 'foreground'], correcta: 2 },
  { texto: '¿Qué devuelve [1, 2, 3].map(n => n * 2)?', opciones: ['[2, 4, 6]', '6', '[1, 2, 3]', 'undefined'], correcta: 0 },
  { texto: '¿Cuál de estos valores es falsy en JavaScript?', opciones: ["'0'", '[]', '0', "'false'"], correcta: 2 },
  { texto: '¿Qué método convierte un objeto en texto JSON?', opciones: ['JSON.parse', 'JSON.stringify', 'toString', 'JSON.text'], correcta: 1 }
]

// tu JavaScript aquí
```

<!-- solucion: Ver la pista 1 (el estado) -->

Antes de escribir una línea de interfaz, decide **qué datos** describen el quiz en cualquier momento. Bastan tres:

```js
const estado = {
  actual: 0,        // índice de la pregunta que se muestra
  elegida: null,    // índice de la opción elegida, o null si aún no respondió
  aciertos: 0
}
```

¿Has terminado? Eso no hace falta guardarlo: es `estado.actual === PREGUNTAS.length`.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (la estructura) -->

Escribe **una función `pintar()`** que mire el estado y dibuje la pantalla que toca (la de la pregunta o la final). Cada acción del usuario solo **cambia el estado** y vuelve a llamar a `pintar()`:

- Elegir una opción → `estado.elegida = i`, sumar el acierto si toca, `pintar()`.
- Siguiente → `estado.actual++`, `estado.elegida = null`, `pintar()`.
- Volver a empezar → todo a cero, `pintar()`.

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<main class="quiz" id="quiz"></main>
```

```css playground=solucion
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #eef2ff;
}

.quiz {
  max-width: 520px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.06);
}

.progreso {
  margin: 0;
  color: #6366f1;
  font-weight: 600;
}

.barra {
  height: 6px;
  margin: 8px 0 20px;
  border-radius: 999px;
  background: #e0e7ff;
  overflow: hidden;
}

.barra span {
  display: block;
  height: 100%;
  background: #6366f1;
  transition: width 0.3s;
}

.pregunta {
  margin: 0 0 16px;
  font-size: 20px;
}

.opciones {
  display: grid;
  gap: 8px;
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
}

.opcion {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e4e4e7;
  border-radius: 10px;
  background: white;
  font: inherit;
  font-family: ui-monospace, monospace;
  text-align: left;
  cursor: pointer;
}

.opcion:hover:enabled {
  border-color: #6366f1;
}

.opcion:disabled {
  cursor: default;
}

/* Color + icono: no dependemos solo del color */
.opcion.correcta {
  border-color: #16a34a;
  background: #dcfce7;
}

.opcion.correcta::after {
  content: ' ✓ Correcta';
  font-family: system-ui, sans-serif;
  font-weight: 700;
}

.opcion.incorrecta {
  border-color: #dc2626;
  background: #fee2e2;
}

.opcion.incorrecta::after {
  content: ' ✗ Tu respuesta';
  font-family: system-ui, sans-serif;
  font-weight: 700;
}

.siguiente {
  padding: 12px 20px;
  border: none;
  border-radius: 999px;
  background: #4f46e5;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

.final {
  text-align: center;
}

.puntuacion {
  font-size: 48px;
  font-weight: 800;
}
```

```js playground=solucion
const PREGUNTAS = [
  { texto: '¿Qué etiqueta HTML se usa para el título más importante de una página?', opciones: ['<title>', '<h1>', '<header>', '<strong>'], correcta: 1 },
  { texto: '¿Qué propiedad de CSS cambia el color del texto?', opciones: ['font-color', 'text-color', 'color', 'foreground'], correcta: 2 },
  { texto: '¿Qué devuelve [1, 2, 3].map(n => n * 2)?', opciones: ['[2, 4, 6]', '6', '[1, 2, 3]', 'undefined'], correcta: 0 },
  { texto: '¿Cuál de estos valores es falsy en JavaScript?', opciones: ["'0'", '[]', '0', "'false'"], correcta: 2 },
  { texto: '¿Qué método convierte un objeto en texto JSON?', opciones: ['JSON.parse', 'JSON.stringify', 'toString', 'JSON.text'], correcta: 1 }
]

const quiz = document.querySelector('#quiz')
const estado = { actual: 0, elegida: null, aciertos: 0 }

// Pequeño ayudante para crear elementos con texto (siempre con textContent: las opciones llevan "<h1>")
function crear(etiqueta, { clase, texto } = {}) {
  const elemento = document.createElement(etiqueta)
  if (clase) elemento.className = clase
  if (texto !== undefined) elemento.textContent = texto
  return elemento
}

function pintarPregunta() {
  const pregunta = PREGUNTAS[estado.actual]
  const respondida = estado.elegida !== null

  const progreso = crear('p', { clase: 'progreso', texto: `Pregunta ${estado.actual + 1} de ${PREGUNTAS.length}` })

  const barra = crear('div', { clase: 'barra' })
  const relleno = crear('span')
  relleno.style.width = `${(estado.actual / PREGUNTAS.length) * 100}%`
  barra.append(relleno)

  const titulo = crear('h2', { clase: 'pregunta', texto: pregunta.texto })
  titulo.tabIndex = -1 // para poder moverle el foco al cambiar de pregunta

  const lista = crear('ul', { clase: 'opciones' })
  pregunta.opciones.forEach((opcion, i) => {
    const boton = crear('button', { clase: 'opcion', texto: opcion })
    boton.dataset.indice = i
    boton.disabled = respondida
    if (respondida && i === pregunta.correcta) boton.classList.add('correcta')
    if (respondida && i === estado.elegida && i !== pregunta.correcta) boton.classList.add('incorrecta')
    const item = crear('li')
    item.append(boton)
    lista.append(item)
  })

  const aviso = crear('p', { texto: '' })
  aviso.setAttribute('aria-live', 'polite')
  if (respondida) {
    aviso.textContent = estado.elegida === pregunta.correcta
      ? '¡Correcto! 🎉'
      : `Incorrecto. La respuesta era: ${pregunta.opciones[pregunta.correcta]}`
  }

  quiz.replaceChildren(progreso, barra, titulo, lista, aviso)

  if (respondida) {
    const esLaUltima = estado.actual === PREGUNTAS.length - 1
    const siguiente = crear('button', { clase: 'siguiente', texto: esLaUltima ? 'Ver resultado' : 'Siguiente' })
    siguiente.dataset.accion = 'siguiente'
    quiz.append(siguiente)
    siguiente.focus()
  } else {
    titulo.focus()
  }
}

function pintarFinal() {
  const porcentaje = estado.aciertos / PREGUNTAS.length
  const mensaje = porcentaje === 1 ? '¡Perfecto! 🏆' : porcentaje >= 0.6 ? '¡Muy bien! 💪' : 'Sigue practicando 📚'

  const final = crear('section', { clase: 'final' })
  const titulo = crear('h2', { texto: mensaje })
  titulo.tabIndex = -1
  const puntuacion = crear('p', { clase: 'puntuacion', texto: `${estado.aciertos} / ${PREGUNTAS.length}` })
  const otraVez = crear('button', { clase: 'siguiente', texto: 'Volver a empezar' })
  otraVez.dataset.accion = 'reiniciar'

  final.append(titulo, puntuacion, otraVez)
  quiz.replaceChildren(final)
  titulo.focus()
}

function pintar() {
  if (estado.actual === PREGUNTAS.length) pintarFinal()
  else pintarPregunta()
}

// Un solo listener para todo el quiz (delegación de eventos)
quiz.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button')
  if (!boton) return

  if (boton.classList.contains('opcion')) {
    estado.elegida = Number(boton.dataset.indice)
    if (estado.elegida === PREGUNTAS[estado.actual].correcta) estado.aciertos++
  } else if (boton.dataset.accion === 'siguiente') {
    estado.actual++
    estado.elegida = null
  } else if (boton.dataset.accion === 'reiniciar') {
    Object.assign(estado, { actual: 0, elegida: null, aciertos: 0 })
  }

  pintar()
})

pintar()
```

Las decisiones que más se valoran:

- **Tres datos de estado y una función `pintar()`**: cualquier pantalla sale de `estado`. "¿Ha terminado?" no se guarda: se calcula.
- **Las preguntas son datos.** Añadir una pregunta es añadir un objeto al array; la interfaz (incluido "Pregunta X de Y") se adapta sola.
- **`textContent` siempre.** Las opciones contienen cosas como `<h1>`: con `innerHTML`, el navegador las interpretaría como etiquetas y se romperían.
- **Gestión del foco**: al cambiar de pregunta, el foco va al título (por eso `tabIndex = -1`); al responder, al botón "Siguiente". Quien usa el teclado o un lector de pantalla no se pierde cuando la pantalla cambia entera.
- **Correcto e incorrecto con texto e icono**, además del color.
- **Los botones se deshabilitan** tras responder: no se puede hacer trampa cambiando la respuesta.

<!-- /solucion -->

## Ideas para ampliarlo

1. **Baraja** las preguntas al empezar (y las opciones de cada una, recolocando el índice de la correcta).
2. Añade un **temporizador** de 15 segundos por pregunta.
3. Carga las preguntas desde la **API** gratuita [Open Trivia Database](https://opentdb.com/api_config.php) con `fetch` (con estados de carga y error).
4. Guarda la **mejor puntuación** en `localStorage`.
