// Albero Academy tenant seed — provisions the full institute end-to-end:
// branding + admin/counsellor users + 3 published flagship courses + multi-page
// landing site + CMS collections + per-tenant SEO + analytics integrations.
//
// Idempotent. Re-running does not duplicate; existing rows are upserted by
// stable keys (tenant slug, user email, course slug, collection slug, etc.).

import { AuthProvider, CoursePublishState, LessonType, PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { POLICY_PAGES } from './albero-policies'
import { RESOURCE_PAGES } from './albero-resources'

type Prisma = PrismaClient

const id = (): string => randomUUID()

// Stable section ids — deterministic across reseeds so Prisma doesn't
// invalidate React keys on the rendered editor preview after a reseed.
const sid = (label: string): string => `albero-${label}`

// Stock palette pulled from the Aurora Noir design system used elsewhere.
const ACCENT_GRADIENT = 'linear-gradient(135deg, #5b3df5 0%, #8b5cf6 50%, #06b6d4 100%)'

// Hero / course / placement imagery sourced from Unsplash + Pexels CDNs (free
// editorial use). Swap in tenant-uploaded media once available.
const IMG = {
    heroAbstract: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&h=900&fit=crop',
    heroLearners: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop',
    placementCelebration: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&h=900&fit=crop',
    courseBA: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
    courseDA: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
    courseAI: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=800&fit=crop',
    blogStudying: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop',
    blogTeam: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop',
    blogChart: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
    avatar1: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=faces',
    avatar2: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=160&h=160&fit=crop&crop=faces',
    avatar3: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces',
    avatar4: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=160&h=160&fit=crop&crop=faces',
    logoFlipkart: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Flipkart_logo.svg/512px-Flipkart_logo.svg.png',
    logoAmazon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Amazon_logo.svg/512px-Amazon_logo.svg.png',
    logoMicrosoft: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Microsoft_logo_%282012%29.svg/512px-Microsoft_logo_%282012%29.svg.png',
    logoGoogle: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png',
    logoRazorpay: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Razorpay_logo.svg/512px-Razorpay_logo.svg.png',
    logoSwiggy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Swiggy_logo.svg/512px-Swiggy_logo.svg.png',
    logoZomato: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Zomato_logo.png/512px-Zomato_logo.png',
    logoPaytm: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png'
}

// ---- Style classes -----------------------------------------------------------
//
// Reusable typography presets so all H1s + body copy share a tight, branded
// feel. Tenants can edit/extend in the website editor's Site Settings dialog.

// Reusable visual presets — applied via section.style.styleClassId. Admins
// can mix-and-match these or override individual fields per section. Each
// preset is named after its intent so the picker reads like a kit, not
// a CSS class list.
const STYLE_CLASSES = [
    {
        id: 'sc-h1',
        name: 'Heading 1',
        headingType: { fontFamily: 'display', fontSize: '5xl', fontWeight: 'bold', lineHeight: 'tight', letterSpacing: 'tight' }
    },
    {
        id: 'sc-h2',
        name: 'Heading 2',
        headingType: { fontFamily: 'display', fontSize: '3xl', fontWeight: 'semibold', lineHeight: 'snug' }
    },
    {
        id: 'sc-display',
        name: 'Heading · Display',
        headingType: { fontFamily: 'display', fontSize: '5xl', fontWeight: 'extrabold', lineHeight: 'tight', letterSpacing: 'tighter' },
        bodyType: { fontFamily: 'sans', fontSize: 'lg', fontWeight: 'normal', lineHeight: 'relaxed' }
    },
    {
        id: 'sc-body',
        name: 'Body L',
        bodyType: { fontFamily: 'sans', fontSize: 'lg', fontWeight: 'normal', lineHeight: 'relaxed' }
    },
    {
        id: 'sc-tint',
        name: 'Section · Soft tint',
        background: '#f7f9ff',
        paddingY: 'lg' as const
    },
    {
        id: 'sc-tint-warm',
        name: 'Section · Warm tint',
        background: 'linear-gradient(180deg, #fffaf3 0%, #fff5e6 100%)',
        paddingY: 'lg' as const
    },
    {
        id: 'sc-mesh',
        name: 'Section · Brand mesh',
        background:
            'radial-gradient(45% 40% at 10% 10%, color-mix(in srgb, var(--color-brand-500) 14%, transparent) 0%, transparent 70%), radial-gradient(35% 30% at 90% 90%, color-mix(in srgb, var(--color-brand-300) 18%, transparent) 0%, transparent 70%), #ffffff',
        paddingY: 'xl' as const
    },
    {
        id: 'sc-dark',
        name: 'Section · Dark',
        background: '#0c1626',
        textColor: '#ffffff',
        paddingY: 'lg' as const
    },
    {
        id: 'sc-dark-deep',
        name: 'Section · Deep slate',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1729 100%)',
        textColor: '#f5f7ff',
        paddingY: 'xl' as const
    },
    {
        id: 'sc-spotlight',
        name: 'Section · Spotlight',
        background:
            'radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--color-brand-500) 22%, transparent) 0%, transparent 70%), #ffffff',
        paddingY: 'xl' as const
    },
    {
        id: 'sc-narrow',
        name: 'Section · Narrow column',
        maxWidth: 'narrow' as const,
        paddingY: 'md' as const
    }
]

// ---- Page section builders ---------------------------------------------------

