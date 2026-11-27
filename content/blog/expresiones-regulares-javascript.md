---
title: 'Expresiones regulares en JavaScript sin miedo'
description: 'Qué es una expresión regular y para qué sirve, cómo se escribe, los símbolos que más vas a usar (clases, cuantificadores, anclas, grupos), los métodos test, match, matchAll y replace, y ejemplos reales para validar y limpiar textos.'
date: 2026-11-27
series: javascript
tags: [JavaScript, Regex, Textos, Fundamentos]
draft: true
---

¿Este texto es un email? ¿Este teléfono tiene 9 dígitos? ¿Cómo saco todos los hashtags de un tuit? ¿Cómo quito los espacios repetidos de un nombre? Con los métodos de texto (`includes`, `split`, `replace`...) puedes hacerlo, pero con muchas líneas de código.

Una **expresión regular** (*regex*, de *regular expression*) es un **patrón** que describe la forma de un texto. Con una sola línea respondes a todas esas preguntas. Tienen fama de ilegibles, y es cierto que `/^[\w.+-]+@[\w-]+\.[\w.]+$/` asusta, pero se construyen con muy pocas piezas. Vamos a verlas una a una.

## Tu primera expresión regular

En JavaScript se escriben entre **barras**:

```js playground=primera
const patron = /hola/

console.log(patron.test('hola mundo'))    // true
console.log(patron.test('Hola mundo'))    // false: distingue mayúsculas
console.log(/hola/i.test('Hola mundo'))   // true: la "i" ignora mayúsculas
```

- **`/hola/`** busca el texto "hola" en cualquier parte.
- **`.test(texto)`** devuelve `true` o `false`: ¿el texto cumple el patrón?
- Las letras después de la barra final son **flags** (opciones): **`i`** ignora mayúsculas y **`g`** busca *todas* las coincidencias (*global*).

## Las piezas

### Clases de caracteres: "uno de estos"

| Patrón | Coincide con |
| --- | --- |
| `[aeiou]` | Una vocal |
| `[0-9]` | Un dígito |
| `[a-z]` | Una letra minúscula (sin tildes ni ñ) |
| `[^0-9]` | Cualquier cosa que **no** sea un dígito (el `^` dentro de `[]` niega) |
| `\d` | Un dígito (igual que `[0-9]`) |
| `\w` | Una letra, un dígito o `_` (sin tildes ni ñ) |
| `\s` | Un espacio, tabulación o salto de línea |
| `.` | **Cualquier** carácter (menos el salto de línea) |

Las mayúsculas niegan: `\D` es "no dígito", `\S` es "no espacio".

### Cuantificadores: "cuántas veces"

| Patrón | Significa |
| --- | --- |
| `a?` | 0 o 1 vez (opcional) |
| `a*` | 0 o más veces |
| `a+` | 1 o más veces |
| `a{3}` | Exactamente 3 veces |
| `a{2,4}` | Entre 2 y 4 veces |
| `a{2,}` | 2 o más veces |

### Anclas: "dónde"

| Patrón | Significa |
| --- | --- |
| `^` | El **principio** del texto |
| `$` | El **final** del texto |
| `\b` | Un límite de palabra |

Las anclas son la clave para **validar**: sin ellas, el patrón se busca **en cualquier parte** del texto.

```js playground=anclas
const nueveDigitos = /\d{9}/
const soloNueveDigitos = /^\d{9}$/

console.log(nueveDigitos.test('987654321'))           // true
console.log(nueveDigitos.test('mi número: 987654321')) // true (lo encuentra dentro)
console.log(soloNueveDigitos.test('987654321'))       // true
console.log(soloNueveDigitos.test('mi número: 987654321')) // false: hay más cosas
console.log(soloNueveDigitos.test('98765432'))        // false: solo 8 dígitos
```

### Caracteres especiales

Los símbolos `. * + ? ^ $ ( ) [ ] { } | \ /` tienen significado propio. Para buscarlos **literalmente**, escápalos con `\`: `\.` es un punto de verdad, `\$` un signo de dólar.

## Ejemplos para validar

Combinando las piezas:

```js playground=validar
// Un celular peruano: 9 dígitos que empiezan por 9
const celular = /^9\d{8}$/
console.log('Celular', celular.test('987654321'), celular.test('123456789'))

