import { useEffect, useRef } from 'react'

// ArmorCode-style animated hero canvas. Lives behind / next to the program
// hero copy as a decorative element. Renders:
//
//   - tool nodes around the perimeter, each with an icon glyph + label
//   - bezier flow lines from each tool → central hub
//   - particles drifting along each path (stagger so they don't all bunch)
//   - pulsing concentric rings around the hub
//   - background dot scatter for depth
//
// Pure Canvas 2D — no WebGL, no third-party deps. Pauses when the canvas
// is off-screen via IntersectionObserver. Honours prefers-reduced-motion
// (renders a single static frame).

export interface ArmorCodeNode {
    /** Stable identifier — used for keying particles to nodes. */
    id: string
    /** Display label below the node. */
    label: string
    /** Single emoji or short glyph rendered inside the node circle. */
    glyph: string
    /** Brand colour for this node's flow line + halo. */
    color: string
    /** Fractional position 0..1 in the canvas — keeps layout responsive. */
    x: number
    y: number
}

interface Props {
    /** Tool nodes to orbit around the central hub. */
    nodes: ArmorCodeNode[]
    /** Hub label rendered inside the central node. */
    hubLabel?: string
    /** Hub glyph (emoji / short text). */
    hubGlyph?: string
    /** Optional CSS height — defaults to 420px. */
    height?: number
    className?: string
}

// Internal mutable particle state — kept outside render so the RAF loop
// doesn't allocate on every frame.
interface Particle {
    nodeId: string
    /** Position along the bezier path, 0..1. */
    t: number
    /** Per-particle speed scalar. Slight randomisation = livelier flow. */
    speed: number
}

