/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                'display': ['Lexend', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'none': '0',
                'sm': 'var(--radius-sm)',
                'DEFAULT': 'var(--radius-md)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'xl': 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
                '3xl': 'var(--radius-3xl)',
                'full': 'var(--radius-full)',
                'btn': 'var(--button-border-radius)',
            },
            boxShadow: {
                'sm': 'var(--card-shadow)',
                'DEFAULT': 'var(--card-shadow)',
                'md': 'var(--card-shadow)',
                'lg': 'var(--card-shadow)',
                'xl': 'var(--card-shadow)',
                '2xl': 'var(--card-shadow)',
                'btn': 'var(--button-shadow)',
                'glow-teal': '0 0 40px -10px rgba(0, 212, 170, 0.3)',
                'glow-gold': '0 0 40px -10px rgba(255, 183, 3, 0.3)',
            },
            colors: {
                // EduFlex 2.0 Brand Colors
                'brand': {
                    teal: '#00d4aa',
                    emerald: '#10b981',
                    blue: '#0ea5e9',
                    orange: '#ff9f1c',
                    gold: '#ffb703',
                },
                'eduflex': {
                    bg: '#06141b',
                    'bg-light': '#0a1f2b',
                    glass: 'rgba(0, 212, 170, 0.05)',
                    'glass-border': 'rgba(0, 212, 170, 0.2)',
                },
                // Dynamic Theme Colors (Replaces default Indigo)
                indigo: {
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                    950: 'var(--color-primary-950)',
                    DEFAULT: 'var(--color-primary-600)',
                },
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