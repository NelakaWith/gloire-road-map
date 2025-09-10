import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Note: tailwindcss-primeui may need v4 compatibility updates
    // Check plugin documentation for v4 support
  ],
} satisfies Config;
