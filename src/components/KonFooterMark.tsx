// KON footer mark: three cut crystals. Each letter is a solid block of teal crystal finished the
// way a stone cutter finishes an emerald cut: a flat polished table on top and a ring of bevelled
// facets around every edge. Every facet is lit by its own angle to one light (top left), so the
// shading comes from the geometry, never from drawn outlines. A dark extruded body gives depth,
// a light sweeps across the table now and then, and a few facet corners catch a glint.
import { useMemo } from 'react'

type P = [number, number]
const BEVEL = 17
const DEPTH = 12

// Letter outlines, chamfered like emerald-cut stones. The O is an octagon, like the crystals that
// form KON in the finale.
const ch = (pts: P[], c: number, keep: number[] = []): P[] => {
  const out: P[] = []
  pts.forEach((p, i) => {
    if (keep.includes(i)) { out.push(p); return }
    const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length]
    const da = Math.hypot(a[0] - p[0], a[1] - p[1]), db = Math.hypot(b[0] - p[0], b[1] - p[1])
    out.push([p[0] + ((a[0] - p[0]) * c) / da, p[1] + ((a[1] - p[1]) * c) / da])
    out.push([p[0] + ((b[0] - p[0]) * c) / db, p[1] + ((b[1] - p[1]) * c) / db])
  })
  return out
}
const K: P[] = ch([[146, 64], [212, 64], [212, 146], [292, 64], [374, 64], [268, 166], [378, 276], [294, 276], [212, 192], [212, 276], [146, 276]], 11, [2, 3, 4, 5, 6, 7, 8])
const N: P[] = ch([[640, 276], [640, 64], [702, 64], [796, 196], [796, 64], [858, 64], [858, 276], [796, 276], [702, 146], [702, 276]], 11, [2, 3, 7, 8])
const oct = (cx: number, cy: number, w: number, h: number, c: number): P[] => [
  [cx - w + c, cy - h], [cx + w - c, cy - h], [cx + w, cy - h + c], [cx + w, cy + h - c],
  [cx + w - c, cy + h], [cx - w + c, cy + h], [cx - w, cy + h - c], [cx - w, cy - h + c],
]
const O_OUT = oct(506, 170, 108, 106, 46)
const O_IN = oct(506, 170, 46, 46, 19)

const area = (p: P[]) => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1] }, 0) / 2

// Move every edge by d along its inward normal and re-intersect neighbours (mitred offset).
function inset(p: P[], d: number): P[] {
  const s = area(p) > 0 ? 1 : -1
  const n = p.length
  const lines = p.map((a, i) => {
    const b = p[(i + 1) % n]
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy)
    const nx = (-dy / L) * s, ny = (dx / L) * s
    return { a: [a[0] + nx * d, a[1] + ny * d] as P, dx, dy }
  })
  return p.map((_, i) => {
    const l1 = lines[(i - 1 + n) % n], l2 = lines[i]
    const den = l1.dx * l2.dy - l1.dy * l2.dx
    if (Math.abs(den) < 1e-6) return l2.a
    const t = ((l2.a[0] - l1.a[0]) * l2.dy - (l2.a[1] - l1.a[1]) * l2.dx) / den
    const q: P = [l1.a[0] + l1.dx * t, l1.a[1] + l1.dy * t]
    // Sharp tips (the arms of K, the joins of N) would push the mitre far out; cap it.
    const o = p[i], dist = Math.hypot(q[0] - o[0], q[1] - o[1]), cap = Math.abs(d) * 2.4
    return dist > cap ? [o[0] + ((q[0] - o[0]) * cap) / dist, o[1] + ((q[1] - o[1]) * cap) / dist] as P : q
  })
}

const LIGHT = (() => { const v = [-0.55, -0.75, 0.62]; const m = Math.hypot(...v); return v.map((x) => x / m) })()
const RAMP = ['#022e2a', '#05514a', '#0b7a6e', '#16a594', '#3fd0bd', '#9af2e5', '#e6fffb']
function shade(t: number) {
  const x = Math.max(0, Math.min(1, t)) * (RAMP.length - 1)
  return RAMP[Math.round(x)]
}

interface Facet { d: string; fill: string; hi: boolean }

