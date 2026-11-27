---
title: 'Prueba técnica de maquetación: un formulario de inicio de sesión'
description: 'Maqueta un login accesible y responsive como los de las entrevistas: labels, mostrar contraseña, errores claros y un diseño centrado. Con solución oculta.'
date: 2026-11-26
series: ejercicios
tags: [HTML, CSS, JavaScript, Pruebas técnicas, Formularios, Accesibilidad]
draft: true
---

El formulario de inicio de sesión es **la pantalla más vista** de cualquier aplicación, y una prueba de maquetación clásica. Parece sencillo (dos campos y un botón), pero es donde más se nota si conoces los detalles: labels, tipos de campo, autocompletado, foco, errores.

Tiempo recomendado: **45 minutos**.

## El enunciado

> Maqueta una pantalla de inicio de sesión con:
>
> 1. El logo o nombre de la app y un título "Inicia sesión".
> 2. Un campo de **email** y uno de **contraseña**.
> 3. Un botón para **mostrar u ocultar** la contraseña.
> 4. Un checkbox **"Recordarme"** y un enlace **"¿Olvidaste tu contraseña?"** en la misma línea.
> 5. Un botón **"Entrar"** que ocupe todo el ancho.
> 6. Debajo, el texto "¿No tienes cuenta? **Regístrate**".
>
> Requisitos:
>
> - La tarjeta debe estar **centrada** en la pantalla, en horizontal y en vertical.
> - En el móvil, la tarjeta ocupa casi todo el ancho; en escritorio, un máximo de 400px.
> - Si se envía con errores, se muestran **mensajes debajo de cada campo**.
> - Debe poder usarse con el teclado y con lector de pantalla, y los gestores de contraseñas deben poder **autocompletarlo**.

## Tu turno

```html playground=reto
<main class="pagina">
  <!-- Tu formulario aquí -->
</main>
```

```css playground=reto
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: #f4f4f5;
}

/* tu CSS aquí */
```

```js playground=reto
// Solo para mostrar/ocultar la contraseña y los errores
```

Antes de mirar la solución, revisa:

- ¿El teclado del móvil muestra la `@` en el campo de email?
- ¿Tu navegador ofrece guardar y rellenar la contraseña?
- ¿Qué anuncia un lector de pantalla en el botón de mostrar contraseña?

<!-- solucion: Ver una pista para centrar -->

Para centrar en horizontal y vertical a la vez, la forma más corta es Grid:

```css
.pagina {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
```

Usa `min-height` (no `height`): si la pantalla es baja (un móvil en horizontal), la página puede crecer y hacer scroll en vez de cortar el formulario.

<!-- /solucion -->

<!-- solucion -->

```html playground=solucion
<main class="pagina">
  <form class="login" id="login" novalidate>
    <p class="login__logo">Tarea<span>Fácil</span></p>
    <h1 class="login__titulo">Inicia sesión</h1>

    <div class="campo">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-error">
      <p class="campo__error" id="email-error"></p>
    </div>

    <div class="campo">
      <label for="clave">Contraseña</label>
      <div class="campo__clave">
        <input id="clave" name="clave" type="password" autocomplete="current-password" required aria-describedby="clave-error">
        <button type="button" class="campo__ver" id="ver-clave" aria-pressed="false">Mostrar</button>
      </div>
      <p class="campo__error" id="clave-error"></p>
    </div>

    <div class="login__opciones">
      <label class="login__recordar"><input type="checkbox" name="recordar"> Recordarme</label>
      <a href="#recuperar">¿Olvidaste tu contraseña?</a>
    </div>

    <button class="login__boton">Entrar</button>

    <p class="login__registro">¿No tienes cuenta? <a href="#registro">Regístrate</a></p>
  </form>
</main>
```

