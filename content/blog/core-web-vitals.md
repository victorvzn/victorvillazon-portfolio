---
title: 'Core Web Vitals: LCP, INP y CLS explicados para frontend'
description: 'Las tres métricas con las que Google mide si tu web es rápida y estable: qué significan, cómo medirlas con Lighthouse y PageSpeed Insights y los arreglos que más mejoran cada una.'
date: 2026-11-26
series: html
tags: [SEO, Rendimiento, Herramientas]
draft: true
---

"Mi web va rápida." ¿Rápida cómo? ¿En tu ordenador con fibra, o en un móvil de gama media con 4G? Para no depender de impresiones, Google mide la experiencia de carga con tres números: las **Core Web Vitals** (métricas web esenciales).

Le importan a Google porque forman parte de cómo posiciona las páginas. Pero, sobre todo, le importan **a tus usuarios**: una web que tarda, que no responde o en la que los botones se mueven mientras intentas pulsarlos se abandona.

## Las tres métricas

| Métrica | Mide | Pregunta que responde | Bueno |
| --- | --- | --- | --- |
| **LCP** | Carga | ¿Cuánto tarda en verse lo principal? | ≤ 2,5 s |
| **INP** | Interactividad | ¿Cuánto tarda en reaccionar cuando hago clic? | ≤ 200 ms |
| **CLS** | Estabilidad | ¿Se mueven las cosas mientras carga? | ≤ 0,1 |

Google considera que una página "pasa" si el 75 % de las visitas cumplen los tres.

## LCP: lo principal tarda en aparecer

**LCP** (*Largest Contentful Paint*) es el tiempo que tarda en pintarse **el elemento más grande** que se ve al cargar: normalmente, la imagen principal (*hero*) o el título grande.

Lo que más lo empeora y cómo arreglarlo (casi todo lo vimos en el post de rendimiento de imágenes):

- **Imágenes pesadas.** Usa **WebP** o AVIF, con el tamaño adecuado (`srcset`). Una foto de 4000 px para mostrarla a 800 px es tiempo perdido.
- **`loading="lazy"` en la imagen principal.** El *lazy loading* retrasa la carga hasta que la imagen va a verse... y la principal **ya se ve**. Ponlo en las imágenes de abajo, nunca en la primera.
- **La imagen principal se descubre tarde** (por ejemplo, si es un `background-image` en CSS o la pone JavaScript). Usa un `<img>` en el HTML y, si quieres, dale prioridad:

```html
<img src="hero.webp" alt="..." width="1200" height="600" fetchpriority="high">
```

- **Fuentes que bloquean el texto.** Con `font-display: swap` el texto aparece enseguida con una fuente del sistema y se cambia al cargar la tuya.
- **Mucho JavaScript antes de pintar** (típico de una app de React que lo pinta todo en el navegador). Enviar el HTML ya hecho desde el servidor mejora mucho el LCP (lo vemos en el post de SEO en apps de React).

## INP: la página tarda en reaccionar

**INP** (*Interaction to Next Paint*) mide cuánto tarda la página en **responder visualmente** cuando el usuario hace clic, toca o pulsa una tecla. Si pulsas un botón y durante medio segundo no pasa nada, el INP es malo.

¿Recuerdas el post del event loop? Mientras JavaScript ejecuta algo largo, **la pila está ocupada** y el navegador no puede atender el clic ni repintar. Eso es exactamente lo que mide el INP.

Cómo mejorarlo:

- **Evita tareas largas** en los manejadores de eventos: si un clic tiene que procesar mucho, muestra primero una respuesta (un "Cargando...") y haz el trabajo pesado después.
- **Menos JavaScript**: cada librería que añades hay que descargarla, leerla y ejecutarla. Revisa si de verdad la necesitas.
- **Debounce y throttle** en eventos que se disparan mucho, como `input`, `scroll` o `resize` (tienen sus pruebas técnicas).
- **No repintes de más**: cambiar el DOM de cientos de elementos en cada tecla es lento.

## CLS: las cosas se mueven

