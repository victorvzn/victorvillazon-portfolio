---
title: 'Docker desde cero: adiós al "en mi máquina funciona"'
description: 'Qué es un contenedor y en qué se diferencia de una máquina virtual, imágenes y contenedores, cómo instalar Docker Desktop y los comandos básicos: run, ps, stop, logs, exec, puertos y volúmenes.'
date: 2026-11-27
series: devops
tags: [Docker, DevOps, Contenedores, Fundamentos]
draft: true
---

Tu API funciona perfectamente en tu portátil. Se la pasas a un compañero y... no arranca. Él tiene otra versión de Node, le falta una variable de entorno, usa Windows y tú Mac. O peor: la subes al servidor y falla por algo que nadie entiende. **"En mi máquina funciona"** es probablemente la frase más repetida del mundo del software.

**Docker** la soluciona empaquetando tu app **junto con todo lo que necesita para funcionar** en una caja que se ejecuta igual en cualquier sitio. Esa caja se llama **contenedor**.

## La analogía del contenedor de mercancías

Antes de los contenedores de barco, cargar mercancías era un caos: cajas de todos los tamaños, sacos, barriles... Cada puerto lo hacía a su manera. El contenedor estándar lo cambió todo: da igual lo que haya dentro, **se mueve y se apila siempre igual**, en cualquier barco, tren o camión.

Docker hace lo mismo con el software: da igual que dentro haya una API de Node, una base de datos o una web de Python. El contenedor **se ejecuta siempre igual**, en tu portátil, en el de tu compañero o en un servidor de AWS.

## Imagen y contenedor

Los dos conceptos clave:

- Una **imagen** es la **receta** (o el molde): un paquete con un sistema operativo mínimo, tu código, sus dependencias y el comando para arrancarlo. No cambia.
- Un **contenedor** es una **imagen en ejecución**. De una imagen puedes arrancar uno o cien contenedores.

Es como una **clase** y sus **instancias** en JavaScript: `class Usuario` es la imagen; cada `new Usuario()` es un contenedor.

