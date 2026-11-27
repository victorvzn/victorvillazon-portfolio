---
title: 'Mini proyecto: un cronómetro con vueltas'
description: 'Un cronómetro con iniciar, pausar, reiniciar y guardar vueltas. Practica setInterval, Date.now y formatear tiempo, y aprende por qué contar segundos con un contador falla.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, JavaScript, Proyectos]
draft: true
---

Un cronómetro parece fácil: un número que sube cada segundo. Pero esconde una trampa que les pasa a casi todos los principiantes, y descubrirla te enseña cómo funcionan de verdad los temporizadores de JavaScript.

Tiempo recomendado: **60 minutos**.

## El enunciado

> Crea un cronómetro que muestre minutos, segundos y centésimas (`00:00.00`), con:
>
> 1. Un botón **Iniciar / Pausar** (el mismo botón cambia de texto).
> 2. Un botón **Vuelta** que guarda el tiempo actual en una lista (solo funciona mientras corre).
> 3. Un botón **Reiniciar** que lo pone a cero y borra las vueltas (solo funciona en pausa).
> 4. Al pausar y reanudar, el tiempo **sigue desde donde estaba**.

**Requisitos:**

- El tiempo debe ser **preciso**: después de un minuto, debe marcar un minuto, aunque la pestaña haya estado en segundo plano.
- Los botones que no se pueden usar en cada momento deben estar deshabilitados.

## Tu turno

```html playground=reto
<main class="cronometro">
  <p class="tiempo" id="tiempo">00:00.00</p>
  <!-- Los botones -->
  <!-- La lista de vueltas -->
</main>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #18181b;
  color: white;
}

/* tu CSS aquí */
```

```js playground=reto
// tu JavaScript aquí
```

<!-- solucion: Ver la pista 1 (la trampa) -->

La idea "intuitiva" es esta:

```js
let centesimas = 0
setInterval(() => centesimas++, 10)
```

**Falla.** `setInterval` no garantiza que se ejecute exactamente cada 10 ms: si el navegador está ocupado, se retrasa (lo vimos en el post del event loop). Y si cambias de pestaña, los navegadores **frenan** los temporizadores para ahorrar batería. Al volver, tu cronómetro irá muy por detrás del tiempo real.

La solución: **no cuentes tú el tiempo; pregúntale al reloj**. Guarda el momento en que empezaste con `Date.now()` y, en cada actualización, calcula `Date.now() - inicio`. El intervalo solo sirve para **repintar**, no para medir.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (pausar y reanudar) -->

Guarda en una variable el **tiempo acumulado** antes de la pausa. Al reanudar, el tiempo total es:

```
acumulado + (Date.now() - inicioDeEsteTramo)
```

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<main class="cronometro">
  <p class="tiempo" id="tiempo" role="timer" aria-live="off">00:00.00</p>

  <div class="botones">
    <button id="iniciar" class="principal">Iniciar</button>
    <button id="vuelta" disabled>Vuelta</button>
    <button id="reiniciar" disabled>Reiniciar</button>
  </div>

  <ol class="vueltas" id="vueltas" aria-label="Vueltas"></ol>
</main>
```

```css playground=solucion
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #18181b;
  color: white;
}

.cronometro {
  max-width: 360px;
  margin: 0 auto;
  text-align: center;
}

.tiempo {
  margin: 24px 0;
  font-size: clamp(48px, 15vw, 72px);
  font-weight: 300;
  /* Todos los números ocupan lo mismo: el texto no "baila" al cambiar */
  font-variant-numeric: tabular-nums;
}

.botones {
  display: flex;
  justify-content: center;
  gap: 12px;
}

button {
  min-width: 96px;
  padding: 12px;
  border: none;
  border-radius: 999px;
  background: #3f3f46;
  color: white;
  font: inherit;
  cursor: pointer;
}

button.principal {
  background: #16a34a;
}

