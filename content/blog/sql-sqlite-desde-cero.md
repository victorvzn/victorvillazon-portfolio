---
title: 'SQL desde cero con SQLite: tu primera base de datos'
description: 'Qué es una base de datos relacional, por qué SQLite es perfecto para empezar, y las sentencias de SQL que más vas a usar: CREATE TABLE, INSERT, SELECT, WHERE, ORDER BY, UPDATE, DELETE y JOIN.'
date: 2026-11-27
series: backend
tags: [SQL, SQLite, Bases de datos, Backend, Fundamentos]
draft: true
---

Tu API de Express guarda las tareas en una variable. Reinicias el servidor y... todo desaparece. Guardarlas en un archivo JSON funciona un rato, pero ¿qué pasa cuando tienes 100.000 tareas, dos usuarios guardando a la vez o quieres "las tareas pendientes de Ana ordenadas por fecha"?

Para eso existen las **bases de datos**. Y el lenguaje para hablar con la mayoría de ellas es **SQL**.

## ¿Qué es una base de datos relacional?

Una base de datos relacional guarda los datos en **tablas**, como una hoja de cálculo:

| id | nombre | email |
| --- | --- | --- |
| 1 | Ana | ana@correo.com |
| 2 | Luis | luis@correo.com |

- Cada **tabla** guarda un tipo de cosa: `usuarios`, `tareas`, `productos`.
- Cada **fila** es un elemento: un usuario concreto.
- Cada **columna** es un dato, con un **tipo**: texto, número...
- Las tablas se **relacionan** entre sí: una tarea pertenece a un usuario. De ahí lo de "relacional".

**SQL** (*Structured Query Language*) es el lenguaje para crear tablas, guardar datos y hacer preguntas. Lo que aprendas hoy sirve, con pocas diferencias, para **SQLite, PostgreSQL, MySQL** y otras.

## ¿Por qué SQLite?

**SQLite** es una base de datos que vive en **un solo archivo**. No hay que instalar ni configurar un servidor. Es la base de datos más usada del mundo: está en tu móvil, en tu navegador y en miles de apps.

Y es la base de **Turso**, la base de datos en la nube que usaremos en los siguientes posts. Todo el SQL de hoy funciona igual allí.

## Preparar el entorno

Usaremos `@libsql/client`, la librería oficial de Turso, que también funciona con un archivo SQLite local. Así no hace falta crear ninguna cuenta todavía:

```bash
mkdir aprender-sql
cd aprender-sql
npm init -y
npm install @libsql/client
```

Añade `"type": "module"` al `package.json` y crea `sql.js`:

```js
import { createClient } from '@libsql/client'

const db = createClient({ url: 'file:aprender.db' })

const consulta = process.argv[2]
const resultado = await db.execute(consulta)

if (resultado.rows.length > 0) console.table(resultado.rows)
else console.log(`✅ Hecho. Filas afectadas: ${resultado.rowsAffected}`)
```

Es un mini programa que ejecuta la consulta SQL que le pases y muestra el resultado como tabla:

```bash
node sql.js "SELECT 'Hola, SQL' AS saludo"
```

El archivo `aprender.db` se crea solo. Ese archivo **es** la base de datos.

`db.execute` ejecuta **una sentencia cada vez**. Cuando en este post veas un bloque con dos sentencias (separadas por `;`), ejecútalas con dos comandos.

> En PowerShell, si una consulta lleva comillas simples dentro, envuélvela con comillas dobles como en el ejemplo. Si prefieres una interfaz gráfica, la extensión **SQLite Viewer** de VS Code abre el archivo `.db` y te deja ver las tablas.

## Crear una tabla: `CREATE TABLE`

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);
```

```bash
node sql.js "CREATE TABLE usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, email TEXT NOT NULL UNIQUE, creado_en TEXT DEFAULT CURRENT_TIMESTAMP)"
```

Cada columna tiene un nombre, un **tipo** y, opcionalmente, **restricciones**:

| Parte | Significado |
| --- | --- |
| `INTEGER`, `TEXT`, `REAL` | Tipos: número entero, texto, número decimal |
| `PRIMARY KEY` | El identificador único de cada fila |
| `AUTOINCREMENT` | La base de datos pone el `id` sola: 1, 2, 3... |
| `NOT NULL` | Obligatorio |
| `UNIQUE` | No puede repetirse (dos usuarios con el mismo email) |
| `DEFAULT ...` | Valor si no se indica otro |

Por convención, las palabras de SQL se escriben en MAYÚSCULAS y los nombres de tablas y columnas en minúsculas con guiones bajos (`creado_en`). SQL no distingue mayúsculas en sus palabras clave, pero así se lee mejor.

## Guardar datos: `INSERT`

```sql
INSERT INTO usuarios (nombre, email) VALUES ('Ana', 'ana@correo.com');

-- Varios a la vez
INSERT INTO usuarios (nombre, email) VALUES
  ('Luis', 'luis@correo.com'),
  ('María', 'maria@correo.com');
