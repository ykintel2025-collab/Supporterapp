/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        club: {
          red: "#D2122E",
          "red-dark": "#9E0E22",
          black: "#0F0F0F",
          gray: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
};
