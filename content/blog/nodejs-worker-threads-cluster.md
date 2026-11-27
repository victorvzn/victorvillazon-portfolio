---
title: 'Node.js en varios núcleos: worker threads, cluster y PM2'
description: 'Cómo usar todos los núcleos de la CPU con Node.js: worker threads para sacar cálculos pesados del hilo principal, comunicarse con postMessage, un pool de workers, el módulo cluster para tener varios procesos de tu servidor, PM2 en producción y cuándo usar cada uno.'
date: 2026-11-27
series: backend
tags: [Node.js, Rendimiento, Worker threads, Cluster, Avanzado]
draft: true
---

Tu ordenador probablemente tiene 8, 12 o 16 núcleos. Tu servidor en la nube, quizá 4. Pero un proceso de Node ejecuta tu JavaScript en **un solo hilo**, así que, por defecto, **usa un solo núcleo**: los demás miran.

En el post del event loop viste las dos consecuencias:

1. Un **cálculo pesado** bloquea a todos los usuarios.
2. Aunque no bloquees nada, un solo núcleo tiene un límite de peticiones por segundo.

Node tiene una herramienta para cada problema: **worker threads** para el primero y **cluster** para el segundo.

## Worker threads: cálculos pesados en otro hilo

Un **worker thread** es un hilo adicional que ejecuta **otro archivo de JavaScript** en paralelo, con su propio event loop. Mientras el worker calcula, el hilo principal sigue atendiendo peticiones.

Es la misma idea que los **Web Workers** del navegador.

### Tu primer worker

Un cálculo deliberadamente lento: contar los números primos hasta un límite.

```js
// primos.js: lo que ejecutará el worker
import { parentPort, workerData } from 'node:worker_threads'

function contarPrimos(limite) {
  let total = 0
  for (let n = 2; n < limite; n++) {
    let esPrimo = true
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { esPrimo = false; break }
    }
    if (esPrimo) total++
  }
  return total
}

parentPort.postMessage(contarPrimos(workerData.limite))
```

```js
// main.js
import { Worker } from 'node:worker_threads'

function contarPrimosEnWorker(limite) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./primos.js', import.meta.url), { workerData: { limite } })
    worker.once('message', resolve)
    worker.once('error', reject)
    worker.once('exit', (codigo) => {
      if (codigo !== 0) reject(new Error(`El worker terminó con el código ${codigo}`))
    })
  })
}

const intervalo = setInterval(() => console.log('💓 El hilo principal sigue vivo'), 500)

console.time('primos')
const total = await contarPrimosEnWorker(10_000_000)
console.timeEnd('primos')
console.log(`Hay ${total} primos`)
clearInterval(intervalo)
```

Ejecútalo con `node main.js`: mientras el worker calcula, verás el 💓 cada medio segundo. El hilo principal **no se bloquea**. Si llamaras a `contarPrimos` directamente en `main.js`, no verías ningún latido hasta el final.

- **`new Worker(archivo, { workerData })`** arranca el worker y le pasa datos iniciales.
- **`parentPort.postMessage(valor)`** envía un mensaje del worker al hilo principal.
- **`worker.on('message')`** lo recibe. Lo envolvemos en una **promesa** para poder usar `await`.

### Cómo se comunican

Los workers **no comparten variables** con el hilo principal: cada uno tiene su propia memoria. Se comunican **enviando mensajes**, y los datos se **copian** (con el mismo algoritmo que `structuredClone`, del post de copiar objetos).

- Copiar datos grandes cuesta tiempo. Para arrays de bytes enormes se pueden **transferir** (`postMessage(datos, [datos.buffer])`): se mueven sin copiar, pero el emisor deja de tener acceso.
- Para compartir memoria de verdad existen `SharedArrayBuffer` y `Atomics`, una herramienta muy avanzada que rara vez necesitarás.

### Un pool de workers

Arrancar un worker cuesta unas decenas de milisegundos y algo de memoria. En una API, crear uno **por petición** es un desperdicio. Lo correcto es un **pool**: unos pocos workers (tantos como núcleos) creados al arrancar, que se van repartiendo las tareas.

Escribir un pool a mano es delicado (colas, errores, workers que mueren...). La librería **Piscina** lo resuelve:

```bash
npm install piscina
```

```js
// tareas/primos.js
export default function contarPrimos({ limite }) {
  let total = 0
  for (let n = 2; n < limite; n++) {
    let esPrimo = true
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { esPrimo = false; break }
    }
    if (esPrimo) total++
  }
  return total
}
```

```js
// server.js
import express from 'express'
import { Piscina } from 'piscina'

const pool = new Piscina({ filename: new URL('./tareas/primos.js', import.meta.url).href })
const app = express()

app.get('/primos/:limite', async (req, res) => {
  const limite = Math.min(Number(req.params.limite) || 0, 50_000_000) // pon siempre un límite
  const total = await pool.run({ limite })
  res.json({ limite, total })
})

app.get('/salud', (req, res) => res.json({ ok: true })) // responde al instante aunque haya cálculos en marcha

app.listen(3000)
```

Ahora, aunque diez usuarios pidan cálculos pesados a la vez, se reparten entre los núcleos y `/salud` sigue respondiendo al momento.

### ¿Cuándo usar worker threads?

- ✅ **Cálculo intensivo de CPU**: procesar imágenes, generar PDFs, comprimir, parsear archivos enormes, criptografía pesada, algoritmos complejos.
- ❌ **Esperas** (consultas a la base de datos, peticiones HTTP, archivos): Node ya las hace sin bloquear. Meterlas en un worker no aporta nada.

## Cluster: varios procesos de tu servidor

