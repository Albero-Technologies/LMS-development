import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// A self-contained vanilla-Three scene that renders three softly-orbiting
// shapes (icosahedron, torus knot, octahedron) inside whichever container it's
// mounted in. Reads its colours from CSS variables so it stays on-brand under
// both light and dark themes, and observes the parent for resizes so it stays
// crisp.
//
// Variants: 'orbit' (default) leans on shape variety + lighting; 'particles'
// renders a starfield-style point cloud. Both pause when the user is hovering
// (so the animation stops feeling busy when the cursor lands on the section).
//
// Lightweight on purpose — no orbit controls, no post-processing.

type Variant = 'orbit' | 'particles' | 'knowledge-graph'

interface Props {
    variant?: Variant
    /** Force a specific colour palette; defaults to brand emerald. */
    colors?: { primary?: string; secondary?: string; accent?: string }
    /** Forwarded to the canvas wrapper. */
    className?: string
    style?: React.CSSProperties
    /** Pause the auto-rotation while the cursor is over the canvas. Default true. */
    pauseOnHover?: boolean
}

function readBrandColors() {
    if (typeof window === 'undefined') return { primary: '#0d4f3c', secondary: '#14785f', accent: '#b86a18' }
    const style = getComputedStyle(document.documentElement)
    return {
        primary: style.getPropertyValue('--brand').trim() || '#0d4f3c',
        secondary: style.getPropertyValue('--brand-mid').trim() || '#14785f',
        accent: style.getPropertyValue('--accent').trim() || '#b86a18'
    }
}

