/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        work: '#3B82F6',
        personal: '#10B981',
        'btn-camera': '#EF4444',
        'btn-voice': '#F59E0B',
        'btn-text': '#3B82F6',
      },
      borderRadius: {
        'lg': '16px',
        'md': '12px',
        'sm': '8px',
        'xs': '6px',
      }
    },
  },
  plugins: [],
}
