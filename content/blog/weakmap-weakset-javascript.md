---
title: 'WeakMap y WeakSet en JavaScript: colecciones que no impiden limpiar la memoria'
description: 'Cómo funciona la recolección de basura, por qué un Map puede causar fugas de memoria, qué son WeakMap y WeakSet, sus limitaciones y casos reales: datos asociados a elementos del DOM, caché por objeto y marcar objetos ya procesados. Con un vistazo a WeakRef.'
date: 2026-11-27
series: javascript
tags: [JavaScript, WeakMap, WeakSet, Memoria, Avanzado]
draft: true
---

En el post de `Map` y `Set` viste dos colecciones muy útiles. JavaScript tiene dos "primas" con nombres raros: **`WeakMap`** y **`WeakSet`**. Casi nunca aparecen en tutoriales, pero resuelven un problema real que tarde o temprano tendrás: **una app que consume cada vez más memoria** hasta que la pestaña va lenta o se cuelga.

Para entenderlas, primero hay que saber cómo JavaScript libera memoria.

## La recolección de basura en dos minutos

Cuando creas un objeto, JavaScript reserva memoria para él. Tú nunca la liberas a mano: lo hace el **recolector de basura** (*garbage collector*). Su regla es sencilla:

> Si ya no hay **ninguna forma de llegar** a un objeto desde tu código, se puede borrar.

```js
let usuario = { nombre: 'Ana' }   // el objeto existe y "usuario" apunta a él
usuario = null                    // ya nada apunta al objeto → el recolector lo borrará
```

Cada variable, propiedad o elemento de un array que apunta a un objeto es una **referencia**. Mientras quede **al menos una**, el objeto se queda en memoria.

## El problema: un `Map` que no suelta

Imagina que guardas datos extra sobre elementos del DOM, por ejemplo, cuántas veces se ha hecho clic en cada tarjeta:

```js
const clics = new Map()

function registrarClic(tarjeta) {
  clics.set(tarjeta, (clics.get(tarjeta) ?? 0) + 1)
}
```

Funciona. Pero cuando borras una tarjeta de la página (`tarjeta.remove()`), **el `Map` sigue teniendo una referencia a ella** como clave. El recolector ve que el elemento todavía es accesible (desde el `Map`) y **no lo borra nunca**.

En una app que crea y borra tarjetas durante horas (una lista que se filtra, un chat, un dashboard), el `Map` acumula miles de elementos "muertos" que nadie usa. Eso es una **fuga de memoria** (*memory leak*).

## `WeakMap`: referencias que no cuentan

Un **`WeakMap`** es un `Map` cuyas **claves son referencias débiles**: no impiden que el recolector borre el objeto. Si la única referencia que queda a un objeto es la de un `WeakMap`, el objeto se borra, y su entrada desaparece del `WeakMap` sola.

```js
const clics = new WeakMap()

function registrarClic(tarjeta) {
  clics.set(tarjeta, (clics.get(tarjeta) ?? 0) + 1)
}

function veces(tarjeta) {
  return clics.get(tarjeta) ?? 0
}
```

El código es **idéntico**, solo cambia `new Map()` por `new WeakMap()`. Ahora, al borrar una tarjeta de la página (y no quedar otras referencias), su contador desaparece con ella. Sin limpiar nada a mano.

```html playground=weakmap
<div id="lista"></div>
<button id="nueva">Añadir tarjeta</button>
```

```css playground=weakmap
body { font-family: system-ui, sans-serif; padding: 16px; }
.tarjeta { display: flex; justify-content: space-between; padding: 8px 12px; margin-block: 6px; border-radius: 8px; background: #f4f4f5; cursor: pointer; }
```

