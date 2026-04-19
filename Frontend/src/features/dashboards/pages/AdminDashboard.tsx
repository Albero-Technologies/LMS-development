import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Users, BookOpen, CreditCard, Activity, ArrowRight, Plus, Download } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Modal } from '@shared/components/ui/Modal'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { toast } from 'sonner'

const NEXT_ACTIONS = [
    { label: '12 invoices overdue', tone: 'danger' as const, to: '/app/payments' },
    { label: '3 trainers awaiting approval', tone: 'warn' as const, to: '/app/users' },
    { label: 'New tenant signup', tone: 'brand' as const, to: '/app/users' }
]

export const AdminDashboard = () => {
    const navigate = useNavigate()
    const [inviteOpen, setInviteOpen] = useState(false)

    const exportCsv = () => {
        const csv =
            'type,name,email,role,status\n' +
            'user,Ananya Rao,ananya@ascend.in,ADMIN,ACTIVE\n' +
            'user,Rohan Kulkarni,rohan@deepstack.io,TRAINER,ACTIVE\n'
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `learnhub-export-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Export downloaded')
    }

    return (
        <>
            <PageHeader
                eyebrow="Institute"
                title="Mission control"
                description="Real-time tenant health. Every card links to its full report."
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Download size={14} />}
                            onClick={exportCsv}>
                            Export
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Plus size={14} />}
                            onClick={() => setInviteOpen(true)}>
                            Invite admin
                        </Button>
                    </>
                }
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/app/users')}
                    className="text-left">
                    <StatCard
                        label="Active students"
                        value={418}
                        delta="+32 this week"
                        tone="up"
                        icon={<Users size={18} />}
                        accent="brand"
                    />
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/app/courses')}
                    className="text-left">
                    <StatCard
                        label="Courses live"
                        value={26}
                        delta="2 draft"
                        icon={<BookOpen size={18} />}
                        accent="purple"
                    />
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/app/payments')}
                    className="text-left">
                    <StatCard
                        label="MRR (₹)"
                        value="1.2L"
                        delta="+18%"
                        tone="up"
                        icon={<CreditCard size={18} />}
                        accent="teal"
                    />
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/app/reports')}
                    className="text-left">
                    <StatCard
                        label="Uptime · 30d"
                        value="99.7%"
                        delta="SLO met"
                        tone="up"
                        icon={<Activity size={18} />}
                        accent="orange"
                    />
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-fg">Revenue this month</h2>
                        <Button
                            size="sm"
                            variant="ghost"
                            rightIcon={<ArrowRight size={14} />}
                            onClick={() => navigate('/app/payments')}>
                            Payments
                        </Button>
                    </div>
                    <div className="h-48 relative rounded-md overflow-hidden grid-dots">
                        <svg
                            viewBox="0 0 600 160"
                            className="absolute inset-0 w-full h-full"
                            preserveAspectRatio="none">
                            <defs>
                                <linearGradient
                                    id="rev-grad"
                                    x1="0"
                                    x2="0"
                                    y1="0"
                                    y2="1">
                                    <stop
                                        offset="0%"
                                        stopColor="#0062FF"
                                        stopOpacity="0.35"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#0062FF"
                                        stopOpacity="0"
                                    />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,120 C60,95 120,100 180,80 S300,60 360,55 440,35 520,40 600,20"
                                stroke="#0062FF"
                                strokeWidth="2"
                                fill="none"
                            />
                            <path
                                d="M0,120 C60,95 120,100 180,80 S300,60 360,55 440,35 520,40 600,20 L600,160 L0,160 Z"
                                fill="url(#rev-grad)"
                            />
                        </svg>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-base font-semibold text-fg mb-4">Next actions</h2>
                    <ul className="space-y-2.5">
                        {NEXT_ACTIONS.map((n) => (
                            <li key={n.label}>
                                <button
                                    type="button"
                                    onClick={() => navigate(n.to)}
                                    className="w-full border rounded-md p-3 flex items-center justify-between hover:bg-surface-hover transition-colors text-left">
                                    <span className="text-sm text-fg">{n.label}</span>
                                    <Badge tone={n.tone}>Open</Badge>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <InviteAdminModal
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
            />
        </>
    )
}

const InviteAdminModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('ADMIN')
    const [sending, setSending] = useState(false)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        // The invite endpoint is wired on the backend (POST /users/invites). When
        // that's hooked up to this form, swap for a useMutation call.
        await new Promise((r) => setTimeout(r, 400))
        setSending(false)
        toast.success(`Invite sent to ${email}`)
        setEmail('')
        onClose()
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Invite a team member"
            description="We'll email them a one-time link. Invites expire in 7 days."
            size="md"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        form="invite-form"
                        type="submit"
                        loading={sending}>
                        Send invite
                    </Button>
                </>
            }>
            <form
                id="invite-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institute.in"
                />
                <Select
                    label="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}>
                    <option value="ADMIN">Admin</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="COUNSELLING_MANAGER">Counselling Manager</option>
                    <option value="COUNSELLOR">Counsellor</option>
                    <option value="SUPPORT">Support</option>
                </Select>
            </form>
        </Modal>
    )
}
