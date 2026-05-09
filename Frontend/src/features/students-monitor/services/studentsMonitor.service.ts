import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export const STUDENT_CATEGORIES = ['DEMO', 'ACTIVE', 'INACTIVE', 'FEES_PAID', 'FEES_PENDING', 'FOLLOW_UP', 'DEAD'] as const
export type StudentCategory = (typeof STUDENT_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<StudentCategory, string> = {
    DEMO: 'Demo',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    FEES_PAID: 'Fees paid',
    FEES_PENDING: 'Fees pending',
    FOLLOW_UP: 'Follow-up',
    DEAD: 'Dead'
}

// Tones map to Shared Badge component values: brand / ok / warn / danger / purple / default.
export const CATEGORY_TONE: Record<StudentCategory, 'brand' | 'ok' | 'warn' | 'danger' | 'purple' | 'default'> = {
    DEMO: 'warn',
    ACTIVE: 'brand',
    INACTIVE: 'default',
    FEES_PAID: 'ok',
    FEES_PENDING: 'warn',
    FOLLOW_UP: 'purple',
    DEAD: 'danger'
}

// ---- Students ------------------------------------------------------------

export interface MonitorStudent {
    id: string
    name: string
    email: string
    phone: string | null
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
    createdAt: string
    lastLoginAt: string | null
    tenant: { id: string; name: string; slug: string }
    counsellor: { id: string; name: string; email: string } | null
    trainer: { id: string; name: string; email: string } | null
    enrollments: { id: string; status: string; progressPct: number; accessTier: 'DEMO' | 'FULL'; course: { id: string; title: string } | null }[]
    payments: { totalPaid: number; pendingAmount: number; paidCount: number; pendingCount: number }
    primaryCategory: StudentCategory
    flags: Record<StudentCategory, boolean>
}

export interface ListStudentsResponse {
    items: MonitorStudent[]
    total: number
    page: number
    pageSize: number
    scanned: number
    totals: Record<StudentCategory, number>
}

export interface ListStudentsQuery {
    page?: number
    pageSize?: number
    q?: string
    category?: StudentCategory
    tenantSlug?: string
    counsellorId?: string
}

export const listMonitorStudents = async (query: ListStudentsQuery): Promise<ListStudentsResponse> => {
    const { data } = await api.get<Envelope<ListStudentsResponse>>('/students-monitor/students', { params: query })
    return data.data
}

// ---- Team buckets --------------------------------------------------------

export interface TeamBucketCounsellor {
    id: string
    name: string
    email: string
    employeeCode: string | null
    studentsCount: number
    activeStudents: number
    feesPaid: number
    feesPending: number
    revenuePaid: number
    revenuePending: number
}

export interface TeamBucket {
    manager: { id: string; name: string; email: string } | null
    counsellors: TeamBucketCounsellor[]
    totals: {
        students: number
        active: number
        feesPaid: number
        feesPending: number
        revenuePaid: number
        revenuePending: number
    }
    tenant?: { id: string; name: string; slug: string }
}

export interface TeamBucketsResponse {
    buckets: TeamBucket[]
    unmanagedCounsellors: (TeamBucketCounsellor & { tenant?: { id: string; name: string; slug: string } })[]
}

export const listTeamBuckets = async (params: { tenantSlug?: string }): Promise<TeamBucketsResponse> => {
    const { data } = await api.get<Envelope<TeamBucketsResponse>>('/students-monitor/team-buckets', { params })
    return data.data
}

// ---- Stats timeline ------------------------------------------------------

export type StatsWindow = 'hour' | 'day' | 'week' | 'month' | 'year' | 'custom'

export interface TimelineBucket {
    bucket: string
    label: string
    signups: number
    enrolments: number
    revenue: number
    enquiries: number
    converted: number
    lost: number
}

export interface StatsTimelineResponse {
    from: string
    to: string
    granularity: 'minute' | 'hour' | 'day' | 'month'
    window: StatsWindow
    series: TimelineBucket[]
    totals: {
        signups: number
        enrolments: number
        revenue: number
        enquiries: number
        converted: number
        lost: number
    }
}

export interface StatsTimelineQuery {
    window?: StatsWindow
    from?: string
    to?: string
    tenantSlug?: string
    counsellorId?: string
}

export const getStatsTimeline = async (query: StatsTimelineQuery): Promise<StatsTimelineResponse> => {
    const { data } = await api.get<Envelope<StatsTimelineResponse>>('/students-monitor/stats', { params: query })
    return data.data
}
