module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {},
    container: {
      center: true,
    },
    minHeight: {
      "0": "0",
      "1/4": "25vh",
      "1/2": "50vh",
      "3/4": "75vh",
      full: "100vh",
    },
  },
  variants: {
    extend: { opacity: ["disabled"] },
  },
  plugins: [require("@tailwindcss/forms")],
};
