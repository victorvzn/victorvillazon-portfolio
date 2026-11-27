---
title: 'Docker Compose: levanta frontend, API y base de datos con un comando'
description: 'Qué es Docker Compose y cuándo lo necesitas, cómo escribir un compose.yaml con varios servicios, la red interna entre contenedores, volúmenes, variables de entorno, depends_on con healthcheck y un entorno de desarrollo con recarga automática.'
date: 2026-11-27
series: devops
tags: [Docker, Docker Compose, DevOps, Avanzado]
draft: true
---

Una app real casi nunca es un solo contenedor. Tienes un **frontend**, una **API**, una **base de datos** y quizá una caché. Arrancar cada uno con su `docker run`, con sus puertos, variables y volúmenes, es un comando larguísimo por servicio que nadie recuerda.

**Docker Compose** te deja describir **toda la app** en un archivo y levantarla con un solo comando:

```bash
docker compose up
```

Un compañero nuevo clona el repositorio, ejecuta eso y en un minuto tiene todo funcionando. Sin instalar Node, ni bases de datos, ni nada más que Docker.

## El proyecto

```bash
mi-app/
├── compose.yaml
├── api/
│   ├── Dockerfile
│   ├── package.json
│   └── src/...
└── web/
    ├── Dockerfile
    ├── package.json
    └── src/...
```

- **`api`**: la API de Express con su `Dockerfile` (del post anterior). Usa `@libsql/client`.
- **`web`**: un frontend de Vite con la build multi-etapa y Nginx.
- **`db`**: la base de datos. Usaremos **libSQL server**, la versión servidor de la base de datos de Turso, que tiene imagen oficial de Docker. Así desarrollas en local con lo mismo que usas en producción.

## El `compose.yaml`

En la raíz del proyecto:

```yaml
services:
  db:
    image: ghcr.io/tursodatabase/libsql-server:latest
    volumes:
      - datos-db:/var/lib/sqld

  api:
    build: ./api
    environment:
      PORT: 3000
      TURSO_DATABASE_URL: http://db:8080
    ports:
      - "3000:3000"
    depends_on:
      - db
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/api/salud || exit 1"]
      interval: 5s
      retries: 10

  web:
    build: ./web
    ports:
      - "8080:80"
    depends_on:
      api:
        condition: service_healthy

volumes:
  datos-db:
```

YAML es un formato de configuración donde **la sangría importa** (usa espacios, nunca tabulaciones). Veamos cada parte.

### `services`

Cada entrada es un contenedor. Su nombre (`db`, `api`, `web`) es importante, como verás enseguida.

- **`image`**: usa una imagen ya hecha (como en `docker run`).
- **`build`**: construye la imagen a partir del `Dockerfile` de esa carpeta.
- **`ports`**: igual que `-p`, en formato `"fuera:dentro"`.
- **`environment`**: variables de entorno, igual que `-e`.
- **`volumes`**: igual que `-v`.

### La red interna: los servicios se llaman por su nombre

Mira la URL de la base de datos: `http://db:8080`. No es `localhost`. Compose crea una **red privada** para todos los servicios, y dentro de ella **cada servicio se encuentra por su nombre**. La API llega a la base de datos en `db`, como si fuera un dominio.

Fíjate también en que `db` **no tiene `ports`**: no se puede acceder a ella desde fuera, solo desde los otros servicios. Más seguro. (Si quieres inspeccionarla desde tu PC, añade `ports: ["8081:8080"]`.)

> ⚠️ `localhost` **dentro** de un contenedor es **el propio contenedor**. Si la API usa `http://localhost:8080`, buscará la base de datos dentro de sí misma y fallará. Usa el nombre del servicio.

### `depends_on` y `healthcheck`

`depends_on` decide el **orden de arranque**: `api` arranca después de `db`. Pero que un contenedor haya *arrancado* no significa que esté *listo*: una API o una base de datos pueden tardar unos segundos en aceptar conexiones.

Por eso `api` tiene un **`healthcheck`**: un comando que Compose ejecuta **dentro del contenedor** cada 5 segundos para saber si está sano. Aquí pide la ruta `/api/salud` que creaste en el post de middlewares (`wget` viene incluido en las imágenes Alpine). Con `condition: service_healthy`, `web` no arranca hasta que la API responde.

Las bases de datos suelen traer su propio comando para esto. Con PostgreSQL, por ejemplo:

```yaml
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10
```

### `volumes`

`datos-db` es un **volumen con nombre**: los datos de la base de datos sobreviven aunque borres y recrees los contenedores.

## Los comandos

