import type { Config } from "tailwindcss";

/** Every token is declared with `<alpha-value>` so `bg-primary/10` style modifiers resolve. */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        "control-border": "hsl(var(--control-border) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        "foreground-muted": "hsl(var(--foreground-muted) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-subtle": "hsl(var(--surface-subtle) / <alpha-value>)",
        // Compatibility alias for existing consumers; new work should use `surface`.
        elevated: "hsl(var(--elevated) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-hover": "hsl(var(--primary-hover) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
        "focus-ring": "hsl(var(--focus-ring) / <alpha-value>)",
        sidebar: "hsl(var(--sidebar) / <alpha-value>)",
        "sidebar-foreground": "hsl(var(--sidebar-foreground) / <alpha-value>)",
        "sidebar-icon": "hsl(var(--sidebar-icon) / <alpha-value>)",
        "sidebar-edge": "hsl(var(--sidebar-edge) / <alpha-value>)",
        "sidebar-active": "hsl(var(--sidebar-active) / <alpha-value>)",
        "table-header": "hsl(var(--table-header) / <alpha-value>)",
        "table-header-foreground":
          "hsl(var(--table-header-foreground) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
        "danger-surface": "hsl(var(--danger-surface) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        "success-surface": "hsl(var(--success-surface) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        "warning-surface": "hsl(var(--warning-surface) / <alpha-value>)",
        info: "hsl(var(--info) / <alpha-value>)",
        "info-surface": "hsl(var(--info-surface) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      // Semantic stacking order. Never reach for a raw z-index outside this scale.
      zIndex: {
        dropdown: "30",
        sticky: "40",
        backdrop: "50",
        modal: "55",
        popover: "60",
        toast: "70",
        tooltip: "80",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      keyframes: {
        "dialog-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "dialog-in": "dialog-in 180ms cubic-bezier(0.25, 1, 0.5, 1)",
        "fade-in": "fade-in 180ms ease-out",
      },
      boxShadow: {
        panel: "0 1px 1px rgba(48, 72, 109, 0.03)",
        // Compatibility alias for existing consumers; both shadows now sit on opaque surfaces.
        glass: "0 12px 32px rgba(15, 23, 42, 0.16)",
        popover: "0 18px 48px rgba(48, 72, 109, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
