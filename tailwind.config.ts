import type { Config } from "tailwindcss";
import daisyUI from 'daisyui'

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Workouter Brand Colors
      colors: {
        wktr: {
          // Primary Brand Colors
          orange: {
            50: '#fff4ed',
            100: '#ffe6d5',
            200: '#feccaa',
            300: '#fdab74',
            400: '#fb823c',
            500: '#ff6b35', // Primary Energy Orange
            600: '#e85d2a',
            700: '#c0481f',
            800: '#9a3a1e',
            900: '#7c321c',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f7931e', // Performance Gold
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          // Neutral Colors
          black: {
            50: '#f8f8f8',
            100: '#f0f0f0',
            200: '#e4e4e4',
            300: '#d1d1d1',
            400: '#b4b4b4',
            500: '#9a9a9a',
            600: '#818181',
            700: '#6a6a6a',
            800: '#5a5a5a',
            900: '#4f4f4f',
            950: '#1a1a1a', // Precision Black
          },
          gray: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#a0a0a0', // Neutral Gray
            600: '#737373',
            700: '#525252',
            800: '#404040',
            900: '#262626',
          },
        },
        // Semantic Colors for UI States
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },

      // Typography - Inter font family for cross-platform consistency
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'source-code-pro',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },

      // Font sizes optimized for fitness applications
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Custom workout-specific sizes
        'metric': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
      },

      // Font weights for hierarchy
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      // Spacing scale optimized for workout interfaces
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },

      // Border radius for modern look
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
        // Custom workout card radius
        'workout': '0.875rem',
      },

      // Box shadows for depth and focus states
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
        // Custom brand shadows
        'brand': '0 20px 40px rgb(255 107 53 / 0.3)',
        'brand-lg': '0 25px 50px rgb(255 107 53 / 0.4)',
        'workout-card': '0 4px 12px rgb(0 0 0 / 0.08), 0 2px 4px rgb(0 0 0 / 0.04)',
        'active': '0 0 0 3px rgb(255 107 53 / 0.3)',
      },

      // Animation and transitions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-brand': 'pulseBrand 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },

      // Custom keyframes
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
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(255 107 53 / 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgb(255 107 53 / 0)' },
        },
      },

      // Gradient stops for brand gradients
      gradientColorStops: {
        'brand-start': '#ff6b35',
        'brand-middle': '#f7931e',
        'brand-end': '#ff4757',
      },

      // Screen breakpoints optimized for fitness app layouts
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom breakpoints for watch-like interfaces
        'watch': '320px',
        'tablet': '820px',
      },

      // Z-index scale for layering
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
        'modal': '1000',
        'dropdown': '100',
        'tooltip': '200',
        'navbar': '90',
      },

      // Backdrop blur for glassmorphism effects
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [
    // Add custom component classes
    function ({ addComponents, theme }: { addComponents: any; theme: any }) {
      addComponents({
        // Brand button styles
        '.btn-brand': {
          backgroundColor: theme('colors.wktr.orange.500'),
          color: theme('colors.white'),
          fontWeight: theme('fontWeight.semibold'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.brand'),
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme('colors.wktr.orange.600'),
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.brand-lg'),
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.btn-brand-secondary': {
          backgroundColor: 'transparent',
          color: theme('colors.wktr.orange.500'),
          fontWeight: theme('fontWeight.semibold'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.lg'),
          border: `2px solid ${theme('colors.wktr.orange.500')}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme('colors.wktr.orange.500'),
            color: theme('colors.white'),
            transform: 'translateY(-1px)',
          },
        },

        // Card styles
        '.card-workout': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.workout'),
          boxShadow: theme('boxShadow.workout-card'),
          padding: theme('spacing.6'),
          border: `1px solid ${theme('colors.gray.200')}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: theme('boxShadow.lg'),
            transform: 'translateY(-2px)',
          },
        },

        '.card-dark': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: theme('borderRadius.workout'),
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          padding: theme('spacing.6'),
        },

        // Brand gradients
        '.bg-brand-gradient': {
          background: `linear-gradient(135deg, ${theme('colors.wktr.orange.500')} 0%, ${theme('colors.wktr.gold.500')} 50%, #ff4757 100%)`,
        },

        '.bg-brand-gradient-dark': {
          background: `linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)`,
        },

        // Text gradients
        '.text-brand-gradient': {
          background: `linear-gradient(135deg, ${theme('colors.wktr.orange.500')} 0%, ${theme('colors.wktr.gold.500')} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },

        // Focus states
        '.focus-brand': {
          '&:focus': {
            outline: 'none',
            boxShadow: theme('boxShadow.active'),
          },
        },

        // Workout ring components (for favicon/logo)
        '.workout-ring': {
          position: 'absolute',
          borderRadius: '50%',
          border: '3px solid',
        },

        '.workout-ring-1': {
          width: '70%',
          height: '70%',
          top: '15%',
          left: '15%',
          borderColor: theme('colors.wktr.orange.500'),
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: 'rotate(-45deg)',
        },

        '.workout-ring-2': {
          width: '50%',
          height: '50%',
          top: '25%',
          left: '25%',
          borderColor: theme('colors.wktr.gold.500'),
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: 'rotate(45deg)',
        },

        '.workout-ring-3': {
          width: '30%',
          height: '30%',
          top: '35%',
          left: '35%',
          borderColor: theme('colors.white'),
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
          transform: 'rotate(135deg)',
        },
      })
    },
    daisyUI,
  ],
}

export default config






// export default {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "var(--background)",
//         foreground: "var(--foreground)",
//       },
//     },
//   },
//   plugins: [daisyUI],
// } satisfies Config;
