/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          50: '#f4f6f8',
          100: '#e8edf2',
          200: '#d1dae3',
          300: '#a8b8c8',
          400: '#7890a8',
          500: '#587090',
          600: '#425878',
          700: '#364860',
          800: '#2c3a4e',
          900: '#1e2838',
          950: '#121822',
          975: '#0a0e16',
        },
        traffic: {
          green: '#22c55e',
          greenDark: '#16a34a',
          amber: '#f59e0b',
          amberDark: '#d97706',
          red: '#ef4444',
          redDark: '#dc2626',
        },
        brand: {
          blue: '#0ea5e9',
          blueDark: '#0284c7',
          navy: '#1e2838',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drive': 'drive 8s linear infinite',
        'drive-reverse': 'drive-reverse 8s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'data-flash': 'data-flash 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        drive: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(300px)' },
        },
        'drive-reverse:': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-300px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 4px rgba(34,197,94,0.4)' },
          '50%': { boxShadow: '0 0 16px rgba(34,197,94,0.7)' },
        },
        'data-flash': {
          '0%': { backgroundColor: 'rgba(14,165,233,0.15)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 24px rgba(14, 165, 233, 0.15)',
        'glow-amber': '0 0 24px rgba(245, 158, 11, 0.15)',
        'glow-green': '0 0 24px rgba(34, 197, 94, 0.15)',
        'glow-red': '0 0 24px rgba(239, 68, 68, 0.15)',
      },
    },
  },
  plugins: [],
};
