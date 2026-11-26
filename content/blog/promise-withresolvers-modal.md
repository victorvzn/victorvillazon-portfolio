---
title: 'Promise.withResolvers: un modal de confirmación que se usa con await'
description: 'Escribe const ok = await confirmar("¿Borrar?") con tu propio modal. Promise.withResolvers (ES2024) lo hace sencillo, y Promise.try viene de regalo.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ESNext, Asincronía]
draft: true
---

El `confirm()` del navegador es muy cómodo de usar:

```js
if (confirm('¿Seguro que quieres borrar el proyecto?')) {
  borrarProyecto()
}
```

Pero es feo, no se puede personalizar y bloquea toda la página. En cualquier empresa te van a pedir **un modal propio** con el diseño de la marca. El problema es que un modal propio no "espera" la respuesta: el usuario hace clic más tarde, en otro evento.

Lo ideal sería poder escribir esto:

```js
const ok = await confirmar('¿Seguro que quieres borrar el proyecto?')
if (ok) borrarProyecto()
```

Para eso, `confirmar` tiene que devolver una **promesa** que se resuelva cuando el usuario haga clic. Y ahí entra `Promise.withResolvers`.

## Qué hace `Promise.withResolvers()`

Crea una promesa y te da, por separado, las funciones para cumplirla o rechazarla:

```js playground=basico
const { promise, resolve, reject } = Promise.withResolvers()

promise.then(valor => console.log('Se resolvió con:', valor))

console.log('La promesa está esperando...')
setTimeout(() => resolve('¡hola!'), 1000)
```

Hasta ahora, para sacar `resolve` fuera había que hacer este truco:

```js
let resolve
const promise = new Promise((res) => {
  resolve = res
})
```

Funciona, pero es raro de leer y fácil de equivocarse. `withResolvers` es exactamente eso, pero de forma oficial y en una línea.

## El modal de confirmación

Usamos `<dialog>` (lo vimos en el post del modal sin JavaScript) con un formulario `method="dialog"`: al pulsar un botón, el dialog se cierra solo y guarda el `value` del botón en `dialogo.returnValue`.

```html playground=modal
<button id="borrar">Borrar proyecto</button>

<dialog id="confirmar">
  <form method="dialog">
    <p></p>
    <menu>
      <button value="no">Cancelar</button>
      <button value="si" class="peligro">Sí, borrar</button>
    </menu>
  </form>
</dialog>
```

```css playground=modal
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

dialog {
  border: none;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25);
}

dialog::backdrop {
  background: rgb(0 0 0 / 0.4);
}

menu {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin: 16px 0 0;
  padding: 0;
}

button {
  padding: 8px 14px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  background: white;
  font: inherit;
  cursor: pointer;
}

.peligro {
  border-color: #dc2626;
  background: #dc2626;
  color: white;
}
```

```js playground=modal
const dialogo = document.querySelector('#confirmar')
const texto = dialogo.querySelector('p')

function confirmar(mensaje) {
  const { promise, resolve } = Promise.withResolvers()

  texto.textContent = mensaje
  dialogo.returnValue = '' // si cierran con Esc, no queda el valor de la vez anterior
  dialogo.showModal()

  // Cuando el dialog se cierre (botón o Esc), resolvemos la promesa
  dialogo.addEventListener('close', () => resolve(dialogo.returnValue === 'si'), { once: true })

  return promise
}

// Usarlo es tan cómodo como confirm()
document.querySelector('#borrar').addEventListener('click', async () => {
  const ok = await confirmar('¿Seguro que quieres borrar el proyecto? No se puede deshacer.')
  console.log(ok ? '🗑️ Proyecto borrado' : '↩️ Cancelado')
})
```

Prueba los dos botones y también la tecla `Esc`. Los detalles importantes:

- **`{ once: true }`** quita el listener después de usarlo. Sin esto, cada vez que abrieras el modal se acumularía un listener nuevo.
- **`dialogo.returnValue = ''`** antes de abrir: al cerrar con `Esc`, el navegador no cambia `returnValue`. Si no lo limpias, podría quedarse el "si" de la vez anterior y borrar algo sin querer.
- La promesa siempre se resuelve con `true` o `false`, así que quien la usa no necesita `try/catch`.

Este mismo patrón sirve para cualquier cosa que "espera al usuario": elegir un archivo, un paso de un tutorial o esperar a que termine una animación.

## Bonus: `Promise.try()` (ES2025)

A veces tienes una función que **unas veces es síncrona y otras asíncrona**, y puede lanzar errores en los dos casos. Por ejemplo, leer datos de una caché o, si no están, pedirlos a la API:

```js playground=try
const cache = new Map([['ana', { nombre: 'Ana' }]])

function obtenerUsuario(id) {
  if (!id) throw new Error('Falta el id') // error síncrono
  if (cache.has(id)) return cache.get(id) // valor síncrono
  return new Promise(resolve => setTimeout(() => resolve({ nombre: id }), 500)) // asíncrono
}

// Promise.try convierte todo en una promesa: también el error síncrono
for (const id of ['ana', 'luis', '']) {
  Promise.try(() => obtenerUsuario(id))
    .then(usuario => console.log('✅', usuario.nombre))
    .catch(error => console.log('❌', error.message))
}
```

Sin `Promise.try`, el `throw` de `obtenerUsuario('')` se saltaría el `.catch()` y rompería tu código. Con `Promise.try`, **todos los errores acaban en el mismo `.catch()`**.

## Errores comunes

- **Olvidar resolver en todos los caminos.** Si el usuario cierra el modal de una forma que no escuchas, la promesa se queda esperando para siempre y el `await` nunca continúa. Por eso escuchamos `close`, que cubre botones y `Esc`.
- **Acumular listeners.** Usa `{ once: true }` o quita el listener al resolver.

## Para profundizar

- [`Promise.withResolvers()` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)
- [`Promise.try()` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/try)

En resumen: **`Promise.withResolvers()`** te da la promesa y su `resolve` por separado, ideal para convertir un evento futuro (un clic en tu modal) en algo que puedes esperar con **`await`**. Y **`Promise.try()`** mete los errores síncronos en el mismo `.catch()`.
