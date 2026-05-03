import { motion } from 'motion/react'
import { Star } from 'lucide-react'

const stories = [
    {
        before: 'Hospitality · 0 years in tech',
        after: 'Data Analyst · Razorpay',
        quote:
            'I came in barely knowing what an SQL JOIN was. Seven months later I had three offers. The mentor 1:1s and project reviews were the unlock — they made the work feel real.',
        name: 'Aanya Kapoor',
        program: 'Data Analytics',
        salary: '₹12 LPA',
        accent: 'oklch(0.623 0.214 259.815)'
    },
    {
        before: 'B.Com graduate · No coding background',
        after: 'Business Analyst · Deloitte',
        quote:
            'The case-study driven curriculum is different from anything I tried online. I could speak the language of the business in my interviews because I had practised it weekly.',
        name: 'Vikram Iyer',
        program: 'Business Analytics',
        salary: '₹9 LPA',
        accent: 'oklch(0.795 0.184 86.047)'
    },
    {
        before: 'Service-co engineer · Stuck',
        after: 'AI Engineer · Adobe',
        quote:
            'I built and shipped two LLM-powered apps during the program. The capstone reviewer at Albero literally referred me. That referral is what got my profile read.',
        name: 'Shreya Bansal',
        program: 'Data Science with AI',
        salary: '₹26 LPA',
        accent: 'oklch(0.627 0.265 303.9)'
    }
]

export default function LearnerStories() {
    return (
        <section
            className="relative py-24 px-5 md:px-8"
            style={{ background: 'var(--page-bg-soft)', color: 'var(--text-primary)' }}>
            <div className="max-w-[1280px] mx-auto">
                <div className="text-center max-w-[760px] mx-auto mb-14">
                    <div
                        className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
                        style={{ color: 'var(--brand)' }}>
                        Learner stories
                    </div>
                    <h2
                        className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium"
                        style={{ color: 'var(--text-primary)' }}>
                        Real career changes,{' '}
                        <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                            measured in offers.
                        </span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    {stories.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: i * 0.06 }}
                            className="rounded-3xl p-7 md:p-8 flex flex-col"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow)'
                            }}>
                            {/* Before / After strip */}
                            <div
                                className="flex flex-col gap-2 pb-5 mb-5 border-b"
                                style={{ borderColor: 'var(--line)' }}>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-[10px] tracking-[0.16em] uppercase font-semibold w-12"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        Before
                                    </span>
                                    <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                                        {s.before}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-[10px] tracking-[0.16em] uppercase font-semibold w-12"
                                        style={{ color: 'var(--brand)' }}>
                                        After
                                    </span>
                                    <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {s.after}
                                    </span>
                                </div>
                            </div>

                            {/* Stars */}
                            <div
                                className="flex items-center gap-1 mb-3"
                                style={{ color: 'var(--accent)' }}>
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <Star
                                        key={j}
                                        size={14}
                                        fill="currentColor"
                                    />
                                ))}
                            </div>

                            <p
                                className="font-display text-[18px] leading-snug italic font-medium mb-6 flex-1"
                                style={{ color: 'var(--text-primary)' }}>
                                "{s.quote}"
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full inline-flex items-center justify-center font-semibold text-[13px]"
                                        style={{ background: s.accent, color: '#fff' }}>
                                        {s.name
                                            .split(' ')
                                            .map((p) => p[0])
                                            .join('')}
                                    </div>
                                    <div className="leading-tight">
                                        <div
                                            className="text-[13px] font-semibold"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {s.name}
                                        </div>
                                        <div
                                            className="text-[11.5px]"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            {s.program}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-tight"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    {s.salary}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
