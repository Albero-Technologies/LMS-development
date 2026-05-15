import React from 'react'
import { Instagram, Linkedin, Youtube, Facebook, ArrowUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dashboardLoginUrl } from '@/config/tenant'

interface FooterProps {
    copyrightText: string
}

interface LinkItem {
    label: string
    href: string
    external?: boolean
}

// ─── Link columns (match the screenshot) ──────────────────────────────────────

const exploreLinks: LinkItem[] = [
    { label: 'Business Analytics', href: '/programs/business-analytics' },
    { label: 'Data Analytics', href: '/programs/data-analytics' },
    { label: 'Data Science AI/ML', href: '/programs/data-science-ai' },
    { label: 'Full Stack Development', href: '/programs/full-stack' },
    { label: 'Data Engineering', href: '/programs/data-engineering' },
    { label: 'CyberSecurity', href: '/programs/cybersecurity' },
    { label: 'Investment Banking', href: '/programs/investment-banking' },
    { label: 'Product Analytics', href: '/programs/product-analytics' }
]

const resourceLinks: LinkItem[] = [
    { label: 'Blogs', href: '/resources/blogs' },
    { label: 'Tutorials', href: '/resources/tutorials' },
    { label: 'Soft Skills Training', href: '/resources/soft-skills' },
    { label: 'Case Studies', href: '/resources/case-studies' },
    { label: 'Interview Guides', href: '/resources/interview-guides' },
    { label: 'CheatSheet', href: '/resources/cheatsheet' }
]

const companyLinks: LinkItem[] = [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Corporate Training', href: '/contact' },
    { label: 'Student Portal', href: dashboardLoginUrl(), external: true }
]

const legalLinks: LinkItem[] = [
    { label: 'Cancellation and Refund', href: '/policies/refund' },
    { label: 'Examination Policy', href: '/policies/examination' },
    { label: 'Escalation Policy', href: '/policies/escalation' },
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Terms and Conditions', href: '/policies/terms' },
    { label: 'Complaint Forum', href: '/policies/escalation' }
]

