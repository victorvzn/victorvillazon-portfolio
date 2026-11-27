---
title: 'URL canónica y redirecciones: una sola dirección para cada página'
description: 'Por qué con www, sin www, http y https son páginas distintas para Google, qué es la etiqueta canonical, cuándo usar una redirección 301, 308 o 302 y cómo configurarlo en Vercel o Netlify.'
date: 2026-11-26
series: html
tags: [SEO, HTML, HTTP]
draft: true
---

Para ti, estas cuatro direcciones son "tu web":

```bash
http://anatorres.dev
https://anatorres.dev
http://www.anatorres.dev
https://www.anatorres.dev
```

Para Google, son **cuatro páginas distintas con el mismo contenido**. Y cuando encuentra contenido duplicado, tiene que adivinar cuál mostrar, reparte entre ellas los "votos" de los enlaces que recibes y puede elegir la que no querías.

La solución tiene dos piezas: **redirecciones** (para que todas acaben en una sola dirección) y la **URL canónica** (para decir cuál es la oficial).

## Las causas típicas de contenido duplicado

- **`www` y sin `www`**, **`http` y `https`**.
- **La barra final**: `/blog` y `/blog/`.
- **Parámetros en la URL**: `/productos?orden=precio`, `/productos?utm_source=linkedin` (los parámetros de campañas). Mismo contenido, otra URL.
- **Mayúsculas**: `/Contacto` y `/contacto`.
- **El dominio del hosting**: tu web también responde en `mi-proyecto.vercel.app`.

## Pieza 1: elige tu URL "definitiva"

Decide **una** forma y úsala siempre:

- **`https`**: siempre. No hay discusión.
- **Con `www` o sin `www`**: da igual cuál, pero elige una. Este blog, por ejemplo, usa `https://www.victorvillazon.com`: quien entra sin `www` es redirigido.
- **Con barra final o sin ella**: elige una (la mayoría de frameworks ya lo hacen por ti de forma consistente).

## Pieza 2: las redirecciones

Una **redirección** es una respuesta del servidor que dice: "esto ya no está aquí, ve a esta otra dirección". El navegador va solo a la nueva, y Google entiende que **la nueva es la buena** y le pasa la "fuerza" de la vieja.

Se indican con un **código de estado HTTP** (los vimos en el post de HTTP y APIs):

| Código | Significa | Úsalo para |
| --- | --- | --- |
| **301** | Movido **permanentemente** | Cambios definitivos: de dominio, de `http` a `https`, una página que cambió de URL |
| **308** | Permanente (y no cambia el método HTTP) | Lo mismo que 301; es lo que usan Vercel y Next.js |
| **302** | Movido **temporalmente** | Algo provisional: una página en mantenimiento, una campaña |
| **307** | Temporal (y no cambia el método) | Lo mismo que 302, más moderno |

Para el SEO, lo importante es: **permanente (301/308) si el cambio es para siempre**. Con un 302, Google sigue considerando la URL vieja como la buena.

Puedes ver la redirección en las DevTools: pestaña **Network**, recarga `http://tudominio.com` y verás la primera petición con un `308` o `301` y la cabecera `Location` con la nueva dirección.

### Configurarlas en tu hosting

**Vercel**: en el panel del proyecto → **Settings → Domains**, añade los dos dominios (`anatorres.dev` y `www.anatorres.dev`) y marca uno para que **redirija** al otro. Vercel ya redirige `http` a `https` solo. Para redirigir páginas concretas, en un archivo `vercel.json`:

```json
{
  "redirects": [
    { "source": "/proyectos-viejos", "destination": "/proyectos", "permanent": true }
  ]
}
```

**Netlify**: un archivo `_redirects` en la carpeta que publicas:

```bash
/proyectos-viejos   /proyectos   301
```

**Next.js**: en `next.config.js`, la opción `redirects()`.

### Cuando cambias la URL de una página

Si renombras `/blog/mi-post` a `/blog/mi-post-mejorado`, **pon una redirección permanente** de la vieja a la nueva. Si no, todos los enlaces que la gente compartió dan un 404 y pierdes lo que la página había ganado en Google.

