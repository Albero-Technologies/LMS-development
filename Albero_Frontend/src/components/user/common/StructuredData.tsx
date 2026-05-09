import { Helmet } from 'react-helmet'

// ─── Raw schema objects ───────────────────────────────────────────────────────

const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.alberoacademy.com/#organization',
    name: 'Albero Academy',
    legalName: 'Albero Academy Pvt Ltd',
    url: 'https://www.alberoacademy.com',
    logo: {
        '@type': 'ImageObject',
        url: 'https://www.alberoacademy.com/logo.png',
        width: 200,
        height: 60
    },
    image: 'https://www.alberoacademy.com/og-image.png',
    description:
        'Albero Academy is a product engineering and SaaS-driven technology company helping businesses launch faster, automate operations, and scale with high-performance digital systems.',
    foundingDate: '2021',
    email: 'info@alberoacademy.com',
    telephone: '+91-9170780671',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Noida',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        postalCode: '201301',
        addressCountry: 'IN'
    },
    contactPoint: [
        {
            '@type': 'ContactPoint',
            telephone: '+91-9170780671',
            contactType: 'customer service',
            email: 'info@alberoacademy.com',
            availableLanguage: ['English', 'Hindi'],
            areaServed: 'IN'
        }
    ],
    sameAs: [
        'https://www.facebook.com/AlberoTechnologies1',
        'https://x.com/Alberotech1',
        'https://www.linkedin.com/company/albero-technologies-pvt-ltd/',
        'https://www.instagram.com/albero.technologies/'
    ]
}

const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.alberoacademy.com/#website',
    url: 'https://www.alberoacademy.com',
    name: 'Albero Academy',
    description: 'High-performance websites, SaaS platforms, and AI-powered systems for business growth.',
    publisher: { '@id': 'https://www.alberoacademy.com/#organization' },
    inLanguage: 'en-IN',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.alberoacademy.com/?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
    }
}

const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': 'https://www.alberoacademy.com/#local-business',
    name: 'Albero Academy',
    url: 'https://www.alberoacademy.com',
    telephone: '+91-9170780671',
    email: 'info@alberoacademy.com',
    image: 'https://www.alberoacademy.com/og-image.png',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Noida',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        postalCode: '201301',
        addressCountry: 'IN'
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 28.5355,
        longitude: 77.391
    },
    openingHoursSpecification: [
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:30'
        },
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday'],
            opens: '10:00',
            closes: '15:00'
        }
    ],
    priceRange: '₹₹',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '67',
        bestRating: '5',
        worstRating: '1'
    }
}

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What services does Albero Academy offer?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Albero Academy offers custom website development, web application development, SaaS product development, e-commerce platforms, ERP and enterprise software, AI and automation solutions, STEAM lab installation for schools, UI/UX design, SEO and digital marketing, and cloud hosting and DevOps services.'
            }
        },
        {
            '@type': 'Question',
            name: 'How long does it take to build a website with Albero Academy?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'A standard business website typically takes 2–4 weeks. Web applications and SaaS products range from 4–12 weeks. We follow a 5-step process: strategy, design, development, testing, and launch.'
            }
        },
        {
            '@type': 'Question',
            name: 'Do you offer free consultations?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Albero Academy offers a free 30-minute strategy call where we help you plan your website, e-commerce store, or automation system. You can book it through the contact form at alberoacademy.com.'
            }
        },
        {
            '@type': 'Question',
            name: 'Which cities does Albero Academy serve in India?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Albero Academy is based in Noida and has delivered projects across 10+ Indian cities including Lucknow, Delhi, Bengaluru, Hyderabad, Pune, and Mumbai. We also work with international clients remotely.'
            }
        },
        {
            '@type': 'Question',
            name: 'Does Albero Academy build AI-powered applications?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. We build production-ready AI applications including custom chatbots powered by GPT-4 and Claude, LLM-based document processing, autonomous AI agents, computer vision systems, voice AI, and workflow automation.'
            }
        }
    ]
}

// ─── Per-page breadcrumb generator ───────────────────────────────────────────

function buildBreadcrumbs(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    }
}

// ─── Page-level breadcrumb presets ───────────────────────────────────────────

export const breadcrumbs = {
    home: buildBreadcrumbs([{ name: 'Home', url: 'https://www.alberoacademy.com/' }]),
    about: buildBreadcrumbs([
        { name: 'Home', url: 'https://www.alberoacademy.com/' },
        { name: 'About Us', url: 'https://www.alberoacademy.com/about' }
    ]),
    work: buildBreadcrumbs([
        { name: 'Home', url: 'https://www.alberoacademy.com/' },
        { name: 'Case Studies', url: 'https://www.alberoacademy.com/work' }
    ]),
    refund: buildBreadcrumbs([
        { name: 'Home', url: 'https://www.alberoacademy.com/' },
        { name: 'Refund Policy', url: 'https://www.alberoacademy.com/refund-policy' }
    ]),
    terms: buildBreadcrumbs([
        { name: 'Home', url: 'https://www.alberoacademy.com/' },
        { name: 'Terms & Policies', url: 'https://www.alberoacademy.com/terms-and-policies' }
    ])
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StructuredDataProps {
    /** Which breadcrumb trail to inject (matches the breadcrumbs map above) */
    page?: keyof typeof breadcrumbs
    /** Pass true on the homepage to also inject FAQ + Services schemas */
    isHomePage?: boolean
    /** Pass additional custom schema objects */
    extra?: object[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StructuredData({ page = 'home', isHomePage = false, extra = [] }: StructuredDataProps) {
    // Always include sitewide schemas
    const schemas: object[] = [organizationSchema, websiteSchema, localBusinessSchema, breadcrumbs[page]]

    // Homepage-only schemas
    if (isHomePage) {
        schemas.push(faqSchema)
    }

    // Any caller-supplied extras
    schemas.push(...extra)

    return (
        <Helmet>
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
                />
            ))}
        </Helmet>
    )
}
