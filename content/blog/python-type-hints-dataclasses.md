---
title: 'Python moderno: type hints, dataclasses y Pydantic'
description: 'Cómo añadir tipos a tu código de Python, comprobarlos con mypy, tipos para listas, diccionarios, opcionales y uniones, dataclasses para clases de datos, Enum y Literal, y validar datos de verdad con Pydantic.'
date: 2026-11-27
series: python
tags: [Python, Type hints, Dataclasses, Pydantic, Avanzado]
draft: true
---

Python es un lenguaje **dinámico**: una variable puede ser un número ahora y un texto después, y nadie se queja hasta que el programa falla. En proyectos pequeños está bien. En proyectos grandes, con un equipo, es una fuente constante de bugs del tipo `'NoneType' object has no attribute 'nombre'`.

Si leíste la serie de TypeScript, ya conoces la solución: **añadir tipos**. Python también los tiene, se llaman **type hints** (pistas de tipo), y hoy los usa casi todo el código profesional.

## Type hints: anotar los tipos

```python
def calcular_total(precio: float, cantidad: int) -> float:
    return precio * cantidad

nombre: str = "Ana"
edad: int = 28
activo: bool = True
```

- **`parametro: tipo`** indica el tipo de cada parámetro.
- **`-> tipo`** indica lo que devuelve la función.
- **`variable: tipo = valor`** anota una variable (normalmente no hace falta: se deduce del valor).

### ¡Ojo! Python no los comprueba al ejecutar

```python
calcular_total("diez", 3)   # Python lo ejecuta sin quejarse: 'diezdiezdiez'
```

Los type hints son **pistas**: Python los **ignora** al ejecutar. Sirven para:

1. Que **el editor** te avise y te autocomplete (VS Code con la extensión Python/Pylance los usa).
2. Que una herramienta como **mypy** revise todo el proyecto **antes** de ejecutarlo.
3. **Documentar**: `def enviar(usuario: Usuario) -> bool` se explica solo.
4. Que librerías como **FastAPI** y **Pydantic** los usen para validar datos (lo verás abajo).

Es la misma idea que TypeScript, con una diferencia: TypeScript se compila y se niega a compilar con errores; en Python los tipos son opcionales y el programa se ejecuta igual.

### Comprobar con mypy

```bash
pip install mypy
mypy mi_programa.py
```

```bash
mi_programa.py:4: error: Argument 1 to "calcular_total" has incompatible type "str"; expected "float"
```

Muchos equipos lo ejecutan en CI (lo viste en el post de GitHub Actions de la serie de Testing), igual que los tests.

## Tipos de colecciones

```python
nombres: list[str] = ["Ana", "Luis"]
precios: dict[str, float] = {"teclado": 120.0, "mouse": 45.5}
punto: tuple[int, int] = (3, 7)
etiquetas: set[str] = {"python", "web"}

def promedio(notas: list[float]) -> float:
    return sum(notas) / len(notas)
```

### Opcionales y uniones

```python
def buscar_usuario(id: int) -> dict | None:
    ...
```

`dict | None` significa "un diccionario **o** `None`" (como las uniones de TypeScript). Con eso, el editor te avisará si haces `buscar_usuario(1)["nombre"]` sin comprobar antes que no sea `None`:

```python
usuario = buscar_usuario(1)
if usuario is not None:
    print(usuario["nombre"])
```

Uniones de otros tipos:

```python
def normalizar_id(id: int | str) -> str:
    return str(id).strip()
```

> En código antiguo verás `Optional[dict]` y `Union[int, str]` importados de `typing`. Es lo mismo; la forma con `|` es la moderna (Python 3.10+).

### Valores exactos con `Literal`

```python
from typing import Literal

Estado = Literal["pendiente", "enviado", "entregado"]

def cambiar_estado(pedido_id: int, estado: Estado) -> None:
    ...

cambiar_estado(1, "enviado")     # ✅
cambiar_estado(1, "perdido")     # ❌ mypy y el editor te avisan
```

`Estado = ...` es un **alias de tipo**: un nombre para no repetirlo (como `type` en TypeScript).

## dataclasses: clases de datos sin repetir código

Muchas clases solo sirven para **guardar datos**: un producto, un usuario, una coordenada. Escribirlas a mano es repetitivo:

```python
class Producto:
    def __init__(self, nombre, precio, stock=0):
        self.nombre = nombre
        self.precio = precio
        self.stock = stock

    def __repr__(self):
        return f"Producto(nombre={self.nombre!r}, precio={self.precio!r}, stock={self.stock!r})"

    def __eq__(self, otro):
        return (self.nombre, self.precio, self.stock) == (otro.nombre, otro.precio, otro.stock)
```

Con **`@dataclass`**, Python escribe todo eso por ti a partir de los type hints:

```python
from dataclasses import dataclass, field

@dataclass
class Producto:
    nombre: str
    precio: float
    stock: int = 0
    etiquetas: list[str] = field(default_factory=list)

    @property
    def disponible(self) -> bool:
        return self.stock > 0


teclado = Producto("Teclado", 120.0, stock=5)
print(teclado)                    # Producto(nombre='Teclado', precio=120.0, stock=5, etiquetas=[])
print(teclado == Producto("Teclado", 120.0, 5))   # True
print(teclado.disponible)         # True
```

- Genera **`__init__`**, **`__repr__`** (para que se vea bien al imprimir) y **`__eq__`** (compara por contenido).
- Puedes seguir añadiendo métodos y propiedades normales.
- **`field(default_factory=list)`**: para valores por defecto que son listas o diccionarios. Escribir `etiquetas: list[str] = []` da error, por el mismo motivo que viste en el post de funciones: esa lista se compartiría entre todos los objetos.

### Opciones útiles

