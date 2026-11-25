import Head from 'next/head'

import { SITE_NAME, localeUrl } from '../lib/site'

const OG_LOCALES = { es: 'es_PE', en: 'en_US' }

/**
 * Etiquetas SEO comunes de cada página: title, description, canónica, hreflang,
 * Open Graph, Twitter Card y datos estructurados (JSON-LD).
 *
 * - `path`: ruta sin prefijo de idioma ('/', '/blog', '/blog/slug').
 * - `alternates`: si es true, añade hreflang es/en/x-default (páginas traducidas).
 * - `canonicalLocale`: fuerza el idioma de la canónica (los posts solo existen en español).
 */
export default function Seo({
  title,
  description,
  path,
  locale,
  image,
  imageAlt,
  type = 'website',
  alternates = false,
  canonicalLocale,
  noindex = false,
  jsonLd,
  children
}) {
  const canonical = localeUrl(path, canonicalLocale ?? locale)

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {alternates && (
        <>
          <link rel="alternate" hrefLang="es" href={localeUrl(path, 'es')} />
          <link rel="alternate" hrefLang="en" href={localeUrl(path, 'en')} />
          <link rel="alternate" hrefLang="x-default" href={localeUrl(path, 'es')} />
        </>
      )}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={OG_LOCALES[canonicalLocale ?? locale] ?? OG_LOCALES.es} />
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
        </>
      )}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (
        <script
          type="application/ld+json"
          // JSON generado por nosotros; se escapa "<" para que nunca cierre el <script>
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}

      {children}
    </Head>
  )
}
