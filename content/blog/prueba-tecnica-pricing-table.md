---
title: 'Prueba técnica de maquetación: una tabla de precios con plan destacado'
description: 'Maqueta tres planes de precios con un plan "Más popular" destacado, listas de ventajas de distinta longitud y botones alineados abajo, con un selector mensual / anual.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, JavaScript, Pruebas técnicas, Grid]
draft: true
---

La sección de **precios** (*pricing*) aparece en casi todas las webs de productos digitales, y es una prueba de maquetación muy habitual porque esconde varios retos: tarjetas de **distinta altura** que deben verse alineadas, un plan **destacado** que sobresale y un selector que **cambia los precios**.

Tiempo recomendado: **60 minutos**.

## El enunciado

> Maqueta una sección de precios con tres planes:
>
> | Plan | Mensual | Anual (por mes) | Ventajas |
> | --- | --- | --- | --- |
> | Gratis | S/ 0 | S/ 0 | 1 proyecto, 100 MB |
> | Pro | S/ 29 | S/ 23 | Proyectos ilimitados, 10 GB, soporte por email, dominio propio |
> | Equipo | S/ 79 | S/ 63 | Todo lo de Pro, 5 usuarios, 100 GB, soporte prioritario, informes, acceso a la API |
>
> Requisitos:
>
> 1. El plan **Pro** está destacado con una etiqueta **"Más popular"** y un borde de color.
> 2. Los **botones** de los tres planes quedan **alineados abajo**, aunque las listas tengan distinta longitud.
> 3. Un selector **Mensual / Anual** cambia los precios (el anual muestra "Ahorra 20 %").
> 4. En el móvil, los planes se apilan en una columna, **con el destacado primero**.
> 5. Accesible: el selector se puede usar con el teclado y su estado se anuncia.

## Tu turno

```html playground=reto
<section class="precios">
  <h2>Elige tu plan</h2>
  <!-- El selector mensual / anual -->
  <!-- Los tres planes -->
</section>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #fafafa;
}

/* tu CSS aquí */
```

```js playground=reto
// tu JavaScript aquí
```

<!-- solucion: Ver la pista 1 (botones abajo) -->

Igual que en la tarjeta de producto: cada plan es una columna flex (`display: flex; flex-direction: column`) y el botón lleva `margin-top: auto`, que lo empuja al final. Como los elementos de un grid se estiran a la altura de la fila, todas las tarjetas miden lo mismo y los botones quedan alineados.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (el destacado primero en el móvil) -->

En el HTML, pon los planes en su orden lógico (Gratis, Pro, Equipo). En el móvil, cambia solo el orden **visual** del destacado con `order: -1`, y quítalo en pantallas grandes. Ojo: `order` no cambia el orden del `Tab` (lo vimos en el post de accesibilidad y teclado), así que úsalo solo para casos así de pequeños.

<!-- /solucion -->

<!-- solucion: Ver la pista 3 (el selector) -->

Un selector de dos opciones excluyentes es, por significado, un **grupo de radios**. Con dos `<input type="radio">` ocultos visualmente (pero no para el lector de pantalla) y sus `<label>` con estilo de botón, tienes teclado y accesibilidad gratis.

Guarda los dos precios en atributos `data-mensual` y `data-anual` y, al cambiar el radio, actualiza el texto.

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<section class="precios" aria-labelledby="titulo-precios">
  <h2 id="titulo-precios">Elige tu plan</h2>

  <fieldset class="periodo">
    <legend class="sr-only">Periodo de facturación</legend>
    <input type="radio" name="periodo" id="mensual" value="mensual" checked>
    <label for="mensual">Mensual</label>
    <input type="radio" name="periodo" id="anual" value="anual">
    <label for="anual">Anual <span class="ahorro">Ahorra 20 %</span></label>
  </fieldset>

  <div class="planes">
    <article class="plan">
      <h3>Gratis</h3>
      <p class="plan__precio"><span data-mensual="0" data-anual="0">S/ 0</span> <small>/ mes</small></p>
      <ul>
        <li>1 proyecto</li>
        <li>100 MB de almacenamiento</li>
      </ul>
      <a class="plan__boton" href="#registro">Empezar gratis</a>
    </article>

    <article class="plan plan--destacado" aria-labelledby="plan-pro">
      <p class="plan__etiqueta">Más popular</p>
      <h3 id="plan-pro">Pro</h3>
      <p class="plan__precio"><span data-mensual="29" data-anual="23">S/ 29</span> <small>/ mes</small></p>
      <ul>
        <li>Proyectos ilimitados</li>
        <li>10 GB de almacenamiento</li>
        <li>Soporte por email</li>
        <li>Dominio propio</li>
      </ul>
      <a class="plan__boton" href="#comprar-pro">Elegir Pro</a>
    </article>

    <article class="plan">
      <h3>Equipo</h3>
      <p class="plan__precio"><span data-mensual="79" data-anual="63">S/ 79</span> <small>/ mes</small></p>
      <ul>
        <li>Todo lo de Pro</li>
        <li>Hasta 5 usuarios</li>
        <li>100 GB de almacenamiento</li>
        <li>Soporte prioritario</li>
        <li>Informes de uso</li>
        <li>Acceso a la API</li>
      </ul>
      <a class="plan__boton" href="#comprar-equipo">Elegir Equipo</a>
    </article>
  </div>
