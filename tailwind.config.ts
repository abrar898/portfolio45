import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#050508",
        ember: "#ff3d00",
        gold: "#c8a84b",
        frost: "#00d4ff",
        silver: "#a0aec0",
      },
    },
  },
  plugins: [],
};
export default config;
