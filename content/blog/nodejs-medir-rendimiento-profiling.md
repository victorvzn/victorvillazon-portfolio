---
title: 'Medir el rendimiento en Node.js: benchmarks, profiling y pruebas de carga'
description: 'Cómo encontrar lo que hace lenta tu app de Node antes de optimizar: medir con performance.now y console.time, pruebas de carga con autocannon, perfilar la CPU con --cpu-prof y las DevTools de Chrome, leer un flame graph y métricas como latencia p99 y throughput.'
date: 2026-11-27
series: backend
tags: [Node.js, Rendimiento, Profiling, Avanzado]
draft: true
---

"La API va lenta." ¿Qué ruta? ¿Lenta cuánto? ¿Siempre o con mucho tráfico? ¿Es el código, la base de datos o la red? Sin datos, optimizar es **adivinar**: cambias cosas al azar, a veces empeoras otras, y no sabes si sirvió de algo.

La regla de oro del rendimiento, en Node y en cualquier lenguaje: **primero mide, después optimiza, y vuelve a medir**. Este post te enseña las herramientas para hacerlo.

## Las métricas que importan

Antes de las herramientas, el vocabulario. Para una API:

- **Latencia**: cuánto tarda en responder una petición. Se mide en milisegundos.
- **Throughput** (rendimiento): cuántas peticiones por segundo es capaz de atender.
- **Percentiles**: la **media** engaña. Si 99 peticiones tardan 10 ms y una tarda 5 segundos, la media es 60 ms y "parece bien", pero un usuario de cada cien espera 5 segundos. Por eso se miran los percentiles:
  - **p50** (la mediana): la mitad de las peticiones tardan menos que esto.
  - **p99**: el 99% tardan menos que esto. Muestra los **peores casos**, que son los que más se notan.
- **Uso de CPU y de memoria** del proceso.

## Nivel 1: medir un trozo de código

Para saber cuánto tarda una función concreta:

```js
console.time('ordenar')
const ordenados = datos.toSorted((a, b) => a.precio - b.precio)
console.timeEnd('ordenar')   // ordenar: 12.345ms
```

O con más precisión, con `performance.now()` (el mismo que en el navegador):

```js
const inicio = performance.now()
await procesarPedidos()
console.log(`Tardó ${(performance.now() - inicio).toFixed(2)} ms`)
```

### Un microbenchmark honesto

Para comparar dos formas de hacer algo, una sola medición no sirve: la primera ejecución es más lenta (el motor V8 todavía no ha optimizado el código), y hay ruido de otros procesos. Repite muchas veces y descarta el "calentamiento":

```js
function medir(nombre, funcion, repeticiones = 10_000) {
  for (let i = 0; i < 1000; i++) funcion() // calentamiento: deja que V8 optimice
  const inicio = performance.now()
  for (let i = 0; i < repeticiones; i++) funcion()
  const porLlamada = (performance.now() - inicio) / repeticiones
  console.log(`${nombre}: ${(porLlamada * 1000).toFixed(2)} µs por llamada`)
}

const productos = Array.from({ length: 1000 }, (_, i) => ({ id: i, precio: Math.random() * 100 }))

medir('find', () => productos.find((p) => p.id === 999))
const porId = new Map(productos.map((p) => [p.id, p]))
medir('Map.get', () => porId.get(999))
```

Este ejemplo muestra una optimización real: buscar en un array con `find` recorre los elementos uno a uno; un `Map` (lo viste en el post de `Map` y `Set`) encuentra el elemento al instante. Con búsquedas repetidas en listas grandes, la diferencia es enorme.

Para benchmarks serios hay librerías como **tinybench** o **mitata**, que hacen las repeticiones y la estadística por ti. Y Vitest trae `bench` para escribirlos como tests.

> ⚠️ **No optimices microsegundos sin motivo.** Que `for` sea un 10% más rápido que `forEach` no importa si la ruta tarda 200 ms esperando a la base de datos. Mide primero **dónde** se va el tiempo de verdad.

## Nivel 2: pruebas de carga

Una ruta puede tardar 5 ms con una petición y 2 segundos con 500 a la vez. Para saber cómo se comporta tu API **bajo presión**, se hace una **prueba de carga**: lanzar muchas peticiones simultáneas y medir.

**autocannon** es una herramienta de Node para esto:

```bash
npx autocannon -c 100 -d 10 http://localhost:3000/api/productos
```

- **`-c 100`**: 100 conexiones simultáneas.
- **`-d 10`**: durante 10 segundos.

```bash
┌─────────┬──────┬──────┬───────┬───────┬─────────┬─────────┬───────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%   │ Avg     │ Stdev   │ Max   │
├─────────┼──────┼──────┼───────┼───────┼─────────┼─────────┼───────┤
│ Latency │ 8 ms │ 11 ms│ 25 ms │ 31 ms │ 12.1 ms │ 4.8 ms  │ 89 ms │
└─────────┴──────┴──────┴───────┴───────┴─────────┴─────────┴───────┘
┌───────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 50%     │ Avg     │
├───────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 7 200   │ 8 150   │ 8 080   │
└───────────┴─────────┴─────────┴─────────┘
```

(Los números son de ejemplo: dependen de tu ordenador y de tu código.)

Lo que buscas: la **latencia p99** y las **peticiones por segundo** (Req/Sec). Guarda estos números como **línea base**: después de cada optimización, repite la prueba y compara.

Reglas para que la prueba valga:

