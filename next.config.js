/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // /sitemap.xml se genera en cada petición y lee content/blog con fs: hay que incluir los .md en la función
  outputFileTracingIncludes: {
    '/sitemap.xml': ['./content/blog/**/*'],
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    // La detección la hace proxy.js por país (header de Vercel), no Next por Accept-Language
    localeDetection: false,
  },
}

module.exports = nextConfig
