/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
    readonly VITE_ENV: 'development' | 'test' | 'production' | 'staging'
    readonly VITE_SENTRY_DSN?: string
    readonly BACKEND_PROXY?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
