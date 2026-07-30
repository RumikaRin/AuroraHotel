import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aurora: {
          midnight: "#17211D",
          ivory: "#F7F4ED",
          paper: "#FFFDF8",
          gold: "#C5A46D",
          forest: "#355B4B",
          terracotta: "#B97857",
          mist: "#DADDD8",
          charcoal: "#242826",
        },
        semantic: {
          success: "#2E7D5A",
          warning: "#C48138",
          error: "#B84A4A",
          info: "#3F6D8C",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        interface: ["'Manrope'", "sans-serif"],
      },
      maxWidth: {
        content: "1440px",
        "content-narrow": "1280px",
      },
      borderRadius: {
        surface: "22px",
        input: "13px",
        btn: "11px",
        modal: "24px",
      },
      spacing: {
        section: "120px",
        "section-mobile": "76px",
      },
    },
  },
  plugins: [],
};

export default config;
