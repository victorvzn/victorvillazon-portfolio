// Plugin de remark: convierte bloques de código marcados en un enlace "Probar en el playground".
//
// En el .md, marca los bloques de un mismo ejemplo con el mismo id:
//
//   ```html playground=navbar
//   ```css playground=navbar
//
// - Los bloques con el mismo id se juntan en un solo ejemplo y el enlace se inserta
//   después del último. Lenguajes válidos: html, css, js / javascript.
// - `layout=<nombre>` en cualquiera de ellos fuerza la distribución del playground.
// - `libs=<nombre>` (p. ej. `libs=tailwind`) carga esa librería en el playground. Úsalo solo
//   en los ejemplos que la necesitan: por defecto los enlaces van sin librerías.
// - Un bloque JS con `playground-setup` (p. ej. los datos del artículo) se antepone
//   al JavaScript de todos los ejemplos de ese post.

const PLAYGROUND_URL = 'https://playground-fe-v1.vercel.app/'

const LANGS = { html: 'html', css: 'css', js: 'javascript', javascript: 'javascript' }

const LINK_TEXT = 'Probar en el playground'

const parseMeta = (meta) => Object.fromEntries(
  (meta ?? '').split(/\s+/).filter(Boolean).map(part => {
    const [key, ...rest] = part.split('=')
    return [key, rest.length ? rest.join('=').replace(/^["']|["']$/g, '') : true]
  })
)

// Mismo formato que el botón Compartir del playground: JSON en UTF-8 → base64url sin "="
const encodeCode = (code) => Buffer.from(JSON.stringify(code), 'utf8').toString('base64url')

// La vista que muestra solo los editores que el ejemplo necesita
const pickLayout = ({ html, css, javascript }) => {
  if (javascript && !html && !css) return 'javascript-console'
  if (html && css && javascript) return 'grid'
  if (javascript) return 'javascript-preview'
  if (html && css) return 'html-css-preview'
  if (css) return 'css-preview'
  return 'html-preview'
}

export const playgroundUrl = (code, layout, libs) => {
  const params = new URLSearchParams({
    code: encodeCode(code),
    layout: layout ?? pickLayout(code),
    zen: '1'
  })
  if (libs) params.set('libs', libs)
  return `${PLAYGROUND_URL}#${params.toString()}`
}

export default function remarkPlayground() {
  return (tree) => {
    const setup = []
    const groups = new Map()

    tree.children.forEach((node, index) => {
      if (node.type !== 'code') return
      const meta = parseMeta(node.meta)
      const lang = LANGS[node.lang]

      if (meta['playground-setup'] && lang === 'javascript') setup.push(node.value)
      if (!meta.playground || !lang) return

      const group = groups.get(meta.playground) ?? { code: { html: '', css: '', javascript: '' }, layout: null, libs: null, last: index }
      group.code[lang] = group.code[lang] ? `${group.code[lang]}\n\n${node.value}` : node.value
      if (typeof meta.layout === 'string') group.layout = meta.layout
      if (typeof meta.libs === 'string') group.libs = meta.libs
      group.last = index
      groups.set(meta.playground, group)
    })

    // Se insertan de atrás hacia adelante para no mover los índices pendientes
    const inserts = [...groups.values()].sort((a, b) => b.last - a.last)

    for (const { code, layout, libs, last } of inserts) {
      if (code.javascript && setup.length) code.javascript = `${setup.join('\n\n')}\n\n${code.javascript}`

      tree.children.splice(last + 1, 0, {
        type: 'paragraph',
        data: { hProperties: { className: ['playground'] } },
        children: [{
          type: 'link',
          url: playgroundUrl(code, layout, libs),
          data: { hProperties: { className: ['playground-link'], target: '_blank', rel: 'noopener noreferrer' } },
          children: [{ type: 'text', value: LINK_TEXT }]
        }]
      })
    }
  }
}
