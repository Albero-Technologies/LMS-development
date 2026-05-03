import { useQuery } from '@tanstack/react-query'
import { Users, Target, IndianRupee } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { Badge } from '@shared/components/ui/Badge'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { listTeamBuckets, type TeamBucket, type TeamBucketCounsellor } from '../services/studentsMonitor.service'

// Team monitoring view — every COUNSELLING_MANAGER + their counsellors with
// rolled-up student / fees / revenue. SA can scope by tenant via the parent
// page's selector. Admins always see their own tenant; managers + counsellors
// see only their own slice (backend handles the filter, this component just
// renders whatever comes back).

export const TeamBucketsTab = ({ tenantSlug }: { tenantSlug?: string }) => {
    const teamsQuery = useQuery({
        queryKey: ['students-monitor', 'team-buckets', { tenantSlug }],
        queryFn: () => listTeamBuckets({ tenantSlug }),
        staleTime: 60_000
    })

    if (teamsQuery.isLoading) {
        return (
            <div className="grid gap-4">
                {[0, 1].map((i) => (
                    <Card key={i}>
                        <Skeleton className="h-5 w-1/3 mb-3" />
                        <Skeleton className="h-4 w-2/3" />
                    </Card>
                ))}
            </div>
        )
    }

    const data = teamsQuery.data
    const empty = !data || (data.buckets.length === 0 && data.unmanagedCounsellors.length === 0)
    if (empty) {
        return (
            <Empty
                icon={<Users size={32} />}
                title="No teams yet"
                description="Once managers and counsellors are added to this tenant, their buckets show up here."
            />
        )
    }

    return (
        <div className="space-y-4">
            {data!.buckets.map((b, i) => (
                <BucketCard key={b.manager?.id ?? `bucket-${i}`} bucket={b} />
            ))}

            {data!.unmanagedCounsellors.length > 0 && (
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-fg">Unmanaged counsellors</h3>
                            <p className="text-xs text-fg-muted">Counsellors without a counselling-manager assigned. Re-assign them from the Users page.</p>
                        </div>
                    </div>
                    <CounsellorTable counsellors={data!.unmanagedCounsellors} showTenant={Boolean(data!.unmanagedCounsellors[0]?.tenant)} />
                </Card>
            )}
        </div>
    )
}

const BucketCard = ({ bucket }: { bucket: TeamBucket }) => {
    const totals = bucket.totals
    const completionPct = totals.feesPaid + totals.feesPending > 0
        ? Math.round((totals.feesPaid / Math.max(totals.feesPaid + totals.feesPending, 1)) * 100)
        : 0
    return (
        <Card>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-fg-muted mb-1">
                        {bucket.tenant ? bucket.tenant.name : 'Team'}
                    </div>
                    <h3 className="text-base font-semibold text-fg truncate">
                        {bucket.manager ? bucket.manager.name : 'Direct counsellors'}
                    </h3>
                    {bucket.manager && (
                        <div className="text-xs text-fg-muted truncate">{bucket.manager.email}</div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge tone="brand">
                        <Users size={11} className="mr-1" />
                        {totals.students} student{totals.students === 1 ? '' : 's'}
                    </Badge>
                    <Badge tone="ok">
                        <Target size={11} className="mr-1" />
                        {completionPct}% paid
                    </Badge>
                    <Badge tone="warn">
                        <IndianRupee size={11} className="mr-1" />
                        {fmtPaiseINR(totals.revenuePaid)} collected
                    </Badge>
                </div>
            </div>

            <CounsellorTable counsellors={bucket.counsellors} />
        </Card>
    )
}

const CounsellorTable = ({
    counsellors,
    showTenant
}: {
    counsellors: (TeamBucketCounsellor & { tenant?: { id: string; name: string; slug: string } })[]
    showTenant?: boolean
}) => {
    if (counsellors.length === 0) {
        return <div className="text-sm text-fg-muted text-center py-4">No counsellors in this team yet.</div>
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-fg-muted border-b">
                        <th className="py-2 px-3">Counsellor</th>
                        {showTenant && <th className="py-2 px-3">Tenant</th>}
                        <th className="py-2 px-3 text-right">Students</th>
                        <th className="py-2 px-3 text-right">Active</th>
                        <th className="py-2 px-3 text-right">Fees paid</th>
                        <th className="py-2 px-3 text-right">Fees pending</th>
                        <th className="py-2 px-3 text-right">Revenue collected</th>
                        <th className="py-2 px-3 text-right">Outstanding</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {counsellors.map((c) => (
                        <tr key={c.id}>
                            <td className="py-2 px-3">
                                <div className="font-medium text-fg">{c.name}</div>
                                <div className="text-xs text-fg-muted">
                                    {c.email}
                                    {c.employeeCode && <span className="ml-2 font-mono">[{c.employeeCode}]</span>}
                                </div>
                            </td>
                            {showTenant && <td className="py-2 px-3 text-xs text-fg-soft">{c.tenant?.name ?? '—'}</td>}
                            <td className="py-2 px-3 text-right text-fg font-medium">{c.studentsCount}</td>
                            <td className="py-2 px-3 text-right">{c.activeStudents}</td>
                            <td className="py-2 px-3 text-right text-[var(--color-success)]">{c.feesPaid}</td>
                            <td className="py-2 px-3 text-right text-[var(--color-warn)]">{c.feesPending}</td>
                            <td className="py-2 px-3 text-right font-medium">{fmtPaiseINR(c.revenuePaid)}</td>
                            <td className="py-2 px-3 text-right text-[var(--color-danger)]">{fmtPaiseINR(c.revenuePending)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
