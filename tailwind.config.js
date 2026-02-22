/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c2d5ff',
          300: '#93b4ff',
          400: '#6490ff',
          500: '#3b6cf7',
          600: '#2550db',
          700: '#1d3fb3',
          800: '#1c3692',
          900: '#1c3177',
        },
      },
    },
  },
  plugins: [],
};
