import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Lock, LockOpen, Mail, Send, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Modal } from '@shared/components/ui/Modal'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { listAllTenants } from '../services/tenant.service'
import {
    bulkUpdateDemo,
    listDemoEnrolments,
    sendDemoPaymentReminder,
    updateDemoEnrolment,
    type DemoEnrolmentRow
} from '../services/demoMode.service'

// Per-student Demo Mode console — searchable table + per-row toggle +
// bulk actions. Used by ADMIN + SUPER_ADMIN; counsellors and managers
// hit the same endpoint in read-only mode (the controls just no-op for
// them server-side, but we hide them in the UI for clarity).

const ACCESS_TONE: Record<DemoEnrolmentRow['accessTier'], 'warn' | 'ok'> = {
    DEMO: 'warn',
    FULL: 'ok'
}

const fmtDate = (iso: string | null): string => {
    if (!iso) return '—'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

export const DemoModeStudentsTab = () => {
    const role = useAuthStore((s) => s.user?.role)
    const isSuperAdmin = role === ROLES.SUPER_ADMIN
    const canEdit = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN

    const queryClient = useQueryClient()

    const [search, setSearch] = useState('')
    const [accessTier, setAccessTier] = useState<'ALL' | 'DEMO' | 'FULL'>('ALL')
    const [tenantSlug, setTenantSlug] = useState('__all__')
    const [page, setPage] = useState(1)
    const pageSize = 50
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [upgradeRow, setUpgradeRow] = useState<DemoEnrolmentRow | null>(null)

    const tenantOptionsQuery = useQuery({
        queryKey: ['admin', 'tenants', 'minimal'],
        queryFn: listAllTenants,
        enabled: isSuperAdmin,
        staleTime: 5 * 60_000
    })

    const enrolmentsQuery = useQuery({
        queryKey: ['demo-mode', 'enrolments', { search, accessTier, tenantSlug, page }],
        queryFn: () =>
            listDemoEnrolments({
                page,
                pageSize,
                q: search || undefined,
                accessTier: accessTier === 'ALL' ? undefined : accessTier,
                tenantSlug: isSuperAdmin ? tenantSlug : undefined
            }),
        staleTime: 30_000,
        placeholderData: (prev) => prev
    })

    const items = enrolmentsQuery.data?.items ?? []

    const updateMutation = useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & Parameters<typeof updateDemoEnrolment>[1]) =>
            updateDemoEnrolment(id, payload),
        onSuccess: () => {
            toast.success('Enrolment updated')
            void queryClient.invalidateQueries({ queryKey: ['demo-mode'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not update enrolment')
    })

    const bulkMutation = useMutation({
        mutationFn: bulkUpdateDemo,
        onSuccess: (res) => {
            toast.success(`${res.ok.length} updated · ${res.failed.length} failed`)
            setSelected(new Set())
            void queryClient.invalidateQueries({ queryKey: ['demo-mode'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Bulk update failed')
    })

    const reminderMutation = useMutation({
        mutationFn: (id: string) => sendDemoPaymentReminder(id),
        onSuccess: (res) => toast.success(`Reminder sent to ${res.sentTo}`),
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not send reminder')
    })

    const allSelected = items.length > 0 && items.every((i) => selected.has(i.id))
    const toggleAll = () => {
        if (allSelected) setSelected(new Set())
        else setSelected(new Set(items.map((i) => i.id)))
    }
    const toggleOne = (id: string) => {
        const next = new Set(selected)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelected(next)
    }

    const summary = useMemo(() => {
        return {
            total: enrolmentsQuery.data?.total ?? 0,
            demoOnPage: items.filter((i) => i.accessTier === 'DEMO').length,
            fullOnPage: items.filter((i) => i.accessTier === 'FULL').length
        }
    }, [items, enrolmentsQuery.data])

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <SummaryTile label="Total enrolments" value={summary.total} />
                <SummaryTile label="DEMO on this page" value={summary.demoOnPage} tone="warn" />
                <SummaryTile label="FULL on this page" value={summary.fullOnPage} tone="ok" />
                <SummaryTile label="Selected" value={selected.size} tone="info" />
            </div>

            <Card padded={false} className="mb-4">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Search student name / email"
                            leftIcon={<Search size={14} />}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPage(1)
                            }}
                        />
                    </div>
                    <Select
                        aria-label="Access tier"
                        value={accessTier}
                        onChange={(e) => {
                            setAccessTier(e.target.value as typeof accessTier)
                            setPage(1)
                        }}>
                        <option value="ALL">All access</option>
                        <option value="DEMO">DEMO only</option>
                        <option value="FULL">FULL only</option>
                    </Select>
                    {isSuperAdmin && (
                        <Select
                            aria-label="Tenant"
                            value={tenantSlug}
                            onChange={(e) => {
                                setTenantSlug(e.target.value)
                                setPage(1)
                            }}>
                            <option value="__all__">All tenants</option>
                            {tenantOptionsQuery.data?.map((t) => (
                                <option key={t.id} value={t.slug}>
                                    {t.name}
                                </option>
                            ))}
                        </Select>
                    )}

                    {canEdit && selected.size > 0 && (
                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={<Lock size={12} />}
                                loading={bulkMutation.isPending}
                                onClick={() =>
                                    bulkMutation.mutate({
                                        enrolmentIds: Array.from(selected),
                                        accessTier: 'DEMO'
                                    })
                                }>
                                Set DEMO ({selected.size})
                            </Button>
                            <Button
                                size="sm"
                                leftIcon={<LockOpen size={12} />}
                                loading={bulkMutation.isPending}
                                onClick={() => {
                                    const reason = window.prompt('Audit reason for force-unlocking these enrolments?')
                                    if (!reason) return
                                    bulkMutation.mutate({
                                        enrolmentIds: Array.from(selected),
                                        accessTier: 'FULL',
                                        manualUpgradeReason: reason
                                    })
                                }}>
                                Set FULL ({selected.size})
                            </Button>
                        </div>
                    )}
                </div>

                {enrolmentsQuery.isLoading ? (
                    <div className="p-6 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                ) : items.length === 0 ? (
                    <Empty
                        icon={<AlertCircle size={32} />}
                        title="No enrolments match"
                        description="Adjust filters or search to see more rows."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wide text-fg-muted bg-surface-2">
                                    {canEdit && (
                                        <th className="py-2.5 px-4 w-8">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                aria-label="Select all"
                                            />
                                        </th>
                                    )}
                                    <th className="py-2.5 px-4 font-semibold">Student</th>
                                    <th className="py-2.5 px-4 font-semibold">Course</th>
                                    <th className="py-2.5 px-4 font-semibold">Access</th>
                                    <th className="py-2.5 px-4 font-semibold">Lesson limit</th>
                                    <th className="py-2.5 px-4 font-semibold">Payment</th>
                                    <th className="py-2.5 px-4 font-semibold">Created</th>
                                    <th className="py-2.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((row) => (
                                    <tr key={row.id} className="hover:bg-surface-hover">
                                        {canEdit && (
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(row.id)}
                                                    onChange={() => toggleOne(row.id)}
                                                    aria-label={`Select ${row.user.name}`}
                                                />
                                            </td>
                                        )}
                                        <td className="py-3 px-4">
                                            <div className="text-fg font-medium">{row.user.name}</div>
                                            <div className="text-xs text-fg-muted truncate">{row.user.email}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm text-fg">{row.course.title}</div>
                                            {!row.course.demoEnabled && (
                                                <div className="text-[10px] text-fg-muted">Demo disabled at course level</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge tone={ACCESS_TONE[row.accessTier]}>{row.accessTier}</Badge>
                                            {row.demoExpiresAt && (
                                                <div className="text-[10px] text-fg-muted mt-1">expires {fmtDate(row.demoExpiresAt)}</div>
                                            )}
                                            {row.manualUpgradeReason && (
                                                <div className="text-[10px] text-fg-muted mt-1 truncate max-w-[180px]" title={row.manualUpgradeReason}>
                                                    Manual: {row.manualUpgradeReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {canEdit ? (
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    className="w-20 !py-1"
                                                    defaultValue={row.demoLessonLimit ?? row.course.demoLessonDefault}
                                                    onBlur={(e) => {
                                                        const next = e.target.value === '' ? null : Math.max(0, Number(e.target.value))
                                                        if (next === row.demoLessonLimit) return
                                                        updateMutation.mutate({ id: row.id, demoLessonLimit: next })
                                                    }}
                                                />
                                            ) : (
                                                <span className="font-mono text-xs">{row.demoLessonLimit ?? row.course.demoLessonDefault}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge tone={row.paymentStatus === 'PAID' ? 'ok' : row.paymentStatus === 'PENDING' ? 'warn' : 'default'}>
                                                {row.paymentStatus}
                                            </Badge>
                                            {row.pendingAmount > 0 && (
                                                <div className="text-[10px] text-fg-muted mt-1">{fmtPaiseINR(row.pendingAmount)} due</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-xs text-fg-muted">{fmtDate(row.createdAt)}</td>
                                        <td className="py-3 px-4 text-right">
                                            {canEdit && row.accessTier === 'DEMO' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<LockOpen size={12} />}
                                                    onClick={() => setUpgradeRow(row)}>
                                                    Upgrade
                                                </Button>
                                            )}
                                            {canEdit && row.accessTier === 'FULL' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<Lock size={12} />}
                                                    onClick={() =>
                                                        updateMutation.mutate({ id: row.id, accessTier: 'DEMO' })
                                                    }>
                                                    Demo
                                                </Button>
                                            )}
                                            {canEdit && row.pendingAmount > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<Mail size={12} />}
                                                    loading={reminderMutation.isPending && reminderMutation.variables === row.id}
                                                    onClick={() => reminderMutation.mutate(row.id)}>
                                                    Remind
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {enrolmentsQuery.data && enrolmentsQuery.data.total > pageSize && (
                    <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-fg-muted">
                        <span>
                            Page {enrolmentsQuery.data.page} · showing {items.length} of {enrolmentsQuery.data.total}
                        </span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                Previous
                            </Button>
                            <Button size="sm" variant="ghost" disabled={items.length < pageSize} onClick={() => setPage((p) => p + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <ManualUpgradeModal
                row={upgradeRow}
                onClose={() => setUpgradeRow(null)}
                onSubmit={(reason) => {
                    if (!upgradeRow) return
                    updateMutation.mutate({ id: upgradeRow.id, accessTier: 'FULL', manualUpgradeReason: reason })
                    setUpgradeRow(null)
                }}
            />
        </>
    )
}

const SummaryTile = ({ label, value, tone = 'default' }: { label: string; value: number | string; tone?: 'default' | 'warn' | 'ok' | 'info' }) => {
    const accent = {
        default: 'bg-fg-muted',
        warn: 'bg-[var(--color-warn,#f59e0b)]',
        ok: 'bg-[var(--color-success,#10b981)]',
        info: 'bg-[var(--color-brand-500)]'
    }[tone]
    return (
        <Card className="!p-4 relative overflow-hidden">
            <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} aria-hidden />
            <div className="pl-2">
                <div className="text-[11px] uppercase tracking-wide text-fg-muted">{label}</div>
                <div className="mt-1 text-2xl font-bold text-fg font-mono">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            </div>
        </Card>
    )
}

const ManualUpgradeModal = ({ row, onClose, onSubmit }: { row: DemoEnrolmentRow | null; onClose: () => void; onSubmit: (reason: string) => void }) => {
    const [reason, setReason] = useState('')
    return (
        <Modal
            open={!!row}
            onClose={onClose}
            title={row ? `Upgrade ${row.user.name} to FULL access` : ''}
            description="This bypasses the payment gate. The reason is saved on the audit log + visible on the SA panel next to the row."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        leftIcon={<Send size={14} />}
                        disabled={!reason.trim()}
                        onClick={() => {
                            onSubmit(reason.trim())
                            setReason('')
                        }}>
                        Force-upgrade to FULL
                    </Button>
                </>
            }>
            <textarea
                rows={4}
                className="w-full rounded-md border bg-surface text-fg text-sm p-2"
                value={reason}
                placeholder="e.g. scholarship awarded; counsellor confirmed offline payment"
                onChange={(e) => setReason(e.target.value)}
            />
        </Modal>
    )
}
