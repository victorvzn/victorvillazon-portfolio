---
title: 'Python desde cero: instala y escribe tu primer programa'
description: 'Qué es Python y por qué es tan popular, cómo instalarlo en Windows, macOS o Linux, la consola interactiva, variables, tipos de datos, f-strings, input y las diferencias clave con JavaScript.'
date: 2026-11-27
series: python
tags: [Python, Fundamentos]
draft: true
---

Si ya sabes algo de JavaScript, Python te va a parecer **sorprendentemente fácil de leer**. Y si es tu primer lenguaje, has elegido bien: Python es el lenguaje más usado para aprender a programar, y uno de los más pedidos en el trabajo.

¿Para qué se usa? Para casi todo menos para el navegador:

- **Backend y APIs** (con Django, Flask o FastAPI).
- **Datos e inteligencia artificial**: análisis de datos, machine learning, los modelos de IA que usas cada día.
- **Automatizar tareas**: renombrar mil archivos, leer un Excel, descargar datos de una web.
- **Scripts y herramientas** de sistema, DevOps y ciberseguridad.

## Paso 1: instalarlo

- **Windows:** descarga el instalador desde [python.org](https://www.python.org/downloads/). En la primera pantalla, **marca la casilla "Add python.exe to PATH"** antes de pulsar *Install Now*. Si la olvidas, la terminal no encontrará Python.
- **macOS:** descárgalo de python.org o, si usas Homebrew, `brew install python`.
- **Linux:** casi siempre viene instalado. Si no, `sudo apt install python3`.

Comprueba en una terminal:

```bash
python --version    # Windows
python3 --version   # macOS y Linux
```

Si ves algo como `Python 3.13.1`, está listo. En este post escribiremos `python`; si estás en macOS o Linux, usa `python3`.

Instala también la extensión **Python** (de Microsoft) en VS Code: te da colores, autocompletado y te avisa de errores.

## Paso 2: la consola interactiva

Escribe `python` en la terminal y pulsa Enter. Verás `>>>`: es la **consola interactiva** (el *REPL*). Escribes una línea y Python la ejecuta al momento:

```python
>>> 2 + 3
5
>>> "hola" * 3
'holaholahola'
>>> exit()
```

Es perfecta para probar cosas rápidas, como la consola de las DevTools en JavaScript.

## Paso 3: tu primer programa

Crea un archivo `hola.py`:

```python
nombre = "Python"
print(f"¡Hola, {nombre}!")
print("Hoy empiezo a programar en", nombre)
```

Ejecútalo:

```bash
python hola.py
```

`print` muestra texto en la terminal, como `console.log`.

## Variables y tipos de datos

En Python no hay `let`, `const` ni `var`: la variable **se crea al asignarle un valor**.

```python
edad = 25                 # int: número entero
precio = 19.99            # float: número decimal
nombre = "Ana"            # str: texto (comillas simples o dobles, da igual)
es_estudiante = True      # bool: True o False, con mayúscula
nada = None               # None: "sin valor", como null en JavaScript

print(type(edad))         # <class 'int'>
print(type(nombre))       # <class 'str'>
```

Por convención, los nombres van en **snake_case** (palabras en minúscula separadas por `_`): `precio_total`, `es_estudiante`. Nada de `camelCase`. Y las constantes, en MAYÚSCULAS: `IVA = 0.18` (Python no las protege, es solo un aviso para quien lee).

### Operaciones con números

```python
print(10 + 3)    # 13
print(10 - 3)    # 7
print(10 * 3)    # 30
print(10 / 3)    # 3.3333333333333335: la división siempre da float
print(10 // 3)   # 3: división entera
print(10 % 3)    # 1: el resto
print(2 ** 10)   # 1024: potencia
print(round(3.14159, 2))  # 3.14
```

### Textos

```python
nombre = "ana torres"

print(nombre.upper())        # ANA TORRES
print(nombre.title())        # Ana Torres
print(nombre.replace("ana", "luisa"))  # luisa torres
print(len(nombre))           # 10: la longitud
print(nombre[0])             # a: el primer carácter
print(nombre[-1])            # s: el último
print(nombre[0:3])           # ana: del 0 al 3 (sin incluir el 3)
print("torres" in nombre)    # True
```

Los índices negativos cuentan desde el final, y `[inicio:fin]` (el *slicing*) recorta un trozo. Funciona igual con listas, como verás.

### f-strings: el equivalente a los template literals

```python
producto = "Teclado"
precio = 120
cantidad = 3

print(f"{producto}: S/ {precio}")
print(f"Total: S/ {precio * cantidad:.2f}")   # 360.00: con 2 decimales
print(f"{'Título':>10}|")                     # alinea a la derecha en 10 espacios
```

Una `f` delante de las comillas y las variables entre `{}`. Es la forma moderna de construir textos en Python, igual que `` `${}` `` en JavaScript. Después de `:` puedes dar formato: `.2f` son dos decimales.

## Convertir tipos

```python
edad_texto = "25"
edad = int(edad_texto)    # "25" → 25
precio = float("19.90")   # "19.90" → 19.9
texto = str(100)          # 100 → "100"

print("5" + "3")          # 53: une textos
print(int("5") + 3)       # 8
print("5" + 3)            # ❌ TypeError: can only concatenate str (not "int") to str
```

¡Ojo con lo último! JavaScript convertiría el `3` en texto y daría `"53"` sin quejarse. **Python no mezcla tipos por su cuenta**: te avisa con un error. Parece más estricto, pero te ahorra muchos bugs (recuerda el post de igualdad y coerción).

## Leer lo que escribe el usuario: `input`

```python
nombre = input("¿Cómo te llamas? ")
edad = int(input("¿Cuántos años tienes? "))

print(f"Hola, {nombre}. En 10 años tendrás {edad + 10}.")
```

`input` siempre devuelve **texto**: si necesitas un número, conviértelo con `int()` o `float()`.

## Las diferencias que más se notan viniendo de JavaScript

| JavaScript | Python |
| --- | --- |
| `let x = 5` | `x = 5` |
| `console.log()` | `print()` |
| `true`, `false`, `null` | `True`, `False`, `None` |
| `// comentario` | `# comentario` |
| `{ }` para los bloques | **sangría** (4 espacios) |
| `&&`, `\|\|`, `!` | `and`, `or`, `not` |
| `` `Hola ${nombre}` `` | `f"Hola {nombre}"` |
| `camelCase` | `snake_case` |
| `;` al final (opcional) | Nunca |

La más importante es la **sangría**. En Python los espacios al principio de la línea **no son decorativos**: indican qué código está dentro de un `if`, un bucle o una función. Lo verás en el siguiente post.

## Tu turno

Crea `calculadora_propina.py` que:

1. Pida el total de la cuenta y el porcentaje de propina con `input`.
2. Pida entre cuántas personas se divide.
3. Muestre con f-strings la propina, el total y cuánto paga cada persona, con 2 decimales.

## Errores comunes

- **`'python' no se reconoce como un comando`** (Windows). No marcaste "Add to PATH". Reinstala marcándolo, o prueba con `py`.
- **`TypeError` al sumar texto y número.** Convierte con `int()`, `float()` o `str()`.
- **Olvidar que `input` devuelve texto**: `input() + 1` falla.
- **Escribir `true` en minúscula**: `NameError: name 'true' is not defined`. Es `True`.
- **Ejecutar el archivo desde otra carpeta**: `No such file or directory`. Revisa en qué carpeta está la terminal.

## Para profundizar

- [El tutorial oficial de Python (en español)](https://docs.python.org/es/3/tutorial/)
- [Descargas de Python](https://www.python.org/downloads/)

En resumen: **Python** es un lenguaje fácil de leer que se usa para backend, datos, IA y automatización. Se instala desde python.org (en Windows, **marca "Add to PATH"**) y se ejecuta con **`python archivo.py`**. Las variables se crean al asignarlas, los nombres van en **snake_case**, los textos se forman con **f-strings**, **`input`** siempre devuelve texto y Python **no mezcla tipos** sin que se lo pidas.
