---
title: 'Webs en varios idiomas: hreflang, URLs por idioma y redirecciones'
description: 'Cómo organizar una web en español e inglés para que Google muestre a cada persona su versión: una URL por idioma, las etiquetas hreflang, x-default y por qué no redirigir a los bots.'
date: 2026-11-26
series: html
tags: [SEO, HTML, Internacionalización]
draft: true
---

Tu portafolio está en español, pero quieres optar a trabajos en el extranjero, así que haces una versión en inglés. Muy bien. Ahora, ¿cómo consigues que alguien que busca en inglés vea la versión en inglés, y alguien de Lima, la española? ¿Y que Google no las trate como páginas duplicadas?

Las piezas son tres: **una URL por idioma**, las etiquetas **`hreflang`** y **no redirigir a ciegas**. Este mismo sitio está en español e inglés y usa las tres, así que verás ejemplos reales.

> A traducir una web se le llama **internacionalización** (se abrevia **i18n**: una "i", 18 letras y una "n").

## Pieza 1: una URL para cada idioma

Cada versión necesita **su propia dirección**. Las tres formas más habituales:

| Estructura | Ejemplo | Comentario |
| --- | --- | --- |
| **Subcarpeta** | `misitio.com/en/proyectos` | La más sencilla y la más usada. Un solo dominio |
| **Subdominio** | `en.misitio.com/proyectos` | Más configuración |
| **Dominio por país** | `misitio.pe`, `misitio.com.mx` | Para empresas que operan por país |

Este blog usa **subcarpetas**: el español va sin prefijo (`/blog`) y el inglés con `/en` (`/en/blog`).

Lo que **no** debes hacer es tener **la misma URL** que muestra un idioma u otro según quién la visite (por cookies o por el idioma del navegador). Google rastrea casi siempre desde Estados Unidos y sin cookies: solo vería una de las versiones, y la otra no existiría para él.

## Pieza 2: `hreflang`, el mapa de versiones

En el `<head>` de cada página, le dices a Google **qué otras versiones existen** y en qué idioma están:

```html
<!-- En https://www.misitio.com/proyectos (español) -->
<link rel="alternate" hreflang="es" href="https://www.misitio.com/proyectos">
<link rel="alternate" hreflang="en" href="https://www.misitio.com/en/proyectos">
<link rel="alternate" hreflang="x-default" href="https://www.misitio.com/proyectos">
```

Las reglas que más se olvidan:

1. **Todas las versiones llevan la lista completa**, incluida **ella misma**. La página en inglés tiene exactamente las mismas tres líneas.
2. **Tienen que ser recíprocas**: si la española dice que existe una inglesa, la inglesa tiene que decir que existe la española. Si no, Google ignora la relación.
3. **URL absolutas**, en su versión definitiva (con `https` y con o sin `www`, la que elegiste, como vimos en el post de canónicas).

### Los códigos

- **Idioma**: dos letras, según el estándar ISO 639-1: `es`, `en`, `pt`, `fr`...
- **Idioma + país** (opcional): `es-PE`, `es-MX`, `es-ES`, `en-US`, `en-GB`. Solo tiene sentido si tienes **versiones distintas por país** (precios en soles y en pesos, por ejemplo). Si tu español es el mismo para todos, usa solo `es`.
- **`x-default`**: la versión para **todos los demás**: alguien cuyo idioma no tienes (un usuario en alemán, por ejemplo). Suele ser la versión principal o una página para elegir idioma.

### Y la canónica, ¿cómo encaja?

Cada idioma es **su propia canónica**: la página en inglés tiene `<link rel="canonical" href=".../en/proyectos">`, no la española. Las traducciones **no son duplicados**: son páginas distintas relacionadas con `hreflang`. Un error típico es poner en todas las versiones la canónica de la española, y la inglesa desaparece de Google.

### En el sitemap también se puede

En vez de (o además de) las etiquetas, puedes declarar las versiones en el sitemap con `xhtml:link`. Este blog lo hace así para su portada:

