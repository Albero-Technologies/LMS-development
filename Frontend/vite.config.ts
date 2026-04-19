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
                changeOrigin: true
            }
        }
    }

    return {
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
                manifest: {
                    name: 'Albero Academy — Modern Learning Platform',
                    short_name: 'Albero',
                    description: 'Live classes, mentor-guided cohorts, and verified certificates.',
                    theme_color: '#0B0B14',
                    background_color: '#0B0B14',
                    display: 'standalone',
                    orientation: 'portrait',
                    start_url: '/',
                    scope: '/',
                    icons: [
                        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
                        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
                    ],
                    categories: ['education', 'productivity']
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
                    navigateFallback: '/index.html',
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
                    enabled: false
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
                thresholds: { statements: 5, branches: 5, functions: 5, lines: 5 }
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
