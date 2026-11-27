---
title: 'Mini proyecto: piedra, papel o tijera contra el ordenador'
description: 'Un juego completo con HTML, CSS y JavaScript: elegir una jugada, que el ordenador elija al azar, decidir quién gana y llevar el marcador. Con enunciado, pistas y solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, JavaScript, Proyectos]
draft: true
---

Un juego es una forma genial de practicar, porque **sabes enseguida si funciona**. Piedra, papel o tijera tiene justo lo que necesitas a estas alturas: eventos, números aleatorios, condicionales y actualizar la página.

Tiempo recomendado: **60 minutos**.

## El enunciado

> Crea un juego de piedra, papel o tijera contra el ordenador:
>
> 1. Tres botones: 🪨 Piedra, 📄 Papel y ✂️ Tijera.
> 2. Al pulsar uno, el ordenador elige una jugada **al azar**.
> 3. Se muestran las dos jugadas y el resultado: "¡Ganaste!", "Perdiste" o "Empate".
> 4. Un **marcador** cuenta las victorias del jugador y del ordenador.
> 5. Un botón **"Reiniciar"** pone el marcador a cero.
>
> Las reglas: la piedra gana a la tijera, la tijera gana al papel y el papel gana a la piedra.

**Requisitos:**

- Se puede jugar solo con el teclado.
- El resultado se anuncia a los lectores de pantalla.
- Se ve bien en el móvil.

## Tu turno

```html playground=reto
<main class="juego">
  <h1>Piedra, papel o tijera</h1>

  <!-- Los tres botones de jugada -->

  <!-- Dónde se muestran las jugadas y el resultado -->

  <!-- El marcador y el botón de reiniciar -->
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

<!-- solucion: Ver la pista 1 (la jugada del ordenador) -->

Guarda las jugadas en un array: `const jugadas = ['piedra', 'papel', 'tijera']`. Para elegir una al azar, genera una posición aleatoria:

```js
const posicion = Math.floor(Math.random() * jugadas.length) // 0, 1 o 2
```

`Math.random()` da un decimal entre 0 y 1 (sin llegar a 1); al multiplicarlo por 3 y redondear hacia abajo con `Math.floor`, obtienes 0, 1 o 2.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (quién gana) -->

En vez de escribir los 9 casos con `if`, guarda en un objeto **a qué jugada le gana cada una**:

```js
const ganaA = {
  piedra: 'tijera',
  papel: 'piedra',
  tijera: 'papel'
}
```

Si las dos jugadas son iguales, es empate. Si `ganaA[jugador] === ordenador`, gana el jugador. Si no, gana el ordenador. Tres casos en lugar de nueve.

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<main class="juego">
  <h1>Piedra, papel o tijera</h1>

  <div class="opciones" role="group" aria-label="Elige tu jugada">
    <button data-jugada="piedra"><span aria-hidden="true">🪨</span> Piedra</button>
    <button data-jugada="papel"><span aria-hidden="true">📄</span> Papel</button>
    <button data-jugada="tijera"><span aria-hidden="true">✂️</span> Tijera</button>
  </div>

  <section class="ronda" aria-live="polite">
    <p id="jugadas">Elige una jugada para empezar.</p>
    <p id="resultado" class="resultado"></p>
  </section>

  <dl class="marcador">
    <div><dt>Tú</dt><dd id="puntos-jugador">0</dd></div>
    <div><dt>Ordenador</dt><dd id="puntos-ordenador">0</dd></div>
  </dl>

  <button id="reiniciar" class="reiniciar">Reiniciar marcador</button>
</main>
```

