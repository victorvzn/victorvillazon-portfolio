// Orden de lectura del blog: cada serie se divide en módulos, de lo más básico a lo más avanzado.
// Para añadir un post al índice, pon su slug en el módulo que le corresponda.
// Un post publicado que no esté aquí aparece en "Más artículos" al final de su serie.

export const BLOG_STRUCTURE = {
  html: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'html-semantico',
      'head-html-meta-tags',
      'listas-html',
      'enlaces-html',
      'atributos-id-class-data'
    ] },
    { id: 'multimedia', name: { es: 'Imágenes y multimedia', en: 'Images and media' }, level: 'basic', slugs: [
      'texto-alternativo-imagenes',
      'multimedia-html',
      'rendimiento-imagenes-webp'
    ] },
    { id: 'tablas-formularios', name: { es: 'Tablas y formularios', en: 'Tables and forms' }, level: 'basic', slugs: [
      'tablas-html',
      'formularios-validacion-html'
    ] },
    { id: 'componentes-nativos', name: { es: 'Componentes nativos', en: 'Native components' }, level: 'intermediate', slugs: [
      'acordeon-details-summary',
      'modal-sin-javascript',
      'popover-sin-javascript'
    ] }
  ],
  css: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'css-como-enlazar',
      'selectores-css',
      'pseudo-clases-pseudo-elementos',
      'especificidad-css',
      'modelo-de-caja-css',
      'display-css',
      'unidades-css'
    ] },
    { id: 'colores-tipografia', name: { es: 'Colores y tipografía', en: 'Colors and typography' }, level: 'basic', slugs: [
      'colores-css',
      'tipografia-css'
    ] },
    { id: 'variables', name: { es: 'Variables CSS', en: 'CSS variables' }, level: 'intermediate', slugs: [
      'variables-css-modo-oscuro',
      'root-custom-properties'
    ] },
    { id: 'layout', name: { es: 'Layout', en: 'Layout' }, level: 'basic', slugs: [
      'position-css',
      'centrar-un-div',
      'flexbox-5-layouts-reales',
      'grid-5-layouts-reales'
    ] },
    { id: 'responsive', name: { es: 'Responsive', en: 'Responsive' }, level: 'intermediate', slugs: [
      'media-queries-mobile-first',
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
      'arrow-functions'
    ] },
    { id: 'textos-numeros', name: { es: 'Textos y números', en: 'Strings and numbers' }, level: 'basic', slugs: [
      'template-literals',
      'metodos-texto-javascript',
      'math-numeros-javascript'
    ] },
    { id: 'arrays-objetos', name: { es: 'Arrays y objetos', en: 'Arrays and objects' }, level: 'basic', slugs: [
      'arrays-desde-cero',
      'objetos-javascript',
      'destructuring-javascript',
      'spread-rest',
      'optional-chaining-nullish',
      'map-filter-reduce',
      'find-some-every-includes'
    ] },
    { id: 'errores', name: { es: 'Errores y depuración', en: 'Errors and debugging' }, level: 'basic', slugs: [
      'errores-consola-javascript',
      'try-catch-javascript'
    ] },
    { id: 'dom-eventos', name: { es: 'DOM y eventos', en: 'DOM and events' }, level: 'intermediate', slugs: [
      'dom-primer-boton',
      'eventos-teclado-javascript',
      'contador-toggle-me-gusta',
      'formularios-javascript',
      'buscador-en-vivo-javascript',
      'delegacion-eventos',
      'localstorage'
    ] },
    { id: 'asincronia', name: { es: 'Asincronía y APIs', en: 'Async and APIs' }, level: 'intermediate', slugs: [
      'settimeout-asincronia',
      'http-apis-json',
      'promesas-async-await',
      'fetch-api',
      'crud-fetch-javascript'
    ] },
    { id: 'codigo-organizado', name: { es: 'Código organizado', en: 'Organized code' }, level: 'intermediate', slugs: [
      'closures-javascript',
      'modulos-import-export',
      'clases-javascript'
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
      'proyecto-calculadora-imc',
      'proyecto-todo-app'
    ] },
    { id: 'pruebas-js', name: { es: 'Pruebas técnicas de JavaScript', en: 'JavaScript technical tests' }, level: 'intermediate', slugs: [
      'prueba-tecnica-anagramas',
      'prueba-tecnica-dos-numeros-suman',
      'prueba-tecnica-ordenar-objetos',
      'prueba-tecnica-aplanar-array',
      'prueba-tecnica-parentesis',
      'prueba-tecnica-debounce',
      'prueba-tecnica-drive-en-memoria-nivel-1'
    ] },
    { id: 'pruebas-maquetacion', name: { es: 'Pruebas técnicas de maquetación', en: 'Layout technical tests' }, level: 'intermediate', slugs: [
      'prueba-tecnica-tarjeta-producto',
      'prueba-tecnica-navbar-responsive'
    ] }
  ],
  carrera: [
    { id: 'herramientas', name: { es: 'Herramientas del día a día', en: 'Everyday tools' }, level: 'basic', slugs: [
      'devtools-navegador',
      'git-github-desde-cero'
    ] },
    { id: 'publicar', name: { es: 'Publica tu trabajo', en: 'Ship your work' }, level: 'basic', slugs: [
      'publicar-web-gratis'
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
