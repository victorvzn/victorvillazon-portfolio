---
title: 'Playwright avanzado: mocks de red, login reutilizable, Page Objects y CI'
description: 'Interceptar y simular la API con page.route, iniciar sesión una sola vez y reutilizarla con storageState, organizar los tests con el patrón Page Object y fixtures, capturas visuales, tests de accesibilidad con axe y ejecutar Playwright en GitHub Actions.'
date: 2026-11-27
series: testing
tags: [Playwright, Testing, E2E, CI, Avanzado]
draft: true
---

Con lo del post anterior ya escribes tests E2E. Pero cuando tienes 50, empiezan los problemas: **cada test hace login** y tarda 10 segundos; la API de pruebas **a veces falla** y tus tests fallan con ella; el mismo `getByLabel('Email')` está repetido en 20 archivos; y nadie ejecuta los tests antes de subir el código.

Hoy aprendes las técnicas que usan los equipos para que una suite E2E sea **rápida, estable y fácil de mantener**.

## 1. Controlar la red con `page.route`

Playwright puede **interceptar** las peticiones que hace tu web y responder lo que tú quieras. Es la misma idea que MSW (lo viste en el post de Testing Library con MSW), pero en el navegador real.

### Simular una respuesta

```js
import { test, expect } from '@playwright/test'

test('muestra los productos que devuelve la API', async ({ page }) => {
  await page.route('**/api/productos', async (route) => {
    await route.fulfill({
      json: [
        { id: 1, nombre: 'Teclado', precio: 120 },
        { id: 2, nombre: 'Mouse', precio: 45 }
      ]
    })
  })

  await page.goto('/')

  await expect(page.getByRole('article')).toHaveCount(2)
})
```

- **`page.route(patron, manejador)`** intercepta las peticiones cuya URL coincide. `**` significa "cualquier cosa delante".
- **`route.fulfill({ json })`** responde con ese JSON sin llegar al servidor.
- Debe ir **antes** del `goto`, para que esté listo cuando la página haga la petición.

### Probar los casos difíciles

Lo mejor de simular la red: probar situaciones que con la API real son casi imposibles de provocar.

```js
test('muestra un error si la API falla', async ({ page }) => {
  await page.route('**/api/productos', (route) => route.fulfill({ status: 500 }))
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar')
})

test('muestra "cargando" mientras la API tarda', async ({ page }) => {
  await page.route('**/api/productos', async (route) => {
    await new Promise((resolver) => setTimeout(resolver, 2000))
    await route.fulfill({ json: [] })
  })
  await page.goto('/')
  await expect(page.getByText('Cargando productos...')).toBeVisible()
})

test('funciona sin conexión a la API', async ({ page }) => {
  await page.route('**/api/**', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
})
```

### Modificar una respuesta real

```js
await page.route('**/api/usuario', async (route) => {
  const respuesta = await route.fetch()          // hace la petición real
  const json = await respuesta.json()
  json.esPremium = true                          // y cambiamos un dato
  await route.fulfill({ response: respuesta, json })
})
```

### Comprobar qué se envía

```js
test('envía los datos del formulario', async ({ page }) => {
  await page.goto('/contacto')

  const peticion = page.waitForRequest('**/api/mensajes')
  await page.getByLabel('Mensaje').fill('¡Hola!')
  await page.getByRole('button', { name: 'Enviar' }).click()

  expect((await peticion).postDataJSON()).toEqual({ mensaje: '¡Hola!' })
})
```

> ¿Mockear o no mockear? Un E2E con la API simulada es más **rápido y estable**, pero ya no prueba la integración real con el backend. Lo habitual: la mayoría de tests con la red simulada y unos pocos "humo" (*smoke tests*) contra un entorno real con datos de prueba.

## 2. Iniciar sesión una sola vez: `storageState`

Si 30 tests necesitan un usuario conectado y cada uno rellena el formulario de login, pierdes minutos en cada ejecución. La solución: **hacer login una vez**, guardar el estado del navegador (cookies y `localStorage`) en un archivo, y que todos los tests empiecen ya conectados.

Crea `tests/auth.setup.js`:

```js
import { test as setup, expect } from '@playwright/test'

const ARCHIVO_SESION = 'playwright/.auth/usuario.json'

setup('iniciar sesión', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.E2E_EMAIL)
  await page.getByLabel('Contraseña').fill(process.env.E2E_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible()

  await page.context().storageState({ path: ARCHIVO_SESION })
})
```

Y en `playwright.config.js`, un **proyecto de preparación** del que dependen los demás:

```js
projects: [
  { name: 'setup', testMatch: /.*\.setup\.js/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/usuario.json' },
    dependencies: ['setup']
  }
]
```

Ahora el `setup` se ejecuta primero, y todos los tests de `chromium` arrancan **con la sesión iniciada**. Añade `playwright/.auth` al `.gitignore`: ese archivo contiene la sesión de un usuario.

Las credenciales vienen de **variables de entorno**, nunca escritas en el código. Y usa siempre un **usuario de pruebas**, jamás una cuenta real.

## 3. Page Objects: no repetir los localizadores

Si la página de login cambia el texto "Entrar" por "Iniciar sesión", ¿cuántos archivos tienes que tocar? Con el patrón **Page Object**, uno solo. Cada página de tu app tiene una **clase** que sabe cómo usarla:

```js
// tests/paginas/PaginaCarrito.js
import { expect } from '@playwright/test'

export class PaginaCarrito {
  constructor(page) {
    this.page = page
    this.total = page.getByTestId('carrito-total')
    this.botonPagar = page.getByRole('button', { name: 'Pagar' })
    this.lineas = page.getByRole('listitem')
  }

  async abrir() {
    await this.page.goto('/carrito')
  }

  async quitar(nombreProducto) {
    await this.lineas.filter({ hasText: nombreProducto }).getByRole('button', { name: 'Quitar' }).click()
  }

  async comprobarTotal(texto) {
    await expect(this.total).toHaveText(texto)
  }
}
```

```js
// tests/carrito.spec.js
import { test } from '@playwright/test'
import { PaginaCarrito } from './paginas/PaginaCarrito'

test('quitar un producto actualiza el total', async ({ page }) => {
  const carrito = new PaginaCarrito(page)
  await carrito.abrir()
  await carrito.quitar('Mouse')
  await carrito.comprobarTotal('S/ 120.00')
})
```

El test se lee como una historia (abrir, quitar, comprobar), y todos los detalles de **cómo** encontrar cada cosa viven en un solo sitio.

### Fixtures: preparar automáticamente

Las **fixtures** de Playwright son lo que te da `{ page }` en cada test. Puedes crear las tuyas para no repetir el `new PaginaCarrito(page)`:

```js
// tests/fixtures.js
import { test as base } from '@playwright/test'
import { PaginaCarrito } from './paginas/PaginaCarrito'

export const test = base.extend({
  carrito: async ({ page }, usar) => {
    await usar(new PaginaCarrito(page))
  }
})
export { expect } from '@playwright/test'
```

```js
import { test } from './fixtures'

test('el carrito vacío muestra un aviso', async ({ carrito }) => {
  await carrito.abrir()
  await carrito.comprobarTotal('S/ 0.00')
})
```

## 4. Tests visuales: capturas que se comparan

¿Un cambio de CSS rompió el diseño de la cabecera? Un test normal no lo detectaría. Una **comparación visual** sí:

```js
test('la página de inicio se ve igual', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })
})
```

La primera vez guarda la captura como **referencia**. En las siguientes, compara píxel a píxel y falla si hay diferencias, mostrándote las dos imágenes y lo que cambió. Si el cambio era intencionado, actualiza las referencias con `npx playwright test --update-snapshots`.

> Las capturas dependen del sistema operativo y de las fuentes instaladas: genera las referencias en el mismo entorno donde se ejecutan los tests (normalmente, en CI con Docker). Y oculta lo que cambia solo, como fechas o anuncios, con la opción `mask`.

## 5. Accesibilidad automática con axe

**axe** es un motor que detecta problemas de accesibilidad: imágenes sin `alt`, contraste insuficiente, campos sin label, botones sin nombre... (lo viste en la serie de HTML, en el módulo de accesibilidad).

