import { useContext } from 'react'
import { TenantBrandingCtx, type TenantBrandingValue } from './TenantBrandingContext'

// Hook lives in its own file so the provider module only exports the React
// component (keeps fast-refresh happy under react-refresh/only-export-components).
export const useTenantBranding = (): TenantBrandingValue => {
    const v = useContext(TenantBrandingCtx)
    if (!v) throw new Error('useTenantBranding must be used inside <TenantBrandingProvider>')
    return v
}
