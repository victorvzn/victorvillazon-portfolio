---
title: 'Mini proyecto: una calculadora de IMC con HTML, CSS y JavaScript'
description: 'Tu primer proyecto completo: un formulario que calcula el Índice de Masa Corporal y muestra el resultado con color. Con enunciado, pistas y solución oculta.'
date: 2026-11-27
series: ejercicios
tags: [HTML, CSS, JavaScript, Proyectos]
draft: false
---

Ya sabes hacer formularios, darles estilo y responder a eventos. Toca juntarlo todo en un **proyecto pequeño pero completo**: una calculadora del **Índice de Masa Corporal (IMC)**.

Es un proyecto ideal para empezar porque tiene un poco de todo: HTML con formulario, CSS para que se vea bien y JavaScript que lee datos, calcula y muestra un resultado.

Tiempo recomendado: **60 minutos**.

## El enunciado

> Crea una página con un formulario que pida la **altura en centímetros** y el **peso en kilos**. Al pulsar "Calcular", muestra el IMC con un decimal y su clasificación:
>
> | IMC | Clasificación |
> | --- | --- |
> | Menos de 18.5 | Bajo peso |
> | De 18.5 a 24.9 | Normal |
> | De 25 a 29.9 | Sobrepeso |
> | 30 o más | Obesidad |
>
> **Fórmula**: IMC = peso (kg) ÷ altura (m)². Ojo: la altura llega en **centímetros** y la fórmula la necesita en **metros**.

**Requisitos:**

1. Los dos campos son obligatorios y solo aceptan números positivos.
2. El resultado aparece en la misma página, sin recargarla.
3. La clasificación se muestra con un color distinto según el resultado.
4. Debe poder usarse solo con el teclado y verse bien en el móvil.

> Aviso: el IMC es una referencia general y no sustituye la opinión de un profesional de la salud.

## Tu turno

Te dejo el esqueleto del HTML. El CSS y el JavaScript son cosa tuya:

```html playground=reto
<main class="tarjeta">
  <h1>Calculadora de IMC</h1>

  <form id="formulario">
    <!-- Campo de altura (cm) -->
    <!-- Campo de peso (kg) -->
    <!-- Botón "Calcular" -->
  </form>

  <!-- Aquí va el resultado -->
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

<!-- solucion: Ver la pista 1 (el formulario) -->

Usa `<input type="number">` con `required`, `min` y `step`: así el navegador valida por ti que el campo no esté vacío y que el número sea positivo. Cada input necesita su `<label>` con un `for` que coincida con el `id` del input.

Escucha el evento **`submit`** del formulario (no el `click` del botón): así también funciona al pulsar `Enter`. Y no olvides `event.preventDefault()` para que la página no se recargue.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (el cálculo) -->

Los valores de un input llegan como **texto**: conviértelos con `Number()`. Luego pasa la altura a metros dividiendo entre 100 y aplica la fórmula: `peso / (alturaEnMetros * alturaEnMetros)`.

Para la clasificación, una cadena de `if / else if` de menor a mayor.

<!-- /solucion -->

<!-- solucion: Ver la solución completa -->

```html playground=solucion
<main class="tarjeta">
  <h1>Calculadora de IMC</h1>

  <form id="formulario">
    <div class="campo">
      <label for="altura">Altura (cm)</label>
      <input id="altura" type="number" min="50" max="250" step="0.1" required placeholder="170">
    </div>

    <div class="campo">
      <label for="peso">Peso (kg)</label>
      <input id="peso" type="number" min="10" max="400" step="0.1" required placeholder="65">
    </div>

    <button type="submit">Calcular</button>
  </form>

  <section class="resultado" id="resultado" aria-live="polite" hidden>
    <p class="numero"><span id="imc"></span></p>
    <p class="etiqueta" id="clasificacion"></p>
  </section>
</main>
```

```css playground=solucion
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #f4f4f5;
}

.tarjeta {
  max-width: 360px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);
}

h1 {
  margin: 0 0 20px;
  font-size: 22px;
}

form {
  display: grid;
  gap: 16px;
}

.campo {
  display: grid;
  gap: 6px;
}

label {
  font-weight: 600;
}

input {
  padding: 10px 12px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  font: inherit;
}