const homeSections = (): unknown[] => [
    {
        id: sid('home-hero'),
        type: 'hero',
        variant: 'split',
        style: { animation: 'fadeUp', animationDuration: 800 },
        data: {
            eyebrow: 'Cohort 14 · enrolling for June',
            title: 'Career-grade certifications, taught the way industry actually works.',
            subtitle:
                'Live mentor-led cohorts in Business Analytics, Data Analytics, and AI/ML. Real projects, hands-on labs, and a placement guarantee that puts our money where our mouth is.',
            primaryCtaLabel: 'Talk to a counsellor',
            primaryCtaLink: 'enquiry',
            imageUrl: IMG.heroLearners,
            imageAlt: 'Cohort of Albero Academy students collaborating in a live class'
        }
    },
    {
        id: sid('home-marquee'),
        type: 'marquee',
        variant: 'chips',
        data: {
            items: [
                'Live mentor-led cohorts',
                '5+ portfolio projects',
                '40+ hiring partners',
                '6-month placement guarantee',
                'No-cost EMI from ₹3,500/mo',
                'Need-based scholarships',
                '94% placement rate',
                '₹8.4L average package'
            ],
            speed: 'normal'
        }
    },
    {
        id: sid('home-logos'),
        type: 'logos',
        variant: 'scroll',
        style: { animation: 'fadeIn' },
        data: {
            title: 'Our alumni work at',
            items: [
                { src: IMG.logoFlipkart, alt: 'Flipkart' },
                { src: IMG.logoAmazon, alt: 'Amazon' },
                { src: IMG.logoMicrosoft, alt: 'Microsoft' },
                { src: IMG.logoGoogle, alt: 'Google' },
                { src: IMG.logoRazorpay, alt: 'Razorpay' },
                { src: IMG.logoSwiggy, alt: 'Swiggy' },
                { src: IMG.logoZomato, alt: 'Zomato' },
                { src: IMG.logoPaytm, alt: 'Paytm' }
            ]
        }
    },
    {
        id: sid('home-bento'),
        type: 'bento',
        variant: 'showcase',
        style: { styleClassId: 'sc-tint', animation: 'fadeUp' },
        data: {
            eyebrow: 'WHY ALBERO',
            title: 'Built for outcomes — not for brochures.',
            subtitle:
                'Every part of the program is designed to ship you into a real role. Mentors who actually hire, projects that look like real work, and placement support that ends with a signed offer.',
            tiles: [
                {
                    title: 'Mentors who actually hire',
                    body: "Senior practitioners from Razorpay, Flipkart, Microsoft, and Swiggy. They review your work the way they review their team's.",
                    accent: 'brand',
                    wide: true,
                    eyebrow: 'TEACHING'
                },
                {
                    title: '5+ portfolio projects',
                    body: 'Industry-graded with feedback from your mentor — not a TA.',
                    accent: 'purple',
                    eyebrow: 'PROJECTS'
                },
                {
                    title: '40+ hiring partners',
                    body: 'Warm referrals beat cold applications. Top performers get them automatically.',
                    accent: 'teal',
                    eyebrow: 'PLACEMENT'
                },
                {
                    title: '6-month placement guarantee',
                    body: "If you don't get placed within 6 months of graduating, we refund 100% of your fee. No fine print.",
                    accent: 'orange',
                    wide: true,
                    eyebrow: 'GUARANTEE'
                }
            ]
        }
    },
    {
        id: sid('home-courses'),
        type: 'features',
        variant: 'three-up',
        style: { animation: 'fadeUp' },
        data: {
            title: 'Three flagship programs. One outcome.',
            pillars: [
                {
                    title: 'Business Analytics Pro',
                    description:
                        '14-week live cohort.\nSQL · Excel · Power BI · Tableau · A/B testing.\n\nBuilt for fresh grads and early-career switchers entering analyst roles.'
                },
                {
                    title: 'Data Analytics Mastery',
                    description:
                        '20-week deep dive.\nPython · statistics · ML basics · cloud warehousing.\n\nFor analysts who want the data scientist seat.'
                },
                {
                    title: 'AI/ML Engineer',
                    description:
                        '24-week intensive.\nTransformers · RAG · LLM apps · MLOps.\n\nFor engineers ready to ship production AI systems.'
                }
            ]
        }
    },
    {
        id: sid('home-process'),
        type: 'process',
        variant: 'horizontal',
        style: { styleClassId: 'sc-tint-warm', animation: 'fadeUp' },
        data: {
            eyebrow: 'HOW IT WORKS',
            title: 'Four steps from enquiry to offer letter',
            subtitle: 'A clear path — no guesswork, no gimmicks.',
            steps: [
                {
                    title: 'Counsellor call',
                    body: 'Tell us your goal. We tell you which program fits — and which one does not.',
                    badge: 'WEEK 0'
                },
                {
                    title: 'Live cohort',
                    body: 'Mentor-led classes. Hands-on labs. Weekly office hours. Cohort Slack.',
                    badge: 'WEEKS 1-12'
                },
                {
                    title: 'Capstone + reviews',
                    body: 'Industry-graded final project. Reviewed by a senior mentor at a hiring partner.',
                    badge: 'WEEKS 13-14'
                },
                {
                    title: 'Placement support',
                    body: 'Resume reviews, mock interviews, warm referrals. We do not stop until you are placed.',
                    badge: 'POST-GRAD'
                }
            ]
        }
    },
    {
        id: sid('home-pricing'),
        type: 'pricing',
        variant: 'cards',
        style: { styleClassId: 'sc-spotlight', animation: 'fadeUp' },
        data: {
            eyebrow: 'PROGRAMS & FEES',
            title: 'Pick the program that fits your goal',
            subtitle:
                'No-cost EMI on every plan. Need-based scholarships up to 30% off. Every fee includes placement support and the 6-month money-back guarantee.',
            tiers: [
                {
                    name: 'Business Analytics Pro',
                    price: '₹49,999',
                    period: '14-week program',
                    blurb: 'For analyst-track careers',
                    features: [
                        'SQL · Excel · Power BI · Tableau',
                        'A/B testing + stakeholder communication',
                        'Mentor-led live cohort',
                        '5+ portfolio projects',
                        '6-month placement guarantee',
                        'No-cost EMI from ₹3,500/month'
                    ],
                    ctaLabel: 'Talk to a counsellor',
                    ctaLink: 'enquiry'
                },
                {
                    name: 'Data Analytics Mastery',
                    price: '₹74,999',
                    period: '20-week program',
                    blurb: 'Most chosen — analyst → data scientist',
                    features: [
                        'Python + statistics + ML fundamentals',
                        'Cloud warehousing (Snowflake / BigQuery / dbt)',
                        'Causal inference + experimentation',
                        '8+ portfolio projects',
                        'Resume review + 3 mock interviews',
                        '6-month placement guarantee'
                    ],
                    ctaLabel: 'Reserve my seat',
                    ctaLink: 'enquiry',
                    badge: 'Most popular',
                    highlighted: true
                },
                {
                    name: 'AI/ML Engineer',
                    price: '₹99,999',
                    period: '24-week program',
                    blurb: 'For engineers shipping AI',
                    features: [
                        'Transformers + RAG + LLM apps',
                        'PyTorch · MLOps · production deployment',
                        '6+ portfolio projects',
                        'Senior-IC mentor 1:1 sessions',
                        'Resume + system design prep',
                        '6-month placement guarantee'
                    ],
                    ctaLabel: 'Talk to a counsellor',
                    ctaLink: 'enquiry'
                }
            ]
        }
    },
    {
        id: sid('home-stats'),
        type: 'stats',
        variant: 'banner',
        style: { animation: 'fadeUp' },
        data: {
            title: 'Placement guarantee — backed by numbers',
            subtitle:
                'We tie our success to yours. If you do not get placed within 6 months of graduating an Albero program, we refund 100% of your fee.',
            items: [
                { value: '94%', label: 'Placement rate', sublabel: 'Cohort 2025-Q1' },
                { value: '₹8.4L', label: 'Average package', sublabel: 'Across all programs' },
                { value: '40+', label: 'Hiring partners', sublabel: 'Active referral pipeline' },
                { value: '6 mo', label: 'Money-back guarantee', sublabel: 'Or full refund — no fine print' }
            ]
        }
    },
    {
        id: sid('home-testimonials'),
        type: 'testimonials',
        variant: 'cards',
        style: { animation: 'fadeUp' },
        data: {
            title: 'Stories from our cohort',
            subtitle: 'Real outcomes from past Albero graduates — not stock photos with stock quotes.',
            items: [
                {
                    quote: 'I went from "I have never written a SQL query" to landing a Data Analyst role at a unicorn within five months. The mentor-led format made all the difference.',
                    name: 'Priya Sharma',
                    role: 'Data Analyst',
                    company: 'Razorpay',
                    avatarUrl: IMG.avatar1
                },
                {
                    quote: 'Albero forced me to apply concepts immediately on real industry-graded projects. I had a portfolio that recruiters actually wanted to see.',
                    name: 'Rahul Verma',
                    role: 'Business Analyst',
                    company: 'Flipkart',
                    avatarUrl: IMG.avatar2
                },
                {
                    quote: 'Placement support was hands-on — three referrals, all converted. The mock interviews were tougher than the actual ones I gave.',
                    name: 'Anjali Mehta',
                    role: 'AI Engineer',
                    company: 'Swiggy',
                    avatarUrl: IMG.avatar3
                }
            ]
        }
    },
    {
        id: sid('home-faq'),
        type: 'faq',
        variant: 'accordion',
        style: { styleClassId: 'sc-tint', animation: 'fadeUp' },
        data: {
            eyebrow: 'FAQ',
            title: 'Common questions',
            subtitle: "Honest answers to what you'd ask a counsellor in your first 10 minutes.",
            items: [
                {
                    question: 'Do I need prior coding experience?',
                    answer:
                        'For Business Analytics — no. For Data Analytics Mastery and AI/ML Engineer — basic programming helps but is not required. Every cohort gets a free 2-week pre-cohort warm-up that covers Python and SQL fundamentals.'
                },
                {
                    question: 'What if I miss a live class?',
                    answer:
                        'Every class is recorded and uploaded the same day. Your mentor also runs office hours twice a week so you can catch up live and get unblocked.'
                },
                {
                    question: 'Is the placement guarantee real?',
                    answer:
                        'Yes. If you graduate, meet the program engagement criteria (attendance + assignments + capstone), and do not get placed within 6 months — we refund 100% of your fee. The criteria are spelled out in your enrolment letter, and the refund is processed within 30 days of the 6-month mark.'
                },
                {
                    question: 'Do you have EMI and scholarships?',
                    answer:
                        'Yes. No-cost EMI starts at ₹3,500/month with every major bank (3, 6, or 12 month tenors). Need-based scholarships up to 30% are available — your counsellor can walk you through eligibility on the discovery call.'
                },
                {
                    question: 'How is Albero different from other bootcamps?',
                    answer:
                        'Two things. First — our mentors are senior practitioners from product companies (Razorpay, Flipkart, Microsoft, Swiggy). They review your work the way they review their own team. Second — our placement guarantee. Most bootcamps promise placement support; we put our money on it.'
                },
                {
                    question: 'What is the daily / weekly time commitment?',
                    answer:
                        '8-10 hours per week for Business Analytics. 12-14 hours per week for Data Analytics Mastery. 14-16 hours per week for AI/ML Engineer. Live classes are 2 evenings + Saturday morning. Everything else is hands-on lab time.'
                }
            ]
        }
    },
    {
        id: sid('home-callout'),
        type: 'callout',
        variant: 'success',
        data: {
            title: 'Now hiring · Cohort 14',
            body: 'Top performers from each cohort are auto-referred to our 40+ partner companies. June batch is filling — secure your seat early.'
        }
    },
    {
        id: sid('home-leadform'),
        type: 'leadForm',
        variant: 'split',
        style: { animation: 'fadeUp' },
        data: {
            eyebrow: 'Get in touch',
            title: 'Talk to a senior counsellor',
            subtitle:
                'Tell us where you are in your career and what you want next — we will recommend the right program with no sales script.',
            submitLabel: 'Request a callback',
            successMessage: 'Got it — your counsellor will call within one working day.',
            showQualification: true,
            showCity: true,
            showMessage: false
        }
    },
    {
        id: sid('home-cta'),
        type: 'cta',
        variant: 'banner',
        data: {
            title: 'Not sure which program is right?',
            subtitle: 'Hop on a free 20-minute counselling call. No pressure, no script.',
            buttonLabel: 'Book my call',
            buttonLink: 'enquiry'
        }
    }
]

// Generic course-page section bundler. Each course page reuses the same
// shape so all three feel cohesive — only the copy differs.
const courseSections = (opts: {
    pageId: string
    title: string
    eyebrow: string
    overview: string
    durationWeeks: number
    feeINR: string
    image: string
    learnPillars: { title: string; description: string }[]
    syllabus: { title: string; description: string }[]
    instructorQuote: string
    instructorName: string
    instructorRole: string
    instructorAvatar: string
}): unknown[] => [
    {
        id: sid(`${opts.pageId}-hero`),
        type: 'hero',
        variant: 'split',
        data: {
            eyebrow: opts.eyebrow,
            title: opts.title,
            subtitle: opts.overview,
            primaryCtaLabel: 'Reserve my seat',
            primaryCtaLink: 'enquiry',
            imageUrl: opts.image,
            imageAlt: `${opts.title} program illustration`
        }
    },
    {
        id: sid(`${opts.pageId}-image`),
        type: 'image',
        variant: 'contained',
        data: { src: opts.image, alt: opts.title, rounded: true }
    },
    {
        id: sid(`${opts.pageId}-stats`),
        type: 'stats',
        variant: 'grid',
        data: {
            items: [
                { value: `${opts.durationWeeks} wks`, label: 'Live cohort duration' },
                { value: opts.feeINR, label: 'Program fee', sublabel: 'No-cost EMI available' },
                { value: '5+', label: 'Portfolio projects' },
                { value: '94%', label: 'Placement rate' }
            ]
        }
    },
    {
        id: sid(`${opts.pageId}-learn`),
        type: 'features',
        variant: 'four-up',
        data: { title: 'What you will learn', pillars: opts.learnPillars }
    },
    {
        id: sid(`${opts.pageId}-syllabus`),
        type: 'features',
        variant: 'list',
        data: { title: 'Syllabus snapshot', pillars: opts.syllabus }
    },
    {
        id: sid(`${opts.pageId}-testimonial`),
        type: 'testimonials',
        variant: 'quotes',
        data: {
            title: 'A note from your instructor',
            items: [
                {
                    quote: opts.instructorQuote,
                    name: opts.instructorName,
                    role: opts.instructorRole,
                    avatarUrl: opts.instructorAvatar
                }
            ]
        }
    },
    {
        id: sid(`${opts.pageId}-leadform`),
        type: 'leadForm',
        variant: 'inline',
        data: {
            eyebrow: 'Limited seats',
            title: `Reserve your ${opts.title} seat`,
            subtitle: 'Drop your details and our admissions counsellor will walk you through the curriculum, fees, and EMI options.',
            submitLabel: 'Reserve my seat',
            successMessage: 'Thanks — your counsellor will call within one working day.',
            coursePrefill: opts.title,
            showQualification: true,
            showCity: false,
            showMessage: true
        }
    },
    {
        id: sid(`${opts.pageId}-cta`),
        type: 'cta',
        variant: 'card',
        data: {
            title: 'Have a quick question?',
            subtitle: 'Counsellors respond within one working day.',
            buttonLabel: 'Talk to a counsellor',
            buttonLink: 'enquiry'
        }
    }
]

