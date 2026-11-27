---
title: 'prefers-reduced-motion: animaciones que respetan a quien se marea'
description: 'Algunas personas se marean con las animaciones. Cómo detectar la preferencia de movimiento reducido del sistema con CSS y JavaScript y adaptar tus animaciones sin quitarlas todas.'
date: 2026-11-26
series: css
tags: [CSS, Accesibilidad, Animación]
draft: true
---

Una tarjeta que entra girando. Un fondo que se mueve al hacer scroll (*parallax*). Una página que hace zoom al cambiar de sección. A ti te parecen bonitos. A otras personas les producen **mareos, náuseas o dolor de cabeza**.

Les pasa, por ejemplo, a quienes tienen **trastornos vestibulares** (del oído interno, que controla el equilibrio), migrañas o epilepsia. Por eso los sistemas operativos tienen una opción para **reducir el movimiento**, y tu web puede (y debe) respetarla.

## Dónde se activa

Cualquier usuario puede activarla en su sistema:

- **Windows**: Configuración → Accesibilidad → Efectos visuales → desactiva **Efectos de animación**.
- **macOS**: Ajustes del Sistema → Accesibilidad → Pantalla → **Reducir movimiento**.
- **iOS**: Ajustes → Accesibilidad → Movimiento → **Reducir movimiento**.
- **Android**: Ajustes → Accesibilidad → **Quitar animaciones**.

Para probarlo sin tocar tu sistema: en las DevTools de Chrome, pulsa `Ctrl + Shift + P` (o `Cmd + Shift + P` en Mac), escribe **"reduced motion"** y elige **Emulate CSS prefers-reduced-motion: reduce**.

## La media query

Tu CSS puede saber si el usuario activó esa opción con la media query **`prefers-reduced-motion`**:

```css
@media (prefers-reduced-motion: reduce) {
  /* estilos para quien prefiere menos movimiento */
}
```

```html playground=basico
<div class="pelota"></div>
<p>Si activas el movimiento reducido, la pelota deja de botar.</p>
```

```css playground=basico
body {
  font-family: system-ui, sans-serif;
  padding: 40px;
}

.pelota {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f43f5e;
  animation: botar 0.8s ease-in-out infinite alternate;
}

@keyframes botar {
  to {
    translate: 0 80px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pelota {
    animation: none;
  }
}
```

Activa la emulación en las DevTools y mira cómo se detiene.

## Reducir no es eliminar

"Movimiento reducido" no significa "cero animaciones". Lo que marea es el **movimiento**: desplazamientos grandes, rotaciones, zooms, parallax, cosas que botan. Los **cambios suaves de color u opacidad** no suelen molestar y siguen ayudando a entender la interfaz.

Así que una buena estrategia es **cambiar el movimiento por un fundido**:

```html playground=fundido
<button id="mostrar">Mostrar notificación</button>
<div class="notificacion" id="aviso">¡Guardado correctamente! ✅</div>
```

```css playground=fundido
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.notificacion {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #dcfce7;
  opacity: 0;
  translate: 0 30px; /* entra deslizándose desde abajo */
  transition: opacity 0.3s, translate 0.3s;
}

.notificacion.visible {
  opacity: 1;
  translate: 0 0;
}

/* Movimiento reducido: sin desplazamiento, solo un fundido */
@media (prefers-reduced-motion: reduce) {
  .notificacion {
    translate: none;
    transition: opacity 0.3s;
  }
}
```

```js playground=fundido
document.querySelector('#mostrar').addEventListener('click', () => {
  document.querySelector('#aviso').classList.toggle('visible')
})
```

Con la preferencia activada, la notificación sigue apareciendo de forma suave, pero sin moverse.

## Al revés: animar solo si no hay preferencia

Otra forma de escribirlo, que muchos consideran más segura, es **añadir las animaciones solo cuando el usuario no ha pedido lo contrario**, con `no-preference`:

