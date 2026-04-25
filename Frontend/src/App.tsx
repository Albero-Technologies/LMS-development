import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { router } from './router'
import { queryClient } from '@shared/libs/queryClient'
import { PwaInstallPrompt } from '@shared/components/PwaInstallPrompt'

const App = () => (
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
            position="top-right"
            richColors
            closeButton
            theme="system"
        />
        <PwaInstallPrompt />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
)

export default App
