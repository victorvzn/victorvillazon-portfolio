---
title: 'npm y package.json explicados: dependencias, scripts y node_modules'
description: 'Qué es npm, qué significa cada parte del package.json, la diferencia entre dependencies y devDependencies, qué es el package-lock.json y por qué node_modules no se sube a Git.'
date: 2026-11-26
series: carrera
tags: [npm, Node.js, Herramientas]
draft: true
---

Clonas un proyecto de GitHub, intentas abrirlo y no funciona. Alguien te dice: "haz `npm install`". Lo haces, aparece una carpeta `node_modules` gigante, y de repente funciona. ¿Qué acaba de pasar?

Hoy vamos a entender **npm** y el archivo que lo controla todo: el **`package.json`**.

## ¿Qué es npm?

**npm** (*Node Package Manager*) es el **gestor de paquetes** de JavaScript. Un **paquete** (o librería, o dependencia) es código que otra persona escribió y publicó para que lo reutilices: una librería para formatear fechas, React, Tailwind, Vite...

npm hace dos cosas:

1. Es una **web** ([npmjs.com](https://www.npmjs.com)) con millones de paquetes publicados.
2. Es un **programa** de la terminal que los descarga e instala en tu proyecto.

Se instala automáticamente con **Node.js**. Compruébalo con:

```bash
npm --version
```

## El `package.json`: la ficha del proyecto

Todo proyecto que usa npm tiene un `package.json` en su carpeta principal. Lo creas con:

```bash
npm init -y
```

(`-y` responde "sí" a todas las preguntas con los valores por defecto.) Un `package.json` típico de un proyecto frontend:

```json
{
  "name": "mi-tienda",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "vite": "^7.1.0"
  }
}
```

Vamos parte por parte.

### `name`, `version` y `private`

El nombre y la versión de tu proyecto. `"private": true` evita que lo publiques en npm por accidente: tu web no es una librería.

### `type: "module"`

Permite usar `import` / `export` en los archivos de Node del proyecto (lo vimos en el post de Node.js).

### `scripts`: tus atajos

Los **scripts** son comandos con nombre. En vez de recordar comandos largos, los guardas aquí y los ejecutas con `npm run nombre`:

```bash
npm run dev      # ejecuta "vite"
npm run build    # ejecuta "vite build"
```

Es lo primero que debes mirar al abrir un proyecto que no conoces: los scripts te dicen **cómo arrancarlo**. (`npm start` y `npm test` funcionan incluso sin el `run`.)

### `dependencies` y `devDependencies`

Las dos listas de paquetes que usa el proyecto:

| | `dependencies` | `devDependencies` |
| --- | --- | --- |
| ¿Qué son? | Lo que tu app necesita **para funcionar** | Lo que necesitas **para desarrollar** |
| Ejemplos | React, Vue, una librería de gráficos | Vite, Tailwind, ESLint, herramientas de tests |
| Cómo se instala | `npm install react` | `npm install --save-dev vite` (o `-D`) |

Una forma de pensarlo: si el usuario final necesita ese código en su navegador, es una `dependency`. Si solo lo usas tú mientras programas o para preparar el proyecto, es una `devDependency`.

## Instalar, actualizar y desinstalar

```bash
npm install                 # instala TODO lo que dice el package.json
npm install dayjs           # instala un paquete y lo añade a dependencies
npm install -D prettier     # instala un paquete de desarrollo
npm uninstall dayjs         # lo desinstala y lo quita del package.json
npm outdated                # muestra qué paquetes tienen versiones nuevas
```

`npm install` sin nada más es el que usarás siempre al clonar un proyecto o al cambiar de rama: lee el `package.json` e instala todo.

## Las versiones: qué significa `^19.2.0`

Los paquetes usan **versionado semántico** (*semver*): tres números, `MAYOR.MENOR.PARCHE`.

- **PARCHE** (`19.2.0` → `19.2.1`): arregla bugs. No rompe nada.
- **MENOR** (`19.2.0` → `19.3.0`): añade funciones nuevas. No rompe nada.
- **MAYOR** (`19.2.0` → `20.0.0`): **cambios que pueden romper** tu código.

El símbolo de delante dice qué actualizaciones se permiten:

- **`^19.2.0`**: cualquier `19.x.x` igual o superior. Acepta menores y parches, pero no un `20`. Es lo que pone npm por defecto.
- **`~19.2.0`**: solo parches (`19.2.x`).
- **`19.2.0`**: exactamente esa versión.

## `node_modules`: donde vive el código descargado

Cuando instalas, npm descarga los paquetes en la carpeta **`node_modules`**. Y cada paquete tiene sus propias dependencias, que también se descargan. Por eso esa carpeta pesa tanto: un proyecto pequeño puede tener cientos de paquetes dentro.

Reglas de oro:

1. **Nunca la subas a Git.** Ponla en el `.gitignore`. Cualquiera puede recrearla con `npm install`.
2. **Nunca edites nada dentro.** Se sobrescribe en la siguiente instalación.
3. **Si algo va raro, bórrala y reinstala**: borra `node_modules`, vuelve a ejecutar `npm install` y muchos problemas misteriosos desaparecen.

## `package-lock.json`: la foto exacta

Junto al `package.json` aparece un `package-lock.json`. Mientras el `package.json` dice "quiero React `^19.2.0`" (un rango), el lock guarda **la versión exacta** que se instaló de cada paquete y de cada sub-dependencia.

Así, cuando otra persona hace `npm install`, obtiene **exactamente las mismas versiones** que tú. Sin el lock, podría instalar una versión un poco distinta y encontrarse un bug que tú no tienes.

- **Sí** se sube a Git.
- **No** se edita a mano.

## `npx`: ejecutar sin instalar

`npx` ejecuta un paquete **sin instalarlo** de forma permanente. Es lo que se usa para crear proyectos nuevos:

```bash
npx serve .              # sirve la carpeta actual en un servidor local
npm create vite@latest   # npm create es un atajo que usa el mismo mecanismo
```

## Antes de instalar un paquete

No todo lo que está en npm es bueno. Antes de añadir una dependencia, mira en su página de npm o de GitHub:

- **Descargas semanales**: ¿la usa más gente?
- **Última actualización**: ¿se sigue manteniendo?
- **¿La necesitas de verdad?** Para algo que se hace con tres líneas de JavaScript (como formatear una fecha con `Intl`), no instales una librería.

Cada dependencia es código de otra persona que se ejecuta en tu proyecto. Menos dependencias = menos problemas.

## Tu turno

1. Crea una carpeta nueva, entra en ella con la terminal y ejecuta `npm init -y`.
2. Instala `dayjs` como dependencia y `prettier` como devDependency. Abre el `package.json` y comprueba en qué lista quedó cada uno.
3. Añade un script `"formatear": "prettier --write ."` y ejecútalo con `npm run formatear`.
4. Borra la carpeta `node_modules` y recupérala con `npm install`.

## Errores comunes

- **`npm ERR! enoent ... package.json`**: estás en una carpeta sin `package.json`. Revisa con `pwd`.
- **Subir `node_modules` a GitHub.** Añádela al `.gitignore` antes del primer commit.
- **Olvidar `npm install` después de clonar** o de hacer `git pull` cuando alguien añadió paquetes. Verás errores tipo `Cannot find module`.
- **Instalar como dependencia normal lo que es de desarrollo** (o al revés).
- **Borrar el `package-lock.json`** "para arreglar algo". Si lo borras, tú y tu equipo podéis acabar con versiones distintas.
- **Mezclar gestores** (`npm`, `yarn`, `pnpm`) en el mismo proyecto. Usa el que ya usa el proyecto: lo sabrás por el archivo de bloqueo (`package-lock.json`, `yarn.lock` o `pnpm-lock.yaml`).

## Para profundizar

- [Documentación de npm (en inglés)](https://docs.npmjs.com/)
- [Versionado semántico](https://semver.org/lang/es/)

En resumen: **npm** instala paquetes de otras personas en tu proyecto. El **`package.json`** guarda los **scripts** (cómo arrancar el proyecto) y las **dependencias** (lo que necesita para funcionar) y **devDependencies** (lo que necesitas para desarrollar). **`npm install`** lo instala todo en **`node_modules`**, que nunca se sube a Git, y el **`package-lock.json`** asegura que todo el equipo tenga las mismas versiones.
