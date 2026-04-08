/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple Design Colors
        apple: {
          black: '#000000',
          'light-gray': '#f5f5f7',
          'near-black': '#1d1d1f',
          blue: '#0071e3',
          'link-blue': '#0066cc',
          'bright-blue': '#2997ff',
        },
        dark: {
          1: '#272729',
          2: '#262628',
          3: '#28282a',
          4: '#2a2a2d',
          5: '#242426',
        },
        surface: {
          btn: '#fafafc',
          active: '#ededf2',
        },
      },
      fontFamily: {
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        text: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-hero': ['56px', { lineHeight: '1.07', letterSpacing: '-0.28px', fontWeight: '600' }],
        'section-heading': ['40px', { lineHeight: '1.10', fontWeight: '600' }],
        'tile-heading': ['28px', { lineHeight: '1.14', letterSpacing: '0.196px' }],
        'card-title': ['21px', { lineHeight: '1.19', letterSpacing: '0.231px', fontWeight: '700' }],
        'nav-heading': ['34px', { lineHeight: '1.47', letterSpacing: '-0.374px' }],
        'body': ['17px', { lineHeight: '1.47', letterSpacing: '-0.374px' }],
        'link': ['14px', { lineHeight: '1.43', letterSpacing: '-0.224px' }],
        'caption': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px' }],
        'micro': ['12px', { lineHeight: '1.33', letterSpacing: '-0.12px' }],
      },
      borderRadius: {
        'micro': '5px',
        'standard': '8px',
        'comfortable': '11px',
        'large': '12px',
        'pill': '980px',
      },
      boxShadow: {
        'apple-card': 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0px',
      },
      maxWidth: {
        'apple': '980px',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
    },
  },
  plugins: [],
}
