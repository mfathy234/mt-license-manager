import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        elevated: "hsl(var(--elevated))",
        glass: "hsl(var(--glass))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        danger: "hsl(var(--danger))"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.06), 0 18px 50px rgba(15, 23, 42, 0.08)",
        glass: "0 22px 70px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
