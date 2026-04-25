import { useQuery } from '@tanstack/react-query'
import { Lock, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import { getMyTenant, readDemoConfig } from '@features/admin/services/tenant.service'
import { listMyInvoices } from '@features/payments/services/payment.service'

// Visible to STUDENT users when:
//   1. The tenant has Demo Mode enabled (admin toggle in §6.3 Phase A)
//   2. The student has zero PAID invoices (i.e. hasn't completed any payment)
//   3. The expiry date (if set) hasn't passed
// Disposable per-session — clicking X hides it for the current page view.
export const DemoModeBanner = () => {
    const [dismissed, setDismissed] = useState(false)

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

    if (dismissed) return null
    if (!tenantQuery.data || !invoicesQuery.data) return null

    const config = readDemoConfig(tenantQuery.data)
    if (!config.enabled) return null

    const hasPaid = invoicesQuery.data.some((inv) => inv.status === 'PAID')
    if (hasPaid) return null

    if (config.expiryDate && new Date(config.expiryDate).getTime() < Date.now()) {
        // Expired demo — fall through to the locked-out variant rather than the upgrade CTA.
        return (
            <div
                role="alert"
                className="mb-6 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-5 py-4 flex items-start gap-3">
                <Lock
                    size={18}
                    className="text-[var(--color-danger)] shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-fg">Your demo period has ended</div>
                    <p className="mt-0.5 text-xs text-fg-soft">Upgrade to keep accessing your enrolled courses.</p>
                </div>
                {config.ctaButtonText && config.ctaButtonUrl && (
                    <a href={config.ctaButtonUrl}>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-danger)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                            {config.ctaButtonText} <ArrowRight size={12} />
                        </button>
                    </a>
                )}
            </div>
        )
    }

    const text = config.ctaBannerText || "You're in Demo Mode — upgrade to unlock all courses."
    const buttonText = config.ctaButtonText || 'Upgrade'
    const buttonUrl = config.ctaButtonUrl || '/app/payments'

    return (
        <div
            role="status"
            className="mb-6 rounded-lg border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] px-5 py-4 flex items-start gap-3">
            <Lock
                size={18}
                className="text-[var(--color-brand-700)] shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-fg">Demo Mode</div>
                <p className="mt-0.5 text-xs text-fg-soft">{text}</p>
            </div>
            <a href={buttonUrl}>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-brand-500)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                    {buttonText} <ArrowRight size={12} />
                </button>
            </a>
            <button
                type="button"
                aria-label="Dismiss banner"
                onClick={() => setDismissed(true)}
                className="rounded p-1 text-fg-muted hover:bg-surface-hover hover:text-fg shrink-0">
                <X size={14} />
            </button>
        </div>
    )
}