const caseStudyShortcuts: LinkItem[] = [
    { label: 'Airbnb Case Study', href: '/resources/case-studies/airbnb' },
    { label: 'H&M Case Study', href: '/resources/case-studies/zara' },
    { label: 'Louis Vuitton Case Study', href: '/resources/case-studies/zara' },
    { label: 'Starbucks Case Study', href: '/resources/case-studies/starbucks' },
    { label: 'Mcdonalds Case Study', href: '/resources/case-studies/mcdonalds' },
    { label: 'Nike Case Study', href: '/resources/case-studies/nike' }
]

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer: React.FC<FooterProps> = ({ copyrightText }) => {
    const navigate = useNavigate()

    const handleClick = (item: LinkItem) => (e: React.MouseEvent) => {
        if (item.external) {
            e.preventDefault()
            window.location.href = item.href
            return
        }
        if (item.href.startsWith('#')) {
            e.preventDefault()
            navigate('/', { state: { scrollTo: item.href.replace('#', '') } })
        } else if (item.href.startsWith('/')) {
            // SPA navigate so we don't trigger a full page reload
            e.preventDefault()
            navigate(item.href)
        }
    }

    const scrollTop = () => {
        const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis
        if (lenis) lenis.scrollTo(0, { duration: 1.4 })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className="relative w-full">
            {/* ── Main panel — dark navy with 5 columns ── */}
            <div
                className="relative w-full"
                style={{ background: '#0a0d1a', color: '#e5e7eb' }}>
                {/* Dot grid */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.06]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.85) 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }}
                />

                {/* Floating back-to-top — replaces the removed top stripe button */}
                <button
                    onClick={scrollTop}
                    aria-label="Back to top"
                    className="absolute top-6 right-6 z-[2] inline-flex items-center justify-center w-11 h-11 rounded-full transition-transform hover:translate-y-[-2px]"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: '#ffffff'
                    }}>
                    <ArrowUp size={16} />
                </button>

                <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 py-16 md:py-20">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-8">
                        {/* Brand column */}
                        <div className="col-span-2 md:col-span-3 lg:col-span-1">
                            <div className="flex items-center gap-3 mb-5">
                                <span
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg"
                                    style={{ background: '#1e40af' }}>
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                        fill="none"
                                        style={{ color: '#fff' }}>
                                        <path
                                            d="M12 3 C 7 7, 5 12, 12 21 C 19 12, 17 7, 12 3 Z"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M12 8 L12 21"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                                <span
                                    className="font-display text-[24px] font-semibold tracking-tight"
                                    style={{ color: '#ffffff' }}>
                                    Albero Academy
                                </span>
                            </div>
                            <h3
                                className="font-display text-[18px] font-semibold mb-3 leading-tight"
                                style={{ color: '#ffffff' }}>
                                Empowering ambitions with real-world learning
                            </h3>
                            <p
                                className="text-[14px] leading-relaxed mb-6 max-w-[280px]"
                                style={{ color: '#94a3b8' }}>
                                Delivering industry-relevant programs designed for career transformation.
                            </p>
                            <div className="flex items-center gap-2.5">
                                {[
                                    { Icon: Instagram, href: '#' },
                                    { Icon: Linkedin, href: '#' },
                                    { Icon: Youtube, href: '#' },
                                    { Icon: Facebook, href: '#' }
                                ].map(({ Icon, href }, i) => (
                                    <a
                                        key={i}
                                        href={href}
                                        aria-label={Icon.displayName ?? 'social'}
                                        className="w-10 h-10 rounded-xl inline-flex items-center justify-center transition-colors"
                                        style={{
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.10)',
                                            color: '#cbd5e1'
                                        }}>
                                        <Icon size={16} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <FooterColumn
                            title="Explore Albero"
                            links={exploreLinks}
                            onItemClick={handleClick}
                        />
                        <FooterColumn
                            title="Resources"
                            links={resourceLinks}
                            onItemClick={handleClick}
                        />
                        <FooterColumn
                            title="Company"
                            links={companyLinks}
                            onItemClick={handleClick}
                        />
                        <FooterColumn
                            title="Legal"
                            links={legalLinks}
                            onItemClick={handleClick}
                        />
                    </div>

                    {/* Case Studies row */}
                    <div
                        className="mt-16 pt-10 border-t"
                        style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <h4
                            className="font-display text-[20px] md:text-[22px] font-semibold mb-6 text-center"
                            style={{ color: '#ffffff' }}>
                            Case Studies
                        </h4>
                        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
                            {caseStudyShortcuts.map((c, i) => (
                                <React.Fragment key={c.label}>
                                    <a
                                        href={c.href}
                                        className="px-3 py-1.5 rounded-md text-[13.5px] font-semibold transition-colors"
                                        style={{ color: '#cbd5e1' }}>
                                        {c.label}
                                    </a>
                                    {i < caseStudyShortcuts.length - 1 && (
                                        <span
                                            aria-hidden="true"
                                            className="select-none"
                                            style={{ color: 'rgba(255,255,255,0.18)' }}>
                                            |
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Bottom strip */}
                    <div
                        className="mt-12 pt-6 border-t text-center"
                        style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <p
                            className="text-[13px]"
                            style={{ color: '#94a3b8' }}>
                            Albero Zetta Edutech Private Limited <span style={{ color: 'rgba(255,255,255,0.18)' }}>|</span> ©{copyrightText}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterColumn({
    title,
    links,
    onItemClick
}: {
    title: string
    links: LinkItem[]
    onItemClick: (item: LinkItem) => (e: React.MouseEvent) => void
}) {
    return (
        <div>
            <div
                className="font-display text-[16px] font-semibold mb-5"
                style={{ color: '#ffffff' }}>
                {title}
            </div>
            <ul className="space-y-3">
                {links.map((l, i) => (
                    <li key={i}>
                        <a
                            href={l.href}
                            onClick={onItemClick(l)}
                            className="text-[14px] transition-colors"
                            style={{ color: '#94a3b8' }}>
                            {l.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Footer
