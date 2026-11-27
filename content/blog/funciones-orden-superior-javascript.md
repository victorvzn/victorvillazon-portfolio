---
title: 'Funciones de orden superior en JavaScript: qué son, las más usadas y por qué importan'
description: 'Qué es una función de orden superior (HOF), funciones que reciben funciones y funciones que devuelven funciones, las HOF más usadas de JavaScript (map, filter, reduce, sort, forEach, find, addEventListener, setTimeout...) y cómo crear las tuyas.'
date: 2026-11-27
series: javascript
tags: [JavaScript, Funciones, Programación funcional, Intermedio]
draft: true
---

Llevas tiempo usándolas sin saber su nombre. Cada vez que escribes `boton.addEventListener('click', ...)`, `productos.map(...)` o `setTimeout(...)`, estás usando una **función de orden superior** (*higher-order function*, **HOF**). Es una de las ideas más importantes de JavaScript, y entenderla de verdad cambia cómo escribes código.

## La definición

Una **función de orden superior** es una función que hace **al menos una** de estas dos cosas:

1. **Recibe una función** como argumento.
2. **Devuelve una función** como resultado.

Eso es todo. Y es posible porque en JavaScript las funciones son **valores**, como un número o un texto: se pueden guardar en variables, pasar como argumento y devolver. A esto se le llama tener **funciones de primera clase**.

```js playground=valores
const saludar = (nombre) => `Hola, ${nombre}`

const otraVariable = saludar          // guardarla en otra variable (sin paréntesis)
console.log(otraVariable('Ana'))      // Hola, Ana

const acciones = [saludar, (n) => `Adiós, ${n}`]  // guardarla en un array
console.log(acciones[1]('Luis'))      // Adiós, Luis
```

A la función que se pasa como argumento se le llama **callback** (función de retorno): "te paso esta función para que **la llames tú** cuando toque".

## Tipo 1: funciones que reciben funciones

```js playground=recibe
function repetir(veces, accion) {
  for (let i = 1; i <= veces; i++) {
    accion(i)
  }
}

repetir(3, (numero) => console.log(`Vuelta ${numero}`))
repetir(2, (numero) => console.log('⭐'.repeat(numero)))
```

`repetir` es una HOF: sabe **cuántas veces** repetir, pero no **qué** hacer. Eso se lo dice quien la usa, pasándole una función. Así, la misma `repetir` sirve para cualquier cosa.

Esa es la idea central: **separar el "cómo se recorre" del "qué se hace con cada cosa"**.

## Tipo 2: funciones que devuelven funciones

```js playground=devuelve
function crearMultiplicador(factor) {
  return (numero) => numero * factor
}

const doble = crearMultiplicador(2)
const triple = crearMultiplicador(3)

console.log(doble(5))    // 10
console.log(triple(5))   // 15
```

`crearMultiplicador` es una **fábrica de funciones**: cada vez que la llamas, crea una función nueva configurada. Esto funciona gracias a los **closures** (lo viste en su propio post): la función de dentro recuerda el `factor` con el que se creó.

## Las HOF más usadas de JavaScript

Esta es la lista de las que usarás cada semana.

### En los arrays

| Método | Recibe una función que... | Devuelve |
| --- | --- | --- |
| `map(fn)` | transforma cada elemento | Un array nuevo, del mismo tamaño |
| `filter(fn)` | decide si cada elemento se queda (`true`/`false`) | Un array nuevo, con los que pasan |
| `reduce(fn, inicial)` | combina el acumulado con cada elemento | Un solo valor |
| `find(fn)` / `findIndex(fn)` | busca | El primer elemento (o su índice) que cumple |
| `some(fn)` / `every(fn)` | comprueba | `true` o `false` |
| `forEach(fn)` | hace algo con cada elemento | Nada (`undefined`) |
| `sort(fn)` / `toSorted(fn)` | compara dos elementos | El array ordenado |
| `flatMap(fn)` | transforma y aplana | Un array nuevo |

