---
title: 'Vitest desde cero: instala, escribe y ejecuta tus primeros tests'
description: 'Cómo instalar Vitest en cualquier proyecto, escribir tests con describe, it y expect, los matchers que más vas a usar (toBe, toEqual, toThrow...), el modo watch y test.each.'
date: 2026-11-27
series: testing
tags: [Vitest, Testing, Fundamentos]
draft: true
---

En el post anterior construiste tu propio mini *framework* de testing con `test` y `esperarQue`. Ahora vas a usar uno de verdad: **Vitest**. Es el *test runner* que más se usa hoy en proyectos con Vite, React o Vue, y su forma de escribir tests es casi idéntica a la de **Jest**, así que aprendes los dos a la vez.

## Paso 1: crear el proyecto e instalarlo

Necesitas Node.js. En una carpeta nueva, desde la terminal:

```bash
npm init -y
npm install --save-dev vitest
```

Abre `package.json`, añade `"type": "module"` y un script `test`:

```json
{
  "name": "mis-tests",
  "type": "module",
  "scripts": {
    "test": "vitest"
  },
  "devDependencies": {
    "vitest": "^4.0.0"
  }
}
```

> Si tu proyecto ya usa Vite (`npm create vite@latest`), solo necesitas instalar `vitest` y añadir el script: usará la misma configuración.

## Paso 2: el código que vas a probar

Crea `src/carrito.js`:

```js
export function calcularSubtotal(productos) {
  return productos.reduce((total, p) => total + p.precio * p.cantidad, 0)
}

export function aplicarCupon(total, cupon) {
  if (cupon === 'DESCUENTO10') return total * 0.9
  if (cupon === 'ENVIOGRATIS') return total
  throw new Error(`Cupón no válido: ${cupon}`)
}
```

## Paso 3: tu primer archivo de tests

Vitest busca archivos que terminen en **`.test.js`** o **`.spec.js`** (también `.ts`, `.jsx`...). Lo habitual es ponerlos junto al archivo que prueban. Crea `src/carrito.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { calcularSubtotal, aplicarCupon } from './carrito.js'

describe('calcularSubtotal', () => {
  it('suma precio por cantidad de cada producto', () => {
    const productos = [
      { nombre: 'Teclado', precio: 100, cantidad: 1 },
      { nombre: 'Mouse', precio: 25, cantidad: 2 }
    ]

    expect(calcularSubtotal(productos)).toBe(150)
  })

  it('devuelve 0 si el carrito está vacío', () => {
    expect(calcularSubtotal([])).toBe(0)
  })
})

describe('aplicarCupon', () => {
  it('DESCUENTO10 resta un 10%', () => {
    expect(aplicarCupon(200, 'DESCUENTO10')).toBe(180)
  })

  it('lanza un error con un cupón que no existe', () => {
    expect(() => aplicarCupon(200, 'GRATIS')).toThrow('Cupón no válido')
  })
})
```

Las tres piezas:

- **`describe`** agrupa tests relacionados (normalmente, los de una función o un componente).
- **`it`** (o **`test`**, que es lo mismo) define un test. Se lee como una frase: "*it* suma precio por cantidad".
- **`expect(valor)`** recibe lo que obtuviste y le encadenas un **matcher** con lo que esperas: `.toBe(150)`.

## Paso 4: ejecutarlos

```bash
npm test
```

Verás algo así:

```bash
 ✓ src/carrito.test.js (4 tests) 3ms
   ✓ calcularSubtotal > suma precio por cantidad de cada producto
   ✓ calcularSubtotal > devuelve 0 si el carrito está vacío
   ✓ aplicarCupon > DESCUENTO10 resta un 10%
   ✓ aplicarCupon > lanza un error con un cupón que no existe

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

Y Vitest **se queda esperando**: es el **modo watch**. Cada vez que guardas un archivo, vuelve a ejecutar solo los tests afectados. Deja la terminal abierta mientras programas y tendrás feedback al instante. Pulsa `q` para salir.

Para ejecutarlos **una sola vez** (como se hace en CI):

```bash
npx vitest run
```

## Cuando un test falla

Cambia `calcularSubtotal` para que olvide la cantidad (`total + p.precio`) y guarda:

```bash
 FAIL  src/carrito.test.js > calcularSubtotal > suma precio por cantidad de cada producto
AssertionError: expected 125 to be 150

- Expected
+ Received

- 150
+ 125
```

Vitest te dice **qué test**, **qué esperaba** y **qué recibió**. Lee siempre el mensaje completo antes de tocar nada.

## Los matchers que más vas a usar

```js
// Igualdad exacta (números, textos, booleanos): usa ===
expect(2 + 2).toBe(4)

// Igualdad de contenido (objetos y arrays)
expect({ nombre: 'Ana', edad: 30 }).toEqual({ nombre: 'Ana', edad: 30 })

