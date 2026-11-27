---
title: 'Python: funciones, parámetros, *args, **kwargs y lambda'
description: 'Cómo definir funciones con def, return, parámetros con valor por defecto y con nombre, *args y **kwargs, el alcance de las variables, docstrings, funciones lambda y funciones como valores (map, filter, sorted).'
date: 2026-11-27
series: python
tags: [Python, Funciones, Fundamentos]
draft: true
---

Si copias el mismo código en tres sitios, cuando haya que cambiarlo tendrás que acordarte de los tres. Las **funciones** dan un nombre a un trozo de código para reutilizarlo, y son la base de cualquier programa bien organizado.

## Definir una función: `def`

```python
def saludar(nombre):
    print(f"¡Hola, {nombre}!")

saludar("Ana")    # ¡Hola, Ana!
saludar("Luis")   # ¡Hola, Luis!
```

- **`def`** (de *define*) seguido del nombre, los parámetros entre paréntesis y **dos puntos**.
- El cuerpo va con **sangría**, como en un `if`.
- Los nombres de funciones también van en **snake_case**: `calcular_total`, no `calcularTotal`.

## `return`: devolver un resultado

```python
def calcular_total(precio, cantidad):
    return precio * cantidad

total = calcular_total(25, 4)
print(total)   # 100
```

Una función sin `return` devuelve `None` (el equivalente a `undefined`).

### Devolver varios valores

```python
def estadisticas(numeros):
    return min(numeros), max(numeros), sum(numeros) / len(numeros)

minimo, maximo, media = estadisticas([15, 18, 11, 20])
print(minimo, maximo, media)   # 11 20 16.0
```

En realidad devuelve una **tupla**, y la desempaquetamos (lo viste en el post de colecciones).

## Parámetros con valor por defecto

```python
def aplicar_descuento(precio, porcentaje=10):
    return precio - precio * porcentaje / 100

print(aplicar_descuento(200))       # 180.0
print(aplicar_descuento(200, 25))   # 150.0
```

### Argumentos con nombre

Al llamar a una función puedes indicar **el nombre** de cada parámetro. Así da igual el orden y se lee mucho mejor:

```python
def crear_usuario(nombre, edad, es_admin=False, idioma="es"):
    return {"nombre": nombre, "edad": edad, "es_admin": es_admin, "idioma": idioma}

crear_usuario("Ana", 28, idioma="en")
crear_usuario(edad=30, nombre="Luis", es_admin=True)
```

Compara `crear_usuario("Ana", 28, True, "en")` con `crear_usuario("Ana", 28, es_admin=True, idioma="en")`: en el segundo sabes qué es cada cosa sin mirar la función. Es una de las grandes ventajas de Python sobre JavaScript (donde se simula pasando un objeto).

> ⚠️ **La trampa clásica:** nunca uses una lista o un diccionario como valor por defecto (`def agregar(item, lista=[])`). Esa lista se crea **una sola vez** y se comparte entre todas las llamadas. Usa `None`: `def agregar(item, lista=None):` y dentro `if lista is None: lista = []`.

## `*args`: cualquier número de argumentos

```python
def sumar(*numeros):
    total = 0
    for numero in numeros:
        total += numero
    return total

print(sumar(1, 2))           # 3
print(sumar(1, 2, 3, 4, 5))  # 15
```

El `*` recoge todos los argumentos en una **tupla**. Es como el parámetro *rest* (`...numeros`) de JavaScript. Por convención se llama `*args`, pero el nombre puede ser cualquiera.

## `**kwargs`: cualquier número de argumentos con nombre

```python
def crear_perfil(nombre, **datos):
    perfil = {"nombre": nombre}
    perfil.update(datos)
    return perfil

print(crear_perfil("Ana", ciudad="Lima", edad=28))
# {'nombre': 'Ana', 'ciudad': 'Lima', 'edad': 28}
```

Los `**` recogen los argumentos con nombre en un **diccionario**. Por convención se llama `**kwargs` (*keyword arguments*).

Y funcionan al revés para **repartir** una lista o un diccionario al llamar:

```python
numeros = [1, 2, 3]
print(sumar(*numeros))       # como sumar(1, 2, 3)

datos = {"ciudad": "Cusco", "edad": 31}
print(crear_perfil("Luis", **datos))
```

Es el *spread* de JavaScript.

