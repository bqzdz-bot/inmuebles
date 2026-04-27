/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#EBF4FF', 100: '#D6E8FE', 200: '#A8CCFB', 300: '#6DA8F5', 400: '#3A82EC', 500: '#1A5EC2', 600: '#0F4698', 700: '#0C3571', 800: '#0A2A5A', 900: '#061A3A' },
        slate: { 750: '#293548' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
