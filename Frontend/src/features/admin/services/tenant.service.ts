import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type TenantSettings = Record<string, unknown> & {
    demoMode?: DemoModeConfig
    googleSheetId?: string
    googleSheetRange?: string
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

// ---- SUPER_ADMIN cross-tenant API (§4.1) -----------------------------------

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL'

export type TenantListRow = {
    id: string
    name: string
    slug: string
    plan: Tenant['plan']
    status: TenantStatus
    brandingLogo: string | null
    brandingColor: string | null
    createdAt: string
    updatedAt: string
    userCount: number
    courseCount: number
}

export type TenantAdminRef = {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
    lastLoginAt: string | null
    createdAt: string
}

export type TenantDetail = Tenant & {
    updatedAt: string
    admin: TenantAdminRef | null
    counts: {
        users: number
        courses: number
        enquiries: number
        tickets: number
    }
}

export const listAllTenants = async (): Promise<TenantListRow[]> => {
    const { data } = await api.get<Envelope<TenantListRow[]>>('/tenants')
    return data.data
}

export const getTenantDetail = async (id: string): Promise<TenantDetail> => {
    const { data } = await api.get<Envelope<TenantDetail>>(`/tenants/${id}`)
    return data.data
}

export const setTenantStatus = async (id: string, status: TenantStatus): Promise<Tenant> => {
    const { data } = await api.patch<Envelope<Tenant>>(`/tenants/${id}/status`, { status })
    return data.data
}

export type CreateTenantPayload = {
    name: string
    slug: string
    plan?: Tenant['plan']
    adminEmail: string
    adminFirstName: string
    adminLastName: string
    adminPassword: string
    brandingLogo?: string
    brandingColor?: string
}

export const createTenant = async (payload: CreateTenantPayload): Promise<{ tenant: Tenant; admin: { id: string; email: string; role: string } }> => {
    const { data } = await api.post<Envelope<{ tenant: Tenant; admin: { id: string; email: string; role: string } }>>('/tenants', payload)
    return data.data
}
