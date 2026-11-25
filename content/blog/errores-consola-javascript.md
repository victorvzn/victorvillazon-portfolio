---
title: 'Los 5 errores de consola más comunes (y qué significan)'
description: 'is not defined, cannot read properties of undefined, is not a function... Aprende a leer los errores de JavaScript en vez de entrar en pánico.'
date: 2026-11-25
series: javascript
tags: [JavaScript, Debugging, Fundamentos]
draft: true
order: 30
---

Un texto rojo en la consola da miedo al principio. Pero un error es una **pista**: te dice **qué** pasó y **en qué línea**. Hoy vamos a leer los cinco que más vas a ver.

## Cómo leer un error

```
Uncaught TypeError: Cannot read properties of undefined (reading 'nombre')
    at mostrarUsuario (app.js:12:24)
```

- **El tipo** (`TypeError`): la familia del error.
- **El mensaje**: qué pasó, en inglés.
- **Dónde** (`app.js:12:24`): archivo, línea y columna. En DevTools puedes hacer clic y te lleva a la línea exacta.

Los ejemplos de este post usan `try`/`catch` para mostrar el error en la consola sin detener el resto del código. El texto exacto cambia un poco según el navegador.

## 1. `X is not defined`

```js playground=not-defined
try {
  const nombre = 'Ana'
  console.log(nombr)
} catch (error) {
  console.log(error.name + ': ' + error.message)
}
```

**Qué significa:** usaste una variable que **no existe**.

**Causas típicas:** un error de tipeo (`nombr`), usar la variable fuera de las llaves donde se creó, o usarla antes de declararla.

## 2. `Cannot read properties of undefined`

El más famoso de todos.

```js playground=undefined
try {
  const usuario = { nombre: 'Ana' }
  console.log(usuario.direccion.ciudad)
} catch (error) {
  console.log(error.name + ': ' + error.message)
}
```

**Qué significa:** intentaste leer una propiedad (`.ciudad`) de algo que es `undefined` (`usuario.direccion` no existe).

**Cómo arreglarlo:** revisa por qué ese valor no existe. Si es normal que a veces falte, usa el **encadenamiento opcional** `?.`, que devuelve `undefined` en vez de romper:

```js playground=optional-chaining
const usuario = { nombre: 'Ana' }
console.log(usuario.direccion?.ciudad) // undefined, sin error
console.log(usuario.direccion?.ciudad ?? 'Sin ciudad') // 'Sin ciudad'
```

Con `null` pasa lo mismo: `Cannot read properties of null`. Muy común cuando `querySelector` no encontró el elemento.

## 3. `X is not a function`

```js playground=not-function
try {
  const precio = 100
  precio()
} catch (error) {
  console.log(error.name + ': ' + error.message)
}

try {
  const usuario = { nombre: 'Ana' }
  usuario.nombre.toUppercase() // la U debería ser mayúscula: toUpperCase
} catch (error) {
  console.log(error.name + ': ' + error.message)
}
```

**Qué significa:** intentaste **llamar** con `()` algo que no es una función.

**Causas típicas:** un método mal escrito (JavaScript distingue mayúsculas y minúsculas), o usar `map` sobre algo que no es un array.

## 4. `Assignment to constant variable`

```js playground=const
try {
  const total = 0
  total = 10
} catch (error) {
  console.log(error.name + ': ' + error.message)
}
```

**Qué significa:** intentaste **reasignar** una variable `const`.

**Cómo arreglarlo:** si de verdad tiene que cambiar, usa `let`. Lo vimos en el post de `let`, `const` y `var`.

## 5. `Unexpected token`

Este no se puede atrapar con `try`/`catch`, porque pasa **antes** de que el código se ejecute: JavaScript ni siquiera entiende lo que escribiste.

```js
const usuario = { nombre: 'Ana', edad: 25   // falta cerrar la llave }
```

```
Uncaught SyntaxError: Unexpected token
```

**Qué significa:** hay un error de **sintaxis**: una llave, paréntesis o coma que sobra o que falta.

**Cómo arreglarlo:** mira la línea que indica **y la anterior**. Tu editor suele marcarlo en rojo antes de que lo ejecutes.

## Tu kit de supervivencia

1. **Lee el mensaje completo.** De verdad. La mitad de las veces te dice exactamente qué pasa.
2. **Ve a la línea** que te indica.
3. **Usa `console.log`** justo antes de la línea que falla para ver qué valor tienen tus variables.
4. **Copia el mensaje y búscalo.** Alguien ya tuvo ese error antes que tú.

## Para profundizar

- [Referencia de errores de JavaScript en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Errors)
- [Encadenamiento opcional en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

En resumen: el error te dice **qué** pasó y **dónde**. `not defined` es una variable que no existe, `of undefined` es leer de algo vacío, `not a function` es llamar algo que no es función, y `Unexpected token` es un error de escritura.
