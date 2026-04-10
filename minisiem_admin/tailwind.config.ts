import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class", // enables class-based dark mode
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        foreground: "#F8FAFC",

        card: "#1E293B",
        cardForeground: "#F1F5F9",

        sidebar: {
          DEFAULT: "#020617",
          foreground: "#E2E8F0",
          border: "#1E293B",
          accent: "#334155",
        },

        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
        },

        secondary: {
          DEFAULT: "#06B6D4",
          foreground: "#FFFFFF",
        },

        muted: {
          DEFAULT: "#334155",
          foreground: "#94A3B8",
        },

        border: "#334155",

        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#38BDF8",

        severity: {
          low: "#38BDF8",
          medium: "#F59E0B",
          high: "#F97316",
          critical: "#EF4444",
        },
      },

      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [],
}

export default config
