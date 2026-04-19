import { useMemo, useState, type DragEvent } from 'react'
import { Plus, Phone, Mail, MessageCircle, Trash2, Calendar, MoreHorizontal, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Modal } from '@shared/components/ui/Modal'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { cn } from '@shared/helpers/cn'
import {
    useLeadStore,
    STAGE_LABEL,
    STAGE_ORDER,
    STAGE_TONE,
    type TLead,
    type TStage
} from '../stores/leadStore'

const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime()
    const min = Math.round(diff / 60_000)
    if (min < 60) return `${min}m ago`
    const hr = Math.round(min / 60)
    if (hr < 48) return `${hr}h ago`
    return `${Math.round(hr / 24)}d ago`
}

export const LeadPipelinePage = () => {
    const leads = useLeadStore((s) => s.leads)
    const moveLead = useLeadStore((s) => s.moveLead)
    const deleteLead = useLeadStore((s) => s.deleteLead)

    const [addOpen, setAddOpen] = useState(false)
    const [dragOverStage, setDragOverStage] = useState<TStage | null>(null)

    const columns = useMemo(() => {
        const buckets = Object.fromEntries(STAGE_ORDER.map((s) => [s, [] as TLead[]])) as Record<TStage, TLead[]>
        for (const lead of leads) buckets[lead.stage].push(lead)
        return buckets
    }, [leads])

    const onDragStart = (e: DragEvent<HTMLElement>, lead: TLead) => {
        e.dataTransfer.setData('text/lead-id', lead.id)
        e.dataTransfer.setData('text/from-stage', lead.stage)
        e.dataTransfer.effectAllowed = 'move'
    }
    const onDragOver = (e: DragEvent<HTMLElement>, stage: TStage) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverStage(stage)
    }
    const onDragLeave = () => setDragOverStage(null)
    const onDrop = (e: DragEvent<HTMLElement>, stage: TStage) => {
        e.preventDefault()
        setDragOverStage(null)
        const id = e.dataTransfer.getData('text/lead-id')
        const from = e.dataTransfer.getData('text/from-stage') as TStage
        if (!id || from === stage) return
        moveLead(id, stage)
        toast.success(`Moved to ${STAGE_LABEL[stage]}`)
    }

    return (
        <>
            <PageHeader
                eyebrow="Admissions"
                title="Lead pipeline"
                description="Drag cards across stages. Call / WhatsApp / email directly from each card."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => setAddOpen(true)}>
                        New lead
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {STAGE_ORDER.map((stage) => {
                    const bucket = columns[stage]
                    const isDragOver = dragOverStage === stage
                    return (
                        <Card
                            key={stage}
                            padded={false}
                            className={cn(
                                'flex flex-col min-h-[420px] transition-colors',
                                isDragOver && 'ring-2 ring-[var(--color-brand-500)]'
                            )}>
                            <header
                                className="p-4 border-b flex items-center justify-between"
                                onDragOver={(e) => onDragOver(e, stage)}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, stage)}>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-fg">{STAGE_LABEL[stage]}</h3>
                                    <Badge tone={STAGE_TONE[stage]}>{bucket.length}</Badge>
                                </div>
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label="Stage actions">
                                    <MoreHorizontal size={14} />
                                </Button>
                            </header>

                            <div
                                className="p-3 space-y-2.5 flex-1 overflow-y-auto"
                                onDragOver={(e) => onDragOver(e, stage)}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, stage)}>
                                {bucket.length === 0 && (
                                    <div className="text-xs text-fg-muted px-2 py-6 text-center border border-dashed rounded-md">
                                        Drop leads here
                                    </div>
                                )}
                                {bucket.map((lead) => (
                                    <LeadCard
                                        key={lead.id}
                                        lead={lead}
                                        onDragStart={(e) => onDragStart(e, lead)}
                                        onDelete={() => {
                                            if (window.confirm(`Delete ${lead.name}?`)) deleteLead(lead.id)
                                        }}
                                        onMove={(s) => moveLead(lead.id, s)}
                                    />
                                ))}
                            </div>
                        </Card>
                    )
                })}
            </div>

            <AddLeadModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
            />
        </>
    )
}

