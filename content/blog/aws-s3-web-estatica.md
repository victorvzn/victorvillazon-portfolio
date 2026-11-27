---
title: 'AWS S3: publica tu web estática paso a paso'
description: 'Qué es S3, buckets y objetos, cómo subir una web de HTML o Vite y publicarla con el alojamiento de sitios estáticos, la política de bucket para hacerla pública, actualizarla con la AWS CLI y por qué añadir CloudFront para tener HTTPS.'
date: 2026-11-27
series: devops
tags: [AWS, S3, Despliegue, DevOps]
draft: true
---

En el post de publicar tu web gratis usaste servicios como GitHub Pages, Netlify o Vercel. Son fantásticos, y por debajo usan nubes como AWS. Hoy vas a hacer lo mismo **directamente en AWS**, con **S3**: entenderás qué hacen esos servicios por ti y tendrás tu primer despliegue en la nube que usan las empresas.

> Antes de empezar, crea tu cuenta de forma segura y el **presupuesto de gasto cero** (está en el post anterior).

## ¿Qué es S3?

**S3** (*Simple Storage Service*) es el servicio de almacenamiento de archivos de AWS. Guardas lo que quieras: imágenes, vídeos, backups, logs... y, lo que nos interesa hoy, **los archivos de una web**.

Dos conceptos:

- Un **bucket** (cubo) es un contenedor de archivos, como una carpeta raíz. Su nombre es **único en todo el mundo**: si alguien ya usa `mi-web`, tú no puedes.
- Un **objeto** es cada archivo que guardas dentro, con su "ruta" (la **clave**): `index.html`, `assets/logo.webp`...

Una web **estática** (HTML, CSS, JS e imágenes, sin servidor que genere páginas) es solo un montón de archivos. S3 puede servirlos directamente al navegador.

## Paso 1: preparar la web

Puede ser cualquier carpeta con un `index.html`. Si es un proyecto de Vite (React, Vue o JavaScript), genera los archivos finales:

```bash
npm run build
```

Se crea la carpeta **`dist/`** con todo lo necesario. Eso es lo que subirás (no tu código fuente ni `node_modules`).

Crea también una página de error `404.html` sencilla:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Página no encontrada</title>
  </head>
  <body>
    <h1>Esta página no existe</h1>
    <a href="/">Volver al inicio</a>
  </body>
</html>
```

## Paso 2: crear el bucket

1. En la consola de AWS, busca **S3** → **Crear bucket**.
2. **Región**: la más cercana a tus usuarios.
3. **Nombre**: algo único, en minúsculas y con guiones, por ejemplo `web-tunombre-2026`.
4. **Bloquear todo el acceso público**: **desmárcalo** y confirma el aviso. Por defecto, S3 bloquea cualquier acceso público (lo correcto para casi todo), pero una web tiene que ser visible para todos.
5. Deja el resto por defecto y pulsa **Crear bucket**.

> ⚠️ Este bucket será **público**: todo lo que subas a él lo podrá ver cualquiera. Nunca guardes ahí nada privado, como un `.env` o backups.

## Paso 3: subir los archivos

1. Entra en el bucket → **Cargar**.
2. Arrastra **el contenido** de la carpeta `dist/` (no la carpeta en sí: `index.html` debe quedar en la raíz del bucket), más tu `404.html`.
3. Pulsa **Cargar**.

## Paso 4: activar el alojamiento de sitios web estáticos

1. En el bucket, pestaña **Propiedades** → baja hasta **Alojamiento de sitios web estáticos** → **Editar**.
2. **Habilitar**.
3. **Documento de índice**: `index.html`.
4. **Documento de error**: `404.html`.
5. **Guardar cambios**.

Vuelve a esa sección y verás la **URL de tu web**, algo como:

```bash
http://web-tunombre-2026.s3-website-us-east-1.amazonaws.com
```

Ábrela y... **403 Forbidden**. Es normal: falta decir que los archivos son públicos.

## Paso 5: la política del bucket

Quitar el bloqueo público solo **permite** que el bucket sea público; ahora tienes que **hacerlo** público. En la pestaña **Permisos** → **Política del bucket** → **Editar**, pega esto (cambiando el nombre del bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LecturaPublica",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::web-tunombre-2026/*"
    }
  ]
}
```

Se lee así: **permite** (`Allow`) a **cualquiera** (`"Principal": "*"`) **leer objetos** (`s3:GetObject`) de **todo lo que hay en este bucket** (`/*`).

Es una **política de IAM**: el mismo lenguaje que usa AWS para todos los permisos. Fíjate en que solo das permiso de **lectura**: nadie puede subir ni borrar archivos.

`"Version": "2012-10-17"` no es una fecha que debas cambiar: es la versión del lenguaje de políticas.

Guarda, recarga tu URL y... **tu web está en AWS**. 🎉

