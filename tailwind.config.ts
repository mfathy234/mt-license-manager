import type { Config } from "tailwindcss";

/** Every token is declared with `<alpha-value>` so `bg-primary/10` style modifiers resolve. */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        elevated: "hsl(var(--elevated) / <alpha-value>)",
        glass: "hsl(var(--glass) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
        "danger-surface": "hsl(var(--danger-surface) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        "success-surface": "hsl(var(--success-surface) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        "warning-surface": "hsl(var(--warning-surface) / <alpha-value>)",
        info: "hsl(var(--info) / <alpha-value>)",
        "info-surface": "hsl(var(--info-surface) / <alpha-value>)"
      },
      // Semantic stacking order. Never reach for a raw z-index outside this scale.
      zIndex: {
        dropdown: "30",
        sticky: "40",
        backdrop: "50",
        modal: "55",
        popover: "60",
        toast: "70",
        tooltip: "80"
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.06), 0 18px 50px rgba(15, 23, 42, 0.08)",
        glass: "0 22px 70px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
        popover: "0 18px 60px rgba(15, 23, 42, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