Las imágenes se comparten en **registros**. El más grande es [Docker Hub](https://hub.docker.com), con imágenes oficiales de Node, PostgreSQL, Nginx, Redis y miles más, listas para usar.

## ¿Y no es lo mismo que una máquina virtual?

Parecido, pero mucho más ligero:

| | Máquina virtual | Contenedor |
| --- | --- | --- |
| Qué incluye | Un sistema operativo **completo** | Solo tu app y lo que necesita |
| Tamaño | Gigabytes | Megabytes |
| Tarda en arrancar | Minutos | Segundos |
| Cuántos caben en tu portátil | Unos pocos | Decenas |

Los contenedores **comparten el núcleo** (*kernel*) del sistema anfitrión en lugar de traer uno propio. Por eso son tan rápidos.

## Paso 1: instalar Docker

Descarga **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** para Windows, macOS o Linux e instálalo con las opciones por defecto. En Windows te pedirá activar **WSL 2** (el Linux integrado de Windows): acepta.

Ábrelo (tiene que estar en marcha para usar Docker) y comprueba en una terminal:

```bash
docker --version
docker run hello-world
```

Si ves un mensaje que empieza por `Hello from Docker!`, todo funciona. Acabas de **descargar una imagen** de Docker Hub y **arrancar un contenedor** con ella.

## Paso 2: tu primer servidor en un contenedor

Vamos a arrancar **Nginx**, un servidor web muy usado, sin instalarlo:

```bash
docker run -d -p 8080:80 --name mi-web nginx
```

Abre [http://localhost:8080](http://localhost:8080): verás "Welcome to nginx!". Qué significa cada parte:

| Parte | Qué hace |
| --- | --- |
| `docker run` | Crea y arranca un contenedor |
| `-d` | En segundo plano (*detached*): te devuelve la terminal |
| `-p 8080:80` | Conecta el puerto **8080 de tu ordenador** con el **80 del contenedor** |
| `--name mi-web` | Le pone un nombre (si no, Docker inventa uno) |
| `nginx` | La imagen a usar |

### Los puertos: la parte que más confunde

Un contenedor está **aislado**: tiene su propia red. Nginx escucha en el puerto 80 **dentro** del contenedor, pero desde fuera nadie puede llegar a él... hasta que lo "publicas" con `-p`.

`-p PUERTO_EN_TU_PC:PUERTO_EN_EL_CONTENEDOR`. Siempre en ese orden: **fuera:dentro**.

## Paso 3: los comandos del día a día

```bash
docker ps                 # contenedores en marcha
docker ps -a              # todos, también los parados
docker logs mi-web        # lo que ha escrito en la consola
docker logs -f mi-web     # en directo (Ctrl + C para salir)
docker stop mi-web        # parar
docker start mi-web       # volver a arrancar
docker rm mi-web          # borrar el contenedor (debe estar parado)
docker images             # imágenes descargadas
docker rmi nginx          # borrar una imagen
```

Todo esto también lo puedes ver y hacer con clics en **Docker Desktop**, en las pestañas *Containers* e *Images*.

### Entrar en un contenedor

```bash
docker exec -it mi-web sh
```

Abre una terminal **dentro** del contenedor. Prueba `ls`, `cat /etc/os-release` (verás que es un Linux) y `exit` para salir. Muy útil para investigar por qué algo no funciona.

## Paso 4: probar Node sin instalarlo

¿Quieres probar tu código con otra versión de Node sin tocar la de tu ordenador?

```bash
docker run -it --rm node:22 node
```

Estás en la consola de Node 22. Escribe `process.version` y luego `.exit`.

- `-it` lo hace interactivo (puedes escribir).
- `--rm` borra el contenedor al salir, para no dejar basura.
- `node:22` es la imagen `node` con la **etiqueta** (*tag*) `22`. Las etiquetas indican versiones: `node:20`, `node:22-alpine` (una versión mucho más pequeña)...

## Paso 5: los datos y los volúmenes

Haz esta prueba:

```bash
docker run -d --name base-datos -e POSTGRES_PASSWORD=secreto postgres:17
```

Acabas de arrancar una base de datos **PostgreSQL** completa con un comando (`-e` define una variable de entorno). Pero si borras el contenedor (`docker rm -f base-datos`), **los datos desaparecen con él**. Los contenedores son **desechables**.

Para guardar datos de forma permanente se usan **volúmenes**: carpetas que viven fuera del contenedor.

```bash
docker run -d --name base-datos \
  -e POSTGRES_PASSWORD=secreto \
  -v datos-postgres:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:17
```

`-v datos-postgres:/var/lib/postgresql/data` dice: "guarda lo que el contenedor escriba en esa carpeta en un volumen llamado `datos-postgres`". Ahora puedes borrar el contenedor y crear otro con el mismo volumen: los datos siguen ahí.

(En PowerShell, escribe el comando en una sola línea, sin las `\`.)

## ¿Por qué lo usan todos los equipos?

- **Mismo entorno para todos**: desarrollo, pruebas y producción ejecutan exactamente la misma imagen.
- **Probar sin instalar**: una base de datos, una versión antigua de Node, una herramienta... y la borras sin dejar rastro.
- **Despliegue**: casi todos los servicios en la nube (AWS, Google Cloud, Render, Fly.io...) aceptan imágenes de Docker.
- **Aparece en las ofertas**: saber lo básico de Docker es un plus enorme para un perfil junior, también en frontend.

## Tu turno

1. Arranca un contenedor de Nginx en el puerto 3001 con el nombre `web-2`. Ábrelo en el navegador.
2. Mira sus logs mientras recargas la página varias veces.
3. Entra en él con `docker exec` y busca el archivo `index.html` que sirve (está en `/usr/share/nginx/html`).
4. Arranca **dos** contenedores de Nginx a la vez, en los puertos 8081 y 8082. ¿Por qué no puedes usar el mismo puerto de tu PC para los dos?
5. Limpia todo: para y borra los contenedores que creaste.

## Errores comunes

- **`Cannot connect to the Docker daemon`.** Docker Desktop no está abierto.
- **`port is already allocated`.** Ese puerto de tu PC ya lo usa otro contenedor u otro programa. Cambia el primer número de `-p`.
- **Invertir los puertos** (`-p 80:8080`). Es `-p fuera:dentro`.
- **Perder los datos** al borrar un contenedor de base de datos. Usa volúmenes.
- **Llenar el disco** de contenedores e imágenes viejos. `docker system prune` limpia lo que no se usa (lee lo que te pregunta antes de confirmar).

## Para profundizar

- [Guía de inicio de Docker (documentación oficial, en inglés)](https://docs.docker.com/get-started/)
- [Docker Hub](https://hub.docker.com)

En resumen: **Docker** empaqueta tu app con todo lo que necesita en un **contenedor** que funciona igual en cualquier sitio. Una **imagen** es la receta; un **contenedor**, la imagen en marcha. Con **`docker run`** los arrancas, con **`-p fuera:dentro`** publicas sus puertos, con **`-v`** guardas sus datos en un **volumen** y con `ps`, `logs`, `exec`, `stop` y `rm` los gestionas. En el siguiente post crearás **tu propia imagen**.
