---
title: 'Map y Set desde cero: las colecciones que no son arrays ni objetos'
description: 'Set para listas sin repetidos y Map para diccionarios con cualquier tipo de clave. Cuándo usarlos en vez de un array o un objeto, con ejemplos prácticos.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ES6, Map, Set]
draft: true
---

Arrays y objetos te sirven para casi todo. Pero hay dos problemas que resuelven mal:

- **Quitar repetidos** de una lista (o evitar que entren).
- **Asociar datos a algo que no es un texto**, como un elemento del DOM o un objeto.

Para eso, ES6 trajo dos colecciones nuevas: **`Set`** y **`Map`**.

## `Set`: una lista sin repetidos

Un **`Set`** es una colección de valores **únicos**. Si intentas añadir un valor que ya está, simplemente no pasa nada.

```js playground=set-basico
const etiquetas = new Set()

etiquetas.add('javascript')
etiquetas.add('css')
etiquetas.add('javascript') // ya está: se ignora

console.log(etiquetas)      // Set(2) { 'javascript', 'css' }
console.log(etiquetas.size) // 2 (en los Set es size, no length)
console.log(etiquetas.has('css')) // true
etiquetas.delete('css')
console.log(etiquetas.has('css')) // false
```

| Método | Qué hace |
| --- | --- |
| `set.add(valor)` | Añade (si no estaba) |
| `set.has(valor)` | ¿Está? `true` / `false` |
| `set.delete(valor)` | Lo quita |
| `set.size` | Cuántos hay |
| `set.clear()` | Lo vacía |

### El truco estrella: quitar repetidos de un array

```js playground=unicos
const ciudades = ['Lima', 'Cusco', 'Lima', 'Arequipa', 'Cusco', 'Lima']

const unicas = [...new Set(ciudades)]
console.log(unicas) // ['Lima', 'Cusco', 'Arequipa']
```

`new Set(array)` crea el Set con los elementos del array (quitando repetidos) y `[...]` lo vuelve a convertir en array. Una línea que verás muchísimo.

### Recorrer un Set

```js playground=recorrer-set
const favoritos = new Set(['Teclado', 'Monitor'])

for (const producto of favoritos) {
  console.log(producto)
}

// Para usar map o filter, conviértelo en array
const enMayusculas = [...favoritos].map((producto) => producto.toUpperCase())
console.log(enMayusculas)
```

### Un caso real: marcar favoritos

```html playground=favoritos
<ul id="lista">
  <li><button data-id="1">☆ Teclado</button></li>
  <li><button data-id="2">☆ Mouse</button></li>
  <li><button data-id="3">☆ Monitor</button></li>
</ul>
<p id="contador">0 favoritos</p>
```

```js playground=favoritos
const favoritos = new Set()

document.querySelector('#lista').addEventListener('click', (evento) => {
  const boton = evento.target.closest('button')
  if (!boton) return

  const id = boton.dataset.id
  const nombre = boton.textContent.slice(2)

  // Si ya es favorito, lo quitamos; si no, lo añadimos
  if (favoritos.has(id)) {
    favoritos.delete(id)
    boton.textContent = `☆ ${nombre}`
  } else {
    favoritos.add(id)
    boton.textContent = `★ ${nombre}`
  }

  document.querySelector('#contador').textContent = `${favoritos.size} favoritos`
})
```

¿Por qué `Set` y no un array? Con un array, para quitar un favorito tendrías que buscar su posición y usar `filter` o `splice`, y tendrías que comprobar a mano que no lo añades dos veces. Además, `set.has()` es **mucho más rápido** que `array.includes()` con listas grandes: el Set va directo al valor, mientras que el array lo busca uno por uno.

## `Map`: un diccionario con superpoderes

Un **`Map`** guarda pares **clave → valor**, como un objeto. ¿Para qué otro más? Por estas diferencias:

| | Objeto `{}` | `Map` |
| --- | --- | --- |
| Tipo de las claves | Solo textos (y symbols) | **Cualquier cosa**: números, objetos, elementos del DOM... |
| Tamaño | `Object.keys(obj).length` | `map.size` |
| Recorrerlo | `Object.entries(obj)` | Directamente con `for...of` |
| Orden | Casi siempre el de inserción, con excepciones | Siempre el de inserción |
| Pensado para | Representar **una cosa** (un usuario, un producto) | **Colecciones** que crecen y cambian |

```js playground=map-basico
const stock = new Map()

stock.set('teclado', 5)
stock.set('mouse', 0)
stock.set('monitor', 2)

console.log(stock.get('teclado')) // 5
console.log(stock.has('mouse'))   // true
console.log(stock.size)           // 3

stock.set('teclado', 4) // si la clave ya existe, sobrescribe
stock.delete('mouse')

for (const [producto, unidades] of stock) {
  console.log(`${producto}: ${unidades}`)
}
```

