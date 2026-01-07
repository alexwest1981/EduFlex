/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Vi översätter dina @theme inställningar hit för v3
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    800: '#1e1f20', // Gemini Card BG
                    900: '#0e0e0e', // Gemini Main BG
                    950: '#000000',
                },
                slate: {
                    50: '#fafafa',
                    800: '#1e1f20',
                    900: '#131314', // Bakgrund
                    950: '#0e0e0e',
                },
                // En specifik dark-palett om du använder 'bg-dark-bg' i koden
                dark: {
                    bg: '#131314',
                    card: '#1e1f20',
                    text: '#E3E3E3'
                }
            }
        },
    },
    plugins: [],
}