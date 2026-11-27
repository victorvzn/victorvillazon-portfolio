---
title: 'La terminal para frontend: los 10 comandos que vas a usar'
description: 'Pierde el miedo a la pantalla negra. Qué es la terminal, cómo moverte entre carpetas, crear y borrar archivos y ejecutar los comandos de npm y Git.'
date: 2026-11-26
series: carrera
tags: [Terminal, Herramientas, Fundamentos]
draft: false
---

Tarde o temprano, cualquier tutorial te dirá "abre la terminal y ejecuta...". Instalar paquetes, arrancar un proyecto, usar Git: todo pasa por esa pantalla negra que intimida al principio. La buena noticia es que para frontend necesitas **muy pocos comandos**, y en este post están todos.

## ¿Qué es la terminal?

La **terminal** (o consola, o línea de comandos) es una forma de hablar con tu ordenador **escribiendo** en vez de haciendo clic. Lo mismo que haces en el explorador de archivos (abrir carpetas, crear archivos), pero con texto.

Hay varias, según tu sistema:

- **Windows**: **PowerShell** (la que viene por defecto) o **Git Bash** (se instala con Git y usa los mismos comandos que Mac y Linux).
- **Mac y Linux**: la app **Terminal**, que usa *bash* o *zsh*.

**La más cómoda: la de VS Code.** Menú **Terminal → Nueva terminal** (o `` Ctrl + ` ``). Se abre ya dentro de la carpeta de tu proyecto.

## Cómo se lee una línea de la terminal

```bash
C:\Users\ana\proyectos>
```

Eso es el **prompt**: te dice **en qué carpeta estás** y que la terminal espera un comando. Escribes el comando, pulsas `Enter` y aparece el resultado.

Un comando suele tener esta forma:

```bash
comando argumento --opcion
```

Por ejemplo, `npm install --save-dev vite`: el comando es `npm`, `install` y `vite` son argumentos y `--save-dev` es una opción.

## Moverte entre carpetas

### `pwd`: ¿dónde estoy?

```bash
pwd
```

Muestra la ruta completa de la carpeta actual (*print working directory*). En PowerShell también funciona.

### `ls`: ¿qué hay aquí?

```bash
ls
```

Lista los archivos y carpetas de la carpeta actual. Funciona en PowerShell, Mac y Linux. (En el antiguo `cmd` de Windows es `dir`.)

### `cd`: entrar y salir de carpetas

```bash
cd proyectos          # entra en la carpeta "proyectos"
cd mi-web             # entra en "mi-web", que está dentro de "proyectos"
cd ..                 # sube un nivel (vuelve a "proyectos")
cd ../..              # sube dos niveles
cd ~                  # vuelve a tu carpeta de usuario
```

`..` siempre significa "la carpeta de arriba".

> **Truco 1:** escribe las primeras letras de una carpeta y pulsa **`Tab`**: la terminal completa el nombre. Te ahorra escribir y evita errores.
>
> **Truco 2:** si una carpeta tiene espacios, ponla entre comillas: `cd "Mis proyectos"`. Mejor aún: no uses espacios en los nombres de carpetas de proyectos.

## Crear y borrar

```bash
mkdir mi-proyecto       # crea una carpeta
```

Para crear un archivo:

```bash
# Mac, Linux y Git Bash
touch index.html

# PowerShell
New-Item index.html
```

Para borrar:

```bash
# Mac, Linux y Git Bash
rm archivo.txt
rm -r carpeta           # -r: borra la carpeta con todo lo que tiene dentro

# PowerShell
Remove-Item archivo.txt
Remove-Item carpeta -Recurse
```

⚠️ **Lo que borras en la terminal no va a la papelera.** Desaparece. Comprueba dos veces en qué carpeta estás (`pwd`) antes de borrar nada.

## Abrir el proyecto en VS Code

```bash
code .
```

El punto `.` significa "la carpeta actual". Abre VS Code con todo tu proyecto. (En Mac, si no funciona, abre VS Code, pulsa `Cmd + Shift + P` y busca "Shell Command: Install 'code' command in PATH".)

## Los comandos de herramientas que usarás a diario

La mayor parte del tiempo no usarás comandos del sistema, sino los de tus herramientas:

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las dependencias del proyecto |
| `npm run dev` | Arranca el servidor de desarrollo |
| `npm run build` | Prepara la versión para publicar |
| `git status` | Muestra qué archivos cambiaron |
| `git add .` + `git commit -m "..."` | Guarda un commit |
| `node archivo.js` | Ejecuta un archivo de JavaScript con Node |

Todos se ejecutan **dentro de la carpeta del proyecto**. El error más típico de los principiantes es ejecutarlos en otra carpeta.

## Atajos que te harán la vida más fácil

| Atajo | Qué hace |
| --- | --- |
| `Tab` | Autocompleta nombres de archivos y carpetas |
| `↑` / `↓` | Recorre los comandos que ya escribiste |
| `Ctrl + C` | **Detiene** el comando que se está ejecutando (por ejemplo, el servidor de `npm run dev`) |
| `Ctrl + L` o `clear` | Limpia la pantalla |

`Ctrl + C` es el más importante: cuando un servidor está corriendo, la terminal queda "ocupada". Para recuperarla, detenlo con `Ctrl + C`. O abre **otra** terminal con el botón `+` de VS Code.

## Leer los errores

Cuando algo falla, la terminal te lo dice, normalmente en las **últimas líneas**. Los más habituales:

- **`command not found`** o **`no se reconoce como nombre de un cmdlet`**: el programa no está instalado o lo escribiste mal. ¿Instalaste Node? ¿Es `npm` y no `nmp`?
- **`No such file or directory`** / **`Cannot find path`**: el archivo o la carpeta no existe **donde estás**. Revisa con `pwd` y `ls`.
- **`ENOENT: no such file or directory, open '.../package.json'`**: ejecutaste un comando de npm fuera de la carpeta del proyecto.
- **`Permission denied`**: no tienes permisos. No lo arregles con `sudo` a ciegas: busca primero por qué.

Copia el mensaje de error y búscalo tal cual. Es lo que hacen todos los desarrolladores, también los que tienen años de experiencia.

## Tu turno

Haz todo esto sin usar el ratón (salvo para abrir la terminal):

1. Ve a tu carpeta de usuario con `cd ~`.
2. Crea una carpeta `practica-terminal` y entra en ella.
3. Crea dentro un archivo `index.html` y una carpeta `css`.
4. Entra en `css`, crea `estilos.css` y vuelve a la carpeta de arriba.
5. Lista el contenido para comprobar que está todo.
6. Abre la carpeta en VS Code con `code .`.

## Errores comunes

- **Ejecutar comandos en la carpeta equivocada.** Antes de `npm install` o `git init`, mira el prompt o haz `pwd`.
- **No esperar a que termine un comando.** Si no ves el prompt de nuevo, todavía está trabajando.
- **Cerrar la terminal con un servidor corriendo y no entender por qué la web dejó de funcionar.** El servidor vive en esa terminal.
- **Copiar comandos de internet sin leerlos**, sobre todo los que llevan `rm`, `sudo` o `Remove-Item`.
- **Usar comandos de Mac en PowerShell** (o al revés). Si un tutorial usa `touch` o `rm -rf`, usa Git Bash o el equivalente de PowerShell.

## Para profundizar

- [Introducción a la línea de comandos en MDN](https://developer.mozilla.org/es/docs/Learn_web_development/Getting_started/Environment_setup/Command_line)

En resumen: la terminal es hablar con tu ordenador escribiendo. Con **`pwd`** sabes dónde estás, con **`ls`** qué hay, con **`cd`** te mueves y con **`mkdir`** creas carpetas. Usa **`Tab`** para autocompletar y **`Ctrl + C`** para detener. Y ejecuta los comandos de npm y Git siempre **dentro de la carpeta del proyecto**.
