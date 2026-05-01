// Full detail modal for a shareable invite link. Opens when the row is
// clicked — shows tenant, counsellor, course, the URL, every signup that
// came in through it, and a Share-creds action per signup.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2, User, BookOpen, Copy, Check, Send, KeyRound, Calendar, Hash, Eye, RefreshCw } from 'lucide-react'
import { Modal } from '@shared/components/ui/Modal'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { fmtDate } from '@shared/libs/pdf'
import { buildInviteUrl, getInviteLink, type InviteLinkDetail } from '../services/counsellor.service'
import { regenerateStudentCreds, shareStudentCreds, type SharedCreds } from '../services/counsellor.service'
import { toApiError } from '@shared/libs/api'
import { UserDetailModal } from '@features/users/components/UserDetailModal'

interface Props {
    open: boolean
    linkId: string | null
    onClose: () => void
}

const STATUS_TONE: Record<InviteLinkDetail['status'], 'ok' | 'warn' | 'danger' | 'default'> = {
    ACTIVE: 'ok',
    USED: 'default',
    EXPIRED: 'warn',
    REVOKED: 'danger'
}

export const InviteLinkDetailModal = ({ open, linkId, onClose }: Props) => {
    const queryClient = useQueryClient()
    const [copied, setCopied] = useState(false)
    const [creds, setCreds] = useState<{ signupId: string; name: string; email: string; password: string | null } | null>(null)
    const [openUserId, setOpenUserId] = useState<string | null>(null)

    const detailQuery = useQuery({
        queryKey: ['invite-links', linkId, 'detail'],
        queryFn: () => getInviteLink(linkId!),
        enabled: open && !!linkId,
        staleTime: 30_000
    })

    const link = detailQuery.data ?? null
    const url = link ? buildInviteUrl(link.token) : ''

    const copyUrl = () => {
        if (!url) return
        void navigator.clipboard.writeText(url).then(
            () => {
                setCopied(true)
                toast.success('Link copied')
                setTimeout(() => setCopied(false), 1800)
            },
            () => toast.error('Could not copy')
        )
    }

    const shareMutation = useMutation({
        mutationFn: (signupId: string) => shareStudentCreds(signupId),
        onSuccess: (res: SharedCreds, signupId) => {
            const sig = link?.signups?.find((s) => s.id === signupId)
            const fullName = sig ? `${sig.firstName} ${sig.lastName}`.trim() || sig.email : ''
            setCreds({ signupId, name: fullName, email: res.email, password: res.password })
            void queryClient.invalidateQueries({ queryKey: ['invite-links', linkId, 'detail'] })
        },
        onError: (err: unknown) => {
            const e = toApiError(err)
            // CREDS_CONSUMED → student already signed in. Prompt the user to use the
            // regenerate flow instead of leaving them stuck.
            if (e.code === 'CREDS_CONSUMED') {
                toast.error('Original password no longer available — use Regenerate to issue a new one.')
                return
            }
            toast.error(e.message || 'Could not fetch credentials')
        }
    })

    const regenerateMutation = useMutation({
        mutationFn: (signupId: string) => regenerateStudentCreds(signupId),
        onSuccess: (res: SharedCreds, signupId) => {
            const sig = link?.signups?.find((s) => s.id === signupId)
            const fullName = sig ? `${sig.firstName} ${sig.lastName}`.trim() || sig.email : ''
            setCreds({ signupId, name: fullName, email: res.email, password: res.password })
            toast.success('New password generated — old one no longer works.')
            void queryClient.invalidateQueries({ queryKey: ['invite-links', linkId, 'detail'] })
        },
        onError: (err: unknown) => toast.error(toApiError(err).message || 'Could not regenerate credentials')
    })

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                title="Shareable link"
                description={link?.label ?? undefined}
                size="lg">
                {detailQuery.isLoading || !link ? (
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-32" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Status + URL */}
                        <Card className="!p-4">
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                                <Badge tone={STATUS_TONE[link.status]}>{link.status.toLowerCase()}</Badge>
                                <span className="text-xs text-fg-muted inline-flex items-center gap-1">
                                    <Hash size={11} /> {link.usesCount} of {link.maxUses} uses
                                </span>
                                <span className="text-xs text-fg-muted inline-flex items-center gap-1">
                                    <Calendar size={11} /> Expires {fmtDate(link.expiresAt)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <code className="rounded bg-surface-2 px-2 py-1 text-xs font-mono text-fg-soft truncate flex-1 min-w-0">{url}</code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
                                    onClick={copyUrl}>
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                        </Card>

                        <div className="grid sm:grid-cols-2 gap-3">
                            <Card className="!p-4">
                                <h4 className="text-xs uppercase tracking-wider text-fg-muted mb-2 inline-flex items-center gap-1.5">
                                    <Building2 size={12} /> Tenant
                                </h4>
                                <div className="text-sm font-semibold text-fg">{link.tenant?.name ?? '—'}</div>
                                {link.tenant?.slug && <div className="text-xs text-fg-muted font-mono">/{link.tenant.slug}</div>}
                            </Card>
                            <Card className="!p-4">
                                <h4 className="text-xs uppercase tracking-wider text-fg-muted mb-2 inline-flex items-center gap-1.5">
                                    <User size={12} /> Counsellor
                                </h4>
                                <div className="text-sm font-semibold text-fg">
                                    {link.counsellor
                                        ? `${link.counsellor.firstName} ${link.counsellor.lastName}`.trim() || link.counsellor.email
                                        : '—'}
                                </div>
                                {link.counsellor?.email && <div className="text-xs text-fg-muted">{link.counsellor.email}</div>}
                            </Card>
                            {link.course && (
                                <Card className="!p-4 sm:col-span-2">
                                    <h4 className="text-xs uppercase tracking-wider text-fg-muted mb-2 inline-flex items-center gap-1.5">
                                        <BookOpen size={12} /> Course
                                    </h4>
                                    <div className="text-sm font-semibold text-fg">{link.course.title}</div>
                                </Card>
                            )}
                        </div>

                        {/* Signups list */}
                        <div>
                            <h4 className="text-sm font-semibold text-fg mb-2">Signups ({link.signups?.length ?? 0})</h4>
                            {!link.signups || link.signups.length === 0 ? (
                                <Empty
                                    icon={<User size={28} />}
                                    title="No signups yet"
                                    description="When someone registers via this link, they'll show up here."
                                />
                            ) : (
                                <Card padded={false}>
                                    <ul className="divide-y">
                                        {link.signups.map((s) => {
                                            const fullName = `${s.firstName} ${s.lastName}`.trim() || s.email
                                            return (
                                                <li
                                                    key={s.id}
                                                    className="p-3 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)] text-white text-xs flex items-center justify-center font-semibold">
                                                        {fullName[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-fg truncate">{fullName}</div>
                                                        <div className="text-xs text-fg-muted truncate">
                                                            {s.email}
                                                            {s.phone ? ` · ${s.phone}` : ''}
                                                        </div>
                                                        <div className="text-[11px] text-fg-muted mt-0.5">
                                                            Joined {fmtDate(s.createdAt)} · {s.status}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 shrink-0">
                                                        {s.userId && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                leftIcon={<Eye size={11} />}
                                                                onClick={() => setOpenUserId(s.userId)}>
                                                                Open
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            leftIcon={<Send size={11} />}
                                                            loading={shareMutation.isPending && shareMutation.variables === s.id}
                                                            onClick={() => shareMutation.mutate(s.id)}>
                                                            Share creds
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            leftIcon={<RefreshCw size={11} />}
                                                            loading={regenerateMutation.isPending && regenerateMutation.variables === s.id}
                                                            onClick={() => regenerateMutation.mutate(s.id)}
                                                            title="Issue a fresh password — invalidates the old one">
                                                            Regenerate
                                                        </Button>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <CredsModal
                state={creds}
                regenerating={regenerateMutation.isPending && regenerateMutation.variables === creds?.signupId}
                onRegenerate={() => creds && regenerateMutation.mutate(creds.signupId)}
                onClose={() => setCreds(null)}
            />

            <UserDetailModal
                open={!!openUserId}
                userId={openUserId}
                canEdit
                onClose={() => setOpenUserId(null)}
            />
        </>
    )
}

const CredsModal = ({
    state,
    regenerating,
    onRegenerate,
    onClose
}: {
    state: { signupId: string; name: string; email: string; password: string | null } | null
    regenerating: boolean
    onRegenerate: () => void
    onClose: () => void
}) => {
    const copy = (text: string | null | undefined) => {
        if (!text) return
        void navigator.clipboard.writeText(text).then(
            () => toast.success('Copied'),
            () => toast.error('Could not copy')
        )
    }
    const copyBoth = () => {
        if (!state) return
        const block = `Email: ${state.email}\nPassword: ${state.password ?? ''}`
        copy(block)
    }
    return (
        <Modal
            open={!!state}
            onClose={onClose}
            title="Login credentials"
            description={state?.name}
            footer={
                <>
                    <Button
                        variant="ghost"
                        leftIcon={<RefreshCw size={12} />}
                        loading={regenerating}
                        onClick={onRegenerate}>
                        Regenerate
                    </Button>
                    <Button onClick={onClose}>Done</Button>
                </>
            }>
            {state && (
                <div className="space-y-4">
                    <p className="text-sm text-fg-soft inline-flex items-center gap-2">
                        <KeyRound
                            size={14}
                            className="text-[var(--color-brand-500)]"
                        />
                        Share these securely. Use Regenerate if the student lost it or has already signed in.
                    </p>
                    <div className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-fg-muted">Email</span>
                            <div className="flex items-center gap-2 min-w-0">
                                <code className="font-mono text-sm truncate text-fg">{state.email}</code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copy(state.email)}>
                                    Copy
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-fg-muted">Password</span>
                            <div className="flex items-center gap-2 min-w-0">
                                <code className={`font-mono text-sm truncate ${state.password ? 'text-fg' : 'text-[var(--color-danger)]'}`}>
                                    {state.password ?? '—'}
                                </code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={!state.password}
                                    onClick={() => copy(state.password)}>
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </div>
                    {state.password ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Copy size={12} />}
                            onClick={copyBoth}>
                            Copy both
                        </Button>
                    ) : (
                        <Badge tone="warn">
                            The student already signed in — this password is no longer retrievable. Click Regenerate to issue a new one.
                        </Badge>
                    )}
                </div>
            )}
        </Modal>
    )
}
