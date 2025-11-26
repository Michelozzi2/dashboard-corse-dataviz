/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a', // Fond principal
          800: '#1e293b', // Fond des cartes
          700: '#334155', // Bordures
        },
        neon: {
          blue: '#38bdf8',
          purple: '#c084fc',
        }
      }
    },
  },
  plugins: [],
}