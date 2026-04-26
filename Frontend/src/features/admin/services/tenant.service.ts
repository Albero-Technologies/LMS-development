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

// SUPER_ADMIN Client Payments rollup (§4.4). One row per tenant.
export type ClientPaymentSummary = {
    id: string
    name: string
    slug: string
    outstanding: number // paise
    overdueCount: number
    pendingCount: number
    lastPaidAt: string | null
    contactEmail: string | null
    contactPhone: string | null
}

export const listClientPaymentsSummary = async (): Promise<ClientPaymentSummary[]> => {
    const { data } = await api.get<Envelope<ClientPaymentSummary[]>>('/tenants/payments/summary')
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

// ---- Per-tenant UTM links (settings.utmLinks) -----------------------------
//
// Stored in tenant.settings.utmLinks so the SA can manage campaign URLs per
// tenant without a dedicated table. Click counts are local-only for now;
// real attribution would land alongside a `/r/:id` redirect endpoint.
export type UtmLink = {
    id: string
    label: string
    destination: string
    source: string
    medium: string
    campaign: string
    term?: string
    content?: string
    fullUrl: string
    createdAt: string
    clickCount?: number
}

export const readUtmLinks = (tenant: { settings: TenantSettings | null } | undefined): UtmLink[] => {
    const arr = tenant?.settings?.utmLinks
    return Array.isArray(arr) ? (arr as UtmLink[]) : []
}

// ---- Per-tenant SEO (settings.seo) ----------------------------------------
//
// What the per-tenant public pages render in <head>. Edited via the SEO
// Builder (§4.1). Stored verbatim in tenant.settings.seo so the public landing
// can pull it in one round-trip alongside branding/landing.
export type TenantSeo = {
    metaTitle?: string
    metaDescription?: string
    canonicalUrl?: string
    ogImageUrl?: string
    faviconUrl?: string
    robots?: string
    keywords?: string[]
}

export const readTenantSeo = (tenant: { settings: TenantSettings | null } | undefined): TenantSeo => {
    const s = tenant?.settings?.seo as TenantSeo | undefined
    return {
        metaTitle: s?.metaTitle ?? '',
        metaDescription: s?.metaDescription ?? '',
        canonicalUrl: s?.canonicalUrl ?? '',
        ogImageUrl: s?.ogImageUrl ?? '',
        faviconUrl: s?.faviconUrl ?? '',
        robots: s?.robots ?? 'index, follow',
        keywords: s?.keywords ?? []
    }
}

// ---- Per-tenant landing content (settings.landing) ------------------------
//
// WordPress-style block model (§11). The landing page is a typed, ordered
// array of sections. Each section has a `type` (which variant template to
// render), a `variant` (visual style within that type), and a `data` blob
// shaped for that type. The Website Editor lets SAs reorder sections, swap
// variants, and edit per-section copy. The TenantLandingPage renders sections
// in order.
//
// Adding a new section type is three places:
//   1. Add the type to SectionData below
//   2. Add the template to LANDING_TEMPLATES
//   3. Add the renderer in TenantLandingPage's section switch
export type LandingPillar = {
    title: string
    description: string
}

export type HeroSectionData = {
    eyebrow?: string
    title?: string
    subtitle?: string
    primaryCtaLabel?: string
    primaryCtaLink?: string
}

export type FeaturesSectionData = {
    title?: string
    pillars?: LandingPillar[]
}

export type CtaSectionData = {
    title?: string
    subtitle?: string
    buttonLabel?: string
    buttonLink?: string
}

export type CalloutSectionData = {
    title?: string
    body?: string
}

export type ImageSectionData = {
    src?: string
    alt?: string
    caption?: string
    rounded?: boolean
}

// Custom HTML embeds — rendered inside a sandboxed iframe so injected
// scripts can't access the parent document. Useful for YouTube/Vimeo embeds,
// Calendly widgets, etc.
export type EmbedSectionData = {
    html?: string
    height?: number // px, default 480
    title?: string
}

// Collection-list section — pulls published items from a CMS collection by
// slug. titleField / summaryField / imageField pick which schema fields the
// renderer surfaces for each card. limit caps the rendered count.
export type CollectionListSectionData = {
    collectionSlug?: string
    title?: string
    titleField?: string
    summaryField?: string
    imageField?: string
    limit?: number
}

// Per-section style overrides — applied via inline CSS at render time.
// Layout knobs (background / text-color / alignment / max-width / padding) +
// typography knobs (font family, size, weight, line-height, letter-spacing).
//
// Headings vs body are kept on the same SectionStyle but applied separately
// at render time (h1/h2 cascade for headings, .body class for paragraphs).
// Font families are picked from a curated list — letting users type any
// font-family CSS string would silently break when the font isn't installed.
export type FontFamilyToken = 'inter' | 'sans' | 'serif' | 'mono' | 'display'
export type FontWeightToken = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
export type FontSizeToken = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'

export type Typography = {
    fontFamily?: FontFamilyToken
    fontSize?: FontSizeToken
    fontWeight?: FontWeightToken
    lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose'
    letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider'
}

// Scroll-in animation tokens — runtime triggers on first viewport entry via
// IntersectionObserver. `delay` is in milliseconds; the renderer respects
// `prefers-reduced-motion` automatically (skipped entirely in that case).
export type AnimationToken = 'none' | 'fadeIn' | 'fadeUp' | 'fadeDown' | 'slideLeft' | 'slideRight' | 'zoomIn'

export type SectionStyle = {
    background?: string
    textColor?: string
    paddingY?: 'sm' | 'md' | 'lg' | 'xl'
    align?: 'left' | 'center' | 'right'
    maxWidth?: 'narrow' | 'normal' | 'wide' | 'full'
    headingType?: Typography
    bodyType?: Typography
    animation?: AnimationToken
    animationDelay?: number // ms
    animationDuration?: number // ms, default 700
    // Reference to a named StyleClass (landing.styleClasses). Class fields are
    // applied first, then per-section overrides on this style win.
    styleClassId?: string
}

// Reusable named style — Webflow-style classes. Tenants define a class once
// (e.g. "Heading 1", "Body L") and apply it to many sections; updating the
// class then updates every section that references it. Per-section overrides
// always trump class values, so a class is a default not a hard rule.
//
// Same shape as SectionStyle minus animation/styleClassId so a class is a
// pure visual preset, not an animation or a self-reference.
export type StyleClass = {
    id: string
    name: string
    background?: string
    textColor?: string
    paddingY?: SectionStyle['paddingY']
    align?: SectionStyle['align']
    maxWidth?: SectionStyle['maxWidth']
    headingType?: Typography
    bodyType?: Typography
}

export type LandingSection =
    | { id: string; type: 'hero'; variant: 'split' | 'centered' | 'gradient'; data: HeroSectionData; style?: SectionStyle }
    | { id: string; type: 'features'; variant: 'three-up' | 'four-up' | 'list'; data: FeaturesSectionData; style?: SectionStyle }
    | { id: string; type: 'cta'; variant: 'banner' | 'card'; data: CtaSectionData; style?: SectionStyle }
    | { id: string; type: 'callout'; variant: 'info' | 'success'; data: CalloutSectionData; style?: SectionStyle }
    | { id: string; type: 'image'; variant: 'full' | 'contained'; data: ImageSectionData; style?: SectionStyle }
    | { id: string; type: 'embed'; variant: 'iframe'; data: EmbedSectionData; style?: SectionStyle }
    | {
          id: string
          type: 'collectionList'
          variant: 'cards' | 'list'
          data: CollectionListSectionData
          style?: SectionStyle
      }

// Per-page metadata (slug, title, SEO). The home page is identified by
// `isHome: true`; missing or zero pages falls back to legacy `sections`.
//
// `detailTemplate.collectionSlug`, when set, marks this page as the renderer
// for items in that collection. Visiting /t/:slug/:collectionSlug/:itemSlug
// finds the page, fetches the matching item, and substitutes `{{field.key}}`
// placeholders in the section content. Useful for blog posts, case studies,
// press releases, etc. — one template, many items.
export type LandingPage = {
    id: string
    slug: string // '/' for home; otherwise '/about', '/blog/post', etc.
    name: string
    isHome?: boolean
    sections: LandingSection[]
    detailTemplate?: {
        collectionSlug?: string
    }
    seo?: {
        title?: string
        description?: string
        ogImageUrl?: string
    }
}

// One link in a navbar or footer. Target is one of:
//   - `pageId`  → an internal page from `landing.pages`
//   - `url`     → external absolute URL
// Marketing UI lets SAs add/remove/reorder these without touching code.
export type NavLink = {
    id: string
    label: string
    pageId?: string
    url?: string
    newTab?: boolean
}

// Top-of-page navbar config. Three layouts; logo + sign-in default on.
//
// `mobileVariant` controls how the hamburger menu opens on viewports below md:
//   sheet         → full-width drop-down sheet from below the header (default)
//   drawer-right  → slide-in panel from the right edge, 80vw wide
//   fullscreen    → fullscreen overlay with centered links, big tap targets
export type MobileNavVariant = 'sheet' | 'drawer-right' | 'fullscreen'

export type NavbarConfig = {
    variant: 'simple' | 'centered' | 'with-cta'
    mobileVariant?: MobileNavVariant
    showLogo?: boolean
    showSignIn?: boolean
    signInLabel?: string
    ctaLabel?: string
    ctaPageId?: string
    ctaUrl?: string
    links: NavLink[]
}

export type FooterColumn = { id: string; title: string; links: NavLink[] }

// Footer config. Three layouts: simple (one row), columns (multi-column),
// minimal (single line).
export type FooterConfig = {
    variant: 'simple' | 'columns' | 'minimal'
    tagline?: string
    copyright?: string
    showSocial?: boolean
    social?: { github?: string; twitter?: string; linkedin?: string; instagram?: string; youtube?: string }
    links?: NavLink[]
    columns?: FooterColumn[]
}

// Site-wide identity overrides. Sit on `landing.site` so the renderer can
// apply them once at the page boundary.
export type SiteIdentity = {
    title?: string
    faviconUrl?: string
    ogImageUrl?: string
}

export type LandingContent = {
    sections?: LandingSection[]
    pages?: LandingPage[]
    site?: SiteIdentity
    navbar?: NavbarConfig
    footer?: FooterConfig
    styleClasses?: StyleClass[]
    // Legacy single-block fields (kept so historical tenants render). New
    // tenants persist exclusively into `sections` (or `pages` once they
    // upgrade past one-page sites).
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

// Template catalog — each entry is "an empty block of this type/variant".
// The Editor presents these in the Add Section picker and instantiates one
// when the SA clicks. ID is generated on insert so duplicate templates work.
export type LandingTemplate = {
    label: string
    description: string
    section: Omit<LandingSection, 'id'>
}

export const LANDING_TEMPLATES: LandingTemplate[] = [
    {
        label: 'Hero · Split',
        description: 'Headline + sub on the left, image card on the right.',
        section: {
            type: 'hero',
            variant: 'split',
            data: {
                eyebrow: 'Now enrolling',
                title: 'Master new skills with mentor-led cohorts',
                subtitle: 'Live classes, hands-on projects, and 1:1 counselling.',
                primaryCtaLabel: 'Talk to a counsellor',
                primaryCtaLink: 'enquiry'
            }
        }
    },
    {
        label: 'Hero · Centered',
        description: 'Big centered headline with two CTAs underneath.',
        section: {
            type: 'hero',
            variant: 'centered',
            data: {
                eyebrow: 'Welcome',
                title: 'Learn at your pace.',
                subtitle: 'Industry-grade curriculum delivered live.',
                primaryCtaLabel: 'Start enquiry',
                primaryCtaLink: 'enquiry'
            }
        }
    },
    {
        label: 'Hero · Gradient',
        description: 'Brand-color gradient banner with white text.',
        section: {
            type: 'hero',
            variant: 'gradient',
            data: {
                eyebrow: 'Bestseller',
                title: 'Become a full-stack engineer in 12 weeks',
                subtitle: 'Project-based, mentor-led, placement-assisted.',
                primaryCtaLabel: 'Apply now',
                primaryCtaLink: 'enquiry'
            }
        }
    },
    {
        label: 'Features · 3-up cards',
        description: 'Three side-by-side feature cards.',
        section: {
            type: 'features',
            variant: 'three-up',
            data: {
                title: 'Why students pick us',
                pillars: [
                    { title: 'Live cohorts', description: 'Small batches, real mentors, weekly office hours.' },
                    { title: '1:1 counselling', description: 'Talk to an admissions counsellor before you commit.' },
                    { title: 'Industry projects', description: 'Ship real work — not toy assignments.' }
                ]
            }
        }
    },
    {
        label: 'Features · 4-up cards',
        description: 'Four feature cards in a 2×2 (or 4-wide on desktop).',
        section: {
            type: 'features',
            variant: 'four-up',
            data: {
                title: 'What you get',
                pillars: [
                    { title: 'Live mentorship', description: 'Direct access to working professionals.' },
                    { title: 'Hands-on labs', description: 'Code from day one, no theory dumps.' },
                    { title: 'Placement help', description: 'Resume reviews, mock interviews, referrals.' },
                    { title: 'Lifetime access', description: 'Recordings + community for as long as you need.' }
                ]
            }
        }
    },
    {
        label: 'Features · Vertical list',
        description: 'Short bullet list. Good for trust badges.',
        section: {
            type: 'features',
            variant: 'list',
            data: {
                title: 'Quick highlights',
                pillars: [
                    { title: 'Verified certificates', description: 'NSDC + tenant co-branded.' },
                    { title: 'EMI options', description: 'No-cost EMI on most major banks.' },
                    { title: 'Lifetime support', description: 'Career help even after you graduate.' }
                ]
            }
        }
    },
    {
        label: 'CTA · Brand banner',
        description: 'Full-width brand-color banner with a single button.',
        section: {
            type: 'cta',
            variant: 'banner',
            data: {
                title: 'Ready to start?',
                subtitle: 'Book a free 15-min counselling call to design your roadmap.',
                buttonLabel: 'Talk to a counsellor',
                buttonLink: 'enquiry'
            }
        }
    },
    {
        label: 'CTA · Card',
        description: 'Inset card with quieter styling.',
        section: {
            type: 'cta',
            variant: 'card',
            data: {
                title: 'Have questions?',
                subtitle: 'Our team responds within one working day.',
                buttonLabel: 'Get in touch',
                buttonLink: 'enquiry'
            }
        }
    },
    {
        label: 'Callout · Info',
        description: 'Soft notice strip — good for "Limited seats" type lines.',
        section: {
            type: 'callout',
            variant: 'info',
            data: {
                title: 'Limited seats',
                body: 'Each cohort is capped at 25 students for high-touch mentorship.'
            }
        }
    },
    {
        label: 'Callout · Success',
        description: 'Green success-tone strip.',
        section: {
            type: 'callout',
            variant: 'success',
            data: {
                title: 'Now hiring',
                body: 'Top performers from each cohort are referred to our 40+ partner companies.'
            }
        }
    },
    {
        label: 'Image · Contained',
        description: 'Single image, max-width container. Drop in a hero shot or screenshot.',
        section: {
            type: 'image',
            variant: 'contained',
            data: {
                src: '',
                alt: 'Tenant image',
                rounded: true
            }
        }
    },
    {
        label: 'Image · Full bleed',
        description: 'Full-width image, edge-to-edge.',
        section: {
            type: 'image',
            variant: 'full',
            data: {
                src: '',
                alt: 'Tenant image',
                rounded: false
            }
        }
    },
    {
        label: 'Embed · Custom HTML',
        description: 'Drop in a YouTube embed, Calendly widget, or any iframe-compatible snippet.',
        section: {
            type: 'embed',
            variant: 'iframe',
            data: {
                html: '<iframe width="100%" height="480" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>',
                height: 480,
                title: 'Embed'
            }
        }
    },
    {
        label: 'Collection list · Cards',
        description: 'Render published items from a CMS collection as a card grid. Pick the collection in the editor.',
        section: {
            type: 'collectionList',
            variant: 'cards',
            data: {
                title: 'Latest posts',
                titleField: 'title',
                summaryField: 'summary',
                imageField: 'coverImage',
                limit: 6
            }
        }
    },
    {
        label: 'Collection list · Vertical list',
        description: 'Render items as a vertical list. Good for press releases, changelogs, etc.',
        section: {
            type: 'collectionList',
            variant: 'list',
            data: {
                title: 'Press',
                titleField: 'title',
                summaryField: 'summary',
                limit: 10
            }
        }
    },
    {
        label: 'Hero · Cohort starting',
        description: 'Date-led hero — tells visitors when the next batch begins.',
        section: {
            type: 'hero',
            variant: 'split',
            data: {
                eyebrow: 'Cohort 12 · starts March 4',
                title: 'Build a portfolio that gets you hired',
                subtitle: '14-week live cohort with placement support and a refund safety net.',
                primaryCtaLabel: 'Reserve my seat',
                primaryCtaLink: 'enquiry'
            }
        }
    },
    {
        label: 'Features · What you will learn',
        description: 'Curriculum-style 4-up — frame each pillar as a learning outcome.',
        section: {
            type: 'features',
            variant: 'four-up',
            data: {
                title: 'What you will learn',
                pillars: [
                    { title: 'Foundations', description: 'Data structures, algorithms, and system thinking.' },
                    { title: 'Build phase', description: 'Ship three production-grade projects to your portfolio.' },
                    { title: 'Interview prep', description: 'Mock interviews with engineers from FAANG + Indian unicorns.' },
                    { title: 'Placement push', description: 'Direct referrals to our 40+ partner companies.' }
                ]
            }
        }
    },
    {
        label: 'CTA · Book a counselling call',
        description: 'High-intent CTA for prospects ready to talk to admissions.',
        section: {
            type: 'cta',
            variant: 'banner',
            data: {
                title: 'Not sure if this is right for you?',
                subtitle: 'Hop on a free 20-minute counselling call. No pressure, no sales script.',
                buttonLabel: 'Book my call',
                buttonLink: 'enquiry'
            }
        }
    },
    {
        label: 'Callout · Limited-time discount',
        description: 'Urgency banner for an active offer or seasonal scholarship.',
        section: {
            type: 'callout',
            variant: 'info',
            data: {
                title: 'Early-bird scholarship — 30% off',
                body: 'Valid until the cohort fills. First 10 enrolments lock in the lowest fee we will offer this year.'
            }
        }
    },
    {
        label: 'Embed · Calendly booking',
        description: 'Drop-in Calendly inline widget so visitors can self-book a counselling slot.',
        section: {
            type: 'embed',
            variant: 'iframe',
            data: {
                html: '<iframe src="https://calendly.com/your-handle/counselling-call?embed_domain=embed&embed_type=Inline" width="100%" height="700" frameborder="0"></iframe>',
                height: 700,
                title: 'Book a counselling call'
            }
        }
    }
]

export const newSectionId = (): string =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sec_${Math.random().toString(36).slice(2, 10)}`

export const newPageId = (): string =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pg_${Math.random().toString(36).slice(2, 10)}`

export const instantiateTemplate = (t: LandingTemplate): LandingSection => ({ ...t.section, id: newSectionId() } as LandingSection)

export const newLinkId = (): string =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lnk_${Math.random().toString(36).slice(2, 10)}`

// Sensible default navbar — Home + Courses + Enquire links matching the
// public sub-routes. Tenants can edit/replace freely.
export const defaultNavbar = (): NavbarConfig => ({
    variant: 'simple',
    showLogo: true,
    showSignIn: true,
    signInLabel: 'Sign in',
    links: [
        { id: newLinkId(), label: 'Courses', url: 'courses' },
        { id: newLinkId(), label: 'Enquire', url: 'enquiry' }
    ]
})

// Merge a referenced StyleClass into a SectionStyle. Class fields fill in
// where the section-level style hasn't set its own value — per-section
// overrides always win. Returns the original style untouched if no class
// is referenced or the class can't be resolved.
export const resolveSectionStyle = (style: SectionStyle | undefined, classes: StyleClass[] | undefined): SectionStyle | undefined => {
    if (!style?.styleClassId) return style
    const cls = classes?.find((c) => c.id === style.styleClassId)
    if (!cls) return style
    return {
        background: style.background ?? cls.background,
        textColor: style.textColor ?? cls.textColor,
        paddingY: style.paddingY ?? cls.paddingY,
        align: style.align ?? cls.align,
        maxWidth: style.maxWidth ?? cls.maxWidth,
        headingType: { ...(cls.headingType ?? {}), ...(style.headingType ?? {}) },
        bodyType: { ...(cls.bodyType ?? {}), ...(style.bodyType ?? {}) },
        animation: style.animation,
        animationDelay: style.animationDelay,
        animationDuration: style.animationDuration,
        styleClassId: style.styleClassId
    }
}

// Stock starter style classes — surfaced in the editor as "presets" so a
// fresh tenant has something to apply on day one without building their own
// style system first.
export const defaultStyleClasses = (): StyleClass[] => [
    {
        id: newLinkId(),
        name: 'Heading 1',
        headingType: { fontFamily: 'display', fontSize: '5xl', fontWeight: 'bold', lineHeight: 'tight', letterSpacing: 'tight' }
    },
    {
        id: newLinkId(),
        name: 'Subhead',
        headingType: { fontFamily: 'display', fontSize: '2xl', fontWeight: 'semibold', lineHeight: 'snug' }
    },
    {
        id: newLinkId(),
        name: 'Body L',
        bodyType: { fontFamily: 'sans', fontSize: 'lg', fontWeight: 'normal', lineHeight: 'relaxed' }
    },
    {
        id: newLinkId(),
        name: 'Section · Soft tint',
        background: '#f7f9ff',
        paddingY: 'lg'
    }
]

export const defaultFooter = (tenantName: string): FooterConfig => ({
    variant: 'simple',
    tagline: `Mentor-led learning, designed for outcomes.`,
    copyright: `© ${new Date().getFullYear()} ${tenantName}. All rights reserved.`,
    showSocial: false,
    links: [
        { id: newLinkId(), label: 'About', url: 'about' },
        { id: newLinkId(), label: 'Courses', url: 'courses' },
        { id: newLinkId(), label: 'Enquire', url: 'enquiry' }
    ]
})

// Create a new empty page. Slugs are normalised to lowercase with leading
// slash so the renderer can match URLs cleanly.
export const createBlankPage = (name: string, slug: string, isHome = false): LandingPage => {
    const cleanSlug = slug.startsWith('/') ? slug : `/${slug}`
    return {
        id: newPageId(),
        slug: cleanSlug.toLowerCase(),
        name,
        isHome,
        sections: []
    }
}

export const readLandingContent = (tenant: { settings: TenantSettings | null } | undefined): LandingContent => {
    const l = tenant?.settings?.landing as LandingContent | undefined
    return {
        sections: l?.sections && l.sections.length > 0 ? l.sections : undefined,
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

// Default block layout for tenants who haven't customised yet — produces the
// same visual as the legacy hard-coded landing.
export const defaultLandingSections = (tenantName: string): LandingSection[] => [
    {
        id: newSectionId(),
        type: 'hero',
        variant: 'split',
        data: {
            eyebrow: 'Now enrolling',
            title: `Learn with ${tenantName}`,
            subtitle: 'Mentor-led cohorts, hands-on projects, and 1:1 counselling — designed to take you from curious to confident.',
            primaryCtaLabel: 'Talk to a counsellor',
            primaryCtaLink: 'enquiry'
        }
    },
    {
        id: newSectionId(),
        type: 'features',
        variant: 'three-up',
        data: { title: 'Why students pick us', pillars: DEFAULT_PILLARS }
    },
    {
        id: newSectionId(),
        type: 'cta',
        variant: 'banner',
        data: {
            title: 'Ready to start?',
            subtitle: `Tell us what you're looking for and a ${tenantName} counsellor will reach out within a working day.`,
            buttonLabel: 'Start enquiry',
            buttonLink: 'enquiry'
        }
    }
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
