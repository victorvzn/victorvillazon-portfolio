---
title: 'AWS desde cero: qué es la nube y cómo crear tu cuenta sin sustos'
description: 'Qué es la computación en la nube, los servicios de AWS que más vas a oír (EC2, S3, Lambda, RDS...), regiones, el modelo de pago por uso, y cómo crear tu cuenta de forma segura: MFA, un usuario que no sea root y alertas de gasto.'
date: 2026-11-27
series: devops
tags: [AWS, Cloud, DevOps, Fundamentos]
draft: true
---

"Lo tenemos en AWS." Lo vas a escuchar en casi cualquier empresa. **Amazon Web Services** es el proveedor de nube más grande del mundo, y una parte enorme de internet funciona sobre él. Para un perfil junior, saber moverse en lo básico de AWS es un punto a favor muy claro.

Pero AWS también tiene fama de dar **sustos en la factura** a quien empieza sin cuidado. Este post es para que entiendas qué es y crees tu cuenta **bien desde el primer minuto**.

## ¿Qué es "la nube"?

La nube es, simplemente, **usar ordenadores de otra empresa a través de internet**, pagando solo por lo que usas.

Antes, para publicar una app, una empresa compraba servidores, los metía en una sala con aire acondicionado y contrataba a alguien para mantenerlos. Si un día tenía el triple de visitas, no había forma de conseguir más servidores a tiempo. Y si tenía menos, pagaba igual.

Con la nube:

- **Alquilas** en vez de comprar: un servidor durante 3 horas, 5 GB de almacenamiento, un millón de ejecuciones de una función.
- **Pagas por uso**, como la luz o el agua.
- **Escalas en minutos**: pasas de 1 a 100 servidores (y vuelves a 1) cuando lo necesitas.
- **No mantienes hardware**: de eso se encarga AWS.

## Los servicios que más vas a oír

AWS tiene más de 200 servicios, y nadie los conoce todos. Estos son los que aparecen en el día a día:

| Servicio | Qué es | Una analogía |
| --- | --- | --- |
| **EC2** | Servidores virtuales | Alquilar un ordenador en la nube |
| **S3** | Almacenamiento de archivos | Un disco duro infinito (imágenes, backups, webs estáticas) |
| **Lambda** | Funciones que se ejecutan cuando se las llama | Pagar solo los milisegundos que tu código trabaja |
| **RDS** | Bases de datos gestionadas (PostgreSQL, MySQL...) | Una base de datos sin tener que mantenerla |
| **DynamoDB** | Base de datos NoSQL | Un almacén de documentos muy rápido |
| **CloudFront** | CDN: copia tu web en servidores de todo el mundo | Sucursales cerca de cada usuario |
| **Route 53** | Dominios y DNS | La guía telefónica de tu dominio |
| **IAM** | Usuarios y permisos | Las llaves de cada puerta |
| **CloudWatch** | Logs y métricas | La cámara de seguridad de tus servicios |
| **ECS / App Runner** | Ejecutar contenedores de Docker | Tus imágenes de Docker, en la nube |

En los siguientes posts usarás **S3** para publicar una web y **Lambda** para crear una API.

### Tipos de servicio

Verás mucho estas siglas:

- **IaaS** (*infraestructura como servicio*): te dan la máquina y tú haces el resto. Ejemplo: EC2.
- **PaaS** (*plataforma como servicio*): tú pones el código y ellos gestionan los servidores. Ejemplos: App Runner, Elastic Beanstalk (o, fuera de AWS, Vercel y Render).
- **Serverless** (*sin servidor*): ni siquiera piensas en servidores; tu código se ejecuta cuando hace falta. Ejemplos: Lambda, DynamoDB, S3. (Sí hay servidores, pero no los ves ni los gestionas.)

## Regiones y zonas

AWS tiene centros de datos repartidos por el mundo, agrupados en **regiones**: `us-east-1` (Virginia), `sa-east-1` (São Paulo), `eu-west-1` (Irlanda)...

- Elige una región **cerca de tus usuarios**: menos distancia, respuestas más rápidas.
- Los recursos **se crean en una región concreta**. Si creas algo en São Paulo y luego miras la consola con Virginia seleccionada, **no lo verás**. Es la confusión número uno al empezar: mira siempre la región, arriba a la derecha.
- Algunos servicios (IAM, CloudFront, la facturación) son **globales**.

## Cuánto cuesta

AWS cobra **por uso**, y cada servicio tiene su propia forma de medirlo: por hora de servidor, por GB almacenado, por millón de peticiones...

