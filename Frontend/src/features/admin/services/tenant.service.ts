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

// Tenant ADMIN submits a plan-change request. Doesn't actually flip the
// plan — that requires SA approval (and an issued invoice). Records the
// request on `tenant.settings.subscription.requestedPlan` and notifies SAs.
export type RequestPlanChangePayload = { targetPlan: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE'; note?: string }
export const requestPlanChangeRequest = async (payload: RequestPlanChangePayload): Promise<{ ok: boolean; currentPlan: string; requestedPlan: string }> => {
    const { data } = await api.post<Envelope<{ ok: boolean; currentPlan: string; requestedPlan: string }>>('/tenants/me/plan-change-request', payload)
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
    // Optional hero illustration / photo. When set, the split variant renders
    // it inside the right-hand card instead of the placeholder badge.
    imageUrl?: string
    imageAlt?: string
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

// Long-form prose section — used for policy / legal pages where the existing
// hero + features blocks would compress the content into something illegible.
// `body` is rendered with `whitespace-pre-line` so newline-separated paragraphs
// keep their structure without needing a full markdown renderer. Variant
// switches between a wide reading column and a narrower legal-document feel.
export type ProseSectionData = {
    eyebrow?: string
    title?: string
    body?: string
}

// Bento-grid section — premium asymmetric layout where each tile can be
// `wide` (2 columns) or normal (1 column). Each tile has a title, body,
// optional accent (color tag), and optional image/icon. Five tiles arranged
// as 2-1-2 (variant=showcase) or 1-2-2 (variant=spotlight). Modeled on
// modern SaaS marketing pages (Linear, Vercel, Supabase).
export type BentoTile = {
    title: string
    body?: string
    accent?: 'brand' | 'purple' | 'teal' | 'orange' | 'pink'
    wide?: boolean
    imageUrl?: string
    eyebrow?: string
}

export type BentoSectionData = {
    eyebrow?: string
    title?: string
    subtitle?: string
    tiles?: BentoTile[]
}

// Pricing section — three or four tiers with feature lists. Each tier has a
// name, price, period, blurb, feature bullets, optional badge ("Most popular")
// and a CTA. Variant `cards` is the standard SaaS layout; `table` is a
// comparison table.
export type PricingTier = {
    name: string
    price: string
    period?: string
    blurb?: string
    features?: string[]
    ctaLabel?: string
    ctaLink?: string
    badge?: string
    highlighted?: boolean
}

export type PricingSectionData = {
    eyebrow?: string
    title?: string
    subtitle?: string
    tiers?: PricingTier[]
}

// Marquee section — infinite-scrolling row used for big-name logos, value
// props, or category chips. Heizen / Vercel use these as visual breathers
// between content blocks; the animation is CSS-driven so it survives even on
// reduced-motion (where it pauses gracefully via the global rule).
export type MarqueeSectionData = {
    eyebrow?: string
    title?: string
    items?: string[] // each item renders as a chip/pill
    speed?: 'slow' | 'normal' | 'fast'
}

// Process section — numbered steps connected by a line (vertical on mobile,
// horizontal on desktop). Each step has a number, title, and body. Used for
// "how the program works" / onboarding flow / 4-step roadmap layouts.
export type ProcessStep = {
    title: string
    body?: string
    badge?: string
}

export type ProcessSectionData = {
    eyebrow?: string
    title?: string
    subtitle?: string
    steps?: ProcessStep[]
}

// FAQ accordion — replaces the collectionList for tenants that want their FAQ
// inline on a page rather than CMS-driven. Each item has a question + answer.
// Variant `accordion` is the standard expand/collapse; `two-column` lays them
// in a 2-up grid for shorter answers.
export type FaqItem = {
    question: string
    answer: string
}

export type FaqSectionData = {
    eyebrow?: string
    title?: string
    subtitle?: string
    items?: FaqItem[]
}

// Code snippet — used by cheat-sheet pages and any tutorial that wants a
// real code block instead of a prose paragraph. Languages we tokenise:
// sql · python · javascript · typescript · bash · plain. Supports either a
// single block (`code`) or named tabs (`tabs`) for "JS / Python / SQL"
// triple snippets. The renderer tokenises in-browser via a small regex
// pass — no syntax-highlighter dependency.
export type CodeLanguage = 'sql' | 'python' | 'javascript' | 'typescript' | 'bash' | 'plain'

export type CodeTab = {
    label: string
    code: string
    language?: CodeLanguage
}

export type CodeSectionData = {
    title?: string
    code?: string
    language?: CodeLanguage
    showLineNumbers?: boolean
    tabs?: CodeTab[]
}

// Blog/article cards — used on home pages and resource hubs to surface a
// list of posts in a card grid. Variant `featured` renders the first item
// as a hero card with the rest stacked beside it; `grid` lays them all
// equally in a 3-up grid.
export type BlogCard = {
    title: string
    description?: string
    category?: string
    date?: string
    readTime?: string
    href?: string // optional link (relative or absolute)
    imageUrl?: string
    accent?: 'brand' | 'purple' | 'teal' | 'orange' | 'pink'
}

export type BlogCardsSectionData = {
    eyebrow?: string
    title?: string
    subtitle?: string
    items?: BlogCard[]
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

// Testimonials — structured social proof. The data is intentionally a fixed
// shape (vs CMS) so the editor can give a tight inline form: avatar, name,
// role, quote, optional company logo.
export type TestimonialItem = {
    quote: string
    name: string
    role?: string
    company?: string
    avatarUrl?: string
}

export type TestimonialsSectionData = {
    title?: string
    subtitle?: string
    items?: TestimonialItem[]
}

// Stats / placement-guarantee numbers. Each item is one big number with a
// caption underneath. Useful for "92% placement rate", "₹8.2L avg package",
// "40+ hiring partners".
export type StatItem = {
    value: string
    label: string
    sublabel?: string
}

export type StatsSectionData = {
    title?: string
    subtitle?: string
    items?: StatItem[]
}

// Inline lead-capture form. POSTs to /api/v1/enquiries with the configured
// course/source pre-filled. variant=split renders eyebrow/title/subtitle on
// the left + form on the right; variant=inline renders one centered card.
export type LeadFormSectionData = {
    eyebrow?: string
    title?: string
    subtitle?: string
    submitLabel?: string
    successMessage?: string
    coursePrefill?: string // pre-fills `course` field on POST
    showQualification?: boolean
    showCity?: boolean
    showMessage?: boolean
}

// Partner / placement logo strip. Each item supports either:
//   - `src`: image URL (PNG/SVG)
//   - `svg`: raw inline SVG markup (when given, takes precedence over src)
// `alt` provides accessible text for both modes; `href` makes the logo a link.
// variant=grid → centered grid; variant=scroll → horizontal marquee.
export type LogoItem = {
    src?: string
    svg?: string
    alt?: string
    href?: string
}

export type LogosSectionData = {
    title?: string
    subtitle?: string
    items?: LogoItem[]
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
    | { id: string; type: 'prose'; variant: 'narrow' | 'wide'; data: ProseSectionData; style?: SectionStyle }
    | { id: string; type: 'bento'; variant: 'showcase' | 'spotlight'; data: BentoSectionData; style?: SectionStyle }
    | { id: string; type: 'pricing'; variant: 'cards' | 'table'; data: PricingSectionData; style?: SectionStyle }
    | { id: string; type: 'marquee'; variant: 'chips' | 'banner'; data: MarqueeSectionData; style?: SectionStyle }
    | { id: string; type: 'process'; variant: 'horizontal' | 'vertical'; data: ProcessSectionData; style?: SectionStyle }
    | { id: string; type: 'faq'; variant: 'accordion' | 'two-column'; data: FaqSectionData; style?: SectionStyle }
    | { id: string; type: 'code'; variant: 'single' | 'tabs'; data: CodeSectionData; style?: SectionStyle }
    | { id: string; type: 'blogCards'; variant: 'featured' | 'grid'; data: BlogCardsSectionData; style?: SectionStyle }
    | { id: string; type: 'image'; variant: 'full' | 'contained'; data: ImageSectionData; style?: SectionStyle }
    | { id: string; type: 'embed'; variant: 'iframe'; data: EmbedSectionData; style?: SectionStyle }
    | {
          id: string
          type: 'collectionList'
          variant: 'cards' | 'list' | 'accordion'
          data: CollectionListSectionData
          style?: SectionStyle
      }
    | { id: string; type: 'testimonials'; variant: 'cards' | 'quotes'; data: TestimonialsSectionData; style?: SectionStyle }
    | { id: string; type: 'stats'; variant: 'banner' | 'grid'; data: StatsSectionData; style?: SectionStyle }
    | { id: string; type: 'leadForm'; variant: 'split' | 'inline'; data: LeadFormSectionData; style?: SectionStyle }
    | { id: string; type: 'logos'; variant: 'grid' | 'scroll'; data: LogosSectionData; style?: SectionStyle }

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

// Curated icon palette for nav-menu items. Keys are plain strings stored on
// NavLink.icon; the renderer maps them to actual lucide components. Stored as
// a string (rather than the component) so the catalog stays JSON-friendly.
export type NavIconToken =
    | 'book'
    | 'graduation'
    | 'chart'
    | 'database'
    | 'sparkles'
    | 'code'
    | 'brain'
    | 'cpu'
    | 'briefcase'
    | 'globe'
    | 'users'
    | 'message'
    | 'mail'
    | 'phone'
    | 'award'
    | 'rocket'
    | 'compass'
    | 'shield'

// User-facing labels for the curated nav-icon palette. Editor surfaces these
// in the icon picker; the renderer maps tokens to actual lucide components.
export const NAV_ICON_LABELS: Record<NavIconToken, string> = {
    book: 'Book',
    graduation: 'Graduation cap',
    chart: 'Chart',
    database: 'Database',
    sparkles: 'Sparkles',
    code: 'Code',
    brain: 'Brain',
    cpu: 'CPU',
    briefcase: 'Briefcase',
    globe: 'Globe',
    users: 'Users',
    message: 'Message',
    mail: 'Mail',
    phone: 'Phone',
    award: 'Award',
    rocket: 'Rocket',
    compass: 'Compass',
    shield: 'Shield'
}

// One link in a navbar or footer. Target is one of:
//   - `pageId`   → an internal page from `landing.pages`
//   - `url`      → external absolute URL or relative path
//   - `children` → makes this a dropdown trigger; the link itself stops being
//                  navigable (the trigger stays inert) and the menu opens on
//                  hover (desktop) or tap (mobile)
// Marketing UI lets SAs add/remove/reorder these without touching code.
//
// Mega-menu fields (parent-only):
//   - `mega`    → render the dropdown as a rich card grid with icons +
//                 descriptions instead of the flat link list.
//   - `columns` → 1 or 2 column layout in mega mode (default 1).
// Mega-menu fields (child-only):
//   - `icon`        → NavIconToken rendered in a rounded square left of the label
//   - `description` → small grey sub-text under the label
export type NavLink = {
    id: string
    label: string
    pageId?: string
    url?: string
    newTab?: boolean
    children?: NavLink[]
    mega?: boolean
    columns?: 1 | 2
    icon?: NavIconToken
    description?: string
}

// Top-of-page navbar config. Three layouts; logo + sign-in default on.
//
// `mobileVariant` controls how the hamburger menu opens on viewports below md:
//   sheet         → full-width drop-down sheet from below the header (default)
//   drawer-right  → slide-in panel from the right edge, 80vw wide
//   fullscreen    → fullscreen overlay with centered links, big tap targets
export type MobileNavVariant = 'sheet' | 'drawer-right' | 'fullscreen'

export type NavbarConfig = {
    // simple        → brand left · links right
    // with-cta      → brand left · links right · CTA button at the far right
    // centered      → stacked: brand on top, links + CTA below (single centered row)
    // split-centered → brand left · links centered · CTA right (three-column layout)
    variant: 'simple' | 'centered' | 'with-cta' | 'split-centered'
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

// Site-wide analytics + chat integrations. Injected once at page load by
// TenantLandingPage. Empty values are skipped so no script tags are emitted
// when nothing is configured.
export type SiteAnalytics = {
    googleAnalyticsId?: string // GA4 measurement id, e.g. "G-XXXXXX"
    metaPixelId?: string // Meta/Facebook pixel id
    whatsappNumber?: string // E.164, opens wa.me on click — surfaced as a floating bubble
    whatsappMessage?: string // pre-filled message in the chat link
}

// Per-tenant floating action buttons — back-to-top + WhatsApp chat. Each
// has independent enable/variant/position controls so a tenant can run only
// one if they prefer. Position is corner-anchored so the two never collide
// (back-to-top always stacks ABOVE WhatsApp on the same side).
export type FloatingPosition = 'bottom-right' | 'bottom-left'

export type BackToTopConfig = {
    enabled?: boolean // default: true
    // solid / outline / dark / gradient — quiet circular variants.
    // bounce — gradient circle with a continuously bouncing arrow.
    // pill — wider pill with a "Top" label next to the arrow.
    variant?: 'solid' | 'outline' | 'dark' | 'gradient' | 'bounce' | 'pill'
    position?: FloatingPosition // default: bottom-right
    showAfter?: number // px scrolled before button appears, default 400
    label?: string // accessible label, default "Back to top"
}

export type WhatsAppFloatConfig = {
    enabled?: boolean // default: based on whether `phone` is set
    phone?: string // E.164 (or national; leading + optional). Falls back to analytics.whatsappNumber
    message?: string // pre-filled chat message. Falls back to analytics.whatsappMessage
    // classic / brand / minimal — circular bubbles.
    // lift — classic green that translates up + grows shadow on hover.
    // extended — wider pill that reveals a "Chat with us" label on hover.
    variant?: 'classic' | 'brand' | 'minimal' | 'lift' | 'extended'
    position?: FloatingPosition // default: bottom-right
    pulse?: boolean // subtle pulse animation, default true
    label?: string // accessible label, default "Chat on WhatsApp"
}

export type FloatingActionsConfig = {
    backToTop?: BackToTopConfig
    whatsapp?: WhatsAppFloatConfig
}

export type LandingContent = {
    sections?: LandingSection[]
    pages?: LandingPage[]
    site?: SiteIdentity
    analytics?: SiteAnalytics
    navbar?: NavbarConfig
    footer?: FooterConfig
    floatingActions?: FloatingActionsConfig
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
        label: 'Prose · Narrow',
        description: 'Long-form text in a narrow legal-document column. Use for policies and terms.',
        section: {
            type: 'prose',
            variant: 'narrow',
            data: {
                eyebrow: 'POLICY',
                title: 'Section heading',
                body: 'Write the policy body here.\n\nBlank lines separate paragraphs. Use this section for terms, privacy, refund, and similar long-form content.'
            }
        }
    },
    {
        label: 'Prose · Wide',
        description: 'Long-form text in the standard reading column.',
        section: {
            type: 'prose',
            variant: 'wide',
            data: {
                title: 'About this page',
                body: 'Write the body here.\n\nNewlines are preserved.'
            }
        }
    },
    {
        label: 'Bento · Showcase',
        description: 'Asymmetric grid of feature tiles with mixed widths and accent colors.',
        section: {
            type: 'bento',
            variant: 'showcase',
            data: {
                eyebrow: 'WHY ALBERO',
                title: 'Built for outcomes, not just outcomes-talk',
                subtitle: 'Every part of the program is designed to ship you into a real role — not to look good in a brochure.',
                tiles: [
                    {
                        title: 'Live mentor-led cohorts',
                        body: 'Mentors are senior practitioners from product companies — not career educators reading slides.',
                        accent: 'brand',
                        wide: true,
                        eyebrow: 'TEACHING'
                    },
                    {
                        title: '5+ portfolio projects',
                        body: 'Every project is industry-graded with feedback from your mentor, not a TA.',
                        accent: 'purple',
                        eyebrow: 'PROJECTS'
                    },
                    {
                        title: '40+ hiring partners',
                        body: 'Top performers get warm referrals — no cold applications.',
                        accent: 'teal',
                        eyebrow: 'PLACEMENT'
                    },
                    {
                        title: '6-month money-back guarantee',
                        body: "If you don't get placed within 6 months of graduating, we refund your full fee.",
                        accent: 'orange',
                        wide: true,
                        eyebrow: 'GUARANTEE'
                    }
                ]
            }
        }
    },
    {
        label: 'Marquee · Chips',
        description: 'Infinite-scrolling row of value-prop chips. Pauses on hover.',
        section: {
            type: 'marquee',
            variant: 'chips',
            data: {
                items: ['Live mentor-led cohorts', '5+ portfolio projects', '40+ hiring partners', '6-month placement guarantee', 'No-cost EMI', 'Need-based scholarships'],
                speed: 'normal'
            }
        }
    },
    {
        label: 'Marquee · Banner',
        description: 'Bold gradient banner — best for marketing campaigns or category badges.',
        section: {
            type: 'marquee',
            variant: 'banner',
            data: {
                items: ['Cohort 14 enrolling', 'Save 30% with merit scholarship', 'No-cost EMI from ₹3,500/mo', 'Talk to a counsellor today'],
                speed: 'normal'
            }
        }
    },
    {
        label: 'Process · Horizontal',
        description: 'Numbered steps in a row with connecting line under the badges.',
        section: {
            type: 'process',
            variant: 'horizontal',
            data: {
                eyebrow: 'HOW IT WORKS',
                title: 'Four steps from enquiry to offer letter',
                subtitle: 'A clear path — no guesswork, no gimmicks.',
                steps: [
                    { title: 'Counsellor call', body: 'Tell us your goal. We tell you which program fits.', badge: 'WEEK 0' },
                    { title: 'Live cohort', body: 'Mentor-led classes + hands-on labs.', badge: 'WEEKS 1-12' },
                    { title: 'Capstone + reviews', body: 'Industry-graded final project.', badge: 'WEEK 13' },
                    { title: 'Placement support', body: 'Resume review, mocks, warm referrals.', badge: 'POST-GRAD' }
                ]
            }
        }
    },
    {
        label: 'Process · Vertical',
        description: 'Vertical step list — better for detailed content on each step.',
        section: {
            type: 'process',
            variant: 'vertical',
            data: {
                eyebrow: 'STUDENT JOURNEY',
                title: 'How a typical week looks',
                steps: [
                    { title: 'Mon · Live class', body: 'Concept walkthrough with your mentor.' },
                    { title: 'Wed · Hands-on lab', body: 'Code along, debug live, ship a small piece.' },
                    { title: 'Fri · Office hours', body: '1:1 reviews and unblocking.' },
                    { title: 'Weekend · Project work', body: 'Build the piece for your portfolio.' }
                ]
            }
        }
    },
    {
        label: 'Code · Single block',
        description: 'Syntax-highlighted code snippet with copy button and line numbers.',
        section: {
            type: 'code',
            variant: 'single',
            data: {
                title: 'example.sql',
                language: 'sql',
                code: '-- Top customers by revenue (last 90 days)\nSELECT\n  c.id,\n  c.name,\n  SUM(o.total_paise) / 100 AS revenue_inr\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.paid_at >= NOW() - INTERVAL \'90 days\'\nGROUP BY c.id, c.name\nORDER BY revenue_inr DESC\nLIMIT 10;',
                showLineNumbers: true
            }
        }
    },
    {
        label: 'Code · Tabs',
        description: 'Tabbed snippet — switch between JS, Python, SQL flavours of the same example.',
        section: {
            type: 'code',
            variant: 'tabs',
            data: {
                showLineNumbers: true,
                tabs: [
                    { label: 'JS', language: 'javascript', code: 'const sum = (a, b) => a + b\nconsole.log(sum(2, 3))' },
                    { label: 'Python', language: 'python', code: 'def sum(a, b):\n    return a + b\n\nprint(sum(2, 3))' },
                    { label: 'SQL', language: 'sql', code: 'SELECT 2 + 3 AS sum;' }
                ]
            }
        }
    },
    {
        label: 'Blog cards · Featured',
        description: 'Hero-card layout — the first post is large, the rest stack beside it.',
        section: {
            type: 'blogCards',
            variant: 'featured',
            data: {
                eyebrow: 'LATEST',
                title: 'From the blog',
                items: [
                    { title: 'A field guide to data warehousing', description: 'Star vs snowflake, when to denormalise, and how to choose.', category: 'Data', date: 'May 5, 2025', readTime: '11 min', accent: 'brand', href: 'blog' },
                    { title: 'Apache Kafka in 9 minutes', description: 'Topics, partitions, producers, consumers — the model behind real-time pipelines.', category: 'Engineering', date: 'May 1, 2025', readTime: '9 min', accent: 'purple', href: 'blog' }
                ]
            }
        }
    },
    {
        label: 'Blog cards · Grid',
        description: 'Equal-weight 3-up grid of article cards.',
        section: {
            type: 'blogCards',
            variant: 'grid',
            data: {
                title: 'All articles',
                items: [
                    { title: 'SQL for data analysis', description: 'SELECT, joins, window functions.', category: 'Data', date: 'Apr 14', readTime: '9 min', accent: 'brand', href: 'blog' },
                    { title: 'Computer vision in 2025', description: 'Manufacturing, healthcare, autonomous vehicles.', category: 'AI', date: 'Apr 2', readTime: '8 min', accent: 'purple', href: 'blog' },
                    { title: 'Mutual funds in India', description: 'Types, SIP vs lump sum, taxes.', category: 'Finance', date: 'Apr 20', readTime: '10 min', accent: 'teal', href: 'blog' }
                ]
            }
        }
    },
    {
        label: 'FAQ · Accordion',
        description: 'Single-column expand/collapse — perfect for the bottom of a long page.',
        section: {
            type: 'faq',
            variant: 'accordion',
            data: {
                eyebrow: 'FAQ',
                title: 'Common questions',
                items: [
                    { question: 'Do I need prior coding experience?', answer: 'For Business Analytics — no. For Data Analytics Mastery and AI/ML Engineer — basic programming helps but is not required. We have a free pre-cohort warm-up.' },
                    { question: 'What if I miss a live class?', answer: 'Every class is recorded. Your mentor also runs office hours twice a week so you can catch up live.' },
                    { question: 'Is the placement guarantee real?', answer: 'Yes. If you do not get placed within 6 months of graduating and meet the program engagement criteria, we refund 100% of your fee. No fine print.' }
                ]
            }
        }
    },
    {
        label: 'Pricing · Cards',
        description: 'Three-tier pricing grid with a highlighted recommended plan.',
        section: {
            type: 'pricing',
            variant: 'cards',
            data: {
                eyebrow: 'PROGRAMS',
                title: 'Pick the program that fits your goal',
                subtitle: 'No-cost EMI on every plan. Need-based scholarships up to 30% off.',
                tiers: [
                    {
                        name: 'Business Analytics Pro',
                        price: '₹49,999',
                        period: '14-week program',
                        blurb: 'For analyst-track careers',
                        features: ['SQL, Excel, Power BI, Tableau', 'A/B testing + stakeholder communication', 'Mentor-led live cohort', '5+ portfolio projects', 'Placement support'],
                        ctaLabel: 'Talk to a counsellor',
                        ctaLink: 'enquiry'
                    },
                    {
                        name: 'Data Analytics Mastery',
                        price: '₹74,999',
                        period: '20-week program',
                        blurb: 'Most chosen by recent grads',
                        features: ['Python + statistics + ML basics', 'Cloud warehousing (Snowflake / BigQuery)', 'Causal inference + experimentation', '8+ portfolio projects', 'Resume + 3 mock interviews', '6-month placement guarantee'],
                        ctaLabel: 'Reserve my seat',
                        ctaLink: 'enquiry',
                        badge: 'Most popular',
                        highlighted: true
                    },
                    {
                        name: 'AI/ML Engineer',
                        price: '₹99,999',
                        period: '24-week program',
                        blurb: 'For engineers shipping AI',
                        features: ['Neural nets + transformers', 'RAG + LLM apps + MLOps', 'Production deployment patterns', '6+ portfolio projects', 'Senior-IC mentor 1:1', 'Placement support'],
                        ctaLabel: 'Talk to a counsellor',
                        ctaLink: 'enquiry'
                    }
                ]
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
        label: 'Collection list · Accordion (FAQ)',
        description: 'Click-to-expand items. Title field is the question, summary field is the answer. Best for FAQs.',
        section: {
            type: 'collectionList',
            variant: 'accordion',
            data: {
                collectionSlug: 'faqs',
                title: 'Frequently asked questions',
                titleField: 'question',
                summaryField: 'answer',
                limit: 50
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
    },
    {
        label: 'Testimonials · Cards',
        description: 'Three- or four-up student testimonial cards with avatars and roles.',
        section: {
            type: 'testimonials',
            variant: 'cards',
            data: {
                title: 'What our students say',
                subtitle: 'Outcomes from past cohorts.',
                items: [
                    {
                        quote: 'I went from no Python experience to landing a Data Analyst role at a unicorn within five months of joining.',
                        name: 'Priya Sharma',
                        role: 'Data Analyst',
                        company: 'Razorpay',
                        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=faces'
                    },
                    {
                        quote: 'The mentor-led format and live projects forced me to apply concepts immediately. Best decision I made this year.',
                        name: 'Rahul Verma',
                        role: 'Business Analyst',
                        company: 'Flipkart',
                        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=160&h=160&fit=crop&crop=faces'
                    },
                    {
                        quote: 'Placement support was hands-on — mock interviews, resume reviews, and three referrals that all converted.',
                        name: 'Anjali Mehta',
                        role: 'AI Engineer',
                        company: 'Swiggy',
                        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces'
                    }
                ]
            }
        }
    },
    {
        label: 'Testimonials · Quotes',
        description: 'Centred large-quote layout — better for fewer, more emphatic testimonials.',
        section: {
            type: 'testimonials',
            variant: 'quotes',
            data: {
                title: 'Stories from our cohort',
                items: [
                    {
                        quote: 'The structure plus the community is what made it click for me. I tried two MOOCs before this — neither stuck.',
                        name: 'Ishaan Gupta',
                        role: 'Senior Analyst',
                        company: 'PhonePe'
                    }
                ]
            }
        }
    },
    {
        label: 'Stats · Placement banner',
        description: 'Big-number row — placement rate, avg package, hiring partners. Frames the placement guarantee.',
        section: {
            type: 'stats',
            variant: 'banner',
            data: {
                title: 'Placement guarantee — backed by numbers',
                subtitle: 'We tie our success to yours. If you do not get placed within 6 months of graduating, we refund 100% of your fee.',
                items: [
                    { value: '94%', label: 'Placement rate', sublabel: 'Cohort 2025-Q1' },
                    { value: '₹8.4L', label: 'Average package', sublabel: 'Across all programs' },
                    { value: '40+', label: 'Hiring partners', sublabel: 'Active referral pipeline' },
                    { value: '6 mo', label: 'Money-back guarantee', sublabel: 'Or full refund' }
                ]
            }
        }
    },
    {
        label: 'Stats · 4-up grid',
        description: 'Quieter grid layout — good as a mid-page proof point.',
        section: {
            type: 'stats',
            variant: 'grid',
            data: {
                title: 'Why students choose us',
                items: [
                    { value: '12k+', label: 'Alumni' },
                    { value: '4.8/5', label: 'Avg cohort rating' },
                    { value: '85%', label: 'Career switch rate' },
                    { value: '24/7', label: 'Mentor support' }
                ]
            }
        }
    },
    {
        label: 'Lead form · Split',
        description: 'Inline lead capture — copy on the left, form on the right. Posts directly to the enquiries pipeline.',
        section: {
            type: 'leadForm',
            variant: 'split',
            data: {
                eyebrow: 'Talk to us',
                title: 'Get a free counselling call',
                subtitle: 'Tell us a bit about yourself and a senior counsellor will reach out within one working day.',
                submitLabel: 'Request a callback',
                successMessage: 'Got it — your counsellor will call within one working day.',
                showQualification: true,
                showCity: true,
                showMessage: false
            }
        }
    },
    {
        label: 'Lead form · Inline card',
        description: 'Single centred card. Tighter, good for the bottom of a course page.',
        section: {
            type: 'leadForm',
            variant: 'inline',
            data: {
                title: 'Reserve your seat',
                subtitle: 'Limited cohort spots. Drop your details and we will call back.',
                submitLabel: 'Reserve my seat',
                successMessage: 'Thanks — we will be in touch shortly.',
                showQualification: false,
                showCity: false,
                showMessage: true
            }
        }
    },
    {
        label: 'Logos · Hiring partners',
        description: 'Logo grid — partner companies, accreditations, press mentions.',
        section: {
            type: 'logos',
            variant: 'grid',
            data: {
                title: 'Our students work at',
                items: [
                    {
                        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Flipkart_logo.svg/512px-Flipkart_logo.svg.png',
                        alt: 'Flipkart'
                    },
                    { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Amazon_logo.svg/512px-Amazon_logo.svg.png', alt: 'Amazon' },
                    {
                        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Microsoft_logo_%282012%29.svg/512px-Microsoft_logo_%282012%29.svg.png',
                        alt: 'Microsoft'
                    },
                    {
                        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png',
                        alt: 'Google'
                    },
                    {
                        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Razorpay_logo.svg/512px-Razorpay_logo.svg.png',
                        alt: 'Razorpay'
                    },
                    { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Swiggy_logo.svg/512px-Swiggy_logo.svg.png', alt: 'Swiggy' }
                ]
            }
        }
    },
    {
        label: 'Logos · Marquee',
        description: 'Horizontally scrolling logo strip. Auto-loops; pause on hover.',
        section: {
            type: 'logos',
            variant: 'scroll',
            data: {
                title: 'Trusted by industry',
                items: [
                    {
                        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Flipkart_logo.svg/512px-Flipkart_logo.svg.png',
                        alt: 'Flipkart'
                    },
                    { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Amazon_logo.svg/512px-Amazon_logo.svg.png', alt: 'Amazon' },
                    {
                        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Microsoft_logo_%282012%29.svg/512px-Microsoft_logo_%282012%29.svg.png',
                        alt: 'Microsoft'
                    },
                    {
                        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png',
                        alt: 'Google'
                    }
                ]
            }
        }
    }
]

export const newSectionId = (): string =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sec_${Math.random().toString(36).slice(2, 10)}`

export const newPageId = (): string =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pg_${Math.random().toString(36).slice(2, 10)}`

export const instantiateTemplate = (t: LandingTemplate): LandingSection => ({ ...t.section, id: newSectionId() }) as LandingSection

// ---- Page templates -------------------------------------------------------
//
// Whole-page presets for the "New page" modal. Each entry is a curated bundle
// of sections (taken from LANDING_TEMPLATES section shapes) plus a default
// name / slug. Picking a template in the New Page modal pre-fills name + slug
// and instantiates all sections with fresh ids.
//
// "Blank" is special — no sections — so the picker can default to the
// existing zero-config behaviour.
export type PageTemplate = {
    id: string
    label: string
    description: string
    defaultName: string
    defaultSlug: string
    sections: Omit<LandingSection, 'id'>[]
}

export const PAGE_TEMPLATES: PageTemplate[] = [
    {
        id: 'blank',
        label: 'Blank — start empty',
        description: 'No sections. Add them yourself from the section picker.',
        defaultName: 'New page',
        defaultSlug: '/new-page',
        sections: []
    },
    {
        id: 'about',
        label: 'About us',
        description: 'Hero + three pillars + tenant image + CTA. Drops in as a polished About page out of the box.',
        defaultName: 'About',
        defaultSlug: '/about',
        sections: [
            {
                type: 'hero',
                variant: 'centered',
                data: {
                    eyebrow: 'About us',
                    title: 'We build careers, not just courses.',
                    subtitle: 'Mentor-led cohorts, real industry projects, and lifelong placement support.'
                }
            },
            {
                type: 'features',
                variant: 'three-up',
                data: {
                    title: 'What sets us apart',
                    pillars: [
                        { title: 'Senior mentors', description: 'Every cohort is led by working professionals from top product companies.' },
                        { title: 'Industry-graded projects', description: 'You ship real work, not toy assignments. Every project is reviewed.' },
                        { title: 'Placement-first', description: 'Resume reviews, mock interviews, and direct partner-company referrals.' }
                    ]
                }
            },
            {
                type: 'image',
                variant: 'contained',
                data: { src: '', alt: 'Our campus', rounded: true }
            },
            {
                type: 'cta',
                variant: 'banner',
                data: {
                    title: 'Curious about our cohorts?',
                    subtitle: 'A 20-minute counselling call is the fastest way to figure out if we are the right fit.',
                    buttonLabel: 'Talk to a counsellor',
                    buttonLink: 'enquiry'
                }
            }
        ]
    },
    {
        id: 'pricing',
        label: 'Pricing',
        description: 'Hero + four pricing pillars + closing CTA. Edit the pillar copy with your tier names and amounts.',
        defaultName: 'Pricing',
        defaultSlug: '/pricing',
        sections: [
            {
                type: 'hero',
                variant: 'centered',
                data: {
                    eyebrow: 'Pricing',
                    title: 'Pay once. Learn for life.',
                    subtitle: 'Lifetime access to course content, weekly mentor hours during your cohort, and our placement network.'
                }
            },
            {
                type: 'features',
                variant: 'four-up',
                data: {
                    title: 'Three plans, one promise.',
                    pillars: [
                        { title: '₹19,999 · Self-paced', description: 'All recorded content + community access.' },
                        { title: '₹49,999 · Cohort', description: 'Live mentorship + projects + placement help.' },
                        { title: '₹99,999 · 1:1 mentor', description: 'Everything in Cohort + weekly 1:1 reviews.' },
                        { title: 'No-cost EMI', description: 'On all major banks, up to 12 months.' }
                    ]
                }
            },
            {
                type: 'cta',
                variant: 'banner',
                data: {
                    title: 'Not sure which plan fits?',
                    subtitle: 'Hop on a free counselling call — we will recommend honestly, no sales script.',
                    buttonLabel: 'Book my call',
                    buttonLink: 'enquiry'
                }
            }
        ]
    },
    {
        id: 'contact',
        label: 'Contact',
        description: 'Hero + Calendly inline embed + softer CTA. Replace the iframe URL with your own.',
        defaultName: 'Contact',
        defaultSlug: '/contact',
        sections: [
            {
                type: 'hero',
                variant: 'centered',
                data: {
                    eyebrow: 'Contact',
                    title: 'Talk to a counsellor.',
                    subtitle: 'Pick a slot below — we usually respond within one working day.'
                }
            },
            {
                type: 'embed',
                variant: 'iframe',
                data: {
                    html: '<iframe src="https://calendly.com/your-handle/counselling-call?embed_domain=embed&embed_type=Inline" width="100%" height="700" frameborder="0"></iframe>',
                    height: 700,
                    title: 'Book a counselling call'
                }
            },
            {
                type: 'cta',
                variant: 'card',
                data: {
                    title: 'Prefer email?',
                    subtitle: 'Drop us a line — we read every message.',
                    buttonLabel: 'Email us',
                    buttonLink: 'mailto:hello@example.com'
                }
            }
        ]
    },
    {
        id: 'faq',
        label: 'FAQ (uses CMS collection)',
        description:
            'Hero + a Collection-list block pointing to your "FAQs" CMS collection. Create the FAQs collection first if you have not already.',
        defaultName: 'FAQ',
        defaultSlug: '/faq',
        sections: [
            {
                type: 'hero',
                variant: 'centered',
                data: {
                    eyebrow: 'Help centre',
                    title: 'Frequently asked questions',
                    subtitle: 'Cannot find what you are looking for? Reach out via the support widget.'
                }
            },
            {
                type: 'collectionList',
                variant: 'list',
                data: {
                    collectionSlug: 'faqs',
                    title: 'Browse by topic',
                    titleField: 'question',
                    summaryField: 'answer',
                    limit: 50
                }
            }
        ]
    },
    {
        id: 'blog-index',
        label: 'Blog index (uses CMS collection)',
        description:
            'Hero + a Collection-list grid for your "Blog posts" CMS collection. Pair with a detail-template page so individual posts route to /blog/<slug>.',
        defaultName: 'Blog',
        defaultSlug: '/blog',
        sections: [
            {
                type: 'hero',
                variant: 'centered',
                data: {
                    eyebrow: 'Writing',
                    title: 'Notes from the cohort',
                    subtitle: 'Lessons, project breakdowns, and student stories — the long-form stuff our team wishes they had read first.'
                }
            },
            {
                type: 'collectionList',
                variant: 'cards',
                data: {
                    collectionSlug: 'blog',
                    title: 'Latest posts',
                    titleField: 'title',
                    summaryField: 'summary',
                    imageField: 'coverImage',
                    limit: 12
                }
            }
        ]
    },
    {
        id: 'lead-capture-long',
        label: 'Lead capture · Long form',
        description:
            'Conversion-tuned landing page for paid traffic: hero with image, stats banner, value pillars, testimonials, and an inline lead form. Pair with a UTM link.',
        defaultName: 'Get started',
        defaultSlug: '/get-started',
        sections: [
            {
                type: 'hero',
                variant: 'split',
                data: {
                    eyebrow: 'Free counselling call · 20 minutes',
                    title: 'Talk to a senior counsellor before you commit.',
                    subtitle:
                        'No sales script. We will walk you through the curriculum, talk through your goals, and recommend the right program — even if it is not ours.',
                    primaryCtaLabel: 'Reserve my call',
                    primaryCtaLink: '#lead-form'
                }
            },
            {
                type: 'logos',
                variant: 'scroll',
                data: { title: 'Our alumni work at', items: [] }
            },
            {
                type: 'stats',
                variant: 'banner',
                data: {
                    title: 'Why students pick us',
                    items: [
                        { value: '94%', label: 'Placement rate' },
                        { value: '₹8.4L', label: 'Avg package' },
                        { value: '40+', label: 'Hiring partners' },
                        { value: '6 mo', label: 'Money-back guarantee' }
                    ]
                }
            },
            {
                type: 'features',
                variant: 'three-up',
                data: {
                    title: 'What you get',
                    pillars: [
                        { title: 'Live mentor-led cohorts', description: 'Working professionals from product companies, not career educators.' },
                        { title: 'Industry-graded projects', description: 'You ship real work that recruiters actually want to review.' },
                        { title: '1:1 placement support', description: 'Resume reviews, mock interviews, warm partner-company referrals.' }
                    ]
                }
            },
            {
                type: 'testimonials',
                variant: 'cards',
                data: { title: 'Stories from our cohort', items: [] }
            },
            {
                type: 'leadForm',
                variant: 'split',
                data: {
                    eyebrow: 'Reserve your spot',
                    title: 'Get a free counselling call',
                    subtitle: 'Drop your details and a senior counsellor will call within one working day.',
                    submitLabel: 'Request a callback',
                    successMessage: 'Got it — your counsellor will call within one working day.',
                    showQualification: true,
                    showCity: true,
                    showMessage: false
                }
            },
            {
                type: 'callout',
                variant: 'success',
                data: {
                    title: 'Limited cohort seats',
                    body: 'Each cohort is capped at 25 students for high-touch mentorship. Once full, we open the waitlist for the next batch.'
                }
            },
            {
                type: 'cta',
                variant: 'banner',
                data: {
                    title: 'Prefer to chat first?',
                    subtitle: 'Reach us on WhatsApp — we usually reply within an hour during work hours.',
                    buttonLabel: 'Open WhatsApp',
                    buttonLink: 'enquiry'
                }
            }
        ]
    },
    {
        id: 'lead-capture-express',
        label: 'Lead capture · Express',
        description: 'Single-screen lead-capture: hero + inline form + trust callout. Designed for ad clicks where bounce is the enemy.',
        defaultName: 'Apply now',
        defaultSlug: '/apply',
        sections: [
            {
                type: 'hero',
                variant: 'centered',
                data: {
                    eyebrow: 'Cohort 14 · enrolling now',
                    title: 'Apply in 60 seconds.',
                    subtitle: 'Tell us a bit about yourself. A senior counsellor will call within one working day.'
                }
            },
            {
                type: 'leadForm',
                variant: 'inline',
                data: {
                    title: 'Reserve your seat',
                    subtitle: 'Limited cohort spots — first-come, first-served.',
                    submitLabel: 'Reserve my seat',
                    successMessage: 'Thanks — we will be in touch shortly.',
                    showQualification: true,
                    showCity: false,
                    showMessage: true
                }
            },
            {
                type: 'stats',
                variant: 'grid',
                data: {
                    items: [
                        { value: '94%', label: 'Placement rate' },
                        { value: '₹8.4L', label: 'Avg package' },
                        { value: '4.8/5', label: 'Cohort rating' },
                        { value: '6 mo', label: 'Refund guarantee' }
                    ]
                }
            },
            {
                type: 'callout',
                variant: 'info',
                data: {
                    title: 'Not ready to apply?',
                    body: 'Book a free 20-minute counselling call instead — no commitment required.'
                }
            }
        ]
    },
    {
        id: 'webinar-funnel',
        label: 'Lead capture · Webinar funnel',
        description: 'Webinar-style funnel: hero with date, what-you-will-learn, instructor testimonial, and registration form.',
        defaultName: 'Free masterclass',
        defaultSlug: '/masterclass',
        sections: [
            {
                type: 'hero',
                variant: 'gradient',
                data: {
                    eyebrow: 'Free 90-minute masterclass',
                    title: 'Break into Data Analytics in 2026.',
                    subtitle: 'Live with senior practitioners. Limited to 200 seats.',
                    primaryCtaLabel: 'Register free',
                    primaryCtaLink: '#lead-form'
                }
            },
            {
                type: 'features',
                variant: 'four-up',
                data: {
                    title: 'What we will cover',
                    pillars: [
                        { title: 'The 2026 hiring landscape', description: 'What roles are actually open + what they pay.' },
                        { title: 'Skills that matter', description: 'The non-negotiable stack vs the noise.' },
                        { title: '90-day roadmap', description: 'Week-by-week plan to land your first interview.' },
                        { title: 'Live Q&A', description: '30 minutes of questions answered live.' }
                    ]
                }
            },
            {
                type: 'testimonials',
                variant: 'quotes',
                data: {
                    title: 'From a past masterclass attendee',
                    items: [
                        {
                            quote: 'I attended the masterclass thinking I would just take notes. Two months later I had a job offer. The roadmap was exactly what I needed.',
                            name: 'Anjali Mehta',
                            role: 'Data Analyst'
                        }
                    ]
                }
            },
            {
                type: 'leadForm',
                variant: 'split',
                data: {
                    eyebrow: 'Save your seat',
                    title: 'Free registration',
                    subtitle: 'Drop your email — we will send the calendar invite + Zoom link.',
                    submitLabel: 'Register free',
                    successMessage: 'Registered — check your inbox for the joining link.',
                    showQualification: false,
                    showCity: false,
                    showMessage: false
                }
            }
        ]
    }
]

// Instantiate a page from a template — fresh ids on the page and every section.
export const instantiatePageTemplate = (t: PageTemplate, opts: { name?: string; slug?: string }): LandingPage => ({
    id: newPageId(),
    name: opts.name ?? t.defaultName,
    slug: opts.slug ?? t.defaultSlug,
    isHome: false,
    sections: t.sections.map((s) => ({ ...s, id: newSectionId() }) as LandingSection)
})

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
        heroSubtitle:
            l?.heroSubtitle ?? 'Mentor-led cohorts, hands-on projects, and 1:1 counselling — designed to take you from curious to confident.',
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
    { title: 'Industry projects', description: 'Ship real work — not toy assignments — to your portfolio.' }
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

// Site-wide analytics + chat config — read from tenant.settings.landing.analytics.
// Returns an empty object when nothing is configured so the renderer can no-op.
export const readSiteAnalytics = (tenant: { settings: TenantSettings | null } | undefined): SiteAnalytics => {
    const a = (tenant?.settings?.landing as LandingContent | undefined)?.analytics
    return a ?? {}
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
