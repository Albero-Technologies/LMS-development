import { motion } from 'motion/react'
import { Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react'
import type { ReactNode } from 'react'

interface PolicyLayoutProps {
    eyebrow: string
    title: string
    intro?: string
    effective?: string
    updated?: string
    children: ReactNode
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="mb-10">
            <h2
                className="font-display text-[22px] md:text-[26px] font-semibold mb-4 flex items-baseline gap-3"
                style={{ color: 'var(--text-primary)' }}>
                <span
                    className="w-1 h-6 rounded-full inline-block"
                    style={{ background: 'var(--brand)' }}
                />
                {title}
            </h2>
            <div
                className="leading-relaxed space-y-3 text-[15px] policy-content pl-4"
                style={{ color: 'var(--text-secondary)' }}>
                {children}
            </div>
        </motion.div>
    )
}

export function Bullets({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2 my-3">
            {items.map((item, i) => (
                <li
                    key={i}
                    className="flex items-start gap-3">
                    <span
                        className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--brand)' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </li>
            ))}
        </ul>
    )
}

// Theme-aware table for policy pages. The previous tables used `text-white/65`
// which was invisible against the light cream policy cards.
export function PolicyTable({ headers, rows }: { headers: [string, string]; rows: [string, string][] }) {
    return (
        <div
            className="overflow-hidden rounded-xl my-3"
            style={{ border: '1px solid var(--line)' }}>
            <table className="w-full text-[14px]">
                <thead>
                    <tr style={{ background: 'var(--brand-soft)' }}>
                        <th
                            className="text-left px-4 py-3 font-semibold"
                            style={{ color: 'var(--brand)' }}>
                            {headers[0]}
                        </th>
                        <th
                            className="text-left px-4 py-3 font-semibold"
                            style={{ color: 'var(--brand)' }}>
                            {headers[1]}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([col1, col2], i) => (
                        <tr
                            key={i}
                            style={{
                                borderTop: '1px solid var(--line)',
                                background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)'
                            }}>
                            <td
                                className="px-4 py-3 font-semibold"
                                style={{ color: 'var(--text-primary)' }}>
                                {col1}
                            </td>
                            <td
                                className="px-4 py-3"
                                style={{ color: 'var(--text-secondary)' }}>
                                {col2}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default function PolicyLayout({ eyebrow, title, intro, effective, updated, children }: PolicyLayoutProps) {
    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Soft brand wash */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full"
                style={{
                    top: -200,
                    left: '20%',
                    width: 540,
                    height: 540,
                    background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)',
                    filter: 'blur(40px)'
                }}
            />

            {/* Hero */}
            <section className="relative pt-[140px] pb-12 px-5 md:px-8">
                <div
                    className="absolute inset-x-0 top-0 h-[400px] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                        opacity: 0.45,
                        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)'
                    }}
                />

                <div className="max-w-[920px] mx-auto relative z-[1]">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}>
                        <div
                            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full mb-6 text-[12px] font-semibold tracking-tight"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: 'var(--brand)' }}
                            />
                            {eyebrow}
                        </div>

                        <h1
                            className="font-display text-[40px] md:text-[56px] lg:text-[64px] leading-[0.98] tracking-[-0.02em] mb-5"
                            style={{ color: 'var(--text-primary)' }}>
                            {title}
                        </h1>

                        {intro && (
                            <p
                                className="text-[16px] md:text-[17px] leading-relaxed max-w-[720px] mb-6"
                                style={{ color: 'var(--text-secondary)' }}>
                                {intro}
                            </p>
                        )}

                        {(effective || updated) && (
                            <div
                                className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]"
                                style={{ color: 'var(--text-tertiary)' }}>
                                {effective && (
                                    <div className="flex items-center gap-2">
                                        <Calendar
                                            size={14}
                                            style={{ color: 'var(--brand)' }}
                                        />
                                        <span>Effective: {effective}</span>
                                    </div>
                                )}
                                {updated && (
                                    <div className="flex items-center gap-2">
                                        <Clock
                                            size={14}
                                            style={{ color: 'var(--brand)' }}
                                        />
                                        <span>Last updated: {updated}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Body */}
            <section className="relative px-5 md:px-8 pb-20">
                <div className="max-w-[920px] mx-auto relative z-[1]">
                    <div
                        className="rounded-3xl p-7 md:p-12"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            boxShadow: 'var(--card-shadow)'
                        }}>
                        {children}

                        {/* Contact card */}
                        <div
                            className="mt-12 rounded-2xl p-6 md:p-7"
                            style={{
                                background: 'var(--surface-2)',
                                border: '1px solid var(--line)'
                            }}>
                            <h3
                                className="font-display text-[20px] font-semibold mb-4"
                                style={{ color: 'var(--text-primary)' }}>
                                Need help? Contact us
                            </h3>
                            <div className="grid sm:grid-cols-3 gap-4 text-[14px]">
                                <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                                    <Mail
                                        size={16}
                                        style={{ color: 'var(--brand)' }}
                                        className="flex-shrink-0"
                                    />
                                    <span className="break-all">support@alberoacademy.com</span>
                                </div>
                                <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                                    <Phone
                                        size={16}
                                        style={{ color: 'var(--brand)' }}
                                        className="flex-shrink-0"
                                    />
                                    <span>+91-XXXXXXXXXX</span>
                                </div>
                                <div className="flex items-start gap-3" style={{ color: 'var(--text-secondary)' }}>
                                    <MapPin
                                        size={16}
                                        style={{ color: 'var(--brand)' }}
                                        className="flex-shrink-0 mt-0.5"
                                    />
                                    <span>Albero Academy Pvt. Ltd., Noida, UP, India</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
