import { useQuery } from '@tanstack/react-query'
import { getMyTenant, readDemoConfig } from '@features/admin/services/tenant.service'
import { listMyInvoices } from '@features/payments/services/payment.service'

// Aggregated demo-mode flags for the active student. Pulls the tenant config
// (admin-managed in §6.3 Phase A) plus the user's invoices to determine
// whether they're a paying or demo learner.
export const useDemoState = () => {
    const tenantQuery = useQuery({
        queryKey: ['tenant', 'me'],
        queryFn: getMyTenant,
        staleTime: 5 * 60_000
    })
    const invoicesQuery = useQuery({
        queryKey: ['payments', 'invoices'],
        queryFn: listMyInvoices,
        staleTime: 60_000
    })

    if (!tenantQuery.data || !invoicesQuery.data) {
        return { loading: true as const }
    }

    const config = readDemoConfig(tenantQuery.data)
    const hasPaid = invoicesQuery.data.some((inv) => inv.status === 'PAID')
    const expired = config.expiryDate ? new Date(config.expiryDate).getTime() < Date.now() : false
    const inDemoMode = config.enabled && !hasPaid

    return {
        loading: false as const,
        inDemoMode,
        expired,
        config,
        // Sections an admin chose to hide for demo learners.
        isHidden: (sectionKey: string) => inDemoMode && (config.hiddenSections ?? []).includes(sectionKey)
    }
}
