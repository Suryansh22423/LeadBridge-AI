import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F6",
        surface: "#FFFFFF",
        ink: "#191B1F",
        muted: "#6B6F76",
        rule: "#E4E1D8",
        rust: {
          DEFAULT: "#C1440E",
          dark: "#9C3608",
          light: "#F2E1D4",
        },
        stamp: {
          green: "#2F6F4E",
          greenBg: "#E7F0EA",
          red: "#B3261E",
          redBg: "#F7E8E6",
        },
        dark: {
          bg: "#15161A",
          surface: "#1D1F24",
          ink: "#F2F0EA",
          rule: "#33353C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        manifest: "0 1px 0 0 rgba(25,27,31,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
