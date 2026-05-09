import { Linkedin } from 'lucide-react'
import { SectionShell, SectionHeading } from './primitives'

export interface Mentor {
    id: string
    name: string
    role: string
    company: string
    photoUrl?: string
    companyLogoUrl?: string
    bio?: string
    yearsExperience?: number
    linkedinUrl?: string
}

interface Props {
    mentors: Mentor[]
    /** Override the eyebrow / title / description if needed. */
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
    /** "10+ Mentors · 50+ Yrs Experience · Top 1% Talent" stats below heading. */
    stats?: { label: string; value: string }[]
    tone?: 'white' | 'soft'
}

// Horizontal scroll on mobile (snap-scroll), 4-col grid on desktop.
// Designed to slot in just after the curriculum section on every program
// page, and as the home-page mentor strip.
export const MentorStrip = ({
    mentors,
    heading = (
        <>
            Learn from the best in <span className="alb-gradient-text italic font-medium">industry.</span>
        </>
    ),
    accent,
    description = 'Mentors who hire — practitioners from MAANG, fintech, and unicorns. They review your code, sit on your mocks, and refer you when you ship.',
    stats,
    tone = 'white'
}: Props) => {
    if (mentors.length === 0) return null
    return (
        <SectionShell tone={tone} spacing="normal">
            <SectionHeading eyebrow="Mentors & Instructors" title={heading} accent={accent} description={description} />
            {stats && stats.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-10">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <div className="font-display text-[22px] font-semibold leading-none" style={{ color: 'var(--brand)' }}>
                                {s.value}
                            </div>
                            <div className="mt-1 text-[10px] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex md:grid md:grid-cols-4 gap-5 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2">
                {mentors.map((m) => (
                    <MentorCard key={m.id} mentor={m} />
                ))}
            </div>
        </SectionShell>
    )
}

const MentorCard = ({ mentor }: { mentor: Mentor }) => {
    const initials = mentor.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    return (
        <article
            className="snap-start shrink-0 w-[80%] sm:w-[60%] md:w-auto rounded-2xl overflow-hidden transition-all hover:translate-y-[-4px]"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)'
            }}>
            <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--gradient-aurora)' }}>
                {mentor.photoUrl ? (
                    <img src={mentor.photoUrl} alt={mentor.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-[64px] font-semibold text-white/95">{initials}</span>
                    </div>
                )}
                {mentor.companyLogoUrl && (
                    <div
                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white flex items-center justify-center"
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <img src={mentor.companyLogoUrl} alt={mentor.company} className="w-5 h-5 object-contain" />
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-display text-[15.5px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {mentor.name}
                </h3>
                <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
                    {mentor.role} · {mentor.company}
                </p>
                {mentor.bio && (
                    <p className="mt-2 text-[12.5px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {mentor.bio}
                    </p>
                )}
                <div className="mt-3 pt-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--hairline)' }}>
                    {mentor.yearsExperience && (
                        <span className="text-[11px] font-semibold" style={{ color: 'var(--brand)' }}>
                            {mentor.yearsExperience}+ yrs
                        </span>
                    )}
                    {mentor.linkedinUrl && (
                        <a
                            href={mentor.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${mentor.name} on LinkedIn`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:scale-105"
                            style={{ background: 'var(--section-soft)', color: '#0a66c2' }}>
                            <Linkedin size={13} />
                        </a>
                    )}
                </div>
            </div>
        </article>
    )
}
