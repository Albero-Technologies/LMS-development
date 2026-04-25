import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Link2, Target, TrendingUp, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Modal } from '@shared/components/ui/Modal'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'

const RECENT = [
    { name: 'Ishaan Mehra', course: 'DSA in 30 days', source: 'WhatsApp', status: 'new' as const },
    { name: 'Sneha Patil', course: 'Full-stack TS', source: 'Instagram', status: 'sent' as const },
    { name: 'Rohit Gupta', course: 'System Design', source: 'Referral', status: 'paid' as const }
]

const STATUS_TONE = {
    new: 'brand' as const,
    sent: 'warn' as const,
    paid: 'ok' as const
}

export const CounsellorDashboard = () => {
    const navigate = useNavigate()
    const [inviteOpen, setInviteOpen] = useState(false)

    return (
        <>
            <PageHeader
                eyebrow="Admissions"
                title="Counsellor console"
                description="Create an invite link, share it, and the system takes it from there."
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/app/counsellor/pipeline')}>
                            Open pipeline
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Link2 size={14} />}
                            onClick={() => setInviteOpen(true)}>
                            New invite link
                        </Button>
                    </>
                }
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Signups this month"
                    value={42}
                    delta="+9 vs last month"
                    tone="up"
                    icon={<UserPlus size={18} />}
                    accent="brand"
                />
                <StatCard
                    label="Target progress"
                    value="63%"
                    delta="₹2.4L / ₹3.8L"
                    icon={<Target size={18} />}
                    accent="purple"
                />
                <StatCard
                    label="Active invite links"
                    value={6}
                    icon={<Link2 size={18} />}
                    accent="teal"
                />
                <StatCard
                    label="Conversion rate"
                    value="31%"
                    delta="+4 pts"
                    tone="up"
                    icon={<TrendingUp size={18} />}
                    accent="orange"
                />
            </div>

            <Card padded={false}>
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-base font-semibold text-fg">Recent signups</h2>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate('/app/counsellor/pipeline')}>
                        View all
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                <th className="py-2.5 px-5">Name</th>
                                <th className="py-2.5 px-5">Course</th>
                                <th className="py-2.5 px-5">Source</th>
                                <th className="py-2.5 px-5">Status</th>
                                <th className="py-2.5 px-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {RECENT.map((r) => (
                                <tr
                                    key={r.name}
                                    className="hover:bg-surface-hover">
                                    <td className="py-3 px-5 text-fg font-medium">{r.name}</td>
                                    <td className="py-3 px-5 text-fg-soft">{r.course}</td>
                                    <td className="py-3 px-5 text-fg-muted">{r.source}</td>
                                    <td className="py-3 px-5">
                                        <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                                    </td>
                                    <td className="py-3 px-5 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toast.success(`Credentials re-shared to ${r.name}`)}>
                                            Share creds
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <NewInviteModal
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
            />
        </>
    )
}

const NewInviteModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [course, setCourse] = useState('System Design Foundations')
    const [label, setLabel] = useState('')
    const [link, setLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const createLink = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: wire to POST /counsellor/invites — server returns real token.
        const token = Math.random().toString(36).slice(2, 10)
        const url = `${window.location.origin}/onboarding/${token}`
        setLink(url)
        toast.success('Invite link ready — share it with your lead.')
    }

    const copy = () => {
        if (!link) return
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const close = () => {
        setLink(null)
        setLabel('')
        onClose()
    }

    return (
        <Modal
            open={open}
            onClose={close}
            title="New counsellor invite link"
            description="Each link is single-tenant and expires after use."
            footer={
                link ? (
                    <Button onClick={close}>Done</Button>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            onClick={close}>
                            Cancel
                        </Button>
                        <Button
                            form="invite-link-form"
                            type="submit">
                            Generate link
                        </Button>
                    </>
                )
            }>
            {link ? (
                <div className="space-y-3">
                    <label className="block text-xs font-medium text-fg-soft">Share this with your lead</label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-xs bg-surface-2 border rounded-md px-3 py-2 truncate">{link}</code>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={copy}
                            aria-label="Copy link">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </Button>
                    </div>
                </div>
            ) : (
                <form
                    id="invite-link-form"
                    onSubmit={createLink}
                    className="space-y-4">
                    <Select
                        label="Course"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}>
                        <option>System Design Foundations</option>
                        <option>Full-stack TypeScript</option>
                        <option>DSA in 30 days</option>
                    </Select>
                    <Input
                        label="Internal label (optional)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Instagram campaign · March"
                    />
                </form>
            )}
        </Modal>
    )
}
