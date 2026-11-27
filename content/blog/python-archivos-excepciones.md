---
title: 'Python: archivos, JSON, CSV y manejo de errores con try/except'
description: 'Cómo leer y escribir archivos con with open, trabajar con rutas usando pathlib, guardar y cargar JSON, leer un CSV, manejar errores con try, except, else y finally, y crear tus propias excepciones.'
date: 2026-11-27
series: python
tags: [Python, Archivos, JSON, Errores, Intermedio]
draft: true
---

Los datos de tus programas desaparecen al cerrarlos. Para guardarlos necesitas **archivos**. Y en cuanto trabajas con archivos (o con el usuario, o con internet), las cosas pueden fallar: el archivo no existe, el JSON está roto, el usuario escribe "abc" donde esperabas un número. Hoy aprendes las dos cosas juntas, porque siempre van de la mano.

## Manejar errores: `try` / `except`

Cuando algo falla, Python lanza una **excepción** y el programa se detiene:

```python
edad = int("abc")
# ValueError: invalid literal for int() with base 10: 'abc'
```

Con `try` / `except` capturas el error y decides qué hacer:

```python
texto = input("¿Cuántos años tienes? ")

try:
    edad = int(texto)
    print(f"El año que viene tendrás {edad + 1}")
except ValueError:
    print("Eso no es un número")
```

Es como el `try/catch` de JavaScript (lo viste en su propio post), con una diferencia importante: en Python **indicas qué tipo de error** esperas.

### Varios tipos de error

```python
def dividir(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("No se puede dividir entre cero")
        return None
    except TypeError:
        print("Solo se pueden dividir números")
        return None

dividir(10, 0)      # No se puede dividir entre cero
dividir(10, "2")    # Solo se pueden dividir números
```

Los errores que más verás:

| Excepción | Cuándo |
| --- | --- |
| `ValueError` | El tipo es correcto pero el valor no (`int("abc")`) |
| `TypeError` | Operación con un tipo incorrecto (`"5" + 3`) |
| `KeyError` | La clave no existe en un diccionario |
| `IndexError` | El índice no existe en una lista |
| `FileNotFoundError` | El archivo no existe |
| `ZeroDivisionError` | División entre cero |

### `else` y `finally`

```python
try:
    numero = int(input("Número: "))
except ValueError:
    print("No es un número")
else:
    print(f"El doble es {numero * 2}")   # solo si NO hubo error
finally:
    print("Gracias por usar la calculadora")   # SIEMPRE
```

- **`else`**: el código que solo debe ejecutarse si todo salió bien. Mantiene el `try` pequeño, con solo lo que puede fallar.
- **`finally`**: se ejecuta siempre, haya error o no. Para limpiar (cerrar conexiones, por ejemplo).

### Ver el mensaje del error

```python
try:
    datos = {"nombre": "Ana"}
    print(datos["email"])
except KeyError as error:
    print(f"Falta la clave: {error}")   # Falta la clave: 'email'
```

> ⚠️ **No captures todo a ciegas.** `except:` o `except Exception:` sin más atrapa **cualquier** error, incluidos tus propios bugs, y los esconde. Captura solo los errores que esperas y sabes manejar.

## Leer y escribir archivos: `with open`

```python
# Escribir (crea el archivo, o lo sobrescribe si existe)
with open("notas.txt", "w", encoding="utf-8") as archivo:
    archivo.write("Comprar pan\n")
    archivo.write("Estudiar Python\n")

# Añadir al final, sin borrar lo que hay
with open("notas.txt", "a", encoding="utf-8") as archivo:
    archivo.write("Llamar a mamá\n")

# Leer todo de una vez
with open("notas.txt", encoding="utf-8") as archivo:
    contenido = archivo.read()
    print(contenido)

# Leer línea a línea (mejor para archivos grandes)
with open("notas.txt", encoding="utf-8") as archivo:
    for numero, linea in enumerate(archivo, start=1):
        print(f"{numero}: {linea.strip()}")
```

- **`with`** abre el archivo y lo **cierra automáticamente** al terminar el bloque, aunque haya un error. Usa siempre `with`.
- El **modo**: `"r"` leer (por defecto), `"w"` escribir (¡borra lo anterior!), `"a"` añadir al final.
- **`encoding="utf-8"`**: indícalo siempre. Sin él, en Windows las tildes y las ñ pueden salir como símbolos raros.
- **`.strip()`** quita el salto de línea (`\n`) del final de cada línea.

## Rutas con `pathlib`

`pathlib` es la forma moderna de trabajar con rutas, y funciona igual en Windows, macOS y Linux:

```python
from pathlib import Path

carpeta = Path("datos")
carpeta.mkdir(exist_ok=True)          # crea la carpeta si no existe

archivo = carpeta / "usuarios.txt"    # une rutas con /
archivo.write_text("Ana\nLuis\n", encoding="utf-8")

print(archivo.exists())               # True
print(archivo.read_text(encoding="utf-8"))
print(archivo.name, archivo.suffix)   # usuarios.txt .txt

for ruta in carpeta.glob("*.txt"):    # todos los .txt de la carpeta
    print(ruta)
```

