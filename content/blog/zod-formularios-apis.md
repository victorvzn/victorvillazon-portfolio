---
title: 'Zod en el mundo real: formularios, coerción y errores por campo'
description: 'Cómo validar un formulario HTML con Zod, convertir textos a números con z.coerce, comprobar que dos contraseñas coinciden con refine y mostrar cada error junto a su campo.'
date: 2026-11-27
series: typescript
tags: [Zod, Formularios, Validación, Intermedio]
draft: true
---

Ya sabes crear esquemas y validar con `safeParse`. Ahora el caso más común del día a día: **un formulario**. Y aquí aparecen dos problemas que no tenías con las APIs:

1. **Todo lo que sale de un formulario es texto.** Aunque el input sea `type="number"`, su valor es `"25"`, no `25`.
2. **Los errores tienen que mostrarse junto a cada campo**, no en la consola.

## El formulario

```html
<form id="registro" novalidate>
  <label>Nombre <input name="nombre"></label>
  <small data-error="nombre"></small>

  <label>Email <input name="email" type="email"></label>
  <small data-error="email"></small>

  <label>Edad <input name="edad" type="number"></label>
  <small data-error="edad"></small>

  <label>Contraseña <input name="password" type="password"></label>
  <small data-error="password"></small>

  <label>Repite la contraseña <input name="confirmar" type="password"></label>
  <small data-error="confirmar"></small>

  <label><input name="terminos" type="checkbox"> Acepto los términos</label>
  <small data-error="terminos"></small>

  <button>Crear cuenta</button>
</form>
```

`novalidate` desactiva la validación nativa del navegador para que la haga Zod. Cada `<small data-error="...">` es el hueco donde mostraremos el error de ese campo.

## Leer el formulario como objeto

```ts
const formulario = document.querySelector<HTMLFormElement>('#registro')!

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault()
  const datos = Object.fromEntries(new FormData(formulario))
  console.log(datos)
  // { nombre: 'Ana', email: 'ana@correo.com', edad: '25', password: '...', confirmar: '...', terminos: 'on' }
})
```

Fíjate: `edad` es `'25'` (texto) y el checkbox marcado vale `'on'`; si no está marcado, **ni siquiera aparece**.

## `z.coerce`: convertir antes de validar

```ts
z.number().parse('25')         // ❌ Error: esperaba number, recibió string
z.coerce.number().parse('25')  // ✅ 25
```

`z.coerce.number()` primero hace `Number(valor)` y luego valida que el resultado sea un número. Igual existen `z.coerce.boolean()` o `z.coerce.date()`.

> ⚠️ `Number('')` es `0`, así que un campo de edad **vacío** pasaría como `0`. Por eso le añadimos un `.min()` que tenga sentido, como `.min(18)`.

Para el checkbox, lo más claro es comprobar el valor `'on'`:

```ts
terminos: z.literal('on', { error: 'Debes aceptar los términos' })
```

Si no está marcado, `terminos` es `undefined` y la validación falla con nuestro mensaje.

## El esquema completo

```ts
import * as z from 'zod'

const RegistroSchema = z
  .object({
    nombre: z.string().trim().min(2, { error: 'Mínimo 2 letras' }),
    email: z.email({ error: 'Escribe un email válido' }),
    edad: z.coerce.number().int().min(18, { error: 'Debes ser mayor de edad' }),
    password: z
      .string()
      .min(8, { error: 'Mínimo 8 caracteres' })
      .regex(/[0-9]/, { error: 'Debe incluir al menos un número' }),
    confirmar: z.string(),
    terminos: z.literal('on', { error: 'Debes aceptar los términos' })
  })
  .refine((datos) => datos.password === datos.confirmar, {
    error: 'Las contraseñas no coinciden',
    path: ['confirmar']
  })

type Registro = z.infer<typeof RegistroSchema>
```

Lo nuevo:

- **`.trim()`** quita espacios al principio y al final **antes** de validar. `'  '` ya no cuenta como nombre.
- **`.regex()`** comprueba un patrón: aquí, que haya al menos un dígito.
- **`.refine()`** añade una regla **propia**. Recibe los datos y devuelve `true` si son válidos. Como compara dos campos, va en el objeto entero, y `path: ['confirmar']` indica a qué campo pertenece el error.

