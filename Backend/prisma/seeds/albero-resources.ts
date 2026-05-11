// Resource pages for Albero Academy — modeled on Meritshot's free-resources
// hub. Each page is composed from existing landing-section primitives (hero,
// features, stats, prose, cta, callout) so it stays editable in the Website
// Editor without bespoke code per layout.
//
// Content fetched from meritshot.com (blog / tutorials / soft-skills /
// interview-guides / case-studies). CheatSheet is composed from a curated set
// of high-frequency one-pagers for the same topics.

interface LandingSectionShape {
    id: string
    type: string
    variant: string
    // Optional style overrides — frontend SectionStyle. We type loosely here
    // because the seed file doesn't import the Frontend type; the renderer
    // only reads what it understands.
    style?: { styleClassId?: string; animation?: string; animationDuration?: number; animationDelay?: number }
    data: Record<string, unknown>
}

interface ResourcePage {
    id: string
    slug: string
    name: string
    title: string
    seoDescription: string
    sections: LandingSectionShape[]
}

const sid = (page: string, n: number): string => `albero-${page}-sec-${n}`

// Image assets reused across resource hero sections — leans on the existing
// IMG palette in albero-academy.ts via Unsplash URLs.
const IMG_BLOG = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&h=900&fit=crop'
const IMG_TUTORIAL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=900&fit=crop'
const IMG_SOFT = 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1600&h=900&fit=crop'
const IMG_INTERVIEW = 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=1600&h=900&fit=crop'
const IMG_BRAND = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&h=900&fit=crop'
const IMG_CHEAT = 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1600&h=900&fit=crop'

// ---- Blog ------------------------------------------------------------------

const BLOG_POSTS = [
    {
        title: 'Data Warehousing 101: Star Schema vs Snowflake Schema',
        category: 'Data Engineering',
        date: '5 May 2025',
        readTime: '11 min read',
        description:
            'Understand the fundamentals of data warehouse design — comparing star schema and snowflake schema with practical examples, use cases, and guidance on choosing the right approach.'
    },
    {
        title: 'Apache Kafka: Building Real-Time Data Streaming Pipelines',
        category: 'Data Engineering',
        date: '1 May 2025',
        readTime: '9 min read',
        description:
            'A beginner-friendly guide to Apache Kafka — core concepts like topics, partitions, producers, consumers, and how to build your first real-time streaming pipeline.'
    },
    {
        title: 'Blockchain and DeFi: What Every Finance Professional Should Know',
        category: 'Finance & Investment Banking',
        date: '25 Apr 2025',
        readTime: '8 min read',
        description:
            'A practical introduction to blockchain technology and decentralized finance — smart contracts, DeFi protocols, real-world use cases, and what it means for traditional finance.'
    },
    {
        title: "Mutual Funds in India: A Complete Beginner's Guide for 2025",
        category: 'Finance & Investment Banking',
        date: '20 Apr 2025',
        readTime: '10 min read',
        description:
            'Everything you need to know about investing in mutual funds in India — types, SIP vs lump sum, tax implications, how to choose funds, and common beginner mistakes.'
    },
    {
        title: 'SQL for Data Analysis: From Basics to Advanced Queries',
        category: 'Data Science',
        date: '14 Apr 2025',
        readTime: '9 min read',
        description:
            'A hands-on guide to mastering SQL for data analysis — SELECT, JOINs, aggregations, window functions, CTEs, and real-world query patterns used by data analysts.'
    },
    {
        title: 'Data Visualization: The Art of Telling Stories with Charts',
        category: 'Data Science',
        date: '8 Apr 2025',
        readTime: '7 min read',
        description:
            'Master the principles of effective data visualization — which chart types to use, common mistakes to avoid, and how to turn raw data into compelling visual narratives.'
    },
    {
        title: 'Computer Vision in 2025: Real-World Applications Transforming Industries',
        category: 'AI',
        date: '2 Apr 2025',
        readTime: '8 min read',
        description:
            'How computer vision is being used in manufacturing, healthcare, agriculture, retail, and autonomous vehicles — with real case studies and the tech behind them.'
    },
    {
        title: 'Large Language Models Explained: How AI Understands Text',
        category: 'AI',
        date: '28 Mar 2025',
        readTime: '8 min read',
        description:
            'A clear, non-technical explanation of how large language models like GPT and Claude work — transformers, training, fine-tuning, and real-world applications in 2025.'
    }
]

