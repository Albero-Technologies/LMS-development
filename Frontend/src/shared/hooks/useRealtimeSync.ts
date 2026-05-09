import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@shared/stores/authStore'
import { disconnectSocket, ensureSocket, onSocketEvent } from '@shared/libs/socket'

// Mounts once at the AppLayout level. Connects the socket as soon as we have
// an auth token, then invalidates the relevant TanStack Query keys whenever
// the backend pushes an event.
//
// Currently wired:
//   notifications:new   → invalidate ['notifications']
//   tickets:updated     → invalidate ['tickets']
//   payments:updated    → invalidate ['payments', 'invoices', 'admin-invoices',
//                          'students-monitor', 'dashboard'] so the Payments
//                          page totals + Sales Funnel + admin dashboards
//                          refresh in near-real-time after any Razorpay
//                          webhook (captured / failed / refund / SaaS).
//
// New event types should add a key here AND emit from the backend service.
export const useRealtimeSync = (): void => {
    const accessToken = useAuthStore((s) => s.accessToken)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!accessToken) {
            disconnectSocket()
            return
        }
        ensureSocket()

        const unsubNotifications = onSocketEvent('notifications:new', () => {
            void queryClient.invalidateQueries({ queryKey: ['notifications'] })
        })

        const unsubTickets = onSocketEvent('tickets:updated', (payload: unknown) => {
            const p = payload as { id?: string } | undefined
            void queryClient.invalidateQueries({ queryKey: ['tickets'] })
            if (p?.id) void queryClient.invalidateQueries({ queryKey: ['tickets', p.id] })
        })

        const unsubPayments = onSocketEvent('payments:updated', () => {
            void queryClient.invalidateQueries({ queryKey: ['payments'] })
            void queryClient.invalidateQueries({ queryKey: ['admin-invoices'] })
            void queryClient.invalidateQueries({ queryKey: ['invoices'] })
            void queryClient.invalidateQueries({ queryKey: ['students-monitor'] })
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
            // Counsellor pipeline marks leads converted on capture.
            void queryClient.invalidateQueries({ queryKey: ['leads'] })
        })

        return () => {
            unsubNotifications()
            unsubTickets()
            unsubPayments()
        }
    }, [accessToken, queryClient])
}
