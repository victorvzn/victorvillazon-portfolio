---
title: 'Playwright desde cero: tests end-to-end en un navegador de verdad'
description: 'Qué es un test end-to-end y cuándo merece la pena, instalar Playwright, tu primer test, localizadores como getByRole, aserciones que esperan solas, probar un formulario y un flujo completo, el modo UI, codegen para grabar tests y el visor de trazas.'
date: 2026-11-27
series: testing
tags: [Playwright, Testing, E2E]
draft: true
---

Tus tests de Vitest y Testing Library pasan en verde. Despliegas... y el botón de "Comprar" no funciona en Safari. O el login falla porque el CSS tapa el botón. O la API de producción responde distinto a tu mock. Los tests unitarios y de integración no se enteraron, porque **nunca abrieron un navegador de verdad**.

Para eso están los tests **end-to-end** (E2E, "de extremo a extremo"): un programa abre un **navegador real**, entra en tu web y hace lo que haría un usuario: escribir, hacer clic, navegar. Si algo se rompe en cualquier capa (HTML, CSS, JavaScript, API, base de datos), lo detecta.

La herramienta más usada hoy para esto es **Playwright**, creada por Microsoft.

## ¿Cuándo merece la pena un test E2E?

Recuerda la pirámide del post de por qué escribir tests: los E2E son **los más lentos** (segundos cada uno) y los más frágiles. Así que no se prueba todo con ellos: solo los **flujos críticos**, los que si se rompen te hacen perder usuarios o dinero:

- ✅ Registrarse e iniciar sesión.
- ✅ Buscar un producto, añadirlo al carrito y pagar.
- ✅ Enviar el formulario de contacto.
- ❌ Que una función calcule bien el IGV (eso es un test unitario).
- ❌ Cada variante de un componente (eso es Testing Library).

## Paso 1: instalarlo

En tu proyecto (por ejemplo, uno de Vite):

```bash
npm init playwright@latest
```

El asistente te pregunta:

- **Dónde poner los tests**: deja `tests`.
- **Añadir un workflow de GitHub Actions**: sí (lo usarás en el post avanzado).
- **Instalar los navegadores**: sí. Playwright descarga sus propias versiones de **Chromium** (la base de Chrome y Edge), **Firefox** y **WebKit** (la base de Safari).

Se crean `playwright.config.js`, una carpeta `tests` con un ejemplo y un script para ejecutarlos.

## Paso 2: tu primer test

Crea `tests/inicio.spec.js`:

```js
import { test, expect } from '@playwright/test'

test('la página de inicio tiene el título correcto', async ({ page }) => {
  await page.goto('https://playwright.dev')

  await expect(page).toHaveTitle(/Playwright/)
})

test('el enlace "Get started" lleva a la instalación', async ({ page }) => {
  await page.goto('https://playwright.dev')

  await page.getByRole('link', { name: 'Get started' }).click()

  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible()
})
```

```bash
npx playwright test
```

- **`test(nombre, async ({ page }) => ...)`**: cada test recibe una **`page`**, una pestaña nueva y limpia del navegador.
- **`page.goto(url)`** navega a una URL.
- **`page.getByRole(...)`** busca un elemento, igual que en Testing Library (lo viste en su post).
- **`await`** en todo: cada acción en el navegador es asíncrona.

Por defecto, Playwright ejecuta cada test **en los tres navegadores** y **sin ventana** (*headless*, más rápido). Al terminar, `npx playwright show-report` abre un informe en HTML con el resultado de cada test en cada navegador.

## Probar tu propia app

Para probar tu app, Playwright puede **arrancar tu servidor** antes de los tests. En `playwright.config.js`:

```js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } }
  ]
})
```

- **`webServer`**: ejecuta `npm run dev`, espera a que responda la URL y entonces lanza los tests. `reuseExistingServer` reutiliza el servidor si ya lo tienes abierto.
- **`baseURL`**: así en los tests escribes `page.goto('/')` en vez de la URL completa.
- **`projects`**: los navegadores (y dispositivos) donde se ejecuta cada test. El proyecto `movil` simula la pantalla, el *user agent* y el toque de un móvil.

## Localizadores: encontrar elementos

Los **localizadores** (*locators*) se parecen mucho a las consultas de Testing Library, y se eligen con la misma prioridad: **como lo encontraría un usuario**.

```js
page.getByRole('button', { name: 'Comprar' })
page.getByRole('heading', { level: 1 })
page.getByLabel('Email')
page.getByPlaceholder('Busca un producto')
page.getByText('Pedido confirmado')
page.getByAltText('Logo de la tienda')
page.getByTestId('carrito-total')          // último recurso: data-testid="carrito-total"
```

Se pueden **encadenar** para buscar dentro de algo:

```js
const tarjeta = page.getByRole('article').filter({ hasText: 'Teclado' })
await tarjeta.getByRole('button', { name: 'Añadir' }).click()
```

"De todos los `article`, el que contiene 'Teclado'; dentro de él, el botón 'Añadir'".

> Evita localizar por clases CSS (`page.locator('.btn-primary')`): si alguien cambia el diseño, el test se rompe aunque la app funcione.

## Acciones