export default function ThreeShowcase({ variant = 'orbit', colors, className, style, pauseOnHover = true }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [hovered, setHovered] = useState(false)
    const hoveredRef = useRef(false)
    hoveredRef.current = pauseOnHover && hovered

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const palette = { ...readBrandColors(), ...(colors || {}) }
        const width = container.clientWidth || 600
        const height = container.clientHeight || 400

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(width, height, false)
        renderer.setClearColor(0x000000, 0)
        container.appendChild(renderer.domElement)
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height = '100%'
        renderer.domElement.style.display = 'block'

        // Scene + camera
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
        camera.position.set(0, 0, 7)

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.55)
        scene.add(ambient)

        const keyLight = new THREE.DirectionalLight(new THREE.Color(palette.primary), 1.2)
        keyLight.position.set(4, 5, 6)
        scene.add(keyLight)

        const rim = new THREE.PointLight(new THREE.Color(palette.accent), 1.4, 30)
        rim.position.set(-5, -2, 4)
        scene.add(rim)

        // Mouse parallax target
        const mouse = { x: 0, y: 0 }
        const onPointerMove = (e: PointerEvent) => {
            const rect = container.getBoundingClientRect()
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        }
        container.addEventListener('pointermove', onPointerMove)

        // ─── Build geometry by variant ───────────────────────────────────────────
        const meshes: THREE.Object3D[] = []
        let particles: THREE.Points | null = null
        // Knowledge-graph state
        let kgCore: THREE.Mesh | null = null
        let kgInnerNodes: THREE.Mesh[] = []
        let kgOuterNodes: THREE.Mesh[] = []
        let kgInnerLines: THREE.LineSegments | null = null
        let kgOuterLines: THREE.LineSegments | null = null
        let kgPulses: THREE.Mesh[] = []
        // Pulse travel meta — index into the line segments array, plus a phase
        // so each pulse travels along its own connection on its own schedule.
        let kgPulseMeta: { from: THREE.Vector3; to: THREE.Vector3; phase: number; speed: number }[] = []
        let kgRoot: THREE.Group | null = null

        if (variant === 'knowledge-graph') {
            const root = new THREE.Group()
            kgRoot = root
            scene.add(root)

            // ── Glowing learner core ──────────────────────────────────────
            const coreMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(palette.primary),
                emissive: new THREE.Color(palette.primary),
                emissiveIntensity: 0.55,
                roughness: 0.25,
                metalness: 0.4
            })
            kgCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), coreMat)
            root.add(kgCore)
            // Soft halo behind the core
            const halo = new THREE.Mesh(
                new THREE.SphereGeometry(0.95, 32, 32),
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color(palette.primary),
                    transparent: true,
                    opacity: 0.12
                })
            )
            root.add(halo)
            meshes.push(halo)

            // ── Inner ring — "skills you ship with" ─────────────────────────
            const INNER_COUNT = 8
            const INNER_R = 1.9
            const innerColor = new THREE.Color(palette.secondary)
            for (let i = 0; i < INNER_COUNT; i++) {
                const angle = (i / INNER_COUNT) * Math.PI * 2
                const node = new THREE.Mesh(
                    new THREE.IcosahedronGeometry(0.16, 0),
                    new THREE.MeshStandardMaterial({
                        color: innerColor,
                        emissive: innerColor,
                        emissiveIntensity: 0.4,
                        roughness: 0.4,
                        metalness: 0.5
                    })
                )
                node.position.set(Math.cos(angle) * INNER_R, Math.sin(angle) * INNER_R * 0.42, Math.sin(angle * 1.3) * 0.4)
                root.add(node)
                kgInnerNodes.push(node)
            }

            // ── Outer ring — "180+ hiring partners" ─────────────────────────
            const OUTER_COUNT = 14
            const OUTER_R = 3.4
            const outerColor = new THREE.Color(palette.accent)
            for (let i = 0; i < OUTER_COUNT; i++) {
                const angle = (i / OUTER_COUNT) * Math.PI * 2 + 0.18
                const node = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.13, 0),
                    new THREE.MeshStandardMaterial({
                        color: outerColor,
                        emissive: outerColor,
                        emissiveIntensity: 0.55,
                        roughness: 0.35,
                        metalness: 0.55
                    })
                )
                node.position.set(Math.cos(angle) * OUTER_R, Math.sin(angle) * OUTER_R * 0.34, Math.cos(angle * 0.9 + 1.2) * 0.7)
                root.add(node)
                kgOuterNodes.push(node)
            }

            // ── Edges — core → inner, then inner → nearest outer pair ──────
            const innerEdgeVerts: number[] = []
            kgInnerNodes.forEach((node) => {
                innerEdgeVerts.push(0, 0, 0, node.position.x, node.position.y, node.position.z)
                kgPulseMeta.push({
                    from: new THREE.Vector3(0, 0, 0),
                    to: node.position.clone(),
                    phase: Math.random(),
                    speed: 0.35 + Math.random() * 0.4
                })
            })
            const innerGeom = new THREE.BufferGeometry()
            innerGeom.setAttribute('position', new THREE.Float32BufferAttribute(innerEdgeVerts, 3))
            kgInnerLines = new THREE.LineSegments(
                innerGeom,
                new THREE.LineBasicMaterial({ color: new THREE.Color(palette.primary), transparent: true, opacity: 0.55 })
            )
            root.add(kgInnerLines)

            const outerEdgeVerts: number[] = []
            kgInnerNodes.forEach((inner, i) => {
                // Connect each inner node to the two closest outer nodes — gives
                // the graph a clean delegated-tree look rather than a hairball.
                const outerByDist = kgOuterNodes
                    .map((o, j) => ({ j, d: o.position.distanceTo(inner.position) }))
                    .sort((a, b) => a.d - b.d)
                    .slice(0, 2)
                outerByDist.forEach(({ j }) => {
                    const o = kgOuterNodes[j]
                    outerEdgeVerts.push(inner.position.x, inner.position.y, inner.position.z, o.position.x, o.position.y, o.position.z)
                    if ((i + j) % 3 === 0) {
                        kgPulseMeta.push({
                            from: inner.position.clone(),
                            to: o.position.clone(),
                            phase: Math.random(),
                            speed: 0.25 + Math.random() * 0.35
                        })
                    }
                })
            })
            const outerGeom = new THREE.BufferGeometry()
            outerGeom.setAttribute('position', new THREE.Float32BufferAttribute(outerEdgeVerts, 3))
            kgOuterLines = new THREE.LineSegments(
                outerGeom,
                new THREE.LineBasicMaterial({
                    color: new THREE.Color(palette.accent),
                    transparent: true,
                    opacity: 0.3
                })
            )
            root.add(kgOuterLines)

            // ── Pulses — small bright spheres that travel along edges so the
            //    graph feels alive (data flowing between learner and partners).
            const pulseGeom = new THREE.SphereGeometry(0.06, 16, 16)
            const pulseMatPrimary = new THREE.MeshBasicMaterial({ color: new THREE.Color(palette.secondary) })
            const pulseMatAccent = new THREE.MeshBasicMaterial({ color: new THREE.Color(palette.accent) })
            kgPulseMeta.forEach((meta, i) => {
                const pulse = new THREE.Mesh(pulseGeom, i < INNER_COUNT ? pulseMatPrimary : pulseMatAccent)
                pulse.position.copy(meta.from)
                root.add(pulse)
                kgPulses.push(pulse)
            })

            // ── Background star dust ───────────────────────────────────────
            const COUNT = 400
            const positions = new Float32Array(COUNT * 3)
            for (let i = 0; i < COUNT; i++) {
                const r = 5 + Math.random() * 4
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos(2 * Math.random() - 1)
                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
                positions[i * 3 + 2] = r * Math.cos(phi)
            }
            const dustGeom = new THREE.BufferGeometry()
            dustGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
            const dust = new THREE.Points(
                dustGeom,
                new THREE.PointsMaterial({
                    color: new THREE.Color(palette.primary),
                    size: 0.04,
                    transparent: true,
                    opacity: 0.45,
                    sizeAttenuation: true
                })
            )
            root.add(dust)
            particles = dust
        } else if (variant === 'orbit') {
            // Centre icosahedron — wireframe with a soft inner core
            const ico = new THREE.IcosahedronGeometry(1.4, 1)
            const icoMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(palette.primary),
                wireframe: true,
                transparent: true,
                opacity: 0.85,
                roughness: 0.3,
                metalness: 0.3
            })
            const icoMesh = new THREE.Mesh(ico, icoMat)
            scene.add(icoMesh)
            meshes.push(icoMesh)

            // Inner glowing core
            const core = new THREE.Mesh(
                new THREE.SphereGeometry(0.55, 32, 32),
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color(palette.secondary),
                    transparent: true,
                    opacity: 0.55
                })
            )
            scene.add(core)
            meshes.push(core)

            // Orbiting torus knot
            const knot = new THREE.Mesh(
                new THREE.TorusKnotGeometry(0.5, 0.16, 100, 16),
                new THREE.MeshStandardMaterial({
                    color: new THREE.Color(palette.accent),
                    roughness: 0.25,
                    metalness: 0.55,
                    transparent: true,
                    opacity: 0.95
                })
            )
            knot.position.set(2.6, 0.8, 0.6)
            scene.add(knot)
            meshes.push(knot)

            // Floating octahedron
            const oct = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.55, 0),
                new THREE.MeshStandardMaterial({
                    color: new THREE.Color(palette.primary),
                    roughness: 0.5,
                    metalness: 0.45,
                    transparent: true,
                    opacity: 0.9
                })
            )
            oct.position.set(-2.4, -1.0, 0.4)
            scene.add(oct)
            meshes.push(oct)

            // Star-like ring of small spheres
            const ringGroup = new THREE.Group()
            for (let i = 0; i < 24; i++) {
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.06, 12, 12),
                    new THREE.MeshBasicMaterial({
                        color: new THREE.Color(palette.secondary),
                        transparent: true,
                        opacity: 0.7
                    })
                )
                const angle = (i / 24) * Math.PI * 2
                sphere.position.set(Math.cos(angle) * 3.5, Math.sin(angle) * 3.5 * 0.32, 0)
                ringGroup.add(sphere)
            }
            ringGroup.rotation.x = Math.PI * 0.18
            scene.add(ringGroup)
            meshes.push(ringGroup)
        } else {
            // Particle starfield
            const COUNT = 1200
            const positions = new Float32Array(COUNT * 3)
            for (let i = 0; i < COUNT; i++) {
                const r = 3 + Math.random() * 4
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos(2 * Math.random() - 1)
                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
                positions[i * 3 + 2] = r * Math.cos(phi)
            }
            const geom = new THREE.BufferGeometry()
            geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
            const mat = new THREE.PointsMaterial({
                color: new THREE.Color(palette.primary),
                size: 0.05,
                transparent: true,
                opacity: 0.85,
                sizeAttenuation: true
            })
            particles = new THREE.Points(geom, mat)
            scene.add(particles)
        }

        // ─── Animation loop ──────────────────────────────────────────────────────
        let frameId = 0
        const clock = new THREE.Clock()
        let timeAlive = 0

        const animate = () => {
            const delta = clock.getDelta()
            // Only advance the timeline if we're not hovered
            if (!hoveredRef.current) {
                timeAlive += delta
            }
            const t = timeAlive

            if (variant === 'orbit') {
                const [icoMesh, core, knot, oct, ring] = meshes as [THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Group]
                if (icoMesh) {
                    icoMesh.rotation.x = t * 0.3
                    icoMesh.rotation.y = t * 0.42
                }
                if (core) {
                    core.scale.setScalar(0.95 + Math.sin(t * 1.6) * 0.06)
                }
                if (knot) {
                    knot.rotation.x = t * 0.7
                    knot.rotation.y = t * 0.55
                    knot.position.x = 2.6 + Math.sin(t * 0.6) * 0.18
                    knot.position.y = 0.8 + Math.cos(t * 0.6) * 0.18
                }
                if (oct) {
                    oct.rotation.x = -t * 0.5
                    oct.rotation.y = t * 0.4
                    oct.position.y = -1.0 + Math.sin(t * 0.9) * 0.18
                }
                if (ring) {
                    ring.rotation.z = t * 0.18
                }
            } else if (variant === 'knowledge-graph' && kgRoot && kgCore) {
                // Whole graph drifts slowly so it never feels static.
                kgRoot.rotation.y = t * 0.18
                kgRoot.rotation.x = Math.sin(t * 0.25) * 0.12

                // Core breathes in place.
                kgCore.rotation.x = t * 0.4
                kgCore.rotation.y = t * 0.5
                kgCore.scale.setScalar(0.95 + Math.sin(t * 1.4) * 0.07)

                // Inner skill nodes — each on its own gentle bob so they don't
                // move in unison.
                kgInnerNodes.forEach((n, i) => {
                    n.rotation.x = t * (0.5 + (i % 3) * 0.1)
                    n.rotation.y = t * 0.35
                    const baseScale = 1 + Math.sin(t * 1.3 + i * 0.7) * 0.18
                    n.scale.setScalar(baseScale)
                })

                // Outer partner nodes — slower, rotates around with a phase
                // offset so the whole outer ring feels independent.
                kgOuterNodes.forEach((n, i) => {
                    n.rotation.x = -t * 0.4
                    n.rotation.y = t * 0.5
                    n.scale.setScalar(0.95 + Math.sin(t * 0.9 + i * 0.45) * 0.12)
                })

                // Pulses travel along their assigned edges. We modulo the
                // phase so they loop back continuously.
                kgPulses.forEach((pulse, i) => {
                    const meta = kgPulseMeta[i]
                    const u = (meta.phase + t * meta.speed) % 1
                    pulse.position.lerpVectors(meta.from, meta.to, u)
                    // Fade in/out so the pulse looks like a packet, not a
                    // bead glued to the line.
                    const fade = Math.sin(u * Math.PI)
                    ;(pulse.material as THREE.MeshBasicMaterial).opacity = 0.2 + fade * 0.8
                    ;(pulse.material as THREE.MeshBasicMaterial).transparent = true
                    pulse.scale.setScalar(0.7 + fade * 0.6)
                })

                // Background dust drifts independently of the graph so the
                // depth illusion holds.
                if (particles) {
                    particles.rotation.y = -t * 0.04
                }
            } else if (particles) {
                particles.rotation.y = t * 0.06
                particles.rotation.x = Math.sin(t * 0.18) * 0.18
            }

            // Camera parallax — eased toward the cursor
            camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04
            camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.04
            camera.lookAt(0, 0, 0)

            renderer.render(scene, camera)
            frameId = requestAnimationFrame(animate)
        }

        animate()

        // ─── Resize observer ─────────────────────────────────────────────────────
        const resize = () => {
            const w = container.clientWidth
            const h = container.clientHeight
            if (!w || !h) return
            renderer.setSize(w, h, false)
            camera.aspect = w / h
            camera.updateProjectionMatrix()
        }
        const ro = new ResizeObserver(resize)
        ro.observe(container)

        // ─── Cleanup ─────────────────────────────────────────────────────────────
        return () => {
            cancelAnimationFrame(frameId)
            ro.disconnect()
            container.removeEventListener('pointermove', onPointerMove)
            scene.traverse((obj) => {
                if ((obj as THREE.Mesh).geometry) {
                    ;(obj as THREE.Mesh).geometry.dispose()
                }
                const mat = (obj as THREE.Mesh).material
                if (mat) {
                    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
                    else mat.dispose()
                }
            })
            renderer.dispose()
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement)
            }
        }
        // colors and variant changes should rebuild the whole scene
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variant, colors?.primary, colors?.secondary, colors?.accent])

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={className}
            style={{ width: '100%', height: '100%', ...style }}
            aria-hidden="true"
        />
    )
}