## Errores por campo con `z.flattenError`

`safeParse` te da una lista de problemas. Para un formulario es más cómodo tenerlos **agrupados por campo**:

```ts
const resultado = RegistroSchema.safeParse(datos)

if (!resultado.success) {
  const { fieldErrors } = z.flattenError(resultado.error)
  console.log(fieldErrors)
  // { email: ['Escribe un email válido'], terminos: ['Debes aceptar los términos'] }
}
```

> Un detalle de Zod: el `.refine()` del objeto **solo se ejecuta cuando todos los campos son válidos**. Así que "Las contraseñas no coinciden" aparece cuando ya no queda ningún otro error. Tiene sentido: no vale la pena comparar contraseñas si el email aún está mal.

## Juntándolo todo

```ts
function mostrarErrores(errores: Partial<Record<string, string[]>>) {
  formulario.querySelectorAll<HTMLElement>('[data-error]').forEach((hueco) => {
    const campo = hueco.dataset.error!
    hueco.textContent = errores[campo]?.[0] ?? ''

    const input = formulario.elements.namedItem(campo) as HTMLInputElement | null
    input?.setAttribute('aria-invalid', String(Boolean(errores[campo])))
  })
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault()
  const datos = Object.fromEntries(new FormData(formulario))
  const resultado = RegistroSchema.safeParse(datos)

  if (!resultado.success) {
    mostrarErrores(z.flattenError(resultado.error).fieldErrors)
    return
  }

  mostrarErrores({})
  const registro: Registro = resultado.data // edad ya es number, nombre ya está sin espacios
  console.log('Enviando al servidor:', registro)
})
```

Detalles que marcan la diferencia:

- Mostramos **solo el primer error** de cada campo (`[0]`), para no abrumar.
- `aria-invalid="true"` le dice a los lectores de pantalla qué campos tienen errores (lo viste en el post de formularios accesibles). Con CSS puedes pintarlos: `[aria-invalid="true"] { border-color: crimson; }`.
- `resultado.data` ya viene **transformado**: `edad` es un número y `nombre` no tiene espacios.

## Comparte el esquema con el backend

Un usuario puede saltarse tu formulario y enviar lo que quiera directamente a tu API con herramientas como `curl`. La validación del frontend es para **la experiencia de usuario**; la del backend es para **la seguridad**.

Si tu frontend y tu backend usan TypeScript, pon el esquema en un archivo compartido (`schemas/registro.ts`) y úsalo en los dos lados. Lo verás en el post de Express con validación.

## ¿Y en React?

La idea es la misma. Las librerías de formularios más usadas, como **React Hook Form**, aceptan un esquema de Zod directamente a través de un *resolver*. Pero entender cómo funciona a mano, como aquí, te permite usarlas sin magia.

## Tu turno

1. Añade un campo `telefono` **opcional** que, si se rellena, tenga 9 dígitos. Pista: un campo vacío llega como `''`, no como `undefined`; investiga `z.literal('')` dentro de una unión, o `.or()`.
2. Añade una fecha de nacimiento con `z.coerce.date()` y un `.refine()` que compruebe que no es una fecha futura.
3. Valida cada campo **al salir de él** (evento `blur`) además de al enviar.

## Errores comunes

- **Olvidar que todo llega como texto.** Usa `z.coerce` para números y fechas.
- **No contar con que `Number('')` es `0`.** Pon un mínimo razonable o trata el vacío aparte.
- **Poner el `refine` de dos campos dentro de uno de ellos.** Un campo no "ve" a los demás; el `refine` va en el objeto y usa `path`.
- **Mostrar todos los errores de golpe en un `alert`.** Ponlos junto a cada campo.
- **Confiar solo en la validación del frontend.** Valida también en el servidor.

## Para profundizar

- [Coerción en Zod (en inglés)](https://zod.dev/api#coercion)
- [Formatear errores en Zod (en inglés)](https://zod.dev/error-formatting)

En resumen: en un formulario **todo es texto**, así que usa **`z.coerce`** para convertir antes de validar, **`.trim()`** para limpiar y **`.refine()`** para reglas propias entre campos. Con **`z.flattenError`** tienes los errores agrupados por campo para mostrarlos junto a cada input, y `resultado.data` te da los datos ya limpios y con el tipo correcto.
