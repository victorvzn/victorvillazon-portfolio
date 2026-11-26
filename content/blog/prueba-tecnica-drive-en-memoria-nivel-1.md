---
title: 'Prueba técnica por niveles: un Drive en memoria (nivel 1)'
description: 'Un formato de prueba técnica cada vez más común: un sistema que procesa una lista de comandos y crece por niveles. Nivel 1: crear, copiar, consultar y borrar archivos.'
date: 2026-11-26
series: ejercicios
tags: [JavaScript, Pruebas técnicas, Lógica]
draft: true
---

Algunas empresas usan un formato de prueba técnica distinto a los ejercicios sueltos: te piden construir **un pequeño sistema** que va creciendo por **niveles**. Solo puedes pasar al nivel 2 cuando tu código supera todas las pruebas del nivel 1, y cada nivel nuevo añade funciones que tienen que convivir con las anteriores.

Lo que evalúan no es solo si resuelves el problema, sino **si tu código está preparado para crecer**. Una solución que funciona pero que hay que reescribir entera en el nivel 2 te va a costar mucho tiempo.

En esta serie vamos a construir un **Drive en memoria**: un sistema que guarda archivos con su tamaño, como Google Drive o Dropbox, pero sin tocar archivos de verdad. Todo vive en la memoria de tu programa.

Tiempo recomendado para el nivel 1: **30 minutos**.

## Cómo funciona este tipo de prueba

No vas a escribir una página web, sino una función que recibe una **lista de comandos** y devuelve una **lista de respuestas**, siempre como **textos**:

```js
const consultas = [
  ['CREAR', '/fotos/playa.jpg', '300'],
  ['TAMANO', '/fotos/playa.jpg']
]

procesar(consultas) // ['true', '300']
```

- Cada comando es un array: el **nombre** de la operación y sus **argumentos**.
- **Todos los valores son textos**, incluso los números (`'300'`). Tú decides cuándo convertirlos.
- Por cada comando hay **exactamente una respuesta**, en el mismo orden.

## El enunciado (nivel 1)

> Implementa un sistema de archivos en memoria que soporte estas cuatro operaciones:
>
> **`CREAR <ruta> <tamano>`**
> Guarda un archivo nuevo con su tamaño en KB.
> Falla si ya existe un archivo con esa ruta o si el tamaño no es un número entero positivo.
> Devuelve `'true'` si lo crea o `'false'` si falla.
>
> **`COPIAR <origen> <destino>`**
> Crea en `destino` un archivo con el mismo tamaño que el de `origen`.
> Falla si `origen` no existe o si `destino` ya existe.
> Devuelve `'true'` o `'false'`.
>
> **`TAMANO <ruta>`**
> Devuelve el tamaño del archivo como texto, o `''` (texto vacío) si no existe.
>
> **`BORRAR <ruta>`**
> Elimina el archivo.
> Devuelve `'true'` si existía y lo borró, o `'false'` si no existía.
>
> Las carpetas no existen como tales: son solo parte del nombre de la ruta (`/fotos/playa.jpg` es un archivo; no hace falta "crear" la carpeta `/fotos`).

## Un ejemplo paso a paso

```js
const consultas = [
  ['CREAR', '/fotos/playa.jpg', '300'],         // 'true': se crea
  ['CREAR', '/fotos/playa.jpg', '120'],         // 'false': ya existe
  ['CREAR', '/docs/cv.pdf', '-5'],              // 'false': tamaño no válido
  ['COPIAR', '/fotos/playa.jpg', '/backup/playa.jpg'], // 'true'
  ['COPIAR', '/fotos/montana.jpg', '/backup/montana.jpg'], // 'false': el origen no existe
  ['TAMANO', '/backup/playa.jpg'],              // '300'
  ['BORRAR', '/fotos/playa.jpg'],               // 'true'
  ['TAMANO', '/fotos/playa.jpg'],               // '': ya no existe
  ['BORRAR', '/fotos/playa.jpg']                // 'false': ya estaba borrado
]

// Resultado esperado:
// ['true', 'false', 'false', 'true', 'false', '300', 'true', '', 'false']
```

