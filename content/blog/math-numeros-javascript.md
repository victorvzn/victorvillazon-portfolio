---
title: 'Números en JavaScript: redondear, aleatorios y formatear dinero'
description: 'Math.round, floor y ceil, cómo generar un número aleatorio entre dos valores, por qué 0.1 + 0.2 no da 0.3 y cómo mostrar precios en soles con Intl.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos]
draft: true
---

Calcular el total de un carrito, sortear un ganador, mostrar una nota con un decimal, enseñar un precio como `S/ 1,250.00`... Los números están en casi cualquier proyecto. JavaScript trae el objeto **`Math`** y algunas funciones que te van a resolver la vida.

## Operaciones básicas

```js playground=operaciones
console.log(10 + 3)  // 13 suma
console.log(10 - 3)  // 7  resta
console.log(10 * 3)  // 30 multiplicación
console.log(10 / 3)  // 3.3333333333333335 división
console.log(10 % 3)  // 1  resto de la división
console.log(2 ** 3)  // 8  potencia (2 al cubo)
```

El **resto** (`%`) es más útil de lo que parece: `numero % 2 === 0` te dice si un número es par.

## Redondear: round, floor, ceil y trunc

```js playground=redondear
const precio = 4.6

console.log(Math.round(precio)) // 5: al más cercano
console.log(Math.floor(precio)) // 4: hacia abajo (el "suelo")
console.log(Math.ceil(precio))  // 5: hacia arriba (el "techo")
console.log(Math.trunc(precio)) // 4: quita los decimales

// Con negativos se nota la diferencia entre floor y trunc
console.log(Math.floor(-4.6)) // -5
console.log(Math.trunc(-4.6)) // -4
```

¿Cuándo usar cada uno?

- **`round`**: el redondeo "normal" (una nota, una media).
- **`ceil`**: cuando necesitas "uno más si sobra algo". Por ejemplo, ¿cuántas páginas necesito para 23 resultados de 10 en 10? `Math.ceil(23 / 10)` = 3.
- **`floor`**: para números aleatorios (lo ves más abajo) o para "cuántos caben enteros".

## Redondear a decimales

`Math.round` redondea a enteros. Para un decimal hay un truco: multiplica, redondea y divide.

```js playground=decimales
const media = 15.666666

console.log(Math.round(media * 10) / 10)   // 15.7   (número)
console.log(media.toFixed(1))              // '15.7' (texto)
console.log(media.toFixed(2))              // '15.67' (texto)
```

**`toFixed` devuelve un texto**, no un número. Es perfecto para **mostrar** en pantalla, pero si sigues calculando con él, `'15.7' + 1` te dará `'15.71'`. Para seguir calculando, usa el truco de multiplicar y dividir.

## Máximo y mínimo

```js playground=maxmin
console.log(Math.max(4, 19, 7)) // 19
console.log(Math.min(4, 19, 7)) // 4

// Con un array, usa el spread (...)
const notas = [14, 18, 9, 16]
console.log(Math.max(...notas)) // 18
console.log(Math.min(...notas)) // 9
```

`Math.max(notas)` sin los tres puntos da `NaN`: espera números sueltos, no un array.

## Números aleatorios

`Math.random()` devuelve un número decimal entre **0** (incluido) y **1** (sin incluir), por ejemplo `0.7351...`. Para un **entero entre dos valores** se usa esta fórmula, que vale la pena guardar:

```js playground=aleatorio
function aleatorioEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

console.log(aleatorioEntre(1, 6))   // un dado: del 1 al 6
console.log(aleatorioEntre(1, 100))

// Elegir un elemento al azar de una lista
const participantes = ['Ana', 'Luis', 'Marta', 'Pedro']
const ganador = participantes[aleatorioEntre(0, participantes.length - 1)]
console.log(`🎉 Ganó ${ganador}`)
```

Paso a paso para un dado (`min = 1`, `max = 6`):

1. `Math.random() * 6` da un decimal entre 0 y 5.999...
2. `Math.floor(...)` lo convierte en un entero del 0 al 5.
3. `+ 1` lo mueve al rango del 1 al 6.

Ejecuta el playground varias veces: cada vez sale un resultado distinto.

## La rareza de los decimales: 0.1 + 0.2

```js playground=decimales-raros
console.log(0.1 + 0.2)          // 0.30000000000000004 😱
console.log(0.1 + 0.2 === 0.3)  // false
```

No es un error de JavaScript: los ordenadores guardan los decimales en binario y algunos no tienen una representación exacta (igual que 1/3 en decimal es 0.3333... para siempre). Le pasa a casi todos los lenguajes.

¿Cómo evitarlo con dinero? Trabaja en **céntimos** (enteros) y divide solo al mostrar:

```js playground=centimos
const precios = [1990, 2550, 990] // en céntimos: 19.90, 25.50 y 9.90
const totalCentimos = precios.reduce((suma, precio) => suma + precio, 0)

console.log(totalCentimos / 100) // 55.3, exacto
```

## Convertir textos en números

Lo que escribe el usuario en un input llega como texto. Tienes varias formas de convertirlo:

```js playground=convertir
console.log(Number('42'))         // 42
console.log(Number('42.5'))       // 42.5
console.log(Number('42px'))       // NaN: no es un número limpio
console.log(parseInt('42px'))     // 42: lee hasta donde puede
console.log(parseFloat('3.5kg'))  // 3.5

console.log(Number.isNaN(Number('hola'))) // true: comprueba si falló
console.log(Number.isInteger(5.0))        // true
console.log(Number.isInteger(5.5))        // false
```

Usa `Number()` para los inputs: si el usuario escribió algo raro, obtendrás `NaN` y podrás avisarle. `parseInt` y `parseFloat` sirven para textos como `'42px'` que vienen del CSS.

## Formatear números y dinero con Intl

Para mostrar números como los espera la gente de cada país, usa **`Intl.NumberFormat`**:

```js playground=intl
const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
console.log(soles.format(1250))     // S/ 1,250.00
console.log(soles.format(19.9))     // S/ 19.90

const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
console.log(euros.format(1250))     // 1250,00 €

const miles = new Intl.NumberFormat('es-PE')
console.log(miles.format(1234567.891)) // 1,234,567.891

const porcentaje = new Intl.NumberFormat('es-PE', { style: 'percent' })
console.log(porcentaje.format(0.25))   // 25%
```

Se encarga del símbolo de la moneda, los separadores de miles y los decimales según el país. Mucho mejor que pegar `'S/ ' + precio.toFixed(2)` a mano.

## Errores comunes

- **Sumar textos.** `'10' + 5` da `'105'`. Convierte antes con `Number()`.
- **Seguir calculando con `toFixed`.** Devuelve un texto.
- **`Math.max(array)` sin `...`.** Da `NaN`.
- **Comparar decimales con `===`.** `0.1 + 0.2 === 0.3` es `false`. Con dinero, trabaja en céntimos.
- **Olvidar el `+ 1` en el aleatorio.** Sin él, nunca sale el valor máximo.

## Para profundizar

- [El objeto `Math` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Math)
- [`Intl.NumberFormat` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)

En resumen: **`round`/`floor`/`ceil`** para redondear, **`toFixed`** solo para mostrar, **`Math.max(...lista)`** para el mayor, la fórmula de **`Math.floor(Math.random() * (max - min + 1)) + min`** para aleatorios, **céntimos** para el dinero e **`Intl.NumberFormat`** para mostrar precios.
