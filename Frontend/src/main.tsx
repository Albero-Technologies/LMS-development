import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@shared/assets/styles/index.css'
import App from './App.tsx'

import * as Sentry from '@sentry/react'

Sentry.init({
    dsn: 'https://ab398538822638b1c526bec4f3d0513a@o4509773786578944.ingest.us.sentry.io/4509774183727104',
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    enabled: import.meta.env.VITE_ENV === 'production',
    sendDefaultPii: true
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
