import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env (including process.env)
    const env = loadEnv(mode, process.cwd(), '')
    const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080'
    console.log(`[ViteConfig] Mode: ${mode}, Backend URL: ${backendUrl}`);

    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['apple-touch-icon.png'],
                manifest: {
                    name: 'EduFlex LMS',
                    short_name: 'EduFlex',
                    description: 'The Complete Enterprise Learning Platform',
                    theme_color: '#6366f1',
                    background_color: '#ffffff',
                    display: 'standalone',
                    display_override: ['standalone', 'window-controls-overlay'],
                    orientation: 'portrait',
                    start_url: '/',
                    scope: '/',
                    id: '/',
                    categories: ['education', 'productivity'],
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                            purpose: 'any maskable'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any maskable'
                        }
                    ],
                    screenshots: [
                        {
                            src: 'screenshot.png',
                            sizes: '1920x1080',
                            type: 'image/png',
                            form_factor: 'wide',
                            label: 'EduFlex Mission Control'
                        }
                    ]
                },
                workbox: {
                    // Only cache the app shell essentials — no images, no huge bundles
                    globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
                    // Exclude the 200MB+ gamification folder and large screenshot from precache
                    globIgnores: ['**/gamification/**', '**/screenshot*'],
                    // The main JS bundle is ~1.85MB; give a comfortable margin
                    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                    // Let the app shell handle routing for SPA — match everything except /api/
                    // Let the app shell handle routing for SPA — match everything except /api/ and OnlyOffice assets
                    navigateFallback: 'index.html',
                    navigateFallbackAllowlist: [
                        /^\/(?!(api|web-apps|sdkjs|fonts|cache|coauthoring|spellcheck|doc\/|shards|.*\/web-apps|.*\/sdkjs|.*\/fonts|.*\/cache|.*\/coauthoring|.*\/spellcheck|.*\/doc\/|.*\/shards|.*service_worker\.js|\d+\.\d+\.\d+))/
                    ]
                },
                // Aktivera PWA-funktioner även i dev mode (manifest + service worker)
                devOptions: {
                    enabled: true
                }
            })
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            host: true,
            port: 5173,
            allowedHosts: ['www.eduflexlms.se', 'eduflexlms.se', 'localhost', '127.0.0.1'],
            // HMR configuration for Cloudflare Tunnel / Reverse Proxy
            hmr: {
                host: 'www.eduflexlms.se',
                clientPort: 443,
                protocol: 'wss',
                path: '/hmr/' // Use a specific path to avoid collision with root
            },
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
                '/ws-forum': {
                    target: backendUrl,
                    ws: true,
                    changeOrigin: true
                },
                '/ws-social': {
                    target: backendUrl,
                    ws: true,
                    changeOrigin: true
                },
                // Proxy uploads to backend (Profile pictures, etc.)
                '/uploads': {
                    target: backendUrl,
                    changeOrigin: true,
                    secure: false
                },
                // OnlyOffice Direct Proxy - Route ASSETS and SOCKETS directly to ONLYOFFICE server (8081)
                // This bypasses the backend proxy for better performance and WebSocket support
                // Refined: Use doc/ (slash inclusive) to avoid matching /documents SPA route
                '^(?:/.*)?/(web-apps|sdkjs|fonts|cache|sdkjs-plugins|coauthoring|spellcheck|doc/|shards|ConvertService\\.ashx|CommandService\\.ashx|.*service_worker\\.js|\\d+\\.\\d+\\.\\d+)': {
                    target: 'http://localhost:8081',
                    changeOrigin: false,
                    ws: true,
                    secure: false,
                    xfwd: true,
                    headers: {
                        'X-Forwarded-Proto': 'https',
                        'X-Forwarded-Port': '443'
                    }
                }
            }
        }
    }
})
