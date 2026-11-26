---
title: 'Un buscador en vivo: filtra una lista mientras escribes'
description: 'Construye paso a paso un buscador de contactos que filtra los resultados con cada letra. Une el evento input, filter, includes y el DOM.'
date: 2026-11-26
series: javascript
tags: [JavaScript, DOM, Proyectos]
draft: true
---

Los buscadores que filtran mientras escribes están en todas partes: contactos del móvil, productos de una tienda, canciones de una playlist. Parecen complicados, pero son tres piezas que ya conoces:

1. Un **array** con los datos.
2. El evento **`input`** para saber qué escribe el usuario.
3. **`filter`** para quedarte con lo que coincide, y el **DOM** para pintarlo.

Vamos a construir un buscador de contactos paso a paso.

## Paso 1: los datos y la lista

Empezamos pintando todos los contactos. Fíjate en que la función `pintar` recibe una lista: así podremos reutilizarla con la lista filtrada.

```html playground=paso1
<ul id="lista"></ul>
```

```js playground=paso1
const contactos = [
  { nombre: 'Ana Torres', telefono: '987 654 321' },
  { nombre: 'Luis Ramírez', telefono: '912 345 678' },
  { nombre: 'Marta Quispe', telefono: '956 789 012' },
  { nombre: 'Pedro Álvarez', telefono: '934 567 890' }
]

const lista = document.querySelector('#lista')

function pintar(contactosAMostrar) {
  lista.innerHTML = '' // vaciamos lo que hubiera antes

  for (const contacto of contactosAMostrar) {
    const li = document.createElement('li')
    li.textContent = `${contacto.nombre} · ${contacto.telefono}`
    lista.append(li)
  }
}

pintar(contactos)
```

## Paso 2: escuchar lo que se escribe y filtrar

Añadimos un input. Con cada cambio, filtramos y volvemos a pintar:

```html playground=paso2
<input id="buscador" type="search" placeholder="Buscar contacto...">
<ul id="lista"></ul>
```

```js playground=paso2
const contactos = [
  { nombre: 'Ana Torres', telefono: '987 654 321' },
  { nombre: 'Luis Ramírez', telefono: '912 345 678' },
  { nombre: 'Marta Quispe', telefono: '956 789 012' },
  { nombre: 'Pedro Álvarez', telefono: '934 567 890' }
]

const lista = document.querySelector('#lista')
const buscador = document.querySelector('#buscador')

function pintar(contactosAMostrar) {
  lista.innerHTML = ''
  for (const contacto of contactosAMostrar) {
    const li = document.createElement('li')
    li.textContent = `${contacto.nombre} · ${contacto.telefono}`
    lista.append(li)
  }
}

buscador.addEventListener('input', () => {
  const texto = buscador.value
  const encontrados = contactos.filter(contacto => contacto.nombre.includes(texto))
  pintar(encontrados)
})

pintar(contactos)
```

Escribe `Ana`: funciona. Ahora escribe `ana` en minúsculas... no aparece nada. Y si buscas `alvarez` sin tilde, tampoco. Lo arreglamos en el siguiente paso.

## Paso 3: ignorar mayúsculas y tildes

Para comparar sin que importen las mayúsculas ni las tildes, **normalizamos** los dos textos antes de compararlos:

```js
const normalizar = (texto) => texto
  .toLowerCase()                       // 'Álvarez' → 'álvarez'
  .normalize('NFD')                    // separa la tilde de la letra: 'a' + '´'
  .replace(/[̀-ͯ]/g, '')     // borra las tildes sueltas → 'alvarez'
```

No hace falta que memorices esa expresión regular. Basta con saber qué hace: quita las tildes. Cópiala cuando la necesites.

## Paso 4: el buscador completo

Juntamos todo y añadimos dos detalles que marcan la diferencia: buscar también por teléfono y un mensaje cuando no hay resultados.

```html playground=completo
<label for="buscador">Buscar contacto</label>
<input id="buscador" type="search" placeholder="Nombre o teléfono..." autocomplete="off">
<p id="estado" aria-live="polite"></p>
<ul id="lista"></ul>
```

```css playground=completo
body {
  font-family: system-ui, sans-serif;
  max-width: 400px;
  padding: 24px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  font: inherit;
}

#estado {
  color: #52525b;
  font-size: 14px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 10px 0;
  border-bottom: 1px solid #e4e4e7;
}

li span {
  display: block;
  color: #71717a;
  font-size: 14px;
}
```

```js playground=completo
const contactos = [
  { nombre: 'Ana Torres', telefono: '987 654 321' },
  { nombre: 'Luis Ramírez', telefono: '912 345 678' },
  { nombre: 'Marta Quispe', telefono: '956 789 012' },
  { nombre: 'Pedro Álvarez', telefono: '934 567 890' },
  { nombre: 'Sofía Mendoza', telefono: '901 234 567' }
]

const lista = document.querySelector('#lista')
const buscador = document.querySelector('#buscador')
const estado = document.querySelector('#estado')

const normalizar = (texto) => texto
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')

function pintar(contactosAMostrar) {
  lista.innerHTML = ''

  for (const contacto of contactosAMostrar) {
    const li = document.createElement('li')
    const telefono = document.createElement('span')

    li.textContent = contacto.nombre
    telefono.textContent = contacto.telefono
    li.append(telefono)
    lista.append(li)
  }
}

function buscar() {
  const texto = normalizar(buscador.value.trim())

  const encontrados = contactos.filter(contacto =>
    normalizar(contacto.nombre).includes(texto) ||
    contacto.telefono.replaceAll(' ', '').includes(texto.replaceAll(' ', ''))
  )

  pintar(encontrados)
  estado.textContent = encontrados.length === 0
    ? `No hay contactos que coincidan con «${buscador.value}».`
    : ''
}

buscador.addEventListener('input', buscar)
buscar()
```

Prueba a buscar `alvarez`, `MARTA` o un trozo del teléfono como `912345`.

Lo que hace cada pieza nueva:

- **`trim()`** quita los espacios del principio y del final. Así, un espacio accidental no rompe la búsqueda.
- **El `||` dentro del `filter`**: el contacto aparece si coincide el nombre **o** el teléfono.
- **`replaceAll(' ', '')`** quita los espacios del teléfono para que `912345` encuentre `912 345 678`.
- **`aria-live="polite"`** hace que los lectores de pantalla anuncien el mensaje de "no hay resultados" cuando aparece.

## ¿Por qué `textContent` y no `innerHTML`?

Para pintar cada contacto usamos `textContent`, no `` li.innerHTML = `${contacto.nombre}` ``. Si los datos vinieran de usuarios reales, alguien podría guardar un "nombre" con código HTML o JavaScript dentro y se ejecutaría en tu página. `textContent` siempre lo trata como texto. Es un buen hábito desde el principio.

## Errores comunes

- **Filtrar sobre la lista ya filtrada.** Si guardas el resultado en la misma variable (`contactos = contactos.filter(...)`), al borrar letras los contactos no vuelven. Filtra **siempre** desde la lista original.
- **Usar `keydown` en vez de `input`.** Con `keydown`, el valor del input todavía no incluye la última letra.
- **No normalizar.** Sin `toLowerCase()` y sin quitar tildes, el buscador parece roto.

## Para profundizar

- [`Array.prototype.filter()` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [`String.prototype.normalize()` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)

En resumen: un buscador en vivo es **`input`** + **`filter`** + **volver a pintar**. Filtra siempre desde la **lista original**, **normaliza** los textos y muestra un mensaje cuando no hay resultados. Si la lista viniera de una API, añadirías un *debounce* para no hacer una petición por cada letra.
