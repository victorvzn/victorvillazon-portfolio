---
title: 'Python: comprensiones de listas, diccionarios y sets'
description: 'La forma "pythónica" de transformar y filtrar colecciones en una línea: list comprehensions, condiciones, diccionarios y sets por comprensión, expresiones generadoras, zip, any y all, y cuándo no usarlas.'
date: 2026-11-27
series: python
tags: [Python, Comprensiones, Intermedio]
draft: true
---

En JavaScript transformas arrays con `map` y `filter`. Python también los tiene, pero casi nadie los usa. En su lugar, verás por todas partes algo así:

```python
cuadrados = [n * n for n in range(1, 6)]
print(cuadrados)   # [1, 4, 9, 16, 25]
```

Es una **comprensión de lista** (*list comprehension*): crear una lista nueva a partir de otra, en una línea que se lee casi como una frase. Es una de las cosas más características de Python, y la vas a encontrar en cualquier código profesional.

## De un bucle a una comprensión

Con lo que ya sabes, para crear una lista con los precios con IGV harías:

```python
precios = [100, 45, 800]

con_igv = []
for precio in precios:
    con_igv.append(precio * 1.18)
```

La comprensión hace lo mismo:

```python
con_igv = [precio * 1.18 for precio in precios]
```

Se lee **de izquierda a derecha**: "dame `precio * 1.18` **para cada** `precio` **en** `precios`".

La estructura siempre es:

```python
[expresion for elemento in coleccion]
```

## Filtrar con `if`

Añade un `if` al final para quedarte solo con algunos elementos:

```python
numeros = range(1, 21)

pares = [n for n in numeros if n % 2 == 0]
print(pares)   # [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

productos = [
    {"nombre": "Teclado", "precio": 120, "stock": 5},
    {"nombre": "Mouse", "precio": 45, "stock": 0},
    {"nombre": "Monitor", "precio": 800, "stock": 2},
]

disponibles = [p["nombre"] for p in productos if p["stock"] > 0]
print(disponibles)   # ['Teclado', 'Monitor']
```

La segunda equivale a `productos.filter(p => p.stock > 0).map(p => p.nombre)` en JavaScript: filtrar y transformar a la vez.

## Transformar con `if ... else`

Si quieres **cambiar** cada elemento según una condición (no descartarlo), el `if ... else` va **delante**, porque es parte de la expresión:

```python
notas = [15, 9, 18, 10, 12]

resultados = ["Aprobado" if nota >= 11 else "Desaprobado" for nota in notas]
print(resultados)   # ['Aprobado', 'Desaprobado', 'Aprobado', 'Desaprobado', 'Aprobado']
```

La regla para no liarte:

| Quiero... | Dónde va el `if` | Ejemplo |
| --- | --- | --- |
| **Filtrar** (descartar algunos) | Al **final** | `[n for n in lista if n > 0]` |
| **Elegir el valor** de cada uno | **Delante**, con `else` | `[n if n > 0 else 0 for n in lista]` |

## Comprensiones de diccionarios

Lo mismo, pero con llaves y `clave: valor`:

```python
productos = ["teclado", "mouse", "monitor"]
precios = [120, 45, 800]

# zip junta dos listas elemento a elemento
catalogo = {nombre: precio for nombre, precio in zip(productos, precios)}
print(catalogo)   # {'teclado': 120, 'mouse': 45, 'monitor': 800}

# Transformar los valores de un diccionario
con_descuento = {nombre: precio * 0.9 for nombre, precio in catalogo.items()}

# Filtrar un diccionario
baratos = {nombre: precio for nombre, precio in catalogo.items() if precio < 200}
print(baratos)    # {'teclado': 120, 'mouse': 45}

# Invertir claves y valores
codigos = {"PE": "Perú", "MX": "México"}
por_nombre = {pais: codigo for codigo, pais in codigos.items()}
```

`zip(a, b)` empareja los elementos de dos listas: `("teclado", 120)`, `("mouse", 45)`... Muy útil también en bucles normales.

## Comprensiones de sets

Con llaves y sin `:`, se crea un set (sin repetidos):

```python
emails = ["ana@gmail.com", "luis@outlook.com", "maria@gmail.com"]
dominios = {email.split("@")[1] for email in emails}
print(dominios)   # {'gmail.com', 'outlook.com'}
```

