/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "color-grey-dark": "#787878",
        "color-grey-light": "#f8f8fc",
        "color-dark": "#232324",
        "color-darker": "#1a1a1b",
        "color-blue": "#1976d2",
        "color-blue-darker": "#1565c0",
        "border-grey-dark": "#3a3939",
        "border-dark": "#222222",
        "color-filter": "#282829",
        "dark-lighten": "#333335",
        "green-dark": "#1d292e",
        "grey-card": "#c9c9c9",
        "color-disable": "#afafaf",
        "bg-disable": "#e0e0e0",
      },
      screens: {
        "min-w-937": "937px",
      },
    },
  },
  plugins: [],
};
