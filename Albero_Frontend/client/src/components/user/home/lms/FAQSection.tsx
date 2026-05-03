import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'

const faqs = [
    {
        q: 'Are Albero programs really co-certified by IBM and Microsoft?',
        a: 'Yes. Our flagship Data Science, Data Analytics, Data Engineering, and Business Analytics tracks include co-branded credentials — IBM SkillsBuild badges (verifiable on Credly) and Microsoft Certified pathways (PL-300 / DA-100 / AI-900). The curriculum is reviewed annually by IBM and Microsoft hiring teams against the rubric they use internally.'
    },
    {
        q: 'What do I get with the IBM SkillsBuild credential?',
        a: 'A co-branded IBM badge on your Credly profile + 1 IBM exam voucher + free IBM Cloud credits during the program. The badge is the same one IBM, Cognizant, EY, and 40+ partner firms filter on when shortlisting candidates — it gets you read 3× faster.'
    },
    {
        q: 'How does the Microsoft certification work?',
        a: 'You get a Microsoft Learn pathway integrated into your cohort, $200 in Azure credits to use on your capstone, a Power BI Pro licence, and 1 free Microsoft exam attempt (PL-300, DA-100, or AI-900 depending on your track). The Microsoft Certified: Data Analyst Associate is the highest-paying entry-level analytics credential in India today.'
    },
    {
        q: 'Do I need a coding background to enroll?',
        a: 'No. Our Business Analytics, Data Analytics and Full-Stack tracks are beginner-friendly. We recommend the Data Science with ML & GenAI program for learners with at least 6 months of Python experience.'
    },
    {
        q: 'How are classes scheduled?',
        a: 'Live cohort classes run 3–4 times a week (typically Mon/Wed/Fri evenings 8–10 PM IST). Recordings are uploaded within 12 hours and are watchable at 1.5×. We hand-pick batches by timezone and seniority.'
    },
    {
        q: 'What is included in 1:1 mentorship?',
        a: 'Weekly 30-minute calls with a senior practitioner. The agenda is yours: career strategy, project critiques, code reviews, mock interviews, salary negotiation. Your mentor stays the same throughout the program.'
    },
    {
        q: 'How does placement assistance work?',
        a: 'After your career sprint, we open referrals through 180+ hiring partners, run weekly mock interviews, audit your GitHub & LinkedIn, and stay with you until you land an offer. There is no time-bound cut-off — we keep going.'
    },
    {
        q: 'What if I miss a live session?',
        a: "Recordings are posted within 12 hours, with searchable transcripts and code links. You can also drop questions in the cohort Slack — mentors and TAs respond on the same day."
    },
    {
        q: 'Is there an EMI option? What about refunds?',
        a: 'Every plan offers no-cost EMI with our finance partners (₹4,000–₹14,500 per month). Career Pro also offers an Income-Share Agreement. Full refund within 7 days of enrollment if you change your mind.'
    },
    {
        q: 'Will I get an industry-recognised certificate?',
        a: "Yes — three of them, depending on your track. (1) A verifiable Albero certificate signed by your mentor and a hiring partner. (2) For data tracks: an IBM SkillsBuild badge on Credly. (3) For BI/analytics tracks: a Microsoft Certified pathway with a free exam voucher. Every credential has a unique ID employers can verify on our platform."
    }
]

export default function FAQSection() {
    const [open, setOpen] = useState<number | null>(0)

    return (
        <section
            className="relative py-24 px-5 md:px-8"
            style={{ background: 'var(--page-bg-soft)', color: 'var(--text-primary)' }}>
            <div className="max-w-[1080px] mx-auto">
                <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16">
                    <div className="lg:sticky lg:top-32 self-start">
                        <div
                            className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
                            style={{ color: 'var(--brand)' }}>
                            Questions, answered
                        </div>
                        <h2
                            className="font-display text-[40px] md:text-[54px] leading-[0.98] tracking-[-0.02em] font-medium"
                            style={{ color: 'var(--text-primary)' }}>
                            Still on the{' '}
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                fence?
                            </span>
                        </h2>
                        <p
                            className="mt-4 text-[15px] leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}>
                            We've collected the seven questions every prospective learner asks before enrolling. Don't see yours? Email{' '}
                            <a href="mailto:support@alberoacademy.com" style={{ color: 'var(--brand)' }} className="underline">
                                support@alberoacademy.com
                            </a>{' '}
                            — we reply within 4 hours.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((f, i) => {
                            const isOpen = open === i
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.04 }}
                                    className="rounded-2xl overflow-hidden"
                                    style={{
                                        background: 'var(--surface)',
                                        border: `1px solid ${isOpen ? 'var(--brand)' : 'var(--line)'}`,
                                        boxShadow: isOpen ? 'var(--card-shadow)' : 'none'
                                    }}>
                                    <button
                                        onClick={() => setOpen(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between gap-4 p-5 text-left">
                                        <span
                                            className="font-display text-[17px] md:text-[18px] font-semibold leading-tight"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {f.q}
                                        </span>
                                        <span
                                            className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full transition-transform"
                                            style={{
                                                background: isOpen ? 'var(--brand)' : 'var(--surface-2)',
                                                color: isOpen ? 'var(--text-on-inverse)' : 'var(--text-primary)',
                                                transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                                            }}>
                                            <Plus size={16} />
                                        </span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                key="content"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                                className="overflow-hidden">
                                                <p
                                                    className="px-5 pb-5 text-[14.5px] leading-relaxed"
                                                    style={{ color: 'var(--text-secondary)' }}>
                                                    {f.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