const blogSections = (): LandingSectionShape[] => [
    {
        id: sid('blog', 0),
        type: 'hero',
        variant: 'gradient',
        data: {
            eyebrow: 'Free Resources',
            title: 'Insights, Guides & Career Intelligence',
            subtitle:
                'Practical tutorials and career guides written by industry experts — from investment banking to AI, data engineering to software development.',
            primaryCtaLabel: 'Talk to a counsellor',
            primaryCtaLink: 'enquiry',
            imageUrl: IMG_BLOG,
            imageAlt: 'Albero Academy blog'
        }
    },
    {
        id: sid('blog', 1),
        type: 'stats',
        variant: 'banner',
        data: {
            title: 'A growing library — built for self-paced learners',
            items: [
                { value: '15+', label: 'Articles', sublabel: 'Updated weekly' },
                { value: '5', label: 'Topics', sublabel: 'Practical, in-depth' },
                { value: 'Free', label: 'Always', sublabel: 'No paywall' }
            ]
        }
    },
    {
        id: sid('blog', 2),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'Browse by topic',
            pillars: [
                { title: 'Data Science', description: '3 articles · SQL deep dives, visualization craft, and applied analytics.' },
                { title: 'Data Engineering', description: '3 articles · Warehousing, streaming pipelines, and lakehouse patterns.' },
                { title: 'AI', description: '3 articles · LLMs, computer vision, and the systems powering them.' },
                { title: 'Software Development', description: '2 articles · Backend, frontend, and full-stack production patterns.' },
                { title: 'Finance & IB', description: '4 articles · Banking, blockchain, mutual funds, and investing fundamentals.' }
            ]
        }
    },
    {
        id: sid('blog', 10),
        type: 'blogCards',
        variant: 'featured',
        style: { animation: 'fadeUp' },
        data: {
            eyebrow: 'LATEST',
            title: 'Read the latest',
            subtitle: 'New articles every week — written by industry mentors who hire from these roles.',
            // Featured variant: first item is the hero, next 4 stack beside, rest go in a 3-up grid.
            items: BLOG_POSTS.map((p, i) => {
                const accents = ['brand', 'purple', 'teal', 'orange', 'pink'] as const
                return {
                    title: p.title,
                    description: p.description,
                    category: p.category,
                    date: p.date,
                    readTime: p.readTime,
                    accent: accents[i % accents.length],
                    href: 'blog' // links back to blog index for now — full blog detail pages are a separate route effort
                }
            })
        }
    },
    {
        id: sid('blog', 99),
        type: 'cta',
        variant: 'banner',
        data: {
            title: 'Ready for the structured path?',
            subtitle: 'Free articles get you curious. Our cohort programs get you hired.',
            buttonLabel: 'Explore programs',
            buttonLink: 'enquiry'
        }
    }
]

// ---- Tutorials -------------------------------------------------------------

const TUTORIAL_TOPICS = [
    {
        title: 'Python',
        description: 'Master Python from basics to advanced — data types, loops, functions, OOP, and real-world projects.',
        count: '50+ Lessons'
    },
    { title: 'Power BI', description: 'Build interactive dashboards, DAX formulas, data modelling, and BI reports.', count: '40+ Lessons' },
    {
        title: 'Tableau',
        description: 'Create stunning visualisations, calculated fields, and interactive storytelling dashboards.',
        count: '35+ Lessons'
    },
    { title: 'SQL', description: 'Write efficient queries — joins, subqueries, window functions, and database optimisation.', count: '60+ Lessons' },
    {
        title: 'Excel',
        description: 'Go beyond basics — pivot tables, VLOOKUP, macros, data analysis, and automation techniques.',
        count: '45+ Lessons'
    },
    {
        title: 'Statistics',
        description: 'Probability, hypothesis testing, regression, distributions — the math behind data science.',
        count: '30+ Lessons'
    }
]

const tutorialSections = (): LandingSectionShape[] => [
    {
        id: sid('tut', 0),
        type: 'hero',
        variant: 'gradient',
        data: {
            eyebrow: 'Free Tutorials',
            title: 'Learn by Doing, Grow with Practice',
            subtitle: 'Step-by-step tutorials across Python, Power BI, SQL, and more — built to sharpen your skills from beginner to advanced.',
            primaryCtaLabel: 'Get started free',
            primaryCtaLink: 'enquiry',
            imageUrl: IMG_TUTORIAL,
            imageAlt: 'Albero Academy tutorials'
        }
    },
    {
        id: sid('tut', 1),
        type: 'stats',
        variant: 'banner',
        data: {
            items: [
                { value: '6+', label: 'Topics', sublabel: 'Curated by mentors' },
                { value: '26+', label: 'Chapters', sublabel: 'Hands-on lessons' },
                { value: 'Free', label: 'Always', sublabel: 'No paywall' }
            ]
        }
    },
    {
        id: sid('tut', 2),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'Browse by topic',
            pillars: TUTORIAL_TOPICS.map((t) => ({
                title: t.title,
                description: `${t.description}\n\n${t.count}`
            }))
        }
    },
    {
        id: sid('tut', 3),
        type: 'callout',
        variant: 'info',
        data: {
            title: 'Why hands-on tutorials beat passive videos',
            body: 'Each tutorial is structured around small, practical lessons with real datasets. Type along, break things, fix them — that is how it sticks.'
        }
    },
    {
        id: sid('tut', 4),
        type: 'cta',
        variant: 'card',
        data: {
            title: 'Beyond free tutorials',
            subtitle: 'Our cohort programs add live mentors, project reviews, and placement support.',
            buttonLabel: 'See programs',
            buttonLink: 'enquiry'
        }
    }
]

