---
title: 'Zod avanzado: transform, pipe, uniones discriminadas y variables de entorno'
description: 'Transformar datos mientras los validas, encadenar esquemas con pipe, reutilizar esquemas con extend, pick y omit, uniones discriminadas, la diferencia entre input y output y validar el .env al arrancar.'
date: 2026-11-27
series: typescript
tags: [Zod, TypeScript, Avanzado]
draft: true
---

Hasta ahora Zod te ha servido para decir "sí" o "no" a unos datos. Pero Zod también puede **transformarlos**: convertir una API fea en los objetos limpios que usa tu app. Y hay un sitio donde casi nadie valida y debería: **las variables de entorno**.

## `transform`: validar y convertir en un paso

Imagina una API que devuelve fechas como texto, precios en céntimos y nombres en `snake_case`:

```ts
// Lo que llega de la API
{ "product_id": 7, "product_name": "Teclado", "price_cents": 12000, "created_at": "2026-11-27T10:00:00Z" }
```

Tu app quiere objetos con nombres en español, el precio en soles y una fecha de verdad:

```ts
import * as z from 'zod'

const ProductoApiSchema = z
  .object({
    product_id: z.number(),
    product_name: z.string(),
    price_cents: z.number().int(),
    created_at: z.iso.datetime()
  })
  .transform((api) => ({
    id: api.product_id,
    nombre: api.product_name,
    precio: api.price_cents / 100,
    creado: new Date(api.created_at)
  }))

const producto = ProductoApiSchema.parse(json)
// { id: 7, nombre: 'Teclado', precio: 120, creado: Date }
```

`.transform()` se ejecuta **después** de validar: recibe los datos ya comprobados y devuelve lo que quieras. Si mañana la API cambia, solo tocas el esquema; el resto de la app ni se entera. A esta capa se le suele llamar **adaptador**.

## Input y output: dos tipos por esquema

Con `transform`, el tipo de **entrada** y el de **salida** ya no son iguales:

```ts
type ProductoApi = z.input<typeof ProductoApiSchema>   // { product_id: number; product_name: string; ... }
type Producto = z.output<typeof ProductoApiSchema>     // { id: number; nombre: string; precio: number; creado: Date }
```

`z.infer` es lo mismo que `z.output`. Lo mismo pasa con `.default()` o `z.coerce`: la entrada acepta más cosas que lo que sale.

## `pipe`: encadenar esquemas

`pipe` pasa el resultado de un esquema a otro. Muy útil para "convertir y luego validar el resultado":

```ts
// Un texto que debe ser un número entre 1 y 100
const PaginaSchema = z
  .string()
  .transform((texto) => Number.parseInt(texto, 10))
  .pipe(z.number().int().min(1).max(100))

PaginaSchema.parse('5')     // 5
PaginaSchema.parse('abc')   // ❌ NaN no es un número válido
PaginaSchema.parse('500')   // ❌ mayor que 100
```

Así validas los **parámetros de la URL** (`?pagina=5`), que siempre son texto:

```ts
const FiltrosSchema = z.object({
  pagina: z.string().default('1').transform(Number).pipe(z.number().int().min(1)),
  orden: z.enum(['precio', 'nombre']).default('nombre'),
  q: z.string().trim().optional()
})

const params = Object.fromEntries(new URLSearchParams(location.search))
const filtros = FiltrosSchema.parse(params)
```

## Reutilizar esquemas: `extend`, `pick`, `omit`, `partial`

Como los utility types de TypeScript, pero para esquemas (y con validación incluida):

```ts
const UsuarioSchema = z.object({
  id: z.number(),
  nombre: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  creado: z.date()
})

// Para crear: sin id ni fecha (los pone el servidor)
const CrearUsuarioSchema = UsuarioSchema.omit({ id: true, creado: true })

// Para actualizar: lo mismo, pero todo opcional
const ActualizarUsuarioSchema = CrearUsuarioSchema.partial()

// Lo que devuelves al frontend: nunca la contraseña
const UsuarioPublicoSchema = UsuarioSchema.pick({ id: true, nombre: true })

// Un administrador es un usuario con algo más
const AdminSchema = UsuarioSchema.extend({ permisos: z.array(z.string()) })
```

Todos salen de `UsuarioSchema`. Cambia una regla ahí (por ejemplo, la longitud mínima del nombre) y cambia en todos.

## Uniones discriminadas

Lo que aprendiste en TypeScript, ahora validado:

