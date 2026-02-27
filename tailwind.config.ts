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
        surface: {
          800: "#1a1d24",
          700: "#22262e",
          600: "#2a2f3a",
          500: "#343b48",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
          muted: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "phone-ring": "phone-ring 1.2s ease-in-out infinite",
        "calling-dots": "calling-dots 1.4s steps(4, end) infinite",
        "ripple": "ripple 2s ease-out infinite",
        "sound-bar": "sound-bar 0.8s ease-in-out infinite both",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "phone-ring": {
          "0%, 100%": { transform: "rotate(0deg) scale(1)" },
          "10%, 30%": { transform: "rotate(-12deg) scale(1.05)" },
          "20%, 40%": { transform: "rotate(12deg) scale(1.05)" },
          "50%": { transform: "rotate(-8deg) scale(1.02)" },
          "60%, 80%": { transform: "rotate(8deg) scale(1.02)" },
        },
        "calling-dots": {
          "0%, 20%": { content: "''" },
          "40%": { content: "'.'" },
          "60%": { content: "'..'" },
          "80%, 100%": { content: "'...'" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "sound-bar": {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
