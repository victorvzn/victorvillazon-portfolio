---
title: 'Programación asíncrona en Python con asyncio y async/await'
description: 'Qué es la asincronía y cuándo ayuda, corrutinas con async def y await, el event loop de asyncio, ejecutar tareas en paralelo con gather y TaskGroup, límites de tiempo, semáforos y peticiones HTTP concurrentes con httpx.'
date: 2026-11-27
series: python
tags: [Python, asyncio, Asincronía, Avanzado]
draft: true
---

Tienes que descargar los datos de 50 productos de una API. Cada petición tarda medio segundo. Con un bucle normal, tu programa pide uno, **espera** medio segundo sin hacer nada, pide el siguiente, espera... En total, **25 segundos**, y el 99% del tiempo el programa está esperando a la red.

¿Y si lanzas las 50 peticiones **a la vez** y esperas a que lleguen todas? Medio segundo. Eso es la **programación asíncrona**, y en Python se hace con **`asyncio`** y las palabras `async` y `await`. Si vienes de JavaScript, te va a resultar muy familiar.

## Esperar sin bloquear

La clave: la asincronía sirve para tareas que **esperan algo de fuera** (*I/O*, entrada/salida): peticiones HTTP, bases de datos, leer archivos, temporizadores. Mientras una tarea espera, el programa puede avanzar con otra.

No sirve para acelerar cálculos pesados (multiplicar matrices, procesar imágenes): esas tareas no esperan, trabajan todo el rato. Para eso se usan procesos (`multiprocessing`), que quedan fuera de este post.

## Corrutinas: `async def` y `await`

```python
import asyncio

async def preparar_cafe():
    print("☕ Empiezo el café")
    await asyncio.sleep(2)        # espera 2 segundos SIN bloquear
    print("☕ Café listo")
    return "café"

asyncio.run(preparar_cafe())
```

- **`async def`** define una **corrutina**: una función que puede pausarse.
- **`await`** pausa la corrutina hasta que termine lo que espera, y **deja que otras avancen mientras tanto**.
- **`asyncio.sleep(2)`** es la versión asíncrona de `time.sleep(2)`. Ojo: `time.sleep` **bloquea** todo el programa; dentro de código asíncrono, usa siempre `asyncio.sleep`.
- **`asyncio.run(...)`** arranca el **event loop** (el bucle de eventos, la misma idea que el event loop de JavaScript, con su propio post en esa serie) y ejecuta la corrutina principal.

Si llamas a una corrutina **sin** `await`, no se ejecuta: solo obtienes un objeto corrutina (como una promesa sin esperar):

```python
preparar_cafe()   # ⚠️ RuntimeWarning: coroutine 'preparar_cafe' was never awaited
```

| JavaScript | Python |
| --- | --- |
| `async function f() {}` | `async def f():` |
| `await promesa` | `await corrutina()` |
| `new Promise(r => setTimeout(r, 1000))` | `await asyncio.sleep(1)` |
| `Promise.all([...])` | `asyncio.gather(...)` |
| El event loop ya está en marcha | Lo arrancas con `asyncio.run()` |

## Varias tareas a la vez: `gather`

Preparar un desayuno: café (2 s), tostadas (3 s) y huevos (4 s).

```python
import asyncio
import time

async def preparar(plato, segundos):
    print(f"▶ Empiezo {plato}")
    await asyncio.sleep(segundos)
    print(f"✔ {plato} listo")
    return plato

async def main():
    inicio = time.perf_counter()

    resultados = await asyncio.gather(
        preparar("café", 2),
        preparar("tostadas", 3),
        preparar("huevos", 4),
    )

    print(resultados)
    print(f"Tardé {time.perf_counter() - inicio:.1f} s")

asyncio.run(main())
```

```bash
▶ Empiezo café
▶ Empiezo tostadas
▶ Empiezo huevos
✔ café listo
✔ tostadas listo
✔ huevos listo
['café', 'tostadas', 'huevos']
Tardé 4.0 s
```

**4 segundos**, no 9. Las tres esperas se solapan. **`asyncio.gather`** ejecuta varias corrutinas **concurrentemente** y devuelve sus resultados **en el mismo orden** en que las pasaste (como `Promise.all`, del post de `Promise.all`, `allSettled` y `race`).

Si una falla, `gather` lanza ese error. Con `gather(..., return_exceptions=True)`, en cambio, devuelve los errores en la lista junto a los resultados (como `Promise.allSettled`).

## `TaskGroup`: la forma moderna y segura

Desde Python 3.11, la forma recomendada de lanzar varias tareas es un **`TaskGroup`**:

```python
async def main():
    async with asyncio.TaskGroup() as grupo:
        cafe = grupo.create_task(preparar("café", 2))
        tostadas = grupo.create_task(preparar("tostadas", 3))

    # Al salir del "async with", todas las tareas han terminado
    print(cafe.result(), tostadas.result())

asyncio.run(main())
```

Su ventaja: si **una** tarea falla, el grupo **cancela las demás** automáticamente y te da el error. Con `gather`, las otras tareas seguirían ejecutándose en segundo plano. Es lo que se llama **concurrencia estructurada**: ninguna tarea queda "suelta".

## Límite de tiempo: `timeout`

```python
async def main():
    try:
        async with asyncio.timeout(2):
            await preparar("huevos", 4)
    except TimeoutError:
        print("⏰ Tardó demasiado, lo cancelo")

asyncio.run(main())
```

