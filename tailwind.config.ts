import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        "panel-alt": "var(--panel-alt)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        fg: "var(--fg)",
        "fg-soft": "var(--fg-soft)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-fg": "var(--accent-fg)",
      },
      fontFamily: {
        display: ['"Archivo Black"', "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        sm: "3px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "24px",
        6: "32px",
        7: "48px",
        8: "64px",
        9: "96px",
      },
      boxShadow: {
        none: "none",
        "raise-1": "0 1px 2px rgba(14,15,17,0.06)",
        "raise-2": "0 4px 12px rgba(14,15,17,0.08)",
        "raise-3": "0 12px 32px rgba(14,15,17,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
rm 