---
title: 'Python: listas, tuplas, diccionarios y sets'
description: 'Las cuatro colecciones de Python y cuándo usar cada una: listas y sus métodos, slicing, tuplas inmutables y desempaquetado, diccionarios con get, items y anidados, y sets para quitar duplicados.'
date: 2026-11-27
series: python
tags: [Python, Listas, Diccionarios, Fundamentos]
draft: true
---

Una variable guarda un dato. Pero un carrito tiene muchos productos, un usuario tiene nombre, email y edad, y una lista de etiquetas no debe tener repetidas. Python tiene **cuatro colecciones** para esto, y elegir bien cuál usar hace tu código mucho más claro.

| Colección | Se escribe | ¿Ordenada? | ¿Se puede cambiar? | ¿Repetidos? | Equivale en JS a |
| --- | --- | --- | --- | --- | --- |
| **Lista** | `[1, 2, 3]` | Sí | Sí | Sí | Array |
| **Tupla** | `(1, 2, 3)` | Sí | **No** | Sí | Array congelado |
| **Diccionario** | `{"a": 1}` | Sí | Sí | Claves únicas | Objeto / `Map` |
| **Set** | `{1, 2, 3}` | No | Sí | **No** | `Set` |

## Listas

La colección más usada: una secuencia ordenada que puedes modificar.

```python
compras = ["pan", "leche", "huevos"]

print(compras[0])      # pan
print(compras[-1])     # huevos (el último)
print(len(compras))    # 3

compras.append("café")           # añade al final
compras.insert(0, "frutas")      # añade en una posición
compras.remove("leche")          # quita por valor
ultimo = compras.pop()           # quita y devuelve el último
compras[0] = "manzanas"          # cambia un elemento

print(compras)          # ['manzanas', 'pan', 'huevos']
print("pan" in compras) # True
```

### Slicing: trozos de una lista

```python
numeros = [10, 20, 30, 40, 50, 60]

print(numeros[1:4])    # [20, 30, 40]: del 1 al 4, sin incluirlo
print(numeros[:3])     # [10, 20, 30]: los 3 primeros
print(numeros[3:])     # [40, 50, 60]: desde el 3
print(numeros[-2:])    # [50, 60]: los 2 últimos
print(numeros[::2])    # [10, 30, 50]: de 2 en 2
print(numeros[::-1])   # [60, 50, 40, 30, 20, 10]: al revés
```

### Ordenar y otras funciones útiles

```python
notas = [15, 18, 11, 20, 14]

print(sorted(notas))                # [11, 14, 15, 18, 20]: una lista NUEVA
print(sorted(notas, reverse=True))  # de mayor a menor
print(notas)                        # la original no cambia

notas.sort()                        # ordena la MISMA lista (la modifica)

print(sum(notas), max(notas), min(notas))   # 78 20 11
print(sum(notas) / len(notas))              # 15.6: la media
```

`sorted()` devuelve una lista nueva (como `toSorted` en JavaScript) y `.sort()` modifica la original (como `sort`).

Ordenar objetos por un campo, con `key`:

```python
productos = [("Teclado", 120), ("Mouse", 45), ("Monitor", 800)]
print(sorted(productos, key=lambda p: p[1]))
# [('Mouse', 45), ('Teclado', 120), ('Monitor', 800)]
```

`lambda p: p[1]` es una función pequeña sin nombre, como `(p) => p[1]` en JavaScript. La verás a fondo en el post de funciones.

### Unir y repetir

```python
print([1, 2] + [3, 4])   # [1, 2, 3, 4]
print([0] * 5)           # [0, 0, 0, 0, 0]
print(", ".join(["HTML", "CSS", "JS"]))   # HTML, CSS, JS
print("a,b,c".split(","))                 # ['a', 'b', 'c']
```

Fíjate en que `join` es un método **del texto separador**, no de la lista: al revés que en JavaScript.

## Tuplas

Una tupla es como una lista, pero **no se puede modificar** una vez creada. Se usa para datos que van juntos y no deben cambiar: unas coordenadas, un color RGB, una fecha.

```python
punto = (3, 7)
color = (251, 191, 36)

print(punto[0])     # 3
punto[0] = 10       # ❌ TypeError: 'tuple' object does not support item assignment
```

### Desempaquetar

Lo más útil de las tuplas (y de las listas): repartir sus valores en variables, como la desestructuración de JavaScript.

```python
x, y = punto
print(x, y)   # 3 7

rojo, verde, azul = color

# Intercambiar dos variables, sin variable auxiliar
a, b = 1, 2
a, b = b, a
print(a, b)   # 2 1

# El * recoge el resto
primero, *resto = [10, 20, 30, 40]
print(primero, resto)   # 10 [20, 30, 40]
```

Las funciones devuelven varios valores así: en realidad devuelven una tupla.

## Diccionarios

Un diccionario guarda pares **clave → valor**. Es el equivalente a los objetos de JavaScript.

```python
usuario = {
    "nombre": "Ana",
    "edad": 28,
    "email": "ana@correo.com",
    "lenguajes": ["Python", "JavaScript"]
}

print(usuario["nombre"])          # Ana
usuario["edad"] = 29              # modificar
usuario["ciudad"] = "Lima"        # añadir
del usuario["email"]              # borrar

print("ciudad" in usuario)        # True: ¿existe esa clave?
```

