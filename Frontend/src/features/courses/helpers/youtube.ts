// Small helpers for working with YouTube URLs.
// Supports youtu.be/*, youtube.com/watch?v=*, youtube.com/embed/*, youtube.com/shorts/*.

const YT_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'])

export const parseYouTubeId = (raw: string): string | null => {
    if (!raw) return null
    const trimmed = raw.trim()

    // Bare 11-char IDs pass through.
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

    try {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
        if (!YT_HOSTS.has(url.hostname)) return null

        if (url.hostname === 'youtu.be') {
            const id = url.pathname.slice(1).split('/')[0]
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
        }

        // youtube.com/watch?v=ID
        const v = url.searchParams.get('v')
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v

        // youtube.com/embed/ID or /shorts/ID
        const m = url.pathname.match(/\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/)
        return m ? m[1] : null
    } catch {
        return null
    }
}

export const youtubeEmbedUrl = (id: string, opts: { autoplay?: boolean; start?: number } = {}): string => {
    const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1'
    })
    if (opts.autoplay) params.set('autoplay', '1')
    if (opts.start && opts.start > 0) params.set('start', String(opts.start))
    return `https://www.youtube.com/embed/${id}?${params.toString()}`
}

export const youtubeThumbUrl = (id: string): string => `https://img.youtube.com/vi/${id}/hqdefault.jpg`
