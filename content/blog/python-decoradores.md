---
title: 'Decoradores en Python: qué son y cómo crear los tuyos'
description: 'Funciones que reciben y devuelven funciones, closures, qué hace realmente la @, decoradores para medir tiempo, registrar llamadas, reintentar y cachear, functools.wraps, decoradores con parámetros y los que ya trae Python (lru_cache, property, staticmethod).'
date: 2026-11-27
series: python
tags: [Python, Decoradores, Avanzado]
draft: true
---

En el código de Python profesional verás líneas con `@` encima de las funciones:

```python
@app.get("/productos")
def listar_productos():
    ...

@lru_cache
def calcular(n):
    ...
```

Son **decoradores**: una forma de **añadir comportamiento a una función sin tocar su código**. Medir cuánto tarda, registrar cada llamada, comprobar permisos, reintentar si falla, guardar resultados en caché... Todo con una línea encima.

Para entenderlos, necesitas dos ideas que ya conoces de JavaScript.

## Idea 1: las funciones son valores

Una función se puede pasar a otra función y se puede devolver desde otra función (lo viste en el post de funciones, y en JavaScript, en el de funciones de orden superior).

```python
def gritar(texto):
    return texto.upper() + "!"

def aplicar(funcion, valor):
    return funcion(valor)

print(aplicar(gritar, "hola"))   # HOLA!
```

## Idea 2: closures

Una función definida **dentro** de otra recuerda las variables de la función de fuera, incluso cuando esta ya terminó (es el mismo concepto del post de closures en JavaScript):

```python
def crear_multiplicador(factor):
    def multiplicar(numero):
        return numero * factor     # recuerda "factor"
    return multiplicar

doble = crear_multiplicador(2)
triple = crear_multiplicador(3)
print(doble(5), triple(5))   # 10 15
```

## Tu primer decorador

Un **decorador** es una función que **recibe una función** y **devuelve otra función** que la envuelve:

```python
def anunciar(funcion):
    def envoltura():
        print(f"▶ Voy a ejecutar {funcion.__name__}")
        funcion()
        print(f"✔ Terminé {funcion.__name__}")
    return envoltura

def saludar():
    print("¡Hola!")

saludar = anunciar(saludar)   # reemplazamos saludar por su versión envuelta
saludar()
# ▶ Voy a ejecutar saludar
# ¡Hola!
# ✔ Terminé saludar
```

La línea `saludar = anunciar(saludar)` es justo lo que hace la `@`. Esto es exactamente lo mismo:

```python
@anunciar
def saludar():
    print("¡Hola!")
```

**`@anunciar` encima de una función significa `funcion = anunciar(funcion)`.** No hay más magia.

## Que funcione con cualquier función: `*args` y `**kwargs`

Nuestra `envoltura` no acepta argumentos ni devuelve nada. Para que el decorador sirva para **cualquier** función, usa `*args` y `**kwargs` (los viste en el post de funciones) y devuelve el resultado:

```python
import functools

def registrar(funcion):
    @functools.wraps(funcion)
    def envoltura(*args, **kwargs):
        print(f"Llamando a {funcion.__name__} con {args} {kwargs}")
        resultado = funcion(*args, **kwargs)
        print(f"{funcion.__name__} devolvió {resultado!r}")
        return resultado
    return envoltura

@registrar
def sumar(a, b):
    return a + b

@registrar
def saludar(nombre, saludo="Hola"):
    return f"{saludo}, {nombre}"

sumar(2, 3)
saludar("Ana", saludo="Buenas")
```

**`@functools.wraps(funcion)`** copia el nombre, la docstring y otros datos de la función original a la envoltura. Sin él, `sumar.__name__` sería `"envoltura"`, y las herramientas de depuración y documentación se confundirían. **Ponlo siempre.**

Esta es la plantilla de casi todos los decoradores:

```python
def mi_decorador(funcion):
    @functools.wraps(funcion)
    def envoltura(*args, **kwargs):
        # antes
        resultado = funcion(*args, **kwargs)
        # después
        return resultado
    return envoltura
```

## Decoradores útiles de verdad

### Medir el tiempo

```python
import functools
import time

def cronometrar(funcion):
    @functools.wraps(funcion)
    def envoltura(*args, **kwargs):
        inicio = time.perf_counter()
        resultado = funcion(*args, **kwargs)
        duracion = time.perf_counter() - inicio
        print(f"⏱ {funcion.__name__} tardó {duracion * 1000:.1f} ms")
        return resultado
    return envoltura

@cronometrar
def contar_primos(limite):
    return sum(1 for n in range(2, limite) if all(n % d for d in range(2, int(n ** 0.5) + 1)))

print(contar_primos(50_000))
```

### Comprobar permisos

```python
def solo_admin(funcion):
    @functools.wraps(funcion)
    def envoltura(usuario, *args, **kwargs):
        if usuario.get("rol") != "admin":
            raise PermissionError(f"{usuario['nombre']} no tiene permiso")
        return funcion(usuario, *args, **kwargs)
    return envoltura

@solo_admin
def borrar_producto(usuario, producto_id):
    print(f"Producto {producto_id} borrado por {usuario['nombre']}")

borrar_producto({"nombre": "Ana", "rol": "admin"}, 7)
try:
    borrar_producto({"nombre": "Luis", "rol": "lector"}, 7)
except PermissionError as error:
    print(error)
```

