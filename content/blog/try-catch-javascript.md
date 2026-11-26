---
title: 'try/catch: maneja los errores sin que tu app se rompa'
description: 'Qué pasa cuando JavaScript encuentra un error, cómo atraparlo con try/catch, cómo lanzar tus propios errores con throw y para qué sirve finally.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos, Debugging]
draft: true
---

Cuando JavaScript encuentra un error, **se detiene**: el resto del código ya no se ejecuta. Si eso pasa en medio de tu app, un botón deja de funcionar o una lista se queda sin cargar, y el usuario no sabe por qué.

Con **`try/catch`** puedes "atrapar" el error, decidir qué hacer y seguir adelante.

## Primero: un error sin atrapar

```js playground=sin-atrapar
console.log('Antes del error')

const datos = JSON.parse('esto no es JSON') // 💥 SyntaxError

console.log('Esta línea nunca se ejecuta')
```

En la consola verás el error en rojo y el último mensaje no aparece. El programa se paró en la línea del problema.

## try/catch: intenta, y si falla, atrapa

```js playground=try-catch
console.log('Antes del error')

try {
  const datos = JSON.parse('esto no es JSON')
  console.log('Esto no se ejecuta')
} catch (error) {
  console.log('Algo salió mal:', error.message)
}

console.log('El programa sigue funcionando ✅')
```

- **`try { ... }`**: el código que **podría** fallar.
- **`catch (error) { ... }`**: lo que haces **si** falla. `error` es un objeto con información del problema.

Si dentro del `try` no hay ningún error, el `catch` simplemente se salta.

## Qué trae el objeto error

```js playground=objeto-error
try {
  const usuario = undefined
  console.log(usuario.nombre) // no se puede leer una propiedad de undefined
} catch (error) {
  console.log('Tipo:', error.name)       // TypeError
  console.log('Mensaje:', error.message) // Cannot read properties of undefined...
}
```

- **`error.name`**: el tipo de error (`TypeError`, `SyntaxError`, `ReferenceError`...).
- **`error.message`**: la descripción. Es lo que te ayuda a entender qué pasó.

En el post de los 5 errores de consola más comunes tienes qué significa cada tipo.

## throw: lanza tus propios errores

No solo JavaScript lanza errores: tú también puedes, con **`throw`**. Sirve para avisar de que algo no tiene sentido, por ejemplo un dato inválido:

```js playground=throw
function calcularDescuento(precio, porcentaje) {
  if (porcentaje < 0 || porcentaje > 100) {
    throw new Error('El porcentaje debe estar entre 0 y 100')
  }
  return precio - (precio * porcentaje) / 100
}

try {
  console.log(calcularDescuento(200, 10))  // 180
  console.log(calcularDescuento(200, 150)) // 💥 lanza el error
} catch (error) {
  console.log('No se pudo calcular:', error.message)
}
```

Cuando se ejecuta un `throw`, la función se detiene en el acto (como un `return`) y el error "sube" hasta el `catch` más cercano.

¿Por qué lanzar un error en vez de devolver un texto como `'porcentaje inválido'`? Porque un texto se puede confundir con un resultado válido y seguir calculando con él. Un error **obliga** a quien llama a la función a darse cuenta.

## finally: se ejecuta siempre

El bloque **`finally`** se ejecuta **siempre**, haya error o no. Es ideal para "limpiar": ocultar un mensaje de carga, reactivar un botón...

```js playground=finally
function procesarPedido(cantidad) {
  console.log('⏳ Procesando...')

  try {
    if (cantidad <= 0) throw new Error('La cantidad debe ser mayor que 0')
    console.log(`✅ Pedido de ${cantidad} unidades confirmado`)
  } catch (error) {
    console.log(`❌ ${error.message}`)
  } finally {
    console.log('Ocultando el mensaje de carga')
  }
}

procesarPedido(3)
console.log('---')
procesarPedido(0)
```

## try/catch con async/await

Donde más vas a usar `try/catch` es con peticiones a una API. Con `async/await`, un error de red se atrapa igual que cualquier otro:

```js playground=async
async function cargarUsuario(id) {
  try {
    const respuesta = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)

    if (!respuesta.ok) {
      throw new Error(`El usuario ${id} no existe (código ${respuesta.status})`)
    }

    const usuario = await respuesta.json()
    console.log(`✅ ${usuario.name}`)
  } catch (error) {
    console.log(`❌ ${error.message}`)
  }
}

async function main() {
  await cargarUsuario(1)
  await cargarUsuario(999)
}

main()
```

Ojo: `fetch` **no** lanza un error con un 404. Por eso comprobamos `respuesta.ok` y, si no está bien, lanzamos nosotros el error con `throw`.

## ¿Dónde poner try/catch?

No envuelvas todo tu código en `try/catch` "por si acaso". Úsalo donde un error es **posible y esperable**:

- Al leer datos externos: `JSON.parse`, `localStorage`, respuestas de una API.
- En peticiones de red (`fetch`).
- Al validar lo que escribe el usuario.

Y en el `catch`, **haz algo útil**: muestra un mensaje al usuario, usa un valor por defecto o registra el error. Un `catch` vacío esconde los problemas y los hace imposibles de encontrar.

## Errores comunes

- **El `catch` vacío.** `catch (error) {}` se traga el error y nadie se entera de que algo falló. Como mínimo, haz `console.error(error)`.
- **Mostrar `error.message` técnico al usuario.** "Cannot read properties of undefined" no le sirve a nadie. Muéstrale algo comprensible ("No pudimos cargar tus datos, inténtalo de nuevo") y deja el detalle técnico en la consola.
- **Pensar que `try/catch` atrapa errores de un `setTimeout`.** Si el error ocurre dentro del callback, más tarde, el `try` ya terminó. El `try/catch` tiene que ir **dentro** del callback.
- **Lanzar textos en vez de errores.** `throw 'error'` funciona, pero pierdes información. Usa siempre `throw new Error('...')`.

## Para profundizar

- [`try...catch` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/try...catch)
- [`throw` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/throw)

En resumen: **`try`** para el código que puede fallar, **`catch`** para decidir qué hacer si falla, **`finally`** para lo que debe pasar siempre y **`throw new Error()`** para avisar de que algo no tiene sentido. Y nunca dejes un `catch` vacío.
