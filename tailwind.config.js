/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./website/index.html",
    "./website/src/**/*.{js,ts,jsx,tsx}",
  ],
  // Preflight is imported explicitly into the `nexus.reset` layer by
  // src/index.css, so it can be layered — and left out of style.no-reset.css.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Every radius derives from tokens, so `--radius: 0` squares the whole
      // UI and `--radius-pill: 0` squares pills and avatars. The multiples
      // reproduce Tailwind's defaults at the default 0.5rem.
      borderRadius: {
        DEFAULT: "calc(var(--radius) * 0.5)",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) * 1.5)",
        "2xl": "calc(var(--radius) * 2)",
        "3xl": "calc(var(--radius) * 3)",
        full: "var(--radius-pill, 9999px)",
      },
    },
  },
  plugins: [],
}
