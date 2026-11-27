---
title: 'FastAPI: crea una API REST con Python en minutos'
description: 'Qué es FastAPI y por qué es tan popular, instalarlo y arrancar el servidor, rutas con parámetros de ruta y de consulta, validar el cuerpo con modelos de Pydantic, códigos de estado y errores, la documentación automática en /docs, CORS, dependencias y tests con TestClient.'
date: 2026-11-27
series: python
tags: [Python, FastAPI, API REST, Backend, Avanzado]
draft: true
---

En la serie de Backend creaste una API REST con Express. Hoy vas a crear **la misma API con Python**, usando **FastAPI**, el framework de APIs que más ha crecido en los últimos años. Y vas a ver por qué: con los **type hints** y **Pydantic** que ya conoces, FastAPI valida los datos, convierte los tipos y **genera la documentación de tu API** sin que escribas una línea de más.

## Paso 1: el proyecto

```bash
mkdir api-tareas
cd api-tareas
python -m venv .venv
.venv\Scripts\Activate.ps1        # macOS/Linux: source .venv/bin/activate
pip install "fastapi[standard]"
```

`fastapi[standard]` instala FastAPI junto con lo necesario para ejecutarlo: el servidor (**Uvicorn**), Pydantic y la herramienta de línea de comandos `fastapi`.

## Paso 2: la API mínima

Crea `main.py`:

```python
from fastapi import FastAPI

app = FastAPI(title="API de tareas")

@app.get("/")
def inicio():
    return {"mensaje": "¡Hola desde FastAPI!"}
```

```bash
fastapi dev main.py
```

