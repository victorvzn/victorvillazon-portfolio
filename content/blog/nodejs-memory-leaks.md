---
title: 'Fugas de memoria en Node.js: cómo detectarlas y arreglarlas'
description: 'Qué es una fuga de memoria, cómo gestiona V8 la memoria (heap, recolector de basura), las causas más comunes en un servidor (cachés sin límite, listeners, temporizadores, closures, variables globales), cómo detectarlas con process.memoryUsage y heap snapshots, y cómo evitarlas.'
date: 2026-11-27
series: backend
tags: [Node.js, Memoria, Rendimiento, Avanzado]
draft: true
---

Tu API funciona perfectamente. Pero en el panel de tu servidor ves que la memoria **sube y sube** durante el día: 200 MB por la mañana, 600 MB por la tarde, 1,5 GB por la noche... hasta que el proceso se cae con `JavaScript heap out of memory`, se reinicia, y vuelta a empezar. Y nadie sabe por qué.

Es una **fuga de memoria** (*memory leak*): tu programa guarda cosas que ya no necesita y **nunca las suelta**. En el frontend, una fuga se arregla sola cuando el usuario cierra la pestaña. En un servidor que lleva días encendido, se acumula hasta tumbarlo.

## Cómo gestiona la memoria Node.js

Node usa el motor **V8** (el de Chrome). Los objetos, arrays, textos y closures que creas viven en una zona de memoria llamada **heap** (montón). El **recolector de basura** (lo viste en el post de `WeakMap` y `WeakSet`) libera automáticamente los objetos a los que **ya no se puede llegar** desde tu código.

La clave: el recolector **no borra lo que ya no usas, sino lo que ya no se puede alcanzar**. Si una variable global, un array o un `Map` sigue apuntando a un objeto, ese objeto vive para siempre, aunque nadie vaya a usarlo nunca más.

**Una fuga de memoria en JavaScript es casi siempre eso: algo que sigue guardando referencias a objetos que ya no necesitas.**

## Las causas más comunes en un servidor

### 1. Cachés y colecciones que solo crecen

La más habitual, con diferencia:

```js
// ❌ Crece con cada usuario distinto, para siempre
const cacheUsuarios = new Map()

app.get('/api/usuarios/:id', async (req, res) => {
  if (!cacheUsuarios.has(req.params.id)) {
    cacheUsuarios.set(req.params.id, await repositorio.buscar(req.params.id))
  }
  res.json(cacheUsuarios.get(req.params.id))
})
```

Con 10 usuarios, nada. Con un millón de usuarios distintos a lo largo de una semana, un millón de entradas en memoria. Lo mismo pasa con un array de logs, un registro de "peticiones recientes", un contador por IP para limitar peticiones...

**Solución:** toda colección que crece con los datos de entrada necesita un **límite** o una **caducidad**. Usa una caché con tamaño máximo como **lru-cache** (borra las entradas menos usadas al llenarse), pon caducidad (el post de caché de este módulo) o guárdalo fuera del proceso, en Redis.

```js
import { LRUCache } from 'lru-cache'

const cacheUsuarios = new LRUCache({ max: 1000, ttl: 5 * 60_000 }) // máximo 1000 entradas, 5 minutos
```

### 2. Listeners que se añaden y nunca se quitan

```js
import { EventEmitter } from 'node:events'

const eventos = new EventEmitter()

app.get('/api/pedidos/:id/esperar', (req, res) => {
  // ❌ Cada petición añade un listener que nunca se quita
  eventos.on('pedido-actualizado', (pedido) => {
    if (pedido.id === req.params.id) res.json(pedido)
  })
})
```

Cada listener guarda en su closure el `req` y el `res` de su petición, así que **ninguna** de esas peticiones se libera nunca. Node incluso te avisa en la consola:

```bash
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 pedido-actualizado listeners added.
```

**No ignores ese aviso.** La solución es **quitar el listener** cuando ya no hace falta:

