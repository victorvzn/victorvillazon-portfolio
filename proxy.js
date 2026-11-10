import { NextResponse } from 'next/server'

// Países donde se muestra la versión en español
const SPANISH_COUNTRIES = new Set([
  'ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO',
  'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ'
])

const BOT_UA = /bot|crawl|spider|slurp/i

function prefersEnglish(request) {
  // 1. La elección manual del selector siempre gana
  const saved = request.cookies.get('NEXT_LOCALE')?.value
  if (saved) return saved === 'en'

  // 2. Los buscadores ven siempre la versión por defecto (hreflang les indica /en)
  if (BOT_UA.test(request.headers.get('user-agent') || '')) return false

  // 3. Geolocalización: Vercel añade el país del visitante en este header
  const country = request.headers.get('x-vercel-ip-country')
  if (country) return !SPANISH_COUNTRIES.has(country.toUpperCase())

  // 4. Sin país (desarrollo local): idioma del navegador
  const language = request.headers.get('accept-language') || ''
  return language !== '' && !language.toLowerCase().startsWith('es')
}

export function proxy(request) {
  const { pathname, locale } = request.nextUrl

  // Solo se decide en la raíz española; /en se respeta si se visita directamente
  if (pathname !== '/' || locale !== 'es') return NextResponse.next()

  if (prefersEnglish(request)) {
    return NextResponse.redirect(new URL('/en', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
