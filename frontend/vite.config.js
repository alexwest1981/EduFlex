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
            '/web-apps': {
                target: 'http://backend:8080', // Serve Static Assets from Spring Boot
                changeOrigin: true,
                ws: true
            },
            '/sdkjs': {
                target: 'http://backend:8080',
                changeOrigin: true
            },
            '/api/documents': { // Some OO versions use this for commands
                target: 'http://backend:8080',
                changeOrigin: true
            },
            // Catch-all for versioned assets if possible? 
            // Better to rely on /web-apps loading them via relative paths which Vite might try to serve as static assets.
            // But usually resources are under /web-apps/ or root. 
            // Let's rely on /web-apps for now. The previous config had /7.3.3-49 which is too specific.
        }
    }
})