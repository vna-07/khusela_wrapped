/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#090C0F',
        graphite: '#141A20',
        porcelain: '#FFFFFF',
        workspace: '#F7F9FB',
        mint: '#55E6C1',
        'mint-dark': '#087F68',
        stop: '#DC2626',
        wait: '#B45309',
        info: '#2563EB',
        slate: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(9, 12, 15, 0.05)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}