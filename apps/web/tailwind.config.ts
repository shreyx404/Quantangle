import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#060912",
        foreground: "#e2e8f0",
        surface: {
          50: "#1e293b",
          100: "#162032",
          200: "#111827",
          300: "#0d1322",
          DEFAULT: "#0d1322",
          border: "rgba(255, 255, 255, 0.06)",
          hover: "rgba(255, 255, 255, 0.04)",
        },
        quantum: {
          cyan: "#00e5ff",
          blue: "#4facfe",
          violet: "#7928ca",
          magenta: "#b537f2",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        elevated: "0 4px 16px -2px rgba(0, 0, 0, 0.5)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "quantum-gradient": "linear-gradient(135deg, #00e5ff 0%, #4facfe 50%, #7928ca 100%)",
        "quantum-card": "linear-gradient(180deg, rgba(17, 23, 38, 0.6) 0%, rgba(11, 15, 25, 0.7) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
