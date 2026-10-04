import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.ts'],
  theme: {
    extend: {
      colors: {
        brand: { violet: '#7C3AED', blue: '#2563EB' },
        cat: { virales: '#EF4444', gaming: '#10B981', herramientas: '#3B82F6', chollos: '#F97316' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}

export default config