| Método | Qué hace |
| --- | --- |
| `map.set(clave, valor)` | Guarda (o sobrescribe) |
| `map.get(clave)` | Devuelve el valor, o `undefined` |
| `map.has(clave)` | ¿Existe esa clave? |
| `map.delete(clave)` | La borra |
| `map.size` | Cuántos pares hay |

### Las claves pueden ser cualquier cosa

Esta es la gran ventaja. En un objeto, si usas un número como clave, se convierte en texto; si usas un objeto, se convierte en el texto `'[object Object]'` y todos los objetos acaban en la misma clave:

```js playground=claves
const objeto = {}
const usuarioA = { nombre: 'Ana' }
const usuarioB = { nombre: 'Luis' }

objeto[usuarioA] = 'admin'
objeto[usuarioB] = 'editor'
console.log(objeto) // { '[object Object]': 'editor' } 😱 se pisaron

const roles = new Map()
roles.set(usuarioA, 'admin')
roles.set(usuarioB, 'editor')
console.log(roles.get(usuarioA)) // 'admin' ✅
console.log(roles.get(usuarioB)) // 'editor' ✅
```

### Un caso real: contar repeticiones

```js playground=contar
const votos = ['React', 'Vue', 'React', 'Svelte', 'React', 'Vue']

const conteo = new Map()
for (const voto of votos) {
  conteo.set(voto, (conteo.get(voto) ?? 0) + 1)
}

console.log(conteo) // Map(3) { 'React' => 3, 'Vue' => 2, 'Svelte' => 1 }

// De Map a objeto (por ejemplo, para enviarlo como JSON)
console.log(Object.fromEntries(conteo)) // { React: 3, Vue: 2, Svelte: 1 }
```

`conteo.get(voto) ?? 0` usa 0 si todavía no había votos para esa opción.

### Un caso real: buscar por `id` rápidamente

Si tienes una lista grande de productos y buscas por `id` muchas veces, `find` recorre el array cada vez. Un `Map` va directo:

```js playground=indice
const productos = [
  { id: 101, nombre: 'Teclado' },
  { id: 102, nombre: 'Mouse' },
  { id: 103, nombre: 'Monitor' }
]

const porId = new Map(productos.map((producto) => [producto.id, producto]))

console.log(porId.get(102)) // { id: 102, nombre: 'Mouse' }
```

`new Map(pares)` acepta un array de pares `[clave, valor]`, igual que `Object.fromEntries`.

## ¿Cuándo usar cada uno?

- **Array**: una lista ordenada, con posibles repetidos, que vas a recorrer, filtrar u ordenar.
- **Set**: una lista de valores **únicos** donde preguntas mucho "¿está?" (favoritos, etiquetas seleccionadas, ids ya vistos).
- **Objeto**: los datos de **una cosa** con propiedades conocidas (`usuario.nombre`, `producto.precio`). Y lo que vas a enviar o recibir como JSON.
- **Map**: una **colección** de pares que crece y cambia, o cuando las claves **no son textos**.

En el post de los nuevos métodos de `Set` (`union`, `intersection`...) verás cómo combinar Sets.

## Tu turno

```js playground=ejercicio
const visitas = ['/inicio', '/blog', '/inicio', '/contacto', '/blog', '/inicio']

// 1. ¿Cuántas páginas distintas se visitaron? (Set)

// 2. Crea un Map con cuántas veces se visitó cada página

// 3. ¿Cuál fue la página más visitada?
```

## Errores comunes

- **Usar `length` en un Set o un Map.** Es `size`.
- **Acceder a un Map con corchetes** (`map['clave']` o `map.clave`). Usa `map.get('clave')`.
- **Enviar un Map o un Set con `JSON.stringify`.** Da `{}`. Conviértelo antes: `Object.fromEntries(map)` o `[...set]`.
- **Esperar que un Set detecte objetos "iguales".** `new Set([{ id: 1 }, { id: 1 }])` tiene **dos** elementos, porque son dos objetos distintos. Guarda los `id` en vez de los objetos.

## Para profundizar

- [`Set` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [`Map` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map)

En resumen: **`Set`** es una lista de **valores únicos** con `add`, `has` y `delete` (y `[...new Set(array)]` quita repetidos). **`Map`** es un diccionario donde **las claves pueden ser de cualquier tipo**, con `set`, `get` y `has`. Los dos usan **`size`** y se recorren directamente con `for...of`.
