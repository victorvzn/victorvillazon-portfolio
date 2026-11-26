---
title: '6 ejercicios con textos y números (con solución oculta)'
description: 'Capitalizar, convertir temperaturas, promediar notas, limpiar una lista y encontrar la letra más repetida. Seis ejercicios para dominar strings y arrays.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Lógica, Ejercicios]
draft: true
---

Los textos (*strings*) aparecen en casi todos los programas: nombres que hay que formatear, listas que llegan separadas por comas, búsquedas que hay que limpiar. Estos seis ejercicios te hacen practicar exactamente eso.

Si todavía no los hiciste, empieza por los **5 ejercicios de lógica para calentar**: estos son el siguiente paso.

## Cómo comprobar tus soluciones

Cada ejemplo incluye la función `probar`, que muestra ✅ o ❌ en la consola del playground:

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

## 1. De Celsius a Fahrenheit

Escribe `aFahrenheit(celsius)`. La fórmula es: **°F = °C × 9 / 5 + 32**.

```js playground=temperatura
function aFahrenheit(celsius) {
  // tu código aquí
}

probar('agua congelada', aFahrenheit(0), 32)
probar('agua hirviendo', aFahrenheit(100), 212)
probar('bajo cero', aFahrenheit(-40), -40)
```

<!-- solucion -->

```js playground=temperatura-solucion
function aFahrenheit(celsius) {
  return celsius * 9 / 5 + 32
}

probar('agua congelada', aFahrenheit(0), 32)
probar('agua hirviendo', aFahrenheit(100), 212)
probar('bajo cero', aFahrenheit(-40), -40)
```

Es solo traducir la fórmula a código. JavaScript respeta el orden de las operaciones de matemáticas: primero multiplica y divide, luego suma.

Dato curioso: −40 °C es exactamente −40 °F, el único punto donde las dos escalas coinciden.

<!-- /solucion -->

## 2. Capitalizar un nombre

Escribe `capitalizar(texto)`, que ponga en mayúscula la primera letra **de cada palabra** y el resto en minúscula.

```js playground=capitalizar
function capitalizar(texto) {
  // tu código aquí
}

probar('todo minúsculas', capitalizar('ana torres'), 'Ana Torres')
probar('todo mayúsculas', capitalizar('LUIS RAMÍREZ'), 'Luis Ramírez')
probar('una palabra', capitalizar('marta'), 'Marta')
```

<!-- solucion: Ver una pista -->

Divide el texto en palabras con `split(' ')`. Para cada palabra: `palabra[0]` es la primera letra y `palabra.slice(1)` es el resto. Luego vuelve a unirlas con `join(' ')`.

<!-- /solucion -->

<!-- solucion -->

```js playground=capitalizar-solucion
function capitalizar(texto) {
  return texto
    .split(' ')
    .map(palabra => palabra[0].toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ')
}

probar('todo minúsculas', capitalizar('ana torres'), 'Ana Torres')
probar('todo mayúsculas', capitalizar('LUIS RAMÍREZ'), 'Luis Ramírez')
probar('una palabra', capitalizar('marta'), 'Marta')
```

El patrón **texto → array → transformar → texto** (`split` → `map` → `join`) es de los más útiles que vas a aprender. Lo usarás muchísimo.

Un caso límite: si el texto tiene dos espacios seguidos, `split(' ')` crea una palabra vacía y `palabra[0]` es `undefined`. Para hacerlo a prueba de eso, filtra antes las palabras vacías: `.filter(palabra => palabra !== '')`.

<!-- /solucion -->

## 3. Promedio de notas

Escribe `promedio(notas)`, que devuelva la media del array redondeada a **un decimal**. Si el array está vacío, devuelve `0`.

```js playground=promedio
function promedio(notas) {
  // tu código aquí
}

probar('exacto', promedio([10, 20]), 15)
probar('con decimales', promedio([15, 18, 14]), 15.7)
probar('vacío', promedio([]), 0)
```

<!-- solucion -->

```js playground=promedio-solucion
function promedio(notas) {
  if (notas.length === 0) return 0

  let suma = 0
  for (const nota of notas) {
    suma += nota
  }

  return Math.round((suma / notas.length) * 10) / 10
}

probar('exacto', promedio([10, 20]), 15)
probar('con decimales', promedio([15, 18, 14]), 15.7)
probar('vacío', promedio([]), 0)
```

- **El caso vacío primero.** Sin él, dividirías `0 / 0`, que da `NaN`.
- **Redondear a un decimal**: multiplicas por 10, redondeas y divides entre 10. `15.666…` → `156.66…` → `157` → `15.7`.

¿Por qué no `toFixed(1)`? Porque devuelve un **texto** (`'15.7'`), y la prueba espera un número. `toFixed` es ideal para **mostrar** en pantalla, no para seguir calculando.

