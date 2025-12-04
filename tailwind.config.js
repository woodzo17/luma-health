/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'playfair': ['"Playfair Display"', 'serif'],
                'space': ['"Space Mono"', 'monospace'],
                'inter': ['Inter', 'sans-serif'],
            },
            colors: {
                'ice-grey': '#F2F4F6',
                'charcoal': '#111111',
                'holo-blue': '#A0C4FF',
            },
        },
    },
    plugins: [],
}
