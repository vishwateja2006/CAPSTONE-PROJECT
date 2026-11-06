/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        hazard: {
          red: "#ef4444",
          orange: "#f97316",
          yellow: "#eab308",
          dark: "#0f172a"
        }
      }
    },
  },
  plugins: [],
};

