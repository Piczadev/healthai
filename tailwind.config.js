/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        glass: {
          surface: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.1)',
          text: 'rgba(255, 255, 255, 0.9)',
          muted: 'rgba(255, 255, 255, 0.5)',
        },
        accent: {
          cyan: '#00E5FF',
          pink: '#FF4081',
          violet: '#7C4DFF',
          amber: '#FFD740',
          emerald: '#69F0AE'
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(0, 229, 255, 0.15)',
      }
    },
  },
  plugins: [],
}
