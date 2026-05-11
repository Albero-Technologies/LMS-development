import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, CheckCircle2, Loader2, Phone } from 'lucide-react'
import { useMagnet } from '@/hooks/useInteractive'
import { sendLeadForm } from '@/services/contactService'
import { showError } from '@/lib/toast'

export default function FinalCTA() {
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', phone: '', course: 'Not sure yet' })
    const submitRef = useMagnet<HTMLButtonElement>({ strength: 14 })

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        try {
            await sendLeadForm({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                course: form.course === 'Not sure yet' ? 'General enquiry' : form.course,
                surface: 'callback-final-cta'
            })
            setSubmitted(true)
        } catch (err) {
            const message =
                typeof err === 'object' && err !== null && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined
            showError(message || 'Could not request callback — please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section
            id="contact"
            className="relative py-24 px-5 md:px-8"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <div className="max-w-[1180px] mx-auto">
                <div
                    className="rounded-[28px] p-8 md:p-14 lg:p-16 relative overflow-hidden"
                    style={{
                        background: 'radial-gradient(ellipse at 75% 30%, #0d2740 0%, #061026 55%, #04081a 100%)',
                        color: '#f8f6ee',
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                    {/* Background art */}
                    <div
                        aria-hidden="true"
                        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)', filter: 'blur(50px)' }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 70%)', filter: 'blur(60px)' }}
                    />
                    {/* dot grid */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none opacity-[0.10]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                            maskImage: 'linear-gradient(to bottom, transparent, #000, transparent)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000, transparent)'
                        }}
                    />

                    <div className="relative z-[1] grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-5">
                                <span
                                    className="inline-block w-10 h-[2px] rounded-full"
                                    style={{ background: '#34d399' }}
                                />
                                <span
                                    className="text-[11px] font-semibold tracking-[0.22em] uppercase"
                                    style={{ color: '#34d399' }}>
                                    Talk to a counsellor
                                </span>
                            </div>
                            <h2 className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium">
                                Not sure which program{' '}
                                <span
                                    className="italic font-light"
                                    style={{ color: '#fbbf24' }}>
                                    fits you?
                                </span>
                            </h2>
                            <p
                                className="mt-5 text-[16px] md:text-[17px] max-w-[520px] leading-relaxed"
                                style={{ color: 'rgba(248,246,238,0.75)' }}>
                                Get on a 15-minute call with a senior counsellor. We'll map your background, goals, and timeline to the right track —
                                and if Albero isn't right for you, we'll tell you that too.
                            </p>

                            <div
                                className="mt-7 flex flex-wrap items-center gap-4 text-[13.5px]"
                                style={{ color: 'rgba(248,246,238,0.82)' }}>
                                {['No sales pitch', 'No commitment', 'WhatsApp follow-up'].map((t, i) => (
                                    <div
                                        key={i}
                                        className="inline-flex items-center gap-2">
                                        <CheckCircle2
                                            size={15}
                                            style={{ color: '#34d399' }}
                                        />
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lead form */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="rounded-2xl p-6 md:p-7"
                            style={{ background: 'var(--surface)', color: 'var(--text-primary)', boxShadow: 'var(--card-shadow-hover)' }}>
                            {!submitted ? (
                                <form
                                    onSubmit={onSubmit}
                                    className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone
                                            size={16}
                                            style={{ color: 'var(--brand)' }}
                                        />
                                        <span
                                            className="font-display text-[18px] font-semibold"
                                            style={{ color: 'var(--text-primary)' }}>
                                            Request a call back
                                        </span>
                                    </div>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Full name"
                                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                    />
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="Email"
                                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                    />
                                    <input
                                        required
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="WhatsApp number"
                                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                    />
                                    <select
                                        value={form.course}
                                        onChange={(e) => setForm({ ...form, course: e.target.value })}
                                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}>
                                        <option value="Not sure yet">Program of interest</option>
                                        <option value="Business Analytics">Business Analytics</option>
                                        <option value="Data Analytics">Data Analytics</option>
                                        <option value="Data Science with ML & GenAI">Data Science with ML &amp; GenAI</option>
                                        <option value="Full Stack Development">Full Stack Development</option>
                                        <option value="Not sure yet">Not sure yet</option>
                                    </select>
                                    <button
                                        ref={submitRef}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-full py-3 text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                        style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                        {loading ? (
                                            <>
                                                <Loader2
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                                Booking…
                                            </>
                                        ) : (
                                            <>
                                                Book my callback <ArrowUpRight size={14} />
                                            </>
                                        )}
                                    </button>
                                    <p
                                        className="text-[11px] mt-1 text-center"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        We'll only use your number to call you about programs.
                                    </p>
                                </form>
                            ) : (
                                <div className="text-center py-6">
                                    <div
                                        className="w-14 h-14 mx-auto rounded-full inline-flex items-center justify-center mb-4"
                                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                        <CheckCircle2 size={26} />
                                    </div>
                                    <h3
                                        className="font-display text-[22px] font-semibold mb-2"
                                        style={{ color: 'var(--text-primary)' }}>
                                        We'll be in touch shortly.
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        A counsellor will WhatsApp you within 30 minutes between 10 AM – 9 PM IST.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