```

No indicamos `id` ni `creado_en`: los rellena la base de datos. Prueba ahora a insertar otra vez a Ana: verás un error `UNIQUE constraint failed`. La base de datos **protege tus datos** por ti.

En SQL, los textos van entre **comillas simples** y los comentarios empiezan por `--`.

## Leer datos: `SELECT`

```sql
SELECT * FROM usuarios;                -- todas las columnas
SELECT nombre, email FROM usuarios;    -- solo algunas
```

### Filtrar con `WHERE`

```sql
SELECT * FROM usuarios WHERE id = 2;
SELECT * FROM usuarios WHERE nombre = 'Ana';
SELECT * FROM usuarios WHERE email LIKE '%@correo.com';  -- % = cualquier texto
SELECT * FROM usuarios WHERE id > 1 AND nombre != 'María';
```

Fíjate: en SQL se compara con **un solo `=`**, no con `===`.

### Ordenar y limitar

```sql
SELECT * FROM usuarios ORDER BY nombre;          -- A → Z
SELECT * FROM usuarios ORDER BY creado_en DESC;  -- los más nuevos primero
SELECT * FROM usuarios ORDER BY id LIMIT 2;      -- solo los 2 primeros
SELECT * FROM usuarios LIMIT 10 OFFSET 20;       -- la "página 3" de 10 en 10
```

### Contar y agrupar

```sql
SELECT COUNT(*) AS total FROM usuarios;
```

`AS` le pone un nombre a la columna del resultado. Otras funciones: `SUM()`, `AVG()`, `MIN()`, `MAX()`.

## Modificar: `UPDATE`

```sql
UPDATE usuarios SET nombre = 'Ana María' WHERE id = 1;
```

> ⚠️ **Nunca olvides el `WHERE`** en un `UPDATE`. `UPDATE usuarios SET nombre = 'Ana'` cambia el nombre de **todos** los usuarios. No hay botón de deshacer.

## Borrar: `DELETE`

```sql
DELETE FROM usuarios WHERE id = 3;
```

Mismo aviso: **`DELETE FROM usuarios` sin `WHERE` borra toda la tabla.** Un truco: escribe primero el `SELECT` con el `WHERE`, comprueba que salen las filas que quieres borrar, y solo entonces cambia `SELECT *` por `DELETE`.

## Relacionar tablas

Ahora lo que da nombre a las bases de datos relacionales. Cada tarea pertenece a un usuario:

```sql
CREATE TABLE tareas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  texto TEXT NOT NULL,
  hecha INTEGER NOT NULL DEFAULT 0,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
);

INSERT INTO tareas (texto, usuario_id) VALUES
  ('Aprender SQL', 1),
  ('Crear una API', 1),
  ('Hacer ejercicio', 2);
```

- **`usuario_id`** guarda el `id` del usuario dueño de la tarea. Se llama **clave foránea** (*foreign key*).
- SQLite no tiene tipo booleano: se usa `INTEGER` con `0` (falso) y `1` (verdadero).

¿Por qué no guardar el nombre del usuario en cada tarea? Porque si Ana cambia su nombre, tendrías que cambiarlo en todas sus tareas. Con el `id`, el nombre está **en un solo sitio**.

### `JOIN`: juntar tablas en una consulta

```sql
SELECT tareas.texto, usuarios.nombre
FROM tareas
JOIN usuarios ON usuarios.id = tareas.usuario_id;
```

| texto | nombre |
| --- | --- |
| Aprender SQL | Ana María |
| Crear una API | Ana María |
| Hacer ejercicio | Luis |

`JOIN ... ON` une cada tarea con **su** usuario. Y puedes combinarlo con todo lo anterior:

```sql
-- ¿Cuántas tareas pendientes tiene cada usuario?
SELECT usuarios.nombre, COUNT(tareas.id) AS pendientes
FROM usuarios
LEFT JOIN tareas ON tareas.usuario_id = usuarios.id AND tareas.hecha = 0
GROUP BY usuarios.id
ORDER BY pendientes DESC;
```

`GROUP BY` agrupa las filas por usuario para contar las de cada uno. `LEFT JOIN` incluye también a los usuarios **sin** tareas (con 0), cosa que el `JOIN` normal no haría.

## Tu turno

Con tu `sql.js`:

1. Crea una tabla `productos` con `id`, `nombre` (obligatorio), `precio` (`REAL`, obligatorio) y `stock` (`INTEGER`, por defecto 0). Inserta 5 productos.
2. Escribe consultas para: los productos de menos de S/ 100; el más caro; los que no tienen stock; el valor total del inventario (`SUM(precio * stock)`).
3. Sube un 10% el precio de los productos con stock mayor que 10. (Haz primero el `SELECT`.)
4. Crea una tabla `pedidos` con `producto_id` y `cantidad`, y una consulta con `JOIN` que muestre el nombre del producto y el total de cada pedido.

## Errores comunes

- **`UPDATE` o `DELETE` sin `WHERE`.** Afecta a toda la tabla.
- **Comillas dobles para los textos.** En SQL, los textos van con comillas **simples**: `'Ana'`.
- **Usar `==` o `===`.** En SQL se compara con `=`.
- **Guardar datos repetidos** (el nombre del usuario en cada tarea) en vez de relacionar por `id`.
- **`no such table`.** La tabla no existe todavía, o estás usando otro archivo `.db`.

## Para profundizar

- [SQLBolt: ejercicios interactivos de SQL (en inglés)](https://sqlbolt.com)
- [Documentación de SQLite (en inglés)](https://www.sqlite.org/lang.html)

En resumen: una **base de datos relacional** guarda los datos en **tablas** con columnas tipadas y las relaciona con **claves foráneas**. Con SQL creas tablas (**`CREATE TABLE`**), guardas (**`INSERT`**), consultas (**`SELECT`** con `WHERE`, `ORDER BY` y `LIMIT`), modificas (**`UPDATE`**) y borras (**`DELETE`**, siempre con `WHERE`), y juntas tablas con **`JOIN`**. **SQLite** cabe en un archivo y es la base de **Turso**, el siguiente paso.
