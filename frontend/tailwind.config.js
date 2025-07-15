// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}" // This covers all files in src
  ],
  theme: {
    extend: {
      colors: {
        brandRed: '#FF0000',
        brandDarkRed: '#C80018',
        brandNavy: '#1D1E27',
        brandGray: '#4B4E53',
        brandOffWhite: '#EDF2F4',
      },
      fontFamily: {
        bungee: ['"Bungee"', 'cursive'],
      },
    },
  },
  plugins: [],
};
