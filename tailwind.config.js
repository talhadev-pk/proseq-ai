/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      spacing: {
        4.5: '1.125rem',
      },
      colors: {
        bg: 'var(--c-bg)',
        paper: 'var(--c-paper)',
        sand: 'var(--c-sand)',
        ink: 'var(--c-ink)',
        muted: 'var(--c-muted)',
        faint: 'var(--c-faint)',
        line: 'var(--c-border)',
        'line-strong': 'var(--c-border-strong)',
        violet: {
          DEFAULT: 'var(--c-violet)',
          deep: 'var(--c-violet-deep)',
          soft: 'var(--c-violet-soft)',
        },
        blue: {
          DEFAULT: 'var(--c-blue)',
          soft: 'var(--c-blue-soft)',
        },
        moss: 'var(--c-moss)',
        mossSoft: 'var(--c-moss-soft)',
        amber: 'var(--c-amber)',
        amberSoft: 'var(--c-amber-soft)',
        clay: 'var(--c-clay)',
        claySoft: 'var(--c-clay-soft)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(32 27 18 / 0.04), 0 4px 16px rgb(32 27 18 / 0.05)',
        lifted: '0 2px 4px rgb(32 27 18 / 0.05), 0 12px 32px rgb(32 27 18 / 0.08)',
        pop: '0 4px 8px rgb(32 27 18 / 0.08), 0 20px 48px rgb(32 27 18 / 0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'caret-blink': {
          '0%, 70%, 100%': { opacity: '1' },
          '20%, 50%': { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease both',
        shimmer: 'shimmer 1.4s linear infinite',
        'caret-blink': 'caret-blink 1.1s step-end infinite',
      },
    },
  },
  plugins: [],
}
