---
title: 'TypeScript: genéricos y utility types (Partial, Pick, Omit, Record)'
description: 'Qué son los genéricos y por qué los ves en useState<T> o Promise<T>, cómo escribir funciones genéricas y cómo crear tipos nuevos a partir de otros con Partial, Pick, Omit y Record.'
date: 2026-11-27
series: typescript
tags: [TypeScript, Genéricos, Intermedio]
draft: true
---

Tarde o temprano verás código como `useState<string>()`, `Promise<Usuario>` o `Array<number>`. Esos `<...>` son **genéricos**, y entenderlos es el salto de "uso TypeScript" a "lo aprovecho de verdad".

## El problema: funciones que sirven para cualquier tipo

Quieres una función que devuelva el primer elemento de un array. ¿Qué tipo le pones?

```ts
function primero(lista: number[]): number | undefined {
  return lista[0]
}
```

Solo sirve para números. Si la quieres para textos, tendrías que copiarla. Y si usas `any`:

```ts
function primero(lista: any[]): any {
  return lista[0]
}

const nombre = primero(['Ana', 'Luis']) // any: TypeScript ya no te ayuda
nombre.toFixed(2) // no se queja... y falla al ejecutar
```

Pierdes la información del tipo.

## La solución: un parámetro de tipo

```ts
function primero<T>(lista: T[]): T | undefined {
  return lista[0]
}

const numero = primero([10, 20, 30])     // number | undefined
const nombre = primero(['Ana', 'Luis'])  // string | undefined
```

`<T>` es un **parámetro de tipo**: un hueco que se rellena cuando llamas a la función. Se lee "para algún tipo `T`, recibo una lista de `T` y devuelvo un `T`". TypeScript **deduce** `T` mirando lo que le pasas.

Es como un parámetro normal, pero para tipos. Por convención se usa `T` (de *type*), aunque puedes ponerle un nombre más claro, como `Elemento`.

## Genéricos que ya usas sin saberlo

```ts
const notas: Array<number> = [18, 20]             // igual que number[]
const promesa: Promise<string> = Promise.resolve('hola')
const precios = new Map<string, number>()         // claves string, valores number
precios.set('teclado', 120)
```

Y en React:

```tsx
const [usuario, setUsuario] = useState<Usuario | null>(null)
```

Ahí le dices a `useState` qué tipo guardará, porque con el valor inicial `null` no podría adivinarlo.

## Un caso real: una función para pedir datos

```ts
async function obtenerJson<T>(url: string): Promise<T> {
  const respuesta = await fetch(url)
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
  return respuesta.json() as Promise<T>
}

type Producto = { id: number; title: string; price: number }

const producto = await obtenerJson<Producto>('https://dummyjson.com/products/1')
console.log(producto.title) // ✅ autocompletado
```

Aquí escribimos el tipo a mano (`<Producto>`) porque TypeScript no puede deducirlo de una URL.

> ⚠️ **Cuidado:** esto es una **promesa** que le haces a TypeScript, no una comprobación. Si la API devuelve otra cosa, TypeScript no se entera. Para validar de verdad lo que llega, usa Zod (lo verás en el módulo siguiente).

## Restringir un genérico con `extends`

A veces `T` no puede ser *cualquier* cosa. Por ejemplo, para ordenar por `id`, cada elemento debe tener un `id`:

```ts
function ordenarPorId<T extends { id: number }>(lista: T[]): T[] {
  return lista.toSorted((a, b) => a.id - b.id)
}

ordenarPorId([{ id: 3, nombre: 'C' }, { id: 1, nombre: 'A' }]) // ✅
ordenarPorId(['a', 'b'])
// ❌ Type 'string' does not satisfy the constraint '{ id: number; }'.
```

`T extends { id: number }` significa "`T` puede ser cualquier tipo **que tenga** un `id` numérico". Y como devuelve `T[]`, conservas el resto de propiedades (`nombre`).

## `keyof`: las claves de un tipo

```ts
type Producto = { id: number; nombre: string; precio: number }

type ClaveProducto = keyof Producto // 'id' | 'nombre' | 'precio'
```

Combinado con genéricos, permite funciones muy seguras:

```ts
function obtenerValores<T, K extends keyof T>(lista: T[], clave: K): T[K][] {
  return lista.map((elemento) => elemento[clave])
}

const productos: Producto[] = [
  { id: 1, nombre: 'Teclado', precio: 120 },
  { id: 2, nombre: 'Mouse', precio: 45 }
]

obtenerValores(productos, 'precio')  // number[]
obtenerValores(productos, 'nombre')  // string[]
obtenerValores(productos, 'stock')   // ❌ el editor solo te deja elegir claves que existen
```

