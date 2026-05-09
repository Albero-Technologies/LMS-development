import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'

// Premium animated tech-mesh canvas. Pure Canvas 2D — no WebGL, no third-
// party deps. Pauses when off-screen via IntersectionObserver. Honours
// prefers-reduced-motion (renders a single static frame).
//
// Visual layers, drawn back-to-front:
//   1. Ambient brand-colour blobs (radial gradients) for atmospheric depth
//   2. Background micro-dots scattered across the canvas
//   3. Sweeping bezier flow lines from each node → hub
//   4. Connecting strands between adjacent nodes (a "halo ring")
//   5. Particles drifting along each flow line, with halos
//   6. Hub aura — multi-layer radial glow + concentric pulsing rings
//   7. Tool nodes — glassy white discs with brand-coloured stroke + glyph
//   8. Central hub — gradient disc with sheen + glyph + label

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
    /** Legacy tooltip body — accepted for backwards-compat with existing
     *  ARMORCODE_NODES_FOR_PROGRAM presets but no longer rendered. The
     *  hover tooltip overlay was removed; the canvas-only design feels
     *  cleaner and lines up with the latest design references. */
    tooltip?: string
}

interface Props {
    /** Tool nodes to orbit around the central hub. */
    nodes: ArmorCodeNode[]
    /** Hub label rendered inside the central node. */
    hubLabel?: string
    /** Hub glyph (emoji / short text). */
    hubGlyph?: string
    /** Optional CSS height — defaults to 480px. */
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

const NODE_RADIUS = 26
const HUB_RADIUS = 42
// Particles per flow line. Higher = denser river, but expensive — six is
// the sweet spot at 60fps on a mid-tier laptop.
const PARTICLES_PER_NODE = 6

export const ArmorCodeHero = ({ nodes, hubLabel = 'Studio', hubGlyph = '✦', height = 480, className }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number>(0)
    const particlesRef = useRef<Particle[]>([])
    const visibleRef = useRef(true)
    // Dimensions held in refs so the draw loop reads up-to-date values
    // without retriggering the effect on every resize.
    const dimsRef = useRef({ w: 0, h: 0 })

    const { theme } = useTheme()
    const isDark = theme === 'dark'
    // Mirror the theme into a ref so the long-lived draw closure can
    // read the current value each frame without re-creating the
    // animation effect (which would respawn particles + reset phase).
    const isDarkRef = useRef(isDark)
    useEffect(() => {
        isDarkRef.current = isDark
    }, [isDark])

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

        // Pre-spawn particles — staggered evenly along each path so the
        // river always feels populated, never bunched.
        particlesRef.current = nodes.flatMap((n, idx) =>
            Array.from({ length: PARTICLES_PER_NODE }).map((_, k) => ({
                nodeId: n.id,
                t: ((idx * 0.18 + k * (1 / PARTICLES_PER_NODE)) % 1 + 1) % 1,
                speed: 0.0014 + Math.random() * 0.0014,
                radius: 1.6 + Math.random() * 1.6
            }))
        )

        // Background dot scatter — fixed seed so the field doesn't dance
        // on resize. Each dot picks one of three brand-emerald shades to
        // create depth without needing a separate noise texture.
        const dots: { x: number; y: number; r: number; alpha: number; tone: number }[] = []
        for (let i = 0; i < 110; i++) {
            dots.push({
                x: Math.random(),
                y: Math.random(),
                r: 0.6 + Math.random() * 1.6,
                alpha: 0.1 + Math.random() * 0.32,
                tone: Math.floor(Math.random() * 3)
            })
        }
        const dotTones = ['rgba(20, 120, 95,', 'rgba(13, 79, 60,', 'rgba(52, 211, 153,']

        // Ambient blobs — three big radial gradients drifting slowly.
        // Gives the canvas a "weather" feel without a video texture.
        const blobs = [
            { x: 0.18, y: 0.28, r: 0.38, color: 'rgba(13, 79, 60, 0.18)', phase: 0 },
            { x: 0.82, y: 0.38, r: 0.32, color: 'rgba(52, 211, 153, 0.16)', phase: 1.6 },
            { x: 0.5, y: 0.85, r: 0.40, color: 'rgba(20, 120, 95, 0.14)', phase: 3.2 }
        ]

        const computeBezier = (node: ArmorCodeNode, hubX: number, hubY: number) => {
            const sx = node.x * dimsRef.current.w
            const sy = node.y * dimsRef.current.h
            const dx = hubX - sx
            const dy = hubY - sy
            const perp = { x: -dy, y: dx }
            const len = Math.hypot(perp.x, perp.y) || 1
            // Sweepier curves than the previous version — gives the
            // "river of data" feel the design references.
            const offset = Math.min(220, Math.hypot(dx, dy) * 0.55)
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
            const { w: widthCss, h: heightCss } = dimsRef.current
            const hubX = widthCss / 2
            const hubY = heightCss / 2
            const dark = isDarkRef.current
            ctx.clearRect(0, 0, widthCss, heightCss)

            // 1. Ambient drifting blobs — give the canvas weather/depth.
            for (const b of blobs) {
                const driftX = Math.sin(frame * 0.004 + b.phase) * 18
                const driftY = Math.cos(frame * 0.005 + b.phase * 1.2) * 14
                const cx = b.x * widthCss + driftX
                const cy = b.y * heightCss + driftY
                const r = b.r * Math.min(widthCss, heightCss)
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
                grad.addColorStop(0, b.color)
                grad.addColorStop(1, b.color.replace(/[\d.]+\)$/, '0)'))
                ctx.fillStyle = grad
                ctx.beginPath()
                ctx.arc(cx, cy, r, 0, Math.PI * 2)
                ctx.fill()
            }

            // 2. Background dots — three brand tones with low alpha.
            for (const d of dots) {
                ctx.beginPath()
                ctx.arc(d.x * widthCss, d.y * heightCss, d.r, 0, Math.PI * 2)
                const baseAlpha = d.alpha * (dark ? 0.6 : 0.35)
                ctx.fillStyle = `${dotTones[d.tone]}${baseAlpha})`
                ctx.fill()
            }

            // 3. Flow lines — soft brand-colour strokes from each node to
            //    the hub, drawn underneath everything else.
            for (const node of nodes) {
                const { sx, sy, cx, cy } = computeBezier(node, hubX, hubY)
                ctx.beginPath()
                ctx.moveTo(sx, sy)
                ctx.quadraticCurveTo(cx, cy, hubX, hubY)
                ctx.strokeStyle = `${node.color}55`
                ctx.lineWidth = 1.6
                ctx.stroke()
            }

            // 4. Halo ring — light strokes connecting adjacent nodes so
            //    the layout reads as a system rather than spokes-on-axle.
            if (nodes.length >= 3) {
                ctx.beginPath()
                for (let i = 0; i < nodes.length; i++) {
                    const a = nodes[i]!
                    const b = nodes[(i + 1) % nodes.length]!
                    const ax = a.x * widthCss
                    const ay = a.y * heightCss
                    const bx = b.x * widthCss
                    const by = b.y * heightCss
                    if (i === 0) ctx.moveTo(ax, ay)
                    // Curve toward the centre very slightly so the ring
                    // bows in instead of being a polygon — feels organic.
                    const mx = (ax + bx) / 2 + (hubX - (ax + bx) / 2) * 0.18
                    const my = (ay + by) / 2 + (hubY - (ay + by) / 2) * 0.18
                    ctx.quadraticCurveTo(mx, my, bx, by)
                }
                ctx.closePath()
                ctx.strokeStyle = dark ? 'rgba(245, 243, 234, 0.06)' : 'rgba(15, 23, 42, 0.05)'
                ctx.lineWidth = 1
                ctx.stroke()
            }

            // 5. Particles — each one carries a node's brand colour. Halo
            //    behind the bead makes them read as "liquid light".
            for (const p of particlesRef.current) {
                if (!reduced) {
                    p.t += p.speed
                    if (p.t > 1) p.t = 0
                }
                const node = nodes.find((n) => n.id === p.nodeId)
                if (!node) continue
                const { sx, sy, cx, cy } = computeBezier(node, hubX, hubY)
                const pt = bezierPoint(sx, sy, cx, cy, hubX, hubY, p.t)
                const alpha = Math.sin(p.t * Math.PI)
                const r = p.radius + 0.6
                ctx.beginPath()
                ctx.arc(pt.x, pt.y, r * 2.6, 0, Math.PI * 2)
                ctx.fillStyle = `${node.color}${alphaHex(alpha * 0.18)}`
                ctx.fill()
                ctx.beginPath()
                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
                ctx.fillStyle = `${node.color}${alphaHex(alpha)}`
                ctx.fill()
            }

            // 6. Hub aura — bigger, brighter, multi-layered to make the
            //    centre feel like a "core" the rivers feed into.
            const auraStrength = 0.32 + Math.sin(frame * 0.04) * 0.08
            const auraOuter = ctx.createRadialGradient(hubX, hubY, 0, hubX, hubY, 160)
            auraOuter.addColorStop(0, `rgba(52, 211, 153, ${auraStrength})`)
            auraOuter.addColorStop(0.55, 'rgba(20, 120, 95, 0.08)')
            auraOuter.addColorStop(1, 'rgba(52, 211, 153, 0)')
            ctx.fillStyle = auraOuter
            ctx.beginPath()
            ctx.arc(hubX, hubY, 160, 0, Math.PI * 2)
            ctx.fill()

            // 6b. Hub pulse rings — three concentric staggered rings.
            const pulse = (frame % 220) / 220
            for (let i = 0; i < 3; i++) {
                const t = (pulse + i * 0.33) % 1
                const r = HUB_RADIUS + 8 + t * 80
                const a = (1 - t) * 0.5
                ctx.beginPath()
                ctx.arc(hubX, hubY, r, 0, Math.PI * 2)
                ctx.strokeStyle = `rgba(52, 211, 153, ${a})`
                ctx.lineWidth = 1.4
                ctx.stroke()
            }

            // 7. Tool nodes — glassy white discs with brand-coloured
            //    stroke + halo. Bigger than the previous version so the
            //    glyph is unmissable.
            for (const node of nodes) {
                const sx = node.x * widthCss
                const sy = node.y * heightCss
                const bob = reduced ? 0 : Math.sin((frame + node.id.length * 13) * 0.03) * 4
                const cy = sy + bob

                // Outer glow halo.
                const haloR = 36
                const halo = ctx.createRadialGradient(sx, cy, 0, sx, cy, haloR)
                halo.addColorStop(0, `${node.color}${alphaHex(0.26)}`)
                halo.addColorStop(1, `${node.color}00`)
                ctx.fillStyle = halo
                ctx.beginPath()
                ctx.arc(sx, cy, haloR, 0, Math.PI * 2)
                ctx.fill()

                // Glass disc body.
                const bodyGrad = ctx.createLinearGradient(sx - NODE_RADIUS, cy - NODE_RADIUS, sx + NODE_RADIUS, cy + NODE_RADIUS)
                bodyGrad.addColorStop(0, '#ffffff')
                bodyGrad.addColorStop(1, '#f6faf8')
                ctx.beginPath()
                ctx.arc(sx, cy, NODE_RADIUS, 0, Math.PI * 2)
                ctx.fillStyle = bodyGrad
                ctx.fill()
                ctx.strokeStyle = node.color
                ctx.lineWidth = 2
                ctx.stroke()

                // Inner highlight ring — polished bead effect.
                ctx.beginPath()
                ctx.arc(sx - 3, cy - 4, NODE_RADIUS - 6, 0, Math.PI * 2)
                ctx.strokeStyle = 'rgba(255,255,255,0.7)'
                ctx.lineWidth = 1
                ctx.stroke()

                // Glyph.
                ctx.font = '700 17px system-ui, -apple-system, "Segoe UI", sans-serif'
                ctx.fillStyle = node.color
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(node.glyph, sx, cy + 1)

                // Label — theme-aware tone so it reads on either bg.
                ctx.font = '600 11.5px system-ui, -apple-system, "Segoe UI", sans-serif'
                ctx.fillStyle = dark ? 'rgba(245, 243, 234, 0.82)' : 'rgba(15, 23, 42, 0.7)'
                ctx.fillText(node.label, sx, cy + NODE_RADIUS + 18)
            }

            // 8. Central hub — gradient disc with sheen, glyph, label.
            const grad = ctx.createLinearGradient(hubX - HUB_RADIUS, hubY - HUB_RADIUS, hubX + HUB_RADIUS, hubY + HUB_RADIUS)
            grad.addColorStop(0, '#0d4f3c')
            grad.addColorStop(0.55, '#14785f')
            grad.addColorStop(1, '#34d399')
            ctx.beginPath()
            ctx.arc(hubX, hubY, HUB_RADIUS, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()

            // Hub stroke — bright emerald rim.
            ctx.beginPath()
            ctx.arc(hubX, hubY, HUB_RADIUS, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)'
            ctx.lineWidth = 1.6
            ctx.stroke()

            // Hub inner highlight — polished bead sheen.
            ctx.beginPath()
            ctx.arc(hubX - 6, hubY - 8, HUB_RADIUS - 10, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(255,255,255,0.22)'
            ctx.lineWidth = 1
            ctx.stroke()

            ctx.font = '700 26px system-ui, -apple-system, "Segoe UI", sans-serif'
            ctx.fillStyle = '#fff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(hubGlyph, hubX, hubY + 1)

            ctx.font = '700 12px system-ui, -apple-system, "Segoe UI", sans-serif'
            ctx.fillStyle = dark ? 'rgba(245, 243, 234, 0.9)' : 'rgba(15, 23, 42, 0.78)'
            ctx.fillText(hubLabel, hubX, hubY + HUB_RADIUS + 22)
        }

        const tick = () => {
            if (visibleRef.current) {
                frame += 1
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
        }
    }, [nodes, hubLabel, hubGlyph, height])

    return (
        <div ref={containerRef} className={`relative w-full ${className ?? ''}`} style={{ height }}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    )
}

const alphaHex = (a: number): string => {
    const clamped = Math.max(0, Math.min(1, a))
    const v = Math.round(clamped * 255)
    return v.toString(16).padStart(2, '0')
}
