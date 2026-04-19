import { youtubeEmbedUrl } from '../helpers/youtube'
import { cn } from '@shared/helpers/cn'

type Props = {
    videoId: string
    title?: string
    autoplay?: boolean
    className?: string
}

export const YouTubePlayer = ({ videoId, title = 'Lesson video', autoplay = false, className }: Props) => (
    <div className={cn('relative w-full aspect-video bg-black rounded-md overflow-hidden', className)}>
        <iframe
            src={youtubeEmbedUrl(videoId, { autoplay })}
            title={title}
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
        />
    </div>
)
