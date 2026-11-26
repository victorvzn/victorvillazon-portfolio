---
title: 'Las DevTools del navegador: la herramienta que más vas a usar'
description: 'Inspecciona y cambia el HTML y el CSS en vivo, lee los errores de la consola, revisa las peticiones de red y pausa tu JavaScript con breakpoints.'
date: 2026-11-26
series: carrera
tags: [Herramientas, Debugging, Fundamentos]
draft: true
---

Todos los navegadores traen escondida una caja de herramientas para programadores: las **DevTools** (herramientas de desarrollo). Con ellas puedes ver el código de cualquier web, cambiar su diseño en vivo, encontrar por qué falla tu JavaScript y ver qué datos pide a un servidor.

Si solo aprendes a usar bien una herramienta este mes, que sea esta.

## Cómo abrirlas

- **F12**, o
- **`Ctrl + Shift + I`** (en Mac, **`Cmd + Option + I`**), o
- Clic derecho sobre cualquier parte de la página → **Inspeccionar**.

Este post usa Chrome, pero Edge, Firefox y Safari tienen herramientas casi iguales. (En Safari hay que activarlas antes en Ajustes → Avanzado.)

## Elementos: el HTML y el CSS en vivo

La pestaña **Elementos** (*Elements*) muestra el HTML de la página tal como está **ahora mismo**, con los cambios que haya hecho JavaScript.

- Haz clic en el icono de la **flecha** (arriba a la izquierda, o `Ctrl + Shift + C`) y luego en cualquier parte de la página: te lleva a su HTML.
- Haz **doble clic** en un texto o un atributo para cambiarlo.
- A la derecha, en **Estilos** (*Styles*), ves el CSS que se le aplica a ese elemento. Puedes **cambiar valores**, **desactivar** reglas con la casilla o añadir propiedades nuevas.

Los cambios no se guardan en tus archivos: al recargar desaparecen. Es perfecto para **probar** cosas ("¿y si el padding fuera 24px?") antes de escribirlas en tu CSS.

Tres trucos que resuelven muchos problemas de CSS:

- **Una regla tachada** significa que otra regla la está pisando (por especificidad u orden). Te dice cuál gana.
- **La pestaña Calculado** (*Computed*) muestra el valor final de cada propiedad y el **modelo de caja** dibujado: contenido, padding, borde y margen con sus medidas.
- **Las etiquetas `flex` o `grid`** junto al HTML activan una superposición que dibuja las filas y columnas. Ideal para entender por qué algo no se alinea.

## Consola: los errores y tus pruebas

La pestaña **Consola** (*Console*) es donde aparecen:

- Los **errores** de tu JavaScript, en rojo, con el archivo y la **línea** exacta. Haz clic en el nombre del archivo y te lleva a esa línea.
- Los **avisos**, en amarillo.
- Lo que escribas con `console.log()`.

También puedes **escribir JavaScript** directamente ahí y ejecutarlo con Enter: es una calculadora y un laboratorio de pruebas. Prueba a escribir `document.title` en cualquier web.

Más allá de `console.log`, hay variantes muy útiles:

```js
console.log('Un mensaje normal')
console.warn('Un aviso: sale en amarillo')
console.error('Un error: sale en rojo')
console.table([{ nombre: 'Ana', nota: 18 }, { nombre: 'Luis', nota: 15 }]) // una tabla
console.log({ usuario, carrito }) // con llaves ves el nombre de cada variable
```

## Red: qué pide tu web al servidor

La pestaña **Red** (*Network*) muestra **cada archivo y cada petición** que hace la página: HTML, CSS, imágenes, fuentes y las llamadas a APIs con `fetch`.

Para verla bien, ábrela y **recarga la página**. Por cada petición verás:

- **El estado**: `200` todo bien, `404` no se encontró, `500` error del servidor.
- **El tipo** y **el tamaño**.
- **El tiempo** que tardó.

Haz clic en una petición para ver su detalle: lo que se envió (**Carga útil** o *Payload*) y lo que respondió el servidor (**Respuesta** o *Response*, o **Vista previa**, que lo muestra más ordenado).

Úsala cuando:

- **Tu CSS o una imagen no cargan.** Si sale un 404, la ruta está mal.
- **Un `fetch` no funciona.** Mira si la petición se hizo, qué código devolvió y qué datos llegaron.
- **La web va lenta.** Ordena por tamaño o tiempo y verás qué pesa más (casi siempre, las imágenes).

El filtro **Fetch/XHR** muestra solo las peticiones a APIs.

## Fuentes: pausa tu JavaScript con breakpoints

`console.log` está bien, pero a veces necesitas **detener** el código en una línea y ver qué valor tiene cada variable en ese momento. Para eso están los **breakpoints** (puntos de interrupción).

En la pestaña **Fuentes** (*Sources*):

1. Abre tu archivo `.js` en el panel de la izquierda.
2. Haz clic en el **número de una línea**: aparece una marca azul.
3. Haz lo que ejecuta ese código (por ejemplo, pulsar el botón).
4. El código **se pausa** en esa línea. Pasa el ratón por encima de las variables para ver su valor, o míralas en el panel **Alcance** (*Scope*).
5. Con los botones de arriba avanzas **línea a línea** (`F10`) o **continúas** (`F8`).

También puedes escribir la palabra **`debugger`** en tu código: cuando las DevTools están abiertas, el navegador se para ahí.

```js
function calcularTotal(carrito) {
  let total = 0
  for (const producto of carrito) {
    debugger // la ejecución se pausa aquí en cada vuelta
    total += producto.precio * producto.cantidad
  }
  return total
}
```

Acuérdate de **borrar el `debugger`** cuando termines.

## Modo dispositivo: prueba tu web en el móvil

El icono del **móvil y la tablet** (arriba a la izquierda, o `Ctrl + Shift + M`) simula pantallas de distintos tamaños. Elige un modelo de la lista o arrastra los bordes para ver cómo responde tu diseño y si tus media queries funcionan.

Es una simulación muy buena, pero no perfecta: antes de dar algo por terminado, ábrelo también en un móvil de verdad.

## Lighthouse: una auditoría automática

La pestaña **Lighthouse** analiza la página y te da una nota de 0 a 100 en rendimiento, accesibilidad, buenas prácticas y SEO, con una lista de cosas a mejorar. Es una forma excelente de aprender: cada aviso enlaza a una explicación.

## Errores comunes

- **Cambiar el CSS en las DevTools y olvidar copiarlo** a tu archivo. Al recargar, se pierde.
- **Ignorar la consola.** Si "no pasa nada" al pulsar un botón, el 90 % de las veces hay un error en rojo esperándote.
- **Mirar la pestaña Red sin recargar.** Solo registra las peticiones desde que la abriste.
- **Dejar `debugger` o decenas de `console.log`** en el código que publicas.

## Para profundizar

- [Documentación de Chrome DevTools (en inglés)](https://developer.chrome.com/docs/devtools)
- [Qué son las herramientas de desarrollo, en MDN](https://developer.mozilla.org/es/docs/Learn/Common_questions/Tools_and_setup/What_are_browser_developer_tools)

En resumen: **Elementos** para ver y probar HTML y CSS en vivo, **Consola** para los errores y tus pruebas, **Red** para las peticiones, **Fuentes** para pausar el código con **breakpoints** y el **modo dispositivo** para el móvil. Ábrelas siempre que programes.
