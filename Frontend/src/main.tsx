import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { registerSW } from 'virtual:pwa-register'
import '@shared/assets/styles/index.css'
import App from './App'

// ---- Sentry: production-only. In dev/test we stay silent. -------------------
if (import.meta.env.VITE_ENV === 'production' && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN as string,
        environment: import.meta.env.VITE_ENV,
        sendDefaultPii: false,
        tracesSampleRate: 0.1
    })
}

// ---- Service worker: auto-update. Prompts the user on next page. -----------
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
