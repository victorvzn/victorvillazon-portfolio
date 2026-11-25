// Plugin de rehype: los enlaces externos de los posts (MDN, PokeAPI, etc.) se abren en una pestaña nueva.
// Los enlaces internos (/blog, #seccion) y los de victorvillazon.com se quedan en la misma pestaña.
const SITE_HOSTS = ['victorvillazon.com', 'www.victorvillazon.com']

const isExternal = (href) => {
  try {
    const url = new URL(href)
    return (url.protocol === 'http:' || url.protocol === 'https:') && !SITE_HOSTS.includes(url.hostname)
  } catch {
    return false // rutas relativas y anclas
  }
}

const visit = (node) => {
  if (node.type === 'element' && node.tagName === 'a' && isExternal(node.properties?.href)) {
    node.properties.target = '_blank'
    node.properties.rel = ['noopener', 'noreferrer']
  }
  node.children?.forEach(visit)
}

export default function rehypeExternalLinks() {
  return (tree) => visit(tree)
}
