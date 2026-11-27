---
title: 'Programación orientada a objetos en Python: clases, herencia y métodos especiales'
description: 'Qué es la POO y sus cuatro pilares, cómo crear clases con __init__ y self, atributos de clase e instancia, encapsulamiento con propiedades, herencia y super, polimorfismo, métodos especiales como __str__ y __eq__, y composición frente a herencia.'
date: 2026-11-27
series: python
tags: [Python, POO, Clases, Intermedio]
draft: true
---

Imagina un programa de un banco. Tienes cuentas, y cada cuenta tiene un titular, un saldo y unas operaciones: depositar, retirar, consultar. Puedes guardar cada cuenta en un diccionario y escribir funciones sueltas que reciban ese diccionario... pero nada impide que alguien haga `cuenta["saldo"] = -1000000`.

La **programación orientada a objetos** (POO) propone juntar **los datos y las operaciones** que van juntos en una sola pieza: un **objeto**. Y ese objeto protege sus propias reglas.

## Clase y objeto

- Una **clase** es el **molde**: describe qué datos y qué operaciones tiene algo. `CuentaBancaria`.
- Un **objeto** (o **instancia**) es cada cosa concreta creada con ese molde. La cuenta de Ana, la cuenta de Luis.

```python
class CuentaBancaria:
    def __init__(self, titular, saldo=0):
        self.titular = titular
        self.saldo = saldo

    def depositar(self, cantidad):
        self.saldo += cantidad

    def mostrar(self):
        print(f"{self.titular}: S/ {self.saldo:.2f}")


cuenta_ana = CuentaBancaria("Ana", 500)
cuenta_luis = CuentaBancaria("Luis")

cuenta_ana.depositar(200)
cuenta_ana.mostrar()    # Ana: S/ 700.00
cuenta_luis.mostrar()   # Luis: S/ 0.00
```

Las piezas:

- **`class CuentaBancaria:`** define la clase. Los nombres de clase van en **PascalCase** (no en snake_case).
- **`__init__`** es el **constructor**: se ejecuta al crear el objeto y prepara sus datos. (Como el `constructor` de las clases de JavaScript.)
- **`self`** es **el propio objeto**. `self.saldo` es "el saldo de **esta** cuenta". Es el equivalente a `this` en JavaScript, pero en Python **se escribe explícitamente** como primer parámetro de cada método.
- **Los atributos** (`self.titular`, `self.saldo`) son los datos de cada objeto.
- **Los métodos** (`depositar`, `mostrar`) son las funciones que pertenecen a la clase.

Cuando llamas a `cuenta_ana.depositar(200)`, Python pasa `cuenta_ana` como `self` automáticamente.

## Los cuatro pilares de la POO

Seguro que en una entrevista te los preguntan. Vamos con cada uno, con código.

### 1. Encapsulamiento: proteger los datos

Un objeto debe **controlar cómo se modifican sus datos**. Ahora mismo, cualquiera puede escribir `cuenta_ana.saldo = -999`.

En Python no hay `private` como en otros lenguajes. Se usa una **convención**: un guion bajo delante del nombre (`_saldo`) significa "esto es interno, no lo toques desde fuera". Y para leerlo de forma controlada se usa una **propiedad**:

```python
class CuentaBancaria:
    def __init__(self, titular, saldo=0):
        self.titular = titular
        self._saldo = saldo

    @property
    def saldo(self):
        return self._saldo

    def depositar(self, cantidad):
        if cantidad <= 0:
            raise ValueError("El depósito debe ser positivo")
        self._saldo += cantidad

    def retirar(self, cantidad):
        if cantidad > self._saldo:
            raise ValueError("Saldo insuficiente")
        self._saldo -= cantidad


cuenta = CuentaBancaria("Ana", 500)
print(cuenta.saldo)     # 500: se lee como un atributo
cuenta.retirar(100)
print(cuenta.saldo)     # 400
cuenta.saldo = 1000     # ❌ AttributeError: no se puede asignar
```

- **`@property`** convierte un método en algo que se lee como un atributo (`cuenta.saldo`, sin paréntesis), pero no se puede asignar.
- La **única forma** de cambiar el saldo es con `depositar` y `retirar`, que **comprueban las reglas**.

(El `@` es un **decorador**: tiene su propio post en el módulo avanzado.)

### 2. Abstracción: esconder la complejidad