```js playground=weakmap
const clics = new WeakMap()
const lista = document.querySelector('#lista')
let numero = 0

document.querySelector('#nueva').addEventListener('click', () => {
  numero++
  const tarjeta = document.createElement('div')
  tarjeta.className = 'tarjeta'
  tarjeta.innerHTML = `<span>Tarjeta ${numero}</span><button>✕</button>`
  lista.append(tarjeta)
})

lista.addEventListener('click', (evento) => {
  const tarjeta = evento.target.closest('.tarjeta')
  if (!tarjeta) return

  if (evento.target.matches('button')) {
    tarjeta.remove() // al no quedar referencias, su entrada del WeakMap podrá liberarse
    return
  }

  clics.set(tarjeta, (clics.get(tarjeta) ?? 0) + 1)
  console.log(`${tarjeta.firstChild.textContent}: ${clics.get(tarjeta)} clics`)
})
```

(El ejemplo usa la delegación de eventos del post del mismo nombre: un solo listener en la lista para todas las tarjetas.)

## Las limitaciones (que son a propósito)

Como sus entradas pueden desaparecer en cualquier momento, un `WeakMap` tiene restricciones:

| | `Map` | `WeakMap` |
| --- | --- | --- |
| Tipo de claves | Cualquiera | **Solo objetos** (y símbolos no registrados) |
| `get`, `set`, `has`, `delete` | ✅ | ✅ |
| `size` | ✅ | ❌ |
| Recorrerlo (`for...of`, `keys()`, `forEach`) | ✅ | ❌ |
| `clear()` | ✅ | ❌ |
| Impide liberar la memoria de las claves | Sí | **No** |

¿Por qué no se puede saber su tamaño ni recorrerlo? Porque el recolector de basura trabaja **cuando quiere**: una entrada que existe ahora puede no existir un milisegundo después. Si pudieras contarlas, el resultado dependería de cuándo pasó el recolector, y tu código se volvería impredecible.

```js
const datos = new WeakMap()
datos.set('texto', 1)   // ❌ TypeError: Invalid value used as weak map key
```

Las claves deben ser **objetos**: un texto o un número no tiene "vida" propia que el recolector pueda seguir.

## Casos reales de `WeakMap`

### 1. Datos asociados a objetos que no son tuyos

Quieres guardar información sobre un elemento del DOM o sobre un objeto de una librería, **sin modificarlo** (añadirle propiedades a objetos ajenos es mala idea). Como el contador de clics de arriba.

### 2. Caché por objeto

```js playground=cache
const cacheTotales = new WeakMap()

function calcularTotal(pedido) {
  if (cacheTotales.has(pedido)) {
    console.log('⚡ desde la caché')
    return cacheTotales.get(pedido)
  }

  console.log('🧮 calculando...')
  const total = pedido.lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0)
  cacheTotales.set(pedido, total)
  return total
}

let pedido = { lineas: [{ precio: 120, cantidad: 2 }, { precio: 45, cantidad: 1 }] }

console.log(calcularTotal(pedido))   // calculando... 285
console.log(calcularTotal(pedido))   // desde la caché 285

pedido = null // cuando el pedido ya no se usa, su entrada de la caché también puede liberarse
```

Con un `Map`, la caché crecería sin fin, guardando pedidos que ya nadie usa. Con un `WeakMap`, la caché **vive exactamente lo que vive cada objeto**.

> Esta caché asume que el pedido **no cambia** (es inmutable). Si modificas `pedido.lineas`, el total guardado quedaría desactualizado. Otro motivo para trabajar con objetos inmutables (está en el post de funciones puras).

### 3. Datos "privados" de un objeto

Antes de que existieran los campos privados con `#` (lo viste en el post de clases), los `WeakMap` eran la forma de esconder datos de un objeto:

```js
const privados = new WeakMap()

class Cuenta {
  constructor(saldo) {
    privados.set(this, { saldo })
  }
  get saldo() {
    return privados.get(this).saldo
  }
}
```

Hoy se usa `#saldo`, pero verás este patrón en código y librerías antiguas.

## `WeakSet`: marcar objetos

Un **`WeakSet`** es lo mismo, pero como un `Set`: solo guarda objetos (sin valores asociados) y no impide liberarlos. Sirve para **marcar** objetos: "este ya lo procesé", "este está seleccionado".

