---
title: 'VS Code para frontend: configuración, extensiones y atajos imprescindibles'
description: 'Configura VS Code para programar más rápido: formatear al guardar, las extensiones que de verdad necesitas, Emmet, multicursor y los atajos de teclado que usarás cada día.'
date: 2026-11-26
series: carrera
tags: [VS Code, Herramientas]
draft: true
---

**VS Code** (Visual Studio Code) es el editor de código más usado del mundo, y es gratis. Recién instalado ya funciona bien, pero con **diez minutos de configuración** y unos pocos atajos, programarás muchísimo más rápido. Y te ahorrarás errores tontos.

Descárgalo desde [code.visualstudio.com](https://code.visualstudio.com) si todavía no lo tienes.

> En este post, `Ctrl` es para Windows y Linux. En Mac, usa `Cmd` en su lugar (y `Option` donde ponga `Alt`).

## Lo primero: abre carpetas, no archivos

Abre siempre la **carpeta completa** del proyecto (**Archivo → Abrir carpeta**, o `code .` desde la terminal, como vimos en el post de la terminal). Así VS Code entiende tu proyecto: te deja buscar en todos los archivos, autocompleta las rutas y la terminal se abre en el sitio correcto.

## Los 3 ajustes que cambian todo

Abre los ajustes con `Ctrl + ,` y busca:

1. **Format On Save** (*Editor: Format On Save*): actívalo. Cada vez que guardes, el código se ordena solo: sangrías, espacios, comillas. Funciona junto con la extensión Prettier (abajo).
2. **Auto Save** (*Files: Auto Save*): ponlo en `onFocusChange`. El archivo se guarda solo cuando cambias de ventana (por ejemplo, al ir al navegador a ver el resultado). Se acabó el "no veo mis cambios" porque olvidaste guardar.
3. **Word Wrap** (*Editor: Word Wrap*): ponlo en `on`. Las líneas largas se parten en la pantalla en vez de obligarte a hacer scroll horizontal.

Bonus: **Linked Editing** (*Editor: Linked Editing*). Al cambiar una etiqueta HTML de apertura, se cambia también la de cierre.

## Las extensiones que de verdad necesitas

Las extensiones se instalan desde el icono de los cuatro cuadrados de la barra lateral (o `Ctrl + Shift + X`). No instales cincuenta: estas son las imprescindibles para frontend.

| Extensión | Para qué |
| --- | --- |
| **Prettier - Code formatter** | Formatea tu código con un estilo consistente. Después de instalarla, en los ajustes busca *Default Formatter* y elige Prettier |
| **ESLint** | Te avisa de errores y malas prácticas de JavaScript **mientras escribes**, subrayándolos como un corrector |
| **Live Server** | Abre tu HTML en el navegador y lo **recarga solo** al guardar. Clic derecho en el archivo → *Open with Live Server* |
| **Error Lens** | Muestra los errores y avisos **al final de la línea**, en vez de solo un subrayado |
| **Spanish Language Pack** | Si prefieres VS Code en español |

Según lo que uses, añade:

- **Tailwind CSS IntelliSense**: autocompleta las clases de Tailwind y te muestra el CSS que generan.
- **Vue - Official**: si trabajas con Vue.
- **GitLens**: ver quién cambió cada línea y cuándo (útil al trabajar en equipo).

> **Cuidado con las extensiones.** Cada una es código de otra persona que se ejecuta en tu ordenador. Instala las que tengan muchas descargas y un autor conocido, y desinstala las que no uses.

## Emmet: escribe HTML diez veces más rápido

**Emmet** viene incluido en VS Code. Escribes una abreviatura en un archivo HTML y pulsas `Tab`:

| Escribes | Obtienes |
| --- | --- |
| `!` | El esqueleto completo de un documento HTML |
| `div.tarjeta` | `<div class="tarjeta"></div>` |
| `section#contacto` | `<section id="contacto"></section>` |
| `ul>li*3` | Una lista con tres `<li>` |
| `nav>a[href=#]*4` | Un `<nav>` con cuatro enlaces |
| `article.tarjeta>h2+p` | Un `<article>` con un `<h2>` y un `<p>` dentro |
| `li.item$*3` | `<li class="item1">`, `item2`, `item3` |
| `lorem10` | Diez palabras de texto de relleno |

Los símbolos: **`.`** clase, **`#`** id, **`>`** dentro de, **`+`** al lado de, **`*`** repetir, **`$`** número, **`[]`** atributos. Con práctica, maquetas la estructura de una página en segundos.

Emmet también funciona en CSS: `p10` + `Tab` → `padding: 10px;`, `df` → `display: flex;`.

## Los atajos que usarás todos los días

### Moverte

| Atajo | Qué hace |
| --- | --- |
| `Ctrl + P` | **Abrir un archivo** escribiendo parte de su nombre. El más útil de todos |
| `Ctrl + Shift + P` | La **paleta de comandos**: busca cualquier acción de VS Code por su nombre |
| `` Ctrl + ` `` | Abrir / cerrar la terminal |
| `Ctrl + B` | Mostrar / ocultar la barra lateral |
| `Ctrl + Shift + F` | **Buscar en todos los archivos** del proyecto |
| `Ctrl + G` | Ir a una línea concreta (por ejemplo, la del error) |
| `F12` | Ir a donde está definida una función o variable |

### Editar

| Atajo | Qué hace |
| --- | --- |
| `Alt + ↑` / `Alt + ↓` | **Mover la línea** arriba o abajo |
| `Shift + Alt + ↓` | **Duplicar la línea** |
| `Ctrl + Shift + K` | Borrar la línea entera |
| `Ctrl + /` | **Comentar / descomentar** la línea (o lo seleccionado) |
| `Ctrl + D` | Seleccionar la **siguiente aparición** de la palabra, con otro cursor |
| `F2` | **Renombrar** una variable o función en todos los sitios donde se usa |
| `Ctrl + Z` / `Ctrl + Shift + Z` | Deshacer / rehacer |

### Multicursor: el superpoder

Con **varios cursores** escribes en varios sitios a la vez:

- **`Ctrl + D`** repetido: selecciona la palabra y sus siguientes apariciones, una a una. Escribe, y cambias todas a la vez.
- **`Alt + clic`**: añade un cursor donde hagas clic.
- **`Ctrl + Alt + ↓`**: añade un cursor en la línea de abajo.

Pruébalo: escribe tres líneas con `color: red;`, ponte en un `red`, pulsa `Ctrl + D` dos veces y escribe `blue`. Las tres cambian.

> **`F2` es mejor que `Ctrl + D` para renombrar** variables y funciones: entiende tu código y solo cambia las que de verdad son esa variable, también en otros archivos.

## Ver los errores: el panel de problemas

Cuando ESLint o el propio VS Code detectan algo raro, lo subrayan en **rojo** (error) o **amarillo** (aviso). Pasa el ratón por encima para leer el mensaje, y abre el panel **Problemas** (`Ctrl + Shift + M`) para ver todos los del proyecto.

Muchas veces aparece una **bombilla** 💡 al lado: haz clic (o `Ctrl + .`) y VS Code te propone arreglarlo solo.

## La terminal integrada

La terminal de VS Code (`` Ctrl + ` ``) se abre ya **en la carpeta del proyecto**. Puedes tener varias a la vez con el botón `+`: una con `npm run dev` corriendo y otra para Git. Lo vimos en el post de la terminal.

