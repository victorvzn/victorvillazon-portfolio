import { Analytics } from '@vercel/analytics/react';
import BaseLayout from '../layouts/BaseLayout'

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <BaseLayout>
      <Component {...pageProps} />
      <Analytics />
    </BaseLayout>
  )
}

export default MyApp
