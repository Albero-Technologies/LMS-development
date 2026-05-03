import { motion } from 'motion/react'
import { Building2 } from 'lucide-react'

// We use simpleicons.org's CDN to render real brand logos as actual images at
// runtime. Each entry's `slug` matches its simple-icons identifier and we keep
// a brand colour for the optional hover wash.
type Partner = { name: string; slug: string; color: string }

const row1: Partner[] = [
    { name: 'Microsoft', slug: 'microsoft', color: '#0078D4' },
    { name: 'Amazon', slug: 'amazon', color: '#FF9900' },
    { name: 'Google', slug: 'google', color: '#4285F4' },
    { name: 'Adobe', slug: 'adobe', color: '#FF0000' },
    { name: 'Razorpay', slug: 'razorpay', color: '#0C2451' },
    { name: 'Flipkart', slug: 'flipkart', color: '#2874F0' },
    { name: 'Swiggy', slug: 'swiggy', color: '#FC8019' },
    { name: 'Walmart', slug: 'walmart', color: '#0071CE' },
    { name: 'Deloitte', slug: 'deloitte', color: '#86BC25' },
    { name: 'PwC', slug: 'pwc', color: '#D04A02' },
    { name: 'IBM', slug: 'ibm', color: '#0530AD' },
    { name: 'Accenture', slug: 'accenture', color: '#A100FF' }
]

const row2: Partner[] = [
    { name: 'Zomato', slug: 'zomato', color: '#E23744' },
    { name: 'Paytm', slug: 'paytm', color: '#00BAF2' },
    { name: 'PhonePe', slug: 'phonepe', color: '#5F259F' },
    { name: 'Uber', slug: 'uber', color: '#000000' },
    { name: 'Meta', slug: 'meta', color: '#0866FF' },
    { name: 'Netflix', slug: 'netflix', color: '#E50914' },
    { name: 'Salesforce', slug: 'salesforce', color: '#00A1E0' },
    { name: 'Airbnb', slug: 'airbnb', color: '#FF5A5F' },
    { name: 'Spotify', slug: 'spotify', color: '#1DB954' },
    { name: 'Infosys', slug: 'infosys', color: '#007CC3' },
    { name: 'TCS', slug: 'tcs', color: '#1B72B8' },
    { name: 'Wipro', slug: 'wipro', color: '#341C53' }
]

function LogoTile({ p }: { p: Partner }) {
    return (
        <div
            className="group relative flex-shrink-0 w-[200px] h-[100px] rounded-2xl flex items-center justify-center mx-2 overflow-hidden"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                boxShadow: '0 1px 0 rgba(10,14,31,0.04), 0 6px 14px rgba(10,14,31,0.05)'
            }}>
            <span
                aria-hidden="true"
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300"
                style={{ background: p.color }}
            />
            <div className="relative flex items-center gap-3 px-4">
                <img
                    src={`https://cdn.simpleicons.org/${p.slug}/${p.color.replace('#', '')}`}
                    alt={p.name}
                    width={28}
                    height={28}
                    loading="lazy"
                    className="flex-shrink-0"
                    style={{ filter: 'saturate(1.05)' }}
                    onError={(e) => {
                        // Graceful fallback to a coloured letter mark if the
                        // CDN ever fails to resolve a slug.
                        const img = e.currentTarget
                        const fallback = document.createElement('span')
                        fallback.textContent = p.name.charAt(0)
                        fallback.className = 'inline-flex items-center justify-center w-7 h-7 rounded-md font-display font-bold text-[13px]'
                        fallback.setAttribute('style', `background:${p.color};color:#fff`)
                        img.replaceWith(fallback)
                    }}
                />
                <span
                    className="font-display text-[15px] font-semibold tracking-tight whitespace-nowrap"
                    style={{ color: 'var(--text-primary)' }}>
                    {p.name}
                </span>
            </div>
        </div>
    )
}

function MarqueeRow({ items, reverse = false, duration = 50 }: { items: Partner[]; reverse?: boolean; duration?: number }) {
    return (
        <div
            className="relative overflow-hidden"
            style={{
                maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
                WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)'
            }}>
            <div
                className="flex"
                style={{
                    animation: `alb-marquee ${duration}s linear infinite`,
                    animationDirection: reverse ? 'reverse' : 'normal',
                    width: 'max-content'
                }}>
                {[...items, ...items].map((p, i) => (
                    <LogoTile key={p.name + i} p={p} />
                ))}
            </div>
        </div>
    )
}

export default function HiringPartners() {
    return (
        <section
            className="relative py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <div className="max-w-[1280px] mx-auto">
                <div className="text-center max-w-[760px] mx-auto mb-12">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <Building2 size={12} /> Hiring partners
                    </div>
                    <h2
                        className="font-display text-[40px] md:text-[58px] leading-[0.96] tracking-[-0.02em] font-medium"
                        style={{ color: 'var(--text-primary)' }}>
                        Where our learners{' '}
                        <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                            get hired.
                        </span>
                    </h2>
                    <p
                        className="mt-4 text-[15.5px] leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}>
                        Active hiring relationships with 180+ teams across product, BFSI, consulting, and big tech.
                        Mentor referrals route directly into hiring-manager inboxes.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4">
                    <MarqueeRow items={row1} duration={55} />
                    <MarqueeRow items={row2} duration={65} reverse />
                </motion.div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
                    {['Product', 'BFSI', 'Consulting', 'Big Tech', 'Startups', 'D2C', 'Consulting', 'Edtech'].map((c) => (
                        <span
                            key={c}
                            className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                color: 'var(--text-secondary)'
                            }}>
                            {c}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}
