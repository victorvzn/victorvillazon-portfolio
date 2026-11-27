---
title: 'Temporal: la nueva forma de trabajar con fechas en JavaScript'
description: 'La API que viene a reemplazar a Date: fechas sin hora, horas sin fecha, zonas horarias, sumar meses y calcular duraciones sin trucos y sin mutar nada.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ESNext, Fechas]
draft: true
---

En el post de fechas vimos `Date` y sus trampas: los meses que empiezan en 0, los métodos `set...` que modifican la fecha original, las zonas horarias que hacen que "el 25 de diciembre" salga como el 24... `Date` se diseñó en 1995 copiando una API de Java que el propio Java abandonó poco después.

**Temporal** es la API moderna que lo arregla. Es un objeto global nuevo, como `Math` o `Intl`, con tipos distintos para cada necesidad.

> **Compatibilidad:** Temporal ya está disponible en las versiones recientes de Firefox y Chrome, pero no en todos los navegadores. Antes de usarlo en producción, revisa [Can I use](https://caniuse.com/temporal) o usa el *polyfill* oficial (`@js-temporal/polyfill`), una librería que lo añade donde falta. Si tu navegador no lo soporta, los ejemplos darán `Temporal is not defined`.

## Las tres ideas clave

1. **Un tipo para cada cosa.** Una fecha de cumpleaños no tiene hora. La hora de apertura de una tienda no tiene fecha. Una reunión tiene fecha, hora **y** zona horaria. Temporal tiene un tipo para cada caso.
2. **Inmutable.** Ningún método modifica el objeto: todos **devuelven uno nuevo**. Adiós al bug de `setDate`.
3. **Los meses empiezan en 1.** Enero es 1 y diciembre es 12. Como en la vida real.

## Los tipos que vas a usar

| Tipo | Representa | Ejemplo |
| --- | --- | --- |
| `Temporal.PlainDate` | Una fecha, sin hora | Un cumpleaños, un feriado |
| `Temporal.PlainTime` | Una hora, sin fecha | "La tienda abre a las 9:00" |
| `Temporal.PlainDateTime` | Fecha y hora, sin zona horaria | Un evento en "hora local" |
| `Temporal.ZonedDateTime` | Fecha, hora **y** zona horaria | Una reunión internacional |
| `Temporal.Instant` | Un instante exacto en el tiempo | Cuándo se creó un registro |
| `Temporal.Duration` | Una duración | "2 horas y 30 minutos" |

"Plain" significa "sin zona horaria": es la fecha tal como la escribirías en un calendario de papel.

## Hoy y fechas concretas

```js playground=crear
// Hoy, en la zona horaria del usuario
const hoy = Temporal.Now.plainDateISO()
console.log(hoy.toString()) // por ejemplo '2026-11-26'

// Una fecha concreta: diciembre es 12 🎉
const navidad = Temporal.PlainDate.from('2026-12-25')
console.log(navidad.year, navidad.month, navidad.day) // 2026 12 25

// También con un objeto
const lanzamiento = Temporal.PlainDate.from({ year: 2027, month: 3, day: 15 })
console.log(lanzamiento.toString()) // '2027-03-15'

console.log(navidad.dayOfWeek) // 5 → viernes (1 = lunes, 7 = domingo)
```

Fíjate también en `dayOfWeek`: va del 1 (lunes) al 7 (domingo), no del 0 (domingo) al 6 como `getDay()`.

## Sumar y restar sin sorpresas

```js playground=sumar
const pedido = Temporal.PlainDate.from('2026-11-28')

const entrega = pedido.add({ days: 5 })
console.log(entrega.toString()) // '2026-12-03'
console.log(pedido.toString())  // '2026-11-28' ✅ el original no cambia

const renovacion = pedido.add({ months: 1 })
console.log(renovacion.toString()) // '2026-12-28'

const haceUnAnio = pedido.subtract({ years: 1 })
console.log(haceUnAnio.toString()) // '2025-11-28'
```

Y los casos raros se manejan con sentido común:

```js playground=fin-de-mes
const finDeEnero = Temporal.PlainDate.from('2027-01-31')

// ¿31 de enero + 1 mes? Febrero no tiene 31 días
console.log(finDeEnero.add({ months: 1 }).toString()) // '2027-02-28'
```

Con `Date`, sumar un mes al 31 de enero te lleva al **3 de marzo**. Temporal se queda en el último día de febrero.

## Cambiar una parte: `with`

Para cambiar solo el día, el mes o el año, `with` devuelve una fecha nueva:

```js playground=with
const fecha = Temporal.PlainDate.from('2026-11-26')

const primeroDeMes = fecha.with({ day: 1 })
console.log(primeroDeMes.toString()) // '2026-11-01'

const ultimoDeMes = fecha.with({ day: fecha.daysInMonth })
console.log(ultimoDeMes.toString()) // '2026-11-30'
```

`daysInMonth` te dice cuántos días tiene ese mes. Hay más propiedades útiles, como `daysInYear` o `inLeapYear` (si el año es bisiesto).

## Diferencias entre fechas: `until` y `since`

```js playground=diferencia
const hoy = Temporal.PlainDate.from('2026-11-26')
const navidad = Temporal.PlainDate.from('2026-12-25')

const falta = hoy.until(navidad)
console.log(falta.days) // 29
console.log(`Faltan ${falta.days} días para Navidad`)

// En otras unidades
const nacimiento = Temporal.PlainDate.from('1998-05-10')
const edad = nacimiento.until(hoy, { largestUnit: 'years' })
console.log(`Tienes ${edad.years} años, ${edad.months} meses y ${edad.days} días`)
```

Sin multiplicar milisegundos ni preocuparte por los años bisiestos.

## Comparar fechas

```js playground=comparar
const a = Temporal.PlainDate.from('2026-11-26')
const b = Temporal.PlainDate.from('2026-12-25')

console.log(a.equals(b)) // false
console.log(Temporal.PlainDate.compare(a, b)) // -1 → a va antes que b

// compare funciona directamente con sort
const fechas = ['2026-12-25', '2026-01-01', '2026-07-28'].map((texto) => Temporal.PlainDate.from(texto))
const ordenadas = fechas.toSorted(Temporal.PlainDate.compare)
console.log(ordenadas.map(String)) // ['2026-01-01', '2026-07-28', '2026-12-25']
```

`compare` devuelve `-1`, `0` o `1`: justo lo que necesita una función de comparación de `sort`.

## Zonas horarias sin dolor

Una reunión a las 10:00 en Lima, ¿a qué hora es en Madrid?

```js playground=zonas
const reunion = Temporal.ZonedDateTime.from('2026-11-26T10:00[America/Lima]')

const enMadrid = reunion.withTimeZone('Europe/Madrid')
console.log(enMadrid.toPlainTime().toString()) // '16:00:00'

const enCiudadDeMexico = reunion.withTimeZone('America/Mexico_City')
console.log(enCiudadDeMexico.toPlainTime().toString()) // '09:00:00'
```

Las zonas horarias se escriben con su nombre oficial (`America/Lima`, `Europe/Madrid`...), y Temporal ya sabe si en esa fecha hay horario de verano.

## Duraciones

```js playground=duracion
const pelicula = Temporal.Duration.from({ hours: 2, minutes: 15 })
const inicio = Temporal.PlainTime.from('20:30')

const fin = inicio.add(pelicula)
console.log(`La película termina a las ${fin.toString({ smallestUnit: 'minute' })}`) // 22:45

console.log(pelicula.total('minutes')) // 135
```

## Mostrar fechas bonitas

Temporal no sustituye a `Intl`: se llevan bien. `toLocaleString` funciona igual que con `Date`:

```js playground=formato
const fecha = Temporal.PlainDate.from('2026-12-25')

console.log(fecha.toLocaleString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }))
// viernes, 25 de diciembre
```

## `Date` vs `Temporal`

| Con `Date` | Con `Temporal` |
| --- | --- |
| Meses del 0 al 11 | Meses del 1 al 12 |
| `setDate` modifica el original | `add` devuelve una fecha nueva |
| Un solo tipo para todo | Un tipo para cada necesidad |
| Restar milisegundos para calcular días | `until` y `since` |
| Zonas horarias muy limitadas | Soporte completo de zonas horarias |
| Funciona en todos los navegadores | Navegadores recientes o polyfill |

## Tu turno

```js playground=ejercicio
// 1. Crea la fecha de tu cumpleaños de este año con PlainDate

// 2. ¿Cuántos días faltan desde hoy? (Temporal.Now.plainDateISO())

// 3. ¿Qué día de la semana cae?

// 4. Una suscripción empieza el 31 de agosto de 2026 y se renueva cada mes.
//    Muestra las fechas de las 6 primeras renovaciones.
```

## Errores comunes

- **Usarlo en producción sin comprobar la compatibilidad.** Revisa Can I use o añade el polyfill.
- **Mezclar tipos.** No puedes sumar un `PlainDate` y un `PlainTime` con `add`. Para juntarlos, usa `fecha.toPlainDateTime(hora)`.
- **Usar `PlainDateTime` para eventos entre países.** Sin zona horaria, "las 10:00" no significa lo mismo en todas partes. Usa `ZonedDateTime`.
- **Esperar que `add` modifique la fecha.** Devuelve una nueva: guárdala en una variable.

## Para profundizar

- [Temporal en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Temporal)
- [La documentación de la propuesta (en inglés)](https://tc39.es/proposal-temporal/docs/)

En resumen: **Temporal** es la API moderna de fechas: **meses del 1 al 12**, **inmutable** (todo devuelve un objeto nuevo) y con **un tipo para cada necesidad** (`PlainDate`, `PlainTime`, `ZonedDateTime`, `Duration`...). Con `add`, `with`, `until` y `compare` dejas atrás los trucos de `Date`. Revisa la compatibilidad antes de usarlo en producción.
