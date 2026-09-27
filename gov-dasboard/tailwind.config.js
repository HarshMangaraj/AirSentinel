/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        command: {
          bg: "#0B1120",
          card: "#131C31",
          border: "#1E293B",
          accent: "#10B981",
          danger: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
        }
      },
    },
  },
  plugins: [],
};