// ---- Soft Skills -----------------------------------------------------------

const SOFT_MODULES = [
    {
        n: '01',
        title: 'Digital Identity & Career Branding',
        description: 'Lay the foundation of your professional persona for the modern workplace.',
        lessons: [
            'Creating Your Digital Identity',
            'Power of Online Networking',
            'Crafting Your Online Presence',
            'Resume Assessment & Optimization',
            'Interview Tips and Tricks'
        ]
    },
    {
        n: '02',
        title: 'Thinking, Analysis & Problem-Solving',
        description: 'Build critical thinking and decision-making skills to handle complex challenges.',
        lessons: ['Priorities and Decision Making', 'Mastering Web Search', 'Ace Research and Analysis', 'Mastering Problem Solving']
    },
    {
        n: '03',
        title: 'Communication & Presentation Excellence',
        description: 'Strengthen the core skills that drive influence and collaboration at work.',
        lessons: ['Mastering Presentation Skills', 'Effective Communication', 'Writing and Documentation', 'Diplomacy & Body Language']
    },
    {
        n: '04',
        title: 'Workplace Readiness & Productivity',
        description: 'Develop the confidence, organization, and efficiency to thrive in real corporate settings.',
        lessons: ['ChatGPT for Corporate World', 'Project Management Tools', 'Professional Workplace Etiquette & Collaboration']
    }
]

const SOFT_FREE_TUTORIALS = [
    { title: 'How to Manage Time', blurb: 'Manage time better and stay productive.' },
    { title: 'LinkedIn Optimization (2026)', blurb: 'LinkedIn profiles that get noticed.' },
    { title: 'Resume Optimization', blurb: 'Build an ATS-ready resume that gets shortlisted.' },
    { title: 'Body Language', blurb: 'Body language that speaks confidence.' }
]

const softSkillsSections = (): LandingSectionShape[] => [
    {
        id: sid('soft', 0),
        type: 'hero',
        variant: 'gradient',
        data: {
            eyebrow: 'Soft Skills Training',
            title: 'Master the Skills That Set You Apart',
            subtitle:
                'Boost your communication, confidence, and workplace readiness with industry-driven soft skills training designed to help you stand out and succeed.',
            primaryCtaLabel: 'Get started free',
            primaryCtaLink: 'enquiry',
            imageUrl: IMG_SOFT,
            imageAlt: 'Albero Academy soft skills'
        }
    },
    {
        id: sid('soft', 1),
        type: 'features',
        variant: 'four-up',
        data: {
            title: 'Free starter tutorials',
            pillars: SOFT_FREE_TUTORIALS.map((t) => ({ title: t.title, description: t.blurb }))
        }
    },
    ...SOFT_MODULES.map(
        (m, i): LandingSectionShape => ({
            id: sid('soft', 10 + i),
            type: 'features',
            variant: 'list',
            data: {
                title: `Module ${m.n} · ${m.title}`,
                pillars: [
                    { title: 'About this module', description: m.description },
                    ...m.lessons.map((l) => ({ title: l, description: 'Practical lesson with real-world examples and exercises.' }))
                ]
            }
        })
    ),
    {
        id: sid('soft', 90),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'Built for every stage of your career',
            pillars: [
                {
                    title: 'Students',
                    description: 'Stand out in campus placements · Build a professional online identity · Develop confidence for interviews.'
                },
                {
                    title: 'Fresh Graduates',
                    description: 'Ace your first interviews · Master workplace communication · Learn corporate etiquette fast.'
                },
                {
                    title: 'Working Professionals',
                    description: 'Elevate your personal brand · Sharpen leadership & presentation · Stay productive with modern tools.'
                }
            ]
        }
    },
    {
        id: sid('soft', 91),
        type: 'cta',
        variant: 'banner',
        data: {
            title: 'Ready to invest in your career?',
            subtitle: 'Combine soft skills with our technical programs for a complete career upgrade.',
            buttonLabel: 'Talk to a counsellor',
            buttonLink: 'enquiry'
        }
    }
]

// ---- Interview Guides ------------------------------------------------------

const INTERVIEW_GUIDES = [
    {
        title: 'Fundamentals of Excel',
        description: '50 essential Excel interview questions covering basics, formulas, data analysis, pivot tables, charts, and advanced features.',
        questions: '50 Questions',
        readTime: '17 min read',
        rank: '#1 Most Popular'
    },
    {
        title: 'Fundamentals of Power BI',
        description: '50 essential Power BI interview questions covering fundamentals, data modeling, DAX, Power Query, and visualization.',
        questions: '50 Questions',
        readTime: '13 min read',
        rank: '#2'
    },
    {
        title: 'Fundamentals of Python',
        description: '50 essential Python interview questions covering basics, data types, control flow, OOP, file handling, and popular libraries.',
        questions: '50 Questions',
        readTime: '15 min read',
        rank: '#3'
    },
    {
        title: 'Fundamentals of SQL',
        description: '50 essential SQL interview questions covering basics, queries, joins, subqueries, aggregations, and database design.',
        questions: '50 Questions',
        readTime: '18 min read',
        rank: '#4'
    },
    {
        title: 'Fundamentals of Statistics',
        description:
            '50 essential statistics interview questions covering descriptive stats, probability, distributions, hypothesis testing, and regression.',
        questions: '50 Questions',
        readTime: '17 min read'
    },
    {
        title: 'Fundamentals of Tableau',
        description: '50 essential Tableau interview questions covering data connections, visualizations, calculations, and dashboard design.',
        questions: '50 Questions',
        readTime: '16 min read'
    }
]

