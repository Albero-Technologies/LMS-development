// Student-scoped fees store. Mirrors what `GET /api/v1/payments/me` will return
// once that endpoint lands: the learner's own invoices. Phase 1 persists to
// localStorage so the pay-now demo flow survives reloads.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TFeeStatus = 'PAID' | 'DUE' | 'OVERDUE' | 'REFUNDED'

export type TInvoice = {
    id: string
    number: string
    course: string
    amount: number
    gstPercent: number
    status: TFeeStatus
    issuedAt: string
    dueAt: string
    paidAt?: string
    paymentMethod?: string
    /** Razorpay payment id once the user completes checkout. */
    gatewayRef?: string
}

const iso = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()

const SEED: TInvoice[] = [
    {
        id: 'inv-1',
        number: 'INV-2604-001',
        course: 'System Design Foundations · Module 2 instalment',
        amount: 2499,
        gstPercent: 18,
        status: 'OVERDUE',
        issuedAt: iso(-30),
        dueAt: iso(-5)
    },
    {
        id: 'inv-2',
        number: 'INV-2604-002',
        course: 'Full-stack TypeScript · Cohort fee',
        amount: 5999,
        gstPercent: 18,
        status: 'DUE',
        issuedAt: iso(-3),
        dueAt: iso(9)
    },
    {
        id: 'inv-3',
        number: 'INV-2603-014',
        course: 'DSA in 30 days · Full payment',
        amount: 2999,
        gstPercent: 18,
        status: 'PAID',
        issuedAt: iso(-45),
        dueAt: iso(-35),
        paidAt: iso(-34),
        paymentMethod: 'UPI',
        gatewayRef: 'pay_NQoW5NzRb3Yx21'
    },
    {
        id: 'inv-4',
        number: 'INV-2602-007',
        course: 'System Design Foundations · Module 1 instalment',
        amount: 2500,
        gstPercent: 18,
        status: 'PAID',
        issuedAt: iso(-74),
        dueAt: iso(-64),
        paidAt: iso(-63),
        paymentMethod: 'Card',
        gatewayRef: 'pay_NLoP9cQRf7Kx11'
    }
]

type Store = {
    invoices: TInvoice[]
    payInvoice: (id: string, method: string) => void
    /** Pay everything that's currently DUE or OVERDUE in one call. */
    payAllOverdue: (method: string) => number
}

const newRef = (): string => `pay_${Math.random().toString(36).slice(2, 15)}`

// Compute the derived status every time we read — an invoice can flip from
// DUE → OVERDUE as the due date passes without any state change.
const deriveStatus = (inv: TInvoice): TInvoice => {
    if (inv.status === 'PAID' || inv.status === 'REFUNDED') return inv
    const dueMs = new Date(inv.dueAt).getTime()
    return { ...inv, status: dueMs < Date.now() ? 'OVERDUE' : 'DUE' }
}

export const useFeeStore = create<Store>()(
    persist(
        (set, get) => ({
            invoices: SEED,

            payInvoice: (id, method) =>
                set((s) => ({
                    invoices: s.invoices.map((i) =>
                        i.id === id
                            ? {
                                  ...i,
                                  status: 'PAID',
                                  paidAt: new Date().toISOString(),
                                  paymentMethod: method,
                                  gatewayRef: newRef()
                              }
                            : i
                    )
                })),

            payAllOverdue: (method) => {
                const unpaid = get().invoices.filter(
                    (i) => i.status === 'DUE' || i.status === 'OVERDUE'
                )
                if (unpaid.length === 0) return 0
                const now = new Date().toISOString()
                set((s) => ({
                    invoices: s.invoices.map((i) =>
                        i.status === 'DUE' || i.status === 'OVERDUE'
                            ? { ...i, status: 'PAID', paidAt: now, paymentMethod: method, gatewayRef: newRef() }
                            : i
                    )
                }))
                return unpaid.reduce((n, i) => n + Math.round(i.amount * (1 + i.gstPercent / 100)), 0)
            }
        }),
        {
            name: 'learnhub.fees',
            storage: createJSONStorage(() => localStorage),
            version: 1
        }
    )
)

// Expose a selector that normalises DUE → OVERDUE without mutating the store.
export const useInvoicesLive = (): TInvoice[] => {
    const raw = useFeeStore((s) => s.invoices)
    return raw.map(deriveStatus)
}

export const feeTone: Record<TFeeStatus, 'ok' | 'warn' | 'danger' | 'default'> = {
    PAID: 'ok',
    DUE: 'warn',
    OVERDUE: 'danger',
    REFUNDED: 'default'
}

export const invoiceTotal = (inv: TInvoice): number => Math.round(inv.amount * (1 + inv.gstPercent / 100))