button.principal.corriendo {
  background: #dc2626;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

.vueltas {
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
  font-variant-numeric: tabular-nums;
}

.vueltas li {
  display: flex;
  justify-content: space-between;
  padding: 10px 4px;
  border-bottom: 1px solid #3f3f46;
}
```

```js playground=solucion
const elementos = {
  tiempo: document.querySelector('#tiempo'),
  iniciar: document.querySelector('#iniciar'),
  vuelta: document.querySelector('#vuelta'),
  reiniciar: document.querySelector('#reiniciar'),
  vueltas: document.querySelector('#vueltas')
}

// Estado
let acumulado = 0      // ms de los tramos anteriores a la última pausa
let inicioTramo = null // Date.now() del tramo actual, o null si está en pausa
let intervalo = null
let vueltas = []

const corriendo = () => inicioTramo !== null
const tiempoActual = () => acumulado + (corriendo() ? Date.now() - inicioTramo : 0)

// Lógica pura: milisegundos → "mm:ss.cc"
function formatear(ms) {
  const minutos = Math.floor(ms / 60000)
  const segundos = Math.floor((ms % 60000) / 1000)
  const centesimas = Math.floor((ms % 1000) / 10)
  const dos = (n) => String(n).padStart(2, '0')
  return `${dos(minutos)}:${dos(segundos)}.${dos(centesimas)}`
}

function pintar() {
  elementos.tiempo.textContent = formatear(tiempoActual())
  elementos.iniciar.textContent = corriendo() ? 'Pausar' : (acumulado > 0 ? 'Reanudar' : 'Iniciar')
  elementos.iniciar.classList.toggle('corriendo', corriendo())
  elementos.vuelta.disabled = !corriendo()
  elementos.reiniciar.disabled = corriendo() || acumulado === 0

  elementos.vueltas.replaceChildren(...vueltas.map((ms, i) => {
    const item = document.createElement('li')
    const nombre = document.createElement('span')
    nombre.textContent = `Vuelta ${i + 1}`
    const valor = document.createElement('span')
    valor.textContent = formatear(ms)
    item.append(nombre, valor)
    return item
  }).reverse()) // la más reciente arriba
}

elementos.iniciar.addEventListener('click', () => {
  if (corriendo()) {
    acumulado = tiempoActual()
    inicioTramo = null
    clearInterval(intervalo)
  } else {
    inicioTramo = Date.now()
    // El intervalo solo repinta; el tiempo lo da Date.now()
    intervalo = setInterval(() => {
      elementos.tiempo.textContent = formatear(tiempoActual())
    }, 31)
  }
  pintar()
})

elementos.vuelta.addEventListener('click', () => {
  vueltas.push(tiempoActual())
  pintar()
})

elementos.reiniciar.addEventListener('click', () => {
  acumulado = 0
  vueltas = []
  pintar()
})

pintar()
```

Las decisiones que más se valoran:

- **El tiempo se calcula con `Date.now()`**, no contando ticks. Aunque el intervalo se retrase o la pestaña se congele, el valor es siempre correcto. El intervalo de 31 ms solo decide **cada cuánto se repinta** (unas 30 veces por segundo, suficiente para la vista).
- **Pausar = guardar lo acumulado.** El estado son solo tres datos (`acumulado`, `inicioTramo` y `vueltas`), y todo lo demás (textos, botones habilitados) se **calcula** a partir de ellos en `pintar()`.
- **`formatear` es una función pura**: se puede probar en la consola con `formatear(83456)` → `'01:23.45'`.
- **`font-variant-numeric: tabular-nums`**: hace que todos los dígitos ocupen el mismo ancho, para que el número no "baile" al cambiar. Un detalle que se nota muchísimo.
- **`role="timer"` con `aria-live="off"`**: indica a los lectores de pantalla que es un cronómetro, pero sin anunciar cada centésima (sería insoportable).

<!-- /solucion -->

## Ideas para ampliarlo

1. Marca en verde la **vuelta más rápida** y en rojo la más lenta (calcula la duración de cada vuelta restando la anterior).
2. Atajos de teclado: **Espacio** para iniciar/pausar y **V** para vuelta.
3. Convierte el cronómetro en una **cuenta atrás** (un temporizador de cocina) que avise con un sonido al llegar a cero.
4. Muestra el tiempo también en el **título de la pestaña** (`document.title`) mientras corre.