const interviewSections = (): LandingSectionShape[] => [
    {
        id: sid('int', 0),
        type: 'hero',
        variant: 'gradient',
        data: {
            eyebrow: 'Interview Preparation',
            title: 'Crack Every Interview with Confidence',
            subtitle:
                'Curated questions, expert answers, and proven strategies — everything you need to prepare for data analytics, programming, and BI tool interviews.',
            primaryCtaLabel: 'Get started free',
            primaryCtaLink: 'enquiry',
            imageUrl: IMG_INTERVIEW,
            imageAlt: 'Albero Academy interview prep'
        }
    },
    {
        id: sid('int', 1),
        type: 'stats',
        variant: 'banner',
        data: {
            items: [
                { value: '6+', label: 'Topics', sublabel: 'Power BI · Python · Tableau · Excel · SQL · Stats' },
                { value: '300+', label: 'Questions', sublabel: 'Curated with expert answers' },
                { value: '100%', label: 'Free', sublabel: 'No paywall' }
            ]
        }
    },
    {
        id: sid('int', 2),
        type: 'features',
        variant: 'four-up',
        data: {
            title: 'Hottest interview guides',
            pillars: INTERVIEW_GUIDES.slice(0, 4).map((g) => ({
                title: `${g.rank ?? ''} ${g.title}`.trim(),
                description: `${g.description}\n\n${g.questions} · ${g.readTime}`
            }))
        }
    },
    {
        id: sid('int', 3),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'All interview guides',
            pillars: INTERVIEW_GUIDES.map((g) => ({
                title: g.title,
                description: `${g.description}\n\n${g.questions} · ${g.readTime}`
            }))
        }
    },
    {
        id: sid('int', 4),
        type: 'callout',
        variant: 'info',
        data: {
            title: 'How to prep efficiently',
            body: 'Treat the questions as a sequence: read, attempt, then check. Spend 70% of your prep on the topics you find hardest, not the comfortable ones.'
        }
    },
    {
        id: sid('int', 5),
        type: 'cta',
        variant: 'banner',
        data: {
            title: 'Want a 1:1 mock interview?',
            subtitle: 'Our mentors run live interview practice with feedback. Bookable as part of any cohort program.',
            buttonLabel: 'Book mock interview',
            buttonLink: 'enquiry'
        }
    }
]

// ---- Case Studies ----------------------------------------------------------

const CASE_BRANDS = [
    'Google',
    'Microsoft',
    'Apple',
    'Amazon',
    'Meta',
    'Netflix',
    'Spotify',
    'Adobe',
    'Tesla',
    'Uber',
    'Airbnb',
    'Nike',
    'Starbucks',
    'Samsung',
    'Intel',
    'Oracle',
    'IBM',
    'Cisco',
    'Uniqlo',
    'Zara',
    "McDonald's",
    'Louis Vuitton',
    'H&M',
    'Mastercard',
    'Twitter',
    'LinkedIn',
    'Pinterest',
    'Snapchat',
    'Reddit',
    'Discord',
    'Figma',
    'Notion'
]

const CASE_TOP_PICKS = [
    {
        label: 'Most Popular',
        brand: 'Starbucks',
        mentor: 'Vikram Mehta · Sr. Strategy Consultant, Deloitte',
        quote: "Starbucks' franchise-licensing hybrid is one of the smartest expansion models ever built."
    },
    {
        label: 'Top Pick',
        brand: 'Zara',
        mentor: "Sneha Kapoor · Brand Director, ex-L'Oréal",
        quote: "Zara's ability to turn runway trends into store-ready fashion in two weeks is remarkable."
    },
    {
        label: 'Trending',
        brand: 'Discord',
        mentor: 'Arjun Nair · Growth Lead at Myntra',
        quote: "Discord's community-led growth is a blueprint for any platform business without paid marketing."
    }
]