**CLS** (*Cumulative Layout Shift*) mide **cuánto se mueve el contenido** de forma inesperada mientras carga. Lo has sufrido: vas a pulsar un enlace, carga una imagen encima, todo baja y pulsas otra cosa.

Las causas y arreglos más comunes:

- **Imágenes sin `width` y `height`.** El navegador no sabe cuánto ocupan hasta que cargan, y empujan todo hacia abajo. Ponles siempre su ancho y alto en el HTML (o un `aspect-ratio` en el CSS): el navegador reserva el hueco desde el principio.
- **Anuncios, banners o avisos de cookies que se insertan arriba** del contenido después de cargar. Resérvales su espacio o muéstralos por encima (fijos), sin empujar.
- **Fuentes que cambian de tamaño** al cargar. Elige una fuente de respaldo de tamaño parecido.
- **Contenido que llega de una API** y aparece encima del que ya estaba. Reserva el espacio con un esqueleto (lo vimos en el post de estados de carga).

Los movimientos que **provoca el usuario** (abrir un acordeón al hacer clic) no cuentan: solo los inesperados.

## Cómo medirlas

### 1. Lighthouse, en las DevTools

1. Abre tu web en Chrome, en una **ventana de incógnito** (para que las extensiones no afecten).
2. DevTools → pestaña **Lighthouse**.
3. Elige **Mobile** (Google te mide como móvil) y marca **Performance**.
4. Pulsa **Analyze page load**.

Te da una puntuación de 0 a 100, el valor de LCP y CLS, y una lista de **oportunidades** ordenadas por lo que más ganarías. El INP no puede medirlo en un análisis de carga, porque nadie hace clic; en su lugar muestra el **TBT** (*Total Blocking Time*), que está muy relacionado.

### 2. PageSpeed Insights

[pagespeed.web.dev](https://pagespeed.web.dev): pega la URL de tu web publicada. Además del análisis de Lighthouse, si tu web tiene suficientes visitas, muestra los **datos reales** de usuarios de Chrome durante los últimos 28 días. Esos datos reales (*field data*) son los que usa Google, y valen más que una prueba en tu ordenador (*lab data*).

### 3. Search Console

En **Google Search Console** (tiene su post), el informe **Métricas web principales** te dice qué páginas de tu web tienen problemas, con datos reales.

### 4. En tiempo real

En la pestaña **Performance** de las DevTools de Chrome verás el LCP, el CLS y el INP mientras usas la página: haz clic en tus botones y mira el INP de cada interacción.

## No te obsesiones con el 100

Una puntuación de Lighthouse de 90 o más está muy bien. Pasar de 95 a 100 no cambia nada para tus usuarios. Lo importante es que las tres métricas estén **en verde** con datos reales, y que la web **se sienta** rápida en un móvil normal.

## Tu turno

1. Pasa Lighthouse (modo móvil) a tu portafolio y apunta las tres primeras oportunidades.
2. Revisa que **todas** tus imágenes tienen `width` y `height` y que la principal **no** tiene `loading="lazy"`.
3. Vuelve a medir y compara.

## Errores comunes

- **Medir solo en tu ordenador** con buena conexión. Mide en modo móvil y fíjate en los datos reales.
- **`loading="lazy"` en la imagen principal.** Empeora el LCP.
- **Imágenes sin dimensiones.** La causa número uno del CLS.
- **Añadir librerías "por si acaso".** Cada kilobyte de JavaScript cuenta.
- **Medir con extensiones del navegador activadas.** Usa una ventana de incógnito.

## Para profundizar

- [Core Web Vitals en web.dev](https://web.dev/articles/vitals?hl=es)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Optimizar el LCP en web.dev](https://web.dev/articles/optimize-lcp?hl=es)

En resumen: Google mide la experiencia con **LCP** (lo principal se ve en menos de 2,5 s), **INP** (la página responde en menos de 200 ms) y **CLS** (nada se mueve, menos de 0,1). Mejóralas con **imágenes ligeras y con dimensiones**, **sin lazy en la principal**, **menos JavaScript** y **espacio reservado** para lo que carga después. Mídelas con **Lighthouse** y **PageSpeed Insights**, y fíjate en los datos reales.
