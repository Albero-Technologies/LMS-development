import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Asteroid {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    angle: number
    spin: number
    verts: { x: number; y: number }[]
}
interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    radius: number
    color: string
}
interface Star {
    x: number
    y: number
    r: number
    alpha: number
    twinkleSpeed: number
    twinkleOffset: number
}
interface GameState {
    running: boolean
    over: boolean
    score: number
    highScore: number
    player: { x: number; y: number; vy: number; width: number; height: number; invincible: number }
    asteroids: Asteroid[]
    particles: Particle[]
    stars: Star[]
    keys: Record<string, boolean>
    animId: number
    spawnTimer: number
    spawnInterval: number
    difficulty: number
    time: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PLAYER_X = 120
const GRAVITY = 0.26
const THRUST = -0.65
const MAX_VY = 7

function makeVerts(r: number, n = 11) {
    return Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        const d = r * (0.7 + Math.random() * 0.4)
        return { x: Math.cos(a) * d, y: Math.sin(a) * d }
    })
}
function spawnAsteroid(W: number, H: number, diff: number): Asteroid {
    const r = 16 + Math.random() * 28
    const spd = 2.0 + Math.random() * 1.8 + diff * 0.22
    const ang = (Math.random() - 0.5) * 0.35
    return {
        x: W + r + 10,
        y: r + Math.random() * (H - r * 2),
        vx: -spd,
        vy: Math.sin(ang) * spd * 0.45,
        radius: r,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.045,
        verts: makeVerts(r)
    }
}
function makeStars(n: number, W: number, H: number): Star[] {
    return Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 1.5,
        alpha: 0.15 + Math.random() * 0.6,
        twinkleSpeed: 0.004 + Math.random() * 0.014,
        twinkleOffset: Math.random() * Math.PI * 2
    }))
}
function circleRect(cx: number, cy: number, cr: number, rx: number, ry: number, rw: number, rh: number) {
    const nx = Math.max(rx, Math.min(cx, rx + rw))
    const ny = Math.max(ry, Math.min(cy, ry + rh))
    const dx = cx - nx,
        dy = cy - ny
    return dx * dx + dy * dy < (cr - 5) * (cr - 5)
}
function burst(state: GameState, x: number, y: number, n: number, colors: string[]) {
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2,
            spd = 1.2 + Math.random() * 4.5
        state.particles.push({
            x,
            y,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            life: 1,
            radius: 2 + Math.random() * 3.5,
            color: colors[i % colors.length]
        })
    }
}

