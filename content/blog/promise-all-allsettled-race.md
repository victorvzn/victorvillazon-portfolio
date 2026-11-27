---
title: 'Varias peticiones a la vez: Promise.all, allSettled, race y any'
description: 'Cómo lanzar varias promesas en paralelo en vez de una detrás de otra, qué pasa si una falla y cómo poner un tiempo máximo a una petición.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Promesas, Asincronía, Fetch]
draft: true
---

Tu página de perfil necesita tres cosas de la API: los datos del usuario, sus pedidos y sus favoritos. Con lo que sabes de `async`/`await`, lo natural es escribir:

```js
const usuario = await obtenerUsuario()
const pedidos = await obtenerPedidos()
const favoritos = await obtenerFavoritos()
```

Funciona, pero tiene un problema: **cada `await` espera a que termine el anterior**. Si cada petición tarda 1 segundo, esperas 3 segundos. Y las tres peticiones no dependen unas de otras: podrían ir **a la vez**.

Para eso existen cuatro métodos de `Promise`.

Para probar sin depender de una API, usaremos una función que simula una petición que tarda un tiempo:

```js playground-setup
// Simula una petición: se resuelve con "valor" después de "ms" milisegundos
const esperar = (valor, ms) => new Promise((resolve) => setTimeout(() => resolve(valor), ms))

// Simula una petición que falla
const fallar = (mensaje, ms) => new Promise((_, reject) => setTimeout(() => reject(new Error(mensaje)), ms))
```

## En serie vs en paralelo

```js playground=serie
async function enSerie() {
  console.time('en serie')
  const usuario = await esperar('Ana', 1000)
  const pedidos = await esperar(['#101', '#102'], 1000)
  const favoritos = await esperar(['Teclado'], 1000)
  console.timeEnd('en serie') // ~3000 ms
  console.log(usuario, pedidos, favoritos)
}

async function enParalelo() {
  console.time('en paralelo')
  const [usuario, pedidos, favoritos] = await Promise.all([
    esperar('Ana', 1000),
    esperar(['#101', '#102'], 1000),
    esperar(['Teclado'], 1000)
  ])
  console.timeEnd('en paralelo') // ~1000 ms
  console.log(usuario, pedidos, favoritos)
}

// Primero uno y, cuando termine, el otro
enSerie().then(enParalelo)
```

Mismo resultado, **un tercio del tiempo**. `console.time` y `console.timeEnd` miden cuánto tarda el código entre los dos.

## `Promise.all`: todas o ninguna

`Promise.all` recibe un **array de promesas** y devuelve una promesa que:

- Se **cumple** cuando **todas** se han cumplido, con un array de resultados **en el mismo orden** en que las pasaste (aunque terminen en otro orden).
- Se **rechaza** en cuanto **una sola** falla, con el error de esa.

```js playground=all-falla
async function cargarPerfil() {
  try {
    const resultados = await Promise.all([
      esperar('usuario', 500),
      fallar('Los pedidos no cargaron', 300),
      esperar('favoritos', 800)
    ])
    console.log(resultados)
  } catch (error) {
    console.log('Falló:', error.message) // Falló: Los pedidos no cargaron
  }
}

cargarPerfil()
```

Úsalo cuando **necesitas todos los datos** para continuar: si falta uno, no tiene sentido mostrar la página.

### Con `fetch` de verdad

```js playground=all-fetch
async function cargarUsuarios(ids) {
  const usuarios = await Promise.all(
    ids.map(async (id) => {
      const respuesta = await fetch(`https://dummyjson.com/users/${id}`)
      if (!respuesta.ok) throw new Error(`Usuario ${id}: error ${respuesta.status}`)
      return respuesta.json()
    })
  )

  console.log(usuarios.map((usuario) => usuario.firstName))
}

cargarUsuarios([1, 2, 3])
```

`ids.map(async ...)` crea **un array de promesas**, una por id, y `Promise.all` las espera todas. Es el patrón más común para pedir varios elementos a la vez.

## `Promise.allSettled`: espera a todas, pase lo que pase

A veces quieres mostrar **lo que se pueda**, aunque algo falle. Por ejemplo, un panel con varios widgets: si falla el del clima, el resto debería seguir funcionando.

`Promise.allSettled` espera a que **todas terminen** (bien o mal) y **nunca se rechaza**. Te da un array de objetos que dicen qué pasó con cada una:

```js playground=allsettled
async function cargarPanel() {
  const resultados = await Promise.allSettled([
    esperar({ ventas: 1520 }, 400),
    fallar('El servicio del clima no responde', 200),
    esperar({ visitas: 830 }, 600)
  ])

  console.log(resultados)
  // [
  //   { status: 'fulfilled', value: { ventas: 1520 } },
  //   { status: 'rejected', reason: Error: El servicio del clima no responde },
  //   { status: 'fulfilled', value: { visitas: 830 } }
  // ]

  resultados.forEach((resultado, i) => {
    if (resultado.status === 'fulfilled') {
      console.log(`Widget ${i + 1}: ✅`, resultado.value)
    } else {
      console.log(`Widget ${i + 1}: ❌`, resultado.reason.message)
    }
  })
}

