---
title: 'Git en equipo: ramas, pull requests y conflictos paso a paso'
description: 'Cómo se trabaja con Git en un equipo real: crear una rama, subirla, abrir un pull request, revisar, hacer merge y resolver un conflicto. Corto y con comandos.'
date: 2026-11-26
series: carrera
tags: [Git, GitHub, Herramientas]
draft: true
---

En el post de Git desde cero trabajabas **solo**: `add`, `commit`, `push` directo a `main`. En una empresa eso casi nunca se hace. Cuando varias personas tocan el mismo proyecto, se trabaja con **ramas** y **pull requests**. Es lo primero que vas a hacer en tu primer trabajo, así que vamos a practicarlo de principio a fin.

## La idea en 30 segundos

- **`main`** es la versión "buena" del proyecto, la que está publicada. Nadie trabaja directamente ahí.
- Para cada tarea, creas una **rama** (*branch*): una copia paralela donde haces tus cambios sin molestar a nadie.
- Cuando terminas, abres un **pull request** (*PR*) en GitHub: "oye, equipo, revisad mis cambios y, si están bien, juntadlos con `main`".
- Alguien lo **revisa**, comenta y, cuando todo está bien, se hace **merge** (se fusiona con `main`).

```
main     ──●────●─────────────●──
             \               /
mi-rama       ●────●────●───   ← tus commits, aparte
```

## Paso 1: trae lo último de `main`

Antes de empezar cualquier tarea, asegúrate de partir de la versión más reciente:

```bash
git switch main
git pull
```

## Paso 2: crea tu rama

```bash
git switch -c feature/formulario-contacto
```

`-c` significa "créala y cámbiate a ella". El nombre describe la tarea. Convenciones habituales:

| Prefijo | Para |
| --- | --- |
| `feature/` | algo nuevo: `feature/modo-oscuro` |
| `fix/` | arreglar un bug: `fix/menu-movil` |
| `docs/` | documentación: `docs/readme-instalacion` |

Comprueba en qué rama estás en cualquier momento con:

```bash
git branch
```

La que tiene el asterisco `*` es la actual.

## Paso 3: trabaja y haz commits, como siempre

```bash
git add .
git commit -m "Añade el formulario de contacto"

git add .
git commit -m "Valida el email del formulario"
```

Todos estos commits viven **solo en tu rama**. `main` no se entera.

## Paso 4: sube tu rama a GitHub

```bash
git push -u origin feature/formulario-contacto
```

La primera vez necesitas el `-u origin nombre-de-la-rama`. Después, en esa rama, basta con `git push`.

## Paso 5: abre el pull request

1. Entra en el repositorio en GitHub. Verás un aviso amarillo: **"feature/formulario-contacto had recent pushes"** con un botón **Compare & pull request**. Púlsalo.
2. Comprueba que arriba pone **base: `main`** ← **compare: `feature/formulario-contacto`**.
3. Escribe un **título** claro y una **descripción**. Una plantilla que funciona:

```markdown
## Qué hace
Añade el formulario de contacto en la página de inicio.

## Cómo probarlo
1. Abre la página de inicio.
2. Envía el formulario con un email incorrecto: debe mostrar un error.

## Capturas
(arrastra aquí una imagen del resultado)
```

4. A la derecha, en **Reviewers**, elige a quien deba revisarlo y pulsa **Create pull request**.

## Paso 6: la revisión (code review)

Tu compañero verá los cambios línea por línea y puede:

- **Comentar** una línea concreta ("¿esto funciona en móvil?").
- **Aprobar** (*Approve*).
- **Pedir cambios** (*Request changes*).

Si te piden cambios, **no abras otro PR**: haz los cambios en la misma rama, commit y push. El PR se actualiza solo.

```bash
git add .
git commit -m "Muestra el error debajo del campo de email"
git push
```

Consejo: los comentarios de una revisión son sobre el **código**, no sobre ti. Responde a cada uno, aunque sea con un "¡Hecho!", y pregunta si no entiendes algo. Revisar y ser revisado es como más se aprende en un equipo.

## Paso 7: merge y limpieza

Cuando el PR está aprobado, se pulsa **Merge pull request** en GitHub (en muchos equipos lo hace quien lo revisó). Tus cambios ya están en `main`.

Vuelve a `main` en tu ordenador, trae los cambios y borra la rama que ya no necesitas:

```bash
git switch main
git pull
git branch -d feature/formulario-contacto
```

Y para la siguiente tarea, vuelves al paso 1.

## Los conflictos: cuando dos personas tocan la misma línea

