---
title: 'Streams en Node.js: procesa archivos gigantes sin quedarte sin memoria'
description: 'Por qué leer un archivo entero en memoria es un problema, qué es un stream, los cuatro tipos (readable, writable, transform, duplex), pipeline, backpressure, comprimir con zlib, leer un CSV línea a línea con readline y enviar archivos y respuestas grandes desde una API.'
date: 2026-11-27
series: backend
tags: [Node.js, Streams, Rendimiento, Avanzado]
draft: true
---

Tienes que procesar un archivo de logs de **4 GB**. Haces lo de siempre:

```js
import { readFile } from 'node:fs/promises'

const texto = await readFile('logs.txt', 'utf8')
const errores = texto.split('\n').filter((linea) => linea.includes('ERROR'))
```

Y Node revienta: `ERR_STRING_TOO_LONG` o `JavaScript heap out of memory`. `readFile` intenta meter **los 4 GB en memoria de golpe**. Aunque el archivo cupiera, tu servidor estaría usando gigas de RAM para una sola tarea, y con tres usuarios haciendo lo mismo se caería.

La solución es no leerlo todo de una vez, sino **por trozos**, procesando cada uno y olvidándolo. Eso es un **stream** (flujo).

## La idea: trozos en vez de todo

Piensa en ver una película **en streaming** frente a **descargarla entera**. Con la descarga, esperas a tener los 4 GB antes de ver nada. Con el streaming, empiezas a verla en segundos y tu dispositivo solo guarda unos pocos megas cada vez.

Un stream en Node es lo mismo: los datos llegan en **trozos** (*chunks*, normalmente de 64 KB) y los procesas a medida que llegan.

| | Leer entero (`readFile`) | Stream |
| --- | --- | --- |
| Memoria | Todo el archivo | Unos pocos KB a la vez |
| Empiezas a procesar | Cuando ha llegado todo | Con el primer trozo |
| Límite de tamaño | La RAM (y unos 512 MB para un texto) | Ninguno |

Ya usas streams sin saberlo: en un servidor de `node:http`, **`req` es un stream que lees** (el cuerpo de la petición) y **`res` es un stream en el que escribes** (la respuesta). `process.stdin` y `process.stdout` también lo son.

## Los cuatro tipos

| Tipo | Qué hace | Ejemplos |
| --- | --- | --- |
| **Readable** | Produce datos que tú lees | `fs.createReadStream`, `req`, `process.stdin` |
| **Writable** | Recibe datos que tú escribes | `fs.createWriteStream`, `res`, `process.stdout` |
| **Transform** | Recibe datos, los transforma y los devuelve | `zlib.createGzip()`, un parser de CSV |
| **Duplex** | Lee y escribe a la vez, de forma independiente | Un socket de red |

## Leer un archivo por trozos

```js
import { createReadStream } from 'node:fs'

const lectura = createReadStream('logs.txt', { encoding: 'utf8' })

let trozos = 0
for await (const trozo of lectura) {
  trozos++
}
console.log(`Leído en ${trozos} trozos`)
```

Un stream readable es un **iterable asíncrono**: se recorre con **`for await...of`** (lo viste en el post de generadores). Cada vuelta recibe un trozo, y la memoria usada se mantiene **baja y constante**, sea el archivo de 1 MB o de 100 GB.

### Línea a línea con `readline`

Los trozos se cortan por tamaño, no por líneas: una línea puede quedar partida entre dos trozos. Para procesar **línea a línea** (logs, CSV), usa `readline`:

```js
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

async function contarErrores(ruta) {
  const lineas = createInterface({ input: createReadStream(ruta), crlfDelay: Infinity })

  let total = 0
  let errores = 0
  for await (const linea of lineas) {
    total++
    if (linea.includes('ERROR')) errores++
  }
  return { total, errores }
}

console.log(await contarErrores('logs.txt'))
```

`crlfDelay: Infinity` trata bien los saltos de línea de Windows (`\r\n`). Así puedes recorrer un archivo de 4 GB usando unos pocos megas de memoria.

## Conectar streams: `pipeline`

La gracia de los streams es **encadenarlos**: la salida de uno es la entrada del siguiente, como tuberías. Comprimir un archivo de logs:

```js
import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'

await pipeline(
  createReadStream('logs.txt'),     // lee
  createGzip(),                     // comprime (Transform)
  createWriteStream('logs.txt.gz')  // escribe
)

console.log('✅ Comprimido')
```

Los datos fluyen trozo a trozo: se lee un trozo, se comprime, se escribe, y el siguiente. Nunca está el archivo entero en memoria.

**`pipeline`** de `node:stream/promises` es la forma correcta de conectarlos porque:

- Devuelve una **promesa**: puedes usar `await` y `try/catch`.
- Si **cualquier** stream falla, **cierra todos** y propaga el error. (El método antiguo `.pipe()` no lo hace, y deja streams abiertos y memoria sin liberar si algo falla.)

## Backpressure: cuando el que escribe va más rápido

¿Qué pasa si **lees** del disco a 500 MB/s pero **escribes** en una conexión de red lenta a 1 MB/s? Si no se controla, los datos leídos se acumularían en memoria esperando a ser enviados, y volverías al problema de partida.

Los streams lo resuelven con **backpressure** (contrapresión): cuando el destino se llena, le dice al origen "**espera**", y el origen deja de leer hasta que el destino le dice "**sigue**". Es automático cuando usas **`pipeline`** (o `for await` sobre un readable), y es la principal razón para no escribir los trozos a mano.

Si alguna vez escribes en un writable manualmente, respeta la señal: `escritura.write(trozo)` devuelve `false` cuando el búfer está lleno, y hay que esperar al evento `'drain'` antes de seguir.

