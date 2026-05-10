/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shopee: {
          50:  '#fff5f0',
          500: '#ee4d2d',
          600: '#dc4127',
        },
      },
    },
  },
  plugins: [],
};
