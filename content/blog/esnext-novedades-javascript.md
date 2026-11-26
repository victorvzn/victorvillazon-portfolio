---
title: 'ESNext: cómo enterarte de lo nuevo de JavaScript (y saber si ya puedes usarlo)'
description: 'Cada año JavaScript estrena funciones nuevas. Qué es ESNext, quién decide las novedades y cómo comprobar si puedes usarlas en tu proyecto.'
date: 2026-11-26
series: javascript
tags: [JavaScript, ESNext]
draft: true
---

Seguramente has visto nombres como **ES6**, **ES2023** o **ESNext** y no sabes muy bien qué significan. Este post lo explica y abre una serie sobre novedades de JavaScript que **sí vas a usar en un trabajo**, no solo en demos.

## ECMAScript, ES6 y ESNext

- **ECMAScript** (ES) es el nombre oficial del estándar que define cómo funciona JavaScript. JavaScript es la implementación que usan los navegadores y Node.
- **ES6** (o ES2015) fue la gran actualización: `let`, `const`, arrow functions, clases, promesas... Desde entonces sale **una versión cada año**: ES2016, ES2017... hasta hoy.
- **ESNext** no es una versión concreta: es una forma de decir "lo más nuevo", lo que acaba de salir o está a punto de salir.

## Quién decide qué entra: el TC39

Las novedades las decide un comité llamado **TC39**, con gente de Google, Mozilla, Apple, Microsoft y otras empresas. Cada propuesta pasa por **etapas** (*stages*):

| Etapa | Qué significa |
| --- | --- |
| 0-1 | Es una idea. Puede cambiar o desaparecer. |
| 2 | El diseño está bastante definido, pero aún cambia. |
| 3 | Está casi terminada; los navegadores empiezan a implementarla. |
| 4 | Terminada. Entra en la siguiente versión anual. |

Regla para el trabajo: **en producción, usa solo lo que está en etapa 4** y ya funciona en los navegadores de tus usuarios.

## ¿Puedo usarlo ya? Tres comprobaciones

**1. Mira la tabla de compatibilidad en MDN.** Al final de cada página de MDN hay una tabla con qué navegadores lo soportan. Muchas páginas también llevan una etiqueta **Baseline**: si pone "Widely available", funciona en todos los navegadores modernos desde hace tiempo.

**2. Busca en [caniuse.com](https://caniuse.com).** Te dice el porcentaje de usuarios que lo soportan.

**3. Pregunta en tu equipo qué navegadores soportáis.** Una web interna de empresa donde todos usan Chrome actualizado no es lo mismo que una tienda online para todo el público.

## Si no está soportado: transpilar o usar un polyfill

Aquí hay una diferencia que conviene entender:

- **Sintaxis nueva** (por ejemplo `?.` o `#privado` en clases): el navegador viejo ni siquiera entiende el código. La solución es **transpilar**: herramientas como Babel o SWC (que ya vienen dentro de Next.js o Vite) reescriben tu código en JavaScript antiguo.
- **Funciones nuevas** (por ejemplo `Object.groupBy`): el código se entiende, pero la función no existe. La solución es un **polyfill**: código que crea esa función si falta. La librería más usada es `core-js`.

También puedes comprobarlo tú mismo en el código:

```js playground=deteccion
if (typeof Object.groupBy === 'function') {
  console.log('✅ Object.groupBy está disponible')
} else {
  console.log('❌ Este navegador no tiene Object.groupBy')
}

console.log('Set.prototype.union:', typeof new Set().union === 'function')
console.log('Promise.withResolvers:', typeof Promise.withResolvers === 'function')
```

## Las novedades de esta serie

Todas están ya en el estándar y funcionan en los navegadores modernos. Las he elegido porque resuelven problemas que te vas a encontrar en un trabajo real:

| Novedad | Versión | Para qué la usarás |
| --- | --- | --- |
| `toSorted`, `toReversed`, `with`, `findLast` | ES2023 | Ordenar y editar listas sin romper el estado (React, Vue) |
| `Object.groupBy` | ES2024 | Agrupar datos de una API para un dashboard |
| `Promise.withResolvers` | ES2024 | Un modal de confirmación que se usa con `await` |
| `union`, `intersection`, `difference` en `Set` | ES2025 | Permisos, filtros y selecciones |
| Iterator helpers (`.take()`, `.filter()`...) | ES2025 | Procesar datos sin crear arrays intermedios |
| `Error` con `cause` | ES2022 | Errores que cuentan qué pasó de verdad |

## Para profundizar

- [Las propuestas terminadas del TC39 (en inglés)](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [Qué es Baseline (en inglés)](https://web.dev/baseline)

En resumen: **ESNext** es "lo último de JavaScript", lo decide el **TC39** por etapas y, antes de usar algo en el trabajo, compruebas el soporte en **MDN** o **caniuse**. Si falta, **transpilas** (sintaxis) o usas un **polyfill** (funciones).
