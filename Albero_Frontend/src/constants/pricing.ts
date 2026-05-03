import {
    IconFileTypeJsx,
    IconBrandWordpress,
    IconBrandLaravel,
    IconBrandReact,
    IconPhotoSquareRounded,
    IconCloud,
    IconEyeSearch,
    IconShoppingCart,
    IconApi,
    IconSettings,
    IconBolt,
    IconShieldLock,
    IconBuildingSkyscraper,
    IconSchool,
    IconUsers,
    IconClipboardList,
    IconChartBar,
    IconHeadset
} from '@tabler/icons-react'
import type { ComponentType } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PricingService {
    name: string
    description: string
    icon: ComponentType<{ size?: number; className?: string }>
    category: 'Development' | 'Design' | 'Marketing' | 'Infrastructure' | 'Support'
    // ── Uncomment when ready to show prices ──
    // priceRange: { usd: string; eur: string; inr: string }
    // frequency: string
}

export interface ProductTier {
    label: string
    limit: string
    cta: string
    features: string[]
    highlighted?: boolean
    // ── Uncomment when ready to show prices ──
    // monthlyUSD: number   // 0 = Free, -1 = Custom
    // yearlyUSD: number
}

export interface ProductSubscription {
    id: string
    name: string
    tagline: string
    description: string
    icon: ComponentType<{ size?: number; className?: string }>
    accent: string
    accentBg: string
    tiers: ProductTier[]
}

// ─── All Services ─────────────────────────────────────────────────────────────

const allServices: PricingService[] = [
    {
        name: 'Custom Website Development',
        description: 'Conversion-focused, high-performance websites engineered to generate leads, drive engagement, and scale with your business.',
        icon: IconFileTypeJsx,
        category: 'Development'
        // priceRange: { usd: '$180 – $800', eur: '€165 – €735', inr: '₹15,000 – ₹66,000' },
        // frequency: 'per project',
    },
    {
        name: 'Web Application Development',
        description:
            'Robust, scalable web applications built with modern stacks like React, Next.js, Laravel, and Node.js—designed for performance and growth.',
        icon: IconBrandReact,
        category: 'Development'
        // priceRange: { usd: '$800 – $5,000', eur: '€735 – €4,600', inr: '₹66,000 – ₹4,17,000' },
        // frequency: 'per project',
    },
    {
        name: 'WordPress & CMS Development',
        description: 'Flexible, easy-to-manage CMS solutions with custom themes, plugins, and performance optimization for business growth.',
        icon: IconBrandWordpress,
        category: 'Development'
        // priceRange: { usd: '$300 – $1,200', eur: '€275 – €1,100', inr: '₹25,000 – ₹1,00,000' },
        // frequency: 'per project',
    },
    {
        name: 'Enterprise Solutions',
        description:
            'Enterprise-grade systems with scalable architecture, high security, and seamless integrations tailored for complex business operations.',
        icon: IconBrandLaravel,
        category: 'Development'
        // priceRange: { usd: '$2,000 – $10,000+', eur: '€1,840 – €9,200+', inr: '₹1,67,000 – ₹8,35,000+' },
        // frequency: 'per project',
    },
    {
        name: 'E-Commerce Development',
        description: 'High-converting e-commerce platforms with optimized checkout flows, payment integrations, and inventory management.',
        icon: IconShoppingCart,
        category: 'Development'
        // priceRange: { usd: '$500 – $3,000', eur: '€460 – €2,760', inr: '₹41,700 – ₹2,50,500' },
        // frequency: 'per project',
    },
    {
        name: 'API Development & Integration',
        description: 'Secure, scalable APIs and seamless third-party integrations to connect your entire business ecosystem.',
        icon: IconApi,
        category: 'Development'
        // priceRange: { usd: '$300 – $2,000', eur: '€275 – €1,840', inr: '₹25,000 – ₹1,67,000' },
        // frequency: 'per project',
    },
    {
        name: 'UI/UX Product Design',
        description: 'User-first design systems, wireframes, and prototypes crafted to maximize engagement, usability, and conversions.',
        icon: IconPhotoSquareRounded,
        category: 'Design'
        // priceRange: { usd: '$120 – $600', eur: '€110 – €552', inr: '₹10,000 – ₹50,000' },
        // frequency: 'per project',
    },
    {
        name: 'SEO & Digital Growth',
        description: 'Data-driven SEO strategies, content optimization, and analytics to increase visibility, traffic, and qualified leads.',
        icon: IconEyeSearch,
        category: 'Marketing'
        // priceRange: { usd: '$180 – $840', eur: '€165 – €773', inr: '₹15,000 – ₹70,000' },
        // frequency: '/ month',
    },
    {
        name: 'Cloud Hosting & Deployment',
        description: 'Secure cloud infrastructure, CI/CD pipelines, and DevOps solutions for reliable, scalable deployments.',
        icon: IconCloud,
        category: 'Infrastructure'
        // priceRange: { usd: '$36 – $300', eur: '€33 – €276', inr: '₹3,000 – ₹25,000' },
        // frequency: '/ month',
    },
    {
        name: 'Performance Optimization',
        description: 'Speed optimization, Core Web Vitals improvements, and performance audits to boost user experience and rankings.',
        icon: IconBolt,
        category: 'Support'
        // priceRange: { usd: '$100 – $500', eur: '€92 – €460', inr: '₹8,400 – ₹41,700' },
        // frequency: 'per audit',
    },
    {
        name: 'Website Maintenance',
        description: 'Proactive monitoring, updates, and ongoing support to ensure your systems run smoothly without downtime.',
        icon: IconSettings,
        category: 'Support'
        // priceRange: { usd: '$60 – $300', eur: '€55 – €276', inr: '₹5,000 – ₹25,000' },
        // frequency: '/ month',
    },
    {
        name: 'Website Security',
        description: 'Advanced security audits, threat protection, and vulnerability fixes to safeguard your digital assets.',
        icon: IconShieldLock,
        category: 'Support'
        // priceRange: { usd: '$80 – $400', eur: '€73 – €368', inr: '₹6,700 – ₹33,400' },
        // frequency: 'per audit',
    }
]

