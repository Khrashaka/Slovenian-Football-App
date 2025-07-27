/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            500: '#8b5cf6',
            600: '#7c3aed',
          }
        }
      },
    },
    plugins: [],
  }