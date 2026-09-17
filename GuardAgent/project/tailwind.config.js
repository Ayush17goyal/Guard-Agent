/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#1E293B',
        input: '#1E293B',
        ring: '#22D3EE',
        background: '#070A12',
        foreground: '#F8FAFC',
        primary: {
          DEFAULT: '#22D3EE',
          foreground: '#070A12',
        },
        card: {
          DEFAULT: '#101625',
          foreground: '#F8FAFC',
        },
        muted: {
          DEFAULT: '#161E30',
          foreground: '#94A3B8',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F8FAFC',
        },
        bg: {
          primary: '#070A12',
          secondary: '#0B1020',
          card: '#101625',
          elevated: '#161E30',
        },
        accent: {
          cyan: '#22D3EE',
          blue: '#3B82F6',
          bright: '#06B6D4',
        },
        threat: {
          DEFAULT: '#EF4444',
          dark: '#7F1D1D',
          bright: '#F87171',
        },
        warn: {
          DEFAULT: '#F59E0B',
          bright: '#FBBF24',
        },
        ok: {
          DEFAULT: '#10B981',
          bright: '#34D399',
        },
        ink: {
          white: '#F8FAFC',
          gray: '#94A3B8',
          muted: '#64748B',
          dim: '#475569',
        },
        line: {
          DEFAULT: '#1E293B',
          bright: '#334155',
        },
      },
      scale: {
        '135': '1.35',
      },
      backdropBlur: {
        xs: '2px',
      },
      maxWidth: {
        '2xs': '16rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-reverse': 'spin-reverse 4s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'scan-line': 'scan-line 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'dash-flow': 'dash-flow 1s linear infinite',
        'threat-pulse': 'threat-pulse 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'scan-line': {
          '0%, 100%': { transform: 'translateY(-100%)', opacity: '0.3' },
          '50%': { transform: 'translateY(100%)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        'dash-flow': {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        'threat-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(239,68,68,0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
