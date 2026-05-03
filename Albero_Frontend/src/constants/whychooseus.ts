import { BarChart3, DollarSign } from 'lucide-react'
import { MdOutlineDashboardCustomize } from 'react-icons/md'
import { FaHandshake, FaStopwatch } from 'react-icons/fa'
import { RiCustomerService2Line } from 'react-icons/ri'

const features = [
    { name: 'Dedicated 24/7 Expert Support (Real Humans, No Bots)', icon: RiCustomerService2Line, us: true, others: false },
    { name: 'Fully Custom-Built Solutions (No Templates, No Shortcuts)', icon: MdOutlineDashboardCustomize, us: true, others: false },
    { name: 'Transparent, ROI-Focused Pricing (No Hidden Costs)', icon: DollarSign, us: true, others: true },
    { name: 'Rapid Development & Deployment (Go Live Faster)', icon: FaStopwatch, us: true, others: false },
    { name: 'Data-Driven Insights & Advanced Analytics Integration', icon: BarChart3, us: true, others: false },
    { name: 'Conversion-Optimized, User-Centric Experiences', icon: FaHandshake, us: true, others: false }
]

export const whyChooseUsData = {
    badgeTitle: 'Why Top Businesses Choose Us',
    title: 'We Don’t Just Build — We Deliver Results',
    subtitle:
        'While others focus on delivering projects, we focus on outcomes—faster launches, higher conversions, and scalable digital systems that grow your business.',
    col1Name: 'Capabilities',
    col2Name: 'Albero Academy', // fixed stray '<'
    col3Name: 'Typical Agencies',
    mobileTitleText: 'Why We Stand Out',
    features,
    cardTitle: 'Stop Settling for Average. Build Something That Scales.',
    cardSubtitle:
        'Partner with a team that understands business, not just code. Join 100+ growing brands using Albero to launch faster, convert better, and scale smarter.',
    ctaLabel: 'Book a Free Strategy Call'
}