Quien usa la cuenta solo necesita saber que existen `depositar`, `retirar` y `saldo`. No le importa **cómo** funcionan por dentro: si mañana guardas un historial de movimientos o el saldo viene de una base de datos, el código que usa la clase no cambia.

Como el volante de un coche: lo giras sin saber cómo funciona la dirección.

### 3. Herencia: reutilizar y especializar

Una **cuenta de ahorros** es una cuenta bancaria con algo más: genera intereses. En vez de copiar la clase, **hereda** de ella:

```python
class CuentaAhorros(CuentaBancaria):
    def __init__(self, titular, saldo=0, tasa=0.02):
        super().__init__(titular, saldo)   # ejecuta el __init__ del padre
        self.tasa = tasa

    def aplicar_intereses(self):
        self.depositar(self._saldo * self.tasa)


ahorros = CuentaAhorros("María", 1000, tasa=0.05)
ahorros.aplicar_intereses()
print(ahorros.saldo)     # 1050.0
ahorros.retirar(50)      # heredado del padre
```

- **`class CuentaAhorros(CuentaBancaria)`**: la clase hija hereda **todos** los atributos y métodos del padre.
- **`super().__init__(...)`** llama al constructor del padre para no repetir su código.
- La hija **añade** lo suyo (`tasa`, `aplicar_intereses`).

### 4. Polimorfismo: misma orden, distinto comportamiento

Distintas clases pueden tener **un método con el mismo nombre** que hace cosas distintas. Así puedes tratarlas a todas igual:

```python
class CuentaCorriente(CuentaBancaria):
    def __init__(self, titular, saldo=0, sobregiro=500):
        super().__init__(titular, saldo)
        self.sobregiro = sobregiro

    def retirar(self, cantidad):           # sobrescribe el método del padre
        if cantidad > self._saldo + self.sobregiro:
            raise ValueError("Superas el límite de sobregiro")
        self._saldo -= cantidad


cuentas = [
    CuentaBancaria("Ana", 100),
    CuentaCorriente("Luis", 100),
]

for cuenta in cuentas:
    try:
        cuenta.retirar(300)
        print(f"{cuenta.titular}: retiro aprobado, saldo {cuenta.saldo}")
    except ValueError as error:
        print(f"{cuenta.titular}: {error}")
# Ana: Saldo insuficiente
# Luis: retiro aprobado, saldo -200
```

El bucle llama a `retirar` sin saber qué tipo de cuenta es, y **cada una se comporta según sus reglas**. Ese es el polimorfismo. Añadir un tipo de cuenta nuevo no obliga a cambiar el bucle.

## Atributos de clase

Un atributo definido **en la clase** (fuera de `__init__`) lo comparten **todas** las instancias:

```python
class Producto:
    igv = 0.18            # atributo de clase: igual para todos
    total_creados = 0

    def __init__(self, nombre, precio):
        self.nombre = nombre      # atributo de instancia: propio de cada uno
        self.precio = precio
        Producto.total_creados += 1

    def precio_final(self):
        return round(self.precio * (1 + self.igv), 2)


teclado = Producto("Teclado", 100)
mouse = Producto("Mouse", 50)
print(teclado.precio_final())     # 118.0
print(Producto.total_creados)     # 2
```

## Métodos especiales (dunder)

Los métodos con dos guiones bajos a cada lado (**dunder**, de *double underscore*) le dicen a Python cómo debe comportarse tu objeto con sus operaciones normales. `__init__` es el primero que conoces. Otros muy útiles:

```python
class Dinero:
    def __init__(self, cantidad, moneda="PEN"):
        self.cantidad = cantidad
        self.moneda = moneda

    def __str__(self):                    # lo que muestra print()
        return f"{self.cantidad:.2f} {self.moneda}"

    def __repr__(self):                   # lo que ves en la consola y al depurar
        return f"Dinero({self.cantidad!r}, {self.moneda!r})"

    def __eq__(self, otro):               # qué significa ==
        return self.cantidad == otro.cantidad and self.moneda == otro.moneda

    def __add__(self, otro):              # qué significa +
        if self.moneda != otro.moneda:
            raise ValueError("No se pueden sumar monedas distintas")
        return Dinero(self.cantidad + otro.cantidad, self.moneda)

    def __lt__(self, otro):               # qué significa < (y permite ordenar)
        return self.cantidad < otro.cantidad


a = Dinero(100)
b = Dinero(50.5)

print(a + b)                    # 150.50 PEN
print(a == Dinero(100))         # True
print(sorted([a, b]))           # [Dinero(50.5, 'PEN'), Dinero(100, 'PEN')]
```

