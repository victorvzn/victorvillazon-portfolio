---
title: 'Cascada y herencia en CSS: por qué tu estilo "no se aplica"'
description: 'Cómo decide el navegador qué regla gana, qué propiedades se heredan de padres a hijos y para qué sirven inherit, initial, unset y revert.'
date: 2026-11-26
series: css
tags: [CSS, Fundamentos]
draft: true
---

Escribes `color: red`, guardas, recargas... y el texto sigue azul. Es la frustración número uno cuando empiezas con CSS. Casi nunca es un bug del navegador: es que **otra regla está ganando**. Para saber cuál y por qué, necesitas entender dos ideas: la **cascada** y la **herencia**.

## La cascada: el orden en que se decide quién gana

La "C" de CSS viene de *Cascading* (en cascada). Cuando varias reglas quieren darle un valor distinto a la **misma propiedad** del **mismo elemento**, el navegador decide con estos criterios, **en este orden**:

1. **Importancia**: una declaración con `!important` gana a las normales.
2. **Especificidad**: el selector más específico gana (`#id` > `.clase` > `etiqueta`). Lo vimos en su propio post.
3. **Orden**: si empatan en todo lo anterior, gana **la que aparece después**.

Mira el tercer criterio, que es el que más se olvida:

```html playground=orden
<p class="aviso">¿De qué color soy?</p>
```

```css playground=orden
.aviso {
  color: crimson;
}

/* Misma especificidad (una clase), pero va después: gana */
.aviso {
  color: royalblue;
}
```

El orden también cuenta entre archivos: si enlazas `estilos.css` y después `tema.css`, las reglas de `tema.css` ganan los empates. Por eso importa el orden de los `<link>` en el `<head>`.

## Los estilos del navegador también participan

Aunque no escribas nada de CSS, un `<h1>` se ve grande y en negrita y un enlace se ve azul y subrayado. Son los **estilos por defecto del navegador** (*user agent stylesheet*). Tus reglas los sobrescriben siempre, porque van "después" en la cascada.

Por eso muchos proyectos empiezan con un pequeño **reset**:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}
```

## La herencia: lo que los hijos reciben de sus padres

Algunas propiedades **pasan automáticamente** de un elemento a todo lo que tiene dentro. Si le pones `color` al `<body>`, todos los párrafos, títulos y listas lo reciben sin que tengas que repetirlo:

```html playground=herencia
<article class="tarjeta">
  <h2>Título</h2>
  <p>Este párrafo hereda el color y la fuente de la tarjeta.</p>
  <p>Pero el borde <strong>no</strong> se hereda.</p>
</article>
```

```css playground=herencia
.tarjeta {
  color: #1e3a8a;
  font-family: Georgia, serif;
  border: 2px solid #1e3a8a;
  padding: 16px;
}
```

El borde solo lo tiene la tarjeta, no cada párrafo. Imagina el desastre si se heredara.

**La regla práctica:** se heredan las propiedades de **texto**, y no se heredan las de **caja**.

| Se heredan ✅ | No se heredan ❌ |
| --- | --- |
| `color` | `margin`, `padding` |
| `font-family`, `font-size`, `font-weight` | `border` |
| `line-height`, `letter-spacing` | `background` |
| `text-align` | `width`, `height` |
| `cursor`, `visibility` | `display`, `position` |

## El caso de los botones y los inputs

Los `<button>`, `<input>` y `<select>` **no heredan la fuente** de la página: el navegador les pone la suya. Por eso tus botones a veces se ven con otra letra. La solución es decirles que la hereden:

```html playground=botones
<p>Texto de la página en monospace.</p>
<button>Botón sin arreglar</button>
<button class="arreglado">Botón arreglado</button>
```

```css playground=botones
body {
  font-family: 'Courier New', monospace;
  font-size: 18px;
}

.arreglado {
  font: inherit;
}
```

## Las palabras clave: `inherit`, `initial`, `unset` y `revert`

Sirven con **cualquier** propiedad:

- **`inherit`**: "usa el valor de mi padre", aunque la propiedad no se herede normalmente.
- **`initial`**: "vuelve al valor inicial de CSS" (por ejemplo, `color: initial` suele ser negro).
- **`unset`**: "hereda si la propiedad se hereda; si no, valor inicial".
- **`revert`**: "vuelve a lo que pondría el navegador por defecto".

```html playground=palabras
<div class="caja">
  <a href="#">Enlace normal</a>
  <a href="#" class="hereda">Enlace con color: inherit</a>
</div>
```

```css playground=palabras
.caja {
  color: darkgreen;
  font-family: system-ui, sans-serif;
}

.caja a {
  display: block;
  margin-bottom: 8px;
}

/* Muy útil: enlaces del mismo color que el texto que los rodea */
.hereda {
  color: inherit;
}
```

`color: inherit` en enlaces es un truco que usarás mucho, por ejemplo en un menú o en una tarjeta clicable.

## Cómo descubrir qué regla está ganando

No adivines: **pregúntale al navegador**.

1. Clic derecho sobre el elemento → **Inspeccionar**.
2. En la pestaña **Styles** (Estilos) verás todas las reglas que le afectan, de la que gana (arriba) a la que pierde.
3. Las declaraciones **tachadas** son las que perdieron. Al lado verás de qué archivo y línea vienen.
4. En la pestaña **Computed** (Calculado) ves el valor final de cada propiedad y, si despliegas, de dónde lo heredó.

Si tu regla ni siquiera aparece, el problema no es la cascada: el selector no coincide con el elemento (revisa los puntos, las almohadillas y los nombres de clase) o el archivo CSS no está enlazado.

## Sobre `!important`

`!important` gana a casi todo, y por eso es tentador. Pero si lo usas para "arreglar" un estilo que no se aplica, la próxima vez necesitarás otro `!important` para ganarle al primero, y así sin fin. Úsalo solo en casos muy concretos (como una clase de utilidad `.oculto { display: none !important; }`). Para todo lo demás, entiende quién gana y por qué.

## Tu turno

```html playground=ejercicio
<nav class="menu">
  <a href="#">Inicio</a>
  <a href="#">Blog</a>
  <button>Contacto</button>
</nav>
```

```css playground=ejercicio
.menu {
  color: white;
  background: #111827;
  font-family: system-ui, sans-serif;
  padding: 16px;
  display: flex;
  gap: 16px;
}

/* 1. Haz que los enlaces sean blancos como el menú, sin escribir "white" otra vez */
/* 2. Haz que el botón use la misma fuente que el menú */
```

## Errores comunes

- **Pensar que el CSS "no funciona"** cuando otra regla gana. Inspecciona y busca la declaración tachada.
- **Llenar el código de `!important`.** Aumenta el problema en vez de resolverlo.
- **Olvidar el orden de los archivos** en el `<head>`: el último gana los empates.
- **Esperar que `margin`, `padding` o `border` se hereden.** No se heredan.
- **Botones con otra fuente.** Añade `font: inherit`.

## Para profundizar

- [Cascada, especificidad y herencia en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts)
- [Herencia en MDN](https://developer.mozilla.org/es/docs/Web/CSS/Inheritance)

En resumen: cuando dos reglas chocan, gana la **importante**, luego la **más específica** y, si empatan, **la última**. Las propiedades de **texto se heredan** y las de **caja no**. Y cuando un estilo "no se aplica", abre las DevTools y busca la regla tachada.
