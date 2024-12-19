/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'backgroundImage': "url('/src/assets/background.jpg')",
      }
    },
  },
  plugins: [],
}