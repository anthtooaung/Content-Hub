import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'var(--color-primary-50)',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: 'var(--color-primary-hover)',
          700: 'var(--color-primary-active)',
          800: '#1E3A8A',
          900: '#1E3A5F',
        },
        page: 'var(--color-page)',
        surface: 'var(--color-surface)',
        'surface-subtle': 'var(--color-surface-subtle)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        'text-primary': 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-disabled': 'var(--color-text-disabled)',
        success: 'var(--color-success)',
        'success-soft': 'var(--color-success-soft)',
        warning: 'var(--color-warning)',
        'warning-soft': 'var(--color-warning-soft)',
        error: 'var(--color-error)',
        'error-soft': 'var(--color-error-soft)',
        info: 'var(--color-info)',
        'info-soft': 'var(--color-info-soft)',
        'warning-border': '#FDE68A',
        tiktok: '#111827',
        instagram: '#E1306C',
        facebook: '#1877F2',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        control: '10px',
        card: '12px',
        panel: '16px',
      },
      boxShadow: {
        card: '0 4px 20px var(--shadow-card-color)',
        'card-hover': '0 8px 24px var(--shadow-card-hover-color)',
        focus: '0 0 0 3px rgba(59, 130, 246, 0.22)',
        modal: '0 20px 50px var(--shadow-modal-color)',
        toast: '0 10px 30px var(--shadow-toast-color)',
      },
    },
  },
  plugins: [],
};

export default config;
