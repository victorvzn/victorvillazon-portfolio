---
title: 'Dockerfile: empaqueta tu API de Node en una imagen'
description: 'Cómo escribir un Dockerfile paso a paso para una API de Express: FROM, WORKDIR, COPY, RUN, EXPOSE y CMD, el .dockerignore, la caché de capas, variables de entorno, un usuario sin privilegios y una build multi-etapa para un frontend con Vite.'
date: 2026-11-27
series: devops
tags: [Docker, Dockerfile, Node.js, DevOps]
draft: true
---

En el post anterior usaste imágenes que había hecho otra gente: `nginx`, `node`, `postgres`. Ahora vas a crear **la tuya**, con tu API dentro, para que cualquiera pueda ejecutarla con un solo comando sin instalar Node ni nada más.

La receta de una imagen se escribe en un archivo llamado **`Dockerfile`**.

## La app que vamos a empaquetar

Una API mínima de Express (lo viste en Express desde cero):

```js
// server.js
import express from 'express'

const app = express()
const PUERTO = process.env.PORT ?? 3000

app.get('/api/salud', (req, res) => {
  res.json({ ok: true, entorno: process.env.NODE_ENV ?? 'development' })
})

app.listen(PUERTO, () => console.log(`API en el puerto ${PUERTO}`))
```

```json
{
  "name": "api-docker",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

Ejecuta `npm install` para generar el `package-lock.json`: lo necesitaremos.

## El Dockerfile, línea a línea

Crea un archivo llamado exactamente `Dockerfile` (sin extensión) en la raíz del proyecto:

```dockerfile
# 1. Imagen base: Linux con Node 22 ya instalado
FROM node:22-alpine

# 2. Carpeta de trabajo dentro de la imagen
WORKDIR /app

# 3. Copiar primero solo los archivos de dependencias
COPY package.json package-lock.json ./

# 4. Instalar dependencias (solo las de producción)
RUN npm ci --omit=dev

# 5. Copiar el resto del código
COPY . .

# 6. Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# 7. Documentar en qué puerto escucha
EXPOSE 3000

# 8. No ejecutar como administrador
USER node

# 9. El comando que arranca la app
CMD ["node", "server.js"]
```

| Instrucción | Qué hace |
| --- | --- |
| `FROM` | La imagen de partida. Siempre es la primera línea |
| `WORKDIR` | Crea una carpeta y se coloca en ella (como `cd`) |
| `COPY origen destino` | Copia archivos de tu proyecto a la imagen |
| `RUN` | Ejecuta un comando **al construir** la imagen |
| `ENV` | Define variables de entorno |
| `EXPOSE` | Documenta el puerto (no lo publica: eso lo hace `-p`) |
| `USER` | Con qué usuario se ejecuta la app |
| `CMD` | El comando que se ejecuta **al arrancar** un contenedor |

Algunos detalles:

- **`node:22-alpine`** usa **Alpine Linux**, una distribución mínima: la imagen pesa unos 50 MB menos que `node:22`. Fija siempre la versión (`22`), nunca uses `latest`: un día cambiaría y tu imagen dejaría de funcionar.
- **`npm ci`** instala **exactamente** lo que dice `package-lock.json`. Es más rápido y reproducible que `npm install`. `--omit=dev` se salta las dependencias de desarrollo (Vitest, etc.).
- **`USER node`**: la imagen oficial trae un usuario `node` sin permisos de administrador. Si alguien encontrara un fallo de seguridad en tu app, tendría muchos menos poderes.
- **`RUN` contra `CMD`**: `RUN npm ci` se ejecuta **una vez**, al construir. `CMD` se ejecuta **cada vez** que arranca un contenedor.

## El `.dockerignore`

`COPY . .` copia **todo** el proyecto. No quieres meter en la imagen tu `node_modules` (se instala dentro), tu `.env` con secretos ni la carpeta `.git`. Crea un `.dockerignore`, que funciona como el `.gitignore`:

```bash
node_modules
npm-debug.log
.env
.git
Dockerfile
.dockerignore
coverage
*.md
```

> ⚠️ **Nunca metas secretos en una imagen** (ni con `COPY .env`, ni con `ENV TOKEN=...`). Cualquiera que tenga la imagen puede leerlos. Los secretos se pasan **al arrancar** el contenedor, como verás abajo.

## Construir la imagen

```bash
docker build -t mi-api:1.0 .
```

- `-t mi-api:1.0` le pone nombre y etiqueta (versión).
- El `.` final es el **contexto**: la carpeta donde están el `Dockerfile` y los archivos a copiar.

Verás cómo Docker ejecuta cada paso. Comprueba que la imagen existe:

```bash
docker images mi-api
```

## Ejecutarla

```bash
docker run -d -p 3000:3000 --name api mi-api:1.0
```

Abre [http://localhost:3000/api/salud](http://localhost:3000/api/salud):

```json
{ "ok": true, "entorno": "production" }
```

Tu API corre dentro de un contenedor. Cualquiera con Docker puede ejecutarla igual, tenga o no Node instalado.

### Pasar variables de entorno (y secretos)

```bash
docker run -d -p 4000:4000 -e PORT=4000 --name api-4000 mi-api:1.0

