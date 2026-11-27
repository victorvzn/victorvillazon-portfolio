---
title: 'TypeScript avanzado: narrowing, uniones discriminadas y type guards'
description: 'Cómo TypeScript reduce un tipo cuando lo compruebas, cómo modelar estados imposibles con uniones discriminadas, el truco de never para no olvidar casos y cómo escribir tus propios type guards.'
date: 2026-11-27
series: typescript
tags: [TypeScript, Narrowing, Avanzado]
draft: true
---

Mira este tipo para el estado de una petición. Parece razonable:

```ts
type EstadoPeticion = {
  cargando: boolean
  error?: string
  datos?: Producto[]
}
```

Pero permite cosas **sin sentido**: `{ cargando: true, error: 'Falló', datos: [...] }`. ¿Está cargando, falló o terminó? Con este tipo tu código tiene que defenderse de combinaciones imposibles. Hoy aprendes a hacer que **esas combinaciones ni siquiera se puedan escribir**.

## Narrowing: reducir un tipo comprobándolo

Cuando una variable tiene una unión, TypeScript **sigue tu código** y reduce el tipo dentro de cada rama. A eso se le llama *narrowing* (estrechar):

```ts
function formatear(valor: string | number | Date) {
  if (typeof valor === 'string') {
    return valor.toUpperCase()        // aquí valor es string
  }
  if (valor instanceof Date) {
    return valor.toLocaleDateString() // aquí, Date
  }
  return valor.toFixed(2)             // aquí solo queda number
}
```

Las comprobaciones que TypeScript entiende:

| Comprobación | Sirve para |
| --- | --- |
| `typeof x === 'string'` | tipos primitivos: `string`, `number`, `boolean`... |
| `x instanceof Date` | clases: `Date`, `Error`, `HTMLElement`... |
| `'propiedad' in x` | saber si un objeto tiene una propiedad |
| `x === null`, `if (x)` | descartar `null` y `undefined` |
| `Array.isArray(x)` | arrays |

Un ejemplo con `in`:

```ts
type Gato = { nombre: string; maullar: () => void }
type Perro = { nombre: string; ladrar: () => void }

function hacerRuido(animal: Gato | Perro) {
  if ('maullar' in animal) {
    animal.maullar()  // Gato
  } else {
    animal.ladrar()   // Perro
  }
}
```

## Uniones discriminadas: el patrón estrella

La idea: en lugar de un objeto con todo opcional, una **unión de objetos**, y cada uno tiene una propiedad común con un **valor literal** distinto que lo identifica. Esa propiedad es el **discriminante**:

```ts
type Producto = { id: number; nombre: string }

type EstadoPeticion =
  | { estado: 'cargando' }
  | { estado: 'error'; mensaje: string }
  | { estado: 'exito'; datos: Producto[] }
```

Ahora:

- Si `estado` es `'error'`, **seguro** que hay `mensaje`.
- Si es `'exito'`, **seguro** que hay `datos`.
- Es **imposible** tener `datos` mientras se está cargando.

```ts
function render(peticion: EstadoPeticion) {
  switch (peticion.estado) {
    case 'cargando':
      return 'Cargando...'
    case 'error':
      return `Error: ${peticion.mensaje}`           // TypeScript sabe que hay mensaje
    case 'exito':
      return `${peticion.datos.length} productos`   // y aquí, que hay datos
  }
}

render({ estado: 'exito', datos: [] })                   // ✅
render({ estado: 'cargando', datos: [] })                // ❌ 'datos' does not exist in type '{ estado: "cargando"; }'
```

Fuera del `switch`, `peticion.datos` daría error, porque no todas las opciones lo tienen. Tienes que comprobar `estado` primero. Eso es exactamente lo que quieres.

## Otro ejemplo: eventos de un carrito

Las uniones discriminadas son perfectas para **acciones** (lo verás con `useReducer` en React):

```ts
type Accion =
  | { tipo: 'agregar'; producto: Producto }
  | { tipo: 'quitar'; id: number }
  | { tipo: 'vaciar' }

function carritoReducer(carrito: Producto[], accion: Accion): Producto[] {
  switch (accion.tipo) {
    case 'agregar':
      return [...carrito, accion.producto]
    case 'quitar':
      return carrito.filter((p) => p.id !== accion.id)
    case 'vaciar':
      return []
  }
}
```

## `never`: que TypeScript te avise si olvidas un caso

¿Qué pasa si mañana alguien añade `{ tipo: 'aplicarCupon'; codigo: string }` a `Accion` y olvida manejarlo en el `switch`? Con este truco, TypeScript lo detecta:

