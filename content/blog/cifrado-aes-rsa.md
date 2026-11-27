---
title: 'Cifrado AES y RSA: la diferencia explicada sin matemáticas'
description: 'Qué es cifrar, la diferencia entre cifrado simétrico (AES) y asimétrico (RSA), por qué HTTPS usa los dos a la vez, firmas digitales, en qué se diferencia de un hash y ejemplos reales con la Web Crypto API del navegador.'
date: 2026-11-27
series: seguridad
tags: [Seguridad, Criptografía, AES, RSA, Fundamentos]
draft: true
---

Cada vez que ves el candado 🔒 en la barra del navegador, tu ordenador y el servidor están usando **AES** y **RSA** (o sus parientes) a la vez. Son los dos nombres que más vas a oír cuando se habla de cifrado, y en entrevistas es habitual la pregunta: "¿qué diferencia hay entre AES y RSA?".

Vamos a entenderlo **sin una sola fórmula**.

## ¿Qué es cifrar?

**Cifrar** es transformar un mensaje legible (el **texto plano**) en algo ilegible (el **texto cifrado**), de forma que **solo quien tenga la clave** pueda volver a leerlo (**descifrar**).

```bash
"Mi contraseña es gato123"  →  cifrar con la clave  →  "x9#Lq2@vP!8..."
"x9#Lq2@vP!8..."            →  descifrar con la clave →  "Mi contraseña es gato123"
```

La seguridad **no** depende de que el algoritmo sea secreto (AES y RSA son públicos, cualquiera puede estudiarlos), sino de que **la clave** sea secreta. Es como una cerradura: todo el mundo sabe cómo funciona, pero solo abre quien tiene la llave.

## Cifrado simétrico: AES, una sola llave

En el cifrado **simétrico**, se usa **la misma clave** para cifrar y para descifrar.

Piensa en un **cofre con candado** del que tú y tu amiga tenéis **copias de la misma llave**. Tú metes el mensaje y cierras; ella abre con su copia.

**AES** (*Advanced Encryption Standard*) es el algoritmo simétrico estándar en todo el mundo. Lo usan gobiernos, bancos, tu WhatsApp, tu disco cifrado y el Wi-Fi de tu casa (WPA2/WPA3).

- ✅ **Muy rápido**: puede cifrar gigas de datos por segundo. Los procesadores modernos tienen instrucciones especiales para él.
- ✅ **Muy seguro** con claves de 128 o 256 bits. Probar todas las claves posibles de AES-256 llevaría más tiempo que la edad del universo.
- ❌ **El problema de la llave**: ¿cómo le das la clave a tu amiga **sin que nadie la intercepte**? Si se la envías por internet sin cifrar, quien la vea podrá leerlo todo. Y si tienes que hablar con un millón de clientes, necesitas un millón de llaves distintas.

## Cifrado asimétrico: RSA, dos llaves

En el cifrado **asimétrico** hay **dos claves** que van en pareja:

- Una **clave pública**: la puede tener **cualquiera**. Sirve para **cifrar**.
- Una **clave privada**: **solo la tiene su dueño**. Es la única que puede **descifrar** lo que se cifró con la pública.

Piensa en un **buzón**: cualquiera puede meter una carta por la ranura (la clave pública), pero solo el dueño tiene la llave para abrirlo y leerlas (la clave privada). Puedes dar la dirección de tu buzón a todo el mundo sin riesgo.

**RSA** (por las iniciales de sus inventores, Rivest, Shamir y Adleman) es el algoritmo asimétrico más conocido. Hoy también se usa mucho la **criptografía de curva elíptica** (ECC, con algoritmos como ECDH y Ed25519), que hace lo mismo con claves más cortas y más rápidas.

- ✅ **Resuelve el problema de la llave**: no hace falta compartir ningún secreto. Publicas tu clave pública y listo.
- ✅ Permite **firmas digitales** (lo verás abajo).
- ❌ **Lento**: cientos o miles de veces más lento que AES.
- ❌ Solo puede cifrar **mensajes pequeños** (menos que el tamaño de su clave, unos cientos de bytes).

## La comparación