## Git sin salir del editor

El icono de las ramas de la barra lateral (o `Ctrl + Shift + G`) es el panel de **control de código fuente**:

- Ves los archivos cambiados, y al hacer clic en uno, **qué líneas** cambiaron.
- Con el `+` añades un archivo (como `git add`), escribes el mensaje arriba y pulsas **Commit**.
- Abajo a la izquierda ves la **rama** actual, y puedes cambiar de rama haciendo clic.

Es muy cómodo para revisar tus cambios antes de un commit. Pero aprende primero los comandos (tienes los posts de Git desde cero y Git en equipo): así entiendes lo que hacen los botones.

## Tu turno

1. Activa **Format On Save** e instala **Prettier**. Desordena un archivo a propósito (sangrías mal, todo en una línea) y guarda.
2. En un HTML vacío, escribe con Emmet en una sola línea: un `<header>` con un `<nav>` de 4 enlaces, y un `<main>` con 3 `<article class="tarjeta">`, cada uno con un `<h2>` y un `<p>`. Pista: usa paréntesis para agrupar: `(header>nav>a*4)+main>article.tarjeta*3>h2+p`.
3. Durante un día entero, oblígate a abrir los archivos **solo con `Ctrl + P`**.

## Errores comunes

- **Abrir archivos sueltos** en vez de la carpeta del proyecto.
- **Instalar decenas de extensiones** que se pisan entre ellas (dos formateadores distintos, por ejemplo). Menos es más.
- **No activar el formateo al guardar** y perder tiempo ordenando sangrías a mano.
- **Ignorar los subrayados.** Los avisos de ESLint suelen ser bugs que todavía no han ocurrido.
- **Querer aprender todos los atajos a la vez.** Aprende dos o tres por semana hasta que los hagas sin pensar.

## Para profundizar

- [Atajos de teclado de VS Code en PDF (Windows)](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf)
- [Atajos de teclado de VS Code en PDF (Mac)](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf)
- [Chuleta de Emmet (en inglés)](https://docs.emmet.io/cheat-sheet/)

En resumen: abre siempre la **carpeta** del proyecto, activa **Format On Save** con **Prettier**, instala **ESLint** y **Live Server**, escribe HTML con **Emmet** y aprende los atajos clave: **`Ctrl + P`** para abrir archivos, **`Alt + ↑/↓`** para mover líneas, **`Ctrl + D`** para multicursor y **`F2`** para renombrar. Diez minutos de configuración que te ahorran horas.