```xml
<url>
  <loc>https://www.victorvillazon.com/</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://www.victorvillazon.com/"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://www.victorvillazon.com/en"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://www.victorvillazon.com/"/>
</url>
```

(El `<urlset>` necesita declarar el espacio de nombres `xmlns:xhtml="http://www.w3.org/1999/xhtml"` para que esto funcione).

### Páginas que solo existen en un idioma

No todo tiene por qué estar traducido. Los artículos de este blog, por ejemplo, solo están en español: esas páginas **no llevan `hreflang`** (no hay otra versión a la que apuntar) y su canónica es la española. Pon `hreflang` solo donde exista la traducción de verdad.

## Pieza 3: redirigir por idioma, con cuidado

Es tentador detectar el idioma del visitante y redirigirlo automáticamente. Se puede, pero con dos reglas:

1. **Que el usuario pueda elegir siempre**, con un selector de idioma visible, y que su elección **se recuerde** (por ejemplo, en una cookie). Que alguien de Perú quiera leer en inglés es perfectamente normal.
2. **Nunca redirijas a los buscadores.** Si Googlebot entra en tu portada en español y lo mandas a `/en`, nunca verá la versión española. Las versiones las descubre por los **enlaces y el `hreflang`**, no por redirecciones.

Este sitio hace exactamente eso en su portada:

- Si ya elegiste un idioma con el selector, se respeta tu elección.
- Si eres un **bot** (se detecta por el *User-Agent*), ves siempre la versión por defecto.
- Si no, decide según el país desde el que entras.
- Y solo se decide en la portada: si entras directamente a una página en inglés, se respeta.

## Un detalle: `lang` en cada versión

Recuerda cambiar el atributo `lang` del `<html>` en cada idioma (`<html lang="en">` en la versión inglesa). Lo usan los lectores de pantalla para pronunciar bien, como vimos en el post de la anatomía de un documento HTML. Y si compartes la página en redes, también la etiqueta `og:locale` (post de Open Graph).

## Cómo comprobarlo

- **Inspecciona el `<head>`** de las dos versiones y comprueba que las etiquetas son idénticas y recíprocas.
- Hay validadores de `hreflang` gratuitos en línea (busca "hreflang checker").
- En **Search Console** (tiene su post), la **Inspección de URLs** te dice qué canónica eligió Google para cada versión.

## Tu turno

Si tu portafolio tiene (o va a tener) versión en inglés:

1. Decide la estructura (recomendado: `/en/` en subcarpeta).
2. Añade en el `<head>` de cada página las tres etiquetas `hreflang` (`es`, `en` y `x-default`), idénticas en las dos versiones.
3. Comprueba que cada versión tiene **su propia canónica** y su `lang` correcto.
4. Añade un selector de idioma con enlaces normales (`<a href="/en">English</a>`).

## Errores comunes

- **La misma URL para los dos idiomas**, cambiando según el navegador o una cookie.
- **`hreflang` no recíproco**: solo una versión apunta a la otra.
- **Olvidar la autorreferencia**: cada página también debe listarse a sí misma.
- **Canónica de la versión española en la inglesa.** Cada idioma, su canónica.
- **Redirigir a los bots** por idioma o país.
- **Códigos mal escritos**: `es_PE` (con guion bajo) es para `og:locale`; en `hreflang` va con guion: `es-PE`. Y `en-UK` no existe: es `en-GB`.
- **Traducir con un traductor automático sin revisar.** Google lo detecta, y tus visitantes también.

## Para profundizar

- [Versiones localizadas de tu página (Google)](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=es)
- [Gestión de sitios multirregionales y multilingües (Google)](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites?hl=es)

En resumen: dale a **cada idioma su propia URL** (mejor en subcarpeta, como `/en/`), declara las versiones con **`hreflang`** en todas ellas (recíproco, con autorreferencia y un **`x-default`**), deja que **cada idioma tenga su propia canónica** y, si rediriges por idioma, hazlo solo para personas, con un **selector** visible y **nunca para los buscadores**.
