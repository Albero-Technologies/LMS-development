import { useEffect, useRef, useState } from 'react'

// Premium animated tech-mesh canvas. Renders:
//   - tool nodes orbiting the centre with bobbing motion + glowing halos
//   - bezier flow lines from each tool → central hub
//   - particles with sin-fade alpha drifting along each path
//   - concentric pulsing rings around the hub
//   - radial brand glow + dot scatter background
//   - HTML tooltip overlay tracking mouse position over each node
//
// Pure Canvas 2D — no WebGL, no third-party deps. Pauses when off-screen
// via IntersectionObserver. Honours prefers-reduced-motion (renders a
// single static frame and disables hover tracking).

export interface ArmorCodeNode {
    /** Stable identifier — used for keying particles to nodes + tooltip. */
    id: string
    /** Display label below the node (always visible) AND tooltip title. */
    label: string
    /** Single emoji or short glyph rendered inside the node circle. */
    glyph: string
    /** Brand colour for this node's flow line + halo. */
    color: string
    /** Fractional position 0..1 in the canvas — keeps layout responsive. */
    x: number
    y: number
    /** Optional one-line tooltip body shown on hover. */
    tooltip?: string
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

interface Particle {
    nodeId: string
    /** Position along the bezier path, 0..1. */
    t: number
    /** Per-particle speed scalar. Slight randomisation = livelier flow. */
    speed: number
    /** Per-particle radius — varies for visual depth. */
    radius: number
}

interface HoverState {
    nodeId: string
    /** Screen position (CSS px) of the node's centre, for HTML tooltip placement. */
    x: number
    y: number
}

const NODE_RADIUS = 24
const NODE_HIT_RADIUS = 32 // generous hit area so the tooltip catches mouse hover
const HUB_RADIUS = 36

export const ArmorCodeHero = ({ nodes, hubLabel = 'AI Hub', hubGlyph = '✦', height = 420, className }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number>(0)
    const particlesRef = useRef<Particle[]>([])
    const visibleRef = useRef(true)
    const hoverRef = useRef<HoverState | null>(null)
    // Dimensions held in refs so the mousemove handler reads up-to-date
    // values without retriggering the effect on every resize.
    const dimsRef = useRef({ w: 0, h: 0 })

    const [hover, setHover] = useState<HoverState | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        const resize = () => {
            const rect = container.getBoundingClientRect()
            const w = rect.width
            const h = rect.height || height
            dimsRef.current = { w, h }
            canvas.width = Math.round(w * dpr)
            canvas.height = Math.round(h * dpr)
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(container)

        // Pause when off-screen so we don't burn CPU on long pages.
        const io = new IntersectionObserver((entries) => {
            visibleRef.current = entries[0]?.isIntersecting ?? true
        })
        io.observe(canvas)

        // Pre-spawn particles — 4 per node, staggered, with varying radii.
        particlesRef.current = nodes.flatMap((n, idx) =>
            Array.from({ length: 4 }).map((_, k) => ({
                nodeId: n.id,
                t: ((idx * 0.18 + k * 0.25) % 1 + 1) % 1,
                speed: 0.0014 + Math.random() * 0.0012,
                radius: 1.6 + Math.random() * 1.4
            }))
        )

        // Background dot scatter — fixed seed so it doesn't dance on resize.
        const dots: { x: number; y: number; r: number; alpha: number }[] = []
        for (let i = 0; i < 80; i++) {
            dots.push({
                x: Math.random(),
                y: Math.random(),
                r: 0.5 + Math.random() * 1.4,
                alpha: 0.12 + Math.random() * 0.28
            })
        }

        const computeBezier = (node: ArmorCodeNode, hubX: number, hubY: number) => {
            const sx = node.x * dimsRef.current.w
            const sy = node.y * dimsRef.current.h
            const dx = hubX - sx
            const dy = hubY - sy
            const perp = { x: -dy, y: dx }
            const len = Math.hypot(perp.x, perp.y) || 1
            const offset = Math.min(150, Math.hypot(dx, dy) * 0.38)
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

        // Mouse hover detection — checks each node centre against the
        // mouse position within the canvas; first hit wins. Updates both
        // the canvas-side hoverRef (so the draw call can highlight the
        // hovered node) and React state (to render the HTML tooltip).
        const onMove = (e: MouseEvent) => {
            if (reduced) return
            const rect = canvas.getBoundingClientRect()
            const mx = e.clientX - rect.left
            const my = e.clientY - rect.top
            const { w, h } = dimsRef.current
            // Account for the bobbing offset so the hit-test follows the
            // node visually instead of locking to its rest position.
            const frameNow = lastFrameRef.current
            for (const node of nodes) {
                const sx = node.x * w
                const sy = node.y * h
                const bob = Math.sin((frameNow + node.id.length * 13) * 0.03) * 4
                const dx = mx - sx
                const dy = my - (sy + bob)
                if (Math.hypot(dx, dy) <= NODE_HIT_RADIUS) {
                    const next: HoverState = { nodeId: node.id, x: sx, y: sy + bob }
                    hoverRef.current = next
                    setHover((cur) => (cur?.nodeId === next.nodeId && cur.x === next.x && cur.y === next.y ? cur : next))
                    canvas.style.cursor = 'pointer'
                    return
                }
            }
            if (hoverRef.current) {
                hoverRef.current = null
                setHover(null)
                canvas.style.cursor = 'default'
            }
        }
        const onLeave = () => {
            if (hoverRef.current) {
                hoverRef.current = null
                setHover(null)
            }
            canvas.style.cursor = 'default'
        }
        canvas.addEventListener('mousemove', onMove)
        canvas.addEventListener('mouseleave', onLeave)

        let frame = 0
        const lastFrameRef = { current: 0 }
        const draw = () => {
            const { w: widthCss, h: heightCss } = dimsRef.current
            const hubX = widthCss / 2
            const hubY = heightCss / 2
            ctx.clearRect(0, 0, widthCss, heightCss)

            // 1. Background dots — brand emerald, low alpha so they whisper.
            for (const d of dots) {
                ctx.beginPath()
                ctx.arc(d.x * widthCss, d.y * heightCss, d.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(20, 120, 95, ${d.alpha * 0.4})`
                ctx.fill()
            }

            // 2. Flow lines — slightly thicker on the hovered node's path
            //    so the tooltip feels physically connected to the hub.
            const hovered = hoverRef.current
            for (const node of nodes) {
                const { sx, sy, cx, cy } = computeBezier(node, hubX, hubY)
                const isHovered = hovered?.nodeId === node.id
                ctx.beginPath()
                ctx.moveTo(sx, sy)
                ctx.quadraticCurveTo(cx, cy, hubX, hubY)
                ctx.strokeStyle = isHovered ? `${node.color}cc` : `${node.color}44`
                ctx.lineWidth = isHovered ? 2.2 : 1.4
                ctx.stroke()
            }

            // 3. Particles — slightly larger + faster on the hovered path.
            for (const p of particlesRef.current) {
                if (!reduced) {
                    const isHovered = hovered?.nodeId === p.nodeId
                    p.t += p.speed * (isHovered ? 1.6 : 1)
                    if (p.t > 1) p.t = 0
                }
                const node = nodes.find((n) => n.id === p.nodeId)
                if (!node) continue
                const { sx, sy, cx, cy } = computeBezier(node, hubX, hubY)
                const pt = bezierPoint(sx, sy, cx, cy, hubX, hubY, p.t)
                const alpha = Math.sin(p.t * Math.PI)
                const isHovered = hovered?.nodeId === node.id
                const r = (isHovered ? p.radius * 1.4 : p.radius) + 0.6
                // Outer glow halo around each particle for that liquid feel.
                ctx.beginPath()
                ctx.arc(pt.x, pt.y, r * 2.4, 0, Math.PI * 2)
                ctx.fillStyle = `${node.color}${alphaHex(alpha * 0.18)}`
                ctx.fill()
                ctx.beginPath()
                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
                ctx.fillStyle = `${node.color}${alphaHex(alpha)}`
                ctx.fill()
            }

            // 4. Hub aura — soft radial glow that pulses with the rings.
            const auraStrength = 0.28 + Math.sin(frame * 0.04) * 0.06
            const aura = ctx.createRadialGradient(hubX, hubY, 0, hubX, hubY, 110)
            aura.addColorStop(0, `rgba(52, 211, 153, ${auraStrength})`)
            aura.addColorStop(1, 'rgba(52, 211, 153, 0)')
            ctx.fillStyle = aura
            ctx.beginPath()
            ctx.arc(hubX, hubY, 110, 0, Math.PI * 2)
            ctx.fill()

            // 5. Hub pulses — three concentric staggered rings.
            const pulse = (frame % 200) / 200
            for (let i = 0; i < 3; i++) {
                const t = (pulse + i * 0.33) % 1
                const r = HUB_RADIUS + 4 + t * 60
                const a = (1 - t) * 0.55
                ctx.beginPath()
                ctx.arc(hubX, hubY, r, 0, Math.PI * 2)
                ctx.strokeStyle = `rgba(52, 211, 153, ${a})`
                ctx.lineWidth = 1.4
                ctx.stroke()
            }

            // 6. Tool nodes — premium glass disc with bob + outer glow.
            for (const node of nodes) {
                const sx = node.x * widthCss
                const sy = node.y * heightCss
                const bob = reduced ? 0 : Math.sin((frame + node.id.length * 13) * 0.03) * 4
                const cy = sy + bob
                const isHovered = hovered?.nodeId === node.id

                // Outer glow — bigger when hovered.
                const haloR = isHovered ? 38 : 30
                const haloAlpha = isHovered ? 0.34 : 0.18
                const halo = ctx.createRadialGradient(sx, cy, 0, sx, cy, haloR)
                halo.addColorStop(0, `${node.color}${alphaHex(haloAlpha)}`)
                halo.addColorStop(1, `${node.color}00`)
                ctx.fillStyle = halo
                ctx.beginPath()
                ctx.arc(sx, cy, haloR, 0, Math.PI * 2)
                ctx.fill()

                // Glass disc body — soft fill + crisp brand-coloured stroke.
                const bodyGrad = ctx.createLinearGradient(sx - NODE_RADIUS, cy - NODE_RADIUS, sx + NODE_RADIUS, cy + NODE_RADIUS)
                bodyGrad.addColorStop(0, '#ffffff')
                bodyGrad.addColorStop(1, '#f6faf8')
                ctx.beginPath()
                ctx.arc(sx, cy, NODE_RADIUS, 0, Math.PI * 2)
                ctx.fillStyle = bodyGrad
                ctx.fill()
                ctx.strokeStyle = node.color
                ctx.lineWidth = isHovered ? 2.4 : 1.8
                ctx.stroke()

                // Inner highlight ring (gives the "polished bead" effect)
                ctx.beginPath()
                ctx.arc(sx - 3, cy - 4, NODE_RADIUS - 6, 0, Math.PI * 2)
                ctx.strokeStyle = 'rgba(255,255,255,0.65)'
                ctx.lineWidth = 1
                ctx.stroke()

                // Glyph
                ctx.font = '700 16px system-ui, -apple-system, "Segoe UI", sans-serif'
                ctx.fillStyle = node.color
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(node.glyph, sx, cy + 1)

                // Label — brand colour on hover, muted otherwise.
                ctx.font = '600 11px system-ui, -apple-system, "Segoe UI", sans-serif'
                ctx.fillStyle = isHovered ? node.color : 'rgba(245, 243, 234, 0.78)'
                ctx.fillText(node.label, sx, cy + NODE_RADIUS + 18)
            }

            // 7. Central hub — gradient disc with white inner-ring + glyph.
            const grad = ctx.createLinearGradient(hubX - HUB_RADIUS, hubY - HUB_RADIUS, hubX + HUB_RADIUS, hubY + HUB_RADIUS)
            grad.addColorStop(0, '#0d4f3c')
            grad.addColorStop(0.55, '#14785f')
            grad.addColorStop(1, '#34d399')
            ctx.beginPath()
            ctx.arc(hubX, hubY, HUB_RADIUS, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()
            // Hub inner highlight — subtle "polished bead" sheen.
            ctx.beginPath()
            ctx.arc(hubX - 5, hubY - 6, HUB_RADIUS - 8, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(255,255,255,0.18)'
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.font = '700 24px system-ui, -apple-system, "Segoe UI", sans-serif'
            ctx.fillStyle = '#fff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(hubGlyph, hubX, hubY + 1)
            ctx.font = '700 11px system-ui, -apple-system, "Segoe UI", sans-serif'
            ctx.fillStyle = 'rgba(255,255,255,0.85)'
            ctx.fillText(hubLabel, hubX, hubY + HUB_RADIUS + 22)
        }

        const tick = () => {
            if (visibleRef.current) {
                frame += 1
                lastFrameRef.current = frame
                draw()
            }
            rafRef.current = requestAnimationFrame(tick)
        }

        if (reduced) {
            draw()
        } else {
            rafRef.current = requestAnimationFrame(tick)
        }

        return () => {
            cancelAnimationFrame(rafRef.current)
            ro.disconnect()
            io.disconnect()
            canvas.removeEventListener('mousemove', onMove)
            canvas.removeEventListener('mouseleave', onLeave)
        }
    }, [nodes, hubLabel, hubGlyph, height])

    const hoveredNode = hover ? nodes.find((n) => n.id === hover.nodeId) : null

    return (
        <div ref={containerRef} className={`relative w-full ${className ?? ''}`} style={{ height }}>
            <canvas ref={canvasRef} className="absolute inset-0" />
            {/* HTML tooltip overlay — positioned in CSS px above the hovered
                node. Pointer-events:none so it doesn't steal hover from the
                canvas hit-test underneath. */}
            {hoveredNode && hover && (
                <div
                    role="tooltip"
                    className="absolute z-10 pointer-events-none transition-opacity duration-150"
                    style={{
                        left: hover.x,
                        top: hover.y - NODE_RADIUS - 14,
                        transform: 'translate(-50%, -100%)'
                    }}>
                    <div
                        className="px-3 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap shadow-2xl"
                        style={{
                            background: '#0a1410',
                            color: '#f5f3ea',
                            border: `1px solid ${hoveredNode.color}66`,
                            boxShadow: `0 12px 32px rgba(0,0,0,0.55), 0 0 0 4px ${hoveredNode.color}22`
                        }}>
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex w-1.5 h-1.5 rounded-full"
                                style={{ background: hoveredNode.color, boxShadow: `0 0 0 3px ${hoveredNode.color}33` }}
                            />
                            <span style={{ color: hoveredNode.color }}>{hoveredNode.label}</span>
                        </div>
                        {hoveredNode.tooltip && (
                            <div className="mt-1 text-[11px] font-normal" style={{ color: 'rgba(245,243,234,0.7)' }}>
                                {hoveredNode.tooltip}
                            </div>
                        )}
                    </div>
                    {/* Tail — small triangle that points down to the node. */}
                    <div
                        aria-hidden="true"
                        className="mx-auto"
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: `6px solid #0a1410`,
                            marginTop: -1
                        }}
                    />
                </div>
            )}
        </div>
    )
}

const alphaHex = (a: number): string => {
    const clamped = Math.max(0, Math.min(1, a))
    const v = Math.round(clamped * 255)
    return v.toString(16).padStart(2, '0')
}
