---
title: 'CRUD con fetch: crea, lee, edita y borra datos de una API'
description: 'fetch no solo sirve para leer. Aprende a enviar datos con POST, editarlos con PUT y borrarlos con DELETE, y a organizarlo todo en funciones reutilizables.'
date: 2026-11-26
series: javascript
tags: [JavaScript, APIs, Asincronía]
draft: true
---

En el post de `fetch` aprendimos a **leer** datos de una API. Pero una aplicación real también **crea**, **edita** y **borra**: añadir una tarea, marcarla como hecha, eliminarla. A esas cuatro operaciones se les llama **CRUD**.

| Letra | Operación | Verbo HTTP |
| --- | --- | --- |
| **C** | Create (crear) | `POST` |
| **R** | Read (leer) | `GET` |
| **U** | Update (actualizar) | `PUT` o `PATCH` |
| **D** | Delete (borrar) | `DELETE` |

Si los verbos HTTP o los códigos de estado no te suenan, lee antes el post de APIs, HTTP y JSON.

## La API que vamos a usar

Usaremos [JSONPlaceholder](https://jsonplaceholder.typicode.com), una API pública de prueba con tareas (*todos*). Tiene un detalle importante: **simula** los cambios. Responde como si hubiera creado, editado o borrado, pero en realidad no guarda nada. Es perfecta para practicar sin romper nada.

Todas las peticiones de este post van contra esta dirección base:

```js playground-setup
const API = 'https://jsonplaceholder.typicode.com/todos'
```

## R: leer (GET)

`GET` es lo que `fetch` hace por defecto, así que no hace falta indicar el método:

```js playground=leer
async function obtenerTareas() {
  const respuesta = await fetch(`${API}?_limit=3`)
  const tareas = await respuesta.json()

  for (const tarea of tareas) {
    console.log(`${tarea.completed ? '✅' : '⬜'} ${tarea.id}. ${tarea.title}`)
  }
}

obtenerTareas()
```

`?_limit=3` es un **parámetro de consulta** (*query param*): le pide a esta API que devuelva solo 3 tareas. Cada API tiene los suyos; están en su documentación.

## C: crear (POST)

Para crear algo hay que enviar datos. Eso necesita tres cosas nuevas en el segundo parámetro de `fetch`:

```js playground=crear
async function crearTarea(titulo) {
  const respuesta = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: titulo, completed: false, userId: 1 })
  })

  console.log('Código:', respuesta.status) // 201: Created
  const tareaCreada = await respuesta.json()
  console.log('Tarea creada:', tareaCreada)
}

crearTarea('Estudiar fetch')
```

- **`method: 'POST'`**: el verbo.
- **`headers`**: información extra sobre la petición. `'Content-Type': 'application/json'` le dice al servidor "lo que te envío es JSON".
- **`body`**: los datos, convertidos a texto con `JSON.stringify`.

El servidor responde con un **201** (*Created*) y la tarea creada, **con su `id` nuevo**. Ese `id` lo asigna el servidor, no tú.

## U: editar (PUT y PATCH)

Para editar, la URL lleva el **`id`** de lo que quieres cambiar:

```js playground=editar
async function completarTarea(id) {
  const respuesta = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
  })

  const tareaEditada = await respuesta.json()
  console.log('Tarea editada:', tareaEditada)
}

completarTarea(1)
```

Usamos **`PATCH`** porque solo cambiamos un campo (`completed`). Con **`PUT`** tendrías que enviar el objeto **completo** (título, estado, usuario...), porque reemplaza la tarea entera.

## D: borrar (DELETE)

Borrar es lo más sencillo: el verbo y la URL con el `id`. No hace falta `body`:

```js playground=borrar
async function borrarTarea(id) {
  const respuesta = await fetch(`${API}/${id}`, { method: 'DELETE' })

  if (respuesta.ok) {
    console.log(`Tarea ${id} borrada (código ${respuesta.status})`)
  } else {
    console.log(`No se pudo borrar la tarea ${id}`)
  }
}

borrarTarea(1)
```

## Todo junto: un "servicio" de tareas

En un proyecto real no vas a repetir `fetch` por todo el código. Lo habitual es juntar las peticiones en un archivo de **servicio**: un objeto con una función por operación. Así, el resto de la app solo llama a `tareasApi.crear(...)` sin preocuparse de URLs ni de headers.

```js playground=servicio
async function pedir(url, opciones = {}) {
  const respuesta = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones
  })

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al pedir ${url}`)
  }

  return respuesta.json()
}

const tareasApi = {
  listar: () => pedir(`${API}?_limit=3`),
  crear: (tarea) => pedir(API, { method: 'POST', body: JSON.stringify(tarea) }),
  editar: (id, cambios) => pedir(`${API}/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }),
  borrar: (id) => pedir(`${API}/${id}`, { method: 'DELETE' })
}

async function demo() {
  try {
    const tareas = await tareasApi.listar()
    console.log('Leídas:', tareas.length)

    const nueva = await tareasApi.crear({ title: 'Repasar CRUD', completed: false })
    console.log('Creada con id:', nueva.id)

    const editada = await tareasApi.editar(1, { completed: true })
    console.log('Editada:', editada.completed)

    await tareasApi.borrar(1)
    console.log('Borrada la tarea 1')

    await pedir(`${API}/99999`) // no existe: provoca un 404
  } catch (error) {
    console.log('❌', error.message)
  }
}

demo()
```

La función `pedir` hace tres cosas que repetiríamos en cada petición: pone el header de JSON, **comprueba `respuesta.ok`** (porque `fetch` no falla con un 404) y convierte la respuesta con `.json()`. Si algo va mal, lanza un error que atrapamos con `try/catch`.

El `...opciones` (*spread*) mezcla las opciones por defecto con las que pase cada función, como el `method` o el `body`.

## Errores comunes

- **Olvidar `JSON.stringify` en el `body`.** Si envías el objeto tal cual, el servidor recibe el texto `"[object Object]"`.
- **Olvidar el header `Content-Type`.** Muchas APIs ignoran el body si no saben que es JSON.
- **No comprobar `respuesta.ok`.** Un 404 o un 500 no hacen fallar a `fetch`; tu código seguirá como si todo fuera bien.
- **Confundir `PUT` y `PATCH`.** Con `PUT` envía el objeto completo; con `PATCH`, solo lo que cambia.
- **Esperar que JSONPlaceholder guarde los cambios.** Es una API de prueba: si vuelves a pedir las tareas, todo sigue igual.

## Para profundizar

- [Usar fetch, en MDN](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch)
- [Guía de JSONPlaceholder (en inglés)](https://jsonplaceholder.typicode.com/guide/)

En resumen: **`GET`** para leer, **`POST`** para crear, **`PATCH`/`PUT`** para editar y **`DELETE`** para borrar. Para enviar datos pon el **`method`**, el header **`Content-Type: application/json`** y el **`body`** con `JSON.stringify`. Y agrupa todo en un **servicio** para no repetirte.
