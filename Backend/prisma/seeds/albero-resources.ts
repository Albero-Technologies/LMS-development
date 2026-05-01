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
    ...BLOG_POSTS.map((p, i): LandingSectionShape => ({
        id: sid('blog', 10 + i),
        type: 'callout',
        variant: 'info',
        data: {
            title: `${p.category} · ${p.date} · ${p.readTime}\n${p.title}`,
            body: p.description
        }
    })),
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
    { title: 'Python', description: 'Master Python from basics to advanced — data types, loops, functions, OOP, and real-world projects.', count: '50+ Lessons' },
    { title: 'Power BI', description: 'Build interactive dashboards, DAX formulas, data modelling, and BI reports.', count: '40+ Lessons' },
    { title: 'Tableau', description: 'Create stunning visualisations, calculated fields, and interactive storytelling dashboards.', count: '35+ Lessons' },
    { title: 'SQL', description: 'Write efficient queries — joins, subqueries, window functions, and database optimisation.', count: '60+ Lessons' },
    { title: 'Excel', description: 'Go beyond basics — pivot tables, VLOOKUP, macros, data analysis, and automation techniques.', count: '45+ Lessons' },
    { title: 'Statistics', description: 'Probability, hypothesis testing, regression, distributions — the math behind data science.', count: '30+ Lessons' }
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
        lessons: ['Creating Your Digital Identity', 'Power of Online Networking', 'Crafting Your Online Presence', 'Resume Assessment & Optimization', 'Interview Tips and Tricks']
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
    ...SOFT_MODULES.map((m, i): LandingSectionShape => ({
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
    })),
    {
        id: sid('soft', 90),
        type: 'features',
        variant: 'three-up',
        data: {
            title: 'Built for every stage of your career',
            pillars: [
                { title: 'Students', description: 'Stand out in campus placements · Build a professional online identity · Develop confidence for interviews.' },
                { title: 'Fresh Graduates', description: 'Ace your first interviews · Master workplace communication · Learn corporate etiquette fast.' },
                { title: 'Working Professionals', description: 'Elevate your personal brand · Sharpen leadership & presentation · Stay productive with modern tools.' }
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
        description: '50 essential statistics interview questions covering descriptive stats, probability, distributions, hypothesis testing, and regression.',
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
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Adobe',
    'Tesla', 'Uber', 'Airbnb', 'Nike', 'Starbucks', 'Samsung', 'Intel', 'Oracle',
    'IBM', 'Cisco', 'Uniqlo', 'Zara', "McDonald's", 'Louis Vuitton', 'H&M', 'Mastercard',
    'Twitter', 'LinkedIn', 'Pinterest', 'Snapchat', 'Reddit', 'Discord', 'Figma', 'Notion'
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
        mentor: 'Sneha Kapoor · Brand Director, ex-L\'Oréal',
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
        description: "From a small dressmaking shop in Spain to the world's largest fast-fashion retailer. Inside Zara's supply-chain advantage and trend-to-store cadence."
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
        description: 'From a single Hiroshima menswear shop to the third-largest apparel retailer worldwide. LifeWear philosophy, fabric innovation, and global expansion.'
    },
    {
        title: 'Uber Case Study — Ride-Hailing Revolution',
        date: '19 Mar 2026',
        readTime: '18 min read',
        description: 'From a phone-summoned cab idea to a $150B mobility and delivery platform. Disruptive model, growth tactics, and global expansion.'
    },
    {
        title: 'Mastercard Case Study — From Crisis to AI Payments Giant',
        date: '15 Apr 2025',
        readTime: '13 min read',
        description: 'How Mastercard rebuilt itself into a $400B data-intelligence and multi-rail payments platform — AI, acquisitions, and an expanded TAM.'
    },
    {
        title: 'Airbnb Case Study — Marketplace Disruption',
        date: '15 Feb 2025',
        readTime: '11 min read',
        description: 'Three airbeds in San Francisco to a $70B global marketplace. History, business model, marketing strategy, and the disruption playbook.'
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
        description: 'From a Paris trunk-making workshop to the most valuable luxury brand. Heritage, exclusivity, and masterful brand management at LVMH.'
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
            subtitle: "In-depth case studies breaking down the business models, marketing strategies, and growth stories behind the world's most successful companies.",
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

const cheatSheetSections = (): LandingSectionShape[] => [
    {
        id: sid('cheat', 0),
        type: 'hero',
        variant: 'gradient',
        data: {
            eyebrow: 'CheatSheets',
            title: 'Quick One-Pagers for Revising Key Concepts',
            subtitle: 'Print-ready references for SQL, Python, Power BI, Excel, Statistics, and Tableau — exactly what you need before an exam, an interview, or a stand-up.',
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
    {
        id: sid('cheat', 2),
        type: 'prose',
        variant: 'narrow',
        data: {
            eyebrow: 'CHEATSHEET',
            title: 'SQL · Top 20 patterns',
            body: `Filtering & aggregation\n• SELECT col, COUNT(*) FROM t WHERE cond GROUP BY col HAVING COUNT(*) > 1;\n• COALESCE(col, fallback) — first non-null. Useful for nullable joins.\n• CASE WHEN cond THEN x ELSE y END — inline conditional.\n\nJoins\n• INNER JOIN — rows that match in both tables.\n• LEFT JOIN — all rows from left, NULL on the right when no match.\n• Anti-join: LEFT JOIN ... WHERE right.id IS NULL — rows missing on the right.\n\nWindow functions\n• ROW_NUMBER() OVER (PARTITION BY x ORDER BY y) — rank per partition.\n• LAG(col, 1) OVER (ORDER BY date) — previous row's value.\n• SUM(col) OVER (PARTITION BY x ORDER BY date ROWS UNBOUNDED PRECEDING) — running total.\n\nCTEs\n• WITH cte AS (SELECT ...) SELECT ... FROM cte; — readable building blocks.\n• Recursive CTE: WITH RECURSIVE t AS (base UNION ALL recursive) — for trees / hierarchies.\n\nPerformance\n• Always EXPLAIN before optimising — measure, don't guess.\n• Index columns used in WHERE / JOIN / ORDER BY — not in SELECT.\n• Avoid SELECT * in production queries.\n• LIMIT before ORDER BY rarely helps — the engine still sorts the full set first.`
        }
    },
    {
        id: sid('cheat', 3),
        type: 'prose',
        variant: 'narrow',
        data: {
            eyebrow: 'CHEATSHEET',
            title: 'Python · idioms that survive code review',
            body: `Comprehensions over loops\n• [x*2 for x in xs if x > 0] — list comprehension.\n• {k: v for k, v in items} — dict comprehension.\n• Generator: (x*2 for x in xs) — lazy, memory-efficient.\n\nFunctions\n• Default args are evaluated ONCE at def-time. Never use mutable defaults — use None and create inside.\n• *args / **kwargs — variadic positional / keyword args.\n• functools.lru_cache — memoise pure functions.\n\nIteration\n• enumerate(xs) — index + value, no manual counter.\n• zip(a, b) — pairwise iteration; itertools.zip_longest pads.\n• collections.Counter(xs) — frequency map in one line.\n\nFiles + context managers\n• with open(path) as f: ... — auto-close on exit, even on exception.\n• Use pathlib.Path over os.path — cleaner, cross-platform.\n\nData\n• dataclasses.dataclass — typed records without boilerplate.\n• typing.NamedTuple — immutable typed records.\n• Pydantic v2 BaseModel — validation at boundaries.\n\nErrors\n• Catch the narrowest exception you can. Bare except: hides bugs.\n• raise from to preserve the cause chain.`
        }
    },
    {
        id: sid('cheat', 4),
        type: 'prose',
        variant: 'narrow',
        data: {
            eyebrow: 'CHEATSHEET',
            title: 'Power BI · DAX every analyst should know',
            body: `Filter context\n• CALCULATE(expr, filter1, filter2) — change the filter context for an expression.\n• REMOVEFILTERS(table) — drop existing filters.\n• ALL(table) — return all rows ignoring filters.\n• ALLSELECTED() — keep slicer filters but drop visual filters.\n\nTime intelligence\n• TOTALYTD(expr, dates) — year-to-date.\n• SAMEPERIODLASTYEAR(dates) — YoY comparisons.\n• DATESINPERIOD(dates, anchor, n, interval) — rolling windows.\n\nMeasures\n• [Sales] := SUM(Fact[Amount]) — base measure.\n• [Sales YoY %] := DIVIDE([Sales] - [Sales LY], [Sales LY]) — safe division.\n• Variables (VAR / RETURN) — readable AND faster (single evaluation).\n\nModeling\n• Star schema beats snowflake for performance — denormalise dimensions when in doubt.\n• Hide foreign-key columns from report view — force users onto dimension attributes.\n• Use bidirectional cross-filtering sparingly — it complicates the model.\n\nPerformance\n• Reduce cardinality of high-cardinality columns (split datetime into date + time).\n• Avoid calculated columns when a measure can do it.\n• DAX Studio + VertiPaq Analyzer for diagnosing slow visuals.`
        }
    },
    {
        id: sid('cheat', 5),
        type: 'prose',
        variant: 'narrow',
        data: {
            eyebrow: 'CHEATSHEET',
            title: 'Excel · the formulas that pay rent',
            body: `Lookups\n• XLOOKUP(lookup, lookup_arr, return_arr, [if_not_found]) — modern replacement for VLOOKUP.\n• INDEX(arr, MATCH(val, col, 0)) — classic two-way lookup.\n• VLOOKUP — left-to-right only. Use XLOOKUP if available.\n\nLogic\n• IF(cond, then, else) — basic conditional.\n• IFS(c1, v1, c2, v2, ..., default) — replaces nested IFs.\n• AND() / OR() / NOT() — combine conditions.\n\nText\n• TEXTJOIN(sep, ignore_empty, range) — concatenate with separator.\n• LEFT / RIGHT / MID — substring extraction.\n• TEXT(value, format) — format numbers / dates as text.\n\nAggregation\n• SUMIFS(sum_range, c1, v1, c2, v2, ...) — multi-condition sum.\n• COUNTIFS / AVERAGEIFS — same pattern, different aggregation.\n• SUMPRODUCT(arr1, arr2) — multiply pair-wise then sum (math + array tricks).\n\nPivot tables\n• Drag rows / columns / values — no formula needed.\n• Slicers + Timelines — filter pivots interactively.\n• GETPIVOTDATA — pull a pivot cell into a formula safely.\n\nKeyboard\n• Ctrl + ; — today's date.\n• Ctrl + Shift + L — toggle filters.\n• F2 — edit cell. F4 — toggle absolute reference.`
        }
    },
    {
        id: sid('cheat', 6),
        type: 'prose',
        variant: 'narrow',
        data: {
            eyebrow: 'CHEATSHEET',
            title: 'Statistics · the parts you actually use',
            body: `Descriptives\n• Mean — sensitive to outliers. Median — robust. Mode — for categoricals.\n• Variance / Std-dev — spread. SD has the same units as the data.\n• IQR (Q3 - Q1) — robust spread. Outliers: < Q1 - 1.5·IQR or > Q3 + 1.5·IQR.\n\nDistributions\n• Normal — symmetric, CLT magnet. ~68/95/99.7 within 1/2/3 SDs.\n• Binomial — k successes in n trials.\n• Poisson — rare events per fixed window.\n• Long tails — log-normal, Pareto. Don't summarise with the mean.\n\nInference\n• p-value — probability of observing data at least this extreme IF the null is true. Not the probability the null is true.\n• Confidence interval — range that captures the parameter X% of the time across repeated samples.\n• Type I error (false positive) vs Type II error (false negative). α / β trade-off.\n\nA/B testing\n• Pre-register your metric, your effect size, and your sample size.\n• Don't peek — sequential analysis or pre-set look points only.\n• Multiple comparisons → Bonferroni or BH correction.\n\nRegression\n• Linear: y = β₀ + Σ βᵢ xᵢ + ε. Check residual plots, not just R².\n• Logistic: model log-odds. Coefficients are log-odds ratios.\n• Always split train/validation/test or use CV.`
        }
    },
    {
        id: sid('cheat', 7),
        type: 'prose',
        variant: 'narrow',
        data: {
            eyebrow: 'CHEATSHEET',
            title: 'Tableau · the dashboard playbook',
            body: `Data prep\n• Extract (.hyper) for performance. Live for fresh data.\n• Pivot wide tables → long format for time series.\n• Use joins for same-grain tables, blends across data sources.\n\nMarks\n• Drop dimensions to Color / Size / Label — encoding by attribute.\n• Dual axis (right-click axis) — overlay measures with shared / synced axes.\n• Reference lines (Analytics pane) — context without writing formulas.\n\nCalculations\n• LOD: { FIXED [dim]: SUM(x) } — fixed grain. INCLUDE / EXCLUDE adjust to viz grain.\n• Table calc: WINDOW_SUM, RUNNING_SUM, RANK — operate on the rendered table.\n• If you can do it with a regular calc, do it. LOD only when the grain demands it.\n\nDashboards\n• Tiled > Floating for responsiveness.\n• Use containers (vertical / horizontal) for predictable layout.\n• Filter actions over global filters when one viz drives others — clearer intent.\n\nPerformance\n• Hide unused fields — Tableau still computes them.\n• Reduce mark count. > 5,000 marks gets sluggish.\n• Use parameters with calculated fields for switching measures cheaply.`
        }
    },
    {
        id: sid('cheat', 8),
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
        seoDescription: 'Curated interview questions, expert answers, and proven strategies across Excel, Power BI, Python, SQL, Statistics, and Tableau.',
        sections: interviewSections()
    },
    {
        id: 'pg-case-studies',
        slug: '/case-studies',
        name: 'Case Studies',
        title: "Case Studies · Learn From the World's Best Brands — Albero Academy",
        seoDescription: 'In-depth case studies on the business models, marketing strategies, and growth stories of the world\'s most successful companies.',
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
