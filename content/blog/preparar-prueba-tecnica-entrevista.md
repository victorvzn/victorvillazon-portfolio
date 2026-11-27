---
title: 'Cómo preparar una prueba técnica y una entrevista de frontend junior'
description: 'Los tipos de pruebas técnicas que te vas a encontrar, cómo resolverlas en voz alta, qué preguntas teóricas suelen hacer y qué hacer antes, durante y después.'
date: 2026-11-26
series: carrera
tags: [Carrera, Entrevistas, Pruebas técnicas]
draft: true
---

Te llaman para una entrevista de tu primer trabajo como frontend. Ilusión... y nervios. ¿Qué te van a preguntar? ¿Y si te quedas en blanco programando?

La buena noticia: los procesos para juniors se parecen mucho entre empresas. Si sabes qué esperar y lo practicas, los nervios bajan muchísimo. Vamos por partes.

## Las fases típicas de un proceso

1. **Entrevista inicial con RR. HH.** (20-30 min): quién eres, por qué te interesa el puesto, disponibilidad y expectativas salariales. No es técnica, pero sí eliminatoria.
2. **Prueba técnica**: alguno de los formatos que veremos abajo.
3. **Entrevista técnica** con alguien del equipo: preguntas de teoría y repaso de tu prueba o de tus proyectos.
4. **Entrevista final** con el responsable del equipo: encaje, motivación y cómo trabajas con otras personas.

No siempre están todas, pero esta es la estructura más común.

## Los cuatro tipos de prueba técnica

| Tipo | Cómo es | Cómo prepararlo |
| --- | --- | --- |
| **Ejercicio de lógica en vivo** | Resuelves un problema pequeño (anagramas, paréntesis...) compartiendo pantalla, con un tiempo de 20-45 min | Practica los ejercicios de la serie Ejercicios, con temporizador y **en voz alta** |
| **Maquetación** | Te dan un diseño y lo pasas a HTML y CSS | Practica pruebas de maquetación: tarjetas, navbar, formularios |
| **Prueba para casa** (*take-home*) | Un mini proyecto en 2-7 días: consumir una API, un listado con filtros... | Ten un proyecto base preparado y cuida el README |
| **Test online** | Preguntas tipo test o ejercicios en plataformas como HackerRank o Codility | Haz algunos ejercicios fáciles en esas plataformas para conocer el formato |

## Cómo resolver un ejercicio en vivo: el método en 5 pasos

En una prueba en vivo, **importa más cómo piensas que si llegas a la solución perfecta**. El entrevistador quiere ver cómo sería trabajar contigo. Usa siempre estos pasos:

1. **Repite el problema con tus palabras.** "Entonces, tengo que devolver `true` si las dos palabras tienen las mismas letras, ¿verdad?" Así compruebas que lo entendiste.
2. **Haz preguntas.** "¿Cuentan las mayúsculas? ¿Puede venir un texto vacío? ¿Me pueden pasar números?" Preguntar **no** es una debilidad: es lo que hace un profesional.
3. **Escribe ejemplos**, incluidos casos raros: texto vacío, un solo elemento, valores repetidos.
4. **Explica tu plan antes de programar.** "Voy a pasar los dos textos a minúsculas, ordenar sus letras y compararlos." Si el plan tiene un fallo, el entrevistador suele darte una pista aquí.
5. **Programa en voz alta y prueba.** Ejecuta tus ejemplos. Si algo falla, depura con `console.log` contando lo que haces.

¿Y si te bloqueas? **Dilo.** "Estoy atascado en cómo contar las letras. Se me ocurre usar un objeto, pero no sé si es lo mejor." Muchas veces el entrevistador te ayuda, y valoran que sepas pedir ayuda. Quedarte en silencio cinco minutos es lo peor que puedes hacer.

Primero haz que **funcione**, aunque no sea elegante. Si sobra tiempo, mejóralo y explica qué cambiarías.

## Las preguntas de teoría más habituales

Para un puesto de frontend junior, estas salen una y otra vez. Practica a responderlas **en voz alta**, en dos o tres frases y con un ejemplo:

**HTML**

- ¿Qué es el HTML semántico y por qué importa?
- ¿Para qué sirve el atributo `alt`?
- ¿Qué diferencia hay entre `<div>` y `<span>`?

**CSS**

- Explica el modelo de caja. ¿Qué hace `box-sizing: border-box`?
- ¿Cuándo usarías Flexbox y cuándo Grid?
- ¿Qué es la especificidad?
- ¿Qué diferencia hay entre `position: relative`, `absolute` y `fixed`?
- ¿Qué es mobile first?

**JavaScript**

- ¿Diferencia entre `let`, `const` y `var`?
- ¿Diferencia entre `==` y `===`?
- ¿Qué hacen `map`, `filter` y `reduce`?
- ¿Qué es una promesa? ¿Y `async`/`await`?
- ¿Qué es el DOM?
- ¿Qué es un closure?
- ¿Qué es la delegación de eventos?

