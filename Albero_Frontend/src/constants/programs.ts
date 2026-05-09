import type { ComponentType, CSSProperties } from 'react'
import { BarChart3, Database, Brain, Code2, Server, Shield, LineChart, PieChart } from 'lucide-react'

export interface Module {
    title: string
    items: string[]
}

export interface ProgramOutcome {
    role: string
    salary?: string
    companies?: string[]
}

export interface ProgramData {
    slug: string
    badge: string
    title: string
    highlight: string
    subtitle: string
    description: string
    icon: ComponentType<{ size?: number; className?: string; style?: CSSProperties }>
    accent: string
    duration: string
    mode: string
    level: string
    enrollDate?: string
    stats: { v: string; l: string }[]
    highlights: string[]
    tools: string[]
    modules: Module[]
    outcomes: ProgramOutcome[]
    fees: { plan: string; price: string; emi?: string; features: string[]; recommended?: boolean }[]
}

export const programs: ProgramData[] = [
    {
        slug: 'business-analytics',
        badge: 'Career Track',
        title: 'Business Analytics',
        highlight: 'Program',
        subtitle: 'Turn business problems into data-driven decisions',
        description:
            'A 6-month structured program covering Excel, SQL, Power BI, Tableau, Python and storytelling — designed to make you industry-ready for analytics, consulting, and BI roles.',
        icon: BarChart3,
        accent: 'oklch(0.795 0.184 86.047)',
        duration: '6 Months',
        mode: 'Live + Recorded',
        level: 'Beginner to Pro',
        enrollDate: 'Next batch: 12 May 2026',
        stats: [
            { v: '6 Mo', l: 'Duration' },
            { v: '50+', l: 'Live Sessions' },
            { v: '8+', l: 'Capstone Projects' },
            { v: '100%', l: 'Placement Support' }
        ],
        highlights: [
            'Live mentor-led classes by working analysts',
            'Hands-on projects with real business datasets',
            '1:1 mentorship & weekly doubt sessions',
            'Resume, LinkedIn & mock-interview prep',
            'Industry-recognised certification on completion'
        ],
        tools: ['Excel', 'SQL', 'Power BI', 'Tableau', 'Python', 'Google Sheets', 'Looker Studio'],
        modules: [
            { title: 'Foundations of Analytics', items: ['Business problem framing', 'KPI design', 'Data ethics & privacy'] },
            { title: 'Excel for Analysts', items: ['Advanced formulas', 'Pivot tables', 'Power Query', 'Dashboarding'] },
            { title: 'SQL for Business Users', items: ['Queries, joins, CTEs', 'Window functions', 'Performance basics'] },
            { title: 'BI: Power BI & Tableau', items: ['Data modelling', 'DAX & calculated fields', 'Storyboarding'] },
            { title: 'Python for Analytics', items: ['Pandas', 'Visualisation', 'Statistical thinking'] },
            { title: 'Capstones & Career Sprint', items: ['Industry case studies', 'Portfolio reviews', 'Interview prep'] }
        ],
        outcomes: [
            { role: 'Business Analyst', salary: '₹6–12 LPA', companies: ['Deloitte', 'EY', 'Accenture', 'PwC'] },
            { role: 'Data Analyst', salary: '₹6–14 LPA', companies: ['Flipkart', 'Swiggy', 'Razorpay'] },
            { role: 'BI Developer', salary: '₹8–16 LPA', companies: ['TCS', 'Infosys', 'Wipro'] }
        ],
        fees: [
            { plan: 'Self-Paced', price: '₹35,000', features: ['Lifetime access', 'Recorded sessions', 'Community support', 'Project reviews'] },
            {
                plan: 'Mentor-Led',
                price: '₹65,000',
                emi: '₹6,500/mo',
                recommended: true,
                features: ['Everything in Self-Paced', 'Live classes', '1:1 mentorship', 'Resume & LinkedIn', 'Mock interviews']
            },
            {
                plan: 'Career Pro',
                price: '₹95,000',
                emi: '₹9,500/mo',
                features: ['Everything in Mentor-Led', 'Job referrals', 'Dedicated career coach', 'Salary negotiation prep']
            }
        ]
    },
    {
        slug: 'data-analytics',
        badge: 'Most Popular',
        title: 'Data Analytics',
        highlight: 'Program',
        subtitle: 'From beginner to job-ready data analyst',
        description:
            '5-month hands-on program covering SQL, Python, statistics, Power BI and Tableau — with portfolio-grade projects and a placement-focused career sprint.',
        icon: Database,
        accent: 'oklch(0.623 0.214 259.815)',
        duration: '5 Months',
        mode: 'Live + Recorded',
        level: 'Beginner Friendly',
        enrollDate: 'Next batch: 19 May 2026',
        stats: [
            { v: '5 Mo', l: 'Duration' },
            { v: '60+', l: 'Live Sessions' },
            { v: '10+', l: 'Real Projects' },
            { v: '92%', l: 'Placement Rate' }
        ],
        highlights: [
            'SQL, Python, Stats, Power BI, Tableau in one stack',
            'Daily problem-solving on LeetCode-style platforms',
            'Portfolio-ready projects across e-commerce, finance, healthcare',
            'Mock interviews with hiring managers',
            'Lifetime access to all updates'
        ],
        tools: ['SQL', 'Python', 'Pandas', 'Power BI', 'Tableau', 'Excel', 'Git'],
        modules: [
            { title: 'SQL Mastery', items: ['Joins, CTEs, window functions', 'Query tuning', 'Real datasets'] },
            { title: 'Python for Data', items: ['Pandas, NumPy', 'Data cleaning', 'EDA'] },
            { title: 'Statistics & A/B Testing', items: ['Distributions', 'Hypothesis testing', 'Experimentation'] },
            { title: 'Visualisation: Power BI & Tableau', items: ['Dashboards', 'Storytelling', 'Interactivity'] },
            { title: 'Capstones & Placement Sprint', items: ['10 industry projects', 'Resume + GitHub', 'Mock interviews'] }
        ],
        outcomes: [
            { role: 'Data Analyst', salary: '₹6–14 LPA', companies: ['Flipkart', 'Swiggy', 'Razorpay', 'Paytm'] },
            { role: 'Product Analyst', salary: '₹8–18 LPA', companies: ['Meesho', 'CRED', 'Zerodha'] },
            { role: 'Marketing Analyst', salary: '₹7–15 LPA', companies: ['HUL', 'Nestle', 'Britannia'] }
        ],
        fees: [
            { plan: 'Self-Paced', price: '₹40,000', features: ['Lifetime access', 'Recorded sessions', 'Community support'] },
            {
                plan: 'Mentor-Led',
                price: '₹75,000',
                emi: '₹7,500/mo',
                recommended: true,
                features: ['Live classes', '1:1 mentorship', 'Resume & LinkedIn', 'Mock interviews']
            },
            {
                plan: 'Career Pro',
                price: '₹1,15,000',
                emi: '₹11,500/mo',
                features: ['Everything in Mentor-Led', 'Job referrals', 'Dedicated career coach']
            }
        ]
    },
    {
        slug: 'data-science-ai',
        badge: 'Future-Ready',
        title: 'Data Science with',
        highlight: 'ML & Generative AI',
        subtitle: 'Build the AI products of tomorrow',
        description:
            'A flagship 9-month program in Data Science, Machine Learning, Deep Learning, and Generative AI / LLMs — with real-world projects and capstone deployments.',
        icon: Brain,
        accent: 'oklch(0.627 0.265 303.9)',
        duration: '9 Months',
        mode: 'Live + Recorded',
        level: 'Intermediate to Advanced',
        enrollDate: 'Next batch: 02 June 2026',
        stats: [
            { v: '9 Mo', l: 'Duration' },
            { v: '90+', l: 'Live Sessions' },
            { v: '15+', l: 'Industry Projects' },
            { v: '100%', l: 'AI Lab Access' }
        ],
        highlights: [
            'ML, Deep Learning, NLP, Generative AI in one program',
            'Build & deploy your own LLM-powered apps',
            'Mentors from MAANG & top AI labs',
            'GitHub-ready capstone portfolio',
            'Cohort interviews with hiring partners'
        ],
        tools: ['Python', 'Pandas', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'LangChain', 'Hugging Face', 'OpenAI', 'AWS'],
        modules: [
            { title: 'Python & Statistics for ML', items: ['Numpy, Pandas', 'Linear algebra', 'Probability'] },
            { title: 'Classical ML', items: ['Regression, classification', 'Trees, ensembles', 'Model evaluation'] },
            { title: 'Deep Learning', items: ['Neural nets', 'CNNs, RNNs', 'Transformers'] },
            { title: 'NLP & Generative AI', items: ['Embeddings', 'LLMs & RAG', 'Fine-tuning'] },
            { title: 'MLOps & Deployment', items: ['Docker, FastAPI', 'CI/CD', 'Monitoring'] },
            { title: 'Capstone & Career Sprint', items: ['End-to-end products', 'Open-source contributions', 'Interview prep'] }
        ],
        outcomes: [
            { role: 'Data Scientist', salary: '₹12–28 LPA', companies: ['Microsoft', 'Amazon', 'Google'] },
            { role: 'ML Engineer', salary: '₹15–35 LPA', companies: ['Uber', 'Walmart Labs', 'Netflix'] },
            { role: 'AI Engineer', salary: '₹18–45 LPA', companies: ['OpenAI', 'Anthropic', 'Adobe'] }
        ],
        fees: [
            { plan: 'Self-Paced', price: '₹65,000', features: ['Lifetime access', 'Recorded sessions', 'Community support'] },
            {
                plan: 'Mentor-Led',
                price: '₹1,25,000',
                emi: '₹12,500/mo',
                recommended: true,
                features: ['Live classes', '1:1 mentorship', 'Capstone reviews', 'Mock interviews']
            },
            {
                plan: 'AI Pro',
                price: '₹1,85,000',
                emi: '₹18,500/mo',
                features: ['Everything in Mentor-Led', 'Cloud + GPU credits', 'Hiring partner access', 'Career coach']
            }
        ]
    },
    {
        slug: 'full-stack',
        badge: 'Engineer Track',
        title: 'Full Stack',
        highlight: 'Development',
        subtitle: 'Ship products. End to end. With confidence.',
        description:
            'A 7-month MERN-focused program covering React, Node.js, MongoDB, REST/GraphQL APIs, deployment, and system design — built for engineers who ship.',
        icon: Code2,
        accent: 'oklch(0.696 0.17 162)',
        duration: '7 Months',
        mode: 'Live + Recorded',
        level: 'Beginner to Advanced',
        enrollDate: 'Next batch: 26 May 2026',
        stats: [
            { v: '7 Mo', l: 'Duration' },
            { v: '70+', l: 'Live Sessions' },
            { v: '12+', l: 'Real Apps Built' },
            { v: '100%', l: 'Code Reviews' }
        ],
        highlights: [
            'MERN stack mastery with real-world projects',
            'Daily DSA + system design practice',
            'Build, ship & deploy 12+ apps to your portfolio',
            'Open-source contribution sprints',
            'Mock technical interviews & referrals'
        ],
        tools: ['HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Postgres', 'Redis', 'Docker', 'AWS'],
        modules: [
            { title: 'Web Foundations', items: ['HTML, CSS, JS', 'Modern tooling', 'Git & GitHub'] },
            { title: 'Frontend with React', items: ['Components, state, hooks', 'TypeScript', 'Tailwind & UI libs'] },
            { title: 'Backend with Node', items: ['Express, REST, GraphQL', 'Auth, validation', 'Rate limiting'] },
            { title: 'Databases', items: ['MongoDB, Postgres', 'Indexes, transactions', 'Migrations'] },
            { title: 'DevOps & Deployment', items: ['Docker, CI/CD', 'AWS / Vercel', 'Monitoring & logs'] },
            { title: 'DSA, System Design & Interviews', items: ['LeetCode patterns', 'HLD/LLD', 'Mock interviews'] }
        ],
        outcomes: [
            { role: 'Frontend Engineer', salary: '₹8–22 LPA', companies: ['Razorpay', 'Zomato', 'CRED'] },
            { role: 'Backend Engineer', salary: '₹10–26 LPA', companies: ['Flipkart', 'Atlassian', 'PhonePe'] },
            { role: 'Full Stack Engineer', salary: '₹12–32 LPA', companies: ['Microsoft', 'Adobe', 'Walmart Labs'] }
        ],
        fees: [
            { plan: 'Self-Paced', price: '₹45,000', features: ['Lifetime access', 'Recorded sessions', 'Community support'] },
            {
                plan: 'Mentor-Led',
                price: '₹95,000',
                emi: '₹9,500/mo',
                recommended: true,
                features: ['Live classes', '1:1 mentorship', 'Code reviews', 'Mock interviews']
            },
            {
                plan: 'Career Pro',
                price: '₹1,45,000',
                emi: '₹14,500/mo',
                features: ['Everything in Mentor-Led', 'Job referrals', 'Dedicated career coach']
            }
        ]
    },
    {
        slug: 'data-engineering',
        badge: 'Cloud Track',
        title: 'Data',
        highlight: 'Engineering',
        subtitle: 'Build the pipelines that power AI',
        description:
            'A 7-month deep-dive in distributed data systems — Spark, Airflow, dbt, Snowflake, and streaming with Kafka. Build the platform every analytics and AI team runs on.',
        icon: Server,
        accent: 'oklch(0.645 0.246 16.439)',
        duration: '7 Months',
        mode: 'Live + Capstone',
        level: 'Intermediate',
        enrollDate: 'Next batch: 09 June 2026',
        stats: [
            { v: '7 Mo', l: 'Duration' },
            { v: '70+', l: 'Live Sessions' },
            { v: '6+', l: 'Pipeline Capstones' },
            { v: 'IBM', l: 'Cloud Pathway' }
        ],
        highlights: [
            'Build production ETL pipelines on real datasets',
            'Lakehouse architecture: Snowflake, Databricks, S3',
            'Streaming systems with Kafka & Flink',
            'IBM Cloud + Azure credits for capstones',
            'Mentors from data platform teams at MAANG and unicorns'
        ],
        tools: ['SQL', 'Python', 'Spark', 'Airflow', 'dbt', 'Snowflake', 'Kafka', 'AWS', 'Docker', 'Terraform'],
        modules: [
            { title: 'SQL & Modelling Foundations', items: ['Dimensional modelling', 'Star/snowflake schemas', 'Performance tuning'] },
            { title: 'Batch Processing with Spark', items: ['RDDs & DataFrames', 'Partitioning & shuffles', 'Performance debugging'] },
            { title: 'Orchestration with Airflow', items: ['DAG design', 'Sensors & operators', 'Backfills & SLAs'] },
            { title: 'Modern Stack: dbt + Snowflake', items: ['Models, tests, macros', 'Incremental loads', 'Cost optimisation'] },
            { title: 'Streaming with Kafka', items: ['Topics, partitions, consumers', 'Exactly-once semantics', 'CDC patterns'] },
            { title: 'Capstone & Career Sprint', items: ['End-to-end pipeline build', 'On-call playbook', 'System-design interviews'] }
        ],
        outcomes: [
            { role: 'Data Engineer', salary: '₹10–24 LPA', companies: ['Flipkart', 'Walmart Labs', 'Razorpay'] },
            { role: 'Analytics Engineer', salary: '₹12–26 LPA', companies: ['CRED', 'PhonePe', 'Meesho'] },
            { role: 'Platform Engineer', salary: '₹14–28 LPA', companies: ['Microsoft', 'IBM', 'Adobe'] }
        ],
        fees: [
            { plan: 'Self-Paced', price: '₹50,000', features: ['Lifetime access', 'Recorded sessions', 'Community support', 'IBM Cloud credits'] },
            {
                plan: 'Mentor-Led',
                price: '₹85,000',
                emi: '₹8,500/mo',
                recommended: true,
                features: ['Live classes', '1:1 mentorship', 'Capstone reviews', 'IBM SkillsBuild badge', 'Mock interviews']
            },
            {
                plan: 'Career Pro',
                price: '₹1,25,000',
                emi: '₹12,500/mo',
                features: ['Everything in Mentor-Led', 'Job referrals', 'Dedicated career coach', 'System-design prep']
            }
        ]
    },
    {
        slug: 'cybersecurity',
        badge: 'Security Track',
        title: 'Cyber',
        highlight: 'Security',
        subtitle: 'Defend the systems that hold the data',
        description:
            'A 6-month program in offensive and defensive security — SOC operations, threat modelling, OWASP Top 10, and red/blue team exercises against real incident playbooks.',
        icon: Shield,
        accent: 'oklch(0.696 0.17 192)',
        duration: '6 Months',
        mode: 'Live + Lab',
        level: 'Beginner Friendly',
        enrollDate: 'Next batch: 16 June 2026',
        stats: [
            { v: '6 Mo', l: 'Duration' },
            { v: '60+', l: 'Live Sessions' },
            { v: '20+', l: 'CTF Challenges' },
            { v: '100%', l: 'Lab Access' }
        ],
        highlights: [
            'OWASP Top 10 deep-dives with hands-on labs',
            'Red & blue team exercises on real-world topologies',
            'SOC analyst playbook + SIEM tools (Splunk, Wazuh)',
            'CTF-style capstones on isolated cyber-ranges',
            'Mentors who run security at fintech and SaaS scale-ups'
        ],
        tools: ['Linux', 'Networking', 'Wireshark', 'Burp Suite', 'Metasploit', 'Splunk', 'Wazuh', 'Nmap', 'Kali Linux'],
        modules: [
            { title: 'Foundations of Security', items: ['Threat modelling', 'CIA triad', 'Risk frameworks (NIST, ISO)'] },
            { title: 'Networking & Linux for Security', items: ['TCP/IP, packet capture', 'Linux internals', 'Hardening basics'] },
            { title: 'Web App Security', items: ['OWASP Top 10', 'Burp Suite', 'API security'] },
            { title: 'Offensive Security', items: ['Pentest methodology', 'Exploit development', 'Reporting'] },
            { title: 'SOC & Defensive Ops', items: ['SIEM with Splunk', 'Incident response', 'Threat hunting'] },
            { title: 'Capstone & Career Sprint', items: ['Live CTF event', 'Resume + LinkedIn', 'Security interview prep'] }
        ],
        outcomes: [
            { role: 'Security Analyst', salary: '₹7–14 LPA', companies: ['Deloitte', 'EY', 'PwC'] },
            { role: 'Penetration Tester', salary: '₹10–22 LPA', companies: ['NetSPI', 'Trustwave', 'NotSoSecure'] },
            { role: 'Security Engineer', salary: '₹12–28 LPA', companies: ['Razorpay', 'PhonePe', 'CRED'] }
        ],
        fees: [
            { plan: 'Self-Paced', price: '₹40,000', features: ['Lifetime access', 'Recorded sessions', 'Community support', 'Cyber-range access'] },
            {
                plan: 'Mentor-Led',
                price: '₹70,000',
                emi: '₹7,000/mo',
                recommended: true,
                features: ['Live classes', '1:1 mentorship', 'CTF reviews', 'Mock interviews']
            },
            {
                plan: 'Career Pro',
                price: '₹1,05,000',
                emi: '₹10,500/mo',
                features: ['Everything in Mentor-Led', 'Job referrals', 'Dedicated career coach', 'Cert exam vouchers (CEH/SecurityX)']
            }
        ]
    },
    {
        slug: 'investment-banking',
        badge: 'Finance Track',
        title: 'Investment',
        highlight: 'Banking',
        subtitle: 'Financial modelling, valuations & deals',
        description:
            'A 5-month program covering three-statement modelling, M&A, LBOs, and pitchbook craft — taught by ex-bulge-bracket bankers, with live deal walk-throughs.',
        icon: LineChart,
        accent: 'oklch(0.55 0.22 280)',
        duration: '5 Months',
        mode: 'Live + Cohort',
        level: 'Beginner to Advanced',
        enrollDate: 'Next batch: 23 June 2026',
        stats: [
            { v: '5 Mo', l: 'Duration' },
            { v: '50+', l: 'Live Sessions' },
            { v: '8+', l: 'Modelling Capstones' },
            { v: 'IB', l: 'Practitioner-led' }
        ],
        highlights: [
            'Three-statement modelling on live deals',
            'M&A, LBO, and DCF capstones with mentor reviews',
            'Pitchbook craft to bulge-bracket standard',
            'Mock IB interviews with ex-Goldman and JPM bankers',
            'Cohort kept small to preserve 1:1 modelling time'
        ],
        tools: ['Excel', 'PowerPoint', 'Bloomberg', 'CapIQ', 'FactSet', 'Pitchbook', 'Power BI'],
        modules: [
            { title: 'Accounting & Finance Foundations', items: ['Reading financials', 'Working-capital cycles', 'Free cash flow'] },
            { title: 'Three-Statement Modelling', items: ['Driver-based modelling', 'Scenario analysis', 'Audit & tie-outs'] },
            { title: 'Valuation', items: ['DCF, comparables, precedents', 'Sensitivity analysis', 'Football fields'] },
            { title: 'M&A & LBO Modelling', items: ['Accretion/dilution', 'Sources & uses', 'Returns waterfall'] },
            { title: 'Pitchbook & Storytelling', items: ['Deal narrative', 'Slide craft', 'CIM walk-throughs'] },
            { title: 'Capstone & Career Sprint', items: ['Live deal capstone', 'Resume + LinkedIn', 'IB & PE interview prep'] }
        ],
        outcomes: [
            { role: 'Investment Banking Analyst', salary: '₹12–24 LPA', companies: ['Goldman Sachs', 'JPMorgan', 'Morgan Stanley'] },
            { role: 'Equity Research Analyst', salary: '₹10–20 LPA', companies: ['Credit Suisse', 'Nomura', 'JM Financial'] },
            { role: 'Corporate Finance Analyst', salary: '₹8–18 LPA', companies: ['EY-Parthenon', 'Deloitte', 'KPMG'] }
        ],
        fees: [
            { plan: 'Self-Paced', price: '₹45,000', features: ['Lifetime access', 'Recorded sessions', 'Modelling templates', 'Community support'] },
            {
                plan: 'Mentor-Led',
                price: '₹80,000',
                emi: '₹8,000/mo',
                recommended: true,
                features: ['Live classes', '1:1 modelling reviews', 'Pitchbook portfolio', 'IB mock interviews']
            },
            {
                plan: 'Career Pro',
                price: '₹1,20,000',
                emi: '₹12,000/mo',
                features: ['Everything in Mentor-Led', 'IB referrals', 'Dedicated career coach', 'Bulge-bracket interview prep']
            }
        ]
    },
    {
        slug: 'product-analytics',
        badge: 'Growth Track',
        title: 'Product',
        highlight: 'Analytics',
        subtitle: 'Drive product with data',
        description:
            'A 4-month program in funnels, retention, A/B testing, and PM-style thinking. Build the analytics layer behind the products that ship and win.',
        icon: PieChart,
        accent: 'oklch(0.7 0.2 30)',
        duration: '4 Months',
        mode: 'Live + Mentored',
        level: 'Beginner Friendly',
        enrollDate: 'Next batch: 30 June 2026',
        stats: [
            { v: '4 Mo', l: 'Duration' },
            { v: '40+', l: 'Live Sessions' },
            { v: '5+', l: 'Real App Capstones' },
            { v: 'MS', l: 'Certified pathway' }
        ],
        highlights: [
            'Funnel & cohort analyses on real product data',
            'Live A/B test design with statistical rigour',
            'Mixpanel, Amplitude, GA4 — all hands-on',
            'PM ↔ analyst playbook from product leaders',
            'Microsoft Certified pathway included'
        ],
        tools: ['SQL', 'Python', 'Mixpanel', 'Amplitude', 'GA4', 'Power BI', 'Looker', 'Excel'],
        modules: [
            { title: 'Product Analytics Foundations', items: ['Metrics that matter', 'North-star design', 'Funnel & cohort thinking'] },
            { title: 'SQL for Product Analysts', items: ['Event modelling', 'Window functions', 'Sessionisation'] },
            { title: 'Experimentation & A/B Testing', items: ['Hypothesis design', 'Sample sizing', 'Reading results'] },
            { title: 'Tools: Mixpanel & Amplitude', items: ['Event taxonomy', 'Dashboards', 'Notebooks'] },
            { title: 'Storytelling for PMs', items: ['Insight memos', 'Exec readouts', 'Recommendations'] },
            { title: 'Capstone & Career Sprint', items: ['Real app capstone', 'Resume + LinkedIn', 'Analyst & PM interview prep'] }
        ],
        outcomes: [
            { role: 'Product Analyst', salary: '₹8–18 LPA', companies: ['Meesho', 'CRED', 'Zerodha'] },
            { role: 'Growth Analyst', salary: '₹9–20 LPA', companies: ['Razorpay', 'PhonePe', 'Swiggy'] },
            { role: 'Senior Data Analyst', salary: '₹12–24 LPA', companies: ['Microsoft', 'Flipkart', 'Walmart Labs'] }
        ],
        fees: [
            { plan: 'Self-Paced', price: '₹30,000', features: ['Lifetime access', 'Recorded sessions', 'Community support'] },
            {
                plan: 'Mentor-Led',
                price: '₹60,000',
                emi: '₹6,000/mo',
                recommended: true,
                features: ['Live classes', '1:1 mentorship', 'A/B testing capstone', 'Microsoft exam voucher']
            },
            {
                plan: 'Career Pro',
                price: '₹90,000',
                emi: '₹9,000/mo',
                features: ['Everything in Mentor-Led', 'PM/analyst referrals', 'Dedicated career coach']
            }
        ]
    }
]

export function findProgram(slug: string) {
    return programs.find((p) => p.slug === slug)
}
