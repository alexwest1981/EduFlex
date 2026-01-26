import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            'react': path.resolve('/app/node_modules/react'),
            'react-dom': path.resolve('/app/node_modules/react-dom'),
            'react-router-dom': path.resolve('/app/node_modules/react-router-dom'),
        },
        dedupe: ['react', 'react-dom']
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
            },
            '/ws-log': {
                target: 'http://backend:8080',
                ws: true,
                changeOrigin: true
            },
            '/web-apps': {
                target: 'http://onlyoffice-ds',
                changeOrigin: true,
                ws: true,
                secure: false
            },
            // Proxy uploads to backend (Profile pictures, etc.)
            '/uploads': {
                target: 'http://backend:8080',
                changeOrigin: true,
                secure: false
            },
            // OnlyOffice 8.x uses versioned paths like /8.2.0/ for some resources
            // Proxy all numeric version paths to OnlyOffice
            '^/[0-9]+\\.[0-9]+\\.[0-9]+': {
                target: 'http://onlyoffice-ds',
                changeOrigin: true,
                ws: true,
                secure: false
            },
            // OnlyOffice also uses /cache/files/ for document operations
            '/cache': {
                target: 'http://onlyoffice-ds',
                changeOrigin: true,
                secure: false
            },
            // Fonts and other resources
            '/fonts': {
                target: 'http://onlyoffice-ds',
                changeOrigin: true,
                secure: false
            },
            '/sdkjs': {
                target: 'http://onlyoffice-ds',
                changeOrigin: true,
                secure: false
            },
            '/sdkjs-plugins': {
                target: 'http://onlyoffice-ds',
                changeOrigin: true,
                secure: false
            }
        }
    }
})