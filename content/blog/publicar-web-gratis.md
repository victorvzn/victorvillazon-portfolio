---
title: 'Publica tu web gratis: GitHub Pages, Netlify y Vercel'
description: 'Tu proyecto merece una URL que puedas compartir. Cómo publicar una web estática gratis con GitHub Pages, Netlify (incluso arrastrando una carpeta) y Vercel.'
date: 2026-11-26
series: carrera
tags: [Herramientas, Despliegue, Fundamentos]
draft: true
---

Un proyecto que solo existe en tu ordenador no lo puede ver nadie: ni tu familia, ni un reclutador, ni tus compañeros. **Publicarlo** (los programadores dicen *desplegar*, o *deploy*) significa ponerlo en un servidor de internet con una URL que puedas compartir.

La buena noticia: para webs hechas con HTML, CSS y JavaScript hay servicios **gratuitos** que lo hacen en minutos. Te explico los tres más usados.

## Antes de empezar

Comprueba estas tres cosas, o tu web se verá rota una vez publicada:

1. **Tu página principal se llama `index.html`** y está en la raíz de la carpeta (o en la carpeta que vayas a publicar). Es el archivo que los servidores abren por defecto.
2. **Las rutas son relativas**: `href="estilos.css"` o `src="img/logo.png"`, nunca `C:\Users\...\logo.png`. Esa ruta solo existe en tu ordenador.
3. **Los nombres de archivo coinciden exactamente**, mayúsculas incluidas. En Windows `Logo.png` y `logo.png` son el mismo archivo, pero en los servidores **no**. Usa siempre minúsculas y sin espacios.

Un aviso: estos servicios cambian su diseño de vez en cuando, así que algún botón puede llamarse un poco distinto a como lo describo. Los pasos son siempre los mismos.

## Opción 1: Netlify (la más fácil para empezar)

Netlify tiene una forma de publicar que no necesita ni Git: **arrastrar la carpeta**.

### Arrastrando una carpeta (Netlify Drop)

1. Entra en [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra la carpeta de tu proyecto (la que contiene el `index.html`) a la zona indicada.
3. En unos segundos tienes una URL como `https://nombre-aleatorio.netlify.app`.

Para que la web no caduque y puedas actualizarla, crea una cuenta gratuita (puedes entrar con GitHub). Desde la configuración del sitio puedes cambiarle el nombre para tener una URL más bonita, como `ana-portafolio.netlify.app`.

Para actualizarla, vuelve a arrastrar la carpeta en la sección **Deploys** de tu sitio.

### Conectando tu repositorio de GitHub (lo recomendable)

Arrastrar carpetas está bien para la primera vez, pero lo cómodo es que la web **se actualice sola** cada vez que haces `git push`:

1. En el panel de Netlify, pulsa el botón para añadir un sitio nuevo y elige **importar un proyecto existente** (*Import an existing project*).
2. Elige **GitHub**, autoriza el acceso y selecciona tu repositorio.
3. Para una web solo con HTML, CSS y JavaScript, deja vacío el **comando de build** (*build command*) y pon como **carpeta de publicación** (*publish directory*) la que tiene tu `index.html` (si está en la raíz, déjalo vacío o pon `.`).
4. Pulsa **Deploy**.

A partir de ahora, cada `git push` a `main` publica la nueva versión automáticamente.

## Opción 2: GitHub Pages (si ya tienes el código en GitHub)

Si tu proyecto ya está en GitHub (tienes un post sobre Git y GitHub desde cero), GitHub Pages lo publica sin salir de GitHub:

1. Entra en tu repositorio y ve a **Settings** (Configuración).
2. En el menú de la izquierda, entra en **Pages**.
3. En **Source**, elige **Deploy from a branch**.
4. En **Branch**, elige **`main`** y la carpeta **`/ (root)`**. Pulsa **Save**.
5. Espera uno o dos minutos y recarga: aparecerá la URL de tu web.

La URL tendrá esta forma: `https://tu-usuario.github.io/nombre-del-repo/`.

Un truco: si llamas a tu repositorio exactamente **`tu-usuario.github.io`**, la web se publica en `https://tu-usuario.github.io`, sin nada detrás. Es perfecto para tu **portafolio**.

Un detalle de GitHub Pages: como la web vive en `/nombre-del-repo/`, una ruta que empieza por barra, como `href="/estilos.css"`, buscará el archivo en la raíz del dominio y no lo encontrará. Usa rutas relativas sin la barra inicial: `href="estilos.css"`.

## Opción 3: Vercel

Vercel funciona de forma muy parecida a Netlify y es la plataforma que se suele usar con frameworks como Next.js (con la que, por cierto, está publicado este blog):

1. Entra en [vercel.com](https://vercel.com) y crea una cuenta con GitHub.
2. Pulsa **Add New → Project** e importa tu repositorio.
3. Para una web estática, deja el **Framework Preset** en **Other** y no cambies nada más.
4. Pulsa **Deploy**.

Tendrás una URL como `https://mi-proyecto.vercel.app`, y cada `git push` publicará una versión nueva.

## ¿Y si mi proyecto usa Vite o React?

Los proyectos con herramientas como **Vite** necesitan un paso de **build**: un comando que convierte tu código en los archivos finales que entiende el navegador. En Netlify o Vercel solo tienes que indicar:

- **Build command**: `npm run build`
- **Publish/Output directory**: `dist` (la carpeta que genera Vite)

Normalmente lo detectan solos al importar el repositorio.

## ¿Cuál elijo?

| Servicio | Lo mejor | Ideal para |
| --- | --- | --- |
| **Netlify** | Publicar arrastrando una carpeta, sin Git | Tu primera publicación, proyectos rápidos |
| **GitHub Pages** | Todo en GitHub, sin otra cuenta | Tu portafolio y proyectos de práctica |
| **Vercel** | Muy rápido y pensado para frameworks | Proyectos con React o Next.js |

Los tres son gratuitos para proyectos personales, usan HTTPS (el candado del navegador) y permiten conectar un dominio propio si algún día compras uno.

## Errores comunes

- **La página sale en blanco o con un 404.** Casi siempre falta el `index.html` en la carpeta publicada, o se llama distinto (`Index.html`, `inicio.html`).
- **La web se ve sin estilos.** La ruta del CSS está mal o no coinciden las mayúsculas. Abre las DevTools → pestaña **Red** y busca el archivo en rojo.
- **Las imágenes no cargan.** Mismo problema: rutas absolutas de tu ordenador o mayúsculas que no coinciden.
- **Publicar la carpeta equivocada.** Asegúrate de elegir la carpeta que contiene el `index.html`, no la de más arriba.
- **Subir archivos con claves o contraseñas.** Todo lo que publicas lo puede ver cualquiera.

## Para profundizar

- [Documentación de GitHub Pages](https://docs.github.com/es/pages)
- [Documentación de Netlify (en inglés)](https://docs.netlify.com)
- [Documentación de Vercel (en inglés)](https://vercel.com/docs)

En resumen: revisa que tengas un **`index.html`** y **rutas relativas**, y elige: **Netlify** si quieres publicar en un minuto arrastrando una carpeta, **GitHub Pages** si tu código ya está en GitHub y **Vercel** para proyectos con frameworks. Conecta tu repositorio y cada `git push` publicará tu web sola.