```js playground=arrays
const productos = [
  { nombre: 'Teclado', precio: 120, categoria: 'perifericos', stock: 5 },
  { nombre: 'Mouse', precio: 45, categoria: 'perifericos', stock: 0 },
  { nombre: 'Monitor', precio: 800, categoria: 'pantallas', stock: 2 },
  { nombre: 'Webcam', precio: 150, categoria: 'perifericos', stock: 8 }
]

const nombres = productos.map((p) => p.nombre)
const disponibles = productos.filter((p) => p.stock > 0)
const valorInventario = productos.reduce((total, p) => total + p.precio * p.stock, 0)
const monitor = productos.find((p) => p.categoria === 'pantallas')
const hayAgotados = productos.some((p) => p.stock === 0)
const porPrecio = productos.toSorted((a, b) => a.precio - b.precio)

console.log(nombres)
console.log(disponibles.length, 'disponibles')
console.log('Inventario:', valorInventario)
console.log(monitor.nombre, hayAgotados)
console.log(porPrecio.map((p) => p.nombre))

// Encadenadas: cada una devuelve un array, así que puedes seguir
const resumen = productos
  .filter((p) => p.stock > 0)
  .map((p) => `${p.nombre}: S/ ${p.precio}`)
  .join(' · ')
console.log(resumen)
```

(Cada uno tiene su post en el módulo de arrays y objetos: `map`, `filter` y `reduce`; `find`, `some`, `every` e `includes`; y `sort`.)

### En el navegador y en la asincronía

Muchas APIs del navegador son HOF: les das una función para que **la llamen cuando ocurra algo**.

```js
// Ejecuta la función cuando el usuario haga clic
boton.addEventListener('click', (evento) => { /* ... */ })

// Ejecuta la función dentro de 1 segundo / cada segundo
setTimeout(() => console.log('¡Ya!'), 1000)
setInterval(() => actualizarReloj(), 1000)

// Ejecuta la función cuando llegue la respuesta
fetch('/api/productos').then((respuesta) => respuesta.json())

// Ejecuta la función cuando un elemento entre en pantalla
new IntersectionObserver((entradas) => { /* ... */ })
```

### Otras que ya conoces

```js
Array.from({ length: 5 }, (_, i) => i * 10)   // [0, 10, 20, 30, 40]
Object.entries(precios).map(([nombre, precio]) => ...)
new Promise((resolve, reject) => { ... })     // el constructor recibe una función
'a-b-c'.replace(/-/g, () => ' ')              // replace acepta una función
```

## ¿Por qué son tan importantes?

### 1. Código declarativo: dices **qué**, no **cómo**

Compara:

```js playground=declarativo
const precios = [120, 45, 800, 150]

// Imperativo: describes CÓMO, paso a paso
const baratos1 = []
for (let i = 0; i < precios.length; i++) {
  if (precios[i] < 200) {
    baratos1.push(precios[i])
  }
}

// Declarativo: describes QUÉ quieres
const baratos2 = precios.filter((precio) => precio < 200)

console.log(baratos1, baratos2)
```

La segunda se lee como una frase: "los precios menores de 200". No hay índices, ni `push`, ni un array vacío que preparar. Menos código, menos sitios donde equivocarse.

### 2. Reutilización: separar lo que cambia de lo que no

`filter` sabe recorrer un array y quedarse con algunos elementos. **Tú** solo decides el criterio. El mismo `filter` sirve para productos baratos, usuarios activos o tareas pendientes.

### 3. Composición: piezas pequeñas que se combinan

Las HOF devuelven valores que otras HOF pueden usar: `filter` → `map` → `join`. Pequeñas piezas, cada una con un propósito, encadenadas como una línea de montaje.

### 4. Son la base de los frameworks

- **React**: `productos.map((p) => <Tarjeta key={p.id} />)` para pintar listas, `useEffect(() => {...})`, `setCuenta((c) => c + 1)`, `memo(Componente)`.
- **Express**: `app.get('/ruta', (req, res) => {...})` y los middlewares.
- **Vitest**: `describe('...', () => {...})`, `it('...', () => {...})`.