// ─── Canvas Drawing ───────────────────────────────────────────────────────────
function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], t: number) {
    for (const s of stars) {
        const a = s.alpha * (0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,220,255,${a})`
        ctx.fill()
    }
}

function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
    // Engine glow
    const eg = ctx.createRadialGradient(x - w / 2 - 6, y, 0, x - w / 2 - 6, y, 22)
    eg.addColorStop(0, 'rgba(249,115,22,0.55)')
    eg.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(x - w / 2 - 6, y, 22, 0, Math.PI * 2)
    ctx.fillStyle = eg
    ctx.fill()

    // Flame
    const fl = 12 + Math.sin(t * 22) * 7
    const fg = ctx.createLinearGradient(x - w / 2, y, x - w / 2 - fl, y)
    fg.addColorStop(0, 'rgba(253,186,116,0.95)')
    fg.addColorStop(0.4, 'rgba(249,115,22,0.7)')
    fg.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.moveTo(x - w / 2 + 2, y - 5)
    ctx.lineTo(x - w / 2 - fl, y)
    ctx.lineTo(x - w / 2 + 2, y + 5)
    ctx.fillStyle = fg
    ctx.fill()

    // Secondary small flame
    const fl2 = 7 + Math.sin(t * 30 + 1) * 4
    ctx.beginPath()
    ctx.moveTo(x - w / 2 + 6, y - 2.5)
    ctx.lineTo(x - w / 2 - fl2, y)
    ctx.lineTo(x - w / 2 + 6, y + 2.5)
    ctx.fillStyle = 'rgba(253,224,71,0.5)'
    ctx.fill()

    // Hull
    ctx.beginPath()
    ctx.moveTo(x + w / 2, y)
    ctx.lineTo(x - w / 2 + 4, y - h / 2)
    ctx.lineTo(x - w / 2 - 2, y - h / 2 + 5)
    ctx.lineTo(x - w / 3, y - 2)
    ctx.lineTo(x - w / 3, y + 2)
    ctx.lineTo(x - w / 2 - 2, y + h / 2 - 5)
    ctx.lineTo(x - w / 2 + 4, y + h / 2)
    ctx.closePath()
    ctx.fillStyle = '#0c1a2e'
    ctx.fill()
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 1.6
    ctx.stroke()

    // Upper wing
    ctx.beginPath()
    ctx.moveTo(x, y - 3)
    ctx.lineTo(x - w / 2 + 4, y - h / 2)
    ctx.lineTo(x - w / 4, y - 1)
    ctx.closePath()
    ctx.fillStyle = 'rgba(56,189,248,0.18)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(56,189,248,0.55)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Lower wing
    ctx.beginPath()
    ctx.moveTo(x, y + 3)
    ctx.lineTo(x - w / 2 + 4, y + h / 2)
    ctx.lineTo(x - w / 4, y + 1)
    ctx.closePath()
    ctx.fillStyle = 'rgba(56,189,248,0.18)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(56,189,248,0.55)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Cockpit
    const cg = ctx.createRadialGradient(x + w / 5, y - 1, 0, x + w / 5, y, 8)
    cg.addColorStop(0, 'rgba(224,242,254,0.9)')
    cg.addColorStop(1, 'rgba(56,189,248,0.3)')
    ctx.beginPath()
    ctx.ellipse(x + w / 5, y, 7, 5, 0, 0, Math.PI * 2)
    ctx.fillStyle = cg
    ctx.fill()

    // Ship glow
    const sg = ctx.createRadialGradient(x, y, 0, x, y, w * 0.9)
    sg.addColorStop(0, 'rgba(56,189,248,0.1)')
    sg.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(x, y, w * 0.9, 0, Math.PI * 2)
    ctx.fillStyle = sg
    ctx.fill()
}

function drawAsteroid(ctx: CanvasRenderingContext2D, a: Asteroid) {
    ctx.save()
    ctx.translate(a.x, a.y)
    ctx.rotate(a.angle)

    const og = ctx.createRadialGradient(0, 0, a.radius * 0.3, 0, 0, a.radius * 1.5)
    og.addColorStop(0, 'rgba(217,119,6,0.07)')
    og.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(0, 0, a.radius * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = og
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(a.verts[0].x, a.verts[0].y)
    for (let i = 1; i < a.verts.length; i++) ctx.lineTo(a.verts[i].x, a.verts[i].y)
    ctx.closePath()
    const bg = ctx.createRadialGradient(-a.radius * 0.2, -a.radius * 0.2, 0, 0, 0, a.radius)
    bg.addColorStop(0, '#78350f')
    bg.addColorStop(0.6, '#451a03')
    bg.addColorStop(1, '#1c0a00')
    ctx.fillStyle = bg
    ctx.fill()
    ctx.strokeStyle = '#d97706'
    ctx.lineWidth = 1.2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(a.radius * 0.2, -a.radius * 0.25, a.radius * 0.15, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(251,191,36,0.2)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
}

function drawNebula(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.003)
    const g1 = ctx.createRadialGradient(W * 0.75, H * 0.3, 0, W * 0.75, H * 0.3, W * 0.4)
    g1.addColorStop(0, `rgba(30,58,138,${0.08 + pulse * 0.04})`)
    g1.addColorStop(1, 'transparent')
    ctx.fillStyle = g1
    ctx.fillRect(0, 0, W, H)

    const g2 = ctx.createRadialGradient(W * 0.15, H * 0.7, 0, W * 0.15, H * 0.7, W * 0.35)
    g2.addColorStop(0, `rgba(88,28,135,${0.06 + pulse * 0.03})`)
    g2.addColorStop(1, 'transparent')
    ctx.fillStyle = g2
    ctx.fillRect(0, 0, W, H)
}

// ─── SVG Spaceship for UI ─────────────────────────────────────────────────────
function SpaceshipSVG({ className = '' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 96 40"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter
                    id="ship-glow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%">
                    <feGaussianBlur
                        stdDeviation="2.5"
                        result="blur"
                    />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient
                    id="flame-grad"
                    x1="100%"
                    y1="0"
                    x2="0%"
                    y2="0">
                    <stop
                        offset="0%"
                        stopColor="#fdba74"
                        stopOpacity="0.95"
                    />
                    <stop
                        offset="45%"
                        stopColor="#f97316"
                        stopOpacity="0.75"
                    />
                    <stop
                        offset="100%"
                        stopColor="#f97316"
                        stopOpacity="0"
                    />
                </linearGradient>
                <radialGradient
                    id="cockpit-grad"
                    cx="38%"
                    cy="32%"
                    r="65%">
                    <stop
                        offset="0%"
                        stopColor="rgba(224,242,254,0.95)"
                    />
                    <stop
                        offset="100%"
                        stopColor="rgba(56,189,248,0.35)"
                    />
                </radialGradient>
                <radialGradient
                    id="ship-glow-fill"
                    cx="50%"
                    cy="50%"
                    r="50%">
                    <stop
                        offset="0%"
                        stopColor="rgba(56,189,248,0.12)"
                    />
                    <stop
                        offset="100%"
                        stopColor="rgba(56,189,248,0)"
                    />
                </radialGradient>
            </defs>
            <g filter="url(#ship-glow)">
                {/* Engine glow */}
                <circle
                    cx="16"
                    cy="20"
                    r="10"
                    fill="rgba(249,115,22,0.18)"
                />
                {/* Flame */}
                <path
                    d="M18 20 L4 14 L8 20 L4 26 Z"
                    fill="url(#flame-grad)"
                />
                <path
                    d="M20 20 L10 17 L12 20 L10 23 Z"
                    fill="rgba(253,224,71,0.55)"
                />
                {/* Hull */}
                <path
                    d="M88 20 L20 9 L22 14 L19 20 L22 26 L20 31 Z"
                    fill="#0c1a2e"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                {/* Upper wing */}
                <path
                    d="M56 20 L20 9 L34 17 Z"
                    fill="rgba(56,189,248,0.16)"
                    stroke="rgba(56,189,248,0.5)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                />
                {/* Lower wing */}
                <path
                    d="M56 20 L20 31 L34 23 Z"
                    fill="rgba(56,189,248,0.16)"
                    stroke="rgba(56,189,248,0.5)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                />
                {/* Cockpit */}
                <ellipse
                    cx="67"
                    cy="20"
                    rx="9"
                    ry="6"
                    fill="url(#cockpit-grad)"
                />
                {/* Nose stripe */}
                <line
                    x1="84"
                    y1="19.5"
                    x2="77"
                    y2="17"
                    stroke="rgba(56,189,248,0.35)"
                    strokeWidth="1.2"
                />
                {/* Hull glow */}
                <ellipse
                    cx="54"
                    cy="20"
                    rx="38"
                    ry="14"
                    fill="url(#ship-glow-fill)"
                />
            </g>
        </svg>
    )
}

// ─── KeyCap ───────────────────────────────────────────────────────────────────
function KeyCap({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
    return (
        <span
            className={`inline-flex items-center justify-center rounded-[6px] border border-white/[0.18] bg-white/[0.05] backdrop-blur-sm font-mono text-[11px] font-bold text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_2px_0_rgba(0,0,0,0.45)] leading-none ${wide ? 'px-2.5 h-7' : 'w-7 h-7'}`}>
            {children}
        </span>
    )
}

function scoreStr(n: number) {
    return String(Math.floor(n / 10)).padStart(6, '0')
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OfflinePage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const stateRef = useRef<GameState | null>(null)
    const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle')
    const [score, setScore] = useState(0)
    const [high, setHigh] = useState(0)
    const [level, setLevel] = useState(1)

    const buildState = useCallback(
        (W: number, H: number): GameState => ({
            running: false,
            over: false,
            score: 0,
            highScore: stateRef.current?.highScore ?? 0,
            player: { x: PLAYER_X, y: H / 2, vy: 0, width: 40, height: 24, invincible: 90 },
            asteroids: [],
            particles: [],
            stars: makeStars(90, W, H),
            keys: {},
            animId: 0,
            spawnTimer: 0,
            spawnInterval: 88,
            difficulty: 0,
            time: 0
        }),
        []
    )

    const startGame = useCallback(() => {
        const c = canvasRef.current
        if (!c) return
        const s = buildState(c.width, c.height)
        s.running = true
        stateRef.current = s
        setPhase('playing')
        setScore(0)
        setLevel(1)
    }, [buildState])

    useEffect(() => {
        const c = canvasRef.current
        if (!c) return
        const ctx = c.getContext('2d')!

        const resize = () => {
            c.width = c.offsetWidth
            c.height = c.offsetHeight
            if (stateRef.current) stateRef.current.stars = makeStars(90, c.width, c.height)
        }
        resize()
        window.addEventListener('resize', resize)
        stateRef.current = buildState(c.width, c.height)

        const onDown = (e: KeyboardEvent) => {
            if (!stateRef.current) return
            stateRef.current.keys[e.code] = true
            if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) e.preventDefault()
        }
        const onUp = (e: KeyboardEvent) => {
            if (stateRef.current) stateRef.current.keys[e.code] = false
        }
        window.addEventListener('keydown', onDown)
        window.addEventListener('keyup', onUp)

        const FIRE = ['#f97316', '#ef4444', '#fbbf24', '#fb923c', '#fde68a']
        const SPARK = ['#38bdf8', '#7dd3fc', '#bae6fd']

        const loop = () => {
            const st = stateRef.current
            if (!st) return
            const W = c.width,
                H = c.height
            ctx.clearRect(0, 0, W, H)
            drawNebula(ctx, W, H, st.time)
            drawStars(ctx, st.stars, st.time)
            st.time++

            if (st.running && !st.over) {
                const p = st.player
                const up = st.keys['ArrowUp'] || st.keys['KeyW'] || st.keys['Space']
                const dn = st.keys['ArrowDown'] || st.keys['KeyS']
                if (up) p.vy += THRUST
                else if (dn) p.vy += -THRUST * 0.55
                p.vy += GRAVITY
                p.vy = Math.max(-MAX_VY, Math.min(MAX_VY, p.vy))
                p.y = Math.max(p.height / 2 + 2, Math.min(H - p.height / 2 - 2, p.y + p.vy))

                if (st.time % 3 === 0) burst(st, p.x - p.width / 2, p.y, 2, FIRE)

                st.score++
                st.difficulty = Math.floor(st.score / 420)
                setScore(st.score)
                setLevel(st.difficulty + 1)

                st.spawnTimer++
                if (st.spawnTimer >= st.spawnInterval) {
                    st.spawnTimer = 0
                    st.spawnInterval = Math.max(28, 88 - st.difficulty * 6)
                    const count = st.difficulty > 4 ? 2 : 1
                    for (let i = 0; i < count; i++) st.asteroids.push(spawnAsteroid(W, H, st.difficulty))
                }

                st.asteroids = st.asteroids.filter((a) => {
                    a.x += a.vx
                    a.y += a.vy
                    a.angle += a.spin
                    return a.x + a.radius > -30
                })

                if (p.invincible > 0) {
                    p.invincible--
                } else {
                    for (const a of st.asteroids) {
                        if (circleRect(a.x, a.y, a.radius, p.x - p.width / 2, p.y - p.height / 2, p.width, p.height)) {
                            st.over = true
                            st.running = false
                            st.highScore = Math.max(st.highScore, st.score)
                            burst(st, p.x, p.y, 55, FIRE)
                            burst(st, p.x, p.y, 20, SPARK)
                            setHigh(Math.floor(st.highScore / 10))
                            setPhase('over')
                            break
                        }
                    }
                }

                st.particles = st.particles.filter((pt) => {
                    pt.x += pt.vx
                    pt.y += pt.vy
                    pt.vy += 0.07
                    pt.life -= 0.032
                    return pt.life > 0
                })
                for (const a of st.asteroids) drawAsteroid(ctx, a)
                for (const pt of st.particles) {
                    ctx.globalAlpha = Math.max(0, pt.life)
                    ctx.beginPath()
                    ctx.arc(pt.x, pt.y, pt.radius * pt.life, 0, Math.PI * 2)
                    ctx.fillStyle = pt.color
                    ctx.fill()
                }
                ctx.globalAlpha = 1

                if (p.invincible === 0 || Math.floor(p.invincible / 6) % 2 === 0) drawShip(ctx, p.x, p.y, p.width, p.height, st.time * 0.1)
            } else if (st.over) {
                st.particles = st.particles.filter((pt) => {
                    pt.x += pt.vx
                    pt.y += pt.vy
                    pt.vy += 0.06
                    pt.life -= 0.022
                    return pt.life > 0
                })
                for (const pt of st.particles) {
                    ctx.globalAlpha = Math.max(0, pt.life)
                    ctx.beginPath()
                    ctx.arc(pt.x, pt.y, pt.radius * pt.life, 0, Math.PI * 2)
                    ctx.fillStyle = pt.color
                    ctx.fill()
                }
                ctx.globalAlpha = 1
            } else {
                // Idle floating ship
                const iy = H / 2 + Math.sin(st.time * 0.018) * 18
                drawShip(ctx, W / 2, iy, 44, 26, st.time * 0.1)
            }

            // Scanlines
            for (let y = 0; y < H; y += 4) {
                ctx.fillStyle = 'rgba(56,189,248,0.025)'
                ctx.fillRect(0, y, W, 1)
            }

            // Vignette
            const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H)
            vig.addColorStop(0, 'transparent')
            vig.addColorStop(1, 'rgba(0,0,0,0.65)')
            ctx.fillStyle = vig
            ctx.fillRect(0, 0, W, H)

            st.animId = requestAnimationFrame(loop)
        }

        const id = requestAnimationFrame(loop)
        if (stateRef.current) stateRef.current.animId = id

        return () => {
            cancelAnimationFrame(id)
            window.removeEventListener('resize', resize)
            window.removeEventListener('keydown', onDown)
            window.removeEventListener('keyup', onUp)
        }
    }, [buildState])

    const tap = useCallback(() => {
        if (!stateRef.current) return
        stateRef.current.keys['Space'] = true
        setTimeout(() => {
            if (stateRef.current) stateRef.current.keys['Space'] = false
        }, 100)
    }, [])

    return (
        <div className="relative h-screen w-full overflow-hidden bg-transparent select-none">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                onPointerDown={tap}
            />

            {/* ── IDLE ── */}
            {phase === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
                    {/* Status badge */}
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/[0.06] backdrop-blur-md mb-8">
                        <span className="w-[6px] h-[6px] rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse" />
                        <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-amber-300/65">Connection Lost</span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-black tracking-tighter leading-[0.86] text-center mb-3 text-[clamp(52px,10vw,96px)]">
                        <span className="text-white block">YOU'RE</span>
                        <span
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400"
                            style={{ filter: 'drop-shadow(0 0 28px rgba(56,189,248,0.45))' }}>
                            OFFLINE
                        </span>
                    </h1>

                    <p className="font-mono text-white/30 text-[11px] tracking-[0.2em] uppercase mb-9">While you wait — dodge some asteroids</p>

                    {/* Controls card with SVG ship */}
                    <div className="flex items-center gap-5 px-6 py-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        {/* Ship + glow */}
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 scale-110 rounded-full bg-sky-400/[0.08] blur-xl" />
                            <SpaceshipSVG className="w-24 h-10 relative drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                        </div>

                        <div className="w-px h-12 bg-white/[0.08]" />

                        {/* Key bindings */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="flex gap-1">
                                    <KeyCap>W</KeyCap>
                                    <KeyCap>↑</KeyCap>
                                    <KeyCap wide>SPC</KeyCap>
                                </div>
                                <span className="font-mono text-[10px] text-white/35 tracking-wide">Thrust up</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex gap-1">
                                    <KeyCap>S</KeyCap>
                                    <KeyCap>↓</KeyCap>
                                </div>
                                <span className="font-mono text-[10px] text-white/35 tracking-wide ml-[38px]">Brake down</span>
                            </div>
                        </div>
                    </div>

                    {/* Launch CTA */}
                    <button
                        onClick={startGame}
                        className="group relative flex items-center gap-3 px-8 py-3.5 rounded-2xl font-mono font-black text-sm tracking-[0.13em] uppercase text-sky-300 border border-sky-500/30 bg-sky-500/[0.08] backdrop-blur-sm transition-all duration-200 hover:bg-sky-500/[0.16] hover:border-sky-400/55 hover:shadow-[0_0_36px_rgba(56,189,248,0.22)] mb-5 overflow-hidden">
                        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-sky-400/[0.07] to-transparent transition-transform duration-700 ease-in-out" />
                        <SpaceshipSVG className="w-14 h-6 transition-transform duration-300 group-hover:translate-x-1.5" />
                        <span className="relative">Launch Game</span>
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/20 hover:text-sky-400/55 transition-colors duration-200 underline underline-offset-4">
                        Try reconnecting
                    </button>
                </div>
            )}

            {/* ── PLAYING HUD ── */}
            {phase === 'playing' && (
                <>
                    {/* Score — top left */}
                    <div className="absolute top-5 left-5 z-10">
                        <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-sky-400/40 mb-0.5">Score</p>
                        <p className="font-mono text-[28px] font-black leading-none text-sky-300 [text-shadow:0_0_14px_rgba(56,189,248,0.5)]">
                            {scoreStr(score)}
                        </p>
                    </div>

                    {/* Level — top right */}
                    <div className="absolute top-5 right-5 z-10 text-right">
                        <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-white/25 mb-0.5">Level</p>
                        <p className="font-mono text-2xl font-black leading-none text-white/35">{String(level).padStart(2, '0')}</p>
                    </div>

                    {/* Mobile tap area */}
                    <div
                        className="absolute inset-0 z-10 sm:hidden"
                        onPointerDown={tap}
                    />

                    {/* Mobile hint */}
                    <p className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 sm:hidden font-mono text-[10px] tracking-widest uppercase text-white/20">
                        Tap to thrust
                    </p>
                </>
            )}

            {/* ── GAME OVER ── */}
            {phase === 'over' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
                    {/* Destroyed badge */}
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/[0.06] backdrop-blur-md mb-7">
                        <span className="w-[6px] h-[6px] rounded-full bg-red-400 shadow-[0_0_6px_#f87171]" />
                        <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-red-300/65">Ship Destroyed</span>
                    </div>

                    {/* Heading */}
                    <h2 className="font-black tracking-tighter leading-[0.86] text-center mb-7 text-[clamp(48px,9vw,88px)]">
                        <span className="text-white block">GAME</span>
                        <span
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"
                            style={{ filter: 'drop-shadow(0 0 22px rgba(239,68,68,0.4))' }}>
                            OVER
                        </span>
                    </h2>

                    {/* Score / Best card */}
                    <div className="flex rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md overflow-hidden mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <div className="px-8 py-5 text-center">
                            <p className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase text-white/25 mb-2">Score</p>
                            <p className="font-mono text-[28px] font-black leading-none text-sky-300 [text-shadow:0_0_12px_rgba(56,189,248,0.4)]">
                                {scoreStr(score)}
                            </p>
                        </div>
                        <div className="w-px bg-white/[0.07] self-stretch" />
                        <div className="px-8 py-5 text-center">
                            <p className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase text-white/25 mb-2">Best</p>
                            <p className="font-mono text-[28px] font-black leading-none text-white/35">{String(high).padStart(6, '0')}</p>
                        </div>
                    </div>

                    {/* Fly again CTA */}
                    <button
                        onClick={startGame}
                        className="group relative flex items-center gap-3 px-8 py-3.5 rounded-2xl font-mono font-black text-sm tracking-[0.13em] uppercase text-sky-300 border border-sky-500/30 bg-sky-500/[0.08] backdrop-blur-sm transition-all duration-200 hover:bg-sky-500/[0.16] hover:border-sky-400/55 hover:shadow-[0_0_36px_rgba(56,189,248,0.22)] mb-5 overflow-hidden">
                        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-sky-400/[0.07] to-transparent transition-transform duration-700 ease-in-out" />
                        <SpaceshipSVG className="w-14 h-6 transition-transform duration-300 group-hover:translate-x-1.5" />
                        <span className="relative">Fly Again</span>
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/20 hover:text-sky-400/55 transition-colors duration-200 underline underline-offset-4">
                        Try reconnecting
                    </button>
                </div>
            )}
        </div>
    )
}
