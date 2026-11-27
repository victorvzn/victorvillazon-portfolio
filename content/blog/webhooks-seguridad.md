---
title: 'Seguridad de webhooks: firmas HMAC, ataques de repetición y buenas prácticas'
description: 'Por qué cualquiera puede enviar un webhook falso a tu API, cómo verificar firmas HMAC-SHA256 con Node.js usando el cuerpo sin procesar, comparar en tiempo constante, rechazar eventos viejos con timestamps, secretos rotativos y otras defensas.'
date: 2026-11-27
series: seguridad
tags: [Seguridad, Webhooks, HMAC, Node.js, Avanzado]
draft: true
---

En el post de qué son los webhooks creaste un endpoint que recibe "pago completado" y marca el pedido como pagado. Ahora piensa como un atacante: la URL `https://tu-api.com/webhooks/pagos` no es secreta (está en tu código, en logs, se puede adivinar). ¿Qué le impide hacer esto?

```bash
curl -X POST https://tu-api.com/webhooks/pagos \
  -H "Content-Type: application/json" \
  -d '{"id": "evt_falso", "tipo": "pago.completado", "datos": {"pedidoId": 456}}'
```

**Nada.** Tu servidor recibiría un "pago completado" de un pedido que nunca se pagó, y el atacante se llevaría el producto gratis. Un endpoint de webhooks es una **puerta abierta a internet**, y hay que comprobar quién llama.

## La solución estándar: firmas HMAC

Casi todos los servicios (Stripe, GitHub, Shopify, Mercado Pago, Slack...) usan el mismo mecanismo: **firman** cada webhook con un **secreto compartido**.

1. Cuando registras el webhook, el servicio te da un **secreto** (una cadena aleatoria larga). Solo lo conocen **tú y el servicio**.
2. Al enviar un webhook, el servicio calcula una **firma**: un **HMAC** del cuerpo de la petición usando ese secreto, y la envía en una **cabecera** (por ejemplo, `X-Hub-Signature-256` en GitHub).
3. Tu servidor calcula **la misma firma** con el mismo secreto y el cuerpo que recibió.
4. Si las dos firmas **coinciden**, el webhook es auténtico y no se ha modificado. Si no, lo rechazas.

### ¿Qué es un HMAC?

En el post de cifrado viste que un **hash** (como SHA-256) es una huella digital del contenido. Pero un hash normal lo puede calcular **cualquiera**: el atacante podría hashear su mensaje falso.

Un **HMAC** (*Hash-based Message Authentication Code*) es un hash que **mezcla el contenido con una clave secreta**. Sin el secreto, es imposible calcular el HMAC correcto. Así demuestra dos cosas a la vez:

- **Autenticidad**: lo envió alguien que conoce el secreto (el servicio).
- **Integridad**: el contenido no se cambió por el camino (si cambia un solo carácter, el HMAC es completamente distinto).

Fíjate en que **no es cifrado**: el webhook viaja legible (y protegido por HTTPS). La firma no oculta el contenido, **lo autentica**.

## Verificar la firma en Node.js

Vamos con el caso de GitHub, que firma con HMAC-SHA256 y envía la cabecera `X-Hub-Signature-256: sha256=<firma en hexadecimal>`.

```js
import express from 'express'
import { createHmac, timingSafeEqual } from 'node:crypto'

const app = express()
const SECRETO = process.env.WEBHOOK_SECRET // nunca escrito en el código

function firmaValida(cuerpoSinProcesar, firmaRecibida) {
  if (!firmaRecibida) return false

  const firmaEsperada = 'sha256=' + createHmac('sha256', SECRETO).update(cuerpoSinProcesar).digest('hex')

  const a = Buffer.from(firmaEsperada)
  const b = Buffer.from(firmaRecibida)
  return a.length === b.length && timingSafeEqual(a, b)
}

app.post('/webhooks/github', express.raw({ type: 'application/json' }), (req, res) => {
  if (!firmaValida(req.body, req.get('X-Hub-Signature-256'))) {
    return res.status(401).send('Firma inválida')
  }

  const evento = JSON.parse(req.body.toString('utf8'))
  console.log(`✅ Evento auténtico: ${req.get('X-GitHub-Event')}`)
  // ...procesarlo
  res.sendStatus(200)
})

app.use(express.json()) // el resto de rutas sí usan JSON normal

app.listen(3000)
```

