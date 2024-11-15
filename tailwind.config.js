/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Define custom colors
        primary: {
          light: '#FCFCFD',
          DEFAULT: '#FF9500',
        },
        secondary: {
          light: '#4C4C4D',
          DEFAULT: '#191919',
        },
        background: {
          light: '#F7F7F8',
          DEFAULT: '#FFFFFF',
          lightest: '#E4E4E7',
        },
        // Add more colors as needed
      },
    },
  },
  plugins: [],
};
