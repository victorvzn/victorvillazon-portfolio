---
title: 'IntersectionObserver: anima elementos al aparecer y carga contenido al hacer scroll'
description: 'Detecta cuándo un elemento entra en la pantalla sin escuchar el scroll. Animaciones al aparecer, scroll infinito y un índice que marca la sección actual.'
date: 2026-11-26
series: javascript
tags: [JavaScript, DOM, Rendimiento]
draft: true
---

Las tarjetas que aparecen con una animación suave al bajar por la página. La lista de productos que carga más al llegar al final. El índice lateral que resalta la sección que estás leyendo. Todo eso necesita saber **cuándo un elemento entra en la pantalla**.

La forma antigua era escuchar el evento `scroll` y calcular posiciones en cada movimiento, algo lento y complicado. La forma moderna es **`IntersectionObserver`**.

## La idea

Un **observador** vigila uno o varios elementos y te avisa cuando **entran o salen** de la zona visible de la pantalla (el *viewport*). Tú no calculas nada: el navegador lo hace de forma eficiente y te llama solo cuando hay un cambio.

```js
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      console.log('¡Ha aparecido!', entrada.target)
    }
  })
})

observador.observe(document.querySelector('.tarjeta'))
```

- **`new IntersectionObserver(callback)`** crea el observador. El callback se ejecuta cada vez que un elemento observado entra o sale.
- Recibe un array de **entradas**, una por cada elemento que cambió.
- **`entrada.isIntersecting`** es `true` si el elemento está (al menos en parte) en pantalla.
- **`entrada.target`** es el elemento.
- **`observador.observe(elemento)`** empieza a vigilarlo.

## Ejemplo 1: animar al aparecer

```html playground=aparecer
<p class="aviso">⬇️ Haz scroll dentro de esta vista</p>

<section class="tarjeta">Tarjeta 1</section>
<section class="tarjeta">Tarjeta 2</section>
<section class="tarjeta">Tarjeta 3</section>
<section class="tarjeta">Tarjeta 4</section>
<section class="tarjeta">Tarjeta 5</section>
```

```css playground=aparecer
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.aviso {
  height: 80vh;
}

.tarjeta {
  margin-bottom: 40vh;
  padding: 40px;
  border-radius: 14px;
  background: #eef2ff;
  font-size: 24px;

  /* Estado inicial: invisible y un poco más abajo */
  opacity: 0;
  translate: 0 40px;
  transition: opacity 0.6s, translate 0.6s;
}

/* Estado final, cuando JavaScript añade la clase */
.tarjeta.visible {
  opacity: 1;
  translate: 0 0;
}

/* Si el usuario prefiere menos movimiento, todo visible y sin animación */
@media (prefers-reduced-motion: reduce) {
  .tarjeta {
    opacity: 1;
    translate: none;
    transition: none;
  }
}
```

```js playground=aparecer
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visible')
      observador.unobserve(entrada.target) // ya apareció: dejamos de vigilarla
    }
  })
}, {
  threshold: 0.3 // avisa cuando se vea al menos el 30 % del elemento
})

document.querySelectorAll('.tarjeta').forEach((tarjeta) => observador.observe(tarjeta))
```

Dos detalles importantes:

- **`unobserve`**: una vez animada, no necesitamos seguir vigilándola. Si no lo haces, la animación se repetiría cada vez que vuelva a entrar (a veces es lo que quieres).
- **La animación está en el CSS**: el JavaScript solo añade la clase `visible`.

## Las opciones

El segundo argumento del observador acepta tres opciones:

| Opción | Qué hace | Ejemplo |
| --- | --- | --- |
| `threshold` | Qué porcentaje del elemento debe verse para avisar (de `0` a `1`) | `0.5` = la mitad |
| `rootMargin` | Agranda o encoge la zona de detección, como un margen de CSS | `'200px'` = avisa 200px **antes** de que entre |
| `root` | El contenedor con scroll que se usa como referencia | Por defecto, la ventana |

`rootMargin` es clave para cargar cosas **antes** de que el usuario llegue, y que no vea el hueco vacío.

## Ejemplo 2: scroll infinito

La idea: pones un elemento vacío al final de la lista (un **centinela**). Cuando el centinela aparece, cargas más elementos.

```html playground=infinito
<ul id="lista"></ul>
<p id="centinela">Cargando más...</p>
```

```css playground=infinito
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

li {
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: #f4f4f5;
}

#centinela {
  color: #71717a;
  text-align: center;
}
```

