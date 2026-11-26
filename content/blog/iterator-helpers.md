---
title: 'Iterator helpers: map, filter y take sin crear arrays de más'
description: 'ES2025 trae map, filter, take y compañía a los iteradores. Procesa Maps, Sets y listas enormes paso a paso y sin copias intermedias.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ESNext, Arrays]
draft: true
---

Imagina que guardas los usuarios conectados de un chat en un `Map` (clave: id, valor: usuario). Quieres mostrar los nombres de los **3 primeros activos**. Con lo que ya conoces harías esto:

```js
const nombres = [...usuarios.values()]
  .filter(u => u.activo)
  .map(u => u.nombre)
  .slice(0, 3)
```

Funciona, pero fíjate en lo que hace: convierte **todo** el `Map` en un array, filtra **todos** los usuarios, crea **otro** array con todos los nombres... y al final se queda con 3. Si hay 10.000 usuarios, has trabajado con 10.000 para usar 3.

Desde ES2025 los **iteradores** tienen sus propios `map`, `filter` y `take`, y trabajan de otra forma.

## Primero: ¿qué es un iterador?

Un **iterador** es un objeto que te va dando valores **de uno en uno**, cuando se los pides. Es lo que usa `for...of` por dentro. Muchas cosas devuelven iteradores:

- `miMap.values()`, `miMap.keys()`, `miMap.entries()`
- `miSet.values()`
- `miArray.values()`
- las funciones generadoras (`function*`)

Hasta ahora, para usar `map` o `filter` con ellos tenías que convertirlos en array primero. Ya no.

## Los iterator helpers

```js playground=basico
const usuarios = new Map([
  [1, { nombre: 'Ana', activo: true }],
  [2, { nombre: 'Luis', activo: false }],
  [3, { nombre: 'Marta', activo: true }],
  [4, { nombre: 'Pedro', activo: true }],
  [5, { nombre: 'Sofía', activo: true }]
])

const nombres = usuarios.values()
  .filter(u => u.activo)
  .map(u => u.nombre)
  .take(3)
  .toArray()

console.log(nombres) // ['Ana', 'Marta', 'Pedro']
```

Se lee igual que con arrays, pero sin el `[...]` inicial y con dos métodos nuevos:

- **`take(n)`**: quédate con los `n` primeros (y para).
- **`toArray()`**: convierte el resultado final en un array.

También existen `drop(n)` (sáltate los `n` primeros), `flatMap`, `reduce`, `forEach`, `some`, `every` y `find`.

## La gran diferencia: van de uno en uno

Los métodos de los arrays trabajan **por pasos completos**: primero filtran todo, luego mapean todo. Los iterator helpers trabajan **elemento a elemento**: cada valor pasa por toda la cadena antes de pedir el siguiente. Y cuando `take` tiene suficientes, **se detiene**.

Míralo con mensajes en la consola:

```js playground=perezoso
const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

console.log('--- Con arrays ---')
numeros
  .filter(n => { console.log('filter', n); return n % 2 === 0 })
  .slice(0, 2)

console.log('--- Con iterator helpers ---')
numeros.values()
  .filter(n => { console.log('filter', n); return n % 2 === 0 })
  .take(2)
  .toArray()
```

Con arrays verás `filter` diez veces. Con iterator helpers, solo **cuatro**: en cuanto encuentra el 2 y el 4, para. A esto se le llama **evaluación perezosa** (*lazy*): no se hace ningún trabajo hasta que hace falta.

## Caso real: paginar resultados

Una lista de resultados de búsqueda que se muestra de 5 en 5. La página 2 es "sáltate 5, coge 5":

```js playground=paginar
const resultados = Array.from({ length: 23 }, (_, i) => `Resultado ${i + 1}`)

const pagina = (numero, porPagina = 5) => resultados.values()
  .drop((numero - 1) * porPagina)
  .take(porPagina)
  .toArray()

console.log('Página 1:', pagina(1))
console.log('Página 2:', pagina(2))
console.log('Página 5:', pagina(5)) // solo quedan 3
```

## Caso real: generar ids o datos de prueba

Con una función generadora puedes crear una secuencia **infinita**: como es perezosa, solo se calcula lo que pides con `take`.

```js playground=generador
function* contador(desde = 1) {
  let n = desde
  while (true) yield n++
}

// 5 ids para datos de prueba, sin un bucle for
const ids = contador(1000).take(5).toArray()
console.log(ids) // [1000, 1001, 1002, 1003, 1004]

// Los primeros 4 múltiplos de 7
console.log(contador().filter(n => n % 7 === 0).take(4).toArray())
```

Sin `take`, ese `while (true)` sería un bucle infinito. Con iterator helpers es seguro, porque solo se piden 5 valores.

## ¿Cuándo usar cada uno?

- **Arrays de toda la vida**: listas normales (decenas o cientos de elementos) que ya tienes en memoria. Son más conocidos y el resto del equipo los entiende al instante.
- **Iterator helpers**: cuando trabajas con un `Map` o un `Set`, cuando la lista es muy grande y solo necesitas unos pocos, o con secuencias que se van generando.

## Errores comunes

- **Olvidar `toArray()`.** Sin él tienes un iterador, no un array: `console.log` no te mostrará los valores y no puedes usar `.length` ni pasarlo a React.
- **Recorrer dos veces el mismo iterador.** Un iterador se **gasta**: cuando llega al final, no vuelve a empezar. Si necesitas los valores dos veces, guárdalos con `toArray()`.
- **Buscar `.map` en un objeto normal.** Los objetos no son iterables; usa `Object.entries(obj)` o `Object.values(obj)`, que devuelven arrays.

## Para profundizar

- [`Iterator` en MDN, con todos sus métodos](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Iterator)

En resumen: los **iterator helpers** dan `map`, `filter`, `take`, `drop` y compañía a los iteradores de `Map`, `Set` y generadores. Trabajan **de uno en uno** y **paran cuando tienen suficiente**. Termina siempre con **`toArray()`**.
