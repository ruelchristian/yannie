/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        icct: {
          blue: '#0B3B60',
          dark: '#082842',
          light: '#1A5F96',
          gold: '#F59E0B',
          accent: '#0284C7',
        }
      },
    },
  },
  plugins: [],
}