```css playground=solucion
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #f4f4f5;
}

.juego {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 16px;
  background: white;
  text-align: center;
}

.opciones {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.opciones button {
  padding: 16px 8px;
  border: 2px solid #e4e4e7;
  border-radius: 12px;
  background: white;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.15s, scale 0.15s;
}

.opciones button span {
  display: block;
  font-size: 32px;
}

.opciones button:hover {
  border-color: #6366f1;
}

.opciones button:active {
  scale: 0.95;
}

button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

.resultado {
  min-height: 1.5em;
  font-size: 24px;
  font-weight: 700;
}

.resultado.gana { color: #16a34a; }
.resultado.pierde { color: #dc2626; }
.resultado.empate { color: #71717a; }

.marcador {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.marcador dd {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.reiniciar {
  padding: 8px 16px;
  border: none;
  background: none;
  color: #6366f1;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
```

```js playground=solucion
const JUGADAS = ['piedra', 'papel', 'tijera']
const EMOJIS = { piedra: '🪨', papel: '📄', tijera: '✂️' }
const GANA_A = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' }

const marcador = { jugador: 0, ordenador: 0 }

const elementos = {
  jugadas: document.querySelector('#jugadas'),
  resultado: document.querySelector('#resultado'),
  puntosJugador: document.querySelector('#puntos-jugador'),
  puntosOrdenador: document.querySelector('#puntos-ordenador')
}

// Lógica pura: no toca la página
const jugadaAleatoria = () => JUGADAS[Math.floor(Math.random() * JUGADAS.length)]

function decidir(jugador, ordenador) {
  if (jugador === ordenador) return 'empate'
  return GANA_A[jugador] === ordenador ? 'gana' : 'pierde'
}

// Pintar: todo lo que se ve sale del estado
const TEXTOS = { gana: '¡Ganaste! 🎉', pierde: 'Perdiste 😢', empate: 'Empate 🤝' }

function pintarMarcador() {
  elementos.puntosJugador.textContent = marcador.jugador
  elementos.puntosOrdenador.textContent = marcador.ordenador
}

function jugar(jugador) {
  const ordenador = jugadaAleatoria()
  const resultado = decidir(jugador, ordenador)

  if (resultado === 'gana') marcador.jugador++
  if (resultado === 'pierde') marcador.ordenador++

  elementos.jugadas.textContent = `Tú: ${EMOJIS[jugador]} ${jugador} · Ordenador: ${EMOJIS[ordenador]} ${ordenador}`
  elementos.resultado.textContent = TEXTOS[resultado]
  elementos.resultado.className = `resultado ${resultado}`
  pintarMarcador()
}

document.querySelector('.opciones').addEventListener('click', (evento) => {
  const boton = evento.target.closest('button')
  if (boton) jugar(boton.dataset.jugada)
})

document.querySelector('#reiniciar').addEventListener('click', () => {
  marcador.jugador = 0
  marcador.ordenador = 0
  elementos.jugadas.textContent = 'Elige una jugada para empezar.'
  elementos.resultado.textContent = ''
  pintarMarcador()
})
```

Las decisiones que más se valoran:

- **Un objeto `GANA_A`** en vez de nueve `if`: las reglas son **datos**. Añadir "lagarto" y "Spock" sería ampliar el objeto (y cambiar los valores por arrays).
- **Lógica separada de la página**: `jugadaAleatoria` y `decidir` no tocan el DOM, así que se pueden probar en la consola (`decidir('piedra', 'tijera')` → `'gana'`).
- **Delegación de eventos**: un solo listener en el grupo de botones, y `data-jugada` para saber cuál se pulsó.
- **`aria-live="polite"`** en la zona del resultado, para que un lector de pantalla anuncie quién ganó.
- **Los emojis con `aria-hidden`** y el texto al lado: el lector dice "Piedra", no "roca, Piedra".
- **`<dl>`** para el marcador: es una lista de nombre → valor.

<!-- /solucion -->

## Ideas para ampliarlo

1. **Al mejor de 5**: el primero que llegue a 3 victorias gana la partida, y se bloquean los botones hasta reiniciar.
2. **Guardar el marcador** en `localStorage` para que no se pierda al recargar.
3. **Historial** de las últimas 5 rondas.
4. **Una pequeña animación** de "piedra, papel, tijera... ¡ya!" antes de mostrar el resultado, con `setTimeout` (respetando `prefers-reduced-motion`).
