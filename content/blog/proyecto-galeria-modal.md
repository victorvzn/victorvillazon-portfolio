---
title: 'Mini proyecto: una galería de fotos con visor (lightbox)'
description: 'Una galería responsive que, al hacer clic en una foto, la abre en grande en un dialog con botones anterior y siguiente, flechas del teclado y cierre con Escape.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, JavaScript, Proyectos, Accesibilidad]
draft: true
---

Casi todas las webs de portafolios, tiendas o viajes tienen una: una **galería** de miniaturas que, al hacer clic, abre la foto en grande sobre la página, con flechas para pasar a la siguiente. A ese visor se le llama ***lightbox***.

Es un proyecto ideal para juntar lo aprendido: Grid, `object-fit`, el elemento `<dialog>` (del post del modal sin JavaScript) y eventos de teclado.

Tiempo recomendado: **90 minutos**.

## El enunciado

> Crea una galería de fotos con:
>
> 1. Una cuadrícula **responsive** de miniaturas cuadradas que no se deforman.
> 2. Al hacer clic en una, se abre un **visor** con la foto en grande y su descripción.
> 3. Botones **Anterior** y **Siguiente** (al llegar a la última, vuelve a la primera).
> 4. Con el teclado: **flecha izquierda / derecha** cambian de foto y **Escape** cierra.
> 5. Al cerrar, el foco **vuelve a la miniatura** que se abrió.

Usa estas fotos (cambia el número de `seed` para tener otras):

```js
const FOTOS = [
  { src: 'https://picsum.photos/seed/montana/1200/800', alt: 'Montañas nevadas al amanecer' },
  { src: 'https://picsum.photos/seed/playa/1200/800', alt: 'Playa de arena blanca con palmeras' },
  { src: 'https://picsum.photos/seed/ciudad/1200/800', alt: 'Calle de una ciudad de noche' },
  { src: 'https://picsum.photos/seed/bosque/1200/800', alt: 'Sendero en un bosque otoñal' },
  { src: 'https://picsum.photos/seed/lago/1200/800', alt: 'Lago en calma rodeado de árboles' },
  { src: 'https://picsum.photos/seed/desierto/1200/800', alt: 'Dunas del desierto al atardecer' }
]
```

## Tu turno

```html playground=reto
<main>
  <h1>Galería</h1>
  <ul class="galeria" id="galeria"></ul>

  <!-- El visor: un <dialog> -->
</main>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
}

/* tu CSS aquí */
```

```js playground=reto
const FOTOS = [
  { src: 'https://picsum.photos/seed/montana/1200/800', alt: 'Montañas nevadas al amanecer' },
  { src: 'https://picsum.photos/seed/playa/1200/800', alt: 'Playa de arena blanca con palmeras' },
  { src: 'https://picsum.photos/seed/ciudad/1200/800', alt: 'Calle de una ciudad de noche' },
  { src: 'https://picsum.photos/seed/bosque/1200/800', alt: 'Sendero en un bosque otoñal' },
  { src: 'https://picsum.photos/seed/lago/1200/800', alt: 'Lago en calma rodeado de árboles' },
  { src: 'https://picsum.photos/seed/desierto/1200/800', alt: 'Dunas del desierto al atardecer' }
]

// tu JavaScript aquí
```

<!-- solucion: Ver la pista 1 (las miniaturas) -->

Cada miniatura debe ser un **`<button>`** con la imagen dentro: así se puede abrir con el teclado sin programar nada extra. Para que todas sean cuadradas sin deformarse:

```css
.galeria img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
```

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (el visor) -->

Usa un `<dialog>` y ábrelo con `showModal()`: ya trae el fondo oscuro (`::backdrop`), el cierre con **Escape** y bloquea el resto de la página mientras está abierto.

Para "dar la vuelta" al llegar al final, usa el resto: `(indice + 1) % FOTOS.length` para la siguiente y `(indice - 1 + FOTOS.length) % FOTOS.length` para la anterior.

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<main>
  <h1>Galería</h1>
  <ul class="galeria" id="galeria"></ul>
</main>

<dialog class="visor" id="visor" aria-label="Visor de fotos">
  <figure>
    <img id="visor-imagen" src="" alt="">
    <figcaption id="visor-texto"></figcaption>
  </figure>

  <div class="visor__controles">
    <button id="anterior" aria-label="Foto anterior">←</button>
    <span id="visor-contador"></span>
    <button id="siguiente" aria-label="Foto siguiente">→</button>
  </div>

  <button class="visor__cerrar" id="cerrar" aria-label="Cerrar visor">✕</button>
</dialog>
```

```css playground=solucion
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.galeria button {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  border-radius: 10px;
  overflow: hidden;
  cursor: zoom-in;
}

.galeria img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  transition: scale 0.3s;
}

.galeria button:hover img {
  scale: 1.05;
}

button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

/* El visor */
.visor {
  width: min(100% - 32px, 960px);
  padding: 0; /* el relleno va en los hijos: así un clic en el propio dialog solo puede ser en el fondo */
  border: none;
  border-radius: 16px;
  background: #18181b;
  color: white;
}

.visor::backdrop {
  background: rgb(0 0 0 / 0.85);
}

