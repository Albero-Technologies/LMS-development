import { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        let W: number, H: number
        const mouse = { x: -9999, y: -9999 }

        const C = {
            blue: [99, 149, 255] as [number, number, number],
            soft: [120, 180, 255] as [number, number, number],
            amber: [255, 196, 80] as [number, number, number],
            white: [255, 255, 255] as [number, number, number]
        }
        const rgba = ([r, g, b]: [number, number, number], a: number) => `rgba(${r},${g},${b},${a})`

        function resize() {
            W = canvas.width = window.innerWidth
            H = canvas.height = window.innerHeight
        }
        resize()

        const onResize = () => {
            resize()
            buildAll()
        }
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX
            mouse.y = e.clientY
        }
        const onMouseLeave = () => {
            mouse.x = -9999
            mouse.y = -9999
        }

        window.addEventListener('resize', onResize)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseleave', onMouseLeave)

        type DeepNode = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; pulse: number; pulseSpeed: number }
        type MidNode = {
            x: number
            y: number
            ox: number
            oy: number
            vx: number
            vy: number
            r: number
            alpha: number
            col: [number, number, number]
        }
        type Sparkle = {
            x: number
            y: number
            r: number
            alpha: number
            maxA: number
            phase: number
            speed: number
            vx: number
            vy: number
            col: [number, number, number]
        }
        type Star = {
            x: number
            y: number
            vx: number
            vy: number
            len: number
            alpha: number
            life: number
            decay: number
            col: [number, number, number]
        }
        type Orb = {
            x: number
            y: number
            r: number
            alpha: number
            pulse: number
            ps: number
            vx: number
            vy: number
            col: [number, number, number]
        }

        let deepNodes: DeepNode[] = [],
            midNodes: MidNode[] = [],
            sparkles: Sparkle[] = [],
            shootingStars: Star[] = [],
            orbs: Orb[] = []

        function mkDeep() {
            deepNodes = []
            const n = Math.min(Math.floor((W * H) / 22000), 55)
            for (let i = 0; i < n; i++)
                deepNodes.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.18,
                    vy: (Math.random() - 0.5) * 0.18,
                    r: Math.random() * 1.4 + 0.5,
                    alpha: Math.random() * 0.35 + 0.1,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.008 + 0.003
                })
        }
        function mkMid() {
            midNodes = []
            const n = Math.min(Math.floor((W * H) / 12000), 90)
            for (let i = 0; i < n; i++)
                midNodes.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    ox: 0,
                    oy: 0,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    r: Math.random() * 0.9 + 0.3,
                    alpha: Math.random() * 0.5 + 0.15,
                    col: Math.random() > 0.85 ? C.amber : C.blue
                })
        }
        function mkSparkles() {
            sparkles = []
            const n = Math.min(Math.floor((W * H) / 8000), 140)
            for (let i = 0; i < n; i++) sparkles.push(newSparkle())
        }
        function newSparkle(): Sparkle {
            return {
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 0.7 + 0.2,
                alpha: 0,
                maxA: Math.random() * 0.6 + 0.2,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.025 + 0.012,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                col: Math.random() > 0.9 ? C.amber : Math.random() > 0.5 ? C.soft : C.white
            }
        }
        function mkShootingStar(): Star {
            const angle = ((Math.random() * 40 - 20) * Math.PI) / 180
            const speed = Math.random() * 6 + 5
            return {
                x: Math.random() * W * 0.5,
                y: Math.random() * H * 0.6,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + 0.5,
                len: Math.random() * 120 + 60,
                alpha: Math.random() * 0.55 + 0.25,
                life: 1,
                decay: Math.random() * 0.015 + 0.012,
                col: Math.random() > 0.7 ? C.amber : C.soft
            }
        }
        function mkOrbs() {
            orbs = []
            for (let i = 0; i < 5; i++)
                orbs.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: Math.random() * 180 + 80,
                    alpha: Math.random() * 0.04 + 0.015,
                    pulse: Math.random() * Math.PI * 2,
                    ps: Math.random() * 0.005 + 0.003,
                    vx: (Math.random() - 0.5) * 0.08,
                    vy: (Math.random() - 0.5) * 0.08,
                    col: Math.random() > 0.6 ? C.blue : C.soft
                })
        }
        function buildAll() {
            mkDeep()
            mkMid()
            mkSparkles()
            mkOrbs()
        }
        buildAll()

        let lastShot = 0
        function maybeShoot(now: number) {
            if (now - lastShot > Math.random() * 4000 + 2500) {
                shootingStars.push(mkShootingStar())
                lastShot = now
            }
        }

        function drawConnections(nodes: { x: number; y: number }[], maxDist: number, baseAlpha: number, col: [number, number, number]) {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x,
                        dy = nodes[i].y - nodes[j].y
                    const d = Math.sqrt(dx * dx + dy * dy)
                    if (d < maxDist) {
                        ctx.beginPath()
                        ctx.moveTo(nodes[i].x, nodes[i].y)
                        ctx.lineTo(nodes[j].x, nodes[j].y)
                        ctx.strokeStyle = rgba(col, baseAlpha * (1 - d / maxDist))
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }
        }
        function drawMouseLines(nodes: { x: number; y: number }[], maxDist: number) {
            nodes.forEach((p) => {
                const dx = p.x - mouse.x,
                    dy = p.y - mouse.y,
                    d = Math.sqrt(dx * dx + dy * dy)
                if (d < maxDist) {
                    ctx.beginPath()
                    ctx.moveTo(p.x, p.y)
                    ctx.lineTo(mouse.x, mouse.y)
                    ctx.strokeStyle = rgba(C.soft, 0.35 * (1 - d / maxDist))
                    ctx.lineWidth = 0.8
                    ctx.stroke()
                }
            })
        }

        let rafId: number
        function draw(now: number) {
            ctx.clearRect(0, 0, W, H)

            orbs.forEach((o) => {
                o.pulse += o.ps
                o.x += o.vx
                o.y += o.vy
                if (o.x < -o.r) o.x = W + o.r
                if (o.x > W + o.r) o.x = -o.r
                if (o.y < -o.r) o.y = H + o.r
                if (o.y > H + o.r) o.y = -o.r
                const a = o.alpha * (0.7 + 0.3 * Math.sin(o.pulse))
                const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
                g.addColorStop(0, rgba(o.col, a))
                g.addColorStop(1, rgba(o.col, 0))
                ctx.beginPath()
                ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
                ctx.fillStyle = g
                ctx.fill()
            })

            drawConnections(deepNodes, 180, 0.09, C.blue)
            deepNodes.forEach((p) => {
                p.pulse += p.pulseSpeed
                p.x += p.vx
                p.y += p.vy
                if (p.x < 0) p.x = W
                if (p.x > W) p.x = 0
                if (p.y < 0) p.y = H
                if (p.y > H) p.y = 0
                const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
                g.addColorStop(0, rgba(C.blue, a * 0.9))
                g.addColorStop(1, rgba(C.blue, 0))
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
                ctx.fillStyle = g
                ctx.fill()
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = rgba(C.soft, a)
                ctx.fill()
            })

            drawConnections(midNodes, 120, 0.12, C.blue)
            drawMouseLines(midNodes, 200)
            midNodes.forEach((p) => {
                const dxm = p.x - mouse.x,
                    dym = p.y - mouse.y,
                    dm = Math.sqrt(dxm * dxm + dym * dym)
                if (dm < 140) {
                    const f = ((140 - dm) / 140) * 0.6
                    p.vx += (dxm / dm) * f
                    p.vy += (dym / dm) * f
                }
                p.vx *= 0.97
                p.vy *= 0.97
                p.x += p.vx
                p.y += p.vy
                if (p.x < 0) p.x = W
                if (p.x > W) p.x = 0
                if (p.y < 0) p.y = H
                if (p.y > H) p.y = 0
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = rgba(p.col, p.alpha)
                ctx.fill()
            })

            sparkles.forEach((s, i) => {
                s.phase += s.speed
                s.alpha = s.maxA * Math.abs(Math.sin(s.phase))
                s.x += s.vx
                s.y += s.vy
                if (s.x < 0 || s.x > W || s.y < 0 || s.y > H) {
                    sparkles[i] = newSparkle()
                    return
                }
                const sz = s.r * (1 + 0.4 * Math.abs(Math.sin(s.phase)))
                ctx.save()
                ctx.translate(s.x, s.y)
                ctx.rotate(s.phase * 0.3)
                ctx.fillStyle = rgba(s.col, s.alpha)
                ctx.fillRect(-sz * 0.3, -sz, sz * 0.6, sz * 2)
                ctx.fillRect(-sz, -sz * 0.3, sz * 2, sz * 0.6)
                ctx.restore()
            })

            maybeShoot(now)
            shootingStars = shootingStars.filter((s) => s.life > 0)
            shootingStars.forEach((s) => {
                s.life -= s.decay
                const a = s.alpha * s.life
                const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
                const tailX = s.x - s.vx * (s.len / spd),
                    tailY = s.y - s.vy * (s.len / spd)
                const g = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
                g.addColorStop(0, rgba(s.col, 0))
                g.addColorStop(0.6, rgba(s.col, a * 0.4))
                g.addColorStop(1, rgba(C.white, a))
                ctx.beginPath()
                ctx.moveTo(tailX, tailY)
                ctx.lineTo(s.x, s.y)
                ctx.strokeStyle = g
                ctx.lineWidth = 1.5
                ctx.lineCap = 'round'
                ctx.stroke()
                const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 4)
                hg.addColorStop(0, rgba(C.white, a))
                hg.addColorStop(1, rgba(s.col, 0))
                ctx.beginPath()
                ctx.arc(s.x, s.y, 4, 0, Math.PI * 2)
                ctx.fillStyle = hg
                ctx.fill()
                s.x += s.vx
                s.y += s.vy
            })

            rafId = requestAnimationFrame(draw)
        }
        rafId = requestAnimationFrame(draw)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('resize', onResize)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseleave', onMouseLeave)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            id="particle-canvas"
        />
    )
}