button {
  min-height: 44px;
  border: none;
  border-radius: 10px;
  background: #18181b;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

input:focus-visible,
button:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}

.resultado {
  margin-top: 24px;
  text-align: center;
}

.numero {
  margin: 0;
  font-size: 48px;
  font-weight: 800;
}

.etiqueta {
  display: inline-block;
  margin: 8px 0 0;
  padding: 4px 14px;
  border-radius: 999px;
  font-weight: 600;
}

/* Un color por clasificación */
.bajo { background: #dbeafe; color: #1e40af; }
.normal { background: #dcfce7; color: #166534; }
.sobrepeso { background: #fef3c7; color: #92400e; }
.obesidad { background: #fee2e2; color: #991b1b; }
```

```js playground=solucion
const formulario = document.querySelector('#formulario')
const resultado = document.querySelector('#resultado')
const imcTexto = document.querySelector('#imc')
const clasificacionTexto = document.querySelector('#clasificacion')

function calcularImc(alturaCm, pesoKg) {
  const alturaM = alturaCm / 100
  return pesoKg / (alturaM * alturaM)
}

function clasificar(imc) {
  if (imc < 18.5) return { texto: 'Bajo peso', clase: 'bajo' }
  if (imc < 25) return { texto: 'Normal', clase: 'normal' }
  if (imc < 30) return { texto: 'Sobrepeso', clase: 'sobrepeso' }
  return { texto: 'Obesidad', clase: 'obesidad' }
}

formulario.addEventListener('submit', (event) => {
  event.preventDefault()

  const altura = Number(document.querySelector('#altura').value)
  const peso = Number(document.querySelector('#peso').value)

  const imc = calcularImc(altura, peso)
  const { texto, clase } = clasificar(imc)

  imcTexto.textContent = imc.toFixed(1)
  clasificacionTexto.textContent = texto
  clasificacionTexto.className = `etiqueta ${clase}`
  resultado.hidden = false
})
```

Las decisiones que más se valoran:

**HTML**

- **`type="number"` con `min`, `max`, `step` y `required`**: el navegador valida antes de que tu JavaScript se ejecute. El `submit` ni siquiera se dispara si un campo está vacío o fuera de rango.
- **`<label for="...">`** en cada campo: al pulsar la etiqueta se enfoca el input, y el lector de pantalla sabe qué es cada campo.
- **`aria-live="polite"`** en el resultado: el lector de pantalla anuncia el IMC cuando aparece.
- **`hidden`**: el resultado no se ve hasta el primer cálculo.

**JavaScript**

- **Escuchamos `submit`**, no `click`: funciona con el botón y con `Enter`.
- **Funciones pequeñas con una sola tarea**: `calcularImc` solo calcula y `clasificar` solo clasifica. Son fáciles de probar por separado, incluso sin la página.
- **`clasificar` devuelve un objeto** con el texto y la clase CSS: así el color y el texto nunca se desincronizan.
- **Los `if` con `return` temprano**: como cada `return` termina la función, no hace falta escribir `imc >= 18.5 && imc < 25`.
- **`toFixed(1)` solo para mostrar**: el cálculo se hace con el número completo.

<!-- /solucion -->

## Retos extra

Si terminaste y quieres más:

1. Muestra también el **rango de peso saludable** para esa altura (el peso con el que el IMC estaría entre 18.5 y 24.9).
2. Guarda el último cálculo en **`localStorage`** para que siga ahí al recargar la página.
3. Añade un selector para usar **pies y libras** además de centímetros y kilos.

<!-- solucion: Ver la solución del reto 1 -->

Despeja el peso en la fórmula: **peso = IMC × altura²**. Con los dos límites del rango normal:

```js playground=reto-extra
function pesoSaludable(alturaCm) {
  const alturaM = alturaCm / 100
  const minimo = 18.5 * alturaM * alturaM
  const maximo = 24.9 * alturaM * alturaM
  return `Entre ${minimo.toFixed(1)} y ${maximo.toFixed(1)} kg`
}

console.log(pesoSaludable(170)) // Entre 53.5 y 72.0 kg
console.log(pesoSaludable(160)) // Entre 47.4 y 63.7 kg
```

<!-- /solucion -->