```css playground=solucion
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: #f4f4f5;
  color: #18181b;
}

/* Centrado en horizontal y vertical */
.pagina {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 16px;
}

.login {
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  padding: clamp(20px, 5vw, 32px);
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.08);
}

.login__logo {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.login__logo span {
  color: #4f46e5;
}

.login__titulo {
  margin: 0;
  font-size: 24px;
}

.campo {
  display: grid;
  gap: 6px;
}

.campo label {
  font-weight: 600;
}

.campo input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 2px solid #d4d4d8;
  border-radius: 10px;
  font: inherit;
}

.campo input:focus-visible {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgb(79 70 229 / 0.25);
}

.campo input[aria-invalid="true"] {
  border-color: #dc2626;
}

/* El botón "Mostrar" va dentro del campo, a la derecha */
.campo__clave {
  position: relative;
}

.campo__clave input {
  padding-right: 88px;
}

.campo__ver {
  position: absolute;
  top: 50%;
  right: 6px;
  translate: 0 -50%;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: #f4f4f5;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.campo__error {
  margin: 0;
  color: #b91c1c;
  font-size: 14px;
}

.campo__error:empty {
  display: none;
}

.login__opciones {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.login__recordar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.login a {
  color: #4f46e5;
}

.login__boton {
  min-height: 48px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.login__boton:hover {
  background: #4338ca;
}

.login button:focus-visible,
.login a:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

.login__registro {
  margin: 0;
  text-align: center;
  font-size: 14px;
}
```

```js playground=solucion
const formulario = document.querySelector('#login')
const clave = document.querySelector('#clave')
const verClave = document.querySelector('#ver-clave')

// Mostrar / ocultar la contraseña
verClave.addEventListener('click', () => {
  const visible = clave.type === 'text'
  clave.type = visible ? 'password' : 'text'
  verClave.textContent = visible ? 'Mostrar' : 'Ocultar'
  verClave.setAttribute('aria-pressed', String(!visible))
})

const MENSAJES = {
  email: (campo) => {
    if (campo.validity.valueMissing) return 'Escribe tu email.'
    if (campo.validity.typeMismatch) return 'El email debe tener el formato nombre@dominio.com.'
    return ''
  },
  clave: (campo) => (campo.validity.valueMissing ? 'Escribe tu contraseña.' : '')
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault()

  const campos = [formulario.email, formulario.clave]
  const conError = campos.filter((campo) => {
    const mensaje = MENSAJES[campo.name](campo)
    document.querySelector(`#${campo.id}-error`).textContent = mensaje
    campo.setAttribute('aria-invalid', String(Boolean(mensaje)))
    return mensaje
  })

  if (conError.length > 0) {
    conError[0].focus()
    return
  }

  alert('¡Bienvenido! 👋')
})
```

Las decisiones que más se valoran:

**HTML**

- **`type="email"`**: el móvil muestra un teclado con `@` y el navegador valida el formato.
- **`autocomplete="email"` y `autocomplete="current-password"`**: los gestores de contraseñas y el navegador saben qué rellenar. Para un formulario de **registro**, sería `new-password`.
- **El botón de mostrar es `type="button"`**: sin eso, dentro de un formulario, un `<button>` **envía** el formulario.
- **`aria-pressed`** en el botón de mostrar: el lector de pantalla anuncia si está activado ("Mostrar, botón de alternancia, no presionado").
- **Labels visibles** en todos los campos, también en el checkbox, que así es más fácil de pulsar.
- **"¿Olvidaste tu contraseña?" es un `<a>`**, porque lleva a otra página; "Entrar" es un `<button>`, porque hace una acción.

**CSS**

- **`display: grid; place-items: center` con `min-height: 100vh`**: centrado perfecto que no corta el contenido en pantallas bajas.
- **`width: 100%; max-width: 400px`**: casi todo el ancho en el móvil, como mucho 400px en escritorio, sin media queries.
- **El botón "Mostrar" dentro del campo** con `position: absolute`, y `padding-right` en el input para que el texto no quede debajo del botón.
- **Altura mínima de 44px** en campos y botones: cómodos de pulsar con el dedo.
- **`flex-wrap`** en la fila de "Recordarme" / "¿Olvidaste...?": si no caben en una línea, bajan sin romperse.

**JavaScript**

- **Errores con `aria-invalid` y `aria-describedby`**, y el foco va al primer campo con error (lo vimos en el post de formularios accesibles).

<!-- /solucion -->

## Lo que evalúa el entrevistador

- **Tipos de campo y `autocomplete` correctos.** Es lo primero que se comprueba en un login.
- **Accesibilidad**: labels, foco visible, errores asociados a su campo.
- **El centrado** sin trucos raros ni márgenes mágicos.
- **Que el botón de mostrar contraseña no envíe el formulario.** Un error muy común.
- **Responsive** sin que nada se desborde.

Un detalle que suma muchos puntos: **no borrar lo que escribió el usuario** cuando hay un error. Si el email está mal, la contraseña debe seguir ahí.
