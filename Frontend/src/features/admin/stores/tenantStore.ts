// Super-Admin-only store for tenant + website-builder + UTM + SEO data.
//
// Each tenant owns:
//   - basic info (name, slug, plan, status)
//   - website content (hero, featured courses, CTAs)
//   - SEO meta (title, description, OG image, favicon)
//   - UTM links created for them
//
// Phase 1 persists to localStorage so the super-admin tooling works standalone.
// Swap these for real API calls once the backend endpoints land.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TPlan = 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE'
export type TTenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED'

export type TTenant = {
    id: string
    name: string
    slug: string
    adminEmail: string
    plan: TPlan
    status: TTenantStatus
    createdAt: string
    /** One-shot credential the super admin shares when creating the tenant. */
    initialPassword?: string
    /** Last time the super admin re-shared / reset creds. */
    credsLastSharedAt?: string
}

export type TWebsiteContent = {
    tenantId: string
    heroTag: string
    heroTitle: string
    heroSubtitle: string
    primaryCta: string
    featuredCourseSlugs: string[]
    showPricingPage: boolean
}

export type TSeoMeta = {
    tenantId: string
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImageUrl?: string
    faviconUrl?: string
    /** Canonical public URL for the tenant site. */
    canonicalUrl?: string
    /** robots.txt directives. */
    robots: string
}

export type TUtmLink = {
    id: string
    tenantId: string
    label: string
    destination: string
    source: string
    medium: string
    campaign: string
    term?: string
    content?: string
    fullUrl: string
    clickCount: number
    createdAt: string
}

const newId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2)

const genInitialPassword = (): string => {
    const words = ['mango', 'ship', 'ocean', 'delta', 'forest', 'orbit', 'nova', 'paper']
    const a = words[Math.floor(Math.random() * words.length)]
    const b = words[Math.floor(Math.random() * words.length)]
    const n = Math.floor(Math.random() * 900 + 100)
    return `${a}-${b}-${n}`
}

const slugify = (s: string): string =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48)

const SEED_TENANTS: TTenant[] = [
    {
        id: 't-ascend',
        name: 'Ascend Academy',
        slug: 'ascend',
        adminEmail: 'ananya@ascend.in',
        plan: 'GROWTH',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 86_400_000 * 45).toISOString()
    },
    {
        id: 't-deepstack',
        name: 'DeepStack Institute',
        slug: 'deepstack',
        adminEmail: 'ops@deepstack.io',
        plan: 'STARTER',
        status: 'TRIAL',
        createdAt: new Date(Date.now() - 86_400_000 * 7).toISOString()
    }
]

const makeDefaultWebsite = (tenantId: string, name: string): TWebsiteContent => ({
    tenantId,
    heroTag: 'Trusted by 10,000+ learners',
    heroTitle: `Master new skills at ${name}`,
    heroSubtitle: 'Expert-led courses in engineering, design, and data. Live cohorts, 1:1 mentorship, and verifiable certificates.',
    primaryCta: 'Talk to counsellor',
    featuredCourseSlugs: ['sys-design', 'ts-fs', 'dsa-30'],
    showPricingPage: true
})

const makeDefaultSeo = (tenantId: string, name: string): TSeoMeta => ({
    tenantId,
    metaTitle: `${name} — Learn tech that matters`,
    metaDescription: 'Expert-led courses with live cohorts, 1:1 mentorship, and verifiable certificates. Start learning today.',
    keywords: ['online courses', 'live classes', 'certification', 'coding', 'bootcamp'],
    robots: 'index, follow'
})

type Store = {
    tenants: TTenant[]
    websites: TWebsiteContent[]
    seos: TSeoMeta[]
    utmLinks: TUtmLink[]

    // ---- tenant ops ----
    createTenant: (input: { name: string; adminEmail: string; plan: TPlan }) => TTenant
    updateTenant: (id: string, patch: Partial<TTenant>) => void
    setTenantStatus: (id: string, status: TTenantStatus) => void
    regenerateCreds: (id: string) => string
    deleteTenant: (id: string) => void

    // ---- website builder ----
    getWebsite: (tenantId: string) => TWebsiteContent
    saveWebsite: (w: TWebsiteContent) => void

    // ---- seo builder ----
    getSeo: (tenantId: string) => TSeoMeta
    saveSeo: (s: TSeoMeta) => void

    // ---- utm builder ----
    addUtmLink: (link: Omit<TUtmLink, 'id' | 'fullUrl' | 'clickCount' | 'createdAt'>) => TUtmLink
    deleteUtmLink: (id: string) => void
    bumpClick: (id: string) => void
}

