/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090A0F',
        surface: '#11131B',
        'surface-elevated': '#1A1E2B',
        accent: {
          DEFAULT: '#3B82F6',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        mono: ['SF Mono', 'Fira Code', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
};
