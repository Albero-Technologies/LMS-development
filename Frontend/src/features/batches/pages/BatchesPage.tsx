import { CalendarCheck, Users, Plus, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'

const BATCHES = [
    {
        id: 'b1',
        name: 'Batch 2026 · April cohort',
        students: 42,
        capacity: 60,
        trainer: 'Anuj Verma',
        start: 'Apr 15',
        status: 'running' as const
    },
    {
        id: 'b2',
        name: 'Weekend · DSA',
        students: 28,
        capacity: 40,
        trainer: 'Priya Iyer',
        start: 'May 04',
        status: 'upcoming' as const
    },
    {
        id: 'b3',
        name: 'Corporate · Kintsu',
        students: 15,
        capacity: 15,
        trainer: 'Rohan Das',
        start: 'Mar 01',
        status: 'ended' as const
    }
]

const STATUS_TONE = {
    running: 'ok',
    upcoming: 'brand',
    ended: 'default'
} as const

export const BatchesPage = () => (
    <>
        <PageHeader
            eyebrow="Operations"
            title="Batches"
            description="Group students by cohort. Assign trainers, transfer students, take attendance."
            actions={
                <Button
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    onClick={() => toast.info('Batch creation coming next — wiring to POST /batches')}>
                    New batch
                </Button>
            }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BATCHES.map((b) => {
                const pct = Math.round((b.students / b.capacity) * 100)
                return (
                    <Card key={b.id}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center">
                                <CalendarCheck size={18} />
                            </div>
                            <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
                        </div>
                        <h3 className="text-base font-semibold text-fg">{b.name}</h3>
                        <div className="mt-2 flex items-center gap-3 text-xs text-fg-muted">
                            <span className="inline-flex items-center gap-1">
                                <Users size={12} />
                                {b.students}/{b.capacity}
                            </span>
                            <span>·</span>
                            <span>{b.trainer}</span>
                            <span>·</span>
                            <span>Starts {b.start}</span>
                        </div>
                        <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--color-brand-500)]"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                rightIcon={<ArrowRight size={14} />}
                                onClick={() => toast.info('Batch detail page coming next.')}>
                                Manage
                            </Button>
                        </div>
                    </Card>
                )
            })}
        </div>
    </>
)