Fíjate en que borrar el original **no** borra la copia: son dos archivos independientes.

## Tu turno

```js playground-setup
const probar = (descripcion, obtenido, esperado) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperaba ${JSON.stringify(esperado)})`}`)
}
```

```js playground=reto
function procesar(consultas) {
  // tu código aquí
}

probar('ejemplo del enunciado', procesar([
  ['CREAR', '/fotos/playa.jpg', '300'],
  ['CREAR', '/fotos/playa.jpg', '120'],
  ['CREAR', '/docs/cv.pdf', '-5'],
  ['COPIAR', '/fotos/playa.jpg', '/backup/playa.jpg'],
  ['COPIAR', '/fotos/montana.jpg', '/backup/montana.jpg'],
  ['TAMANO', '/backup/playa.jpg'],
  ['BORRAR', '/fotos/playa.jpg'],
  ['TAMANO', '/fotos/playa.jpg'],
  ['BORRAR', '/fotos/playa.jpg']
]), ['true', 'false', 'false', 'true', 'false', '300', 'true', '', 'false'])

probar('copiar sobre un archivo existente', procesar([
  ['CREAR', '/a.txt', '10'],
  ['CREAR', '/b.txt', '20'],
  ['COPIAR', '/a.txt', '/b.txt'],
  ['TAMANO', '/b.txt']
]), ['true', 'true', 'false', '20'])

probar('tamaños raros', procesar([
  ['CREAR', '/cero.txt', '0'],
  ['CREAR', '/decimal.txt', '2.5'],
  ['CREAR', '/texto.txt', 'mucho'],
  ['CREAR', '/bien.txt', '7']
]), ['false', 'false', 'false', 'true'])

probar('sin consultas', procesar([]), [])
```

Antes de programar, piensa en dos preguntas:

1. ¿Qué **estructura de datos** te permite guardar "ruta → tamaño" y buscar una ruta al instante?
2. Sabiendo que en los próximos niveles habrá **más operaciones** (y más datos por archivo), ¿cómo organizarías el código para que añadirlas sea fácil?

<!-- solucion: Ver la pista 1 (los datos) -->

Un **`Map`** es ideal: la clave es la ruta y el valor, el tamaño. `has()` dice si existe, `get()` lo lee, `set()` lo guarda y `delete()` lo borra. Además, `delete()` devuelve `true` o `false` según si existía.

Para validar el tamaño: `Number.isInteger(numero) && numero > 0`. Recuerda que llega como texto.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (la organización) -->

Separa dos responsabilidades:

- **Una clase `Drive`** con un método por operación (`crear`, `copiar`, `tamano`, `borrar`). Sabe guardar archivos, pero no sabe nada de comandos ni de textos.
- **La función `procesar`**, que lee cada comando, llama al método que corresponde y convierte el resultado en texto.

Así, cuando lleguen nuevas operaciones, solo añades un método a la clase y una línea en `procesar`.

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
}

function procesar(consultas) {
  const drive = new Drive()

  const operaciones = {
    CREAR: (ruta, tamano) => String(drive.crear(ruta, Number(tamano))),
    COPIAR: (origen, destino) => String(drive.copiar(origen, destino)),
    TAMANO: (ruta) => String(drive.tamano(ruta) ?? ''),
    BORRAR: (ruta) => String(drive.borrar(ruta))
  }

  return consultas.map(([comando, ...argumentos]) => {
    const operacion = operaciones[comando]
    return operacion ? operacion(...argumentos) : ''
  })
}

probar('ejemplo del enunciado', procesar([
  ['CREAR', '/fotos/playa.jpg', '300'],
  ['CREAR', '/fotos/playa.jpg', '120'],
  ['CREAR', '/docs/cv.pdf', '-5'],
  ['COPIAR', '/fotos/playa.jpg', '/backup/playa.jpg'],
  ['COPIAR', '/fotos/montana.jpg', '/backup/montana.jpg'],
  ['TAMANO', '/backup/playa.jpg'],
  ['BORRAR', '/fotos/playa.jpg'],
  ['TAMANO', '/fotos/playa.jpg'],
  ['BORRAR', '/fotos/playa.jpg']
]), ['true', 'false', 'false', 'true', 'false', '300', 'true', '', 'false'])

