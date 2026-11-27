---
title: 'Prueba técnica: crea tu propio EventEmitter (on, off, emit, once)'
description: 'Implementa un sistema de eventos como el de Node.js o el de addEventListener: suscribirse con on, emitir con datos, darse de baja con off y escuchar una sola vez con once. El patrón publicador-suscriptor explicado, con solución oculta.'
date: 2026-11-27
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Clases, Eventos]
draft: true
---

Cada vez que escribes `boton.addEventListener('click', ...)` usas un **sistema de eventos**: algo avisa ("¡me han hecho clic!") y todas las funciones que estaban escuchando se ejecutan. Node.js tiene el suyo, el **`EventEmitter`** (lo viste en el post de fugas de memoria), y Vue lo usa con `emit` para que los componentes avisen a sus padres.

Implementar uno es una prueba técnica muy común porque comprueba varias cosas a la vez: **clases**, **estructuras de datos** (¿dónde guardas los listeners?), **funciones como valores** y casos límite sutiles.

A este patrón se le llama **publicador-suscriptor** (*pub/sub*): unos se **suscriben** a un evento y otros lo **publican**, sin conocerse entre ellos.

Tiempo recomendado: **40 minutos**.

## El enunciado

> Crea una clase `Emisor` con estos métodos:
>
> - `on(evento, funcion)`: suscribe `funcion` al evento. Devuelve una función que, al llamarla, cancela esa suscripción.
> - `emit(evento, ...datos)`: ejecuta todas las funciones suscritas a ese evento, **en el orden en que se suscribieron**, pasándoles los datos. Devuelve `true` si había alguna suscrita y `false` si no.
> - `off(evento, funcion)`: cancela la suscripción de esa función.
> - `once(evento, funcion)`: suscribe una función que solo se ejecuta **la primera vez** que se emite el evento.

```js
const emisor = new Emisor()
emisor.on('pedido', (id, total) => console.log(`Pedido ${id}: S/ ${total}`))
emisor.emit('pedido', 42, 150)   // Pedido 42: S/ 150
```

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
class Emisor {
  // tu código aquí
}

// Pruebas
const registro = []
const emisor = new Emisor()

const alPedido = (id) => registro.push(`A:${id}`)
emisor.on('pedido', alPedido)
emisor.on('pedido', (id) => registro.push(`B:${id}`))

probar('emit devuelve true', emisor.emit('pedido', 1), true)
probar('se ejecutan en orden', registro, ['A:1', 'B:1'])
probar('evento sin suscritos', emisor.emit('nada'), false)

emisor.off('pedido', alPedido)
emisor.emit('pedido', 2)
probar('off quita la suscripción', registro, ['A:1', 'B:1', 'B:2'])

const cancelar = emisor.on('pago', (total) => registro.push(`pago:${total}`))
emisor.emit('pago', 100)
cancelar()
emisor.emit('pago', 200)
probar('on devuelve una función para cancelar', registro.filter((r) => r.startsWith('pago')), ['pago:100'])

emisor.once('inicio', () => registro.push('inicio'))
emisor.emit('inicio')
emisor.emit('inicio')
probar('once solo se ejecuta una vez', registro.filter((r) => r === 'inicio').length, 1)

const varios = []
emisor.on('datos', (a, b, c) => varios.push(a + b + c))
emisor.emit('datos', 1, 2, 3)
probar('pasa todos los datos', varios, [6])
```

<!-- solucion: Ver una pista -->

Guarda las suscripciones en un **`Map`**: la clave es el nombre del evento y el valor, un **array de funciones** (lo viste en el post de `Map` y `Set`).

- `on` añade la función al array (créalo si no existe).
- `emit` recorre el array y llama a cada función con los datos (`funcion(...datos)`).
- `off` filtra el array para quitar esa función.
- `once` puede reutilizar `on`: suscribe una función "envoltorio" que llama a la original **y se da de baja a sí misma**.

<!-- /solucion -->

<!-- solucion -->

```js playground=solucion
class Emisor {
  #suscripciones = new Map()

