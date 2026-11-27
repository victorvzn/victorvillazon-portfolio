---
title: 'TypeScript desde cero: JavaScript que avisa antes de fallar'
description: 'Qué es TypeScript, por qué casi todas las ofertas de trabajo lo piden, cómo instalarlo y tus primeros tipos: string, number, boolean, arrays, objetos y funciones.'
date: 2026-11-27
series: typescript
tags: [TypeScript, JavaScript, Fundamentos]
draft: true
---

Seguro que te ha pasado: escribes `usuario.nombre`, recargas la página y aparece `Cannot read properties of undefined`. O sumas `"5" + 3` y te sale `"53"`. JavaScript te deja escribir casi cualquier cosa y **solo te avisa del error cuando el código ya se está ejecutando**, a veces delante del usuario.

**TypeScript** te avisa **antes**, mientras escribes, con una línea roja en el editor.

## ¿Qué es TypeScript?

TypeScript es **JavaScript con tipos**. Escribes el mismo JavaScript de siempre y, donde quieras, le dices qué tipo de dato esperas:

```ts
let edad: number = 25

edad = 'veinticinco'
// ❌ Error: Type 'string' is not assignable to type 'number'.
```

Tres ideas clave:

- **Todo JavaScript válido es TypeScript válido.** Puedes renombrar un `.js` a `.ts` y seguirá funcionando.
- **El navegador no entiende TypeScript.** Antes de ejecutarlo se **compila** (se traduce) a JavaScript normal, y los tipos desaparecen.
- **Los tipos solo existen mientras programas.** Sirven para que el editor y el compilador detecten errores; en el navegador no queda ni rastro de ellos.

¿Por qué aprenderlo? Porque en los equipos de hoy es lo normal: React, Vue, Next.js, Express... casi todos los proyectos nuevos se escriben en TypeScript, y aparece en la mayoría de ofertas de trabajo frontend.

## Paso 1: probarlo sin instalar nada