Todo eso son funciones que reciben funciones.

### 5. Inmutabilidad

`map`, `filter` y `toSorted` **no modifican** el array original: devuelven uno nuevo (lo viste en el post de funciones puras e inmutabilidad). Eso evita bugs difíciles de encontrar, y es justo lo que React necesita para saber que algo cambió.

## Crea tus propias HOF

### Una que recibe funciones: `contarSi`

```js playground=propias
function contarSi(lista, condicion) {
  let cuenta = 0
  for (const elemento of lista) {
    if (condicion(elemento)) cuenta++
  }
  return cuenta
}

const notas = [15, 9, 18, 10, 12]
console.log(contarSi(notas, (n) => n >= 11), 'aprobados')
console.log(contarSi(notas, (n) => n >= 18), 'con excelencia')
```

### Una que devuelve funciones: `crearValidador`

```js playground=validador
function crearValidador(minimo, maximo) {
  return (valor) => valor.length >= minimo && valor.length <= maximo
}

const validarUsuario = crearValidador(3, 15)
const validarPassword = crearValidador(8, 64)

console.log(validarUsuario('ana'))       // true
console.log(validarPassword('1234'))     // false
```

### Una que recibe **y** devuelve funciones: `conLog`

Una función que "envuelve" a otra para añadirle algo, sin tocar su código. Es la misma idea que los **decoradores** de Python o el `memo` de React:

```js playground=conlog
function conLog(funcion) {
  return (...argumentos) => {
    console.log(`→ ${funcion.name}(${argumentos.join(', ')})`)
    const resultado = funcion(...argumentos)
    console.log(`← ${resultado}`)
    return resultado
  }
}

function sumar(a, b) {
  return a + b
}

const sumarConLog = conLog(sumar)
sumarConLog(2, 3)
sumarConLog(10, 5)
```

Así funcionan por dentro `debounce`, `throttle` y `memoize`, que tienen su propio post en las pruebas técnicas: las tres son HOF que reciben una función y devuelven una versión "mejorada".

## Tu turno

En el playground:

1. Escribe `miMap(array, fn)` sin usar `map` (con un `for`), y comprueba que da lo mismo que `array.map(fn)`.
2. Escribe `crearContador()` que devuelva una función; cada vez que la llames, devuelve el siguiente número (1, 2, 3...).
3. Escribe `unaVez(fn)` que devuelva una función que solo ejecute `fn` la primera vez que se llama.
4. Con un array de usuarios, usa `filter`, `map` y `reduce` encadenados para calcular la edad media de los usuarios activos.

## Errores comunes

- **Llamar a la función en vez de pasarla**: `boton.addEventListener('click', guardar())` ejecuta `guardar` **al momento** y pasa su resultado. Lo correcto es `guardar` (sin paréntesis) o `() => guardar()`.
- **Olvidar el `return`** en un callback con llaves: `map((p) => { p.nombre })` devuelve `undefined`. Con llaves hace falta `return`; sin llaves, no.
- **Usar `map` para hacer algo sin usar el resultado.** Si no necesitas el array nuevo, usa `forEach` o un `for...of`.
- **Olvidar el valor inicial de `reduce`**: con un array vacío, lanza un error.
- **Encadenar diez HOF ilegibles.** Si la cadena es larga, dale nombre a cada paso con variables intermedias.

## Para profundizar

- [Funciones en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Functions)
- [Métodos de Array en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array)

En resumen: una **función de orden superior** es la que **recibe** una función (un **callback**) o **devuelve** una función. Existen porque en JavaScript las funciones son **valores**. Las más usadas son **`map`, `filter`, `reduce`, `find`, `some`, `every` y `sort`** en los arrays, y **`addEventListener`, `setTimeout` y `then`** en el navegador. Importan porque hacen tu código **declarativo**, **reutilizable** y **componible**, y porque React, Express y Vitest están construidos sobre ellas.
