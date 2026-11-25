import { getAllPosts } from '../lib/posts'
import { localeUrl } from '../lib/site'

// /sitemap.xml generado en cada petición (con caché en el CDN de Vercel).
// Las páginas traducidas llevan sus alternativas hreflang; los posts solo existen en español.

const escapeXml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const translatedEntry = (path, lastmod) => ['es', 'en'].map(locale => `
  <url>
    <loc>${escapeXml(localeUrl(path, locale))}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <xhtml:link rel="alternate" hreflang="es" href="${escapeXml(localeUrl(path, 'es'))}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(localeUrl(path, 'en'))}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(localeUrl(path, 'es'))}"/>
  </url>`).join('')

const postEntry = (post) => `
  <url>
    <loc>${escapeXml(localeUrl(`/blog/${post.slug}`, 'es'))}</loc>
    <lastmod>${post.date}</lastmod>
  </url>`

const buildSitemap = (posts) => {
  const latestPost = posts[0]?.date
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${translatedEntry('/')}${translatedEntry('/blog', latestPost)}${posts.map(postEntry).join('')}
</urlset>
`
}

export const getServerSideProps = async ({ res }) => {
  // getAllPosts ya excluye los borradores en producción
  const posts = getAllPosts().filter(post => !post.draft)

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
  res.write(buildSitemap(posts))
  res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}
