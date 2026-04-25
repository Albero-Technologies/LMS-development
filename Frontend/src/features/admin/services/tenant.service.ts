import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type TenantSettings = Record<string, unknown> & {
    demoMode?: DemoModeConfig
}

export type DemoModeConfig = {
    enabled: boolean
    expiryDate?: string | null
    ctaBannerText?: string
    ctaButtonText?: string
    ctaButtonUrl?: string
    hiddenSections?: string[]
}

export type Tenant = {
    id: string
    name: string
    slug: string
    plan: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE'
    status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL'
    brandingLogo: string | null
    brandingColor: string | null
    settings: TenantSettings | null
    createdAt: string
}

export type UpdateTenantPayload = {
    name?: string
    brandingLogo?: string | null
    brandingColor?: string | null
    settings?: TenantSettings
}

export const getMyTenant = async (): Promise<Tenant> => {
    const { data } = await api.get<Envelope<Tenant>>('/tenants/me')
    return data.data
}

export const updateMyTenant = async (payload: UpdateTenantPayload): Promise<Tenant> => {
    const { data } = await api.patch<Envelope<Tenant>>('/tenants/me', payload)
    return data.data
}

// Read demoMode out of the settings JSON, with sensible defaults so the UI is always backed.
export const readDemoConfig = (tenant: Tenant | undefined): DemoModeConfig => {
    const cfg = tenant?.settings?.demoMode
    return {
        enabled: cfg?.enabled ?? false,
        expiryDate: cfg?.expiryDate ?? null,
        ctaBannerText: cfg?.ctaBannerText ?? '',
        ctaButtonText: cfg?.ctaButtonText ?? 'Upgrade',
        ctaButtonUrl: cfg?.ctaButtonUrl ?? '',
        hiddenSections: cfg?.hiddenSections ?? []
    }
}

export const writeDemoConfig = async (tenant: Tenant, next: DemoModeConfig): Promise<Tenant> => {
    const settings: TenantSettings = { ...(tenant.settings ?? {}), demoMode: next }
    return updateMyTenant({ settings })
}
