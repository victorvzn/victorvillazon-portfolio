/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    // La detección la hace proxy.js por país (header de Vercel), no Next por Accept-Language
    localeDetection: false,
  },
}

module.exports = nextConfig
