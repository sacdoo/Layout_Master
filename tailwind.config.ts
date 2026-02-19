import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0e0f12",
          700: "#1d1f27",
          500: "#3a3d49",
          300: "#70768b"
        },
        paper: {
          50: "#f7f6f2",
          100: "#f1efe7"
        },
        accent: {
          500: "#e07a5f",
          600: "#c9654b"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(8, 10, 18, 0.12)"
      },
      borderRadius: {
        xl: "18px"
      }
    }
  },
  plugins: []
};

export default config;