`T[K]` significa "el tipo de la propiedad `K` dentro de `T`".

## Utility types: tipos a partir de otros tipos

TypeScript trae **tipos genéricos ya hechos** para transformar tipos. Partimos de este:

```ts
type Usuario = {
  id: number
  nombre: string
  email: string
  password: string
}
```

### `Partial<T>`: todo opcional

Perfecto para actualizar solo algunos campos:

```ts
function actualizarUsuario(id: number, cambios: Partial<Usuario>) {
  // cambios puede tener nombre, email... o solo uno de ellos
}

actualizarUsuario(1, { email: 'nuevo@correo.com' }) // ✅
```

### `Pick<T, Claves>`: quedarte con algunas propiedades

```ts
type UsuarioPublico = Pick<Usuario, 'id' | 'nombre'>
// { id: number; nombre: string }
```

### `Omit<T, Claves>`: quitar algunas propiedades

```ts
type UsuarioSinPassword = Omit<Usuario, 'password'>
type NuevoUsuario = Omit<Usuario, 'id'> // al crear, el id lo pone la base de datos
```

### `Required<T>` y `Readonly<T>`

```ts
type Config = { tema?: 'claro' | 'oscuro'; idioma?: string }

type ConfigCompleta = Required<Config>  // todo obligatorio
type ConfigFija = Readonly<Config>      // nada se puede modificar
```

### `Record<Claves, Valor>`: objetos tipo diccionario

```ts
type Rol = 'admin' | 'editor' | 'lector'

const permisos: Record<Rol, string[]> = {
  admin: ['leer', 'escribir', 'borrar'],
  editor: ['leer', 'escribir'],
  lector: ['leer']
}
```

Si añades un rol nuevo a `Rol` y te olvidas de él en `permisos`, TypeScript te avisa.

### `ReturnType` y `Awaited`

Para sacar el tipo de lo que devuelve una función que no escribiste tú:

```ts
function crearSesion() {
  return { token: 'abc', expira: Date.now() + 3600_000 }
}

type Sesion = ReturnType<typeof crearSesion>  // { token: string; expira: number }

async function cargarSesion() {
  return crearSesion()
}

type SesionCargada = Awaited<ReturnType<typeof cargarSesion>> // quita el Promise
```

## La idea más importante: una sola fuente de verdad

Fíjate en que `UsuarioPublico`, `NuevoUsuario` y `UsuarioSinPassword` **salen de `Usuario`**. Si mañana añades `avatar: string` a `Usuario`, todos se actualizan solos. Si los hubieras escrito a mano, tendrías que acordarte de cambiar cuatro sitios.

## Tu turno

1. Escribe `ultimo<T>(lista: T[]): T | undefined`.
2. Escribe `agruparPor<T, K extends keyof T>(lista: T[], clave: K)` que devuelva un objeto con los elementos agrupados por esa clave. (Pista: el resultado puede tiparse como `Record<string, T[]>`.)
3. A partir de un tipo `Producto` con `id`, `nombre`, `precio` y `stock`, crea `ProductoEnCarrito` con `Pick` y una propiedad extra `cantidad`.

## Errores comunes

- **Usar `any` en lugar de un genérico.** Si el tipo de salida depende del de entrada, es un genérico.
- **Escribir `<T>` cuando no aporta nada.** Si `T` aparece una sola vez, probablemente no necesitas un genérico.
- **Creer que `obtenerJson<Producto>()` valida la respuesta.** Solo le *dice* a TypeScript qué esperar.
- **Copiar tipos a mano** en vez de derivarlos con `Pick`, `Omit` o `Partial`.
- **Olvidar el `typeof`** en `ReturnType<typeof miFuncion>`: `ReturnType` necesita un tipo, no la función.

## Para profundizar

- [Genéricos (documentación oficial, en inglés)](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Utility types (documentación oficial, en inglés)](https://www.typescriptlang.org/docs/handbook/utility-types.html)

En resumen: un **genérico** (`<T>`) es un parámetro de tipo que hace que una función sirva para cualquier tipo **sin perder la información**. **`extends`** lo restringe y **`keyof`** te da las claves de un tipo. Los **utility types** (`Partial`, `Pick`, `Omit`, `Record`, `ReturnType`) crean tipos nuevos a partir de otros, para tener **una sola fuente de verdad**.
