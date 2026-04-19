import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: (count, err: unknown) => {
                // Don't retry on 4xx — user error, won't resolve itself.
                const status = (err as { response?: { status?: number } })?.response?.status
                if (status && status >= 400 && status < 500) return false
                return count < 2
            },
            refetchOnWindowFocus: false
        },
        mutations: {
            retry: 0
        }
    }
})