// ─── Product Subscriptions ────────────────────────────────────────────────────

export const productSubscriptions: ProductSubscription[] = [
    {
        id: 'crm',
        name: 'Wixard Flow CRM',
        tagline: 'Close More Deals. Manage Everything.',
        description: 'A powerful CRM to track leads, automate follow-ups, and scale your sales pipeline without chaos.',
        icon: IconBuildingSkyscraper,
        accent: 'var(--blue-vivid)',
        accentBg: 'oklch(from var(--blue-vivid) l c h / 0.10)',
        tiers: [
            {
                label: 'Free',
                limit: 'Perfect for individuals',
                cta: 'Start Free',
                // monthlyUSD: 0, yearlyUSD: 0,
                features: ['Manage contacts', 'Basic pipeline', 'Email support', 'Starter storage']
            },
            {
                label: 'Starter',
                limit: 'For growing teams',
                cta: 'Upgrade Now',
                // monthlyUSD: 19, yearlyUSD: 15,
                features: ['Expanded contacts', 'Multiple pipelines', 'Automation tools', 'Performance reports']
            },
            {
                label: 'Pro',
                limit: 'Scale your sales',
                cta: 'Go Pro',
                highlighted: true,
                // monthlyUSD: 49, yearlyUSD: 39,
                features: ['Unlimited contacts', 'Advanced automation', 'Lead scoring', 'Analytics dashboard']
            },
            {
                label: 'Enterprise',
                limit: 'Built for scale',
                cta: 'Contact Sales',
                // monthlyUSD: -1, yearlyUSD: -1,
                features: ['Custom workflows', 'Dedicated manager', 'Advanced integrations', 'SLA guarantee']
            }
        ]
    },
    {
        id: 'lms',
        name: 'LearnFlow LMS',
        tagline: 'Launch & Scale Your Learning Business',
        description: 'Create, manage, and sell courses with a powerful LMS built for educators, creators, and institutions.',
        icon: IconSchool,
        accent: 'var(--amber)',
        accentBg: 'oklch(from var(--amber) l c h / 0.10)',
        tiers: [
            {
                label: 'Free',
                limit: 'Start small',
                cta: 'Start Free',
                // monthlyUSD: 0, yearlyUSD: 0,
                features: ['Basic courses', 'Quizzes', 'Certificates', 'Email support']
            },
            {
                label: 'Educator',
                limit: 'Grow your audience',
                cta: 'Get Started',
                // monthlyUSD: 29, yearlyUSD: 23,
                features: ['Unlimited courses', 'Live sessions', 'Progress tracking', 'Email support']
            },
            {
                label: 'Academy',
                limit: 'Scale your platform',
                cta: 'Launch Now',
                highlighted: true,
                // monthlyUSD: 79, yearlyUSD: 63,
                features: ['Custom branding', 'Advanced analytics', 'API access', 'Priority support']
            },
            {
                label: 'Institution',
                limit: 'Enterprise-grade',
                cta: 'Contact Sales',
                // monthlyUSD: -1, yearlyUSD: -1,
                features: ['Multi-tenant', 'SSO', 'Dedicated infrastructure', '24/7 support']
            }
        ]
    },
    {
        id: 'hrms',
        name: 'HRM Suite',
        tagline: 'Automate Your Workforce Management',
        description: 'Manage employees, payroll, attendance, and performance—all in one intelligent system.',
        icon: IconUsers,
        accent: 'var(--blue-soft)',
        accentBg: 'oklch(from var(--blue-vivid) l c h / 0.08)',
        tiers: [
            {
                label: 'Free',
                limit: 'Small teams',
                cta: 'Start Free',
                // monthlyUSD: 0, yearlyUSD: 0,
                features: ['Attendance', 'Leave tracking', 'Basic payroll', 'Employee directory']
            },
            {
                label: 'Growth',
                limit: 'Scaling teams',
                cta: 'Upgrade',
                // monthlyUSD: 39, yearlyUSD: 31,
                features: ['Automation', 'Reports', 'Recruitment tools', 'Employee self-service']
            },
            {
                label: 'Business',
                limit: 'Advanced operations',
                cta: 'Scale Now',
                highlighted: true,
                // monthlyUSD: 89, yearlyUSD: 71,
                features: ['Custom workflows', 'Multi-branch', 'API access', 'Priority support']
            },
            {
                label: 'Enterprise',
                limit: 'Full control',
                cta: 'Contact Sales',
                // monthlyUSD: -1, yearlyUSD: -1,
                features: ['ERP integrations', 'Dedicated server', 'White-label', '24/7 support']
            }
        ]
    },
    {
        id: 'pms',
        name: 'ProjectFlow',
        tagline: 'Manage Projects Without Chaos',
        description: 'Plan, track, and deliver projects with clarity using modern tools like Kanban, Gantt, and real-time insights.',
        icon: IconClipboardList,
        accent: 'var(--amber-lt)',
        accentBg: 'oklch(from var(--amber) l c h / 0.09)',
        tiers: [
            {
                label: 'Free',
                limit: 'Basic use',
                cta: 'Start Free',
                // monthlyUSD: 0, yearlyUSD: 0,
                features: ['Task tracking', 'Kanban boards', 'Basic integrations', 'Email support']
            },
            {
                label: 'Team',
                limit: 'Growing teams',
                cta: 'Get Started',
                // monthlyUSD: 12, yearlyUSD: 9,
                features: ['Time tracking', 'Budgeting', 'Gantt charts', 'Integrations']
            },
            {
                label: 'Business',
                limit: 'Full control',
                cta: 'Upgrade',
                highlighted: true,
                // monthlyUSD: 29, yearlyUSD: 23,
                features: ['Client portal', 'Advanced reporting', 'API access', 'Priority support']
            },
            {
                label: 'Enterprise',
                limit: 'Custom setup',
                cta: 'Contact Sales',
                // monthlyUSD: -1, yearlyUSD: -1,
                features: ['SSO', 'Custom integrations', 'Dedicated support', 'On-premise deployment']
            }
        ]
    },
    {
        id: 'analytics',
        name: 'DataPulse',
        tagline: 'Turn Data Into Decisions',
        description: 'Powerful analytics dashboards with real-time insights, forecasting, and business intelligence.',
        icon: IconChartBar,
        accent: 'var(--blue-vivid)',
        accentBg: 'oklch(from var(--blue-vivid) l c h / 0.10)',
        tiers: [
            {
                label: 'Free',
                limit: 'Basic analytics',
                cta: 'Start Free',
                // monthlyUSD: 0, yearlyUSD: 0,
                features: ['Dashboards', 'Basic charts', 'Data connectors', 'Email support']
            },
            {
                label: 'Analyst',
                limit: 'Deeper insights',
                cta: 'Get Started',
                // monthlyUSD: 35, yearlyUSD: 28,
                features: ['Custom reports', 'Data exports', 'Scheduled reports', 'Integrations']
            },
            {
                label: 'Pro',
                limit: 'Advanced intelligence',
                cta: 'Go Pro',
                highlighted: true,
                // monthlyUSD: 89, yearlyUSD: 71,
                features: ['AI forecasting', 'Real-time sync', 'API access', 'Priority support']
            },
            {
                label: 'Enterprise',
                limit: 'Full data control',
                cta: 'Contact Sales',
                // monthlyUSD: -1, yearlyUSD: -1,
                features: ['Custom AI models', 'Dedicated engineer', 'On-premise deployment', '24/7 support']
            }
        ]
    },
    {
        id: 'helpdesk',
        name: 'SupportDesk',
        tagline: 'Deliver Exceptional Customer Support',
        description: 'Manage tickets, chats, and customer interactions across channels with automation and SLA tracking.',
        icon: IconHeadset,
        accent: 'var(--amber)',
        accentBg: 'oklch(from var(--amber) l c h / 0.10)',
        tiers: [
            {
                label: 'Free',
                limit: 'Small teams',
                cta: 'Start Free',
                // monthlyUSD: 0, yearlyUSD: 0,
                features: ['Basic ticketing', 'Knowledge base', 'Email support', 'Community forums']
            },
            {
                label: 'Support',
                limit: 'Growing teams',
                cta: 'Upgrade',
                // monthlyUSD: 25, yearlyUSD: 20,
                features: ['Multi-channel support', 'SLA tracking', 'Automation', 'Email support']
            },
            {
                label: 'Pro',
                limit: 'Advanced support',
                cta: 'Go Pro',
                highlighted: true,
                // monthlyUSD: 59, yearlyUSD: 47,
                features: ['Automation', 'AI replies', 'Custom reporting', 'Priority support']
            },
            {
                label: 'Enterprise',
                limit: 'Full-scale support',
                cta: 'Contact Sales',
                // monthlyUSD: -1, yearlyUSD: -1,
                features: ['Custom workflows', 'Dedicated infrastructure', '24/7 support', 'SLA guarantee']
            }
        ]
    }
]

// ─── Export ───────────────────────────────────────────────────────────────────

export const pricingData = {
    badgeTitle: 'Pricing & Solutions',
    heading: 'Build Faster. Scale Smarter. Pay for Results.',
    description:
        'From custom-built software to scalable SaaS platforms, we provide everything you need to launch, automate, and grow your business—without overpaying or overcomplicating.',
    allServices,
    productSubscriptions
}