// Un código postal de 5 dígitos
const codigoPostal = /^\d{5}$/
console.log('Código postal', codigoPostal.test('15001'), codigoPostal.test('150'))

// Una contraseña: al menos un número y una mayúscula
const tieneNumero = /\d/
const tieneMayuscula = /[A-Z]/
const password = 'Segura123'
console.log('Contraseña', tieneNumero.test(password) && tieneMayuscula.test(password))

// Un email (sencillo): algo@algo.algo, sin espacios
const email = /^\S+@\S+\.\S+$/
console.log('Email', email.test('ana@correo.com'), email.test('ana@correo'), email.test('ana @correo.com'))

// Un color hexadecimal: # y 3 o 6 caracteres hexadecimales
const colorHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
console.log('Color', colorHex.test('#fbbf24'), colorHex.test('#FFF'), colorHex.test('#ggg'))
```

Lo nuevo aquí:

- **`|`** significa **"o"**: `(abc|def)`.
- **`( )`** agrupa: `([0-9a-f]{3}|[0-9a-f]{6})` es "3 o 6 caracteres hexadecimales".

> **Sobre los emails:** validar un email al 100% con una regex es casi imposible (la especificación es enorme). `/^\S+@\S+\.\S+$/` detecta los errores típicos, y es suficiente. Para estar seguro, se envía un correo de confirmación. En un formulario, `<input type="email">` o `z.email()` de Zod ya lo hacen por ti.

## Buscar y extraer: `match` y `matchAll`

```js playground=extraer
const tuit = 'Aprendiendo #JavaScript y #CSS con @victor. ¡Me encanta #JavaScript!'

