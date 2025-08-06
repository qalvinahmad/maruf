/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        waterfall: ['Waterfall', 'cursive'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        'tight': '-0.02em',
        'normal': '0em',
        'wide': '0.01em',
      },
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#00acee',
          600: '#0099d9',
          700: '#0084c4',
          800: '#006fa3',
          900: '#005a82',
        },
        secondary: {
          DEFAULT: '#9333ea',
          50: '#f3e8ff',
          100: '#e9d5ff',
          200: '#d8b4fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        tertiary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.0rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.618rem', { lineHeight: '2rem' }],
        '3xl': ['2.618rem', { lineHeight: '2.5rem' }],
        '4xl': ['4.236rem', { lineHeight: '1' }],
        '5xl': ['6.854rem', { lineHeight: '1' }],
      },
      spacing: {
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '21': '5.25rem',
        '26': '6.5rem',
        '42': '10.5rem',
        '68': '17rem',
        '110': '27.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'gradient-x': 'gradient-x 8s ease-in-out infinite',
        'gradient-xy': 'gradient-xy 12s ease-in-out infinite',
        'gradient-slow': 'gradient-slow 15s linear infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 8s ease-in-out infinite reverse',
        'float-x': 'float-x 4s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 3s infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'float-gentle': 'float-gentle 7s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'orbit': 'orbit 10s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        'gradient-horizontal': 'gradient-horizontal 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': {
            transform: 'translateX(-50%) scale(1)',
            opacity: '0.7',
          },
          '50%': {
            transform: 'translateX(50%) scale(1.1)',
            opacity: '0.9',
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            transform: 'translate(-30%, -30%) rotate(0deg) scale(1)',
            opacity: '0.6',
          },
          '33%': {
            transform: 'translate(30%, -30%) rotate(120deg) scale(1.1)',
            opacity: '0.8',
          },
          '66%': {
            transform: 'translate(30%, 30%) rotate(240deg) scale(0.9)',
            opacity: '0.7',
          },
        },
        'gradient-slow': {
          '0%, 100%': {
            transform: 'translate(0%, 0%) rotate(0deg)',
            opacity: '0.5',
          },
          '25%': {
            transform: 'translate(20%, -20%) rotate(90deg)',
            opacity: '0.7',
          },
          '50%': {
            transform: 'translate(-20%, -20%) rotate(180deg)',
            opacity: '0.6',
          },
          '75%': {
            transform: 'translate(-20%, 20%) rotate(270deg)',
            opacity: '0.8',
          },
        },
        'float-slow': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(180deg)',
          },
        },
        'float-reverse': {
          '0%, 100%': {
            transform: 'translate(33%, 33%) rotate(0deg)',
          },
          '50%': {
            transform: 'translate(40%, 25%) rotate(-180deg)',
          },
        },
        'float-x': {
          '0%, 100%': {
            transform: 'translateX(0px)',
          },
          '50%': {
            transform: 'translateX(30px)',
          },
        },
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(0px)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-15px)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '0.3',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.2)',
          },
        },
        'float-gentle': {
          '0%, 100%': {
            transform: 'translate(0px, 0px) rotate(0deg)',
          },
          '33%': {
            transform: 'translate(10px, -10px) rotate(120deg)',
          },
          '66%': {
            transform: 'translate(-10px, 5px) rotate(240deg)',
          },
        },
                twinkle: {
          '0%, 100%': {
            opacity: '0.2',
            transform: 'scale(0.8)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.3)',
          },
        },
        orbit: {
          '0%': {
            transform: 'rotate(0deg) translateX(20px) rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg) translateX(20px) rotate(-360deg)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-10px) rotate(180deg)',
          },
        },
        'float-delayed': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-15px) rotate(-180deg)',
          },
        },
        // Tambahan keyframes gradient-horizontal sesuai permintaanmu
        'gradient-horizontal': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
      },
    },
  },
  plugins: [
    // Custom plugin for additional utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          'text-shadow': '4px 4px 8px rgba(0,0,0,0.2)',
        },
        '.bg-pattern': {
          'background-image': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
          'background-size': '20px 20px',
        },
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}

