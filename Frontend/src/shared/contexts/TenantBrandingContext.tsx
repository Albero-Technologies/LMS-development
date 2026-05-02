import { createContext, useEffect, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { getPublicTenantBySlug, type PublicTenantBrand } from '@features/admin/services/tenant.service'
import { BoxLoader } from '@shared/components/BoxLoader'
import { Empty } from '@shared/components/ui/Empty'
import { ScrollToTop } from '@shared/components/ScrollToTop'
import { FloatingActions } from '@features/marketing/components/FloatingActions'
import { applyBrandPalette, deriveBrandPalette } from '@shared/helpers/brandPalette'

// Multi-tenant routing scaffold (§3). The slug-prefixed public surfaces
// (`/t/:slug/...`) wrap their children in this provider. It:
//  - resolves the tenant by slug via the public endpoint (no auth)
//  - paints brandingColor onto the `--color-brand-*` CSS variables for the
//    duration of the subtree, so any UI inside automatically picks up the
//    tenant's brand color without needing per-component awareness
//  - shows a loader while resolving and a 404 if the tenant is unknown
//
// Authenticated app surfaces (`/app/*`) intentionally don't use this — they
// derive tenant from the JWT instead. Mixing the two would create a path where
// the URL claims one tenant and the JWT claims another.

export interface TenantBrandingValue {
    tenant: PublicTenantBrand
}

// eslint-disable-next-line react-refresh/only-export-components
export const TenantBrandingCtx = createContext<TenantBrandingValue | null>(null)

interface Props {
    children: ReactNode
}

export const TenantBrandingProvider = ({ children }: Props) => {
    const { slug = '' } = useParams<{ slug: string }>()
    const query = useQuery({
        queryKey: ['public', 'tenant', slug],
        queryFn: () => getPublicTenantBySlug(slug),
        enabled: slug.length > 0,
        staleTime: 5 * 60_000,
        retry: false
    })

    const color = query.data?.brandingColor

    // Apply the full tenant palette (brand-50 through brand-900) for the page
    // lifetime. Restoring on unmount prevents the color from sticking when
    // the user navigates back to a non-tenant page.
    useEffect(() => {
        if (!color) return
        return applyBrandPalette(deriveBrandPalette(color))
    }, [color])

    if (query.isLoading)
        return (
            <BoxLoader
                fullscreen
                size="lg"
            />
        )

    if (query.isError || !query.data) {
        return (
            <div className="min-h-screen grid place-items-center p-6">
                <Empty
                    icon={<Building2 size={32} />}
                    title="School not found"
                    description={`We couldn't find a school at /${slug}. Check the URL with your administrator.`}
                />
            </div>
        )
    }

    // ScrollToTop runs on every pathname change (back to viewport top), and
    // FloatingActions renders the back-to-top + WhatsApp buttons on every
    // tenant page so we don't need to repeat them in TenantLandingPage,
    // EnquiryPage, etc.
    const tenantData = query.data
    const landing = tenantData.landing as { floatingActions?: import('@features/admin/services/tenant.service').FloatingActionsConfig; analytics?: { whatsappNumber?: string; whatsappMessage?: string } } | null
    return (
        <TenantBrandingCtx.Provider value={{ tenant: tenantData }}>
            <ScrollToTop />
            {children}
            <FloatingActions
                config={landing?.floatingActions}
                analyticsWhatsappNumber={landing?.analytics?.whatsappNumber}
                analyticsWhatsappMessage={landing?.analytics?.whatsappMessage}
            />
        </TenantBrandingCtx.Provider>
    )
}
