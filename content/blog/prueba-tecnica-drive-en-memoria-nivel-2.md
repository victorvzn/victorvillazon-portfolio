---
title: 'Prueba técnica por niveles: un Drive en memoria (nivel 2)'
description: 'Segundo nivel del Drive en memoria: buscar archivos por carpeta y extensión, ordenarlos por tamaño y calcular el espacio ocupado, sin romper lo que ya funcionaba.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica]
draft: true
---

¿Superaste el **nivel 1**? Entonces tu Drive ya sabe crear, copiar, consultar y borrar archivos. En este tipo de prueba, el siguiente nivel **añade operaciones nuevas** que tienen que convivir con las anteriores. Aquí se ve si tu código del nivel 1 estaba preparado para crecer.

Si no has hecho el nivel 1, empieza por ahí: este post parte de su solución.

Tiempo recomendado para el nivel 2: **30 minutos**.

## El enunciado (nivel 2)

> Además de las operaciones del nivel 1, implementa:
>
> **`BUSCAR <prefijo> <sufijo>`**
> Busca los archivos cuya ruta **empieza** por `prefijo` y **termina** por `sufijo`.
> Devuelve como máximo **10** resultados, ordenados por **tamaño de mayor a menor**; si dos archivos tienen el mismo tamaño, por **ruta en orden alfabético**.
> El formato es `ruta(tamano)`, separados por `', '` (coma y espacio). Si no hay ninguno, devuelve `''`.
>
> **`OCUPADO <prefijo>`**
> Devuelve la suma de los tamaños de todos los archivos cuya ruta empieza por `prefijo`, como texto. Si no hay ninguno, `'0'`.

## Un ejemplo paso a paso

```js
const consultas = [
  ['CREAR', '/fotos/playa.jpg', '300'],     // 'true'
  ['CREAR', '/fotos/montana.jpg', '500'],   // 'true'
  ['CREAR', '/fotos/perro.png', '300'],     // 'true'
  ['CREAR', '/docs/cv.pdf', '120'],         // 'true'
  ['CREAR', '/fotos/viaje/lima.jpg', '800'], // 'true'
  ['BUSCAR', '/fotos', '.jpg'],
  // '/fotos/viaje/lima.jpg(800), /fotos/montana.jpg(500), /fotos/playa.jpg(300)'
  ['BUSCAR', '/musica', '.mp3'],            // '': no hay ninguno
  ['OCUPADO', '/fotos'],                    // '1900' (300 + 500 + 300 + 800)
  ['OCUPADO', '/'],                         // '2020': todos los archivos
  ['OCUPADO', '/videos']                    // '0'
]
```

Fíjate en que `/fotos/viaje/lima.jpg` aparece al buscar en `/fotos`: está en una subcarpeta, pero su ruta **empieza** por `/fotos`.

## Tu turno

Copia tu solución del nivel 1 (o la del post) y amplíala. Las pruebas del nivel 1 tienen que **seguir pasando**:

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function procesar(consultas) {
  // pega aquí tu solución del nivel 1 y añade BUSCAR y OCUPADO
}

probar('nivel 1 sigue funcionando', procesar([
  ['CREAR', '/a.txt', '10'],
  ['COPIAR', '/a.txt', '/b.txt'],
  ['TAMANO', '/b.txt'],
  ['BORRAR', '/a.txt'],
  ['TAMANO', '/a.txt']
]), ['true', 'true', '10', 'true', ''])

probar('ejemplo del enunciado', procesar([
  ['CREAR', '/fotos/playa.jpg', '300'],
  ['CREAR', '/fotos/montana.jpg', '500'],
  ['CREAR', '/fotos/perro.png', '300'],
  ['CREAR', '/docs/cv.pdf', '120'],
  ['CREAR', '/fotos/viaje/lima.jpg', '800'],
  ['BUSCAR', '/fotos', '.jpg'],
  ['BUSCAR', '/musica', '.mp3'],
  ['OCUPADO', '/fotos'],
  ['OCUPADO', '/'],
  ['OCUPADO', '/videos']
]), [
  'true', 'true', 'true', 'true', 'true',
  '/fotos/viaje/lima.jpg(800), /fotos/montana.jpg(500), /fotos/playa.jpg(300)',
  '',
  '1900',
  '2020',
  '0'
])

probar('empate de tamaño: por ruta', procesar([
  ['CREAR', '/b.txt', '10'],
  ['CREAR', '/a.txt', '10'],
  ['CREAR', '/c.txt', '20'],
  ['BUSCAR', '/', '.txt']
]).at(-1), '/c.txt(20), /a.txt(10), /b.txt(10)')

