import { useState } from 'react'
import { motion } from 'motion/react'
import {
    ArrowUpRight,
    Phone,
    Mail,
    MapPin,
    MessageCircle,
    Linkedin,
    Instagram,
    Youtube,
    Clock,
    CheckCircle2,
    Sparkles,
    Send,
    Loader2
} from 'lucide-react'
import SEO from '@/components/user/common/SEO'
import { useContactForm } from '@/hooks/user/useContactForm'

const contactCards = [
    {
        Icon: Phone,
        label: 'Call us',
        value: '+91 98765 43210',
        sub: 'Mon–Sat, 10 AM – 9 PM IST',
        href: 'tel:+919876543210'
    },
    {
        Icon: Mail,
        label: 'Email us',
        value: 'hello@albero.academy',
        sub: 'Replies within 4 working hours',
        href: 'mailto:hello@albero.academy'
    },
    {
        Icon: MessageCircle,
        label: 'WhatsApp',
        value: '+91 98765 43210',
        sub: 'Fastest way to reach a counsellor',
        href: 'https://wa.me/919876543210'
    },
    {
        Icon: MapPin,
        label: 'Office',
        value: 'Bengaluru, Karnataka',
        sub: 'Indiranagar · By appointment',
        href: '#map'
    }
]

const reasons = [
    'Programme & curriculum questions',
    'Pricing, EMI & scholarships',
    'Corporate / team training',
    'Placement & hiring partnerships',
    'Mentorship enquiries',
    'Press & media'
]

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false)
    const { submitForm, loading } = useContactForm()
    const [form, setForm] = useState({ name: '', email: '', phone: '', course: 'Not sure yet', message: '' })

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const ok = await submitForm({
            name: form.name,
            email: form.email,
            phone: form.phone,
            course: form.course === 'Not sure yet' ? 'General enquiry' : form.course,
            message: form.message
        })
        if (ok) {
            setSubmitted(true)
            setForm({ name: '', email: '', phone: '', course: 'Not sure yet', message: '' })
        }
    }

    return (
        <div>
            <SEO
                title="Contact — Albero Academy"
                description="Talk to a senior Albero counsellor. We'll map your goals to the right programme — and tell you honestly if Albero isn't right for you."
                url="/contact"
                canonical="/contact"
            />

            {/* ── HERO ── */}
            <section
                className="relative overflow-hidden"
                style={{
                    background:
                        'radial-gradient(ellipse at 65% 50%, #0d2740 0%, #061026 60%, #04081a 100%)',
                    color: '#f8f6ee'
                }}>
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.10]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                        maskImage: 'radial-gradient(ellipse 80% 70% at 30% 50%, #000 30%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 30% 50%, #000 30%, transparent 90%)'
                    }}
                />
                <div
                    aria-hidden="true"
                    className="absolute -top-40 right-[-15%] w-[700px] h-[700px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }}
                />

                <div className="relative max-w-[1180px] mx-auto px-5 md:px-8 pt-[140px] pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-[760px]">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="inline-block w-12 h-[2px] rounded-full" style={{ background: '#34d399' }} />
                            <span className="text-[11px] tracking-[0.28em] uppercase font-semibold" style={{ color: '#34d399' }}>
                                Get in touch
                            </span>
                        </div>
                        <h1
                            className="font-display tracking-[-0.02em] mb-5"
                            style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 0.96, color: '#f8f6ee' }}>
                            <span className="font-medium">Talk to a</span>{' '}
                            <span className="italic font-light" style={{ color: '#34d399' }}>
                                senior counsellor.
                            </span>
                        </h1>
                        <p
                            className="text-[16px] md:text-[17px] leading-relaxed max-w-[640px]"
                            style={{ color: 'rgba(248,246,238,0.78)' }}>
                            We'll map your background, goals, and timeline to the right programme — and if Albero
                            isn't right for you, we'll tell you that too. No sales pitch, no commitment.
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px]" style={{ color: 'rgba(248,246,238,0.7)' }}>
                            {['No sales pitch', 'WhatsApp follow-up', 'Reply in 30 min'].map((t) => (
                                <span key={t} className="inline-flex items-center gap-2">
                                    <CheckCircle2 size={14} style={{ color: '#34d399' }} />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Contact cards (overlap into next section) ── */}
            <section className="relative -mt-12 md:-mt-16 px-5 md:px-8 pb-12 md:pb-16">
                <div className="max-w-[1180px] mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {contactCards.map(({ Icon, label, value, sub, href }) => (
                            <motion.a
                                key={label}
                                href={href}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.4 }}
                                whileHover={{ y: -3 }}
                                className="rounded-2xl p-5 md:p-6 block transition-all"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow-hover)'
                                }}>
                                <div
                                    className="w-11 h-11 rounded-xl inline-flex items-center justify-center mb-4"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    <Icon size={20} />
                                </div>
                                <div
                                    className="text-[10.5px] tracking-[0.18em] uppercase font-semibold"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    {label}
                                </div>
                                <div
                                    className="font-display text-[18px] font-semibold mt-1 leading-tight break-all"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {value}
                                </div>
                                <div className="text-[12px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                                    {sub}
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Form + side rail ── */}
            <section
                className="relative py-16 md:py-20 px-5 md:px-8"
                style={{ background: 'var(--page-bg)' }}>
                <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1.3fr_1fr] gap-10">
                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5 }}
                        className="rounded-3xl p-6 md:p-10"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            boxShadow: 'var(--card-shadow)'
                        }}>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            <Sparkles size={12} /> Request a callback
                        </div>
                        <h2
                            className="font-display text-[28px] md:text-[36px] leading-tight tracking-[-0.02em] font-semibold"
                            style={{ color: 'var(--text-primary)' }}>
                            Tell us a bit about you.
                        </h2>
                        <p
                            className="mt-2 text-[14px]"
                            style={{ color: 'var(--text-secondary)' }}>
                            A counsellor will WhatsApp you within 30 minutes between 10 AM – 9 PM IST.
                        </p>

                        {!submitted ? (
                            <form
                                onSubmit={onSubmit}
                                className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="Full name" required>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Aanya Kapoor"
                                        className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{
                                            background: 'var(--surface-2)',
                                            border: '1px solid var(--line)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </Field>
                                <Field label="Email" required>
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="you@email.com"
                                        className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{
                                            background: 'var(--surface-2)',
                                            border: '1px solid var(--line)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </Field>
                                <Field label="WhatsApp number" required>
                                    <input
                                        required
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{
                                            background: 'var(--surface-2)',
                                            border: '1px solid var(--line)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </Field>
                                <Field label="Programme of interest">
                                    <select
                                        value={form.course}
                                        onChange={(e) => setForm({ ...form, course: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{
                                            background: 'var(--surface-2)',
                                            border: '1px solid var(--line)',
                                            color: 'var(--text-primary)'
                                        }}>
                                        <option>Not sure yet</option>
                                        <option>Business Analytics</option>
                                        <option>Data Analytics</option>
                                        <option>Data Science with ML &amp; GenAI</option>
                                        <option>Full Stack Development</option>
                                        <option>Data Engineering</option>
                                        <option>Cybersecurity</option>
                                        <option>Investment Banking</option>
                                        <option>Product Analytics</option>
                                    </select>
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field label="What can we help with?">
                                        <textarea
                                            rows={4}
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="Tell us your background, timeline, and what you're hoping to achieve."
                                            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors resize-none"
                                            style={{
                                                background: 'var(--surface-2)',
                                                border: '1px solid var(--line)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </Field>
                                </div>
                                <div className="sm:col-span-2 flex items-center justify-between gap-4 mt-2">
                                    <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                        By submitting, you agree to our privacy policy. We'll only contact you about programmes.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-5 py-3 rounded-full text-[13.5px] font-bold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px] flex-shrink-0 disabled:opacity-70"
                                        style={{
                                            background: 'var(--brand)',
                                            color: 'var(--text-on-inverse)',
                                            boxShadow: '0 8px 18px rgba(13,79,60,0.30)'
                                        }}>
                                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                        {loading ? 'Sending…' : 'Send message'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-8 text-center py-10">
                                <div
                                    className="w-14 h-14 mx-auto rounded-full inline-flex items-center justify-center mb-4"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    <CheckCircle2 size={26} />
                                </div>
                                <h3
                                    className="font-display text-[24px] font-semibold mb-2"
                                    style={{ color: 'var(--text-primary)' }}>
                                    We'll be in touch shortly.
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    A counsellor will WhatsApp you within 30 minutes between 10 AM – 9 PM IST.
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* Side rail */}
                    <div className="space-y-5">
                        <div
                            className="rounded-3xl p-6"
                            style={{
                                background: 'var(--brand)',
                                color: 'var(--text-on-inverse)'
                            }}>
                            <div
                                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full mb-3 text-[10.5px] font-bold tracking-[0.16em] uppercase"
                                style={{ background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.92)' }}>
                                <Clock size={11} /> Hours
                            </div>
                            <h3 className="font-display text-[20px] leading-tight font-semibold mb-3">
                                When we pick up the phone.
                            </h3>
                            <ul className="space-y-2 text-[13.5px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                <li className="flex items-center justify-between">
                                    <span>Mon – Fri</span>
                                    <span className="font-semibold" style={{ color: '#fff' }}>10 AM – 9 PM</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Saturday</span>
                                    <span className="font-semibold" style={{ color: '#fff' }}>10 AM – 6 PM</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Sunday</span>
                                    <span className="font-semibold" style={{ color: '#fff' }}>WhatsApp only</span>
                                </li>
                            </ul>
                        </div>

                        <div
                            className="rounded-3xl p-6"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow)'
                            }}>
                            <h3
                                className="font-display text-[18px] font-semibold mb-4"
                                style={{ color: 'var(--text-primary)' }}>
                                What learners reach out about.
                            </h3>
                            <ul className="space-y-2.5">
                                {reasons.map((r) => (
                                    <li
                                        key={r}
                                        className="flex items-start gap-2.5 text-[13px]"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        <CheckCircle2
                                            size={14}
                                            className="flex-shrink-0 mt-0.5"
                                            style={{ color: 'var(--brand)' }}
                                        />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div
                            className="rounded-3xl p-6"
                            style={{
                                background: 'var(--surface-2)',
                                border: '1px solid var(--line)'
                            }}>
                            <h3
                                className="font-display text-[18px] font-semibold mb-4"
                                style={{ color: 'var(--text-primary)' }}>
                                Follow Albero.
                            </h3>
                            <div className="flex items-center gap-2.5">
                                {[
                                    { Icon: Instagram, href: '#' },
                                    { Icon: Linkedin, href: '#' },
                                    { Icon: Youtube, href: '#' }
                                ].map(({ Icon, href }, i) => (
                                    <a
                                        key={i}
                                        href={href}
                                        aria-label="Social"
                                        className="w-10 h-10 rounded-xl inline-flex items-center justify-center transition-colors"
                                        style={{
                                            background: 'var(--surface)',
                                            border: '1px solid var(--line)',
                                            color: 'var(--text-primary)'
                                        }}>
                                        <Icon size={16} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Map placeholder ── */}
            <section
                id="map"
                className="relative px-5 md:px-8 pb-20"
                style={{ background: 'var(--page-bg)' }}>
                <div className="max-w-[1180px] mx-auto">
                    <div
                        className="rounded-3xl overflow-hidden relative"
                        style={{
                            background: 'var(--surface-2)',
                            border: '1px solid var(--line)',
                            height: 360
                        }}>
                        <div
                            aria-hidden="true"
                            className="absolute inset-0"
                            style={{
                                backgroundImage:
                                    'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                                opacity: 0.6
                            }}
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <div
                                className="w-14 h-14 mx-auto rounded-full inline-flex items-center justify-center mb-3"
                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)', boxShadow: '0 14px 28px rgba(13,79,60,0.25)' }}>
                                <MapPin size={22} />
                            </div>
                            <div
                                className="font-display text-[20px] font-semibold"
                                style={{ color: 'var(--text-primary)' }}>
                                Albero Academy · Indiranagar
                            </div>
                            <div className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                100ft Road, Bengaluru 560038 · India
                            </div>
                            <a
                                href="https://maps.google.com/?q=Indiranagar+Bengaluru"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-semibold"
                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                Open in Google Maps <ArrowUpRight size={13} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block">
            <span
                className="block text-[11.5px] tracking-[0.16em] uppercase font-semibold mb-2"
                style={{ color: 'var(--text-tertiary)' }}>
                {label}
                {required && <span style={{ color: 'var(--accent)' }}> *</span>}
            </span>
            {children}
        </label>
    )
}