```js playground=infinito
const lista = document.querySelector('#lista')
const centinela = document.querySelector('#centinela')
let pagina = 0
const TOTAL_PAGINAS = 5

function cargarPagina() {
  pagina++
  for (let i = 1; i <= 10; i++) {
    const item = document.createElement('li')
    item.textContent = `Producto ${(pagina - 1) * 10 + i}`
    lista.append(item)
  }

  if (pagina === TOTAL_PAGINAS) {
    observador.disconnect() // no hay más: dejamos de observar
    centinela.textContent = 'No hay más productos'
  }
}

const observador = new IntersectionObserver((entradas) => {
  if (!entradas[0].isIntersecting) return
  cargarPagina()

  // Si después de cargar el centinela sigue a la vista, el observador no vuelve a avisar
  // (solo avisa cuando algo CAMBIA). Volver a observarlo fuerza una nueva comprobación.
  if (pagina < TOTAL_PAGINAS) {
    observador.unobserve(centinela)
    observador.observe(centinela)
  }
}, { rootMargin: '200px' })

observador.observe(centinela)
```

En una app real, `cargarPagina` haría un `fetch` a la API pidiendo la página siguiente. `disconnect()` deja de vigilar **todos** los elementos del observador.

Fíjate en el truco del `unobserve` + `observe`: el observador solo avisa cuando un elemento **entra o sale**. Si la pantalla es tan alta que, tras cargar 10 productos, el centinela sigue visible, no habría un nuevo aviso y la carga se quedaría parada.

## Ejemplo 3: resaltar la sección actual en un índice

```html playground=indice
<nav class="indice">
  <a href="#intro">Intro</a>
  <a href="#instalar">Instalar</a>
  <a href="#usar">Usar</a>
</nav>

<main>
  <section id="intro"><h2>Intro</h2></section>
  <section id="instalar"><h2>Instalar</h2></section>
  <section id="usar"><h2>Usar</h2></section>
</main>
```

```css playground=indice
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.indice {
  position: sticky;
  top: 0;
  display: flex;
  gap: 16px;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #e4e4e7;
}

.indice a {
  color: #71717a;
  text-decoration: none;
}

.indice a.actual {
  color: #18181b;
  font-weight: 700;
}

section {
  min-height: 90vh;
  padding: 24px;
}

section:nth-child(even) {
  background: #fafafa;
}
```

```js playground=indice
const enlaces = document.querySelectorAll('.indice a')

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return
    const id = entrada.target.id
    enlaces.forEach((enlace) => {
      enlace.classList.toggle('actual', enlace.getAttribute('href') === `#${id}`)
    })
  })
}, {
  // la "línea" de detección está en el centro de la pantalla
  rootMargin: '-50% 0px -50% 0px'
})

document.querySelectorAll('main section').forEach((seccion) => observador.observe(seccion))
```

Con `rootMargin: '-50% 0px -50% 0px'` encogemos la zona de detección a **una línea en el centro** de la pantalla. La sección que cruza esa línea es la actual.

## ¿Y para las imágenes?

Para cargar imágenes solo cuando se van a ver (**lazy loading**), **no necesitas** JavaScript: basta con `<img loading="lazy">`, como vimos en el post de rendimiento de imágenes. `IntersectionObserver` es para todo lo demás.

## Tu turno

Partiendo del ejemplo 1:

1. Haz que cada tarjeta aparezca con un pequeño retraso respecto a la anterior. Pista: una variable CSS `--retraso` en cada tarjeta y `transition-delay: var(--retraso)`.
2. Haz que la animación se repita cada vez que la tarjeta entra (quita la clase cuando sale, en vez de usar `unobserve`).
3. Muestra en un contador fijo cuántas tarjetas ha visto el usuario.

## Errores comunes

- **Seguir usando el evento `scroll` con `getBoundingClientRect`** para esto. Es más lento y más difícil.
- **No hacer `unobserve` o `disconnect`** cuando ya no hace falta vigilar.
- **Olvidar comprobar `isIntersecting`.** El callback también se llama cuando el elemento **sale** de la pantalla, y la primera vez que empiezas a observar.
- **Esconder el contenido sin alternativa.** Si el JavaScript falla, las tarjetas con `opacity: 0` no se verían nunca. En webs importantes, añade la clase inicial desde JavaScript.
- **Animaciones sin respetar `prefers-reduced-motion`.**

## Para profundizar

- [`IntersectionObserver` en MDN](https://developer.mozilla.org/es/docs/Web/API/Intersection_Observer_API)

En resumen: **`IntersectionObserver`** te avisa cuando un elemento **entra o sale de la pantalla**, sin escuchar el scroll. Comprueba **`isIntersecting`**, ajusta cuándo avisa con **`threshold`** y **`rootMargin`**, y deja de vigilar con **`unobserve`** o **`disconnect`**. Sirve para animaciones al aparecer, scroll infinito e índices que marcan la sección actual.
