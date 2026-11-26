---
title: 'Métodos de texto en JavaScript: los que usarás todos los días'
description: 'Mayúsculas, recortar espacios, buscar, cortar, reemplazar y rellenar textos. Los métodos de string más útiles con ejemplos reales de formularios.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Fundamentos, Strings]
draft: true
---

Los textos (*strings*) están en todas partes: nombres de usuario, emails, búsquedas, mensajes. Y casi nunca llegan como los necesitas: con espacios de más, en mayúsculas, con el formato equivocado. JavaScript trae **métodos** para arreglarlos.

Antes de empezar, una idea clave: **los métodos de texto nunca cambian el texto original**. Siempre devuelven uno nuevo. Si quieres conservar el resultado, guárdalo en una variable.

```js playground=inmutable
const nombre = 'ana'
nombre.toUpperCase()
console.log(nombre) // 'ana': no cambió

const enMayusculas = nombre.toUpperCase()
console.log(enMayusculas) // 'ANA'
```

## Longitud y letras sueltas

```js playground=longitud
const clave = 'secreto123'

console.log(clave.length)  // 10 caracteres
console.log(clave[0])      // 's': la primera letra (posición 0)
console.log(clave.at(-1))  // '3': la última

if (clave.length < 8) {
  console.log('La contraseña es demasiado corta')
} else {
  console.log('Longitud correcta')
}
```

Como en los arrays, las posiciones empiezan en 0.

## Mayúsculas y minúsculas

```js playground=mayusculas
const email = 'Ana.Torres@Gmail.COM'

console.log(email.toLowerCase()) // 'ana.torres@gmail.com'
console.log(email.toUpperCase()) // 'ANA.TORRES@GMAIL.COM'

// Comparar sin que importen las mayúsculas
const respuesta = 'SÍ'
console.log(respuesta.toLowerCase() === 'sí') // true
```

Normalizar a minúsculas antes de comparar o guardar es un hábito que te ahorrará muchos bugs: `'Ana@gmail.com'` y `'ana@gmail.com'` son el mismo email.

## trim: quitar espacios sobrantes

```js playground=trim
const escrito = '   Luis Ramírez   '

console.log(`[${escrito.trim()}]`)       // '[Luis Ramírez]'
console.log(`[${escrito.trimStart()}]`)  // '[Luis Ramírez   ]'
console.log(`[${escrito.trimEnd()}]`)    // '[   Luis Ramírez]'

// Un campo "vacío" que en realidad tiene espacios
const comentario = '    '
console.log(comentario.trim() === '') // true: está vacío de verdad
```

Usa `trim()` con **todo** lo que escriba el usuario. Un espacio accidental al final es la causa típica de "mi login no funciona".

## Buscar dentro de un texto

```js playground=buscar
const frase = 'Aprende JavaScript desde cero'

console.log(frase.includes('Script'))      // true: ¿contiene?
console.log(frase.startsWith('Aprende'))   // true: ¿empieza por?
console.log(frase.endsWith('cero'))        // true: ¿termina en?
console.log(frase.indexOf('desde'))        // 19: en qué posición empieza
console.log(frase.indexOf('Python'))       // -1: no está

const archivo = 'foto-perfil.png'
if (archivo.endsWith('.png') || archivo.endsWith('.jpg')) {
  console.log('Es una imagen válida')
}
```

Todos distinguen mayúsculas: `'Hola'.includes('hola')` es `false`. Si no te importan, pasa los dos textos a minúsculas antes.

## Cortar: slice

`slice(desde, hasta)` devuelve un trozo del texto. El `hasta` **no** se incluye:

```js playground=slice
const fecha = '2026-11-26'

console.log(fecha.slice(0, 4))  // '2026': año
console.log(fecha.slice(5, 7))  // '11': mes
console.log(fecha.slice(-2))    // '26': los dos últimos

const titulo = 'Un título larguísimo que no cabe en la tarjeta'
const recortado = titulo.length > 20 ? `${titulo.slice(0, 20)}…` : titulo
console.log(recortado) // 'Un título larguísimo…'
```

## Reemplazar: replace y replaceAll

```js playground=replace
const telefono = '987-654-321'

console.log(telefono.replace('-', ' '))     // '987 654-321': solo el primero
console.log(telefono.replaceAll('-', ''))   // '987654321': todos

const plantilla = 'Hola {nombre}, tu pedido {pedido} está listo'
const mensaje = plantilla
  .replace('{nombre}', 'Ana')
  .replace('{pedido}', '#1024')
console.log(mensaje)
```

`replace` cambia solo **la primera** coincidencia. Para cambiarlas todas, `replaceAll`.

## Partir y unir: split y join

`split` convierte un texto en un **array**, cortando por donde le digas. `join` (que es de los arrays) hace lo contrario:

```js playground=split
const etiquetas = 'html,css,javascript'
console.log(etiquetas.split(','))  // ['html', 'css', 'javascript']

const frase = 'aprende a programar'
const palabras = frase.split(' ')
console.log(palabras.length)       // 3 palabras

const slug = frase.split(' ').join('-')
console.log(slug)                  // 'aprende-a-programar'
```

La combinación **`split` → hacer algo con el array → `join`** resuelve muchísimos ejercicios: invertir palabras, capitalizar, crear URLs.

## Rellenar y repetir

```js playground=rellenar
// padStart: rellenar por la izquierda hasta cierta longitud
const numeroPedido = 7
console.log(String(numeroPedido).padStart(4, '0')) // '0007'

const minutos = 5
const segundos = 9
console.log(`${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`) // '05:09'

// Ocultar una tarjeta menos los 4 últimos dígitos
const tarjeta = '4111111111111234'
console.log(tarjeta.slice(-4).padStart(tarjeta.length, '*')) // '************1234'

// repeat: repetir un texto
console.log('⭐'.repeat(4)) // '⭐⭐⭐⭐'
```

`padStart` es perfecto para relojes, temporizadores y códigos con ceros a la izquierda.

## Todo junto: limpiar un nombre de usuario

```js playground=junto
function crearUsuario(nombreCompleto) {
  return nombreCompleto
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(parte => parte !== '')
    .join('.')
}

console.log(crearUsuario('  Ana   Torres ')) // 'ana.torres'
console.log(crearUsuario('LUIS RAMOS'))      // 'luis.ramos'
```

Cada método hace un paso pequeño y se **encadenan** uno detrás de otro. Se lee de arriba abajo como una receta.

## Errores comunes

- **Esperar que el texto original cambie.** Guarda siempre el resultado: `nombre = nombre.trim()`.
- **Usar `replace` para cambiar todas las apariciones.** Solo cambia la primera; usa `replaceAll`.
- **Olvidar que se distinguen mayúsculas** en `includes`, `startsWith` o `indexOf`.
- **Llamar a un método sobre un número.** `5.padStart(2, '0')` falla: convierte antes con `String(5)`.

## Para profundizar

- [Métodos de `String` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String)

En resumen: **`trim`** para limpiar, **`toLowerCase`** para comparar, **`includes`/`startsWith`/`endsWith`** para buscar, **`slice`** para cortar, **`replaceAll`** para reemplazar, **`split`/`join`** para partir y unir y **`padStart`** para rellenar. Y recuerda: nunca cambian el original.