## Paso 6: actualizarla desde la terminal

Subir archivos a mano cada vez es lento. Con la **AWS CLI** (configurada en el post anterior):

```bash
npm run build
aws s3 sync dist/ s3://web-tunombre-2026 --delete --profile mi-perfil
```

- **`sync`** sube solo los archivos que han cambiado.
- **`--delete`** borra del bucket los archivos que ya no existen en `dist/` (por ejemplo, los JS con nombres viejos que genera Vite).

Puedes guardarlo como script en `package.json`:

```json
"scripts": {
  "deploy": "vite build && aws s3 sync dist/ s3://web-tunombre-2026 --delete --profile mi-perfil"
}
```

Y desplegar con `npm run deploy`.

## El problema: no hay HTTPS

Mira la URL: empieza por `http://`, **no** `https://`. Los sitios web de S3 **no admiten HTTPS**, y hoy eso es un problema: el navegador marca la web como "No segura", algunas APIs del navegador (como la geolocalización o el portapapeles) no funcionan y afecta al SEO.

La solución profesional es poner **CloudFront** delante:

- **CloudFront** es la **CDN** de AWS: copia tu web en cientos de servidores repartidos por el mundo (*edge locations*), así carga rápido desde cualquier país.
- Te da **HTTPS** gratis con un certificado de **ACM** (*AWS Certificate Manager*).
- Te permite usar **tu propio dominio** (con **Route 53** o el proveedor de tu dominio).
- Y el bucket puede volver a ser **privado**: con un *Origin Access Control* (OAC), solo CloudFront puede leerlo.

La arquitectura queda así:

```bash
Usuario → CloudFront (HTTPS, caché en todo el mundo) → S3 (bucket privado)
```

La consola de CloudFront te guía para crear una **distribución** con tu bucket como origen. Ten en cuenta que CloudFront **guarda en caché** tus archivos: tras un despliegue, puede que tarde en mostrar los cambios. Se fuerza con una **invalidación**:

```bash
aws cloudfront create-invalidation --distribution-id E123ABC --paths "/*" --profile mi-perfil
```

> Esto es, más o menos, lo que Netlify o Vercel hacen por ti con un clic: subir a un almacenamiento, poner una CDN delante, darte HTTPS y limpiar la caché en cada despliegue. Ahora sabes lo que pasa por debajo.

## ¿Y las rutas de React Router o Vue Router?

En una SPA (*Single Page Application*), una URL como `/productos/3` no existe como archivo: la resuelve JavaScript. Si alguien entra directamente a esa URL, S3 devolverá tu `404.html`.

El truco habitual es usar `index.html` **también como documento de error**, para que siempre se cargue la app y el router decida qué mostrar. Con CloudFront se configura con **páginas de error personalizadas** (respuesta 403/404 → `/index.html` con código 200).

## Cuánto cuesta

Para una web personal, céntimos al mes o nada, si estás dentro del plan gratuito: S3 cobra por GB almacenado y por peticiones, y una web pesa pocos MB. Tu presupuesto de gasto cero te avisará si algo cambia.

## Tu turno

1. Publica en S3 tu proyecto de la landing page (o cualquier web de la serie) siguiendo los pasos.
2. Cambia algo, haz `npm run build` y despliégalo con `aws s3 sync`.
3. Entra a una URL que no exista y comprueba que se ve tu `404.html`.
4. Reto: crea una distribución de CloudFront delante del bucket y accede por `https://`.
5. Cuando termines de practicar, **vacía y borra el bucket** si no lo vas a usar.

## Errores comunes

- **403 Forbidden.** Falta la política del bucket, o no quitaste el bloqueo de acceso público.
- **404 en la raíz.** Subiste la **carpeta** `dist` en vez de su contenido: tu `index.html` está en `dist/index.html`.
- **El nombre del bucket ya existe.** Son únicos en todo el mundo; añade tu nombre o el año.
- **Hacer público un bucket con datos privados.** Usa buckets separados para la web y para todo lo demás.
- **No ver los cambios con CloudFront.** Crea una invalidación o espera a que caduque la caché.
- **Olvidar `--delete`** y acumular archivos viejos en el bucket.

## Para profundizar

- [Alojamiento de sitios web estáticos en S3 (documentación oficial, en español)](https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Servir contenido de S3 con CloudFront (documentación oficial, en inglés)](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)

En resumen: **S3** guarda archivos en **buckets** con nombre único. Para publicar una web: crea un bucket, **quita el bloqueo público**, sube el contenido de `dist/`, activa el **alojamiento de sitios web estáticos** y añade una **política de bucket** de solo lectura. Actualiza con **`aws s3 sync --delete`**. Para tener **HTTPS**, tu dominio y velocidad mundial, pon **CloudFront** delante: es lo que hacen por ti servicios como Netlify o Vercel.