Es la misma idea que un **middleware** de Express (lo viste en su post): código que se ejecuta antes de la función principal y puede cortarla.

## Decoradores con parámetros

¿Y si quieres configurar el decorador, como `@reintentar(veces=3)`? Necesitas **un nivel más**: una función que recibe los parámetros y **devuelve el decorador**.

```python
import functools
import random

def reintentar(veces=3):
    def decorador(funcion):
        @functools.wraps(funcion)
        def envoltura(*args, **kwargs):
            for intento in range(1, veces + 1):
                try:
                    return funcion(*args, **kwargs)
                except ConnectionError as error:
                    print(f"Intento {intento} falló: {error}")
                    if intento == veces:
                        raise
        return envoltura
    return decorador

@reintentar(veces=5)
def llamar_api():
    if random.random() < 0.7:
        raise ConnectionError("el servidor no responde")
    return "✅ datos recibidos"

try:
    print(llamar_api())
except ConnectionError:
    print("Ningún intento funcionó")
```

`@reintentar(veces=5)` primero **llama** a `reintentar(veces=5)`, que devuelve `decorador`, y luego se aplica como `llamar_api = decorador(llamar_api)`. Tres funciones anidadas: la de los parámetros, el decorador y la envoltura.

`raise` sin nada más vuelve a lanzar el error que se estaba manejando.

## Los decoradores que ya trae Python

### `@functools.lru_cache` y `@functools.cache`: memorizar resultados

```python
from functools import cache

@cache
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(100))   # 354224848179261915075, al instante
```

Sin `@cache`, `fibonacci(100)` haría billones de llamadas repetidas y no terminaría nunca. Con él, guarda el resultado de cada `n` y lo reutiliza. Es la **memoización** (está en la serie de pruebas técnicas, en JavaScript). `@lru_cache(maxsize=128)` hace lo mismo pero limita cuántos resultados guarda.

Solo sirve para **funciones puras**: si el resultado depende de algo más que de los argumentos (la hora, una base de datos), devolverá datos viejos.

### Decoradores en las clases

```python
class Temperatura:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def fahrenheit(self):              # se lee como atributo: t.fahrenheit
        return self._celsius * 9 / 5 + 32

    @staticmethod
    def es_valida(celsius):            # no usa self: una función agrupada en la clase
        return celsius >= -273.15

    @classmethod
    def desde_fahrenheit(cls, f):      # recibe la clase: un constructor alternativo
        return cls((f - 32) * 5 / 9)


t = Temperatura.desde_fahrenheit(212)
print(t.fahrenheit, Temperatura.es_valida(-300))   # 212.0 False
```

- **`@property`**: un método que se lee como atributo (lo viste en el post de POO).
- **`@staticmethod`**: un método que no necesita ni el objeto ni la clase.
- **`@classmethod`**: recibe la **clase** (`cls`) en vez del objeto; se usa para constructores alternativos.

### En frameworks

Así se ven los decoradores en el mundo real:

```python
@app.get("/productos/{id}")          # FastAPI: conecta la función con una ruta HTTP
def obtener_producto(id: int): ...

@pytest.fixture                       # pytest: prepara datos para los tests
def usuario_de_prueba(): ...

@dataclass                            # convierte una clase en un contenedor de datos
class Producto: ...
```

Ahora que sabes que `@algo` es `funcion = algo(funcion)`, ya no hay magia: es una función que envuelve a otra.

## Apilar decoradores

```python
@cronometrar
@registrar
def sumar(a, b):
    return a + b
```

Se aplican **de abajo arriba**: equivale a `sumar = cronometrar(registrar(sumar))`. El de más arriba es la capa más externa.

## Tu turno

1. Escribe `@validar_positivos` que lance un `ValueError` si algún argumento numérico es negativo.
2. Escribe `@contar_llamadas` que guarde en un atributo de la función (`envoltura.llamadas`) cuántas veces se ha llamado.
3. Escribe `@limitar(maximo=3)` que lance un error si la función se llama más de `maximo` veces.
4. Compara cuánto tarda `fibonacci(35)` con y sin `@cache` usando tu `@cronometrar`.

## Errores comunes

- **Olvidar devolver el resultado** en la envoltura: la función decorada devuelve `None`.
- **Olvidar `return envoltura`**: el decorador devuelve `None` y la función desaparece (`TypeError: 'NoneType' object is not callable`).
- **No usar `functools.wraps`**: la función pierde su nombre y su docstring.
- **Escribir `@reintentar` sin paréntesis** cuando el decorador lleva parámetros: hay que escribir `@reintentar()` o `@reintentar(veces=3)`.
- **Usar `@cache` en funciones que no son puras.**

## Para profundizar

- [`functools` (documentación oficial, en español)](https://docs.python.org/es/3/library/functools.html)
- [Primer on Python Decorators, de Real Python (en inglés)](https://realpython.com/primer-on-python-decorators/)

En resumen: un **decorador** es una función que **recibe una función y devuelve otra que la envuelve**, y **`@decorador`** es solo una forma corta de escribir `funcion = decorador(funcion)`. La envoltura usa **`*args` y `**kwargs`**, devuelve el resultado y lleva **`@functools.wraps`**. Para darle parámetros, añade un nivel más de función. Python trae decoradores muy útiles como **`@cache`**, **`@property`**, **`@staticmethod`** y **`@classmethod`**, y frameworks como FastAPI se construyen sobre ellos.
