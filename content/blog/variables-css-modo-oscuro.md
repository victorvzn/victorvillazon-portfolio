---
title: 'Variables CSS: un modo oscuro en 10 líneas'
description: 'Guarda tus colores en variables y cambia el tema de toda la página de golpe, incluso con un interruptor sin JavaScript.'
date: 2026-11-25
series: css
tags: [CSS, Fundamentos]
draft: true
order: 5
---

Imagina que tu color principal es `#2563eb` y lo usaste en 40 lugares. Ahora el cliente quiere verde. ¿Buscar y reemplazar en todo el CSS? Con **variables CSS** (oficialmente *custom properties*) lo cambias en un solo sitio.

## Crear y usar una variable

Se declaran con dos guiones `--` y se usan con `var()`. Normalmente las pones en `:root`, que es la raíz de la página, para que estén disponibles en todas partes.

```html playground=basico
<button class="btn">Comprar</button>
<a class="enlace" href="#">Ver detalles</a>
```

```css playground=basico
:root {
  --color-principal: #2563eb;
}

body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: var(--color-principal);
  color: white;
  font: inherit;
}

.enlace {
  margin-left: 16px;
  color: var(--color-principal);
}
```

Abre el playground y cambia `#2563eb` por `#16a34a`. Botón y enlace cambian a la vez.

## Modo oscuro automático

El navegador sabe si el usuario tiene su sistema en modo oscuro gracias a `prefers-color-scheme`. Solo tienes que **redefinir las variables** dentro de esa media query:

```html playground=automatico
<article class="tarjeta">
  <h2>Mi tarjeta</h2>
  <p>Cambia tu sistema a modo oscuro y mira qué pasa.</p>
</article>
```

```css playground=automatico
:root {
  --fondo: #f4f4f5;
  --superficie: #ffffff;
  --texto: #18181b;
}

@media (prefers-color-scheme: dark) {
  :root {
    --fondo: #09090b;
    --superficie: #27272a;
    --texto: #fafafa;
  }
}

body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  background: var(--fondo);
  color: var(--texto);
}

.tarjeta {
  max-width: 320px;
  padding: 20px;
  border-radius: 12px;
  background: var(--superficie);
}
```

Fíjate que `body` y `.tarjeta` no cambian. Solo cambian los valores de las variables. Ese es el truco.

## Un interruptor de tema sin JavaScript

Con un checkbox y el selector `:has()` (que significa "si contiene…") podemos hacer un interruptor:

```html playground=interruptor
<label class="switch">
  <input type="checkbox" id="oscuro">
  Modo oscuro
</label>

<article class="tarjeta">
  <h2>Hola 👋</h2>
  <p>Marca la casilla para cambiar el tema.</p>
</article>
```

```css playground=interruptor
:root {
  --fondo: #f4f4f5;
  --superficie: #ffffff;
  --texto: #18181b;
}

/* Si la página tiene el checkbox marcado, cambiamos las variables */
:root:has(#oscuro:checked) {
  --fondo: #09090b;
  --superficie: #27272a;
  --texto: #fafafa;
}

body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  background: var(--fondo);
  color: var(--texto);
  transition: background 0.3s, color 0.3s;
}

.switch {
  display: inline-flex;
  gap: 8px;
  cursor: pointer;
}

.tarjeta {
  max-width: 320px;
  margin-top: 16px;
  padding: 20px;
  border-radius: 12px;
  background: var(--superficie);
  transition: background 0.3s;
}
```

Este no recuerda tu elección al recargar. Para eso necesitas un poquito de JavaScript con `localStorage`, que veremos en otro post.

## Valor de respaldo

`var()` acepta un segundo valor por si la variable no existe:

```css
color: var(--color-marca, #2563eb);
```

## Errores comunes

- **Olvidar los dos guiones.** `-color` no es una variable; `--color` sí.
- **Escribir `var(color)`.** El nombre va completo: `var(--color)`.
- **Poner unidades a medias.** `--espacio: 16` y luego `padding: var(--espacio)px` no funciona. Guarda el valor con su unidad: `--espacio: 16px`.

## Para profundizar

- [Usar propiedades personalizadas en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties)
- [`prefers-color-scheme` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme)
- [`:has()` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/:has)

En resumen: **`--nombre`** crea la variable, **`var(--nombre)`** la usa, y si **redefines las variables** cambias el tema de toda la página.
