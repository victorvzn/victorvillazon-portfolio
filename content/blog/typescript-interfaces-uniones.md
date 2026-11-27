---
title: 'TypeScript: type, interface, uniones y literales'
description: 'Cómo ponerle nombre a la forma de tus datos con type e interface, propiedades opcionales y de solo lectura, uniones como string | number y tipos literales para estados.'
date: 2026-11-27
series: typescript
tags: [TypeScript, Tipos, Fundamentos]
draft: true
---

En el post anterior escribimos el tipo de un objeto así:

```ts
const producto: { nombre: string; precio: number; enStock: boolean } = { /* ... */ }
```

Funciona, pero si tienes diez funciones que reciben un producto, tendrías que repetir esa línea diez veces. Hoy aprendes a **darle un nombre** a la forma de tus datos y a describir valores que pueden ser **una cosa u otra**.

## `type`: un nombre para un tipo

```ts
type Producto = {
  id: number
  nombre: string
  precio: number
  enStock: boolean
}

const teclado: Producto = { id: 1, nombre: 'Teclado', precio: 120, enStock: true }

function mostrarProducto(producto: Producto) {
  return `${producto.nombre}: S/ ${producto.precio}`
}
```

Ahora `Producto` se usa como `string` o `number`. Si a `teclado` le falta una propiedad o tiene una de más, TypeScript te avisa:

```ts
const mouse: Producto = { id: 2, nombre: 'Mouse', precio: 45 }
// ❌ Property 'enStock' is missing in type '{ id: number; nombre: string; precio: number; }'
```

Por convención, los nombres de tipos van en **PascalCase**: `Producto`, `Usuario`, `RespuestaApi`.

## `interface`: casi lo mismo

```ts
interface Usuario {
  id: number
  nombre: string
  email: string
}
```

Para describir objetos, `type` e `interface` son prácticamente intercambiables. Las diferencias que te importan hoy:

| | `type` | `interface` |
| --- | --- | --- |
| Describir objetos | ✅ | ✅ |
| Uniones (`'a' \| 'b'`), tipos simples | ✅ | ❌ |
| Extender otro tipo | con `&` | con `extends` |

**Recomendación:** elige uno y sé consistente. Muchos equipos usan `type` para todo porque sirve en más casos; otros usan `interface` para objetos. Las dos opciones son correctas.

## Propiedades opcionales y de solo lectura

```ts
type Usuario = {
  readonly id: number   // no se puede cambiar después de crearlo
  nombre: string
  telefono?: string     // puede no estar
}

const ana: Usuario = { id: 1, nombre: 'Ana' } // ✅ sin teléfono

ana.nombre = 'Ana María' // ✅
ana.id = 99
// ❌ Cannot assign to 'id' because it is a read-only property.
```

Cuando una propiedad es opcional, su tipo real es `string | undefined`. TypeScript te obligará a comprobarla antes de usarla:

```ts
function llamar(usuario: Usuario) {
  usuario.telefono.startsWith('+51')
  // ❌ 'usuario.telefono' is possibly 'undefined'.

  if (usuario.telefono) {
    usuario.telefono.startsWith('+51') // ✅
  }
}
```

## Combinar tipos

Con `interface`, usa `extends`:

```ts
interface Persona {
  nombre: string
}

interface Empleado extends Persona {
  puesto: string
}
```

Con `type`, usa `&` (se lee "y además"):

```ts
type Persona = { nombre: string }
type Empleado = Persona & { puesto: string }

const luis: Empleado = { nombre: 'Luis', puesto: 'Frontend' }
```

## Uniones: "esto o aquello"

El símbolo `|` significa **o**:

```ts
type Id = number | string

function buscarPorId(id: Id) {
  // ...
}

buscarPorId(42)       // ✅
buscarPorId('abc-42') // ✅
buscarPorId(true)     // ❌
```

Dentro de la función, `id` puede ser cualquiera de los dos, así que solo puedes usar lo que **ambos** tienen. Para usar métodos de uno solo, compruébalo primero:

```ts
function normalizarId(id: number | string) {
  if (typeof id === 'string') {
    return id.trim().toLowerCase() // aquí TypeScript sabe que es string
  }
  return String(id)                 // y aquí, que es number
}
```

Esta técnica de "comprobar para reducir el tipo" se llama **narrowing** y tiene su propio post.

## Tipos literales: valores exactos

Un tipo puede ser **un valor concreto**:

```ts
type Estado = 'cargando' | 'exito' | 'error'

let estado: Estado = 'cargando'
estado = 'exito'     // ✅
estado = 'terminado'
// ❌ Type '"terminado"' is not assignable to type 'Estado'.
```

Esto es buenísimo para cosas que solo tienen unas pocas opciones: estados de una petición, tamaños de un botón, roles de usuario...

```ts
type Tamano = 'sm' | 'md' | 'lg'

function crearBoton(texto: string, tamano: Tamano = 'md') {
  return `<button class="boton boton--${tamano}">${texto}</button>`
}

crearBoton('Enviar', 'lg')  // ✅
crearBoton('Enviar', 'xl')  // ❌ y el editor te sugiere 'sm', 'md' o 'lg'
```

Además, al escribir `crearBoton('Enviar', '` el editor te **autocompleta** las opciones válidas. Ya no hace falta mirar la documentación.

## Tipar arrays de objetos

Lo más habitual en el día a día: una lista de cosas con forma conocida.

```ts
type Tarea = {
  id: number
  texto: string
  hecha: boolean
}

const tareas: Tarea[] = [
  { id: 1, texto: 'Estudiar TypeScript', hecha: false },
  { id: 2, texto: 'Hacer ejercicio', hecha: true }
]

function pendientes(lista: Tarea[]): Tarea[] {
  return lista.filter((tarea) => !tarea.hecha)
}

const textos = pendientes(tareas).map((tarea) => tarea.texto) // string[]
```

Fíjate: en `filter` y `map` no escribimos el tipo de `tarea`. TypeScript lo deduce porque sabe que `lista` es `Tarea[]`.

## Tu turno

1. Crea un tipo `Pedido` con `id` (solo lectura), `cliente`, `productos` (un array de `Producto`), `estado` (`'pendiente' | 'enviado' | 'entregado'`) y `notas` opcional.
2. Escribe `calcularTotalPedido(pedido: Pedido): number` que sume los precios de sus productos.
3. Escribe `avanzarEstado(pedido: Pedido): Pedido` que devuelva una **copia** del pedido con el siguiente estado (pendiente → enviado → entregado).

## Errores comunes

- **Repetir el mismo objeto en línea** en vez de crear un `type`.
- **Usar `string` cuando solo hay unas pocas opciones.** `'pendiente' | 'enviado'` detecta erratas como `'pendiete'`; `string` no.
- **Olvidar que una propiedad opcional puede ser `undefined`.** Compruébala antes de usarla.
- **Debatir eternamente `type` contra `interface`.** Los dos funcionan; lo importante es ser consistente en el proyecto.
- **Nombrar los tipos en minúscula.** `producto` se confunde con una variable; usa `Producto`.

## Para profundizar

- [Tipos de objeto (documentación oficial, en inglés)](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [Tipos cotidianos: uniones y literales (documentación oficial, en inglés)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

En resumen: con **`type`** o **`interface`** le pones nombre a la forma de tus datos. **`?`** marca lo opcional y **`readonly`** lo que no cambia. Las **uniones** (`|`) describen valores que pueden ser una cosa u otra, y los **tipos literales** limitan un valor a unas pocas opciones exactas, con autocompletado incluido.
