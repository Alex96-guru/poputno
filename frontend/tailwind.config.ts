import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FBF6F0",
        surface: "#FFFFFF",
        "surface-2": "#F4EDE3",
        border: "#ECE3D7",
        accent: "#E07A5F",
        "accent-ink": "#C0563C",
        "accent-soft": "#F8E7E0",
        teal: "#2F5D62",
        "teal-soft": "#E1EAE9",
        gold: "#E4A853",
        ink: "#2A2521",
        muted: "#867C71",
        subtle: "#B4A99C",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        btn: "14px",
        card: "24px",
        pill: "9999px",
      },
      maxWidth: {
        content: "1600px",
      },
    },
  },
  plugins: [],
};

export default config;