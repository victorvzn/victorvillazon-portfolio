// Orden de lectura del blog: cada serie se divide en módulos, de lo más básico a lo más avanzado.
// Para añadir un post al índice, pon su slug en el módulo que le corresponda.
// Un post publicado que no esté aquí aparece en "Más artículos" al final de su serie.

export const BLOG_STRUCTURE = {
  html: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'anatomia-documento-html',
      'textos-html',
      'html-semantico',
      'head-html-meta-tags',
      'listas-html',
      'enlaces-html',
      'atributos-id-class-data',
      'validar-html'
    ] },
    { id: 'multimedia', name: { es: 'Imágenes y multimedia', en: 'Images and media' }, level: 'basic', slugs: [
      'texto-alternativo-imagenes',
      'multimedia-html',
      'iframe-contenido-embebido',
      'rendimiento-imagenes-webp'
    ] },
    { id: 'tablas-formularios', name: { es: 'Tablas y formularios', en: 'Tables and forms' }, level: 'basic', slugs: [
      'tablas-html',
      'formularios-validacion-html'
    ] },
    { id: 'accesibilidad', name: { es: 'Accesibilidad', en: 'Accessibility' }, level: 'intermediate', slugs: [
      'accesibilidad-teclado-foco',
      'formularios-accesibles',
      'aria-cuando-usarlo'
    ] },
    { id: 'seo', name: { es: 'SEO y redes sociales', en: 'SEO and social media' }, level: 'intermediate', slugs: [
      'seo-como-google-encuentra-tu-web',
      'open-graph-twitter-cards',
      'robots-txt-sitemap-xml',
      'url-canonica-redirecciones',
      'datos-estructurados-json-ld',
      'core-web-vitals',
      'google-search-console',
      'hreflang-sitios-multiidioma'
    ] },
    { id: 'componentes-nativos', name: { es: 'Componentes nativos', en: 'Native components' }, level: 'intermediate', slugs: [
      'acordeon-details-summary',
      'modal-sin-javascript',
      'popover-sin-javascript',
      'web-components-template-slot'
    ] }
  ],
  css: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'css-como-enlazar',
      'selectores-css',
      'pseudo-clases-pseudo-elementos',
      'especificidad-css',
      'cascada-herencia-css',
      'modelo-de-caja-css',
      'fondos-bordes-sombras',
      'display-css',
      'overflow-css',
      'unidades-css',
      'propiedades-logicas-css'
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
      'z-index-css',
      'centrar-un-div',
      'flexbox-5-layouts-reales',
      'grid-5-layouts-reales',
      'object-fit-aspect-ratio',
      'landing-flexbox-grid'
    ] },
    { id: 'responsive', name: { es: 'Responsive', en: 'Responsive' }, level: 'intermediate', slugs: [
      'media-queries-mobile-first',
      'clamp-css',
      'responsive-sin-media-queries'
    ] },
    { id: 'interaccion-animacion', name: { es: 'Interacción y animación', en: 'Interaction and animation' }, level: 'intermediate', slugs: [
      'botones-hover-focus-transition',
      'transform-css',
      'animaciones-keyframes',
      'prefers-reduced-motion'
    ] },
    { id: 'css-moderno', name: { es: 'CSS moderno', en: 'Modern CSS' }, level: 'advanced', slugs: [
      'selector-has-css',
      'css-nesting',
      'container-queries',
      'subgrid-css',
      'css-layer',
      'oklch-color-mix',
      'view-transitions',
      'scroll-driven-animations'
    ] }
  ],
  javascript: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'tipos-de-datos-javascript',
      'let-const-var',
      'condicionales-javascript',
      'igualdad-coercion-javascript',
      'bucles-for-while',
      'funciones-javascript',
      'arrow-functions',
      'scope-hoisting'
    ] },
    { id: 'textos-numeros', name: { es: 'Textos y números', en: 'Strings and numbers' }, level: 'basic', slugs: [
      'template-literals',
      'metodos-texto-javascript',
      'expresiones-regulares-javascript',
      'math-numeros-javascript'
    ] },
    { id: 'arrays-objetos', name: { es: 'Arrays y objetos', en: 'Arrays and objects' }, level: 'basic', slugs: [
      'arrays-desde-cero',
      'objetos-javascript',
      'destructuring-javascript',
      'spread-rest',
      'optional-chaining-nullish',
      'map-filter-reduce',
      'find-some-every-includes',
      'sort-javascript',
      'object-keys-values-entries',
      'copiar-objetos-structuredclone',
      'map-set-javascript'
    ] },
    { id: 'fechas-formatos', name: { es: 'Fechas y formatos', en: 'Dates and formatting' }, level: 'basic', slugs: [
      'fechas-date-javascript',
      'intl-numberformat'
    ] },
    { id: 'errores', name: { es: 'Errores y depuración', en: 'Errors and debugging' }, level: 'basic', slugs: [
      'errores-consola-javascript',
      'try-catch-javascript'
    ] },
    { id: 'dom-eventos', name: { es: 'DOM y eventos', en: 'DOM and events' }, level: 'intermediate', slugs: [
      'dom-primer-boton',
      'classlist-dataset',
      'crear-elementos-dom',
      'eventos-teclado-javascript',
      'contador-toggle-me-gusta',
      'formularios-javascript',
      'buscador-en-vivo-javascript',
      'delegacion-eventos',
      'pintar-lista-dom',
      'localstorage',
      'intersection-observer'
    ] },
    { id: 'asincronia', name: { es: 'Asincronía y APIs', en: 'Async and APIs' }, level: 'intermediate', slugs: [
      'settimeout-asincronia',
      'event-loop-javascript',
      'http-apis-json',
      'promesas-async-await',
      'fetch-api',
      'estados-carga-error-fetch',
      'crud-fetch-javascript',
      'promise-all-allsettled-race',
      'abortcontroller-fetch',
      'cors-error'
    ] },
    { id: 'codigo-organizado', name: { es: 'Código organizado', en: 'Organized code' }, level: 'intermediate', slugs: [
      'closures-javascript',
      'funciones-orden-superior-javascript',
      'this-javascript',
      'modulos-import-export',
      'clases-javascript',
      'funciones-puras-inmutabilidad',
      'weakmap-weakset-javascript',
      'codigo-limpio-nombres'
    ] },
    { id: 'esnext', name: { es: 'ESNext en el trabajo', en: 'ESNext at work' }, level: 'advanced', slugs: [
      'esnext-novedades-javascript',
      'arrays-sin-mutar-tosorted',
      'object-groupby',
      'metodos-set-union-intersection',
      'promise-withresolvers-modal',
      'generadores-iteradores-javascript',
      'iterator-helpers',
      'error-cause-fetch',
      'temporal-api'
    ] }
  ],
  typescript: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'typescript-desde-cero',
      'typescript-interfaces-uniones'
    ] },
    { id: 'tipos-avanzados', name: { es: 'Tipos que escalan', en: 'Types that scale' }, level: 'intermediate', slugs: [
      'typescript-genericos-utility-types',
      'typescript-narrowing-uniones-discriminadas'
    ] },
    { id: 'zod', name: { es: 'Validación con Zod', en: 'Validation with Zod' }, level: 'intermediate', slugs: [
      'zod-desde-cero',
      'zod-formularios-apis',
      'zod-transformaciones-variables-entorno'
    ] }
  ],
  python: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'python-desde-cero',
      'python-condicionales-bucles',
      'python-listas-tuplas-diccionarios',
      'python-funciones'
    ] },
    { id: 'intermedio', name: { es: 'Python en serio', en: 'Serious Python' }, level: 'intermediate', slugs: [
      'python-comprensiones',
      'python-archivos-excepciones',
      'python-entornos-virtuales-pip',
      'python-poo'
    ] },
    { id: 'avanzado', name: { es: 'Python avanzado', en: 'Advanced Python' }, level: 'advanced', slugs: [
      'python-decoradores',
      'python-type-hints-dataclasses',
      'python-asyncio',
      'python-fastapi-api'
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
      'proyecto-piedra-papel-tijera',
      'proyecto-todo-app',
      'proyecto-cronometro',
      'proyecto-quiz',
      'proyecto-galeria-modal',
      'proyecto-app-clima',
      'proyecto-auditoria-seo'
    ] },
    { id: 'pruebas-js', name: { es: 'Pruebas técnicas de JavaScript', en: 'JavaScript technical tests' }, level: 'intermediate', slugs: [
      'prueba-tecnica-fizzbuzz',
      'prueba-tecnica-palindromo',
      'prueba-tecnica-contar-caracteres',
      'prueba-tecnica-anagramas',
      'prueba-tecnica-dos-numeros-suman',
      'prueba-tecnica-ordenar-objetos',
      'prueba-tecnica-aplanar-array',
      'prueba-tecnica-parentesis',
      'prueba-tecnica-map-filter-propio',
      'prueba-tecnica-debounce',
      'prueba-tecnica-throttle',
      'prueba-tecnica-memoize',
      'prueba-tecnica-drive-en-memoria-nivel-1',
      'prueba-tecnica-drive-en-memoria-nivel-2'
    ] },
    { id: 'pruebas-maquetacion', name: { es: 'Pruebas técnicas de maquetación', en: 'Layout technical tests' }, level: 'intermediate', slugs: [
      'prueba-tecnica-tarjeta-producto',
      'prueba-tecnica-navbar-responsive',
      'prueba-tecnica-formulario-login',
      'prueba-tecnica-pricing-table',
      'prueba-tecnica-dashboard-layout',
      'prueba-tecnica-diseno-a-codigo'
    ] }
  ],
  frameworks: [
    { id: 'primeros-pasos', name: { es: 'Primeros pasos', en: 'First steps' }, level: 'basic', slugs: [
      'por-que-un-framework',
      'vite-proyecto-moderno'
    ] },
    { id: 'tailwind', name: { es: 'Tailwind CSS', en: 'Tailwind CSS' }, level: 'intermediate', slugs: [
      'tailwindcss-desde-cero',
      'tailwind-componentes-responsive-dark'
    ] },
    { id: 'react', name: { es: 'React', en: 'React' }, level: 'intermediate', slugs: [
      'react-desde-cero',
      'react-estado-eventos-listas',
      'react-formularios-validacion',
      'react-useeffect-fetch',
      'react-custom-hooks',
      'react-context-usereducer',
      'react-rendimiento-memo'
    ] },
    { id: 'vue', name: { es: 'Vue', en: 'Vue' }, level: 'intermediate', slugs: [
      'vue-desde-cero',
      'vue-computed-watch',
      'vue-slots-v-model-provide',
      'vue-composables-pinia'
    ] },
    { id: 'nextjs', name: { es: 'Next.js', en: 'Next.js' }, level: 'intermediate', slugs: [
      'seo-react-spa-ssr',
      'nextjs-desde-cero',
      'imagenes-og-dinamicas'
    ] },
    { id: 'astro', name: { es: 'Astro', en: 'Astro' }, level: 'intermediate', slugs: [
      'astro-desde-cero'
    ] }
  ],
  testing: [
    { id: 'vitest', name: { es: 'Vitest', en: 'Vitest' }, level: 'basic', slugs: [
      'testing-por-que-pruebas',
      'vitest-desde-cero',
      'vitest-mocks-espias',
      'vitest-asincronia-timers-cobertura'
    ] },
    { id: 'testing-library', name: { es: 'Testing Library', en: 'Testing Library' }, level: 'intermediate', slugs: [
      'testing-library-desde-cero',
      'testing-library-user-event-formularios',
      'testing-library-fetch-msw'
    ] },
    { id: 'tdd', name: { es: 'TDD', en: 'TDD' }, level: 'advanced', slugs: [
      'tdd-rojo-verde-refactor',
      'tdd-kata-carrito-compras',
      'tdd-api-express-supertest'
    ] },
    { id: 'e2e', name: { es: 'Tests end-to-end', en: 'End-to-end tests' }, level: 'advanced', slugs: [
      'playwright-desde-cero',
      'playwright-avanzado'
    ] }
  ],
  backend: [
    { id: 'node', name: { es: 'Node.js', en: 'Node.js' }, level: 'basic', slugs: [
      'nodejs-desde-cero'
    ] },
    { id: 'express', name: { es: 'Express', en: 'Express' }, level: 'intermediate', slugs: [
      'express-desde-cero',
      'express-api-rest-crud',
      'express-middlewares-errores-validacion'
    ] },
    { id: 'bases-de-datos', name: { es: 'Bases de datos con Turso', en: 'Databases with Turso' }, level: 'intermediate', slugs: [
      'sql-sqlite-desde-cero',
      'turso-desde-cero',
      'turso-express-api-persistente'
    ] },
    { id: 'integraciones', name: { es: 'Integraciones', en: 'Integrations' }, level: 'intermediate', slugs: [
      'webhooks-que-son'
    ] },
    { id: 'rendimiento-node', name: { es: 'Rendimiento en Node.js', en: 'Node.js performance' }, level: 'advanced', slugs: [
      'nodejs-event-loop-no-bloquear',
      'nodejs-streams',
      'nodejs-medir-rendimiento-profiling',
      'nodejs-worker-threads-cluster',
      'nodejs-cache-rendimiento-api',
      'nodejs-memory-leaks'
    ] }
  ],
  devops: [
    { id: 'docker', name: { es: 'Docker', en: 'Docker' }, level: 'basic', slugs: [
      'docker-desde-cero',
      'docker-dockerfile-node',
      'docker-compose-multi-servicio'
    ] },
    { id: 'aws', name: { es: 'AWS', en: 'AWS' }, level: 'intermediate', slugs: [
      'aws-desde-cero-cuenta-segura',
      'aws-s3-web-estatica',
      'aws-lambda-api'
    ] }
  ],
  seguridad: [
    { id: 'fundamentos', name: { es: 'Fundamentos', en: 'Fundamentals' }, level: 'basic', slugs: [
      'cifrado-aes-rsa'
    ] },
    { id: 'frontend', name: { es: 'Seguridad en el frontend', en: 'Frontend security' }, level: 'intermediate', slugs: [
      'seguridad-frontend-buenas-practicas'
    ] },
    { id: 'apis', name: { es: 'APIs e integraciones', en: 'APIs and integrations' }, level: 'advanced', slugs: [
      'webhooks-seguridad'
    ] }
  ],
  carrera: [
    { id: 'herramientas', name: { es: 'Herramientas del día a día', en: 'Everyday tools' }, level: 'basic', slugs: [
      'terminal-comandos-basicos',
      'vscode-extensiones-atajos',
      'devtools-navegador',
      'git-github-desde-cero',
      'git-colaborativo',
      'npm-package-json',
      'claude-code-desde-cero'
    ] },
    { id: 'publicar', name: { es: 'Publica tu trabajo', en: 'Ship your work' }, level: 'basic', slugs: [
      'publicar-web-gratis'
    ] },
    { id: 'empleo', name: { es: 'Consigue tu primer trabajo', en: 'Land your first job' }, level: 'basic', slugs: [
      'preparar-prueba-tecnica-entrevista'
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
