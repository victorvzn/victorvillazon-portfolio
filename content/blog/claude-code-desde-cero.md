---
title: 'Claude Code: cómo programar con un agente de IA en tu terminal (sin dejar de aprender)'
description: 'Qué es Claude Code y en qué se diferencia de un chat, cómo instalarlo y empezar, el archivo CLAUDE.md, los permisos y el modo plan, mencionar archivos con @, comandos como /init, /clear y /compact, buenas prácticas para pedir tareas, revisar lo que hace y usarlo para aprender en vez de copiar.'
date: 2026-11-27
series: carrera
tags: [Claude Code, IA, Herramientas, Productividad]
draft: true
---

Hasta hace poco, usar IA para programar era copiar código de un chat y pegarlo en tu editor. Funcionaba, pero la IA **no veía tu proyecto**: no sabía qué archivos tenías, qué librerías usabas ni si su código encajaba con el tuyo.

**Claude Code** es distinto: es un **agente** que trabaja **dentro de tu proyecto**. Lee tus archivos, busca en el código, ejecuta comandos en la terminal (instalar dependencias, lanzar los tests, hacer commits) y **edita los archivos** directamente, pidiéndote permiso para lo importante. Tú le dices *qué* quieres; él investiga *cómo* y lo hace, y tú revisas.

Este post te enseña a usarlo bien. Y sobre todo, a usarlo **sin dejar de aprender**, que es lo más importante si estás empezando.

## ¿Chat o agente?

| | Un chat de IA | Claude Code |
| --- | --- | --- |
| Ve tu proyecto | Solo lo que pegues | Lee y busca en todos tus archivos |
| Escribe el código | Te lo da para copiar | Edita los archivos él mismo |
| Comprueba que funciona | No | Puede ejecutar los tests, el build o el linter y corregir |
| Dónde funciona | En el navegador | En tu terminal, en VS Code, en la app de escritorio o en la web |

La diferencia clave es el **ciclo**: Claude Code puede escribir un cambio, ejecutar los tests, ver que uno falla, leer el error y arreglarlo, todo en la misma tarea. Como haría una persona.

## Paso 1: instalarlo

Necesitas una cuenta de Claude con un plan que incluya Claude Code (o una clave de la API de Anthropic). Para instalarlo, en la terminal:

```bash
# macOS, Linux o WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex
```

