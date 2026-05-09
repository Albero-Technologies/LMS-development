import { useEffect, useRef, useState } from 'react'
import { Trophy, Sparkles } from 'lucide-react'

// ─── Stairs data ─────────────────────────────────────────────────────────────

const steps = [
    {
        title: 'Day 1 — Join the cohort',
        body: 'Get matched to a mentor and meet your batch within 7 days of enrollment.'
    },
    {
        title: 'Month 1 — First capstone',
        body: 'Ship your first portfolio-grade project, reviewed live by a senior practitioner.'
    },
    {
        title: 'Month 3 — Mentor sign-off',
        body: 'Pass the mid-program review and earn your IBM SkillsBuild badge.'
    },
    {
        title: 'Month 5 — Mock interviews',
        body: 'Run 6 mock rounds with hiring managers. Resume + LinkedIn rebuilt.'
    },
    {
        title: 'Month 6 — Offer in hand',
        body: 'Referrals routed to 180+ partners. Placement support runs until you sign.'
    }
]

// We render the staircase as an SVG so we can animate the figure along an
// exact polyline — and so the steps stay crisp at any size.
const VB_W = 1200
const VB_H = 580

// Walking path waypoints (left-to-right, bottom-to-top).
// Each step has a "tread" point (where the figure stands) and a "rise" point
// (top of the next step). These map 1:1 to `steps[]` above + final trophy.
const STAIR_BASE_Y = 510
const STAIR_TOP_Y = 90
const STAIR_LEFT_X = 110
const STAIR_RIGHT_X = 1090
const STEP_COUNT = steps.length

// Compute tread points evenly spaced left → right
const treadPoints = Array.from({ length: STEP_COUNT + 1 }, (_, i) => {
    const t = i / STEP_COUNT
    return {
        x: STAIR_LEFT_X + (STAIR_RIGHT_X - STAIR_LEFT_X) * t,
        y: STAIR_BASE_Y - (STAIR_BASE_Y - STAIR_TOP_Y) * t
    }
})

const TROPHY_POINT = treadPoints[STEP_COUNT]

// Build a staircase polyline (rise/tread/rise/tread...) used for the
// outline + filled background.
function buildStairPath() {
    let d = `M ${STAIR_LEFT_X - 60} ${STAIR_BASE_Y + 30}`
    d += ` L ${STAIR_LEFT_X - 60} ${STAIR_BASE_Y}`
    for (let i = 0; i < STEP_COUNT; i++) {
        const a = treadPoints[i]
        const b = treadPoints[i + 1]
        d += ` L ${a.x + 60} ${a.y}` // tread to the right
        d += ` L ${a.x + 60} ${b.y}` // rise up to the next tread height
    }
    d += ` L ${STAIR_RIGHT_X + 80} ${STAIR_TOP_Y}`
    d += ` L ${STAIR_RIGHT_X + 80} ${STAIR_BASE_Y + 30} Z`
    return d
}
const STAIR_PATH = buildStairPath()

// ─── Component ───────────────────────────────────────────────────────────────

