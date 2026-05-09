import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BarChart3, Brain, Code2, Database, Download, Mail, Phone, User, X, FileText, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient from '@/lib/apiClient'
import { TENANT_SLUG } from '@/config/tenant'

// Lead-capture modal that fires from the home-page hero "Download
// Curriculum" button. The user picks a track, hands over name/email/phone,
// and we POST an enquiry tagged `source: 'curriculum-download'` so
// counsellors can see it as a hot lead in admin.
//
// Two-step flow on success: form → confirmation card with a fallback
// "Open PDF" anchor in case the email takes a minute to land.

type ProgramKey = 'business-analytics' | 'data-analytics' | 'ai-ml' | 'full-stack'

interface ProgramOption {
    key: ProgramKey
    label: string
    meta: string
    Icon: React.ElementType
    /** Where the brochure PDF lives. Empty string = email-only delivery. */
    pdfUrl?: string
}

const PROGRAMS: ProgramOption[] = [
    { key: 'business-analytics', label: 'Business Analytics', meta: '6 mo · Live', Icon: BarChart3 },
    { key: 'data-analytics', label: 'Data Analytics', meta: '5 mo · Live', Icon: Database },
    { key: 'ai-ml', label: 'AI / ML & GenAI', meta: '9 mo · Flagship', Icon: Brain },
    { key: 'full-stack', label: 'Full-Stack Dev', meta: '7 mo · MERN', Icon: Code2 }
]

interface Props {
    open: boolean
    onClose: () => void
}

export const CurriculumDownloadModal = ({ open, onClose }: Props) => {
    const [program, setProgram] = useState<ProgramKey>('business-analytics')
    const [form, setForm] = useState({ name: '', email: '', phone: '' })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState<{ programKey: ProgramKey; pdfUrl?: string } | null>(null)

    // Reset whenever the modal re-opens so a returning user gets a clean
    // form, not a stale name from a previous session.
    useEffect(() => {
        if (open) {
            setProgram('business-analytics')
            setForm({ name: '', email: '', phone: '' })
            setSuccess(null)
        }
    }, [open])

    // Esc-to-close — modal is fixed-position so the document keydown is
    // the easiest place to attach.
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, onClose])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
            toast.error('Please fill in all the fields.')
            return
        }
        setSubmitting(true)
        try {
            const picked = PROGRAMS.find((p) => p.key === program)!
            await apiClient.post('/enquiries', {
                tenantSlug: TENANT_SLUG,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                course: picked.key,
                message: `Curriculum download request — ${picked.label}`,
                source: 'curriculum-download'
            })
            // Open the brochure PDF in a new tab when one is configured —
            // this is the user-visible confirmation that the click did
            // something tangible. Email follows from the backend pipeline.
            if (picked.pdfUrl) {
                window.open(picked.pdfUrl, '_blank', 'noopener,noreferrer')
            }
            toast.success('Curriculum sent — check your inbox.')
            setSuccess({ programKey: picked.key, pdfUrl: picked.pdfUrl })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not send the curriculum right now.')
        } finally {
            setSubmitting(false)
        }
    }

    const pickedProgram = PROGRAMS.find((p) => p.key === program) ?? PROGRAMS[0]!

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] backdrop-blur-sm"
                        style={{ background: 'rgba(6, 20, 15, 0.7)' }}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="curriculum-modal-title"
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[min(520px,94vw)] max-h-[92vh] overflow-y-auto rounded-3xl"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--hairline)',
                            boxShadow: '0 32px 80px rgba(6,20,15,0.45), 0 0 0 1px rgba(52,211,153,0.08)'
                        }}>
                        {/* Brand stripe — same anchor used by the Industry
                            Toolkit + TechMesh cards, keeps the modal on-brand. */}
                        <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-[3px] rounded-t-3xl"
                            style={{ background: 'var(--gradient-aurora)' }}
                        />

                        {success ? (
                            <SuccessPanel
                                onClose={onClose}
                                pdfUrl={success.pdfUrl}
                                program={pickedProgram}
                            />
                        ) : (
                            <FormPanel
                                onClose={onClose}
                                program={program}
                                onProgram={setProgram}
                                form={form}
                                onForm={setForm}
                                submitting={submitting}
                                onSubmit={submit}
                            />
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

const FormPanel = ({
    onClose,
    program,
    onProgram,
    form,
    onForm,
    submitting,
    onSubmit
}: {
    onClose: () => void
    program: ProgramKey
    onProgram: (k: ProgramKey) => void
    form: { name: string; email: string; phone: string }
    onForm: (f: { name: string; email: string; phone: string }) => void
    submitting: boolean
    onSubmit: (e: React.FormEvent) => void
}) => (
    <>
        <div className="flex items-center justify-between px-6 pt-6">
            <div
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-[0.18em] uppercase"
                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                <FileText size={11} /> Free Curriculum
            </div>
            <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-full transition-colors hover:bg-[var(--surface-2)]"
                style={{ color: 'var(--text-tertiary)' }}>
                <X size={18} />
            </button>
        </div>

        <div className="px-6 pt-3 pb-2">
            <h3
                id="curriculum-modal-title"
                className="font-display text-[22px] md:text-[26px] font-semibold leading-tight tracking-[-0.01em]"
                style={{ color: 'var(--text-primary)' }}>
                Get the full <span className="alb-gradient-text italic font-medium">curriculum.</span>
            </h3>
            <p
                className="mt-1.5 text-[13.5px]"
                style={{ color: 'var(--text-secondary)' }}>
                Pick a track. We'll email a detailed PDF — every module, every project, every tool.
            </p>
        </div>

        <form
            onSubmit={onSubmit}
            className="px-6 pb-6 pt-3 space-y-4">
            {/* Program picker */}
            <div className="grid grid-cols-2 gap-2">
                {PROGRAMS.map((p) => {
                    const selected = program === p.key
                    return (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => onProgram(p.key)}
                            className="text-left rounded-xl p-3 transition-all"
                            style={{
                                background: selected ? 'var(--brand-soft)' : 'var(--surface-2)',
                                border: `1px solid ${selected ? 'var(--brand)' : 'var(--hairline)'}`,
                                color: 'var(--text-primary)'
                            }}>
                            <div className="flex items-start gap-2.5">
                                <span
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        background: selected ? 'var(--brand)' : 'var(--surface)',
                                        color: selected ? 'var(--text-on-inverse)' : 'var(--brand)'
                                    }}>
                                    <p.Icon size={15} />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[12.5px] font-semibold leading-tight">{p.label}</div>
                                    <div
                                        className="mt-0.5 text-[10.5px]"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        {p.meta}
                                    </div>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Contact fields */}
            <div className="space-y-2.5">
                <ModalField
                    icon={User}
                    placeholder="Full name"
                    value={form.name}
                    onChange={(v) => onForm({ ...form, name: v })}
                />
                <ModalField
                    icon={Mail}
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(v) => onForm({ ...form, email: v })}
                />
                <ModalField
                    icon={Phone}
                    type="tel"
                    placeholder="Phone (with country code)"
                    value={form.phone}
                    onChange={(v) => onForm({ ...form, phone: v })}
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full px-5 py-3 rounded-full font-semibold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                    background: 'var(--brand)',
                    color: 'var(--text-on-inverse)',
                    boxShadow: '0 10px 26px rgba(13,79,60,0.32)'
                }}>
                <Download size={15} />
                {submitting ? 'Sending…' : 'Send me the curriculum'}
            </button>

            <div
                className="flex items-center justify-center gap-4 text-[11px]"
                style={{ color: 'var(--text-tertiary)' }}>
                <span className="inline-flex items-center gap-1">
                    <CheckCircle2
                        size={11}
                        style={{ color: 'var(--brand)' }}
                    />
                    No spam, ever
                </span>
                <span style={{ color: 'var(--hairline)' }}>·</span>
                <span className="inline-flex items-center gap-1">
                    <CheckCircle2
                        size={11}
                        style={{ color: 'var(--brand)' }}
                    />
                    Unsubscribe in one click
                </span>
            </div>
        </form>
    </>
)

