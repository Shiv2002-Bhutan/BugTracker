/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        base: '#04060f',
        surface: '#080b18',
        elevated: '#0d1124',
        glass: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          strong: 'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.08)',
          'border-hover': 'rgba(255,255,255,0.18)',
        },
        accent: {
          violet: '#7c3aed',
          indigo: '#4f46e5',
          cyan: '#0891b2',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
        },
        status: {
          open: '#6d28d9',
          progress: '#b45309',
          resolved: '#047857',
          closed: '#374151',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-violet': '0 0 24px rgba(124,58,237,0.4)',
        'glow-indigo': '0 0 24px rgba(79,70,229,0.35)',
        'glow-cyan': '0 0 20px rgba(8,145,178,0.3)',
        'glow-emerald': '0 0 20px rgba(5,150,105,0.3)',
        'glow-rose': '0 0 20px rgba(225,29,72,0.3)',
      },
      backdropBlur: {
        glass: '24px',
        heavy: '40px',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'slide-in': 'slideIn 0.35s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}