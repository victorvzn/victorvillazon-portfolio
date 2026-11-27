---
title: 'Prueba técnica: comprimir un texto ("aaabcc" → "a3b1c2")'
description: 'Un clásico de entrevistas para practicar recorridos de textos: comprimir las letras repetidas seguidas con su cantidad, y la función inversa para descomprimir. Paso a paso y con solución oculta.'
date: 2026-11-27
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica, Textos]
draft: true
---

Los formatos de compresión más sencillos usan una idea muy intuitiva: en vez de escribir `aaaa`, escribe `a4`. Se llama **codificación por longitud de secuencia** (*run-length encoding*, RLE), y la usaban formatos de imagen antiguos para guardar zonas de un mismo color.

En una entrevista es una pregunta perfecta para ver si sabes **recorrer un texto llevando la cuenta** de lo que va pasando, y si piensas en los casos límite.

Tiempo recomendado: **25 minutos**.

## El enunciado

> Escribe una función `comprimir(texto)` que reemplace cada grupo de caracteres **iguales y seguidos** por el carácter y el número de veces que aparece.

- `'aaabcc'` → `'a3b1c2'`
- `'aabcccccaaa'` → `'a2b1c5a3'` (la `a` aparece en dos grupos separados)
- `''` → `''`

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function comprimir(texto) {
  // tu código aquí
}

probar('ejemplo', comprimir('aaabcc'), 'a3b1c2')
probar('grupos separados', comprimir('aabcccccaaa'), 'a2b1c5a3')
probar('un carácter', comprimir('z'), 'z1')
probar('sin repetidos', comprimir('abc'), 'a1b1c1')
probar('vacío', comprimir(''), '')
probar('mayúsculas distintas', comprimir('aAa'), 'a1A1a1')
probar('más de 9', comprimir('x'.repeat(12)), 'x12')
```

Fíjate en el segundo caso: no se trata de **contar cuántas veces aparece cada letra** en total (eso es otro ejercicio, el de contar caracteres), sino de contar los **grupos seguidos**.

<!-- solucion: Ver una pista -->

Recorre el texto llevando dos variables: el carácter **actual** y **cuántas veces seguidas** lo has visto. Cuando el siguiente carácter sea distinto, "cierra" el grupo: añade al resultado el carácter y su cuenta, y empieza a contar el nuevo.

¿Qué pasa con el último grupo? El bucle termina antes de que aparezca un carácter distinto que lo cierre.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
function comprimir(texto) {
  let resultado = ''
  let cuenta = 1

  for (let i = 0; i < texto.length; i++) {
    if (texto[i] === texto[i + 1]) {
      cuenta++
    } else {
      // El siguiente es distinto (o no hay siguiente): cerramos el grupo
      resultado += texto[i] + cuenta
      cuenta = 1
    }
  }

  return resultado
}

probar('ejemplo', comprimir('aaabcc'), 'a3b1c2')
probar('grupos separados', comprimir('aabcccccaaa'), 'a2b1c5a3')
probar('un carácter', comprimir('z'), 'z1')
probar('sin repetidos', comprimir('abc'), 'a1b1c1')
probar('vacío', comprimir(''), '')
probar('mayúsculas distintas', comprimir('aAa'), 'a1A1a1')
probar('más de 9', comprimir('x'.repeat(12)), 'x12')
```

Sigamos `'aaabcc'`:

| `i` | Carácter | ¿Igual al siguiente? | Acción | Resultado |
| --- | --- | --- | --- | --- |
| 0 | a | sí | cuenta = 2 | |
| 1 | a | sí | cuenta = 3 | |
| 2 | a | no (`b`) | cerrar grupo | `a3` |
| 3 | b | no (`c`) | cerrar grupo | `a3b1` |
| 4 | c | sí | cuenta = 2 | `a3b1` |
| 5 | c | no (`undefined`) | cerrar grupo | `a3b1c2` |

El truco está en **comparar con el siguiente** (`texto[i + 1]`): en la última posición, `texto[i + 1]` es `undefined`, que nunca es igual a un carácter, así que el último grupo se cierra solo. Sin casos especiales.

El texto vacío también funciona sin hacer nada: el bucle no da ninguna vuelta y devuelve `''`.

### Con expresiones regulares

Una solución más corta, si conoces bien las regex (está en el post de expresiones regulares):

```js playground=solucion-regex
function comprimir(texto) {
  return texto.replace(/(.)\1*/g, (grupo, caracter) => caracter + grupo.length)
}

probar('ejemplo', comprimir('aaabcc'), 'a3b1c2')
probar('grupos separados', comprimir('aabcccccaaa'), 'a2b1c5a3')
probar('vacío', comprimir(''), '')
```

`(.)` captura un carácter y `\1*` busca **ese mismo carácter** repetido cero o más veces. Cada grupo se reemplaza por el carácter y su longitud. En una entrevista, la versión con bucle suele ser mejor punto de partida: demuestra que sabes razonar el recorrido. La de regex, como "otra forma de hacerlo", suma puntos.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que entiendas el enunciado**: grupos **seguidos**, no el total de cada letra. Pregunta si tienes dudas: es parte de la prueba.
- **Cómo cierras el último grupo**: es el error más común.
- **Los casos límite**: texto vacío, un solo carácter, cuentas de dos cifras (`x12`).
- **La complejidad**: tu solución recorre el texto una vez, **O(n)**.

## Pregunta de seguimiento

Escribe `descomprimir(texto)`, que haga lo contrario: `'a3b1c2'` → `'aaabcc'`. Cuidado con las cuentas de varias cifras: `'x12'` son doce `x`, no una `x`, una `1` y una `2`.

<!-- solucion: Ver la respuesta -->

```js playground=seguimiento
function descomprimir(texto) {
  let resultado = ''
  for (const [, caracter, cuenta] of texto.matchAll(/(\D)(\d+)/g)) {
    resultado += caracter.repeat(Number(cuenta))
  }
  return resultado
}

probar('ejemplo', descomprimir('a3b1c2'), 'aaabcc')
probar('dos cifras', descomprimir('x12'), 'x'.repeat(12))
probar('vacío', descomprimir(''), '')
probar('ida y vuelta', descomprimir('a2b1c5a3'), 'aabcccccaaa')
```

`(\D)(\d+)` captura **un carácter que no es un dígito** seguido de **uno o más dígitos**: así `12` se lee como un solo número. `repeat` hace el resto.

Una buena pregunta para devolverle al entrevistador: ¿qué pasa si el texto original **contiene dígitos**, como `'a11'`? Comprimido sería `'a112'`, que es ambiguo. Los formatos reales lo resuelven con un separador o guardando la cuenta en un formato fijo. Plantear esa duda demuestra que piensas en los casos que rompen tu solución.

<!-- /solucion -->
