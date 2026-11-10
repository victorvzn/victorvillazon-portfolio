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
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      }
    }
  },
  plugins: []
}