| | AES (simétrico) | RSA (asimétrico) |
| --- | --- | --- |
| Claves | **Una**, compartida | **Dos**: pública y privada |
| Analogía | Cofre con copias de la llave | Buzón con ranura |
| Velocidad | Muy rápido | Lento |
| Tamaño de los datos | Cualquiera (gigas) | Muy pequeño |
| Tamaño de clave típico | 128 o 256 bits | 2048 o 4096 bits |
| Problema | Compartir la clave de forma segura | Lentitud |
| Uso típico | Cifrar los datos | Intercambiar claves y firmar |

## La solución real: usar los dos (cifrado híbrido)

Cada uno tiene justo el punto fuerte que le falta al otro. Así que en la práctica **se combinan**:

1. Se genera una **clave AES aleatoria**, nueva para esta conversación (la **clave de sesión**).
2. Esa clave pequeña se envía protegida con **criptografía asimétrica** (RSA o, hoy casi siempre, curvas elípticas).
3. A partir de ahí, **todos los datos** se cifran con **AES**, que es rapidísimo.

Esto es, simplificado, lo que hace **HTTPS** (con el protocolo **TLS**) cada vez que entras en una web:

1. Tu navegador se conecta al servidor, que le envía su **certificado** (que incluye su clave pública, firmada por una autoridad de confianza).
2. Con criptografía asimétrica, los dos acuerdan una **clave de sesión** que nadie más conoce, aunque alguien esté espiando la red.
3. El resto de la conversación (tu contraseña, tus datos, las páginas) viaja cifrada con **AES** (o ChaCha20, otro cifrado simétrico).

Lo asimétrico se usa unos milisegundos al principio; lo simétrico, para todo lo demás.

## Firmas digitales: la otra cara de RSA

Las claves asimétricas también funcionan **al revés**: si **firmas** algo con tu **clave privada**, cualquiera puede **verificar** con tu **clave pública** que:

1. Lo firmaste **tú** (nadie más tiene tu clave privada).
2. **No se ha modificado** desde que lo firmaste.

Se usan en todas partes: los certificados de HTTPS, las actualizaciones de tu sistema operativo y de tus apps (para que nadie meta un virus por el camino), los commits firmados de Git, los tokens JWT con algoritmos como RS256...

| Para... | Se usa la clave... | De quién |
| --- | --- | --- |
| **Cifrar** un mensaje para alguien | **Pública** | Del destinatario |
| **Descifrarlo** | **Privada** | Del destinatario |
| **Firmar** algo | **Privada** | Tuya |
| **Verificar** una firma | **Pública** | De quien firmó |

## No confundas cifrar con hashear

Un **hash** (como SHA-256) también convierte un texto en algo ilegible, pero **no tiene vuelta atrás**: no existe ninguna clave para recuperar el original. Es una **huella digital** del contenido.

| | Cifrado (AES, RSA) | Hash (SHA-256, bcrypt, Argon2) |
| --- | --- | --- |
| ¿Se puede revertir? | Sí, con la clave | **No** |
| Para qué | Ocultar datos que luego hay que leer | Comprobar que algo no cambió, guardar contraseñas |

Por eso **las contraseñas no se cifran: se hashean**, con algoritmos lentos a propósito como **bcrypt** o **Argon2**. Así, ni siquiera quien administra la base de datos puede saber tu contraseña; al iniciar sesión, se hashea lo que escribes y se compara con el hash guardado. (Y si alguna vez una web te envía tu contraseña por email cuando la olvidas, significa que no la hasheó: mala señal.)

## Probarlo en el navegador: Web Crypto API

El navegador trae criptografía de verdad, sin librerías: la **Web Crypto API** (`crypto.subtle`). Ábrelo en el playground y mira la consola.

### AES-GCM: cifrar y descifrar con una clave

```js playground=aes
async function demoAES() {
  // 1. Generar una clave AES de 256 bits
  const clave = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])

  // 2. Un "vector de inicialización": aleatorio y distinto en cada cifrado (no es secreto)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const mensaje = new TextEncoder().encode('Mi contraseña es gato123')
  const cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, clave, mensaje)
  console.log('Cifrado (bytes):', new Uint8Array(cifrado).slice(0, 16).join(','), '...')

  // 3. Descifrar con la MISMA clave y el mismo iv
  const descifrado = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, clave, cifrado)
  console.log('Descifrado:', new TextDecoder().decode(descifrado))
}

demoAES()
```

