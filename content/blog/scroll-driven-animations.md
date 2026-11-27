---
title: 'Animaciones con el scroll solo con CSS: animation-timeline'
description: 'Una barra de progreso de lectura, elementos que aparecen al entrar en pantalla y una cabecera que cambia al hacer scroll, sin JavaScript, con scroll() y view().'
date: 2026-11-26
series: css
tags: [CSS, CSS moderno, Animación]
draft: true
---

La barra fina arriba de un artículo que se llena mientras lees. Las imágenes que aparecen con un fundido al llegar a ellas. La cabecera que se hace más pequeña al bajar. Hasta hace poco, todo eso necesitaba JavaScript escuchando el scroll (o un `IntersectionObserver`, como vimos en su post).

Ahora, el CSS puede hacerlo solo: las **animaciones dirigidas por el scroll** (*scroll-driven animations*).

## La idea: el scroll es el reloj

Una animación normal de `@keyframes` avanza con el **tiempo**: dura 2 segundos y ya. Con **`animation-timeline`** le dices a la animación que avance con **otra cosa**: el **scroll**.

- Al principio del scroll, la animación está al **0 %**.
- Al final, está al **100 %**.
- Si vuelves a subir, **retrocede**.

Hay dos tipos de "reloj":

| Función | La animación avanza según... | Ejemplo |
| --- | --- | --- |
| `scroll()` | Cuánto has bajado en un contenedor (o la página) | Barra de progreso de lectura |
| `view()` | Cuánto ha avanzado **un elemento** al cruzar la pantalla | Elementos que aparecen al entrar |

## Ejemplo 1: barra de progreso de lectura

```html playground=progreso
<div class="progreso"></div>

<article>
  <h1>Un artículo largo</h1>
  <p>Haz scroll dentro de esta vista y mira la barra de arriba.</p>
  <p class="relleno"></p>
  <p>¡Llegaste al final! 🎉</p>
</article>
```

```css playground=progreso
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

article {
  max-width: 600px;
  padding: 24px;
}

.relleno {
  height: 250vh;
  background: repeating-linear-gradient(#f4f4f5 0 40px, white 40px 80px);
}

.progreso {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: #4f46e5;
  transform-origin: left;

  /* La animación... */
  animation: llenar linear;
  /* ...avanza con el scroll de la página */
  animation-timeline: scroll();
}

@keyframes llenar {
  from { scale: 0 1; }
  to { scale: 1 1; }
}
```

Fíjate en dos detalles:

- **`animation: llenar linear`** sin duración: el "tiempo" lo pone el scroll. `linear` hace que la barra crezca al mismo ritmo que bajas.
- **`scale` y `transform-origin: left`**: la barra crece desde la izquierda. Animar `scale` es más fluido que animar `width` (lo vimos en el post de `transform`).

`scroll()` sin argumentos usa el scroll del contenedor más cercano que tenga scroll (aquí, la página).

## Ejemplo 2: elementos que aparecen al entrar en pantalla

Con **`view()`**, cada elemento tiene **su propio reloj**: empieza cuando el elemento asoma por abajo y termina cuando sale por arriba.

```html playground=aparecer
<p class="aviso">⬇️ Haz scroll</p>

<div class="tarjeta">Tarjeta 1</div>
<div class="tarjeta">Tarjeta 2</div>
<div class="tarjeta">Tarjeta 3</div>
<div class="tarjeta">Tarjeta 4</div>
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
  margin-bottom: 30vh;
  padding: 48px;
  border-radius: 16px;
  background: #ede9fe;
  font-size: 24px;

  animation: aparecer linear both;
  animation-timeline: view();
  /* Solo durante la entrada: desde que asoma hasta que está entera en pantalla */
  animation-range: entry 0% entry 100%;
}

@keyframes aparecer {
  from {
    opacity: 0;
    scale: 0.8;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
```

**`animation-range`** decide en qué tramo del recorrido ocurre la animación:

