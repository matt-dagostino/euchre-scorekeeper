/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2c5f2d',
        accent: '#e63946',
      },
    },
  },
  darkMode: 'media',
}
