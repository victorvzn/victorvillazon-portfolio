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
        primary: '#495464',
        secondary: '#FFD369',
        react: '#61DAFB',
        vue: '#42D392',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif']
      }
    }
  },
  plugins: []
}
