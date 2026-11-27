---
title: 'Python: módulos, paquetes, pip y entornos virtuales'
description: 'Cómo dividir tu código en módulos con import, la librería estándar, instalar paquetes con pip, por qué necesitas un entorno virtual (venv), requirements.txt, el truco if __name__ == "__main__" y una introducción a uv.'
date: 2026-11-27
series: python
tags: [Python, pip, venv, Intermedio]
draft: true
---

Tu programa ya tiene 300 líneas en un solo archivo. Además, quieres usar una librería que hace peticiones a APIs o lee Excel, y no sabes cómo instalarla. Y cuando lo consigues, otro proyecto tuyo deja de funcionar porque necesitaba otra versión de esa misma librería.

Hoy resuelves las tres cosas: **módulos** para organizar tu código, **pip** para instalar librerías y **entornos virtuales** para que cada proyecto tenga las suyas.

## Módulos: dividir el código en archivos

Un **módulo** es simplemente un archivo `.py`. Cualquier función o variable que definas en él se puede **importar** desde otro archivo.

```python
# utilidades.py
IGV = 0.18

def con_igv(precio):
    return round(precio * (1 + IGV), 2)

def formatear(precio):
    return f"S/ {precio:,.2f}"
```

```python
# main.py
import utilidades

print(utilidades.formatear(utilidades.con_igv(100)))   # S/ 118.00
```

Formas de importar:

```python
import utilidades                       # todo el módulo: utilidades.con_igv()
from utilidades import con_igv, IGV     # solo algunas cosas: con_igv()
from utilidades import formatear as fmt # con otro nombre: fmt()
import utilidades as u                  # el módulo con un alias: u.con_igv()
```

Evita `from utilidades import *`: importa todo sin que se vea qué, y puede pisar nombres sin avisar.

Es la misma idea que `import` / `export` de JavaScript (lo viste en el post de módulos), con una diferencia: en Python **todo** lo que defines en el archivo se puede importar, no hace falta marcarlo con `export`.

### Paquetes: carpetas de módulos

Cuando tienes muchos módulos, los agrupas en carpetas (**paquetes**):

```bash
tienda/
├── main.py
└── tienda/
    ├── __init__.py
    ├── productos.py
    └── carrito.py
```

```python
from tienda.carrito import calcular_total
from tienda import productos
```

El archivo `__init__.py` (puede estar vacío) marca la carpeta como un paquete.

### `if __name__ == "__main__"`

Verás esta línea en casi todos los archivos de Python:

```python
# utilidades.py
def con_igv(precio):
    return round(precio * 1.18, 2)

if __name__ == "__main__":
    # Solo se ejecuta si lanzas ESTE archivo directamente: python utilidades.py
    print(con_igv(100))
```

Cuando ejecutas `python utilidades.py`, Python le pone a ese archivo el nombre especial `"__main__"`. Cuando otro archivo lo **importa**, su nombre es `"utilidades"`. Así, el código de prueba de abajo **no se ejecuta al importar** el módulo. Es la forma de tener un archivo que sirve a la vez como módulo y como programa.

## La librería estándar: pilas incluidas

Python trae **cientos de módulos** listos para usar, sin instalar nada. Algunos que usarás a menudo:

```python
import random
print(random.randint(1, 6))               # un dado
print(random.choice(["piedra", "papel", "tijera"]))

from datetime import date, datetime, timedelta
hoy = date.today()
print(hoy + timedelta(days=30))           # dentro de 30 días
print(datetime.now().strftime("%d/%m/%Y %H:%M"))

import math
print(math.sqrt(16), math.pi)

from collections import Counter
print(Counter("abracadabra").most_common(2))   # [('a', 5), ('b', 2)]

import os
print(os.environ.get("HOME"))             # una variable de entorno

from pathlib import Path                  # rutas (lo viste en el post de archivos)
import json, csv                          # datos
```

Antes de instalar una librería, mira si la librería estándar ya lo hace. A esto se le llama la filosofía de "pilas incluidas" (*batteries included*).

## pip: instalar librerías

