/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        income:  '#10b981',
        expense: '#ef4444',
        surface: {
          light: '#ffffff',
          dark:  '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md': '0 4px 16px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 40px -4px rgb(0 0 0 / 0.12), 0 4px 12px -4px rgb(0 0 0 / 0.08)',
        'glow-primary': '0 0 20px rgb(14 165 233 / 0.35)',
        'glow-income':  '0 0 20px rgb(16 185 129 / 0.35)',
        'glow-expense': '0 0 20px rgb(239 68 68 / 0.35)',
        'inner-sm': 'inset 0 1px 3px 0 rgb(0 0 0 / 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fadeIn':      'fadeIn 0.35s ease-out',
        'slideUp':     'slideUp 0.35s ease-out',
        'slideDown':   'slideDown 0.25s ease-out',
        'slideInLeft': 'slideInLeft 0.3s ease-out',
        'scaleIn':     'scaleIn 0.2s ease-out',
        'shimmer':     'shimmer 1.8s linear infinite',
        'pulse-soft':  'pulseSoft 2.5s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
        'bounce-sm':   'bounceSm 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:   { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:     { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:     { from: { backgroundPosition: '-200% center' }, to: { backgroundPosition: '200% center' } },
        pulseSoft:   { '0%,100%': { opacity: '1' }, '50%': { opacity: '.6' } },
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        bounceSm:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':      'radial-gradient(at 40% 20%, rgba(14,165,233,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168,85,247,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(16,185,129,0.1) 0px, transparent 50%)',
        'gradient-mesh-dark': 'radial-gradient(at 40% 20%, rgba(14,165,233,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168,85,247,0.08) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