const LeadCard = ({
    lead,
    onDragStart,
    onDelete,
    onMove
}: {
    lead: TLead
    onDragStart: (e: DragEvent<HTMLElement>) => void
    onDelete: () => void
    onMove: (s: TStage) => void
}) => {
    const [menuOpen, setMenuOpen] = useState(false)
    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="relative rounded-md bg-surface-2 border p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-fg truncate">{lead.name}</div>
                    <div className="text-xs text-fg-soft truncate">
                        {lead.course}
                        {lead.language ? ` · ${lead.language}` : ''}
                    </div>
                </div>
                <div className="relative">
                    <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="More"
                        onClick={() => setMenuOpen((v) => !v)}>
                        <MoreHorizontal size={13} />
                    </Button>
                    {menuOpen && (
                        <>
                            <button
                                type="button"
                                aria-label="Close menu"
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-8 z-20 bg-surface border rounded-md shadow-lift text-sm py-1 w-48">
                                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-fg-muted font-medium">
                                    Move to
                                </div>
                                {STAGE_ORDER.filter((s) => s !== lead.stage).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-hover text-left"
                                        onClick={() => {
                                            onMove(s)
                                            setMenuOpen(false)
                                        }}>
                                        {STAGE_LABEL[s]}
                                        <ChevronRight size={12} />
                                    </button>
                                ))}
                                <div className="my-1 border-t" />
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[var(--color-danger)] hover:bg-surface-hover"
                                    onClick={() => {
                                        setMenuOpen(false)
                                        onDelete()
                                    }}>
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-fg-muted">
                <span>{lead.source}</span>
                <span>·</span>
                <span>{timeAgo(lead.createdAt)}</span>
            </div>

            {lead.nextActionAt && (
                <div className="mt-2 text-[11px] text-[var(--color-warn)] inline-flex items-center gap-1.5">
                    <Calendar size={11} /> Follow up {timeAgo(lead.nextActionAt).replace(' ago', '')}
                </div>
            )}

            <div className="mt-3 flex items-center gap-1.5">
                <a
                    href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                    className="btn btn-ghost btn-sm flex-1"
                    aria-label={`Call ${lead.name}`}
                    onClick={(e) => e.stopPropagation()}>
                    <Phone size={13} />
                </a>
                <a
                    href={`https://wa.me/${lead.phone.replace(/\D+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm flex-1"
                    aria-label={`WhatsApp ${lead.name}`}
                    onClick={(e) => e.stopPropagation()}>
                    <MessageCircle size={13} />
                </a>
                {lead.email && (
                    <a
                        href={`mailto:${lead.email}`}
                        className="btn btn-ghost btn-sm flex-1"
                        aria-label={`Email ${lead.name}`}
                        onClick={(e) => e.stopPropagation()}>
                        <Mail size={13} />
                    </a>
                )}
            </div>
        </div>
    )
}

const AddLeadModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const add = useLeadStore((s) => s.addLead)
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [course, setCourse] = useState('System Design Foundations')
    const [source, setSource] = useState('WhatsApp')

    const reset = () => {
        setName('')
        setPhone('')
        setEmail('')
        setCourse('System Design Foundations')
        setSource('WhatsApp')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        add({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, course, source })
        toast.success('Lead added to the pipeline')
        reset()
        onClose()
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="New lead"
            description="Capture just enough to call — the rest comes later."
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            reset()
                            onClose()
                        }}>
                        Cancel
                    </Button>
                    <Button
                        form="new-lead-form"
                        type="submit"
                        disabled={name.trim().length < 2 || phone.trim().length < 6}>
                        Add to pipeline
                    </Button>
                </>
            }>
            <form
                id="new-lead-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Input
                    label="Phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 ..."
                />
                <Input
                    label="Email (optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Select
                    label="Course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}>
                    <option>System Design Foundations</option>
                    <option>Full-stack TypeScript</option>
                    <option>DSA in 30 days</option>
                    <option>React for Production</option>
                </Select>
                <Select
                    label="Source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}>
                    <option>WhatsApp</option>
                    <option>Instagram</option>
                    <option>Referral</option>
                    <option>Organic</option>
                    <option>Cold call</option>
                </Select>
            </form>
        </Modal>
    )
}
