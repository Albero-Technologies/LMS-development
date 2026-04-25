// Lead pipeline — mirrors the backend /api/v1/enquiries + /api/v1/counsellor/leads
// flow. Phase 1 persists locally so the UI works end-to-end without the full
// API wired up. Swap useLeadStore for TanStack Query once those endpoints land.
//
// Round-robin:
//   - `rrPointer` is the index of the counsellor who should receive the NEXT
//     enquiry. It wraps back to 0 after the last active counsellor.
//   - `addEnquiry` (called by the public form) always uses round-robin.
//   - `addLead` (called by counsellors adding a lead manually) defaults to the
//     current user but can override.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TStage = 'NEW' | 'DEMO_SCHEDULED' | 'CONVERTED' | 'LOST'

export type TLead = {
    id: string
    name: string
    phone: string
    email?: string
    course: string
    language?: string
    source: string
    city?: string
    message?: string
    stage: TStage
    assignedToId?: string
    assignedToName?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    note?: string
    nextActionAt?: string
    createdAt: string
}

export type TCounsellor = { id: string; name: string; email: string; active: boolean }

// Default counsellor roster — stand-in for GET /counsellor/team.
const COUNSELLORS: TCounsellor[] = [
    { id: 'c-priya', name: 'Priya Shetty', email: 'priya@learnhub.in', active: true },
    { id: 'c-rohan', name: 'Rohan Kulkarni', email: 'rohan@learnhub.in', active: true },
    { id: 'c-ananya', name: 'Ananya Rao', email: 'ananya@learnhub.in', active: true }
]

const SEED: TLead[] = [
    {
        id: 'l1',
        name: 'Ishaan Mehra',
        phone: '+91 9800 12 1234',
        email: 'ishaan@example.com',
        course: 'DSA in 30 days',
        language: 'Hindi',
        source: 'Website enquiry',
        stage: 'NEW',
        assignedToId: 'c-priya',
        assignedToName: 'Priya Shetty',
        createdAt: new Date(Date.now() - 3_600_000 * 2).toISOString()
    },
    {
        id: 'l2',
        name: 'Sneha Patil',
        phone: '+91 7700 23 4567',
        course: 'Full-stack TypeScript',
        language: 'English',
        source: 'Instagram',
        stage: 'NEW',
        assignedToId: 'c-rohan',
        assignedToName: 'Rohan Kulkarni',
        createdAt: new Date(Date.now() - 3_600_000 * 6).toISOString()
    },
    {
        id: 'l3',
        name: 'Rohit Gupta',
        phone: '+91 9900 45 6789',
        course: 'System Design Foundations',
        language: 'English',
        source: 'Referral',
        stage: 'DEMO_SCHEDULED',
        assignedToId: 'c-priya',
        assignedToName: 'Priya Shetty',
        nextActionAt: new Date(Date.now() + 3_600_000 * 22).toISOString(),
        createdAt: new Date(Date.now() - 86_400_000).toISOString()
    },
    {
        id: 'l4',
        name: 'Priya Shetty',
        phone: '+91 9123 45 6780',
        course: 'React for Production',
        language: 'English',
        source: 'Organic',
        stage: 'CONVERTED',
        assignedToId: 'c-ananya',
        assignedToName: 'Ananya Rao',
        createdAt: new Date(Date.now() - 86_400_000 * 3).toISOString()
    },
    {
        id: 'l5',
        name: 'Vikram Singh',
        phone: '+91 8800 99 8877',
        course: 'Backend Engineering',
        language: 'Hindi',
        source: 'Cold call',
        stage: 'LOST',
        assignedToId: 'c-rohan',
        assignedToName: 'Rohan Kulkarni',
        note: 'Budget',
        createdAt: new Date(Date.now() - 86_400_000 * 5).toISOString()
    }
]