```js
await page.getByLabel('Email').fill('ana@correo.com')     // escribir (borra lo que había)
await page.getByRole('button', { name: 'Entrar' }).click()
await page.getByLabel('País').selectOption('Perú')
await page.getByLabel('Acepto los términos').check()
await page.getByLabel('Buscar').press('Enter')
await page.getByText('Menú').hover()
await page.getByLabel('Foto').setInputFiles('tests/archivos/avatar.png')
```

## Aserciones que esperan solas

Aquí está la gran ventaja de Playwright. Las aserciones sobre elementos **reintentan automáticamente** hasta que se cumplen (por defecto, hasta 5 segundos):

```js
await page.getByRole('button', { name: 'Guardar' }).click()
await expect(page.getByText('Cambios guardados')).toBeVisible()
```

Si el mensaje aparece medio segundo después (porque espera a una API), Playwright **espera**. No necesitas `setTimeout` ni esperas manuales. A esto se le llama **auto-waiting**, y también aplica a las acciones: antes de hacer `click`, Playwright espera a que el botón sea visible, esté habilitado y no tenga nada encima.

```js
await expect(page).toHaveURL('/carrito')
await expect(page).toHaveTitle('Carrito · Mi tienda')
await expect(locator).toBeVisible()
await expect(locator).toBeHidden()
await expect(locator).toHaveText('S/ 165.00')
await expect(locator).toContainText('Teclado')
await expect(locator).toHaveValue('ana@correo.com')
await expect(locator).toBeDisabled()
await expect(page.getByRole('listitem')).toHaveCount(3)
```

## Un flujo completo: comprar un producto

```js
import { test, expect } from '@playwright/test'

test('un usuario puede añadir productos al carrito y ver el total', async ({ page }) => {
  await page.goto('/')

  // Buscar
  await page.getByPlaceholder('Busca un producto').fill('teclado')
  await page.getByPlaceholder('Busca un producto').press('Enter')
  await expect(page.getByRole('article')).toHaveCount(1)

  // Añadir al carrito
  await page.getByRole('button', { name: 'Añadir al carrito' }).click()
  await expect(page.getByLabel('Productos en el carrito')).toHaveText('1')

  // Ir al carrito
  await page.getByRole('link', { name: 'Carrito' }).click()
  await expect(page).toHaveURL('/carrito')
  await expect(page.getByTestId('carrito-total')).toHaveText('S/ 120.00')
})
```

Se lee como las instrucciones que le darías a una persona para probar la web a mano. Esa es la idea.

## Herramientas que te ahorran horas

### Modo UI

```bash
npx playwright test --ui
```

Abre una aplicación donde ves tus tests, los ejecutas uno a uno y, para cada paso, **una captura del navegador** en ese momento. Puedes avanzar y retroceder por los pasos como en una película. Es la mejor forma de escribir y depurar tests.

### Codegen: grabar un test

```bash
npx playwright codegen http://localhost:5173
```

Se abre un navegador: **haz clic y escribe** como un usuario, y Playwright **escribe el código del test** en otra ventana, eligiendo los localizadores por ti. Perfecto para empezar; luego límpialo y añade las aserciones.

### Ver el navegador y depurar

```bash
npx playwright test --headed            # con ventana visible
npx playwright test --debug             # paso a paso, con el inspector
npx playwright test inicio.spec.js      # solo un archivo
npx playwright test --project=chromium  # solo un navegador
```

### El visor de trazas

Cuando un test falla en CI (donde no puedes ver nada), la **traza** (*trace*) lo registra todo: capturas de cada paso, el DOM, las peticiones de red y los mensajes de la consola. Con `trace: 'on-first-retry'` en la configuración, se graba cuando un test falla y se reintenta. Ábrela desde el informe (`npx playwright show-report`) y verás exactamente qué pasó.

## Tu turno

1. Instala Playwright en uno de tus proyectos (por ejemplo, la todo app) y configura `webServer`.
2. Escribe un test que añada tres tareas, marque una como hecha y compruebe el contador de pendientes.
3. Graba un test con `codegen` y compáralo con el que escribiste a mano.
4. Haz que un test falle a propósito y ábrelo en el modo UI para ver en qué paso se rompió.

## Errores comunes

- **Olvidar el `await`** en una acción o un `expect`: el test termina antes de tiempo o falla de forma aleatoria.
- **Esperar con tiempos fijos** (`page.waitForTimeout(3000)`). Hace los tests lentos y aun así fallan a veces. Usa las aserciones, que esperan solas.
- **Localizar por clases CSS** o por la estructura del HTML (`div > div:nth-child(2)`). Usa `getByRole` y `getByLabel`.
- **Probarlo todo con E2E.** Son lentos: solo los flujos críticos.
- **Tests que dependen unos de otros** (uno crea el usuario y el siguiente lo usa). Cada test empieza con una pestaña limpia y debe preparar lo que necesita.

## Para profundizar

- [Documentación de Playwright (en inglés)](https://playwright.dev/docs/intro)
- [Buenas prácticas de Playwright (en inglés)](https://playwright.dev/docs/best-practices)

En resumen: un test **end-to-end** prueba tu app **en un navegador real**, como un usuario, y se reserva para los **flujos críticos**. **Playwright** se instala con `npm init playwright@latest`, prueba en **Chromium, Firefox y WebKit**, arranca tu servidor con **`webServer`** y encuentra elementos con localizadores como **`getByRole`** y **`getByLabel`**. Sus acciones y aserciones **esperan solas**, y el **modo UI**, **codegen** y el **visor de trazas** te ayudan a escribir y depurar.
