// Program-page redesign — supporting data for the new sections.
//
// These live in code (not the CMS) for now so the redesigned pages have
// rich, designed content the moment they ship. The same shape can be
// migrated to backend Collections later — every section component
// already reads its data from props, so swapping the source is a
// localised change inside Program.tsx / Home.tsx.

import type { ToolStripItem } from '@/components/user/program-page/ScrollingToolStrip'
import type { SuccessStory } from '@/components/user/program-page/SuccessStories'
import type { Mentor } from '@/components/user/program-page/MentorStrip'
import type { AlumniCompany } from '@/components/user/program-page/AlumniCompanyWall'
import type { AdvantageItem, CaseStudy, CareerOutcome, Certification, FaqItem, IndustryProject, SkillCategory } from '@/components/user/program-page/ProgramSections'
import type { RoadmapStep } from '@/components/user/program-page/CareerRoadmap'
import type { ArmorCodeNode } from '@/components/user/program-page/ArmorCodeHero'
import { Award, Compass, Layers, MessagesSquare, Rocket, Users } from 'lucide-react'

// ──────────────────────────────────────────────────────────────────────
// Tool ticker data — names only. The ToolIcon component resolves each
// name to a brand-coloured Lucide glyph via its internal registry, so
// callers don't need to maintain icon URLs.
// ──────────────────────────────────────────────────────────────────────

export const toolsForProgram = (toolNames: string[]): ToolStripItem[] =>
    toolNames.map((name) => ({ name }))

// ──────────────────────────────────────────────────────────────────────
// Shared sample mentors — used by every program until per-program CMS
// data is set up. Photos use real Unsplash portraits (royalty free).
// ──────────────────────────────────────────────────────────────────────

export const SAMPLE_MENTORS: Mentor[] = [
    {
        id: 'mentor-1',
        name: 'Aanya Kapoor',
        role: 'Senior Data Scientist',
        company: 'Microsoft',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        bio: '8 years building production ML at scale. Ex-Razorpay, Flipkart.',
        yearsExperience: 9,
        linkedinUrl: 'https://linkedin.com'
    },
    {
        id: 'mentor-2',
        name: 'Rohan Mehta',
        role: 'Engineering Manager',
        company: 'Google',
        photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
        bio: 'Built search infra and reviewed 1000+ engineer interviews at Google.',
        yearsExperience: 12,
        linkedinUrl: 'https://linkedin.com'
    },
    {
        id: 'mentor-3',
        name: 'Priya Sharma',
        role: 'Director of Analytics',
        company: 'Swiggy',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        bio: 'Built the experimentation platform at Swiggy. Speaker at Strata + ODSC.',
        yearsExperience: 11,
        linkedinUrl: 'https://linkedin.com'
    },
    {
        id: 'mentor-4',
        name: 'Vikram Singh',
        role: 'Staff Engineer',
        company: 'Atlassian',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        bio: 'Distributed systems + DX. Mentors Atlassian interns + early engineers.',
        yearsExperience: 14,
        linkedinUrl: 'https://linkedin.com'
    }
]

// ──────────────────────────────────────────────────────────────────────
// Success stories — keyed by program slug, then a default list.
// Used by the Program page and the homepage carousel (homepage shows
// stories with `featured = true` from any program).
// ──────────────────────────────────────────────────────────────────────

