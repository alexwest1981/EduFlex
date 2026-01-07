import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Behövs för Docker
        port: 5173,
        watch: {
            usePolling: true // Bra för Windows/Docker fil-synk
        }
    }
})