// Verdadero, falso, nulo, indefinido
expect(esValido).toBe(true)
expect(usuario).toBeNull()
expect(resultado).toBeUndefined()
expect(lista.length).toBeGreaterThan(0)

// Textos
expect('Hola mundo').toContain('mundo')
expect('ana@correo.com').toMatch(/@/)

// Arrays
expect(['HTML', 'CSS', 'JS']).toContain('CSS')
expect([1, 2, 3]).toHaveLength(3)

// Objetos: comprobar solo algunas propiedades
expect(usuario).toHaveProperty('email')
expect(usuario).toMatchObject({ nombre: 'Ana' })

// Decimales (0.1 + 0.2 no es exactamente 0.3)
expect(0.1 + 0.2).toBeCloseTo(0.3)

// Errores: ¡ojo, se pasa una función!
expect(() => aplicarCupon(100, 'X')).toThrow()

// Negar cualquier matcher
expect(lista).not.toContain('PHP')
```

### `toBe` contra `toEqual`

Es la confusión número uno:

```js
expect({ a: 1 }).toBe({ a: 1 })     // ❌ falla: son dos objetos distintos en memoria
expect({ a: 1 }).toEqual({ a: 1 })  // ✅ tienen el mismo contenido
```

`toBe` compara con `===` (lo viste en el post de igualdad en JavaScript). Para objetos y arrays usa **`toEqual`**.

## Muchos casos, un solo test: `it.each`

Cuando pruebas la misma función con muchos datos, no copies el test:

```js
import { describe, it, expect } from 'vitest'
import { aplicarCupon } from './carrito.js'

describe('aplicarCupon', () => {
  it.each([
    { total: 100, cupon: 'DESCUENTO10', esperado: 90 },
    { total: 50, cupon: 'DESCUENTO10', esperado: 45 },
    { total: 80, cupon: 'ENVIOGRATIS', esperado: 80 }
  ])('$cupon sobre $total da $esperado', ({ total, cupon, esperado }) => {
    expect(aplicarCupon(total, cupon)).toBe(esperado)
  })
})
```

`$cupon` y compañía se reemplazan en el nombre de cada test, así ves exactamente qué caso falló.

## Preparar datos: `beforeEach`

Si varios tests necesitan los mismos datos de partida, prepáralos en `beforeEach`, que se ejecuta **antes de cada test**:

```js
import { describe, it, expect, beforeEach } from 'vitest'

describe('lista de tareas', () => {
  let tareas

  beforeEach(() => {
    tareas = [{ id: 1, texto: 'Estudiar', hecha: false }]
  })

  it('se puede añadir una tarea', () => {
    tareas.push({ id: 2, texto: 'Correr', hecha: false })
    expect(tareas).toHaveLength(2)
  })

  it('empieza con una sola tarea', () => {
    expect(tareas).toHaveLength(1) // ✅ el push del test anterior no afecta
  })
})
```

Cada test debe ser **independiente**: no debe depender de lo que hizo otro. `beforeEach` lo garantiza.

## Ejecutar solo algunos tests

Mientras trabajas en algo concreto:

```js
it.only('este es el único que se ejecuta en el archivo', () => { /* ... */ })
it.skip('este se salta por ahora', () => { /* ... */ })
it.todo('validar cupones caducados') // un recordatorio de lo que falta
```

O desde la terminal, filtrando por nombre de archivo: `npx vitest carrito`.

> No subas nunca un `.only` al repositorio: harías que en CI solo se ejecute ese test.

## Tu turno

1. Añade a `carrito.js` una función `calcularEnvio(subtotal)`: gratis desde 100, si no, 15. Escribe tests para 99, 100 y 150 con `it.each`.
2. Haz que `calcularSubtotal` lance un error si algún producto tiene cantidad negativa y pruébalo con `toThrow`.
3. Rompe una función a propósito con el modo watch abierto y observa cómo cambia la salida.

## Errores comunes

- **Usar `toBe` con objetos o arrays.** Usa `toEqual`.
- **`expect(funcion()).toThrow()`.** Ejecutas la función antes de que Vitest pueda capturar el error. Va envuelta: `expect(() => funcion()).toThrow()`.
- **El archivo no termina en `.test.js`**, y Vitest dice `No test files found`.
- **Tests que dependen unos de otros.** Usa `beforeEach` para empezar siempre desde el mismo estado.
- **Olvidarse un `.only`** al hacer commit.

## Para profundizar

- [Primeros pasos con Vitest (documentación oficial, en inglés)](https://vitest.dev/guide/)
- [Lista completa de matchers de `expect` (en inglés)](https://vitest.dev/api/expect.html)

En resumen: instala **Vitest**, crea archivos **`.test.js`** y escribe tests con **`describe`**, **`it`** y **`expect`**. Usa **`toBe`** para valores simples, **`toEqual`** para objetos y arrays y **`toThrow`** (con una función) para errores. **`it.each`** prueba muchos casos sin repetir código, **`beforeEach`** prepara los datos y el **modo watch** te da feedback cada vez que guardas.
