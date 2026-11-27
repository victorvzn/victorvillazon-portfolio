---
title: 'Formatear precios, porcentajes y números con Intl.NumberFormat'
description: 'Muestra S/ 1,250.50, 15 %, 1,2 mil o 3 kg sin escribir ni una línea de lógica: Intl.NumberFormat formatea números en cualquier idioma y moneda.'
date: 2026-11-26
series: javascript
tags: [JavaScript, Intl, Fundamentos]
draft: true
---

Tienes un precio guardado como `1250.5` y quieres mostrar **S/ 1,250.50**. La tentación es montarlo a mano: `toFixed(2)`, añadir el símbolo, poner las comas de los miles con una expresión regular... Y entonces la tienda empieza a vender en México, o en España, donde los miles van con punto y los decimales con coma.

JavaScript ya trae la solución: **`Intl.NumberFormat`**.

## Lo básico: separadores de miles según el país

```js playground=basico
const numero = 1234567.891

console.log(new Intl.NumberFormat('es-PE').format(numero)) // 1,234,567.891
console.log(new Intl.NumberFormat('es-ES').format(numero)) // 1.234.567,891
console.log(new Intl.NumberFormat('en-US').format(numero)) // 1,234,567.891
console.log(new Intl.NumberFormat('de-DE').format(numero)) // 1.234.567,891
```

El argumento es el **idioma y país** (lo que se llama *locale*). Cada país tiene sus propias reglas, y `Intl` las conoce todas.

Hay un atajo para casos puntuales:

```js playground=atajo
console.log((1234.5).toLocaleString('es-PE')) // 1,234.5
```

## Monedas

Con `style: 'currency'` y el código de la moneda, obtienes el símbolo, los decimales y el formato correctos:

```js playground=monedas
const precio = 1250.5

const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
console.log(soles.format(precio)) // S/ 1,250.50

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
console.log(pesos.format(precio)) // $1,250.50

const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
console.log(euros.format(precio)) // 1250,50 €

const dolares = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
console.log(dolares.format(precio)) // $1,250.50
```

El código de la moneda sigue un estándar de tres letras (ISO 4217): `PEN` (sol peruano), `MXN` (peso mexicano), `COP` (peso colombiano), `ARS` (peso argentino), `CLP` (peso chileno), `EUR`, `USD`...

Fíjate en que cada moneda sabe cuántos decimales usar: los pesos chilenos, por ejemplo, no llevan decimales.

> Que los euros con `es-ES` salgan como `1250,50 €` (sin punto de miles) no es un error: en español de España, los números de **cuatro cifras** no llevan separador de miles. A partir de cinco cifras sí: `12.500,00 €`.

## Crea el formateador una vez

Crear un `Intl.NumberFormat` tiene un pequeño coste. Si vas a formatear muchos precios (una lista de productos), créalo **una vez** y reutilízalo:

```js playground=reutilizar
const formatoPrecio = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

const productos = [
  { nombre: 'Teclado', precio: 120 },
  { nombre: 'Monitor', precio: 1299.9 },
  { nombre: 'Cable', precio: 9.5 }
]

productos.forEach((producto) => {
  console.log(`${producto.nombre}: ${formatoPrecio.format(producto.precio)}`)
})
```

## Porcentajes

Con `style: 'percent'`, **el número se multiplica por 100**. Así que `0.15` es 15 %:

```js playground=porcentaje
const porcentaje = new Intl.NumberFormat('es-PE', { style: 'percent' })

console.log(porcentaje.format(0.15))  // 15%
console.log(porcentaje.format(0.075)) // 8% (redondea)

const conDecimales = new Intl.NumberFormat('es-PE', {
  style: 'percent',
  maximumFractionDigits: 1
})
console.log(conDecimales.format(0.075)) // 7.5%
```

## Controlar los decimales

```js playground=decimales
const dosDecimales = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

console.log(dosDecimales.format(5))      // 5.00
console.log(dosDecimales.format(3.14159)) // 3.14

const sinDecimales = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })
console.log(sinDecimales.format(4.7)) // 5
```

