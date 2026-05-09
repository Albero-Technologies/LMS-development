export default function Loader() {
    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <style>{`
                @keyframes alb-leaf-grow { 0% { transform: scale(0.6) rotate(-12deg); opacity: 0.3; } 50% { transform: scale(1.05) rotate(-2deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
                @keyframes alb-shimmer { 0% { background-position: -120% 0; } 100% { background-position: 220% 0; } }
                @keyframes alb-bar-fill { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
                @keyframes alb-dot-pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
            `}</style>

            {/* Brand mark */}
            <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{
                    background: 'var(--brand)',
                    color: 'var(--text-on-inverse)',
                    animation: 'alb-leaf-grow 0.9s cubic-bezier(0.4,0,0.2,1) 0.05s both, alb-leaf-grow 3.6s ease-in-out 1s infinite'
                }}>
                <svg
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    fill="none">
                    <path
                        d="M12 3 C 7 7, 5 12, 12 21 C 19 12, 17 7, 12 3 Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 8 L12 21"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Wordmark with shimmer */}
            <div
                className="font-display text-[28px] md:text-[34px] leading-none tracking-[-0.01em] font-semibold mb-3 relative inline-block"
                style={{
                    color: 'var(--text-primary)'
                }}>
                <span className="relative inline-block">
                    Albero
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.85) 50%, transparent 75%)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'alb-shimmer 2.2s linear infinite',
                            mixBlendMode: 'overlay'
                        }}>
                        Albero
                    </span>
                </span>
                <span
                    className="ml-1 text-[12px] tracking-[0.32em] uppercase font-medium align-middle"
                    style={{ color: 'var(--text-tertiary)' }}>
                    ACADEMY
                </span>
            </div>

            <div
                className="text-[12.5px] tracking-[0.18em] uppercase mb-7"
                style={{ color: 'var(--text-tertiary)' }}>
                Preparing your learning space
            </div>

            {/* Progress bar */}
            <div
                className="relative w-[220px] h-[4px] rounded-full overflow-hidden mb-5"
                style={{ background: 'var(--line)' }}>
                <div
                    className="absolute inset-y-0 left-0 w-1/2 rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, transparent, var(--brand), transparent)',
                        animation: 'alb-bar-fill 1.6s cubic-bezier(0.4,0,0.2,1) infinite alternate'
                    }}
                />
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                            background: 'var(--brand)',
                            animation: `alb-dot-pulse 1.2s ease-in-out ${i * 0.18}s infinite`
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
