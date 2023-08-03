/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  presets: [
    require('./design-tokens.config.js')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
