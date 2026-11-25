---
title: 'Template literals: adiós a concatenar con +'
description: 'Las comillas invertidas de JavaScript: variables dentro del texto, varias líneas y hasta HTML. Con una tarjeta de producto.'
date: 2026-11-25
series: javascript
tags: [JavaScript, ES6]
draft: true
order: 21
---

Mira esta línea:

```js
const mensaje = 'Hola ' + nombre + ', tienes ' + cantidad + ' productos en tu carrito.'
```

Comillas, signos `+`, espacios que se te olvidan… Es fácil equivocarse. Con **template literals** (plantillas de texto) queda así:

```js
const mensaje = `Hola ${nombre}, tienes ${cantidad} productos en tu carrito.`
```

Se lee como el texto final. Vamos a ver qué más pueden hacer.

## Las comillas invertidas

Un template literal se escribe entre **comillas invertidas** (`` ` ``), no entre comillas simples ni dobles. En un teclado en español suelen estar al lado de la tecla `Enter` o con `AltGr` + `}`.

Dentro, todo lo que pongas en `${ }` se **evalúa** y se mete en el texto:

```js playground=basico
const nombre = 'Ana'
const cantidad = 3

console.log(`Hola ${nombre}, tienes ${cantidad} productos.`)
```

## Cualquier expresión vale

Dentro de `${}` no solo van variables: puedes hacer cuentas, llamar funciones o usar un operador ternario.

```js playground=expresiones
const precio = 120
const cantidad = 2

console.log(`Total: S/ ${precio * cantidad}`)
console.log(`Total con IGV: S/ ${(precio * cantidad * 1.18).toFixed(2)}`)
console.log(`Tienes ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}`)
console.log(`Nombre en mayúsculas: ${'ana'.toUpperCase()}`)
```

El ternario (`condición ? sí : no`) es muy útil para plurales.

## Varias líneas

Con comillas normales, un salto de línea da error. Con comillas invertidas, el texto puede ocupar **varias líneas**, tal cual lo escribes:

```js playground=lineas
const ticket = `
  TIENDA ONLINE
  -------------
  Teclado   S/ 120
  Mouse     S/  45
`

console.log(ticket)
```

## Crear HTML con datos

Aquí es donde más los vas a usar: armar HTML con datos de JavaScript.

```html playground=tarjeta
<div id="tienda"></div>
```

```css playground=tarjeta
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.tarjeta {
  width: 220px;
  padding: 16px;
  border-radius: 12px;
  background: #f4f4f5;
}

.tarjeta h2 {
  margin: 0 0 8px;
}

.agotado {
  color: #dc2626;
}
```

```js playground=tarjeta
const producto = { nombre: 'Audífonos', precio: 90, stock: 0 }

document.querySelector('#tienda').innerHTML = `
  <article class="tarjeta">
    <h2>${producto.nombre}</h2>
    <p>S/ ${producto.precio}</p>
    <p class="${producto.stock > 0 ? '' : 'agotado'}">
      ${producto.stock > 0 ? `Quedan ${producto.stock}` : 'Agotado'}
    </p>
  </article>
`
```

Cambia el `stock` a `5` en el playground y mira cómo cambia la tarjeta.

## Errores comunes

- **Usar comillas normales con `${}`.** `'Hola ${nombre}'` imprime literalmente `${nombre}`. Necesitas comillas invertidas.
- **Meter texto del usuario con `innerHTML`.** Si el texto lo escribe un usuario, podría inyectar HTML o scripts. Para texto del usuario usa `textContent`.
- **Olvidar el `$`.** `{nombre}` sin el dólar se imprime tal cual.

## Para profundizar

- [Plantillas literales en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Template_literals)

En resumen: **comillas invertidas** para el texto, **`${}`** para meter cualquier expresión, y se acabaron los `+` y los espacios perdidos.