export const SUCCESS_STORIES: Record<string, SuccessStory[]> = {
    'business-analytics': [
        {
            id: 'sa-ba-1',
            name: 'Rahul Verma',
            role: 'BI Developer',
            company: 'Microsoft',
            photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop',
            salaryBeforeLpa: 5,
            salaryAfterLpa: 22,
            growthPct: 340,
            testimonial: 'The placement support was structured and result-driven — every step was aligned toward getting hired.',
            placedAt: 'Microsoft'
        },
        {
            id: 'sa-ba-2',
            name: 'Ananya Patel',
            role: 'Data Analyst',
            company: 'Amazon',
            photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop',
            salaryBeforeLpa: 3.5,
            salaryAfterLpa: 12,
            growthPct: 240,
            testimonial: 'The curriculum matched real industry requirements — I was confident from day one of my new role.',
            placedAt: 'Amazon'
        }
    ],
    'data-analytics': [
        {
            id: 'sa-da-1',
            name: 'Vikram Singh',
            role: 'Senior BI Developer',
            company: 'Accenture',
            photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop',
            salaryBeforeLpa: 4,
            salaryAfterLpa: 15,
            growthPct: 275,
            testimonial: 'Real projects, mentor reviews, mock interviews — the fastest career jump I have ever made.',
            placedAt: 'Accenture'
        }
    ],
    'data-science-ai': [
        {
            id: 'sa-ds-1',
            name: 'Neha Kapoor',
            role: 'Data Scientist',
            company: 'IBM',
            photoUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=600&fit=crop',
            salaryBeforeLpa: 3.8,
            salaryAfterLpa: 16,
            growthPct: 320,
            testimonial: 'Structured support system + the cohort kept me accountable. The career switch felt inevitable.',
            placedAt: 'IBM'
        },
        {
            id: 'sa-ds-2',
            name: 'Priya Sharma',
            role: 'AI Engineer',
            company: 'Google',
            photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
            salaryBeforeLpa: 4.5,
            salaryAfterLpa: 18,
            growthPct: 300,
            testimonial: 'The hands-on projects + mentorship gave me the confidence and skills to land a top-tier role.',
            placedAt: 'Google'
        }
    ]
}

export const FEATURED_SUCCESS_STORIES: SuccessStory[] = [
    ...(SUCCESS_STORIES['business-analytics'] ?? []),
    ...(SUCCESS_STORIES['data-science-ai'] ?? []),
    ...(SUCCESS_STORIES['data-analytics'] ?? [])
]

// ──────────────────────────────────────────────────────────────────────
// Alumni hiring partners — shared across all programs.
// ──────────────────────────────────────────────────────────────────────

export const ALUMNI_COMPANIES: AlumniCompany[] = [
    'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Razorpay', 'Swiggy', 'PhonePe',
    'CRED', 'Zomato', 'Meesho', 'Walmart Labs', 'Adobe', 'IBM', 'Deloitte', 'EY',
    'Accenture', 'TCS', 'Infosys', 'Wipro', 'PwC', 'KPMG'
].map((name) => ({ name }))

// ──────────────────────────────────────────────────────────────────────
// Per-program advantage / projects / case studies / certifications.
// Keyed by program slug — every program also has sensible defaults so
// fresh additions don't break the page.
// ──────────────────────────────────────────────────────────────────────

export const DEFAULT_ADVANTAGE: AdvantageItem[] = [
    { title: 'Mentor-led, not video-only', description: '1:1 reviews + weekly group sessions with practitioners hiring at MAANG.' },
    { title: 'Portfolio-grade projects', description: 'Build the exact deliverables hiring managers ask about in interviews.' },
    { title: 'Placement & salary support', description: 'Mock interviews, resume + LinkedIn craft, direct referrals to 180+ partners.' }
]

export const DEFAULT_FAQ: FaqItem[] = [
    { question: 'Do I need a background in coding?', answer: 'No. Every program has a "Foundations" sprint at the start that brings non-coders up to speed before the core curriculum begins.' },
    { question: 'How is this different from a typical online course?', answer: 'Live mentor sessions, code reviews on every assignment, and real placement support. You are accountable to a cohort and a coach — not a video.' },
    { question: 'What if I miss a live class?', answer: 'Every session is recorded and posted within 24 hours. Mentors host weekly catch-up office hours so you never fall behind.' },
    { question: 'Is there an EMI option?', answer: 'Yes. You can split the fee into 3, 6, 9 or 12-month EMIs with our partner lenders. Your counsellor walks you through the options.' },
    { question: 'What happens if I don\'t get placed?', answer: 'Our placement support continues until you land an offer at or above the program-target salary. Specific terms are detailed on the offer letter.' },
    { question: 'Can I switch tracks mid-program?', answer: 'Yes — within the first 14 days you can switch to any other program for free. After that, switching is allowed once per cohort with a small admin fee.' }
]