Los workers resuelven los cálculos pesados. Pero ¿y si simplemente tienes **mucho tráfico** y un núcleo no da abasto?

El módulo **`cluster`** arranca **varias copias de tu servidor** (procesos), una por núcleo, que **comparten el mismo puerto**. Las conexiones se reparten entre ellas.

```js
// cluster.js
import cluster from 'node:cluster'
import { availableParallelism } from 'node:os'
import process from 'node:process'

if (cluster.isPrimary) {
  const nucleos = availableParallelism()
  console.log(`Proceso principal ${process.pid}: arrancando ${nucleos} copias`)

  for (let i = 0; i < nucleos; i++) cluster.fork()

  cluster.on('exit', (worker, codigo) => {
    console.log(`La copia ${worker.process.pid} murió (código ${codigo}). Arranco otra.`)
    cluster.fork()
  })
} else {
  await import('./server.js') // cada copia ejecuta tu servidor normal
  console.log(`Copia ${process.pid} lista`)
}
```

```bash
node cluster.js
```

- **`cluster.isPrimary`**: el proceso principal no atiende peticiones; solo crea y vigila las copias.
- **`cluster.fork()`** crea una copia (un proceso hijo) que vuelve a ejecutar el mismo archivo, ahora con `isPrimary` en `false`.
- **`availableParallelism()`** dice cuántos núcleos puedes usar.
- Si una copia **se cae** (por un error no capturado), el principal arranca otra. Tu API sigue funcionando.

### Lo que cambia al tener varios procesos

Cada copia es un proceso **independiente**, con su propia memoria. Eso tiene consecuencias:

- **Nada de estado en memoria compartido.** Si guardas las sesiones o una caché en una variable, cada copia tiene la suya: un usuario puede iniciar sesión en una copia y "no existir" en la siguiente petición. El estado compartido va a una **base de datos** o a **Redis**.
- **Tareas programadas**: un `setInterval` que envía un informe cada día se ejecutaría **una vez por copia**. Ejecútalo solo en una (o fuera del servidor).
- **WebSockets**: necesitan configuración extra para que los mensajes lleguen a todos los procesos.

Diseñar así tu API (sin estado en memoria) se llama ser **stateless**, y además es lo que te permite escalar a **varios servidores** más adelante.

## PM2: cluster en producción, sin código

En producción casi nadie escribe el `cluster.js` a mano. **PM2** es un gestor de procesos que hace todo eso (y más) con un comando:

```bash
npm install --global pm2

pm2 start server.js -i max --name mi-api   # una copia por núcleo
pm2 list                                   # estado de cada copia
pm2 logs mi-api                            # los logs de todas
pm2 monit                                  # CPU y memoria en vivo
pm2 reload mi-api                          # reinicia las copias una a una, sin cortar el servicio
```

`pm2 reload` es especialmente útil: al desplegar una versión nueva, reinicia las copias **de una en una**, así siempre hay alguna atendiendo. A eso se le llama **despliegue sin caída** (*zero-downtime*).

### ¿Y con Docker o en la nube?

Si despliegas con **Docker** y un orquestador (Kubernetes, AWS ECS, Fly.io, Render...), lo habitual es lo contrario: **un proceso de Node por contenedor** y **varios contenedores**, que el orquestador reparte, vigila y reinicia. El balanceador de carga de la plataforma hace el papel del cluster. Así es más fácil escalar y cada contenedor queda pequeño y simple.

## Resumen: ¿qué uso?

| Problema | Solución |
| --- | --- |
| Un cálculo pesado congela la API | **Worker threads** (con un pool como Piscina) |
| Mucho tráfico en un servidor con varios núcleos | **Cluster** o **PM2** (`-i max`) |
| Mucho tráfico en la nube con contenedores | **Varios contenedores** con un balanceador |
| La API va lenta esperando a la base de datos | Nada de lo anterior: índices, caché, consultas en paralelo |

## Tu turno

1. Ejecuta el ejemplo de los primos con y sin worker y observa los latidos del hilo principal.
2. Crea la API con Piscina y lanza con autocannon (del post de medir el rendimiento) muchas peticiones a `/primos/5000000` mientras haces peticiones a `/salud`.
3. Arranca tu API con `cluster.js` y comprueba con `process.pid` en la respuesta que distintas peticiones las atienden distintos procesos.
4. Guarda un contador de visitas en una variable y comprueba que, con cluster, cada proceso lleva su propia cuenta. ¿Cómo lo arreglarías?

## Errores comunes

- **Usar workers para operaciones de espera** (base de datos, `fetch`): no aporta nada.
- **Crear un worker por petición** en lugar de usar un pool.
- **Enviar objetos enormes** entre el worker y el hilo principal: se copian, y eso también cuesta.
- **Guardar estado en memoria** con cluster o con varios contenedores.
- **Crear más procesos que núcleos**: compiten entre ellos y van más lentos.
- **No poner límites** a lo que el usuario puede pedir calcular: `/primos/999999999999` es un ataque gratis.

## Para profundizar

- [Worker threads (documentación oficial, en inglés)](https://nodejs.org/api/worker_threads.html)
- [Cluster (documentación oficial, en inglés)](https://nodejs.org/api/cluster.html)

En resumen: Node ejecuta tu JavaScript en un solo hilo y, por defecto, usa **un solo núcleo**. Los **worker threads** ejecutan **cálculos pesados** en otros hilos, comunicándose con **mensajes**; en una API, usa un **pool** como **Piscina**. El módulo **cluster** (o **PM2** con `-i max`) arranca **una copia del servidor por núcleo** para atender más tráfico, siempre que tu API sea **stateless**. En la nube con contenedores, el equivalente es tener **varios contenedores** detrás de un balanceador.
