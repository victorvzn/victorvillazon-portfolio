---
title: 'Rendimiento en Node.js: el event loop y por qué no debes bloquearlo'
description: 'Cómo atiende Node.js miles de peticiones con un solo hilo, las fases del event loop, el pool de libuv, qué operaciones bloquean (JSON enorme, bucles, regex, versiones Sync), cómo detectarlo midiendo el retraso del event loop y cómo dividir el trabajo con setImmediate.'
date: 2026-11-27
series: backend
tags: [Node.js, Rendimiento, Event loop, Avanzado]
draft: true
---

Node.js tiene fama de ser **muy rápido** para APIs. Y lo es: un solo proceso puede atender miles de conexiones a la vez. Pero también tiene una debilidad que, si no la conoces, puede tumbar tu servidor con **una sola petición**.

Haz esta prueba. Crea `server.js`:

```js
import { createServer } from 'node:http'

createServer((req, res) => {
  if (req.url === '/lento') {
    const fin = Date.now() + 5000
    while (Date.now() < fin) {} // 5 segundos de cálculo
    return res.end('Terminé el cálculo lento\n')
  }
  res.end('¡Hola, rápido!\n')
}).listen(3000, () => console.log('http://localhost:3000'))
```

Abre [http://localhost:3000/lento](http://localhost:3000/lento) en una pestaña y, mientras carga, [http://localhost:3000](http://localhost:3000) en otra. La ruta "rápida" **tarda 5 segundos**, aunque no hace nada. Durante esos 5 segundos, tu servidor **no atiende a nadie**.

Para entender por qué, y cómo evitarlo, hay que entender el **event loop** de Node.

## Un solo hilo, muchas esperas

Si leíste el post del event loop de JavaScript, ya conoces la idea: JavaScript ejecuta **una cosa a la vez** (un solo hilo, una sola **pila de llamadas**). Node.js funciona igual.

¿Cómo atiende entonces miles de peticiones? Porque en una API típica, casi todo el tiempo se va en **esperar**: a la base de datos, a otra API, al disco. Y esas esperas **no ocupan el hilo**:

1. Llega una petición. Tu código pide datos a la base de datos con `await db.execute(...)`.
2. Node **no se queda esperando**: deja la consulta en manos del sistema y **atiende la siguiente petición**.
3. Cuando la base de datos responde, Node retoma la primera petición donde se quedó.

Es como un camarero que toma el pedido de una mesa, lo pasa a cocina y **atiende otra mesa** mientras se cocina, en vez de quedarse mirando la sartén. Un solo camarero atiende todo el restaurante... **siempre que nadie le pida que pele 1.000 patatas él mismo**.

Eso fue el `while` del ejemplo: trabajo de **CPU** (cálculo) que ocupa el hilo. Mientras el camarero pela patatas, nadie más es atendido.

## Las piezas del event loop de Node

Node usa una librería llamada **libuv** para el event loop. Simplificado, en cada vuelta pasa por estas **fases**:

| Fase | Qué ejecuta |
| --- | --- |
| **Timers** | Los callbacks de `setTimeout` y `setInterval` cuyo tiempo ya pasó |
| **Pending callbacks** | Algunos callbacks de operaciones del sistema |
| **Poll** | Los eventos de entrada/salida: datos de red, respuestas de archivos... (aquí pasa casi todo) |
| **Check** | Los callbacks de `setImmediate` |
| **Close** | Los callbacks de cierre (`socket.on('close')`) |

Y entre cada callback, Node vacía dos colas con **prioridad**:

1. **`process.nextTick`**: lo primero de todo.
2. **Microtareas**: los `.then()` de las promesas y lo que va después de un `await`.

```js
setTimeout(() => console.log('4. setTimeout'), 0)
setImmediate(() => console.log('5. setImmediate'))
Promise.resolve().then(() => console.log('3. promesa (microtarea)'))
process.nextTick(() => console.log('2. nextTick'))
console.log('1. código síncrono')
```

Guárdalo como `orden.cjs` (un script CommonJS) y ejecútalo:

```bash
node orden.cjs
1. código síncrono
2. nextTick
3. promesa (microtarea)
4. setTimeout
5. setImmediate
```

Dos curiosidades que demuestran que estas colas existen de verdad:

- Si lo guardas como **módulo ES** (`orden.mjs`, o un `.js` con `"type": "module"`), verás la promesa **antes** que el `nextTick`. El código de un módulo ES ya se ejecuta dentro de una microtarea, así que Node termina de vaciar las microtareas antes de pasar a la cola de `nextTick`.
- En el código principal, el orden entre `setTimeout(..., 0)` y `setImmediate` puede variar según el sistema; dentro de un callback de entrada/salida, `setImmediate` va siempre antes.

### El pool de hilos de libuv

"Node tiene un solo hilo" es casi verdad. **Tu JavaScript** se ejecuta en un solo hilo, pero libuv tiene un pequeño **pool de hilos** (4 por defecto) para operaciones que el sistema no sabe hacer de forma asíncrona: la mayoría de operaciones de **archivos** (`fs`), la criptografía pesada (`crypto.pbkdf2`, `scrypt`), la compresión (`zlib`) y las búsquedas DNS (`dns.lookup`).

Por eso `await readFile(...)` no bloquea: el trabajo lo hace otro hilo. Pero si lanzas cientos de operaciones de esas a la vez, **se hacen cola** en esos 4 hilos. Se puede ampliar con la variable de entorno `UV_THREADPOOL_SIZE`.

## Qué bloquea el event loop

La regla: **todo lo síncrono que tarde más de unos pocos milisegundos**. Los culpables más habituales en una API real:

### 1. Las funciones `Sync`

```js
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

app.get('/config', (req, res) => {
  const texto = readFileSync('config.json', 'utf8')     // ❌ bloquea en cada petición
  res.json(JSON.parse(texto))
})

app.get('/config', async (req, res) => {
  const texto = await readFile('config.json', 'utf8')   // ✅ no bloquea
  res.json(JSON.parse(texto))
})
```

Las versiones `Sync` (`readFileSync`, `writeFileSync`, `execSync`, `pbkdf2Sync`...) están bien **al arrancar** el servidor (leer la configuración una vez) o en scripts. **Nunca** dentro de una ruta.

### 2. `JSON.parse` y `JSON.stringify` de datos enormes

Son síncronos. Con un JSON de 50 MB, pueden bloquear **cientos de milisegundos**. Si tu API devuelve listas gigantes, **pagina** (lo viste en el post de Turso con Express) o envíalas en **streams** (tiene su propio post).

### 3. Bucles grandes y algoritmos lentos

Ordenar un millón de elementos, recorrer arrays anidados (`O(n²)`), generar un PDF, redimensionar imágenes en JavaScript... Si el cálculo es inevitable, sácalo del hilo principal con **worker threads** (otro post de este módulo).

### 4. Expresiones regulares peligrosas (ReDoS)

Algunas regex tardan un tiempo **exponencial** con ciertos textos. Esta, por ejemplo:

```js
const peligrosa = /^(a+)+$/
console.time('regex')
peligrosa.test('a'.repeat(25) + '!')   // ¡segundos! Y cada "a" más duplica el tiempo
console.timeEnd('regex')
```

Si validas lo que escribe un usuario con una regex así, **un atacante puede congelar tu servidor** con un solo texto bien elegido. Se llama **ReDoS** (*Regular expression Denial of Service*). Evita los cuantificadores anidados como `(a+)+` o `(.*)*`, limita la longitud de los textos antes de validarlos y prefiere validadores probados (Zod, validator.js). Lo viste en el post de expresiones regulares.

### 5. Criptografía síncrona

`bcrypt.hashSync`, `crypto.pbkdf2Sync`... Los algoritmos para contraseñas son **lentos a propósito** (lo viste en el post de cifrado): usa siempre su versión asíncrona.

## Cómo detectarlo: el retraso del event loop

Si el event loop está libre, un `setTimeout` de 0 ms se ejecuta casi al instante. Si está bloqueado, se retrasa. Ese retraso es la medida de salud de tu servidor, y Node puede medirlo:

```js
import { monitorEventLoopDelay } from 'node:perf_hooks'

const histograma = monitorEventLoopDelay({ resolution: 20 })
histograma.enable()

setInterval(() => {
  const p99 = histograma.percentile(99) / 1e6 // de nanosegundos a milisegundos
  console.log(`Retraso del event loop · media: ${(histograma.mean / 1e6).toFixed(1)} ms · p99: ${p99.toFixed(1)} ms`)
  histograma.reset()
}, 5000)
```

- Con el servidor tranquilo, verás valores cercanos a la resolución (unos 20 ms o menos).
- Visita `/lento` y verás un pico de **5000 ms**.
- **p99** (percentil 99) es el retraso que **no** supera el 99% de las mediciones: muestra los peores casos, que es lo que sufren tus usuarios.

En producción, las herramientas de monitorización (Datadog, New Relic, el panel de tu plataforma) muestran esta métrica. Como referencia, si el p99 se mantiene por encima de 50 a 100 ms, algo está bloqueando.

## Dividir el trabajo: ceder el turno

Si tienes que procesar muchos elementos en el hilo principal y no puedes evitarlo, **divídelo en trozos** y deja que el event loop atienda otras cosas entre trozo y trozo:

```js
import { setImmediate as cederTurno } from 'node:timers/promises'

async function procesarEnTrozos(elementos, procesar, tamanoTrozo = 1000) {
  const resultados = []
  for (let i = 0; i < elementos.length; i += tamanoTrozo) {
    for (const elemento of elementos.slice(i, i + tamanoTrozo)) {
      resultados.push(procesar(elemento))
    }
    await cederTurno() // deja que se atiendan otras peticiones antes del siguiente trozo
  }
  return resultados
}
```

`await setImmediate()` (la versión con promesas) pausa la función hasta la siguiente vuelta del event loop. El trabajo total tarda lo mismo (un poco más), pero **las demás peticiones no se quedan congeladas** mientras tanto.

Si el cálculo es realmente pesado, la solución correcta es moverlo a otro hilo con **worker threads**.

## Tu turno

1. Ejecuta el servidor del principio y compruébalo tú mismo: abre `/lento` y `/` a la vez.
2. Añade el monitor de `monitorEventLoopDelay` y observa el pico al llamar a `/lento`.
3. Reemplaza el `while` por un cálculo dividido en trozos con `cederTurno` y comprueba que `/` responde al instante mientras `/lento` sigue trabajando.
4. Busca en un proyecto tuyo de Node funciones `Sync` dentro de rutas.

## Errores comunes

- **Pensar que `async` hace que el código no bloquee.** Una función `async` con un bucle de 5 segundos dentro **bloquea igual**: `async` solo ayuda con las **esperas**, no con el cálculo.
- **Usar funciones `Sync` dentro de las rutas.**
- **Validar textos largos de usuarios con regex peligrosas.**
- **Devolver JSON gigantes** en vez de paginar.
- **Llenar `process.nextTick` recursivamente**: como tiene prioridad sobre todo, puede impedir que el event loop avance.

## Para profundizar

- [No bloquees el event loop (guía oficial de Node.js, en inglés)](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [El event loop de Node.js (guía oficial, en inglés)](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)

En resumen: Node ejecuta tu JavaScript en **un solo hilo**, y es rapidísimo porque las **esperas** (red, base de datos, archivos) no lo ocupan. Pero cualquier **cálculo síncrono largo** (funciones `Sync`, JSON enormes, bucles pesados, regex peligrosas) **bloquea el event loop** y congela a todos los usuarios. Mídelo con **`monitorEventLoopDelay`**, usa siempre las versiones asíncronas, divide el trabajo con **`setImmediate`** y saca los cálculos pesados a **worker threads**.
