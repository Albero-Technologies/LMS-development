import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Download, Link2, Check, Mail, Phone, User, X, Play, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { SectionShell, SectionHeading } from './primitives'
import apiClient from '@/lib/apiClient'
import { TENANT_SLUG } from '@/config/tenant'

export interface CurriculumLesson {
    title: string
    durationMinutes?: number
    isFreePreview?: boolean
}

export interface CurriculumSection {
    title: string
    lessons: CurriculumLesson[]
}

interface Props {
    sections: CurriculumSection[]
    /** Backend course slug — needed for the share-link + PDF lead capture. */
    programSlug: string
    /** Pre-uploaded syllabus PDF URL. When omitted, the download button stays
     *  hidden so we don't promise a file we don't have. */
    syllabusPdfUrl?: string
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
    tone?: 'white' | 'soft'
}

// Curriculum accordion. First section is open by default; user can toggle.
// Two utility buttons next to the heading: "Share curriculum" (copy link
// to clipboard pointing at /programs/:slug#curriculum) and "Download
// syllabus" (lead-capture modal → Lead in CRM + PDF email + browser
// download). The accordion auto-expands the first section if the URL
// hash is `#curriculum` so a shared link lands on the open content.
export const CurriculumAccordion = ({
    sections,
    programSlug,
    syllabusPdfUrl,
    heading = (
        <>
            Curriculum, <span className="alb-gradient-text italic font-medium">module by module.</span>
        </>
    ),
    accent,
    description = 'Industry-validated, practice-first, mentor-reviewed every batch.',
    tone = 'white'
}: Props) => {
    const [openIndex, setOpenIndex] = useState<number>(0)
    const [downloadOpen, setDownloadOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    // Honour the hash so /programs/:slug#curriculum opens with the first
    // section expanded. Helpful when the share link is opened in a fresh tab.
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#curriculum') {
            setOpenIndex(0)
            // Defer scroll until the layout settles so we land on the heading.
            requestAnimationFrame(() => {
                document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
        }
    }, [])

    const copyShareLink = async () => {
        const url = `${window.location.origin}/programs/${programSlug}#curriculum`
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success('Link copied to clipboard.')
            setTimeout(() => setCopied(false), 2500)
        } catch {
            toast.error("Couldn't copy. Long-press the URL bar to copy manually.")
        }
    }

    if (sections.length === 0) return null

    return (
        <SectionShell
            tone={tone}
            id="curriculum"
            spacing="normal">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-10">
                <SectionHeading
                    eyebrow="Curriculum"
                    title={heading}
                    accent={accent}
                    description={description}
                    align="left"
                />
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={copyShareLink}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all hover:translate-y-[-1px]"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--hairline)',
                            color: 'var(--text-primary)',
                            boxShadow: 'var(--card-shadow-soft)'
                        }}>
                        {copied ? <Check size={14} /> : <Link2 size={14} />}
                        {copied ? 'Copied' : 'Share curriculum'}
                    </button>
                    {syllabusPdfUrl && (
                        <button
                            type="button"
                            onClick={() => setDownloadOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all hover:translate-y-[-1px]"
                            style={{
                                background: 'var(--brand)',
                                color: 'var(--text-on-inverse)',
                                boxShadow: '0 6px 18px rgba(13,79,60,0.28)'
                            }}>
                            <Download size={14} /> Download syllabus
                        </button>
                    )}
                </div>
            </div>

            <ol className="space-y-3">
                {sections.map((section, i) => (
                    <AccordionRow
                        key={`${section.title}-${i}`}
                        section={section}
                        index={i}
                        open={openIndex === i}
                        onToggle={() => setOpenIndex((cur) => (cur === i ? -1 : i))}
                        programSlug={programSlug}
                    />
                ))}
            </ol>

            <SyllabusDownloadModal
                open={downloadOpen}
                onClose={() => setDownloadOpen(false)}
                programSlug={programSlug}
                syllabusPdfUrl={syllabusPdfUrl}
            />
        </SectionShell>
    )
}

