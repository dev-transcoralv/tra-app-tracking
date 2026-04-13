/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#e10718",
        secondary: "#211915",
        "secondary-complementary": "#DEE6EA",
      },
      fontSize: {
        xxs: "0.625rem", // 10px
      },
    },
  },
  plugins: [],
};
