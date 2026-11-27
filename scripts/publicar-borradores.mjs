// Publica los siguientes borradores del blog: cambia `draft: true` por `draft: false` y pone la fecha de hoy.
// Lo ejecuta cada día el workflow .github/workflows/publicar-borradores.yml, pero también se puede usar a mano:
//
//   node scripts/publicar-borradores.mjs              → publica 8 (el workflow pasa siempre su POSTS_POR_DIA)
//   node scripts/publicar-borradores.mjs --cantidad 3 → publica 3
//   node scripts/publicar-borradores.mjs --simular    → muestra cuáles publicaría, sin tocar nada
//
// Orden: alterna series, y dentro de cada serie sigue el orden de lectura de lib/blogStructure.js (ver abajo).
// Solo se publican los posts con `draft: true` exactamente (para retener uno, usa por ejemplo `draft: hold`).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { BLOG_STRUCTURE } from '../lib/blogStructure.js'

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = path.join(RAIZ, 'content', 'blog')
const ZONA_HORARIA = 'America/Lima'

// ── Argumentos ──────────────────────────────────────────

const args = process.argv.slice(2)
const simular = args.includes('--simular')
const indiceCantidad = args.indexOf('--cantidad')
const cantidad = indiceCantidad === -1 ? 8 : Number(args[indiceCantidad + 1])

if (!Number.isInteger(cantidad) || cantidad < 1) {
  console.error('--cantidad debe ser un número entero mayor que 0')
  process.exit(1)
}

// ── Leer los posts ──────────────────────────────────────

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/

const campo = (frontmatter, nombre) => {
  const valor = frontmatter.match(new RegExp(`^${nombre}:\\s*(.*?)\\s*$`, 'm'))?.[1]
  return valor?.replace(/^(['"])(.*)\1$/, '$2')
}

const posts = fs.readdirSync(POSTS_DIR)
  .filter((archivo) => archivo.endsWith('.md'))
  .map((archivo) => {
    const ruta = path.join(POSTS_DIR, archivo)
    const frontmatter = fs.readFileSync(ruta, 'utf8').match(FRONTMATTER)?.[1] ?? ''
    return {
      slug: archivo.replace(/\.md$/, ''),
      ruta,
      titulo: campo(frontmatter, 'title') ?? archivo,
      serie: campo(frontmatter, 'series'),
      fecha: campo(frontmatter, 'date') ?? '',
      borrador: campo(frontmatter, 'draft') === 'true'
    }
  })

// ── Elegir los siguientes ───────────────────────────────

// Una cola por serie con sus borradores en orden de lectura
const colas = Object.keys(BLOG_STRUCTURE).map((serie, indiceSerie) => {
  const deLaSerie = posts.filter((post) => post.serie === serie)

  // Orden de lectura: el de los módulos; los que no están en la estructura, al final y por fecha
  const ordenLectura = BLOG_STRUCTURE[serie].flatMap((modulo) => modulo.slugs)
  const posicion = (post) => {
    const i = ordenLectura.indexOf(post.slug)
    return i === -1 ? Infinity : i
  }

  return {
    serie,
    indiceSerie,
    total: deLaSerie.length,
    publicados: deLaSerie.filter((post) => !post.borrador).length,
    borradores: deLaSerie
      .filter((post) => post.borrador)
      .toSorted((a, b) => posicion(a) - posicion(b) || (a.fecha < b.fecha ? -1 : 1))
  }
})

const totalBorradores = colas.reduce((total, cola) => total + cola.borradores.length, 0)

// Cupo diario de cada serie: lo que le queda repartido entre los días que faltan. Las series grandes pueden
// salir 2 veces al día; las pequeñas, 1. Así cada día hay variedad y todas terminan más o menos a la vez.
// Dentro del cupo, cada elección se la lleva la serie más atrasada en proporción a su tamaño. Se mide a mitad
// del siguiente post (+0.5) para que una serie de 1 solo post salga a mitad de calendario, no al final.
// En un empate, gana la que va antes en BLOG_STRUCTURE.
const diasRestantes = Math.ceil(totalBorradores / cantidad)
for (const cola of colas) {
  cola.cupo = Math.max(1, Math.ceil(cola.borradores.length / diasRestantes))
  cola.hoy = 0
}

const avance = (cola) => (cola.publicados + 0.5) / cola.total
const sinCupo = (cola) => (cola.hoy >= cola.cupo ? 1 : 0)

const elegidos = []
while (elegidos.length < cantidad && elegidos.length < totalBorradores) {
  const cola = colas
    .filter((c) => c.borradores.length > 0)
    .toSorted((a, b) => sinCupo(a) - sinCupo(b) || avance(a) - avance(b) || a.indiceSerie - b.indiceSerie)[0]

  elegidos.push(cola.borradores.shift())
  cola.publicados++
  cola.hoy++
}

const quedan = totalBorradores - elegidos.length

// ── Publicar ────────────────────────────────────────────

// 'en-CA' formatea como AAAA-MM-DD
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(new Date())

const publicar = (post) => {
  const texto = fs.readFileSync(post.ruta, 'utf8')
  const actualizado = texto.replace(FRONTMATTER, (bloque) => bloque
    .replace(/^draft:\s*true\s*$/m, 'draft: false')
    .replace(/^date:.*$/m, `date: ${hoy}`))
  fs.writeFileSync(post.ruta, actualizado)
}

if (elegidos.length === 0) {
  console.log('No quedan borradores por publicar.')
} else {
  console.log(`${simular ? 'Se publicarían' : 'Publicados'} ${elegidos.length} posts (${hoy}):`)
  for (const post of elegidos) {
    if (!simular) publicar(post)
    console.log(`  · [${post.serie}] ${post.slug}`)
  }
  console.log(`Quedan ${quedan} borradores.`)
}

// ── Salida para GitHub Actions ──────────────────────────

if (process.env.GITHUB_OUTPUT && !simular) {
  const titulos = elegidos.map((post) => `- ${post.titulo}`).join('\n')
  fs.appendFileSync(process.env.GITHUB_OUTPUT, [
    `publicados=${elegidos.length}`,
    `quedan=${quedan}`,
    'titulos<<FIN_TITULOS',
    titulos,
    'FIN_TITULOS',
    ''
  ].join('\n'))
}
