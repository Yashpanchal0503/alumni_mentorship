/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#004d40',       // Deepest teal for primary actions/text
          DEFAULT: '#006d77',    // Classic teal for brand identity
          light: '#83c5be',     // Soft pastel teal for badges/cards
          bg: '#edf6f9',        // Off-white background tint
          coral: '#e29578',     // Secondary warm accent/warning colors
          accent: '#00b4d8'     // Bright cyan for micro-highlights
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