const AccordionRow = ({
    section,
    index,
    open,
    onToggle,
    programSlug
}: {
    section: CurriculumSection
    index: number
    open: boolean
    onToggle: () => void
    programSlug: string
}) => {
    const totalMinutes = section.lessons.reduce((n, l) => n + (l.durationMinutes ?? 0), 0)
    return (
        <li
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: open ? 'var(--card-shadow-soft)' : 'none',
                transition: 'box-shadow 0.3s ease'
            }}>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="w-full flex items-center gap-4 px-5 md:px-6 py-4 md:py-5 text-left"
                style={{ minHeight: 64 }}>
                <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-display text-[14px] font-semibold shrink-0"
                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                    <h3
                        className="font-display text-[16px] md:text-[18px] font-semibold leading-tight"
                        style={{ color: 'var(--text-primary)' }}>
                        {section.title}
                    </h3>
                    <p
                        className="text-[12.5px] mt-0.5"
                        style={{ color: 'var(--text-tertiary)' }}>
                        {section.lessons.length} lesson{section.lessons.length === 1 ? '' : 's'}
                        {totalMinutes > 0 ? ` · ${formatDuration(totalMinutes)}` : ''}
                    </p>
                </div>
                <ChevronDown
                    size={18}
                    className="shrink-0 transition-transform"
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0)',
                        color: 'var(--text-tertiary)'
                    }}
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: 'easeOut' }}
                        style={{ overflow: 'hidden' }}>
                        <ul
                            className="divide-y px-5 md:px-6 pb-4"
                            style={{ borderColor: 'var(--hairline)' }}>
                            {section.lessons.map((lesson, li) => (
                                <LessonRow
                                    key={`${lesson.title}-${li}`}
                                    lesson={lesson}
                                    programSlug={programSlug}
                                />
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    )
}

const LessonRow = ({ lesson, programSlug }: { lesson: CurriculumLesson; programSlug: string }) => {
    const previewUrl = lesson.isFreePreview ? `/programs/${programSlug}#preview-${encodeURIComponent(lesson.title)}` : null
    const Icon = lesson.isFreePreview ? Play : Lock
    return (
        <li className="flex items-center gap-3 py-3">
            <Icon
                size={14}
                className="shrink-0"
                style={{ color: lesson.isFreePreview ? 'var(--brand)' : 'var(--text-tertiary)' }}
            />
            <span
                className="flex-1 min-w-0 text-[13.5px] truncate"
                style={{ color: 'var(--text-secondary)' }}>
                {lesson.title}
            </span>
            {lesson.isFreePreview && (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                    Preview
                </span>
            )}
            {lesson.durationMinutes && lesson.durationMinutes > 0 && (
                <span
                    className="text-[12px] font-mono shrink-0"
                    style={{ color: 'var(--text-tertiary)' }}>
                    {formatDuration(lesson.durationMinutes)}
                </span>
            )}
            {/* Hidden anchor — the curriculum-share landing path navigates here. */}
            {previewUrl && (
                <span
                    id={`preview-${encodeURIComponent(lesson.title)}`}
                    className="hidden"
                    aria-hidden="true"
                />
            )}
        </li>
    )
}

const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m === 0 ? `${h}h` : `${h}h ${m}m`
}

// ──────────────────────────────────────────────────────────────────────
// Syllabus download — lead-capture micro-modal
// ──────────────────────────────────────────────────────────────────────

interface ModalProps {
    open: boolean
    onClose: () => void
    programSlug: string
    syllabusPdfUrl?: string
}

const SyllabusDownloadModal = ({ open, onClose, programSlug, syllabusPdfUrl }: ModalProps) => {
    const [form, setForm] = useState({ name: '', email: '', phone: '' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) setForm({ name: '', email: '', phone: '' })
    }, [open])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.phone) {
            toast.error('Please fill in all the fields.')
            return
        }
        setSubmitting(true)
        try {
            await apiClient.post('/enquiries', {
                tenantSlug: TENANT_SLUG,
                name: form.name,
                email: form.email,
                phone: form.phone,
                course: programSlug,
                message: `Syllabus download request for ${programSlug}`,
                source: 'syllabus-download'
            })
            // Browser download — opens the PDF in a new tab so the user can save.
            if (syllabusPdfUrl) {
                window.open(syllabusPdfUrl, '_blank', 'noopener,noreferrer')
            }
            toast.success('Syllabus on its way to your inbox.')
            onClose()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not send the syllabus right now.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[min(440px,92vw)] rounded-3xl overflow-hidden"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--hairline)',
                            boxShadow: 'var(--card-shadow-hover)'
                        }}>
                        <div className="flex items-center justify-between px-6 pt-5">
                            <div
                                className="text-[11px] tracking-[0.2em] uppercase font-bold"
                                style={{ color: 'var(--brand)' }}>
                                Free syllabus
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="p-1 rounded-full"
                                style={{ color: 'var(--text-tertiary)' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="px-6 pt-1 pb-5">
                            <h3
                                className="font-display text-[20px] md:text-[22px] font-semibold leading-tight"
                                style={{ color: 'var(--text-primary)' }}>
                                Download the full syllabus
                            </h3>
                            <p
                                className="mt-1 text-[13px]"
                                style={{ color: 'var(--text-tertiary)' }}>
                                We'll email it now — and a counsellor will follow up only if you ask.
                            </p>
                        </div>
                        <form
                            onSubmit={submit}
                            className="px-6 pb-6 space-y-3">
                            <ModalField
                                icon={User}
                                placeholder="Full name"
                                value={form.name}
                                onChange={(v) => setForm({ ...form, name: v })}
                            />
                            <ModalField
                                icon={Mail}
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(v) => setForm({ ...form, email: v })}
                            />
                            <ModalField
                                icon={Phone}
                                type="tel"
                                placeholder="Phone (with country code)"
                                value={form.phone}
                                onChange={(v) => setForm({ ...form, phone: v })}
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-1 px-5 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px]"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)',
                                    boxShadow: '0 8px 22px rgba(13,79,60,0.28)',
                                    opacity: submitting ? 0.7 : 1
                                }}>
                                <Download size={15} /> {submitting ? 'Sending…' : 'Send me the syllabus'}
                            </button>
                            <p
                                className="text-[11px] text-center"
                                style={{ color: 'var(--text-tertiary)' }}>
                                We'll never spam. Unsubscribe in one click.
                            </p>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

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
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
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
