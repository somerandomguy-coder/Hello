/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        handwritten: ['Handlee', 'Caveat', 'Virgil', 'cursive', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        excali: {
          bg: '#fbf9f5',
          bgDark: '#121212',
          card: '#ffffff',
          cardDark: '#1e1e24',
          border: '#2c2c2c',
          borderDark: '#555555',
          accent: '#e07a5f',
          yellow: '#f4f1de',
          teal: '#81b29a',
          purple: '#f2cc8f',
          blue: '#3d405b',
        },
      },
      boxShadow: {
        sketch: '3px 3px 0px 0px #2c2c2c',
        'sketch-hover': '5px 5px 0px 0px #2c2c2c',
        'sketch-active': '1px 1px 0px 0px #2c2c2c',
        'sketch-dark': '3px 3px 0px 0px #666666',
        'sketch-dark-hover': '5px 5px 0px 0px #888888',
      },
      borderRadius: {
        sketch: '255px 15px 225px 15px/15px 225px 15px 255px',
        'sketch-sm': '120px 8px 110px 8px/8px 110px 8px 120px',
      },
    },
  },
  plugins: [],
};