const aboutSections = (): unknown[] => [
    {
        id: sid('about-hero'),
        type: 'hero',
        variant: 'centered',
        data: {
            eyebrow: 'About Albero',
            title: 'We build careers — not just courses.',
            subtitle:
                'Albero Academy was started in 2022 by a team of senior practitioners who were tired of how disconnected most online courses were from the work that actually gets done in industry.'
        }
    },
    {
        id: sid('about-features'),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'What sets us apart',
            pillars: [
                { title: 'Senior mentors', description: 'Every cohort is led by working professionals from product companies and unicorns.' },
                { title: 'Industry-graded projects', description: 'You ship real work — not toy assignments. Every project is reviewed.' },
                { title: 'Placement-first', description: 'Resume reviews, mock interviews, and direct partner-company referrals.' }
            ]
        }
    },
    {
        id: sid('about-stats'),
        type: 'stats',
        variant: 'banner',
        data: {
            title: 'Our impact',
            items: [
                { value: '12k+', label: 'Alumni' },
                { value: '40+', label: 'Hiring partners' },
                { value: '4.8/5', label: 'Avg cohort rating' },
                { value: '85%', label: 'Career switch rate' }
            ]
        }
    },
    {
        id: sid('about-cta'),
        type: 'cta',
        variant: 'banner',
        data: {
            title: 'Curious about our cohorts?',
            subtitle: 'A 20-minute counselling call is the fastest way to figure out if Albero is the right fit.',
            buttonLabel: 'Talk to a counsellor',
            buttonLink: 'enquiry'
        }
    }
]

const contactSections = (): unknown[] => [
    {
        id: sid('contact-hero'),
        type: 'hero',
        variant: 'centered',
        data: {
            eyebrow: 'Contact',
            title: 'Talk to a counsellor.',
            subtitle: 'Drop your details below — we usually respond within one working day.'
        }
    },
    {
        id: sid('contact-leadform'),
        type: 'leadForm',
        variant: 'inline',
        data: {
            title: 'Send us a message',
            submitLabel: 'Send',
            successMessage: 'Got it — we will be in touch.',
            showQualification: false,
            showCity: true,
            showMessage: true
        }
    },
    {
        id: sid('contact-cta'),
        type: 'cta',
        variant: 'card',
        data: {
            title: 'Prefer email?',
            subtitle: 'Drop us a line at hello@albero.academy — we read every message.',
            buttonLabel: 'Email us',
            buttonLink: 'mailto:hello@albero.academy'
        }
    }
]

// blogSections() removed — RESOURCE_PAGES["pg-blog"] now owns slug "/blog"
// with the richer Meritshot-style hero + stats + post list. The old CMS-backed
// collectionList variant is recoverable from git history if dynamic blog
// posts come back later.

const faqSections = (): unknown[] => [
    {
        id: sid('faq-hero'),
        type: 'hero',
        variant: 'centered',
        data: {
            eyebrow: 'Help centre',
            title: 'Frequently asked questions',
            subtitle: 'Cannot find what you are looking for? Reach out via WhatsApp or the support form.'
        }
    },
    {
        id: sid('faq-list'),
        type: 'collectionList',
        variant: 'accordion',
        data: {
            collectionSlug: 'faqs',
            title: 'Browse questions',
            titleField: 'question',
            summaryField: 'answer',
            limit: 50
        }
    },
    {
        id: sid('faq-cta'),
        type: 'cta',
        variant: 'banner',
        data: {
            title: 'Still have questions?',
            subtitle: 'A counselling call is the fastest way to get answers tailored to you.',
            buttonLabel: 'Talk to a counsellor',
            buttonLink: 'enquiry'
        }
    }
]

// ---- Campaign landing pages -------------------------------------------------
//
// One page per major UTM campaign. Each is conversion-tuned for the traffic
// source it is meant to receive: webinar funnel for the newsletter blast,
// scholarship hero for the broad reach campaigns, etc. Always end with a
// strong inline lead form so the click does not bounce.

const masterclassSections = (): unknown[] => [
    {
        id: sid('mc-hero'),
        type: 'hero',
        variant: 'gradient',
        data: {
            eyebrow: 'Free 90-minute masterclass · Saturday 8 PM IST',
            title: 'Break into Data Analytics in 2026.',
            subtitle: 'Live with senior practitioners from Microsoft, PhonePe and Razorpay. Limited to 200 seats — registration closes Friday.',
            primaryCtaLabel: 'Reserve free seat',
            primaryCtaLink: '#register'
        }
    },
    {
        id: sid('mc-stats'),
        type: 'stats',
        variant: 'grid',
        data: {
            items: [
                { value: '90 min', label: 'Live + Q&A' },
                { value: '200', label: 'Seats only' },
                { value: 'Free', label: 'No card required' },
                { value: '5★', label: 'Past attendee rating' }
            ]
        }
    },
    {
        id: sid('mc-features'),
        type: 'features',
        variant: 'four-up',
        data: {
            title: 'What we will cover',
            pillars: [
                { title: 'The 2026 hiring landscape', description: 'What roles are actually open and what they pay across India.' },
                { title: 'Skills that matter', description: 'The non-negotiable analytics stack vs the noise.' },
                { title: '90-day roadmap', description: 'Week-by-week plan to land your first interview.' },
                { title: 'Live Q&A', description: '30 minutes of your questions answered live, no script.' }
            ]
        }
    },
    {
        id: sid('mc-testimonial'),
        type: 'testimonials',
        variant: 'quotes',
        data: {
            title: 'From a past masterclass attendee',
            items: [
                {
                    quote: 'I attended thinking I would just take notes. Two months later I had a job offer. The roadmap was exactly what I needed.',
                    name: 'Anjali Mehta',
                    role: 'Data Analyst',
                    company: 'Swiggy',
                    avatarUrl: IMG.avatar3
                }
            ]
        }
    },
    {
        id: sid('mc-leadform'),
        type: 'leadForm',
        variant: 'split',
        data: {
            eyebrow: 'Save your seat',
            title: 'Free registration',
            subtitle: 'Drop your email — we will send the calendar invite + Zoom link.',
            submitLabel: 'Register free',
            successMessage: 'Registered — check your inbox for the joining link.',
            coursePrefill: 'Free Data Analytics masterclass',
            showQualification: false,
            showCity: false,
            showMessage: false
        }
    },
    {
        id: sid('mc-callout'),
        type: 'callout',
        variant: 'info',
        data: {
            title: 'Cannot attend live?',
            body: 'Register anyway — registered attendees get the recording + bonus 90-day roadmap PDF emailed within 24 hours.'
        }
    }
]

const scholarshipSections = (): unknown[] => [
    {
        id: sid('sch-hero'),
        type: 'hero',
        variant: 'split',
        data: {
            eyebrow: 'Cohort 14 · scholarships closing soon',
            title: 'Up to 30% off — need-based scholarships for Cohort 14.',
            subtitle: 'We hold back 20% of every cohort for need-based scholarships. Apply once and you are considered for every program.',
            primaryCtaLabel: 'Apply for scholarship',
            primaryCtaLink: '#apply',
            imageUrl: IMG.heroLearners,
            imageAlt: 'Students celebrating scholarship awards'
        }
    },
    {
        id: sid('sch-stats'),
        type: 'stats',
        variant: 'banner',
        data: {
            title: 'Scholarship at a glance',
            items: [
                { value: '30%', label: 'Max award', sublabel: 'On any program fee' },
                { value: '20%', label: 'Of every cohort', sublabel: 'Reserved for scholars' },
                { value: '15 min', label: 'Application time', sublabel: 'No essays' },
                { value: '7 days', label: 'Decision turnaround' }
            ]
        }
    },
    {
        id: sid('sch-features'),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'How it works',
            pillars: [
                { title: '1. Apply', description: 'Fill the short form below — takes ~15 minutes.' },
                { title: '2. Counselling call', description: 'Our team validates your situation and recommends the right program.' },
                { title: '3. Decision in 7 days', description: 'You get a written award letter you can use to plan finances.' }
            ]
        }
    },
    {
        id: sid('sch-leadform'),
        type: 'leadForm',
        variant: 'split',
        data: {
            eyebrow: 'Step 1 of 1',
            title: 'Apply for a scholarship',
            subtitle: 'Tell us a bit about yourself — we treat applications confidentially.',
            submitLabel: 'Submit application',
            successMessage: 'Got it — our scholarships team will reach out within one working day.',
            coursePrefill: 'Scholarship enquiry',
            showQualification: true,
            showCity: true,
            showMessage: true
        }
    },
    {
        id: sid('sch-cta'),
        type: 'cta',
        variant: 'card',
        data: {
            title: 'Have questions about eligibility?',
            subtitle: 'WhatsApp our scholarships counsellor — we usually reply within an hour during work hours.',
            buttonLabel: 'Open WhatsApp',
            buttonLink: 'enquiry'
        }
    }
]

const applySections = (): unknown[] => [
    {
        id: sid('apply-hero'),
        type: 'hero',
        variant: 'centered',
        data: {
            eyebrow: 'Cohort 14 · enrolling now',
            title: 'Apply in 60 seconds.',
            subtitle: 'Tell us a bit about yourself. A senior counsellor will call within one working day.'
        }
    },
    {
        id: sid('apply-leadform'),
        type: 'leadForm',
        variant: 'inline',
        data: {
            title: 'Reserve your seat',
            subtitle: 'Limited cohort spots — first-come, first-served.',
            submitLabel: 'Reserve my seat',
            successMessage: 'Thanks — we will be in touch shortly.',
            showQualification: true,
            showCity: false,
            showMessage: true
        }
    },
    {
        id: sid('apply-stats'),
        type: 'stats',
        variant: 'grid',
        data: {
            items: [
                { value: '94%', label: 'Placement rate' },
                { value: '₹8.4L', label: 'Avg package' },
                { value: '4.8/5', label: 'Cohort rating' },
                { value: '6 mo', label: 'Refund guarantee' }
            ]
        }
    },
    {
        id: sid('apply-callout'),
        type: 'callout',
        variant: 'info',
        data: {
            title: 'Not ready to apply?',
            body: 'Book a free 20-minute counselling call instead — no commitment required.'
        }
    }
]

// ---- The full landing.json ---------------------------------------------------

