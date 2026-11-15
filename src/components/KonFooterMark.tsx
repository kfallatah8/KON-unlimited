// KON footer mark, set like fine jewellery: each letter is a champagne-gold channel paved with two
// rows of round brilliant-cut stones (teal, deep teal and a few white diamonds). Every stone is a
// real faceted drawing (table, star and girdle facets, a specular glint, four prongs), reused
// through <use>, so the whole piece stays one crisp SVG at any size. A few stones twinkle and a
// slow light sweeps across the pavé.
import { useMemo } from 'react'

type Pt = [number, number]
const STEP = 24 // centre-to-centre along a row
const ROWS = [-12, 12] // two rows of pavé, offset either side of the letter's spine
const GEM = 24 // drawn size of one stone

const LINES: [Pt, Pt][] = [
  // K
  [[168, 62], [168, 268]],
  [[318, 62], [196, 160]],
  [[214, 150], [322, 268]],
  // N
  [[692, 268], [692, 62]],
  [[704, 70], [836, 260]],
  [[848, 268], [848, 62]],
]
const O = { cx: 500, cy: 165, rx: 92, ry: 103 }

function onLine([a, b]: [Pt, Pt], off: number): Pt[] {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = Math.hypot(dx, dy)
  const nx = -dy / len, ny = dx / len
  const n = Math.max(1, Math.round(len / STEP))
  return Array.from({ length: n + 1 }, (_, i) => [a[0] + (dx * i) / n + nx * off, a[1] + (dy * i) / n + ny * off] as Pt)
}

function onEllipse(off: number): Pt[] {
  const rx = O.rx + off, ry = O.ry + off
  const fine: Pt[] = Array.from({ length: 720 }, (_, i) => {
    const t = (i / 720) * Math.PI * 2
    return [O.cx + rx * Math.sin(t), O.cy - ry * Math.cos(t)]
  })
  let total = 0
  for (let i = 1; i <= fine.length; i++) total += Math.hypot(fine[i % fine.length][0] - fine[i - 1][0], fine[i % fine.length][1] - fine[i - 1][1])
  const n = Math.round(total / STEP), step = total / n
  const out: Pt[] = [fine[0]]
  let acc = 0
  for (let i = 1; i < fine.length && out.length < n; i++) {
    acc += Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1])
    if (acc >= step * out.length) out.push(fine[i])
  }
  return out
}

interface Stone { x: number; y: number; kind: 'a' | 'b' | 'c'; rot: number; tw: number }

function layout(): Stone[] {
  const pts: Pt[] = []
  for (const off of ROWS) {
    LINES.forEach((l) => pts.push(...onLine(l, off)))
    pts.push(...onEllipse(off))
  }
  const kept: Pt[] = []
  for (const p of pts) if (!kept.some((k) => Math.hypot(k[0] - p[0], k[1] - p[1]) < 19)) kept.push(p)
  // Deterministic variety: mostly teal, some deep teal, a few white diamonds; a handful twinkle.
  return kept.map(([x, y], i) => {
    const r = ((i * 7919) % 97) / 97
    return { x, y, kind: r < 0.14 ? 'c' : r < 0.36 ? 'b' : 'a', rot: (i * 37) % 45, tw: (i * 13) % 11 === 0 ? ((i * 0.37) % 6) : -1 }
  })
}

// Facets of a round brilliant seen from above, in a -50..50 box.
function facets() {
  const P = (r: number, a: number): string => `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
  const T = 23, G = 47, out: { d: string; o: number }[] = []
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2 - Math.PI / 8, a1 = a0 + Math.PI / 4, am = (a0 + a1) / 2
    out.push({ d: `M${P(T, a0)} L${P(T, a1)} L${P(G * 0.82, am)}Z`, o: i % 2 ? 0.34 : 0.1 }) // star facets
    out.push({ d: `M${P(T, a0)} L${P(G * 0.82, am)} L${P(G, a0 + Math.PI / 16)} L${P(G, a0)}Z`, o: i % 2 ? 0.05 : 0.28 }) // upper girdle
    out.push({ d: `M${P(T, a1)} L${P(G * 0.82, am)} L${P(G, a1 - Math.PI / 16)} L${P(G, a1)}Z`, o: i % 2 ? 0.24 : 0.06 })
  }
  const table = Array.from({ length: 8 }, (_, i) => P(T, (i / 8) * Math.PI * 2 - Math.PI / 8)).join(' ')
  return { out, table }
}

function GemSymbol({ id, base }: { id: string; base: string }) {
  const { out, table } = useMemo(facets, [])
  return (
    <symbol id={id} viewBox="-54 -54 108 108" overflow="visible">
      <circle r="49" fill={`url(#${base})`} />
      {out.map((f, i) => <path key={i} d={f.d} fill="#fff" opacity={f.o} />)}
      <polygon points={table} fill="#fff" opacity="0.16" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />
      <circle r="48.5" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" />
      <ellipse cx="-15" cy="-19" rx="11" ry="5.5" transform="rotate(-35 -15 -19)" fill="#fff" opacity="0.92" />
      <circle cx="17" cy="15" r="3.4" fill="#fff" opacity="0.7" />
      {[45, 135, 225, 315].map((a) => (
        <circle key={a} cx={50 * Math.cos((a * Math.PI) / 180)} cy={50 * Math.sin((a * Math.PI) / 180)} r="7.5" fill="url(#kg-prong)" />
      ))}
    </symbol>
  )
}