Si lo de dentro no termina en 2 segundos, se cancela y se lanza un `TimeoutError`. Imprescindible con peticiones a APIs externas: nunca esperes para siempre.

## El caso real: muchas peticiones HTTP

La librería `requests` (del post de pip) **no es asíncrona**: bloquea mientras espera. Para peticiones asíncronas se usa **httpx**, que tiene una API casi igual:

```bash
pip install httpx
```

```python
import asyncio
import time
import httpx

async def obtener_producto(cliente, id):
    respuesta = await cliente.get(f"https://dummyjson.com/products/{id}")
    respuesta.raise_for_status()
    return respuesta.json()["title"]

async def main():
    inicio = time.perf_counter()

    async with httpx.AsyncClient(timeout=10) as cliente:
        titulos = await asyncio.gather(*(obtener_producto(cliente, id) for id in range(1, 21)))

    for titulo in titulos:
        print(f"- {titulo}")
    print(f"20 productos en {time.perf_counter() - inicio:.2f} s")

asyncio.run(main())
```

- **`httpx.AsyncClient`** reutiliza las conexiones entre peticiones. Se abre con **`async with`**, que lo cierra al terminar (como `with open`, pero asíncrono).
- **`gather(*(...))`**: el `*` reparte la expresión generadora como argumentos sueltos (lo viste en el post de funciones).

Compara el tiempo con un bucle normal que haga `await` de una en una: la diferencia es enorme.

### No satures al servidor: `Semaphore`

Lanzar 1.000 peticiones a la vez puede hacer que la API te bloquee por exceso de peticiones (*rate limiting*). Un **semáforo** limita cuántas tareas pueden estar dentro de un bloque al mismo tiempo:

```python
async def main():
    limite = asyncio.Semaphore(5)    # como mucho 5 peticiones a la vez

    async def obtener_con_limite(cliente, id):
        async with limite:
            return await obtener_producto(cliente, id)

    async with httpx.AsyncClient(timeout=10) as cliente:
        titulos = await asyncio.gather(*(obtener_con_limite(cliente, id) for id in range(1, 101)))

    print(len(titulos), "productos")
```

## Iterar de forma asíncrona

Igual que existe `for await` en JavaScript (lo viste en el post de generadores), Python tiene **`async for`** y generadores asíncronos:

```python
async def paginas_de_productos(cliente, por_pagina=30):
    saltar = 0
    while True:
        respuesta = await cliente.get(
            "https://dummyjson.com/products",
            params={"limit": por_pagina, "skip": saltar, "select": "title"},
        )
        datos = respuesta.json()
        if not datos["products"]:
            break
        yield datos["products"]
        saltar += por_pagina

async def main():
    async with httpx.AsyncClient() as cliente:
        async for pagina in paginas_de_productos(cliente):
            print(f"Página con {len(pagina)} productos")

asyncio.run(main())
```

## ¿Dónde se usa asyncio en el día a día?

- **APIs web**: frameworks como **FastAPI** (el siguiente post) atienden miles de peticiones a la vez usando asyncio.
- **Scrapers** y scripts que consultan muchas URLs.
- **Bots** (Discord, Telegram) y aplicaciones con **WebSockets**.
- Clientes de bases de datos asíncronos.

## Tu turno

1. Escribe una corrutina `cuenta_atras(nombre, segundos)` que imprima cada segundo, y lanza tres a la vez con `TaskGroup`.
2. Descarga los usuarios del 1 al 30 de `https://dummyjson.com/users/{id}` con httpx y `gather`, y muestra la edad media. Mide el tiempo y compáralo con un bucle secuencial.
3. Añade un semáforo de 5 y un `asyncio.timeout(10)` alrededor de todo.
4. Haz que una de las peticiones falle a propósito (un id que no existe) y compara qué pasa con `gather`, con `gather(return_exceptions=True)` y con `TaskGroup`.

## Errores comunes

- **Olvidar el `await`**: la corrutina no se ejecuta (`coroutine was never awaited`).
- **Usar `time.sleep` o `requests`** dentro de código asíncrono: bloquean todo el event loop y la concurrencia desaparece. Usa `asyncio.sleep` y `httpx`.
- **Usar `await` fuera de una función `async`**: `SyntaxError`. El punto de entrada es `asyncio.run(main())`.
- **Llamar a `asyncio.run` dentro de código que ya es asíncrono**: `asyncio.run() cannot be called from a running event loop`.
- **Esperar que asyncio acelere cálculos**: solo ayuda con esperas de entrada/salida.
- **Lanzar miles de peticiones a la vez** sin límite: la API te bloqueará. Usa un `Semaphore`.

## Para profundizar

- [`asyncio` (documentación oficial, en español)](https://docs.python.org/es/3/library/asyncio.html)
- [Documentación de httpx (en inglés)](https://www.python-httpx.org/async/)

En resumen: la **asincronía** sirve para que tu programa avance mientras **espera** (red, archivos, bases de datos). Una **corrutina** se define con **`async def`**, se pausa con **`await`** y el programa arranca con **`asyncio.run()`**. Ejecuta varias a la vez con **`asyncio.gather`** o, mejor, con **`TaskGroup`**; pon límites con **`asyncio.timeout`** y **`Semaphore`**; y usa librerías asíncronas como **httpx**, nunca `time.sleep` ni `requests`.