```ts
const EventoSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('click'), x: z.number(), y: z.number() }),
  z.object({ tipo: z.literal('tecla'), tecla: z.string() }),
  z.object({ tipo: z.literal('scroll'), posicion: z.number() })
])

type Evento = z.infer<typeof EventoSchema>

EventoSchema.parse({ tipo: 'tecla', tecla: 'Enter' })  // ✅
EventoSchema.parse({ tipo: 'tecla', x: 10 })           // ❌ falta 'tecla'
```

Zod mira primero `tipo` y valida **solo contra la opción que corresponde**, con mensajes de error mucho más claros que una `z.union` normal.

## Reglas complejas con `superRefine`

`refine` devuelve un solo error. Si una regla puede generar **varios** errores, usa `superRefine` y añádelos tú:

```ts
const ReservaSchema = z
  .object({
    entrada: z.coerce.date(),
    salida: z.coerce.date(),
    huespedes: z.number().int().min(1)
  })
  .superRefine((reserva, ctx) => {
    if (reserva.salida <= reserva.entrada) {
      ctx.addIssue({ code: 'custom', message: 'La salida debe ser posterior a la entrada', path: ['salida'] })
    }
    const noches = (reserva.salida.getTime() - reserva.entrada.getTime()) / 86_400_000
    if (noches > 30) {
      ctx.addIssue({ code: 'custom', message: 'Máximo 30 noches', path: ['salida'] })
    }
  })
```

## Valida las variables de entorno al arrancar

Las variables de entorno (`process.env`) configuran tu app: la URL de la base de datos, claves de APIs, el puerto... Son **todas texto** y pueden **faltar**. El problema típico: olvidas una en el servidor, la app arranca "bien" y falla horas después, cuando alguien usa justo esa función.

La solución: validarlas **al arrancar** y que la app ni siquiera se encienda si falta algo.

```ts
// src/env.ts
import * as z from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.url(),
  DATABASE_TOKEN: z.string().min(1),
  ENVIAR_CORREOS: z.stringbool().default(false)
})

const resultado = EnvSchema.safeParse(process.env)

if (!resultado.success) {
  console.error('❌ Variables de entorno inválidas:\n' + z.prettifyError(resultado.error))
  process.exit(1)
}

export const env = resultado.data
```

Y en el resto de la app usas `env` en lugar de `process.env`:

```ts
import { env } from './env.js'

app.listen(env.PORT) // number, no string | undefined
```

Ventajas:

- **Falla rápido y claro**: "falta `DATABASE_URL`" al arrancar, no un error raro a las 3 de la mañana.
- **Tipos correctos**: `env.PORT` es `number` y `env.ENVIAR_CORREOS` es `boolean`.
- **Autocompletado** de todas las variables.

`z.stringbool()` convierte textos como `'true'`, `'1'`, `'yes'` u `'on'` en `true`, y `'false'`, `'0'`, `'no'` u `'off'` en `false`. Es justo lo que necesitas para variables de entorno, porque `z.coerce.boolean()` convertiría `'false'` en `true` (cualquier texto no vacío es "verdadero" en JavaScript).

## Tu turno

1. Escribe un esquema que transforme la respuesta de `https://dummyjson.com/users/1` en `{ id, nombreCompleto, edad, ciudad }` (`nombreCompleto` junta `firstName` y `lastName`; `ciudad` está en `address.city`).
2. Crea `CrearProductoSchema` y `ActualizarProductoSchema` a partir de un `ProductoSchema` con `omit` y `partial`.
3. Crea un `env.ts` para un proyecto tuyo y prueba a arrancar sin una variable obligatoria.

## Errores comunes

- **Usar `z.coerce.boolean()` para `'false'`.** Da `true`. Usa `z.stringbool()`.
- **Confundir los tipos de entrada y salida** con `transform`. Lo que envías es `z.input`; lo que recibes tras validar, `z.output`.
- **Leer `process.env` por toda la app.** Valídalo una vez en un archivo y exporta el resultado.
- **Hacer transformaciones que pueden fallar sin validar después.** Usa `.pipe()` para validar el resultado de un `transform`.
- **Copiar esquemas a mano** para crear o actualizar. Deriva con `omit`, `pick`, `partial` y `extend`.

## Para profundizar

- [API de Zod: transform, pipe y más (en inglés)](https://zod.dev/api)
- [Variables de entorno en Node.js (en inglés)](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

En resumen: **`transform`** valida y convierte en un paso, **`pipe`** valida el resultado de una conversión y **`extend`/`pick`/`omit`/`partial`** reutilizan esquemas. **`discriminatedUnion`** valida estados con mensajes claros y **`superRefine`** permite reglas con varios errores. Y valida siempre tus **variables de entorno** al arrancar: que la app no se encienda si falta algo.
