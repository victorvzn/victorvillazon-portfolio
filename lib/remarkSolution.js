// Plugin de remark: oculta la solución de un ejercicio dentro de un <details> plegable.
//
// En el .md, envuelve la solución entre dos comentarios HTML (cada uno en su propia línea,
// con una línea en blanco antes y después):
//
//   <!-- solucion: Ver la solución -->
//
//   ...párrafos, bloques de código, listas...
//
//   <!-- /solucion -->
//
// El texto tras los dos puntos es el del botón; si se omite, se usa DEFAULT_LABEL.
// Debe ejecutarse después de remarkPlayground, que solo mira el primer nivel del árbol:
// así los enlaces "Probar en el playground" de la solución también quedan ocultos.

const DEFAULT_LABEL = 'Ver la solución'

const OPEN = /^<!--\s*solucion(?::\s*(.*?))?\s*-->$/
const CLOSE = /^<!--\s*\/solucion\s*-->$/

const isHtml = (node, pattern) => node.type === 'html' && pattern.test(node.value.trim())

export default function remarkSolution() {
  return (tree) => {
    const children = []
    let open = null

    for (const node of tree.children) {
      if (!open && isHtml(node, OPEN)) {
        const label = node.value.trim().match(OPEN)[1] || DEFAULT_LABEL
        open = {
          type: 'solution',
          data: { hName: 'details', hProperties: { className: ['solution'] } },
          children: [{
            type: 'solutionSummary',
            data: { hName: 'summary' },
            children: [{ type: 'text', value: label }]
          }]
        }
        continue
      }

      if (open && isHtml(node, CLOSE)) {
        children.push(open)
        open = null
        continue
      }

      if (open) open.children.push(node)
      else children.push(node)
    }

    // Un bloque sin cerrar se cierra al final del post en vez de perder el contenido
    if (open) children.push(open)

    tree.children = children
  }
}
