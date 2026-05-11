// ─── Work Page Constants ─────────────────────────────────────────────────────

export const workData = {
    // ── Hero ──────────────────────────────────────────────────────────────────
    hero: {
        badge: 'Case Studies & Proven Results',
        titleStroke: 'REAL',
        titleLine2: 'RESULTS',
        titleEm: '& Scalable Impact',
        sub: 'From SaaS platforms to enterprise systems and AI-driven solutions — we build products that drive growth, automate operations, and deliver measurable business outcomes.',
        ctas: [
            { label: 'Explore Case Studies', href: '#collection', variant: 'primary' },
            { label: 'Book a Free Strategy Call', href: '#cta', variant: 'outline' }
        ],
        chips: [
            { icon: '🚀', val: '50+', lbl: 'Projects Delivered', pos: 'c1', delay: '' },
            { icon: '🏫', val: '20+', lbl: 'SchoolInstitutions Scaled', pos: 'c2', delay: '.8s' },
            { icon: '⭐', val: '95%', lbl: 'Client Retention', pos: 'c3', delay: '', amber: true },
            { icon: '📍', val: '10+', lbl: 'Cities Served', pos: 'c4', delay: '.6s', amber: true }
        ],
        tickerItems: [
            { label: 'SaaS Development', cls: 'hi' },
            { label: 'Web Applications', cls: '' },
            { label: 'AI Automation', cls: 'am' },
            { label: 'E-Commerce Platforms', cls: '' },
            { label: 'Enterprise Systems', cls: 'hi' },
            { label: 'ERP Solutions', cls: '' },
            { label: 'AI Chatbots', cls: 'am' },
            { label: 'Growth Marketing', cls: '' },
            { label: 'Data Analytics', cls: 'hi' },
            { label: 'Cloud Infrastructure', cls: '' },
            { label: 'Automation Systems', cls: 'am' },
            { label: 'UI/UX Design', cls: '' }
        ]
    },

    // ── Collection Index ──────────────────────────────────────────────────────
    collection: {
        label: 'Our Capabilities',
        title: 'WHAT WE',
        titleAccent: 'DELIVER',
        body: 'Five core domains. 50+ successful projects. One focus — building scalable systems that drive real business growth.',
        items: [
            { num: '01', title: 'Web & Software', em: 'Systems', href: '#it-web', cta: 'View case studies' },
            { num: '02', title: 'E-Commerce &', em: 'SaaS Products', href: '#it-ecom', cta: 'Explore platforms' },
            { num: '03', title: 'STEAM Labs', em: 'Innovation Systems', href: '#steam-schools', cta: 'See implementations' },
            { num: '04', title: 'Branding &', em: 'Growth Marketing', href: '#digital', cta: 'View campaigns' },
            { num: '05', title: 'ERP & Enterprise', em: 'Automation', href: '#erp', cta: 'Explore solutions' }
        ],
        stats: [
            { target: '50', suffix: '+', label: 'Projects Delivered' },
            { target: '20', suffix: '+', label: 'Organizations Scaled' },
            { target: '10', suffix: '+', label: 'Cities Served' },
            { target: '95', suffix: '%', label: 'Client Retention' }
        ]
    },

    // ── Projects ──────────────────────────────────────────────────────────────
    projects: {
        web: {
            heading: 'WEB & SOFTWARE DEVELOPMENT',
            slides: [
                {
                    client: 'Digidonar Agency',
                    tools: 'NEXT.JS · TAILWIND · SANITY CMS',
                    desc: 'Rebuilt the entire digital platform with a performance-first architecture. Result: 120% increase in organic traffic, 40% reduction in bounce rate, and a Lighthouse performance score of 98/100 within 90 days.',
                    tags: ['Next.js', 'SEO', 'CMS', 'Performance'],
                    reverse: false,
                    mockGrid: 'c3',
                    mocks: [
                        { icon: '🖥', label: 'Homepage' },
                        { icon: '📄', label: 'About' },
                        { icon: '📬', label: 'Contact' }
                    ],
                    phoneMocks: [
                        { icon: '🎨', label: 'Services', cls: 'square' },
                        { icon: '📊', label: 'Case Study', cls: 'square' }
                    ],
                    phoneLabel: 'Mobile'
                },
                {
                    client: 'Shine Healthcare',
                    tools: 'REACT · GRAPHQL · POSTGRESQL',
                    desc: 'ABDM-compliant patient portal connecting 200+ doctors across 3 states. Real-time appointment booking, EMR integration, and a companion Flutter mobile app.',
                    tags: ['Healthcare', 'ABDM', 'EMR', 'Flutter'],
                    reverse: true,
                    mockGrid: 'c2',
                    mocks: [
                        { icon: '🏥', label: 'Dashboard' },
                        { icon: '📋', label: 'Records' },
                        { icon: '📅', label: 'Booking' },
                        { icon: '👨‍⚕️', label: 'Doctor View' }
                    ]
                }
            ]
        },
        ecom: {
            heading: 'E-COMMERCE & SAAS PLATFORMS',
            subhead: 'High-conversion storefronts and data-driven dashboards built for scale.',
            slides: [
                {
                    client: 'TUC — The Urban Closet',
                    tools: 'NEXT.JS · STRIPE · MONGODB',
                    desc: 'Built a high-conversion e-commerce platform with AI-powered recommendations and optimized checkout flow. Result: 3× revenue growth in 6 months and significant improvement in repeat purchases.',
                    tags: ['E-Commerce', 'Stripe', 'AI Reco', 'Fashion'],
                    reverse: false,
                    mockGrid: 'c3',
                    mocks: [
                        { icon: '👗', label: 'Product', cls: 'portrait' },
                        { icon: '🛒', label: 'Cart', cls: 'portrait' },
                        { icon: '💳', label: 'Checkout', cls: 'portrait' }
                    ]
                },
                {
                    client: 'EduPulse SaaS Dashboard',
                    tools: 'VUE.JS · FASTAPI · REDIS',
                    desc: 'Real-time analytics enabling 500+ educators to monitor student performance across 12 institutes. Custom KPI widgets, export, and role-based access control.',
                    tags: ['SaaS', 'Real-time', 'EdTech', 'Analytics'],
                    reverse: true,
                    mockGrid: 'c2',
                    mocks: [
                        { icon: '📊', label: 'Analytics Dashboard', span: 2 },
                        { icon: '📈', label: 'Reports' },
                        { icon: '🎓', label: 'Student View' }
                    ]
                }
            ]
        },
        steam: {
            heading: 'STEAM LABS FOR SCHOOLS',
            subhead: "AI, robotics & innovation labs designed and installed across India's top schools.",
            slides: [
                {
                    client: 'Delhi Public School · Bengaluru',
                    tools: 'ARDUINO · RASPBERRY PI · TENSORFLOW LITE',
                    desc: 'Full-stack STEAM lab — Robotics Arena, AI Learning Hub, IoT Sensor kits, and Maker Station. 200+ students now engage in weekly hands-on STEM sessions.',
                    tags: ['Robotics', 'AI', 'IoT', 'Maker Space'],
                    reverse: false,
                    mockGrid: 'c2',
                    mocks: [
                        { icon: '🤖', label: 'Robotics Arena' },
                        { icon: '🧠', label: 'AI Hub' },
                        { icon: '📡', label: 'IoT Station' },
                        { icon: '🔧', label: 'Maker Space' }
                    ]
                },
                {
                    client: 'Ryan International · Pune',
                    tools: 'PYTHON · MBOT · MIT APP INVENTOR',
                    desc: '3D Printing Bay, Drone Flight Zone, AI Modules, and 30 coding workstations. Students built 14 functional apps within the first semester of installation.',
                    tags: ['3D Printing', 'Drones', 'App Dev', 'Python'],
                    reverse: true,
                    mockGrid: 'c3',
                    mocks: [
                        { icon: '🖨', label: '3D Printing' },
                        { icon: '🚁', label: 'Drone Zone' },
                        { icon: '💻', label: 'Workstations' }
                    ]
                },
                {
                    client: 'Amity International · Hyderabad',
                    tools: 'LEGO MINDSTORMS · NODE-RED · JUPYTER',
                    desc: 'ML Lab with Jupyter Notebooks, Lego Mindstorms robotics kits, and IoT Dashboard. 3 student teams won regional innovation competitions post-installation.',
                    tags: ['Machine Learning', 'Lego', 'Jupyter', 'IoT'],
                    reverse: false,
                    mockGrid: 'c2',
                    mocks: [
                        { icon: '🏫', label: 'Lab Overview', span: 2 },
                        { icon: '🔬', label: 'ML Station' },
                        { icon: '🧩', label: 'Lego Kits' }
                    ]
                }
            ]
        },
        digital: {
            heading: 'BRANDING & DIGITAL MARKETING',
            subhead: 'Visual identity, social creatives, and performance campaigns that drive real results.',
            slides: [
                {
                    client: 'SA Enterprises',
                    tools: 'CANVA · PHOTOSHOP · AI TOOLS',
                    desc: 'Full social media creative strategy — festive campaigns, product launches, and reels. Grew Instagram from 2K to 18K followers in just 4 months.',
                    tags: ['Social Media', 'Reels', 'Growth', 'Canva'],
                    reverse: false,
                    mockGrid: 'c3',
                    mocks: [
                        { icon: '📸', label: 'Post', cls: 'square' },
                        { icon: '🎉', label: 'Festive', cls: 'square' },
                        { icon: '📣', label: 'Offer', cls: 'square' },
                        { icon: '🏷', label: 'Product', cls: 'square' },
                        { icon: '🌟', label: 'Story', cls: 'square' },
                        { icon: '📲', label: 'Reel Cover', cls: 'square' }
                    ],
                    phoneLabel: 'Instagram'
                },
                {
                    client: 'Ekana Business Center',
                    tools: 'CANVA · PHOTOSHOP · FIGMA',
                    desc: 'Performance-focused Meta ad creatives for a premium real estate project. Structured visuals to highlight key USPs — location, lease value, and investment benefits.',
                    tags: ['Meta Ads', 'Real Estate', 'Performance', 'Figma'],
                    reverse: true,
                    mockGrid: 'c3',
                    mocks: [
                        { icon: '🏢', label: 'Banner — Ekana Business Center', cls: 'thumb', span: 3 },
                        { icon: '📐', label: 'Ad Set 01', cls: 'thumb' },
                        { icon: '📐', label: 'Ad Set 02', cls: 'thumb' },
                        { icon: '📐', label: 'Ad Set 03', cls: 'thumb' }
                    ]
                }
            ]
        },
        erp: {
            heading: 'ERP & ENTERPRISE SOLUTIONS',
            subhead: 'Custom ERPs and cloud migrations that save hours, cut costs, and modernise operations.',
            slides: [
                {
                    client: 'Advance Group of Colleges',
                    tools: 'DJANGO · REACT · MYSQL · DOCKER',
                    desc: 'Developed a custom ERP system to automate admissions, fees, and reporting. Result: 80% reduction in manual work and ₹18L+ annual operational cost savings.',
                    tags: ['ERP', 'Django', 'Admissions', 'Automation'],
                    reverse: false,
                    mockGrid: 'c2',
                    mocks: [
                        { icon: '🏛', label: 'ERP Main Dashboard', span: 2 },
                        { icon: '📑', label: 'Admissions' },
                        { icon: '💰', label: 'Fee Management' }
                    ]
                },
                {
                    client: 'Polycheme Logistics',
                    tools: 'AWS · LARAVEL · REACT NATIVE',
                    desc: 'Migrated legacy on-prem workflows to AWS. Built companion mobile app for fleet tracking and delivery management — saving 30+ man-hours/week across 4 departments.',
                    tags: ['Cloud', 'AWS', 'Logistics', 'Mobile'],
                    reverse: true,
                    mockGrid: 'c3',
                    mocks: [
                        { icon: '📦', label: 'Tracking', cls: 'portrait' },
                        { icon: '🚚', label: 'Fleet', cls: 'portrait' },
                        { icon: '☁️', label: 'Cloud', cls: 'portrait' }
                    ]
                }
            ]
        }
    },

    // ── Industries ────────────────────────────────────────────────────────────
    industries: {
        label: 'Industries We Serve',
        title: 'BUILT FOR',
        titleAccent: 'REAL BUSINESS USE CASES',
        body: 'We build industry-specific solutions designed to solve real operational challenges and unlock growth.',
        items: [
            { icon: '🏥', name: 'Healthcare', desc: 'Secure patient platforms, EMR integrations, and scalable healthcare systems.' },
            { icon: '🎓', name: 'Education', desc: 'ERP systems, AI-powered learning platforms, and STEAM innovation labs.' },
            { icon: '📱', name: 'EdTech', desc: 'SaaS dashboards, analytics platforms, and scalable learning ecosystems.' },
            { icon: '🚚', name: 'Logistics', desc: 'Fleet tracking, automation systems, and real-time operational dashboards.' },
            { icon: '🏢', name: 'Real Estate', desc: 'High-conversion platforms, CRM integrations, and performance marketing systems.' },
            { icon: '🛍', name: 'Retail', desc: 'E-commerce platforms, inventory systems, and AI-driven customer experiences.' },
            { icon: '☁️', name: 'SaaS', desc: 'End-to-end SaaS product development from MVP to enterprise scale.' }
        ]
    },

    // ── Tech Stack ────────────────────────────────────────────────────────────
    techStack: {
        label: 'Tech Stack',
        title: 'TECHNOLOGY',
        titleAccent: 'EXPERTISE',
        body: 'Every tool, framework, and platform we deploy across web and mobile development — battle-tested in production.',
        categories: [
            {
                label: 'Languages',
                pills: ['JavaScript', 'TypeScript', 'Python', 'PHP', 'Java', 'Dart', 'Kotlin', 'Swift', 'C#', 'Go', 'Rust', 'Ruby']
            },
            {
                label: 'Frontend — Web',
                pills: [
                    'React.js',
                    'Next.js',
                    'Vue.js',
                    'Nuxt.js',
                    'Angular',
                    'Svelte',
                    'Astro',
                    'Remix',
                    'Gatsby',
                    'HTML5',
                    'CSS3',
                    'SASS / SCSS',
                    'Tailwind CSS',
                    'Bootstrap',
                    'Material UI',
                    'shadcn/ui',
                    'Framer Motion',
                    'GSAP',
                    'Three.js',
                    'WebGL'
                ]
            },
            {
                label: 'Mobile App Development',
                pills: [
                    'Flutter',
                    'React Native',
                    'Expo',
                    'Android (Kotlin)',
                    'iOS (Swift)',
                    'Jetpack Compose',
                    'SwiftUI',
                    'Ionic',
                    'Capacitor',
                    'Xamarin',
                    '.NET MAUI'
                ]
            },
            {
                label: 'Backend & APIs',
                pills: [
                    'Node.js',
                    'Express.js',
                    'NestJS',
                    'Django',
                    'Django REST',
                    'FastAPI',
                    'Flask',
                    'Laravel',
                    'Symfony',
                    'CodeIgniter',
                    'Ruby on Rails',
                    'Spring Boot',
                    'ASP.NET Core',
                    'Go Gin',
                    'GraphQL',
                    'REST APIs',
                    'WebSockets',
                    'gRPC',
                    'tRPC'
                ]
            },
            {
                label: 'Databases & Storage',
                pills: [
                    'PostgreSQL',
                    'MySQL',
                    'MariaDB',
                    'SQLite',
                    'MongoDB',
                    'Firebase Firestore',
                    'DynamoDB',
                    'Redis',
                    'Cassandra',
                    'Elasticsearch',
                    'Supabase',
                    'PlanetScale',
                    'Prisma ORM',
                    'Sequelize',
                    'TypeORM',
                    'Mongoose',
                    'AWS S3',
                    'Cloudinary'
                ]
            },
            {
                label: 'CMS & E-Commerce',
                pills: [
                    'WordPress',
                    'Strapi',
                    'Sanity',
                    'Contentful',
                    'Directus',
                    'Ghost',
                    'Payload CMS',
                    'Shopify',
                    'WooCommerce',
                    'Medusa.js',
                    'Magento',
                    'PrestaShop'
                ]
            },
            {
                label: 'Auth & Security',
                pills: [
                    'JWT',
                    'OAuth 2.0',
                    'NextAuth.js',
                    'Auth0',
                    'Firebase Auth',
                    'Clerk',
                    'Keycloak',
                    'Passport.js',
                    '2FA / OTP',
                    'SSL / TLS',
                    'OWASP Standards'
                ]
            },
            {
                label: 'Cloud & DevOps',
                pills: [
                    'AWS',
                    'Google Cloud',
                    'Microsoft Azure',
                    'Firebase',
                    'Vercel',
                    'Netlify',
                    'Railway',
                    'Render',
                    'Docker',
                    'Kubernetes',
                    'Nginx',
                    'Apache',
                    'GitHub Actions',
                    'GitLab CI/CD',
                    'Jenkins',
                    'Terraform',
                    'Linux / Ubuntu'
                ]
            },
            {
                label: 'Payments & Integrations',
                pills: [
                    'Razorpay',
                    'Stripe',
                    'PayU',
                    'PayPal',
                    'Cashfree',
                    'Paytm',
                    'UPI Integration',
                    'Twilio',
                    'SendGrid',
                    'AWS SES',
                    'FCM Push',
                    'Google Maps API',
                    'WhatsApp API',
                    'Zapier'
                ]
            },
            {
                label: 'Design & Prototyping',
                pills: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'After Effects', 'Lottie', 'Storybook', 'Zeplin', 'Canva', 'Rive']
            },
            {
                label: 'Testing & QA',
                pills: [
                    'Jest',
                    'Vitest',
                    'Playwright',
                    'Cypress',
                    'Selenium',
                    'React Testing Library',
                    'Postman',
                    'Insomnia',
                    'k6 Load Testing',
                    'SonarQube'
                ]
            },
            {
                label: 'AI / ML & Data',
                pills: [
                    'OpenAI API',
                    'LangChain',
                    'LlamaIndex',
                    'TensorFlow',
                    'PyTorch',
                    'Scikit-learn',
                    'OpenCV',
                    'Hugging Face',
                    'Pandas',
                    'NumPy',
                    'Jupyter',
                    'Pinecone',
                    'Weaviate',
                    'Stable Diffusion'
                ]
            }
        ]
    },

    // ── Process ───────────────────────────────────────────────────────────────
    process: {
        label: 'How We Work',
        title: 'DEVELOPMENT',
        titleAccent: 'PROCESS',
        body: 'A proven six-step workflow — brief to production, without surprises.',
        steps: [
            {
                num: '01',
                title: 'DiscoveryStrategy & Product Planning',
                desc: 'We deep-dive into your business model, target users, and goals to define a clear roadmap. This ensures we build the right product—not just a good-looking one.'
            },
            {
                num: '02',
                title: 'UI/UX Design That Converts',
                desc: 'We design intuitive, conversion-focused interfaces with Figma prototypes—so you can visualize, validate, and refine before development begins.'
            },
            {
                num: '03',
                title: 'Scalable Development (Frontend + Backend)',
                desc: 'Using modern tech stacks, we build fast, secure, and scalable systems engineered for long-term growth—not quick fixes.'
            },
            {
                num: '04',
                title: 'Testing, Optimization & Security',
                desc: 'We rigorously test for performance, security, and reliability—ensuring your product runs flawlessly across all devices and user scenarios.'
            },
            { num: '05', title: 'Launch', desc: 'Cloud deployment, CI/CD pipelines, and QA across environments.' },
            {
                num: '06',
                title: 'Scale & Continuous Support',
                desc: 'We don’t stop at launch. We help you scale, optimize, and continuously improve with ongoing support, updates, and growth-focused enhancements.'
            }
        ]
    },

    // ── AI Services ───────────────────────────────────────────────────────────
    aiServices: {
        label: 'Advanced Services',
        title: 'AI &',
        titleAccent: 'INNOVATION',
        body: 'We implement production-ready AI systems that automate workflows, enhance decision-making, and unlock new revenue opportunities for modern businesses.',
        cards: [
            {
                icon: '🤖',
                title: 'Custom AI Chatbots & Assistants',
                desc: 'RAG-powered chatbots built on GPT-4o, Claude 3, or Gemini Pro — trained on your own documents, FAQs, and product data. Deployed via WhatsApp, website, or mobile app with memory, context, and escalation flows.',
                tags: ['GPT-4o', 'Claude 3', 'LangChain', 'RAG', 'Pinecone']
            },
            {
                icon: '🧠',
                title: 'LLM-Powered Applications',
                desc: 'Full-stack apps with large language model integration — document summarisation, legal/medical Q&A, AI search, and multi-step reasoning. Built with LangChain, LlamaIndex, and OpenAI Assistants API with tool calling & function calling.',
                tags: ['LlamaIndex', 'Assistants API', 'Tool Calling', 'Vector DBs']
            },
            {
                icon: '⚡',
                title: 'Autonomous AI Agents',
                desc: 'Multi-agent systems using AutoGen, CrewAI, and LangGraph that plan, delegate, and execute complex tasks autonomously. Use cases include research agents, data scraping agents, customer service bots, and sales outreach pipelines.',
                tags: ['CrewAI', 'AutoGen', 'LangGraph', 'Agentic AI']
            },
            {
                icon: '🎨',
                title: 'Generative AI & Image Intelligence',
                desc: 'AI-generated marketing visuals, product mockups, and brand creatives using Stable Diffusion, DALL·E 3, and Midjourney APIs. Also includes ControlNet-based image editing, background removal, and AI photo enhancement pipelines.',
                tags: ['DALL·E 3', 'Stable Diffusion', 'ControlNet', 'Replicate API']
            },
            {
                icon: '🗣️',
                title: 'Voice AI & Speech Systems',
                desc: 'Real-time voice assistants, AI call bots, and transcription pipelines using Whisper, ElevenLabs, and Deepgram. Build IVR replacement systems, voiceover automation, and multilingual speech-to-text for Hindi & regional languages.',
                tags: ['Whisper', 'ElevenLabs', 'Deepgram', 'Text-to-Speech']
            },
            {
                icon: '👁️',
                title: 'Computer Vision & Video AI',
                desc: 'Real-time object detection, face recognition, attendance systems, CCTV analytics, and defect detection for manufacturing. Powered by YOLOv9, OpenCV, MediaPipe, and Google Vision API with edge deployment on Raspberry Pi and Jetson Nano.',
                tags: ['YOLOv9', 'MediaPipe', 'OpenCV', 'Jetson Nano']
            },
            {
                icon: '📊',
                title: 'AI-Powered Analytics & Forecasting',
                desc: 'Predictive dashboards with ML-driven forecasting for sales, demand, and churn. Built on Prophet, XGBoost, and TensorFlow — surfaced via real-time Metabase or custom React dashboards with natural language querying using text-to-SQL AI.',
                tags: ['XGBoost', 'Prophet', 'Text-to-SQL', 'Metabase']
            },
            {
                icon: '🔄',
                title: 'AI Workflow Automation',
                desc: 'End-to-end intelligent automation using n8n, Make (Integromat), and Zapier with AI nodes. Automate lead qualification, invoice processing, email triaging, report generation, and social media scheduling — zero human intervention required.',
                tags: ['n8n', 'Make', 'Zapier AI', 'GPT Automation']
            },
            {
                icon: '🎯',
                title: 'Personalisation & Recommendation Engines',
                desc: 'Real-time recommendation systems for e-commerce, EdTech, and media platforms using collaborative filtering, content-based models, and GPT-4 embeddings. Drives AOV, retention, and time-on-site with product, content & course suggestions.',
                tags: ['Embeddings', 'Weaviate', 'CF Models', 'A/B Testing']
            },
            {
                icon: '📄',
                title: 'Document AI & Intelligent OCR',
                desc: 'Extract structured data from invoices, ID cards, marksheets, and medical reports using AWS Textract, Google Document AI, and fine-tuned vision models. Automates data entry, KYC verification, and document classification at scale.',
                tags: ['AWS Textract', 'Google Doc AI', 'OCR', 'KYC Automation']
            },
            {
                icon: '🔒',
                title: 'AI Security & Fraud Detection',
                desc: 'Real-time fraud detection systems for payments, login attempts, and content moderation. Uses anomaly detection models, behavioural biometrics, and LLM-powered threat analysis to protect platforms from abuse, bots, and financial fraud.',
                tags: ['Anomaly Detection', 'Fraud ML', 'Content Moderation', 'Biometrics']
            },
            {
                icon: '🌐',
                title: 'AI Integration & API Consulting',
                desc: 'Seamlessly embed AI capabilities into your existing product — CRM, ERP, website, or mobile app. We integrate OpenAI, Anthropic, Google Gemini, Cohere, and Groq APIs with custom middleware, rate limiting, cost controls, and observability via LangSmith.',
                tags: ['Groq', 'Cohere', 'Gemini', 'LangSmith', 'Observability']
            }
        ]
    },

    // ── STEAM Packages ────────────────────────────────────────────────────────
    steamPackages: {
        label: 'STEAM Labs',
        title: 'LAB',
        titleAccent: 'PACKAGES',
        body: 'Three tiers of future-ready STEAM labs — each packed with the tools, curriculum, and training your school needs to produce innovators, not just students.',
        packages: [
            {
                icon: '🔩',
                name: 'Starter Robotics Lab',
                tagline: 'The perfect launchpad — hands-on STEAM for schools taking their first step into coding and robotics.',
                featured: false,
                items: [
                    'Arduino Uno & Nano starter kits (×10)',
                    'mBot ranger robotics sets for drag-and-drop coding',
                    'Breadboard + sensor packs (IR, ultrasonic, DHT11)',
                    '10 student coding workstations (i5, 8GB RAM)',
                    'Scratch, MIT App Inventor & Tinkercad licences',
                    'LED matrix & LCD display project kits',
                    '3-day teacher training + pedagogy workshop',
                    '6-month structured STEAM curriculum (Grades 6–10)',
                    'Monthly online mentorship sessions',
                    'Lab setup, wiring & safety audit included'
                ]
            },
            {
                icon: '🧠',
                name: 'Advanced AI Lab',
                tagline: 'The complete AI + robotics environment — where students build real projects with real technology.',
                featured: true,
                badge: 'Most Popular',
                items: [
                    'GPU-enabled ML workstations (RTX 3060, 16GB RAM ×15)',
                    'Raspberry Pi 5 dev boards with camera modules (×10)',
                    'Arduino Mega + ESP32 IoT experiment kits',
                    'Full autonomous robotics arena with line-follower & obstacle bots',
                    'Python, TensorFlow Lite & OpenCV pre-configured environments',
                    'Face recognition & object detection project modules',
                    'Jupyter Notebook server for collaborative ML experiments',
                    'ChatGPT API integration projects for students',
                    'IoT sensor dashboard with real-time data visualisation',
                    '5-day intensive teacher training (AI + robotics)',
                    '1-year CBSE-aligned curriculum + quarterly updates',
                    'Dedicated Albero lab coordinator (remote, monthly visits)',
                    'Annual science fair & hackathon participation support'
                ]
            },
            {
                icon: '🚀',
                name: 'Innovation Lab',
                tagline: 'The flagship school-of-the-future lab — AI, robotics, drones, 3D printing, and research-grade computing under one roof.',
                featured: false,
                items: [
                    'High-performance AI workstations (RTX 4070, 32GB RAM ×20)',
                    'Competitive robotics arena (VEX V5 + custom obstacle courses)',
                    'DJI Tello EDU drone programming zone (×6 drones)',
                    'Bambu Lab A1 3D printing bay (×3 printers + filament supply)',
                    'PCB design station with soldering gear & oscilloscopes',
                    'NVIDIA Jetson Nano for edge AI & real-time computer vision',
                    'Lego Mindstorms EV3 + Spike Prime sets for advanced robotics',
                    'AR/VR headsets (Meta Quest 3) for immersive STEAM experiences',
                    'Full generative AI module — image, text & code generation',
                    'LLM integration lab — students build their own AI assistants',
                    'Cloud computing sandbox (AWS Educate + GCP for EDU accounts)',
                    '7-day deep-dive teacher certification programme',
                    'Lifetime curriculum access with bi-annual refresh',
                    'On-site Albero engineer visits (quarterly) + 24/7 support',
                    'Branding, inauguration event & PR support included'
                ]
            }
        ]
    },

    // ── Testimonials ──────────────────────────────────────────────────────────
    testimonials: {
        label: 'Client Voices',
        title: 'WHAT CLIENTS',
        titleAccent: 'SAY',
        items: [
            {
                text: 'Albero built our ERP system that reduced manual work by 80% and improved operational efficiency across departments. The impact was immediate and measurable.',
                author: 'Director',
                org: 'Advance Group of Colleges'
            },
            {
                text: 'The STEAM lab Albero installed has completely transformed how our students engage with technology. Three teams have already won regional robotics competitions.',
                author: 'Principal',
                org: 'Ryan International School, Pune'
            },
            {
                text: 'Our e-commerce revenue grew 3× in six months after Albero rebuilt our platform. The mobile performance and AI recommendations are best-in-class for our category.',
                author: 'Founder',
                org: 'TUC — The Urban Closet'
            },
            {
                text: "Albero's Meta ad creatives were structured and conversion-focused. The campaign generated 4× more qualified leads compared to our previous agency.",
                author: 'Marketing Head',
                org: 'Ekana Business Center'
            }
        ]
    },

    // ── Clients ───────────────────────────────────────────────────────────────
    clients: {
        label: 'Trusted By',
        title: 'OUR',
        titleAccent: 'CLIENTS',
        body: 'Schools, enterprises, and startups that trust Albero to build their technology.',
        logos: [
            { initials: 'DPS', name: 'Delhi Public School' },
            { initials: 'RIS', name: 'Ryan International School' },
            { initials: 'AI', name: 'Amity International' },
            { initials: 'AGC', name: 'Advance Group of Colleges' },
            { initials: 'EBC', name: 'Ekana Business Center' },
            { initials: 'TUC', name: 'The Urban Closet' },
            { initials: 'DDN', name: 'Digidonar Agency' }
        ]
    },

    // ── Presence ──────────────────────────────────────────────────────────────
    presence: {
        label: 'Our Reach',
        title: 'SERVING INDIA',
        titleAccent: 'NATIONWIDE',
        body: 'From Lucknow to Bengaluru — building technology that moves India forward.',
        cities: ['Lucknow', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai']
    },

    // ── CTA ───────────────────────────────────────────────────────────────────
    cta: {
        badge: 'Let’s Build Your Next Big Product',
        title: 'READY TO SCALE',
        titleEm: 'Your Business?',
        titleLine2: 'LET’S MAKE IT HAPPEN',
        body: "Whether you're building a SaaS product, scaling operations, or launching something new—we help you do it faster and smarter.",
        primaryLabel: 'Book a Free Strategy Call',
        primaryHref: '/contact',
        secondaryLabel: 'View More Case Studies →',
        secondaryHref: '/work'
    }
}
