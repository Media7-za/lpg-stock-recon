/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-elevated': '#252525',
        'text-primary': '#f5f5f5',
        'text-secondary': '#a3a3a3',
        border: '#333333',
      },
    },
  },
  plugins: [],
}

