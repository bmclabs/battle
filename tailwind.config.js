/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9945FF",
        secondary: "#14F195",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fighter-attack-left': 'fighterAttackLeft 1s ease-in-out infinite',
        'fighter-attack-right': 'fighterAttackRight 1s ease-in-out infinite',
        'fighter-defeated': 'fighterDefeated 1s ease-in-out forwards',
      },
      keyframes: {
        fighterAttackLeft: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(20px)' },
        },
        fighterAttackRight: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-20px)' },
        },
        fighterDefeated: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
} 