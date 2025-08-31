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
        'lol-gold': '#C89B3C',
        'lol-dark': '#0A1428',
        'lol-darker': '#091428',
        'lol-blue': '#1E2328',
        'lol-accent': '#F0E6D2',
        'lol-red': '#C53030',
        'lol-green': '#38A169',
        'lol-purple': '#805AD5',
        'lol-orange': '#DD6B20',
      },
      fontFamily: {
        'lol': ['Beaufort', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'lol-gradient': 'linear-gradient(135deg, #0A1428 0%, #1E2328 100%)',
        'champion-gradient': 'linear-gradient(135deg, #C89B3C 0%, #F0E6D2 100%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #C89B3C' },
          '100%': { boxShadow: '0 0 20px #C89B3C, 0 0 30px #C89B3C' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
