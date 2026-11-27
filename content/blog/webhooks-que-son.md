---
title: '¿Qué son los webhooks? Recibe avisos de otros servicios en tu API'
description: 'Qué es un webhook y en qué se diferencia de consultar una API cada pocos segundos (polling), ejemplos reales con pagos y GitHub, cómo crear un endpoint que recibe webhooks con Express, probarlo en local, responder rápido, reintentos e idempotencia.'
date: 2026-11-27
series: backend
tags: [Webhooks, Express, APIs, Backend, Intermedio]
draft: true
---

Tu tienda online cobra con un servicio de pagos como Stripe o Mercado Pago. El cliente paga en la página del servicio y vuelve a tu web. Pero ¿cómo se entera **tu servidor** de que el pago se completó, para marcar el pedido como pagado y enviar el email de confirmación?

Podrías preguntarle al servicio de pagos cada 5 segundos: "¿ya pagó? ¿ya pagó? ¿ya pagó?". O puedes pedirle que **te avise él** cuando ocurra. Ese aviso es un **webhook**.

## Polling contra webhooks

**Polling** (sondear) es preguntar una y otra vez:

```bash
Tu servidor → "¿Hay novedades del pedido 123?" → Servicio de pagos: "No"
Tu servidor → "¿Hay novedades del pedido 123?" → Servicio de pagos: "No"
Tu servidor → "¿Hay novedades del pedido 123?" → Servicio de pagos: "No"
Tu servidor → "¿Hay novedades del pedido 123?" → Servicio de pagos: "¡Sí, pagado!"
```

Es como un niño en un viaje en coche preguntando "¿falta mucho?". Desperdicias peticiones (la mayoría responden "no"), y te enteras **tarde** (hasta 5 segundos después).

Un **webhook** le da la vuelta: **el otro servicio te llama a ti** cuando pasa algo.

```bash
(el cliente paga)
Servicio de pagos → POST https://tu-api.com/webhooks/pagos  { "tipo": "pago.completado", "pedido": 123 }
Tu servidor       → 200 OK
```

Un webhook es simplemente **una petición HTTP `POST` que otro servicio envía a una URL tuya** cuando ocurre un evento. Por eso se les llama también "APIs al revés" o *reverse APIs*: normalmente tú llamas a su API; con un webhook, ellos llaman a la tuya.

| | Polling | Webhook |
| --- | --- | --- |
| Quién inicia | Tú preguntas | Ellos avisan |
| Peticiones | Muchas, casi todas inútiles | Una por evento |
| Rapidez | Con retraso | Al instante |
| Requisito | Ninguno | Necesitas una URL pública que reciba peticiones |

## Dónde se usan

- **Pagos** (Stripe, Mercado Pago, PayPal): pago completado, pago rechazado, reembolso, suscripción cancelada.
- **GitHub**: alguien hizo push, abrió un pull request o creó un issue. Así funcionan muchos despliegues automáticos: GitHub avisa a Vercel o Netlify de que hay código nuevo.
- **Mensajería** (WhatsApp Business, Telegram, Slack): ha llegado un mensaje nuevo para tu bot.
- **Formularios y CRMs**: alguien rellenó un formulario de Typeform o Google Forms.
- **Envío de emails**: un email se entregó, rebotó o se abrió.

## Cómo funciona, paso a paso

1. **Creas un endpoint** en tu API que acepte `POST`, por ejemplo `/webhooks/pagos`.
2. **Lo registras** en el panel del otro servicio: "envía los eventos de pagos a `https://tu-api.com/webhooks/pagos`". Normalmente eliges qué eventos te interesan.
3. Cuando ocurre un evento, el servicio te envía un `POST` con un **JSON** que describe lo que pasó.
4. Tu endpoint **responde rápido con un 2xx** (200 OK) para decir "recibido".
5. Si no respondes, o respondes con un error, el servicio **reintentará** más tarde.

## Recibir un webhook con Express

Con lo que aprendiste en los posts de Express:

```js
import express from 'express'

const app = express()
app.use(express.json())

app.post('/webhooks/pagos', (req, res) => {
  const evento = req.body
  console.log('📩 Webhook recibido:', evento.tipo)

  switch (evento.tipo) {
    case 'pago.completado':
      console.log(`✅ Pedido ${evento.datos.pedidoId} pagado`)
      // marcar el pedido como pagado, enviar el email...
      break
    case 'pago.rechazado':
      console.log(`❌ Pago del pedido ${evento.datos.pedidoId} rechazado`)
      break
    default:
      console.log(`Evento ignorado: ${evento.tipo}`)
  }

  res.sendStatus(200)
})

app.listen(3000, () => console.log('Esperando webhooks en http://localhost:3000'))
```

Pruébalo simulando el webhook con `curl`:

```bash
curl -X POST http://localhost:3000/webhooks/pagos \
  -H "Content-Type: application/json" \
  -d '{"id": "evt_001", "tipo": "pago.completado", "datos": {"pedidoId": 123}}'
```

(En PowerShell, en una sola línea y con `curl.exe`.)

> ⚠️ **Este endpoint es inseguro tal como está**: cualquiera que conozca la URL puede enviarle un "pago completado" falso y llevarse productos gratis. Cómo verificar que el webhook es auténtico tiene su propio post en la serie de Seguridad. No lo pongas en producción sin leerlo.

## Probar en local: tu ordenador no tiene una URL pública

El servicio de pagos está en internet y tu servidor en `localhost`: no puede llegar a ti. Hay dos soluciones:

- **La CLI del propio servicio.** Muchos proveedores tienen una herramienta que reenvía los webhooks a tu `localhost`. Con Stripe, por ejemplo: `stripe listen --forward-to localhost:3000/webhooks/pagos`. Además, te deja disparar eventos de prueba.
- **Un túnel**, como **ngrok** o **Cloudflare Tunnel**, que le da a tu `localhost` una URL pública temporal (`https://abc123.ngrok-free.app`). Registras esa URL en el panel del servicio mientras desarrollas.

Sitios como **webhook.site** te dan una URL de prueba que muestra todo lo que recibe: perfecto para ver qué forma tienen los webhooks de un servicio antes de escribir código.

## Las reglas para recibir webhooks bien

### 1. Responde rápido

Los servicios esperan respuesta en **pocos segundos** (a menudo menos de 10). Si tu endpoint tarda (envía emails, genera un PDF, llama a otras APIs) y se pasa del límite, el servicio dará el webhook por fallido y **lo reenviará**, aunque tú lo procesaras.

La solución: **guardar el evento y responder enseguida**, y hacer el trabajo pesado después:

```js
app.post('/webhooks/pagos', async (req, res) => {
  await guardarEventoPendiente(req.body)   // rápido: una inserción en la base de datos
  res.sendStatus(200)                       // respondemos ya
  // otro proceso (una cola de tareas, un worker) procesará los eventos pendientes
})
```

En proyectos pequeños, procesar directamente está bien si es rápido. En cuanto haya trabajo pesado, usa una **cola** (las hay gestionadas, como SQS en AWS, o librerías como BullMQ con Redis).

### 2. Espera recibir el mismo evento más de una vez (idempotencia)

Por los reintentos, **un mismo webhook puede llegar dos o más veces**. Si cada vez que llega "pago completado" envías un email y sumas puntos al cliente, se los sumarás dos veces.

Tu endpoint debe ser **idempotente**: procesar el mismo evento varias veces debe tener el mismo efecto que procesarlo una. Casi todos los servicios incluyen un **id único** en cada evento: guárdalo y descarta los repetidos.

```js
const eventosProcesados = new Set() // en producción, una tabla de la base de datos con el id como clave única

app.post('/webhooks/pagos', async (req, res) => {
  const evento = req.body

  if (eventosProcesados.has(evento.id)) {
    console.log(`⏭ Evento ${evento.id} repetido, lo ignoro`)
    return res.sendStatus(200) // ¡responde 200 igualmente! Si no, seguirá reintentando
  }

  await procesar(evento)
  eventosProcesados.add(evento.id)
  res.sendStatus(200)
})
```

### 3. No confíes en el orden

Los eventos pueden llegar **desordenados**: puede llegarte "pedido enviado" antes que "pedido pagado". Si el orden importa, usa la fecha del evento o consulta el estado actual en la API del servicio antes de actuar.

### 4. Responde 2xx a lo que no te interesa

Si te llega un tipo de evento que no manejas, responde `200` igualmente. Si respondes un error, el servicio lo reintentará una y otra vez, y algunos acaban **desactivando** tu webhook si falla demasiado.

### 5. Regístralo todo

Guarda cada webhook recibido (al menos el id, el tipo y la fecha). Cuando un cliente diga "pagué y mi pedido sigue pendiente", podrás ver si el aviso llegó, cuándo y qué pasó. La mayoría de servicios tienen además, en su panel, un historial de los webhooks enviados con sus respuestas, y un botón para reenviarlos.

## Enviar webhooks desde tu propia app

Si construyes un servicio que otros usan, puedes ofrecer tus propios webhooks: tus usuarios te dan una URL y tú les haces un `POST` cuando pasa algo. Las mismas reglas, al revés: envía un id único, reintenta con esperas crecientes si falla (1 minuto, 5, 30...) y **firma** cada petición para que puedan verificar que viene de ti (lo verás en el post de seguridad de webhooks).

## Tu turno

1. Crea el endpoint de Express de arriba y envíale eventos con `curl`: uno de cada tipo y uno desconocido.
2. Añade la idempotencia con el `id` del evento y envía el mismo evento dos veces.
3. Entra en webhook.site, copia tu URL y configúrala como webhook en un repositorio tuyo de GitHub (*Settings → Webhooks*). Haz un push y mira qué JSON envía GitHub.
4. Haz que tu endpoint tarde 15 segundos en responder (con un `setTimeout`) y piensa qué pasaría con un servicio que espera 10 segundos como máximo.

## Errores comunes

- **Procesar todo antes de responder** y que el servicio dé el webhook por fallido.
- **No contemplar los duplicados**: emails dobles, puntos dobles, pedidos dobles.
- **Responder un error** a los eventos que no te interesan.
- **Olvidar `express.json()`** y recibir `req.body` vacío. (Ojo: para verificar firmas necesitarás el cuerpo sin procesar; está en el post de seguridad.)
- **Confiar en el contenido sin verificarlo**: cualquiera puede llamar a tu URL.
- **Registrar la URL de `localhost`** en el panel del servicio: desde internet no se puede llegar a tu ordenador.

## Para profundizar

- [Webhooks de GitHub (documentación oficial, en inglés)](https://docs.github.com/en/webhooks/about-webhooks)
- [Buenas prácticas para recibir webhooks de Stripe (en inglés)](https://docs.stripe.com/webhooks#best-practices)

En resumen: un **webhook** es una petición **`POST`** que otro servicio envía a **una URL tuya** cuando ocurre un evento, en lugar de que tú preguntes una y otra vez (**polling**). Para recibirlos: crea un endpoint, regístralo en el servicio, **responde rápido con un 2xx**, haz el trabajo pesado después, sé **idempotente** (el mismo evento puede llegar varias veces), no confíes en el orden y **verifica siempre que el webhook es auténtico**.
