---
title: 'TDD: escribe el test primero (rojo, verde, refactor)'
description: 'Qué es el desarrollo guiado por pruebas, el ciclo rojo-verde-refactor paso a paso con un ejemplo real (validar una contraseña), las tres leyes del TDD y cuándo conviene y cuándo no.'
date: 2026-11-27
series: testing
tags: [TDD, Testing, Vitest]
draft: true
---

Hasta ahora has escrito los tests **después** del código: primero la función, luego compruebas que funciona. **TDD** (*Test-Driven Development*, desarrollo guiado por pruebas) le da la vuelta: **primero escribes un test que falla, y luego el código mínimo para que pase**.

Suena raro. ¿Cómo vas a probar algo que no existe? Justamente esa es la gracia: el test te obliga a pensar **qué tiene que hacer** el código antes de pensar **cómo**.

## El ciclo: rojo, verde, refactor

TDD es repetir este ciclo, en pasos muy pequeños:

1. 🔴 **Rojo.** Escribe **un** test pequeño para el siguiente comportamiento. Ejecútalo y **comprueba que falla**.
2. 🟢 **Verde.** Escribe el código **mínimo** para que ese test pase. Aunque sea feo. Aunque sea "trampa".
3. 🔵 **Refactor.** Con todos los tests en verde, **mejora el código** (nombres, duplicación, estructura) sin cambiar lo que hace. Los tests te avisan si rompes algo.

Y vuelta a empezar con el siguiente comportamiento.

¿Por qué comprobar que el test falla primero? Porque un test que nunca has visto fallar **puede no estar comprobando nada** (por ejemplo, si te olvidaste el `expect`).

## Ejemplo: validar una contraseña

Requisitos de un formulario de registro. Una contraseña es válida si:

- Tiene al menos 8 caracteres.
- Tiene al menos un número.
- Tiene al menos una mayúscula.

La función devolverá una lista de errores (vacía si es válida), para poder mostrárselos al usuario.

Prepara un proyecto con Vitest (lo viste en Vitest desde cero), deja `npm test` abierto en modo watch y empezamos.

### Ciclo 1 🔴 una contraseña corta da error

```js
// src/password.test.js
import { describe, it, expect } from 'vitest'
import { validarPassword } from './password.js'

describe('validarPassword', () => {
  it('pide al menos 8 caracteres', () => {
    expect(validarPassword('abc')).toContain('Debe tener al menos 8 caracteres')
  })
})
```

El test falla: `validarPassword` ni siquiera existe. **Eso también es rojo.**

### Ciclo 1 🟢 el mínimo para pasar

```js
// src/password.js
export function validarPassword(password) {
  return ['Debe tener al menos 8 caracteres']
}
```

¿Hacer trampa? Sí, a propósito. El test pasa, y eso significa que **todavía no hay un test que exija algo mejor**. El siguiente test nos obligará a escribir la lógica real.

### Ciclo 2 🔴 una contraseña válida no da errores

```js
it('acepta una contraseña que cumple todo', () => {
  expect(validarPassword('Segura123')).toEqual([])
})
```

Falla: siempre devolvemos el error. Ahora sí hay que escribir lógica.

### Ciclo 2 🟢

```js
export function validarPassword(password) {
  if (password.length < 8) return ['Debe tener al menos 8 caracteres']
  return []
}
```

Los dos en verde.

### Ciclo 3 🔴 pide un número

```js
it('pide al menos un número', () => {
  expect(validarPassword('SinNumeros')).toContain('Debe incluir un número')
})
```

### Ciclo 3 🟢

```js
export function validarPassword(password) {
  if (password.length < 8) return ['Debe tener al menos 8 caracteres']
  if (!/\d/.test(password)) return ['Debe incluir un número']
  return []
}
```

### Ciclo 4 🔴 varios errores a la vez

Aquí aparece un requisito que no habíamos pensado: si la contraseña es `'abc'`, ¿le decimos solo el primer error o todos? Mejor todos, para que el usuario no tenga que adivinar. **El test nos hizo descubrir una decisión de diseño.**

```js
it('devuelve todos los errores a la vez', () => {
  expect(validarPassword('abc')).toEqual([
    'Debe tener al menos 8 caracteres',
    'Debe incluir un número',
    'Debe incluir una mayúscula'
  ])
})
```

### Ciclo 4 🟢

```js
export function validarPassword(password) {
  const errores = []
  if (password.length < 8) errores.push('Debe tener al menos 8 caracteres')
  if (!/\d/.test(password)) errores.push('Debe incluir un número')
  if (!/[A-Z]/.test(password)) errores.push('Debe incluir una mayúscula')
  return errores
}
```