```css
.tarjeta {
  opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .tarjeta {
    animation: entrar 0.5s both;
  }
}

@keyframes entrar {
  from {
    opacity: 0;
    translate: 0 40px;
  }
}
```

Así, por defecto todo es estático, y el movimiento es un extra para quien no tiene problema con él.

## Una red de seguridad global

Muchos proyectos incluyen esta regla en su CSS base. Acorta casi a cero todas las animaciones y transiciones de la página cuando el usuario lo pide:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

¿Por qué `0.01ms` y no `none`? Porque algunas partes de una web dependen de que la animación **termine** (por ejemplo, un JavaScript que espera el evento `animationend`). Con una duración casi nula, la animación termina al instante pero el evento sigue llegando.

Úsala como **red de seguridad**, no como sustituto de pensar cada animación.

## El scroll suave también cuenta

`scroll-behavior: smooth` hace que los enlaces a anclas (`#contacto`) se desplacen suavemente en vez de saltar. Para algunas personas, ese desplazamiento largo también marea:

```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

## En JavaScript

Si animas con JavaScript (un carrusel que avanza solo, un contador animado, `element.animate()`...), también puedes consultar la preferencia con **`matchMedia`**:

```js playground=js
const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)')

console.log('¿Prefiere movimiento reducido?', reducirMovimiento.matches)

// Reaccionar si el usuario cambia la opción mientras está en la página
reducirMovimiento.addEventListener('change', () => {
  console.log('Ha cambiado la preferencia:', reducirMovimiento.matches)
})
```

Un uso típico:

```js
const carrusel = document.querySelector('.carrusel')

if (!reducirMovimiento.matches) {
  iniciarAutoplay(carrusel) // solo avanza solo si el usuario no prefiere menos movimiento
}
```

Y en general, **cualquier cosa que se mueva sola durante más de 5 segundos** (carruseles, banners animados) debería tener un botón para **pausarla**. Es una de las pautas de accesibilidad web (WCAG).

## Qué animaciones revisar

| Suele marear ⚠️ | Suele estar bien ✅ |
| --- | --- |
| Parallax y fondos que se mueven con el scroll | Cambios de color en `:hover` |
| Elementos que entran desde fuera de la pantalla | Fundidos de opacidad |
| Zooms y rotaciones grandes | Subrayados que aparecen |
| Cosas que botan o se agitan sin parar | Spinners pequeños de carga |
| Scroll suave en páginas largas | Pequeños cambios de tamaño (como un `scale: 1.05`) |

## Tu turno

Coge alguno de tus proyectos (o el ejemplo de las tarjetas que aparecen del post de `IntersectionObserver`) y:

1. Activa la emulación de movimiento reducido en las DevTools.
2. Haz que los elementos aparezcan solo con un fundido, sin desplazarse.
3. Haz que el `scroll-behavior: smooth` solo se aplique con `no-preference`.

## Errores comunes

- **No probarlo nunca.** Usa la emulación de las DevTools.
- **Quitar todas las animaciones**, incluidas las que ayudan a entender la interfaz. Cambia el movimiento por fundidos.
- **Olvidar las animaciones hechas con JavaScript.** La media query de CSS no les afecta: usa `matchMedia`.
- **Carruseles automáticos sin botón de pausa.**
- **Dejar elementos invisibles** (`opacity: 0`) al quitar su animación de entrada. Asegúrate de que terminen visibles.

## Para profundizar

- [`prefers-reduced-motion` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/@media/prefers-reduced-motion)
- [`matchMedia` en MDN](https://developer.mozilla.org/es/docs/Web/API/Window/matchMedia)

En resumen: algunas personas se marean con el movimiento. Detecta su preferencia con **`@media (prefers-reduced-motion: reduce)`** en CSS y **`matchMedia`** en JavaScript, y **cambia los desplazamientos, zooms y rotaciones por fundidos suaves**. Pruébalo con la emulación de las DevTools y no olvides el scroll suave ni los carruseles.
