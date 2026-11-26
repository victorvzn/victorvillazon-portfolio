---
title: 'Object.groupBy: agrupa los datos de una API en una línea'
description: 'Agrupar pedidos por estado, tareas por responsable o ventas por mes ya no necesita un reduce. Object.groupBy llegó en ES2024.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ESNext, Arrays]
draft: true
---

Tu jefe te pide un tablero tipo Kanban: tres columnas con los pedidos **pendientes**, **enviados** y **entregados**. La API te devuelve una lista plana:

```js playground-setup
const pedidos = [
  { id: 101, cliente: 'Ana', total: 59, estado: 'pendiente', fecha: '2026-10-03' },
  { id: 102, cliente: 'Luis', total: 120, estado: 'enviado', fecha: '2026-10-15' },
  { id: 103, cliente: 'Marta', total: 35, estado: 'entregado', fecha: '2026-11-02' },
  { id: 104, cliente: 'Ana', total: 210, estado: 'pendiente', fecha: '2026-11-08' },
  { id: 105, cliente: 'Pedro', total: 15, estado: 'entregado', fecha: '2026-11-20' }
]
```

Necesitas pasar de una lista a un objeto con una lista por estado. Hasta hace poco esto se hacía con `reduce` o con un bucle, como en el ejercicio de agrupar por categoría. Ahora hay una función que lo hace sola.

## El caso básico

`Object.groupBy(lista, funcion)` recorre la lista y usa lo que devuelve tu función como **nombre del grupo**:

```js playground=basico
const columnas = Object.groupBy(pedidos, pedido => pedido.estado)

console.log(columnas.pendiente.map(p => p.id))  // [101, 104]
console.log(columnas.enviado.map(p => p.id))    // [102]
console.log(columnas.entregado.map(p => p.id))  // [103, 105]
```

Compáralo con lo que habrías escrito antes:

```js
const columnas = pedidos.reduce((grupos, pedido) => {
  grupos[pedido.estado] ??= []
  grupos[pedido.estado].push(pedido)
  return grupos
}, {})
```

Hace lo mismo, pero `Object.groupBy` se lee como una frase: "agrupa los pedidos por estado".

## El grupo lo decides tú

La función puede devolver **lo que quieras**, no solo una propiedad. Por ejemplo, para un informe de ventas por mes:

```js playground=por-mes
// '2026-10-03' → '2026-10'
const porMes = Object.groupBy(pedidos, pedido => pedido.fecha.slice(0, 7))

for (const [mes, lista] of Object.entries(porMes)) {
  const total = lista.reduce((suma, p) => suma + p.total, 0)
  console.log(`${mes}: ${lista.length} pedidos, ${total} €`)
}
```

O para separar pedidos grandes y pequeños, algo que te pedirán para un descuento o una alerta:

```js playground=por-tamano
const { grandes = [], pequenos = [] } = Object.groupBy(
  pedidos,
  pedido => (pedido.total >= 100 ? 'grandes' : 'pequenos')
)

console.log('Grandes:', grandes.map(p => p.cliente))
console.log('Pequeños:', pequenos.map(p => p.cliente))
```

Aquí lo combinamos con **destructuring** y valores por defecto (`= []`). Eso nos lleva al detalle más importante.

## Ojo: los grupos vacíos no existen

Si ningún pedido está "cancelado", **no habrá** una propiedad `cancelado`. Vale `undefined`, no `[]`:

```js playground=vacio
const columnas = Object.groupBy(pedidos, pedido => pedido.estado)

console.log(columnas.cancelado)            // undefined
console.log(columnas.cancelado?.length)    // undefined
console.log((columnas.cancelado ?? []).length) // 0
```

En un Kanban esto rompería la columna vacía con un `Cannot read properties of undefined`. Usa siempre `?? []` (o un valor por defecto) para las columnas que pueden estar vacías.

## `Map.groupBy`: cuando el grupo no es un texto

Las claves de un objeto siempre se convierten en texto. Si quieres agrupar **por un objeto** (por ejemplo, por el usuario completo) usa `Map.groupBy`, que devuelve un `Map`:

```js playground=map-groupby
const ana = { nombre: 'Ana', equipo: 'Frontend' }
const luis = { nombre: 'Luis', equipo: 'Backend' }

const tareas = [
  { titulo: 'Maquetar login', responsable: ana },
  { titulo: 'Crear API de usuarios', responsable: luis },
  { titulo: 'Revisar accesibilidad', responsable: ana }
]

const porResponsable = Map.groupBy(tareas, tarea => tarea.responsable)

console.log(porResponsable.get(ana).map(t => t.titulo))
console.log(porResponsable.get(luis).map(t => t.titulo))
```

Regla rápida: si el grupo es un texto (estado, categoría, mes), **`Object.groupBy`**. Si es un objeto, **`Map.groupBy`**.

## Errores comunes

- **Escribir `pedidos.groupBy(...)`.** No es un método de los arrays: es `Object.groupBy(pedidos, ...)`. Esta fue una decisión del TC39 para no romper webs antiguas que ya usaban ese nombre.
- **Olvidar los grupos vacíos.** `?? []` siempre que una columna pueda no tener elementos.
- **Usar `resultado.hasOwnProperty(...)`.** El objeto que devuelve es "limpio" (no hereda métodos de `Object`), así que ese método no existe. Usa `Object.hasOwn(resultado, 'pendiente')` o el operador `in`.

## Para profundizar

- [`Object.groupBy()` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
- [`Map.groupBy()` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)

En resumen: **`Object.groupBy(lista, fn)`** agrupa en una línea usando lo que devuelve `fn` como nombre del grupo. Los grupos vacíos **no existen** (usa `?? []`) y, si agrupas por objetos, usa **`Map.groupBy`**.
