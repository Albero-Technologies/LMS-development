// Albero Academy tenant seed — provisions the full institute end-to-end:
// branding + admin/counsellor users + 3 published flagship courses + multi-page
// landing site + CMS collections + per-tenant SEO + analytics integrations.
//
// Idempotent. Re-running does not duplicate; existing rows are upserted by
// stable keys (tenant slug, user email, course slug, collection slug, etc.).

import { AuthProvider, CoursePublishState, LessonType, PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

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
        id: 'sc-dark',
        name: 'Section · Dark',
        background: '#0c1626',
        textColor: '#ffffff',
        paddingY: 'lg' as const
    }
]

// ---- Page section builders ---------------------------------------------------

const homeSections = (): unknown[] => [
    {
        id: sid('home-hero'),
        type: 'hero',
        variant: 'split',
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
        id: sid('home-logos'),
        type: 'logos',
        variant: 'scroll',
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
        id: sid('home-courses'),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'Three flagship programs · one outcome',
            pillars: [
                {
                    title: 'Business Analytics Pro',
                    description: '14-week live cohort. SQL, Excel, Power BI, Tableau, A/B testing. Built for fresh grads + early-career switchers.'
                },
                {
                    title: 'Data Analytics Mastery',
                    description: '20-week deep dive. Python, statistics, ML basics, cloud warehousing. Geared toward analyst → data scientist transitions.'
                },
                {
                    title: 'AI/ML Engineer',
                    description: '24-week intensive. Neural nets, transformers, MLOps, model deployment. For engineers ready to build production AI systems.'
                }
            ]
        }
    },
    {
        id: sid('home-stats'),
        type: 'stats',
        variant: 'banner',
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
        id: sid('home-features'),
        type: 'features',
        variant: 'four-up',
        data: {
            title: 'Why students pick Albero',
            pillars: [
                { title: 'Live mentorship', description: 'Mentors are working professionals from product companies, not career educators.' },
                { title: 'Hands-on labs', description: 'You ship 5+ portfolio projects per program — not toy assignments.' },
                { title: '1:1 placement', description: 'Resume reviews, mock interviews, and warm referrals to 40+ partner companies.' },
                { title: 'EMI + scholarships', description: 'No-cost EMI on every major bank. Need-based scholarships up to 30% off.' }
            ]
        }
    },
    {
        id: sid('home-testimonials'),
        type: 'testimonials',
        variant: 'cards',
        data: {
            title: 'Stories from our cohort',
            subtitle: 'Real outcomes from past Albero graduates.',
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

const blogSections = (): unknown[] => [
    {
        id: sid('blog-hero'),
        type: 'hero',
        variant: 'centered',
        data: {
            eyebrow: 'Writing',
            title: 'Notes from the cohort',
            subtitle: 'Lessons, project breakdowns, and student stories — the long-form stuff our team wishes they had read first.'
        }
    },
    {
        id: sid('blog-list'),
        type: 'collectionList',
        variant: 'cards',
        data: {
            collectionSlug: 'blog',
            title: 'Latest posts',
            titleField: 'title',
            summaryField: 'summary',
            imageField: 'coverImage',
            limit: 12
        }
    }
]

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
        variant: 'list',
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
                    { title: 'A/B + Experimentation', description: 'Hypothesis design, sample sizing, multiple comparisons. The math behind every product decision.' },
                    { title: 'Stakeholder craft', description: 'Storyboarding insights, defending recommendations, and influencing without authority.' }
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
                    { title: 'Python for data', description: 'Pandas, NumPy, scikit-learn. Idiomatic Python from day one — not "Python with R syntax".' },
                    { title: 'Statistics that ships', description: 'Bayesian thinking, regression, time-series, and causal inference. The bits that actually show up in real work.' },
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
                    { title: 'Deep learning', description: 'PyTorch from scratch, attention, transformers, and the mental model that makes them click.' },
                    { title: 'LLMs in production', description: 'RAG pipelines, evals, fine-tuning, prompt engineering, and cost optimisation.' },
                    { title: 'MLOps', description: 'Feature stores, experiment tracking, model registries, and CI/CD for ML.' },
                    { title: 'Deployment', description: 'Serving at scale — vLLM, Triton, autoscaling, and observability.' }
                ],
                syllabus: [
                    { title: 'Weeks 1-5 · Deep learning foundations', description: 'PyTorch, backprop, optimisation, regularisation, training loops.' },
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
        {
            id: pageId('blog'),
            slug: '/blog',
            name: 'Blog',
            sections: blogSections(),
            seo: {
                title: 'Albero Blog · Career stories + analytics craft',
                description: 'Long-form writing from the Albero team — cohort breakdowns, project deep-dives, and career switch stories.'
            }
        },
        {
            id: pageId('faq'),
            slug: '/faq',
            name: 'FAQ',
            sections: faqSections(),
            seo: {
                title: 'FAQ · Albero Academy',
                description: 'Common questions about programs, fees, EMI, scholarships, and the Albero placement guarantee.'
            }
        }
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
            variant: 'with-cta',
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
                { id: linkId('nav-about'), label: 'About', pageId: pageId('about') },
                { id: linkId('nav-blog'), label: 'Blog', pageId: pageId('blog') },
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
                        { id: linkId('foot-blog'), label: 'Blog', pageId: pageId('blog') },
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
                }
            ]
        },
        styleClasses: STYLE_CLASSES
    }
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

    // 1. Tenant
    const settings = {
        landing: buildLandingJson(),
        seo: buildSeo(),
        contacts: {
            primaryEmail: 'hello@albero.academy',
            primaryPhone: '+91-99999-99999',
            secondaryEmail: 'admissions@albero.academy'
        },
        features: {
            coleadPipeline: true,
            demoControl: true,
            notifications: true,
            tickets: true,
            googleSheetsSync: false,
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

    // 3. Three flagship courses, each published with a sample lesson
    const courseSeeds: { slug: string; title: string; description: string; price: number; thumbnail: string; tags: string[] }[] = [
        {
            slug: 'business-analytics-pro',
            title: 'Business Analytics Pro',
            description:
                '14-week live cohort: SQL, Power BI, Tableau, A/B testing, and stakeholder communication. Built for fresh grads + early-career switchers.',
            price: 4999900,
            thumbnail: IMG.courseBA,
            tags: ['analytics', 'sql', 'power-bi', 'tableau']
        },
        {
            slug: 'data-analytics-mastery',
            title: 'Data Analytics Mastery',
            description:
                '20-week deep dive: Python, statistics, ML basics, cloud warehousing. Geared toward analyst → data scientist transitions.',
            price: 7499900,
            thumbnail: IMG.courseDA,
            tags: ['data-science', 'python', 'machine-learning', 'snowflake']
        },
        {
            slug: 'ai-ml-engineer',
            title: 'AI/ML Engineer',
            description:
                '24-week intensive: Neural nets, transformers, MLOps, model deployment. For engineers building production AI systems.',
            price: 9999900,
            thumbnail: IMG.courseAI,
            tags: ['ai', 'ml', 'pytorch', 'llm', 'mlops']
        }
    ]

    if (trainer) {
        for (const c of courseSeeds) {
            const existing = await prisma.course.findUnique({
                where: { tenantId_slug: { tenantId: tenant.id, slug: c.slug } }
            })
            if (existing) continue

            const course = await prisma.course.create({
                data: {
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

    // 4. CMS collections — testimonials, blog, faqs
    interface FieldDef {
        key: string
        label: string
        type: string
        required?: boolean
        options?: string[]
    }

    const collections: { slug: string; name: string; description: string; fields: FieldDef[]; items: { slug: string; data: Record<string, unknown>; published: boolean }[] }[] = [
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
                        title: 'SQL window functions: a working analyst\'s cheat sheet',
                        summary:
                            'The 7 window-function patterns that show up in 90% of real interview questions — with the SQL queries you can copy-paste into your own work.',
                        coverImage: IMG.blogChart,
                        body:
                            '<p>Window functions are the single biggest leverage you can buy as an analyst...</p>',
                        author: 'Vikram Iyer'
                    },
                    published: true
                },
                {
                    slug: 'cohort-12-recap',
                    data: {
                        title: 'Cohort 12 recap: 47 students, 41 placements, 6 stories',
                        summary:
                            'A breakdown of where Cohort 12 graduates landed, what worked, and the three things we are changing for Cohort 13.',
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
                        answer:
                            'Business Analytics Pro is designed for fresh graduates with no prior coding experience — we begin from SQL/Excel foundations. Data Analytics Mastery and AI/ML Engineer assume programming familiarity.',
                        category: 'Programs'
                    },
                    published: true
                },
                {
                    slug: 'how-does-emi-work',
                    data: {
                        question: 'How does the no-cost EMI work?',
                        answer:
                            'We have partnered with major Indian banks for no-cost EMIs up to 12 months. The total fee remains unchanged — interest is absorbed by Albero. Apply at counselling time.',
                        category: 'Fees & EMI'
                    },
                    published: true
                },
                {
                    slug: 'placement-guarantee-fine-print',
                    data: {
                        question: 'What does the placement guarantee actually cover?',
                        answer:
                            'If you complete the program (>80% attendance, all capstone milestones), and do not get placed within 6 months of graduation despite engaging with our placement team, we refund 100% of your fee. No fine print.',
                        category: 'Placement'
                    },
                    published: true
                },
                {
                    slug: 'class-timings',
                    data: {
                        question: 'What are the class timings?',
                        answer:
                            'Classes run live, twice a week, 8-10 PM IST. All sessions are recorded and available within 24 hours, so missing a class never sets you back.',
                        category: 'Logistics'
                    },
                    published: true
                },
                {
                    slug: 'scholarships',
                    data: {
                        question: 'Are scholarships available?',
                        answer:
                            'We offer need-based scholarships up to 30% off, plus an Early-Bird scholarship for the first 10 enrolments per cohort. Apply during counselling.',
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
                        quote:
                            'I went from no SQL to landing a Data Analyst role at a unicorn within 5 months. The mentor-led format is what made it stick.',
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
                        quote:
                            'Albero forced me to apply concepts on real industry-graded projects. I had a portfolio recruiters actually wanted to see.',
                        role: 'Business Analyst',
                        company: 'Flipkart',
                        avatar: IMG.avatar2
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

    console.log(`Albero Academy seed complete (slug: ${tenant.slug})`)
}
