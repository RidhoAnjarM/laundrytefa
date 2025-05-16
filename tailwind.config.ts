import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'custom-green': '#0BA200',
        'custom-grey': '#E4E4E4',
        'custom-blue': '#4E9BFF',
        'custom-gray-1': '#ECECEC',
        'custom-gray-2': '#B1B1B1',
      },
      boxShadow: {
        'custom': '0 0 20px rgba(11, 162, 0, 100)',
        'custom-black': '0 0 20px rgba(0, 0, 0, 100)',
        'custom-dua': '0 4px 4px rgba(0, 0, 0, 0.25)',
        'custom-green': '0 0px 10px rgba(13, 198, 0, 32)',
      },
      fontFamily: {
        russo: ['Russo One', 'sans'],
        ruda: ['Ruda', 'sans'],
      },
    },
  },
  plugins: [],
} satisfies Config;