```bash
npm install --save-dev @axe-core/playwright
```

```js
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('la página de inicio no tiene problemas de accesibilidad', async ({ page }) => {
  await page.goto('/')

  const resultados = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

  expect(resultados.violations).toEqual([])
})
```

Si falla, `violations` te dice qué regla se incumple y en qué elementos. axe no detecta todos los problemas (nada sustituye a probar con el teclado y un lector de pantalla), pero atrapa los más comunes en cada cambio.

## 6. En CI con GitHub Actions

Si aceptaste el workflow al instalar, ya tienes `.github/workflows/playwright.yml`. Algo así:

```yaml
name: Playwright
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          E2E_EMAIL: ${{ secrets.E2E_EMAIL }}
          E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: informe-playwright
          path: playwright-report/
          retention-days: 30
```

- **`playwright install --with-deps`** instala los navegadores y las librerías del sistema que necesitan.
- Las credenciales vienen de los **secrets** del repositorio (*Settings → Secrets and variables → Actions*).
- **`upload-artifact`** guarda el informe (con las trazas) aunque los tests fallen: lo descargas desde la pestaña *Actions* y ves exactamente qué pasó.

Opciones útiles de la configuración para CI:

```js
export default defineConfig({
  forbidOnly: !!process.env.CI,          // falla si alguien dejó un test.only
  retries: process.env.CI ? 2 : 0,       // reintenta en CI los tests que fallan
  workers: process.env.CI ? 1 : undefined
})
```

## Tests inestables (*flaky*)

Un test **flaky** pasa a veces y falla otras sin que cambie el código. Es el mayor enemigo de una suite E2E: si los tests fallan "porque sí", el equipo deja de hacerles caso. Las causas más comunes y su solución:

| Causa | Solución |
| --- | --- |
| Esperas con tiempos fijos | Aserciones que esperan solas (`toBeVisible`, `toHaveText`) |
| Depender de una API externa | Simularla con `page.route` |
| Datos compartidos entre tests | Que cada test cree sus propios datos |
| Animaciones | `reducedMotion: 'reduce'` en `use` de la configuración |
| Orden de ejecución | Tests independientes; Playwright los ejecuta en paralelo |

Los `retries` ayudan, pero **no son la solución**: el informe marca como *flaky* los tests que pasaron solo al reintentar. Arréglalos.

## Tu turno

1. Simula la API de tu app con `page.route` y prueba los estados de carga, error y lista vacía.
2. Crea un `auth.setup.js` con un usuario de pruebas y haz que tus tests arranquen con la sesión iniciada.
3. Crea un Page Object para la página principal de tu proyecto y refactoriza dos tests para usarlo.
4. Añade un test de accesibilidad con axe a cada página y corrige lo que encuentre.
5. Sube el workflow a GitHub, haz que un test falle y descarga el informe del *artifact*.

## Errores comunes

- **Registrar `page.route` después del `goto`**: la petición ya se hizo.
- **Subir `playwright/.auth` al repositorio**: contiene una sesión válida.
- **Credenciales escritas en el código**: usa variables de entorno y secrets.
- **Page Objects con aserciones de todo**: deja que el test decida qué comprobar; el Page Object sabe *cómo* usar la página.
- **Capturas visuales generadas en tu ordenador y comparadas en CI**: las fuentes y el renderizado cambian entre sistemas.
- **Arreglar los tests flaky con más `retries`**: escondes el problema.

## Para profundizar

- [Mock de APIs en Playwright (en inglés)](https://playwright.dev/docs/mock)
- [Autenticación en Playwright (en inglés)](https://playwright.dev/docs/auth)

En resumen: con **`page.route`** controlas la red para probar errores, cargas lentas y datos concretos sin depender del backend. **`storageState`** con un proyecto de **setup** inicia sesión una sola vez para todos los tests. Los **Page Objects** y las **fixtures** guardan en un solo sitio cómo se usa cada página, **`toHaveScreenshot`** detecta cambios visuales y **axe** revisa la accesibilidad. En **GitHub Actions**, sube el informe como artefacto y trata los tests **flaky** como bugs.
