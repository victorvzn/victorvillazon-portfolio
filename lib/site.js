// Datos del sitio para SEO. La URL es la versión con www, que es la final:
// victorvillazon.com redirige (308) a www.victorvillazon.com, y las canónicas no deben apuntar a una redirección.
export const SITE_URL = 'https://www.victorvillazon.com'
export const SITE_NAME = 'Victor Villazón'

export const AUTHOR = {
  name: 'Victor Villazón',
  jobTitle: 'Senior Frontend Developer',
  image: `${SITE_URL}/me.jpg`,
  sameAs: ['https://www.linkedin.com/in/victorvzn', 'https://github.com/victorvzn']
}

// URL absoluta de una ruta en un idioma (el español no lleva prefijo)
export const localeUrl = (path, locale) => `${SITE_URL}${locale === 'en' ? '/en' : ''}${path === '/' && locale === 'en' ? '' : path}`

// Imagen para redes sociales generada en /api/og
export const ogImageUrl = ({ title, subtitle }) => {
  const params = new URLSearchParams({ title })
  if (subtitle) params.set('subtitle', subtitle)
  return `${SITE_URL}/api/og?${params.toString()}`
}