  on(evento, funcion) {
    if (!this.#suscripciones.has(evento)) this.#suscripciones.set(evento, [])
    this.#suscripciones.get(evento).push(funcion)
    return () => this.off(evento, funcion)
  }

  off(evento, funcion) {
    const lista = this.#suscripciones.get(evento)
    if (!lista) return
    const restantes = lista.filter((f) => f !== funcion)
    if (restantes.length) this.#suscripciones.set(evento, restantes)
    else this.#suscripciones.delete(evento)
  }

  emit(evento, ...datos) {
    const lista = this.#suscripciones.get(evento)
    if (!lista) return false
    for (const funcion of [...lista]) funcion(...datos) // recorremos una copia
    return true
  }

  once(evento, funcion) {
    const unaVez = (...datos) => {
      this.off(evento, unaVez)
      funcion(...datos)
    }
    return this.on(evento, unaVez)
  }
}

// Pruebas
const registro = []
const emisor = new Emisor()

const alPedido = (id) => registro.push(`A:${id}`)
emisor.on('pedido', alPedido)
emisor.on('pedido', (id) => registro.push(`B:${id}`))

probar('emit devuelve true', emisor.emit('pedido', 1), true)
probar('se ejecutan en orden', registro, ['A:1', 'B:1'])
probar('evento sin suscritos', emisor.emit('nada'), false)

emisor.off('pedido', alPedido)
emisor.emit('pedido', 2)
probar('off quita la suscripción', registro, ['A:1', 'B:1', 'B:2'])

const cancelar = emisor.on('pago', (total) => registro.push(`pago:${total}`))
emisor.emit('pago', 100)
cancelar()
emisor.emit('pago', 200)
probar('on devuelve una función para cancelar', registro.filter((r) => r.startsWith('pago')), ['pago:100'])

emisor.once('inicio', () => registro.push('inicio'))
emisor.emit('inicio')
emisor.emit('inicio')
probar('once solo se ejecuta una vez', registro.filter((r) => r === 'inicio').length, 1)

const varios = []
emisor.on('datos', (a, b, c) => varios.push(a + b + c))
emisor.emit('datos', 1, 2, 3)
probar('pasa todos los datos', varios, [6])
```

Las decisiones que importan:

- **`#suscripciones` es privado** (lo viste en el post de clases): nadie puede modificar los listeners desde fuera.
- **Un `Map` de arrays**: buscar un evento es inmediato, y el array mantiene el **orden** de suscripción.
- **`on` devuelve la función para cancelar**: es lo que hacen muchas librerías modernas, y encaja perfecto con la limpieza de un `useEffect` en React (`return emisor.on(...)`).
- **`off` borra la entrada vacía** del `Map`: así `emit` de un evento sin suscritos devuelve `false` y no se acumulan claves vacías.
- **`once` reutiliza `on` y `off`**: la función envoltorio se da de baja **antes** de llamar a la original.

### El detalle más sutil: recorrer una copia

Fíjate en `for (const funcion of [...lista])`. ¿Por qué una copia? Porque un listener puede **darse de baja mientras se está emitiendo** (justo lo que hace `once`). Si recorres el array original y, en medio, alguien lo modifica, puedes saltarte listeners o ejecutar alguno dos veces. Con la copia, cada `emit` trabaja con la lista **tal como estaba al empezar**.

En esta solución `off` crea un array nuevo con `filter` en vez de modificar el original, así que también estaríamos a salvo sin la copia. Pero si alguien cambia `off` para usar `splice`, la copia en `emit` evita el bug. Mencionar este caso en una entrevista demuestra mucha experiencia.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **La estructura de datos**: un `Map` (o un objeto) de arrays, y por qué.
- **Funciones como valores**: guardarlas, compararlas con `===` para el `off`, llamarlas con `...datos`.
- **Que `once` funcione** y no deje restos.
- **Casos límite**: emitir un evento sin suscritos, `off` de algo que no estaba, darse de baja durante un `emit`.
- **Una API cómoda**: devolver la función de cancelar de `on`.

## Pregunta de seguimiento

Si un listener lanza un error, ¿qué pasa con los demás listeners de ese evento? ¿Cómo harías que se ejecuten igualmente?

<!-- solucion: Ver la respuesta -->

Con la solución actual, el error **corta el bucle**: los listeners que van después no se ejecutan, y el error sube hasta quien llamó a `emit`. Un fallo en una parte de la app rompe otras que no tienen nada que ver.

Para aislarlos, envuelve cada llamada en un `try/catch` y avisa del error sin detener el resto:

```js playground=seguimiento
class EmisorSeguro {
  #suscripciones = new Map()

  on(evento, funcion) {
    if (!this.#suscripciones.has(evento)) this.#suscripciones.set(evento, [])
    this.#suscripciones.get(evento).push(funcion)
  }

  emit(evento, ...datos) {
    const lista = this.#suscripciones.get(evento) ?? []
    const errores = []
    for (const funcion of [...lista]) {
      try {
        funcion(...datos)
      } catch (error) {
        errores.push(error)
      }
    }
    if (errores.length) console.warn(`${errores.length} listener(s) de "${evento}" fallaron:`, errores.map((e) => e.message))
    return lista.length > 0
  }
}

const seguro = new EmisorSeguro()
const ejecutados = []
seguro.on('guardar', () => ejecutados.push(1))
seguro.on('guardar', () => { throw new Error('¡boom!') })
seguro.on('guardar', () => ejecutados.push(3))
seguro.emit('guardar')

probar('los demás se ejecutan', ejecutados, [1, 3])
```

Es una decisión de diseño, y no hay una única respuesta correcta: el `EventEmitter` de Node, por ejemplo, **no** captura los errores (los deja subir), y para el evento especial `'error'` exige que haya un listener o lanza el error. Plantear las dos opciones y sus consecuencias es lo que busca la pregunta.

<!-- /solucion -->
