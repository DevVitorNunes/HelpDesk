import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F97316",
          dark: "#EA580C",
          light: "#FED7AA",
        },
        surface: "#FFFFFF",
        bg: "#F8F9FA",
        sidebar: {
          DEFAULT: "#1C1C1E",
          text: "#D1D5DB",
          active: "#F97316",
        },
        "text-muted": "#6B7280",
        border: "#E5E7EB",
      },
    },
  },
  plugins: [],
};

export default config;
