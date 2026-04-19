import { GraduationCap, Download } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'

const ENROLLMENTS = [
    { s: 'Ishaan Mehra', c: 'DSA in 30 days', p: 78, st: 'ACTIVE' as const, d: 'Apr 03' },
    { s: 'Sneha Patil', c: 'Full-stack TS', p: 24, st: 'ACTIVE' as const, d: 'Apr 10' },
    { s: 'Rohit Gupta', c: 'System Design', p: 100, st: 'COMPLETED' as const, d: 'Mar 28' }
]

export const EnrollmentsPage = () => {
    const exportCsv = () => {
        const rows = [
            ['Student', 'Course', 'Progress%', 'Status', 'Enrolled'],
            ...ENROLLMENTS.map((e) => [e.s, e.c, String(e.p), e.st, e.d])
        ]
        const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `enrollments-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Enrollments exported')
    }

    return (
        <>
            <PageHeader
                eyebrow="Revenue-generating"
                title="Enrollments"
                description="Active, completed and refunded enrollments. Export for accounting anytime."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Download size={14} />}
                        variant="ghost"
                        onClick={exportCsv}>
                        Export CSV
                    </Button>
                }
            />
            <Card padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                <th className="py-3 px-5">Student</th>
                                <th className="py-3 px-5">Course</th>
                                <th className="py-3 px-5">Progress</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5">Enrolled</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {ENROLLMENTS.map((e) => (
                                <tr
                                    key={`${e.s}-${e.c}`}
                                    className="hover:bg-surface-hover">
                                    <td className="py-3 px-5 text-fg font-medium">{e.s}</td>
                                    <td className="py-3 px-5 text-fg-soft">{e.c}</td>
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden w-32">
                                                <div
                                                    className="h-full bg-[var(--color-brand-500)]"
                                                    style={{ width: `${e.p}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-xs">{e.p}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5">
                                        <Badge tone={e.st === 'COMPLETED' ? 'ok' : 'brand'}>
                                            <GraduationCap size={10} /> {e.st}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-5 text-xs text-fg-muted">{e.d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    )
}