</section>
```

```css playground=solucion
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: #fafafa;
  color: #18181b;
}

.precios {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

/* ── El selector ── */
.periodo {
  display: inline-flex;
  gap: 4px;
  margin: 0 0 32px;
  padding: 4px;
  border: none;
  border-radius: 999px;
  background: #e4e4e7;
}

/* Ocultamos el círculo del radio, pero no para el lector de pantalla ni el teclado */
.periodo input {
  position: absolute;
  opacity: 0;
}

.periodo label {
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
}

.periodo input:checked + label {
  background: white;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.1);
  font-weight: 600;
}

.periodo input:focus-visible + label {
  outline: 3px solid #f59e0b;
}

.ahorro {
  color: #16a34a;
  font-size: 13px;
}

/* ── Los planes ── */
.planes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  align-items: stretch; /* todas las tarjetas igual de altas (es el valor por defecto) */
}

.plan {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 2px solid #e4e4e7;
  border-radius: 16px;
  background: white;
  text-align: left;
}

.plan h3 {
  margin: 0;
}

.plan__precio span {
  font-size: 40px;
  font-weight: 800;
}

.plan ul {
  display: grid;
  gap: 8px;
  margin: 0 0 24px;
  padding: 0;
  list-style: none;
}

.plan li::before {
  content: '✓ ';
  color: #16a34a;
  font-weight: 700;
}

/* Empuja el botón al final de la tarjeta */
.plan__boton {
  margin-top: auto;
  padding: 12px;
  border: 2px solid #4f46e5;
  border-radius: 10px;
  color: #4f46e5;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}

.plan__boton:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

/* ── El plan destacado ── */
.plan--destacado {
  border-color: #4f46e5;
  box-shadow: 0 12px 32px rgb(79 70 229 / 0.18);
  order: -1; /* en el móvil, primero */
}

.plan--destacado .plan__boton {
  background: #4f46e5;
  color: white;
}

.plan__etiqueta {
  align-self: flex-start;
  margin: 0 0 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 13px;
  font-weight: 700;
}

/* En pantallas grandes: orden normal y el destacado un poco más alto */
@media (min-width: 860px) {
  .plan--destacado {
    order: 0;
    scale: 1.04;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

```js playground=solucion
const precios = document.querySelectorAll('[data-mensual]')

document.querySelector('.periodo').addEventListener('change', (evento) => {
  const periodo = evento.target.value // 'mensual' o 'anual'
  precios.forEach((precio) => {
    precio.textContent = `S/ ${precio.dataset[periodo]}`
  })
})
```

Las decisiones que más se valoran:

- **Radios para el selector.** Es un "elige una de dos": con radios, las flechas del teclado cambian de opción y el lector anuncia "Mensual, botón de radio, seleccionado, 1 de 2". Ocultarlos con `opacity: 0` (y no con `display: none`) mantiene el teclado funcionando.
- **`input:checked + label`**: el estilo de la opción activa sale del propio estado del radio, sin clases extra. El selector **visual** funciona sin JavaScript; el JS solo cambia los precios.
- **Los precios en `data-*`**: los datos están en el HTML y el JavaScript es de 6 líneas. Añadir un plan no obliga a tocarlo.
- **`flex-direction: column` + `margin-top: auto`**: botones alineados abajo, como en la tarjeta de producto.
- **`order: -1` solo en el móvil** para mostrar primero el plan destacado, sin cambiar el HTML.
- **`scale: 1.04`** en escritorio para que el destacado sobresalga sin alterar el layout de los demás (lo vimos en el post de `transform`).
- **La etiqueta "Más popular" en el HTML**, no como `::before` en el CSS: es información útil y los lectores de pantalla deben leerla.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Los botones alineados** con tarjetas de distinta altura. Es el detalle que más se nota.
- **Que el selector sea accesible**, no dos `<div>` con clics.
- **Responsive** con el destacado bien colocado en el móvil.
- **CSS ordenado**: un modificador (`.plan--destacado`) en vez de repetir todos los estilos.
