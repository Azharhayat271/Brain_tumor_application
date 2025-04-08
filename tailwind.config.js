/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        colors: {
          primary: '#0f4b5f', // Classic dark blue
          secondary: '#4F7D87', // Subtle secondary color
          success: '#4CAF50', // Green for success
          danger: '#FF5722',  // Orange/red for warnings
        },
      },
    },  },
  plugins: [],
}