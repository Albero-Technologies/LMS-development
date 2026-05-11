import ResourceLayout from '@/components/user/resources/ResourceLayout'
import { Users, Clock, GraduationCap, PlayCircle, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { listSessions } from '@/constants/soft-skill-content'
import { useCollection } from '@/hooks/useContent'
import SEO from '@/components/user/common/SEO'
import StructuredData from '@/components/user/common/StructuredData'
import { softSkillsHubSEO } from '@/constants/seo'

const audiences = [
    { label: 'Students', sub: 'Build foundations early' },
    { label: 'Fresh Graduates', sub: 'Stand out at interviews' },
    { label: 'Working Professionals', sub: 'Level up to senior' }
]

const DEFAULT_GRADIENT = 'linear-gradient(135deg,#0d4f3c,#34d399)'

export default function SoftSkills() {
    const navigate = useNavigate()
    const fallback = listSessions()
    const cmsQuery = useCollection('soft-skills')

    // Backend-published soft-skill rows lead. Card shape uses the same
    // fields as the static `listSessions()` array so the grid renders
    // uniformly. `Icon` defaults to PlayCircle (the page's video metaphor)
    // since the CMS schema doesn't capture an icon choice.
    const cmsSessions = (cmsQuery.data?.items ?? []).map((it) => {
        const data = it.data as { title?: string; tagline?: string; duration?: string; level?: string; keyOutcomes?: string }
        const outcomes = String(data.keyOutcomes ?? '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        return {
            slug: it.slug,
            title: String(data.title ?? it.slug),
            tagline: String(data.tagline ?? ''),
            description: '',
            duration: String(data.duration ?? '—'),
            level: String(data.level ?? 'Intermediate'),
            audience: ['Working Professionals'],
            tags: [],
            Icon: PlayCircle,
            coverGradient: DEFAULT_GRADIENT,
            keyOutcomes: outcomes
        }
    })
    const cmsSlugs = new Set(cmsSessions.map((c) => c.slug))
    const all = [...cmsSessions, ...fallback.filter((s) => !cmsSlugs.has(s.slug))]
    const featured = all.slice(0, 2)
    const rest = all.slice(2)

    return (
        <>
            <SEO
                title={softSkillsHubSEO.title}
                description={softSkillsHubSEO.description}
                keywords={softSkillsHubSEO.keywords}
                url={softSkillsHubSEO.url}
                canonical={softSkillsHubSEO.canonical}
                image={softSkillsHubSEO.image}
                type={softSkillsHubSEO.type}
            />
            <StructuredData page="softSkills" />
            <ResourceLayout
                eyebrow="Soft Skills Training"
                title="Master the skills that"
                highlight="set you apart"
                description="Boost your communication, confidence, and workplace readiness with industry-driven soft skills training designed to help you stand out and succeed."
                icon={Users}
                stats={[
                    { value: `${all.length}+`, label: 'Sessions' },
                    { value: '1000+', label: 'Learners' },
                    { value: 'Free', label: 'Always' }
                ]}>
                {/* Audiences */}
                <div className="mb-14">
                    <div className="text-center mb-7">
                        <span
                            className="text-[11px] font-semibold tracking-[0.22em] uppercase"
                            style={{ color: 'var(--text-tertiary)' }}>
                            Perfect for
                        </span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {audiences.map((a, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="px-6 py-3 rounded-full"
                                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                                <div
                                    className="text-[14px] font-semibold"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {a.label}
                                </div>
                                <div
                                    className="text-[11px] mt-0.5"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    {a.sub}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Featured video tiles */}
                <div className="mb-14">
                    <h2
                        className="font-display text-[28px] md:text-[36px] font-medium tracking-[-0.02em] mb-2 text-center"
                        style={{ color: 'var(--text-primary)' }}>
                        Latest sessions
                    </h2>
                    <p
                        className="text-center mb-9"
                        style={{ color: 'var(--text-secondary)' }}>
                        Click any card to read the full session.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {featured.map((t, i) => {
                            const TIcon = t.Icon
                            return (
                                <motion.button
                                    key={t.slug}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.08 }}
                                    onClick={() => navigate(`/resources/soft-skills/${t.slug}`)}
                                    whileHover={{ y: -4 }}
                                    className="group text-left rounded-2xl overflow-hidden cursor-pointer transition-all"
                                    style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--line)',
                                        boxShadow: 'var(--card-shadow)'
                                    }}>
                                    <div
                                        className="aspect-video relative flex items-center justify-center"
                                        style={{ background: t.coverGradient }}>
                                        <span
                                            className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase"
                                            style={{ background: '#fff', color: '#000' }}>
                                            Free
                                        </span>
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <PlayCircle
                                                size={32}
                                                style={{ color: '#0a0e1f' }}
                                            />
                                        </div>
                                        <TIcon
                                            size={36}
                                            className="absolute top-4 right-4 text-white/30"
                                        />
                                        <span
                                            className="absolute bottom-4 left-4 right-4 font-display text-[26px] md:text-[34px] font-extrabold tracking-tight text-center italic"
                                            style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                                            {t.title}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <h3
                                            className="font-display text-[19px] font-semibold mb-1"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {t.title}
                                        </h3>
                                        <p
                                            className="text-[14px] mb-3"
                                            style={{ color: 'var(--text-secondary)' }}>
                                            {t.tagline}
                                        </p>
                                        <div
                                            className="flex items-center justify-between text-[12px] pt-3 border-t"
                                            style={{ borderColor: 'var(--line)', color: 'var(--text-tertiary)' }}>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock size={11} /> {t.duration}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <GraduationCap size={11} /> {t.level}
                                            </span>
                                        </div>
                                    </div>
                                </motion.button>
                            )
                        })}
                    </div>

                    {/* All sessions grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {rest.map((s, i) => {
                            const SIcon = s.Icon
                            return (
                                <motion.button
                                    key={s.slug}
                                    initial={{ opacity: 0, y: 14 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => navigate(`/resources/soft-skills/${s.slug}`)}
                                    whileHover={{ y: -4 }}
                                    className="text-left rounded-2xl p-6 transition-all"
                                    style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--line)',
                                        boxShadow: 'var(--card-shadow)'
                                    }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                            <SIcon size={20} />
                                        </div>
                                        <span
                                            className="px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-[0.12em] uppercase"
                                            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                            Free
                                        </span>
                                    </div>
                                    <h3
                                        className="font-display text-[18px] font-semibold mb-2 leading-tight"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {s.title}
                                    </h3>
                                    <p
                                        className="text-[13.5px] leading-relaxed mb-5 line-clamp-3"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {s.tagline}
                                    </p>
                                    <div
                                        className="flex items-center justify-between pt-3 border-t"
                                        style={{ borderColor: 'var(--line)' }}>
                                        <span
                                            className="text-[11.5px] inline-flex items-center gap-1.5"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            <Clock size={11} /> {s.duration}
                                        </span>
                                        <ArrowUpRight
                                            size={14}
                                            style={{ color: 'var(--brand)' }}
                                        />
                                    </div>
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            </ResourceLayout>
        </>
    )
}
