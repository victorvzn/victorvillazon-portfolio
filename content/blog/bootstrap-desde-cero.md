---
title: 'Bootstrap desde cero: cómo usarlo, ventajas y desventajas'
description: 'Qué es Bootstrap, cómo añadirlo a una página en un minuto, su sistema de columnas, sus componentes más usados (botones, tarjetas, navbar) y cuándo te conviene usarlo y cuándo no.'
date: 2026-11-27
series: frameworks
tags: [CSS, Bootstrap, Frameworks]
draft: false
---

**Bootstrap** es el framework de CSS más famoso de la historia de la web. Lo creó Twitter en 2011 y todavía hoy lo encontrarás en miles de páginas, paneles de administración y proyectos de empresa.

Su idea es sencilla: **te da componentes ya hechos** (botones, tarjetas, menús, formularios, ventanas modales) que puedes usar solo escribiendo clases en tu HTML. Sin escribir CSS.

Igual que con Tailwind, un aviso: **Bootstrap no sustituye a saber CSS**. Te ahorra trabajo, pero cuando quieras cambiar algo o algo se vea raro, necesitarás entender qué está pasando por debajo.

## Añadir Bootstrap a una página

La forma más rápida es cargarlo desde un **CDN** (un servidor que te sirve el archivo). Copia esta plantilla en un archivo `index.html` y ábrelo en el navegador:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mi primera página con Bootstrap</title>

  <!-- 1. El CSS de Bootstrap -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/css/bootstrap.min.css">
</head>
<body>
  <div class="container py-5">
    <h1 class="text-primary">¡Hola, Bootstrap!</h1>
    <p class="lead">Si este título es azul, todo funciona.</p>
    <button class="btn btn-primary">Mi primer botón</button>
  </div>

  <!-- 2. El JavaScript de Bootstrap (para menús, modales, desplegables...) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

Son solo dos líneas:

- El **`<link>`** en el `<head>` carga los estilos.
- El **`<script>`** al final del `<body>` carga el JavaScript. Solo lo necesitan los componentes que se mueven: el menú que se abre en el móvil, los desplegables, los modales... Si solo usas botones y tarjetas, puedes quitarlo.

Y no olvides la etiqueta **`<meta name="viewport">`**: sin ella, Bootstrap no se adapta bien al móvil.

Los ejemplos que vienen a continuación abren el playground con Bootstrap (CSS y JavaScript) ya cargado, así que no tienes que añadir nada. Si los quieres probar en tu propio archivo, pégalos **dentro del `<body>`** de esta plantilla.

## La idea clave: clases con nombre

En Bootstrap no escribes CSS: **añades clases** que ya existen. Cada componente tiene una clase base y variantes:

```html playground=botones libs=bootstrap5
<button class="btn btn-primary">Guardar</button>
<button class="btn btn-success">Aceptar</button>
<button class="btn btn-danger">Borrar</button>
<button class="btn btn-outline-secondary">Cancelar</button>
<button class="btn btn-primary btn-lg">Grande</button>
<button class="btn btn-primary btn-sm">Pequeño</button>
```

- **`btn`** dice "esto es un botón de Bootstrap".
- **`btn-primary`**, **`btn-danger`**... eligen el color.
- **`btn-lg`** y **`btn-sm`** cambian el tamaño.

Los colores tienen **nombres con significado**, no nombres de color. Los verás en botones, textos, fondos y alertas:

| Nombre | Color por defecto | Para qué se usa |
| --- | --- | --- |
| `primary` | azul | la acción principal |
| `secondary` | gris | acciones secundarias |
| `success` | verde | algo salió bien |
| `danger` | rojo | errores o acciones peligrosas |
| `warning` | amarillo | avisos |
| `info` | celeste | información |
| `light` / `dark` | blanco / negro | fondos y contrastes |

Así, `text-danger` es texto rojo, `bg-success` es un fondo verde y `alert-warning` es una alerta amarilla.

## El sistema de columnas (grid)

Esto es lo más útil de Bootstrap y lo que lo hizo famoso. Divide el ancho de la página en **12 columnas** imaginarias, y tú decides cuántas ocupa cada caja.

Siempre se usan tres piezas, una dentro de otra:

1. **`container`**: centra el contenido y le pone un ancho máximo.
2. **`row`**: una fila.
3. **`col-*`**: las columnas de esa fila.

```html playground=columnas libs=bootstrap5
<div class="container">
  <div class="row">
    <div class="col-8 bg-light border p-3">Ocupa 8 de 12</div>
    <div class="col-4 bg-light border p-3">Ocupa 4 de 12</div>
  </div>
</div>
```

8 + 4 = 12: la fila está completa. Si pones solo `col` (sin número), Bootstrap reparte el espacio a partes iguales.

### Columnas responsive

Aquí está la magia. Puedes poner un **tamaño de pantalla** en medio del nombre:

| Prefijo | Se aplica desde |
| --- | --- |
| `col-` | siempre (móvil) |
| `col-sm-` | 576px |
| `col-md-` | 768px |
| `col-lg-` | 992px |
| `col-xl-` | 1200px |