`Path("datos") / "usuarios.txt"` construye la ruta correcta en cada sistema (con `\` en Windows y `/` en el resto).

## JSON: guardar y cargar datos

JSON es el formato que usan las APIs (lo viste en el post de HTTP y JSON). En Python, un JSON se convierte en diccionarios y listas, y viceversa, con el módulo `json`:

```python
import json
from pathlib import Path

ARCHIVO = Path("tareas.json")

def cargar_tareas():
    try:
        return json.loads(ARCHIVO.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return []                     # la primera vez no existe: lista vacía
    except json.JSONDecodeError:
        print("⚠️ El archivo está dañado, empiezo de cero")
        return []

def guardar_tareas(tareas):
    texto = json.dumps(tareas, indent=2, ensure_ascii=False)
    ARCHIVO.write_text(texto, encoding="utf-8")

tareas = cargar_tareas()
tareas.append({"texto": "Aprender JSON en Python", "hecha": False})
guardar_tareas(tareas)
print(f"Tienes {len(tareas)} tareas")
```

| Función | Hace | En JavaScript |
| --- | --- | --- |
| `json.dumps(objeto)` | Objeto de Python → texto JSON | `JSON.stringify` |
| `json.loads(texto)` | Texto JSON → objeto de Python | `JSON.parse` |
| `json.dump(objeto, archivo)` | Lo mismo, directo a un archivo abierto | — |
| `json.load(archivo)` | Lo mismo, leyendo un archivo abierto | — |

- **`indent=2`** guarda el JSON con sangría, legible.
- **`ensure_ascii=False`** guarda las tildes tal cual (`"Perú"`) en vez de códigos (`"Perú"`).

Fíjate en cómo `cargar_tareas` combina archivos y excepciones: los dos fallos posibles tienen su respuesta.

## CSV: datos de una hoja de cálculo

Un **CSV** es una tabla en texto, con los valores separados por comas. Excel y Google Sheets lo exportan y lo importan.

```python
import csv

# Escribir
alumnos = [
    {"nombre": "Ana", "nota": 18},
    {"nombre": "Luis", "nota": 9},
    {"nombre": "María", "nota": 15},
]

with open("notas.csv", "w", newline="", encoding="utf-8") as archivo:
    escritor = csv.DictWriter(archivo, fieldnames=["nombre", "nota"])
    escritor.writeheader()
    escritor.writerows(alumnos)

# Leer
with open("notas.csv", newline="", encoding="utf-8") as archivo:
    for fila in csv.DictReader(archivo):
        nota = int(fila["nota"])          # ¡en un CSV todo es texto!
        estado = "✅" if nota >= 11 else "❌"
        print(f"{estado} {fila['nombre']}: {nota}")
```

`DictReader` convierte cada fila en un diccionario usando la primera fila como nombres de columna. Y `newline=""` es una recomendación oficial del módulo `csv` para que no aparezcan líneas en blanco de más en Windows.

## Lanzar tus propios errores: `raise`

Tus funciones también pueden lanzar errores cuando reciben datos inválidos:

```python
def retirar(saldo, cantidad):
    if cantidad <= 0:
        raise ValueError("La cantidad debe ser positiva")
    if cantidad > saldo:
        raise ValueError(f"Saldo insuficiente: tienes {saldo}")
    return saldo - cantidad

try:
    retirar(100, 500)
except ValueError as error:
    print(f"No se pudo retirar: {error}")
```

Y puedes crear **tus propias excepciones** heredando de `Exception` (verás la herencia en el post de POO):

```python
class SaldoInsuficienteError(Exception):
    pass

def retirar(saldo, cantidad):
    if cantidad > saldo:
        raise SaldoInsuficienteError(f"Te faltan {cantidad - saldo}")
    return saldo - cantidad
```

Así, quien use tu función puede capturar **exactamente** ese error (`except SaldoInsuficienteError`) sin confundirlo con otros.

## Tu turno

1. Crea un programa de "diario": cada vez que lo ejecutas, pide una frase y la añade a `diario.txt` con la fecha (`from datetime import date` y `date.today()`). Luego muestra todas las entradas.
2. Haz que el gestor de tareas JSON de arriba tenga un menú: listar, añadir y marcar como hecha.
3. Lee un CSV de gastos (`concepto,categoria,importe`) y muestra el total por categoría con un diccionario.
4. Escribe `pedir_numero(mensaje)` que repita la pregunta hasta que el usuario escriba un número válido.

## Errores comunes

- **Abrir con `"w"` un archivo que querías conservar**: lo vacía. Para añadir, usa `"a"`.
- **No usar `with`** y olvidar cerrar el archivo.
- **No indicar `encoding="utf-8"`**: tildes rotas en Windows.
- **`except:` sin tipo**: esconde todos los errores, también tus bugs.
- **Olvidar que en un CSV todo es texto**: `fila["nota"] + 1` falla; convierte con `int()`.
- **`FileNotFoundError` con una ruta relativa**: la ruta es relativa a la carpeta **desde la que ejecutas** el programa, no a la del archivo `.py`.

## Para profundizar

- [Errores y excepciones (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/errors.html)
- [Entrada y salida: leer y escribir archivos (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/inputoutput.html#reading-and-writing-files)

En resumen: con **`try` / `except`** capturas **errores concretos** (`ValueError`, `FileNotFoundError`...), con **`else`** ejecutas lo que depende de que todo saliera bien y con **`finally`** lo que debe pasar siempre. Abre archivos con **`with open(..., encoding="utf-8")`**, construye rutas con **`pathlib`**, guarda y carga datos con **`json.dumps` / `json.loads`**, lee tablas con **`csv.DictReader`** y lanza tus propios errores con **`raise`**.