export function KonFooterMark() {
  const stones = useMemo(layout, [])
  const channel = (props: Record<string, unknown>) => (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {LINES.map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />)}
      <ellipse cx={O.cx} cy={O.cy} rx={O.rx} ry={O.ry} />
    </g>
  )
  const pave = (prefix: string) => stones.map((s, i) => (
    <use key={prefix + i} href={`#kg-${s.kind}`} x={s.x - GEM / 2} y={s.y - GEM / 2} width={GEM} height={GEM} transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
  ))
  return (
    <div className="kon-foot kon-pave" dir="ltr">
      <svg viewBox="0 0 1000 360" role="img" aria-label="KON Unlimited">
        <defs>
          <radialGradient id="kg-ga" cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#effffc" />
            <stop offset="0.22" stopColor="#8af3e4" />
            <stop offset="0.55" stopColor="#1fbcaa" />
            <stop offset="0.82" stopColor="#07665e" />
            <stop offset="1" stopColor="#033a36" />
          </radialGradient>
          <radialGradient id="kg-gb" cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#c8fff6" />
            <stop offset="0.25" stopColor="#3fcdb9" />
            <stop offset="0.6" stopColor="#0b7c71" />
            <stop offset="1" stopColor="#01302c" />
          </radialGradient>
          <radialGradient id="kg-gc" cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.4" stopColor="#e9f6f4" />
            <stop offset="0.75" stopColor="#a9c9c5" />
            <stop offset="1" stopColor="#6f8f8b" />
          </radialGradient>
          <radialGradient id="kg-prong" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff6dc" />
            <stop offset="0.5" stopColor="#d9b46a" />
            <stop offset="1" stopColor="#7a5a24" />
          </radialGradient>
          <linearGradient id="kg-metal" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="290">
            <stop offset="0" stopColor="#fff3d1" />
            <stop offset="0.3" stopColor="#e2c07a" />
            <stop offset="0.55" stopColor="#a87d36" />
            <stop offset="0.78" stopColor="#ecd197" />
            <stop offset="1" stopColor="#7d5b22" />
          </linearGradient>
          <linearGradient id="kg-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kg-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="kg-soft" x="-10%" y="-20%" width="120%" height="160%"><feGaussianBlur stdDeviation="12" /></filter>
          <filter id="kg-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
          <GemSymbol id="kg-a" base="kg-ga" />
          <GemSymbol id="kg-b" base="kg-gb" />
          <GemSymbol id="kg-c" base="kg-gc" />
          <mask id="kg-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="360">
            {channel({ stroke: '#fff', strokeWidth: 58 })}
          </mask>
          <mask id="kg-refl" maskUnits="userSpaceOnUse" x="0" y="284" width="1000" height="76">
            <rect x="0" y="290" width="1000" height="70" fill="url(#kg-fade)" />
          </mask>
        </defs>

        <ellipse cx="500" cy="300" rx="370" ry="14" fill="#000" opacity="0.5" filter="url(#kg-soft)" />

        {/* soft teal light the stones throw around them */}
        {channel({ stroke: '#2fd8c3', strokeWidth: 70, opacity: 0.22, filter: 'url(#kg-glow)' })}

        {/* reflection on the floor */}
        <g mask="url(#kg-refl)" opacity="0.5">
          <g transform="translate(0 586) scale(1 -1)">
            {channel({ stroke: 'url(#kg-metal)', strokeWidth: 58 })}
            {pave('r')}
          </g>
        </g>

        {/* the setting: a depth edge, the gold channel, and the dark bed the stones sit in */}
        {channel({ stroke: '#3b2a0c', strokeWidth: 60, transform: 'translate(3 7)' })}
        {channel({ stroke: 'url(#kg-metal)', strokeWidth: 58 })}
        {channel({ stroke: '#021614', strokeWidth: 50 })}

        <g className="kg-stones">{pave('s')}</g>

        <g className="kg-twinkles" aria-hidden="true">
          {stones.filter((s) => s.tw >= 0).map((s, i) => (
            <path key={i} className="kg-tw" style={{ animationDelay: `${s.tw}s` }}
              d={`M${s.x} ${s.y - 16} L${s.x + 2} ${s.y - 2} L${s.x + 16} ${s.y} L${s.x + 2} ${s.y + 2} L${s.x} ${s.y + 16} L${s.x - 2} ${s.y + 2} L${s.x - 16} ${s.y} L${s.x - 2} ${s.y - 2}Z`}
              fill="#fff" />
          ))}
        </g>

        <g mask="url(#kg-mask)">
          <rect className="kf-sheen" x="-1000" width="1000" height="360" fill="url(#kg-sheen)" />
        </g>
      </svg>
      <p className="kf-sub"><span>Unlimited</span></p>
    </div>
  )
}
