---
title: 'fetch: trae datos de una API real (con Pokémon)'
description: 'Tu primera petición a una API con fetch y async/await: pide datos, muéstralos en la página y maneja los errores.'
date: 2026-11-25
series: javascript
tags: [JavaScript, APIs, Asincronía]
draft: true
order: 29
---

Casi todas las apps que usas piden datos a un servidor: el clima, tus mensajes, los productos de una tienda. En JavaScript eso se hace con `fetch`. Hoy vamos a pedir datos de verdad a la [PokeAPI](https://pokeapi.co/), una API gratuita que no necesita registro.

Si todavía no te sientes cómodo con `async`/`await`, lee primero el post de promesas.

## ¿Qué es una API?

Una **API** es una puerta que un servidor abre para que otros programas le pidan datos. Tú visitas una dirección (una URL) y en vez de una página web te responde con **datos en formato JSON**.

Prueba abrir esto en tu navegador: [https://pokeapi.co/api/v2/pokemon/pikachu](https://pokeapi.co/api/v2/pokemon/pikachu). Eso que ves es JSON.

## Tu primer fetch

```js playground=basico
const traerPokemon = async () => {
  const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu')
  const datos = await respuesta.json()

  console.log(datos.name)   // 'pikachu'
  console.log(datos.height) // 4
  console.log(datos.types.map((t) => t.type.name)) // ['electric']
}

traerPokemon()
```

Son **dos `await`**, y los dos son necesarios:

1. `fetch()` espera a que el servidor **responda**.
2. `.json()` espera a que llegue **todo el contenido** y lo convierte en un objeto de JavaScript.

## Manejar errores

Aquí hay una trampa: `fetch` **no lanza error** si el servidor responde con un 404 (no encontrado). Solo falla si no hay conexión. Por eso hay que revisar `respuesta.ok`:

```js playground=errores
const traerPokemon = async (nombre) => {
  try {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`)

    if (!respuesta.ok) {
      throw new Error(`No encontré a "${nombre}" (error ${respuesta.status})`)
    }

    const datos = await respuesta.json()
    console.log(`✅ ${datos.name} pesa ${datos.weight / 10} kg`)
  } catch (error) {
    console.log('❌', error.message)
  }
}

traerPokemon('charmander')
traerPokemon('digimon')
```

`throw` lanza el error a propósito para que lo atrape el `catch`. Así todos los errores terminan en el mismo lugar.

## Mostrarlo en la página: un buscador de Pokémon

Juntamos todo: un formulario, `fetch` y el DOM.

```html playground=buscador
<form id="form">
  <input id="nombre" placeholder="pikachu, eevee, mew..." required>
  <button>Buscar</button>
</form>

<div id="resultado" aria-live="polite"></div>
```

```css playground=buscador
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

form {
  display: flex;
  gap: 8px;
}

input,
button {
  padding: 10px;
  font: inherit;
}

.tarjeta {
  width: 200px;
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background: #fef9c3;
  text-align: center;
  text-transform: capitalize;
}

.error {
  color: #dc2626;
}
```

```js playground=buscador
const form = document.querySelector('#form')
const input = document.querySelector('#nombre')
const resultado = document.querySelector('#resultado')

form.addEventListener('submit', async (evento) => {
  evento.preventDefault()
  const nombre = input.value.trim().toLowerCase()
  resultado.textContent = 'Buscando...'

  try {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`)
    if (!respuesta.ok) throw new Error('No existe ese Pokémon')

    const pokemon = await respuesta.json()

    resultado.innerHTML = `
      <article class="tarjeta">
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" width="120" height="120">
        <h2>${pokemon.name}</h2>
        <p>${pokemon.types.map((t) => t.type.name).join(', ')}</p>
      </article>
    `
  } catch (error) {
    resultado.innerHTML = `<p class="error">${error.message}</p>`
  }
})
```

El `aria-live="polite"` hace que los lectores de pantalla anuncien el resultado cuando aparece.

## Errores comunes

- **Olvidar el `await` de `.json()`.** Te queda una promesa en vez de los datos.
- **No revisar `respuesta.ok`.** Un 404 no cae en el `catch` por sí solo.
- **Error de CORS.** Si ves "blocked by CORS policy", el servidor no permite que otras webs le pidan datos desde el navegador. No es un error de tu código: esa API hay que llamarla desde un servidor.

## Para profundizar

- [Usar Fetch en MDN](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch)
- [`Response.ok` en MDN](https://developer.mozilla.org/es/docs/Web/API/Response/ok)
- [Documentación de la PokeAPI (en inglés)](https://pokeapi.co/docs/v2)

En resumen: **`await fetch(url)`** pide los datos, **`await respuesta.json()`** los convierte, **`respuesta.ok`** te dice si salió bien, y **`try`/`catch`** atrapa todo lo demás.