- **AES-GCM** es el **modo** recomendado de AES: además de cifrar, detecta si alguien modificó el texto cifrado (si cambias un solo byte, `decrypt` falla).
- **`iv`** debe ser **diferente cada vez** que cifras con la misma clave. Se guarda junto al texto cifrado.

### RSA-OAEP: cifrar con la pública, descifrar con la privada

```js playground=rsa
async function demoRSA() {
  // Un par de claves: pública y privada
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt']
  )

  const mensaje = new TextEncoder().encode('Solo el dueño de la clave privada puede leer esto')

  // Cualquiera con la clave PÚBLICA puede cifrar
  const cifrado = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, mensaje)
  console.log('Tamaño cifrado:', cifrado.byteLength, 'bytes')

  // Solo la PRIVADA descifra
  const descifrado = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, cifrado)
  console.log('Descifrado:', new TextDecoder().decode(descifrado))

  // Con la pública no se puede descifrar
  try {
    await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, publicKey, cifrado)
  } catch (error) {
    console.log('❌ Con la clave pública no se puede descifrar:', error.name)
  }
}

demoRSA()
```

Fíjate en que generar el par de claves RSA **tarda** algo más: es la lentitud de la que hablábamos.

### Un hash con SHA-256

```js playground=hash
async function sha256(texto) {
  const bytes = new TextEncoder().encode(texto)
  const huella = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(huella)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function demoHash() {
  console.log(await sha256('hola'))
  console.log(await sha256('hola'))   // siempre la misma huella para el mismo texto
  console.log(await sha256('Hola'))   // un cambio mínimo → una huella completamente distinta
}

demoHash()
```

> ⚠️ **No inventes tu propia criptografía.** Estos ejemplos son para entender cómo funciona. En una app real, usa HTTPS (que ya lo hace todo bien), librerías probadas y algoritmos estándar. Los errores en criptografía no dan mensajes de error: simplemente dejan tus datos expuestos sin que te enteres.

## ¿Y la computación cuántica?

Puede que hayas leído que los ordenadores cuánticos "romperán RSA". Es cierto que, si llegan a ser lo bastante potentes, podrían romper RSA y las curvas elípticas. Por eso ya existen algoritmos **post-cuánticos** (como ML-KEM), que navegadores y servidores están empezando a usar en HTTPS junto a los clásicos. A AES le afecta mucho menos: con claves de 256 bits se considera seguro.

## Tu turno

1. En el playground, cambia un byte del texto cifrado con AES-GCM antes de descifrarlo (`new Uint8Array(cifrado)[0] ^= 1`) y observa el error.
2. Calcula el SHA-256 de un texto largo y de ese mismo texto con un solo espacio más. Compara.
3. Abre cualquier web con HTTPS, haz clic en el candado y busca su certificado: ¿qué algoritmo de clave pública usa? ¿Quién lo firmó?
4. Explica con tus palabras, como si fuera una entrevista, por qué HTTPS no usa solo RSA para todo.

## Errores comunes

- **Pensar que cifrar y hashear es lo mismo.** El cifrado se revierte con la clave; el hash, nunca.
- **Cifrar las contraseñas** en la base de datos en vez de hashearlas con bcrypt o Argon2.
- **Reutilizar el mismo `iv`** con la misma clave en AES-GCM: rompe su seguridad.
- **Guardar la clave junto a los datos cifrados.** Es como dejar la llave pegada al cofre.
- **Usar SHA-256 directamente para contraseñas**: es demasiado rápido y se pueden probar millones por segundo. Para contraseñas, algoritmos lentos a propósito.
- **Inventar tu propio algoritmo** "porque nadie lo conoce". La seguridad debe depender solo de la clave.

## Para profundizar

- [Web Crypto API en MDN](https://developer.mozilla.org/es/docs/Web/API/Web_Crypto_API)
- [Cómo funciona HTTPS, en cómic (en inglés)](https://howhttps.works)

En resumen: **AES** es **simétrico** (una sola clave para cifrar y descifrar): rapidísimo, pero hay que compartir la clave de forma segura. **RSA** es **asimétrico** (clave **pública** para cifrar, **privada** para descifrar): no hace falta compartir secretos, pero es lento y solo cifra datos pequeños. Por eso **HTTPS los combina**: lo asimétrico para acordar una clave de sesión, y AES para todos los datos. Las claves asimétricas también sirven para **firmar**, y un **hash** no es cifrado: no se puede revertir, y es como se guardan las contraseñas.