Sin `__eq__`, `a == Dinero(100)` sería `False`: Python compararía si son **el mismo objeto** en memoria, no si tienen los mismos datos (igual que pasa con los objetos en JavaScript). Otros dunder: `__len__` (para `len()`), `__contains__` (para `in`), `__iter__` (para recorrerlo con `for`).

> Para clases que sobre todo **guardan datos**, Python tiene las **dataclasses**, que escriben `__init__`, `__repr__` y `__eq__` por ti. Están en el post de type hints y dataclasses.

## Composición antes que herencia

La herencia es potente, pero se abusa de ella. Si las jerarquías crecen (`Animal` → `Mamifero` → `Perro` → `PerroGuardian`...), se vuelven rígidas y difíciles de cambiar.

La alternativa es la **composición**: en vez de "un X **es un** Y" (herencia), "un X **tiene un** Y".

```python
class Motor:
    def __init__(self, caballos):
        self.caballos = caballos

    def arrancar(self):
        return f"Motor de {self.caballos} CV arrancado"


class Coche:
    def __init__(self, marca, motor):
        self.marca = marca
        self.motor = motor          # el coche TIENE un motor

    def arrancar(self):
        return f"{self.marca}: {self.motor.arrancar()}"


coche = Coche("Toyota", Motor(120))
print(coche.arrancar())   # Toyota: Motor de 120 CV arrancado
```

Un coche no "es un" motor: **tiene** uno. Y puedes cambiar el motor por uno eléctrico sin tocar la clase `Coche`. La regla práctica: usa herencia solo cuando la relación "es un" sea clara y estable (una `CuentaAhorros` **es una** `CuentaBancaria`); en el resto de casos, compón.

## POO en Python y en JavaScript

| | Python | JavaScript |
| --- | --- | --- |
| Constructor | `def __init__(self, ...)` | `constructor(...)` |
| El propio objeto | `self` (explícito) | `this` (implícito) |
| Crear un objeto | `Cuenta("Ana")` | `new Cuenta('Ana')` |
| Herencia | `class B(A):` | `class B extends A` |
| Llamar al padre | `super().__init__()` | `super()` |
| Privado | Convención `_saldo` | De verdad con `#saldo` |
| Getter | `@property` | `get saldo()` |

## Tu turno

1. Crea una clase `Producto` con nombre, precio y stock, y métodos `vender(cantidad)` (que falle si no hay stock) y `reponer(cantidad)`. Añade `__str__`.
2. Crea una clase `Carrito` que **tenga** una lista de productos (composición) y métodos `agregar`, `total` y `__len__`.
3. Crea una jerarquía `Empleado` → `Desarrollador` y `Diseñador`, cada uno con un método `calcular_bono()` distinto, y recórrelos en una lista (polimorfismo).
4. Haz que dos objetos `Producto` con el mismo nombre y precio sean iguales con `__eq__`.

## Errores comunes

- **Olvidar `self`** como primer parámetro de un método: `TypeError: takes 0 positional arguments but 1 was given`.
- **Olvidar `self.`** al usar un atributo dentro de un método: `saldo` es una variable local; `self.saldo` es el atributo.
- **No llamar a `super().__init__()`** en la clase hija: los atributos del padre no existen.
- **Usar una lista como atributo de clase** (`items = []` fuera de `__init__`): la comparten todas las instancias.
- **Herencia para todo.** Si la relación no es claramente "es un", usa composición.

## Para profundizar

- [Clases (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/classes.html)

En resumen: una **clase** es un molde con **atributos** (datos) y **métodos** (funciones); **`__init__`** prepara cada objeto y **`self`** es el propio objeto. Los cuatro pilares: **encapsulamiento** (`_atributo` y `@property` para proteger los datos), **abstracción** (esconder cómo funciona), **herencia** (`class Hija(Padre)` con `super()`) y **polimorfismo** (mismo método, distinto comportamiento). Los **métodos especiales** como `__str__`, `__eq__` y `__add__` integran tus objetos con Python, y la **composición** suele ser mejor opción que la herencia.
