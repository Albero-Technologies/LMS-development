// User detail drawer-style modal — opens when a row in UsersPage is clicked.
// Shows the full picture for the user (profile, onboarding details if a
// student, enrolments, invoice/fee history) and lets allowed roles edit
// basic profile fields inline.
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Mail, Phone, Building2, GraduationCap, Briefcase, MapPin, BookOpen, FileText, Edit3, X } from 'lucide-react'
import { Modal } from '@shared/components/ui/Modal'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input } from '@shared/components/ui/Input'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Tabs } from '@shared/components/ui/Tabs'
import { fmtPaiseINR, fmtDate } from '@shared/libs/pdf'
import { getUserDetail, updateUser, type UserDetail, type UserInvoice } from '../services/user.service'

type Tab = 'profile' | 'fees' | 'enrolments'

interface Props {
    open: boolean
    userId: string | null
    canEdit: boolean
    onClose: () => void
}

export const UserDetailModal = ({ open, userId, canEdit, onClose }: Props) => {
    const queryClient = useQueryClient()
    const [tab, setTab] = useState<Tab>('profile')
    const [editing, setEditing] = useState(false)

    const detailQuery = useQuery({
        queryKey: ['users', userId, 'detail'],
        queryFn: () => getUserDetail(userId!),
        enabled: open && !!userId,
        staleTime: 30_000
    })

    // Reset tab + edit-state when the modal opens for a different user.
    useEffect(() => {
        if (!open) return
        setTab('profile')
        setEditing(false)
    }, [open, userId])

    const detail = detailQuery.data ?? null

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={detail ? `${detail.firstName} ${detail.lastName}`.trim() || detail.email : 'User'}
            description={detail?.email}
            size="lg">
            {detailQuery.isLoading || !detail ? (
                <div className="space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-32" />
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Badge tone={detail.status === 'ACTIVE' ? 'ok' : detail.status === 'PENDING' ? 'warn' : 'danger'}>{detail.status}</Badge>
                        <Badge tone="brand">{detail.role}</Badge>
                        {detail.tenant && <Badge>/{detail.tenant.slug}</Badge>}
                        {canEdit && detail.role !== 'SUPER_ADMIN' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={editing ? <X size={12} /> : <Edit3 size={12} />}
                                onClick={() => setEditing((v) => !v)}>
                                {editing ? 'Cancel' : 'Edit'}
                            </Button>
                        )}
                    </div>

                    <Tabs<Tab>
                        tabs={[
                            { value: 'profile', label: 'Profile' },
                            { value: 'fees', label: `Fees (${detail.invoices.length})` },
                            { value: 'enrolments', label: `Enrolments (${detail.enrollments.length})` }
                        ]}
                        value={tab}
                        onChange={setTab}
                        className="mb-4"
                    />

                    {tab === 'profile' && (
                        <ProfilePanel
                            detail={detail}
                            editing={editing}
                            onCancel={() => setEditing(false)}
                            onSaved={() => {
                                setEditing(false)
                                void queryClient.invalidateQueries({ queryKey: ['users'] })
                                void queryClient.invalidateQueries({ queryKey: ['users', detail.id, 'detail'] })
                            }}
                        />
                    )}
                    {tab === 'fees' && <FeesPanel invoices={detail.invoices} />}
                    {tab === 'enrolments' && <EnrolmentsPanel detail={detail} />}
                </>
            )}
        </Modal>
    )
}

