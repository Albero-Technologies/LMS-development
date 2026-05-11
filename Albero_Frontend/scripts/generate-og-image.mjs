// Generate /public/og-image.png from an inline SVG composition.
// Run: node scripts/generate-og-image.mjs
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_PNG = resolve(ROOT, 'public', 'og-image.png')
const OUT_SVG = resolve(ROOT, 'public', 'og-image.svg')

// ─── Constellation dot field (right-side decorative network) ─────────────────
function constellation() {
    // Seeded pseudo-random so the layout is stable across runs.
    let s = 1337
    const rand = () => {
        s = (s * 16807) % 2147483647
        return s / 2147483647
    }
    const W = 420
    const H = 280
    const N = 56
    const points = Array.from({ length: N }, () => ({
        x: rand() * W,
        y: rand() * H,
        r: 1 + rand() * 2.2
    }))

    // Connect nearby points (under ~110px).
    const lines = []
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const dx = points[i].x - points[j].x
            const dy = points[i].y - points[j].y
            const d = Math.hypot(dx, dy)
            if (d < 110) {
                const op = (1 - d / 110) * 0.32
                lines.push(
                    `<line x1="${points[i].x.toFixed(1)}" y1="${points[i].y.toFixed(1)}" x2="${points[j].x.toFixed(1)}" y2="${points[j].y.toFixed(1)}" stroke="#d3ebde" stroke-opacity="${op.toFixed(3)}" stroke-width="0.6"/>`
                )
            }
        }
    }
    const dots = points
        .map(
            (p) =>
                `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(2)}" fill="#d3ebde" fill-opacity="${(0.55 + Math.random() * 0.4).toFixed(2)}"/>`
        )
        .join('')
    return `${lines.join('')}${dots}`
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Page background — midnight with subtle aurora -->
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#06091a"/>
      <stop offset="55%"  stop-color="#0a0e26"/>
      <stop offset="100%" stop-color="#0d1027"/>
    </linearGradient>

    <radialGradient id="auroraEmerald" cx="0.85" cy="0.18" r="0.6">
      <stop offset="0%"   stop-color="#14785f" stop-opacity="0.55"/>
      <stop offset="55%"  stop-color="#0d4f3c" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0d4f3c" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="auroraAmber" cx="0.06" cy="0.92" r="0.55">
      <stop offset="0%"   stop-color="#b86a18" stop-opacity="0.42"/>
      <stop offset="60%"  stop-color="#b86a18" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#b86a18" stop-opacity="0"/>
    </radialGradient>

    <!-- Subtle dot grid -->
    <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#ffffff" fill-opacity="0.05"/>
    </pattern>

    <!-- Mask: keep the dot grid only inside the safe area -->
    <linearGradient id="gridMask" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="70%"  stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <mask id="fadeGrid">
      <rect width="1200" height="630" fill="url(#gridMask)"/>
    </mask>

    <!-- Emerald brand pill gradient -->
    <linearGradient id="brandFill" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="#0d4f3c"/>
      <stop offset="100%" stop-color="#14785f"/>
    </linearGradient>

    <!-- Soft inner card -->
    <linearGradient id="cardEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
  </defs>

  <!-- Base layers -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#dots)" mask="url(#fadeGrid)"/>
  <rect width="1200" height="630" fill="url(#auroraEmerald)"/>
  <rect width="1200" height="630" fill="url(#auroraAmber)"/>

  <!-- Outer editorial frame -->
  <rect x="28" y="28" width="1144" height="574" rx="22" ry="22"
        fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>

  <!-- Constellation decoration (upper-right quadrant only — must not collide
       with the bottom stat strip or the domain footer mark). -->
  <g transform="translate(720,150)">${constellation()}</g>

  <!-- ── Top-left: brand mark ───────────────────────────────────────── -->
  <g transform="translate(72,78)">
    <!-- Monogram tile -->
    <rect x="0" y="0" width="44" height="44" rx="11" fill="url(#brandFill)"/>
    <text x="22" y="30" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="24" font-style="italic" font-weight="700"
          fill="#f8f6ee">A</text>
    <!-- Wordmark -->
    <text x="60" y="20"
          font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="13" letter-spacing="3.4"
          font-weight="700" fill="#f8f6ee">ALBERO ACADEMY</text>
    <text x="60" y="38"
          font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="11" letter-spacing="2.2"
          font-weight="500" fill="#9aa1b3">CAREER-FIRST LEARNING</text>
  </g>

  <!-- Top-right: live badge -->
  <g transform="translate(950,84)">
    <rect x="0" y="0" width="178" height="32" rx="16"
          fill="#0d4f3c" fill-opacity="0.35"
          stroke="#14785f" stroke-opacity="0.55" stroke-width="1"/>
    <circle cx="18" cy="16" r="4" fill="#34d399"/>
    <circle cx="18" cy="16" r="7" fill="#34d399" fill-opacity="0.25"/>
    <text x="32" y="21"
          font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="12" letter-spacing="1.4" font-weight="600"
          fill="#d3ebde">NEW COHORTS · MAY 2026</text>
  </g>

  <!-- ── Center: editorial headline ──────────────────────────────────── -->
  <g transform="translate(72,210)">
    <!-- Eyebrow -->
    <text x="0" y="0"
          font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="13" letter-spacing="3.4" font-weight="700"
          fill="#f4d35e">— THE ALBERO ACADEMY</text>

    <!-- Display line 1 -->
    <text x="-2" y="86"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="96" font-weight="500"
          fill="#f8f6ee" letter-spacing="-2.4">Build skills.</text>

    <!-- Display line 2 (italic, emerald) -->
    <text x="-2" y="184"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="96" font-style="italic" font-weight="400"
          fill="#34d399" letter-spacing="-2.6">Get hired.</text>

    <!-- Subtitle -->
    <text x="0" y="244"
          font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="20" font-weight="400"
          fill="#c9cbd6">Live mentor-led programs in analytics, AI,</text>
    <text x="0" y="272"
          font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="20" font-weight="400"
          fill="#c9cbd6">full-stack &amp; finance — with hiring-partner referrals.</text>
  </g>

  <!-- ── Bottom: stat strip ──────────────────────────────────────────── -->
  <g transform="translate(72,520)">
    <line x1="0" y1="0" x2="1056" y2="0" stroke="#ffffff" stroke-opacity="0.10" stroke-width="1"/>

    <!-- Stat 1 -->
    <g transform="translate(0,22)">
      <text x="0" y="22"
            font-family="Georgia, 'Times New Roman', serif"
            font-size="32" font-weight="600" fill="#f8f6ee">12,000<tspan fill="#34d399">+</tspan></text>
      <text x="0" y="46"
            font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
            font-size="11" letter-spacing="2.2" font-weight="600"
            fill="#9aa1b3">LEARNERS PLACED</text>
    </g>

    <!-- Stat 2 -->
    <g transform="translate(290,22)">
      <text x="0" y="22"
            font-family="Georgia, 'Times New Roman', serif"
            font-size="32" font-weight="600" fill="#f8f6ee">180<tspan fill="#34d399">+</tspan></text>
      <text x="0" y="46"
            font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
            font-size="11" letter-spacing="2.2" font-weight="600"
            fill="#9aa1b3">HIRING PARTNERS</text>
    </g>

    <!-- Stat 3 -->
    <g transform="translate(540,22)">
      <text x="0" y="22"
            font-family="Georgia, 'Times New Roman', serif"
            font-size="32" font-weight="600" fill="#f8f6ee">92<tspan fill="#34d399">%</tspan></text>
      <text x="0" y="46"
            font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
            font-size="11" letter-spacing="2.2" font-weight="600"
            fill="#9aa1b3">PLACEMENT RATE</text>
    </g>

    <!-- Stat 4 -->
    <g transform="translate(790,22)">
      <text x="0" y="22"
            font-family="Georgia, 'Times New Roman', serif"
            font-size="32" font-weight="600" fill="#f8f6ee">4.8<tspan font-size="22" fill="#9aa1b3">/5</tspan></text>
      <text x="0" y="46"
            font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
            font-size="11" letter-spacing="2.2" font-weight="600"
            fill="#9aa1b3">COHORT RATING</text>
    </g>
  </g>

  <!-- (Domain mark intentionally omitted — the top-left wordmark
       already carries identity, and a bottom-right mark fights the
       stat strip on Twitter card crops.) -->
</svg>
`

writeFileSync(OUT_SVG, svg, 'utf8')

await sharp(Buffer.from(svg)).png({ compressionLevel: 9, quality: 95 }).toFile(OUT_PNG)

const meta = await sharp(OUT_PNG).metadata()
console.log(`✓ Wrote ${OUT_PNG}  (${meta.width}×${meta.height}, ${meta.size ?? '?'} bytes)`)
console.log(`✓ Wrote ${OUT_SVG}  (source)`)
