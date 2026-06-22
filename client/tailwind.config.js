/** @type {import('tailwindcss').Config} */
const rgbToken = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
        jp: ['var(--font-jp)'],
      },
      fontSize: {
        'display-2xl': [
          'var(--text-display-2xl)',
          { lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)' },
        ],
        'display-xl': [
          'var(--text-display-xl)',
          { lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)' },
        ],
        'display-lg': [
          'var(--text-display-lg)',
          { lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)' },
        ],
        'display-md': [
          'var(--text-display-md)',
          { lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)' },
        ],
        'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--leading-body)' }],
        'body-md': ['var(--text-body-md)', { lineHeight: 'var(--leading-body)' }],
        'body-sm': ['var(--text-body-sm)', { lineHeight: 'var(--leading-body)' }],
        'label-sm': [
          'var(--text-label-sm)',
          { lineHeight: 'var(--leading-label)', letterSpacing: 'var(--tracking-label)' },
        ],
      },
      colors: {
        background: rgbToken('--background-rgb'),
        foreground: rgbToken('--foreground-rgb'),
        card: {
          DEFAULT: rgbToken('--card-rgb'),
          foreground: rgbToken('--card-foreground-rgb'),
        },
        popover: {
          DEFAULT: rgbToken('--popover-rgb'),
          foreground: rgbToken('--popover-foreground-rgb'),
        },
        primary: {
          DEFAULT: rgbToken('--primary-rgb'),
          foreground: rgbToken('--primary-foreground-rgb'),
        },
        secondary: {
          DEFAULT: rgbToken('--secondary-rgb'),
          foreground: rgbToken('--secondary-foreground-rgb'),
        },
        muted: {
          DEFAULT: rgbToken('--muted-rgb'),
          foreground: rgbToken('--muted-foreground-rgb'),
        },
        accent: {
          DEFAULT: rgbToken('--accent-rgb'),
          foreground: rgbToken('--accent-foreground-rgb'),
        },
        destructive: rgbToken('--destructive-rgb'),
        border: rgbToken('--border-rgb'),
        'border-strong': rgbToken('--color-border-strong-rgb'),
        input: rgbToken('--input-rgb'),
        ring: rgbToken('--ring-rgb'),
        tertiary: {
          DEFAULT: rgbToken('--tertiary-rgb'),
          foreground: rgbToken('--tertiary-foreground-rgb'),
        },
        quaternary: {
          DEFAULT: rgbToken('--quaternary-rgb'),
          foreground: rgbToken('--quaternary-foreground-rgb'),
        },
        brand: {
          DEFAULT: rgbToken('--color-brand-rgb'),
          hover: rgbToken('--color-brand-hover-rgb'),
          deep: rgbToken('--color-brand-deep-rgb'),
          light: rgbToken('--color-brand-light-rgb'),
          soft: rgbToken('--color-brand-soft-rgb'),
          muted: rgbToken('--color-brand-muted-rgb'),
        },
        pink: {
          DEFAULT: rgbToken('--color-pink-rgb'),
          soft: rgbToken('--color-pink-soft-rgb'),
          foreground: rgbToken('--color-pink-foreground-rgb'),
        },
        yellow: {
          DEFAULT: rgbToken('--color-yellow-rgb'),
          soft: rgbToken('--color-yellow-soft-rgb'),
          foreground: rgbToken('--color-yellow-foreground-rgb'),
        },
        green: {
          DEFAULT: rgbToken('--color-green-accent-rgb'),
          soft: rgbToken('--color-green-soft-rgb'),
          foreground: rgbToken('--color-green-foreground-rgb'),
        },
        surface: {
          paper: rgbToken('--surface-paper-rgb'),
          raised: rgbToken('--surface-raised-rgb'),
          sunken: rgbToken('--surface-sunken-rgb'),
          sidebar: rgbToken('--surface-sidebar-rgb'),
        },
        ink: rgbToken('--color-ink-rgb'),
        cream: rgbToken('--color-cream-rgb'),
        caption: rgbToken('--color-caption-rgb'),
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        display: 'var(--radius-display)',
        '4xl': 'var(--radius-4xl)',
        sticker: 'var(--radius-sticker)',
      },
      boxShadow: {
        sm: 'var(--shadow-premium)',
        DEFAULT: 'var(--shadow-premium)',
        md: 'var(--shadow-premium-hover)',
        lg: 'var(--shadow-soft-lg)',
        premium: 'var(--shadow-premium)',
        'premium-hover': 'var(--shadow-premium-hover)',
        pressed: 'var(--shadow-pressed)',
        cta: 'var(--shadow-cta)',
        'hard-xs': 'var(--shadow-hard-xs)',
        'hard-sm': 'var(--shadow-hard-sm)',
        'hard-md': 'var(--shadow-hard-md)',
        hard: 'var(--shadow-hard)',
        'hard-lg': 'var(--shadow-hard-lg)',
        sticker: 'var(--shadow-sticker)',
        pop: 'var(--shadow-pop)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(var(--motion-distance-sm))' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(calc(var(--motion-distance-sm) * -1))' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up var(--duration-md) var(--ease-out) both',
        'pop-in': 'pop-in var(--duration-sm) var(--ease-pop) both',
        float: 'float var(--duration-float) var(--ease-in-out) infinite',
        wiggle: 'wiggle var(--duration-wiggle) var(--ease-in-out) infinite',
      },
    },
  },
  plugins: [],
};