const TECH_TAG_COLORS: Record<string, string> = {
    Finance: '#5b3fd6',
    ML: '#0ea47a',
    Security: '#dc2626',
    Web: '#2563eb',
    Data: '#9333ea',
    Cloud: '#0891b2',
    'Generative AI': '#db2777'
}

export const PROJECTS_FOR_PROGRAM = (slug: string): IndustryProject[] => {
    const base: Record<string, IndustryProject[]> = {
        'business-analytics': [
            { title: 'Retail churn dashboard', tag: 'Finance', color: TECH_TAG_COLORS.Finance, description: 'Reduce ARR loss by surfacing at-risk customers from a 5M-row sales dataset.', techStack: ['SQL', 'Power BI', 'Excel'] },
            { title: 'Pricing experiment readout', tag: 'Data', color: TECH_TAG_COLORS.Data, description: 'A/B test analysis on a marketplace pricing change — recommend roll-out plan.', techStack: ['Python', 'Pandas', 'Tableau'] },
            { title: 'Cohort retention deep-dive', tag: 'Data', color: TECH_TAG_COLORS.Data, description: 'Diagnose Day-7 → Day-30 drop-off on a fintech app and propose three fixes.', techStack: ['SQL', 'Looker Studio'] }
        ],
        'data-science-ai': [
            { title: 'GenAI customer support agent', tag: 'Generative AI', color: TECH_TAG_COLORS['Generative AI'], description: 'RAG pipeline over a 10K-doc knowledge base, deployed on a FastAPI server.', techStack: ['Python', 'LangChain', 'OpenAI'] },
            { title: 'Image classification at scale', tag: 'ML', color: TECH_TAG_COLORS.ML, description: 'Fine-tune a CNN on a custom retail SKU dataset; ship to a real-time endpoint.', techStack: ['PyTorch', 'AWS', 'Docker'] },
            { title: 'Forecasting demand', tag: 'ML', color: TECH_TAG_COLORS.ML, description: 'Time-series forecasting for a logistics provider; explainable feature importances.', techStack: ['Python', 'Scikit-Learn'] }
        ],
        'cybersecurity': [
            { title: 'CTF blue-team capstone', tag: 'Security', color: TECH_TAG_COLORS.Security, description: 'Live SOC simulation: detect, triage, and respond to a multi-stage intrusion.', techStack: ['Splunk', 'Wazuh', 'Linux'] },
            { title: 'Web app pentest', tag: 'Security', color: TECH_TAG_COLORS.Security, description: 'OWASP-Top-10 sweep of a real customer-facing web app, with a written report.', techStack: ['Burp Suite', 'OWASP'] },
            { title: 'Network forensics', tag: 'Security', color: TECH_TAG_COLORS.Security, description: 'Reconstruct an attacker timeline from PCAPs + log artefacts.', techStack: ['Wireshark', 'Linux'] }
        ],
        'full-stack': [
            { title: 'Realtime chat product', tag: 'Web', color: TECH_TAG_COLORS.Web, description: 'WebSocket-backed messaging app with presence, typing, and offline queueing.', techStack: ['React', 'Node.js', 'Redis'] },
            { title: 'Marketplace MVP', tag: 'Web', color: TECH_TAG_COLORS.Web, description: 'Two-sided commerce flow with Stripe payments and admin dashboard.', techStack: ['React', 'TypeScript', 'Postgres'] },
            { title: 'CI/CD on AWS', tag: 'Cloud', color: TECH_TAG_COLORS.Cloud, description: 'Containerise + deploy a Node app on ECS with GitHub Actions pipeline.', techStack: ['Docker', 'AWS'] }
        ]
    }
    return base[slug] ?? base['business-analytics']
}