```ts
function asegurarNunca(valor: never): never {
  throw new Error(`Caso no manejado: ${JSON.stringify(valor)}`)
}

function carritoReducer(carrito: Producto[], accion: Accion): Producto[] {
  switch (accion.tipo) {
    case 'agregar':
      return [...carrito, accion.producto]
    case 'quitar':
      return carrito.filter((p) => p.id !== accion.id)
    case 'vaciar':
      return []
    default:
      return asegurarNunca(accion)
  }
}
```

`never` es el tipo **imposible**: ningún valor lo tiene. Si has cubierto todos los casos, en el `default` no queda ninguna opción y `accion` es `never`, así que compila. Si falta uno, `accion` sería `{ tipo: 'aplicarCupon'; ... }`, que no es `never`, y TypeScript marca el error **en el sitio exacto** donde olvidaste el caso.

A esto se le llama **comprobación exhaustiva** (*exhaustiveness checking*).

## Type guards propios: `valor is Tipo`

A veces la comprobación es más compleja que un `typeof`. Puedes escribir una función que le diga a TypeScript "si devuelvo `true`, esto es de tal tipo":

```ts
type Usuario = { id: number; nombre: string }

function esUsuario(valor: unknown): valor is Usuario {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'id' in valor && typeof valor.id === 'number' &&
    'nombre' in valor && typeof valor.nombre === 'string'
  )
}

const datos: unknown = JSON.parse('{"id": 1, "nombre": "Ana"}')

if (esUsuario(datos)) {
  console.log(datos.nombre.toUpperCase()) // ✅ datos es Usuario
}
```

El tipo de retorno `valor is Usuario` se llama **predicado de tipo**. Úsalo también con `filter` para limpiar arrays:

```ts
const valores = [1, null, 2, undefined, 3]

const numeros = valores.filter((v): v is number => v != null) // number[]
```

> Desde TypeScript 5.5, en casos sencillos como este, TypeScript ya **deduce** el predicado solo: `valores.filter((v) => v != null)` también da `number[]`.

¿Ves lo largo que es `esUsuario`? Para objetos grandes, escribir estos guards a mano es tedioso y es fácil equivocarse. **Zod** genera esta comprobación por ti; es el siguiente módulo de la serie.

## `as const` y `satisfies`

Dos herramientas que se ven mucho en código moderno.

**`as const`** hace que TypeScript trate un valor como literal y de solo lectura:

```ts
const ROLES = ['admin', 'editor', 'lector'] as const

type Rol = (typeof ROLES)[number] // 'admin' | 'editor' | 'lector'
```

Así tienes el array para usar en el código (por ejemplo, para pintar un `<select>`) y el tipo **saliendo del mismo sitio**.

**`satisfies`** comprueba que un valor cumple un tipo **sin perder** el tipo exacto que TypeScript dedujo:

```ts
type Ruta = { path: string; publica: boolean }

const rutas = {
  inicio: { path: '/', publica: true },
  perfil: { path: '/perfil', publica: false }
} satisfies Record<string, Ruta>

rutas.inicio.path  // ✅ y el editor autocompleta "inicio" y "perfil"
rutas.contacto     // ❌ TypeScript sabe que esa clave no existe
```

Si hubieras escrito `const rutas: Record<string, Ruta> = ...`, TypeScript olvidaría qué claves concretas hay.

## Tu turno

1. Modela un formulario de pago como unión discriminada por `metodo`: `'tarjeta'` (con `numero` y `cvv`), `'yape'` (con `telefono`) y `'efectivo'` (sin datos extra).
2. Escribe `describirPago(pago)` con un `switch` y la comprobación exhaustiva con `never`.
3. Añade un cuarto método, `'transferencia'`, y comprueba que TypeScript te señala el `switch`.

## Errores comunes

- **Modelar estados con un montón de opcionales** (`error?`, `datos?`, `cargando`) en vez de una unión discriminada.
- **Usar `as` para "arreglar" un error de tipos** (`datos as Usuario`). Es mentirle a TypeScript; compruébalo con narrowing.
- **Un type guard que miente.** Si `esUsuario` devuelve `true` sin comprobar bien, TypeScript te creerá igualmente.
- **Olvidar el `default` con `never`** en `switch` sobre uniones que van a crecer.
- **Escribir el discriminante con tipos distintos** (`tipo: string` en uno y `tipo: 'quitar'` en otro). Todos deben ser literales.

## Para profundizar

- [Narrowing (documentación oficial, en inglés)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [El operador `satisfies` (documentación oficial, en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)

En resumen: TypeScript **reduce el tipo** cuando lo compruebas con `typeof`, `instanceof` o `in`. Las **uniones discriminadas** hacen imposibles los estados sin sentido, **`never`** te avisa si olvidas un caso y los **type guards** (`valor is Tipo`) enseñan a TypeScript comprobaciones propias. Con **`as const`** y **`satisfies`** sacas tipos exactos de tus valores.
