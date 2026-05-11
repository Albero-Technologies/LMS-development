// ────────────────────────────────────────────────────────────────────────────
// SEO constants — central source of truth for per-page metadata.
// Pages should read from here so titles/descriptions/canonical/OG stay in sync
// with the sitemap.xml in /public.
// ────────────────────────────────────────────────────────────────────────────

const SITE_URL = 'https://www.alberoacademy.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

export interface SEOData {
    title: string
    description: string
    keywords: string
    url: string
    canonical: string
    image: string
    type: string
}

// ─── Core pages ──────────────────────────────────────────────────────────────

export const homeSEO: SEOData = {
    title: 'Albero Academy — Build Skills. Get Hired.',
    description:
        'Albero Academy offers industry-focused programs in data analytics, AI, full-stack development, and finance — with live mentorship, real projects, and hiring-partner referrals.',
    keywords:
        'Albero Academy, online courses India, data analytics course, data science training, AI courses, full stack development, investment banking course, mentor-led programs, career training platform, Noida edtech',
    url: `${SITE_URL}/`,
    canonical: `${SITE_URL}/`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const aboutSEO: SEOData = {
    title: 'About Albero Academy — Career-first Learning, Mentor-led',
    description:
        "Albero Academy is a career-focused learning platform helping India's professionals master analytics, AI, and engineering through live mentorship and hiring-partner referrals.",
    keywords:
        'about Albero Academy, mentors, founders, story, learning platform, career training, Noida edtech',
    url: `${SITE_URL}/about`,
    canonical: `${SITE_URL}/about`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const workSEO: SEOData = {
    title: 'Case Studies & Proven Results — Albero Academy',
    description:
        'Real outcomes from Albero Academy learners — placements, salary jumps, and capstone projects across analytics, AI, full-stack, and finance.',
    keywords:
        'Albero Academy case studies, learner outcomes, placements, salary jumps, capstone projects, success stories',
    url: `${SITE_URL}/work`,
    canonical: `${SITE_URL}/work`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const pricingSEO: SEOData = {
    title: 'Pricing & Plans — Albero Academy',
    description:
        'Transparent pricing for Albero Academy programs — Self-Paced, Mentor-Led, and Career Pro plans across all career tracks, with no-cost EMI options.',
    keywords:
        'Albero Academy pricing, course fees, EMI options, mentor-led plans, career pro plan, learning plans India',
    url: `${SITE_URL}/pricing`,
    canonical: `${SITE_URL}/pricing`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const contactSEO: SEOData = {
    title: 'Contact Albero Academy — Talk to a Counsellor',
    description:
        'Get in touch with Albero Academy. Talk to a career counsellor, request a brochure, or book a free 1:1 cohort intro for any of our programs.',
    keywords:
        'contact Albero Academy, counsellor, support, admissions, free demo, cohort intro',
    url: `${SITE_URL}/contact`,
    canonical: `${SITE_URL}/contact`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

// ─── Program-page SEO map ────────────────────────────────────────────────────

export const programSEO: Record<string, SEOData> = {
    'business-analytics': {
        title: 'Business Analytics Program — Albero Academy',
        description:
            '6-month Business Analytics program covering Excel, SQL, Power BI, Tableau & Python. Mentor-led, project-driven, with hiring-partner referrals.',
        keywords:
            'business analytics course, Excel SQL Power BI training, business analyst program India, Albero Academy',
        url: `${SITE_URL}/programs/business-analytics`,
        canonical: `${SITE_URL}/programs/business-analytics`,
        image: DEFAULT_IMAGE,
        type: 'article'
    },
    'data-analytics': {
        title: 'Data Analytics Program — Albero Academy',
        description:
            '5-month Data Analytics program covering SQL, Python, statistics, Power BI & Tableau. 92% placement rate with 10+ portfolio-grade projects.',
        keywords:
            'data analytics course, data analyst training, SQL Python Power BI, Albero Academy, job-ready analytics',
        url: `${SITE_URL}/programs/data-analytics`,
        canonical: `${SITE_URL}/programs/data-analytics`,
        image: DEFAULT_IMAGE,
        type: 'article'
    },
    'data-science-ai': {
        title: 'Data Science with ML & Generative AI — Albero Academy',
        description:
            'Flagship 9-month Data Science program covering Machine Learning, Deep Learning, NLP, and Generative AI / LLMs — with deployable capstones.',
        keywords:
            'data science course, machine learning training, generative AI course, LLMs, Albero Academy AI program',
        url: `${SITE_URL}/programs/data-science-ai`,
        canonical: `${SITE_URL}/programs/data-science-ai`,
        image: DEFAULT_IMAGE,
        type: 'article'
    },
    'full-stack': {
        title: 'Full Stack Development Program — Albero Academy',
        description:
            '7-month MERN-focused Full Stack program covering React, Node.js, MongoDB, REST/GraphQL, and system design — built for engineers who ship.',
        keywords:
            'full stack developer course, MERN stack training, React Node.js MongoDB, Albero Academy engineering program',
        url: `${SITE_URL}/programs/full-stack`,
        canonical: `${SITE_URL}/programs/full-stack`,
        image: DEFAULT_IMAGE,
        type: 'article'
    },
    'data-engineering': {
        title: 'Data Engineering Program — Albero Academy',
        description:
            '7-month Data Engineering program covering Spark, Airflow, dbt, Snowflake, and streaming with Kafka — IBM Cloud pathway included.',
        keywords:
            'data engineering course, Spark Airflow dbt training, Kafka streaming, Snowflake course, Albero Academy',
        url: `${SITE_URL}/programs/data-engineering`,
        canonical: `${SITE_URL}/programs/data-engineering`,
        image: DEFAULT_IMAGE,
        type: 'article'
    },
    cybersecurity: {
        title: 'Cyber Security Program — Albero Academy',
        description:
            '6-month Cyber Security program covering OWASP Top 10, SOC ops, threat modelling, and red/blue team exercises with CTF capstones.',
        keywords:
            'cybersecurity course, ethical hacking training, SOC analyst program, OWASP Top 10, penetration testing, Albero Academy',
        url: `${SITE_URL}/programs/cybersecurity`,
        canonical: `${SITE_URL}/programs/cybersecurity`,
        image: DEFAULT_IMAGE,
        type: 'article'
    },
    'investment-banking': {
        title: 'Investment Banking Program — Albero Academy',
        description:
            '5-month Investment Banking program — three-statement modelling, M&A, LBOs, and pitchbook craft, taught by ex-bulge-bracket bankers.',
        keywords:
            'investment banking course, financial modelling training, M&A LBO course, pitchbook training, IB analyst, Albero Academy',
        url: `${SITE_URL}/programs/investment-banking`,
        canonical: `${SITE_URL}/programs/investment-banking`,
        image: DEFAULT_IMAGE,
        type: 'article'
    },
    'product-analytics': {
        title: 'Product Analytics Program — Albero Academy',
        description:
            '4-month Product Analytics program — funnels, retention, A/B testing, and PM-style thinking with Mixpanel, Amplitude & GA4.',
        keywords:
            'product analytics course, A/B testing training, Mixpanel Amplitude, growth analyst program, Albero Academy',
        url: `${SITE_URL}/programs/product-analytics`,
        canonical: `${SITE_URL}/programs/product-analytics`,
        image: DEFAULT_IMAGE,
        type: 'article'
    }
}

// ─── Resource hubs ───────────────────────────────────────────────────────────

export const blogsHubSEO: SEOData = {
    title: 'Blog & Insights — Albero Academy',
    description:
        'Practical articles on data analytics, AI, software engineering, and career building — written by the Albero Academy curriculum team and practitioner mentors.',
    keywords:
        'data analytics blog, AI blog, software engineering articles, career advice India, Albero Academy resources',
    url: `${SITE_URL}/resources/blogs`,
    canonical: `${SITE_URL}/resources/blogs`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const tutorialsHubSEO: SEOData = {
    title: 'Free Tutorials — Albero Academy',
    description:
        'Free, structured tutorials in Python, SQL, Power BI, Excel, Tableau, and Statistics — chapter-by-chapter, with examples and exercises.',
    keywords:
        'free Python tutorials, free SQL tutorials, Power BI tutorial, Tableau tutorial, statistics tutorials, Albero Academy',
    url: `${SITE_URL}/resources/tutorials`,
    canonical: `${SITE_URL}/resources/tutorials`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const softSkillsHubSEO: SEOData = {
    title: 'Soft Skills for Tech Careers — Albero Academy',
    description:
        'Sessions on communication, time management, LinkedIn optimisation, 1:1s, and interview presence — the soft skills that move the needle in a tech career.',
    keywords:
        'soft skills for engineers, tech career communication, LinkedIn optimisation, interview prep, Albero Academy',
    url: `${SITE_URL}/resources/soft-skills`,
    canonical: `${SITE_URL}/resources/soft-skills`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const caseStudiesHubSEO: SEOData = {
    title: 'Business Case Studies — Albero Academy',
    description:
        "Deep-dive business case studies on Apple, Amazon, Netflix, Razorpay, Flipkart, Swiggy, Adobe and more — strategy, business models, and what we can learn.",
    keywords:
        'business case studies, strategy case studies, business model analysis, MBA case studies, Albero Academy',
    url: `${SITE_URL}/resources/case-studies`,
    canonical: `${SITE_URL}/resources/case-studies`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const interviewGuidesHubSEO: SEOData = {
    title: 'Interview Guides — Albero Academy',
    description:
        'Fundamentals-focused interview guides for Python, SQL, Excel, Power BI, Tableau and Statistics — questions, answers, and patterns hiring managers look for.',
    keywords:
        'Python interview questions, SQL interview prep, Excel interview, Power BI interview, statistics interview, Albero Academy',
    url: `${SITE_URL}/resources/interview-guides`,
    canonical: `${SITE_URL}/resources/interview-guides`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const cheatSheetsHubSEO: SEOData = {
    title: 'Cheat Sheets — Albero Academy',
    description:
        'Compact cheat sheets for Python, SQL, Excel, Power BI DAX, Tableau, Statistics, Machine Learning, and Generative AI — built for quick reference.',
    keywords:
        'Python cheat sheet, SQL cheat sheet, DAX cheat sheet, statistics cheat sheet, ML cheat sheet, Albero Academy',
    url: `${SITE_URL}/resources/cheatsheet`,
    canonical: `${SITE_URL}/resources/cheatsheet`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

// ─── Policies ────────────────────────────────────────────────────────────────

export const refundSEO: SEOData = {
    title: 'Refund Policy | Albero Academy',
    description:
        "Read Albero Academy's refund policy — eligibility windows, timelines, and conditions for course enrollments and training programs.",
    keywords:
        'Albero Academy refund policy, course refund terms, online learning refund India, training refund rules',
    url: `${SITE_URL}/policies/refund`,
    canonical: `${SITE_URL}/policies/refund`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const termsSEO: SEOData = {
    title: 'Terms of Use | Albero Academy',
    description:
        "Albero Academy's Terms of Use — course access, user responsibilities, intellectual property, payment, and platform usage rules.",
    keywords:
        'Albero Academy terms, terms of use, user agreement, course access policy, intellectual property',
    url: `${SITE_URL}/policies/terms`,
    canonical: `${SITE_URL}/policies/terms`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const privacySEO: SEOData = {
    title: 'Privacy Policy | Albero Academy',
    description:
        "How Albero Academy collects, uses, and protects your personal data — including cookies, analytics, and your rights under Indian privacy law.",
    keywords:
        'Albero Academy privacy policy, data protection, cookies, GDPR, DPDP Act India',
    url: `${SITE_URL}/policies/privacy`,
    canonical: `${SITE_URL}/policies/privacy`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const escalationSEO: SEOData = {
    title: 'Escalation Policy | Albero Academy',
    description:
        'How to escalate concerns at Albero Academy — Level 1 to Level 3 contact paths, response SLAs, and grievance officer details.',
    keywords:
        'Albero Academy escalation, grievance redressal, learner support escalation',
    url: `${SITE_URL}/policies/escalation`,
    canonical: `${SITE_URL}/policies/escalation`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

export const examinationSEO: SEOData = {
    title: 'Examination Policy | Albero Academy',
    description:
        "Albero Academy's examination, evaluation, and certification policy — attempt limits, retake fees, integrity rules, and grading.",
    keywords:
        'Albero Academy examination policy, course evaluation, certification rules, retake policy',
    url: `${SITE_URL}/policies/examination`,
    canonical: `${SITE_URL}/policies/examination`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

// ─── 404 ─────────────────────────────────────────────────────────────────────

export const notFoundSEO: SEOData = {
    title: 'Page Not Found (404) | Albero Academy',
    description:
        "Oops! The page you are looking for doesn't exist. Explore Albero Academy to learn in-demand tech skills and accelerate your career.",
    keywords: 'Albero Academy 404, page not found, learn programming, online tech academy',
    url: `${SITE_URL}/`,
    canonical: `${SITE_URL}/`,
    image: DEFAULT_IMAGE,
    type: 'website'
}

// ─── Helpers for dynamic detail pages ────────────────────────────────────────

export function buildResourceDetailSEO(args: {
    section: 'blogs' | 'tutorials' | 'soft-skills' | 'case-studies' | 'interview-guides' | 'cheatsheet'
    slug: string
    title: string
    description: string
    keywords?: string
    image?: string
}): SEOData {
    const url = `${SITE_URL}/resources/${args.section}/${args.slug}`
    return {
        title: `${args.title} | Albero Academy`,
        description: args.description,
        keywords: args.keywords ?? '',
        url,
        canonical: url,
        image: args.image ?? DEFAULT_IMAGE,
        type: 'article'
    }
}

export function buildTutorialChapterSEO(args: {
    topic: string
    chapter: string
    title: string
    description: string
    keywords?: string
}): SEOData {
    const url = `${SITE_URL}/resources/tutorials/${args.topic}/${args.chapter}`
    return {
        title: `${args.title} | Albero Academy Tutorials`,
        description: args.description,
        keywords: args.keywords ?? '',
        url,
        canonical: url,
        image: DEFAULT_IMAGE,
        type: 'article'
    }
}

export function buildProgramSEO(slug: string, fallbackTitle: string, fallbackDescription: string): SEOData {
    return (
        programSEO[slug] ?? {
            title: `${fallbackTitle} | Albero Academy`,
            description: fallbackDescription,
            keywords: '',
            url: `${SITE_URL}/programs/${slug}`,
            canonical: `${SITE_URL}/programs/${slug}`,
            image: DEFAULT_IMAGE,
            type: 'article'
        }
    )
}