**Herramientas y otros**

- ¿Cómo trabajas con Git en equipo? (ramas, pull requests)
- ¿Qué haces cuando algo no funciona? (DevTools, consola, leer el error, buscar)
- ¿Qué es una API REST? ¿Qué significan los códigos 200, 404 y 500?

Todas tienen su post en este blog. Un buen ejercicio: lee cada pregunta, contéstala grabándote con el móvil y escúchate después.

> Si no sabes algo, di "no lo sé, pero lo buscaría así..." o "no lo he usado, pero creo que funciona así...". Inventarse la respuesta se nota, y quita más puntos que reconocer que no lo sabes.

## Cómo hacer una buena prueba para casa

Aquí tienes tiempo, así que se espera algo cuidado. Lo que más se valora:

- **Que cumpla todos los requisitos** del enunciado. Haz una lista y márcala.
- **Un README** con: cómo instalarlo y ejecutarlo, qué decisiones tomaste y por qué, y qué mejorarías con más tiempo.
- **Commits pequeños con buenos mensajes.** Revisarán tu historial de Git.
- **Código limpio**: nombres claros, funciones pequeñas, nada de código comentado ni `console.log` olvidados.
- **Estados de carga y error** si consumes una API. Que no se quede en blanco si falla.
- **Responsive y accesible**, aunque no lo pidan explícitamente.
- **Publicado** (por ejemplo, en Vercel o GitHub Pages) con el enlace en el README.

No hace falta añadir 20 funcionalidades extra. Mejor pocas cosas muy bien hechas que muchas a medias.

## Prepara también estas respuestas

No todo es técnico. Ten pensadas (no memorizadas) estas:

- **"Háblame de ti."** 1-2 minutos: qué estudiaste o cómo aprendiste, qué has construido y por qué quieres este puesto.
- **"Háblame de un proyecto del que estés orgulloso."** Qué problema resolvía, qué tecnologías usaste, qué fue lo más difícil y cómo lo resolviste.
- **"¿Cómo aprendes algo nuevo?"** Con un ejemplo real.
- **"¿Por qué esta empresa?"** Mira su web, su producto y sus redes antes de la entrevista.

Y al final siempre te preguntarán **"¿tienes alguna pregunta?"**. Ten dos o tres preparadas: "¿Cómo es un día normal en el equipo?", "¿Cómo se hacen las revisiones de código?", "¿Cómo acompañáis a las personas junior al principio?". No tener preguntas da sensación de poco interés.

## Checklist del día anterior

- [ ] Has leído la oferta otra vez y sabes qué tecnologías piden.
- [ ] Conoces el producto de la empresa.
- [ ] Tu GitHub y tu portafolio están actualizados y los enlaces funcionan.
- [ ] Si es en remoto: has probado la cámara, el micrófono y compartir pantalla, y tienes el editor abierto con letra grande.
- [ ] Tienes agua, papel y bolígrafo para apuntar.
- [ ] Has dormido. En serio: rinde más dormir bien que repasar hasta las 3 de la madrugada.

## Después de la entrevista

- **Apunta** lo que te preguntaron y lo que no supiste. Es tu lista de estudio para la próxima.
- Si en unos días no sabes nada, puedes enviar un **mensaje breve y amable** preguntando por el proceso.
- Si te dicen que no, **pide feedback**. No siempre lo dan, pero cuando lo hacen vale oro.

Casi nadie consigue el primer trabajo en la primera entrevista. Cada proceso es práctica para el siguiente.

## Errores comunes

- **Programar en silencio.** El entrevistador no puede leerte la mente. Piensa en voz alta.
- **Lanzarse a programar sin preguntar.** Dedica los primeros minutos a entender el problema.
- **Inventarse respuestas de teoría.** Reconoce lo que no sabes y explica cómo lo averiguarías.
- **Entregar una prueba para casa sin README** o sin poder ejecutarla.
- **Hablar mal de tu trabajo o empresa anterior.**
- **No tener preguntas al final.**

## Para practicar

- La serie **Ejercicios** de este blog: lógica, pruebas técnicas de JavaScript y de maquetación, siempre con la solución oculta.
- [Exercism](https://exercism.org/tracks/javascript): ejercicios de JavaScript gratis, con mentores.
- Haz una **entrevista simulada** con un amigo que también esté aprendiendo: uno pregunta, el otro responde, y luego cambiáis.

En resumen: los procesos para junior se parecen mucho. Practica ejercicios **en voz alta y con temporizador**, prepara las **preguntas de teoría** típicas con ejemplos, cuida el **README** de las pruebas para casa y recuerda que en una entrevista **importa más cómo piensas y comunicas** que llegar a la solución perfecta.