- Ejecútala contra el servidor en **modo producción** (`NODE_ENV=production`, sin `--watch`).
- Si puedes, lanza la carga **desde otra máquina**: autocannon también consume CPU.
- **Nunca** hagas pruebas de carga contra servidores que no son tuyos, ni contra producción sin avisar: es indistinguible de un ataque.

Para escenarios más realistas (usuarios que inician sesión, navegan y compran) se usan herramientas como **k6** o **Artillery**.

## Nivel 3: perfilar la CPU

La prueba de carga te dice **que** algo va lento. El **profiler** te dice **dónde**: qué funciones consumen el tiempo de CPU.

### Con `--cpu-prof`

```bash
node --cpu-prof server.js
```

Mientras el servidor corre, lánzale carga con autocannon. Al pararlo (`Ctrl + C`), Node genera un archivo `.cpuprofile` en la carpeta.

### Con las DevTools de Chrome

```bash
node --inspect server.js
```

1. Abre Chrome y entra en `chrome://inspect`.
2. En **Remote Target**, pulsa **inspect** junto a tu proceso de Node.
3. Ve a la pestaña **Performance** (o **Profiler**, según la versión), pulsa grabar, lanza la carga y para.

También puedes arrastrar ahí el archivo `.cpuprofile` de antes. Son las mismas DevTools que usas para el frontend (lo viste en su post), ahora conectadas a tu servidor.

### Leer un flame graph

El profiler muestra un **flame graph** (gráfico de llamas):

- Cada **barra** es una función.
- El **ancho** es el tiempo que la CPU pasó en ella (incluyendo las funciones que llamó). **Busca las barras más anchas.**
- Las barras de **debajo** son las funciones que llamaron a las de **encima** (la pila de llamadas).
- Una barra ancha **sin nada encima** es una función que gasta tiempo **ella misma**: ahí está el trabajo pesado.

Lo habitual es descubrir sorpresas: un `JSON.stringify` de un objeto enorme en cada petición, una regex que se compila en cada llamada, una librería de logs que formatea demasiado, una búsqueda en un array dentro de un bucle...

> Recuerda que el profiler de CPU mide **cálculo**. Si tu ruta es lenta porque **espera** a la base de datos, en el flame graph casi no se verá. Para eso, mide los tiempos de cada consulta.

## Nivel 4: medir dentro de tu API

En producción no puedes conectar las DevTools, pero sí medir y registrar. Un middleware que registra la duración de cada petición (como el logger del post de middlewares de Express, pero más preciso):

```js
app.use((req, res, next) => {
  const inicio = process.hrtime.bigint()

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6
    if (ms > 500) {
      console.warn(`🐢 Petición lenta: ${req.method} ${req.originalUrl} → ${res.statusCode} en ${ms.toFixed(1)} ms`)
    }
  })

  next()
})
```

Y la cabecera estándar **`Server-Timing`** te deja ver en la pestaña **Network** del navegador cuánto tardó cada parte en el servidor:

```js
const inicioDb = performance.now()
const productos = await repositorio.listar()
const msDb = performance.now() - inicioDb

res.setHeader('Server-Timing', `db;dur=${msDb.toFixed(1)}`)
res.json(productos)
```

En aplicaciones grandes, todo esto lo hacen herramientas de **observabilidad** como OpenTelemetry, que miden cada petición de principio a fin, también a través de varios servicios.

## El proceso completo

1. **Define el problema** con números: "`/api/buscar` tiene un p99 de 1,8 s con 50 usuarios".
2. **Mide la línea base** con una prueba de carga.
3. **Perfila** para encontrar dónde se va el tiempo.
4. **Cambia una sola cosa.**
5. **Vuelve a medir** con la misma prueba. ¿Mejoró? Quédatelo. ¿No? Descártalo.
6. Repite hasta llegar al objetivo. Y **para**: el código ultraoptimizado suele ser más difícil de leer.

## Tu turno

1. Con el microbenchmark de arriba, compara `find` en un array de 100.000 elementos con `Map.get`.
2. Crea una API de Express con una ruta que ordene 50.000 productos en cada petición. Mide su p99 con autocannon.
3. Perfílala con `--cpu-prof`, abre el perfil en Chrome y encuentra la función que más tiempo consume.
4. Optimízala (por ejemplo, ordenando una sola vez al arrancar y guardando el resultado) y vuelve a medir.

## Errores comunes

- **Optimizar sin medir**, basándote en intuiciones.
- **Mirar solo la media** e ignorar el p99.
- **Medir en modo desarrollo** o con `--watch`.
- **Microbenchmarks sin calentamiento** o con una sola ejecución.
- **Cambiar varias cosas a la vez**: no sabrás cuál funcionó.
- **Optimizar el cálculo cuando el problema es la espera** (la base de datos, una API externa). Ahí ayudan los índices, la caché o hacer peticiones en paralelo.

## Para profundizar

- [Perfilar aplicaciones de Node.js (guía oficial, en inglés)](https://nodejs.org/en/learn/getting-started/profiling)
- [autocannon en GitHub (en inglés)](https://github.com/mcollina/autocannon)

En resumen: **primero mide**. Para trozos de código, **`performance.now()`** y microbenchmarks con calentamiento; para la API bajo presión, **pruebas de carga** con **autocannon**, mirando el **p99** y las **peticiones por segundo**; y para saber dónde se va la CPU, el **profiler** (`--cpu-prof` o `--inspect` con las DevTools de Chrome) y su **flame graph**. Cambia una cosa cada vez y vuelve a medir.
