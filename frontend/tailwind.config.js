/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f9f3',
          100: '#e1f2e5',
          200: '#c4e5cb',
          300: '#97d1a4',
          400: '#64b476',
          500: '#3f9754',
          600: '#2f7a40',
          700: '#276135',
          800: '#224e2d',
          900: '#1d4127',
          950: '#0c2313',
        },
        earth: {
          50: '#faf6f0',
          100: '#f3eae0',
          200: '#e6d3c0',
          300: '#d5b699',
          400: '#c19672',
          500: '#b17e55',
          600: '#a36d49',
          700: '#88573d',
          800: '#6e4735',
          900: '#5a3b2e',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
