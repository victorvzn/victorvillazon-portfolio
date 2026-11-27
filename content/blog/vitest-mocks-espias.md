---
title: 'Vitest: mocks, espías y cómo probar código que depende de otros'
description: 'Qué es un mock y cuándo usarlo, vi.fn para funciones falsas, vi.spyOn para espiar métodos reales, vi.mock para reemplazar módulos enteros y cómo probar código que llama a fetch.'
date: 2026-11-27
series: testing
tags: [Vitest, Testing, Mocks, Intermedio]
draft: true
---

Probar `calcularSubtotal(productos)` es fácil: le das datos, te devuelve un número. Pero ¿cómo pruebas una función que **envía un email**, **llama a una API** o **guarda en una base de datos**? No quieres enviar un email real cada vez que ejecutas los tests, ni depender de que una API externa esté funcionando.

La solución es **reemplazar esa dependencia por una falsa** que controlas tú. A eso se le llama **mock** (o *doble de prueba*).

## `vi.fn()`: una función falsa que lo apunta todo

`vi.fn()` crea una función que no hace nada, pero **registra cada llamada**: cuántas veces se llamó y con qué argumentos.

```js
import { it, expect, vi } from 'vitest'

it('vi.fn registra sus llamadas', () => {
  const saludar = vi.fn()

  saludar('Ana')
  saludar('Luis', 'buenos días')

  expect(saludar).toHaveBeenCalledTimes(2)
  expect(saludar).toHaveBeenCalledWith('Ana')
  expect(saludar).toHaveBeenLastCalledWith('Luis', 'buenos días')
})
```

### Un caso real: callbacks

```js
// src/tareas.js
export function completarTarea(tarea, alCompletar) {
  const actualizada = { ...tarea, hecha: true }
  alCompletar(actualizada)
  return actualizada
}
```

```js
// src/tareas.test.js
import { it, expect, vi } from 'vitest'
import { completarTarea } from './tareas.js'

it('avisa con la tarea actualizada', () => {
  const alCompletar = vi.fn()

  completarTarea({ id: 1, texto: 'Estudiar', hecha: false }, alCompletar)

  expect(alCompletar).toHaveBeenCalledOnce()
  expect(alCompletar).toHaveBeenCalledWith({ id: 1, texto: 'Estudiar', hecha: true })
})
```

### Decidir qué devuelve

```js
const obtenerPrecio = vi.fn()

obtenerPrecio.mockReturnValue(100)            // siempre devuelve 100
obtenerPrecio.mockReturnValueOnce(50)         // solo la próxima vez devuelve 50
obtenerPrecio.mockResolvedValue({ ok: true }) // devuelve una promesa resuelta
obtenerPrecio.mockRejectedValue(new Error('Sin conexión')) // una promesa rechazada
obtenerPrecio.mockImplementation((id) => id * 10) // con lógica propia
```

## Inyectar dependencias: el truco que lo hace todo fácil

Mira esta función. ¿Cómo la pruebas sin enviar un email de verdad?

```js
import { enviarEmail } from './email.js'

export async function registrarUsuario(datos) {
  const usuario = { id: crypto.randomUUID(), ...datos }
  await enviarEmail(usuario.email, '¡Bienvenido!')
  return usuario
}
```

La forma más sencilla es **pasarle la dependencia como parámetro**. A esto se le llama **inyección de dependencias**:

```js
export async function registrarUsuario(datos, { enviarEmail }) {
  const usuario = { id: crypto.randomUUID(), ...datos }
  await enviarEmail(usuario.email, '¡Bienvenido!')
  return usuario
}
```

```js
it('envía un email de bienvenida', async () => {
  const enviarEmail = vi.fn().mockResolvedValue(undefined)

  const usuario = await registrarUsuario({ nombre: 'Ana', email: 'ana@correo.com' }, { enviarEmail })

  expect(usuario.nombre).toBe('Ana')
  expect(enviarEmail).toHaveBeenCalledWith('ana@correo.com', '¡Bienvenido!')
})
```

Sin trucos ni magia: en producción le pasas el `enviarEmail` real; en el test, uno falso. Cuando puedas, **diseña así tu código**: es más fácil de probar y más flexible.

## `vi.mock()`: reemplazar un módulo entero

Si no puedes (o no quieres) cambiar la firma de la función, Vitest puede **reemplazar el módulo importado**:

```js
// src/registro.test.js
import { it, expect, vi } from 'vitest'
import { registrarUsuario } from './registro.js'
import { enviarEmail } from './email.js'

vi.mock('./email.js', () => ({
  enviarEmail: vi.fn()
}))

it('envía un email de bienvenida', async () => {
  await registrarUsuario({ nombre: 'Ana', email: 'ana@correo.com' })

  expect(enviarEmail).toHaveBeenCalledWith('ana@correo.com', '¡Bienvenido!')
})
```

- `vi.mock('./email.js', ...)` le dice a Vitest: "cuando alguien importe `./email.js`, dale este objeto en su lugar".
- Vitest **mueve `vi.mock` al principio del archivo** automáticamente (*hoisting*), así que se aplica antes de los `import`, aunque lo escribas después.
- El `enviarEmail` que importas en el test **es el falso**, así que puedes comprobar sus llamadas.

