---
title: 'Bucles en JavaScript: for, while y do...while sin perderte'
description: 'Repetir código sin copiarlo diez veces. Cómo funcionan for, while, do...while y for...of, cuándo usar cada uno y cómo no crear un bucle infinito.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos]
draft: true
---

Imagina que quieres mostrar los números del 1 al 10. Podrías escribir diez `console.log`... ¿y si fueran mil? Para eso existen los **bucles**: repiten un bloque de código las veces que necesites.

## `for`: cuando sabes cuántas veces repetir

```js playground=for
for (let i = 1; i <= 10; i++) {
  console.log(i)
}
```

La línea del `for` tiene tres partes separadas por `;`:

1. **`let i = 1`**: el punto de partida. Se ejecuta una sola vez, al principio.
2. **`i <= 10`**: la condición. Mientras sea `true`, el bucle sigue.
3. **`i++`**: lo que pasa al final de cada vuelta. `i++` significa "suma 1 a `i`".

Piensa en dar vueltas a una pista: empiezas en la vuelta 1, sigues mientras no llegues a la 10 y cada vez que pasas la meta sumas una vuelta.

## Ejemplo real: la tabla de multiplicar

```js playground=tabla
const numero = 7

for (let i = 1; i <= 12; i++) {
  console.log(`${numero} x ${i} = ${numero * i}`)
}
```

## Contar y acumular

Muchas veces el bucle sirve para **ir sumando** algo. Por ejemplo, el total de un carrito:

```js playground=acumular
const precios = [25, 40, 15, 60]
let total = 0

for (let i = 0; i < precios.length; i++) {
  total = total + precios[i]
}

console.log(`Total: ${total} soles`)
```

Fíjate en dos detalles:

- Los arrays empiezan en la posición **0**, por eso `let i = 0`.
- La condición es `i < precios.length` (menor, no menor o igual), porque la última posición es `length - 1`.

## `for...of`: recorrer una lista, más fácil

Cuando solo quieres pasar por cada elemento de un array, `for...of` es más claro: no necesitas el índice.

```js playground=forof
const alumnos = ['Ana', 'Luis', 'Marta']

for (const alumno of alumnos) {
  console.log(`Hola, ${alumno}`)
}
```

Se lee casi como una frase: "para cada alumno de alumnos". En el día a día lo usarás más que el `for` clásico.

## `while`: cuando no sabes cuántas vueltas habrá

`while` repite **mientras** se cumpla una condición. Es útil cuando no sabes de antemano cuántas vueltas darás:

```js playground=while
let ahorro = 0
let meses = 0

while (ahorro < 1000) {
  ahorro = ahorro + 150
  meses++
}

console.log(`Llegas a 1000 soles en ${meses} meses (tendrás ${ahorro})`)
```

No sabíamos cuántos meses hacían falta: el bucle siguió hasta que la condición dejó de cumplirse.

## `do...while`: al menos una vez

Es igual que `while`, pero comprueba la condición **al final**. Por eso el bloque se ejecuta **siempre al menos una vez**:

```js playground=dowhile
let intentos = 0

do {
  intentos++
  console.log(`Intento número ${intentos}`)
} while (intentos < 3)

// Con while, si la condición empieza siendo falsa, no se ejecuta nunca
let contador = 10
while (contador < 3) {
  console.log('Esto no se muestra')
}

// Con do...while sí se ejecuta una vez
do {
  console.log('Esto se muestra una vez aunque la condición sea falsa')
} while (contador < 3)
```

Se usa poco, pero viene bien para cosas como "pide un dato y repite mientras sea inválido".

## `break` y `continue`

- **`break`** sale del bucle inmediatamente.
- **`continue`** salta a la siguiente vuelta.

```js playground=break
const numeros = [3, 8, -1, 5, 12]

for (const numero of numeros) {
  if (numero < 0) {
    console.log('Número negativo encontrado, paro aquí')
    break
  }
  console.log(numero)
}

console.log('--- Solo los pares ---')
for (const numero of numeros) {
  if (numero % 2 !== 0) continue // si es impar, a la siguiente vuelta
  console.log(numero)
}
```

## ¿Cuál uso?

| Situación | Bucle |
| --- | --- |
| Recorrer un array | `for...of` |
| Repetir un número exacto de veces o necesitar el índice | `for` |
| Repetir hasta que algo cambie (no sabes cuántas veces) | `while` |
| Igual que `while`, pero al menos una vez | `do...while` |

Y cuando ya domines los bucles, descubrirás que para transformar o filtrar arrays muchas veces es más claro usar `map` y `filter` (tienen su propio post).

## Errores comunes

- **El bucle infinito.** Si la condición nunca se vuelve falsa, el bucle no termina y la pestaña se congela. Pasa cuando olvidas el `i++` o el `meses++`. Si te ocurre en el playground, recarga la página.
- **Empezar en 1 al recorrer un array.** Te saltas el primer elemento. Los arrays empiezan en 0.
- **Usar `<=` con `length`.** `i <= lista.length` da una vuelta de más y lees `undefined`.

## Para profundizar

- [Bucles e iteración en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Loops_and_iteration)

En resumen: **`for`** para un número de vueltas conocido, **`for...of`** para recorrer listas, **`while`** para repetir hasta que algo cambie y **`do...while`** si debe ejecutarse al menos una vez. Y asegúrate siempre de que la condición **llegue a ser falsa**.
