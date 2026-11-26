// Orden de lectura del blog: cada serie se divide en módulos, de lo más básico a lo más avanzado.
// Para añadir un post al índice, pon su slug en el módulo que le corresponda.
// Un post publicado que no esté aquí aparece en "Más artículos" al final de su serie.

export const BLOG_STRUCTURE = {
  html: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'html-semantico',
      'head-html-meta-tags',
      'enlaces-html',
      'texto-alternativo-imagenes'
    ] },
    { id: 'tablas-formularios', name: { es: 'Tablas y formularios', en: 'Tables and forms' }, level: 'basic', slugs: [
      'tablas-html',
      'formularios-validacion-html'
    ] },
    { id: 'componentes-nativos', name: { es: 'Componentes nativos', en: 'Native components' }, level: 'intermediate', slugs: [
      'acordeon-details-summary',
      'modal-sin-javascript',
      'popover-sin-javascript'
    ] },
    { id: 'rendimiento', name: { es: 'Rendimiento', en: 'Performance' }, level: 'intermediate', slugs: [
      'rendimiento-imagenes-webp'
    ] }
  ],
  css: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'css-como-enlazar',
      'selectores-css',
      'especificidad-css',
      'modelo-de-caja-css',
      'unidades-css',
      'variables-css-modo-oscuro'
    ] },
    { id: 'layout', name: { es: 'Layout', en: 'Layout' }, level: 'basic', slugs: [
      'position-css',
      'centrar-un-div',
      'flexbox-5-layouts-reales',
      'grid-5-layouts-reales'
    ] },
    { id: 'responsive', name: { es: 'Responsive', en: 'Responsive' }, level: 'intermediate', slugs: [
      'clamp-css',
      'responsive-sin-media-queries'
    ] },
    { id: 'interaccion-animacion', name: { es: 'Interacción y animación', en: 'Interaction and animation' }, level: 'intermediate', slugs: [
      'botones-hover-focus-transition',
      'animaciones-keyframes'
    ] },
    { id: 'css-moderno', name: { es: 'CSS moderno', en: 'Modern CSS' }, level: 'advanced', slugs: [
      'selector-has-css'
    ] }
  ],
  javascript: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'tipos-de-datos-javascript',
      'let-const-var',
      'condicionales-javascript',
      'bucles-for-while',
      'funciones-javascript',
      'template-literals',
      'arrow-functions',
      'errores-consola-javascript',
      'closures-javascript'
    ] },
    { id: 'arrays-objetos', name: { es: 'Arrays y objetos', en: 'Arrays and objects' }, level: 'basic', slugs: [
      'arrays-desde-cero',
      'objetos-javascript',
      'destructuring-javascript',
      'spread-rest',
      'map-filter-reduce',
      'find-some-every-includes'
    ] },
    { id: 'dom-eventos', name: { es: 'DOM y eventos', en: 'DOM and events' }, level: 'intermediate', slugs: [
      'dom-primer-boton',
      'eventos-teclado-javascript',
      'contador-toggle-me-gusta',
      'buscador-en-vivo-javascript',
      'delegacion-eventos',
      'localstorage'
    ] },
    { id: 'asincronia', name: { es: 'Asincronía y APIs', en: 'Async and APIs' }, level: 'intermediate', slugs: [
      'http-apis-json',
      'promesas-async-await',
      'fetch-api',
      'crud-fetch-javascript'
    ] },
    { id: 'esnext', name: { es: 'ESNext en el trabajo', en: 'ESNext at work' }, level: 'advanced', slugs: [
      'esnext-novedades-javascript',
      'arrays-sin-mutar-tosorted',
      'object-groupby',
      'metodos-set-union-intersection',
      'promise-withresolvers-modal',
      'iterator-helpers',
      'error-cause-fetch'
    ] }
  ],
  ejercicios: [
    { id: 'logica', name: { es: 'Lógica', en: 'Logic' }, level: 'basic', slugs: [
      'ejercicios-logica-calentamiento',
      'ejercicios-logica-textos',
      'ejercicios-logica-arrays-objetos'
    ] },
    { id: 'proyectos', name: { es: 'Mini proyectos', en: 'Mini projects' }, level: 'basic', slugs: [
      'proyecto-calculadora-imc'
    ] },
    { id: 'pruebas-js', name: { es: 'Pruebas técnicas de JavaScript', en: 'JavaScript technical tests' }, level: 'intermediate', slugs: [
      'prueba-tecnica-anagramas',
      'prueba-tecnica-aplanar-array',
      'prueba-tecnica-parentesis',
      'prueba-tecnica-debounce'
    ] },
    { id: 'pruebas-maquetacion', name: { es: 'Pruebas técnicas de maquetación', en: 'Layout technical tests' }, level: 'intermediate', slugs: [
      'prueba-tecnica-tarjeta-producto'
    ] }
  ]
}

const pad = (n) => String(n).padStart(2, '0')

// Agrupa los posts disponibles en series → módulos, numerados en orden de lectura dentro de cada serie.
// Los módulos sin posts disponibles (p. ej. solo borradores en producción) no se muestran.
export const buildSections = (posts, seriesOrder, locale) => {
  const bySlug = new Map(posts.map(post => [post.slug, post]))

  return seriesOrder
    .map(series => {
      const placed = new Set()
      const modules = (BLOG_STRUCTURE[series] ?? []).map(module => {
        const items = module.slugs
          .map(slug => bySlug.get(slug))
          .filter(post => post && post.series === series)
        items.forEach(post => placed.add(post.slug))
        return { id: module.id, name: module.name[locale] ?? module.name.es, level: module.level, posts: items }
      })

      // Posts de la serie que todavía no están en la estructura
      const rest = posts
        .filter(post => post.series === series && !placed.has(post.slug))
        .sort((a, b) => (a.date < b.date ? -1 : 1))
      if (rest.length) modules.push({ id: 'mas', name: null, level: null, posts: rest })

      let n = 0
      const numbered = modules
        .filter(module => module.posts.length)
        .map((module, index) => ({
          ...module,
          number: pad(index + 1),
          posts: module.posts.map(post => ({ ...post, number: pad(++n) }))
        }))

      return { series, modules: numbered }
    })
    .filter(section => section.modules.length)
}
