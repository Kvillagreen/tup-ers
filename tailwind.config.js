/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-5s': 'spin 5s linear infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out forwards infinite', 
        BgfadeIn: 'fadeIn 5s linear infinite', 
      },
        fadeIn: {
          '0%': { opacity: '0', z: '100' },
          '100%': { opacity: '1', z: '100' },
        },
    },
  },
  plugins: [],
}