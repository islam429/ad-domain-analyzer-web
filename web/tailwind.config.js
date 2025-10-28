/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
      },
      borderRadius: {
        xl: '0.85rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 8px 24px -12px rgba(2, 6, 23, 0.25)',
      },
    },
  },
  plugins: [],
}