Hay dos detalles en este código que son **la diferencia entre seguro e inseguro**.

### Detalle 1: firma el cuerpo **sin procesar**

La firma se calcula sobre los **bytes exactos** que envió el servicio. Si dejas que `express.json()` convierta el cuerpo en objeto y luego haces `JSON.stringify(req.body)` para verificarlo, el texto puede cambiar (el orden de las propiedades, los espacios, cómo se escriben las tildes o los números) y la firma **no coincidirá nunca**.

Por eso la ruta del webhook usa **`express.raw()`**: deja `req.body` como un **Buffer** con los bytes originales. Verificas la firma con eso, y **solo después** haces `JSON.parse`. Y por eso `express.json()` va **después** de esa ruta (o se aplica solo a las demás), para que no procese antes el cuerpo del webhook.

Este es, con diferencia, el error más común al implementar webhooks.

### Detalle 2: compara en tiempo constante

¿Por qué `timingSafeEqual` y no `firmaEsperada === firmaRecibida`?

La comparación normal de textos se detiene en **el primer carácter distinto**. Comparar `"abc..."` con `"xbc..."` es un poquito más rápido que comparar `"abc..."` con `"abx..."`. Midiendo esos microsegundos con millones de intentos, un atacante podría **adivinar la firma correcta carácter a carácter**. Se llama **ataque de temporización** (*timing attack*).

**`timingSafeEqual`** tarda **siempre lo mismo**, coincidan o no. Exige que los dos Buffers tengan el mismo tamaño; por eso comprobamos la longitud antes (que no revela nada útil: todas las firmas válidas miden lo mismo).

## Ataques de repetición: firmas válidas, pero viejas

La firma impide **inventar** webhooks. Pero un atacante que **capture** un webhook auténtico (por ejemplo, de unos logs mal protegidos) podría **reenviarlo** tal cual dentro de un mes. La firma seguiría siendo válida. Es un **ataque de repetición** (*replay attack*).

La defensa: incluir la **hora** en lo que se firma y rechazar los mensajes viejos. Por eso servicios como Stripe envían una cabecera con un **timestamp** y firman `timestamp + "." + cuerpo`:

```js
const TOLERANCIA_SEGUNDOS = 5 * 60 // 5 minutos

function verificarConTimestamp(cuerpoSinProcesar, timestamp, firmaRecibida) {
  const ahora = Math.floor(Date.now() / 1000)
  if (!timestamp || Math.abs(ahora - Number(timestamp)) > TOLERANCIA_SEGUNDOS) {
    return false // demasiado viejo (o del futuro): posible repetición
  }

  const contenidoFirmado = `${timestamp}.${cuerpoSinProcesar.toString('utf8')}`
  const firmaEsperada = createHmac('sha256', SECRETO).update(contenidoFirmado).digest('hex')

  const a = Buffer.from(firmaEsperada)
  const b = Buffer.from(firmaRecibida ?? '')
  return a.length === b.length && timingSafeEqual(a, b)
}
```

Como el timestamp va **dentro** de lo firmado, el atacante no puede cambiarlo por uno nuevo sin invalidar la firma. Y la **idempotencia** del post anterior (descartar ids de eventos ya procesados) es la segunda capa: aunque un evento repetido llegue dentro de los 5 minutos, no se procesa dos veces.

> **Usa la librería oficial del servicio si la tiene.** Stripe, por ejemplo, ofrece `stripe.webhooks.constructEvent(cuerpo, firma, secreto)`, que hace todo esto (formato de la cabecera, timestamp, comparación segura) por ti. Escribir la verificación a mano está bien para entenderla o para servicios sin librería, pero cada proveedor tiene su formato exacto: léelo en su documentación.

## Más defensas

### El secreto, como cualquier secreto

- En **variables de entorno**, nunca en el código ni en el repositorio (lo viste en el post de Turso y en el de validar el `.env` con Zod).
- **Uno distinto por entorno** (desarrollo, producción) y, si puedes, por cada webhook.
- **Rótalo** si sospechas que se filtró. Muchos servicios permiten tener dos secretos activos durante el cambio: verificas con cualquiera de los dos y, cuando todo usa el nuevo, eliminas el viejo.