También se puede instalar con npm (`npm install -g @anthropic-ai/claude-code`). Los métodos de instalación cambian de vez en cuando: si algo no funciona, revisa la [guía oficial](https://code.claude.com/docs/en/setup).

> ⚠️ Lee siempre lo que vas a ejecutar antes de pegar un comando de instalación en tu terminal. En este caso es el instalador oficial, pero es un buen hábito con cualquier comando de internet.

## Paso 2: tu primera sesión

Entra en la carpeta de tu proyecto y arráncalo:

```bash
cd mi-proyecto
claude
```

La primera vez te pedirá iniciar sesión en el navegador. Después verás un cuadro donde escribir, como un chat, pero **dentro de tu proyecto**.

Empieza **preguntando**, sin pedir cambios:

```text
> ¿Qué hace este proyecto? Explícame la estructura de carpetas y cómo se arranca.
```

Claude Code leerá el `package.json`, la estructura y los archivos principales, y te dará un resumen. Es una forma excelente de entender un proyecto nuevo (por ejemplo, el primer día en un trabajo, o un repositorio de GitHub que quieres estudiar).

Otras preguntas útiles:

```text
> ¿Dónde se valida el formulario de registro?
> ¿Por qué falla npm run build? Explícame el error antes de arreglarlo.
> ¿Qué hace la función calcularTotal y en qué sitios se usa?
```

## Paso 3: tu primer cambio

```text
> Añade un botón "Vaciar carrito" en el componente del carrito que pida confirmación antes de vaciarlo.
```

Claude Code buscará el componente, lo leerá, propondrá el cambio y te mostrará el **diff**: las líneas que quita (en rojo) y las que añade (en verde). Antes de editar un archivo o ejecutar un comando, **te pedirá permiso**. Puedes aceptar, rechazar o explicarle qué cambiar.

**Lee siempre el diff.** Eres responsable del código que entra en tu proyecto, lo escribas tú o no.

## Controlar lo que hace: permisos y modos

Claude Code te pide permiso antes de acciones que modifican algo. Puedes cambiar el **modo** pulsando **`Shift + Tab`**:

| Modo | Qué hace | Cuándo |
| --- | --- | --- |
| **Normal** | Pide permiso para cada edición y comando | Por defecto. El más seguro para aprender |
| **Aceptar ediciones** | Edita archivos sin preguntar (los comandos sí los pregunta) | Cuando confías en la tarea y revisarás el resultado al final |
| **Modo plan** | **Solo investiga y propone un plan**, sin tocar nada | Antes de tareas grandes o cuando no tienes claro cómo hacerlas |

El **modo plan** es tu mejor amigo: le pides una tarea, Claude Code lee el código y te presenta **un plan paso a paso**. Lo revisas, lo corriges ("no uses una librería nueva para eso", "hazlo en el archivo de utilidades") y, cuando te convence, lo apruebas para que empiece.

Puedes **interrumpirlo** en cualquier momento con **`Esc`** si ves que va por mal camino, y corregirle sobre la marcha.

> Usa Git. Haz un commit **antes** de pedir un cambio grande: si el resultado no te gusta, vuelves atrás con `git restore` o `git checkout`. Es tu red de seguridad, igual que lo sería con tu propio código.

## Darle contexto: `@` y CLAUDE.md

### Mencionar archivos con `@`

Si sabes dónde está lo que quieres cambiar, díselo. Escribe **`@`** y el nombre del archivo, y te lo autocompleta:

```text
> En @src/components/Carrito.jsx, el total no incluye el envío. Usa la función de @src/utils/envio.js.
```

Le ahorras buscar y reduces el riesgo de que toque el archivo equivocado.

### El archivo CLAUDE.md: la memoria del proyecto

Cada sesión empieza "desde cero": Claude Code no recuerda lo que hablasteis ayer. Para que conozca las reglas de tu proyecto, existe **`CLAUDE.md`**, un archivo en la raíz que **lee al empezar cada sesión**.

Créalo con:

```text
> /init
```

Claude Code analiza el proyecto y escribe un `CLAUDE.md` con los comandos, la arquitectura y las convenciones. Revísalo y añade lo que sepas tú:

```markdown
# CLAUDE.md

## Comandos
- `npm run dev`: servidor de desarrollo
- `npm test`: tests con Vitest (ejecútalos después de cada cambio)

## Convenciones
- Componentes en PascalCase, funciones en camelCase.
- Los textos de la interfaz, en español.
- Nada de librerías nuevas sin preguntar antes.
- Los estilos con Tailwind; no crear archivos CSS nuevos.
```

Súbelo a Git: así todo el equipo (y Claude Code) comparte las mismas reglas. Es como el README, pero escrito para el agente.

## Comandos útiles

Dentro de la sesión, los comandos que empiezan por `/`:

| Comando | Qué hace |
| --- | --- |
| `/init` | Crea el `CLAUDE.md` del proyecto |
| `/clear` | Borra la conversación y empieza de cero (el `CLAUDE.md` se vuelve a leer) |
| `/compact` | Resume la conversación para liberar espacio cuando es muy larga |
| `/model` | Cambia el modelo de IA |
| `/help` | Lista todos los comandos |

Y algunos atajos:

- **`!`** al principio de la línea ejecuta un comando de terminal directamente (`! npm test`), y su resultado queda en la conversación.
- **`Esc`** interrumpe lo que está haciendo.
- Desde la terminal, **`claude --continue`** retoma la última conversación y **`claude --resume`** te deja elegir una anterior.

### Cuándo usar `/clear`

La conversación es su **contexto**: todo lo que ha leído y hablado. Si cambias de tarea (terminaste el carrito y ahora vas con el login), usa **`/clear`**: las conversaciones largas con temas mezclados hacen que trabaje peor. **Una tarea, una conversación.**

## Cómo pedir las cosas bien

La calidad del resultado depende mucho de **cómo pides**. Compara:

```text
❌ > arregla el login

✅ > Al iniciar sesión con un email en mayúsculas (ANA@CORREO.COM) da "usuario no encontrado",
     aunque el usuario existe como ana@correo.com. Busca dónde se compara el email,
     haz que no distinga mayúsculas y añade un test que lo compruebe.
```

Lo que tiene la buena petición:

1. **Qué pasa** (el síntoma) y **qué debería pasar**.
2. **Cómo reproducirlo**.
3. **Cómo comprobar** que está arreglado (un test, un comando).
4. **Límites**, si los hay ("sin cambiar la API", "sin librerías nuevas").

Más consejos:

- **Tareas pequeñas.** "Haz la tienda online" es demasiado. "Crea el componente de la tarjeta de producto con estas props" es perfecto. Como con las tareas de TDD (lo viste en la serie de Testing): pasos pequeños.
- **Pide que se compruebe.** "Ejecuta los tests al terminar" o "comprueba que `npm run build` pasa". Con una forma de verificar, Claude Code puede corregirse solo.
- **Para bugs, primero el diagnóstico.** "Explícame por qué pasa esto antes de cambiar nada." Así entiendes el problema y no aceptas un arreglo a ciegas.
- **Si no te gusta el resultado, dilo concretamente**: "el botón debería estar a la derecha y usar el estilo de los demás botones del formulario".

## Úsalo para aprender, no para dejar de pensar

Si estás aprendiendo a programar, hay una trampa: dejar que el agente lo haga todo y no entender nada. Vas rápido unas semanas... y en tu primera entrevista técnica o tu primer bug difícil no sabes por dónde empezar.

Cómo sacarle partido **sin** perder el aprendizaje:

- **Pide explicaciones**, no solo código: "Explícame este cambio línea por línea", "¿por qué usaste `useMemo` aquí?", "¿qué alternativas había?".
- **Escribe tú primero, pide revisión después**: "Revisa mi función y dime qué mejorarías, pero no la cambies".
- **Úsalo como profesor**: "No me des la solución: dame una pista para el ejercicio de FizzBuzz".
- **Lee los diffs con atención** y pregunta lo que no entiendas. Si no puedes explicar un cambio, no lo aceptes todavía.
- **Practica sin él**: los ejercicios y pruebas técnicas de este blog están pensados para hacerse a mano. En una entrevista no tendrás un agente.

Piénsalo así: Claude Code es un compañero muy rápido y con mucha experiencia. Si te sientas a su lado y le preguntas, aprendes muchísimo. Si solo le dices "hazlo tú" y te vas, no aprendes nada.

## Seguridad y privacidad

- **Revisa los comandos** antes de aprobarlos, sobre todo los que borran (`rm`), los que publican (`git push`, desplegar) o los que instalan paquetes.
- **No le pegues secretos** (contraseñas, tokens, claves de API) en la conversación. Guárdalos en tu `.env`, que ya debería estar en el `.gitignore`.
- **Cuidado con el contenido de fuera**: si le pides que lea una web o un archivo descargado, ese contenido puede incluir instrucciones maliciosas. Revisa lo que hace después.
- **Revisa las licencias y el trabajo** de la empresa: algunas tienen normas sobre qué herramientas de IA se pueden usar con su código.

## Más allá de la terminal

Cuando te sientas cómodo, Claude Code tiene mucho más:

- **Extensiones para VS Code y JetBrains**, con los diffs dentro del editor.
- **App de escritorio y versión web**, para trabajar sin la terminal.
- **MCP** (*Model Context Protocol*): conectarlo a otras herramientas, como tu gestor de tareas, una base de datos o la documentación de una librería.
- **Comandos personalizados, skills y subagentes**: automatizar tareas que repites (por ejemplo, "revisa este PR siguiendo nuestra guía").
- **Hooks**: ejecutar algo automáticamente, como el formateador o el linter, cada vez que edita un archivo.
- **Modo no interactivo**: `claude -p "resume los cambios del último commit"` responde y termina, útil en scripts y en CI.

Todo está en la [documentación oficial](https://code.claude.com/docs).

## Tu turno

1. Instala Claude Code y ábrelo en uno de tus proyectos. Pídele que te explique la estructura.
2. Ejecuta `/init`, lee el `CLAUDE.md` que genera y añade dos reglas tuyas.
3. Pídele, en **modo plan**, una mejora pequeña (por ejemplo, añadir un estado de carga). Revisa el plan, corrige algo y apruébalo. Lee el diff antes de aceptar.
4. Escribe tú una función de uno de los ejercicios del blog y pídele **solo una revisión**, sin cambios.
5. Haz un commit antes de un cambio, acepta el cambio y practica deshacerlo con Git.

## Errores comunes

- **Aceptar cambios sin leerlos.** El código es tu responsabilidad.
- **Peticiones vagas** ("mejora esto", "arréglalo") sin decir qué pasa ni cómo comprobarlo.
- **Tareas enormes** en una sola petición. Divídelas.
- **Conversaciones eternas** que mezclan temas. Usa `/clear` al cambiar de tarea.
- **No usar Git**, y no poder volver atrás.
- **Pegar secretos** en la conversación.
- **Dejar de aprender**: usarlo solo para que lo haga por ti.

## Para profundizar

- [Documentación oficial de Claude Code (en inglés)](https://code.claude.com/docs)
- [Buenas prácticas de Claude Code (en inglés)](https://www.anthropic.com/engineering/claude-code-best-practices)

En resumen: **Claude Code** es un **agente** que trabaja dentro de tu proyecto: lee, busca, edita archivos y ejecuta comandos, **pidiéndote permiso**. Arráncalo con **`claude`** en la carpeta del proyecto, dale contexto con **`@archivo`** y un **`CLAUDE.md`** (créalo con **`/init`**), planifica con el **modo plan** (`Shift + Tab`) y empieza de cero con **`/clear`** al cambiar de tarea. Pide **tareas pequeñas y comprobables**, **lee siempre el diff**, usa Git como red de seguridad y, sobre todo, úsalo para **aprender**: pregunta por qué, pide revisiones y sigue practicando a mano.
