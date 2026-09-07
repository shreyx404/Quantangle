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
        background: "#080b14",
        foreground: "#f0f4f8",
        surface: {
          50: "#1e293b",
          100: "#162032",
          200: "#111827",
          300: "#0d1322",
          DEFAULT: "#0d1322",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.05)",
        },
        quantum: {
          cyan: "#00f2fe",
          blue: "#4facfe",
          violet: "#7928ca",
          magenta: "#b537f2",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-fira-code)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(0, 242, 254, 0.3)",
        "glow-violet": "0 0 25px -5px rgba(121, 40, 202, 0.3)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "quantum-gradient": "linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #7928ca 100%)",
        "quantum-card": "linear-gradient(180deg, rgba(22, 32, 50, 0.7) 0%, rgba(13, 19, 34, 0.8) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
