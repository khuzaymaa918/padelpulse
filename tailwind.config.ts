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
        black:  "#0a0a0a",
        white:  "#f5f4f0",
        gray:   "#1c1c1c",
        mid:    "#252525",
        green:  "#6bcf7f",
        red:    "#c94040",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body:    ["var(--font-dm-sans)", "sans-serif"],
      },
      keyframes: {
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        ticker: "ticker 18s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