Para empezar, AWS ofrece un **plan gratuito** para cuentas nuevas, con créditos y límites de uso gratis en muchos servicios durante un tiempo. Las condiciones han cambiado varias veces, así que **revisa la [página oficial de la capa gratuita](https://aws.amazon.com/free/)** antes de crear nada. Para practicar con S3 y Lambda, como en esta serie, el coste suele ser cero o de céntimos.

> ⚠️ Lo que da sustos no es usar AWS, sino **olvidarse algo encendido** (un servidor EC2, una base de datos RDS) o que **alguien robe tus credenciales**. Lo que sigue evita las dos cosas.

## Paso 1: crear la cuenta

1. Entra en [aws.amazon.com](https://aws.amazon.com) y pulsa **Crear una cuenta**.
2. Te pedirá un email, un nombre de cuenta, una **tarjeta** (aunque uses el plan gratuito, para verificar tu identidad) y un teléfono.
3. Elige el plan de soporte **básico** (gratuito).

El email y la contraseña que acabas de usar son el **usuario raíz** (*root*): tiene **poder absoluto** sobre la cuenta, incluida la facturación y cerrarla. Trátalo como la llave maestra de tu casa.

## Paso 2: protege el usuario raíz con MFA

**MFA** (*autenticación multifactor*) pide, además de la contraseña, un código de tu móvil. Aunque alguien consiga tu contraseña, no podrá entrar.

1. Entra en la consola con el usuario raíz.
2. Arriba a la derecha, en tu nombre de cuenta → **Credenciales de seguridad**.
3. En **Autenticación multifactor (MFA)**, pulsa **Asignar dispositivo MFA**.
4. Elige **aplicación de autenticación** y escanea el código QR con una app como Google Authenticator, Microsoft Authenticator o 1Password (o usa una **passkey** o una llave de seguridad).

Hazlo **ahora**, antes que cualquier otra cosa.

## Paso 3: crea un usuario para el día a día

**No uses el usuario raíz para trabajar.** Crea un usuario administrador y deja el raíz guardado para emergencias.

La forma recomendada hoy es **IAM Identity Center**:

1. En la barra de búsqueda de la consola, escribe **IAM Identity Center** y actívalo.
2. Crea un **usuario** con tu email.
3. Crea un **conjunto de permisos** (*permission set*) con la política `AdministratorAccess`.
4. En **Cuentas de AWS**, asigna tu usuario a tu cuenta con ese conjunto de permisos.
5. Recibirás un email para activar el usuario. Configura también su MFA.

Identity Center te da una **URL de acceso** propia (algo como `https://d-xxxxxxxxxx.awsapps.com/start`): guárdala en marcadores. A partir de ahora, entra siempre por ahí.

> Verás muchos tutoriales que crean un **usuario de IAM** con *access keys* (una clave y un secreto) para todo. Funciona, pero esas claves no caducan y, si se filtran (por ejemplo, subidas a GitHub por error), dan acceso a tu cuenta. Bots automáticos rastrean GitHub buscándolas en minutos. Si alguna vez necesitas claves, que sean con los **mínimos permisos** y nunca en el código.

## Paso 4: alertas de gasto

Lo que te avisa **antes** del susto. En la consola, busca **Billing and Cost Management** → **Budgets** (Presupuestos) → **Crear presupuesto**:

1. Elige la plantilla **Presupuesto de gasto cero** (*Zero spend budget*): te avisa por email en cuanto se gaste **un solo céntimo**.
2. Crea otro de **presupuesto mensual** con un límite pequeño (por ejemplo, 5 dólares) para tener un segundo aviso.

Con eso, si te olvidas algo encendido, lo sabrás en horas, no a fin de mes.

## Paso 5 (opcional): la CLI de AWS

Todo lo que haces con clics en la consola se puede hacer desde la terminal con la **AWS CLI**. Instálala desde la [guía oficial](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) y conéctala con tu usuario de Identity Center:

```bash
aws configure sso
aws sts get-caller-identity --profile mi-perfil
```

`aws configure sso` te pide la URL de acceso y abre el navegador para iniciar sesión. Las credenciales son **temporales** y caducan solas: mucho más seguro que unas *access keys*. El segundo comando te dice con qué usuario estás conectado.

## Reglas de oro para no llevarte sustos

1. **MFA** en el usuario raíz y en tu usuario.
2. **No uses el raíz** para el día a día.
3. **Nunca subas credenciales** a GitHub. Si pasa, desactívalas al momento desde IAM.
4. **Presupuesto de gasto cero** activado.
5. **Apaga y borra** lo que ya no uses. Al terminar cada práctica, repasa qué has creado.
6. **Mira la región** antes de buscar algo o de crear algo.

## Tu turno

1. Crea tu cuenta de AWS y activa el MFA del usuario raíz.
2. Crea tu usuario de Identity Center con su MFA y entra con él.
3. Crea el presupuesto de gasto cero.
4. Explora la consola: busca S3, Lambda y CloudWatch. Cambia de región y observa cómo cambia lo que ves.

## Errores comunes

- **Trabajar con el usuario raíz** "porque es más rápido".
- **No activar MFA.** Es la protección más importante y la que más gente se salta.
- **Subir *access keys* al repositorio.** Un bot las encontrará antes que tú.
- **No crear un presupuesto** y descubrir el gasto en la factura.
- **"Mis recursos han desaparecido"**: estás mirando otra región.
- **Dejar servicios encendidos** después de practicar.

## Para profundizar

- [¿Qué es la computación en la nube? (AWS, en español)](https://aws.amazon.com/es/what-is-cloud-computing/)
- [Buenas prácticas para el usuario raíz (documentación oficial, en inglés)](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

En resumen: la **nube** es alquilar recursos de computación por internet y **pagar por uso**. AWS tiene servicios para todo: servidores (**EC2**), archivos (**S3**), funciones (**Lambda**), bases de datos (**RDS**)... organizados por **regiones**. Al crear tu cuenta: **MFA** en el usuario raíz, un **usuario de Identity Center** para el día a día, **ninguna credencial en el código** y un **presupuesto de gasto cero** que te avise del primer céntimo.
