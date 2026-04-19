import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, FileText, TrendingUp, Download } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'

export const ClientDashboard = () => {
    const navigate = useNavigate()
    return (
        <>
            <PageHeader
                eyebrow="Client"
                title="Employee progress"
                description="Track your team's learning across enrolled courses."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Download size={14} />}
                        onClick={() => toast.success('Weekly report downloaded (PDF)')}>
                        Download report
                    </Button>
                }
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/app/enrollments')}
                    className="text-left">
                    <StatCard
                        label="Employees enrolled"
                        value={58}
                        icon={<Users size={18} />}
                        accent="brand"
                    />
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/app/courses')}
                    className="text-left">
                    <StatCard
                        label="Courses assigned"
                        value={4}
                        icon={<BookOpen size={18} />}
                        accent="purple"
                    />
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/app/payments')}
                    className="text-left">
                    <StatCard
                        label="Invoices pending"
                        value={1}
                        icon={<FileText size={18} />}
                        accent="orange"
                    />
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/app/reports')}
                    className="text-left">
                    <StatCard
                        label="Completion rate"
                        value="67%"
                        delta="+5 pts"
                        tone="up"
                        icon={<TrendingUp size={18} />}
                        accent="teal"
                    />
                </button>
            </div>

            <Card>
                <h2 className="text-base font-semibold text-fg mb-2">Weekly digest</h2>
                <p className="text-sm text-fg-soft">
                    Your n8n-driven weekly progress report arrives every Monday at 8:00 AM IST to your registered
                    stakeholder emails. Use the button above to grab the latest snapshot.
                </p>
            </Card>
        </>
    )
}
