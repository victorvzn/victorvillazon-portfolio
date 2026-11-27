---
title: 'Fechas en JavaScript sin sufrir: Date e Intl.DateTimeFormat'
description: 'Crear fechas, leer el día y la hora, sumar días, calcular cuánto falta para algo y mostrar fechas bonitas en español con Intl.DateTimeFormat.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fechas, Fundamentos]
draft: true
---

"Publicado hace 3 días". "Tu pedido llega el viernes 28 de noviembre". "Quedan 5 días para el fin de la oferta". Las fechas están en todas partes, y en JavaScript tienen fama de dar dolores de cabeza. Con unas pocas reglas claras, no tiene por qué ser así.

## Crear una fecha

Todo empieza con `new Date()`:

```js playground=crear
// La fecha y hora de ahora mismo
const ahora = new Date()
console.log(ahora)

// Una fecha concreta a partir de un texto en formato ISO (año-mes-día)
const lanzamiento = new Date('2026-12-15T10:30:00')
console.log(lanzamiento)

// Con números: año, mes, día, hora, minutos
const navidad = new Date(2026, 11, 25) // ⚠️ 11 es DICIEMBRE
console.log(navidad)
```

¿Diciembre es 11? Sí. **En `Date`, los meses empiezan en 0**: enero es `0` y diciembre es `11`. Los días del mes, en cambio, empiezan en 1. Es el error número uno con fechas. Por eso es más seguro crear fechas a partir de un texto **ISO** (`'2026-12-25'`), donde el mes se escribe normal.

> Un detalle: `new Date('2026-12-25')` (solo la fecha) se interpreta en hora **UTC**, y `new Date('2026-12-25T00:00:00')` (con la hora) en tu **hora local**. Si trabajas con días concretos, incluye la hora para evitar que en algunos países salga "el día anterior".

## Leer las partes de una fecha

```js playground=leer
const fecha = new Date('2026-11-28T18:45:00')

console.log(fecha.getFullYear()) // 2026
console.log(fecha.getMonth())    // 10 → noviembre (empieza en 0)
console.log(fecha.getDate())     // 28 → el día del mes
console.log(fecha.getDay())      // 6 → el día de la semana (0 = domingo, 6 = sábado)
console.log(fecha.getHours())    // 18
console.log(fecha.getMinutes())  // 45
```

Ojo con dos nombres que confunden: **`getDate()`** es el día del **mes** (1-31) y **`getDay()`** es el día de la **semana** (0-6, empezando en domingo).

## Por dentro, una fecha es un número

Internamente, cada fecha es la cantidad de **milisegundos** que han pasado desde el 1 de enero de 1970 (lo que se llama un **timestamp**):

```js playground=timestamp
const fecha = new Date('2026-11-28T00:00:00')
console.log(fecha.getTime()) // un número enorme de milisegundos

console.log(Date.now()) // el timestamp de ahora, sin crear un Date
```

Esto es muy útil, porque **restar dos fechas te da los milisegundos que hay entre ellas**. Con eso puedes calcular casi todo.

## Calcular cuánto falta (o cuánto pasó)

```js playground=diferencia
const MS_POR_DIA = 1000 * 60 * 60 * 24

const hoy = new Date('2026-11-26T12:00:00')
const finOferta = new Date('2026-12-01T12:00:00')

const diferencia = finOferta - hoy // milisegundos
const dias = Math.round(diferencia / MS_POR_DIA)

console.log(`Quedan ${dias} días para el fin de la oferta`)
```

`1000 * 60 * 60 * 24` son los milisegundos de un día (1000 ms × 60 s × 60 min × 24 h). Guárdalo en una constante con nombre: se entiende mucho mejor que un `86400000` suelto.

## Sumar días a una fecha

```js playground=sumar
function sumarDias(fecha, dias) {
  const copia = new Date(fecha) // copia para no modificar la original
  copia.setDate(copia.getDate() + dias)
  return copia
}

const pedido = new Date('2026-11-28T10:00:00')
const entrega = sumarDias(pedido, 5)

console.log(pedido.toDateString())  // la original no cambia
console.log(entrega.toDateString()) // 3 de diciembre
```

`setDate` es listo: si te pasas del final del mes, **salta al mes siguiente** solo. 28 de noviembre + 5 días = 3 de diciembre, sin que hagas nada.

Fíjate en la **copia**: los métodos `set...` **modifican** la fecha original. Si no copias, cambiarías también la fecha del pedido.

## Mostrar fechas bonitas: `Intl.DateTimeFormat`

Para mostrar una fecha al usuario, olvídate de montar textos a mano con `getDate()` y un array de meses. JavaScript trae **`Intl`**, que formatea fechas en **cualquier idioma**:

```js playground=formato
const fecha = new Date('2026-11-28T18:45:00')

console.log(fecha.toLocaleDateString('es-PE'))
// 28/11/2026

console.log(fecha.toLocaleDateString('es-PE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}))
// sábado, 28 de noviembre de 2026

console.log(fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }))
// 06:45 p. m.

console.log(fecha.toLocaleDateString('en-US', { dateStyle: 'medium' }))
// Nov 28, 2026
```

- El primer argumento es el **idioma y país** (`'es-PE'`, `'es-MX'`, `'es-ES'`, `'en-US'`...). Cambia el orden del día y el mes, los nombres y el formato de la hora.
- El segundo son las **opciones**: qué partes mostrar y cómo.

Si vas a formatear muchas fechas igual, crea el formateador **una vez** y reutilízalo:

```js playground=formateador
const formatoCorto = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short'
})

const fechas = ['2026-11-28T00:00:00', '2026-12-03T00:00:00', '2026-12-24T00:00:00']

fechas.forEach((texto) => {
  console.log(formatoCorto.format(new Date(texto)))
})
// 28 nov · 3 dic · 24 dic (algunos navegadores añaden un punto: "nov.")
```

## "Hace 3 días": `Intl.RelativeTimeFormat`

Para el clásico "hace X tiempo" también hay una herramienta incluida:

```js playground=relativo
const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

console.log(relativo.format(-1, 'day'))   // ayer
console.log(relativo.format(-3, 'day'))   // hace 3 días
console.log(relativo.format(2, 'week'))   // dentro de 2 semanas
console.log(relativo.format(-5, 'minute')) // hace 5 minutos
```

Combínalo con la resta de fechas:

```js playground=hace
const MS_POR_DIA = 1000 * 60 * 60 * 24
const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

function haceCuanto(fecha, ahora = new Date()) {
  const dias = Math.round((fecha - ahora) / MS_POR_DIA)
  return relativo.format(dias, 'day')
}

const ahora = new Date('2026-11-26T12:00:00')
console.log(haceCuanto(new Date('2026-11-23T12:00:00'), ahora)) // hace 3 días
console.log(haceCuanto(new Date('2026-11-25T12:00:00'), ahora)) // ayer
```

## Guardar y enviar fechas: formato ISO

Cuando guardes una fecha en `localStorage` o la envíes a una API, conviértela a texto **ISO**. Es el formato estándar, y cualquier lenguaje lo entiende:

```js playground=iso
const fecha = new Date('2026-11-28T18:45:00')

const texto = fecha.toISOString()
console.log(texto) // '2026-11-28T...Z' (en hora UTC)

const deVuelta = new Date(texto)
console.log(deVuelta.getTime() === fecha.getTime()) // true
```

La `Z` del final significa **UTC**, la hora "universal", sin zona horaria. Las APIs suelen guardar en UTC y cada usuario lo ve convertido a su hora local.

## Tu turno

```js playground=ejercicio
const hoy = new Date('2026-11-26T12:00:00')

// 1. ¿Cuántos días faltan para Navidad (25 de diciembre de 2026)?

// 2. Muestra la fecha de hoy como "jueves, 26 de noviembre"

// 3. Escribe una función esFinDeSemana(fecha) que devuelva true si es sábado o domingo

// 4. Si un pedido hecho hoy tarda 7 días, ¿qué día llega? Muéstralo en formato largo
```

## Errores comunes

- **Olvidar que los meses empiezan en 0.** `new Date(2026, 12, 25)` no es Navidad: es el 25 de enero de 2027. Usa textos ISO.
- **Confundir `getDate()` (día del mes) con `getDay()` (día de la semana).**
- **Modificar la fecha original con `setDate`** cuando querías una nueva. Copia primero con `new Date(fecha)`.
- **Montar textos de fecha a mano** con arrays de meses. Usa `toLocaleDateString` o `Intl.DateTimeFormat`.
- **Comparar fechas con `===`.** Son objetos, y se comparan por referencia. Compara `fecha1.getTime() === fecha2.getTime()`.

## Para profundizar

- [`Date` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [`Intl.DateTimeFormat` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [`Intl.RelativeTimeFormat` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat)

En resumen: crea fechas con **`new Date('AAAA-MM-DDTHH:mm:ss')`**, recuerda que los **meses empiezan en 0** en los getters, **resta fechas** para calcular diferencias en milisegundos, **copia antes de modificar** y muestra siempre las fechas con **`Intl.DateTimeFormat`** o **`toLocaleDateString`**. Para guardarlas, **`toISOString()`**.
