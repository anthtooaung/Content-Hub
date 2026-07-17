import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1E3A5F',
        },
        page: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-subtle': '#F1F5F9',
        border: '#E2E8F0',
        'border-strong': '#CBD5E1',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#64748B',
        'text-disabled': '#94A3B8',
        success: '#15803D',
        'success-soft': '#F0FDF4',
        warning: '#B45309',
        'warning-soft': '#FFFBEB',
        error: '#B91C1C',
        'error-soft': '#FEF2F2',
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
        card: '0 4px 20px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 8px 24px rgba(15, 23, 42, 0.08)',
        focus: '0 0 0 3px rgba(59, 130, 246, 0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
