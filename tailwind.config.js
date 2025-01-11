/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient-wave': 'wave 1s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        swipeDown: 'swipeDown 0.5s ease-in-out forwards',
        fadeInNew: 'fadeInNew 0.75s ease-in-out forwards',
        'spin-5s': 'spin 5s linear infinite',
        fadeIn: 'fadeIn 1s ease-in-out forwards infinite',
        BgfadeIn: 'fadeIn 5s linear infinite',
      },
      keyframes: {
        wave: {
          '0%': {
            opacity: '0.7',
            zIndex: '100',
            transform: 'translateX(100%)',
            filter: 'blur(0.05rem)', // Apply blur effect
          },
          '100%': {
            opacity: '0.9',
            zIndex: '100',
            transform: 'translateX(0)',
            filter: 'blur(0.05rem)', // Keep blur effect consistent
          },
        },

        'slide-in-left': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0.5', z: '100' },
          '100%': { opacity: '0.75', z: '100' },
        },
        fadeInNew: {
          '0%': { opacity: '0', z: '100' },
          '100%': { opacity: '1', z: '100' },
        },
        swipeDown: {
          '0%': {
            transform: 'translateY(-15%)', // Start above the viewport
            opacity: '0', // Fully transparent
          },
          '100%': {
            transform: 'translateY(0)', // End in its original position
            opacity: '1', // Fully opaque
          },
        },
      },
    },
  },
  plugins: [],
}