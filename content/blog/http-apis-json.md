---
title: 'APIs, HTTP y JSON explicados con un restaurante'
description: 'Antes de usar fetch, entiende qué pasa por debajo: qué es una API, los verbos GET, POST, PUT y DELETE, los códigos de estado y el formato JSON.'
date: 2026-11-26
series: javascript
tags: [JavaScript, APIs, Fundamentos]
draft: true
---

Casi todas las webs que usas hablan con un **servidor**: tu feed de noticias, el carrito de una tienda o el clima de hoy. Para pedir y enviar esos datos se usan **APIs**, **HTTP** y **JSON**. Estas tres palabras asustan, pero con un restaurante se entienden en cinco minutos.

## La API es el camarero

Imagina un restaurante:

- **Tú** (el navegador) quieres comer, pero no puedes entrar a la cocina.
- **La cocina** (el servidor) tiene los ingredientes: la base de datos.
- **El camarero** (la API) toma tu pedido, lo lleva a la cocina y te trae el plato.

Una **API** es eso: un intermediario con reglas claras sobre **qué puedes pedir y cómo pedirlo**. No necesitas saber cómo funciona la cocina; solo cómo hacer el pedido.

## HTTP: el idioma del pedido

Para que el camarero te entienda, el pedido sigue un formato: **HTTP**. Cada pedido (una **petición** o *request*) tiene:

1. **Una dirección (URL)**: qué quieres. Por ejemplo `https://api.ejemplo.com/productos`.
2. **Un verbo (método)**: qué quieres **hacer** con eso.
3. **Opcionalmente, un cuerpo (body)**: los datos que envías, como el formulario de un producto nuevo.

## Los cuatro verbos que vas a usar

| Verbo | Qué hace | En el restaurante | Ejemplo |
| --- | --- | --- | --- |
| `GET` | Leer datos | "¿Qué hay en la carta?" | Ver la lista de productos |
| `POST` | Crear algo nuevo | "Quiero pedir este plato" | Registrar un usuario |
| `PUT` / `PATCH` | Modificar algo que existe | "Cambia mi bebida" | Editar tu perfil |
| `DELETE` | Borrar | "Cancela mi pedido" | Eliminar una tarea |

`PUT` reemplaza el recurso completo; `PATCH` cambia solo algunos campos. Muchas APIs usan uno u otro: la documentación de cada API te dice cuál.

A estas cuatro operaciones (crear, leer, actualizar y borrar) se les llama **CRUD**, por sus siglas en inglés: *Create, Read, Update, Delete*. Casi cualquier aplicación es un CRUD por dentro.

## Los códigos de estado: cómo fue el pedido

Cada respuesta del servidor trae un **código de estado**, un número de tres cifras que dice cómo fue todo. Se agrupan por la primera cifra:

| Rango | Significa | Ejemplos |
| --- | --- | --- |
| **2xx** | Todo bien | `200 OK`, `201 Created` (se creó algo) |
| **3xx** | Redirección: está en otro sitio | `301 Moved Permanently` |
| **4xx** | Error **tuyo** (del cliente) | `400` datos inválidos, `401` no has iniciado sesión, `404` no existe |
| **5xx** | Error **del servidor** | `500 Internal Server Error` |

Truco para recordarlo: **4xx = "te equivocaste tú"**, **5xx = "se equivocó la cocina"**. Si ves un 404, revisa la URL. Si ves un 500, el problema no está en tu código del frontend.

Puedes ver todas las peticiones de una web en las **DevTools** del navegador (F12), en la pestaña **Red** (*Network*): verbo, URL, código y respuesta de cada una.

## JSON: el formato del plato

Los datos viajan como **texto**, y el formato más usado es **JSON** (*JavaScript Object Notation*). Se parece muchísimo a un objeto de JavaScript:

```json
{
  "id": 7,
  "nombre": "Polo básico",
  "precio": 35.5,
  "disponible": true,
  "tallas": ["S", "M", "L"],
  "categoria": null
}
```

Las diferencias con un objeto de JavaScript:

- Las claves van **siempre entre comillas dobles**: `"nombre"`, no `nombre`.
- Los textos también, con comillas **dobles** (no simples).
- No puede tener funciones, `undefined` ni comentarios.
- No admite una coma después del último elemento.

## De texto a objeto y al revés

Como JSON es texto, hay que convertirlo para usarlo en JavaScript. Para eso hay dos funciones:

```js playground=json
// Texto JSON → objeto de JavaScript
const texto = '{"nombre": "Polo básico", "precio": 35.5, "tallas": ["S", "M"]}'
const producto = JSON.parse(texto)

console.log(producto.nombre)     // 'Polo básico'
console.log(producto.tallas[1])  // 'M'

// Objeto de JavaScript → texto JSON (para enviarlo al servidor)
const nuevoUsuario = { nombre: 'Ana', edad: 22 }
const json = JSON.stringify(nuevoUsuario)

console.log(json)        // '{"nombre":"Ana","edad":22}'
console.log(typeof json) // 'string'
```

- **`JSON.parse(texto)`**: lo que **recibes** del servidor lo conviertes en objeto.
- **`JSON.stringify(objeto)`**: lo que vas a **enviar** lo conviertes en texto.

Cuando uses `fetch`, el método `respuesta.json()` hace el `JSON.parse` por ti.

## Un vistazo a una petición real

Así se ve un `GET` de verdad. Pide un usuario de prueba a una API pública y muestra el código de estado y los datos:

```js playground=peticion
async function pedirUsuario() {
  const respuesta = await fetch('https://jsonplaceholder.typicode.com/users/1')

  console.log('Código de estado:', respuesta.status) // 200
  console.log('¿Fue bien?', respuesta.ok)            // true

  const usuario = await respuesta.json() // JSON → objeto
  console.log(usuario.name, '·', usuario.email)
}

pedirUsuario()
```

Si todavía no conoces `async` y `await`, no te preocupes: tienen su propio post. Por ahora quédate con la idea: **pides una URL, recibes un código de estado y un JSON**.

## Errores comunes

- **Escribir JSON con comillas simples o sin comillas en las claves.** `JSON.parse("{nombre: 'Ana'}")` lanza un `SyntaxError`.
- **Olvidar convertir.** Si haces `console.log(texto.nombre)` sobre un texto JSON, obtienes `undefined`: primero `JSON.parse`.
- **Culpar a tu código por un 500.** Los 5xx son problemas del servidor.
- **Pensar que un 404 hace fallar a `fetch`.** No falla: tienes que comprobar `respuesta.ok`.

## Para profundizar

- [Qué es HTTP, en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Overview)
- [Códigos de estado HTTP en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Status)
- [Trabajar con JSON en MDN](https://developer.mozilla.org/es/docs/Learn/JavaScript/Objects/JSON)

En resumen: una **API** es el camarero entre tu web y el servidor. Hablas con ella en **HTTP** usando un **verbo** (`GET`, `POST`, `PUT`, `DELETE`), te responde con un **código de estado** (2xx bien, 4xx tu error, 5xx error del servidor) y los datos viajan en **JSON**.
