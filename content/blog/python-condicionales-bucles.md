---
title: 'Python: condicionales, bucles y la importancia de la sangría'
description: 'Cómo funcionan if, elif y else en Python, los operadores and, or y not, el operador ternario, match, los bucles for con range y while, break y continue, y por qué la sangría es parte del lenguaje.'
date: 2026-11-27
series: python
tags: [Python, Condicionales, Bucles, Fundamentos]
draft: true
---

Un programa que hace siempre lo mismo no sirve de mucho. Necesitas que **decida** (si el usuario es mayor de edad, si hay stock) y que **repita** (para cada producto del carrito, mientras la contraseña sea incorrecta). Eso son los condicionales y los bucles.

Y en Python tienen una particularidad que lo cambia todo: **no hay llaves**.

## La sangría es el bloque

En JavaScript, las llaves `{ }` marcan qué código está dentro de un `if`. En Python lo marca la **sangría** (los espacios al principio de la línea), y los dos puntos `:` abren el bloque:

```python
edad = 20

if edad >= 18:
    print("Eres mayor de edad")      # dentro del if
    print("Puedes votar")            # dentro del if
print("Esto se ejecuta siempre")     # fuera del if
```

- Después de la condición van **dos puntos**.
- El código de dentro lleva **4 espacios** de sangría (VS Code los pone solos al pulsar Tab).
- El bloque termina cuando vuelves a la sangría anterior.

Si te equivocas, Python no te deja ejecutar: `IndentationError`. Al principio molesta; luego te das cuenta de que te obliga a escribir código ordenado.

## `if`, `elif` y `else`

```python
nota = 15

if nota >= 18:
    print("Excelente")
elif nota >= 14:
    print("Bien")
elif nota >= 11:
    print("Aprobado")
else:
    print("Desaprobado")
```

`elif` es la contracción de "else if". Se revisan **en orden** y se ejecuta solo el primero que se cumpla.

### Comparaciones y operadores lógicos

```python
print(5 == 5)     # True: igual (Python no tiene ===, y no hace falta: no convierte tipos)
print(5 != 3)     # True: distinto
print("5" == 5)   # False: un texto nunca es igual a un número

edad = 25
tiene_entrada = True

if edad >= 18 and tiene_entrada:
    print("Puedes pasar")

if not tiene_entrada or edad < 18:
    print("No puedes pasar")

# Comparaciones encadenadas: muy de Python
if 18 <= edad <= 65:
    print("En edad laboral")
```

`and`, `or` y `not` son palabras, no símbolos. Y puedes encadenar comparaciones como en matemáticas: `18 <= edad <= 65`.

### Valores "verdaderos" y "falsos"

Como en JavaScript, algunos valores se consideran falsos en un `if`: `False`, `None`, `0`, `""` (texto vacío), `[]` (lista vacía), `{}` (diccionario vacío). Todo lo demás es verdadero.

```python
carrito = []

if carrito:
    print("Tienes productos")
else:
    print("Tu carrito está vacío")   # se ejecuta esto
```

### El ternario

```python
edad = 16
mensaje = "Mayor de edad" if edad >= 18 else "Menor de edad"
print(mensaje)
```

Equivale a `edad >= 18 ? 'Mayor de edad' : 'Menor de edad'` de JavaScript, pero se lee casi como una frase.

### `match`: el `switch` de Python

```python
comando = "salir"

match comando:
    case "ayuda":
        print("Comandos: ayuda, listar, salir")
    case "listar":
        print("Listando...")
    case "salir" | "exit":
        print("¡Adiós!")
    case _:
        print(f"Comando desconocido: {comando}")
```

`case _` es el caso por defecto, y `|` permite varias opciones. (`match` puede hacer mucho más, como comparar la forma de listas y diccionarios, pero para empezar basta con esto.)

## El bucle `for`

En Python, `for` **recorre los elementos** de algo (una lista, un texto, un rango). Es como el `for...of` de JavaScript:

```python
frutas = ["manzana", "plátano", "uva"]

for fruta in frutas:
    print(f"Me gusta la {fruta}")

for letra in "hola":
    print(letra)
```

### `range`: repetir un número de veces

```python
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):       # 1, 2, 3, 4, 5 (el final no se incluye)
    print(i)

for i in range(0, 20, 5):   # 0, 5, 10, 15: de 5 en 5
    print(i)

for i in range(10, 0, -1):  # 10, 9, ..., 1: cuenta atrás
    print(i)
```

`range(inicio, fin, paso)` genera números **sin incluir el fin**. Es como el clásico `for (let i = 0; i < 5; i++)`.

### `enumerate`: el índice y el valor

```python
tareas = ["Estudiar", "Correr", "Cocinar"]

for numero, tarea in enumerate(tareas, start=1):
    print(f"{numero}. {tarea}")
# 1. Estudiar
# 2. Correr
# 3. Cocinar
```

Evita el `range(len(tareas))` que verás en código antiguo: `enumerate` es más claro.

## El bucle `while`

Repite **mientras** se cumpla una condición. Úsalo cuando no sabes cuántas vueltas darás:

```python
intentos = 0
clave_correcta = "python123"

while intentos < 3:
    clave = input("Contraseña: ")
    if clave == clave_correcta:
        print("¡Bienvenido!")
        break
    intentos += 1
    print(f"Incorrecta. Te quedan {3 - intentos} intentos.")
else:
    print("Cuenta bloqueada")
```

- **`intentos += 1`**: Python **no tiene `++`**. Se escribe `+= 1`.
- **`break`** sale del bucle al momento.
- **`else` en un bucle** (una rareza de Python): se ejecuta si el bucle terminó **sin** `break`. Aquí, si se agotaron los intentos.

### `continue`: saltar a la siguiente vuelta

```python
for numero in range(1, 11):
    if numero % 2 == 0:
        continue           # los pares se saltan
    print(numero)          # 1, 3, 5, 7, 9
```

## Todo junto: FizzBuzz

El clásico de las entrevistas (tiene su propio post en la serie de pruebas técnicas, en JavaScript):

```python
for numero in range(1, 16):
    if numero % 15 == 0:
        print("FizzBuzz")
    elif numero % 3 == 0:
        print("Fizz")
    elif numero % 5 == 0:
        print("Buzz")
    else:
        print(numero)
```

## Tu turno

1. Escribe un programa que pida un número y diga si es positivo, negativo o cero, y si es par o impar.
2. Muestra la tabla de multiplicar de un número que escriba el usuario, del 1 al 12, con f-strings: `7 x 3 = 21`.
3. Haz el juego de "adivina el número": el programa elige uno con `import random` y `random.randint(1, 100)`, y el usuario tiene 7 intentos. Después de cada intento, dile si es mayor o menor.

## Errores comunes

- **Olvidar los dos puntos** después del `if`, `for` o `while`: `SyntaxError: expected ':'`.
- **Mezclar espacios y tabulaciones**, o sangrías distintas: `IndentationError`. Configura el editor para usar 4 espacios.
- **Escribir `i++`**: no existe. Usa `i += 1`.
- **Esperar que `range(1, 10)` incluya el 10.** No lo incluye.
- **Un `while` infinito**: si la condición nunca cambia, el programa no termina. Para pararlo, `Ctrl + C`.
- **Escribir `&&` u `||`.** En Python son `and` y `or`.

## Para profundizar

- [Más herramientas para control de flujo (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/controlflow.html)

En resumen: en Python, **la sangría define los bloques** y los **dos puntos** los abren. Decide con **`if` / `elif` / `else`** (o **`match`**), combina condiciones con **`and`, `or` y `not`**, recorre elementos con **`for ... in`** (con **`range`** y **`enumerate`**) y repite mientras se cumpla algo con **`while`**. Recuerda: no hay `++` ni llaves.
