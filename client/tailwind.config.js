/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx,jsx}"],
  theme: {
    extend: {
      colors: {
        csblue: {
          50: "#b0b9ca",
          100: "#4e6187",
          150: "#3e4e6c",
          200: "#293755",
          300: "#232f49",
          400: "#1d283d",
          500: "#172031",
          600: "#111825",
          700: "#0c1018",
        },
        cspink: {
          50: "#fff6f9",
          100: "#fea1bf",
          200: "#e98ead",
        },
      },
    },
  },
  plugins: [],
}