```bash
docker compose up             # construye (si hace falta) y arranca todo, con los logs en la terminal
docker compose up -d          # lo mismo, en segundo plano
docker compose up --build     # fuerza a reconstruir las imágenes
docker compose ps             # estado de cada servicio
docker compose logs -f api    # logs de un servicio, en directo
docker compose exec api sh    # una terminal dentro de la API
docker compose down           # para y borra los contenedores (los volúmenes se quedan)
docker compose down -v        # también borra los volúmenes: ¡adiós datos!
```

Abre [http://localhost:8080](http://localhost:8080) para el frontend y [http://localhost:3000/api/salud](http://localhost:3000/api/salud) para la API.

### Ejecutar las migraciones

Para tareas puntuales, como las migraciones del post de Turso con Express, usa `run`, que arranca un contenedor temporal del servicio:

```bash
docker compose run --rm api node scripts/migrar.js
```

## Secretos con un archivo `.env`

No escribas contraseñas ni tokens en `compose.yaml` (se sube a Git). Compose lee automáticamente un `.env` en la misma carpeta y puedes usar sus variables con `${...}`:

```bash
# .env (en el .gitignore)
API_KEY_CORREO=sk_abc123
```

```yaml
  api:
    build: ./api
    environment:
      TURSO_DATABASE_URL: http://db:8080
      API_KEY_CORREO: ${API_KEY_CORREO}
```

O pásale el archivo entero al servicio con `env_file: .env`. Sube al repositorio un **`.env.example`** con los nombres de las variables (sin valores reales), para que el resto del equipo sepa qué rellenar.

## Desarrollo con recarga automática

Con lo anterior, cada cambio en el código obliga a reconstruir la imagen. Para desarrollar, Compose puede **sincronizar tus archivos** con el contenedor y reaccionar a los cambios con **`develop.watch`**:

```yaml
  api:
    build: ./api
    command: node --watch src/server.js
    environment:
      TURSO_DATABASE_URL: http://db:8080
    ports:
      - "3000:3000"
    develop:
      watch:
        - action: sync
          path: ./api/src
          target: /app/src
        - action: rebuild
          path: ./api/package.json
```

```bash
docker compose watch
```

- **`sync`**: cuando cambias un archivo de `./api/src`, se copia al contenedor al momento. Como la API corre con `node --watch`, se reinicia sola.
- **`rebuild`**: si cambias `package.json` (instalaste una librería), reconstruye la imagen.
- **`command`** sobrescribe el `CMD` del Dockerfile solo para este entorno.

Muchos equipos tienen un `compose.yaml` para desarrollo y otro (o ninguno) para producción, donde los servicios gestionados como Turso o una base de datos de AWS sustituyen al contenedor `db`.

## Tu turno

1. Monta el proyecto completo: la API de tareas de la serie de Backend, la base de datos libSQL y un frontend que liste las tareas.
2. Publica el puerto de `db` (`"8081:8080"`) y, desde un script en tu PC, conéctate con `createClient({ url: 'http://localhost:8081' })` para ver las tablas. ¿Por qué aquí sí es `localhost`?
3. Ejecuta `docker compose down` y vuelve a levantarlo: ¿siguen tus tareas? Ahora prueba con `down -v`.
4. Configura `develop.watch` y comprueba que la API se reinicia al guardar.

## Errores comunes

- **Usar `localhost`** para conectar un servicio con otro. Usa el nombre del servicio.
- **Tabulaciones en el YAML.** Solo espacios, y con la sangría correcta.
- **`depends_on` sin healthcheck** y la API que falla porque la base de datos aún no estaba lista.
- **`docker compose down -v` sin querer**: borra los volúmenes y con ellos los datos.
- **Cambiar el código y no ver el cambio.** Sin `watch`, hay que reconstruir con `up --build`.
- **Secretos escritos en `compose.yaml`.** Usa un `.env` que no se suba a Git.

## Para profundizar

- [Docker Compose: inicio rápido (documentación oficial, en inglés)](https://docs.docker.com/compose/gettingstarted/)
- [Compose Watch (documentación oficial, en inglés)](https://docs.docker.com/compose/how-tos/file-watch/)

En resumen: **Docker Compose** describe toda tu app en un **`compose.yaml`**: cada **servicio** con su imagen o `build`, puertos, variables y volúmenes. Los servicios se comunican por una **red interna usando su nombre** (nunca `localhost`), **`depends_on` con `healthcheck`** asegura el orden de arranque y **`docker compose watch`** sincroniza tu código para desarrollar. Un comando, `docker compose up`, y todo el equipo tiene el mismo entorno.
