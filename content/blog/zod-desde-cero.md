---
title: 'Zod desde cero: valida datos de verdad (y saca los tipos gratis)'
description: 'Por qué TypeScript no protege tu app de los datos que llegan de fuera, qué es Zod, cómo crear esquemas, validar con parse y safeParse, y obtener el tipo con z.infer.'
date: 2026-11-27
series: typescript
tags: [Zod, TypeScript, Validación]
draft: true
---

Recuerda la advertencia de los posts anteriores: **los tipos de TypeScript desaparecen al compilar**. Si escribes esto:

```ts
type Usuario = { id: number; nombre: string }

const respuesta = await fetch('/api/usuario')
const usuario: Usuario = await respuesta.json()
```

TypeScript te **cree**. Pero si la API devuelve `{ "id": "1", "name": "Ana" }` (el `id` como texto y `name` en vez de `nombre`), tu app recibe basura y falla más adelante, en un sitio que no tiene nada que ver.

Todo lo que **viene de fuera** de tu código es desconocido: respuestas de APIs, formularios, `localStorage`, la URL, variables de entorno. Para esos datos necesitas una **validación en tiempo de ejecución**. Eso es **Zod**.

## ¿Qué es Zod?

Zod es una librería para describir **cómo deben ser tus datos** (un **esquema**) y **comprobar** si unos datos reales lo cumplen. Y lo mejor: del esquema saca el tipo de TypeScript automáticamente. Escribes la forma de los datos **una sola vez**.

Instálalo en un proyecto con Node (funciona igual con JavaScript o TypeScript):

```bash
npm install zod
```

## Tu primer esquema

```ts
import * as z from 'zod'

const UsuarioSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  email: z.email()
})
```

Se lee casi en voz alta: "un objeto con un `id` numérico, un `nombre` de texto y un `email` válido".

## Validar con `parse`

```ts
const bueno = UsuarioSchema.parse({ id: 1, nombre: 'Ana', email: 'ana@correo.com' })
console.log(bueno) // { id: 1, nombre: 'Ana', email: 'ana@correo.com' }

UsuarioSchema.parse({ id: '1', nombre: 'Ana', email: 'no-es-un-email' })
// ❌ Lanza un ZodError: id esperaba number y recibió string; email no es válido
```

`parse` hace dos cosas:

- Si los datos cumplen el esquema, **los devuelve** (ya tipados).
- Si no, **lanza un error** con la lista de problemas.

## Validar sin lanzar errores: `safeParse`

Muchas veces no quieres que el programa se detenga, sino mostrar un mensaje. Para eso está `safeParse`, que **nunca lanza**: devuelve un objeto con el resultado.

```ts
const resultado = UsuarioSchema.safeParse({ id: 1, nombre: '', email: 'ana@' })

if (resultado.success) {
  console.log('Usuario válido:', resultado.data)
} else {
  for (const problema of resultado.error.issues) {
    console.log(`${problema.path.join('.')}: ${problema.message}`)
  }
}
// email: Invalid email address
```

| Método | Si es válido | Si no es válido |
| --- | --- | --- |
| `parse(datos)` | devuelve los datos | **lanza** un `ZodError` |
| `safeParse(datos)` | `{ success: true, data }` | `{ success: false, error }` |

## Los tipos, gratis: `z.infer`

```ts
type Usuario = z.infer<typeof UsuarioSchema>
// { id: number; nombre: string; email: string }
```

Ya no escribes el `type Usuario` a mano: **sale del esquema**. Si mañana añades un campo al esquema, el tipo se actualiza solo. Una sola fuente de verdad que sirve para validar **y** para tipar.

## Los bloques básicos

```ts
z.string()
z.number()
z.boolean()
z.date()
z.array(z.string())                    // string[]
z.enum(['admin', 'editor', 'lector'])  // 'admin' | 'editor' | 'lector'
z.literal('activo')                    // exactamente 'activo'
z.union([z.string(), z.number()])      // string | number
```

### Formatos de texto ya hechos

```ts
z.email()
z.url()
z.uuid()
z.iso.date()   // '2026-11-27'
```

### Restricciones

```ts
const ProductoSchema = z.object({
  nombre: z.string().min(2).max(60),
  precio: z.number().positive(),
  stock: z.number().int().nonnegative(),  // entero, 0 o más
  etiquetas: z.array(z.string()).max(5)
})
```

