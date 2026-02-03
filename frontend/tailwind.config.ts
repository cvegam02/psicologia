import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                'xs': '480px',
            },
            colors: {
                bronze: "#C59F58",
                espresso: "#4C391D",
                cream: "#E7D4B1",
            },
        },
    },
    plugins: [],
};
export default config;