Para todo lo demás está **PyPI** ([pypi.org](https://pypi.org)), el repositorio de paquetes de Python, con cientos de miles de librerías. Se instalan con **pip**, que viene con Python (es el equivalente a npm).

Pero **antes** de instalar nada, necesitas un entorno virtual. Veamos por qué.

## Entornos virtuales: una caja por proyecto

Si instalas una librería "a secas", se instala **para todo tu ordenador**. Problemas:

- El proyecto A necesita la versión 1 de una librería y el proyecto B, la versión 2. No pueden convivir.
- Tu ordenador se llena de librerías y no sabes qué necesita cada proyecto.
- Al pasarle el proyecto a otra persona, no sabe qué instalar.

En JavaScript esto no pasa porque cada proyecto tiene su carpeta `node_modules`. En Python, el equivalente es un **entorno virtual**: una carpeta con su propia copia de Python y sus propias librerías, **solo para ese proyecto**.

### Crear y activar el entorno

Dentro de la carpeta de tu proyecto:

```bash
python -m venv .venv
```

Crea una carpeta `.venv` con el entorno. Ahora **actívalo**:

```bash
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# macOS y Linux
source .venv/bin/activate
```

Verás `(.venv)` al principio de la línea de la terminal: estás dentro del entorno. Todo lo que instales con pip irá **solo** a este proyecto. Para salir, escribe `deactivate`.

> En PowerShell, si te da un error de permisos al activar, ejecuta una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. Y VS Code detecta el `.venv` solo: cuando te pregunte, elígelo como intérprete.

### Instalar paquetes

Con el entorno activado:

```bash
pip install requests
```

**requests** es la librería más popular para hacer peticiones HTTP (como `fetch`):

```python
import requests

respuesta = requests.get("https://dummyjson.com/products/1")
respuesta.raise_for_status()      # lanza un error si es 4xx o 5xx
producto = respuesta.json()
print(producto["title"], producto["price"])
```

Otros comandos de pip:

```bash
pip list                     # qué hay instalado
pip install requests==2.32.3 # una versión concreta
pip install --upgrade requests
pip uninstall requests
```

### `requirements.txt`: la lista de dependencias

Para que otra persona pueda instalar lo mismo que tú, guarda las dependencias en un archivo:

```bash
pip freeze > requirements.txt
```

```bash
# requirements.txt
certifi==2025.1.31
charset-normalizer==3.4.1
idna==3.10
requests==2.32.3
urllib3==2.3.0
```

Y la otra persona (o tu servidor) lo instala todo con:

```bash
pip install -r requirements.txt
```

Es el equivalente a `package.json` + `npm install`.

### No subas `.venv` a Git

La carpeta `.venv` es pesada y depende de tu sistema. Añádela al `.gitignore` (como `node_modules`):

```bash
# .gitignore
.venv/
__pycache__/
```

`__pycache__` es una carpeta que Python crea con versiones precompiladas de tus módulos para arrancar más rápido. Tampoco se sube.

## El flujo completo

Para cada proyecto nuevo:

```bash
mkdir mi-proyecto
cd mi-proyecto
python -m venv .venv
.venv\Scripts\Activate.ps1        # o source .venv/bin/activate
pip install requests
pip freeze > requirements.txt
```

Y al clonar un proyecto de otra persona:

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Bonus: uv, la herramienta moderna

**uv** es una herramienta reciente que hace lo mismo que `venv` + `pip` (y más) pero muchísimo más rápido, y se está volviendo muy popular. Con uv, un proyecto se gestiona así:

```bash
uv init mi-proyecto      # crea el proyecto con un pyproject.toml
cd mi-proyecto
uv add requests          # instala y lo apunta en pyproject.toml
uv run main.py           # ejecuta dentro del entorno, sin activarlo
```

El archivo **`pyproject.toml`** es el estándar moderno para describir un proyecto de Python y sus dependencias (más parecido aún a `package.json`). Si empiezas un proyecto nuevo, prueba uv; pero entender `venv` y `pip` sigue siendo imprescindible, porque los verás en todas partes.

## Tu turno

1. Divide un programa tuyo (por ejemplo, la calculadora de propinas) en `calculos.py` y `main.py`, y añade un bloque `if __name__ == "__main__"` con pruebas en `calculos.py`.
2. Crea un proyecto con entorno virtual, instala `requests` y escribe un script que muestre el clima de tu ciudad con la API gratuita de [Open-Meteo](https://open-meteo.com).
3. Genera el `requirements.txt`, borra la carpeta `.venv` y vuelve a crearlo todo desde cero con `pip install -r`.
4. Usa `Counter` para contar las palabras más repetidas de un archivo de texto.

## Errores comunes

- **`ModuleNotFoundError: No module named 'requests'`**: no está instalado, o lo instalaste **fuera** del entorno virtual (o en otro). Comprueba que ves `(.venv)` en la terminal.
- **Instalar sin activar el entorno**: la librería va a todo el ordenador.
- **Llamar a tu archivo como un módulo de Python** (`random.py`, `json.py`, `requests.py`): al hacer `import random`, Python importa **tu** archivo en vez del original. Ponles otros nombres.
- **Subir `.venv` al repositorio.**
- **Importaciones circulares**: `a.py` importa `b.py` y `b.py` importa `a.py`. Reorganiza el código para que una de las dos no dependa de la otra.

## Para profundizar

- [Módulos (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/modules.html)
- [Entornos virtuales y paquetes (tutorial oficial, en español)](https://docs.python.org/es/3/tutorial/venv.html)

En resumen: un **módulo** es un archivo `.py` que importas con **`import`** o **`from ... import`**, y un **paquete** es una carpeta de módulos. **`if __name__ == "__main__"`** separa el código que solo se ejecuta al lanzar el archivo. Antes de instalar nada, crea un **entorno virtual** con **`python -m venv .venv`** y actívalo; instala con **`pip install`** y guarda las dependencias en **`requirements.txt`**. Y prueba **uv** en proyectos nuevos.
