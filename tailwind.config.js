/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./crypto-miner-verse/src/**/*.{js,ts,jsx,tsx}",
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
        arcade: {
          cyan: '#18e0ff',
          pink: '#ff4da3',
          yellow: '#ffd166',
          purple: '#6a5acd',
          navy: '#0a1224',
          midnight: '#050812',
          glow: '#5ef0ff',
        },
      },
      fontFamily: {
        heading: ['"Bebas Neue"', '"Oswald"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        retro: ['"VT323"', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
}