const CASE_STUDIES = [
    {
        title: 'Zara Case Study — Business Model, Marketing Strategy & Fast Fashion Innovation',
        date: '23 Mar 2026',
        readTime: '18 min read',
        description:
            "From a small dressmaking shop in Spain to the world's largest fast-fashion retailer. Inside Zara's supply-chain advantage and trend-to-store cadence."
    },
    {
        title: 'Pinterest Case Study — Visual Discovery Platform',
        date: '22 Mar 2026',
        readTime: '19 min read',
        description: 'From a simple idea-bookmarking tool to a $2.8B visual discovery engine. Business model, advertising strategy, and growth story.'
    },
    {
        title: 'Discord Case Study — Community Platform Revolution',
        date: '21 Mar 2026',
        readTime: '16 min read',
        description: 'From a gaming voice-chat app to a $15B community platform. Freemium model, viral growth, and evolution beyond gaming.'
    },
    {
        title: 'Uniqlo Case Study — LifeWear Philosophy',
        date: '20 Mar 2026',
        readTime: '21 min read',
        description:
            'From a single Hiroshima menswear shop to the third-largest apparel retailer worldwide. LifeWear philosophy, fabric innovation, and global expansion.'
    },
    {
        title: 'Uber Case Study — Ride-Hailing Revolution',
        date: '19 Mar 2026',
        readTime: '18 min read',
        description:
            'From a phone-summoned cab idea to a $150B mobility and delivery platform. Disruptive model, growth tactics, and global expansion.'
    },
    {
        title: 'Mastercard Case Study — From Crisis to AI Payments Giant',
        date: '15 Apr 2025',
        readTime: '13 min read',
        description:
            'How Mastercard rebuilt itself into a $400B data-intelligence and multi-rail payments platform — AI, acquisitions, and an expanded TAM.'
    },
    {
        title: 'Airbnb Case Study — Marketplace Disruption',
        date: '15 Feb 2025',
        readTime: '11 min read',
        description:
            'Three airbeds in San Francisco to a $70B global marketplace. History, business model, marketing strategy, and the disruption playbook.'
    },
    {
        title: 'H&M Case Study — Fast-Fashion Revolution',
        date: '10 Feb 2025',
        readTime: '14 min read',
        description: "From a single Swedish women's store to the second-largest fashion retailer. Affordable style, sustainability, and global scale."
    },
    {
        title: 'Louis Vuitton Case Study — Luxury Empire',
        date: '28 Jan 2025',
        readTime: '13 min read',
        description:
            'From a Paris trunk-making workshop to the most valuable luxury brand. Heritage, exclusivity, and masterful brand management at LVMH.'
    },
    {
        title: 'Starbucks Case Study — Global Coffee Expansion',
        date: '20 Jan 2025',
        readTime: '14 min read',
        description: 'A single Seattle store to 38,000+ locations worldwide. Experience-driven retail, loyalty innovation, and disciplined expansion.'
    },
    {
        title: "McDonald's Case Study — Global Dominance",
        date: '15 Jan 2025',
        readTime: '14 min read',
        description: 'A single drive-in to a $210B fast-food empire. Franchising, consistency, and marketing genius at scale.'
    },
    {
        title: 'Nike Case Study — Brand Building',
        date: '10 Jan 2025',
        readTime: '12 min read',
        description: 'A waffle-iron experiment to a $51B sportswear empire. Innovation, marketing genius, and digital transformation.'
    }
]

const caseStudySections = (): LandingSectionShape[] => [
    {
        id: sid('case', 0),
        type: 'hero',
        variant: 'gradient',
        data: {
            eyebrow: 'In-Depth Case Studies',
            title: "Learn From the World's Best Brands",
            subtitle:
                "In-depth case studies breaking down the business models, marketing strategies, and growth stories behind the world's most successful companies.",
            primaryCtaLabel: 'Talk to a mentor',
            primaryCtaLink: 'enquiry',
            imageUrl: IMG_BRAND,
            imageAlt: 'Albero Academy case studies'
        }
    },
    {
        id: sid('case', 1),
        type: 'stats',
        variant: 'banner',
        data: {
            items: [
                { value: '6+', label: 'Global brands analysed', sublabel: 'Tech, retail, fintech, luxury' },
                { value: '5+', label: 'Industries covered', sublabel: 'Cross-sector lessons' },
                { value: '20+', label: 'Business strategies', sublabel: 'Replicable playbooks' }
            ]
        }
    },
    {
        id: sid('case', 2),
        type: 'logos',
        variant: 'grid',
        data: {
            title: 'Explore by brand',
            subtitle: 'Real-world case studies from companies shaping industries worldwide.',
            items: CASE_BRANDS.map((b) => ({ alt: b }))
        }
    },
    {
        id: sid('case', 3),
        type: 'testimonials',
        variant: 'cards',
        data: {
            title: 'Top picks by our mentors',
            subtitle: 'Hand-picked by industry experts — the case studies every student should read.',
            items: CASE_TOP_PICKS.map((p) => ({
                quote: p.quote,
                name: p.mentor.split('·')[0].trim(),
                role: p.mentor.split('·')[1]?.trim() ?? '',
                company: `${p.label} · ${p.brand}`
            }))
        }
    },
    {
        id: sid('case', 4),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'All case studies',
            pillars: CASE_STUDIES.map((c) => ({
                title: c.title,
                description: `${c.description}\n\n${c.date} · ${c.readTime}`
            }))
        }
    },
    {
        id: sid('case', 5),
        type: 'cta',
        variant: 'banner',
        data: {
            title: 'Want full breakdowns + frameworks?',
            subtitle: 'Our cohort programs include live case-study debriefs with senior mentors.',
            buttonLabel: 'Explore programs',
            buttonLink: 'enquiry'
        }
    }
]