## `vi.spyOn()`: espiar un método real

`spyOn` envuelve un método que **ya existe**, para observarlo o cambiar lo que devuelve:

```js
import { it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks() // devuelve los métodos originales después de cada test
})

it('registra los errores en la consola', () => {
  const espia = vi.spyOn(console, 'error').mockImplementation(() => {})

  procesarPedido({ productos: [] }) // supongamos que hace console.error si está vacío

  expect(espia).toHaveBeenCalledWith('El pedido no tiene productos')
})

it('genera ids predecibles', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)

  expect(Math.random()).toBe(0.5)
})
```

`mockImplementation(() => {})` evita que el `console.error` real ensucie la salida de los tests.

## Probar código que usa `fetch`

`fetch` es una función global, así que puedes reemplazarla con `vi.stubGlobal`:

```js
// src/clima.js
export async function obtenerTemperatura(ciudad) {
  const respuesta = await fetch(`https://api.ejemplo.com/clima?ciudad=${ciudad}`)
  if (!respuesta.ok) throw new Error('No se pudo obtener el clima')
  const datos = await respuesta.json()
  return Math.round(datos.temperatura)
}
```

```js
// src/clima.test.js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { obtenerTemperatura } from './clima.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('obtenerTemperatura', () => {
  it('devuelve la temperatura redondeada', async () => {
    const fetchFalso = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ temperatura: 18.7 })
    })
    vi.stubGlobal('fetch', fetchFalso)

    const temperatura = await obtenerTemperatura('Lima')

    expect(temperatura).toBe(19)
    expect(fetchFalso).toHaveBeenCalledWith('https://api.ejemplo.com/clima?ciudad=Lima')
  })

  it('lanza un error si la API falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    await expect(obtenerTemperatura('Lima')).rejects.toThrow('No se pudo obtener el clima')
  })
})
```

Fíjate en `await expect(promesa).rejects.toThrow()`: así se comprueba que una función `async` lanza un error. (Lo verás a fondo en el siguiente post.)

> Para apps con muchas llamadas a APIs, reemplazar `fetch` a mano se vuelve pesado. Existe **MSW**, que intercepta las peticiones de red de forma más realista; tiene su propio post en el módulo de Testing Library.

## Limpiar entre tests

Los mocks **recuerdan** sus llamadas. Si no los limpias, un test puede ver las llamadas de otro:

| Método | Qué hace |
| --- | --- |
| `vi.clearAllMocks()` | Borra el historial de llamadas |
| `vi.resetAllMocks()` | Lo anterior y además quita las implementaciones (`mockReturnValue`...) |
| `vi.restoreAllMocks()` | Devuelve los métodos originales espiados con `spyOn` |

Puedes ponerlo en un `afterEach`, o activarlo para todos los tests en la configuración:

```js
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true
  }
})
```

## ¿Cuándo NO usar mocks?

Los mocks son potentes, pero **cada mock es una mentira** sobre cómo funciona tu app. Si mockeas demasiado, tus tests pasan aunque el código real esté roto.

- ✅ Mockea lo que es **lento, caro o impredecible**: APIs externas, emails, pagos, el reloj, `Math.random`.
- ❌ No mockees **tu propia lógica** solo porque puedes. Si `calcularTotal` usa `calcularSubtotal`, deja que use la real.

## Tu turno

1. Escribe `guardarPreferencias(preferencias, almacenamiento)` que haga `almacenamiento.setItem('prefs', JSON.stringify(preferencias))`. Pruébala pasándole un objeto con un `setItem` creado con `vi.fn()`.
2. Escribe `obtenerUsuario(id)` que haga `fetch` a `https://dummyjson.com/users/${id}` y devuelva `firstName`. Pruébala con `vi.stubGlobal`, tanto el caso bueno como un 404.
3. Usa `vi.spyOn(console, 'warn')` para comprobar que una función muestra un aviso cuando recibe datos vacíos.

## Errores comunes

- **No limpiar los mocks** y que un test vea las llamadas del anterior.
- **Comprobar el mock en vez del resultado.** Lo importante suele ser *qué devuelve* tu función; comprueba las llamadas solo cuando el efecto es justo eso (enviar un email, guardar algo).
- **Mockear todo.** Tus tests dejan de probar la app real.
- **Olvidar el `await`** al probar funciones `async`: el test termina antes de que se ejecute la comprobación.
- **Escribir la ruta de `vi.mock` distinta a la del `import`.** Debe ser la misma ruta que usa el archivo que la importa, relativa al test.

## Para profundizar

- [Mocking en Vitest (documentación oficial, en inglés)](https://vitest.dev/guide/mocking.html)
- [API de `vi` (en inglés)](https://vitest.dev/api/vi.html)

En resumen: un **mock** reemplaza una dependencia lenta o impredecible por una falsa que controlas. **`vi.fn()`** crea funciones que registran sus llamadas, **`vi.spyOn()`** espía métodos reales, **`vi.mock()`** reemplaza módulos enteros y **`vi.stubGlobal()`** reemplaza globales como `fetch`. Siempre que puedas, **inyecta las dependencias** como parámetros, limpia los mocks entre tests y no mockees tu propia lógica.
