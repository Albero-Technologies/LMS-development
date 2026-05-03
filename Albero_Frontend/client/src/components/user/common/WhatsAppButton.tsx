import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Bottom-RIGHT floating chat widget. Used to be a plain WhatsApp deeplink;
 * now it opens a small in-page chatbot that can answer common questions.
 *
 * Behaviour:
 *  - Closed: the green WhatsApp circle pulses. Hovering shows a tooltip.
 *  - Open: a chat panel slides in. The bot greets, then offers quick-reply
 *    buttons for common questions.
 *  - On click: a "thinking" state plays for ~900ms with a cute animated
 *    emote (eyes blink, three bouncing dots), then the answer appears.
 *  - "Talk to a real human" deeplinks into WhatsApp with a prefilled note.
 */

const PHONE = '+918081718102'
const PREFILL = encodeURIComponent("Hi Albero — the chatbot couldn't answer my question. Can someone help?")

type Sender = 'bot' | 'user'
type Msg = { id: number; sender: Sender; text: string; cta?: { label: string; href?: string; to?: string } }

type Faq = { q: string; a: string; cta?: { label: string; href?: string; to?: string } }

const FAQS: Faq[] = [
    {
        q: '📚 What programs do you offer?',
        a: 'We run 8 career-grade programs — Business Analytics, Data Analytics, Data Science with ML & GenAI (flagship), Full-Stack Development, Data Engineering, Cybersecurity, Investment Banking, and Product Analytics. Each one is co-designed with hiring managers.',
        cta: { label: 'See all programs', to: '/pricing' }
    },
    {
        q: '💰 How much do the programs cost?',
        a: 'Programs range from ₹30,000 (Self-Paced) to ₹1,45,000 (Career Pro). Mentor-Led — the most chosen — sits between ₹60,000 and ₹95,000 depending on the track. No hidden fees, ever.',
        cta: { label: 'Open the pricing page', to: '/pricing' }
    },
    {
        q: '💳 Is there an EMI option?',
        a: 'Yes — 0% EMI for up to 18 months on every plan, plus a 7-day refund guarantee. ISA available for Career Pro.',
        cta: { label: 'Talk to an advisor', to: '/contact' }
    },
    {
        q: '🎯 What about placement?',
        a: '92% placement rate within 6 months of graduation. We have active hiring relationships with 180+ teams (Microsoft, Razorpay, Flipkart, PwC, Deloitte, IBM, and more) and our placement sprint runs until you have an offer in hand.',
        cta: { label: 'Where learners get hired', to: '/' }
    },
    {
        q: '👩‍🏫 Who are the mentors?',
        a: 'Working practitioners — Senior Data Scientists at Microsoft, Engineering Managers at Razorpay, Lead Analysts at Deloitte, Staff ML Engineers at Walmart Labs, and more. Every mentor is a working hire-er, not a professor.',
        cta: { label: 'Meet your mentors', to: '/' }
    },
    {
        q: '🎓 Do you offer certifications?',
        a: 'Three of them, depending on your track. (1) A verifiable Albero certificate signed by your mentor + a hiring partner. (2) For data tracks: an IBM SkillsBuild badge on Credly. (3) For BI/analytics: a Microsoft Certified pathway with a free exam voucher.',
        cta: { label: 'See the certifications', to: '/' }
    },
    {
        q: '🚀 How do I enroll?',
        a: 'Pick a program and a plan, then book a 15-minute counsellor call. We will map your background to the right batch and walk you through enrollment.',
        cta: { label: 'Book a free call', to: '/contact' }
    },
    {
        q: '↩️ Can I get a refund?',
        a: 'Yes — full refund within 7 days of enrollment, no questions asked.',
        cta: { label: 'See the refund policy', to: '/policies/refund' }
    }
]

let msgId = 0
const nextId = () => ++msgId

