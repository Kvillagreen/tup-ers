/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-5s': 'spin 5s linear infinite', // Custom spin animation with 5s duration
      },
    },
  },
  plugins: [],
}