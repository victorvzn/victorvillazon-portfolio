---
title: 'Condicionales en JavaScript: if, else, switch y el ternario'
description: 'Haz que tu programa tome decisiones. if, else if, switch, el operador ternario y los operadores lógicos &&, || y !, con ejemplos de una tienda.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos]
draft: true
---

Un programa sin condicionales hace siempre lo mismo. Con ellos puede **decidir**: mostrar "Agotado" si no hay stock, aplicar un descuento si la compra supera cierto monto o saludar distinto por la mañana y por la noche.

## `if`: "si pasa esto, haz aquello"

```js playground=if
const stock = 0

if (stock === 0) {
  console.log('Producto agotado')
}
```

Lo que va entre paréntesis es la **condición**. Si es `true`, se ejecuta el bloque entre llaves `{ }`. Si es `false`, se salta.

## `else` y `else if`: los otros caminos

```js playground=else
const total = 180

if (total >= 200) {
  console.log('Envío gratis 🎉')
} else if (total >= 100) {
  console.log('Envío a mitad de precio')
} else {
  console.log('Envío: 15 soles')
}
```

JavaScript revisa las condiciones **de arriba a abajo** y se queda con la **primera** que se cumpla. Por eso el orden importa: si pusieras primero `total >= 100`, un pedido de 250 nunca llegaría a "envío gratis".

## Comparar valores

| Operador | Significa | Ejemplo |
| --- | --- | --- |
| `===` | igual a | `edad === 18` |
| `!==` | distinto de | `rol !== 'admin'` |
| `>` / `<` | mayor / menor que | `total > 100` |
| `>=` / `<=` | mayor o igual / menor o igual | `nota >= 11` |

Recuerda usar siempre `===` y no `==` (te lo explico en el post de tipos de datos).

## Combinar condiciones: `&&`, `||` y `!`

- **`&&` (y)**: tienen que cumplirse **las dos**.
- **`||` (o)**: basta con que se cumpla **una**.
- **`!` (no)**: le da la vuelta: `true` pasa a `false` y al revés.

```js playground=logicos
const edad = 20
const tieneEntrada = true
const esVip = false

if (edad >= 18 && tieneEntrada) {
  console.log('Puede entrar al concierto')
}

if (esVip || edad < 12) {
  console.log('Entra por la puerta rápida')
} else {
  console.log('Hace la fila normal')
}

if (!tieneEntrada) {
  console.log('Primero compra tu entrada')
}
```

## `switch`: cuando comparas una variable con muchos valores

Si tienes muchos `else if` que comparan **la misma variable**, `switch` se lee mejor:

```js playground=switch
const metodoDePago = 'yape'

switch (metodoDePago) {
  case 'tarjeta':
    console.log('Introduce los datos de tu tarjeta')
    break
  case 'yape':
  case 'plin':
    console.log('Escanea el código QR')
    break
  case 'efectivo':
    console.log('Paga al recibir el pedido')
    break
  default:
    console.log('Método de pago no válido')
}
```

- Cada `case` es un valor posible.
- **`break`** termina el `switch`. Si lo olvidas, sigue ejecutando el `case` de abajo (a veces es lo que quieres, como con `'yape'` y `'plin'`, que comparten mensaje).
- **`default`** es el "en cualquier otro caso".

## El operador ternario: un `if` en una línea

Cuando solo quieres **elegir entre dos valores**, el ternario es más corto:

```js playground=ternario
const stock = 3

const mensaje = stock > 0 ? 'Disponible' : 'Agotado'
console.log(mensaje)

const unidades = 1
console.log(`Tienes ${unidades} ${unidades === 1 ? 'producto' : 'productos'} en el carrito`)
```

Se lee así: `condición ? valor si es true : valor si es false`. Es muy usado dentro de template literals y, más adelante, en React.

Úsalo solo para casos sencillos. Si empiezas a anidar ternarios (`a ? b : c ? d : e`), vuelve al `if`: nadie lo va a entender.

## Valores "truthy" y "falsy"

En una condición no hace falta poner siempre un booleano. JavaScript convierte cualquier valor a `true` o `false`. Estos valores cuentan como **falso** (*falsy*):

`false`, `0`, `''` (texto vacío), `null`, `undefined` y `NaN`.

Todo lo demás cuenta como **verdadero** (*truthy*).

```js playground=truthy
const nombre = ''

if (nombre) {
  console.log(`Hola, ${nombre}`)
} else {
  console.log('Escribe tu nombre')
}
```

Es muy útil para comprobar si un campo de formulario está vacío. Pero cuidado: el número `0` también es falsy, así que `if (cantidad)` fallaría cuando la cantidad es justamente 0.

## Errores comunes

- **Usar `=` en vez de `===`.** `if (edad = 18)` **asigna** 18 a `edad`, no compara. Siempre `===`.
- **Mal orden en los `else if`.** Pon primero la condición más específica.
- **Olvidar el `break` en un `switch`.** El código "se cae" al siguiente `case`.
- **Ternarios dentro de ternarios.** Si necesitas más de dos caminos, usa `if` o `switch`.

## Para profundizar

- [`if...else` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/if...else)
- [`switch` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/switch)

En resumen: **`if` / `else if` / `else`** para decidir entre caminos (en orden), **`&&`, `||` y `!`** para combinar condiciones, **`switch`** cuando comparas una variable con muchos valores y el **ternario** para elegir entre dos valores en una línea.