| Valor | Tramo |
| --- | --- |
| `entry` | Mientras el elemento **entra** en la pantalla |
| `exit` | Mientras **sale** |
| `cover` | Todo el recorrido, de que asoma a que desaparece (por defecto) |
| `contain` | Mientras está **entero** dentro de la pantalla |

`entry 0% entry 100%` significa "del principio al final de la entrada". El `both` del `animation` mantiene el estado final cuando termina.

Compara este CSS con el JavaScript del post de `IntersectionObserver`: para animaciones visuales simples, ahora no necesitas ni una línea de JavaScript.

## Ejemplo 3: una cabecera que se compacta

```css
.cabecera {
  position: sticky;
  top: 0;
  animation: compactar linear both;
  animation-timeline: scroll();
  /* Solo durante los primeros 200px de scroll */
  animation-range: 0 200px;
}

@keyframes compactar {
  to {
    padding-block: 8px;
    background: rgb(255 255 255 / 0.9);
    box-shadow: 0 2px 12px rgb(0 0 0 / 0.1);
  }
}
```

Aquí `animation-range` usa **píxeles**: la animación se completa en los primeros 200px de scroll y después se queda en su estado final.

## Mejora progresiva y compatibilidad

Las animaciones con scroll funcionan en Chrome, Edge y otros navegadores basados en Chromium, y se están añadiendo al resto. Para no romper nada en los navegadores que no las soportan, envuélvelas en **`@supports`**:

```css
@supports (animation-timeline: view()) {
  .tarjeta {
    animation: aparecer linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 100%;
  }
}
```

Así, en un navegador sin soporte las tarjetas simplemente **se ven normales**, sin animación. Fíjate en que el estado inicial (invisible) está **dentro** de la animación, no en el CSS base: si estuviera fuera, en esos navegadores las tarjetas se quedarían invisibles para siempre.

## Y el movimiento reducido

Como cualquier animación que mueve cosas, respeta la preferencia del usuario:

```css
@media (prefers-reduced-motion: reduce) {
  .tarjeta {
    animation: none;
  }
}
```

La barra de progreso, en cambio, no es un movimiento que maree: es información útil, y se puede dejar.

## Tu turno

1. En el ejemplo 2, haz que las tarjetas también **desaparezcan** con un fundido al **salir** por arriba. Pista: una segunda animación con `animation-range: exit 0% exit 100%`. (Se pueden poner dos animaciones separadas por comas).
2. Haz que una imagen se mueva más despacio que el resto de la página (efecto *parallax*) con `animation-timeline: view()` y una animación de `translate`.
3. Envuelve todo en `@supports` y añade la regla de movimiento reducido.

## Errores comunes

- **Ponerle duración a la animación** (`animation: llenar 2s`). Con un timeline de scroll, la duración no tiene sentido; usa solo el nombre y `linear`.
- **Escribir `animation-timeline` antes que `animation`.** El atajo `animation` reinicia el timeline. Pon siempre `animation-timeline` **después**.
- **Dejar elementos ocultos en el CSS base.** En navegadores sin soporte no aparecerían nunca.
- **Animar `width`, `height` o `top`.** Usa `scale`, `translate` y `opacity`, que son más fluidas.
- **Olvidar el movimiento reducido** en efectos como el parallax.

## Para profundizar

- [Animaciones dirigidas por el scroll en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_scroll-driven_animations)
- [`animation-timeline` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/animation-timeline)
- [`animation-range` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/animation-range)

En resumen: con **`animation-timeline`**, una animación de `@keyframes` avanza con el **scroll** en vez de con el tiempo. **`scroll()`** la ata al scroll de la página (perfecto para barras de progreso) y **`view()`** al paso de cada elemento por la pantalla (perfecto para que aparezcan al entrar). Controla el tramo con **`animation-range`**, protégela con **`@supports`** y respeta el **movimiento reducido**.