Un **conflicto** ocurre cuando tú y otra persona cambiasteis **las mismas líneas** del mismo archivo, y Git no sabe con cuál quedarse. No es un error ni rompiste nada: Git te pide que **decidas tú**.

### Provoquemos uno para practicar

Hazlo en un repositorio de prueba, en tu ordenador. No hace falta GitHub. En Windows, usa **Git Bash** (se instala junto con Git): en PowerShell, `echo ... >` guarda el archivo con otra codificación y Git lo trataría como un archivo binario.

```bash
mkdir practica-conflictos
cd practica-conflictos
git init
echo "Bienvenido a la tienda" > index.html
git add .
git commit -m "Primer commit"

# Una rama cambia el título...
git switch -c cambiar-titulo
echo "Bienvenido a la mejor tienda" > index.html
git commit -am "Cambia el título"

# ...y main cambia la misma línea de otra forma
git switch main
echo "Hola, bienvenido a la tienda" > index.html
git commit -am "Saluda en el título"

# Intentamos juntar las dos
git merge cambiar-titulo
```

> Si `git switch main` falla con un error sobre `main`, tu rama principal se llama `master`. Usa `git switch master`.

Git responderá:

```bash
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

### Resolverlo

Abre `index.html`. Git ha marcado las dos versiones:

```bash
<<<<<<< HEAD
Hola, bienvenido a la tienda
=======
Bienvenido a la mejor tienda
>>>>>>> cambiar-titulo
```

- Entre `<<<<<<< HEAD` y `=======` está **lo que había en tu rama actual** (`main`).
- Entre `=======` y `>>>>>>>` está **lo que viene de la otra rama**.

Tienes que dejar el archivo **como debe quedar** y borrar las marcas. Puedes quedarte con una versión, con la otra o combinar las dos:

```bash
Hola, bienvenido a la mejor tienda
```

En **VS Code** es más fácil: encima del conflicto aparecen botones **Accept Current Change**, **Accept Incoming Change** y **Accept Both Changes**.

Cuando el archivo esté bien, termina el merge:

```bash
git add index.html
git commit -m "Resuelve el conflicto del título"
```

¡Listo! Ya sabes resolver un conflicto.

### En la vida real: el conflicto aparece en tu PR

Lo habitual es que GitHub te avise en el PR: **"This branch has conflicts that must be resolved"**. Significa que `main` cambió mientras trabajabas. La forma más sencilla de arreglarlo es traer `main` a tu rama:

```bash
git switch main
git pull
git switch feature/formulario-contacto
git merge main
# resuelve los conflictos como antes
git add .
git commit -m "Trae los últimos cambios de main"
git push
```

El PR se actualiza y el aviso desaparece.

## Chuleta

| Quiero... | Comando |
| --- | --- |
| Ver en qué rama estoy | `git branch` |
| Crear una rama y cambiarme | `git switch -c nombre` |
| Cambiarme a una rama | `git switch nombre` |
| Subir una rama nueva | `git push -u origin nombre` |
| Traer lo último | `git pull` |
| Juntar otra rama con la actual | `git merge otra-rama` |
| Borrar una rama local | `git branch -d nombre` |
| Cancelar un merge con conflictos | `git merge --abort` |

## Errores comunes

- **Trabajar directamente en `main`.** Crea siempre una rama antes del primer cambio. Si ya hiciste cambios sin commit, `git switch -c nueva-rama` se los lleva a la rama nueva.
- **Empezar una rama sin hacer `git pull` en `main`.** Partirás de código viejo y tendrás más conflictos.
- **PRs gigantes.** Un PR con 40 archivos no lo revisa nadie con cuidado. Mejor varios pequeños.
- **Hacer commit con las marcas `<<<<<<<` dentro.** Antes de `git add`, busca en el archivo que no quede ninguna.
- **Asustarse con los conflictos.** Son normales. Si te lías, `git merge --abort` te devuelve a como estabas antes del merge.

## Para profundizar

- [Ramas en el libro oficial de Git](https://git-scm.com/book/es/v2/Ramificaciones-en-Git-%C2%BFQu%C3%A9-es-una-rama%3F)
- [Acerca de los pull requests (GitHub)](https://docs.github.com/es/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)

En resumen: en un equipo **cada tarea va en su rama**, se sube con `git push -u origin rama`, se propone con un **pull request**, se **revisa** y se hace **merge** en `main`. Y cuando aparece un conflicto, Git solo te pide que elijas qué versión se queda: edita, borra las marcas, `add` y `commit`.