const buildLandingJson = () => {
    const linkId = (key: string) => `lnk-${key}`
    const pageId = (slug: string) => `pg-${slug}`

    const pages = [
        {
            id: pageId('home'),
            slug: '/',
            name: 'Home',
            isHome: true,
            sections: homeSections(),
            seo: {
                title: 'Albero Academy · Premium career certifications in Analytics & AI',
                description:
                    'Live mentor-led cohorts in Business Analytics, Data Analytics, and AI/ML — backed by a 6-month placement guarantee. Cohort 14 enrolling now.',
                ogImageUrl: IMG.heroAbstract
            }
        },
        {
            id: pageId('business-analytics'),
            slug: '/business-analytics',
            name: 'Business Analytics',
            sections: courseSections({
                pageId: 'ba',
                eyebrow: 'Cohort 14 · 14-week live program',
                title: 'Business Analytics Pro',
                overview:
                    'Become the analyst your team actually relies on. SQL, Excel, Power BI, Tableau, A/B testing, and stakeholder communication — taught live by senior analysts from product companies.',
                durationWeeks: 14,
                feeINR: '₹49,999',
                image: IMG.courseBA,
                learnPillars: [
                    { title: 'SQL deep dive', description: 'Window functions, CTEs, query optimisation. Production-grade SQL on real datasets.' },
                    { title: 'Power BI + Tableau', description: 'Build dashboards stakeholders trust. Calculated fields, RLS, performance tuning.' },
                    {
                        title: 'A/B + Experimentation',
                        description: 'Hypothesis design, sample sizing, multiple comparisons. The math behind every product decision.'
                    },
                    {
                        title: 'Stakeholder craft',
                        description: 'Storyboarding insights, defending recommendations, and influencing without authority.'
                    }
                ],
                syllabus: [
                    { title: 'Weeks 1-3 · Foundations', description: 'Excel power-ups, SQL fundamentals, descriptive statistics.' },
                    { title: 'Weeks 4-7 · Data tooling', description: 'Power BI / Tableau, dashboard design, KPI frameworks.' },
                    { title: 'Weeks 8-11 · Analytics craft', description: 'A/B testing, cohort analysis, funnel diagnostics.' },
                    { title: 'Weeks 12-14 · Capstone', description: 'A real industry project — reviewed by a hiring partner.' }
                ],
                instructorQuote:
                    'I have hired more than 30 analysts at three different unicorns. The single biggest gap is rarely SQL — it is the ability to turn a number into a decision. That is what we teach.',
                instructorName: 'Vikram Iyer',
                instructorRole: 'Lead Mentor · Ex-Flipkart, Razorpay',
                instructorAvatar: IMG.avatar4
            }),
            seo: {
                title: 'Business Analytics Pro · Albero Academy',
                description:
                    '14-week live mentor-led Business Analytics cohort. SQL, Power BI, Tableau, A/B testing, and stakeholder communication — with placement guarantee.',
                ogImageUrl: IMG.courseBA
            }
        },
        {
            id: pageId('data-analytics'),
            slug: '/data-analytics',
            name: 'Data Analytics',
            sections: courseSections({
                pageId: 'da',
                eyebrow: 'Cohort 14 · 20-week intensive',
                title: 'Data Analytics Mastery',
                overview:
                    'A 20-week deep dive for analysts ready to level up to data science. Python, statistics, machine learning fundamentals, cloud warehousing, and production analytics — taught live, on real datasets.',
                durationWeeks: 20,
                feeINR: '₹74,999',
                image: IMG.courseDA,
                learnPillars: [
                    {
                        title: 'Python for data',
                        description: 'Pandas, NumPy, scikit-learn. Idiomatic Python from day one — not "Python with R syntax".'
                    },
                    {
                        title: 'Statistics that ships',
                        description: 'Bayesian thinking, regression, time-series, and causal inference. The bits that actually show up in real work.'
                    },
                    { title: 'Cloud warehousing', description: 'Snowflake / BigQuery / dbt. Modelling production data pipelines that scale.' },
                    { title: 'ML fundamentals', description: 'Trees, ensembles, regularisation. When (and when not) to reach for ML.' }
                ],
                syllabus: [
                    { title: 'Weeks 1-4 · Python + SQL', description: 'Programming foundations, pandas, advanced SQL.' },
                    { title: 'Weeks 5-9 · Statistics', description: 'Inference, regression, A/B testing, causal inference.' },
                    { title: 'Weeks 10-14 · ML', description: 'Supervised learning, feature engineering, evaluation, model selection.' },
                    { title: 'Weeks 15-18 · Production', description: 'dbt, Snowflake, Airflow. Pipelines that run on schedule.' },
                    { title: 'Weeks 19-20 · Capstone', description: 'End-to-end project deployed to production, reviewed by a partner company.' }
                ],
                instructorQuote:
                    'Most "data science" courses teach you the libraries. We teach you the muscle: framing the problem, picking the right model for the constraint, and shipping it.',
                instructorName: 'Aditi Kapoor',
                instructorRole: 'Lead Mentor · Ex-Microsoft, PhonePe',
                instructorAvatar: IMG.avatar1
            }),
            seo: {
                title: 'Data Analytics Mastery · Albero Academy',
                description:
                    '20-week live intensive in Python, statistics, ML, and cloud warehousing. From analyst to data scientist — with placement guarantee.',
                ogImageUrl: IMG.courseDA
            }
        },
        {
            id: pageId('ai-ml'),
            slug: '/ai-ml',
            name: 'AI/ML Programs',
            sections: courseSections({
                pageId: 'aiml',
                eyebrow: 'Cohort 14 · 24-week engineer track',
                title: 'AI/ML Engineer',
                overview:
                    'A 24-week intensive for engineers ready to build production AI systems. Neural nets, transformers, MLOps, and deployment — taught by mentors who ship LLM-powered products at scale.',
                durationWeeks: 24,
                feeINR: '₹99,999',
                image: IMG.courseAI,
                learnPillars: [
                    {
                        title: 'Deep learning',
                        description: 'PyTorch from scratch, attention, transformers, and the mental model that makes them click.'
                    },
                    { title: 'LLMs in production', description: 'RAG pipelines, evals, fine-tuning, prompt engineering, and cost optimisation.' },
                    { title: 'MLOps', description: 'Feature stores, experiment tracking, model registries, and CI/CD for ML.' },
                    { title: 'Deployment', description: 'Serving at scale — vLLM, Triton, autoscaling, and observability.' }
                ],
                syllabus: [
                    {
                        title: 'Weeks 1-5 · Deep learning foundations',
                        description: 'PyTorch, backprop, optimisation, regularisation, training loops.'
                    },
                    { title: 'Weeks 6-11 · Modern architectures', description: 'CNNs, RNNs, transformers, attention mechanisms.' },
                    { title: 'Weeks 12-17 · LLMs + RAG', description: 'Building retrieval-augmented generation, evals, fine-tuning workflows.' },
                    { title: 'Weeks 18-22 · MLOps + deployment', description: 'Feature stores, model registries, vLLM, autoscaling, monitoring.' },
                    { title: 'Weeks 23-24 · Capstone', description: 'Ship a production AI feature, reviewed by a partner company.' }
                ],
                instructorQuote:
                    'We do not teach "AI hype" — we teach the boring engineering that makes models actually run, scale, and stay correct in production.',
                instructorName: 'Karan Bhatia',
                instructorRole: 'Lead Mentor · Ex-Amazon, Swiggy',
                instructorAvatar: IMG.avatar2
            }),
            seo: {
                title: 'AI/ML Engineer · Albero Academy',
                description:
                    '24-week live program for engineers building production AI. PyTorch, transformers, LLMs, RAG, MLOps, and deployment — with placement guarantee.',
                ogImageUrl: IMG.courseAI
            }
        },
        {
            id: pageId('about'),
            slug: '/about',
            name: 'About',
            sections: aboutSections(),
            seo: {
                title: 'About Albero Academy',
                description:
                    'Albero Academy is a senior-led learning platform building careers in Analytics, Data Science, and AI/ML — through live mentorship, real projects, and placement-first design.',
                ogImageUrl: IMG.heroLearners
            }
        },
        {
            id: pageId('contact'),
            slug: '/contact',
            name: 'Contact',
            sections: contactSections(),
            seo: {
                title: 'Contact Albero Academy',
                description: 'Talk to an Albero counsellor about programs, fees, EMI, and scholarships.'
            }
        },
        // Blog page is provided by the resource module (RESOURCE_PAGES) at the
        // bottom of this list — it owns slug "/blog" with the richer Meritshot-
        // style hero + stats + post list. The previous CMS-backed blog page
        // (blogSections + collectionList) is intentionally retired so we don't
        // ship two pages mounted at the same slug.
        {
            id: pageId('faq'),
            slug: '/faq',
            name: 'FAQ',
            sections: faqSections(),
            seo: {
                title: 'FAQ · Albero Academy',
                description: 'Common questions about programs, fees, EMI, scholarships, and the Albero placement guarantee.'
            }
        },
        // Campaign landing pages — destinations for the seeded UTM links.
        // Kept out of the navbar so they only show up to ad/email/social
        // traffic that follows the tagged URL.
        {
            id: pageId('masterclass'),
            slug: '/masterclass',
            name: 'Free Masterclass',
            sections: masterclassSections(),
            seo: {
                title: 'Free Data Analytics Masterclass · Albero Academy',
                description:
                    'Free 90-minute live masterclass — break into Data Analytics in 2026. Limited to 200 seats. Hosted by senior practitioners from Microsoft, PhonePe and Razorpay.',
                ogImageUrl: IMG.heroAbstract
            }
        },
        {
            id: pageId('scholarship'),
            slug: '/scholarship',
            name: 'Scholarship',
            sections: scholarshipSections(),
            seo: {
                title: 'Cohort 14 scholarship · Albero Academy',
                description: 'Apply for a need-based scholarship — up to 30% off any Albero program. 7-day decision turnaround.',
                ogImageUrl: IMG.heroLearners
            }
        },
        {
            id: pageId('apply'),
            slug: '/apply',
            name: 'Apply now',
            sections: applySections(),
            seo: {
                title: 'Apply to Albero Academy · Cohort 14',
                description: 'Reserve your seat in Cohort 14. 60-second application — a counsellor calls within one working day.'
            }
        },
        // Policy pages — referenced from the footer "Policies" column. Content
        // lives in albero-policies.ts so legal-text edits don't churn this file.
        ...POLICY_PAGES.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            sections: p.sections,
            seo: {
                title: p.title,
                description: p.seoDescription
            }
        })),
        // Resource pages — surfaced through the Resources mega-menu in the
        // navbar. Content lives in albero-resources.ts.
        ...RESOURCE_PAGES.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            sections: p.sections,
            seo: {
                title: p.title,
                description: p.seoDescription
            }
        }))
    ]

    return {
        pages,
        sections: pages[0].sections,
        site: {
            title: 'Albero Academy · Career-grade certifications in Analytics & AI',
            faviconUrl: undefined,
            ogImageUrl: IMG.heroAbstract
        },
        analytics: {
            googleAnalyticsId: 'G-PLACEHOLDER',
            metaPixelId: '0000000000000000',
            whatsappNumber: '+919999999999',
            whatsappMessage: 'Hi! I would like to know more about Albero Academy programs.'
        },
        navbar: {
            variant: 'split-centered',
            mobileVariant: 'sheet',
            showLogo: true,
            showSignIn: true,
            signInLabel: 'Sign in',
            ctaLabel: 'Talk to counsellor',
            ctaPageId: pageId('contact'),
            links: [
                { id: linkId('nav-home'), label: 'Home', pageId: pageId('home') },
                {
                    id: linkId('nav-courses'),
                    label: 'Courses',
                    mega: true,
                    columns: 1,
                    children: [
                        {
                            id: linkId('nav-courses-ba'),
                            label: 'Business Analytics',
                            pageId: pageId('business-analytics'),
                            icon: 'chart',
                            description: 'SQL · Power BI · Tableau · A/B testing'
                        },
                        {
                            id: linkId('nav-courses-da'),
                            label: 'Data Analytics',
                            pageId: pageId('data-analytics'),
                            icon: 'database',
                            description: 'Python · statistics · ML · cloud warehousing'
                        },
                        {
                            id: linkId('nav-courses-aiml'),
                            label: 'AI/ML Programs',
                            pageId: pageId('ai-ml'),
                            icon: 'sparkles',
                            description: 'PyTorch · transformers · RAG · MLOps'
                        }
                    ]
                },
                {
                    id: linkId('nav-resources'),
                    label: 'Resources',
                    mega: true,
                    columns: 2,
                    children: [
                        {
                            id: linkId('nav-resources-blog'),
                            label: 'Blog',
                            pageId: 'pg-blog',
                            icon: 'message',
                            description: 'Deep-dive articles on tech, careers & interviews'
                        },
                        {
                            id: linkId('nav-resources-tutorials'),
                            label: 'Tutorials',
                            pageId: 'pg-tutorials',
                            icon: 'book',
                            description: 'Step-by-step coding walkthroughs with code + video'
                        },
                        {
                            id: linkId('nav-resources-soft'),
                            label: 'Soft Skills Training',
                            pageId: 'pg-soft-skills',
                            icon: 'users',
                            description: 'Communication, leadership & interview polish'
                        },
                        {
                            id: linkId('nav-resources-cases'),
                            label: 'Case Studies',
                            pageId: 'pg-case-studies',
                            icon: 'briefcase',
                            description: 'Real-world business problems, broken down end-to-end'
                        },
                        {
                            id: linkId('nav-resources-interview'),
                            label: 'Interview Guides',
                            pageId: 'pg-interview-guides',
                            icon: 'award',
                            description: 'Company-specific prep for MAANG, IB & product roles'
                        },
                        {
                            id: linkId('nav-resources-cheat'),
                            label: 'CheatSheet',
                            pageId: 'pg-cheat-sheets',
                            icon: 'compass',
                            description: 'Quick one-pagers for revising key concepts'
                        }
                    ]
                },
                { id: linkId('nav-about'), label: 'About', pageId: pageId('about') },
                { id: linkId('nav-faq'), label: 'FAQ', pageId: pageId('faq') }
            ]
        },
        footer: {
            variant: 'columns',
            tagline: 'Career-grade certifications in Analytics, Data Science, and AI/ML.',
            copyright: `© ${new Date().getFullYear()} Albero Academy. All rights reserved.`,
            showSocial: true,
            social: {
                linkedin: 'https://www.linkedin.com/company/albero-academy',
                instagram: 'https://www.instagram.com/albero.academy',
                youtube: 'https://www.youtube.com/@alberoacademy'
            },
            columns: [
                {
                    id: 'col-programs',
                    title: 'Programs',
                    links: [
                        { id: linkId('foot-ba'), label: 'Business Analytics', pageId: pageId('business-analytics') },
                        { id: linkId('foot-da'), label: 'Data Analytics', pageId: pageId('data-analytics') },
                        { id: linkId('foot-aiml'), label: 'AI/ML Programs', pageId: pageId('ai-ml') }
                    ]
                },
                {
                    id: 'col-company',
                    title: 'Company',
                    links: [
                        { id: linkId('foot-about'), label: 'About', pageId: pageId('about') },
                        { id: linkId('foot-blog'), label: 'Blog', pageId: 'pg-blog' },
                        { id: linkId('foot-faq'), label: 'FAQ', pageId: pageId('faq') }
                    ]
                },
                {
                    id: 'col-support',
                    title: 'Support',
                    links: [
                        { id: linkId('foot-contact'), label: 'Contact', pageId: pageId('contact') },
                        { id: linkId('foot-enquire'), label: 'Talk to counsellor', url: 'enquiry' }
                    ]
                },
                {
                    id: 'col-policies',
                    title: 'Policies',
                    links: [
                        { id: linkId('foot-terms'), label: 'Terms of Use', pageId: 'pg-terms-of-use' },
                        { id: linkId('foot-privacy'), label: 'Privacy Policy', pageId: 'pg-privacy-policy' },
                        { id: linkId('foot-refund'), label: 'Refund Policy', pageId: 'pg-refund-policy' },
                        { id: linkId('foot-escalation'), label: 'Escalation Policy', pageId: 'pg-escalation-policy' },
                        { id: linkId('foot-exam'), label: 'Examination & Certification Policy', pageId: 'pg-examination-policy' }
                    ]
                }
            ]
        },
        styleClasses: STYLE_CLASSES
    }
}

