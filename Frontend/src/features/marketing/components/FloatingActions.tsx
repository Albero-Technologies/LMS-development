// Floating action buttons rendered on every public tenant page —
// back-to-top + WhatsApp chat. Both opt-in via the tenant's
// landing.floatingActions config (or fall back sensibly when unset).
//
// Positioning rules:
//   - Back-to-top sits ABOVE WhatsApp on the same corner (mb offset on
//     WhatsApp accounts for it). When users put them on opposite corners,
//     no offset is applied.
//   - Both stay above the fold via z-50. They never overlap with the
//     hamburger because that lives at the top of the viewport.

import { useEffect, useState } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'
import type { BackToTopConfig, FloatingActionsConfig, WhatsAppFloatConfig } from '@features/admin/services/tenant.service'
import { cn } from '@shared/helpers/cn'

interface Props {
    config: FloatingActionsConfig | undefined
    /** Fallback for whatsapp number from analytics block — keeps backwards
     *  compatibility with tenants that only set analytics.whatsappNumber. */
    analyticsWhatsappNumber?: string
    analyticsWhatsappMessage?: string
}

export const FloatingActions = ({ config, analyticsWhatsappNumber, analyticsWhatsappMessage }: Props) => {
    const back = config?.backToTop ?? {}
    const whatsapp = config?.whatsapp ?? {}

    // Back-to-top: ON by default unless explicitly disabled.
    const showBack = back.enabled !== false
    // WhatsApp: ON if a phone number is resolved (from config or analytics),
    // unless explicitly disabled.
    const phone = (whatsapp.phone ?? analyticsWhatsappNumber ?? '').trim()
    const showWhatsApp = whatsapp.enabled !== false && phone.length > 0

    const sameSide = (back.position ?? 'bottom-right') === (whatsapp.position ?? 'bottom-right')

    return (
        <>
            {showBack && <BackToTopButton config={back} />}
            {showWhatsApp && (
                <WhatsAppButton
                    config={whatsapp}
                    phone={phone}
                    fallbackMessage={analyticsWhatsappMessage}
                    stackedAboveBack={sameSide && showBack}
                />
            )}
        </>
    )
}

// ---- BackToTop -------------------------------------------------------------

const BACK_VARIANT_CLS: Record<NonNullable<BackToTopConfig['variant']>, string> = {
    solid: 'bg-[var(--color-brand-500)] text-white shadow-[0_8px_24px_-6px_rgba(0,98,255,0.45)] hover:bg-[var(--color-brand-600)]',
    outline: 'bg-surface text-[var(--color-brand-600)] border border-[var(--color-brand-500)]/40 hover:bg-[var(--color-brand-50)]',
    dark: 'bg-[#0c1626] text-white shadow-lg hover:bg-[#1a2540]',
    gradient:
        'text-white shadow-[0_8px_24px_-6px_rgba(0,98,255,0.55)] hover:opacity-90 [background:linear-gradient(135deg,var(--color-brand-500),var(--color-brand-700))]'
}

const BackToTopButton = ({ config }: { config: BackToTopConfig }) => {
    const variant = config.variant ?? 'gradient'
    const position = config.position ?? 'bottom-right'
    const threshold = config.showAfter ?? 400
    const label = config.label ?? 'Back to top'

    const [visible, setVisible] = useState(false)
    useEffect(() => {
        // rAF-throttled scroll listener — flips visible past `threshold`.
        let frame = 0
        const onScroll = () => {
            if (frame) return
            frame = window.requestAnimationFrame(() => {
                frame = 0
                setVisible(window.scrollY > threshold)
            })
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (frame) window.cancelAnimationFrame(frame)
        }
    }, [threshold])

    const click = () => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'instant' : 'smooth' })
    }

    return (
        <button
            type="button"
            onClick={click}
            aria-label={label}
            className={cn(
                'fixed z-50 inline-flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300',
                BACK_VARIANT_CLS[variant],
                position === 'bottom-right' ? 'right-5' : 'left-5',
                // Sits above WhatsApp by default — bottom-20 leaves ~5rem
                // of room for the WhatsApp bubble underneath when both
                // share the same corner.
                'bottom-20',
                visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
            )}>
            <ArrowUp size={20} />
        </button>
    )
}

// ---- WhatsApp --------------------------------------------------------------

const WHATSAPP_VARIANT_CLS: Record<NonNullable<WhatsAppFloatConfig['variant']>, string> = {
    classic: 'text-white hover:scale-110 [background:#25D366]',
    brand: 'text-white shadow-lg hover:opacity-95 [background:linear-gradient(135deg,#25D366,#128C7E)]',
    minimal: 'bg-surface text-[#128C7E] border border-[#25D366]/50 hover:bg-[#25D366]/10'
}

const WhatsAppButton = ({
    config,
    phone,
    fallbackMessage,
    stackedAboveBack
}: {
    config: WhatsAppFloatConfig
    phone: string
    fallbackMessage?: string
    stackedAboveBack: boolean
}) => {
    const variant = config.variant ?? 'classic'
    const position = config.position ?? 'bottom-right'
    const pulse = config.pulse !== false
    const label = config.label ?? 'Chat on WhatsApp'
    const message = config.message ?? fallbackMessage ?? ''

    // Build wa.me URL — strip non-digits from the phone, append message if any.
    const digits = phone.replace(/[^0-9]/g, '')
    const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn(
                'fixed z-50 inline-flex items-center justify-center h-14 w-14 rounded-full transition-transform shadow-lg',
                WHATSAPP_VARIANT_CLS[variant],
                position === 'bottom-right' ? 'right-5' : 'left-5',
                // If the back-to-top is on the same corner, sit at the
                // bottom and let it stack above. Otherwise, anchor at 5.
                stackedAboveBack ? 'bottom-5' : 'bottom-5',
                pulse && 'wa-pulse'
            )}>
            <MessageCircle
                size={26}
                fill="currentColor"
            />
        </a>
    )
}
