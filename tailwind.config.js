/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#F7F5EF',
        'brand-surface': '#FFFFFF',
        'brand-text': '#121417',
        'brand-muted': '#6B7168',
        'brand-accent': '#E5B200',
        'brand-link': '#3E5F5A',
        'risk-low': '#2E7D32',
        'risk-moderate': '#8BC34A',
        'risk-elevated': '#F9A825',
        'risk-high': '#EF6C00',
        'risk-severe': '#C62828',
      },
      fontFamily: {
        heading: ['"Bebas Neue"', '"Oswald"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}
