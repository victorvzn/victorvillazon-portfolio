---
title: 'Imágenes que cargan rápido: WebP, <img> bien escrito y next/image'
description: 'Cómo optimizar imágenes desde el HTML básico hasta Next.js, con ejemplos que puedes probar.'
date: 2026-11-24
series: html
tags: [HTML, Rendimiento, WebP, Next.js]
draft: true
# youtube: ID_DEL_VIDEO
---

> **Borrador.** Completa los datos entre [corchetes] antes de publicarlo.

Las imágenes suelen ser lo que más pesa en una página. En mi portfolio, las capturas de los proyectos hacían que todo cargara lento en el celular. [Cuenta aquí cuánto pesaban y cómo lo mediste.]

Te cuento cómo lo solucioné en tres pasos: el **formato**, la etiqueta **`<img>`** y, si usas Next.js, su componente **`Image`**.

## Dos siglas que vas a escuchar mucho

- **LCP**: cuánto tarda en aparecer lo más grande de la pantalla, casi siempre una imagen. Lo ideal es menos de 2,5 segundos.
- **CLS**: cuánto "salta" la página mientras carga. ¿Vas a tocar un botón y se mueve porque apareció una imagen? Eso es CLS.

Puedes medir los dos gratis con **Lighthouse**: en Chrome, clic derecho → Inspeccionar → pestaña *Lighthouse*.

## 1. Usa WebP

WebP pesa bastante menos que JPG o PNG con una calidad parecida, y lo soportan todos los navegadores modernos. Mi regla: **fotos y capturas en WebP, iconos en SVG**.

Para convertir pocas imágenes, usa [Squoosh](https://squoosh.app), una web gratuita de Google. Arrastras tu imagen, eliges **WebP** en el panel de la derecha, mueves la calidad (75–80 va bien) comparando con la línea del centro, y descargas. Todo pasa en tu navegador, no se sube nada.

Para convertir una carpeta entera, usa `cwebp` en la terminal:

```bash
for file in public/images/*.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

Recorre cada `.png`, lo convierte con calidad 80 y guarda `foto.webp` junto a `foto.png` (`${file%.png}` es el nombre sin la extensión). Primero instala `cwebp`: `brew install webp` en macOS, `sudo apt install webp` en Linux, o desde la [web de WebP](https://developers.google.com/speed/webp/download) en Windows. Ojo: es código de **bash**, así que en Windows ejecútalo en Git Bash o WSL, no en PowerShell.

## 2. Escribe bien el `<img>`

Tener WebP es la mitad del trabajo. La otra mitad es cómo lo pones en el HTML:

```html playground=img
<img
  src="https://placehold.co/640x400.webp"
  alt="Captura de la tienda online con la lista de productos"
  width="640"
  height="400"
  loading="lazy"
>
```

```css playground=img
img {
  max-width: 100%;
  height: auto;
}
```

- **`alt`**: lo leen los lectores de pantalla. Describe lo que la imagen comunica, no pongas "imagen".
- **`width` y `height`**: el navegador reserva el espacio antes de descargarla y la página no salta (adiós CLS). El CSS de abajo hace que igual se adapte a la pantalla.
- **`loading="lazy"`**: la descarga solo cuando el usuario se acerca a ella. Úsalo en las imágenes de abajo, **nunca en la principal**.

Y si necesitas un respaldo para navegadores muy antiguos, `<picture>` deja que el navegador elija el primer formato que entienda:

```html playground=picture
<picture>
  <source srcset="https://placehold.co/640x400.webp?text=WebP" type="image/webp">
  <img src="https://placehold.co/640x400.jpg?text=JPG" alt="Captura de la tienda online" width="640" height="400">
</picture>
```

En el playground verás "WebP". Borra la línea del `<source>` y verás "JPG".

## 3. Si usas Next.js: `next/image`

El componente `Image` hace por ti todo lo anterior: te pide `width` y `height`, carga en diferido por defecto y genera tamaños para cada pantalla.

```jsx
<Image src="/images/proyecto.webp" alt="Captura de la tienda online" width={640} height={400} />
```

Como todo carga en diferido, la imagen principal de arriba también esperaría. Para ella existe `priority`: la descarga de inmediato, la precarga en el `<head>` y le da prioridad alta.

```jsx
<Image src="/me.webp" alt="Foto de Victor Villazón" width={300} height={300} priority />
```

Si usas **Next.js 16 o superior**, `priority` está deprecado: usa `preload`, que hace lo mismo. Y la propia documentación dice que muchas veces basta con `loading="eager"` o `fetchPriority="high"`, que son los mismos atributos del `<img>` de HTML. Por eso conviene aprender primero lo básico.

## Mis resultados

| Métrica | Antes | Después |
| --- | --- | --- |
| Peso de imágenes | [X] KB | [Y] KB |
| LCP en móvil | [X] s | [Y] s |

## Errores que yo también cometí

- **Olvidar `width` y `height`**, y que la página salte.
- **Poner `loading="lazy"` o no poner `priority` en la imagen principal**, justo la que el usuario ve primero.
- **Marcar todo como prioritario.** Si todo es prioritario, nada lo es.

## Tu turno

Mide una página tuya con Lighthouse, convierte sus imágenes con Squoosh, revisa que cada `<img>` tenga `alt`, `width` y `height`, y vuelve a medir. Te va a sorprender la diferencia.
