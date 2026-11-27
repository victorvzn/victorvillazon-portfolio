---
title: 'Vitest avanzado: código asíncrono, temporizadores falsos y cobertura'
description: 'Cómo probar promesas y async/await, controlar el tiempo con vi.useFakeTimers para probar un debounce o un setTimeout, fijar la fecha con vi.setSystemTime, medir la cobertura y ejecutar los tests en GitHub Actions.'
date: 2026-11-27
series: testing
tags: [Vitest, Testing, Asincronía, Avanzado]
draft: true
---

Hay código que no devuelve su resultado al momento: una promesa que tarda, un `setTimeout` de 3 segundos, un *debounce* que espera a que dejes de escribir, una oferta que caduca a medianoche. Si tus tests esperan de verdad, serán **lentos**; si no esperan bien, darán **falsos positivos**. Hoy aprendes a controlarlo.

## Probar funciones `async`

La regla de oro: **si la función devuelve una promesa, el test debe ser `async` y usar `await`**.

```js
// src/usuarios.js
export async function buscarUsuario(id, api) {
  const usuario = await api.obtener(id)
  if (!usuario) throw new Error(`Usuario ${id} no encontrado`)
  return { ...usuario, nombreCompleto: `${usuario.nombre} ${usuario.apellido}` }
}
```

```js
// src/usuarios.test.js
import { it, expect, vi } from 'vitest'
import { buscarUsuario } from './usuarios.js'

it('añade el nombre completo', async () => {
  const api = { obtener: vi.fn().mockResolvedValue({ nombre: 'Ana', apellido: 'Torres' }) }

  const usuario = await buscarUsuario(1, api)

  expect(usuario.nombreCompleto).toBe('Ana Torres')
})

it('lanza un error si no existe', async () => {
  const api = { obtener: vi.fn().mockResolvedValue(null) }

  await expect(buscarUsuario(99, api)).rejects.toThrow('Usuario 99 no encontrado')
})
```

- Para el caso bueno: `await` y compruebas el resultado.
- Para el error: `await expect(promesa).rejects.toThrow(...)`. También existe `.resolves`: `await expect(promesa).resolves.toEqual(...)`.

### El falso positivo más peligroso

```js
// ❌ Este test SIEMPRE pasa, aunque la función esté rota
it('lanza un error si no existe', () => {
  expect(buscarUsuario(99, api)).rejects.toThrow('no encontrado')
})
```

Sin el `await`, el test termina **antes** de que la promesa se resuelva, y Vitest lo da por bueno. (Las versiones recientes de Vitest te avisan de este caso, pero acostúmbrate a escribir el `await`.)

## Temporizadores falsos: controlar el reloj

Esta función muestra una notificación y la oculta a los 3 segundos:

```js
// src/notificacion.js
export function mostrarNotificacion(mensaje, { alMostrar, alOcultar }) {
  alMostrar(mensaje)
  setTimeout(() => alOcultar(), 3000)
}
```

Un test que espere 3 segundos de verdad es inaceptable: con 100 tests así, tardarías minutos. Con **`vi.useFakeTimers()`**, Vitest reemplaza `setTimeout`, `setInterval` y compañía por versiones falsas, y **tú decides cuándo avanza el tiempo**:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mostrarNotificacion } from './notificacion.js'

describe('mostrarNotificacion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('se oculta a los 3 segundos', () => {
    const alMostrar = vi.fn()
    const alOcultar = vi.fn()

    mostrarNotificacion('Guardado', { alMostrar, alOcultar })
    expect(alMostrar).toHaveBeenCalledWith('Guardado')

    vi.advanceTimersByTime(2999)
    expect(alOcultar).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(alOcultar).toHaveBeenCalledOnce()
  })
})
```

El test tarda milisegundos y comprueba **exactamente** el límite: a los 2999 ms todavía no, a los 3000 sí.

| Método | Qué hace |
| --- | --- |
| `vi.advanceTimersByTime(ms)` | Avanza el reloj esos milisegundos y ejecuta lo que toque |
| `vi.runAllTimers()` | Ejecuta todos los temporizadores pendientes |
| `vi.runOnlyPendingTimers()` | Ejecuta solo los que ya estaban programados (útil con `setInterval`) |
| `vi.advanceTimersByTimeAsync(ms)` | Como el primero, pero esperando también a las promesas |

## Ejemplo completo: probar un debounce

Un **debounce** retrasa una función hasta que pasen X milisegundos **sin** nuevas llamadas. Es lo que usas en un buscador para no hacer una petición por cada tecla (está en la serie de pruebas técnicas).

```js
// src/debounce.js
export function debounce(funcion, espera) {
  let temporizador
  return (...argumentos) => {
    clearTimeout(temporizador)
    temporizador = setTimeout(() => funcion(...argumentos), espera)
  }
}
```

```js
// src/debounce.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './debounce.js'

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('solo ejecuta la última llamada cuando dejan de llegar', () => {
    const buscar = vi.fn()
    const buscarConDebounce = debounce(buscar, 300)

    buscarConDebounce('j')
    buscarConDebounce('ja')
    buscarConDebounce('jav')
    vi.advanceTimersByTime(299)
    expect(buscar).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(buscar).toHaveBeenCalledOnce()
    expect(buscar).toHaveBeenCalledWith('jav')
  })

  it('vuelve a esperar si llega otra llamada antes de tiempo', () => {
    const buscar = vi.fn()
    const buscarConDebounce = debounce(buscar, 300)

    buscarConDebounce('a')
    vi.advanceTimersByTime(200)
    buscarConDebounce('ab') // reinicia la espera
    vi.advanceTimersByTime(200)
    expect(buscar).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(buscar).toHaveBeenCalledWith('ab')
  })
})
```

## Fijar la fecha: `vi.setSystemTime`

Si tu código depende de **la fecha de hoy**, el test que pasa hoy puede fallar mañana:

```js
// src/ofertas.js
export function ofertaVigente(oferta) {
  return new Date() < new Date(oferta.terminaEl)
}
```

```js
import { it, expect, vi, afterEach } from 'vitest'
import { ofertaVigente } from './ofertas.js'