type Store = {
    leads: TLead[]
    counsellors: TCounsellor[]
    /** Index of the counsellor who will receive the next round-robin enquiry. */
    rrPointer: number

    addLead: (
        lead: Omit<TLead, 'id' | 'createdAt' | 'stage' | 'assignedToId' | 'assignedToName'> & {
            stage?: TStage
            assignedToId?: string
        }
    ) => TLead

    /** Public-form enquiry — always assigns via round-robin. */
    addEnquiry: (enquiry: Omit<TLead, 'id' | 'createdAt' | 'stage' | 'assignedToId' | 'assignedToName'>) => TLead

    moveLead: (id: string, stage: TStage) => void
    reassignLead: (id: string, counsellorId: string) => void
    updateLead: (id: string, patch: Partial<TLead>) => void
    deleteLead: (id: string) => void
    toggleCounsellorActive: (id: string) => void
}

const newId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2)

// Pick the next active counsellor, starting from `pointer`. Advances the
// pointer past anyone inactive (keeps skip-deterministic).
const pickRoundRobin = (counsellors: TCounsellor[], pointer: number): { counsellor: TCounsellor | null; nextPointer: number } => {
    if (counsellors.length === 0) return { counsellor: null, nextPointer: 0 }

    // Try up to N slots, skipping inactive counsellors.
    for (let i = 0; i < counsellors.length; i++) {
        const idx = (pointer + i) % counsellors.length
        const c = counsellors[idx]
        if (c.active) return { counsellor: c, nextPointer: (idx + 1) % counsellors.length }
    }
    return { counsellor: null, nextPointer: pointer }
}

export const useLeadStore = create<Store>()(
    persist(
        (set, get) => ({
            leads: SEED,
            counsellors: COUNSELLORS,
            rrPointer: 0,

            addLead: (lead) => {
                const full: TLead = {
                    id: newId(),
                    stage: 'NEW',
                    ...lead,
                    assignedToId: lead.assignedToId,
                    assignedToName: lead.assignedToId ? get().counsellors.find((c) => c.id === lead.assignedToId)?.name : undefined,
                    createdAt: new Date().toISOString()
                }
                set((s) => ({ leads: [full, ...s.leads] }))
                return full
            },

            addEnquiry: (enquiry) => {
                const { counsellors, rrPointer } = get()
                const { counsellor, nextPointer } = pickRoundRobin(counsellors, rrPointer)
                const full: TLead = {
                    id: newId(),
                    stage: 'NEW',
                    ...enquiry,
                    source: enquiry.source || 'Website enquiry',
                    assignedToId: counsellor?.id,
                    assignedToName: counsellor?.name,
                    createdAt: new Date().toISOString()
                }
                set((s) => ({ leads: [full, ...s.leads], rrPointer: nextPointer }))
                return full
            },

            moveLead: (id, stage) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, stage } : l)) })),

            reassignLead: (id, counsellorId) =>
                set((s) => {
                    const c = s.counsellors.find((x) => x.id === counsellorId)
                    if (!c) return s
                    return {
                        leads: s.leads.map((l) => (l.id === id ? { ...l, assignedToId: c.id, assignedToName: c.name } : l))
                    }
                }),

            updateLead: (id, patch) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),

            deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),

            toggleCounsellorActive: (id) =>
                set((s) => ({
                    counsellors: s.counsellors.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
                }))
        }),
        {
            name: 'learnhub.leads',
            storage: createJSONStorage(() => localStorage),
            version: 2
        }
    )
)

export const STAGE_LABEL: Record<TStage, string> = {
    NEW: 'New leads',
    DEMO_SCHEDULED: 'Demo scheduled',
    CONVERTED: 'Converted',
    LOST: 'Lost'
}

export const STAGE_ORDER: readonly TStage[] = ['NEW', 'DEMO_SCHEDULED', 'CONVERTED', 'LOST']

export const STAGE_TONE: Record<TStage, 'brand' | 'warn' | 'ok' | 'danger'> = {
    NEW: 'brand',
    DEMO_SCHEDULED: 'warn',
    CONVERTED: 'ok',
    LOST: 'danger'
}
