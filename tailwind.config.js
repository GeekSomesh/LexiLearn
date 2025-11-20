/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFFF0',
          100: '#FFF8DC',
        },
        lavender: {
          100: '#E8E4F3',
          200: '#B8B5D8',
        },
        mint: {
          50: '#F0FFF0',
        },
      },
      fontFamily: {
        dyslexic: ['Comic Sans MS', 'cursive'],
      },
    },
  },
  plugins: [],
};