const doceArchivos = Array.from({ length: 12 }, (_, i) => ['CREAR', `/f${i + 1}.txt`, String(i + 1)])
probar('como máximo 10 resultados', procesar([...doceArchivos, ['BUSCAR', '/', '.txt']]).at(-1),
  '/f12.txt(12), /f11.txt(11), /f10.txt(10), /f9.txt(9), /f8.txt(8), /f7.txt(7), /f6.txt(6), /f5.txt(5), /f4.txt(4), /f3.txt(3)')

probar('los borrados no cuentan', procesar([
  ['CREAR', '/x/uno.txt', '5'],
  ['CREAR', '/x/dos.txt', '7'],
  ['BORRAR', '/x/uno.txt'],
  ['OCUPADO', '/x'],
  ['BUSCAR', '/x', '.txt']
]).slice(-2), ['7', '/x/dos.txt(7)'])
```

Antes de programar:

1. ¿Qué parte de tu código del nivel 1 tienes que **cambiar**? ¿Y cuál solo **ampliar**?
2. `BUSCAR` y `OCUPADO` filtran los archivos de la misma forma (por prefijo). ¿Puedes reutilizar algo?

<!-- solucion: Ver la pista 1 (recorrer el Map) -->

Para recorrer todos los archivos de un `Map` con su ruta, usa `this.#archivos.entries()` (o directamente `for (const [ruta, archivo] of this.#archivos)`). Para usar `filter` y `map`, conviértelo en array: `[...this.#archivos]`.

`startsWith` y `endsWith` comprueban el principio y el final de un texto.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (ordenar con desempate) -->

La función de comparación de `sort` (o `toSorted`) puede desempatar con `||`: primero restas los tamaños (`b.tamano - a.tamano`, de mayor a menor) y, si da `0`, comparas las rutas. Lo vimos en el post de `sort`.

Para quedarte con los 10 primeros: `slice(0, 10)`.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
class Drive {
  #archivos = new Map() // ruta → { tamano }