Entra en el [TypeScript Playground](https://www.typescriptlang.org/play) oficial. A la izquierda escribes TypeScript, a la derecha ves el JavaScript que genera y abajo los errores. Es perfecto para los ejemplos de este post.

## Paso 2: instalarlo en un proyecto

Necesitas Node.js (si no lo tienes, mira el post de Node.js desde cero). En una carpeta nueva:

```bash
npm init -y
npm install --save-dev typescript
npx tsc --init
```

- `--save-dev` lo instala como **dependencia de desarrollo**: solo se usa mientras programas.
- `npx tsc --init` crea el archivo `tsconfig.json`, la configuración del compilador. La opción más importante ya viene activada: `"strict": true`, el modo estricto. Déjala así.

Crea `hola.ts`:

```ts
const nombre: string = 'TypeScript'
console.log(`Hola, ${nombre}`)
```

Compílalo y ejecútalo:

```bash
npx tsc hola.ts   # genera hola.js
node hola.js
```

> **Atajo:** las versiones modernas de Node (22.18 o superior) ejecutan archivos `.ts` directamente con `node hola.ts`: simplemente borran los tipos. Ojo, **no comprueban errores**; para eso sigues necesitando `tsc` o el editor. Y si usas Vite (`npm create vite@latest` y elige la variante TypeScript), todo viene configurado.

## Los tipos básicos

```ts
let titulo: string = 'Aprender TypeScript'
let precio: number = 19.99     // enteros y decimales: todo es number
let publicado: boolean = false
```

### La inferencia: no hace falta escribirlo todo

TypeScript **deduce** el tipo a partir del valor inicial. Esto es lo mismo que lo de arriba:

```ts
let titulo = 'Aprender TypeScript' // TypeScript sabe que es string
titulo = 42
// ❌ Type 'number' is not assignable to type 'string'.
```

La regla práctica: **si TypeScript ya lo deduce, no lo escribas**. Escribe los tipos donde no puede adivinarlos, sobre todo en los **parámetros de las funciones**.

### Arrays

```ts
const lenguajes: string[] = ['HTML', 'CSS', 'JavaScript']
const notas: number[] = [18, 15, 20]

lenguajes.push(5)
// ❌ Argument of type 'number' is not assignable to parameter of type 'string'.
```

### Objetos

```ts
const producto: { nombre: string; precio: number; enStock: boolean } = {
  nombre: 'Teclado',
  precio: 120,
  enStock: true
}

console.log(producto.precio.toFixed(2))
console.log(producto.descuento)
// ❌ Property 'descuento' does not exist on type '{ nombre: string; ... }'.
```

Escribir el tipo del objeto así, en línea, se vuelve largo. En el siguiente post verás cómo darle un nombre con `type` e `interface`.

## Funciones con tipos

Aquí es donde TypeScript más te ayuda:

```ts
function calcularTotal(precio: number, cantidad: number): number {
  return precio * cantidad
}

calcularTotal(10, 3)      // ✅ 30
calcularTotal('10', 3)    // ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
calcularTotal(10)         // ❌ Expected 2 arguments, but got 1.
```

- Cada **parámetro** lleva su tipo: `precio: number`.
- Después de los paréntesis va el **tipo de lo que devuelve**: `: number`. Es opcional (TypeScript lo deduce), pero ayuda a leer la función.

Parámetros **opcionales** y **por defecto**:

```ts
function saludar(nombre: string, saludo?: string) {
  return `${saludo ?? 'Hola'}, ${nombre}`
}

function aplicarDescuento(precio: number, porcentaje = 10) {
  return precio - (precio * porcentaje) / 100
}

saludar('Ana')            // 'Hola, Ana'
aplicarDescuento(200)     // 180
```

El `?` significa "puede no venir". Dentro de la función, `saludo` es `string | undefined` (texto o nada), y por eso usamos `??` para darle un valor si falta.

Si una función no devuelve nada, su tipo de retorno es `void`:

```ts
function registrar(mensaje: string): void {
  console.log(`[LOG] ${mensaje}`)
}
```

## `any` y `unknown`: las salidas de emergencia

`any` significa "cualquier cosa, no compruebes nada". Apaga TypeScript para esa variable:

```ts
let dato: any = 'hola'
dato.metodoQueNoExiste() // TypeScript no se queja... y falla al ejecutar
```

Evítalo. Si de verdad no sabes qué tipo tiene algo (por ejemplo, lo que devuelve una API), usa **`unknown`**: también acepta cualquier valor, pero **te obliga a comprobar** qué es antes de usarlo:

```ts
let respuesta: unknown = JSON.parse('{"ok": true}')

respuesta.ok // ❌ 'respuesta' is of type 'unknown'.

if (typeof respuesta === 'object' && respuesta !== null && 'ok' in respuesta) {
  console.log(respuesta.ok) // ✅ ahora sí
}
```

Comprobar a mano así es incómodo. Por eso existe **Zod**, que tiene su propio módulo en esta serie.

## El error que TypeScript te ahorra

Un ejemplo real. En JavaScript esto falla en producción cuando el usuario no existe:

```ts
const usuarios = [{ id: 1, nombre: 'Ana' }]

const usuario = usuarios.find((u) => u.id === 2)
console.log(usuario.nombre)
// ❌ 'usuario' is possibly 'undefined'.
```

TypeScript sabe que `find` puede no encontrar nada y devolver `undefined`, así que te obliga a contemplarlo:

```ts
console.log(usuario?.nombre ?? 'Usuario no encontrado')
```

Ese es el valor de TypeScript: convierte errores que verías **en producción** en errores que ves **en el editor**.

## Tu turno

Crea `tienda.ts` y escribe, con tipos en los parámetros:

1. Una función `formatearPrecio(precio: number)` que devuelva un texto como `"S/ 19.90"`.
2. Una función `filtrarBaratos(precios: number[], maximo: number)` que devuelva solo los precios menores que `maximo`.
3. Llama a las dos con datos incorrectos (un texto en lugar de un número) y lee el mensaje de error. Después, compila con `npx tsc tienda.ts` y ejecuta el `.js`.

## Errores comunes

- **Llenar todo de `any`** para que se vayan las líneas rojas. Pierdes justo lo que TypeScript te da.
- **Escribir tipos que TypeScript ya deduce**, como `const total: number = 5`. No es un error, pero ensucia.
- **Pensar que los tipos validan datos al ejecutar.** Si una API devuelve otra cosa, TypeScript no se entera: los tipos desaparecen al compilar. Para validar datos reales necesitas Zod.
- **Desactivar `strict`.** Sin el modo estricto, TypeScript deja pasar muchos errores, como los `undefined`.
- **Confundir `String` con `string`.** Los tipos van en minúscula: `string`, `number`, `boolean`.

## Para profundizar

- [TypeScript para programadores de JavaScript (documentación oficial, en inglés)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [TypeScript Playground](https://www.typescriptlang.org/play)

En resumen: **TypeScript es JavaScript con tipos** que se comprueban **mientras escribes** y desaparecen al compilar. Deja que la **inferencia** trabaje, escribe los tipos en los **parámetros de las funciones**, evita **`any`** y usa **`unknown`** cuando no sepas qué llega. El premio: muchos errores dejan de llegar a producción.
