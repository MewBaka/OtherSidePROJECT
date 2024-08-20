const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './renderer/app/**/*.{js,ts,jsx,tsx}',
    './renderer/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      ...colors,
      primary: {
        100: "#d2ecfc",
        200: "#a5d9fa",
        300: "#77c7f7",
        400: "#4ab4f5",
        500: "#1da1f2",
        600: "#1781c2",
        700: "#116191",
        800: "#0c4061",
        900: "#062030"
      },
      secondary: '#004c8c',
    },
    extend: {
      height: {
        'screen-93': '93vh',
      },
      transitionProperty: {
        'color': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}