### Opcional, nulo y valor por defecto

```ts
const PerfilSchema = z.object({
  nombre: z.string(),
  bio: z.string().optional(),            // string | undefined
  avatar: z.url().nullable(),            // string | null
  tema: z.enum(['claro', 'oscuro']).default('claro')
})

PerfilSchema.parse({ nombre: 'Ana', avatar: null })
// { nombre: 'Ana', avatar: null, tema: 'claro' }
```

## Mensajes de error en español

Por defecto los mensajes están en inglés. Puedes poner los tuyos con la opción `error`:

```ts
const RegistroSchema = z.object({
  nombre: z.string().min(2, { error: 'El nombre debe tener al menos 2 letras' }),
  email: z.email({ error: 'Escribe un email válido' }),
  edad: z.number({ error: 'La edad debe ser un número' }).int().min(18, { error: 'Debes ser mayor de edad' })
})
```

> Zod también trae traducciones completas: `z.config(z.locales.es())` pone todos los mensajes por defecto en español.

## Ejemplo completo: validar una API

Volvamos al problema del principio, con la API gratuita [DummyJSON](https://dummyjson.com):

```ts
import * as z from 'zod'

const ProductoSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  rating: z.number().min(0).max(5)
})

const RespuestaSchema = z.object({
  products: z.array(ProductoSchema),
  total: z.number()
})

type Producto = z.infer<typeof ProductoSchema>

async function obtenerProductos(): Promise<Producto[]> {
  const respuesta = await fetch('https://dummyjson.com/products?limit=3')
  const json: unknown = await respuesta.json()

  const resultado = RespuestaSchema.safeParse(json)
  if (!resultado.success) {
    console.error('La API devolvió datos inesperados:', z.prettifyError(resultado.error))
    return []
  }

  return resultado.data.products
}

obtenerProductos().then((productos) => console.log(productos))
```

Fíjate en dos detalles:

- El JSON lo guardamos como **`unknown`**: no sabemos qué es hasta validarlo.
- `resultado.data.products` ya es `Producto[]` **de verdad**, no por fe. Y como la API devuelve muchos más campos (`description`, `brand`...), Zod los **elimina** y te quedas solo con los que declaraste.

`z.prettifyError` convierte el error en un texto legible, muy útil para depurar.

## Tu turno

1. Crea un `TareaSchema` con `id` (número entero positivo), `texto` (entre 1 y 100 caracteres), `hecha` (booleano, por defecto `false`) y `prioridad` (`'baja' | 'media' | 'alta'`).
2. Saca el tipo `Tarea` con `z.infer`.
3. Valida con `safeParse` estos datos y muestra cada problema: `{ id: -1, texto: '', prioridad: 'urgente' }`.
4. Guarda una lista de tareas en `localStorage` y, al leerla, valídala con `z.array(TareaSchema)`. Si no es válida, empieza con una lista vacía.

## Errores comunes

- **Escribir el `type` a mano y además el esquema.** Usa `z.infer` y ten una sola fuente de verdad.
- **Usar `parse` sin `try/catch`** en sitios donde un error no debería tumbar la app. Ahí va `safeParse`.
- **Validar solo en el frontend.** Un usuario puede saltarse tu formulario; el backend debe validar también (con el mismo esquema, si compartes código).
- **Esperar que `z.number()` acepte `"42"`.** Un texto no es un número. Para datos de formularios o de la URL se usa `z.coerce`, en el siguiente post.
- **Seguir ejemplos antiguos.** Zod 4 cambió algunas cosas: `z.email()` en lugar de `z.string().email()` y `{ error }` en lugar de `{ message }` (las formas antiguas siguen funcionando, pero están desaconsejadas).

## Para profundizar

- [Documentación oficial de Zod (en inglés)](https://zod.dev)
- [Personalizar errores en Zod (en inglés)](https://zod.dev/error-customization)

En resumen: TypeScript **no valida** lo que llega de fuera. **Zod** describe la forma de tus datos con un **esquema**, la comprueba con **`parse`** (lanza) o **`safeParse`** (devuelve el resultado) y te regala el tipo con **`z.infer`**. Valida todo lo que venga de una API, un formulario o el almacenamiento.
