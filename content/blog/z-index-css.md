---
title: 'z-index y los contextos de apilamiento: por qué tu modal queda debajo'
description: 'Cómo decide CSS qué elemento va encima, por qué z-index: 9999 a veces no funciona y qué es un contexto de apilamiento, con ejemplos que puedes romper y arreglar.'
date: 2026-11-26
series: css
tags: [CSS, Layout]
draft: true
---

Tu menú desplegable queda **debajo** de una tarjeta. Le pones `z-index: 10`. No funciona. `z-index: 100`. Nada. `z-index: 99999`. Sigue debajo. 😤

Si te ha pasado, no es que CSS esté roto: es que te falta una pieza, el **contexto de apilamiento**. Vamos a entenderlo.

## El eje Z

Además de horizontal (X) y vertical (Y), la página tiene una tercera dimensión: la **profundidad** (Z), lo que va "más cerca" o "más lejos" de ti. Cuando dos elementos se solapan, algo tiene que decidir cuál se ve encima.

Sin `z-index`, la regla es simple: **lo que viene después en el HTML se pinta encima**.

## `z-index` solo funciona con elementos posicionados

`z-index` es un número: **cuanto más alto, más arriba**. Pero tiene una condición que casi todo el mundo olvida: **solo funciona en elementos con `position`** distinto de `static` (es decir, `relative`, `absolute`, `fixed` o `sticky`), o en hijos de un contenedor flex o grid.

```html playground=basico
<div class="caja roja">Roja (z-index: 2)</div>
<div class="caja azul">Azul (z-index: 1)</div>
```

```css playground=basico
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.caja {
  position: relative; /* sin esto, z-index no hace nada */
  width: 180px;
  padding: 40px 16px;
  color: white;
  font-weight: 600;
}

.roja {
  background: #ef4444;
  z-index: 2;
}

.azul {
  background: #3b82f6;
  margin-top: -50px;
  margin-left: 60px;
  z-index: 1;
}
```

La azul va después en el HTML, así que normalmente iría encima. Pero la roja tiene un `z-index` mayor y gana. Prueba a quitar el `position: relative`: el `z-index` deja de funcionar y la azul vuelve a estar arriba.

## El problema: los contextos de apilamiento

Ahora el caso que vuelve loco a todo el mundo:

```html playground=contexto
<header class="cabecera">
  <div class="menu">Menú desplegable (z-index: 9999)</div>
</header>

<main class="contenido">
  Contenido (z-index: 2)
</main>
```

```css playground=contexto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
}

.cabecera {
  position: relative;
  z-index: 1; /* 👈 el culpable */
  height: 60px;
  background: #18181b;
}

.menu {
  position: absolute;
  top: 40px;
  left: 24px;
  z-index: 9999;
  width: 220px;
  padding: 60px 16px;
  background: #f59e0b;
}

.contenido {
  position: relative;
  z-index: 2;
  padding: 24px;
  background: #e0e7ff;
}
```

El menú tiene `z-index: 9999` y el contenido `2`... y **el menú queda debajo**. ¿Por qué?

Porque la cabecera, al tener `position` y `z-index`, crea un **contexto de apilamiento**: un "grupo" cerrado. Todo lo que está dentro de la cabecera se ordena **solo dentro de ella**. Desde fuera, la cabecera entera (con su menú dentro) cuenta como **una sola capa con `z-index: 1`**.

Piensa en **carpetas apiladas** sobre una mesa. La cabecera es una carpeta en el nivel 1; el contenido, una carpeta en el nivel 2. El menú es una hoja **dentro** de la carpeta 1. Aunque le pongas "nivel 9999", nunca saldrá de su carpeta: siempre estará debajo de la carpeta 2.

**La solución:** el `z-index` que importa es el de **la carpeta** (el contexto), no el de la hoja. Sube el de la cabecera:

```css
.cabecera {
  position: relative;
  z-index: 3; /* ahora la carpeta de la cabecera está encima del contenido */
}
```

O quítale el `z-index` a la cabecera, para que no cree un contexto, y así el `z-index` del menú compita directamente con el del contenido.

## ¿Qué crea un contexto de apilamiento?

Los más comunes:

- **`position` (`relative`, `absolute`, `fixed`, `sticky`) + un `z-index`** distinto de `auto`.
- **`position: fixed` o `sticky`**, aunque no tengan `z-index`.
- **`opacity` menor que 1.**
- **`transform`, `filter`, `translate`, `scale` o `rotate`** con cualquier valor.
- Un hijo de flex o grid con `z-index`.
- **`isolation: isolate`**, que existe justo para eso.

Por eso a veces añades una animación con `transform` o un `opacity: 0.99` y, de repente, un desplegable que funcionaba queda debajo de otra cosa.

## Cómo organizar los `z-index` de un proyecto

Si cada persona pone números al azar (`10`, `999`, `99999`), acabas en una guerra de números. Mejor define una **escala** con variables CSS y úsala siempre:

```css
:root {
  --z-desplegable: 10;
  --z-cabecera: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-notificacion: 50;
}

.cabecera { z-index: var(--z-cabecera); }
.modal { z-index: var(--z-modal); }
```

Así, cualquiera que lea el código sabe qué va encima de qué, y no hace falta inventar números.

## Bonus: `isolation: isolate`

Si tienes un componente (una tarjeta, por ejemplo) con capas internas que usan `z-index`, puedes encerrar esas capas en su propio contexto para que **no interfieran con el resto de la página**:

```css
.tarjeta {
  isolation: isolate;
}
```

Crea un contexto de apilamiento sin necesidad de `position` ni `z-index`.

## Y el atajo moderno: la capa superior

¿Recuerdas los posts del modal y el popover sin JavaScript? Los `<dialog>` abiertos con `showModal()` y los elementos con `popover` se muestran en la **capa superior** (*top layer*): una capa especial del navegador que está **por encima de todo**, sin importar los `z-index` ni los contextos. Si los usas, te olvidas de este problema para modales y menús.

## Cómo depurarlo

1. Inspecciona el elemento que queda debajo y **sube por sus padres** en el panel Elements.
2. En cada padre, busca en **Computed** si tiene `position` + `z-index`, `opacity`, `transform` o `filter`. El primero que los tenga es su "carpeta".
3. Compara el `z-index` de **esa carpeta** con el del elemento que tapa.

## Tu turno

En el ejemplo del menú y el contenido:

1. Arréglalo sin tocar los `z-index` del menú ni del contenido.
2. Ahora añade `opacity: 0.95` a la cabecera (con el arreglo puesto). ¿Sigue funcionando? ¿Por qué?
3. Reescribe todos los `z-index` usando una escala de variables CSS.

## Errores comunes

- **`z-index` sin `position`.** No hace nada (salvo en hijos de flex o grid).
- **Subir el `z-index` del hijo** cuando el problema es el contexto de su padre.
- **La guerra de números** (`999`, `99999`). Usa una escala con variables.
- **No sospechar de `transform`, `opacity` o `filter`.** También crean contextos.
- **Usar `z-index` negativos** sin entenderlos. El elemento puede quedar **detrás del fondo** de su padre y "desaparecer".

## Para profundizar

- [`z-index` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/z-index)
- [El contexto de apilamiento en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_positioned_layout/Stacking_context)

En resumen: **`z-index` solo funciona en elementos posicionados** (o hijos de flex o grid). Un elemento con `position` + `z-index` (o con `opacity`, `transform`, `filter`...) crea un **contexto de apilamiento**: una "carpeta" de la que sus hijos no pueden salir. Cuando un `z-index` "no funciona", busca **la carpeta** del elemento y compara la suya. Y organiza los valores con **una escala de variables CSS**.