```js playground=weakset
const yaProcesados = new WeakSet()

function procesar(pedido) {
  if (yaProcesados.has(pedido)) {
    console.log(`⏭ El pedido ${pedido.id} ya se procesó, lo salto`)
    return
  }
  console.log(`✅ Procesando el pedido ${pedido.id}`)
  yaProcesados.add(pedido)
}

const pedido1 = { id: 1 }
const pedido2 = { id: 2 }

procesar(pedido1)
procesar(pedido2)
procesar(pedido1)   // ya procesado
```

Otro uso clásico: detectar **referencias circulares** al recorrer un objeto (un objeto que, en algún nivel, se contiene a sí mismo), para no entrar en un bucle infinito:

```js playground=circular
function contarObjetos(valor, vistos = new WeakSet()) {
  if (typeof valor !== 'object' || valor === null) return 0
  if (vistos.has(valor)) return 0   // ya pasamos por aquí: evitamos el bucle infinito
  vistos.add(valor)

  let total = 1
  for (const hijo of Object.values(valor)) {
    total += contarObjetos(hijo, vistos)
  }
  return total
}

const ana = { nombre: 'Ana' }
const luis = { nombre: 'Luis', amiga: ana }
ana.amigo = luis   // referencia circular: ana → luis → ana

console.log(contarObjetos(ana)) // 2
```

## Un paso más: `WeakRef` y `FinalizationRegistry`

JavaScript tiene también **`WeakRef`**, una referencia débil a un solo objeto, y **`FinalizationRegistry`**, que avisa cuando un objeto se ha liberado. Son herramientas muy avanzadas, y la propia documentación recomienda **evitarlas** salvo que sepas exactamente lo que haces: el momento en que actúa el recolector es impredecible y cambia entre navegadores. Para el 99% de los casos, `WeakMap` y `WeakSet` son lo que necesitas.

## ¿Cuándo usar cada uno?

- **`Map` / `Set`**: casi siempre. Cuando las claves son textos o números, cuando necesitas recorrerlos o saber su tamaño (está en el post de `Map` y `Set`).
- **`WeakMap`**: cuando quieres **asociar datos a objetos** que tienen su propia vida (elementos del DOM, objetos de otra parte de la app) sin alargarla.
- **`WeakSet`**: cuando solo necesitas **marcar** objetos.

## Tu turno

En el playground:

1. Crea un `WeakMap` que guarde, para cada `<input>` de un formulario, su valor original, y un botón "Restaurar" que los devuelva a ese valor.
2. Usa un `WeakSet` para marcar las tarjetas "seleccionadas" al hacer clic (y desmarcarlas con otro clic), cambiando su clase.
3. Intenta usar un texto como clave de un `WeakMap` y lee el error.
4. Abre las DevTools, pestaña **Memory**, y haz una captura (*heap snapshot*) antes y después de crear y borrar 1.000 tarjetas, primero con un `Map` y luego con un `WeakMap`. Compara.

## Errores comunes

- **Usar textos o números como claves**: `TypeError: Invalid value used as weak map key`.
- **Intentar recorrerlo o pedir `.size`**: no existen.
- **Esperar que la entrada desaparezca al instante.** Se libera cuando el recolector decide, no cuando borras el objeto.
- **Pensar que `WeakMap` arregla todas las fugas.** Si el objeto sigue referenciado desde otro sitio (una variable global, un listener sin quitar), no se liberará.
- **Usar `WeakMap` cuando bastaba un `Map`.** Si las claves no son objetos con vida propia, no aporta nada.

## Para profundizar

- [`WeakMap` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [Gestión de memoria en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Memory_management)

En resumen: el **recolector de basura** borra los objetos a los que ya no se puede llegar. Un **`Map`** mantiene vivas sus claves aunque nadie más las use, lo que puede causar **fugas de memoria**. **`WeakMap`** y **`WeakSet`** guardan **solo objetos** con **referencias débiles**: cuando el objeto deja de usarse, su entrada desaparece sola. A cambio, no se pueden **recorrer** ni saber su **tamaño**. Úsalos para asociar datos a objetos con vida propia (como elementos del DOM), para cachés por objeto y para marcar objetos ya procesados.
