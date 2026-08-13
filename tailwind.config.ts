import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aurora: {
          /* Locked Customer Tokens (design.md) */
          espresso: "#261e1a",
          carbon: "#191512",
          "warm-carbon": "#191512",
          linen: "#f3eee7",
          ivory: "#fbf8f2",
          "warm-ivory": "#fbf8f2",
          brass: "#b59a6b",
          "antique-brass": "#b59a6b",
          gold: "#b59a6b",
          walnut: "#665044",
          terracotta: "#a76d55",
          "muted-terracotta": "#a76d55",
          taupe: "#887a70",
          charcoal: "#242826",
          /* Semantic Tokens */
          success: "#2e7d5a",
          warning: "#c48138",
          error: "#b84a4a",
          information: "#3f6d8c",
          /* Operational / Legacy Tokens */
          midnight: "#17211d",
          forest: "#355b4b",
          mist: "#daddd8",
        },
      },
      borderRadius: {
        surface: "20px",
        panel: "20px",
        input: "12px",
        control: "10px",
        modal: "24px",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        interface: ["'Manrope'", "sans-serif"],
        sans: ["'Manrope'", "sans-serif"],
        serif: ["'Cormorant Garamond'", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
