---
title: 'Mini proyecto: una app del clima con una API real'
description: 'Busca una ciudad y muestra su temperatura y el pronóstico de los próximos días con la API gratuita de Open-Meteo. fetch encadenados, estados de carga y error y localStorage.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, JavaScript, Proyectos, Fetch, APIs]
draft: true
---

Hasta ahora, los datos de tus proyectos estaban escritos en el código. En este, vienen de **internet**: vas a construir una app del clima que consulta una **API real**. Es uno de los proyectos más pedidos en pruebas técnicas para junior, porque obliga a manejar todo lo que sale mal en el mundo real: la red falla, la ciudad no existe, los datos tardan.

Usaremos **[Open-Meteo](https://open-meteo.com)**: gratuita, sin registro y **sin clave** (*API key*), y permite peticiones desde el navegador.

Tiempo recomendado: **2 horas**.

## El enunciado

> Crea una app del clima con:
>
> 1. Un buscador donde se escribe el nombre de una **ciudad**.
> 2. Al buscar, se muestra: el **nombre y el país**, la **temperatura actual**, una **descripción** del tiempo con un icono ("Parcialmente nublado ⛅") y el **viento**.
> 3. Un **pronóstico de 5 días** con la máxima y la mínima de cada día.
> 4. Estados de **carga**, **error** ("No encontramos esa ciudad") y **vacío** (antes de buscar).
> 5. La app **recuerda la última ciudad** buscada al volver a abrirla.

## Cómo funciona la API

Necesitas **dos peticiones**, una detrás de otra:

**1. Geocodificación**: convierte el nombre de la ciudad en coordenadas (latitud y longitud).

```bash
https://geocoding-api.open-meteo.com/v1/search?name=Lima&count=1&language=es
```

Devuelve algo así (resumido):

```json
{
  "results": [
    { "name": "Lima", "country": "Perú", "latitude": -12.04318, "longitude": -77.02824 }
  ]
}
```

Si la ciudad no existe, `results` **no viene**.

**2. El tiempo**: con las coordenadas, pides el tiempo actual y el diario.

```bash
https://api.open-meteo.com/v1/forecast?latitude=-12.04&longitude=-77.03&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
```

```json
{
  "current": { "temperature_2m": 19.4, "weather_code": 3, "wind_speed_10m": 11.2 },
  "daily": {
    "time": ["2026-11-26", "2026-11-27", "..."],
    "weather_code": [3, 2, "..."],
    "temperature_2m_max": [22.1, 23.0, "..."],
    "temperature_2m_min": [17.3, 17.8, "..."]
  }
}
```

Fíjate en el formato de `daily`: **no** es un array de días, sino **un array por cada dato**. El día 0 es `time[0]`, `temperature_2m_max[0]`... Tendrás que "juntarlos".

El `weather_code` es un número que describe el tiempo. Estos son los principales:

| Código | Tiempo |
| --- | --- |
| 0 | Despejado ☀️ |
| 1, 2 | Parcialmente nublado ⛅ |
| 3 | Nublado ☁️ |
| 45, 48 | Niebla 🌫️ |
| 51 a 57 | Llovizna 🌦️ |
| 61 a 67 | Lluvia 🌧️ |
| 71 a 77 | Nieve ❄️ |
| 80 a 82 | Chubascos 🌦️ |
| 95 a 99 | Tormenta ⛈️ |

## Tu turno

```html playground=reto
<main class="app">
  <h1>El clima</h1>
  <!-- El buscador -->
  <!-- Los estados: vacío, cargando, error -->
  <!-- El tiempo actual -->
  <!-- El pronóstico -->
</main>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: linear-gradient(#0ea5e9, #6366f1);
  min-height: 100vh;
}

/* tu CSS aquí */
```

```js playground=reto
// tu JavaScript aquí
```

<!-- solucion: Ver la pista 1 (organizar el código) -->

Separa el código en tres capas, cada una con sus funciones:

1. **Datos** (`fetch`): `buscarCiudad(nombre)` devuelve `{ nombre, pais, latitud, longitud }` o `null`; `obtenerTiempo(latitud, longitud)` devuelve los datos ya ordenados.
2. **Lógica pura**: `describir(codigo)` convierte un `weather_code` en `{ texto, icono }`.
3. **Interfaz**: una función que muestra cada estado y otra que pinta el tiempo.

Así, cada función es pequeña y, si algo falla, sabes dónde buscar.

<!-- /solucion -->

<!-- solucion: Ver la pista 2 (juntar los días) -->

Para convertir el formato "un array por dato" en un array de días:

```js
const dias = daily.time.map((fecha, i) => ({
  fecha,
  codigo: daily.weather_code[i],
  maxima: daily.temperature_2m_max[i],
  minima: daily.temperature_2m_min[i]
}))
```

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<main class="app">
  <h1>El clima</h1>

  <form id="buscador" class="buscador" role="search">
    <label for="ciudad" class="sr-only">Ciudad</label>
    <input id="ciudad" name="ciudad" placeholder="Busca una ciudad: Lima, Madrid..." required autocomplete="off">
    <button>Buscar</button>
  </form>

  <p id="vacio" class="estado">Busca una ciudad para ver su clima 🌍</p>
  <p id="cargando" class="estado" hidden>Consultando el cielo... ⏳</p>
  <p id="error" class="estado estado--error" role="alert" hidden></p>

  <section id="resultado" hidden aria-live="polite">
    <div class="actual">
      <h2 id="lugar"></h2>
      <p class="actual__temp"><span id="icono" aria-hidden="true"></span> <span id="temperatura"></span></p>
      <p id="descripcion"></p>
      <p id="viento" class="actual__viento"></p>
    </div>

    <h3>Próximos días</h3>
    <ol id="pronostico" class="pronostico"></ol>
  </section>
</main>
```

```css playground=solucion
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 24px;
  background: linear-gradient(#0ea5e9, #6366f1);
  min-height: 100vh;
  color: white;
}

.app {
  max-width: 520px;
  margin: 0 auto;
}

.buscador {
  display: flex;
  gap: 8px;
}

.buscador input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: none;
  border-radius: 999px;
  font: inherit;
}