export const CASE_STUDIES_FOR_PROGRAM = (slug: string): CaseStudy[] => {
    const base: Record<string, CaseStudy[]> = {
        'business-analytics': [
            { company: 'Razorpay', problem: 'Merchant churn jumped 8% Q-on-Q in tier-2 cities.', approach: 'Joined funnel + support data; ran a logistic-regression to score risk.', outcomeMetric: '−5.2% churn', outcomeDetail: 'Within 2 quarters of the recommendation roll-out.' },
            { company: 'Swiggy', problem: 'Restaurant cancellations were inflating refund cost.', approach: 'Built a "cancellation risk" model + a counter-offer for at-risk orders.', outcomeMetric: '+₹4.6Cr/yr', outcomeDetail: 'Saved refund + reorder margin.' }
        ],
        'data-science-ai': [
            { company: 'Adobe', problem: 'Image moderation queue grew 3× without proportionate headcount.', approach: 'Fine-tuned a CLIP variant on labelled data + active-learning loop.', outcomeMetric: '92% auto-cleared', outcomeDetail: 'Human reviewers focus only on the residual 8%.' },
            { company: 'CRED', problem: 'Fraud signals scattered across 12 microservices.', approach: 'Unified feature store + lightweight tree ensemble for real-time scoring.', outcomeMetric: '−68% false positives', outcomeDetail: 'At the same recall as the legacy rules engine.' }
        ]
    }
    return base[slug] ?? base['business-analytics']
}

export const CERTIFICATIONS_FOR_PROGRAM = (slug: string): Certification[] => {
    const base: Record<string, Certification[]> = {
        'business-analytics': [
            { name: 'Microsoft PL-300', description: 'Power BI Data Analyst — exam voucher included.' },
            { name: 'IBM Data Analyst', description: 'Stack badge across SQL, Python, and visualisation tools.' },
            { name: 'NSDC Skill Certification', description: 'Government-recognised certificate of completion.' }
        ],
        'data-science-ai': [
            { name: 'Microsoft AI-900', description: 'Azure AI Fundamentals — exam voucher included.' },
            { name: 'IBM AI Engineering', description: 'Stack badge across PyTorch, TensorFlow, and ML deployment.' },
            { name: 'NSDC Skill Certification', description: 'Government-recognised certificate of completion.' }
        ],
        'cybersecurity': [
            { name: 'IBM SkillsBuild', description: 'Cybersecurity fundamentals + capstone badge.' },
            { name: 'CompTIA Security+ ready', description: 'Curriculum aligned to CompTIA Security+ exam objectives.' },
            { name: 'NSDC Skill Certification', description: 'Government-recognised certificate of completion.' }
        ],
        'full-stack': [
            { name: 'Microsoft AZ-204', description: 'Developing Solutions for Microsoft Azure — exam voucher.' },
            { name: 'AWS Cloud Practitioner ready', description: 'Curriculum covers AWS CCP exam objectives end-to-end.' },
            { name: 'NSDC Skill Certification', description: 'Government-recognised certificate of completion.' }
        ]
    }
    return base[slug] ?? base['business-analytics']
}

// Per-program FAQs — currently every program shares the default list.
// Wired as a function so the CMS can swap in per-program data later
// without touching call sites.
export const FAQ_FOR_PROGRAM = (slug: string): FaqItem[] => {
    void slug
    return DEFAULT_FAQ
}

// ──────────────────────────────────────────────────────────────────────
// ArmorCode hero nodes per program — defines which tool glyphs orbit
// the central hub on the program landing.
// ──────────────────────────────────────────────────────────────────────