cargarPanel()
```

- `status: 'fulfilled'` → salió bien; el resultado está en **`value`**.
- `status: 'rejected'` → falló; el error está en **`reason`**.

## `Promise.race`: la primera que termine

`Promise.race` se queda con **la primera promesa que termine**, bien o mal. Su uso más típico es poner un **tiempo máximo** a una petición:

```js playground=race
function conTiempoMaximo(promesa, ms) {
  const limite = fallar(`Tardó más de ${ms} ms`, ms)
  return Promise.race([promesa, limite])
}

conTiempoMaximo(esperar('datos del servidor', 3000), 1000)
  .then((datos) => console.log(datos))
  .catch((error) => console.log(error.message)) // Tardó más de 1000 ms
```

Si la petición tarda menos de 1 segundo, gana ella. Si no, gana el temporizador y se rechaza.

> Para `fetch`, hoy existe una forma más directa de hacer esto: `fetch(url, { signal: AbortSignal.timeout(1000) })`, que además **cancela** la petición. La vemos en el post de `AbortController`.

## `Promise.any`: la primera que salga bien

`Promise.any` se queda con **la primera que se cumpla** e ignora las que fallen. Solo se rechaza si **fallan todas**:

```js playground=any
Promise.any([
  fallar('Servidor 1 caído', 100),
  esperar('imagen desde el servidor 2', 500),
  esperar('imagen desde el servidor 3', 800)
]).then((imagen) => console.log(imagen)) // imagen desde el servidor 2
```

Útil cuando tienes **varias fuentes** del mismo dato (servidores de respaldo, varios proveedores) y te vale la que responda primero.

## Chuleta

| Método | Se cumple cuando... | Se rechaza cuando... | Úsalo para |
| --- | --- | --- | --- |
| `Promise.all` | **Todas** se cumplen | **Una** falla | Necesitas todos los datos |
| `Promise.allSettled` | **Todas** terminan | Nunca | Mostrar lo que se pueda |
| `Promise.race` | La **primera** termina bien | La **primera** termina mal | Tiempos máximos |
| `Promise.any` | La **primera** se cumple | **Todas** fallan | Varias fuentes del mismo dato |

## ⚠️ Cuándo NO ir en paralelo

Si una petición **necesita el resultado de otra**, tienen que ir en serie:

```js
// El id del usuario hace falta para pedir sus pedidos: en serie, con dos await
const usuario = await obtenerUsuario()
const pedidos = await obtenerPedidos(usuario.id)
```

Y cuidado con lanzar **cientos** de peticiones a la vez con `Promise.all`: puedes saturar el servidor o que te bloquee. Para muchas, se procesan por grupos.

## Tu turno

```js playground=ejercicio
const productos = () => esperar(['Teclado', 'Mouse'], 800)
const categorias = () => esperar(['Audio', 'Pantallas'], 500)
const ofertas = () => fallar('Ofertas no disponibles', 300)

// 1. Carga productos y categorías en paralelo con Promise.all y muéstralos

// 2. Carga los tres con Promise.allSettled y muestra los que funcionaron
//    y un aviso para los que fallaron

// 3. Pon un tiempo máximo de 600 ms a productos() con Promise.race.
//    ¿Qué pasa? ¿Y con 1000 ms?
```

## Errores comunes

- **`await` en serie para peticiones independientes.** Si no dependen unas de otras, usa `Promise.all`.
- **Usar `Promise.all` cuando una falla es aceptable.** Si una falla, pierdes todo. Usa `allSettled`.
- **Pasarle funciones en vez de promesas.** `Promise.all([obtenerUsuario, obtenerPedidos])` no las ejecuta. Llámalas: `[obtenerUsuario(), obtenerPedidos()]`.
- **Usar `await` dentro de un `forEach`** esperando que espere. `forEach` no espera promesas. Usa `Promise.all` con `map`, o un `for...of` si las quieres en serie.
- **Olvidar el `try/catch`** alrededor de `Promise.all`, `race` o `any`.

## Para profundizar

- [`Promise.all` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [`Promise.allSettled` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [`Promise.race` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [`Promise.any` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)

En resumen: si tus peticiones **no dependen unas de otras**, lánzalas **en paralelo**. **`Promise.all`** cuando las necesitas todas, **`allSettled`** para mostrar lo que funcione, **`race`** para poner un tiempo máximo y **`any`** para quedarte con la primera fuente que responda bien.