# O todas las de un archivo
docker run -d -p 3000:3000 --env-file .env --name api-prod mi-api:1.0
```

Así la **misma imagen** sirve para desarrollo, pruebas y producción: lo único que cambia son las variables.

## La caché de capas: por qué el orden importa

Cada instrucción del Dockerfile crea una **capa**. Docker **guarda en caché** cada capa y, al reconstruir, reutiliza las que no han cambiado.

Por eso copiamos primero `package.json` y luego el resto:

```dockerfile
COPY package.json package-lock.json ./   # cambia poco
RUN npm ci --omit=dev                    # lento, pero se cachea
COPY . .                                 # cambia en cada commit
```

Si cambias `server.js`, Docker reutiliza la capa de `npm ci` (porque `package.json` no cambió) y la build tarda segundos. Si hubieras hecho `COPY . .` antes del `npm ci`, **cualquier** cambio en el código obligaría a reinstalar todas las dependencias.

**Regla:** lo que cambia poco, arriba; lo que cambia mucho, abajo.

## Bonus: un frontend con Vite y una build multi-etapa

Para un frontend (React, Vue o HTML con Vite), el resultado final no necesita Node: son archivos estáticos (`dist/`) que puede servir **Nginx**. Una **build multi-etapa** usa una imagen para construir y otra, mucho más pequeña, para servir:

```dockerfile
# Etapa 1: construir
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir solo el resultado
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

- La etapa `build` tiene Node, `node_modules` y tu código fuente.
- La imagen final **solo** tiene Nginx y la carpeta `dist`. Todo lo de la primera etapa se descarta.
- Resultado: una imagen de unos 50 MB en lugar de varios cientos.

```bash
docker build -t mi-web:1.0 .
docker run -d -p 8080:80 mi-web:1.0
```

(Si tu app usa rutas del lado del cliente, como React Router, necesitarás configurar Nginx para que devuelva `index.html` en todas las rutas.)

## Compartir tu imagen

Para que otros (o un servidor) la descarguen, súbela a un registro como Docker Hub:

```bash
docker login
docker tag mi-api:1.0 tuusuario/mi-api:1.0
docker push tuusuario/mi-api:1.0
```

Y en cualquier máquina: `docker run -p 3000:3000 tuusuario/mi-api:1.0`.

## Tu turno

1. Dockeriza tu API de tareas de la serie de Backend. Pasa `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` con `--env-file`.
2. Cambia una línea de `server.js`, reconstruye y observa en la salida qué pasos dicen `CACHED`.
3. Mueve `COPY . .` antes del `npm ci`, reconstruye tras cambiar el código y compara el tiempo.
4. Dockeriza un proyecto de Vite con la build multi-etapa y compara el tamaño de la imagen con `docker images`.

## Errores comunes

- **No crear el `.dockerignore`** y copiar `node_modules` de Windows o macOS a una imagen Linux. Algunos paquetes no funcionarán.
- **Meter el `.env` en la imagen.** Pasa los secretos al arrancar con `-e` o `--env-file`.
- **Usar `latest`** como versión base.
- **`npm install` en lugar de `npm ci`**, o no subir el `package-lock.json`.
- **La app escucha en `localhost`** dentro del contenedor (`app.listen(3000, 'localhost')`). Desde fuera no se puede llegar. Escucha en todas las interfaces: `app.listen(3000)` o `'0.0.0.0'`.
- **Olvidar el `.` final** en `docker build`.

## Para profundizar

- [Referencia del Dockerfile (documentación oficial, en inglés)](https://docs.docker.com/reference/dockerfile/)
- [Buenas prácticas para imágenes de Node.js (en inglés)](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

En resumen: un **`Dockerfile`** es la receta de tu imagen: **`FROM`** la base, **`WORKDIR`** la carpeta, **`COPY`** y **`RUN`** para el código y las dependencias, y **`CMD`** para arrancar. Construye con **`docker build -t nombre .`**, crea un **`.dockerignore`**, nunca metas secretos en la imagen y ordena las instrucciones para aprovechar la **caché de capas**. Para frontends, una **build multi-etapa** deja solo lo necesario.