.visor figure {
  margin: 0;
  padding: 16px 16px 0;
}

.visor img {
  display: block;
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.visor figcaption {
  margin-top: 12px;
  text-align: center;
}

.visor__controles {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 12px 16px 16px;
  font-variant-numeric: tabular-nums;
}

.visor button {
  min-width: 44px;
  min-height: 44px;
  border: none;
  border-radius: 999px;
  background: #3f3f46;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.visor__cerrar {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

```js playground=solucion
const FOTOS = [
  { src: 'https://picsum.photos/seed/montana/1200/800', alt: 'Montañas nevadas al amanecer' },
  { src: 'https://picsum.photos/seed/playa/1200/800', alt: 'Playa de arena blanca con palmeras' },
  { src: 'https://picsum.photos/seed/ciudad/1200/800', alt: 'Calle de una ciudad de noche' },
  { src: 'https://picsum.photos/seed/bosque/1200/800', alt: 'Sendero en un bosque otoñal' },
  { src: 'https://picsum.photos/seed/lago/1200/800', alt: 'Lago en calma rodeado de árboles' },
  { src: 'https://picsum.photos/seed/desierto/1200/800', alt: 'Dunas del desierto al atardecer' }
]

const galeria = document.querySelector('#galeria')
const visor = document.querySelector('#visor')
const imagen = document.querySelector('#visor-imagen')
const texto = document.querySelector('#visor-texto')
const contador = document.querySelector('#visor-contador')

let actual = 0
let botonQueAbrio = null

// 1. Pintar las miniaturas
galeria.replaceChildren(...FOTOS.map((foto, i) => {
  const item = document.createElement('li')
  const boton = document.createElement('button')
  boton.dataset.indice = i
  boton.setAttribute('aria-label', `Ampliar: ${foto.alt}`)

  const miniatura = document.createElement('img')
  // Picsum permite pedir la foto más pequeña para la miniatura
  miniatura.src = foto.src.replace('1200/800', '400/400')
  miniatura.alt = '' // el nombre ya lo da el aria-label del botón
  miniatura.loading = 'lazy'
  miniatura.width = 400
  miniatura.height = 400

  boton.append(miniatura)
  item.append(boton)
  return item
}))

// 2. Mostrar una foto en el visor
function mostrar(indice) {
  actual = (indice + FOTOS.length) % FOTOS.length // da la vuelta en los dos sentidos
  const foto = FOTOS[actual]
  imagen.src = foto.src
  imagen.alt = foto.alt
  texto.textContent = foto.alt
  contador.textContent = `${actual + 1} / ${FOTOS.length}`
}

// 3. Abrir y cerrar
galeria.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button')
  if (!boton) return
  botonQueAbrio = boton
  mostrar(Number(boton.dataset.indice))
  visor.showModal()
})

document.querySelector('#cerrar').addEventListener('click', () => visor.close())
document.querySelector('#anterior').addEventListener('click', () => mostrar(actual - 1))
document.querySelector('#siguiente').addEventListener('click', () => mostrar(actual + 1))

// Clic en el fondo oscuro (fuera del contenido) = cerrar
visor.addEventListener('click', (evento) => {
  if (evento.target === visor) visor.close()
})

// Flechas del teclado (Escape ya lo gestiona el <dialog>)
visor.addEventListener('keydown', (evento) => {
  if (evento.key === 'ArrowLeft') mostrar(actual - 1)
  if (evento.key === 'ArrowRight') mostrar(actual + 1)
})

// Al cerrar (con el botón, Escape o el fondo), el foco vuelve a la miniatura
visor.addEventListener('close', () => botonQueAbrio?.focus())
```

Las decisiones que más se valoran:

- **Miniaturas como `<button>`**: se abren con `Tab` + `Enter` sin programar nada, y el `aria-label` dice qué foto se amplía.
- **`<dialog>` con `showModal()`**: fondo, cierre con Escape, bloqueo del resto de la página y gestión del foco, **gratis**. Lo vimos en el post del modal.
- **El evento `close`** se dispara se cierre como se cierre el visor, así que el foco vuelve siempre a la miniatura correcta. Sin esto, quien usa el teclado volvería al principio de la página.
- **`(indice + FOTOS.length) % FOTOS.length`**: una sola fórmula para dar la vuelta en los dos sentidos (de la última a la primera y de la primera a la última).
- **Miniaturas pequeñas y con `loading="lazy"`**: no descargamos fotos de 1200px para mostrarlas a 150px.
- **`object-fit: cover`** en las miniaturas y **`contain`** en el visor: cuadradas sin deformar en la cuadrícula, enteras en grande (lo vimos en el post de `object-fit`).
- **Botones de 44×44 px** como mínimo: un tamaño cómodo para tocar con el dedo.

<!-- /solucion -->

## Ideas para ampliarlo

1. **Deslizar con el dedo** en el móvil para cambiar de foto (eventos `pointerdown` y `pointerup`, comparando la posición `clientX`).
2. **Precargar** la foto siguiente para que aparezca al instante (`new Image().src = ...`).
3. Animar el cambio de foto con **View Transitions** (tiene su post).
4. Guardar la foto abierta en la URL (`#foto-3`) para poder **compartir** un enlace directo.
