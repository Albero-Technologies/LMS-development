import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Copy, Trash2, Link2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input } from '@shared/components/ui/Input'
import { Modal } from '@shared/components/ui/Modal'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import {
    buildInviteUrl,
    createInviteLink,
    listInviteLinks,
    revokeInviteLink,
    type CounsellorInviteLink,
    type CounsellorInviteStatus
} from '../services/counsellor.service'
import { InviteLinkDetailModal } from '../components/InviteLinkDetailModal'

const STATUS_TONE: Record<CounsellorInviteStatus, 'ok' | 'warn' | 'default' | 'danger'> = {
    ACTIVE: 'ok',
    USED: 'warn',
    EXPIRED: 'default',
    REVOKED: 'danger'
}

const formatDate = (iso: string): string => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export const CounsellorLinksPage = () => {
    const [createOpen, setCreateOpen] = useState(false)
    const [openLinkId, setOpenLinkId] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const linksQuery = useQuery({
        queryKey: ['counsellor-invites'],
        queryFn: listInviteLinks,
        staleTime: 30_000
    })

    const createMutation = useMutation({
        mutationFn: createInviteLink,
        onSuccess: (link) => {
            toast.success('Shareable link created')
            void queryClient.invalidateQueries({ queryKey: ['counsellor-invites'] })
            setCreateOpen(false)
            // Eagerly copy the new link to make the next step easy.
            void copyToClipboard(buildInviteUrl(link.token))
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Could not create link'
            toast.error(msg)
        }
    })

    const revokeMutation = useMutation({
        mutationFn: revokeInviteLink,
        onSuccess: () => {
            toast.success('Link revoked')
            void queryClient.invalidateQueries({ queryKey: ['counsellor-invites'] })
        }
    })

    const links = linksQuery.data ?? []

    return (
        <>
            <PageHeader
                eyebrow="Admissions"
                title="Shareable links"
                description="Generate one-tap onboarding links to send prospects. Each link captures their details into your pipeline."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => setCreateOpen(true)}>
                        New link
                    </Button>
                }
            />

            {linksQuery.isLoading ? (
                <Card padded={false}>
                    <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                </Card>
            ) : linksQuery.isError ? (
                <Empty
                    icon={<Link2 size={32} />}
                    title="Couldn't load links"
                    description="Try again in a moment."
                />
            ) : links.length === 0 ? (
                <Empty
                    icon={<Link2 size={32} />}
                    title="No shareable links yet"
                    description="Create one and share it on WhatsApp, email, or any channel — prospects fill the form and land in your pipeline."
                />
            ) : (
                <div className="space-y-3">
                    {links.map((link) => (
                        <LinkRow
                            key={link.id}
                            link={link}
                            onOpenDetail={() => setOpenLinkId(link.id)}
                            onRevoke={() => revokeMutation.mutate(link.id)}
                            isRevoking={revokeMutation.isPending && revokeMutation.variables === link.id}
                        />
                    ))}
                </div>
            )}

            <CreateLinkModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={(payload) => createMutation.mutate(payload)}
                isPending={createMutation.isPending}
            />

            <InviteLinkDetailModal
                open={!!openLinkId}
                linkId={openLinkId}
                onClose={() => setOpenLinkId(null)}
            />
        </>
    )
}

const LinkRow = ({
    link,
    onRevoke,
    onOpenDetail,
    isRevoking
}: {
    link: CounsellorInviteLink
    onRevoke: () => void
    onOpenDetail: () => void
    isRevoking: boolean
}) => {
    const url = buildInviteUrl(link.token)
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        const ok = await copyToClipboard(url)
        if (ok) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success('Link copied to clipboard')
        }
    }

    const remainingUses = link.maxUses - link.usesCount
    const expired = new Date(link.expiresAt).getTime() < Date.now()
    const canRevoke = link.status === 'ACTIVE' && !expired

    return (
        <Card
            className="cursor-pointer"
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return
                onOpenDetail()
            }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-fg font-semibold">{link.label || 'Untitled link'}</span>
                        <Badge tone={STATUS_TONE[link.status]}>{link.status.toLowerCase()}</Badge>
                        {link.course && <Badge>{link.course.title}</Badge>}
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <code className="rounded bg-surface-2 px-2 py-1 text-xs font-mono text-fg-soft truncate max-w-[420px]">{url}</code>
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
                            onClick={copy}>
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                    </div>
                    <div className="mt-2 text-xs text-fg-muted flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                            {link.usesCount} of {link.maxUses} uses
                        </span>
                        <span>{remainingUses > 0 ? `${remainingUses} remaining` : 'Fully used'}</span>
                        <span>Expires {formatDate(link.expiresAt)}</span>
                        <span>Created {formatDate(link.createdAt)}</span>
                        {link._count && (
                            <span>
                                · {link._count.signups} signup{link._count.signups === 1 ? '' : 's'}
                            </span>
                        )}
                    </div>
                </div>
                {canRevoke && (
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Trash2 size={12} />}
                        loading={isRevoking}
                        onClick={() => {
                            if (window.confirm('Revoke this link? Anyone who already saved it can no longer use it.')) onRevoke()
                        }}
                        className="!text-[var(--color-danger)]">
                        Revoke
                    </Button>
                )}
            </div>
        </Card>
    )
}

const CreateLinkModal = ({
    open,
    onClose,
    onSubmit,
    isPending
}: {
    open: boolean
    onClose: () => void
    onSubmit: (payload: { label?: string; maxUses?: number; expiresInDays?: number }) => void
    isPending: boolean
}) => {
    const [label, setLabel] = useState('')
    const [maxUses, setMaxUses] = useState(1)
    const [expiresInDays, setExpiresInDays] = useState(14)

    const reset = () => {
        setLabel('')
        setMaxUses(1)
        setExpiresInDays(14)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            label: label.trim() || undefined,
            maxUses: Math.max(1, Math.min(500, maxUses)),
            expiresInDays: Math.max(1, Math.min(90, expiresInDays))
        })
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="New shareable link"
            description="One link, one prospect (or one cohort). The link auto-creates a StudentSignup when filled."
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
                        form="new-link-form"
                        type="submit"
                        loading={isPending}>
                        Create link
                    </Button>
                </>
            }>
            <form
                id="new-link-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Label (optional)"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., 'IIT Madras referral · Aakash'"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        label="Max uses"
                        type="number"
                        min={1}
                        max={500}
                        value={maxUses}
                        onChange={(e) => setMaxUses(Number(e.target.value))}
                    />
                    <Input
                        label="Expires in (days)"
                        type="number"
                        min={1}
                        max={90}
                        value={expiresInDays}
                        onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    />
                </div>
                <p className="text-xs text-fg-muted">After creating, the URL is copied to your clipboard automatically.</p>
            </form>
        </Modal>
    )
}

const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch {
        /* fall through */
    }
    // Last-resort path for browsers without the async clipboard API.
    try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        return ok
    } catch {
        return false
    }
}
