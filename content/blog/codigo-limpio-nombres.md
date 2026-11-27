---
title: 'Código limpio para juniors: nombres, funciones pequeñas y menos anidación'
description: 'Las prácticas que más se notan en una revisión de código: nombres que se explican solos, funciones que hacen una cosa, retornos tempranos y sin números mágicos.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Buenas prácticas, Carrera]
draft: true
---

El código se escribe una vez, pero **se lee muchísimas veces**: tú mismo dentro de un mes, tus compañeros en una revisión, el entrevistador de una prueba técnica. Por eso, que el código funcione es solo la mitad del trabajo. La otra mitad es que **se entienda**.

No necesitas leerte libros enteros para escribir mejor código. Con estas prácticas, tu código va a parecer de otro nivel.

## 1. Nombres que se explican solos

Es la práctica más importante y la más fácil.

```js
// ❌ ¿Qué es d? ¿Qué es x? ¿Qué hace fn?
const d = 7
const x = u.filter((i) => i.a)
function fn(p) { return p * 1.18 }

// ✅ Se lee como una frase
const diasDePrueba = 7
const usuariosActivos = usuarios.filter((usuario) => usuario.activo)
function agregarIva(precio) { return precio * 1.18 }
```

Las reglas:

- **Variables: sustantivos** que digan qué contienen. `usuario`, `precioTotal`, `listaDeTareas`.
- **Funciones: verbos** que digan qué hacen. `calcularTotal`, `obtenerUsuario`, `validarEmail`, `mostrarError`.
- **Booleanos: preguntas** que se respondan con sí o no. `estaActivo`, `tieneStock`, `esAdmin`, `puedeEditar`.
- **Arrays: en plural.** `productos` es un array; `producto` es uno de ellos. Así, `productos.map((producto) => ...)` se lee solo.
- **Nada de abreviaturas** que solo entiendes tú. `usr`, `cnt`, `tmp`, `data2`... Escribe la palabra entera. El editor la autocompleta.

> Elige **un idioma** para los nombres y mantenlo en todo el proyecto. En muchas empresas se programa en inglés; en tus proyectos personales, el que prefieras, pero sin mezclar `getUsuario` con `calcularTotal` y `userList`.

## 2. Funciones pequeñas que hacen una sola cosa

Si para explicar qué hace una función necesitas decir "y" varias veces ("valida el formulario **y** envía los datos **y** muestra un mensaje **y** limpia los campos"), probablemente son varias funciones.

```js
// ❌ Una función que lo hace todo
async function enviarFormulario(evento) {
  evento.preventDefault()
  const email = formulario.email.value.trim()
  if (!email.includes('@')) {
    mensaje.textContent = 'Email inválido'
    mensaje.classList.add('error')
    return
  }
  const respuesta = await fetch('/api/suscribir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  if (respuesta.ok) {
    mensaje.textContent = '¡Gracias por suscribirte!'
    mensaje.classList.remove('error')
    formulario.reset()
  }
}

// ✅ Cada función hace una cosa, y la principal se lee como un índice
const esEmailValido = (email) => email.includes('@')

function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto
  mensaje.classList.toggle('error', esError)
}

function suscribir(email) {
  return fetch('/api/suscribir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
}

async function enviarFormulario(evento) {
  evento.preventDefault()
  const email = formulario.email.value.trim()

  if (!esEmailValido(email)) return mostrarMensaje('Email inválido', true)

  const respuesta = await suscribir(email)
  if (respuesta.ok) {
    mostrarMensaje('¡Gracias por suscribirte!')
    formulario.reset()
  }
}
```

Es más largo, pero cada pieza se entiende de un vistazo, se puede reutilizar (`mostrarMensaje` servirá para otros formularios) y se puede probar por separado.

## 3. Retornos tempranos en vez de `if` anidados

Los `if` dentro de `if` dentro de `if` crean una "flecha" de código difícil de seguir:

```js
// ❌ La "pirámide de la perdición"
function procesarPedido(pedido) {
  if (pedido) {
    if (pedido.productos.length > 0) {
      if (pedido.pagado) {
        enviar(pedido)
      } else {
        console.log('Falta el pago')
      }
    } else {
      console.log('El pedido está vacío')
    }
  } else {
    console.log('No hay pedido')
  }
}

// ✅ Retornos tempranos: primero descartas los casos raros, luego lo importante
function procesarPedido(pedido) {
  if (!pedido) return console.log('No hay pedido')
  if (pedido.productos.length === 0) return console.log('El pedido está vacío')
  if (!pedido.pagado) return console.log('Falta el pago')

  enviar(pedido)
}
```

A estos `if` del principio se les llama **cláusulas de guarda** (*guard clauses*): comprueban que todo esté bien y salen en cuanto algo falla. El "camino feliz" queda al final, sin sangría.

## 4. Nada de números mágicos

Un **número mágico** es un valor que aparece en el código sin explicación:

```js
// ❌ ¿Qué es 86400000? ¿Y 0.18? ¿Y 3?
if (Date.now() - ultimoAcceso > 86400000) cerrarSesion()
const total = subtotal * 1.18
if (intentos > 3) bloquear()

// ✅ Una constante con nombre lo explica
const UN_DIA_EN_MS = 24 * 60 * 60 * 1000
const IVA = 0.18
const MAX_INTENTOS = 3

if (Date.now() - ultimoAcceso > UN_DIA_EN_MS) cerrarSesion()
const total = subtotal * (1 + IVA)
if (intentos > MAX_INTENTOS) bloquear()
```

Además, si el IVA cambia, lo cambias **en un solo sitio**. Por convención, estas constantes se escriben en `MAYUSCULAS_CON_GUIONES`.

## 5. No te repitas (pero sin pasarte)

Si copias y pegas el mismo bloque tres veces, conviértelo en una función. A esto se le llama **DRY** (*Don't Repeat Yourself*).

```js
// ❌ Lo mismo tres veces
document.querySelector('#nombre').classList.toggle('error', document.querySelector('#nombre').value === '')
document.querySelector('#email').classList.toggle('error', document.querySelector('#email').value === '')
document.querySelector('#mensaje').classList.toggle('error', document.querySelector('#mensaje').value === '')

// ✅ Una función y un bucle
const marcarSiVacio = (campo) => campo.classList.toggle('error', campo.value.trim() === '')
document.querySelectorAll('#nombre, #email, #mensaje').forEach(marcarSiVacio)
```

Pero cuidado: si dos trozos de código se **parecen** pero representan cosas distintas, juntarlos a la fuerza crea funciones llenas de `if` para cada caso. **Repetir dos veces está bien; a la tercera, extrae una función.**

## 6. Comentarios: el porqué, no el qué

Si necesitas un comentario para explicar **qué** hace el código, normalmente es mejor **cambiar los nombres**:

```js
// ❌ El comentario repite lo que ya dice el código
// Suma 1 al contador
contador++

// ❌ El comentario compensa un mal nombre
// Comprueba si el usuario puede comprar
if (u.e > 17 && u.v) { ... }

// ✅ El nombre lo explica todo
const puedeComprar = usuario.edad >= 18 && usuario.verificado
if (puedeComprar) { ... }
```

Los comentarios valen oro cuando explican **por qué** algo es así, sobre todo si no es obvio:

```js
// La API devuelve los precios en céntimos para evitar errores con los decimales
const precio = producto.precio / 100

// Esperamos 300 ms para no hacer una petición por cada tecla
const buscarConPausa = debounce(buscar, 300)
```

## 7. Formato consistente: deja que lo haga una herramienta

No pierdas tiempo discutiendo si van punto y coma o comillas simples. Instala **Prettier** (hay una extensión para VS Code) y activa **"Format on Save"** (formatear al guardar). Tu código siempre tendrá el mismo formato, y en un equipo todo el mundo escribirá igual.

## Checklist antes de entregar código

- [ ] ¿Se entiende cada nombre sin tener que leer el resto del código?
- [ ] ¿Cada función hace una sola cosa?
- [ ] ¿Hay `if` anidados que se podrían convertir en retornos tempranos?
- [ ] ¿Hay números o textos repetidos que deberían ser una constante?
- [ ] ¿Quité los `console.log` de pruebas y el código comentado?
- [ ] ¿Está formateado?

## Tu turno

Refactoriza este código (que funcione igual, pero que se entienda):

```js playground=ejercicio
function f(l) {
  let r = []
  for (let i = 0; i < l.length; i++) {
    if (l[i].s > 0) {
      if (l[i].p < 100) {
        r.push(l[i].n + ': S/ ' + (l[i].p * 1.18).toFixed(2))
      }
    }
  }
  return r
}

console.log(f([
  { n: 'Mouse', p: 45, s: 10 },
  { n: 'Monitor', p: 650, s: 2 },
  { n: 'Cable', p: 9.5, s: 0 },
  { n: 'Audífonos', p: 90, s: 5 }
]))
```

## Errores comunes

- **Nombres de una letra** fuera de bucles muy cortos.
- **Funciones de 100 líneas.** Divídelas.
- **Comentarios desactualizados** que dicen una cosa mientras el código hace otra. Son peores que no tener comentarios.
- **Dejar código comentado "por si acaso".** Para eso está Git: si lo necesitas, lo recuperas del historial.
- **Refactorizar sin probar.** Después de cada cambio, comprueba que todo sigue funcionando.

## Para profundizar

- [Guía de estilo de JavaScript de Google (en inglés)](https://google.github.io/styleguide/jsguide.html)
- [Clean Code JavaScript (adaptación al español)](https://github.com/devictoribero/clean-code-javascript)

En resumen: usa **nombres que se expliquen solos** (verbos para funciones, preguntas para booleanos), escribe **funciones pequeñas** que hagan una cosa, cambia los `if` anidados por **retornos tempranos**, convierte los números mágicos en **constantes con nombre** y usa los comentarios para explicar **el porqué**. Tu yo del futuro (y tu entrevistador) te lo agradecerán.