afterEach(() => vi.useRealTimers())

it('la oferta sigue vigente el día antes', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-27T12:00:00Z'))

  expect(ofertaVigente({ terminaEl: '2026-11-28T00:00:00Z' })).toBe(true)
})

it('la oferta caduca al pasar la fecha', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-28T00:00:01Z'))

  expect(ofertaVigente({ terminaEl: '2026-11-28T00:00:00Z' })).toBe(false)
})
```

Con la fecha fijada, el test da el mismo resultado hoy, mañana y dentro de un año. Usa siempre fechas con zona horaria (`Z` = UTC) para que no cambie según el ordenador.

## Cobertura: ¿qué parte de tu código prueban los tests?

La **cobertura** (*coverage*) mide qué líneas y ramas de tu código se ejecutan durante los tests. Instala el proveedor y ejecútala:

```bash
npm install --save-dev @vitest/coverage-v8
npx vitest run --coverage
```

```bash
 % Coverage report from v8
-------------|---------|----------|---------|---------|
File         | % Stmts | % Branch | % Funcs | % Lines |
-------------|---------|----------|---------|---------|
 carrito.js  |   85.71 |       75 |     100 |   85.71 |
 debounce.js |     100 |      100 |     100 |     100 |
-------------|---------|----------|---------|---------|
```

Además se genera una carpeta `coverage/` con un informe HTML (`coverage/index.html`): ábrelo y verás **en rojo las líneas que ningún test ejecuta**. Es la forma más rápida de descubrir qué casos olvidaste (por ejemplo, la rama del `throw`).

Añade `coverage/` a tu `.gitignore`.

> ⚠️ **La cobertura no mide la calidad.** Un test sin ningún `expect` puede dar 100% de cobertura y no comprobar nada. Úsala para encontrar huecos, no como un número que perseguir. Muchos equipos piden un mínimo (por ejemplo, 80%) y se configura con `coverage.thresholds` en `vitest.config.js`.

## Ejecutar los tests en cada push: GitHub Actions

El último paso profesional: que los tests se ejecuten **automáticamente** cada vez que subes código o abres un *pull request*. Crea `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx vitest run --coverage
```

Sube el archivo y, en la pestaña **Actions** de tu repositorio, verás los tests ejecutarse. Si alguno falla, el commit aparece con una ❌ roja. A esto se le llama **integración continua** (CI).

## Tu turno

1. Escribe un `throttle(funcion, espera)` (ejecuta como mucho una vez cada `espera` ms) y pruébalo con temporizadores falsos.
2. Escribe `esFinDeSemana()` usando `new Date().getDay()` y pruébala con `vi.setSystemTime` para un sábado y un lunes.
3. Ejecuta la cobertura en tu proyecto, busca una línea en rojo y escribe el test que la cubre.

## Errores comunes

- **Olvidar el `await`** en `expect(...).rejects`: el test pasa siempre.
- **No volver a los temporizadores reales** (`vi.useRealTimers()`) y afectar a otros tests.
- **Probar con la fecha real.** El test falla el día que cambia el mes o el año.
- **Perseguir el 100% de cobertura** con tests que no comprueban nada.
- **Mezclar temporizadores falsos con promesas** usando `advanceTimersByTime`. Si dentro del temporizador hay `await`, usa la versión `Async`.

## Para profundizar

- [`vi.useFakeTimers` y el resto de la API de `vi` (en inglés)](https://vitest.dev/api/vi.html)
- [Cobertura en Vitest (en inglés)](https://vitest.dev/guide/coverage.html)

En resumen: haz `async` los tests de funciones asíncronas y **nunca olvides el `await`**, sobre todo con **`.rejects`**. Con **`vi.useFakeTimers()`** controlas el tiempo para probar `setTimeout` y *debounce* en milisegundos, y con **`vi.setSystemTime()`** fijas la fecha. La **cobertura** te enseña qué código no prueba nadie, y **GitHub Actions** ejecuta tus tests en cada push.
