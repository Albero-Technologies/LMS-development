/// <reference types="vitest" />
import { defineConfig, loadEnv, type ServerOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { sentryVitePlugin } from '@sentry/vite-plugin'

type TMode = 'development' | 'test' | 'production' | 'staging'

interface AppEnv {
    PORT: string
    BACKEND_PROXY: string
    SENTRY_TOKEN?: string
    VITE_ENV: TMode
}

const validateEnv = (envMode: TMode, env: AppEnv): void => {
    const requiredVars: (keyof AppEnv)[] = ['PORT', 'BACKEND_PROXY', 'VITE_ENV']
    if (envMode === 'production') {
        // SENTRY_TOKEN is optional — build must succeed even without it.
    }
    for (const key of requiredVars) {
        if (!env[key]) {
            throw new Error(`${key} is missing! Please define it in your .env.${envMode}`)
        }
    }
}

const normalizePort = (port: string): number => {
    const parsed = parseInt(port, 10)
    if (isNaN(parsed)) throw new Error(`Invalid port number: ${port}`)
    return parsed
}

export default defineConfig(({ mode }) => {
    const envMode = mode as TMode
    const env = loadEnv(envMode, process.cwd(), '') as unknown as AppEnv

    validateEnv(envMode, env)

    const port = normalizePort(env.PORT)

    const config: ServerOptions = {
        port,
        open: false,
        proxy: {
            '/api': {
                target: env.BACKEND_PROXY,
                changeOrigin: true,
                // Forward WebSocket upgrades so socket.io works through the Vite dev proxy.
                ws: true
            }
        }
    }

    return {
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png', 'icons/*.png'],
                manifest: {
                    name: 'Albero Academy — Modern Learning Platform',
                    short_name: 'Albero',
                    description: 'Live classes, mentor-guided cohorts, and verified certificates.',
                    theme_color: '#0B0B14',
                    background_color: '#0B0B14',
                    display: 'standalone',
                    orientation: 'portrait',
                    start_url: '/',
                    id: '/',
                    scope: '/',
                    lang: 'en-IN',
                    // Chrome's install criteria need (1) a registered + activated
                    // service worker AND (2) a manifest with both 192px and 512px
                    // icons that actually 200 OK. The previous config pointed at
                    // /icons/icon-192.png + /icons/icon-512.png that didn't exist
                    // on disk, so Chrome silently failed the eligibility check
                    // and never offered "Install app". Listing every available
                    // size — including a dedicated maskable variant — makes the
                    // app installable on Android (where maskable icons are
                    // strictly required) and gives Chrome multiple resolutions
                    // to pick from.
                    icons: [
                        { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
                        { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
                        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
                        { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
                        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
                    ],
                    categories: ['education', 'productivity'],
                    prefer_related_applications: false
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
                    navigateFallback: '/index.html',
                    cleanupOutdatedCaches: true,
                    clientsClaim: true,
                    skipWaiting: true,
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts',
                                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }
                            }
                        },
                        {
                            urlPattern: /^https:\/\/.*\.(neon|render|upstash)\..*\/.*/,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'api-cache',
                                networkTimeoutSeconds: 5,
                                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }
                            }
                        }
                    ]
                },
                devOptions: {
                    // Register the service worker in dev so the "Install app"
                    // prompt appears during `npm run dev` too — without this
                    // Chrome only treats the prod build as installable, which
                    // is annoying when iterating on the install UX.
                    enabled: true,
                    type: 'module',
                    navigateFallback: 'index.html',
                    suppressWarnings: true
                }
            }),
            ...(env.VITE_ENV === 'production' && env.SENTRY_TOKEN
                ? [
                      sentryVitePlugin({
                          org: 'anuj-bt',
                          project: 'learnhub-frontend',
                          authToken: env.SENTRY_TOKEN,
                          sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] }
                      })
                  ]
                : [])
        ],
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: 'src/setupTests.ts',
            include: ['src/**/*.{test,spec}.{ts,tsx}'],
            coverage: {
                reporter: ['json', 'html'],
                include: ['src/**/*.{ts,tsx}'],
                exclude: ['coverage', 'dist', 'build', 'src/setupTests.ts', 'src/**/*.{test,spec}.{ts,tsx}'],
                // Phase 1 has minimal test coverage by design — thresholds will rise as Phase 2
                // adds real test suites for the auth/payment/pipeline flows.
                thresholds: { statements: 4, branches: 4, functions: 4, lines: 4 }
            }
        },
        resolve: {
            alias: {
                '@features': path.resolve(__dirname, 'src/features'),
                '@shared': path.resolve(__dirname, 'src/shared'),
                '@app': path.resolve(__dirname, 'src')
            }
        },
        server: config,
        preview: config,
        build: {
            minify: 'esbuild',
            sourcemap: env.VITE_ENV === 'production',
            target: 'es2022',
            cssCodeSplit: true,
            rollupOptions: {
                external: [/.*\.(test|spec)\.(ts|tsx)$/],
                output: {
                    manualChunks: {
                        react: ['react', 'react-dom', 'react-router-dom'],
                        tanstack: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
                        motion: ['framer-motion'],
                        sentry: ['@sentry/react']
                    }
                }
            }
        }
    }
})