export default function WhatsAppButton() {
    const [open, setOpen] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [thinking, setThinking] = useState(false)
    const [showQuickReplies, setShowQuickReplies] = useState(true)
    const [messages, setMessages] = useState<Msg[]>([
        {
            id: nextId(),
            sender: 'bot',
            text: "Hi! 👋 I'm Albi, the Albero assistant. Pick a question below — or chat with a real human on WhatsApp."
        }
    ])
    const scrollRef = useRef<HTMLDivElement | null>(null)

    // Auto-scroll to the bottom whenever messages change
    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [messages, thinking])

    const ask = (faq: Faq) => {
        if (thinking) return
        // Push user message immediately
        setMessages((prev) => [...prev, { id: nextId(), sender: 'user', text: faq.q }])
        setShowQuickReplies(false)
        setThinking(true)
        // Simulate the bot "looking it up" then answer
        window.setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: nextId(), sender: 'bot', text: faq.a, cta: faq.cta }
            ])
            setThinking(false)
            // Re-show the quick replies a moment later so the user can ask
            // something else.
            window.setTimeout(() => setShowQuickReplies(true), 300)
        }, 950)
    }

    const realChatHref = `https://wa.me/${PHONE.replace('+', '')}?text=${PREFILL}`

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            {/* ── Closed: pill button + tooltip ── */}
            {!open && (
                <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                    <div
                        className="absolute right-[68px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 pointer-events-none"
                        style={{
                            background: 'var(--wa-tooltip-bg)',
                            color: 'var(--wa-tooltip-fg)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                            opacity: hovered ? 1 : 0,
                            transform: `translateY(-50%) translateX(${hovered ? '0' : '8px'})`
                        }}>
                        Ask Albi — instant answers
                        <span
                            aria-hidden="true"
                            className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0"
                            style={{
                                borderTop: '6px solid transparent',
                                borderBottom: '6px solid transparent',
                                borderLeft: '6px solid var(--wa-tooltip-bg)'
                            }}
                        />
                    </div>

                    <button
                        onClick={() => setOpen(true)}
                        aria-label="Open chat with Albi"
                        className="group relative inline-flex items-center justify-center w-[56px] h-[56px] rounded-full transition-transform hover:translate-y-[-2px]"
                        style={{
                            background: 'var(--wa-bg)',
                            color: 'var(--wa-fg)',
                            border: '1px solid var(--wa-border)',
                            boxShadow: 'var(--wa-shadow)'
                        }}>
                        <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                                background: 'var(--wa-bg)',
                                opacity: 0.55,
                                animation: 'wa-ping 2.6s cubic-bezier(0, 0, 0.2, 1) infinite'
                            }}
                        />
                        <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                                background: 'var(--wa-bg)',
                                opacity: 0.45,
                                animation: 'wa-ping 2.6s cubic-bezier(0, 0, 0.2, 1) 0.9s infinite'
                            }}
                        />
                        {/* WhatsApp glyph */}
                        <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" className="relative z-[1]">
                            <path d="M16.001 5.333c-5.892 0-10.667 4.776-10.667 10.667 0 1.882.494 3.726 1.434 5.353L5.333 26.667l5.488-1.408a10.617 10.617 0 0 0 5.18 1.341h.005c5.89 0 10.661-4.776 10.661-10.667 0-2.847-1.108-5.523-3.123-7.534a10.59 10.59 0 0 0-7.543-3.066zm0 19.467h-.004a8.85 8.85 0 0 1-4.512-1.235l-.323-.192-3.258.836.87-3.176-.211-.336a8.846 8.846 0 0 1-1.355-4.696c0-4.892 3.985-8.872 8.873-8.872 2.371 0 4.6.924 6.276 2.602a8.802 8.802 0 0 1 2.598 6.275c-.002 4.892-3.987 8.794-8.954 8.794zm4.864-6.595c-.267-.134-1.575-.776-1.819-.866-.244-.09-.422-.133-.6.135-.176.265-.687.866-.842 1.044-.155.178-.31.2-.578.067-.267-.134-1.126-.415-2.146-1.323-.793-.708-1.328-1.583-1.484-1.85-.155-.267-.017-.412.117-.545.12-.12.267-.31.4-.466.134-.155.178-.265.267-.443.089-.178.044-.334-.022-.467-.067-.134-.6-1.443-.823-1.978-.217-.518-.44-.448-.6-.456-.156-.008-.334-.01-.512-.01a.989.989 0 0 0-.711.334c-.244.267-.933.911-.933 2.222s.956 2.578 1.089 2.755c.134.178 1.882 2.876 4.561 4.034.638.275 1.135.44 1.523.563.64.203 1.222.174 1.682.106.514-.077 1.575-.643 1.797-1.265.222-.622.222-1.155.155-1.265-.067-.111-.244-.178-.51-.312z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* ── Open: chat panel ── */}
            {open && (
                <div
                    role="dialog"
                    aria-label="Albi chat"
                    className="alb-chat-pop w-[340px] sm:w-[380px] rounded-3xl overflow-hidden flex flex-col"
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        boxShadow: '0 24px 48px rgba(10,14,31,0.25)',
                        height: 540,
                        maxHeight: 'calc(100vh - 120px)'
                    }}>
                    {/* Header */}
                    <div
                        className="flex items-center gap-3 px-4 py-3"
                        style={{ background: '#0d4f3c', color: '#fff' }}>
                        <Albi state="happy" size={36} />
                        <div className="flex-1 min-w-0 leading-tight">
                            <div className="font-display text-[15px] font-semibold">
                                Albi
                                <span
                                    className="ml-2 inline-block w-1.5 h-1.5 rounded-full align-middle"
                                    style={{ background: '#34d399', boxShadow: '0 0 0 3px rgba(52,211,153,0.20)' }}
                                />
                                <span className="ml-1 text-[10.5px] font-normal opacity-80">online</span>
                            </div>
                            <div className="text-[11.5px] opacity-80">
                                Albero assistant · replies in seconds
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors"
                            style={{
                                background: 'rgba(255,255,255,0.12)',
                                color: '#fff'
                            }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Message list — `data-lenis-prevent` opts this scroll
                        container out of Lenis' wheel-event hijack so the chat
                        scrolls independently of the page. `overscroll-contain`
                        also stops scroll-chain into the page when we hit the
                        edge. */}
                    <div
                        ref={scrollRef}
                        data-lenis-prevent
                        className="flex-1 overflow-y-auto px-3 py-4 space-y-3 overscroll-contain"
                        style={{
                            background:
                                'repeating-linear-gradient(45deg, var(--surface-2) 0 1px, transparent 1px 14px), var(--surface-2)'
                        }}>
                        {messages.map((m) => (
                            <Bubble key={m.id} m={m} onClose={() => setOpen(false)} />
                        ))}

                        {thinking && (
                            <div className="flex items-end gap-2 alb-chat-msg-in">
                                <Albi state="thinking" size={28} />
                                <div
                                    className="rounded-2xl rounded-bl-sm px-4 py-3 inline-flex items-center gap-1"
                                    style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--line)'
                                    }}>
                                    <span className="alb-chat-dot" style={{ background: 'var(--brand)', animationDelay: '0s' }} />
                                    <span className="alb-chat-dot" style={{ background: 'var(--brand)', animationDelay: '0.18s' }} />
                                    <span className="alb-chat-dot" style={{ background: 'var(--brand)', animationDelay: '0.36s' }} />
                                </div>
                            </div>
                        )}

                        {/* Quick-reply chips */}
                        {showQuickReplies && !thinking && (
                            <div className="alb-chat-msg-in mt-1">
                                <div
                                    className="text-[10.5px] tracking-[0.16em] uppercase font-semibold mb-2 px-1"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    Quick replies
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {FAQS.map((f) => (
                                        <button
                                            key={f.q}
                                            onClick={() => ask(f)}
                                            className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors text-left"
                                            style={{
                                                background: 'var(--surface)',
                                                color: 'var(--text-primary)',
                                                border: '1px solid var(--brand-soft)'
                                            }}>
                                            {f.q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        className="px-3 py-2.5 flex items-center justify-between gap-2"
                        style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
                        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                            Need a human?
                        </span>
                        <a
                            href={realChatHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold transition-transform hover:translate-y-[-1px]"
                            style={{ background: 'var(--wa-bg)', color: '#fff' }}>
                            <svg viewBox="0 0 32 32" width="13" height="13" fill="currentColor">
                                <path d="M16.001 5.333c-5.892 0-10.667 4.776-10.667 10.667 0 1.882.494 3.726 1.434 5.353L5.333 26.667l5.488-1.408a10.617 10.617 0 0 0 5.18 1.341h.005c5.89 0 10.661-4.776 10.661-10.667 0-2.847-1.108-5.523-3.123-7.534a10.59 10.59 0 0 0-7.543-3.066z" />
                            </svg>
                            Open WhatsApp
                        </a>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes wa-ping {
                    0%   { transform: scale(1);   opacity: 0.55; }
                    80%  { transform: scale(1.6); opacity: 0;    }
                    100% { transform: scale(1.6); opacity: 0;    }
                }
                @keyframes alb-chat-pop {
                    0%   { transform: translateY(12px) scale(0.96); opacity: 0; }
                    100% { transform: translateY(0)    scale(1);    opacity: 1; }
                }
                .alb-chat-pop { animation: alb-chat-pop 240ms cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: bottom right; }
                @keyframes alb-chat-msg-in {
                    0%   { transform: translateY(6px); opacity: 0; }
                    100% { transform: translateY(0);   opacity: 1; }
                }
                .alb-chat-msg-in { animation: alb-chat-msg-in 280ms ease-out; }
                @keyframes alb-chat-dots {
                    0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
                    40%           { transform: translateY(-4px); opacity: 1;   }
                }
                .alb-chat-dot {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 999px;
                    animation: alb-chat-dots 1.1s infinite ease-in-out both;
                }

                /* ─── Albi the cute leaf-bot ─── */
                @keyframes alb-blink {
                    0%, 92%, 100% { transform: scaleY(1);   }
                    96%           { transform: scaleY(0.1); }
                }
                @keyframes alb-bob {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-2px); }
                }
                @keyframes alb-thinking-bob {
                    0%, 100% { transform: translateY(0) rotate(-2deg); }
                    50%      { transform: translateY(-3px) rotate(2deg); }
                }
            `}</style>
        </div>
    )
}

// ─── Chat bubble ─────────────────────────────────────────────────────────────
function Bubble({ m, onClose }: { m: Msg; onClose: () => void }) {
    const navigate = useNavigate()
    const isBot = m.sender === 'bot'
    return (
        <div className={`flex items-end gap-2 alb-chat-msg-in ${isBot ? '' : 'flex-row-reverse'}`}>
            {isBot && <Albi state="happy" size={28} />}
            <div
                className={`rounded-2xl px-4 py-2.5 max-w-[78%] text-[13.5px] leading-snug ${isBot ? 'rounded-bl-sm' : 'rounded-br-sm'}`}
                style={
                    isBot
                        ? { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--line)' }
                        : { background: '#0d4f3c', color: '#fff' }
                }>
                {m.text}
                {m.cta && (
                    <div className="mt-2">
                        {m.cta.to ? (
                            <button
                                onClick={() => {
                                    navigate(m.cta!.to!)
                                    onClose()
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                {m.cta.label} →
                            </button>
                        ) : (
                            <a
                                href={m.cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                {m.cta.label} →
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Albi — a cute leaf mascot with two facial states ────────────────────────
//   happy    — wide eyes, small smile, gentle bob
//   thinking — eyes closed (dashes), tiny bob with a slight tilt
function Albi({ state, size }: { state: 'happy' | 'thinking'; size: number }) {
    const isThinking = state === 'thinking'
    const animation = isThinking
        ? 'alb-thinking-bob 1.4s ease-in-out infinite'
        : 'alb-bob 3.2s ease-in-out infinite'
    return (
        <div
            aria-hidden="true"
            className="flex-shrink-0"
            style={{ width: size, height: size, animation, transformOrigin: 'center bottom' }}>
            <svg viewBox="0 0 36 36" width={size} height={size}>
                {/* Leaf-shaped head */}
                <defs>
                    <linearGradient id="albi-leaf" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2f8f6c" />
                        <stop offset="100%" stopColor="#0d4f3c" />
                    </linearGradient>
                </defs>
                <path
                    d="M18 2 C 8 8, 4 16, 18 32 C 32 16, 28 8, 18 2 Z"
                    fill="url(#albi-leaf)"
                    stroke="#0a3a2c"
                    strokeWidth="1"
                />
                {/* Centre vein */}
                <path d="M18 8 L18 30" stroke="rgba(255,255,255,0.20)" strokeWidth="1" strokeLinecap="round" />

                {/* Cheeks */}
                <circle cx="11.5" cy="20.5" r="1.4" fill="rgba(255,140,140,0.75)" />
                <circle cx="24.5" cy="20.5" r="1.4" fill="rgba(255,140,140,0.75)" />

                {/* Eyes */}
                {isThinking ? (
                    // Closed eyes (smiling arcs) for the thinking pose
                    <g stroke="#f5f3ea" strokeWidth="1.4" strokeLinecap="round" fill="none">
                        <path d="M12 17 q 1.5 -1.4 3 0" />
                        <path d="M21 17 q 1.5 -1.4 3 0" />
                    </g>
                ) : (
                    <g
                        fill="#f5f3ea"
                        style={{
                            transformOrigin: 'center 17px',
                            animation: 'alb-blink 4.2s infinite'
                        }}>
                        <circle cx="13.5" cy="17" r="1.6" />
                        <circle cx="22.5" cy="17" r="1.6" />
                        {/* tiny pupil sparkle */}
                        <circle cx="13.9" cy="16.6" r="0.5" fill="#0a3a2c" />
                        <circle cx="22.9" cy="16.6" r="0.5" fill="#0a3a2c" />
                    </g>
                )}

                {/* Mouth */}
                {isThinking ? (
                    <circle cx="18" cy="22.5" r="0.9" fill="#f5f3ea" />
                ) : (
                    <path
                        d="M15 22 q 3 2.4 6 0"
                        fill="none"
                        stroke="#f5f3ea"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                    />
                )}
            </svg>
        </div>
    )
}