// ---- CheatSheet ------------------------------------------------------------
//
// Curated quick-reference one-pagers — composed from general knowledge, not
// scraped. Each topic is one `prose` section with a copy-friendly bullet
// layout admins can edit later in the Website Editor.

// Builds an intro prose + a code snippet for one cheat-sheet topic. Keeps
// the page rhythm consistent: prose context first, then the actual code.
const cheatTopic = (
    key: string,
    eyebrow: string,
    title: string,
    intro: string,
    code: string,
    language: 'sql' | 'python' | 'javascript' | 'typescript' | 'bash' | 'plain'
): LandingSectionShape[] => [
    {
        id: sid(`cheat-${key}-intro`, 0),
        type: 'prose',
        variant: 'narrow',
        data: { eyebrow, title, body: intro }
    },
    {
        id: sid(`cheat-${key}-code`, 0),
        type: 'code',
        variant: 'single',
        data: {
            title: `${key}.cheatsheet`,
            language,
            code,
            showLineNumbers: true
        }
    }
]

const cheatSheetSections = (): LandingSectionShape[] => [
    {
        id: sid('cheat', 0),
        type: 'hero',
        variant: 'gradient',
        data: {
            eyebrow: 'CheatSheets',
            title: 'Quick one-pagers for revising key concepts',
            subtitle:
                'Battle-tested snippets for SQL, Python, Power BI, Excel, Statistics, and Tableau — exactly what you need before an exam, an interview, or a stand-up.',
            imageUrl: IMG_CHEAT,
            imageAlt: 'Albero Academy cheat sheets'
        }
    },
    {
        id: sid('cheat', 1),
        type: 'stats',
        variant: 'banner',
        data: {
            items: [
                { value: '6', label: 'Cheat sheets', sublabel: 'One per core topic' },
                { value: '120+', label: 'Snippets', sublabel: 'Battle-tested' },
                { value: 'Free', label: 'Always', sublabel: 'No login needed' }
            ]
        }
    },

    // SQL ------------------------------------------------------------------
    ...cheatTopic(
        'sql',
        'SQL',
        'SQL · the patterns you reach for daily',
        'Aggregation, joins, window functions, CTEs, and the performance habits that keep your queries cheap. The snippet below packs the patterns you should know cold.',
        `-- Filtering & aggregation
SELECT col, COUNT(*) AS n
FROM t
WHERE active = TRUE
GROUP BY col
HAVING COUNT(*) > 1;

-- Nullable join via COALESCE
SELECT u.id, COALESCE(p.name, 'No profile') AS display_name
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id;

-- Anti-join: rows missing on the right
SELECT u.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- Window functions
SELECT
  user_id,
  amount,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY paid_at DESC) AS rn,
  LAG(amount, 1) OVER (ORDER BY paid_at) AS prev_amount,
  SUM(amount) OVER (PARTITION BY user_id ORDER BY paid_at
                    ROWS UNBOUNDED PRECEDING) AS running_total
FROM payments;

-- CTE for readable building blocks
WITH active_users AS (
  SELECT * FROM users WHERE last_login_at >= NOW() - INTERVAL '30 days'
),
recent_orders AS (
  SELECT user_id, COUNT(*) AS orders_30d FROM orders
  WHERE paid_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT u.id, u.email, COALESCE(o.orders_30d, 0) AS orders_30d
FROM active_users u
LEFT JOIN recent_orders o ON o.user_id = u.id;

-- Performance habits
-- 1. EXPLAIN before optimising. Measure, don't guess.
-- 2. Index WHERE / JOIN / ORDER BY columns. Not SELECT.
-- 3. Avoid SELECT * in production queries.
-- 4. LIMIT before ORDER BY rarely helps — the engine still sorts the full set first.`,
        'sql'
    ),

    // Python ---------------------------------------------------------------
    ...cheatTopic(
        'python',
        'PYTHON',
        'Python · idioms that survive code review',
        'Comprehensions over loops, context managers for I/O, dataclasses for records, typing for safety. The patterns below are the ones senior reviewers expect to see.',
        `# Comprehensions over loops
doubled = [x * 2 for x in xs if x > 0]
by_id = {row['id']: row for row in rows}
gen = (x * 2 for x in xs)  # lazy, memory-efficient

# Default args are evaluated ONCE — never use mutable defaults
def append_safe(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

# Iteration helpers
from collections import Counter
counts = Counter(words)            # frequency map in one line
for i, x in enumerate(xs):         # index + value, no manual counter
    ...
for a, b in zip(left, right):      # pairwise iteration
    ...

# Files + context managers
from pathlib import Path
with open(Path('data') / 'in.csv') as f:
    body = f.read()                # auto-closes even on exception

# Typed records
from dataclasses import dataclass

@dataclass
class User:
    id: str
    email: str
    is_admin: bool = False

# Errors — narrow + chained
try:
    parsed = json.loads(body)
except json.JSONDecodeError as e:
    raise ValueError("malformed payload") from e

# Memoise pure functions
from functools import lru_cache

@lru_cache(maxsize=1024)
def expensive(x: int) -> int:
    return slow_computation(x)`,
        'python'
    ),

    // Power BI / DAX -------------------------------------------------------
    ...cheatTopic(
        'powerbi',
        'POWER BI',
        'Power BI · DAX every analyst should know',
        'Filter context, time intelligence, and the model rules that keep visuals fast. Treat the snippet below as your first-port-of-call when a measure misbehaves.',
        `// Base measures
Sales     := SUM(Fact[Amount])
Sales LY  := CALCULATE([Sales], SAMEPERIODLASTYEAR(DimDate[Date]))
Sales YoY := DIVIDE([Sales] - [Sales LY], [Sales LY])

// Filter context manipulation
Sales (All Products) := CALCULATE([Sales], REMOVEFILTERS(DimProduct))
Sales (Slicer-Only)   := CALCULATE([Sales], ALLSELECTED(DimProduct))

// Time intelligence
Sales YTD       := TOTALYTD([Sales], DimDate[Date])
Sales L30D      := CALCULATE([Sales], DATESINPERIOD(DimDate[Date], MAX(DimDate[Date]), -30, DAY))

// Variables — readable AND faster (single evaluation)
Sales Growth :=
VAR cur = [Sales]
VAR prev = [Sales LY]
RETURN DIVIDE(cur - prev, prev)

// Modelling rules
//  - Star schema > snowflake for performance.
//  - Hide foreign-key columns. Force users onto dimension attributes.
//  - Bidirectional cross-filtering: use sparingly.
//  - High-cardinality columns: split datetime into date + time.
//  - Calculated columns vs measures: prefer measures.

// Diagnose slow visuals
//  - DAX Studio: Server Timings panel.
//  - VertiPaq Analyzer: column cardinalities + sizes.
//  - Performance Analyzer in the desktop app.`,
        'plain'
    ),

    // Excel ---------------------------------------------------------------
    ...cheatTopic(
        'excel',
        'EXCEL',
        'Excel · the formulas that pay rent',
        'Lookups, logic, text, and aggregation — plus the keyboard shortcuts that save real time. If you write formulas at work, the snippet below is muscle-memory material.',
        `// Lookups
=XLOOKUP(lookup, lookup_arr, return_arr, [if_not_found])
=INDEX(arr, MATCH(val, col, 0))

// Logic
=IF(cond, then, else)
=IFS(c1, v1, c2, v2, ..., TRUE, default)
=AND(c1, c2)    =OR(c1, c2)    =NOT(c)

// Text
=TEXTJOIN(", ", TRUE, range)
=LEFT(s, n)     =RIGHT(s, n)     =MID(s, start, n)
=TEXT(value, "yyyy-mm-dd")

// Aggregation (multi-condition)
=SUMIFS(sum_range, c1, v1, c2, v2)
=COUNTIFS(c1, v1, c2, v2)
=AVERAGEIFS(avg_range, c1, v1, c2, v2)

// SUMPRODUCT — pair-wise multiply + sum (cheaper than array formulas)
=SUMPRODUCT(arr1, arr2)

// Pivot tables — no formula needed
//  - Drag rows / columns / values to summarise instantly.
//  - Slicers + Timelines: filter pivots interactively.
//  - GETPIVOTDATA: pull a pivot cell into a formula safely.

// Keyboard shortcuts
//  Ctrl + ;          insert today's date
//  Ctrl + Shift + L  toggle filters
//  F2                edit cell
//  F4                toggle absolute reference`,
        'plain'
    ),

    // Statistics ----------------------------------------------------------
    ...cheatTopic(
        'stats',
        'STATISTICS',
        'Statistics · the parts you actually use',
        'Descriptives, distributions, and inference — written in Python so you can run any block right away. Skim the comments first; they cover the gotchas reviewers will surface.',
        `import numpy as np
from scipy import stats

# Descriptives — when each one fails
mean   = np.mean(x)        # sensitive to outliers
median = np.median(x)      # robust
sd     = np.std(x, ddof=1) # sample std-dev (Bessel's correction)
q1, q3 = np.percentile(x, [25, 75])
iqr    = q3 - q1
outlier_bounds = (q1 - 1.5 * iqr, q3 + 1.5 * iqr)

# Distributions you'll see
# - Normal: symmetric. ~68/95/99.7 within 1/2/3 SDs of the mean.
# - Binomial: k successes in n trials.
# - Poisson: rare events per fixed window.
# - Long tails (income, latency, file sizes): log-normal / Pareto.
#   Don't summarise long-tailed data with the mean.

# Hypothesis testing — two-sample t-test
control, treatment = ...  # arrays
t_stat, p_value = stats.ttest_ind(control, treatment, equal_var=False)
# p-value: probability of observing data at least this extreme IF
# the null is true. NOT the probability the null is true.

# Confidence interval for a mean
ci = stats.t.interval(
    confidence=0.95,
    df=len(x) - 1,
    loc=np.mean(x),
    scale=stats.sem(x),
)

# A/B testing rules
# 1. Pre-register your metric, effect size, and sample size.
# 2. Don't peek — fixed-horizon or sequential analysis only.
# 3. Multiple comparisons → Bonferroni or Benjamini-Hochberg.

# Regression
import statsmodels.api as sm
X = sm.add_constant(features)
model = sm.OLS(y, X).fit()
print(model.summary())
# Always split train / val / test (or use CV).`,
        'python'
    ),

    // Tableau -------------------------------------------------------------
    ...cheatTopic(
        'tableau',
        'TABLEAU',
        'Tableau · the dashboard playbook',
        'LOD calcs, table calcs, and the layout rules that make a dashboard usable on a phone. Print this one out next to your monitor — it answers half the questions you Slack a senior about.',
        `// Data prep
//  - Extract (.hyper) for performance. Live for freshness.
//  - Pivot wide → long for time-series visualisation.
//  - Joins: same-grain tables. Blends: cross-source.

// LOD calculations — fix the grain explicitly
{ FIXED [Customer] : SUM([Sales]) }     // lifetime sales per customer
{ INCLUDE [Region] : AVG([Sales]) }     // viz grain + region
{ EXCLUDE [Date]   : SUM([Sales]) }     // ignore date in current viz

// Table calcs — operate on the rendered table
WINDOW_SUM(SUM([Sales]))                 // running total along the partition
RANK(SUM([Sales]))                       // dense rank within partition
RUNNING_SUM(SUM([Sales]))

// Calc rule of thumb: if a regular calc works, use it.
//                     LOD only when the grain demands it.

// Dashboard layout
//  - Tiled > Floating for responsive layouts.
//  - Vertical / Horizontal containers for predictable layout.
//  - Filter actions > global filters when one viz drives others.
//  - Set device-specific layouts (Default + Tablet + Phone).

// Performance habits
//  - Hide unused fields. Tableau still computes them.
//  - Mark count > 5,000 → sluggish. Pre-aggregate.
//  - Parameters + calculated fields → swap measures cheaply.
//  - Keep the shape of your extract close to the questions you ask.`,
        'plain'
    ),

    {
        id: sid('cheat-cta', 0),
        type: 'cta',
        variant: 'card',
        data: {
            title: 'Want the deeper version?',
            subtitle: 'These quick references pair with our full tutorials. Go from "I remember the syntax" to "I can ship this in production."',
            buttonLabel: 'Browse tutorials',
            buttonLink: 'tutorials'
        }
    }
]

