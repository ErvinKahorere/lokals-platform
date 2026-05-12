/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lokals: {
          green: 'rgb(var(--primary) / <alpha-value>)',
          'green-soft': 'rgb(var(--success-soft) / <alpha-value>)',
          purple: 'rgb(var(--brand-purple) / <alpha-value>)',
          'purple-deep': 'rgb(var(--primary-deep) / <alpha-value>)',
          'purple-electric': 'rgb(var(--primary-electric) / <alpha-value>)',
          'purple-soft': 'rgb(var(--primary-soft) / <alpha-value>)',
          charcoal: 'rgb(var(--text-primary) / <alpha-value>)',
          gold: 'rgb(var(--gold) / <alpha-value>)',
          'gold-soft': 'rgb(var(--gold-soft) / <alpha-value>)',
          bg: 'rgb(var(--background) / <alpha-value>)',
          surface: 'rgb(var(--card) / <alpha-value>)',
          success: 'rgb(var(--success) / <alpha-value>)',
          'success-soft': 'rgb(var(--success-soft) / <alpha-value>)',
          warning: 'rgb(var(--warning) / <alpha-value>)',
          danger: 'rgb(var(--danger) / <alpha-value>)',
          'danger-soft': 'rgb(var(--danger-soft) / <alpha-value>)',
          info: 'rgb(var(--info) / <alpha-value>)',
          muted: 'rgb(var(--text-secondary) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)',
          'sky-soft': 'rgb(var(--info-soft) / <alpha-value>)',
          glass: 'rgb(var(--card) / <alpha-value>)',
        },
      },
      borderRadius: {
        'lokals-sm': '10px',
        'lokals-md': '14px',
        'lokals-lg': '18px',
        'lokals-xl': '22px',
        'lokals-hero': '28px',
      },
      boxShadow: {
        card: '0 16px 38px rgba(var(--shadow-rgb), 0.07)',
        soft: '0 18px 42px rgba(var(--shadow-rgb), 0.09)',
        'soft-lg': '0 24px 56px rgba(var(--shadow-rgb), 0.11)',
        brand: '0 16px 36px rgba(var(--primary), 0.22)',
        gold: '0 12px 30px rgba(var(--gold), 0.26)',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      maxWidth: {
        app: '1200px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