Abre [http://localhost:8000](http://localhost:8000) y verás el JSON. `fastapi dev` reinicia el servidor cada vez que guardas, como `node --watch`.

- **`@app.get("/")`** es un **decorador** (lo viste en su post): conecta la función con la ruta `GET /`.
- Lo que **devuelves** (un diccionario, una lista, un modelo) se convierte en **JSON** automáticamente. No hay `res.json()`.

## La documentación automática

Ahora abre [http://localhost:8000/docs](http://localhost:8000/docs).

Verás una página con **todas las rutas de tu API**, sus parámetros y un botón **"Try it out"** para probarlas desde el navegador. FastAPI la genera sola a partir de tu código, siguiendo el estándar **OpenAPI**. Cada ruta que añadas aparecerá ahí, documentada. Ya no necesitas `curl` ni Postman para probar tu API (aunque siguen funcionando).

## Paso 3: parámetros de ruta y de consulta

```python
productos = [
    {"id": 1, "nombre": "Teclado", "precio": 120, "categoria": "perifericos"},
    {"id": 2, "nombre": "Mouse", "precio": 45, "categoria": "perifericos"},
    {"id": 3, "nombre": "Monitor", "precio": 800, "categoria": "pantallas"},
]

@app.get("/productos")
def listar_productos(categoria: str | None = None, max_precio: float | None = None):
    resultado = productos
    if categoria:
        resultado = [p for p in resultado if p["categoria"] == categoria]
    if max_precio is not None:
        resultado = [p for p in resultado if p["precio"] <= max_precio]
    return resultado

@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int):
    for producto in productos:
        if producto["id"] == producto_id:
            return producto
    return {"error": "no encontrado"}   # lo mejoraremos enseguida
```

- **`{producto_id}`** en la ruta es un **parámetro de ruta** (`req.params` en Express). Como lo anotaste con `producto_id: int`, FastAPI **lo convierte a número** solo. Si visitas `/productos/abc`, responde automáticamente un **422** explicando que no es un entero.
- Los parámetros de la función que **no** están en la ruta son **query strings** (`req.query`): `/productos?categoria=perifericos&max_precio=100`. Con `= None` son opcionales.

Compáralo con Express: allí convertías con `Number(req.params.id)` y validabas a mano. Aquí lo hacen los type hints.

## Paso 4: errores con `HTTPException`

```python
from fastapi import FastAPI, HTTPException

@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int):
    for producto in productos:
        if producto["id"] == producto_id:
            return producto
    raise HTTPException(status_code=404, detail="Producto no encontrado")
```

Lanzar un **`HTTPException`** corta la función y responde con ese código de estado y `{"detail": "Producto no encontrado"}`. Es el `ErrorHttp` que creaste en el post de middlewares de Express, ya hecho.

## Paso 5: crear recursos con modelos de Pydantic

Para el **cuerpo** de un `POST`, defines un **modelo de Pydantic** (lo viste en el post de type hints) y lo usas como tipo del parámetro:

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="API de tareas")

class TareaCrear(BaseModel):
    texto: str = Field(min_length=1, max_length=200)
    prioridad: str = Field(default="media", pattern="^(baja|media|alta)$")

class TareaActualizar(BaseModel):
    texto: str | None = Field(default=None, min_length=1, max_length=200)
    hecha: bool | None = None

class Tarea(BaseModel):
    id: int
    texto: str
    prioridad: str
    hecha: bool = False

tareas: dict[int, Tarea] = {}
siguiente_id = 1

@app.get("/tareas")
def listar_tareas(hecha: bool | None = None) -> list[Tarea]:
    lista = list(tareas.values())
    if hecha is not None:
        lista = [t for t in lista if t.hecha == hecha]
    return lista

@app.post("/tareas", status_code=status.HTTP_201_CREATED)
def crear_tarea(datos: TareaCrear) -> Tarea:
    global siguiente_id
    tarea = Tarea(id=siguiente_id, **datos.model_dump())
    tareas[tarea.id] = tarea
    siguiente_id += 1
    return tarea

@app.patch("/tareas/{tarea_id}")
def actualizar_tarea(tarea_id: int, cambios: TareaActualizar) -> Tarea:
    tarea = tareas.get(tarea_id)
    if tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    actualizada = tarea.model_copy(update=cambios.model_dump(exclude_unset=True))
    tareas[tarea_id] = actualizada
    return actualizada

@app.delete("/tareas/{tarea_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_tarea(tarea_id: int) -> None:
    if tareas.pop(tarea_id, None) is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
```

Lo que hace FastAPI por ti con solo ver los tipos:

- **`datos: TareaCrear`**: lee el JSON del cuerpo, lo **valida** con el modelo y te da un objeto. Si falta `texto` o la prioridad es `"urgente"`, responde **422** con la lista de errores, sin que tu función llegue a ejecutarse. Es el middleware `validar(esquema)` de Express con Zod, pero integrado.
- **`-> Tarea`** (el tipo de retorno): FastAPI **filtra** la respuesta para que solo salgan los campos del modelo. Si un día añades un campo interno, no se filtrará por accidente.
- **`status_code=201`** en el decorador: el código de estado de la respuesta correcta.
- **`exclude_unset=True`**: en el `PATCH`, solo coge los campos que el cliente **envió**, para no pisar los demás con `None`.

Pruébalo todo desde `/docs`: verás los modelos documentados, con sus restricciones, y podrás enviar peticiones válidas e inválidas.

> Como en el post de Express, los datos están en memoria y se pierden al reiniciar. En un proyecto real, se guardarían en una base de datos (con SQLAlchemy o SQLModel, por ejemplo).

## Rutas `async`

Si dentro de una ruta haces algo que **espera** (una petición con httpx, una base de datos asíncrona), defínela con `async def` y usa `await` (lo viste en el post de asyncio):

```python
import httpx

@app.get("/clima/{ciudad}")
async def clima(ciudad: str):
    async with httpx.AsyncClient(timeout=10) as cliente:
        geo = await cliente.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": ciudad, "count": 1},
        )
        resultados = geo.json().get("results")
        if not resultados:
            raise HTTPException(status_code=404, detail="Ciudad no encontrada")
        lugar = resultados[0]

        tiempo = await cliente.get(
            "https://api.open-meteo.com/v1/forecast",
            params={"latitude": lugar["latitude"], "longitude": lugar["longitude"], "current": "temperature_2m"},
        )
    return {"ciudad": lugar["name"], "temperatura": tiempo.json()["current"]["temperature_2m"]}
```

Mientras una petición espera a Open-Meteo, FastAPI atiende otras. Si tu ruta no espera nada asíncrono, un `def` normal está perfecto: FastAPI lo ejecuta en un hilo aparte para no bloquear.

## CORS para tu frontend

Si tu frontend de Vite (en `localhost:5173`) llama a esta API, necesitas CORS (está explicado en el post del error de CORS):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Dependencias: código compartido entre rutas

FastAPI tiene un sistema de **dependencias**: funciones que se ejecutan antes de la ruta y le pasan un valor. Sirven para lo mismo que los middlewares de una ruta en Express: comprobar una API key, obtener el usuario conectado, abrir una conexión a la base de datos.

```python
from typing import Annotated
from fastapi import Depends, Header

def verificar_api_key(x_api_key: Annotated[str, Header()]) -> str:
    if x_api_key != "clave-secreta-de-ejemplo":
        raise HTTPException(status_code=401, detail="API key inválida")
    return x_api_key

@app.delete("/admin/tareas", status_code=204)
def vaciar_tareas(clave: Annotated[str, Depends(verificar_api_key)]) -> None:
    tareas.clear()
```

`Depends(verificar_api_key)` hace que FastAPI ejecute esa función antes de la ruta. Como lee la cabecera `X-API-Key`, si falta o es incorrecta, la ruta nunca se ejecuta. (En un proyecto real, la clave vendría de una variable de entorno, nunca escrita en el código.)

## Tests con `TestClient`

FastAPI trae un cliente para probar la API sin arrancar el servidor (como Supertest en el post de TDD con Express). Con **pytest**, el framework de tests más usado de Python:

```bash
pip install pytest
```

```python
# test_main.py
from fastapi.testclient import TestClient
from main import app

cliente = TestClient(app)

def test_crear_tarea():
    respuesta = cliente.post("/tareas", json={"texto": "Aprender FastAPI"})
    assert respuesta.status_code == 201
    assert respuesta.json()["texto"] == "Aprender FastAPI"
    assert respuesta.json()["hecha"] is False

def test_texto_vacio_devuelve_422():
    respuesta = cliente.post("/tareas", json={"texto": ""})
    assert respuesta.status_code == 422

def test_tarea_inexistente_devuelve_404():
    respuesta = cliente.patch("/tareas/999", json={"hecha": True})
    assert respuesta.status_code == 404
```

```bash
pytest
```

pytest busca archivos que empiecen por `test_` y ejecuta las funciones que empiecen por `test_`. En vez de `expect(...).toBe(...)`, se usa el `assert` normal de Python.

## Para producción

```bash
fastapi run main.py
```

`fastapi run` arranca el servidor en modo producción (sin recarga automática). Para desplegarlo, puedes usar el mismo **Dockerfile** que aprendiste en la serie de DevOps, cambiando la imagen base por `python:3.13-slim`, `npm ci` por `pip install -r requirements.txt` y el `CMD` por `["fastapi", "run", "main.py", "--port", "8000"]`.

## Tu turno

1. Añade `GET /tareas/{tarea_id}` con su 404.
2. Añade un parámetro `q` a `GET /tareas` que busque por texto, y otro `orden` que solo acepte `"texto"` o `"prioridad"` (pista: `Literal`).
3. Haz que la API key de `verificar_api_key` se lea de una variable de entorno con `os.environ`.
4. Escribe tests para el `PATCH`: que cambie solo los campos enviados y que devuelva 422 si `hecha` no es booleano.

## Errores comunes

- **`ModuleNotFoundError: No module named 'fastapi'`**: no activaste el entorno virtual.
- **Un 422 que no esperabas**: los datos no cumplen el modelo. Lee el `detail` de la respuesta: dice exactamente qué campo falla.
- **Olvidar el tipo** de un parámetro de ruta: llega como texto y la comparación `== 1` nunca se cumple.
- **Usar `requests` o `time.sleep` dentro de una ruta `async def`**: bloqueas el servidor entero. Usa `httpx` y `asyncio.sleep`, o haz la ruta con `def` normal.
- **Devolver el modelo con datos sensibles** (una contraseña). Define un modelo de respuesta sin ese campo.

## Para profundizar

- [Tutorial oficial de FastAPI (en español)](https://fastapi.tiangolo.com/es/tutorial/)
- [Probar con TestClient (en inglés)](https://fastapi.tiangolo.com/tutorial/testing/)

En resumen: **FastAPI** crea APIs con Python a partir de **type hints**: los decoradores (`@app.get`, `@app.post`) definen las rutas, los parámetros tipados se **convierten y validan** solos, los **modelos de Pydantic** validan el cuerpo (con un **422** automático si algo falla) y **`HTTPException`** responde los errores. Además genera la **documentación en `/docs`**, soporta rutas **`async`**, comparte lógica con **`Depends`** y se prueba con **`TestClient`** y **pytest**.