.buscador button {
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  background: #18181b;
  color: white;
  font: inherit;
  cursor: pointer;
}

:focus-visible {
  outline: 3px solid #facc15;
  outline-offset: 2px;
}

.estado {
  padding: 16px;
  border-radius: 12px;
  background: rgb(255 255 255 / 0.15);
}

.estado--error {
  background: rgb(220 38 38 / 0.6);
}

.actual {
  margin-top: 24px;
  padding: 24px;
  border-radius: 20px;
  background: rgb(255 255 255 / 0.15);
  text-align: center;
}

.actual h2 {
  margin: 0;
}

.actual__temp {
  margin: 8px 0;
  font-size: 56px;
  font-weight: 300;
}

.actual__viento {
  opacity: 0.8;
}

.pronostico {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
  gap: 8px;
  padding: 0;
  list-style: none;
}

.pronostico li {
  padding: 12px 8px;
  border-radius: 12px;
  background: rgb(255 255 255 / 0.15);
  text-align: center;
}

.pronostico .icono {
  display: block;
  font-size: 28px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

```js playground=solucion
// ─── 1. Datos ───────────────────────────────────────────

async function pedirJSON(url) {
  const respuesta = await fetch(url)
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
  return respuesta.json()
}

async function buscarCiudad(nombre) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombre)}&count=1&language=es`
  const datos = await pedirJSON(url)
  const ciudad = datos.results?.[0]
  if (!ciudad) return null
  return { nombre: ciudad.name, pais: ciudad.country, latitud: ciudad.latitude, longitud: ciudad.longitude }
}

async function obtenerTiempo(latitud, longitud) {
  const parametros = new URLSearchParams({
    latitude: latitud,
    longitude: longitud,
    current: 'temperature_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: 5
  })
  const { current, daily } = await pedirJSON(`https://api.open-meteo.com/v1/forecast?${parametros}`)

  return {
    actual: { temperatura: current.temperature_2m, codigo: current.weather_code, viento: current.wind_speed_10m },
    dias: daily.time.map((fecha, i) => ({
      fecha,
      codigo: daily.weather_code[i],
      maxima: daily.temperature_2m_max[i],
      minima: daily.temperature_2m_min[i]
    }))
  }
}

// ─── 2. Lógica pura ─────────────────────────────────────

function describir(codigo) {
  if (codigo === 0) return { texto: 'Despejado', icono: '☀️' }
  if (codigo <= 2) return { texto: 'Parcialmente nublado', icono: '⛅' }
  if (codigo === 3) return { texto: 'Nublado', icono: '☁️' }
  if (codigo <= 48) return { texto: 'Niebla', icono: '🌫️' }
  if (codigo <= 57) return { texto: 'Llovizna', icono: '🌦️' }
  if (codigo <= 67) return { texto: 'Lluvia', icono: '🌧️' }
  if (codigo <= 77) return { texto: 'Nieve', icono: '❄️' }
  if (codigo <= 82) return { texto: 'Chubascos', icono: '🌦️' }
  return { texto: 'Tormenta', icono: '⛈️' }
}

