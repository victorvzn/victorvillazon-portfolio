---
title: 'Colores modernos en CSS: oklch(), color-mix() y colores relativos'
description: 'Crea paletas coherentes con oklch, genera tonos más claros y oscuros con color-mix y modifica un color base sin calcular nada a mano. Ideal para temas y modo oscuro.'
date: 2026-11-26
series: css
tags: [CSS, CSS moderno, Colores]
draft: true
---

En el post de colores vimos `#hex`, `rgb()` y `hsl()`. Funcionan perfectamente, pero tienen un problema cuando construyes una **paleta**: si coges un azul y un amarillo con la misma "luminosidad" en `hsl`, el amarillo **se ve muchísimo más claro**. Y si necesitas "este color, pero un poco más oscuro para el hover", tienes que buscar otro código a mano.

CSS moderno trae tres herramientas que lo resuelven: **`oklch()`**, **`color-mix()`** y los **colores relativos**.

## `oklch()`: colores como los ve el ojo humano

`oklch()` describe un color con tres valores:

```css
color: oklch(70% 0.15 250);
/*           L    C    H  */
```

| Letra | Significa | Valores |
| --- | --- | --- |
| **L** | **Luminosidad**: lo claro u oscuro que se percibe | De `0%` (negro) a `100%` (blanco) |
| **C** | **Croma**: cuánto color tiene (lo "vivo" o "apagado") | De `0` (gris) a unos `0.37` (muy saturado) |
| **H** | **Tono** (*hue*): qué color es, en grados del círculo cromático | `0` rosa/rojo, `90` amarillo, `150` verde, `250` azul, `310` morado |

¿La diferencia con `hsl`? En `oklch`, la luminosidad es **perceptual**: dos colores con la misma `L` **se ven igual de claros** a nuestros ojos, sean del tono que sean.

```html playground=comparacion
<h2>Con hsl (misma "luminosidad" del 50 %)</h2>
<div class="fila">
  <div style="background: hsl(60 100% 50%)">Amarillo</div>
  <div style="background: hsl(120 100% 50%)">Verde</div>
  <div style="background: hsl(240 100% 50%)">Azul</div>
</div>

<h2>Con oklch (misma luminosidad del 65 %)</h2>
<div class="fila">
  <div style="background: oklch(65% 0.15 95)">Amarillo</div>
  <div style="background: oklch(65% 0.15 150)">Verde</div>
  <div style="background: oklch(65% 0.15 260)">Azul</div>
</div>
```

```css playground=comparacion
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

h2 {
  font-size: 16px;
}

.fila {
  display: flex;
  gap: 8px;
}

.fila div {
  flex: 1;
  padding: 24px 8px;
  border-radius: 8px;
  color: black;
  text-align: center;
}
```

Con `hsl`, el amarillo parece brillantísimo y el azul, oscuro, aunque "en teoría" tienen la misma luminosidad. Con `oklch` se ven **equilibrados**: el texto negro se lee igual de bien en los tres.

### Paletas en un momento

Para generar una escala de tonos, **cambia solo la luminosidad** y deja el resto igual:

```css
:root {
  --azul-100: oklch(95% 0.03 260);
  --azul-300: oklch(80% 0.10 260);
  --azul-500: oklch(60% 0.18 260);
  --azul-700: oklch(45% 0.15 260);
  --azul-900: oklch(28% 0.08 260);
}
```

Y para crear otro color de la marca con el mismo "peso", **cambia solo el tono** (`H`).

## `color-mix()`: mezclar dos colores

`color-mix()` mezcla dos colores en la proporción que quieras, como mezclar pintura:

```css
color-mix(in oklch, #4f46e5 70%, white)
/*        espacio   color 1  %    color 2 */
```

- **`in oklch`**: en qué espacio de color se mezcla. `oklch` o `oklab` dan los resultados más naturales.
- **`#4f46e5 70%`**: un 70 % del primer color.
- **`white`**: el resto (30 %) del segundo.

Su uso estrella: **generar los estados de un botón a partir de un solo color**:

```html playground=mix
<div class="botones">
  <button class="boton" style="--color: #4f46e5">Morado</button>
  <button class="boton" style="--color: #16a34a">Verde</button>
  <button class="boton" style="--color: #dc2626">Rojo</button>
</div>
```

```css playground=mix
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.botones {
  display: flex;
  gap: 12px;
}

.boton {
  padding: 10px 18px;
  border: 2px solid var(--color);
  border-radius: 10px;
  /* Fondo: el color mezclado con mucho blanco = una versión muy clara */
  background: color-mix(in oklch, var(--color) 15%, white);
  /* Texto: el color mezclado con negro = una versión más oscura */
  color: color-mix(in oklch, var(--color) 70%, black);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.boton:hover {
  background: color-mix(in oklch, var(--color) 30%, white);
}
```

Con **una sola variable** (`--color`) salen el fondo, el texto, el borde y el hover. Para un botón de otro color, solo cambias la variable.

### Transparencias a partir de un color

