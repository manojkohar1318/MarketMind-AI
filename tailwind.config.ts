import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#0c1017", panel: "#121821", line: "#202a36", muted: "#8a98a9", cyan: "#55d6c2", red: "#f26b6b" }, boxShadow: { glow: "0 0 30px rgba(85,214,194,.09)" } } },
  plugins: []
};

export default config;