## Bucles anidados

Puedes encadenar varios `for`, en el **mismo orden** en que los escribirías anidados:

```python
tallas = ["S", "M", "L"]
colores = ["negro", "blanco"]

variantes = [f"{color}-{talla}" for color in colores for talla in tallas]
print(variantes)
# ['negro-S', 'negro-M', 'negro-L', 'blanco-S', 'blanco-M', 'blanco-L']

# Aplanar una lista de listas
matriz = [[1, 2], [3, 4], [5, 6]]
plana = [numero for fila in matriz for numero in fila]
print(plana)   # [1, 2, 3, 4, 5, 6]
```

Con más de dos `for`, mejor un bucle normal: se vuelve ilegible.

## Expresiones generadoras: sin crear la lista

Si cambias los corchetes por **paréntesis**, no se crea una lista: se crea un **generador**, que calcula los valores de uno en uno, solo cuando hacen falta. Ideal para pasárselo directamente a funciones como `sum`, `max`, `any` o `all`:

```python
carrito = [
    {"producto": "Teclado", "precio": 120, "cantidad": 1},
    {"producto": "Mouse", "precio": 45, "cantidad": 2},
]

total = sum(item["precio"] * item["cantidad"] for item in carrito)
print(total)   # 210
```

No se crea ninguna lista intermedia en memoria: con millones de elementos, la diferencia es enorme. (Cuando pasas un generador como único argumento, puedes quitar los paréntesis extra.)

### `any` y `all`

```python
notas = [15, 18, 9, 20]

print(any(nota < 11 for nota in notas))   # True: ¿alguna desaprobada?
print(all(nota >= 11 for nota in notas))  # False: ¿todas aprobadas?
```

Son el `some` y el `every` de JavaScript (los viste en el post de `find`, `some`, `every` e `includes`).

## Cuándo NO usar una comprensión

Las comprensiones son para **crear una colección**. No las uses:

- **Para efectos secundarios.** `[print(x) for x in lista]` funciona, pero crea una lista de `None` que no sirve para nada. Para hacer algo con cada elemento, usa un `for`.
- **Cuando la lógica es larga.** Si necesitas varios `if`, varios `for` o no cabe en una línea legible, un bucle normal se entiende mejor. La legibilidad es lo primero en Python.

```python
# ❌ Demasiado
resultado = [x * 2 if x > 0 else -x for fila in datos for x in fila if x != 0 and x % 3 != 0]

# ✅ Un bucle con nombres claros, o una función auxiliar
```

## Tu turno

1. Dada una lista de nombres, crea con una comprensión otra con los que tienen más de 4 letras, en mayúsculas.
2. Dado `{"Ana": 15, "Luis": 9, "María": 18}`, crea un diccionario `{nombre: "Aprobado"/"Desaprobado"}`.
3. Calcula con `sum` y una expresión generadora la suma de los cuadrados de los números del 1 al 100.
4. Dado un texto, crea un diccionario con cuántas veces aparece cada palabra (pista: un set con las palabras únicas y `texto.split().count(palabra)`).

## Errores comunes

- **Poner el `if ... else` al final**: `[x for x in lista if x > 0 else 0]` es un error de sintaxis. Si lleva `else`, va delante.
- **Confundir `{x for ...}` (set) con `{k: v for ...}` (diccionario).**
- **Usar corchetes donde basta un generador**: `sum([x for x in ...])` crea una lista innecesaria; `sum(x for x in ...)` no.
- **Comprensiones con efectos secundarios** (`print`, `append` a otra lista).
- **Comprensiones ilegibles** de tres líneas. Usa un bucle.

## Para profundizar

- [Comprensión de listas (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/datastructures.html#list-comprehensions)

En resumen: una **comprensión** crea una colección a partir de otra en una línea: **`[expresion for x in coleccion if condicion]`**. El `if` del final **filtra**; un `if ... else` delante **elige el valor**. Con llaves creas **diccionarios** (`{k: v for ...}`) y **sets**, y con paréntesis una **expresión generadora** que no ocupa memoria, perfecta para **`sum`**, **`any`** y **`all`**. Si no cabe en una línea clara, usa un bucle.