// One ring of facets between an outline and its inset. `outward` is +1 for an outer edge, -1 for
// the edge of a hole (its bevel faces the other way).
function ring(outer: P[], inner: P[], outward: 1 | -1): Facet[] {
  const s = area(outer) > 0 ? 1 : -1
  return outer.map((a, i) => {
    const b = outer[(i + 1) % outer.length], ia = inner[i], ib = inner[(i + 1) % inner.length]
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy)
    const nx = (dy / L) * s * outward, ny = (-dx / L) * s * outward // points away from the table
    const nz = 0.9, m = Math.hypot(nx, ny, nz)
    const lit = (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / m
    const t = 0.08 + lit * 0.98
    return { d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${ib[0].toFixed(1)} ${ib[1].toFixed(1)}L${ia[0].toFixed(1)} ${ia[1].toFixed(1)}Z`, fill: shade(t), hi: t > 0.78 }
  })
}

const path = (p: P[]) => `M${p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L')}Z`

export function KonFooterMark() {
  const g = useMemo(() => {
    const kIn = inset(K, BEVEL), nIn = inset(N, BEVEL), oIn = inset(O_OUT, BEVEL), hOut = inset(O_IN, -BEVEL)
    return {
      body: [path(K), path(N), `${path(O_OUT)}${path(O_IN)}`],
      facets: [...ring(K, kIn, 1), ...ring(N, nIn, 1), ...ring(O_OUT, oIn, 1), ...ring(O_IN, hOut, -1)],
      tables: [path(kIn), path(nIn), `${path(oIn)}${path(hOut)}`],
      glints: [kIn[0], kIn[kIn.length - 1], oIn[0], oIn[7], nIn[3], nIn[4]],
    }
  }, [])
  return (
    <div className="kon-foot kon-crystal" dir="ltr">
      <svg viewBox="0 0 1000 360" role="img" aria-label="KON Unlimited">
        <defs>
          <linearGradient id="kc-table" gradientUnits="userSpaceOnUse" x1="140" y1="60" x2="760" y2="300">
            <stop offset="0" stopColor="#7eeedd" />
            <stop offset="0.35" stopColor="#27bba8" />
            <stop offset="0.7" stopColor="#0f8a7d" />
            <stop offset="1" stopColor="#0a6158" />
          </linearGradient>
          <linearGradient id="kc-inner" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="270">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#001a18" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="kc-streak" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="0.53" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.62" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.66" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kc-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kc-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="kc-blur" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="16" /></filter>
          <filter id="kc-glint" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4" /></filter>
          <clipPath id="kc-clip">{g.tables.map((d, i) => <path key={i} d={d} clipRule="evenodd" />)}</clipPath>
          <mask id="kc-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="360">
            {g.body.map((d, i) => <path key={i} d={d} fill="#fff" fillRule="evenodd" />)}
          </mask>
          <mask id="kc-refl" maskUnits="userSpaceOnUse" x="0" y="290" width="1000" height="70">
            <rect x="0" y="292" width="1000" height="68" fill="url(#kc-fade)" />
          </mask>
        </defs>

        {/* the light the crystals throw onto the dark around them */}
        <g filter="url(#kc-blur)" opacity="0.5">
          {g.body.map((d, i) => <path key={i} d={d} fill="#1fc4ae" fillRule="evenodd" />)}
        </g>
        <ellipse cx="505" cy="300" rx="380" ry="12" fill="#000" opacity="0.55" filter="url(#kc-blur)" />

        {/* floor reflection */}
        <g mask="url(#kc-refl)" opacity="0.55">
          <g transform="translate(0 572) scale(1 -1)">
            {g.facets.map((f, i) => <path key={i} d={f.d} fill={f.fill} />)}
            {g.tables.map((d, i) => <path key={i} d={d} fill="url(#kc-table)" fillRule="evenodd" />)}
          </g>
        </g>

        {/* body: the stone's depth, stacked a few pixels down and right */}
        {Array.from({ length: DEPTH }, (_, i) => DEPTH - i).map((k) => (
          <g key={k} transform={`translate(${k * 0.45} ${k * 0.95})`}>
            {g.body.map((d, j) => <path key={j} d={d} fill={k > DEPTH * 0.6 ? '#011917' : '#032b28'} fillRule="evenodd" />)}
          </g>
        ))}

        {/* bevel facets, each lit by its angle; hairline joins in the facet's own colour hide seams */}
        {g.facets.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth="0.6" strokeLinejoin="round" />)}

        {/* the polished table, with light refracting through it */}
        {g.tables.map((d, i) => <path key={i} d={d} fill="url(#kc-table)" fillRule="evenodd" />)}
        <g clipPath="url(#kc-clip)">
          <rect x="0" y="0" width="1000" height="360" fill="url(#kc-inner)" />
          <rect x="100" y="40" width="820" height="280" fill="url(#kc-streak)" />
        </g>

        {/* a slow light passing over the stones */}
        <g mask="url(#kc-mask)">
          <rect className="kf-sheen" x="-1000" width="1000" height="360" fill="url(#kc-sheen)" />
        </g>

        <g className="kc-glints" filter="url(#kc-glint)">
          {g.glints.map(([x, y], i) => (
            <path key={i} className="kg-tw" style={{ animationDelay: `${i * 1.1}s` }} fill="#fff"
              d={`M${x} ${y - 13}L${x + 1.6} ${y - 1.6}L${x + 13} ${y}L${x + 1.6} ${y + 1.6}L${x} ${y + 13}L${x - 1.6} ${y + 1.6}L${x - 13} ${y}L${x - 1.6} ${y - 1.6}Z`} />
          ))}
        </g>
      </svg>
      <p className="kf-sub"><span>Unlimited</span></p>
    </div>
  )
}
