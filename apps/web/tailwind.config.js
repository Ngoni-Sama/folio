/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        surface: '#141414',
        surfaceHi: '#1C1C1C',
        border: '#262626',
        text: '#EDEDED',
        textMuted: '#8A8A8A',
        accent: '#4D6BFE',
        accentHi: '#6B84FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
