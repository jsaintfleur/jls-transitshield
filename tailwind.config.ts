import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        ink: { DEFAULT: "#0f172a", soft: "#334155", muted: "#64748b", faint: "#94a3b8" },
        canvas: "#f5f8fb",
        panel: "#ffffff",
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)" },
    },
  },
  plugins: [],
};
export default config;