## Tu propio Transform

Un stream que transforma datos al pasar. Por ejemplo, uno que filtra solo las líneas con errores:

```js
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createInterface } from 'node:readline'

await pipeline(
  createInterface({ input: createReadStream('logs.txt'), crlfDelay: Infinity }),
  async function* (lineas) {
    for await (const linea of lineas) {
      if (linea.includes('ERROR')) yield linea + '\n'
    }
  },
  createWriteStream('solo-errores.txt')
)
```

`pipeline` acepta **funciones generadoras asíncronas** como pasos intermedios: reciben los trozos del paso anterior y con `yield` entregan los suyos. Es la forma más sencilla de escribir un transform (para casos más complejos, existe la clase `Transform` de `node:stream`).

## Streams en una API

### Enviar un archivo grande

```js
import express from 'express'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'

const app = express()

app.get('/descargas/informe', async (req, res) => {
  const ruta = 'archivos/informe-anual.pdf'
  const { size } = await stat(ruta)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Length', size)
  res.setHeader('Content-Disposition', 'attachment; filename="informe-anual.pdf"')

  await pipeline(createReadStream(ruta), res)
})
```

El PDF se envía por trozos según los pide el navegador. Con `readFile` + `res.send`, un PDF de 500 MB ocuparía 500 MB de RAM **por cada descarga simultánea**. (Para archivos estáticos simples, `express.static` y `res.sendFile` ya usan streams por dentro.)

### Exportar muchos datos como CSV

¿Exportar 1 millón de pedidos? En vez de construir un texto gigante, ve escribiéndolos según los lees de la base de datos:

```js
app.get('/exportar/pedidos.csv', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="pedidos.csv"')

  async function* filasCsv() {
    yield 'id,cliente,total\n'
    for (let pagina = 0; ; pagina++) {
      const pedidos = await obtenerPedidos({ limite: 1000, saltar: pagina * 1000 }) // de tu repositorio
      if (pedidos.length === 0) break
      for (const p of pedidos) yield `${p.id},${p.cliente},${p.total}\n`
    }
  }

  await pipeline(filasCsv, res)
})
```

El usuario empieza a descargar al instante, y la memoria de tu servidor no crece con el tamaño de la exportación. (En un CSV real, escapa las comas y comillas de los textos.)

### Recibir una subida grande

`req` es un readable, así que puedes guardar lo que suba el usuario **directamente en un archivo**, sin cargarlo en memoria:

```js
import { createWriteStream } from 'node:fs'

app.put('/subidas/:nombre', async (req, res) => {
  const nombreSeguro = req.params.nombre.replace(/[^a-zA-Z0-9._-]/g, '_') // ¡nunca uses el nombre tal cual!
  await pipeline(req, createWriteStream(`subidas/${nombreSeguro}`))
  res.status(201).json({ ok: true })
})
```

Limpiar el nombre del archivo evita que alguien envíe `../../.env` y sobrescriba archivos de tu servidor (un ataque de **path traversal**). En producción, limita además el tamaño y el tipo de archivo, o súbelo directamente a un almacenamiento como S3.

## Web Streams

Los navegadores tienen su propia versión, los **Web Streams** (`ReadableStream`, `WritableStream`, `TransformStream`): es lo que devuelve `respuesta.body` en un `fetch`. Node también los soporta, y se convierten entre ambos mundos con `Readable.fromWeb()` y `Readable.toWeb()`. Por ejemplo, para descargar un archivo grande de internet directamente al disco:

```js
import { Readable } from 'node:stream'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

const respuesta = await fetch('https://ejemplo.com/archivo-grande.zip')
await pipeline(Readable.fromWeb(respuesta.body), createWriteStream('archivo-grande.zip'))
```

## Tu turno

1. Genera un archivo de logs de prueba con un millón de líneas (un bucle que escriba en un `createWriteStream`) y cuenta las líneas con `ERROR` usando `readline`. Mide la memoria con `process.memoryUsage().rss` antes y después, y compárala con hacerlo con `readFile`.
2. Comprime ese archivo con `pipeline` y `createGzip`, y descomprímelo con `createGunzip`.
3. Crea una ruta de Express que exporte 100.000 filas inventadas como CSV con un generador.
4. Escribe un transform que convierta cada línea de un CSV en un objeto JSON y lo escriba en un archivo `.jsonl` (un JSON por línea).

## Errores comunes

- **Usar `readFile` con archivos grandes** o de tamaño desconocido.
- **Conectar con `.pipe()`** y no manejar los errores: si algo falla, los streams quedan abiertos. Usa `pipeline`.
- **Acumular los trozos en un array** "para procesarlos al final": vuelves a tenerlo todo en memoria.
- **Ignorar el backpressure** al escribir a mano (no esperar a `'drain'`).
- **Asumir que cada trozo es una línea**: usa `readline` para eso.
- **Usar el nombre de archivo que envía el usuario** sin limpiarlo.

## Para profundizar

- [Streams en Node.js (documentación oficial, en inglés)](https://nodejs.org/api/stream.html)
- [Backpressure en los streams (guía oficial, en inglés)](https://nodejs.org/en/learn/modules/backpressuring-in-streams)

En resumen: un **stream** procesa los datos **por trozos** en lugar de cargarlos enteros, con una memoria **pequeña y constante** sea cual sea el tamaño. Hay streams **readable**, **writable**, **transform** y **duplex**; se recorren con **`for await`**, se leen línea a línea con **`readline`** y se conectan con **`pipeline`**, que gestiona los errores y el **backpressure**. En una API, úsalos para enviar archivos, exportar muchos datos y recibir subidas sin agotar la memoria del servidor.