## El alcance de las variables

Una variable creada **dentro** de una función solo existe ahí (como en JavaScript, lo viste en el post de scope):

```python
def calcular():
    resultado = 42
    return resultado

calcular()
print(resultado)   # ❌ NameError: name 'resultado' is not defined
```

Una función puede **leer** variables de fuera, pero si quiere **modificarlas** tiene que declararlo con `global`. Evítalo: una función que recibe datos y devuelve un resultado (una **función pura**) es mucho más fácil de entender y probar.

```python
# ❌ Depende de algo de fuera y lo cambia
total = 0
def sumar_al_total(cantidad):
    global total
    total += cantidad

# ✅ Recibe y devuelve
def sumar_al_total(total, cantidad):
    return total + cantidad
```

## Documentar: docstrings

Un texto entre triples comillas justo debajo del `def` es la **documentación** de la función. VS Code la muestra al pasar el ratón por encima:

```python
def calcular_imc(peso, altura):
    """Calcula el índice de masa corporal.

    peso: en kilogramos. altura: en metros.
    Devuelve el IMC redondeado a 1 decimal.
    """
    return round(peso / altura ** 2, 1)

help(calcular_imc)   # muestra la docstring
```

## Funciones como valores

En Python, como en JavaScript, una función es un valor más: se puede guardar en una variable o **pasar a otra función**.

```python
def en_mayusculas(texto):
    return texto.upper()

transformar = en_mayusculas       # sin paréntesis: la función, no su resultado
print(transformar("hola"))        # HOLA
```

### `lambda`: funciones de una línea

```python
doble = lambda x: x * 2
print(doble(5))   # 10
```

`lambda parámetros: expresión` crea una función pequeña sin nombre, como una *arrow function* de una línea. Solo puede tener **una expresión** (nada de varias líneas ni `if` de bloque). Su uso principal: pasarla a otras funciones.

```python
productos = [
    {"nombre": "Teclado", "precio": 120},
    {"nombre": "Mouse", "precio": 45},
    {"nombre": "Monitor", "precio": 800},
]

por_precio = sorted(productos, key=lambda p: p["precio"])
mas_caro = max(productos, key=lambda p: p["precio"])

print([p["nombre"] for p in por_precio])   # ['Mouse', 'Teclado', 'Monitor']
print(mas_caro["nombre"])                  # Monitor
```

También existen `map` y `filter`, como en JavaScript:

```python
precios = [120, 45, 800]
con_igv = list(map(lambda p: p * 1.18, precios))
baratos = list(filter(lambda p: p < 100, precios))
print(baratos)   # [45]
```

Aunque en Python se prefiere otra forma, más legible, para esto mismo: las **comprensiones de listas** (`[p for p in precios if p < 100]`). Tienen su propio post.

## Tu turno

1. Escribe `es_primo(n)` que devuelva `True` o `False`, y úsala para mostrar los primos del 1 al 50.
2. Escribe `formatear_precio(precio, moneda="S/", decimales=2)` y llámala con argumentos con nombre.
3. Escribe `promedio(*notas)` que acepte cualquier número de notas y devuelva la media (y `0` si no recibe ninguna).
4. Ordena una lista de alumnos (diccionarios con `nombre` y `nota`) de mayor a menor nota con `sorted` y una `lambda`.

## Errores comunes

- **Llamar a la función sin paréntesis** (`saludar` en vez de `saludar()`): no se ejecuta.
- **Olvidar el `return`** y recibir `None`.
- **Usar una lista como valor por defecto** (`lista=[]`): se comparte entre llamadas.
- **Poner un parámetro sin valor por defecto después de uno con valor**: `def f(a=1, b)` es un error.
- **`print` en vez de `return`**: la función muestra el resultado pero no lo devuelve, y no puedes usarlo después.

## Para profundizar

- [Definir funciones (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/controlflow.html#defining-functions)

En resumen: una función se define con **`def`**, recibe **parámetros** y devuelve un valor con **`return`** (o `None`). Los parámetros pueden tener **valor por defecto** (nunca una lista) y se pueden pasar **por nombre**. **`*args`** recoge argumentos sueltos en una tupla y **`**kwargs`** argumentos con nombre en un diccionario. Las funciones son valores: se pasan a otras como `sorted(..., key=lambda p: p["precio"])`.
