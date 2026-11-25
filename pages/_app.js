import { Analytics } from '@vercel/analytics/react';
import { Geist, Geist_Mono } from 'next/font/google'

import BaseLayout from '../layouts/BaseLayout'

import '../styles/globals.css'

// next/font descarga las fuentes en el build y las sirve desde el propio dominio:
// sin petición a Google Fonts que bloquee el primer pintado, y con fallback ajustado para evitar saltos (CLS)
const geist = Geist({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const geistMono = Geist_Mono({ subsets: ['latin'], weight: ['400', '500'] })

function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-geist: ${geist.style.fontFamily};
          --font-geist-mono: ${geistMono.style.fontFamily};
        }
      `}</style>
      <BaseLayout>
        <Component {...pageProps} />
        <Analytics />
      </BaseLayout>
    </>
  )
}

export default MyApp