// ---- Per-tenant UTM links (settings.utmLinks) ------------------------------
//
// Pre-seed a starter set of marketing campaigns so the SA opens UTM Builder
// to a populated list, not an empty state. Tenant slug is hard-coded into the
// fullUrl so links work standalone (clipboard share). The runtime preview in
// the UTM Builder always re-derives the URL from current origin + current
// destination — these stored entries are just the persisted state.
const buildUtmLinks = (origin: string, slug: string) => {
    const u = (path: string, params: Record<string, string>): string => {
        const qs = new URLSearchParams(params).toString()
        return `${origin}/t/${slug}${path}?${qs}`
    }
    const now = new Date()
    return [
        {
            id: 'utm-instagram-spring',
            tenantId: '',
            label: 'Instagram · spring 2026 reels',
            destination: '/enquiry',
            source: 'instagram',
            medium: 'social',
            campaign: 'spring-2026',
            content: 'reel-cohort14',
            fullUrl: u('/enquiry', {
                utm_source: 'instagram',
                utm_medium: 'social',
                utm_campaign: 'spring-2026',
                utm_content: 'reel-cohort14'
            }),
            createdAt: now.toISOString(),
            clickCount: 0
        },
        {
            id: 'utm-google-ba',
            tenantId: '',
            label: 'Google Ads · Business Analytics',
            destination: '/business-analytics',
            source: 'google',
            medium: 'cpc',
            campaign: 'ba-jun26',
            term: 'business analytics course',
            fullUrl: u('/business-analytics', {
                utm_source: 'google',
                utm_medium: 'cpc',
                utm_campaign: 'ba-jun26',
                utm_term: 'business analytics course'
            }),
            createdAt: now.toISOString(),
            clickCount: 0
        },
        {
            id: 'utm-linkedin-aiml',
            tenantId: '',
            label: 'LinkedIn · AI/ML sponsored',
            destination: '/ai-ml',
            source: 'linkedin',
            medium: 'cpc',
            campaign: 'aiml-q2',
            content: 'sponsored-carousel',
            fullUrl: u('/ai-ml', {
                utm_source: 'linkedin',
                utm_medium: 'cpc',
                utm_campaign: 'aiml-q2',
                utm_content: 'sponsored-carousel'
            }),
            createdAt: now.toISOString(),
            clickCount: 0
        },
        {
            id: 'utm-newsletter',
            tenantId: '',
            label: 'Newsletter · May broadcast',
            destination: '/masterclass',
            source: 'newsletter',
            medium: 'email',
            campaign: 'may-2026',
            fullUrl: u('/masterclass', {
                utm_source: 'newsletter',
                utm_medium: 'email',
                utm_campaign: 'may-2026'
            }),
            createdAt: now.toISOString(),
            clickCount: 0
        },
        {
            id: 'utm-fb-scholarship',
            tenantId: '',
            label: 'Facebook · scholarship reach',
            destination: '/scholarship',
            source: 'facebook',
            medium: 'paid-social',
            campaign: 'scholarship-q2',
            content: 'carousel-3up',
            fullUrl: u('/scholarship', {
                utm_source: 'facebook',
                utm_medium: 'paid-social',
                utm_campaign: 'scholarship-q2',
                utm_content: 'carousel-3up'
            }),
            createdAt: now.toISOString(),
            clickCount: 0
        },
        {
            id: 'utm-whatsapp-apply',
            tenantId: '',
            label: 'WhatsApp · counsellor share',
            destination: '/apply',
            source: 'whatsapp',
            medium: 'referral',
            campaign: 'counsellor-cohort14',
            fullUrl: u('/apply', {
                utm_source: 'whatsapp',
                utm_medium: 'referral',
                utm_campaign: 'counsellor-cohort14'
            }),
            createdAt: now.toISOString(),
            clickCount: 0
        }
    ]
}

// ---- Per-tenant SEO (settings.seo) ------------------------------------------

const buildSeo = () => ({
    metaTitle: 'Albero Academy · Premium certifications in Analytics, Data Science & AI',
    metaDescription:
        'Live mentor-led cohorts in Business Analytics, Data Analytics, and AI/ML. Placement guarantee. Senior mentors. Real industry projects. Apply for Cohort 14.',
    canonicalUrl: 'https://albero.academy',
    ogImageUrl: IMG.heroAbstract,
    robots: 'index, follow',
    keywords: [
        'business analytics course',
        'data analytics certification',
        'ai ml engineering bootcamp',
        'data science course bangalore',
        'sql power bi tableau course',
        'python data science course',
        'live mentor led cohort',
        'placement guarantee analytics',
        'career switch to data',
        'mlops bootcamp india'
    ]
})

// ---- Main entry --------------------------------------------------------------

