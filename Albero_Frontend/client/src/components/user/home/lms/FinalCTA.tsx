import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, CheckCircle2, Phone } from 'lucide-react'
import { useMagnet } from '@/hooks/useInteractive'

export default function FinalCTA() {
    const [submitted, setSubmitted] = useState(false)
    const submitRef = useMagnet<HTMLButtonElement>({ strength: 14 })

    return (
        <section
            id="contact"
            className="relative py-24 px-5 md:px-8"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <div className="max-w-[1180px] mx-auto">
                <div
                    className="rounded-[28px] p-8 md:p-14 lg:p-16 relative overflow-hidden"
                    style={{
                        background: 'var(--brand)',
                        color: 'var(--text-on-inverse)'
                    }}>
                    {/* Background art */}
                    <div
                        aria-hidden="true"
                        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.32, filter: 'blur(50px)' }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', opacity: 0.12, filter: 'blur(60px)' }}
                    />
                    {/* dot grid */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none opacity-[0.18]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                            maskImage: 'linear-gradient(to bottom, transparent, #000, transparent)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000, transparent)'
                        }}
                    />

                    <div className="relative z-[1] grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
                        <div>
                            <div
                                className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
                                style={{ color: 'var(--accent)' }}>
                                Talk to a counsellor
                            </div>
                            <h2
                                className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium">
                                Not sure which program{' '}
                                <span className="italic font-light" style={{ color: 'var(--accent)' }}>
                                    fits you?
                                </span>
                            </h2>
                            <p
                                className="mt-5 text-[16px] md:text-[17px] max-w-[520px] leading-relaxed"
                                style={{ color: 'rgba(255,255,255,0.78)' }}>
                                Get on a 15-minute call with a senior counsellor. We'll map your background, goals, and timeline to the right
                                track — and if Albero isn't right for you, we'll tell you that too.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-4 text-[13.5px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                {['No sales pitch', 'No commitment', 'WhatsApp follow-up'].map((t, i) => (
                                    <div key={i} className="inline-flex items-center gap-2">
                                        <CheckCircle2 size={15} style={{ color: 'var(--accent)' }} />
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
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        setSubmitted(true)
                                    }}
                                    className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone size={16} style={{ color: 'var(--brand)' }} />
                                        <span
                                            className="font-display text-[18px] font-semibold"
                                            style={{ color: 'var(--text-primary)' }}>
                                            Request a call back
                                        </span>
                                    </div>
                                    <input
                                        required
                                        placeholder="Full name"
                                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                    />
                                    <input
                                        required
                                        type="email"
                                        placeholder="Email"
                                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                    />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="WhatsApp number"
                                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                    />
                                    <select
                                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}>
                                        <option>Program of interest</option>
                                        <option>Business Analytics</option>
                                        <option>Data Analytics</option>
                                        <option>Data Science with ML &amp; GenAI</option>
                                        <option>Full Stack Development</option>
                                        <option>Not sure yet</option>
                                    </select>
                                    <button
                                        ref={submitRef}
                                        type="submit"
                                        className="w-full rounded-full py-3 text-[14px] font-semibold inline-flex items-center justify-center gap-1.5"
                                        style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                        Book my callback <ArrowUpRight size={14} />
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
