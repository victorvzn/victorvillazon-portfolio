---
title: ':root y custom properties a fondo: alcance, herencia y componentes'
description: 'Qué es :root de verdad, cómo se heredan las variables CSS, cómo crear variables por componente, combinarlas con calc(), cambiarlas desde JavaScript y tiparlas con @property.'
date: 2026-11-26
series: css
tags: [CSS, Variables, Buenas prácticas]
draft: true
---

En el post **Variables CSS: un modo oscuro en 10 líneas** vimos lo básico: declarar una variable con `--`, usarla con `var()` y redefinirla para cambiar el tema. Este post va un paso más allá: **por qué** funcionan como funcionan, y los trucos que usan los sistemas de diseño profesionales.

Si todavía no lo leíste, empieza por ese.

## Qué es :root

`:root` es una **pseudo-clase** que selecciona el elemento raíz del documento. En una página HTML, ese elemento es **`<html>`**. Entonces, ¿por qué no escribir `html { ... }`?

- **Funcionan igual** para declarar variables globales: cualquier elemento de la página las "ve".
- **`:root` tiene más especificidad** que `html` (es una pseudo-clase, como una clase), así que es más difícil pisarlo sin querer.
- **Es una convención**: cuando alguien ve `:root`, sabe que ahí están las variables globales del proyecto.

```css
:root {
  --color-primario: #2563eb;
  --radio: 8px;
}
```

## Las variables se heredan

La clave para entender las custom properties es esta: **se heredan como el color del texto**. Una variable declarada en un elemento está disponible para él y para **todos sus descendientes**.

`:root` es el antepasado de todo, por eso lo que declaras ahí llega a toda la página. Pero puedes declarar variables en **cualquier** elemento, y entonces solo existen dentro de él:

```html playground=herencia
<div class="zona-azul">
  <p class="texto">Estoy dentro de la zona azul</p>
</div>

<div class="zona-roja">
  <p class="texto">Estoy dentro de la zona roja</p>
</div>

<p class="texto">Estoy fuera: uso el valor de :root</p>
```

```css playground=herencia
:root {
  --acento: #71717a;
}

.zona-azul {
  --acento: #2563eb;
}

.zona-roja {
  --acento: #dc2626;
}

body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.texto {
  padding: 8px 12px;
  border-left: 4px solid var(--acento);
  color: var(--acento);
}
```

**La misma regla** `.texto` da tres resultados distintos. Cada párrafo usa el `--acento` **más cercano** que encuentre subiendo por sus antepasados.

## Variables por componente

Esta herencia permite el patrón más útil de todos: **componentes con variables propias**. El componente usa sus variables y cada variante solo las cambia:

```html playground=componente
<button class="boton">Normal</button>
<button class="boton boton--exito">Guardar</button>
<button class="boton boton--peligro">Borrar</button>
<button class="boton boton--grande">Grande</button>
```

```css playground=componente
body {
  font-family: system-ui, sans-serif;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
}

.boton {
  /* Las "piezas" del componente, con su valor por defecto */
  --boton-fondo: #18181b;
  --boton-texto: white;
  --boton-tamano: 15px;

  padding: 0.6em 1.1em;
  border: none;
  border-radius: 8px;
  background: var(--boton-fondo);
  color: var(--boton-texto);
  font: inherit;
  font-size: var(--boton-tamano);
  cursor: pointer;
}

/* Las variantes solo cambian variables: nada de repetir propiedades */
.boton--exito { --boton-fondo: #16a34a; }
.boton--peligro { --boton-fondo: #dc2626; }
.boton--grande { --boton-tamano: 20px; }

.boton:hover {
  filter: brightness(1.15);
}
```

Las variantes tienen **una línea** cada una. Y si alguien quiere un botón especial en un sitio concreto, puede cambiar la variable sin tocar el CSS del componente: `<button class="boton" style="--boton-fondo: purple">`.

## Variables desde el HTML

Ese último truco merece su propio apartado: puedes **pasar una variable en el atributo `style`**. Es perfecto para valores que cambian en cada elemento, como el porcentaje de una barra de progreso:

```html playground=progreso
<p>HTML</p>
<div class="barra" style="--progreso: 90%"></div>

<p>CSS</p>
<div class="barra" style="--progreso: 65%"></div>

<p>JavaScript</p>
<div class="barra" style="--progreso: 30%"></div>
```

```css playground=progreso
body {
  font-family: system-ui, sans-serif;
  max-width: 360px;
  padding: 16px;
}

p {
  margin: 12px 0 4px;
}

.barra {
  height: 12px;
  border-radius: 999px;
  background: #e4e4e7;
  overflow: hidden;
}

.barra::after {
  content: '';
  display: block;
  width: var(--progreso, 0%);
  height: 100%;
  background: #f59e0b;
}
```

Un solo CSS para todas las barras; cada una solo dice su porcentaje.

## Variables con calc(): escalas de diseño

Las variables se pueden combinar con **`calc()`** para crear **escalas**. En vez de escribir números sueltos (`padding: 13px`, `margin: 22px`...), defines una unidad base y todo lo demás sale de multiplicarla:

```css
:root {
  --espacio: 8px;
  --espacio-s: calc(var(--espacio) * 1);   /* 8px */
  --espacio-m: calc(var(--espacio) * 2);   /* 16px */
  --espacio-l: calc(var(--espacio) * 4);   /* 32px */
}

.tarjeta {
  padding: var(--espacio-m);
  margin-bottom: var(--espacio-l);
}
```

Todo el diseño queda en múltiplos de 8, que es lo que hacen la mayoría de los sistemas de diseño. Cambias `--espacio` y todo se reajusta.

Si guardas un número **sin unidad**, conviértelo con `calc()` multiplicando por `1px`:

```css
:root { --columnas: 3; }

.galeria {
  grid-template-columns: repeat(var(--columnas), 1fr);  /* un número sin unidad funciona */
  gap: calc(var(--columnas) * 4px);                     /* para px, multiplica */
}
```

Lo que **no** funciona es pegar la unidad detrás: `var(--tamano)px` no es válido.

## Valores de respaldo encadenados

El segundo valor de `var()` es el respaldo si la variable no existe. Puedes encadenarlos: "usa la del componente; si no, la global; si no, este color":

```css
.alerta {
  color: var(--alerta-color, var(--color-primario, #2563eb));
}
```

Un detalle importante: si la variable **existe** pero su valor no es válido para esa propiedad (por ejemplo `--ancho: rojo` en un `width`), el respaldo **no** se usa. La propiedad vuelve a su valor inicial, como si no hubieras escrito nada. Si "no pasa nada", revisa en las DevTools qué valor tiene la variable.

## Leerlas y cambiarlas desde JavaScript

Las custom properties son el puente perfecto entre JavaScript y CSS. JavaScript cambia **un valor** y el CSS se encarga de todo lo visual:

```html playground=javascript
<label for="color">Elige tu color de acento</label>
<input type="color" id="color" value="#f59e0b">

<div class="tarjeta">
  <h2>Mi perfil</h2>
  <button>Seguir</button>
</div>
```

```css playground=javascript
:root {
  --acento: #f59e0b;
}

body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.tarjeta {
  max-width: 280px;
  margin-top: 16px;
  padding: 20px;
  border-top: 6px solid var(--acento);
  border-radius: 12px;
  background: #f4f4f5;
}

.tarjeta h2 {
  margin-top: 0;
  color: var(--acento);
}

.tarjeta button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--acento);
  color: white;
  font: inherit;
}
```

```js playground=javascript
const selector = document.querySelector('#color')
const raiz = document.documentElement // el elemento <html>, es decir, :root

selector.addEventListener('input', () => {
  raiz.style.setProperty('--acento', selector.value)
})

// Leer el valor actual de una variable
const actual = getComputedStyle(raiz).getPropertyValue('--acento')
console.log('Color inicial:', actual.trim())
```

- **`document.documentElement`** es el `<html>`: lo mismo que `:root` en CSS.
- **`style.setProperty('--nombre', valor)`** cambia la variable. Todo lo que la usa se actualiza al instante.
- **`getComputedStyle(elemento).getPropertyValue('--nombre')`** la lee.

Es mucho más limpio que cambiar con JavaScript el color de cada elemento uno por uno.

## @property: variables con tipo

Por defecto, para el navegador una custom property es **solo texto**. Por eso no puede **animarla**: no sabe que `--angulo: 0deg` es un ángulo. Con **`@property`** le dices el tipo, el valor inicial y si se hereda:

```html playground=property
<div class="borde-giratorio">Pasa el ratón por encima</div>
```

```css playground=property
@property --angulo {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

body {
  font-family: system-ui, sans-serif;
  padding: 32px;
}

.borde-giratorio {
  display: grid;
  place-items: center;
  width: 240px;
  height: 120px;
  border: 4px solid transparent;
  border-radius: 16px;
  background:
    linear-gradient(white, white) padding-box,
    conic-gradient(from var(--angulo), #f59e0b, #db2777, #2563eb, #f59e0b) border-box;
  transition: --angulo 1.5s;
}

.borde-giratorio:hover {
  --angulo: 360deg;
}
```

Sin el `@property`, el borde saltaría de golpe. Con él, el navegador sabe interpolar el ángulo y lo anima suavemente. Funciona en todos los navegadores modernos.

## Qué NO puedes hacer con variables

- **Usarlas en la condición de una media query.** `@media (min-width: var(--tablet))` no funciona: las variables viven en los elementos, y la media query se evalúa antes. Lo que sí puedes es **cambiar variables dentro** de una media query.
- **Usarlas como nombre de propiedad o de selector.** `var(--prop): red` no es válido.
- **Pegar unidades** detrás de `var()`, como vimos.

## Cómo organizarlas en un proyecto

Una forma ordenada, muy usada en sistemas de diseño, es tener **dos niveles**:

```css
:root {
  /* 1. Primitivas: la paleta y las escalas, sin significado */
  --azul-500: #2563eb;
  --rojo-500: #dc2626;
  --gris-900: #18181b;
  --espacio: 8px;

  /* 2. Semánticas: para qué se usa cada cosa */
  --color-primario: var(--azul-500);
  --color-peligro: var(--rojo-500);
  --color-texto: var(--gris-900);
}
```

En los componentes usa **solo las semánticas** (`--color-primario`, nunca `--azul-500`). Así, si el día de mañana la marca cambia a verde, solo tocas una línea.

## Errores comunes

- **Declarar variables globales fuera de `:root`** y luego no encontrarlas en otro sitio de la página.
- **`var(--tamano)px`**: guarda la unidad en la variable o usa `calc()`.
- **Esperar que el respaldo salve un valor inválido.** Solo se usa si la variable no existe.
- **Variables en media queries**: cámbialas dentro, pero no las uses en la condición.
- **Nombres por apariencia** (`--azul`) usados directamente en componentes. Usa nombres por función (`--color-primario`).

## Para profundizar

- [Usar propiedades personalizadas, en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties)
- [`@property` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/@property)

En resumen: **`:root`** es el `<html>` y el lugar de las variables globales; las variables **se heredan**, así que puedes **redefinirlas por componente**; se combinan con **`calc()`** para crear escalas, se cambian desde JavaScript con **`setProperty`** y, con **`@property`**, hasta se pueden animar.