export default function StaircaseClimb() {
    const sectionRef = useRef<HTMLDivElement | null>(null)
    const [progress, setProgress] = useState(0)
    // Target progress = the latest scroll-derived value. The displayed
    // `progress` state lerps toward it every frame so the figure never
    // teleports — even during a fast flick scroll, the climb plays out at a
    // controlled cadence. Slow scrolls feel responsive because the lerp factor
    // is high enough to catch up quickly when the gap is small.
    const targetRef = useRef(0)
    const displayedRef = useRef(0)
    const visibleRef = useRef(false)

    useEffect(() => {
        const section = sectionRef.current
        if (!section) return

        const computeTarget = () => {
            const rect = section.getBoundingClientRect()
            const total = rect.height - window.innerHeight
            const raw = -rect.top / Math.max(total, 1)
            targetRef.current = Math.min(1, Math.max(0, raw))
            // Track whether the pinned area is in view at all — we throttle
            // the rAF loop to skip frames when offscreen.
            visibleRef.current = rect.top < window.innerHeight && rect.bottom > 0
        }
        computeTarget()

        // Continuous rAF loop. We always advance the lerp by a fixed factor
        // per frame so the animation speed is decoupled from scroll velocity.
        let raf = 0
        const tick = () => {
            const target = targetRef.current
            const current = displayedRef.current
            const diff = target - current
            // Lerp factor — tuned so the climb takes roughly 0.4-0.6s to fully
            // resolve from a flick scroll, while small movements still feel
            // immediate.
            const LERP = 0.12
            // Snap to target when the gap is imperceptible to avoid endless
            // sub-pixel React renders.
            const next = Math.abs(diff) < 0.0005 ? target : current + diff * LERP
            if (next !== current) {
                displayedRef.current = next
                // Only call setState when there's something visible to update.
                if (visibleRef.current || Math.abs(diff) < 0.0005) setProgress(next)
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        const onScrollOrResize = () => computeTarget()
        window.addEventListener('scroll', onScrollOrResize, { passive: true })
        window.addEventListener('resize', onScrollOrResize, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScrollOrResize)
            window.removeEventListener('resize', onScrollOrResize)
            cancelAnimationFrame(raf)
        }
    }, [])

    // Convert global progress 0→1 into a position on the stair path.
    // Allocate 0–0.85 to climbing the steps, and 0.85–1 to the trophy reveal,
    // so the figure visibly arrives before the celebration plays.
    const climbProgress = Math.min(1, progress / 0.85)
    const trophyProgress = Math.max(0, (progress - 0.8) / 0.2)

    // Figure position — parabolic jump arc per segment so the character
    // visibly leaps from one stair to the next instead of sliding.
    const segmentFloat = climbProgress * STEP_COUNT
    const segIndex = Math.min(STEP_COUNT - 1, Math.floor(segmentFloat))
    const segT = segmentFloat - segIndex
    const a = treadPoints[segIndex]
    const b = treadPoints[segIndex + 1]

    // Phase split per segment:
    //   [0.00 – 0.14]  crouch / wind-up on the lower stair
    //   [0.14 – 0.88]  airborne — parabolic arc to the higher stair
    //   [0.88 – 1.00]  landing squat on the higher stair
    const PHASE_TAKEOFF = 0.14
    const PHASE_LAND = 0.88
    let figureX: number
    let figureY: number
    let airborne = false
    let squat = 1 // scaleY multiplier — 1 = fully extended, <1 = crouched

    if (segT < PHASE_TAKEOFF) {
        // Wind-up: stay on tread `a`, compress slightly.
        figureX = a.x
        figureY = a.y
        const u = segT / PHASE_TAKEOFF
        squat = 1 - 0.18 * u // 1.0 -> 0.82
    } else if (segT > PHASE_LAND) {
        // Land: snap to tread `b`, soft squash, recover.
        figureX = b.x
        figureY = b.y
        const u = (segT - PHASE_LAND) / (1 - PHASE_LAND)
        // Compress on impact, then bounce back up.
        squat = u < 0.5 ? 1 - 0.22 * (u / 0.5) : 0.78 + 0.22 * ((u - 0.5) / 0.5)
    } else {
        // Airborne — parabolic arc.
        airborne = true
        const u = (segT - PHASE_TAKEOFF) / (PHASE_LAND - PHASE_TAKEOFF) // 0..1 across flight
        const xLerp = a.x + (b.x - a.x) * u
        const yLerp = a.y + (b.y - a.y) * u
        // Arc peaks above the destination tread.
        const peakHeight = 70 + Math.abs(b.y - a.y) * 0.25
        const arc = -4 * u * (1 - u) * peakHeight
        figureX = xLerp
        figureY = yLerp + arc
        // Slight stretch at apex of the jump for character.
        squat = 1 + Math.sin(u * Math.PI) * 0.1
    }

    // Determine which step is currently "active" so we can highlight its label.
    // The step is active when the figure is climbing onto it (i.e. the rise
    // portion of the previous segment).
    const activeStep = climbProgress >= 1 ? STEP_COUNT - 1 : Math.min(STEP_COUNT - 1, segIndex)

    return (
        <section
            ref={sectionRef}
            className="relative hidden md:block"
            style={{ height: '320vh', background: 'var(--page-bg)' }}>
            <div
                className="sticky overflow-hidden"
                style={{
                    top: 0,
                    height: '100vh',
                    background: 'var(--page-bg)',
                    color: 'var(--text-primary)'
                }}>
                {/* Background decor */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.5]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                        maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 50%, transparent 95%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 50%, transparent 95%)'
                    }}
                />
                <div
                    aria-hidden="true"
                    className="absolute -top-20 right-[-15%] w-[520px] h-[520px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }}
                />

                <div className="relative z-[1] max-w-[1280px] mx-auto h-full px-5 md:px-8 flex flex-col">
                    {/* Header — pt large enough to clear the fixed navbar
                        (utility strip 36px + main bar 68px = 104px) plus
                        breathing room. */}
                    <div className="text-center max-w-[760px] mx-auto pt-[140px] mb-3">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-semibold tracking-[0.18em] uppercase"
                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            <Sparkles size={12} /> Step-by-step success
                        </div>
                        <h2
                            className="font-display tracking-[-0.02em]"
                            style={{
                                color: 'var(--text-primary)',
                                fontSize: 'clamp(30px, 4.4vw, 52px)',
                                lineHeight: 1.04
                            }}>
                            Six months,{' '}
                            <span
                                className="italic font-light"
                                style={{ color: 'var(--brand)' }}>
                                one stair at a time.
                            </span>
                        </h2>
                        <p
                            className="mt-3 text-[14.5px] leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}>
                            Scroll down to walk through the journey — every milestone is built into the cohort.
                        </p>
                    </div>

                    {/* Climbing stage */}
                    <div
                        className="flex-1 relative w-full"
                        style={{ minHeight: 0 }}>
                        <svg
                            viewBox={`0 0 ${VB_W} ${VB_H}`}
                            preserveAspectRatio="xMidYMax meet"
                            className="absolute inset-0 w-full h-full">
                            <defs>
                                <linearGradient
                                    id="alb-stair-fill"
                                    x1="0"
                                    x2="0"
                                    y1="0"
                                    y2="1">
                                    <stop
                                        offset="0%"
                                        stopColor="var(--brand-soft)"
                                        stopOpacity="0.7"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="var(--brand-soft)"
                                        stopOpacity="0.18"
                                    />
                                </linearGradient>
                                <filter
                                    id="alb-stair-shadow"
                                    x="-20%"
                                    y="-20%"
                                    width="140%"
                                    height="140%">
                                    <feDropShadow
                                        dx="0"
                                        dy="6"
                                        stdDeviation="6"
                                        floodColor="rgba(13,79,60,0.20)"
                                    />
                                </filter>
                            </defs>

                            {/* Floor / staircase fill */}
                            <path
                                d={STAIR_PATH}
                                fill="url(#alb-stair-fill)"
                                stroke="var(--line-strong)"
                                strokeWidth="1.5"
                            />

                            {/* Light dashed guide line tracing the figure's path */}
                            <polyline
                                points={treadPoints.map((p) => `${p.x},${p.y - 4}`).join(' ')}
                                fill="none"
                                stroke="var(--brand)"
                                strokeWidth="2"
                                strokeDasharray="3 6"
                                opacity={0.35}
                            />

                            {/* Step labels — arranged above each tread */}
                            {steps.map((s, i) => {
                                const tread = treadPoints[i]
                                const reached = i <= activeStep && climbProgress >= (i + 1) / STEP_COUNT - 0.02
                                const rangeStart = i / STEP_COUNT
                                const rangeEnd = (i + 1) / STEP_COUNT
                                const stepProgress =
                                    climbProgress < rangeStart
                                        ? 0
                                        : climbProgress > rangeEnd
                                          ? 1
                                          : (climbProgress - rangeStart) / (rangeEnd - rangeStart)
                                const fadeIn = Math.min(1, stepProgress * 1.4)
                                return (
                                    <g
                                        key={i}
                                        transform={`translate(${tread.x - 80} ${tread.y - 86})`}
                                        opacity={fadeIn}
                                        style={{ transition: 'opacity 250ms ease' }}>
                                        <rect
                                            x="-6"
                                            y="-6"
                                            width="172"
                                            height="58"
                                            rx="14"
                                            fill="var(--surface)"
                                            stroke={reached ? 'var(--brand)' : 'var(--line)'}
                                            strokeWidth="1.5"
                                            filter="url(#alb-stair-shadow)"
                                        />
                                        <text
                                            x="8"
                                            y="14"
                                            fontFamily="JetBrains Mono, monospace"
                                            fontSize="9"
                                            letterSpacing="2"
                                            fill="var(--brand)"
                                            fontWeight={700}>
                                            STEP {String(i + 1).padStart(2, '0')}
                                        </text>
                                        <text
                                            x="8"
                                            y="32"
                                            fontFamily="Fraunces, Inter, system-ui, sans-serif"
                                            fontSize="13"
                                            fontWeight={600}
                                            fill="var(--text-primary)">
                                            {s.title}
                                        </text>
                                        <text
                                            x="8"
                                            y="46"
                                            fontFamily="Inter, system-ui, sans-serif"
                                            fontSize="9.5"
                                            fill="var(--text-tertiary)">
                                            {trimToWidth(s.body, 38)}
                                        </text>
                                    </g>
                                )
                            })}

                            {/* Trophy at the top */}
                            <g
                                transform={`translate(${TROPHY_POINT.x - 28} ${TROPHY_POINT.y - 70})`}
                                opacity={Math.min(1, trophyProgress * 2)}
                                style={{ transition: 'opacity 250ms ease' }}>
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="34"
                                    fill="var(--accent-soft)"
                                    opacity={0.55 + trophyProgress * 0.4}
                                />
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    fill="var(--accent)"
                                    opacity={trophyProgress}
                                />
                                <foreignObject
                                    x="9"
                                    y="9"
                                    width="38"
                                    height="38"
                                    style={{ overflow: 'visible' }}>
                                    <div
                                        style={{
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 38,
                                            height: 38,
                                            transform: `scale(${0.8 + trophyProgress * 0.4})`,
                                            transition: 'transform 200ms ease'
                                        }}>
                                        <Trophy
                                            size={20}
                                            fill="#fff"
                                        />
                                    </div>
                                </foreignObject>
                                {/* Sparkle bursts when nearly complete */}
                                {trophyProgress > 0.5 && (
                                    <g>
                                        {[0, 60, 120, 180, 240, 300].map((angle, k) => {
                                            const r = 36 + (trophyProgress - 0.5) * 30
                                            const x = 28 + Math.cos((angle * Math.PI) / 180) * r
                                            const y = 28 + Math.sin((angle * Math.PI) / 180) * r
                                            return (
                                                <circle
                                                    key={k}
                                                    cx={x}
                                                    cy={y}
                                                    r={2.5}
                                                    fill="var(--accent)"
                                                    opacity={(trophyProgress - 0.5) * 2}
                                                />
                                            )
                                        })}
                                    </g>
                                )}
                            </g>

                            {/* Stick figure — translate to position, scale for squash/stretch.
                                The shadow stays anchored to the tread (not the figure) and shrinks
                                when the character is high in the air. */}
                            {/* Ground shadow tied to the takeoff tread, not the figure */}
                            {airborne ? (
                                <ellipse
                                    cx={a.x + (b.x - a.x) * ((segT - PHASE_TAKEOFF) / (PHASE_LAND - PHASE_TAKEOFF))}
                                    cy={a.y + (b.y - a.y) * ((segT - PHASE_TAKEOFF) / (PHASE_LAND - PHASE_TAKEOFF)) - 1}
                                    rx={
                                        14 *
                                        Math.max(
                                            0.4,
                                            1 - Math.abs(figureY - (a.y + (b.y - a.y) * ((segT - PHASE_TAKEOFF) / (PHASE_LAND - PHASE_TAKEOFF)))) / 80
                                        )
                                    }
                                    ry={3}
                                    fill="rgba(10,14,31,0.18)"
                                />
                            ) : (
                                <ellipse
                                    cx={figureX}
                                    cy={figureY - 1}
                                    rx={14}
                                    ry={3}
                                    fill="rgba(10,14,31,0.25)"
                                />
                            )}

                            <g
                                transform={`translate(${figureX} ${figureY - 4}) scale(1, ${squat})`}
                                style={{ transition: 'transform 70ms linear', transformBox: 'fill-box', transformOrigin: 'center bottom' }}>
                                <Jumper
                                    airborne={airborne}
                                    segT={segT}
                                />
                            </g>
                        </svg>
                    </div>

                    {/* Bottom progress + active step label */}
                    <div className="pb-6 md:pb-8 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span
                                className="w-9 h-9 rounded-xl inline-flex items-center justify-center font-mono text-[12px] font-bold"
                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                {String(activeStep + 1).padStart(2, '0')}
                            </span>
                            <div className="leading-tight">
                                <div
                                    className="font-display text-[16px] font-semibold"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {progress >= 0.95 ? 'Offer in hand 🎉' : steps[activeStep].title}
                                </div>
                                <div
                                    className="text-[12px]"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    {progress >= 0.95 ? "You climbed every step — that's the Albero promise." : steps[activeStep].body}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-1 max-w-[420px]">
                            <span
                                className="text-[10.5px] tracking-[0.16em] uppercase font-semibold"
                                style={{ color: 'var(--text-tertiary)' }}>
                                Climb
                            </span>
                            <div
                                className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{ background: 'var(--line)' }}>
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${progress * 100}%`,
                                        background: 'linear-gradient(90deg, var(--brand), var(--accent))',
                                        transition: 'width 80ms linear'
                                    }}
                                />
                            </div>
                            <span
                                className="font-mono text-[11px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                {Math.round(progress * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function trimToWidth(text: string, max: number) {
    return text.length <= max ? text : text.slice(0, max - 1) + '…'
}

// Stick figure that JUMPS between stairs. Three poses:
//   - grounded (squat / windup)  — knees bent, arms swung back, ready to launch
//   - airborne (in flight)       — body extended, knees tucked up, arms forward
//   - landing                    — same shape as grounded but used on touchdown
//
// `segT` is 0..1 across the current stair segment so we can interpolate
// between poses smoothly without snapping.
function Jumper({ airborne, segT }: { airborne: boolean; segT: number }) {
    // tuck = how much the legs are pulled up for the jump (0 grounded, 1 max tuck)
    let tuck = 0
    if (airborne) {
        // Peak tuck happens around segT 0.5 (mid-flight), eases back to 0 on landing.
        const u = (segT - 0.14) / (0.88 - 0.14)
        tuck = Math.sin(Math.max(0, Math.min(1, u)) * Math.PI)
    } else if (segT < 0.14) {
        // Wind-up — knees bend a bit before takeoff
        const u = segT / 0.14
        tuck = u * 0.4
    } else if (segT > 0.88) {
        // Landing — slight knee bend on impact, eases back to standing
        const u = (segT - 0.88) / 0.12
        tuck = (1 - u) * 0.55
    }

    // Arms swing forward during flight, back during wind-up
    const armForward = airborne ? 1 : segT < 0.14 ? -segT / 0.14 : segT > 0.88 ? 1 - (segT - 0.88) / 0.12 : 0

    // Joint coordinates derived from tuck
    const kneeY = 36 - tuck * 8 // knees rise as tuck increases
    const footY = 42 - tuck * 14 // feet rise more (legs fully tucked)
    const footSpread = 4 - tuck * 2.5 // feet pull together when tucked

    // Arms — point forward (positive x) when armForward > 0
    const armEndXFront = 8 + armForward * 6
    const armEndXBack = -8 - (1 - armForward) * 4
    const armEndY = 22 - armForward * 6

    return (
        <g transform="translate(0,-46)">
            {/* Head */}
            <circle
                cx="0"
                cy="6"
                r="6"
                fill="var(--brand)"
            />
            <circle
                cx="0"
                cy="6"
                r="6"
                fill="none"
                stroke="var(--text-primary)"
                strokeWidth="1.2"
            />

            {/* Body */}
            <line
                x1="0"
                y1="12"
                x2="0"
                y2="28"
                stroke="var(--text-primary)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />

            {/* Backpack — slightly offset back, follows body */}
            <rect
                x="-8"
                y="12"
                width="6"
                height="10"
                rx="1.5"
                fill="var(--accent)"
                opacity="0.85"
            />

            {/* Arms — both reach forward when airborne for that triumphant leap shape */}
            <line
                x1="0"
                y1="16"
                x2={armEndXFront}
                y2={armEndY}
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <line
                x1="0"
                y1="16"
                x2={armEndXBack}
                y2={22 + armForward * 2}
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Legs — drawn as two segments (hip → knee → foot) so the tuck looks natural */}
            {/* Left leg */}
            <line
                x1="0"
                y1="28"
                x2={-3}
                y2={kneeY}
                stroke="var(--text-primary)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <line
                x1={-3}
                y1={kneeY}
                x2={-footSpread}
                y2={footY}
                stroke="var(--text-primary)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            {/* Right leg */}
            <line
                x1="0"
                y1="28"
                x2={3}
                y2={kneeY}
                stroke="var(--text-primary)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <line
                x1={3}
                y1={kneeY}
                x2={footSpread}
                y2={footY}
                stroke="var(--text-primary)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />

            {/* Tiny motion lines while airborne for extra readability */}
            {airborne && (
                <g
                    opacity={0.5}
                    stroke="var(--brand)"
                    strokeWidth="1.5"
                    strokeLinecap="round">
                    <line
                        x1={-14}
                        y1={20}
                        x2={-22}
                        y2={22}
                    />
                    <line
                        x1={-14}
                        y1={26}
                        x2={-20}
                        y2={28}
                    />
                </g>
            )}
        </g>
    )
}
