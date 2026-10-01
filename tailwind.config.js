/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peach: {
          100: '#F5DACA',
          200: '#ECC3A9',
          300: '#FFC9BA',
          400: '#FFB5A0',
          500: '#FF9B7D',
        },
        app: {
          bg: 'var(--bg-primary, #FFFBF9)',
          card: 'var(--card-bg, #FFFFFF)',
          primary: 'var(--accent-color, #E97451)',
          hover: 'var(--accent-hover, #C06043)',
          text: 'var(--text-primary, #0F172A)',
          muted: 'var(--text-muted, #64748B)',
          border: 'var(--border-color, #F1F5F9)',
        },
      },
    },
  },
  plugins: [],
}