- **`minimumFractionDigits`**: rellena con ceros si faltan.
- **`maximumFractionDigits`**: redondea si sobran.

## Números compactos: "1,2 mil" y "3,5 M"

Perfecto para seguidores, visitas o "me gusta":

```js playground=compacto
const compacto = new Intl.NumberFormat('es', { notation: 'compact' })

console.log(compacto.format(950))       // 950
console.log(compacto.format(1200))      // 1,2 mil
console.log(compacto.format(3500000))   // 3,5 M

const compactoEn = new Intl.NumberFormat('en', { notation: 'compact' })
console.log(compactoEn.format(3500000)) // 3.5M
```

## Unidades: kilos, kilómetros, megas

```js playground=unidades
const kilos = new Intl.NumberFormat('es-PE', { style: 'unit', unit: 'kilogram' })
console.log(kilos.format(3)) // 3 kg

const velocidad = new Intl.NumberFormat('es-PE', {
  style: 'unit',
  unit: 'kilometer-per-hour',
  unitDisplay: 'long'
})
console.log(velocidad.format(80)) // 80 kilómetros por hora

const peso = new Intl.NumberFormat('es-PE', { style: 'unit', unit: 'megabyte' })
console.log(peso.format(2.5)) // 2.5 MB
```

## ⚠️ Formatea solo al mostrar

`format` devuelve un **texto**. No hagas cálculos con él:

```js playground=calculos
const formato = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

const precio = 100
const precioTexto = formato.format(precio)

console.log(precioTexto + 10) // 'S/ 100.0010' ❌ concatena textos
console.log(formato.format(precio + 10)) // 'S/ 110.00' ✅
```

La regla: **guarda y calcula con números**, y **formatea al final**, justo cuando lo vas a mostrar.

## Un detalle sobre los decimales y el dinero

Los decimales en JavaScript tienen pequeños errores de precisión (`0.1 + 0.2` da `0.30000000000000004`, lo vimos en el post de números). `Intl` redondea al mostrar, así que **se ve bien**. Pero si haces muchas operaciones con dinero, una práctica profesional es trabajar en **céntimos** (enteros) y dividir entre 100 solo al formatear:

```js playground=centimos
const formato = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

const precioCentimos = 1990 // S/ 19.90
const cantidad = 3

const totalCentimos = precioCentimos * cantidad
console.log(formato.format(totalCentimos / 100)) // S/ 59.70
```

## Tu turno

```js playground=ejercicio
const pedido = {
  productos: [
    { nombre: 'Polo', precio: 49.9, cantidad: 2 },
    { nombre: 'Zapatillas', precio: 259, cantidad: 1 }
  ],
  descuento: 0.1
}

// 1. Calcula el subtotal (precio × cantidad de cada producto)
// 2. Muestra el subtotal en soles (S/)
// 3. Muestra el descuento como porcentaje (10 %)
// 4. Muestra el total con el descuento aplicado, en soles
// 5. Muestra el total también en euros con formato de España (sin convertir el valor, solo el formato)
```

## Errores comunes

- **Montar el formato a mano** con `toFixed` y concatenando el símbolo. Usa `Intl.NumberFormat`.
- **Pasar 15 en vez de 0.15** a un formato de porcentaje. Saldría 1500 %.
- **Hacer cálculos con el texto formateado.** Calcula con números, formatea al final.
- **Crear un formateador nuevo dentro de un bucle grande.** Créalo una vez fuera.
- **Confundir el idioma con la moneda.** `'es-PE'` decide el formato (comas, puntos) y `currency: 'PEN'` decide la moneda. Son independientes.

## Para profundizar

- [`Intl.NumberFormat` en MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Unidades disponibles (en inglés)](https://tc39.es/ecma402/#table-sanctioned-single-unit-identifiers)

En resumen: **`Intl.NumberFormat`** formatea números según el idioma y el país. Con **`style: 'currency'`** muestras precios, con **`'percent'`** porcentajes (multiplica por 100), con **`notation: 'compact'`** números cortos y con **`style: 'unit'`** unidades. Crea el formateador **una vez**, calcula siempre con **números** y formatea **solo al mostrar**.
