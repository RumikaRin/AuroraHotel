import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aurora: {
          midnight: "#14201b",
          ivory: "#f7f4ed",
          paper: "#fffdf8",
          gold: "#c5a46d",
          forest: "#355b4b",
          terracotta: "#b97857",
          mist: "#dcd7cb",
          charcoal: "#242826",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        interface: ["'Manrope'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