```python
@dataclass(frozen=True)
class Coordenada:
    lat: float
    lng: float

lima = Coordenada(-12.05, -77.04)
lima.lat = 0    # ❌ FrozenInstanceError: no se puede modificar
```

**`frozen=True`** hace el objeto **inmutable**, como una tupla con nombres. Útil para valores que no deben cambiar (y permite usarlos como claves de un diccionario).

**`order=True`** genera `<`, `>`... para poder ordenar con `sorted()` comparando los campos en orden.

## `Enum`: un conjunto cerrado de opciones

```python
from enum import Enum

class Rol(Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    LECTOR = "lector"

@dataclass
class Usuario:
    nombre: str
    rol: Rol = Rol.LECTOR

ana = Usuario("Ana", Rol.ADMIN)
print(ana.rol, ana.rol.value)     # Rol.ADMIN admin
print(Rol("editor"))              # Rol.EDITOR: desde un texto (por ejemplo, de un JSON)

for rol in Rol:
    print(rol.name)
```

Un `Enum` agrupa constantes relacionadas. Frente a usar textos sueltos (`"admin"`), el editor te autocompleta y es imposible escribir `"amdin"` por error.

## Pydantic: tipos que validan de verdad

Las dataclasses **no validan**: `Producto("Teclado", "caro")` funciona aunque `precio` debería ser un número. Para datos que **vienen de fuera** (una API, un formulario, un JSON), necesitas validar al ejecutar.

Eso hace **Pydantic**, la librería de validación más usada de Python. Es el equivalente a **Zod** (si leíste la serie de TypeScript, te sonará todo):

```bash
pip install pydantic
```

```python
from pydantic import BaseModel, Field, ValidationError

class Usuario(BaseModel):
    nombre: str = Field(min_length=2)
    email: str
    edad: int = Field(ge=18)          # ge = greater or equal: mayor o igual que 18
    intereses: list[str] = []


# Datos que llegan de una API: la edad viene como texto
datos = {"nombre": "Ana", "email": "ana@correo.com", "edad": "28"}
usuario = Usuario(**datos)
print(usuario.edad, type(usuario.edad))   # 28 <class 'int'>: convertido y validado

try:
    Usuario(nombre="A", email="ana@correo.com", edad=15)
except ValidationError as error:
    print(error)
```

```bash
2 validation errors for Usuario
nombre
  String should have at least 2 characters [type=string_too_short, ...]
edad
  Input should be greater than or equal to 18 [type=greater_than_equal, ...]
```

- Defines la forma de los datos **con type hints** normales, heredando de **`BaseModel`**.
- **`Field(...)`** añade restricciones: `min_length`, `max_length`, `ge`, `le`, `pattern`...
- Pydantic **convierte** cuando tiene sentido (`"28"` → `28`) y **lanza un `ValidationError`** con todos los problemas cuando no.

Lo más práctico: convertir de y a JSON.

```python
usuario = Usuario.model_validate_json('{"nombre": "Luis", "email": "luis@correo.com", "edad": 30}')
print(usuario.model_dump())        # un diccionario normal
print(usuario.model_dump_json())   # texto JSON, listo para enviar
```

(`EmailStr` valida emails de verdad, pero necesita instalar un extra: `pip install "pydantic[email]"`. Aquí usamos `str` para no complicarlo.)

## ¿Cuál uso?

| Necesitas | Usa |
| --- | --- |
| Documentar y que el editor te ayude | **Type hints** (en todas partes) |
| Una clase que guarda datos de tu propio código | **`@dataclass`** |
| Un conjunto cerrado de opciones | **`Enum`** o **`Literal`** |
| Validar datos que **vienen de fuera** | **Pydantic** |

Pydantic es además la base de **FastAPI**, que verás en el último post del módulo: allí estos modelos validan automáticamente cada petición a tu API.

## Tu turno

1. Añade type hints a todas las funciones de un programa tuyo y ejecuta `mypy`. Corrige lo que te señale.
2. Crea una `@dataclass` `Pedido` con `id`, `cliente`, una lista de `Producto` y un `estado` de tipo `Enum`, con un método `total()`.
3. Crea un modelo de Pydantic `Registro` con nombre, email, contraseña (mínimo 8 caracteres) y edad, y valida un diccionario con errores. Muestra cada error.
4. Lee un archivo JSON con una lista de usuarios y valídalo con `[Usuario.model_validate(u) for u in datos]`.

## Errores comunes

- **Creer que Python valida los type hints al ejecutar.** No lo hace; para eso, mypy (antes) o Pydantic (al ejecutar).
- **`list[str] = []` en una dataclass**: da error. Usa `field(default_factory=list)`.
- **Usar `list[str]` en versiones muy antiguas de Python** (antes de la 3.9): ahí era `List[str]` importado de `typing`.
- **Validar con dataclasses** datos que vienen de fuera. Usa Pydantic.
- **Usar `Any` en todas partes**: como el `any` de TypeScript, apaga la comprobación.

## Para profundizar

- [`typing`: soporte para type hints (documentación oficial, en español)](https://docs.python.org/es/3/library/typing.html)
- [`dataclasses` (documentación oficial, en español)](https://docs.python.org/es/3/library/dataclasses.html)
- [Documentación de Pydantic (en inglés)](https://docs.pydantic.dev)

En resumen: los **type hints** (`precio: float`, `-> str`, `dict | None`, `Literal[...]`) documentan tu código y permiten que el **editor** y **mypy** detecten errores antes de ejecutar, pero **Python no los comprueba**. **`@dataclass`** genera `__init__`, `__repr__` y `__eq__` para clases de datos, **`Enum`** agrupa opciones cerradas y **Pydantic** usa los mismos type hints para **validar y convertir** datos reales, como Zod en TypeScript.