```html playground=responsive libs=bootstrap5
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-3 border p-3">A</div>
    <div class="col-12 col-md-6 col-lg-3 border p-3">B</div>
    <div class="col-12 col-md-6 col-lg-3 border p-3">C</div>
    <div class="col-12 col-md-6 col-lg-3 border p-3">D</div>
  </div>
</div>
```

Se lee así: "en el móvil, cada caja ocupa las 12 columnas (una debajo de otra); desde `md`, 6 (dos por fila); desde `lg`, 3 (cuatro por fila)". Abre la página y cambia el ancho de la ventana para verlo.

Igual que en Tailwind, funciona **mobile first**: la clase sin tamaño es la del móvil y las demás **añaden** cambios en pantallas más grandes. Por debajo, Bootstrap usa Flexbox y media queries, lo mismo que viste en la serie de CSS.

## Componentes que vas a usar siempre

Bootstrap trae decenas de componentes. No hace falta memorizarlos: lo normal es **ir a la documentación, copiar el ejemplo y adaptarlo**. Estos son los más comunes.

### Tarjetas (cards)

```html playground=tarjeta libs=bootstrap5
<div class="card" style="max-width: 20rem;">
  <img src="https://picsum.photos/400/200" class="card-img-top" alt="Paisaje de montañas">
  <div class="card-body">
    <h5 class="card-title">Viaje a Cusco</h5>
    <p class="card-text">Cinco días recorriendo el Valle Sagrado y Machu Picchu.</p>
    <a href="#" class="btn btn-primary">Ver más</a>
  </div>
</div>
```

### Alertas

```html playground=alertas libs=bootstrap5
<div class="alert alert-success" role="alert">
  ¡Tu mensaje se ha enviado correctamente!
</div>

<div class="alert alert-danger" role="alert">
  El correo no es válido.
</div>
```

### Formularios

```html playground=formulario libs=bootstrap5
<form class="container" style="max-width: 24rem;">
  <div class="mb-3">
    <label for="email" class="form-label">Correo</label>
    <input type="email" id="email" class="form-control" placeholder="tu@email.com">
  </div>

  <div class="mb-3 form-check">
    <input type="checkbox" id="recordar" class="form-check-input">
    <label for="recordar" class="form-check-label">Recordarme</label>
  </div>

  <button type="submit" class="btn btn-primary w-100">Entrar</button>
</form>
```

Fíjate en que el HTML sigue siendo el de siempre (`<label>`, `<input>`, `for` e `id`): Bootstrap solo le pone estilo con `form-control` y `form-label`.

### Barra de navegación (navbar)

Este componente sí necesita el **JavaScript** de Bootstrap: en el móvil, el menú se esconde y aparece un botón de "hamburguesa" que lo abre.

```html playground=navbar libs=bootstrap5
<nav class="navbar navbar-expand-md bg-dark" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand" href="#">MiTienda</a>

    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse" data-bs-target="#menu"
            aria-controls="menu" aria-expanded="false" aria-label="Abrir menú">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="menu">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link active" href="#">Inicio</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Productos</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Contacto</a></li>
      </ul>
    </div>
  </div>
</nav>
```

No has escrito ni una línea de JavaScript: los atributos **`data-bs-toggle`** y **`data-bs-target`** le dicen a Bootstrap "este botón abre y cierra el elemento con id `menu`". Son atributos `data-*`, los mismos que viste en la serie de HTML.

`navbar-expand-md` significa "desde `md` (768px) muestra el menú completo; por debajo, la hamburguesa".

## Clases de utilidad

Además de componentes, Bootstrap trae **clases pequeñas** para retocar cosas sin escribir CSS, parecidas a las de Tailwind:

| Clase | Qué hace |
| --- | --- |
| `m-3`, `mt-2`, `mb-4` | margen (de 0 a 5) |
| `p-3`, `px-4`, `py-2` | padding (de 0 a 5) |
| `text-center`, `text-end` | alineación del texto |
| `fw-bold` | negrita |
| `d-none`, `d-flex` | `display: none`, `display: flex` |
| `d-none d-md-block` | oculto en el móvil, visible desde `md` |
| `justify-content-between`, `align-items-center` | alineación en flex |
| `gap-3` | separación entre hijos de un flex o grid |
| `w-100` | `width: 100%` |
| `rounded`, `shadow` | esquinas redondeadas y sombra |

Los números del espaciado van del **0 al 5** (de nada a 3rem), no son píxeles. Y `s` / `e` significan *start* y *end* (izquierda y derecha en español), por eso `ms-auto` empuja algo a la derecha.

## Modo oscuro

Desde la versión 5.3, basta con un atributo en la etiqueta `<html>`:

```html
<html lang="es" data-bs-theme="dark">
```

Todos los componentes cambian a colores oscuros. También puedes ponerlo en un solo elemento, como hicimos con la navbar.

## Personalizar los colores

Bootstrap usa **variables CSS** (empiezan por `--bs-`). Puedes sobrescribirlas en tu propio archivo CSS, cargado **después** del de Bootstrap:

```css playground=personalizar libs=bootstrap5
:root {
  --bs-body-font-family: Georgia, serif;
  --bs-link-color: #b45309;
}

.btn-primary {
  --bs-btn-bg: #f59e0b;
  --bs-btn-border-color: #f59e0b;
  --bs-btn-hover-bg: #d97706;
  --bs-btn-hover-border-color: #d97706;
}
```

```html playground=personalizar
<div class="container py-4">
  <h2>Mi marca</h2>
  <p>Un texto con la nueva letra y un <a href="#">enlace naranja</a>.</p>
  <button class="btn btn-primary">Botón con mis colores</button>
</div>
```

Para cambios grandes (por ejemplo, que `primary` sea naranja en **todo** el sitio), se instala con npm y se personaliza con **Sass**, un lenguaje que genera CSS. Eso ya es para más adelante.

## Instalarlo con npm

En un proyecto con Vite o React se instala como cualquier paquete:

```bash
npm install bootstrap
```

Y se importa en tu archivo JavaScript principal:

```js
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap' // solo si usas componentes con JavaScript
```

## Ventajas

- **Empiezas en un minuto.** Una línea en el `<head>` y ya tienes una web con buen aspecto.
- **Componentes listos.** Menús, modales, formularios, tablas y carruseles que ya funcionan y ya son responsive.
- **Responsive casi gratis.** El sistema de 12 columnas resuelve la mayoría de layouts sin escribir media queries.
- **Funciona igual en todos los navegadores.** Bootstrap ya resolvió las diferencias por ti.
- **Documentación excelente** y muchísima ayuda en internet: cualquier duda ya la tuvo alguien antes.
- **Muy usado en empresas.** Muchos proyectos antiguos y paneles internos lo usan, así que te tocará verlo.
- **Ideal para prototipos** y herramientas internas, donde importa más que funcione que el diseño original.

## Desventajas

- **Todas las webs se parecen.** Si no lo personalizas, se nota a kilómetros que es Bootstrap.
- **Pesa más de lo que usas.** El CSS completo trae todos los componentes aunque uses tres.
- **Personalizarlo a fondo cuesta.** Cambiar el diseño de verdad implica sobrescribir estilos o aprender Sass, y a veces pelearte con la especificidad.
- **El HTML se llena de clases** y de `div` anidados (`container` → `row` → `col`).
- **Te puede hacer saltarte CSS.** Si solo copias ejemplos, no aprendes Flexbox, Grid ni media queries, y te bloquearás cuando algo no encaje.
- **Menos de moda** en proyectos nuevos: hoy muchos equipos eligen Tailwind o escriben su propio CSS.

## ¿Bootstrap o Tailwind?

| | Bootstrap | Tailwind |
| --- | --- | --- |
| Qué te da | componentes ya hechos (`card`, `navbar`) | clases pequeñas para construirlos tú |
| Velocidad al empezar | muy rápida | rápida, si sabes CSS |
| Diseño propio | cuesta más | fácil |
| Incluye JavaScript | sí (menús, modales) | no |
| Dónde lo verás | proyectos de empresa, paneles, webs antiguas | proyectos nuevos con React, Vue o Next.js |

No hay uno mejor: **Bootstrap es como comprar muebles montados y Tailwind como tener piezas para montarlos a tu gusto**. Si necesitas algo funcional rápido, Bootstrap. Si quieres un diseño propio, Tailwind o CSS.

## Errores comunes

- **Olvidar el `<meta name="viewport">`.** Sin él, en el móvil la página se ve diminuta y las columnas no cambian.
- **Olvidar el `<script>`.** Si el menú hamburguesa o un modal no se abren, casi siempre es que falta el JavaScript (`bootstrap.bundle.min.js`).
- **Poner columnas sin `row`.** Las `col-*` tienen que estar **dentro** de una `row`, y la `row` dentro de un `container`.
- **Sumar más de 12.** Si las columnas de una fila suman más de 12, las que sobran bajan a la siguiente línea.
- **Copiar ejemplos de Bootstrap 4 o 3.** Muchos tutoriales antiguos usan clases que ya no existen (`ml-auto` ahora es `ms-auto`, `data-toggle` ahora es `data-bs-toggle`). Mira siempre la versión de la documentación.
- **Cargar tu CSS antes que el de Bootstrap.** Tu archivo debe ir **después**, o Bootstrap pisará tus estilos (recuerda la cascada).

## Para profundizar

- [Documentación oficial de Bootstrap (en inglés)](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Ejemplos oficiales: plantillas completas para copiar](https://getbootstrap.com/docs/5.3/examples/)

En resumen: Bootstrap es un framework de **componentes ya hechos** que usas con clases (`btn btn-primary`, `card`, `navbar`). Se añade con **un `<link>` y un `<script>`**, organiza la página en **12 columnas** que se adaptan a cada pantalla y trae utilidades para márgenes, colores y alineación. Es perfecto para tener algo funcional rápido, pero cuanto más personal quieras el diseño, más CSS vas a necesitar.
