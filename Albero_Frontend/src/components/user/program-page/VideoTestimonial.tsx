import { useState } from 'react'
import { Play } from 'lucide-react'
import { SectionShell, SectionHeading } from './primitives'

interface Props {
    /** YouTube embed ID — e.g. dQw4w9WgXcQ. */
    youtubeId: string
    /** Optional poster image — falls back to YouTube's hqdefault when omitted. */
    posterUrl?: string
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
    caption?: string
}

// Lazy-load the iframe — start as a play-button poster so the YouTube
// player + cookies don't load until the user actually clicks. Saves
// ~500KB on the initial page weight.
export const VideoTestimonial = ({
    youtubeId,
    posterUrl,
    heading = (
        <>
            See real student <span className="alb-gradient-text italic font-medium">transformations.</span>
        </>
    ),
    accent,
    description = 'From beginner to dream role in months — straight from our alumni.',
    caption = 'See real student transformations · From beginner to dream role in months.'
}: Props) => {
    const [playing, setPlaying] = useState(false)
    const poster = posterUrl ?? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    return (
        <SectionShell tone="white" spacing="normal">
            <SectionHeading eyebrow="Hear it from them" title={heading} accent={accent} description={description} />
            <div
                className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden"
                style={{
                    background: 'var(--section-deep)',
                    border: '1px solid var(--hairline)',
                    boxShadow: 'var(--card-shadow-hover)'
                }}>
                <div className="relative aspect-video">
                    {playing ? (
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                            title="Student transformation"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setPlaying(true)}
                            aria-label="Play student testimonial video"
                            className="absolute inset-0 group">
                            <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{
                                    background: 'var(--gradient-aurora)',
                                    boxShadow: '0 14px 38px rgba(91,63,214,0.45)'
                                }}>
                                <Play size={28} fill="#fff" stroke="#fff" />
                            </div>
                        </button>
                    )}
                </div>
                {caption && (
                    <div className="px-5 md:px-6 py-4 text-center text-[12.5px] md:text-[13.5px]" style={{ color: 'rgba(245,243,234,0.85)' }}>
                        {caption}
                    </div>
                )}
            </div>
        </SectionShell>
    )
}
