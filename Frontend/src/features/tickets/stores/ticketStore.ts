import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TStatus = 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED'
export type TPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export type TMessage = {
    id: string
    author: string
    role: 'student' | 'agent' | 'system'
    text: string
    internal?: boolean
    at: string
}

export type TTicket = {
    id: string
    subject: string
    requester: string
    assignee?: string
    status: TStatus
    priority: TPriority
    category: string
    slaDueAt: string // ISO
    createdAt: string
    messages: TMessage[]
}

const newId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2)

const nowIso = () => new Date().toISOString()
const inHrs = (hrs: number) => new Date(Date.now() + hrs * 3_600_000).toISOString()

const SEED: TTicket[] = [
    {
        id: 'T-201',
        subject: 'Payment failed but marked paid',
        requester: 'Ishaan Mehra',
        assignee: 'You',
        status: 'OPEN',
        priority: 'URGENT',
        category: 'Payments',
        slaDueAt: inHrs(-0.5),
        createdAt: new Date(Date.now() - 3_600_000 * 2).toISOString(),
        messages: [
            {
                id: 'm1',
                author: 'Ishaan Mehra',
                role: 'student',
                text: 'I paid for System Design Foundations but my account still says "DUE". Please help.',
                at: new Date(Date.now() - 3_600_000 * 2).toISOString()
            }
        ]
    },
    {
        id: 'T-200',
        subject: 'Cannot access enrolled course',
        requester: 'Sneha Patil',
        status: 'ASSIGNED',
        priority: 'HIGH',
        category: 'Access',
        slaDueAt: inHrs(1.75),
        createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
        messages: [
            {
                id: 'm1',
                author: 'Sneha Patil',
                role: 'student',
                text: "I enrolled yesterday but the Full-stack TS course isn't showing up in my dashboard.",
                at: new Date(Date.now() - 30 * 60_000).toISOString()
            }
        ]
    },
    {
        id: 'T-198',
        subject: 'Invoice GSTIN edit',
        requester: 'Rohit Gupta',
        status: 'ASSIGNED',
        priority: 'NORMAL',
        category: 'Billing',
        slaDueAt: inHrs(22),
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        messages: [
            {
                id: 'm1',
                author: 'Rohit Gupta',
                role: 'student',
                text: 'Can you reissue the invoice with my company GSTIN?',
                at: new Date(Date.now() - 86_400_000).toISOString()
            }
        ]
    },
    {
        id: 'T-190',
        subject: "Quiz submission didn't save",
        requester: 'Priya Shetty',
        status: 'RESOLVED',
        priority: 'NORMAL',
        category: 'Quizzes',
        slaDueAt: inHrs(-72),
        createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
        messages: [
            {
                id: 'm1',
                author: 'Priya Shetty',
                role: 'student',
                text: "My DSA Week 5 attempt didn't save.",
                at: new Date(Date.now() - 3 * 86_400_000).toISOString()
            },
            {
                id: 'm2',
                author: 'Support',
                role: 'agent',
                text: 'Restored your attempt from server logs. Final score 82%, passed.',
                at: new Date(Date.now() - 3 * 86_400_000 + 3_600_000).toISOString()
            }
        ]
    }
]

type Store = {
    tickets: TTicket[]
    addTicket: (patch: Omit<TTicket, 'id' | 'createdAt' | 'messages' | 'status' | 'slaDueAt'> & { messageText: string }) => TTicket
    updateStatus: (id: string, status: TStatus) => void
    updatePriority: (id: string, priority: TPriority) => void
    addMessage: (id: string, msg: Omit<TMessage, 'id' | 'at'>) => void
}

const SLA_BY_PRIORITY: Record<TPriority, number> = { URGENT: 2, HIGH: 4, NORMAL: 24, LOW: 72 }

export const useTicketStore = create<Store>()(
    persist(
        (set) => ({
            tickets: SEED,
            addTicket: (patch) => {
                const ticket: TTicket = {
                    id: `T-${Math.floor(200 + Math.random() * 9999)}`,
                    subject: patch.subject,
                    requester: patch.requester,
                    priority: patch.priority,
                    category: patch.category,
                    status: 'OPEN',
                    slaDueAt: inHrs(SLA_BY_PRIORITY[patch.priority]),
                    createdAt: nowIso(),
                    messages: [
                        {
                            id: newId(),
                            author: patch.requester,
                            role: 'student',
                            text: patch.messageText,
                            at: nowIso()
                        }
                    ]
                }
                set((s) => ({ tickets: [ticket, ...s.tickets] }))
                return ticket
            },
            updateStatus: (id, status) =>
                set((s) => ({
                    tickets: s.tickets.map((t) =>
                        t.id !== id
                            ? t
                            : {
                                  ...t,
                                  status,
                                  messages: [
                                      ...t.messages,
                                      {
                                          id: newId(),
                                          author: 'system',
                                          role: 'system',
                                          text: `Status changed to ${status.toLowerCase()}.`,
                                          at: nowIso()
                                      }
                                  ]
                              }
                    )
                })),
            updatePriority: (id, priority) =>
                set((s) => ({
                    tickets: s.tickets.map((t) => (t.id !== id ? t : { ...t, priority, slaDueAt: inHrs(SLA_BY_PRIORITY[priority]) }))
                })),
            addMessage: (id, msg) =>
                set((s) => ({
                    tickets: s.tickets.map((t) => (t.id !== id ? t : { ...t, messages: [...t.messages, { ...msg, id: newId(), at: nowIso() }] }))
                }))
        }),
        {
            name: 'learnhub.tickets',
            storage: createJSONStorage(() => localStorage),
            version: 1
        }
    )
)

export const PRIORITY_TONE: Record<TPriority, 'danger' | 'warn' | 'default' | 'brand'> = {
    URGENT: 'danger',
    HIGH: 'warn',
    NORMAL: 'brand',
    LOW: 'default'
}
export const STATUS_TONE: Record<TStatus, 'brand' | 'warn' | 'ok' | 'default'> = {
    OPEN: 'brand',
    ASSIGNED: 'warn',
    RESOLVED: 'ok',
    CLOSED: 'default'
}