const ProfilePanel = ({
    detail,
    editing,
    onCancel,
    onSaved
}: {
    detail: UserDetail
    editing: boolean
    onCancel: () => void
    onSaved: () => void
}) => {
    const [firstName, setFirstName] = useState(detail.firstName)
    const [lastName, setLastName] = useState(detail.lastName)
    const [phone, setPhone] = useState(detail.phone ?? '')

    const mutation = useMutation({
        mutationFn: () => updateUser(detail.id, { firstName, lastName, phone: phone || undefined }),
        onSuccess: () => {
            toast.success('Profile updated')
            onSaved()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save')
    })

    const sig = detail.studentSignup
    const ed = sig?.extra?.education as { graduation?: Record<string, unknown>; masters?: Record<string, unknown> } | undefined
    const prof = sig?.extra?.professional as
        | {
              role?: string
              industry?: string
              totalExperienceYears?: number
              ctcLakhs?: number
              description?: string
          }
        | undefined

    return (
        <div className="grid lg:grid-cols-2 gap-4">
            <Card>
                <h3 className="text-sm font-semibold text-fg mb-3">Contact</h3>
                {editing ? (
                    <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <Input
                                label="First name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <Input
                                label="Last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <Input
                            label="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                leftIcon={<Save size={12} />}
                                loading={mutation.isPending}
                                onClick={() => mutation.mutate()}>
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 text-sm">
                        <DetailRow
                            icon={<Mail size={14} />}
                            label="Email"
                            value={detail.email}
                        />
                        <DetailRow
                            icon={<Phone size={14} />}
                            label="Phone"
                            value={detail.phone}
                        />
                        <DetailRow
                            icon={<Building2 size={14} />}
                            label="Joined"
                            value={fmtDate(detail.createdAt)}
                        />
                        <DetailRow
                            icon={<Building2 size={14} />}
                            label="Last login"
                            value={fmtDate(detail.lastLoginAt)}
                        />
                        {detail.manager && (
                            <DetailRow
                                icon={<Building2 size={14} />}
                                label="Manager"
                                value={`${detail.manager.firstName} ${detail.manager.lastName}`.trim() || detail.manager.email}
                            />
                        )}
                    </div>
                )}
            </Card>

            {sig && (
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3">Onboarding</h3>
                    <div className="space-y-2 text-sm">
                        {sig.counsellor && (
                            <DetailRow
                                icon={<Building2 size={14} />}
                                label="Enrolled by"
                                value={`${sig.counsellor.firstName} ${sig.counsellor.lastName}`.trim() || sig.counsellor.email}
                            />
                        )}
                        {(sig.address || sig.city) && (
                            <DetailRow
                                icon={<MapPin size={14} />}
                                label="Address"
                                value={sig.address || [sig.city, sig.state].filter(Boolean).join(', ')}
                            />
                        )}
                        {sig.qualification && (
                            <DetailRow
                                icon={<GraduationCap size={14} />}
                                label="Qualification"
                                value={sig.qualification}
                            />
                        )}
                        {sig.interest && (
                            <DetailRow
                                icon={<BookOpen size={14} />}
                                label="Interest"
                                value={sig.interest}
                            />
                        )}
                        {sig.notes && (
                            <DetailRow
                                icon={<FileText size={14} />}
                                label="Notes"
                                value={sig.notes}
                            />
                        )}
                    </div>
                </Card>
            )}

            {(ed?.graduation || ed?.masters) && (
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3 inline-flex items-center gap-2">
                        <GraduationCap size={14} /> Education
                    </h3>
                    {ed?.graduation && (
                        <EducationLine
                            label="Graduation"
                            entry={ed.graduation}
                        />
                    )}
                    {ed?.masters && (
                        <EducationLine
                            label="Masters"
                            entry={ed.masters}
                        />
                    )}
                </Card>
            )}

            {prof && (
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3 inline-flex items-center gap-2">
                        <Briefcase size={14} /> Professional
                    </h3>
                    <div className="space-y-2 text-sm">
                        {prof.role && (
                            <DetailRow
                                label="Role"
                                value={prof.role}
                            />
                        )}
                        {prof.industry && (
                            <DetailRow
                                label="Industry"
                                value={prof.industry}
                            />
                        )}
                        {typeof prof.totalExperienceYears === 'number' && (
                            <DetailRow
                                label="Experience"
                                value={`${prof.totalExperienceYears} yrs`}
                            />
                        )}
                        {typeof prof.ctcLakhs === 'number' && (
                            <DetailRow
                                label="CTC"
                                value={`₹${prof.ctcLakhs} L`}
                            />
                        )}
                        {prof.description && (
                            <DetailRow
                                label="About"
                                value={prof.description}
                            />
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}

const FeesPanel = ({ invoices }: { invoices: UserInvoice[] }) => {
    const total = invoices.reduce((n, i) => n + i.totalAmount, 0)
    const paid = invoices.filter((i) => i.status === 'PAID').reduce((n, i) => n + i.totalAmount, 0)
    const pending = invoices.filter((i) => i.status === 'DUE' || i.status === 'FAILED').reduce((n, i) => n + i.totalAmount, 0)

    return (
        <Card padded={false}>
            <div className="grid grid-cols-3 gap-px bg-[var(--color-border)]">
                <KpiTile label="Total billed" value={fmtPaiseINR(total)} />
                <KpiTile label="Paid" value={fmtPaiseINR(paid)} />
                <KpiTile label="Outstanding" value={fmtPaiseINR(pending)} />
            </div>
            {invoices.length === 0 ? (
                <div className="p-6 text-sm text-fg-muted text-center">No invoices yet.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-fg-muted bg-surface-2">
                                <th className="py-2.5 px-4">Invoice</th>
                                <th className="py-2.5 px-4">Course</th>
                                <th className="py-2.5 px-4">Amount</th>
                                <th className="py-2.5 px-4">Status</th>
                                <th className="py-2.5 px-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {invoices.map((i) => (
                                <tr key={i.id}>
                                    <td className="py-2.5 px-4 font-mono text-xs">{i.number}</td>
                                    <td className="py-2.5 px-4">{i.enrollment?.course?.title ?? '—'}</td>
                                    <td className="py-2.5 px-4 font-mono">{fmtPaiseINR(i.totalAmount)}</td>
                                    <td className="py-2.5 px-4">
                                        <Badge tone={i.status === 'PAID' ? 'ok' : i.status === 'DUE' ? 'warn' : i.status === 'FAILED' ? 'danger' : 'default'}>
                                            {i.status}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-4 text-xs text-fg-muted">{fmtDate(i.paidAt ?? i.dueAt ?? i.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    )
}

const EnrolmentsPanel = ({ detail }: { detail: UserDetail }) => {
    if (detail.enrollments.length === 0) {
        return <Card><div className="text-sm text-fg-muted text-center py-6">No enrolments yet.</div></Card>
    }
    return (
        <Card padded={false}>
            <ul className="divide-y">
                {detail.enrollments.map((e) => (
                    <li
                        key={e.id}
                        className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-fg truncate">{e.course?.title ?? 'Untitled course'}</div>
                            <div className="text-xs text-fg-muted">Enrolled {fmtDate(e.createdAt)}</div>
                        </div>
                        <Badge tone={e.status === 'ACTIVE' ? 'ok' : e.status === 'COMPLETED' ? 'brand' : 'default'}>{e.status}</Badge>
                    </li>
                ))}
            </ul>
        </Card>
    )
}

const KpiTile = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-surface p-4">
        <div className="text-[11px] uppercase tracking-wider text-fg-muted">{label}</div>
        <div className="mt-1 text-base font-semibold text-fg font-mono">{value}</div>
    </div>
)

const DetailRow = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | null | undefined }) => (
    <div className="flex items-start justify-between gap-4 text-sm">
        <span className="text-fg-muted inline-flex items-center gap-1.5 shrink-0">
            {icon}
            {label}
        </span>
        <span className="text-fg text-right break-words">{value || '—'}</span>
    </div>
)

const EducationLine = ({ label, entry }: { label: string; entry: Record<string, unknown> }) => {
    const degree = (entry.degree as string | undefined) ?? '—'
    const inst = (entry.institution as string | undefined) ?? ''
    const year = entry.yearOfPassing
    const pct = entry.percentage
    return (
        <div className="border-b last:border-b-0 py-2.5">
            <div className="text-[11px] uppercase tracking-wider text-fg-muted">{label}</div>
            <div className="text-sm text-fg">{degree}</div>
            {inst && <div className="text-xs text-fg-soft">{inst}</div>}
            <div className="text-[11px] text-fg-muted mt-0.5 font-mono">
                {typeof year === 'number' ? `Class of ${year}` : ''}
                {typeof pct === 'number' ? ` · ${pct}%` : ''}
            </div>
        </div>
    )
}
