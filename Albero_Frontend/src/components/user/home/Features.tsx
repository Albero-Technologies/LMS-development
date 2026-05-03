import { Shield, Users } from 'lucide-react'
import { featuresData } from '@/constants/features'

// ─── Component ────────────────────────────────────────────────────────────────

export function Features() {
    const c1 = featuresData[0]?.card1
    const c2 = featuresData[1]?.card2
    const c3 = featuresData[2]?.card3
    const c4 = featuresData[3]?.card4
    const c5 = featuresData[4]?.card5

    return (
        <section className="relative overflow-hidden bg-transparent py-[90px] px-5">
            {/* ── Scene: floating orbs ── */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    top: -200,
                    left: '15%',
                    width: 700,
                    height: 700,
                    background: 'radial-gradient(circle, oklch(0.546 0.245 262.881) 0%, transparent 70%)',
                    opacity: 0.12,
                    filter: 'blur(80px)'
                }}
            />
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    bottom: -150,
                    right: '10%',
                    width: 500,
                    height: 500,
                    background: 'radial-gradient(circle, oklch(0.623 0.214 259.815) 0%, transparent 70%)',
                    opacity: 0.08,
                    filter: 'blur(80px)'
                }}
            />
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    top: '40%',
                    left: '-5%',
                    width: 320,
                    height: 320,
                    background: 'radial-gradient(circle, oklch(0.511 0.262 276.966) 0%, transparent 70%)',
                    opacity: 0.1,
                    filter: 'blur(80px)'
                }}
            />

            {/* ── Bento grid ── */}
            <div className="relative z-[1] grid grid-cols-6 gap-4 max-w-[1120px] mx-auto [&>*]:col-span-3 md:[&>*]:col-span-3 max-[620px]:grid-cols-1 max-[620px]:[&>*]:col-span-1">
                {/* ══ Card 1 — 100% Customizable ══════════════════════ */}
                <div
                    className="relative col-span-2 rounded-3xl overflow-hidden border border-white/[0.09] isolate transition-all duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:scale-[1.008] hover:border-indigo-500/30
                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.22] before:to-transparent before:pointer-events-none before:z-10
                        after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:opacity-60 after:z-[1]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                    {/* Inner glow pulse */}
                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            top: -40,
                            left: -40,
                            width: 200,
                            height: 200,
                            background: 'oklch(0.623 0.214 259.815)',
                            filter: 'blur(60px)',
                            opacity: 0.15
                        }}
                    />

                    <div className="relative z-[2] px-7 py-[30px] flex flex-col items-center justify-center min-h-[220px] text-center gap-4">
                        {/* Glass ellipse bg */}
                        <div className="relative w-full max-w-[220px] mx-auto">
                            <svg
                                viewBox="0 0 254 104"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute inset-0 w-full h-full opacity-[0.18]">
                                <path
                                    d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                                    fill="oklch(0.623 0.214 259.815)"
                                />
                            </svg>
                            <span
                                className="block pt-5 font-bebas tracking-[0.01em] leading-none"
                                style={{
                                    fontSize: 'clamp(52px, 9vw, 78px)',
                                    background: 'linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(99,102,241,0.7) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    filter: 'drop-shadow(0 0 24px rgba(99,102,241,0.5))'
                                }}>
                                {c1?.title}
                            </span>
                        </div>
                        <span
                            className="inline-flex items-center gap-1.5 px-[13px] py-1 rounded-[20px] font-barlow-condensed text-[10px] font-bold tracking-[0.12em] uppercase border backdrop-blur-[8px]"
                            style={{
                                color: 'oklch(0.707 0.165 254.624)',
                                background: 'rgba(99,102,241,0.12)',
                                borderColor: 'rgba(99,102,241,0.25)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                            }}>
                            {c1?.subtitle}
                        </span>
                    </div>
                </div>

                {/* ══ Card 2 — Secure by Default ══════════════════════ */}
                <div
                    className="relative col-span-2 rounded-3xl overflow-hidden border border-white/[0.09] isolate transition-all duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:scale-[1.008] hover:border-indigo-500/30
                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.22] before:to-transparent before:pointer-events-none before:z-10
                        after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:opacity-60 after:z-[1]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            bottom: -30,
                            right: -30,
                            width: 160,
                            height: 160,
                            background: 'oklch(0.623 0.214 259.815)',
                            filter: 'blur(50px)',
                            opacity: 0.1
                        }}
                    />

                    <div className="relative z-[2] px-7 py-[30px] flex flex-col items-center text-center">
                        <div className="w-[72px] h-[72px] mb-[18px]">
                            <svg
                                viewBox="0 0 212 143"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full h-full">
                                <path
                                    d="M44.0209 55.3542C43.1945 54.7639 42.6916 54.0272 42.5121 53.1442C42.3327 52.2611 42.5995 51.345 43.3125 50.3958C50.632 40.3611 59.812 32.5694 70.8525 27.0208C81.8931 21.4722 93.668 18.6979 106.177 18.6979C118.691 18.6979 130.497 21.3849 141.594 26.7587C152.691 32.1326 161.958 39.8936 169.396 50.0417C170.222 51.1042 170.489 52.0486 170.196 52.875C169.904 53.7014 169.401 54.4097 168.688 55C167.979 55.5903 167.153 55.8571 166.208 55.8004C165.264 55.7437 164.438 55.2408 163.729 54.2917C157.236 45.0833 148.885 38.0307 138.675 33.1337C128.466 28.2368 117.633 25.786 106.177 25.7812C94.7257 25.7812 83.9827 28.2321 73.948 33.1337C63.9132 38.0354 55.5903 45.0881 48.9792 54.2917C48.2709 55.3542 47.4445 55.9444 46.5 56.0625C45.5556 56.1806 44.7292 55.9444 44.0209 55.3542Z"
                                    fill="rgba(99,102,241,0.15)"
                                />
                                <path
                                    d="M3 72H209"
                                    stroke="oklch(0.623 0.214 259.815)"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                />
                                <g clipPath="url(#clip-ft2)">
                                    <path
                                        d="M44.0209 55.3542C43.1945 54.7639 42.6916 54.0272 42.5121 53.1442C42.3327 52.2611 42.5995 51.345 43.3125 50.3958C50.632 40.3611 59.812 32.5694 70.8525 27.0208C81.8931 21.4722 93.668 18.6979 106.177 18.6979C118.691 18.6979 130.497 21.3849 141.594 26.7587C152.691 32.1326 161.958 39.8936 169.396 50.0417C170.222 51.1042 170.489 52.0486 170.196 52.875C169.904 53.7014 169.401 54.4097 168.688 55C167.979 55.5903 167.153 55.8571 166.208 55.8004C165.264 55.7437 164.438 55.2408 163.729 54.2917C157.236 45.0833 148.885 38.0307 138.675 33.1337C128.466 28.2368 117.633 25.786 106.177 25.7812C94.7257 25.7812 83.9827 28.2321 73.948 33.1337C63.9132 38.0354 55.5903 45.0881 48.9792 54.2917C48.2709 55.3542 47.4445 55.9444 46.5 56.0625C45.5556 56.1806 44.7292 55.9444 44.0209 55.3542Z"
                                        fill="url(#grad-ft2)"
                                    />
                                </g>
                                <defs>
                                    <linearGradient
                                        id="grad-ft2"
                                        x1="106"
                                        y1="1"
                                        x2="106"
                                        y2="72"
                                        gradientUnits="userSpaceOnUse">
                                        <stop
                                            stopColor="oklch(0.623 0.214 259.815)"
                                            stopOpacity="0"
                                        />
                                        <stop
                                            offset="1"
                                            stopColor="oklch(0.623 0.214 259.815)"
                                            stopOpacity="0.9"
                                        />
                                    </linearGradient>
                                    <clipPath id="clip-ft2">
                                        <rect
                                            width="129"
                                            height="72"
                                            fill="white"
                                            transform="translate(41)"
                                        />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div
                            className="font-bebas tracking-[0.03em] leading-[1.1] mb-2 text-white/95"
                            style={{ fontSize: 'clamp(19px, 2.5vw, 26px)' }}>
                            {c2?.title}
                        </div>
                        <div className="font-barlow text-[13px] text-white/[0.42] leading-[1.68]">{c2?.subtitle}</div>
                    </div>
                </div>

                {/* ══ Card 3 — Reliable Performance ════════════════════ */}
                <div
                    className="relative col-span-2 rounded-3xl overflow-hidden border border-white/[0.09] isolate transition-all duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:scale-[1.008] hover:border-indigo-500/30
                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.22] before:to-transparent before:pointer-events-none before:z-10
                        after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:opacity-60 after:z-[1]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                    <div className="relative z-[2] px-7 py-[30px] flex flex-col">
                        <div className="w-full mb-3.5 overflow-hidden rounded-[10px]">
                            <svg
                                viewBox="0 0 386 123"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full block">
                                <defs>
                                    <linearGradient
                                        id="grad-ft3"
                                        x1="3"
                                        y1="60"
                                        x2="3"
                                        y2="123"
                                        gradientUnits="userSpaceOnUse">
                                        <stop
                                            stopColor="oklch(0.623 0.214 259.815)"
                                            stopOpacity="0.25"
                                        />
                                        <stop
                                            offset="1"
                                            stopColor="oklch(0.623 0.214 259.815)"
                                            stopOpacity="0"
                                        />
                                    </linearGradient>
                                </defs>
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3 123C3 123 14.3298 94.153 35.1282 88.0957C55.9266 82.0384 65.9333 80.5508 65.9333 80.5508C65.9333 80.5508 80.699 80.5508 92.1777 80.5508C103.656 80.5508 100.887 63.5348 109.06 63.5348C117.233 63.5348 117.217 91.9728 124.78 91.9728C132.343 91.9728 142.264 78.03 153.831 80.5508C165.398 83.0716 186.825 91.9728 193.761 91.9728C200.697 91.9728 206.296 63.5348 214.07 63.5348C221.844 63.5348 238.653 93.7771 244.234 91.9728C249.814 90.1684 258.8 60 266.19 60C272.075 60 284.1 88.057 286.678 88.0957C294.762 88.2171 300.192 72.9284 305.423 72.9284C312.323 72.9284 323.377 65.2437 335.553 63.5348C347.729 61.8259 348.218 82.07 363.639 80.5508C367.875 80.1335 372.949 82.2017 376.437 87.1008C379.446 91.3274 381.054 97.4325 382.521 104.647C383.479 109.364 382.521 123 382.521 123"
                                    fill="url(#grad-ft3)"
                                />
                                <path
                                    className="[stroke-dasharray:1200] [stroke-dashoffset:1200] [animation:ft-trace_2.4s_cubic-bezier(.4,0,.2,1)_0.3s_forwards]"
                                    d="M3 121.077C3 121.077 15.3041 93.6691 36.0195 87.756C56.7349 81.8429 66.6632 80.9723 66.6632 80.9723C66.6632 80.9723 80.0327 80.9723 91.4656 80.9723C102.898 80.9723 100.415 64.2824 108.556 64.2824C116.696 64.2824 117.693 92.1332 125.226 92.1332C132.759 92.1332 142.07 78.5115 153.591 80.9723C165.113 83.433 186.092 92.1332 193 92.1332C199.908 92.1332 205.274 64.2824 213.017 64.2824C220.76 64.2824 237.832 93.8946 243.39 92.1332C248.948 90.3718 257.923 60.5 265.284 60.5C271.145 60.5 283.204 87.7182 285.772 87.756C293.823 87.8746 299.2 73.0802 304.411 73.0802C311.283 73.0802 321.425 65.9506 333.552 64.2824C345.68 62.6141 346.91 82.4553 362.27 80.9723C377.629 79.4892 383 106.605 383 106.605"
                                    stroke="oklch(0.707 0.165 254.624)"
                                    strokeWidth="2.5"
                                />
                            </svg>
                        </div>
                        <span
                            className="self-start mb-2.5 inline-flex items-center gap-1.5 px-[13px] py-1 rounded-[20px] font-barlow-condensed text-[10px] font-bold tracking-[0.12em] uppercase border backdrop-blur-[8px]"
                            style={{
                                color: '#4ade80',
                                background: 'rgba(74,222,128,0.10)',
                                borderColor: 'rgba(74,222,128,0.22)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                            }}>
                            <span
                                className="inline-block w-[5px] h-[5px] rounded-full bg-[#4ade80]"
                                style={{ boxShadow: '0 0 6px #4ade80' }}
                            />
                            Live
                        </span>
                        <div
                            className="font-bebas tracking-[0.03em] leading-[1.1] mb-2 text-white/95"
                            style={{ fontSize: 'clamp(19px, 2.5vw, 26px)' }}>
                            {c3?.title}
                        </div>
                        <div className="font-barlow text-[13px] text-white/[0.42] leading-[1.68]">{c3?.subtitle}</div>
                    </div>
                </div>

                {/* ══ Card 4 — Built for Developers ════════════════════ */}
                <div
                    className="relative col-span-3 rounded-3xl overflow-hidden border border-white/[0.09] isolate transition-all duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:scale-[1.008] hover:border-indigo-500/30
                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.22] before:to-transparent before:pointer-events-none before:z-10
                        after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:opacity-60 after:z-[1]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            top: -60,
                            right: -60,
                            width: 240,
                            height: 240,
                            background: 'oklch(0.546 0.245 262.881)',
                            filter: 'blur(80px)',
                            opacity: 0.12
                        }}
                    />

                    <div className="relative z-[2] px-7 py-[30px] grid grid-cols-2 gap-[22px] h-full items-center">
                        <div>
                            <div
                                className="relative w-[50px] h-[50px] rounded-full flex items-center justify-center flex-shrink-0 mb-[22px] before:content-[''] before:absolute before:-inset-[7px] before:rounded-full before:border before:border-indigo-500/10 before:pointer-events-none"
                                style={{
                                    background: 'rgba(99,102,241,0.12)',
                                    border: '1px solid rgba(99,102,241,0.28)',
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 0 16px rgba(99,102,241,0.2)',
                                    backdropFilter: 'blur(8px)'
                                }}>
                                <Shield
                                    size={20}
                                    color="oklch(0.707 0.165 254.624)"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div
                                className="font-bebas tracking-[0.03em] leading-[1.1] mb-2 text-white/95"
                                style={{ fontSize: 'clamp(19px, 2.5vw, 26px)' }}>
                                {c4?.title}
                            </div>
                            <div className="font-barlow text-[13px] text-white/[0.42] leading-[1.68]">{c4?.subtitle}</div>
                        </div>

                        <div
                            className="rounded-[14px] p-4 overflow-hidden font-mono text-[11.5px] leading-[1.75] text-white/[0.32]"
                            style={{
                                background: 'rgba(0,0,0,0.35)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
                                fontFamily: "'Fira Code', 'Courier New', monospace"
                            }}>
                            <div className="flex gap-[5px] mb-3">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: 'rgba(255,95,86,0.5)' }}
                                />
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: 'rgba(255,189,46,0.5)' }}
                                />
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: 'rgba(39,201,63,0.5)' }}
                                />
                            </div>
                            <div>
                                <span style={{ color: 'oklch(0.707 0.165 254.624)' }}>const</span> <span className="text-white/75">api</span> ={' '}
                                <span className="text-white/75">createAPI</span>(&#123;
                            </div>
                            <div>
                                &nbsp;&nbsp;<span className="text-white/45">baseURL</span>: <span className="text-white/45">'/v1'</span>,
                            </div>
                            <div>
                                &nbsp;&nbsp;<span className="text-white/45">auth</span>: <span className="text-white/45">'bearer'</span>,
                            </div>
                            <div>&#125;)</div>
                            <div className="mt-1.5">
                                <span className="text-white/20">// Fast. Secure. Modular.</span>
                            </div>
                            <div>
                                <span className="text-white/75">api</span>.<span className="text-white/75">get</span>(
                                <span className="text-white/45">'/users'</span>)
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ Card 5 — Trusted by Teams ════════════════════════ */}
                <div
                    className="relative col-span-3 rounded-3xl overflow-hidden border border-white/[0.09] isolate transition-all duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:scale-[1.008] hover:border-indigo-500/30
                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.22] before:to-transparent before:pointer-events-none before:z-10
                        after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:opacity-60 after:z-[1]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            bottom: -40,
                            left: -40,
                            width: 200,
                            height: 200,
                            background: 'oklch(0.623 0.214 259.815)',
                            filter: 'blur(70px)',
                            opacity: 0.1
                        }}
                    />

                    <div className="relative z-[2] px-7 py-[30px] grid grid-cols-2 gap-[22px] h-full items-center">
                        <div>
                            <div
                                className="relative w-[50px] h-[50px] rounded-full flex items-center justify-center flex-shrink-0 mb-[22px] before:content-[''] before:absolute before:-inset-[7px] before:rounded-full before:border before:border-indigo-500/10 before:pointer-events-none"
                                style={{
                                    background: 'rgba(99,102,241,0.12)',
                                    border: '1px solid rgba(99,102,241,0.28)',
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 0 16px rgba(99,102,241,0.2)',
                                    backdropFilter: 'blur(8px)'
                                }}>
                                <Users
                                    size={20}
                                    color="oklch(0.707 0.165 254.624)"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div
                                className="font-bebas tracking-[0.03em] leading-[1.1] mb-2 text-white/95"
                                style={{ fontSize: 'clamp(19px, 2.5vw, 26px)' }}>
                                {c5?.title}
                            </div>
                            <div className="font-barlow text-[13px] text-white/[0.42] leading-[1.68]">{c5?.subtitle}</div>
                        </div>

                        <div className="relative flex flex-col justify-center gap-5 py-2.5 h-full">
                            {/* Avatar connector line */}
                            <div
                                className="absolute top-0 bottom-0 left-1/2 w-px"
                                style={{
                                    background:
                                        'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.12) 80%, transparent)'
                                }}
                            />

                            <div className="flex items-center gap-2.5 justify-end">
                                <span
                                    className="px-[11px] py-1 rounded-lg font-barlow-condensed text-[11px] font-semibold tracking-[0.06em] text-white/70 whitespace-nowrap border backdrop-blur-[8px]"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                                    }}>
                                    {c5?.avatarName1}
                                </span>
                                <img
                                    className="w-[34px] h-[34px] rounded-full flex-shrink-0 object-cover border-2 border-white/[0.15]"
                                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                                    src={c5?.avatar1}
                                    alt={c5?.avatarName1}
                                />
                            </div>

                            <div className="flex items-center gap-2.5 pl-[50%]">
                                <img
                                    className="w-[34px] h-[34px] rounded-full flex-shrink-0 object-cover border-2 border-white/[0.15]"
                                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                                    src={c5?.avatar2}
                                    alt={c5?.avatarName2}
                                />
                                <span
                                    className="px-[11px] py-1 rounded-lg font-barlow-condensed text-[11px] font-semibold tracking-[0.06em] text-white/70 whitespace-nowrap border backdrop-blur-[8px]"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                                    }}>
                                    {c5?.avatarName2}
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 justify-end">
                                <span
                                    className="px-[11px] py-1 rounded-lg font-barlow-condensed text-[11px] font-semibold tracking-[0.06em] text-white/70 whitespace-nowrap border backdrop-blur-[8px]"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                                    }}>
                                    {c5?.avatarName3}
                                </span>
                                <img
                                    className="w-[34px] h-[34px] rounded-full flex-shrink-0 object-cover border-2 border-white/[0.15]"
                                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                                    src={c5?.avatar3}
                                    alt={c5?.avatarName3}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SVG animation keyframes — kept minimal since Tailwind can't handle custom @keyframes without config */}
            <style>{`
                @keyframes ft-trace {
                    from { stroke-dashoffset: 1200; }
                    to   { stroke-dashoffset: 0; }
                }
            `}</style>
        </section>
    )
}
