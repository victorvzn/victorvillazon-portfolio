---
title: 'Cómo escribir un buen alt (con ejemplos buenos y malos)'
description: 'El texto alternativo de las imágenes explicado como un juego: ¿qué alt le pondrías a cada imagen?'
date: 2026-11-25
series: html
tags: [HTML, Accesibilidad]
draft: true
order: 9
---

El atributo `alt` es el texto que reemplaza a una imagen cuando no se puede ver. Lo leen los lectores de pantalla, aparece si la imagen no carga y Google lo usa para entender de qué trata.

```html
<img src="perro.jpg" alt="Un golden retriever atrapando una pelota en la playa">
```

Parece fácil, pero escribir un **buen** `alt` tiene su truco. Vamos a jugar.

## La pregunta mágica

Antes de escribir un `alt`, pregúntate:

> Si le describiera esta página a alguien por teléfono, ¿qué le diría sobre esta imagen?

Lo que dirías es tu `alt`. Si no dirías nada, el `alt` va vacío.

## Juego: ¿qué alt le pondrías?

**1. La foto de un producto en una tienda.**

- ❌ `alt="imagen"` — no dice nada.
- ❌ `alt="zapatilla.jpg"` — es el nombre del archivo.
- ✅ `alt="Zapatilla running azul con suela blanca, vista lateral"`

En una tienda el usuario quiere saber **cómo es** el producto, así que describe lo que importa para comprar.

**2. El logo de tu empresa que lleva al inicio.**

- ❌ `alt="logo"`
- ✅ `alt="Inicio - Mi Tienda"`

Cuando una imagen es un enlace, el `alt` describe **a dónde lleva**, no cómo se ve.

**3. Una línea decorativa entre secciones.**

- ❌ `alt="línea decorativa ondulada"`
- ✅ `alt=""`

Si la imagen es **solo decoración**, el `alt` va vacío. Así el lector de pantalla la salta. Pero ojo: vacío no es lo mismo que no ponerlo. **Sin** `alt`, muchos lectores leen el nombre del archivo en voz alta.

**4. Un gráfico con las ventas del año.**

- ❌ `alt="gráfico"`
- ✅ `alt="Gráfico de barras: las ventas crecieron de 100 a 340 unidades entre enero y diciembre"`

En un gráfico, lo importante es **la conclusión**, no los colores de las barras.

**5. Una foto tuya en la sección "Sobre mí".**

- ❌ `alt="Foto de una persona sonriendo con camisa azul, fondo gris, luz natural"`
- ✅ `alt="Foto de Ana Torres"`

Sin pasarse. El contexto ya dice que es la sección sobre ti.

## Pruébalo: qué pasa cuando la imagen falla

```html playground=roto
<h2>Con alt</h2>
<img src="no-existe.jpg" alt="Zapatilla running azul con suela blanca" width="300" height="150">

<h2>Sin alt</h2>
<img src="no-existe.jpg" width="300" height="150">
```

```css playground=roto
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

img {
  display: block;
  border: 2px dashed #a1a1aa;
}
```

La primera imagen, aunque no cargue, sigue dando información. La segunda es un cuadro vacío.

## Errores comunes

- **Empezar con "Imagen de…" o "Foto de…".** El lector de pantalla ya anuncia que es una imagen. Excepción: cuando el tipo importa ("Captura de pantalla de…", "Ilustración de…").
- **Meter palabras clave para SEO.** `alt="zapatillas baratas zapatillas running ofertas"` es una mala experiencia y Google lo nota.
- **Repetir el texto que ya está al lado.** Si debajo de la foto pone "Ana Torres, CEO", el `alt` puede ser vacío o muy corto.

## Para profundizar

- [`<img>` y el atributo `alt` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Element/img#alt)
- [Árbol de decisión de `alt` (W3C, en inglés)](https://www.w3.org/WAI/tutorials/images/decision-tree/)

En resumen: el **`alt`** dice lo que la imagen **comunica**, no lo que muestra. Si es decorativa, **`alt=""`**. Y nunca lo omitas.
