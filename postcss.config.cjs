module.exports = {
  plugins: [
    // Use the official PostCSS adapter for Tailwind as a plugin function
    require('@tailwindcss/postcss')(),
    require('autoprefixer')(),
  ],
}
