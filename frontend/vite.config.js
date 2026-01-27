import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env (including process.env)
    const env = loadEnv(mode, process.cwd(), '')
    const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080'
    console.log(`[ViteConfig] Mode: ${mode}, Backend URL: ${backendUrl}`);

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                // Force single instance of React and friends
                'react': path.resolve(__dirname, 'node_modules/react'),
                'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
                'react-i18next': path.resolve(__dirname, 'node_modules/react-i18next'),
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
                    target: backendUrl,
                    changeOrigin: true
                },
                '/oauth2/authorization': {
                    target: backendUrl,
                    changeOrigin: true
                },
                '/ws': {
                    target: backendUrl,
                    ws: true,
                    changeOrigin: true
                },
                '/ws-log': {
                    target: backendUrl,
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
                    target: backendUrl,
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
    }
})
