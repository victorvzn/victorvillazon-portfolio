---
title: '¿Por qué escribir tests? Tu primera prueba sin librerías'
description: 'Qué es un test automático, por qué los equipos no trabajan sin ellos, los tipos de pruebas (unitarias, de integración y end-to-end) y cómo escribir tu primer test con JavaScript puro.'
date: 2026-11-27
series: testing
tags: [Testing, JavaScript, Fundamentos]
draft: true
---

Cambias una función para arreglar un bug... y sin darte cuenta rompes otra parte de la app que la usaba. Lo descubres una semana después, cuando un usuario se queja. ¿Te suena?

Comprobar a mano que todo sigue funcionando después de cada cambio es lento y aburrido, y por eso nadie lo hace bien. Un **test automático** es código que **comprueba tu código** por ti, en segundos, todas las veces que quieras.

## ¿Qué es un test?

Un test es una función que:

1. **Prepara** unos datos.
2. **Ejecuta** el código que quieres probar.
3. **Comprueba** que el resultado es el esperado.

A estos tres pasos se les llama **AAA**: *Arrange* (preparar), *Act* (actuar) y *Assert* (comprobar).

## Tu primer test, sin librerías

Vamos a probar esta función:

```js playground=primer-test
function aplicarDescuento(precio, porcentaje) {
  return precio - (precio * porcentaje) / 100
}
```

Un test no es más que comparar lo que **obtienes** con lo que **esperas**:

```js playground=primer-test
function test(descripcion, funcionDePrueba) {
  try {
    funcionDePrueba()
    console.log(`✅ ${descripcion}`)
  } catch (error) {
    console.log(`❌ ${descripcion}\n   ${error.message}`)
  }
}

function esperarQue(obtenido) {
  return {
    seaIgualA(esperado) {
      if (obtenido !== esperado) {
        throw new Error(`Se esperaba ${esperado}, pero se obtuvo ${obtenido}`)
      }
    }
  }
}

test('aplica un 10% de descuento', () => {
  // Arrange
  const precio = 200
  // Act
  const resultado = aplicarDescuento(precio, 10)
  // Assert
  esperarQue(resultado).seaIgualA(180)
})

test('con 0% devuelve el mismo precio', () => {
  esperarQue(aplicarDescuento(50, 0)).seaIgualA(50)
})

test('con 100% el precio es 0', () => {
  esperarQue(aplicarDescuento(80, 100)).seaIgualA(0)
})
```

Ábrelo en el playground y verás tres ✅. Ahora **rompe la función a propósito** (cambia el `-` por un `+`) y vuelve a ejecutar: los tests te dicen exactamente qué falló.

Acabas de construir, en 20 líneas, lo mismo que hace una librería de testing: una función `test` que agrupa comprobaciones y una función `esperarQue` que lanza un error si algo no coincide. Las librerías como **Vitest** o **Jest** hacen lo mismo, con muchas más comprobaciones, mejores mensajes y la capacidad de ejecutar cientos de tests en segundos.

## ¿Para qué sirven, de verdad?

- **Cambiar código sin miedo.** Si los tests siguen en verde, no has roto nada de lo que está probado. A esto se le llama **refactorizar con red de seguridad**.
- **Detectar errores antes que el usuario.** En un equipo, los tests se ejecutan automáticamente antes de aceptar cada cambio (en **CI**, *integración continua*).
- **Documentación que no miente.** Un test como `'con 100% el precio es 0'` explica cómo se comporta la función, y si alguien la cambia, el test lo avisa.
- **Diseñar mejor.** El código fácil de probar suele ser código bien separado: funciones pequeñas que reciben datos y devuelven resultados.
- **Conseguir trabajo.** En muchas pruebas técnicas te piden tests, y sumarlos aunque no te los pidan habla muy bien de ti.

## Los tipos de tests

| Tipo | Qué prueba | Ejemplo | Velocidad |
| --- | --- | --- | --- |
| **Unitario** | Una pieza pequeña, aislada | `aplicarDescuento(200, 10)` devuelve `180` | ⚡ Milisegundos |
| **De integración** | Varias piezas juntas | El formulario valida, llama a la API y muestra el mensaje | 🚀 Rápidos |
| **End-to-end (E2E)** | La app completa, en un navegador real | Un usuario se registra, inicia sesión y compra | 🐢 Segundos |

Se suele dibujar como una **pirámide**: muchos tests unitarios en la base (baratos y rápidos), bastantes de integración en medio y unos pocos E2E arriba, para los flujos más importantes.

Hoy muchos equipos prefieren la idea del **trofeo de testing**: poner el foco en los tests de **integración**, porque son los que más se parecen a cómo se usa la app de verdad, sin ser lentos.

## Las herramientas de esta serie

- **[Vitest](https://vitest.dev)**: el *test runner* (ejecuta los tests y te dice cuáles pasan). Es rápido, funciona con Vite y su API es casi idéntica a la de Jest, así que lo que aprendas te sirve para los dos.
- **[Testing Library](https://testing-library.com)**: para probar **interfaces** (HTML, React, Vue) como lo haría un usuario: buscando textos y botones, no clases CSS.
- **TDD**: no es una herramienta sino una **forma de trabajar**: escribir el test **antes** que el código.

Para E2E existen herramientas como **Playwright** o **Cypress**, que quedan fuera de esta serie.

## ¿Qué merece un test?

No todo necesita tests. Prioriza:

- **Lógica con reglas**: cálculos, validaciones, transformaciones de datos.
- **Lo que ya se rompió una vez.** Cuando arreglas un bug, escribe un test que lo reproduzca: así no vuelve.
- **Los flujos críticos**: el registro, el pago, el carrito.

Y no pierdas tiempo probando que React pinta un `<div>` o que una librería funciona; eso ya lo prueban sus autores.

## Tu turno

Con el `test` y `esperarQue` de arriba, en el playground:

1. Escribe una función `esPalindromo(texto)` y al menos cuatro tests: una palabra que sí lo es, una que no, una con mayúsculas (`'Ana'`) y una frase con espacios (`'Anita lava la tina'`).
2. Añade a `esperarQue` una comprobación `seaVerdadero()`.
3. Haz que un test falle a propósito y lee el mensaje.

## Errores comunes

- **Pensar "lo pruebo a mano y ya".** Funciona hoy; dentro de tres meses, con 50 funciones, no.
- **Tests que comprueban detalles internos** en vez del resultado. Si cambias *cómo* lo haces sin cambiar *qué* hace, el test no debería romperse.
- **Un test que nunca ha fallado.** Rómpelo a propósito una vez para comprobar que de verdad detecta el error.
- **Nombres como `test 1`.** El nombre debe explicar el comportamiento: `'con 100% el precio es 0'`.
- **Querer el 100% de cobertura desde el primer día.** Empieza por la lógica importante.

## Para profundizar

- [The Testing Trophy, de Kent C. Dodds (en inglés)](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Por qué Vitest (documentación oficial, en inglés)](https://vitest.dev/guide/why.html)

En resumen: un **test** es código que comprueba tu código siguiendo **preparar, actuar y comprobar**. Te permite **cambiar sin miedo**, detectar errores antes que el usuario y documentar cómo se comporta tu app. Hay tests **unitarios**, de **integración** y **E2E**; en esta serie aprenderás a escribirlos con **Vitest** y **Testing Library**, y a trabajar con **TDD**.
