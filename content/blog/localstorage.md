---
title: 'localStorage: que tu app recuerde cosas'
description: 'Guarda datos en el navegador para que sobrevivan al recargar la página. Con una lista de tareas de ejemplo.'
date: 2026-11-25
series: javascript
tags: [JavaScript, Web APIs]
draft: true
order: 27
---

Haces una lista de tareas, recargas la página… y todo desaparece. Las variables de JavaScript viven solo mientras la página está abierta. Para que tu app **recuerde** cosas entre visitas, existe `localStorage`.

## Qué es

`localStorage` es un pequeño almacén de **clave y valor** que el navegador guarda para tu sitio. Lo que guardes ahí:

- **Sobrevive** al recargar y a cerrar el navegador.
- Solo lo ve **tu sitio** (otro dominio no puede leerlo).
- Solo existe en **ese navegador**. Si el usuario entra desde su celular, no está.

## Los 4 métodos que necesitas

```js
localStorage.setItem('tema', 'oscuro')  // guardar
localStorage.getItem('tema')            // leer → 'oscuro'
localStorage.removeItem('tema')         // borrar uno
localStorage.clear()                    // borrar todo lo de tu sitio
```

Si pides una clave que no existe, `getItem` devuelve `null`.

## Pruébalo aquí mismo

Los ejemplos de este post **no tienen botón al playground**: el playground ejecuta el código en un espacio aislado que, por seguridad, no permite usar `localStorage`.

Pero puedes probarlo en esta misma página: abre DevTools (`F12` o clic derecho → **Inspeccionar**), ve a la pestaña **Console** y pega esto:

```js
localStorage.setItem('saludo', 'Hola desde el blog')
console.log(localStorage.getItem('saludo'))
```

Ahora **recarga la página**, vuelve a la consola y escribe solo `localStorage.getItem('saludo')`. Sigue ahí.

En DevTools también puedes verlo todo en **Application → Local Storage** (en Firefox: **Almacenamiento**).

## El truco: solo guarda texto

`localStorage` solo guarda **strings**. Si guardas un número o un array, lo convierte a texto, y no siempre como esperas:

```js
localStorage.setItem('tareas', ['Estudiar', 'Comer'])
localStorage.getItem('tareas') // 'Estudiar,Comer' — ¡ya no es un array!
```

La solución es convertir a **JSON** al guardar y de vuelta al leer:

```js
const tareas = ['Estudiar', 'Comer']

// Guardar: de array a texto
localStorage.setItem('tareas', JSON.stringify(tareas))

// Leer: de texto a array
const guardadas = JSON.parse(localStorage.getItem('tareas'))
console.log(guardadas) // ['Estudiar', 'Comer'] ✅
```

## Una lista de tareas que no se olvida

Guarda esto como `tareas.html`, ábrelo en tu navegador, agrega tareas y recarga:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Mis tareas</title>
</head>
<body>
  <form id="form">
    <input id="nueva" placeholder="Nueva tarea" required>
    <button>Agregar</button>
  </form>
  <ul id="lista"></ul>

  <script>
    const form = document.querySelector('#form')
    const input = document.querySelector('#nueva')
    const lista = document.querySelector('#lista')

    // Al cargar: leemos lo guardado, o un array vacío si no hay nada
    let tareas = JSON.parse(localStorage.getItem('tareas')) ?? []

    const pintar = () => {
      lista.innerHTML = ''
      tareas.forEach((tarea) => {
        const li = document.createElement('li')
        li.textContent = tarea
        lista.append(li)
      })
    }

    form.addEventListener('submit', (evento) => {
      evento.preventDefault() // que el formulario no recargue la página
      tareas.push(input.value)
      localStorage.setItem('tareas', JSON.stringify(tareas)) // guardamos
      input.value = ''
      pintar()
    })

    pintar()
  </script>
</body>
</html>
```

El `?? []` significa: "si lo guardado es `null` (primera visita), usa un array vacío".

## Errores comunes

- **Guardar contraseñas o tokens.** Cualquier script que corra en tu página puede leer `localStorage`. No guardes nada sensible.
- **Olvidar `JSON.stringify` / `JSON.parse`.** Tus arrays y objetos se convierten en texto raro.
- **Guardar muchísimo.** El límite es de unos 5 MB por sitio. Es para preferencias y datos pequeños, no para una base de datos.

## Para profundizar

- [`localStorage` en MDN](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
- [`JSON.stringify` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

En resumen: **`setItem`** guarda, **`getItem`** lee, **`JSON.stringify`/`JSON.parse`** para todo lo que no sea texto, y **nada sensible** ahí dentro.