  crear(ruta, tamano) {
    if (this.#archivos.has(ruta)) return false
    if (!Number.isInteger(tamano) || tamano <= 0) return false

    this.#archivos.set(ruta, { tamano })
    return true
  }

  copiar(origen, destino) {
    const archivo = this.#archivos.get(origen)
    if (!archivo || this.#archivos.has(destino)) return false

    this.#archivos.set(destino, { ...archivo })
    return true
  }

  tamano(ruta) {
    return this.#archivos.get(ruta)?.tamano ?? null
  }

  borrar(ruta) {
    return this.#archivos.delete(ruta)
  }

  // ── Nivel 2 ──────────────────────────────

  // Todos los archivos cuya ruta empieza por el prefijo, como { ruta, tamano }
  #enPrefijo(prefijo) {
    return [...this.#archivos]
      .filter(([ruta]) => ruta.startsWith(prefijo))
      .map(([ruta, archivo]) => ({ ruta, ...archivo }))
  }

  buscar(prefijo, sufijo, limite = 10) {
    return this.#enPrefijo(prefijo)
      .filter(({ ruta }) => ruta.endsWith(sufijo))
      .toSorted((a, b) => b.tamano - a.tamano || (a.ruta < b.ruta ? -1 : 1))
      .slice(0, limite)
  }

  ocupado(prefijo) {
    return this.#enPrefijo(prefijo).reduce((total, { tamano }) => total + tamano, 0)
  }
}

function procesar(consultas) {
  const drive = new Drive()

  const operaciones = {
    CREAR: (ruta, tamano) => String(drive.crear(ruta, Number(tamano))),
    COPIAR: (origen, destino) => String(drive.copiar(origen, destino)),
    TAMANO: (ruta) => String(drive.tamano(ruta) ?? ''),
    BORRAR: (ruta) => String(drive.borrar(ruta)),
    BUSCAR: (prefijo, sufijo) => drive.buscar(prefijo, sufijo)
      .map(({ ruta, tamano }) => `${ruta}(${tamano})`)
      .join(', '),
    OCUPADO: (prefijo) => String(drive.ocupado(prefijo))
  }

  return consultas.map(([comando, ...argumentos]) => {
    const operacion = operaciones[comando]
    return operacion ? operacion(...argumentos) : ''
  })
}

probar('nivel 1 sigue funcionando', procesar([
  ['CREAR', '/a.txt', '10'],
  ['COPIAR', '/a.txt', '/b.txt'],
  ['TAMANO', '/b.txt'],
  ['BORRAR', '/a.txt'],
  ['TAMANO', '/a.txt']
]), ['true', 'true', '10', 'true', ''])

probar('ejemplo del enunciado', procesar([
  ['CREAR', '/fotos/playa.jpg', '300'],
  ['CREAR', '/fotos/montana.jpg', '500'],
  ['CREAR', '/fotos/perro.png', '300'],
  ['CREAR', '/docs/cv.pdf', '120'],
  ['CREAR', '/fotos/viaje/lima.jpg', '800'],
  ['BUSCAR', '/fotos', '.jpg'],
  ['BUSCAR', '/musica', '.mp3'],
  ['OCUPADO', '/fotos'],
  ['OCUPADO', '/'],
  ['OCUPADO', '/videos']
]), [
  'true', 'true', 'true', 'true', 'true',
  '/fotos/viaje/lima.jpg(800), /fotos/montana.jpg(500), /fotos/playa.jpg(300)',
  '',
  '1900',
  '2020',
  '0'
])

probar('empate de tamaño: por ruta', procesar([
  ['CREAR', '/b.txt', '10'],
  ['CREAR', '/a.txt', '10'],
  ['CREAR', '/c.txt', '20'],
  ['BUSCAR', '/', '.txt']
]).at(-1), '/c.txt(20), /a.txt(10), /b.txt(10)')

const doceArchivos = Array.from({ length: 12 }, (_, i) => ['CREAR', `/f${i + 1}.txt`, String(i + 1)])
probar('como máximo 10 resultados', procesar([...doceArchivos, ['BUSCAR', '/', '.txt']]).at(-1),
  '/f12.txt(12), /f11.txt(11), /f10.txt(10), /f9.txt(9), /f8.txt(8), /f7.txt(7), /f6.txt(6), /f5.txt(5), /f4.txt(4), /f3.txt(3)')

probar('los borrados no cuentan', procesar([
  ['CREAR', '/x/uno.txt', '5'],
  ['CREAR', '/x/dos.txt', '7'],
  ['BORRAR', '/x/uno.txt'],
  ['OCUPADO', '/x'],
  ['BUSCAR', '/x', '.txt']
]).slice(-2), ['7', '/x/dos.txt(7)'])
```

Lo que más se valora:

**No se ha tocado nada del nivel 1.** Solo se **añadieron** métodos a la clase y dos líneas al objeto de operaciones. Es la recompensa de haber separado la lógica (`Drive`) del formato (`procesar`) en el nivel anterior.

**Un método privado compartido.** `BUSCAR` y `OCUPADO` filtran por prefijo de la misma forma, así que esa lógica vive en un solo sitio: `#enPrefijo`. Si mañana cambia la regla (por ejemplo, que `/fotos` no incluya `/fotosviejas`), se cambia en un solo lugar.

**`buscar` devuelve datos, no texto.** Devuelve un array de objetos `{ ruta, tamano }`, y es `procesar` quien decide el formato `ruta(tamano)`. El `límite` es un parámetro con valor por defecto: si otro nivel pide 5 resultados, no hay que reescribir nada.

**Ordenar sin modificar.** `toSorted` devuelve un array nuevo. Aquí daría igual (el array es temporal), pero es un buen hábito.

**Comparar rutas con `<`.** Para el desempate usamos la comparación directa de textos (orden de los caracteres), que es lo que suelen esperar los tests automáticos de estas pruebas. `localeCompare` es mejor para mostrar textos a personas, pero puede ordenar distinto los símbolos o las mayúsculas, y aquí queremos un orden exacto y predecible.

**`{ ruta, ...archivo }`.** Si en el nivel 3 los archivos tienen más datos (un dueño, una fecha), `#enPrefijo` los incluirá automáticamente.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que las pruebas del nivel 1 sigan pasando.** Romper lo anterior al añadir algo nuevo es el error más caro en este formato.
- **El desempate y el límite.** Son los detalles que hacen fallar la mayoría de soluciones.
- **El formato exacto**: coma **y espacio** entre resultados, sin espacio antes del paréntesis, `'0'` y no `''` en `OCUPADO`.
- **Reutilización**: no copiar y pegar el filtro por prefijo en dos sitios.

## Preguntas de seguimiento

1. Con la regla actual, `OCUPADO /fotos` también cuenta los archivos de `/fotosviejas/...`. ¿Cómo lo evitarías?
2. Si el Drive tuviera un millón de archivos y se llamara a `OCUPADO` muy a menudo, recorrerlos todos cada vez sería lento. ¿Qué podrías hacer?

<!-- solucion: Ver las respuestas -->

1. Considerar que un archivo está "dentro" de una carpeta si su ruta empieza por el prefijo **seguido de una barra**: `ruta.startsWith(prefijo.endsWith('/') ? prefijo : prefijo + '/')`. Así `/fotos` coincide con `/fotos/playa.jpg` pero no con `/fotosviejas/x.jpg`. Lo importante en la entrevista es **detectar** la ambigüedad y preguntar qué comportamiento se espera.
2. Guardar los totales ya calculados (una **caché**) y actualizarlos en cada `crear`, `copiar` y `borrar`, en vez de recalcularlos. Por ejemplo, un `Map` de carpeta → total que se suma o resta al cambiar un archivo. Es más rápido al consultar, a cambio de más trabajo al modificar y más memoria. Explicar ese **intercambio** (*trade-off*) es justo lo que buscan.

<!-- /solucion -->