```js
app.get('/api/pedidos/:id/esperar', (req, res) => {
  const alActualizar = (pedido) => {
    if (pedido.id !== req.params.id) return
    eventos.off('pedido-actualizado', alActualizar)
    res.json(pedido)
  }

  eventos.on('pedido-actualizado', alActualizar)
  req.on('close', () => eventos.off('pedido-actualizado', alActualizar)) // si el cliente se va antes
})
```

Lo mismo en el frontend con `addEventListener` sin su `removeEventListener` (lo viste en la limpieza de `useEffect` en React y en `onUnmounted` en Vue).

### 3. Temporizadores que nunca se paran

```js
// ❌ Un intervalo por conexión que nunca se limpia
app.get('/api/reloj', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  setInterval(() => res.write(`data: ${new Date().toISOString()}\n\n`), 1000)
})

// ✅ Se para cuando el cliente se desconecta
app.get('/api/reloj', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  const id = setInterval(() => res.write(`data: ${new Date().toISOString()}\n\n`), 1000)
  req.on('close', () => clearInterval(id))
})
```

Un `setInterval` activo mantiene vivo todo lo que usa su función: aquí, el `res` de cada conexión.

### 4. Closures que retienen más de lo que parece

Una función guarda acceso a las variables de su entorno (los **closures**, con su propio post). Si guardas esa función mucho tiempo, también guardas esas variables:

```js
const manejadores = []

function procesarArchivo(contenidoEnorme) {   // supongamos 100 MB
  const resumen = contenidoEnorme.slice(0, 100)
  manejadores.push(() => console.log(resumen)) // la función vive en un array global...
}
```

Aquí la función solo usa `resumen`, y V8 suele ser lo bastante listo para no retener `contenidoEnorme`. Pero en casos más complejos (varias funciones creadas en el mismo ámbito que comparten variables) puede retenerlo todo. La regla práctica: **no guardes funciones en estructuras globales** si no hace falta, y copia a variables pequeñas lo que la función necesita.

### 5. Variables globales accidentales

```js
function contarVisita() {
  visitas = (visitas ?? 0) + 1 // sin let/const: en código sin "strict mode", crea una global
}
```

En los módulos ES (`"type": "module"`), el modo estricto está activado y esto da error, que es justo lo que quieres. Otra razón para usar módulos.

## Cómo detectarlas

### Paso 1: confirmar que hay una fuga

No toda subida de memoria es una fuga. Es normal que la memoria suba al arrancar y con picos de tráfico. Una fuga es cuando **sube sin parar** y **nunca vuelve a bajar**, aunque el tráfico baje.

`process.memoryUsage()` te da la foto en cada momento:

```js
setInterval(() => {
  const { rss, heapUsed, heapTotal } = process.memoryUsage()
  const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
  console.log(`RSS: ${mb(rss)} · heap usado: ${mb(heapUsed)} / ${mb(heapTotal)}`)
}, 10_000)
```

- **`rss`**: toda la memoria que ocupa el proceso en el sistema.
- **`heapUsed`**: la memoria que ocupan tus objetos de JavaScript. **Esta es la que crece con una fuga.**

Lanza carga constante con autocannon (el post de medir el rendimiento) durante unos minutos. Si `heapUsed` dibuja **dientes de sierra** (sube, el recolector actúa, baja), todo va bien. Si los dientes de sierra **van subiendo** cada vez más alto, hay una fuga.

### Paso 2: encontrarla con heap snapshots

Una **captura del heap** (*heap snapshot*) es una foto de **todos los objetos** que hay en memoria en un momento, con quién apunta a quién.

1. Arranca el servidor con `node --inspect server.js` y abre `chrome://inspect` en Chrome → **inspect**.
2. Ve a la pestaña **Memory** y haz una **captura** (*Take snapshot*).
3. Lanza carga durante un rato (miles de peticiones).
4. Haz una **segunda captura**.
5. Selecciona la segunda y cambia la vista a **Comparison** (comparar con la primera).

Verás qué tipos de objetos **se han creado y no se han liberado** entre las dos capturas. Ordena por **# Delta** o **Size Delta**: si hay 10.000 objetos `IncomingMessage` (peticiones) o 50.000 entradas de un `Map` que deberían haberse liberado, ahí está.

