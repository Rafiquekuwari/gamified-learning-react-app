// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Look for HTML files in the public directory (e.g., public/index.html)
    "./public/**/*.html",
    // Look for JavaScript/TypeScript files in the src directory and its subdirectories
    // This covers all your .js, .jsx, .ts, .tsx components
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // You can extend Tailwind's default theme here if needed
    },
  },
  plugins: [],
}