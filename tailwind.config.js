/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: '#05050a',    // fondo de la página (detrás del StarField)
        ink: '#09090b',      // header y texto sobre ámbar
        surface: '#111113',  // fondo de las cards
        raised: '#18181b',   // chips y controles
        line: '#27272a',     // bordes
        accent: '#fbbf24',   // acento ámbar
        react: '#61DAFB',
        vue: '#42D392',
        next: '#fafafa',
      },
      fontFamily: {
        // Las variables las define pages/_app.js con next/font (fuentes servidas desde el propio dominio)
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      }
    }
  },
  plugins: []
}
