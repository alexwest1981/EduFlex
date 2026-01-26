import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: true,
        port: 5173,
        allowedHosts: ['www.eduflexlms.se', 'eduflexlms.se', 'localhost', '127.0.0.1'],
        watch: {
            usePolling: true
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true
            },
            '/oauth2/authorization': {
                target: 'http://localhost:8080',
                changeOrigin: true
            },
            '/ws': {
                target: 'http://localhost:8080',
                ws: true,
                changeOrigin: true
            },
            '/ws-log': {
                target: 'http://localhost:8080',
                ws: true,
                changeOrigin: true
            },
            '/web-apps': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                ws: true,
                secure: false
            },
            // Proxy uploads to backend (Profile pictures, etc.)
            '/uploads': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            },
            // OnlyOffice 8.x uses versioned paths like /8.2.0/ for some resources
            // Proxy all numeric version paths to OnlyOffice (localhost:8000 or Docker onlyoffice-ds)
            '^/[0-9]+\\.[0-9]+\\.[0-9]+': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                ws: true,
                secure: false
            },
            // OnlyOffice also uses /cache/files/ for document operations
            '/cache': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            },
            // Fonts and other resources
            '/fonts': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            },
            '/sdkjs': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            },
            '/sdkjs-plugins': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            }
        }
    }
})