## Pieza 3: la URL canónica

Las redirecciones arreglan `www` y `https`. Pero hay duplicados que **no se pueden redirigir**: un `/productos?orden=precio` tiene que seguir funcionando, porque el usuario eligió ordenar por precio.

Para esos casos está la etiqueta **canónica**: en el `<head>`, le dices a Google cuál es la versión **oficial** de la página:

```html
<link rel="canonical" href="https://anatorres.dev/productos">
```

Si esta etiqueta está en `/productos`, en `/productos?orden=precio` y en `/productos?utm_source=linkedin`, Google entiende que las tres son la misma, y muestra y "premia" solo la canónica.

Las reglas:

- **URL absoluta**, con `https://` y la versión definitiva (con o sin `www`, la que elegiste).
- **Cada página apunta a sí misma** (se llama canónica autorreferenciada). Pon la canónica en **todas** tus páginas, no solo en las que tienen duplicados: así cubres los parámetros que no habías previsto.
- **Que no apunte a una redirección.** Si tu web redirige a `www`, la canónica tiene que llevar `www`. Por eso en el código de este blog hay un comentario que dice justo eso, junto a la constante con la URL del sitio.
- **Coherente con el resto**: la misma URL en la canónica, en el `og:url` (del post de Open Graph) y en el sitemap.

Es una **sugerencia**, no una orden: Google suele respetarla, pero si las señales se contradicen (la canónica dice una cosa y el sitemap otra), decide por su cuenta.

## Generarla bien en tu código

Si tu web tiene muchas páginas, no escribas la canónica a mano en cada una. Ten **una constante** con la URL del sitio y calcula la canónica a partir de la ruta:

```js
const SITE_URL = 'https://www.anatorres.dev' // la versión definitiva, sin barra final

const canonica = (ruta) => `${SITE_URL}${ruta}`

canonica('/proyectos/tareas') // 'https://www.anatorres.dev/proyectos/tareas'
```

Fíjate en que se construye **con la ruta, sin los parámetros**: así todas las variantes con `?orden=` o `?utm_` apuntan a la misma canónica.

## ¿Y el dominio de `vercel.app`?

Tu proyecto sigue respondiendo en `mi-proyecto.vercel.app` aunque tengas dominio propio. Con la **canónica** apuntando a tu dominio, Google entiende cuál es el bueno. En Vercel también puedes hacer que ese dominio redirija al tuyo.

## Tu turno

1. Abre tu portafolio en las cuatro variantes (`http`/`https`, con y sin `www`). ¿Todas acaban en la misma dirección? Míralo en la pestaña Network.
2. Añade una etiqueta canónica a cada página.
3. Inspecciona el `<head>` de tu web favorita y busca su `rel="canonical"`. ¿Lleva `www`? ¿Coincide con la URL de la barra del navegador?

## Errores comunes

- **No elegir entre `www` y sin `www`**, y que las dos respondan sin redirigir.
- **Redirecciones temporales (302) para cambios definitivos.**
- **Cambiar la URL de una página sin redirigir la vieja.** Enlaces rotos y posicionamiento perdido.
- **Canónicas relativas** (`/productos`) o que apuntan a una URL que redirige.
- **Copiar la misma canónica en todas las páginas** (por ejemplo, la de la portada). Le estás diciendo a Google que todas tus páginas son la portada, y las demás desaparecen de los resultados.
- **Cadenas de redirecciones**: A → B → C. Redirige directamente de A a C.

## Para profundizar

- [Consolidar URL duplicadas (Google)](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=es)
- [Redirecciones y la Búsqueda de Google](https://developers.google.com/search/docs/crawling-indexing/301-redirects?hl=es)
- [Códigos de estado de redirección en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Guides/Redirections)

En resumen: para Google, cada variante de una URL es una página distinta. Elige **una dirección definitiva** (`https`, con o sin `www`), haz que las demás **redirijan** de forma **permanente** (301 o 308) y pon en cada página una **etiqueta canónica absoluta** que apunte a su versión oficial. Y si cambias una URL, **redirige siempre la vieja**.