probar('copiar sobre un archivo existente', procesar([
  ['CREAR', '/a.txt', '10'],
  ['CREAR', '/b.txt', '20'],
  ['COPIAR', '/a.txt', '/b.txt'],
  ['TAMANO', '/b.txt']
]), ['true', 'true', 'false', '20'])

probar('tamaños raros', procesar([
  ['CREAR', '/cero.txt', '0'],
  ['CREAR', '/decimal.txt', '2.5'],
  ['CREAR', '/texto.txt', 'mucho'],
  ['CREAR', '/bien.txt', '7']
]), ['false', 'false', 'false', 'true'])

probar('sin consultas', procesar([]), [])
```

Las decisiones que más se valoran:

**Separar la lógica del formato.** La clase `Drive` trabaja con datos de verdad: recibe **números** y devuelve **booleanos** o **números**. Solo `procesar` sabe que la prueba quiere textos. Si mañana el mismo `Drive` se usara desde una web o una API, no habría que cambiarlo.

**Un objeto de operaciones en vez de un `switch` gigante.** Cada comando apunta a su función. Añadir una operación nueva es añadir una línea, y un comando desconocido devuelve `''` sin romper nada.

**Guardar un objeto `{ tamano }` y no solo el número.** Ahora mismo bastaría con guardar el número, pero en los siguientes niveles cada archivo tendrá más información (por ejemplo, su dueño). Con un objeto, añadir un dato no obliga a cambiar el resto del código. Por la misma razón, al copiar hacemos `{ ...archivo }`: una **copia** del objeto, para que modificar un archivo no cambie también su copia.

**`#archivos` es privado.** Nadie puede tocar el `Map` desde fuera saltándose las reglas de `crear` o `copiar`.

**Validar en el lugar correcto.** `Number('mucho')` es `NaN` y `Number('2.5')` es `2.5`: los dos los descarta `Number.isInteger`. Y el cero lo descarta la comprobación `tamano <= 0`.

**`delete()` ya devuelve lo que necesitamos.** `Map.prototype.delete` devuelve `true` si borró algo y `false` si no existía: `borrar` es una línea.

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Que todos los casos límite estén cubiertos**: archivos que ya existen, orígenes que no existen, tamaños inválidos y la lista vacía.
- **Que las respuestas tengan el formato exacto.** `'true'` no es lo mismo que `true`, ni `'300'` lo mismo que `300`. En estas pruebas, un tipo equivocado es un test fallido.
- **Que el código esté listo para crecer**: datos bien encapsulados, una operación por método y un sitio claro donde añadir comandos nuevos.
- **Nombres claros.** En una prueba por niveles vas a releer tu propio código muchas veces en poco tiempo.

## ¿Qué vendrá en los siguientes niveles?

Este tipo de prueba suele ir añadiendo cosas como **buscar archivos** por parte de su nombre, **usuarios con espacio limitado** o **operaciones sobre los archivos** que cambian su tamaño. No hace falta que las programes ahora, pero piensa un momento:

> Si cada archivo tuviera un **dueño** y cada dueño un **límite de espacio**, ¿qué partes de tu solución tendrías que cambiar y cuáles se quedarían igual?

<!-- solucion: Ver la respuesta -->

Con este diseño, casi todo se queda igual:

- El objeto de cada archivo crecería: `{ tamano, dueno }`.
- La clase `Drive` tendría un segundo `Map` para los usuarios: `id → { limite }`.
- `crear` comprobaría, además, que el usuario tiene espacio. `copiar` ya copia el objeto entero, así que **conservaría el dueño sin tocar nada**.
- `procesar` solo ganaría líneas nuevas en el objeto de operaciones.

Si en vez de un objeto hubieras guardado solo el número del tamaño, o si toda la lógica estuviera mezclada dentro de un `switch` con los textos de respuesta, tendrías que reescribir buena parte. Esa es la diferencia que buscan en este tipo de pruebas.

<!-- /solucion -->
