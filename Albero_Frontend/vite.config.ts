/// <reference types="vitest" />
import { defineConfig, loadEnv, type ServerOptions } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

type TMode = 'development' | 'test' | 'production'

interface AppEnv {
    PORT: string
    BACKEND_PROXY: string
    VITE_ENV: TMode
}

const validateEnv = (envMode: TMode, env: AppEnv) => {
    const requiredVars: (keyof AppEnv)[] = ['PORT', 'BACKEND_PROXY', 'VITE_ENV']
    for (const key of requiredVars) {
        if (!env[key]) {
            throw new Error(`${key} is missing! Please define it in your .env.${envMode}`)
        }
    }
}

const normalizePort = (port: string): number => {
    const normalizedPort = parseInt(port, 10)
    if (isNaN(normalizedPort)) {
        throw new Error(`Invalid port number: ${port}. Please provide a valid port number in your .env file.`)
    }
    return normalizedPort
}

export default defineConfig(({ mode }) => {
    const envMode = mode as TMode
    const env = loadEnv(envMode, process.cwd(), '') as unknown as AppEnv

    validateEnv(envMode, env)

    const port = normalizePort(env.PORT)
    const isProd = env.VITE_ENV === 'production'

    const serverConfig: ServerOptions = {
        port,
        open: true,
        proxy: {
            '/api': {
                target: env.BACKEND_PROXY,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
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

                // ── Tell Vite where your manifest lives ───────────────
                includeAssets: [
                    'favicon.ico',
                    'favicon.svg',
                    'apple-touch-icon.png',
                    'robots.txt',
                    'sitemap.xml',
                    'humans.txt',
                    'browserconfig.xml',
                    'icons/*.png'
                ],

                // ── Full manifest matching your site.webmanifest ──────
                manifest: {
                    name: 'Albero Academy',
                    short_name: 'Albero',
                    description:
                        'High-performance websites, SaaS platforms, and AI-powered systems that help businesses launch faster, automate operations, and scale efficiently.',
                    start_url: '/',
                    id: '/',
                    scope: '/',
                    display: 'standalone',
                    orientation: 'portrait-primary',
                    background_color: '#000000',
                    theme_color: '#000000',
                    lang: 'en-IN',
                    dir: 'ltr',
                    categories: ['business', 'productivity', 'technology'],
                    prefer_related_applications: false,
                    icons: [
                        { src: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
                        { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
                        { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
                        { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
                        { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
                        { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
                        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
                        { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
                        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
                    ],
                    shortcuts: [
                        {
                            name: 'Our Work',
                            short_name: 'Work',
                            description: 'View our case studies and project portfolio',
                            url: '/work',
                            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
                        },
                        {
                            name: 'Contact Us',
                            short_name: 'Contact',
                            description: 'Get a free strategy call with our team',
                            url: '/#contact',
                            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
                        },
                        {
                            name: 'About Us',
                            short_name: 'About',
                            description: 'Learn about Albero Academy',
                            url: '/about',
                            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
                        }
                    ]
                },

                // ── Workbox — runtime caching strategy ────────────────
                workbox: {
                    globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,webp,avif}'],
                    cleanupOutdatedCaches: true,
                    clientsClaim: true,
                    skipWaiting: true,

                    // Cache API calls separately — never serve stale contact data
                    runtimeCaching: [
                        {
                            // Google Fonts stylesheet
                            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-cache',
                                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                                cacheableResponse: { statuses: [0, 200] }
                            }
                        },
                        {
                            // Google Fonts files
                            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'gstatic-fonts-cache',
                                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                                cacheableResponse: { statuses: [0, 200] }
                            }
                        },
                        {
                            // Unsplash / remote images
                            urlPattern: /^https:\/\/(images\.unsplash\.com|randomuser\.me|avatars\.githubusercontent\.com)\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'remote-images-cache',
                                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
                                cacheableResponse: { statuses: [0, 200] }
                            }
                        },
                        {
                            // Own API — network first, fall back to cache
                            urlPattern: /^https:\/\/www\.albero\.in\/api\/.*/i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'api-cache',
                                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 },
                                cacheableResponse: { statuses: [0, 200] }
                            }
                        }
                    ]
                },

                devOptions: {
                    enabled: false,
                    navigateFallback: 'index.html',
                    suppressWarnings: true,
                    type: 'module'
                }
            })
        ],

        // ── Vitest ───────────────────────────────────────────────────
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

        // ── Path aliases ─────────────────────────────────────────────
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        },

        server: serverConfig,
        preview: serverConfig,

        // ── Build ────────────────────────────────────────────────────
        build: {
            minify: 'terser', // FIX: 'true' is not a valid minify value — use 'terser' or 'esbuild'
            sourcemap: false, // FIX: never expose sourcemaps in production (security + perf)
            target: 'es2020',
            cssCodeSplit: true,

            terserOptions: isProd
                ? {
                      compress: {
                          drop_console: true, // strip console.log in prod
                          drop_debugger: true
                      }
                  }
                : undefined,

            rollupOptions: {
                external: [/.*\.(test|spec)\.(ts|tsx)$/],

                output: {
                    // ── Manual chunk splitting (improves LCP / FCP scores) ──
                    manualChunks(id) {
                        // Vendor: React core
                        if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                            return 'vendor-react'
                        }
                        // Vendor: Router
                        if (id.includes('node_modules/react-router')) {
                            return 'vendor-router'
                        }
                        // Vendor: Animation libraries
                        if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
                            return 'vendor-motion'
                        }
                        // Vendor: Icons
                        if (
                            id.includes('node_modules/lucide-react') ||
                            id.includes('node_modules/react-icons') ||
                            id.includes('node_modules/@tabler')
                        ) {
                            return 'vendor-icons'
                        }
                        // Vendor: Everything else from node_modules
                        if (id.includes('node_modules')) {
                            return 'vendor-misc'
                        }
                    },

                    // Deterministic filenames for better caching
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
                }
            }
        }
    }
})
