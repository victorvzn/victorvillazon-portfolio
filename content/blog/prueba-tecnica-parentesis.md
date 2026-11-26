---
title: 'Prueba técnica: ¿están bien cerrados los paréntesis?'
description: 'Comprobar si (), [] y {} están balanceados es un clásico de entrevistas. Aprende a resolverlo con una pila, paso a paso y con solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica]
draft: true
---

Cuando tu editor marca en rojo un `}` que sobra, está resolviendo exactamente este ejercicio. Es una pregunta muy común en entrevistas porque tiene una solución elegante que usa una idea nueva: **la pila**.

Tiempo recomendado: **30 minutos**.

## El enunciado

> Escribe una función `estaBalanceado(texto)` que reciba un texto con los caracteres `()`, `[]` y `{}` y devuelva `true` si todos están bien abiertos y cerrados, y `false` si no.
>
> "Bien cerrado" significa que cada apertura tiene su cierre del mismo tipo y en el orden correcto.

- `([]{})` → `true`
- `([)]` → `false` (el `[` se cerró después del `)`)
- `((` → `false` (falta cerrar)

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function estaBalanceado(texto) {
  // tu código aquí
}

probar('simple', estaBalanceado('()'), true)
probar('mezclados', estaBalanceado('([]{})'), true)
probar('anidados', estaBalanceado('{[()]}'), true)
probar('vacío', estaBalanceado(''), true)
probar('orden cruzado', estaBalanceado('([)]'), false)
probar('falta cerrar', estaBalanceado('(('), false)
probar('cierra sin abrir', estaBalanceado('())'), false)
probar('con código', estaBalanceado('if (a[0]) { b() }'), true)
```

Ojo con la trampa: **contar** aperturas y cierres no basta. `([)]` tiene dos de cada y aun así está mal.

<!-- solucion: Ver una pista -->

Piensa en una **pila de platos**: solo puedes poner un plato encima o quitar el de arriba. Cada vez que veas una apertura, ponla en la pila. Cuando veas un cierre, ¿con qué plato tiene que coincidir?

En JavaScript, un array sirve de pila: `push()` pone arriba y `pop()` quita el de arriba.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
const PAREJAS = { ')': '(', ']': '[', '}': '{' }
const APERTURAS = '([{'

function estaBalanceado(texto) {
  const pila = []

  for (const caracter of texto) {
    if (APERTURAS.includes(caracter)) {
      pila.push(caracter)
    } else if (PAREJAS[caracter]) {
      // Es un cierre: el último abierto tiene que ser su pareja
      if (pila.pop() !== PAREJAS[caracter]) return false
    }
    // Cualquier otro carácter (letras, espacios) se ignora
  }

  // Si quedó algo en la pila, alguien no se cerró
  return pila.length === 0
}

probar('simple', estaBalanceado('()'), true)
probar('mezclados', estaBalanceado('([]{})'), true)
probar('anidados', estaBalanceado('{[()]}'), true)
probar('vacío', estaBalanceado(''), true)
probar('orden cruzado', estaBalanceado('([)]'), false)
probar('falta cerrar', estaBalanceado('(('), false)
probar('cierra sin abrir', estaBalanceado('())'), false)
probar('con código', estaBalanceado('if (a[0]) { b() }'), true)
```

Sigamos `([)]` paso a paso:

| Carácter | Acción | Pila |
| --- | --- | --- |
| `(` | apertura: push | `(` |
| `[` | apertura: push | `( [` |
| `)` | cierre: pop da `[`, pero necesitaba `(` | ❌ `false` |

Detalles que importan:

- **`PAREJAS`** relaciona cada cierre con su apertura. Así no escribes tres `if` casi iguales.
- **`pila.pop()` en una pila vacía devuelve `undefined`**, que nunca es igual a `(`. Por eso `'())'` da `false` sin escribir un caso especial.
- **El `return` final** cubre el caso `((`: no hubo errores, pero sobran aperturas.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que veas por qué contar no basta** y busques otra idea.
- **Que conozcas la pila** (o que llegues a ella con la pista). Es una estructura que aparece en el historial del navegador, el "deshacer" de los editores y la propia ejecución de JavaScript.
- **Los casos límite**: texto vacío, cierre sin apertura, aperturas sin cierre.
- **Que el código sea fácil de ampliar**: con el objeto `PAREJAS`, añadir `<>` es una línea.

## Pregunta de seguimiento

¿Cómo cambiarías la función para que, en vez de `true`/`false`, devuelva la **posición** del primer carácter problemático (o `-1` si todo está bien)?

<!-- solucion: Ver la respuesta -->

Guarda en la pila la **posición** de cada apertura, además del carácter:

```js playground=seguimiento
const PAREJAS = { ')': '(', ']': '[', '}': '{' }

function primerError(texto) {
  const pila = []

  for (let i = 0; i < texto.length; i++) {
    const caracter = texto[i]

    if ('([{'.includes(caracter)) {
      pila.push({ caracter, posicion: i })
    } else if (PAREJAS[caracter]) {
      const ultimo = pila.pop()
      if (!ultimo || ultimo.caracter !== PAREJAS[caracter]) return i
    }
  }

  // Si sobran aperturas, el error es la primera que quedó sin cerrar
  return pila.length ? pila[0].posicion : -1
}

probar('todo bien', primerError('{[()]}'), -1)
probar('cierre equivocado', primerError('([)]'), 2)
probar('apertura sin cerrar', primerError('a(b'), 1)
```

Es la misma idea, pero en vez de guardar solo el carácter, guardas un objeto con más información.

<!-- /solucion -->
