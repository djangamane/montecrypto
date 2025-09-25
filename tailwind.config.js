/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0f1729',
        'brand-secondary': '#1e293b',
        'brand-accent': '#38bdf8',
        'brand-text': '#f1f5f9',
        'brand-subtext': '#94a3b8',
        'risk-low': '#22c55e',
        'risk-medium': '#facc15',
        'risk-high': '#f97316',
        'risk-critical': '#ef4444',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}