export const ARMORCODE_NODES_FOR_PROGRAM = (slug: string): ArmorCodeNode[] => {
    const presets: Record<string, ArmorCodeNode[]> = {
        'business-analytics': [
            { id: 'excel', label: 'Excel', glyph: 'X', color: '#107c41', x: 0.12, y: 0.22, tooltip: 'Pivot tables, Power Query, dashboards' },
            { id: 'sql', label: 'SQL', glyph: 'S', color: '#00758f', x: 0.88, y: 0.22, tooltip: 'Joins, CTEs, window functions, tuning' },
            { id: 'pbi', label: 'Power BI', glyph: 'P', color: '#f2c811', x: 0.06, y: 0.74, tooltip: 'Data modelling, DAX, story-driven reports' },
            { id: 'tab', label: 'Tableau', glyph: 'T', color: '#e97627', x: 0.94, y: 0.74, tooltip: 'Interactive viz, calculated fields, narrative' },
            { id: 'py', label: 'Python', glyph: 'Py', color: '#3776ab', x: 0.5, y: 0.08, tooltip: 'Pandas, statistical thinking, automation' }
        ],
        'data-science-ai': [
            { id: 'py', label: 'Python', glyph: 'Py', color: '#3776ab', x: 0.1, y: 0.2, tooltip: 'NumPy, Pandas, Scikit-Learn pipelines' },
            { id: 'pt', label: 'PyTorch', glyph: 'PT', color: '#ee4c2c', x: 0.9, y: 0.2, tooltip: 'Deep learning + production-grade training loops' },
            { id: 'tf', label: 'TensorFlow', glyph: 'TF', color: '#ff6f00', x: 0.06, y: 0.78, tooltip: 'Keras, TF-Serving, edge deployment' },
            { id: 'lc', label: 'LangChain', glyph: 'L', color: '#7e22ce', x: 0.94, y: 0.78, tooltip: 'RAG pipelines, agents, tool-calling' },
            { id: 'oa', label: 'OpenAI', glyph: '◎', color: '#10a37f', x: 0.5, y: 0.08, tooltip: 'GPT, function calling, embeddings' }
        ],
        'full-stack': [
            { id: 'rc', label: 'React', glyph: '⚛', color: '#0891b2', x: 0.12, y: 0.2, tooltip: 'Components, hooks, TypeScript-first' },
            { id: 'nd', label: 'Node.js', glyph: 'N', color: '#3c873a', x: 0.88, y: 0.2, tooltip: 'Express, REST, GraphQL, auth + rate limits' },
            { id: 'ts', label: 'TS', glyph: 'TS', color: '#3178c6', x: 0.06, y: 0.78, tooltip: 'Generics, narrowing, end-to-end types' },
            { id: 'pg', label: 'Postgres', glyph: 'PG', color: '#336791', x: 0.94, y: 0.78, tooltip: 'Indexes, transactions, migrations' },
            { id: 'aws', label: 'AWS', glyph: 'A', color: '#ff9900', x: 0.5, y: 0.08, tooltip: 'EC2, S3, ECS, CI/CD pipelines' }
        ],
        'cybersecurity': [
            { id: 'sp', label: 'Splunk', glyph: 'S', color: '#65a637', x: 0.1, y: 0.2, tooltip: 'SIEM queries, alerting, threat hunting' },
            { id: 'kl', label: 'Kali', glyph: 'K', color: '#557c94', x: 0.9, y: 0.2, tooltip: 'Pentest distro + offensive toolkits' },
            { id: 'wz', label: 'Wazuh', glyph: 'W', color: '#0066b1', x: 0.06, y: 0.78, tooltip: 'Open-source SIEM + endpoint detection' },
            { id: 'bs', label: 'Burp', glyph: 'B', color: '#ff6633', x: 0.94, y: 0.78, tooltip: 'Web app proxy, intruder, repeater' },
            { id: 'lx', label: 'Linux', glyph: '🐧', color: '#14785f', x: 0.5, y: 0.08, tooltip: 'Hardening, scripting, packet capture' }
        ]
    }
    return presets[slug] ?? presets['business-analytics']
}

