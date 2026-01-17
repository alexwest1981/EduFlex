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
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true
            },
            '/login': {
                target: 'http://localhost:8080',
                changeOrigin: true
            },
            '/oauth2/authorization': {
                target: 'http://localhost:8080',
                changeOrigin: true
            },
            '/login/oauth2': {
                target: 'http://localhost:8080',
                changeOrigin: true
            },
            '/ws': {
                target: 'http://localhost:8080',
                ws: true,
                changeOrigin: true
            }
        }
    }
})