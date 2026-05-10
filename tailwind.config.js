export default {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'defaultdark': '#191a1b',
        'lighterdark': 'hsl(200, 6%, 20%)'
      },
      fontFamily: {
        sans: ['"Barlow"', 'system-ui', 'sans-serif'],
        display: ['"Barlow Semi Condensed"', '"Barlow"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}