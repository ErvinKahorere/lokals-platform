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
          charcoal: 'rgb(var(--text-primary) / <alpha-value>)',
          gold: 'rgb(var(--gold) / <alpha-value>)',
          'gold-soft': 'rgb(var(--gold-soft) / <alpha-value>)',
          bg: 'rgb(var(--background) / <alpha-value>)',
          surface: 'rgb(var(--card) / <alpha-value>)',
          success: 'rgb(var(--success) / <alpha-value>)',
          warning: 'rgb(var(--warning) / <alpha-value>)',
          danger: 'rgb(var(--danger) / <alpha-value>)',
          info: 'rgb(var(--info) / <alpha-value>)',
          muted: 'rgb(var(--text-secondary) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)',
          'sky-soft': 'rgb(var(--info-soft) / <alpha-value>)',
          glass: 'rgb(var(--card) / <alpha-value>)',
        },
      },
      borderRadius: {
        'lokals-sm': '8px',
        'lokals-md': '12px',
        'lokals-lg': '16px',
        'lokals-xl': '20px',
        'lokals-hero': '24px',
      },
      boxShadow: {
        card: '0 10px 24px rgba(var(--shadow-rgb), 0.06)',
        soft: '0 10px 24px rgba(var(--shadow-rgb), 0.08)',
        'soft-lg': '0 16px 34px rgba(var(--shadow-rgb), 0.10)',
        brand: '0 14px 28px rgba(var(--primary), 0.18)',
        gold: '0 12px 30px rgba(var(--gold), 0.26)',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      maxWidth: {
        app: '1200px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