const SuccessPanel = ({ onClose, pdfUrl, program }: { onClose: () => void; pdfUrl?: string; program: ProgramOption }) => (
    <div className="px-6 pt-8 pb-7 text-center">
        <div
            className="mx-auto mb-4 w-14 h-14 rounded-full inline-flex items-center justify-center"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
            <CheckCircle2 size={26} />
        </div>
        <h3
            className="font-display text-[22px] md:text-[24px] font-semibold leading-tight"
            style={{ color: 'var(--text-primary)' }}>
            Curriculum on its way.
        </h3>
        <p
            className="mt-2 text-[13.5px]"
            style={{ color: 'var(--text-secondary)' }}>
            We've emailed the {program.label} curriculum. A counsellor will follow up only if you ask.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
            {pdfUrl && (
                <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-full font-semibold inline-flex items-center justify-center gap-2"
                    style={{
                        background: 'var(--brand)',
                        color: 'var(--text-on-inverse)',
                        boxShadow: '0 8px 22px rgba(13,79,60,0.28)'
                    }}>
                    <Download size={14} /> Open the PDF
                </a>
            )}
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full font-semibold"
                style={{
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--hairline)'
                }}>
                Close
            </button>
        </div>
    </div>
)

const ModalField = ({
    icon: Icon,
    placeholder,
    type = 'text',
    value,
    onChange
}: {
    icon: React.ElementType
    placeholder: string
    type?: string
    value: string
    onChange: (v: string) => void
}) => (
    <label
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors focus-within:border-[var(--brand)]"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}>
        <Icon
            size={16}
            style={{ color: 'var(--text-tertiary)' }}
        />
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: 'var(--text-primary)' }}
        />
    </label>
)