export const ArmorCodeHero = ({
    nodes,
    hubLabel = 'AI Hub',
    hubGlyph = '✦',
    height = 420,
    className
}: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number>(0)
    const particlesRef = useRef<Particle[]>([])
    const visibleRef = useRef(true)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        // Resize → re-fit the backing buffer. Cached values for the loop.
        let widthCss = 0
        let heightCss = 0
        const resize = () => {
            const rect = container.getBoundingClientRect()
            widthCss = rect.width
            heightCss = rect.height || height
            canvas.width = Math.round(widthCss * dpr)
            canvas.height = Math.round(heightCss * dpr)
            canvas.style.width = `${widthCss}px`
            canvas.style.height = `${heightCss}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(container)

        // Pause when the canvas leaves the viewport — saves CPU on long pages.
        const io = new IntersectionObserver((entries) => {
            visibleRef.current = entries[0]?.isIntersecting ?? true
        })
        io.observe(canvas)

        // Pre-spawn particles — 3 per node, staggered along the path.
        particlesRef.current = nodes.flatMap((n, idx) =>
            Array.from({ length: 3 }).map((_, k) => ({
                nodeId: n.id,
                // Stagger so the trio doesn't move in lockstep.
                t: ((idx * 0.21 + k * 0.33) % 1 + 1) % 1,
                speed: 0.0018 + Math.random() * 0.0012
            }))
        )

        // Background dot scatter — fixed seed so it doesn't dance on resize.
        const dots: { x: number; y: number; r: number; alpha: number }[] = []
        for (let i = 0; i < 64; i++) {
            dots.push({
                x: Math.random(),
                y: Math.random(),
                r: 0.6 + Math.random() * 1.6,
                alpha: 0.15 + Math.random() * 0.25
            })
        }

        // Bezier control points — derived once per node from a clamped
        // perpendicular offset so the curves arc out from the hub gracefully.
        const computeBezier = (node: ArmorCodeNode, hubX: number, hubY: number) => {
            const sx = node.x * widthCss
            const sy = node.y * heightCss
            const dx = hubX - sx
            const dy = hubY - sy
            // Perpendicular offset gives the curve its arc.
            const perp = { x: -dy, y: dx }
            const len = Math.hypot(perp.x, perp.y) || 1
            const offset = Math.min(140, Math.hypot(dx, dy) * 0.35)
            const cx = sx + dx * 0.5 + (perp.x / len) * offset
            const cy = sy + dy * 0.5 + (perp.y / len) * offset
            return { sx, sy, cx, cy }
        }

        const bezierPoint = (sx: number, sy: number, cx: number, cy: number, ex: number, ey: number, t: number) => {
            const u = 1 - t
            return {
                x: u * u * sx + 2 * u * t * cx + t * t * ex,
                y: u * u * sy + 2 * u * t * cy + t * t * ey
            }
        }

        let frame = 0
        const draw = () => {
            const hubX = widthCss / 2
            const hubY = heightCss / 2
            ctx.clearRect(0, 0, widthCss, heightCss)

            // 1. Background dots
            for (const d of dots) {
                ctx.beginPath()
                ctx.arc(d.x * widthCss, d.y * heightCss, d.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(91, 63, 214, ${d.alpha * 0.35})`
                ctx.fill()
            }

            // 2. Flow lines + particles (per node)
            for (const node of nodes) {
                const { sx, sy, cx, cy } = computeBezier(node, hubX, hubY)

                // Curve stroke — soft + thin so it whispers rather than shouts.
                ctx.beginPath()
                ctx.moveTo(sx, sy)
                ctx.quadraticCurveTo(cx, cy, hubX, hubY)
                ctx.strokeStyle = `${node.color}55`
                ctx.lineWidth = 1.5
                ctx.stroke()
            }

            for (const p of particlesRef.current) {
                if (!reduced) {
                    p.t += p.speed
                    if (p.t > 1) p.t = 0
                }
                const node = nodes.find((n) => n.id === p.nodeId)
                if (!node) continue
                const { sx, sy, cx, cy } = computeBezier(node, hubX, hubY)
                const pt = bezierPoint(sx, sy, cx, cy, hubX, hubY, p.t)
                // Particle alpha fades in/out at the endpoints so they don't
                // pop into existence at the source.
                const alpha = Math.sin(p.t * Math.PI)
                ctx.beginPath()
                ctx.arc(pt.x, pt.y, 2.4, 0, Math.PI * 2)
                ctx.fillStyle = `${node.color}${alphaHex(alpha)}`
                ctx.fill()
            }

            // 3. Hub pulses — three concentric rings staggered in time.
            const pulse = (frame % 180) / 180
            for (let i = 0; i < 3; i++) {
                const t = (pulse + i * 0.33) % 1
                const r = 36 + t * 60
                const a = (1 - t) * 0.5
                ctx.beginPath()
                ctx.arc(hubX, hubY, r, 0, Math.PI * 2)
                ctx.strokeStyle = `rgba(91, 63, 214, ${a})`
                ctx.lineWidth = 1.4
                ctx.stroke()
            }

            // 4. Tool nodes — circle + glyph + label
            for (const node of nodes) {
                const sx = node.x * widthCss
                const sy = node.y * heightCss
                // Bobbing offset so nodes feel alive.
                const bob = reduced ? 0 : Math.sin((frame + node.id.length * 13) * 0.03) * 4

                // Halo
                ctx.beginPath()
                ctx.arc(sx, sy + bob, 28, 0, Math.PI * 2)
                ctx.fillStyle = `${node.color}1a`
                ctx.fill()

                // Body
                ctx.beginPath()
                ctx.arc(sx, sy + bob, 22, 0, Math.PI * 2)
                ctx.fillStyle = '#ffffff'
                ctx.fill()
                ctx.strokeStyle = node.color
                ctx.lineWidth = 2
                ctx.stroke()

                // Glyph
                ctx.font = '600 16px system-ui, -apple-system, "Segoe UI", sans-serif'
                ctx.fillStyle = node.color
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(node.glyph, sx, sy + bob + 1)

                // Label
                ctx.font = '600 11px system-ui, -apple-system, "Segoe UI", sans-serif'
                ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'
                ctx.fillText(node.label, sx, sy + bob + 40)
            }

            // 5. Central hub — gradient-filled circle
            const grad = ctx.createLinearGradient(hubX - 32, hubY - 32, hubX + 32, hubY + 32)
            grad.addColorStop(0, '#5b3fd6')
            grad.addColorStop(0.5, '#14785f')
            grad.addColorStop(1, '#0ea47a')
            ctx.beginPath()
            ctx.arc(hubX, hubY, 32, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()
            ctx.font = '700 22px system-ui, -apple-system, "Segoe UI", sans-serif'
            ctx.fillStyle = '#fff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(hubGlyph, hubX, hubY + 1)
            ctx.font = '600 11px system-ui, -apple-system, "Segoe UI", sans-serif'
            ctx.fillText(hubLabel, hubX, hubY + 50)
        }

        const tick = () => {
            if (visibleRef.current) {
                frame += 1
                draw()
            }
            rafRef.current = requestAnimationFrame(tick)
        }

        if (reduced) {
            // Single static frame — accessible + cheap.
            draw()
        } else {
            rafRef.current = requestAnimationFrame(tick)
        }

        return () => {
            cancelAnimationFrame(rafRef.current)
            ro.disconnect()
            io.disconnect()
        }
    }, [nodes, hubLabel, hubGlyph, height])

    return (
        <div ref={containerRef} className={`relative w-full ${className ?? ''}`} style={{ height }}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    )
}

// Convert 0..1 alpha to a 2-digit hex pair so we can splice it onto the
// node colour without a full rgba parse. Clamped so the strings stay valid.
const alphaHex = (a: number): string => {
    const clamped = Math.max(0, Math.min(1, a))
    const v = Math.round(clamped * 255)
    return v.toString(16).padStart(2, '0')
}