<!-- /solucion -->

## 4. Texto a lista

Llega un texto con elementos separados por comas, pero escrito "a mano": con espacios de más y comas vacías. Escribe `textoALista(texto)`, que devuelva un array limpio.

```js playground=lista
function textoALista(texto) {
  // tu código aquí
}

probar('con espacios', textoALista('html, css ,  javascript'), ['html', 'css', 'javascript'])
probar('comas vacías', textoALista('pan,, leche, ,huevos'), ['pan', 'leche', 'huevos'])
probar('vacío', textoALista(''), [])
```

<!-- solucion -->

```js playground=lista-solucion
function textoALista(texto) {
  return texto
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '')
}

probar('con espacios', textoALista('html, css ,  javascript'), ['html', 'css', 'javascript'])
probar('comas vacías', textoALista('pan,, leche, ,huevos'), ['pan', 'leche', 'huevos'])
probar('vacío', textoALista(''), [])
```

Tres pasos encadenados: **partir** por comas, **limpiar** espacios con `trim()` y **quitar** los vacíos con `filter`. Así se procesan las etiquetas que escribe un usuario en un formulario.

<!-- /solucion -->

## 5. Limpiar valores vacíos

Escribe `limpiar(lista)`, que quite todos los valores *falsy* de un array: `false`, `0`, `''`, `null`, `undefined` y `NaN`.

```js playground=falsy
function limpiar(lista) {
  // tu código aquí
}

probar('mezcla', limpiar([1, 0, 'hola', '', null, true, undefined, false]), [1, 'hola', true])
probar('ya limpio', limpiar(['a', 'b']), ['a', 'b'])
```

<!-- solucion -->

```js playground=falsy-solucion
function limpiar(lista) {
  return lista.filter(Boolean)
}

probar('mezcla', limpiar([1, 0, 'hola', '', null, true, undefined, false]), [1, 'hola', true])
probar('ya limpio', limpiar(['a', 'b']), ['a', 'b'])
```

`filter(Boolean)` es un truco muy conocido. `Boolean(valor)` convierte cualquier valor en `true` o `false`, así que `filter` se queda solo con los *truthy*. Es lo mismo que escribir `lista.filter(item => Boolean(item))`.

Ojo en la vida real: a veces el `0` **sí** es un dato válido (una nota de 0, un stock de 0). Ahí no te sirve este truco.

<!-- /solucion -->

## 6. La letra más repetida

Escribe `letraMasRepetida(texto)`, que devuelva la letra que más veces aparece, sin contar espacios ni distinguir mayúsculas. Si hay empate, la que aparezca primero.

```js playground=letra
function letraMasRepetida(texto) {
  // tu código aquí
}

probar('banana', letraMasRepetida('banana'), 'a')
probar('con espacios', letraMasRepetida('hola mundo'), 'o')
probar('mayúsculas', letraMasRepetida('Mississippi'), 'i')
```

<!-- solucion: Ver una pista -->

Primero **cuenta** cuántas veces aparece cada letra usando un objeto como libreta (`cuenta[letra] = (cuenta[letra] ?? 0) + 1`). Después recorre ese objeto buscando la letra con el número más alto.

<!-- /solucion -->

<!-- solucion -->

```js playground=letra-solucion
function letraMasRepetida(texto) {
  const cuenta = {}

  for (const letra of texto.toLowerCase()) {
    if (letra === ' ') continue
    cuenta[letra] = (cuenta[letra] ?? 0) + 1
  }

  let ganadora = ''
  let maximo = 0

  for (const [letra, veces] of Object.entries(cuenta)) {
    if (veces > maximo) {
      ganadora = letra
      maximo = veces
    }
  }

  return ganadora
}

probar('banana', letraMasRepetida('banana'), 'a')
probar('con espacios', letraMasRepetida('hola mundo'), 'o')
probar('mayúsculas', letraMasRepetida('Mississippi'), 'i')
```

El ejercicio se resuelve en **dos fases**: primero contar, luego buscar el máximo. Separar un problema en fases así es una de las habilidades más útiles en programación.

¿Y el empate? Como usamos `>` (y no `>=`), una letra solo reemplaza a la ganadora si tiene **más** apariciones. En `'Mississippi'`, la `i` y la `s` aparecen 4 veces, pero la `i` llegó primero y se queda.

<!-- /solucion -->

## Qué entrenaste

- Traducir una **fórmula** a código.
- El patrón **`split` → `map` → `join`**.
- **Redondear** sin convertir en texto.
- Limpiar datos con **`trim`** y **`filter`**.
- **Contar** con un objeto y buscar el **máximo**.
- Pensar en **casos límite**: vacíos, empates, espacios de más.
