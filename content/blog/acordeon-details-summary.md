---
title: 'Un acordeón en 5 líneas con details y summary'
description: 'Preguntas frecuentes que se abren y cierran solas, accesibles y sin JavaScript, con las etiquetas details y summary.'
date: 2026-11-25
series: html
tags: [HTML, CSS, Accesibilidad]
draft: true
order: 4
---

¿Has visto esas secciones de "Preguntas frecuentes" donde haces clic en una pregunta y se despliega la respuesta? Eso se llama **acordeón**, y HTML lo trae de serie con dos etiquetas: `<details>` y `<summary>`.

## Lo mínimo

`<summary>` es lo que siempre se ve (la pregunta). Todo lo demás dentro de `<details>` se oculta hasta que haces clic.

```html playground=basico
<details>
  <summary>¿Hacen envíos a todo el país?</summary>
  <p>Sí, llegamos a todas las regiones en 2 a 5 días hábiles.</p>
</details>
```

```css playground=basico
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}
```

Sin JavaScript, funciona con el teclado (`Tab` y `Enter`) y los lectores de pantalla anuncian si está abierto o cerrado. Gratis.

## Abierto desde el inicio

Si quieres que una pregunta empiece abierta, agrégale el atributo `open`:

```html
<details open>
  <summary>¿Cuánto cuesta el envío?</summary>
  <p>Es gratis en compras mayores a S/ 100.</p>
</details>
```

## Un FAQ con estilo

Vamos a quitar el triángulo por defecto y poner un `+` que gira al abrir:

```html playground=faq
<section class="faq">
  <details>
    <summary>¿Hacen envíos a todo el país?</summary>
    <p>Sí, llegamos a todas las regiones en 2 a 5 días hábiles.</p>
  </details>
  <details>
    <summary>¿Puedo devolver un producto?</summary>
    <p>Tienes 30 días para devolverlo sin dar explicaciones.</p>
  </details>
  <details>
    <summary>¿Qué métodos de pago aceptan?</summary>
    <p>Tarjetas, transferencias y billeteras digitales.</p>
  </details>
</section>
```

```css playground=faq
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  background: #f4f4f5;
}

.faq {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq details {
  padding: 16px;
  border-radius: 12px;
  background: white;
}

.faq summary {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  cursor: pointer;
  list-style: none; /* quita el triángulo */
}

.faq summary::-webkit-details-marker {
  display: none; /* quita el triángulo en Safari */
}

.faq summary::after {
  content: '+';
  transition: rotate 0.2s;
}

/* Cuando está abierto, el + gira y parece una x */
.faq details[open] summary::after {
  rotate: 45deg;
}

.faq p {
  margin: 12px 0 0;
  color: #52525b;
}
```

El truco es el selector `details[open]`: el navegador le pone el atributo `open` cuando lo despliegas, y tú lo usas para cambiar los estilos.

## Que solo se abra uno a la vez

Dale el mismo `name` a todos los `<details>` y, al abrir uno, el resto se cierra solo. Como los radio buttons.

```html playground=exclusivo
<details name="faq">
  <summary>Plan Básico</summary>
  <p>1 proyecto y soporte por email.</p>
</details>
<details name="faq">
  <summary>Plan Pro</summary>
  <p>Proyectos ilimitados y soporte prioritario.</p>
</details>
<details name="faq">
  <summary>Plan Empresa</summary>
  <p>Todo lo anterior más un gerente de cuenta.</p>
</details>
```

```css playground=exclusivo
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

details {
  padding: 8px 0;
  border-bottom: 1px solid #e4e4e7;
}

summary {
  cursor: pointer;
  font-weight: 600;
}
```

## Errores comunes

- **Poner `<summary>` fuera de `<details>` o no ponerlo primero.** Tiene que ser el primer hijo.
- **Meter un botón o un enlace dentro de `<summary>`.** Se confunden los clics. Deja el `<summary>` solo con texto.
- **Usarlo para ocultar información importante.** Lo que está cerrado, mucha gente no lo abre. Úsalo para detalles, no para lo esencial.

## Para profundizar

- [`<details>` en MDN](https://developer.mozilla.org/es/docs/Web/HTML/Element/details)
- [`<summary>` en MDN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary)

En resumen: **`<details>`** es la caja que se abre, **`<summary>`** es el título que siempre se ve, y con **`name`** consigues que solo haya uno abierto.
