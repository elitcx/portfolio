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
      }
    },
  },
  plugins: [],
}