Las claves van **entre comillas** (son textos) y se accede con corchetes, no con punto: `usuario["nombre"]`, no `usuario.nombre`.

### `get`: leer sin errores

```python
print(usuario["telefono"])            # ❌ KeyError: 'telefono'
print(usuario.get("telefono"))        # None
print(usuario.get("telefono", "-"))   # -: con valor por defecto
```

Usa `.get()` siempre que una clave pueda no existir. Es como el `?.` y el `??` de JavaScript juntos.

### Recorrer un diccionario

```python
precios = {"teclado": 120, "mouse": 45, "monitor": 800}

for producto in precios:                  # recorre las claves
    print(producto)

for producto, precio in precios.items():  # claves y valores
    print(f"{producto}: S/ {precio}")

print(list(precios.keys()))     # ['teclado', 'mouse', 'monitor']
print(list(precios.values()))   # [120, 45, 800]
print(sum(precios.values()))    # 965
```

`.items()` es como `Object.entries()` en JavaScript (está en el post de `Object.keys`, `values` y `entries`).

### Listas de diccionarios: lo que devuelve una API

El formato que más verás en la vida real (el JSON de una API se convierte en esto):

```python
tareas = [
    {"id": 1, "texto": "Estudiar Python", "hecha": False},
    {"id": 2, "texto": "Hacer ejercicio", "hecha": True},
    {"id": 3, "texto": "Leer", "hecha": False},
]

pendientes = 0
for tarea in tareas:
    estado = "✅" if tarea["hecha"] else "⬜"
    print(f"{estado} {tarea['texto']}")
    if not tarea["hecha"]:
        pendientes += 1

print(f"Te quedan {pendientes} tareas")
```

Ojo con las comillas dentro de un f-string: si el f-string usa comillas dobles, usa simples para la clave (`tarea['texto']`).

### Unir diccionarios

```python
por_defecto = {"tema": "claro", "idioma": "es"}
preferencias = {"tema": "oscuro"}

config = por_defecto | preferencias   # el de la derecha gana
print(config)   # {'tema': 'oscuro', 'idioma': 'es'}
```

Es como `{ ...porDefecto, ...preferencias }` en JavaScript.

## Sets

Un set es una colección **sin repetidos** y sin orden. Perfecto para quitar duplicados o comprobar si algo está, muy rápido:

```python
etiquetas = ["python", "web", "python", "api", "web"]
unicas = set(etiquetas)
print(unicas)          # {'python', 'web', 'api'} (el orden puede variar)
print(len(unicas))     # 3

visitados = set()
visitados.add("inicio")
visitados.add("inicio")   # no se duplica
print(visitados)          # {'inicio'}

# Operaciones de conjuntos
frontend = {"HTML", "CSS", "JavaScript"}
backend = {"Python", "JavaScript", "SQL"}

print(frontend & backend)   # {'JavaScript'}: en los dos
print(frontend | backend)   # todos, sin repetir
print(frontend - backend)   # {'HTML', 'CSS'}: solo en frontend
```

> `{}` vacío es un **diccionario**, no un set. Un set vacío se crea con `set()`.

## ¿Cuál uso?

- **Lista**: una colección de cosas del mismo tipo, en orden, que va a cambiar (productos, tareas).
- **Tupla**: un grupo fijo de valores que van juntos (coordenadas, un registro que no cambia).
- **Diccionario**: algo con propiedades con nombre (un usuario) o para buscar por clave (precio de cada producto).
- **Set**: elementos únicos, o comprobar muy rápido si algo está en un grupo grande.

## Tu turno

1. Crea una lista de 10 notas y muestra la media, la nota más alta, la más baja y cuántos aprobaron (nota >= 11).
2. Crea un diccionario de inventario `{producto: cantidad}`. Escribe un programa que pida un producto y una cantidad a vender y actualice el stock, avisando si no hay suficiente o si el producto no existe.
3. Dadas dos listas de alumnos (los que se apuntaron a Python y los que se apuntaron a JavaScript), muestra con sets quiénes hacen los dos cursos y quiénes solo uno.

## Errores comunes

- **`KeyError`** al leer una clave que no existe. Usa `.get()` o comprueba con `in`.
- **`IndexError: list index out of range`**: el índice no existe. Una lista de 3 elementos llega hasta el índice 2.
- **Usar `usuario.nombre`** como en JavaScript. En un diccionario es `usuario["nombre"]`.
- **Confundir `sorted()` con `.sort()`**: `.sort()` no devuelve nada (`None`), modifica la lista.
- **`{}` para un set vacío.** Es un diccionario; usa `set()`.
- **Modificar una lista mientras la recorres** con `for`: se saltan elementos. Recorre una copia (`for x in lista[:]`) o crea una lista nueva.

## Para profundizar

- [Estructuras de datos (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/datastructures.html)

En resumen: las **listas** (`[]`) son secuencias ordenadas y modificables, con **slicing** para sacar trozos. Las **tuplas** (`()`) son fijas y se **desempaquetan** en variables. Los **diccionarios** (`{"clave": valor}`) guardan pares clave-valor y se leen con **`.get()`** para evitar errores. Los **sets** (`set()`) no tienen repetidos y hacen operaciones de conjuntos.
