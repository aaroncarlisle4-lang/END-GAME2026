import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clinical: {
          teal: "#0d9488",
          "teal-light": "#ccfbf1",
          blue: "#2563eb",
          "blue-light": "#dbeafe",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