const formatoDia = new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric' })
const grados = (valor) => `${Math.round(valor)}°`

// ─── 3. Interfaz ────────────────────────────────────────

const $ = (selector) => document.querySelector(selector)
const ESTADOS = ['vacio', 'cargando', 'error', 'resultado']

function mostrarEstado(estado, mensaje = '') {
  ESTADOS.forEach((id) => { $(`#${id}`).hidden = id !== estado })
  if (estado === 'error') $('#error').textContent = mensaje
  $('#buscador button').disabled = estado === 'cargando'
}

function pintar(ciudad, { actual, dias }) {
  const { texto, icono } = describir(actual.codigo)
  $('#lugar').textContent = `${ciudad.nombre}, ${ciudad.pais}`
  $('#icono').textContent = icono
  $('#temperatura').textContent = grados(actual.temperatura)
  $('#descripcion').textContent = texto
  $('#viento').textContent = `Viento: ${Math.round(actual.viento)} km/h`

  $('#pronostico').replaceChildren(...dias.map((dia) => {
    const { texto, icono } = describir(dia.codigo)
    const item = document.createElement('li')
    // T12:00 para que la fecha no "retroceda" un día por la zona horaria
    const nombreDia = formatoDia.format(new Date(`${dia.fecha}T12:00:00`))
    item.innerHTML = `<strong></strong><span class="icono" aria-hidden="true"></span><span class="sr-only"></span><span></span>`
    const [titulo, iconoDia, descripcion, temperaturas] = item.children
    titulo.textContent = nombreDia
    iconoDia.textContent = icono
    descripcion.textContent = texto
    temperaturas.textContent = `${grados(dia.maxima)} / ${grados(dia.minima)}`
    return item
  }))
}

async function consultar(nombre) {
  mostrarEstado('cargando')
  try {
    const ciudad = await buscarCiudad(nombre)
    if (!ciudad) {
      mostrarEstado('error', `No encontramos "${nombre}". Revisa cómo está escrito.`)
      return
    }
    const tiempo = await obtenerTiempo(ciudad.latitud, ciudad.longitud)
    pintar(ciudad, tiempo)
    mostrarEstado('resultado')
    localStorage.setItem('ultimaCiudad', nombre)
  } catch (error) {
    console.error(error)
    mostrarEstado('error', 'No pudimos consultar el clima. Revisa tu conexión e inténtalo de nuevo.')
  }
}

$('#buscador').addEventListener('submit', (evento) => {
  evento.preventDefault()
  const nombre = $('#ciudad').value.trim()
  if (nombre) consultar(nombre)
})

// Al abrir, recuperamos la última ciudad
const ultima = localStorage.getItem('ultimaCiudad')
if (ultima) {
  $('#ciudad').value = ultima
  consultar(ultima)
}
```

Las decisiones que más se valoran:

- **Tres capas separadas**: las funciones de datos no tocan la página, `describir` es pura y la interfaz solo pinta. Si mañana cambias de API, solo tocas la primera capa.
- **`pedirJSON`** centraliza el `fetch` y la comprobación de `respuesta.ok`, que de otra forma repetirías en cada petición.
- **Las funciones de datos "traducen" la API** a objetos con nombres propios y claros (`temperatura` en vez de `temperature_2m`). El resto del código no sabe nada del formato de Open-Meteo.
- **`datos.results?.[0]`**: optional chaining para el caso de "ciudad no encontrada", en el que `results` no existe.
- **`URLSearchParams`** construye la URL sin errores de `&` y `?` y codifica los valores.
- **Cuatro estados** (vacío, cargando, error y resultado) gestionados desde una sola función, como en el post de estados de carga.
- **La fecha con `T12:00:00`**: si usaras solo `'2026-11-26'`, se interpretaría en UTC y en América podría mostrarse como el día anterior (lo vimos en el post de fechas).
- **`textContent` para todo lo que viene de fuera**, incluso dentro de la plantilla del `innerHTML` (que solo lleva etiquetas vacías escritas por nosotros).

<!-- /solucion -->

## Ideas para ampliarlo

1. Un botón **"Usar mi ubicación"** con `navigator.geolocation.getCurrentPosition()`, que te da la latitud y longitud directamente (y evita la primera petición).
2. **Cambiar entre °C y °F** (Open-Meteo acepta `temperature_unit=fahrenheit`).
3. **Fondo según el tiempo**: soleado, nublado, lluvioso...
4. Una lista de **ciudades favoritas** guardadas en `localStorage`.
5. Que el buscador **sugiera ciudades** mientras escribes (pide `count=5` a la API de geocodificación y usa un **debounce**).