Mezclar con `transparent` te da el mismo color con opacidad, sin tener que saber su código `rgb`:

```css
.sombra {
  box-shadow: 0 8px 24px color-mix(in oklch, var(--color) 30%, transparent);
}
```

## Colores relativos: "este color, pero..."

La sintaxis de **colores relativos** te deja coger un color y **modificar uno de sus valores**:

```css
/* El mismo color, un 10 % más oscuro */
background: oklch(from var(--color) calc(l - 0.1) c h);
```

Se lee así: "a partir de (`from`) `--color`, dame un `oklch` con la luminosidad `l` menos 0.1 y el mismo croma `c` y tono `h`". Las letras `l`, `c` y `h` representan los valores del color original.

```html playground=relativos
<div class="muestras">
  <div class="muestra base">Base</div>
  <div class="muestra oscuro">Más oscuro</div>
  <div class="muestra claro">Más claro</div>
  <div class="muestra apagado">Apagado</div>
  <div class="muestra complementario">Complementario</div>
</div>
```

```css playground=relativos
:root {
  --marca: oklch(62% 0.19 260);
}

body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.muestras {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 8px;
}

.muestra {
  padding: 32px 8px;
  border-radius: 8px;
  color: white;
  text-align: center;
  font-size: 14px;
}

.base { background: var(--marca); }

/* Bajamos la luminosidad */
.oscuro { background: oklch(from var(--marca) calc(l - 0.2) c h); }

/* La subimos (y el texto pasa a oscuro para que se lea) */
.claro {
  background: oklch(from var(--marca) calc(l + 0.25) c h);
  color: black;
}

/* Le quitamos croma: el mismo tono, más grisáceo */
.apagado { background: oklch(from var(--marca) l calc(c * 0.3) h); }

/* Giramos el tono 180 grados: el color opuesto del círculo */
.complementario { background: oklch(from var(--marca) l c calc(h + 180)); }
```

Cambia el `--marca` del `:root` y **toda la paleta se recalcula sola**.

## Un caso real: un tema completo con un color

```css
:root {
  --marca: oklch(62% 0.19 260);

  --fondo: oklch(from var(--marca) 98% 0.01 h);
  --superficie: white;
  --texto: oklch(from var(--marca) 25% 0.03 h);
  --borde: oklch(from var(--marca) 90% 0.03 h);
  --enlace: var(--marca);
  --enlace-hover: oklch(from var(--marca) calc(l - 0.1) c h);
}
```

El fondo y el texto llevan **un toque del color de la marca** (mismo tono `h`, croma casi 0), lo que da un aspecto más cuidado que un gris neutro. Para cambiar toda la web de azul a verde, cambias **un número**.

## Compatibilidad

`oklch()` y `color-mix()` funcionan en todos los navegadores modernos. Los **colores relativos** son más recientes; si necesitas que funcione en navegadores de hace un par de años, pon antes un color normal de respaldo:

```css
.boton {
  background: #4338ca; /* respaldo */
  background: oklch(from var(--marca) calc(l - 0.1) c h);
}
```

Si el navegador no entiende la segunda línea, la ignora y usa la primera.

## Tu turno

```html playground=ejercicio
<div class="alertas">
  <p class="alerta" style="--tono: 150">✅ Guardado correctamente</p>
  <p class="alerta" style="--tono: 85">⚠️ Revisa los datos</p>
  <p class="alerta" style="--tono: 25">❌ Algo salió mal</p>
</div>
```

```css playground=ejercicio
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

/* Usando SOLO la variable --tono y oklch():
   1. Un fondo muy claro (L ~95 %, poco croma)
   2. Un texto muy oscuro del mismo tono
   3. Un borde izquierdo de 4px con un color medio y vivo */
.alerta {
  padding: 12px 16px;
  border-radius: 8px;
}
```

## Errores comunes

- **Valores de croma demasiado altos.** Con más de 0.2 o 0.25, muchos colores se salen de lo que una pantalla normal puede mostrar y el navegador los recorta.
- **Olvidar el `in oklch`** en `color-mix`. Es obligatorio indicar el espacio de color.
- **Confundir los ejes.** En `oklch`, primero la luminosidad, luego el croma y al final el tono. En `hsl` es tono, saturación, luminosidad.
- **No comprobar el contraste.** Que un color sea bonito no significa que el texto se lea. Revisa el contraste en las DevTools.

## Para profundizar

- [`oklch()` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/color_value/oklch)
- [`color-mix()` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/color_value/color-mix)
- [Colores relativos en MDN](https://developer.mozilla.org/es/docs/Web/CSS/CSS_colors/Relative_colors)
- [OKLCH Color Picker](https://oklch.com): un selector de colores para explorar los tres valores.

En resumen: **`oklch()`** describe colores con luminosidad, croma y tono **como los percibe el ojo**, ideal para paletas equilibradas. **`color-mix()`** mezcla colores para sacar versiones claras, oscuras o transparentes. Y los **colores relativos** (`oklch(from var(--color) ...)`) modifican un color base. Con ellos, **un solo color** basta para generar todo un tema.
