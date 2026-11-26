---
title: 'Git y GitHub desde cero: guarda tu código y súbelo a internet'
description: 'Qué es Git, qué es GitHub y en qué se diferencian. Los comandos para empezar: init, add, commit, push, status y log, con tu primer repositorio paso a paso.'
date: 2026-11-26
series: carrera
tags: [Git, Herramientas, Fundamentos]
draft: true
---

¿Alguna vez has tenido carpetas como `proyecto-final`, `proyecto-final-v2` y `proyecto-final-AHORA-SI`? **Git** resuelve exactamente eso: guarda la **historia** de tu código, te deja volver atrás si rompes algo y es la forma en la que trabajan todos los equipos de desarrollo del mundo.

Y en cualquier proceso de selección te van a pedir tu GitHub. Vamos por partes.

## Git y GitHub no son lo mismo

- **Git** es un programa que instalas en tu ordenador. Guarda "fotos" de tu proyecto a lo largo del tiempo. Funciona sin internet.
- **GitHub** es una web donde **subes** esos proyectos para tenerlos en la nube, compartirlos y colaborar con otras personas. Es como un Google Drive para código con Git.

Hay alternativas a GitHub (como GitLab o Bitbucket), pero GitHub es la más usada y la que miran los reclutadores.

## Las tres palabras que tienes que entender

- **Repositorio** (*repo*): la carpeta de tu proyecto con su historial de Git.
- **Commit**: una "foto" del proyecto en un momento dado, con un mensaje que explica qué cambiaste. Como un punto de guardado en un videojuego.
- **Push**: subir tus commits a GitHub.

## Paso 0: instalar y configurar Git

1. Descarga Git desde [git-scm.com](https://git-scm.com) e instálalo (en Windows, las opciones por defecto están bien).
2. Abre una terminal (en VS Code: menú **Terminal → Nueva terminal**) y comprueba que funciona:

```bash
git --version
```

3. Dile a Git quién eres. Solo se hace **una vez** por ordenador. Usa el mismo email que en tu cuenta de GitHub:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

## Paso 1: crear el repositorio

Entra en la carpeta de tu proyecto desde la terminal y ejecuta:

```bash
git init
```

Esto crea una carpeta oculta `.git` donde Git guardará todo el historial. Solo se hace una vez por proyecto.

## Paso 2: el ciclo de todos los días

Trabajar con Git es repetir siempre los mismos tres pasos:

```bash
git status                          # 1. ¿Qué ha cambiado?
git add .                           # 2. Prepara los cambios para la foto
git commit -m "Añade el formulario de contacto"   # 3. Haz la foto
```

1. **`git status`** te dice qué archivos cambiaron. Úsalo a menudo: es tu "¿dónde estoy?".
2. **`git add .`** prepara **todos** los cambios para el próximo commit. (Para un solo archivo: `git add index.html`.) A esta zona de "preparados" se le llama *staging*.
3. **`git commit -m "mensaje"`** guarda la foto con un mensaje.

Para ver la historia de commits:

```bash
git log --oneline
```

## Cómo escribir un buen mensaje de commit

El mensaje es para tu "yo" del futuro (y para tu equipo). Debe decir **qué cambiaste**, en pocas palabras:

| ❌ Malo | ✅ Bueno |
| --- | --- |
| `cambios` | `Añade el menú responsive` |
| `asdf` | `Corrige el color del botón en móvil` |
| `final final` | `Valida el email del formulario de registro` |

Y haz commits **pequeños y frecuentes**: uno por cada cosa que termines, no uno gigante al final del día.

## Paso 3: subirlo a GitHub

1. Crea una cuenta en [github.com](https://github.com).
2. Pulsa **New repository** (el botón **+** de arriba a la derecha).
3. Ponle un nombre (por ejemplo `mi-portafolio`), déjalo en **Public** y **no** marques la opción de añadir un README (ya tienes tus archivos).
4. GitHub te mostrará unos comandos. Son estos (con tu usuario y tu repo):

```bash
git branch -M main
git remote add origin https://github.com/tu-usuario/mi-portafolio.git
git push -u origin main
```

- **`git branch -M main`**: llama `main` a tu rama principal (el nombre estándar).
- **`git remote add origin ...`**: conecta tu carpeta con el repo de GitHub. `origin` es el apodo de esa dirección.
- **`git push -u origin main`**: sube tus commits. El `-u` recuerda la conexión, así que a partir de ahora bastará con `git push`.

La primera vez, Git te pedirá iniciar sesión en GitHub (normalmente abre una ventana del navegador). Recarga la página de tu repositorio: ¡tu código está en internet!

## A partir de ahora

Cada vez que termines algo:

```bash
git add .
git commit -m "Describe lo que hiciste"
git push
```

## .gitignore: lo que no se sube

Hay archivos que **no** deben ir al repositorio: la carpeta `node_modules` (pesa muchísimo y se puede reinstalar), archivos con contraseñas o claves (`.env`) o archivos del sistema como `.DS_Store`. Crea un archivo llamado **`.gitignore`** en la raíz del proyecto con lo que quieres ignorar:

```bash
node_modules
.env
.DS_Store
dist
```

**Nunca subas contraseñas ni claves de API** a GitHub, aunque el repo sea privado. Si te pasa, cámbialas de inmediato: borrar el archivo no basta, porque sigue en el historial.

## Descargar un repositorio: git clone

Para bajar a tu ordenador un repositorio que ya existe en GitHub (tuyo o de otra persona):

```bash
git clone https://github.com/usuario/repositorio.git
```

Y si trabajas desde dos ordenadores, antes de empezar a trabajar trae los últimos cambios con:

```bash
git pull
```

## Errores comunes

- **`fatal: not a git repository`**: estás en una carpeta sin `git init`. Comprueba en qué carpeta estás con `pwd` (o `cd` en Windows).
- **`nothing to commit`**: no hay cambios nuevos, o te olvidaste de guardar los archivos en el editor.
- **Hacer `git init` en la carpeta equivocada**, por ejemplo en tu carpeta de usuario. Hazlo siempre dentro de la carpeta del proyecto.
- **Commits gigantes con mensajes como "cambios"**. Pequeños y descriptivos.
- **Subir `node_modules`.** Añádelo al `.gitignore` antes del primer commit.

## Para profundizar

- [El libro oficial de Git, en español](https://git-scm.com/book/es/v2)
- [Guía de inicio de GitHub](https://docs.github.com/es/get-started)

En resumen: **Git** guarda la historia de tu código en tu ordenador y **GitHub** la guarda en la nube. El ciclo diario es **`git status` → `git add .` → `git commit -m "..."` → `git push`**. Y el siguiente paso natural es **publicar tu web gratis** desde GitHub: tienes un post sobre eso.