// match con la flag g: un array con todas las coincidencias
const hashtags = tuit.match(/#\w+/g)
console.log(hashtags) // ['#JavaScript', '#CSS', '#JavaScript']

// Sin repetidos
console.log([...new Set(hashtags)])

// Si no encuentra nada, match devuelve null (¡ojo!)
console.log('sin etiquetas'.match(/#\w+/g)) // null
console.log('sin etiquetas'.match(/#\w+/g) ?? []) // []
```

### Grupos: extraer partes

Los paréntesis no solo agrupan: también **capturan** lo que coincide, para poder extraerlo. Y con `?<nombre>` les pones nombre:

```js playground=grupos
const fecha = '2026-11-27'
const resultado = fecha.match(/^(?<anio>\d{4})-(?<mes>\d{2})-(?<dia>\d{2})$/)

console.log(resultado.groups)           // { anio: '2026', mes: '11', dia: '27' }
const { dia, mes, anio } = resultado.groups
console.log(`${dia}/${mes}/${anio}`)    // 27/11/2026

// matchAll: todas las coincidencias con sus grupos
const precios = 'Teclado S/ 120, Mouse S/ 45, Monitor S/ 800'
for (const coincidencia of precios.matchAll(/(?<producto>\w+) S\/ (?<precio>\d+)/g)) {
  console.log(coincidencia.groups.producto, Number(coincidencia.groups.precio))
}
```

Fíjate en `S\/`: la barra `/` se escapa porque es la que cierra la regex.

## Reemplazar: `replace` y `replaceAll`

Aquí es donde las regex brillan para **limpiar** textos:

```js playground=reemplazar
// Quitar espacios repetidos
const nombre = '  Ana    María   Torres '
console.log(nombre.trim().replace(/\s+/g, ' ')) // 'Ana María Torres'

// Dejar solo los dígitos de un teléfono
console.log('+51 (987) 654-321'.replace(/\D/g, '')) // '51987654321'

// Formatear: usar los grupos en el reemplazo con $1, $2...
console.log('987654321'.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3')) // '987 654 321'

// Un slug para una URL: minúsculas, sin tildes, con guiones
function crearSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')                 // separa las tildes de las letras: "á" → "a" + "´"
    .replace(/[̀-ͯ]/g, '')  // borra las tildes sueltas
    .replace(/[^a-z0-9]+/g, '-')      // todo lo que no sea letra o número → guion
    .replace(/^-|-$/g, '')            // sin guiones al principio ni al final
}
console.log(crearSlug('¿Qué es el Event Loop en JavaScript?')) // 'que-es-el-event-loop-en-javascript'

// Una función para decidir el reemplazo
const texto = 'el precio es 100 y el envío 15'
console.log(texto.replace(/\d+/g, (numero) => `S/ ${Number(numero).toFixed(2)}`))
```

- Sin la flag **`g`**, `replace` solo cambia **la primera** coincidencia.
- **`$1`, `$2`...** en el texto de reemplazo son los grupos capturados.
- Si pasas una **función**, se llama con cada coincidencia y lo que devuelve es el reemplazo.

Así, por cierto, se generan las URLs de los posts de este blog.

## Tildes, ñ y emojis: la flag `u`

`\w` y `[a-z]` **no** incluyen `á`, `é`, `ñ`... Un problema para textos en español:

```js playground=unicode
console.log(/^\w+$/.test('Peña'))            // false: la ñ no es \w
console.log(/^[a-záéíóúüñ]+$/i.test('Peña')) // true: añadiéndolas a mano
console.log(/^\p{L}+$/u.test('Peña'))        // true: \p{L} = cualquier letra de cualquier idioma
```

Con la flag **`u`** (*unicode*) puedes usar **`\p{L}`** (cualquier letra, en cualquier idioma) y trabajar bien con emojis. Para validar nombres de personas, es la opción correcta.

## Crear una regex desde un texto

Si el patrón depende de una variable (por ejemplo, lo que escribe el usuario en un buscador), usa el constructor `RegExp`:

```js playground=constructor
const busqueda = 'java'
const patron = new RegExp(busqueda, 'gi')

const titulo = 'JavaScript no es Java'
console.log(titulo.replace(patron, (coincidencia) => `[${coincidencia}]`)) // '[Java]Script no es [Java]'
```

⚠️ Si el texto del usuario contiene símbolos especiales (`.`, `*`, `(`...), cambiarán el significado del patrón. Escápalos primero: `busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`.

## Cómo leer (y escribir) una regex difícil

1. **Divídela en piezas** y léela de izquierda a derecha: `^` principio, `9` un nueve, `\d{8}` ocho dígitos, `$` final.
2. **Pruébala** en [regex101.com](https://regex101.com) (elige el sabor *ECMAScript/JavaScript*): te explica cada parte y te muestra las coincidencias en vivo.
3. **Escribe tests**: una lista de textos que deben pasar y otros que no (como en la serie de Testing).
4. **No te pases.** Si una regex no cabe en tu cabeza, quizá un `split` y un par de `if` se leen mejor.

## Tu turno

En el playground:

1. Escribe una regex para un DNI peruano (8 dígitos) y pruébala con 5 textos.
2. Extrae todas las menciones (`@usuario`) de un texto con `match`.
3. Escribe `capitalizar(texto)` que ponga en mayúscula la primera letra de cada palabra usando `replace` con `/\b\p{L}/gu` y una función.
4. Valida una matrícula de coche con el formato `ABC-123` (3 letras mayúsculas, guion, 3 dígitos).

## Errores comunes

- **Validar sin `^` y `$`**: el patrón se encuentra dentro de textos más largos y deja pasar basura.
- **Olvidar la flag `g`** en `replace` o `match`: solo trata la primera coincidencia.
- **`match` devuelve `null`** si no encuentra nada, no un array vacío. Usa `?? []`.
- **No escapar los caracteres especiales**: `/S/.100/` no busca "S/.100".
- **`\w` con textos en español**: no incluye tildes ni ñ. Usa `\p{L}` con la flag `u`.
- **Reutilizar una regex con `g` en `test`**: guarda la posición de la última búsqueda (`lastIndex`) y alterna `true` y `false`. Para `test`, no uses `g`.

## Para profundizar

- [Expresiones regulares en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Regular_expressions)
- [regex101: prueba y entiende tus expresiones (en inglés)](https://regex101.com)

En resumen: una **expresión regular** es un patrón para describir textos. Se construye con **clases** (`[0-9]`, `\d`, `\w`, `\s`), **cuantificadores** (`?`, `+`, `*`, `{n}`), **anclas** (`^`, `$`) y **grupos** (`( )`, `|`). Usa **`test`** para validar (siempre con `^` y `$`), **`match`/`matchAll`** para extraer y **`replace`** con la flag **`g`** para limpiar y formatear. Para textos en español, la flag **`u`** con **`\p{L}`**.
