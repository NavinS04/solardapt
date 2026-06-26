import type { Config } from 'tailwindcss';

// All colour values map to CSS variables defined in styles/tokens.css.
// No hard-coded hex outside the token file (per BUILD_SPEC §4).
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './emails/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        solar: {
          400: 'var(--solar-400)',
          500: 'var(--solar-500)',
          600: 'var(--solar-600)',
        },
        ink: {
          500: 'var(--ink-500)',
          700: 'var(--ink-700)',
          800: 'var(--ink-800)',
          900: 'var(--ink-900)',
        },
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          surface: 'var(--bg-surface)',
        },
        paper: {
          DEFAULT: 'var(--paper)',
          soft: 'var(--paper-soft)',
        },
        success: 'var(--success)',
        warn: 'var(--warn)',
        error: 'var(--error)',
        // shadcn-style semantic tokens
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--bg-1)',
        foreground: 'var(--foreground)',
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        lg: '24px',
        md: '16px',
        sm: '10px',
      },
      backgroundImage: {
        'solar-gradient': 'var(--solar-gradient)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(248,152,24,.25), 0 12px 40px -12px rgba(248,152,24,.45)',
        card: '0 24px 60px -24px rgba(0,0,0,.7)',
      },
      keyframes: {
        'sun-rise': {
          '0%': { transform: 'translateY(40%) scale(.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'sun-rise': 'sun-rise 1.4s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.6s cubic-bezier(0.16,1,0.3,1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
