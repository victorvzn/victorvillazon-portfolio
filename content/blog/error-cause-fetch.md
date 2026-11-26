---
title: 'Errores que cuentan qué pasó: cause y un fetch que no miente'
description: 'Con new Error(mensaje, { cause }) tus errores llevan su historia completa. Construye el helper de fetch que usarás en cualquier proyecto.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ESNext, APIs, Debugging]
draft: true
---

Viernes por la tarde. Llega un aviso: "la página de perfil está rota". Abres el sistema de errores y lo único que ves es esto:

```
Error: No se pudo cargar el perfil
```

¿Falló la red? ¿El servidor devolvió un 500? ¿El usuario no existe? El mensaje es amable para el usuario, pero **inútil para quien tiene que arreglarlo**. Este post va de escribir errores que cuentan su historia completa.

## El problema: atrapar un error y perder el original

Es muy habitual atrapar un error técnico para lanzar uno más claro:

```js
try {
  await cargarPerfil()
} catch (error) {
  throw new Error('No se pudo cargar el perfil') // 😬 el error original se pierde
}
```

El mensaje nuevo es mejor, pero el error original (el que dice **qué** falló) desaparece.

## La solución: `cause` (ES2022)

`Error` acepta un segundo parámetro con la propiedad `cause` (causa): el error que lo provocó.

```js playground=cause
function leerConfiguracion(texto) {
  try {
    return JSON.parse(texto)
  } catch (error) {
    throw new Error('La configuración no es válida', { cause: error })
  }
}

try {
  leerConfiguracion('{ nombre: "app" }') // JSON mal escrito: faltan comillas en la clave
} catch (error) {
  console.log('Mensaje:', error.message)
  console.log('Causa:', error.cause.message)
}
```

Tienes las dos cosas: un mensaje claro de **qué intentabas hacer** y, dentro, el error técnico de **por qué falló**. Las herramientas de errores (Sentry y similares) y la consola del navegador muestran la cadena completa.

## La trampa de `fetch`: un 404 no es un error

Esto sorprende a casi todo el mundo: `fetch` **solo falla si no hay conexión**. Si el servidor responde con un 404 o un 500, para `fetch` todo salió bien.

```js playground=trampa
async function probar() {
  const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon/no-existe')

  console.log('¿Lanzó un error? No. Status:', respuesta.status) // 404
  console.log('¿Fue bien?', respuesta.ok) // false
}

probar()
```

Si no compruebas `respuesta.ok`, tu código intentará leer el JSON de una página de error y fallará más adelante con un mensaje que no tiene nada que ver.

## El helper de fetch que usarás en todos tus proyectos

Juntemos las dos ideas en una función `obtenerJSON`. Este tipo de helper existe en prácticamente cualquier proyecto profesional:

```js playground=helper
class HttpError extends Error {
  constructor(respuesta) {
    super(`HTTP ${respuesta.status} en ${respuesta.url}`)
    this.name = 'HttpError'
    this.status = respuesta.status
  }
}

async function obtenerJSON(url) {
  let respuesta
  try {
    respuesta = await fetch(url)
  } catch (error) {
    throw new Error('No hay conexión con el servidor', { cause: error })
  }

  if (!respuesta.ok) throw new HttpError(respuesta)

  return respuesta.json()
}

async function cargarPokemon(nombre) {
  try {
    const pokemon = await obtenerJSON(`https://pokeapi.co/api/v2/pokemon/${nombre}`)
    console.log(`✅ ${pokemon.name} pesa ${pokemon.weight / 10} kg`)
  } catch (error) {
    const fallo = new Error(`No se pudo cargar a ${nombre}`, { cause: error })

    console.log(`❌ ${fallo.message}`)
    console.log(`   Causa: ${fallo.cause.name}: ${fallo.cause.message}`)

    // Con la causa puedes decidir qué mostrar al usuario
    if (fallo.cause.status === 404) console.log('   → Mostrar: "Ese Pokémon no existe"')
  }
}

async function main() {
  await cargarPokemon('pikachu')
  await cargarPokemon('no-existe')
}

main()
```

Qué hace cada pieza:

- **`HttpError`** es un error propio que **guarda el `status`**. Así, más arriba, puedes distinguir un 404 (mostrar "no existe") de un 500 (mostrar "inténtalo más tarde").
- **`this.name = 'HttpError'`** hace que en la consola se vea `HttpError: HTTP 404...` en vez de un `Error` genérico.
- **El primer `try/catch`** solo atrapa el fallo de red y lo envuelve con un mensaje claro y su `cause`.
- **`cargarPokemon`** añade su propio contexto ("no se pudo cargar a X") sin perder nada de lo de abajo.

## Errores comunes

- **No comprobar `respuesta.ok`.** Es el bug más habitual con `fetch`. Hazlo siempre, o usa un helper como este.
- **Atrapar errores para nada.** Si en el `catch` solo vuelves a lanzar el mismo error, no añadas el `try/catch`: no aporta contexto.
- **Mostrar `error.message` técnico al usuario.** "HTTP 500 en https://..." es para ti, no para el cliente. Usa la causa para **decidir** qué mensaje amable enseñar.
- **Usar `console.log(error)` y nada más en producción.** En una empresa los errores se envían a un sistema de monitorización; con `cause`, llegan con toda su historia.

## Para profundizar

- [`Error: cause` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [`Response.ok` en MDN](https://developer.mozilla.org/es/docs/Web/API/Response/ok)

En resumen: **`new Error(mensaje, { cause })`** añade contexto sin perder el error original, y **`fetch` no falla con un 404**: comprueba siempre **`respuesta.ok`**. Junta las dos ideas en un helper como `obtenerJSON` y úsalo en todo el proyecto.
