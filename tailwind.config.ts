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
        saffron: {
          DEFAULT: "#FF9933",
          dim: "#E8892E",
          glow: "rgba(255, 153, 51, 0.35)",
        },
        parchment: "#F5F5DC",
        gold: {
          soft: "#D4AF37",
          muted: "#C5A028",
        },
        ink: {
          DEFAULT: "#2C2416",
          muted: "#5C5346",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 153, 51, 0.15)",
        "glow-sm": "0 0 20px rgba(255, 153, 51, 0.12)",
        card: "0 8px 32px rgba(44, 36, 22, 0.08)",
      },
      backgroundImage: {
        "spiritual-radial":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,153,51,0.12), transparent 55%)",
        "soft-gradient":
          "linear-gradient(165deg, #F5F5DC 0%, #FAF6EA 45%, #FFF9EF 100%)",
      },
      animation: {
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