export async function seedAlberoAcademy(prisma: Prisma): Promise<void> {
    const ALBERO_SLUG = 'albero-academy'
    const TENANT_NAME = 'Albero Academy'
    const ADMIN_EMAIL = 'admin@albero.academy'
    const COUNSELLOR_EMAIL = 'counsellor@albero.academy'
    const TRAINER_EMAIL = 'trainer@albero.academy'
    const STUDENT_EMAIL = 'student@albero.academy'

    const passwordHash = await bcrypt.hash('AlberoAcademy123', 10)

    // Origin used to build absolute UTM links. Picks up FRONTEND_BASE_URL when
    // available so links work in deployed environments; falls back to the local
    // dev URL otherwise. SAs can edit/regenerate later from the UTM Builder.
    const FRONTEND_ORIGIN = process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173'

    // 1. Tenant
    //
    // `environment` carries the per-tenant secrets read by payments/Sheets.
    // Razorpay reads `tenant.settings.environment.razorpay.{keyId,keySecret,webhookSecret}`
    // and the Sheets push reads `tenant.settings.environment.googleSheets.serviceAccountJson`.
    //
    // Razorpay test creds are baked into the seed for local dev so the
    // checkout flow works out-of-the-box. Override via env vars before
    // seeding production. Sheet ID + service-account JSON have no sensible
    // dev default — the SuperAdmin/Admin sets those from the dashboard
    // (Tenants → Environment, and Integrations) when ready to wire Sheets.
    const settings = {
        landing: buildLandingJson(),
        seo: buildSeo(),
        utmLinks: buildUtmLinks(FRONTEND_ORIGIN, ALBERO_SLUG),
        contacts: {
            primaryEmail: 'hello@albero.academy',
            primaryPhone: '+91-99999-99999',
            secondaryEmail: 'admissions@albero.academy'
        },
        environment: {
            razorpay: {
                keyId: process.env.ALBERO_RAZORPAY_KEY_ID ?? 'rzp_test_SheFoZBecqJT2X',
                keySecret: process.env.ALBERO_RAZORPAY_KEY_SECRET ?? 'wgcv5z3hesSl3FuY5OV0T2wp',
                webhookSecret: process.env.ALBERO_RAZORPAY_WEBHOOK_SECRET ?? ''
            }
        },
        features: {
            coleadPipeline: true,
            demoControl: true,
            notifications: true,
            tickets: true,
            googleSheetsSync: true,
            razorpay: true,
            websockets: true,
            auditLogs: true,
            counsellorTargets: true
        }
    }

    const tenant = await prisma.tenant.upsert({
        where: { slug: ALBERO_SLUG },
        update: {
            name: TENANT_NAME,
            brandingColor: '#5b3df5',
            settings: settings as object
        },
        create: {
            name: TENANT_NAME,
            slug: ALBERO_SLUG,
            plan: 'GROWTH',
            brandingColor: '#5b3df5',
            settings: settings as object
        }
    })

    // 2. Users — admin + trainer + counsellor + a sample student
    const userSeeds: { email: string; first: string; last: string; role: Role; employeeCode?: string }[] = [
        { email: ADMIN_EMAIL, first: 'Anaya', last: 'Admin', role: Role.ADMIN, employeeCode: 'AL-A-001' },
        { email: TRAINER_EMAIL, first: 'Vikram', last: 'Iyer', role: Role.TRAINER, employeeCode: 'AL-T-001' },
        { email: COUNSELLOR_EMAIL, first: 'Cara', last: 'Counsellor', role: Role.COUNSELLOR, employeeCode: 'AL-C-001' },
        { email: STUDENT_EMAIL, first: 'Sam', last: 'Student', role: Role.STUDENT }
    ]

    for (const u of userSeeds) {
        await prisma.user.upsert({
            where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
            update: { employeeCode: u.employeeCode },
            create: {
                tenantId: tenant.id,
                email: u.email,
                passwordHash,
                firstName: u.first,
                lastName: u.last,
                role: u.role,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                provider: AuthProvider.LOCAL,
                employeeCode: u.employeeCode
            }
        })
    }

    const trainer = await prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: TRAINER_EMAIL } }
    })

    // 3. Flagship courses — one per program slug on the public marketing site
    // (Albero_Frontend/.../constants/programs.ts). Slugs MUST match those
    // exactly so the public Razorpay checkout flow can resolve a course from
    // a /programs/:slug page click. Prices mirror each program's
    // recommended "Mentor-Led" tier (in paise, INR-major × 100 × 100). When
    // a new program is added on the marketing site, add a matching entry
    // here and re-run the seed.
    const courseSeeds: { slug: string; title: string; description: string; price: number; thumbnail: string; tags: string[] }[] = [
        {
            slug: 'business-analytics',
            title: 'Business Analytics',
            description:
                '6-month structured program: Excel, SQL, Power BI, Tableau, Python and storytelling — designed to make you industry-ready for analytics, consulting, and BI roles.',
            price: 6500000,
            thumbnail: IMG.courseBA,
            tags: ['analytics', 'sql', 'power-bi', 'tableau', 'excel']
        },
        {
            slug: 'data-analytics',
            title: 'Data Analytics',
            description:
                '5-month hands-on program covering SQL, Python, statistics, Power BI and Tableau — with portfolio-grade projects and a placement-focused career sprint.',
            price: 7500000,
            thumbnail: IMG.courseDA,
            tags: ['data-analytics', 'sql', 'python', 'statistics', 'power-bi']
        },
        {
            slug: 'data-science-ai',
            title: 'Data Science with ML & GenAI',
            description:
                '9-month flagship: Python, ML, deep learning, NLP & GenAI, MLOps. For engineers building production AI systems and ML products.',
            price: 12500000,
            thumbnail: IMG.courseAI,
            tags: ['data-science', 'machine-learning', 'deep-learning', 'genai', 'mlops']
        },
        {
            slug: 'full-stack',
            title: 'Full Stack Development',
            description:
                '7-month MERN-stack program: React, Node, Express, MongoDB, Postgres, Docker, AWS — with DSA, system design, and mock interviews built in.',
            price: 9500000,
            thumbnail: IMG.courseBA,
            tags: ['full-stack', 'react', 'node', 'mongodb', 'devops']
        },
        {
            slug: 'data-engineering',
            title: 'Data Engineering',
            description:
                '8-month program covering SQL modelling, Spark, Airflow, dbt + Snowflake, and cloud data platforms — for engineers building the pipelines that power AI.',
            price: 8500000,
            thumbnail: IMG.courseDA,
            tags: ['data-engineering', 'spark', 'airflow', 'dbt', 'snowflake']
        },
        {
            slug: 'cybersecurity',
            title: 'Cybersecurity',
            description:
                '6-month security-engineering track: network security, OWASP, threat modelling, blue/red-team labs, and CTF-style capstones.',
            price: 7000000,
            thumbnail: IMG.courseAI,
            tags: ['cybersecurity', 'network-security', 'owasp', 'ctf']
        },
        {
            slug: 'investment-banking',
            title: 'Investment Banking',
            description:
                '6-month finance program: financial modelling, DCF & comparables valuation, M&A, LBO, pitchbook builds, and IB mock interviews.',
            price: 8000000,
            thumbnail: IMG.courseBA,
            tags: ['investment-banking', 'financial-modelling', 'valuation', 'm-and-a']
        },
        {
            slug: 'product-analytics',
            title: 'Product Analytics',
            description:
                '5-month program: SQL + Python + experimentation + dashboarding, anchored on product-sense case studies and an A/B-testing capstone.',
            price: 6000000,
            thumbnail: IMG.courseDA,
            tags: ['product-analytics', 'sql', 'python', 'experimentation', 'a-b-testing']
        }
    ]

    if (trainer) {
        // Soft-delete legacy course slugs that pre-date the current public
        // site. Without this, the dashboard's course list keeps stale
        // entries forever — and worse, a counsellor could enrol someone
        // into one that has no public landing page. Keep the rows around
        // (deletedAt) for audit + analytics on prior cohorts.
        const LEGACY_SLUGS = ['business-analytics-pro', 'data-analytics-mastery', 'ai-ml-engineer']
        await prisma.course.updateMany({
            where: { tenantId: tenant.id, slug: { in: LEGACY_SLUGS }, deletedAt: null },
            data: { deletedAt: new Date(), publishState: CoursePublishState.ARCHIVED }
        })

        for (const c of courseSeeds) {
            // Upsert so re-runs pick up price/description changes — the seed
            // is the canonical source for these in dev.
            const course = await prisma.course.upsert({
                where: { tenantId_slug: { tenantId: tenant.id, slug: c.slug } },
                update: {
                    title: c.title,
                    description: c.description,
                    thumbnailUrl: c.thumbnail,
                    price: c.price,
                    currency: 'INR',
                    gstPercent: 18,
                    publishState: CoursePublishState.PUBLISHED,
                    tags: c.tags,
                    deletedAt: null
                },
                create: {
                    tenantId: tenant.id,
                    trainerId: trainer.id,
                    title: c.title,
                    slug: c.slug,
                    description: c.description,
                    thumbnailUrl: c.thumbnail,
                    price: c.price,
                    currency: 'INR',
                    gstPercent: 18,
                    publishState: CoursePublishState.PUBLISHED,
                    tags: c.tags
                }
            })

            // Skip section/lesson scaffolding when the course already has
            // any content — we don't want to keep stacking "Welcome &
            // orientation" sections on every reseed.
            const sectionCount = await prisma.courseSection.count({ where: { courseId: course.id } })
            if (sectionCount === 0) {
                const section = await prisma.courseSection.create({
                    data: { courseId: course.id, title: 'Welcome & orientation', order: 0 }
                })
                await prisma.lesson.create({
                    data: {
                        sectionId: section.id,
                        title: `Intro to ${c.title}`,
                        type: LessonType.YOUTUBE,
                        youtubeId: 'dQw4w9WgXcQ',
                        durationSec: 480,
                        order: 0
                    }
                })
            }
        }
    }

    // 4. CMS collections — testimonials, blog, faqs, programs + 5 resource
    // categories (tutorials, soft-skills, case-studies, interview-guides,
    // cheatsheets). The public site fetches each collection by slug, so
    // collection slugs MUST match the routes in Albero_Frontend (e.g.
    // /resources/tutorials → collection slug "tutorials"). When the
    // marketing team wants to add/remove items they go to the LMS dashboard
    // → Programs / Resources, never to a static constants file.
    interface FieldDef {
        key: string
        label: string
        type: string
        required?: boolean
        options?: string[]
    }

    const collections: {
        slug: string
        name: string
        description: string
        fields: FieldDef[]
        items: { slug: string; data: Record<string, unknown>; published: boolean }[]
    }[] = [
        {
            slug: 'blog',
            name: 'Blog posts',
            description: 'Long-form writing — cohort breakdowns, project deep-dives, career switch stories.',
            fields: [
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'summary', label: 'Summary', type: 'longtext' },
                { key: 'coverImage', label: 'Cover image URL', type: 'image' },
                { key: 'body', label: 'Body', type: 'richtext' },
                { key: 'author', label: 'Author', type: 'text' }
            ],
            items: [
                {
                    slug: 'sql-window-functions-cheat-sheet',
                    data: {
                        title: "SQL window functions: a working analyst's cheat sheet",
                        summary:
                            'The 7 window-function patterns that show up in 90% of real interview questions — with the SQL queries you can copy-paste into your own work.',
                        coverImage: IMG.blogChart,
                        body: '<p>Window functions are the single biggest leverage you can buy as an analyst...</p>',
                        author: 'Vikram Iyer'
                    },
                    published: true
                },
                {
                    slug: 'cohort-12-recap',
                    data: {
                        title: 'Cohort 12 recap: 47 students, 41 placements, 6 stories',
                        summary: 'A breakdown of where Cohort 12 graduates landed, what worked, and the three things we are changing for Cohort 13.',
                        coverImage: IMG.blogTeam,
                        body: '<p>Cohort 12 wrapped at the end of Q1 2025...</p>',
                        author: 'Aditi Kapoor'
                    },
                    published: true
                },
                {
                    slug: 'how-to-pick-data-vs-ai-track',
                    data: {
                        title: 'Data Analytics vs AI/ML: how to pick the right Albero track',
                        summary:
                            'A decision framework for early-career engineers torn between the Data Analytics Mastery and AI/ML Engineer programs.',
                        coverImage: IMG.blogStudying,
                        body: '<p>The most common counselling question we get...</p>',
                        author: 'Karan Bhatia'
                    },
                    published: true
                }
            ]
        },
        {
            slug: 'faqs',
            name: 'FAQs',
            description: 'Frequently asked questions about programs, fees, EMI, scholarships, and placement.',
            fields: [
                { key: 'question', label: 'Question', type: 'text', required: true },
                { key: 'answer', label: 'Answer', type: 'longtext', required: true },
                { key: 'category', label: 'Category', type: 'select', options: ['Programs', 'Fees & EMI', 'Placement', 'Logistics'] }
            ],
            items: [
                {
                    slug: 'is-this-program-for-beginners',
                    data: {
                        question: 'Is the program suitable for absolute beginners?',
                        answer: 'Business Analytics Pro is designed for fresh graduates with no prior coding experience — we begin from SQL/Excel foundations. Data Analytics Mastery and AI/ML Engineer assume programming familiarity.',
                        category: 'Programs'
                    },
                    published: true
                },
                {
                    slug: 'how-does-emi-work',
                    data: {
                        question: 'How does the no-cost EMI work?',
                        answer: 'We have partnered with major Indian banks for no-cost EMIs up to 12 months. The total fee remains unchanged — interest is absorbed by Albero. Apply at counselling time.',
                        category: 'Fees & EMI'
                    },
                    published: true
                },
                {
                    slug: 'placement-guarantee-fine-print',
                    data: {
                        question: 'What does the placement guarantee actually cover?',
                        answer: 'If you complete the program (>80% attendance, all capstone milestones), and do not get placed within 6 months of graduation despite engaging with our placement team, we refund 100% of your fee. No fine print.',
                        category: 'Placement'
                    },
                    published: true
                },
                {
                    slug: 'class-timings',
                    data: {
                        question: 'What are the class timings?',
                        answer: 'Classes run live, twice a week, 8-10 PM IST. All sessions are recorded and available within 24 hours, so missing a class never sets you back.',
                        category: 'Logistics'
                    },
                    published: true
                },
                {
                    slug: 'scholarships',
                    data: {
                        question: 'Are scholarships available?',
                        answer: 'We offer need-based scholarships up to 30% off, plus an Early-Bird scholarship for the first 10 enrolments per cohort. Apply during counselling.',
                        category: 'Fees & EMI'
                    },
                    published: true
                }
            ]
        },
        {
            slug: 'testimonials',
            name: 'Testimonials',
            description: 'Student stories — surfaced via collection-list blocks for non-card layouts.',
            fields: [
                { key: 'name', label: 'Student name', type: 'text', required: true },
                { key: 'quote', label: 'Quote', type: 'longtext', required: true },
                { key: 'role', label: 'Role after Albero', type: 'text' },
                { key: 'company', label: 'Company', type: 'text' },
                { key: 'avatar', label: 'Avatar', type: 'image' }
            ],
            items: [
                {
                    slug: 'priya-sharma',
                    data: {
                        name: 'Priya Sharma',
                        quote: 'I went from no SQL to landing a Data Analyst role at a unicorn within 5 months. The mentor-led format is what made it stick.',
                        role: 'Data Analyst',
                        company: 'Razorpay',
                        avatar: IMG.avatar1
                    },
                    published: true
                },
                {
                    slug: 'rahul-verma',
                    data: {
                        name: 'Rahul Verma',
                        quote: 'Albero forced me to apply concepts on real industry-graded projects. I had a portfolio recruiters actually wanted to see.',
                        role: 'Business Analyst',
                        company: 'Flipkart',
                        avatar: IMG.avatar2
                    },
                    published: true
                }
            ]
        },
        // ── Programs ─────────────────────────────────────────────────────────
        // One row per public-site program landing page (/programs/:slug).
        // Slug MUST match the Course.slug seeded above and the Albero_Frontend
        // programs.ts entry, otherwise the Enroll Now flow can't resolve the
        // course or the public site will 404.
        {
            slug: 'programs',
            name: 'Programs',
            description: 'Public-site program landing pages. Editing a row here updates the marketing copy on /programs/:slug — pricing still comes from the Course row.',
            fields: [
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'subtitle', label: 'Subtitle', type: 'text' },
                { key: 'badge', label: 'Badge (e.g. "Career Track", "Most Popular")', type: 'text' },
                { key: 'description', label: 'Description', type: 'longtext' },
                { key: 'duration', label: 'Duration (e.g. "6 Months")', type: 'text' },
                { key: 'mode', label: 'Mode (e.g. "Live + Recorded")', type: 'text' },
                { key: 'level', label: 'Level (e.g. "Beginner Friendly")', type: 'text' },
                { key: 'enrollDate', label: 'Next batch start', type: 'text' },
                { key: 'thumbnail', label: 'Thumbnail image URL', type: 'image' },
                { key: 'displayOrder', label: 'Display order on /programs', type: 'number' },
                { key: 'featured', label: 'Featured', type: 'boolean' }
            ],
            items: [
                {
                    slug: 'business-analytics',
                    data: {
                        title: 'Business Analytics',
                        subtitle: 'Turn business problems into data-driven decisions',
                        badge: 'Career Track',
                        description:
                            '6-month structured program covering Excel, SQL, Power BI, Tableau, Python and storytelling — designed to make you industry-ready for analytics, consulting, and BI roles.',
                        duration: '6 Months',
                        mode: 'Live + Recorded',
                        level: 'Beginner to Pro',
                        enrollDate: 'Next batch: 12 May 2026',
                        thumbnail: IMG.courseBA,
                        displayOrder: 1,
                        featured: true
                    },
                    published: true
                },
                {
                    slug: 'data-analytics',
                    data: {
                        title: 'Data Analytics',
                        subtitle: 'From beginner to job-ready data analyst',
                        badge: 'Most Popular',
                        description:
                            '5-month hands-on program covering SQL, Python, statistics, Power BI and Tableau — with portfolio-grade projects and a placement-focused career sprint.',
                        duration: '5 Months',
                        mode: 'Live + Recorded',
                        level: 'Beginner Friendly',
                        enrollDate: 'Next batch: 19 May 2026',
                        thumbnail: IMG.courseDA,
                        displayOrder: 2,
                        featured: true
                    },
                    published: true
                },
                {
                    slug: 'data-science-ai',
                    data: {
                        title: 'Data Science with ML & GenAI',
                        subtitle: 'Build the AI products of tomorrow',
                        badge: 'Flagship',
                        description:
                            '9-month flagship program: Python, ML, deep learning, NLP & GenAI, MLOps. For engineers building production AI systems and ML products.',
                        duration: '9 Months',
                        mode: 'Live + Recorded',
                        level: 'Intermediate',
                        enrollDate: 'Next batch: 26 May 2026',
                        thumbnail: IMG.courseAI,
                        displayOrder: 3,
                        featured: true
                    },
                    published: true
                },
                {
                    slug: 'full-stack',
                    data: {
                        title: 'Full Stack Development',
                        subtitle: 'Ship products. End to end. With confidence.',
                        badge: 'Career Track',
                        description:
                            '7-month MERN-stack program: React, Node, Express, MongoDB, Postgres, Docker, AWS — with DSA, system design, and mock interviews built in.',
                        duration: '7 Months',
                        mode: 'Live + Recorded',
                        level: 'Beginner to Pro',
                        enrollDate: 'Next batch: 02 June 2026',
                        thumbnail: IMG.courseBA,
                        displayOrder: 4,
                        featured: false
                    },
                    published: true
                },
                {
                    slug: 'data-engineering',
                    data: {
                        title: 'Data Engineering',
                        subtitle: 'Build the pipelines that power AI',
                        badge: 'Career Track',
                        description:
                            '8-month program covering SQL modelling, Spark, Airflow, dbt + Snowflake, and cloud data platforms — for engineers building the pipelines that power AI.',
                        duration: '8 Months',
                        mode: 'Live + Recorded',
                        level: 'Intermediate',
                        enrollDate: 'Next batch: 09 June 2026',
                        thumbnail: IMG.courseDA,
                        displayOrder: 5,
                        featured: false
                    },
                    published: true
                },
                {
                    slug: 'cybersecurity',
                    data: {
                        title: 'Cybersecurity',
                        subtitle: 'Defend the systems that hold the data',
                        badge: 'Career Track',
                        description:
                            '6-month security-engineering track: network security, OWASP, threat modelling, blue/red-team labs, and CTF-style capstones.',
                        duration: '6 Months',
                        mode: 'Live + Recorded',
                        level: 'Intermediate',
                        enrollDate: 'Next batch: 16 June 2026',
                        thumbnail: IMG.courseAI,
                        displayOrder: 6,
                        featured: false
                    },
                    published: true
                },
                {
                    slug: 'investment-banking',
                    data: {
                        title: 'Investment Banking',
                        subtitle: 'Financial modelling, valuations & deals',
                        badge: 'Career Track',
                        description:
                            '6-month finance program: financial modelling, DCF & comparables valuation, M&A, LBO, pitchbook builds, and IB mock interviews.',
                        duration: '6 Months',
                        mode: 'Live + Recorded',
                        level: 'Beginner to Pro',
                        enrollDate: 'Next batch: 23 June 2026',
                        thumbnail: IMG.courseBA,
                        displayOrder: 7,
                        featured: false
                    },
                    published: true
                },
                {
                    slug: 'product-analytics',
                    data: {
                        title: 'Product Analytics',
                        subtitle: 'Drive product with data',
                        badge: 'Career Track',
                        description:
                            '5-month program covering SQL, Python, experimentation, dashboarding — anchored on product-sense case studies and an A/B-testing capstone.',
                        duration: '5 Months',
                        mode: 'Live + Recorded',
                        level: 'Beginner Friendly',
                        enrollDate: 'Next batch: 30 June 2026',
                        thumbnail: IMG.courseDA,
                        displayOrder: 8,
                        featured: false
                    },
                    published: true
                }
            ]
        },
        // ── Tutorials ────────────────────────────────────────────────────────
        // Step-by-step coding walkthroughs grouped by `topic`. The public
        // /resources/tutorials page lists topics; clicking one drills into
        // /resources/tutorials/:topic/:chapter for each item with that topic.
        {
            slug: 'tutorials',
            name: 'Tutorials',
            description: 'Step-by-step coding walkthroughs surfaced at /resources/tutorials. Group multiple items under the same topic to build a chapter sequence.',
            fields: [
                { key: 'title', label: 'Chapter title', type: 'text', required: true },
                { key: 'topic', label: 'Topic / track', type: 'text', required: true },
                { key: 'chapter', label: 'Chapter number', type: 'number' },
                { key: 'description', label: 'Short description', type: 'longtext' },
                { key: 'readMin', label: 'Read time (minutes)', type: 'number' },
                { key: 'coverImage', label: 'Cover image URL', type: 'image' },
                { key: 'body', label: 'Body (HTML / markdown)', type: 'richtext' },
                { key: 'code', label: 'Code samples (longtext)', type: 'longtext' }
            ],
            items: [
                {
                    slug: 'sql-joins-101',
                    data: {
                        title: 'SQL Joins 101: Inner, Left, Right, Full',
                        topic: 'SQL',
                        chapter: 1,
                        description: 'A practical walkthrough of every join type with a single shared dataset so you can see exactly what each one returns.',
                        readMin: 8,
                        coverImage: IMG.blogChart,
                        body: '<p>Joins are how SQL stitches rows from multiple tables together...</p>',
                        code: '-- Inner join\nSELECT u.name, o.amount\nFROM users u\nJOIN orders o ON o.user_id = u.id;'
                    },
                    published: true
                },
                {
                    slug: 'python-pandas-quickstart',
                    data: {
                        title: 'Pandas in 20 minutes',
                        topic: 'Python',
                        chapter: 1,
                        description: 'The 10 Pandas verbs that handle 90% of analyst work — read, filter, group, aggregate, pivot, merge, sort, dropna, apply, to_csv.',
                        readMin: 20,
                        coverImage: IMG.blogStudying,
                        body: '<p>Pandas is the data-frame library that makes Python a serious analyst tool...</p>',
                        code: 'import pandas as pd\ndf = pd.read_csv("orders.csv")\ndf.groupby("region").amount.sum()'
                    },
                    published: true
                }
            ]
        },
        // ── Soft skills ──────────────────────────────────────────────────────
        {
            slug: 'soft-skills',
            name: 'Soft Skills Training',
            description: 'Communication, leadership, and interview-polish sessions. Surfaced at /resources/soft-skills.',
            fields: [
                { key: 'title', label: 'Session title', type: 'text', required: true },
                { key: 'tagline', label: 'Tagline', type: 'text' },
                { key: 'duration', label: 'Duration', type: 'text' },
                { key: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
                { key: 'keyOutcomes', label: 'Key outcomes (one per line)', type: 'longtext' },
                { key: 'body', label: 'Body', type: 'richtext' },
                { key: 'coverImage', label: 'Cover image URL', type: 'image' }
            ],
            items: [
                {
                    slug: 'storytelling-with-data',
                    data: {
                        title: 'Storytelling with Data',
                        tagline: 'Turn dashboards into decisions',
                        duration: '90 min',
                        level: 'Intermediate',
                        keyOutcomes: 'Frame the executive question first\nLead with the answer, defend with the chart\nKill the chart-junk reflex',
                        body: '<p>Most dashboards die because they answer a question nobody asked...</p>',
                        coverImage: IMG.blogTeam
                    },
                    published: true
                },
                {
                    slug: 'cracking-the-behavioural-round',
                    data: {
                        title: 'Cracking the Behavioural Round',
                        tagline: 'STAR stories that actually land',
                        duration: '60 min',
                        level: 'Beginner',
                        keyOutcomes: 'Build a 6-story bank that covers every prompt\nAnswer with structure, not autobiography\nHandle "weakness" without flinching',
                        body: '<p>Behavioural interviews are won in story selection, not delivery...</p>',
                        coverImage: IMG.blogStudying
                    },
                    published: true
                }
            ]
        },
        // ── Case studies ─────────────────────────────────────────────────────
        {
            slug: 'case-studies',
            name: 'Case Studies',
            description: 'Real-world business problems, broken down end-to-end. Surfaced at /resources/case-studies.',
            fields: [
                { key: 'brand', label: 'Brand', type: 'text', required: true },
                { key: 'title', label: 'Case title', type: 'text', required: true },
                { key: 'sector', label: 'Sector', type: 'text' },
                { key: 'founded', label: 'Brand founded', type: 'text' },
                { key: 'keyFacts', label: 'Key facts (one per line)', type: 'longtext' },
                { key: 'body', label: 'Body', type: 'richtext' },
                { key: 'coverImage', label: 'Cover image URL', type: 'image' }
            ],
            items: [
                {
                    slug: 'flipkart-big-billion-days',
                    data: {
                        brand: 'Flipkart',
                        title: 'Big Billion Days: surviving 10× peak load on a marketplace',
                        sector: 'E-commerce',
                        founded: '2007',
                        keyFacts: 'Peak: 10× normal traffic\nCart abandonment dropped 18%\nCheckout latency held under 800ms',
                        body: '<p>Big Billion Days is the cliff Flipkart bets a quarter on...</p>',
                        coverImage: IMG.blogChart
                    },
                    published: true
                },
                {
                    slug: 'razorpay-fraud-models',
                    data: {
                        brand: 'Razorpay',
                        title: 'Building real-time fraud models for Indian payments',
                        sector: 'Fintech',
                        founded: '2014',
                        keyFacts: 'Fraud rate cut by 42% in 6 months\nModel inference under 50ms p99\nFalse-positive rate dropped 28%',
                        body: '<p>UPI fraud at Indian scale is a different game from card fraud...</p>',
                        coverImage: IMG.blogTeam
                    },
                    published: true
                }
            ]
        },
        // ── Interview guides ─────────────────────────────────────────────────
        {
            slug: 'interview-guides',
            name: 'Interview Guides',
            description: 'Company-specific prep for MAANG, IB & product roles. Surfaced at /resources/interview-guides.',
            fields: [
                { key: 'title', label: 'Guide title', type: 'text', required: true },
                { key: 'description', label: 'Short description', type: 'longtext' },
                { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'] },
                { key: 'targetCompanies', label: 'Target companies (comma-separated)', type: 'text' },
                { key: 'sections', label: 'Sections (markdown / longtext)', type: 'longtext' },
                { key: 'body', label: 'Body', type: 'richtext' },
                { key: 'coverImage', label: 'Cover image URL', type: 'image' }
            ],
            items: [
                {
                    slug: 'sql-50',
                    data: {
                        title: 'SQL 50: the questions every analyst should know',
                        description: 'A curated set of 50 SQL interview questions covering joins, window functions, performance, and pitfalls — with annotated solutions.',
                        difficulty: 'Medium',
                        targetCompanies: 'Razorpay, Flipkart, Swiggy, Zomato, Paytm',
                        sections: '## Joins (1–10)\n## Window functions (11–25)\n## CTEs & recursion (26–35)\n## Performance (36–45)\n## Curveballs (46–50)',
                        body: '<p>If you can answer these 50 cold, you can answer any analyst SQL round...</p>',
                        coverImage: IMG.blogChart
                    },
                    published: true
                },
                {
                    slug: 'pm-product-sense',
                    data: {
                        title: 'PM Product-Sense: 30 prompts with rubrics',
                        description: 'Thirty real product-sense prompts ("Design X for Y") with the four-section answer structure top PM coaches use.',
                        difficulty: 'Hard',
                        targetCompanies: 'Google, Meta, Amazon, Flipkart, Swiggy',
                        sections: '## User & user pain\n## Goals & success metric\n## Solutions ranked\n## Tradeoffs + roadmap',
                        body: '<p>Product-sense is judged on structure, not creativity...</p>',
                        coverImage: IMG.blogStudying
                    },
                    published: true
                }
            ]
        },
        // ── Cheatsheets ──────────────────────────────────────────────────────
        {
            slug: 'cheatsheets',
            name: 'Cheatsheets',
            description: 'Quick one-pagers for revising key concepts. Surfaced at /resources/cheatsheet.',
            fields: [
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'description', label: 'Short description', type: 'longtext' },
                { key: 'category', label: 'Category', type: 'select', options: ['SQL', 'Python', 'Statistics', 'Excel', 'Power BI', 'Pandas', 'Git'] },
                { key: 'body', label: 'Body', type: 'richtext' },
                { key: 'code', label: 'Code samples / snippets', type: 'longtext' },
                { key: 'coverImage', label: 'Cover image URL', type: 'image' }
            ],
            items: [
                {
                    slug: 'sql-window-functions',
                    data: {
                        title: 'SQL Window Functions cheat sheet',
                        description: 'ROW_NUMBER, RANK, LAG/LEAD, running totals, partitioned aggregates — every pattern on one page.',
                        category: 'SQL',
                        body: '<p>Window functions partition the result set, then run an aggregate...</p>',
                        code: 'SELECT name, dept,\n  ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk\nFROM employees;',
                        coverImage: IMG.blogChart
                    },
                    published: true
                },
                {
                    slug: 'pandas-by-verb',
                    data: {
                        title: 'Pandas by verb',
                        description: 'Filter, group, agg, pivot, merge, melt — every Pandas verb with a one-line example.',
                        category: 'Pandas',
                        body: '<p>The fastest way to learn Pandas: think in verbs, not classes.</p>',
                        code: 'df.query("region == \'south\'")\ndf.groupby("region").amount.sum()\ndf.pivot_table(index="region", values="amount", aggfunc="sum")',
                        coverImage: IMG.blogStudying
                    },
                    published: true
                }
            ]
        }
    ]

    for (const col of collections) {
        const collection = await prisma.collection.upsert({
            where: { tenantId_slug: { tenantId: tenant.id, slug: col.slug } },
            update: {
                name: col.name,
                description: col.description,
                fields: col.fields as object
            },
            create: {
                tenantId: tenant.id,
                name: col.name,
                slug: col.slug,
                description: col.description,
                fields: col.fields as object
            }
        })
        for (const it of col.items) {
            await prisma.collectionItem.upsert({
                where: { collectionId_slug: { collectionId: collection.id, slug: it.slug } },
                update: {
                    data: it.data as object,
                    published: it.published,
                    publishedAt: it.published ? new Date() : null
                },
                create: {
                    tenantId: tenant.id,
                    collectionId: collection.id,
                    slug: it.slug,
                    data: it.data as object,
                    published: it.published,
                    publishedAt: it.published ? new Date() : null
                }
            })
        }
    }

    // Eslint quiet for unused helpers when extending later.
    void id
    void ACCENT_GRADIENT

    // Diagnostic — read back the persisted landing JSON so re-runs surface
    // exactly what is now in the DB (page slugs + navbar variant). If this
    // log says "10 pages" you are looking at an old build; the latest seed
    // produces 21 pages (11 home/courses/etc + 5 policies + 5 resources +
    // cheat-sheet) and a "split-centered" navbar.
    const persisted = await prisma.tenant.findUnique({
        where: { slug: tenant.slug },
        select: { settings: true }
    })
    const land = (persisted?.settings as { landing?: { pages?: { slug: string }[]; navbar?: { variant: string } } } | null)?.landing
    const pageSlugs = land?.pages?.map((p) => p.slug) ?? []
    console.log(`Albero Academy seed complete (slug: ${tenant.slug})`)
    console.log(`  Pages persisted (${pageSlugs.length}): ${pageSlugs.join(', ')}`)
    console.log(`  Navbar variant: ${land?.navbar?.variant ?? '(none)'}`)
}
