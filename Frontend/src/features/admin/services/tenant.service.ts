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

// Public-safe tenant brand info, used by the slug-prefixed landing page (§9.1).
// Does NOT include settings/plan/status — but `landing` (the landing page
// content edited via the Website Editor) IS surfaced because that's exactly
// what the public page renders.
export type PublicTenantBrand = {
    id: string
    name: string
    slug: string
    brandingLogo: string | null
    brandingColor: string | null
    landing: LandingContent | null
}

export const getPublicTenantBySlug = async (slug: string): Promise<PublicTenantBrand> => {
    const { data } = await api.get<Envelope<PublicTenantBrand>>(`/tenants/by-slug/${encodeURIComponent(slug)}`)
    return data.data
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

// SUPER_ADMIN — update any tenant's branding + settings (Phase B sub-tabs).
export const updateTenantById = async (id: string, payload: UpdateTenantPayload): Promise<Tenant> => {
    const { data } = await api.patch<Envelope<Tenant>>(`/tenants/${id}`, payload)
    return data.data
}

// SUPER_ADMIN — send a billing reminder (§4.2). Sends email + in-app notification
// + records the action as a Note on the tenant.
export type BillingReminderPayload = {
    amount?: number
    currency?: string
    dueDate?: string
    planLabel?: string
    note?: string
}

export const sendBillingReminder = async (id: string, payload: BillingReminderPayload): Promise<{ sentTo: string; queued: boolean }> => {
    const { data } = await api.post<Envelope<{ sentTo: string; queued: boolean }>>(`/tenants/${id}/reminders`, payload)
    return data.data
}

// ---- Tenant SaaS payments (§4.4 + §10.2) -----------------------------------

export type TenantPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'

export type TenantPayment = {
    id: string
    tenantId: string
    amount: number // paise
    currency: string
    planLabel: string | null
    periodStart: string | null
    periodEnd: string | null
    description: string | null
    status: TenantPaymentStatus
    gateway: 'RAZORPAY' | 'STRIPE' | null
    gatewayOrderId: string | null
    gatewayPaymentId: string | null
    createdById: string | null
    paidAt: string | null
    createdAt: string
    updatedAt: string
}

export type CreateTenantPaymentPayload = {
    amount: number // paise
    currency?: string
    planLabel?: string
    periodStart?: string
    periodEnd?: string
    description?: string
}

export const listTenantPayments = async (tenantId: string): Promise<TenantPayment[]> => {
    const { data } = await api.get<Envelope<TenantPayment[]>>(`/tenants/${tenantId}/payments`)
    return data.data
}

export const createTenantPayment = async (tenantId: string, payload: CreateTenantPaymentPayload): Promise<TenantPayment> => {
    const { data } = await api.post<Envelope<TenantPayment>>(`/tenants/${tenantId}/payments`, payload)
    return data.data
}

export const setTenantPaymentStatus = async (tenantId: string, paymentId: string, status: TenantPaymentStatus): Promise<TenantPayment> => {
    const { data } = await api.patch<Envelope<TenantPayment>>(`/tenants/${tenantId}/payments/${paymentId}/status`, { status })
    return data.data
}

// Tenant ADMIN-side billing (§10.2). Lists their own SaaS invoices, creates a
// Razorpay order for one, and verifies the handshake after checkout success.
export type TenantPaymentOrder = {
    paymentId: string
    order: { id: string; amount: number; currency: string; keyId?: string }
}

export const listMyTenantPayments = async (): Promise<TenantPayment[]> => {
    const { data } = await api.get<Envelope<TenantPayment[]>>('/tenants/me/payments')
    return data.data
}

export const payMyTenantPayment = async (paymentId: string): Promise<TenantPaymentOrder> => {
    const { data } = await api.post<Envelope<TenantPaymentOrder>>(`/tenants/me/payments/${paymentId}/pay`)
    return data.data
}

export const verifyMyTenantPayment = async (
    paymentId: string,
    payload: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
): Promise<TenantPayment> => {
    const { data } = await api.post<Envelope<TenantPayment>>(`/tenants/me/payments/${paymentId}/verify`, payload)
    return data.data
}

// Billing plan settings live in tenant.settings.billing — separate from the
// Plan column on the tenant row (which is more like a tier name).
export type BillingPlan = {
    cycle?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    amount?: number
    currency?: string
    nextDueDate?: string | null
    notes?: string
}

export const readBillingPlan = (tenant: { settings: TenantSettings | null } | undefined): BillingPlan => {
    const b = tenant?.settings?.billing as BillingPlan | undefined
    return {
        cycle: b?.cycle ?? 'monthly',
        amount: b?.amount,
        currency: b?.currency ?? 'INR',
        nextDueDate: b?.nextDueDate ?? null,
        notes: b?.notes ?? ''
    }
}

// ---- Per-tenant contacts + notes (settings sub-keys) -----------------------

export type TenantContacts = {
    primaryEmail?: string
    primaryPhone?: string
    secondaryEmail?: string
    secondaryPhone?: string
}

export type TenantNote = {
    id: string
    body: string
    createdAt: string
    createdBy?: { id: string; name: string }
}

export const readContacts = (tenant: { settings: TenantSettings | null } | undefined): TenantContacts => {
    const c = tenant?.settings?.contacts as TenantContacts | undefined
    return {
        primaryEmail: c?.primaryEmail ?? '',
        primaryPhone: c?.primaryPhone ?? '',
        secondaryEmail: c?.secondaryEmail ?? '',
        secondaryPhone: c?.secondaryPhone ?? ''
    }
}

export const readNotes = (tenant: { settings: TenantSettings | null } | undefined): TenantNote[] => {
    const arr = tenant?.settings?.notes
    return Array.isArray(arr) ? (arr as TenantNote[]) : []
}

// ---- Feature flags (settings sub-key) --------------------------------------

// Per-tenant feature toggles. Keys are stable identifiers; the UI metadata
// (label, description, default) lives below. Adding a new flag is two lines:
// add to FEATURE_FLAGS and any backend gate consumes it via tenant.settings.features.
export type FeatureFlagKey =
    | 'coleadPipeline'
    | 'demoControl'
    | 'notifications'
    | 'tickets'
    | 'googleSheetsSync'
    | 'razorpay'
    | 'websockets'
    | 'auditLogs'
    | 'counsellorTargets'

export type FeatureFlags = Partial<Record<FeatureFlagKey, boolean>>

export type FeatureFlagDef = {
    key: FeatureFlagKey
    label: string
    description: string
    default: boolean
}

// Catalog — keep in sync with backend gates as enforcement gets wired in.
export const FEATURE_FLAGS: readonly FeatureFlagDef[] = [
    {
        key: 'coleadPipeline',
        label: 'Co-lead pipeline',
        description: 'Counsellors can hand off leads to teammates mid-funnel; managers see combined attribution.',
        default: true
    },
    {
        key: 'demoControl',
        label: 'Demo Mode controls',
        description: "Lets the tenant's admin gate content for unpaid learners and surface the upgrade CTA.",
        default: true
    },
    {
        key: 'notifications',
        label: 'In-app notifications',
        description: 'Bell drawer + notifications page. Disable to suppress all in-app alerts for this tenant.',
        default: true
    },
    {
        key: 'tickets',
        label: 'Support tickets',
        description: 'Tenant users can open and reply to tickets via the Support page.',
        default: true
    },
    {
        key: 'googleSheetsSync',
        label: 'Google Sheets enquiry sync',
        description: 'New enquiries are pushed to the configured Google Sheet (Integrations tab on tenant admin side).',
        default: true
    },
    {
        key: 'razorpay',
        label: 'Razorpay checkout',
        description: 'Students can pay course fees via Razorpay. Requires the tenant to have valid keys configured.',
        default: true
    },
    {
        key: 'websockets',
        label: 'Real-time push (WebSocket)',
        description: 'Live updates for notifications + tickets without page refresh. Falls back to polling if disabled.',
        default: true
    },
    {
        key: 'auditLogs',
        label: 'Audit logs',
        description: 'Tenant ADMIN can see the activity log for their tenant.',
        default: true
    },
    {
        key: 'counsellorTargets',
        label: 'Counsellor monthly targets',
        description: 'Managers can set per-counsellor monthly signup/enrolment/revenue targets.',
        default: true
    }
]

// ---- Per-tenant landing content (settings.landing) ------------------------
//
// What the per-tenant public landing page (`/t/:slug`) renders. SAs edit this
// in the Website Editor (§11). Pillar/CTA copy is intentionally simple — a
// fuller drag-and-drop section model would land in a follow-up.
export type LandingPillar = {
    title: string
    description: string
}

export type LandingContent = {
    heroTag?: string
    heroTitle?: string
    heroSubtitle?: string
    primaryCtaLabel?: string
    pillars?: LandingPillar[]
    ctaTitle?: string
    ctaSubtitle?: string
    ctaButtonLabel?: string
    showPricingPage?: boolean
}

export const readLandingContent = (tenant: { settings: TenantSettings | null } | undefined): LandingContent => {
    const l = tenant?.settings?.landing as LandingContent | undefined
    return {
        heroTag: l?.heroTag ?? 'Now enrolling',
        heroTitle: l?.heroTitle ?? '',
        heroSubtitle: l?.heroSubtitle ?? 'Mentor-led cohorts, hands-on projects, and 1:1 counselling — designed to take you from curious to confident.',
        primaryCtaLabel: l?.primaryCtaLabel ?? 'Talk to a counsellor',
        pillars: l?.pillars && l.pillars.length > 0 ? l.pillars : DEFAULT_PILLARS,
        ctaTitle: l?.ctaTitle ?? 'Ready to start?',
        ctaSubtitle: l?.ctaSubtitle ?? "Tell us what you're looking for and a counsellor will reach out within a working day.",
        ctaButtonLabel: l?.ctaButtonLabel ?? 'Start enquiry',
        showPricingPage: l?.showPricingPage ?? false
    }
}

const DEFAULT_PILLARS: LandingPillar[] = [
    { title: 'Live cohorts', description: 'Small batches, real mentors, weekly office hours.' },
    { title: '1:1 counselling', description: 'Talk to an admissions counsellor before you commit.' },
    { title: 'Industry projects', description: "Ship real work — not toy assignments — to your portfolio." }
]

// ---- Per-tenant credentials (settings.environment) -------------------------
//
// What's stored here: tenant-specific keys for email / payments / sheets /
// social. Stored as plaintext JSON for now; in a follow-up these get encrypted
// at rest with a KMS-managed key. The shape is open-ended so adding a new
// integration doesn't require a migration.
export type TenantEnvironment = {
    smtp?: {
        host?: string
        port?: number
        user?: string
        password?: string
        from?: string
        secure?: boolean
    }
    razorpay?: {
        keyId?: string
        keySecret?: string
        webhookSecret?: string
    }
    googleSheets?: {
        // The service-account JSON pasted in by the tenant. Stored verbatim;
        // the backend parses it on each push.
        serviceAccountJson?: string
    }
}

export const readEnvironment = (tenant: { settings: TenantSettings | null } | undefined): TenantEnvironment => {
    const env = tenant?.settings?.environment
    if (!env || typeof env !== 'object') return {}
    return env as TenantEnvironment
}

export const readFeatureFlags = (tenant: { settings: TenantSettings | null } | undefined): FeatureFlags => {
    const f = tenant?.settings?.features
    if (!f || typeof f !== 'object') return {}
    return f as FeatureFlags
}

// Resolve a flag with the catalog default when the tenant hasn't set one yet.
export const isFeatureEnabled = (flags: FeatureFlags, key: FeatureFlagKey): boolean => {
    const explicit = flags[key]
    if (typeof explicit === 'boolean') return explicit
    return FEATURE_FLAGS.find((f) => f.key === key)?.default ?? true
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