Los cuatro tests en verde. (Fíjate en que el test de "pide un número" sigue pasando: `toContain` solo exige que **esté** ese error.)

### Ciclo 4 🔵 refactor

El código funciona, pero cada regla se escribe igual. Si añadimos más reglas, el `if` se repetirá. Refactorizamos a una **lista de reglas**:

```js
const REGLAS = [
  { cumple: (p) => p.length >= 8, mensaje: 'Debe tener al menos 8 caracteres' },
  { cumple: (p) => /\d/.test(p), mensaje: 'Debe incluir un número' },
  { cumple: (p) => /[A-Z]/.test(p), mensaje: 'Debe incluir una mayúscula' }
]

export function validarPassword(password) {
  return REGLAS.filter((regla) => !regla.cumple(password)).map((regla) => regla.mensaje)
}
```

Guardas y... **todo sigue en verde**. Has cambiado por completo la implementación y tienes la certeza de que se comporta igual. Esa es la red de seguridad del TDD.

Añadir una regla nueva ahora es una línea. Pruébalo tú en el ejercicio del final, **empezando por el test**.

## Las tres leyes del TDD

Robert C. Martin las resumió así:

1. No escribas código de producción salvo para hacer pasar un test que falla.
2. No escribas más test del necesario para que falle (no compilar también es fallar).
3. No escribas más código de producción del necesario para pasar el test actual.

En la práctica: **pasos pequeños**. Si llevas 10 minutos en rojo, el paso era demasiado grande. Vuelve atrás (bórralo) y da uno más pequeño.

## ¿Qué ganas con TDD?

- **Diseño desde fuera.** Escribes primero *cómo se usa* la función (su nombre, sus parámetros, lo que devuelve), y eso suele dar APIs más claras.
- **Cobertura de serie.** Todo el código existe porque un test lo pidió.
- **Menos depuración.** Como avanzas en pasos de un minuto, cuando algo falla sabes exactamente qué lo rompió: lo último que escribiste.
- **Descubrir requisitos.** Como en el ciclo 4: al pensar el test aparecen preguntas ("¿todos los errores o solo uno?") que, de otra forma, verías en producción.
- **Refactorizar sin miedo**, siempre.

## ¿Cuándo no conviene?

TDD no es una religión. Encaja de maravilla con:

- ✅ Lógica de negocio: cálculos, validaciones, reglas, transformaciones de datos.
- ✅ Arreglar bugs: primero un test que reproduce el bug (rojo), luego el arreglo (verde).
- ✅ Pruebas técnicas de algoritmos: FizzBuzz, palíndromos, anagramas...

Y encaja peor con:

- ❌ Explorar: cuando no sabes aún qué quieres construir o estás probando una librería nueva. Haz un prototipo, tíralo y luego aplica TDD.
- ❌ Diseño visual: colores, espaciados, animaciones. Eso se comprueba mirando.

## Tu turno

Siguiendo el ciclo **sin saltarte el rojo**:

1. Añade una regla: "Debe incluir un símbolo" (`!@#$%...`). Primero el test.
2. Añade una regla: "No puede contener la palabra 'password'" (sin importar mayúsculas).
3. Con TDD desde cero, escribe `calcularFuerza(password)` que devuelva `'débil'`, `'media'` o `'fuerte'` según cuántas reglas cumpla. Empieza por el caso más sencillo.

## Errores comunes

- **Escribir varios tests de golpe** antes de que pase el primero. Uno cada vez.
- **Saltarse el rojo.** Si el test pasa a la primera, sospecha: quizá no comprueba lo que crees.
- **Saltarse el refactor.** Sin él, TDD produce código que funciona pero está desordenado.
- **Pasos demasiado grandes.** Si estás mucho rato en rojo, vuelve atrás y divide.
- **Probar la implementación** ("llama a `filter`") en vez del comportamiento ("devuelve los errores"). El refactor del ciclo 4 habría roto ese test.

## Para profundizar

- [Test-Driven Development, de Martin Fowler (en inglés)](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [The Cycles of TDD, de Robert C. Martin (en inglés)](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html)

En resumen: **TDD** es escribir **el test primero** y repetir el ciclo **🔴 rojo** (un test que falla), **🟢 verde** (el código mínimo para que pase) y **🔵 refactor** (mejorar sin cambiar lo que hace). En **pasos pequeños**, te obliga a pensar qué debe hacer tu código antes de cómo, te descubre requisitos y te deja refactorizar sin miedo.