// ──────────────────────────────────────────────────────────────────────
// Skills tabs (What You'll Learn) — derived from the program's existing
// modules + tools; falls back to a default trio if the program has no
// rich data.
// ──────────────────────────────────────────────────────────────────────

export const SKILLS_FOR_PROGRAM = (slug: string, tools: string[]): SkillCategory[] => {
    const base: Record<string, SkillCategory[]> = {
        'business-analytics': [
            { category: 'Tools', items: tools },
            { category: 'Concepts', items: ['Funnel design', 'Cohort analysis', 'A/B testing', 'Sample sizing', 'KPI design', 'Storytelling'] },
            { category: 'Soft skills', items: ['Stakeholder updates', 'Root-cause writing', 'Exec readouts', 'Async collaboration'] }
        ],
        'data-science-ai': [
            { category: 'Tools', items: tools },
            { category: 'Concepts', items: ['Linear algebra', 'Probability', 'Model evaluation', 'CV', 'NLP', 'RAG architectures', 'MLOps'] },
            { category: 'Soft skills', items: ['Reading papers', 'Hypothesis writing', 'Cross-functional reviews'] }
        ]
    }
    if (base[slug]) return base[slug]
    return [
        { category: 'Tools', items: tools },
        { category: 'Concepts', items: ['Foundations', 'Advanced patterns', 'Production craft', 'Performance'] },
        { category: 'Soft skills', items: ['Communication', 'Collaboration', 'Documentation', 'Code reviews'] }
    ]
}

// ──────────────────────────────────────────────────────────────────────
// Career outcomes — re-uses existing program.outcomes if present; the
// helper just normalises the shape.
// ──────────────────────────────────────────────────────────────────────

export const careerOutcomesFromProgram = (outcomes: { role: string; salary?: string; companies?: string[] }[]): CareerOutcome[] =>
    outcomes.map((o) => ({ role: o.role, salary: o.salary, companies: o.companies }))

// ──────────────────────────────────────────────────────────────────────
// Homepage roadmap + advantage shortcuts.
// ──────────────────────────────────────────────────────────────────────

export const HOME_ROADMAP_STEPS: RoadmapStep[] = [
    { title: 'Profile Power-Up', description: 'Resume, LinkedIn, GitHub aligned to your target role — reviewed by hiring managers.' },
    { title: 'Skill Transformation', description: 'Master the in-demand stack with mentor-led labs, code reviews, and weekly accountability.' },
    { title: 'Interview Readiness', description: 'Mock interviews, system-design walkthroughs, and behavioural prep tailored to your target role.' },
    { title: 'Opportunity Maximisation', description: 'Direct intros to our 180+ hiring partners, salary negotiation coaching, and offer support.' }
]

export const HOME_ADVANTAGE_ITEMS: AdvantageItem[] = [
    { title: 'Live mentor cohorts', description: 'Small batches with practitioners who actually hire — not lecture-style videos.', icon: <Users size={20} /> },
    { title: 'Portfolio-grade projects', description: 'Capstones reviewed by working PMs and hiring managers — built on real datasets.', icon: <Layers size={20} /> },
    { title: 'Career compass', description: 'Resume reviews, LinkedIn polish, mock interviews, and direct referrals.', icon: <Compass size={20} /> },
    { title: 'Industry certifications', description: 'Stack badges from Microsoft, IBM, NSDC, and J.P. Morgan to your CV.', icon: <Award size={20} /> },
    { title: 'Lifetime community', description: 'Stay in the alumni Slack — referrals, jobs, and meet-ups long after you graduate.', icon: <MessagesSquare size={20} /> },
    { title: 'Placement guarantee', description: 'Continued support until you land an offer at or above the target salary.', icon: <Rocket size={20} /> }
]
