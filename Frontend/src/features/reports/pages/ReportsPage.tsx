import { LineChart, Users, CreditCard, TrendingUp, Download } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'

export const ReportsPage = () => (
    <>
        <PageHeader
            eyebrow="Analytics"
            title="Reports"
            description="Institute-wide KPIs. Counselling Manager variant shows team & target splits."
            actions={
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Download size={14} />}
                    onClick={() => toast.success('Weekly PDF queued — email on the way.')}>
                    Email weekly PDF
                </Button>
            }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                label="Active learners (7d)"
                value={312}
                delta="+8%"
                tone="up"
                icon={<Users size={18} />}
                accent="brand"
            />
            <StatCard
                label="Quiz completions"
                value="82%"
                delta="target 80%"
                tone="up"
                icon={<TrendingUp size={18} />}
                accent="purple"
            />
            <StatCard
                label="New enrollments"
                value={48}
                delta="+12 vs last week"
                tone="up"
                icon={<LineChart size={18} />}
                accent="orange"
            />
            <StatCard
                label="Collected (7d)"
                value="₹94k"
                icon={<CreditCard size={18} />}
                accent="teal"
            />
        </div>

        <Card>
            <h2 className="text-sm font-semibold text-fg">Trend</h2>
            <p className="text-xs text-fg-muted mt-1">Weekly active learners (last 8 weeks).</p>
            <div className="h-64 mt-4 relative rounded-md overflow-hidden grid-dots">
                <svg
                    viewBox="0 0 600 220"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none">
                    <defs>
                        <linearGradient
                            id="rp-grad"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1">
                            <stop
                                offset="0%"
                                stopColor="#0062FF"
                                stopOpacity="0.32"
                            />
                            <stop
                                offset="100%"
                                stopColor="#0062FF"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,160 C60,140 120,130 180,110 S300,90 360,70 440,60 520,55 600,40"
                        stroke="#0062FF"
                        strokeWidth="2"
                        fill="none"
                    />
                    <path
                        d="M0,160 C60,140 120,130 180,110 S300,90 360,70 440,60 520,55 600,40 L600,220 L0,220 Z"
                        fill="url(#rp-grad)"
                    />
                </svg>
            </div>
        </Card>
    </>
)
