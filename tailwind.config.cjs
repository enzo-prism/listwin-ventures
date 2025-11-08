/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Display"', '"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"SFMono-Regular"', 'Menlo', 'Consolas', 'monospace']
      },
      colors: {
        "ink": '#1d1d1f',
        "midnight": '#00010a',
        "fog": '#f5f5f7',
        "cloud": '#ffffff',
        "brand": '#1cad7b',
        "brand-soft": '#5ed4a4'
      },
      boxShadow: {
        focus: '0 25px 45px rgba(15, 23, 42, 0.08)',
        panel: '0 30px 60px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        apple: '32px'
      }
    }
  },
  plugins: []
};
