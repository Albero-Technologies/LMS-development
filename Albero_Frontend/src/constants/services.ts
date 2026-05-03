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

export interface ServiceFeature {
    title: string
    description: string
    icon: ComponentType<{ size?: number; className?: string }>
}

export interface ProductStat {
    label: string
    value: string
}

export interface Product {
    id: string
    name: string
    tagline: string
    description: string
    icon: ComponentType<{ size?: number; className?: string }>
    accent: string
    accentBg: string
    badge: string
    stats: ProductStat[]
    features: string[]
}

// ─── Services ─────────────────────────────────────────────────────────────────

const features: ServiceFeature[] = [
    {
        title: 'Custom Website Development',
        description: 'High-converting, performance-driven websites built to generate leads, improve credibility, and turn visitors into customers.',
        icon: IconFileTypeJsx
    },
    {
        title: 'Web Application Development',
        description: 'Scalable, secure, and high-performance web applications designed to handle real business logic, users, and growth.',
        icon: IconBrandReact
    },
    {
        title: 'WordPress & CMS Development',
        description: 'Flexible CMS solutions that give you full control—optimized for speed, SEO, and easy content management.',
        icon: IconBrandWordpress
    },
    {
        title: 'UI/UX Product Design',
        description: 'Conversion-focused user experiences designed to increase engagement, retention, and overall product usability.',
        icon: IconPhotoSquareRounded
    },
    {
        title: 'Cloud Hosting & Deployment',
        description: 'Secure, scalable cloud infrastructure with CI/CD pipelines to ensure smooth, reliable deployments and zero downtime.',
        icon: IconCloud
    },
    {
        title: 'SEO & Digital Growth',
        description: 'Data-driven SEO and growth strategies that bring qualified traffic, improve rankings, and increase conversions.',
        icon: IconEyeSearch
    },
    {
        title: 'Enterprise Solutions',
        description: 'Custom-built enterprise systems to automate workflows, improve efficiency, and support complex business operations.',
        icon: IconBrandLaravel
    },
    {
        title: 'E-Commerce Development',
        description: 'High-converting e-commerce platforms with optimized checkout, payment integrations, and scalable architecture.',
        icon: IconShoppingCart
    },
    {
        title: 'API Development',
        description: 'Robust and secure APIs that connect your systems, automate workflows, and enable seamless integrations.',
        icon: IconApi
    },
    {
        title: 'Website Maintenance',
        description: 'Proactive monitoring, updates, and support to ensure your platform runs smoothly without interruptions.',
        icon: IconSettings
    },
    {
        title: 'Performance Optimization',
        description: 'Speed, Core Web Vitals, and performance tuning to improve user experience, SEO rankings, and conversions.',
        icon: IconBolt
    },
    {
        title: 'Website Security',
        description: 'Advanced security implementation to protect your data, users, and systems from vulnerabilities and threats.',
        icon: IconShieldLock
    }
]

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsData: Product[] = [
    {
        id: 'crm',
        name: 'CRM Pro',
        tagline: 'Close Deals Faster. Scale Your Sales.',
        description:
            'A powerful, automation-driven CRM designed to help you manage leads, track pipelines, and close more deals with less manual effort.',
        icon: IconBuildingSkyscraper,
        accent: 'var(--blue-vivid)',
        accentBg: 'oklch(0.623 0.214 259.815 / 0.10)',
        badge: 'Most Popular',
        stats: [
            { label: 'Active Users', value: '12K+' },
            { label: 'Deals Closed', value: '98K+' },
            { label: 'Uptime', value: '99.9%' }
        ],
        features: [
            'Smart Pipeline Management',
            'Lead Scoring & Tracking',
            'Automated Follow-ups',
            'Real-Time Analytics',
            'Team Collaboration',
            'Mobile Access'
        ]
    },
    {
        id: 'lms',
        name: 'LearnFlow LMS',
        tagline: 'Launch, Manage & Scale Your Courses',
        description: 'A complete learning platform for educators and businesses to create, manage, and monetize courses with ease.',
        icon: IconSchool,
        accent: 'var(--amber)',
        accentBg: 'oklch(0.795 0.184 86.047 / 0.10)',
        badge: 'Fast Growing',
        stats: [
            { label: 'Learners', value: '50K+' },
            { label: 'Courses', value: '3K+' },
            { label: 'Completion Rate', value: '87%' }
        ],
        features: ['Course Builder', 'Live Classes', 'Assessments & Certificates', 'Progress Tracking', 'Advanced Analytics', 'SCORM Support']
    },
    {
        id: 'hrms',
        name: 'HRM Suite',
        tagline: 'Automate Your Workforce Management',
        description: 'A complete HR automation platform to manage payroll, attendance, hiring, and performance—all in one place.',
        icon: IconUsers,
        accent: 'var(--blue-vivid)',
        accentBg: 'oklch(0.623 0.214 259.815 / 0.10)',
        badge: 'Smart Automation',
        stats: [
            { label: 'Employees Managed', value: '200K+' },
            { label: 'Companies', value: '800+' },
            { label: 'Time Saved', value: '40%' }
        ],
        features: [
            'Payroll Automation',
            'Attendance Tracking',
            'Leave Management',
            'Performance Reviews',
            'Recruitment Module',
            'Self-Service Portal'
        ]
    },
    {
        id: 'pms',
        name: 'ProjectFlow',
        tagline: 'Manage Projects Without Chaos',
        description: 'A modern project management system to plan, track, and deliver projects with clarity and efficiency.',
        icon: IconClipboardList,
        accent: 'var(--amber)',
        accentBg: 'oklch(0.795 0.184 86.047 / 0.10)',
        badge: 'Team Favorite',
        stats: [
            { label: 'Projects Launched', value: '25K+' },
            { label: 'Tasks Completed', value: '1.2M+' },
            { label: 'Team Members', value: '80K+' }
        ],
        features: ['Kanban & Gantt Views', 'Time Tracking', 'Budget Management', 'File Sharing', 'Client Portal', 'Real-Time Collaboration']
    },
    {
        id: 'analytics',
        name: 'DataPulse',
        tagline: 'Turn Data Into Decisions',
        description: 'Advanced analytics platform with real-time dashboards, forecasting, and actionable business insights.',
        icon: IconChartBar,
        accent: 'var(--blue-vivid)',
        accentBg: 'oklch(0.623 0.214 259.815 / 0.10)',
        badge: 'AI-Powered',
        stats: [
            { label: 'Data Points/Day', value: '10M+' },
            { label: 'Reports Generated', value: '500K+' },
            { label: 'Integrations', value: '60+' }
        ],
        features: ['Real-Time Dashboards', 'Custom Reports', 'AI Forecasting', 'Data Integration', 'Role-Based Access', 'API Access']
    },
    {
        id: 'helpdesk',
        name: 'SupportDesk',
        tagline: 'Deliver World-Class Support',
        description: 'A complete helpdesk solution to manage customer queries, automate responses, and improve satisfaction.',
        icon: IconHeadset,
        accent: 'var(--amber)',
        accentBg: 'oklch(0.795 0.184 86.047 / 0.10)',
        badge: 'Highly Rated',
        stats: [
            { label: 'Tickets Resolved', value: '2M+' },
            { label: 'Avg Response Time', value: '< 2min' },
            { label: 'Satisfaction Rate', value: '96%' }
        ],
        features: ['Ticket Management', 'Live Chat Support', 'Knowledge Base', 'SLA Tracking', 'Multi-Channel Inbox', 'Performance Reports']
    }
]

// ─── servicesData ─────────────────────────────────────────────────────────────

export const servicesData = {
    badgeTitle: 'What We Do',
    heading: 'Engineering Digital Products That Drive Growth & Performance',
    description:
        'We don’t just build websites or apps—we design scalable digital systems that help businesses generate leads, automate operations, and grow faster with technology.',
    features
}
