---
title: 'Especificidad: por qué tu CSS "no funciona"'
description: 'Escribiste el estilo, recargaste y nada. Casi siempre es la especificidad. Aprende a calcularla y deja de usar !important.'
date: 2026-11-25
series: css
tags: [CSS, Fundamentos]
draft: true
order: 12
---

Escribes `color: red`, guardas, recargas… y el texto sigue azul. Lo primero que se te ocurre es poner `!important`. **No lo hagas todavía.** Casi siempre el problema es la **especificidad**: otra regla tiene más "fuerza" que la tuya.

## Cuando dos reglas pelean

Si dos reglas le dan un valor distinto a la misma propiedad, el navegador decide así:

1. **Gana la más específica.**
2. Si empatan, **gana la que está más abajo** en el CSS.

## Cómo se calcula

Piensa en la especificidad como un marcador con tres números: **(ids, clases, etiquetas)**.

| Selector | Marcador |
| --- | --- |
| `p` | (0, 0, 1) |
| `.texto` | (0, 1, 0) |
| `p.texto` | (0, 1, 1) |
| `.tarjeta .texto` | (0, 2, 0) |
| `#intro` | (1, 0, 0) |

- **ids**: cada `#algo`.
- **clases**: cada `.clase`, `[atributo]` y pseudo-clase como `:hover`.
- **etiquetas**: cada `p`, `div`, `h1` y pseudo-elemento como `::before`.

Se compara de izquierda a derecha, como en un marcador de fútbol por sets: **un solo id le gana a 100 clases**.

## Pruébalo

```html playground=pelea
<p id="intro" class="texto">¿De qué color soy?</p>
```

```css playground=pelea
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  font-size: 24px;
}

/* (1, 0, 0) — gana el id */
#intro {
  color: blue;
}

/* (0, 1, 1) */
p.texto {
  color: green;
}

/* (0, 1, 0) — está al final, pero tiene menos fuerza */
.texto {
  color: red;
}
```

Sale **azul**, aunque `.texto` está al final. Borra la regla `#intro` en el playground y verás que gana el verde. Borra también `p.texto` y por fin gana el rojo.

## Los estilos en línea y `!important`

- Un `style="..."` directo en el HTML le gana a cualquier selector.
- `!important` le gana a todo lo anterior.

```css
.texto {
  color: red !important;
}
```

Funciona, pero es una trampa: la próxima vez que quieras cambiar ese color tendrás que usar **otro** `!important`, más específico. Y así empieza una guerra que nadie gana.

## Cómo ganar sin trampas

1. **Abre DevTools.** En la pestaña de estilos, las reglas que perdieron aparecen **tachadas**. Ahí ves quién te está ganando.
2. **Usa clases para todo** y evita los `id` en CSS. Así todas tus reglas tienen una fuerza parecida y manda el orden.
3. **Selectores cortos.** `.btn-primario` es mejor que `.header nav ul li a.btn`.

## Un truco moderno: `:where()`

Todo lo que pongas dentro de `:where()` tiene especificidad **cero**. Es ideal para estilos base que quieres que sean fáciles de sobrescribir:

```css
:where(.tarjeta) h2 { color: #18181b; } /* (0, 0, 1) */
```

## Errores comunes

- **Llenar el CSS de `!important`.** Es una señal de que la especificidad se te fue de las manos.
- **Usar `id` para dar estilos.** Usa `id` para enlaces (`#seccion`) y JavaScript; para estilos, clases.
- **Pensar que el orden siempre manda.** El orden solo desempata cuando la especificidad es igual.

## Para profundizar

- [Especificidad en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Specificity)
- [Cascada, especificidad y herencia en MDN](https://developer.mozilla.org/es/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance)

En resumen: la especificidad es un marcador **(ids, clases, etiquetas)**, si empatan **gana el último**, y antes de escribir `!important` **abre DevTools** y mira quién te gana.
