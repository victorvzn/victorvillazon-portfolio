---
title: 'Los nuevos métodos de Set: permisos, filtros y selecciones sin bucles'
description: 'union, intersection, difference e isSubsetOf llegaron a Set en ES2025. Casos reales: comprobar permisos, combinar filtros y saber qué cambió.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ESNext, Set]
draft: true
---

Un `Set` es una colección de valores **sin repetidos**. Hasta ahora lo usábamos casi solo para quitar duplicados (`[...new Set(lista)]`). Pero en ES2025 recibió los métodos de las operaciones de conjuntos que estudiaste en el colegio: unión, intersección y diferencia.

Parecen cosa de matemáticas, pero en el trabajo aparecen constantemente.

## Los métodos de un vistazo

Con `a = {1, 2, 3}` y `b = {3, 4}`:

| Método | Devuelve | Resultado |
| --- | --- | --- |
| `a.union(b)` | Todo lo que está en alguno | `{1, 2, 3, 4}` |
| `a.intersection(b)` | Lo que está en los dos | `{3}` |
| `a.difference(b)` | Lo que está en `a` pero no en `b` | `{1, 2}` |
| `a.symmetricDifference(b)` | Lo que está en uno solo | `{1, 2, 4}` |
| `a.isSubsetOf(b)` | ¿Todo `a` está en `b`? | `false` |
| `a.isSupersetOf(b)` | ¿Todo `b` está en `a`? | `false` |
| `a.isDisjointFrom(b)` | ¿No comparten nada? | `false` |

Todos devuelven un `Set` **nuevo** (o un booleano) y no modifican los originales.

## Caso 1: ¿tiene el usuario los permisos necesarios?

En cualquier panel de administración, cada acción necesita ciertos permisos. ¿Los tiene todos el usuario?

```js playground=permisos
const permisosUsuario = new Set(['leer', 'escribir', 'comentar'])

const necesariosParaEditar = new Set(['leer', 'escribir'])
const necesariosParaBorrar = new Set(['leer', 'borrar'])

console.log('¿Puede editar?', necesariosParaEditar.isSubsetOf(permisosUsuario))  // true
console.log('¿Puede borrar?', necesariosParaBorrar.isSubsetOf(permisosUsuario))  // false

// ¿Qué le falta para poder borrar?
console.log('Le falta:', [...necesariosParaBorrar.difference(permisosUsuario)])
```

`isSubsetOf` se lee "¿es subconjunto de?": ¿están **todos** los necesarios dentro de los del usuario? Y `difference` te dice exactamente cuál falta, perfecto para un mensaje de error útil.

## Caso 2: filtros de una tienda

El usuario marca etiquetas en un filtro. Queremos los productos que tienen **al menos una** de las etiquetas marcadas, o **todas**:

```js playground=filtros
const productos = [
  { nombre: 'Zapatillas trail', etiquetas: new Set(['deporte', 'montaña', 'oferta']) },
  { nombre: 'Camiseta técnica', etiquetas: new Set(['deporte']) },
  { nombre: 'Mochila', etiquetas: new Set(['montaña', 'viaje']) }
]

const marcadas = new Set(['deporte', 'oferta'])

// "Cualquiera de estas": que compartan algo
const alguna = productos.filter(p => !p.etiquetas.isDisjointFrom(marcadas))

// "Todas estas": que las marcadas estén dentro de las del producto
const todas = productos.filter(p => p.etiquetas.isSupersetOf(marcadas))

console.log('Con alguna:', alguna.map(p => p.nombre))
console.log('Con todas:', todas.map(p => p.nombre))
```

`isDisjointFrom` es "¿no tienen nada en común?". Negado con `!`, significa "comparten al menos una".

## Caso 3: ¿qué cambió en la selección?

Una lista con casillas para asignar alumnos a un curso. Al guardar, no quieres enviar la lista completa al servidor: quieres saber **a quién añadir y a quién quitar**.

```js playground=cambios
const antes = new Set(['ana', 'luis', 'marta'])
const despues = new Set(['ana', 'marta', 'pedro', 'sofia'])

const anadidos = despues.difference(antes)
const quitados = antes.difference(despues)
const sinCambios = antes.intersection(despues)

console.log('Añadir:', [...anadidos])     // ['pedro', 'sofia']
console.log('Quitar:', [...quitados])     // ['luis']
console.log('Igual:', [...sinCambios])    // ['ana', 'marta']
```

Antes de ES2025, esto eran dos `filter` con `includes` y bastante más difícil de leer.

## Caso 4: juntar sin duplicados

Dos fuentes de datos (por ejemplo, los correos de dos listas de invitados) que hay que combinar sin repetir:

```js playground=union
const invitadosAna = new Set(['luis@mail.com', 'marta@mail.com'])
const invitadosPedro = new Set(['marta@mail.com', 'sofia@mail.com'])

const todos = invitadosAna.union(invitadosPedro)

console.log(todos.size)  // 3
console.log([...todos])
```

## Errores comunes

- **Pasarles un array.** `miSet.union(['a', 'b'])` lanza un `TypeError`. El argumento tiene que ser un `Set` (o algo que se comporte como uno, como un `Map`). Convierte antes: `miSet.union(new Set(lista))`.
- **Esperar un array de vuelta.** Devuelven un `Set`. Para usar `map` o mostrarlo en React, conviértelo con `[...resultado]` o `Array.from(resultado)`.
- **Usarlos con objetos esperando que compare contenido.** Dos objetos `{ id: 1 }` distintos **no** son iguales para un `Set`. Trabaja con ids (`new Set(usuarios.map(u => u.id))`).

## Para profundizar

- [`Set` en MDN, con todos sus métodos](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Set)

En resumen: **`isSubsetOf`** para permisos, **`isDisjointFrom`** e **`isSupersetOf`** para filtros, **`difference`** para saber qué cambió y **`union`** para juntar sin duplicados. Todos esperan un `Set` y devuelven uno nuevo.