// ---- Page registry ---------------------------------------------------------

export const RESOURCE_PAGES: ResourcePage[] = [
    {
        id: 'pg-blog',
        slug: '/blog',
        name: 'Blog',
        title: 'Blog · Insights, Guides & Career Intelligence — Albero Academy',
        seoDescription:
            'Practical articles and guides written by industry experts — from data engineering to AI to investment banking. Free forever, updated weekly.',
        sections: blogSections()
    },
    {
        id: 'pg-tutorials',
        slug: '/tutorials',
        name: 'Tutorials',
        title: 'Tutorials · Learn by Doing — Albero Academy',
        seoDescription: 'Step-by-step tutorials across Python, Power BI, SQL, Excel, Statistics, and Tableau. Free, hands-on, mentor-built.',
        sections: tutorialSections()
    },
    {
        id: 'pg-soft-skills',
        slug: '/soft-skills',
        name: 'Soft Skills Training',
        title: 'Soft Skills Training · Master the Skills That Set You Apart — Albero Academy',
        seoDescription: 'Industry-driven soft skills training across digital identity, problem-solving, communication, and workplace readiness.',
        sections: softSkillsSections()
    },
    {
        id: 'pg-interview-guides',
        slug: '/interview-guides',
        name: 'Interview Guides',
        title: 'Interview Guides · Crack Every Interview with Confidence — Albero Academy',
        seoDescription:
            'Curated interview questions, expert answers, and proven strategies across Excel, Power BI, Python, SQL, Statistics, and Tableau.',
        sections: interviewSections()
    },
    {
        id: 'pg-case-studies',
        slug: '/case-studies',
        name: 'Case Studies',
        title: "Case Studies · Learn From the World's Best Brands — Albero Academy",
        seoDescription:
            "In-depth case studies on the business models, marketing strategies, and growth stories of the world's most successful companies.",
        sections: caseStudySections()
    },
    {
        id: 'pg-cheat-sheets',
        slug: '/cheat-sheets',
        name: 'CheatSheet',
        title: 'CheatSheets · Quick One-Pagers for Revising Key Concepts — Albero Academy',
        seoDescription: 'Print-ready quick-reference cheat sheets for SQL, Python, Power BI, Excel, Statistics, and Tableau.',
        sections: cheatSheetSections()
    }
]