const buildUtmUrl = (l: Omit<TUtmLink, 'id' | 'fullUrl' | 'clickCount' | 'createdAt'>): string => {
    const params = new URLSearchParams()
    params.set('utm_source', l.source)
    params.set('utm_medium', l.medium)
    params.set('utm_campaign', l.campaign)
    if (l.term) params.set('utm_term', l.term)
    if (l.content) params.set('utm_content', l.content)
    const sep = l.destination.includes('?') ? '&' : '?'
    return `${l.destination}${sep}${params.toString()}`
}

export const useTenantStore = create<Store>()(
    persist(
        (set, get) => ({
            tenants: SEED_TENANTS,
            websites: SEED_TENANTS.map((t) => makeDefaultWebsite(t.id, t.name)),
            seos: SEED_TENANTS.map((t) => makeDefaultSeo(t.id, t.name)),
            utmLinks: [],

            createTenant: ({ name, adminEmail, plan }) => {
                const id = `t-${slugify(name)}-${newId().slice(0, 4)}`
                const t: TTenant = {
                    id,
                    name: name.trim(),
                    slug: slugify(name),
                    adminEmail: adminEmail.trim().toLowerCase(),
                    plan,
                    status: 'TRIAL',
                    createdAt: new Date().toISOString(),
                    initialPassword: genInitialPassword(),
                    credsLastSharedAt: new Date().toISOString()
                }
                set((s) => ({
                    tenants: [t, ...s.tenants],
                    websites: [...s.websites, makeDefaultWebsite(id, t.name)],
                    seos: [...s.seos, makeDefaultSeo(id, t.name)]
                }))
                return t
            },

            updateTenant: (id, patch) => set((s) => ({ tenants: s.tenants.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

            setTenantStatus: (id, status) => set((s) => ({ tenants: s.tenants.map((t) => (t.id === id ? { ...t, status } : t)) })),

            regenerateCreds: (id) => {
                const password = genInitialPassword()
                set((s) => ({
                    tenants: s.tenants.map((t) =>
                        t.id === id ? { ...t, initialPassword: password, credsLastSharedAt: new Date().toISOString() } : t
                    )
                }))
                return password
            },

            deleteTenant: (id) =>
                set((s) => ({
                    tenants: s.tenants.filter((t) => t.id !== id),
                    websites: s.websites.filter((w) => w.tenantId !== id),
                    seos: s.seos.filter((seo) => seo.tenantId !== id),
                    utmLinks: s.utmLinks.filter((l) => l.tenantId !== id)
                })),

            getWebsite: (tenantId) => {
                const s = get()
                const existing = s.websites.find((w) => w.tenantId === tenantId)
                if (existing) return existing
                const tenant = s.tenants.find((t) => t.id === tenantId)
                return makeDefaultWebsite(tenantId, tenant?.name ?? 'Your institute')
            },

            saveWebsite: (w) =>
                set((s) => {
                    const i = s.websites.findIndex((x) => x.tenantId === w.tenantId)
                    if (i === -1) return { websites: [...s.websites, w] }
                    const next = s.websites.slice()
                    next[i] = w
                    return { websites: next }
                }),

            getSeo: (tenantId) => {
                const s = get()
                const existing = s.seos.find((x) => x.tenantId === tenantId)
                if (existing) return existing
                const tenant = s.tenants.find((t) => t.id === tenantId)
                return makeDefaultSeo(tenantId, tenant?.name ?? 'Albero Academy')
            },

            saveSeo: (seo) =>
                set((s) => {
                    const i = s.seos.findIndex((x) => x.tenantId === seo.tenantId)
                    if (i === -1) return { seos: [...s.seos, seo] }
                    const next = s.seos.slice()
                    next[i] = seo
                    return { seos: next }
                }),

            addUtmLink: (l) => {
                const full: TUtmLink = {
                    id: newId(),
                    ...l,
                    fullUrl: buildUtmUrl(l),
                    clickCount: 0,
                    createdAt: new Date().toISOString()
                }
                set((s) => ({ utmLinks: [full, ...s.utmLinks] }))
                return full
            },

            deleteUtmLink: (id) => set((s) => ({ utmLinks: s.utmLinks.filter((l) => l.id !== id) })),

            bumpClick: (id) =>
                set((s) => ({
                    utmLinks: s.utmLinks.map((l) => (l.id === id ? { ...l, clickCount: l.clickCount + 1 } : l))
                }))
        }),
        {
            name: 'learnhub.superadmin',
            storage: createJSONStorage(() => localStorage),
            version: 1
        }
    )
)

export const PLAN_TONE: Record<TPlan, 'default' | 'brand' | 'purple' | 'warn'> = {
    FREE: 'default',
    STARTER: 'brand',
    GROWTH: 'purple',
    ENTERPRISE: 'warn'
}
export const STATUS_TONE: Record<TTenantStatus, 'ok' | 'warn' | 'danger'> = {
    ACTIVE: 'ok',
    TRIAL: 'warn',
    SUSPENDED: 'danger'
}
