export default {
  plugins: {
    '@tailwindcss/postcss': {
      config: './tailwind.config.js' // optional if your config is in the default location
    },
    autoprefixer: {}, // keep autoprefixer if you need it
  }
}
