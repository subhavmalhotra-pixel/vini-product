/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        spyne: {
          violet: '#7C3AED',
          violetDark: '#5B21B6',
          ink: '#0E0F1A',
          paper: '#F8F9FC',
          mute: '#6B7280',
          line: '#E5E7EB',
          chipGreen: '#DCFCE7',
          chipYellow: '#FEF9C3',
          chipRed: '#FEE2E2',
          chipBlue: '#DBEAFE',
          chipGray: '#E5E7EB',
          okText: '#15803D',
          warnText: '#92400E',
          dangerText: '#991B1B',
          infoText: '#1E40AF',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,17,26,0.04), 0 1px 1px rgba(15,17,26,0.04)',
        pop: '0 10px 24px rgba(15,17,26,0.08), 0 2px 6px rgba(15,17,26,0.06)',
      },
    },
  },
  plugins: [],
}