### Solo HTTPS

Registra siempre una URL con `https://`. Sin HTTPS, cualquiera en la red podría leer el contenido de los webhooks (que pueden incluir datos de clientes).

### No te fíes ciegamente del contenido

Aunque la firma sea válida, para acciones críticas es buena práctica **consultar el estado real** en la API del servicio: en lugar de marcar el pedido como pagado porque el webhook lo dice, usa el id del evento para pedir el pago a la API del proveedor y comprobar su estado. Así también te proteges de eventos desordenados.

Y **valida la forma** de los datos (con Zod, por ejemplo) antes de usarlos: un servicio legítimo también puede cambiar su formato.

### Limita lo que el endpoint puede hacer

- **Tamaño máximo** del cuerpo: `express.raw({ type: 'application/json', limit: '1mb' })`.
- **Rate limiting** para frenar a quien bombardee la URL.
- Algunos servicios publican las **direcciones IP** desde las que envían sus webhooks; puedes permitir solo esas como capa extra (nunca como única defensa: las listas cambian).

### No filtres información en los errores

Responde a una firma inválida con un simple `401`, sin explicar por qué falló ("el timestamp es viejo", "la firma no coincide"). Esos detalles ayudan al atacante. Regístralos en tus logs, no en la respuesta.

## Si eres tú quien envía webhooks

Si tu app ofrece webhooks a otros:

- **Firma** cada envío con HMAC-SHA256 y un secreto distinto por cliente.
- Incluye un **timestamp** firmado y un **id** único por evento.
- Envía solo a URLs **HTTPS**.
- Cuidado con el **SSRF** (*Server-Side Request Forgery*): un usuario podría registrar como "su URL" una dirección interna de tu red (`http://localhost:6379`, `http://169.254.169.254` en la nube) para que **tu servidor** haga peticiones donde no debe. Rechaza URLs que apunten a direcciones privadas o internas.
- **Reintenta** con esperas crecientes y documenta tu formato de firma, como hacen Stripe y GitHub.

## Tu turno

1. Implementa el endpoint de GitHub con su secreto, configura el webhook en un repositorio tuyo (con un túnel como ngrok) y comprueba que acepta los eventos reales.
2. Envíale con `curl` un evento sin firma y otro con una firma inventada: ambos deben recibir `401`.
3. Cambia `express.raw()` por `express.json()` y `JSON.stringify(req.body)`, y observa cómo fallan firmas que deberían ser válidas. Vuelve a dejarlo bien.
4. Escribe tests con Vitest y Supertest (como en el post de TDD con Express) para `firmaValida`: firma correcta, firma incorrecta, firma con otro tamaño y cabecera ausente.

## Errores comunes

- **No verificar la firma**: cualquiera puede enviarte eventos falsos.
- **Verificar sobre `JSON.stringify(req.body)`** en lugar del cuerpo sin procesar: las firmas válidas fallan, y la tentación es desactivar la verificación.
- **Comparar con `===`** en lugar de `timingSafeEqual`.
- **Aceptar webhooks antiguos**: sin comprobar el timestamp, son posibles los ataques de repetición.
- **El secreto en el código** o el mismo secreto en todos los entornos.
- **Explicar en la respuesta por qué falló** la verificación.

## Para profundizar

- [Validar webhooks de GitHub (documentación oficial, en inglés)](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)
- [Verificar firmas de webhooks de Stripe (en inglés)](https://docs.stripe.com/webhooks#verify-events)

En resumen: la URL de un webhook es **pública**, así que **verifica siempre la firma**: el servicio calcula un **HMAC-SHA256** del cuerpo con un **secreto compartido** y tú lo recalculas. Hazlo sobre el **cuerpo sin procesar** (`express.raw()`), compara con **`timingSafeEqual`**, rechaza los eventos con un **timestamp** viejo para evitar **ataques de repetición** y combínalo con la **idempotencia**. Guarda el secreto en variables de entorno, usa solo HTTPS y, si la hay, usa la **librería oficial** del servicio.