Al hacer clic en uno de esos objetos, el panel **Retainers** muestra **la cadena de referencias que lo mantiene vivo**: por ejemplo, `Map` → `cacheUsuarios` → `(global)`. Esa cadena te lleva directamente a la línea de código culpable.

> También puedes generar capturas sin las DevTools: `node --heapsnapshot-signal=SIGUSR2 server.js` crea una cada vez que envías esa señal al proceso (en Linux y macOS), o desde el código con `v8.writeHeapSnapshot()`. Ojo: hacer una captura **congela el proceso** unos segundos y puede ocupar tanto como el propio heap. En producción, con cuidado.

### Paso 3: arreglar y comprobar

Arregla la causa y repite la prueba de carga: los dientes de sierra deberían quedarse **planos**, a la misma altura.

## El límite de memoria de Node

V8 tiene un **límite** para el heap, que depende de la versión y de la memoria del sistema (o del contenedor). Si lo supera, el proceso se cae con `FATAL ERROR: ... JavaScript heap out of memory`.

Se puede subir con una opción:

```bash
node --max-old-space-size=2048 server.js   # hasta 2 GB de heap
```

Pero **subir el límite no arregla una fuga**: solo hace que tarde más en caerse. Es útil cuando de verdad necesitas más memoria (un proceso que maneja muchos datos), no como parche.

## Buenas prácticas para no tenerlas

- **Toda colección que crece con los datos de entrada, con límite o caducidad.**
- **Cada `on` con su `off`**, cada `setInterval` con su `clearInterval`, cada conexión que abres, cerrada. Escucha `req.on('close')` para limpiar lo que dependa de una conexión.
- **Lee los avisos de Node** (`MaxListenersExceededWarning`) en lugar de silenciarlos.
- **Usa `WeakMap`** para asociar datos a objetos que tienen su propia vida (el post de `WeakMap` y `WeakSet`).
- **Procesa los datos grandes con streams** en vez de cargarlos enteros (el post de streams).
- **Vigila la memoria en producción** con tu plataforma o tu herramienta de monitorización, y crea una alerta si crece sin parar.

## Tu turno

1. Crea una API con la caché sin límite del ejemplo 1 (que el "repositorio" devuelva un objeto inventado), lánzale con un script muchas peticiones a ids aleatorios (`/api/usuarios/${Math.random()}`) y observa `heapUsed`.
2. Haz dos heap snapshots, compáralos y encuentra el `Map` culpable en el panel Retainers.
3. Arréglala con `LRUCache` y comprueba que la memoria se estabiliza.
4. Reproduce la fuga de los listeners y lee el aviso `MaxListenersExceededWarning`. Arréglala.

## Errores comunes

- **Confundir uso de memoria alto con una fuga.** Una fuga es crecimiento **continuo** que no baja.
- **Subir `--max-old-space-size`** como solución.
- **Silenciar `MaxListenersExceededWarning`** con `setMaxListeners(0)`.
- **Cachés sin límite** por usuario, por búsqueda o por IP.
- **No limpiar al desconectarse el cliente** (intervalos, listeners, suscripciones).
- **Hacer heap snapshots en producción sin cuidado**: congelan el proceso.

## Para profundizar

- [Diagnóstico de memoria en Node.js (guía oficial, en inglés)](https://nodejs.org/en/learn/diagnostics/memory)
- [Gestión de memoria en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Memory_management)

En resumen: el recolector de basura libera lo que **ya no se puede alcanzar**, no lo que ya no usas. Una **fuga de memoria** es algo que sigue guardando referencias: **cachés sin límite**, **listeners** y **temporizadores** que nunca se quitan, closures guardados en globales. Confírmala con **`process.memoryUsage()`** bajo carga (dientes de sierra que suben), encuéntrala comparando **heap snapshots** en las DevTools y siguiendo los **Retainers**, y evítala con límites, limpieza y streams. Subir el límite de memoria no la arregla.
