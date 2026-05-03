// ─── Navbar Constants ─────────────────────────────────────────────────────────

export interface ResourceLink {
    label: string
    description: string
    href: string
    iconKey: 'blog' | 'tutorial' | 'softskills' | 'casestudy' | 'interview' | 'cheatsheet'
}

export interface ProgramLink {
    label: string
    description: string
    href: string
    iconKey: 'analytics' | 'data' | 'ai' | 'fullstack' | 'engineering' | 'security' | 'finance' | 'product'
}

export const navbarData = {
    // ── Primary nav links (desktop + mobile) ───────────────────────────────────
    navLinks: [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '/about' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Contact', href: '/contact' }
    ],

    // ── Programs mega-menu ────────────────────────────────────────────────────
    programs: [
        {
            label: 'Business Analytics',
            description: 'BI, dashboards, consulting & strategy roles',
            href: '/programs/business-analytics',
            iconKey: 'analytics'
        },
        {
            label: 'Data Analytics',
            description: 'SQL, Python, Power BI & Tableau — beginner to pro',
            href: '/programs/data-analytics',
            iconKey: 'data'
        },
        {
            label: 'Data Science with ML & GenAI',
            description: 'Machine Learning, Deep Learning, LLMs & Generative AI',
            href: '/programs/data-science-ai',
            iconKey: 'ai'
        },
        {
            label: 'Full Stack Development',
            description: 'MERN, APIs, deployment & real-world projects',
            href: '/programs/full-stack',
            iconKey: 'fullstack'
        },
        {
            label: 'Data Engineering',
            description: 'Spark, Airflow, dbt & Snowflake — pipelines that scale',
            href: '/programs/data-engineering',
            iconKey: 'engineering'
        },
        {
            label: 'Cybersecurity',
            description: 'OWASP, SOC, pentest & CTF labs — defend & attack',
            href: '/programs/cybersecurity',
            iconKey: 'security'
        },
        {
            label: 'Investment Banking',
            description: 'Modelling, valuations, M&A & pitchbook craft',
            href: '/programs/investment-banking',
            iconKey: 'finance'
        },
        {
            label: 'Product Analytics',
            description: 'Funnels, A/B tests, Mixpanel & growth analytics',
            href: '/programs/product-analytics',
            iconKey: 'product'
        }
    ] as ProgramLink[],

    // ── Resources mega-menu ───────────────────────────────────────────────────
    resources: [
        {
            label: 'Blogs',
            description: 'Deep-dive articles on tech, careers & interviews',
            href: '/resources/blogs',
            iconKey: 'blog'
        },
        {
            label: 'Tutorials',
            description: 'Step-by-step coding walkthroughs with code + video',
            href: '/resources/tutorials',
            iconKey: 'tutorial'
        },
        {
            label: 'Soft Skills Training',
            description: 'Communication, leadership & interview polish',
            href: '/resources/soft-skills',
            iconKey: 'softskills'
        },
        {
            label: 'Case Studies',
            description: 'Real-world business problems, broken down end-to-end',
            href: '/resources/case-studies',
            iconKey: 'casestudy'
        },
        {
            label: 'Interview Guides',
            description: 'Company-specific prep for MAANG, IB & product roles',
            href: '/resources/interview-guides',
            iconKey: 'interview'
        },
        {
            label: 'CheatSheet',
            description: 'Quick one-pagers for revising key concepts',
            href: '/resources/cheatsheet',
            iconKey: 'cheatsheet'
        }
    ] as ResourceLink[],

    // ── CTA button ────────────────────────────────────────────────────────────
    cta: {
        label: 'Enroll Now',
        href: '/pricing'
    },

    // ── Logo ──────────────────────────────────────────────────────────────────
    logo: {
        alt: 'Albero Academy Logo',
        revealText: 'lbero',
        logoHref: '#home'
    }
}
