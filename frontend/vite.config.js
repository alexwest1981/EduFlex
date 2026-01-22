import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Behövs för Docker
        port: 5173,
        allowedHosts: ['www.eduflexlms.se', 'eduflexlms.se', 'localhost', '127.0.0.1'],
        watch: {
            usePolling: true // Bra för Windows/Docker fil-synk
        },
        proxy: {
            '/api': {
                target: 'http://backend:8080',
                changeOrigin: true
            },
            '/oauth2/authorization': {
                target: 'http://backend:8080',
                changeOrigin: true
            },
            '/ws': {
                target: 'http://backend:8080',
                ws: true,
                changeOrigin: true
            }
        }
    }
})