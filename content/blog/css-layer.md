---
title: '@layer en CSS: ordena la cascada y acaba con las guerras de especificidad'
description: 'Las capas de cascada te dejan decidir qué grupo de estilos gana (reset, librerías, componentes, utilidades) sin pelearte con la especificidad ni con !important.'
date: 2026-11-26
series: css
tags: [CSS, CSS moderno, Cascada]
draft: true
---

Instalas una librería de componentes y quieres cambiar el color de sus botones. Escribes `.boton { background: green }` y no funciona, porque la librería usa un selector más específico. Pruebas `.contenedor .boton`. Tampoco. Acabas con un `!important`. Y dentro de un mes, alguien necesitará otro `!important` para ganarle al tuyo.

Las **capas de cascada** (`@layer`) resuelven este problema de raíz.

## Repaso rápido: cómo gana una regla

En el post de cascada y herencia vimos que, cuando dos reglas chocan, gana la **importante**, luego la **más específica** y, si empatan, **la última**. `@layer` añade un paso **antes** de la especificidad:

1. Importancia (`!important`)
2. **Capa** ← nuevo
3. Especificidad
4. Orden

Es decir: **una regla en una capa posterior gana a una de una capa anterior, aunque sea mucho menos específica.**

## Cómo se usa

Primero declaras **el orden de las capas**, de la que menos manda a la que más:

```css
@layer reset, base, componentes, utilidades;
```

Después metes tus estilos en cada capa:

```css
@layer reset {
  * { margin: 0; box-sizing: border-box; }
}

@layer componentes {
  .boton { background: #4f46e5; }
}

@layer utilidades {
  .oculto { display: none; }
}
```

El orden de la primera línea es el que manda. Da igual en qué orden escribas después los bloques.

## El ejemplo: la especificidad ya no importa entre capas

```html playground=capas
<nav id="menu">
  <a class="enlace" href="#">Enlace normal</a>
  <a class="enlace destacado" href="#">Enlace destacado</a>
</nav>
```

```css playground=capas
@layer libreria, mis-estilos;

/* Una "librería" con un selector muy específico: un id + una clase */
@layer libreria {
  #menu .enlace {
    color: #2563eb;
    font-family: system-ui, sans-serif;
  }
}

/* Mi estilo: una sola clase, mucho menos específico... */
@layer mis-estilos {
  .destacado {
    color: #dc2626;
    font-weight: 700;
  }
}

nav {
  display: flex;
  gap: 16px;
  padding: 24px;
}
```

`#menu .enlace` tiene un id (mucho más específico que una clase). Sin capas, ganaría siempre. Pero como `mis-estilos` va **después** que `libreria` en el orden de capas, **`.destacado` gana**. Sin `!important`, sin selectores largos.

## Los estilos sin capa ganan a todos

Las reglas que **no** están en ninguna capa van, a efectos de la cascada, **después de todas las capas**. Es decir, ganan a cualquier estilo con capa:

```css
@layer componentes {
  .boton { background: blue; }
}

.boton { background: green; } /* sin capa: gana */
```

Esto es muy útil para **migrar** un proyecto poco a poco: metes las librerías y el código viejo en capas, y tu código nuevo (sin capa) siempre gana.

## Meter una librería entera en una capa

Puedes importar un archivo CSS completo **dentro de una capa**:

```css
@layer libreria, mis-estilos;

@import url('https://cdn.ejemplo.com/libreria.css') layer(libreria);
```

Ahora todo lo de la librería, por específico que sea, pierde contra tus estilos de `mis-estilos`. Es el uso estrella de `@layer`.

> Recuerda que los `@import` tienen que ir al **principio** del archivo CSS, antes de cualquier otra regla (salvo `@layer` y `@charset`).

## Una estructura recomendada

Una organización muy usada en proyectos reales:

```css
@layer reset, base, layout, componentes, utilidades;

@layer reset {
  /* Igualar los navegadores: box-sizing, márgenes a 0... */
}

@layer base {
  /* Estilos de las etiquetas: body, h1, a, button... */
}

@layer layout {
  /* La estructura: contenedores, grids de la página */
}

@layer componentes {
  /* Tarjetas, botones, menús, modales */
}

@layer utilidades {
  /* Clases de una sola cosa: .oculto, .texto-centro, .sr-only */
}
```

Las **utilidades** van al final porque son clases pequeñas que aplicas a propósito para **sobrescribir** algo: `.oculto` siempre debe ganar, esté donde esté. Con esta estructura, gana sin necesidad de `!important`.

Por cierto, Tailwind (que tiene su post en la serie de Frameworks) organiza sus estilos internamente con capas parecidas: `base`, `components` y `utilities`.

## Capas anidadas

Las capas pueden tener subcapas, y se nombran con un punto:

```css
@layer componentes {
  @layer botones { ... }
  @layer tarjetas { ... }
}

/* Desde fuera también se puede escribir así */
@layer componentes.botones {
  .boton-grande { ... }
}
```

## ⚠️ El giro de `!important`

Con `!important`, el orden de las capas **se invierte**: un `!important` en una capa **anterior** gana a un `!important` de una capa posterior. Es así a propósito, para que un reset o una librería puedan "proteger" algo crítico. Pero con capas bien ordenadas, casi nunca necesitarás `!important`.

## Cómo verlo en las DevTools

En la pestaña **Styles** de Chrome, cada regla muestra a qué capa pertenece (por ejemplo, `@layer componentes`). Y si haces clic en el nombre de la capa, ves el orden de todas.

## Tu turno

```html playground=ejercicio
<button class="btn btn-primario">Comprar</button>
<button class="btn btn-primario oculto">No deberías verme</button>
```

```css playground=ejercicio
/* 1. Declara el orden: reset, componentes, utilidades
   2. Mete cada bloque en su capa
   3. Comprueba que .oculto gana a .btn.btn-primario SIN usar !important */

* {
  margin: 0;
  box-sizing: border-box;
}

.btn.btn-primario {
  display: inline-block;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #16a34a;
  color: white;
  font: 600 16px system-ui, sans-serif;
}

.oculto {
  display: none;
}
```

## Errores comunes

- **No declarar el orden al principio.** Si no lo haces, las capas se ordenan según aparecen por primera vez, y es fácil equivocarse. Declara siempre `@layer a, b, c;` arriba del todo.
- **Olvidar que los estilos sin capa ganan a todo.** Si mezclas, ten claro qué está dentro y qué fuera.
- **Esperar que `!important` funcione igual que sin capas.** Con `!important`, el orden se invierte.
- **Usar capas para todo en un proyecto pequeño.** En una landing de un archivo, no hacen falta. Brillan cuando hay librerías, varios archivos o un equipo.

## Para profundizar

- [`@layer` en MDN](https://developer.mozilla.org/es/docs/Web/CSS/@layer)
- [Capas de cascada en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Styling_basics/Cascade_layers)

En resumen: **`@layer`** te deja agrupar los estilos en **capas** y decidir **qué capa gana**, por encima de la especificidad. Declara el orden al principio (`@layer reset, base, componentes, utilidades;`), mete cada estilo en su capa y **las librerías en la primera**. Recuerda que los estilos **sin capa ganan a todos** y que, con capas bien ordenadas, el `!important` sobra.
