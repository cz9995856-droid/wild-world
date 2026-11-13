import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#081711",
          900: "#0B2118",
          800: "#0F2E22",
          700: "#16402F",
          600: "#1E5440",
          500: "#2A6B51",
        },
        moss: "#6F8F72",
        sage: "#A9BFA8",
        cream: "#F5F1E7",
        bone: "#E9E2D3",
        sand: "#D9D0BE",
        amber: "#C29B4A",
        clay: "#A96246",
        ink: "#122019",
      },
      fontFamily: {
        serif: [
          "Georgia",
          "Cambria",
          "'Songti SC'",
          "'Noto Serif CJK SC'",
          "'Source Han Serif SC'",
          "serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "'PingFang SC'",
          "'Hiragino Sans GB'",
          "'Noto Sans CJK SC'",
          "sans-serif",
        ],
        mono: ["'SFMono-Regular'", "ui-monospace", "Menlo", "monospace"],
      },
      letterSpacing: {
        museum: "0.28em",
      },
      boxShadow: {
        soft: "0 18px 60px -28px rgba(8, 23, 17, 0.45)",
        card: "0 1px 0 rgba(8,23,17,0.06), 0 20px 40px -32px rgba(8,23,17,0.35)",
      },
      borderRadius: {
        xs: "3px",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(7px)" },
        },
        kenburns: {
          "0%": { transform: "scale(1.02) translate3d(0,0,0)" },
          "100%": { transform: "scale(1.12) translate3d(-1.5%,-1.5%,0)" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        floaty: "floaty 2.6s ease-in-out infinite",
        kenburns: "kenburns 18s ease-in-out infinite alternate",
        reveal: "reveal 0.7s cubic-bezier(0.22,1,0.36,1) both",
        marquee: "marquee 42s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;