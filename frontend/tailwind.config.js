/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // <--- VIKTIGT: Lägg till denna rad!
    theme: {
        extend: {
            // Du kan lägga till egna färger här om du vill, t.ex:
            colors: {
                dark: {
                    bg: '#0f172a', // Slate-900 (vanlig mörk bakgrund)
                    card: '#1e293b', // Slate-800
                    text: '#f1f5f9', // Slate-100
                }
            }
        },
    },
    plugins: [], // Om du använder @tailwindcss/typography för forumet, se till att det är med här
}