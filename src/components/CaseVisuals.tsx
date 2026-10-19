// Hand-built case illustrations: VIP transport operations map, WebAR studio composition,
// and sector icons for the smaller cards. All schematic: no figures, names or real routes.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'

/* ---------------------------------------------------------------- icons */
type IconName = 'plane' | 'hotel' | 'venue' | 'dispatch' | 'chart' | 'food' | 'megaphone' | 'bell' | 'voice' | 'building' | 'bike' | 'people'

const ICONS: Record<IconName, ReactNode> = {
  plane: <path d="M12 3c.8 0 1.3.7 1.3 1.6v4.6l7.2 4.2v1.8l-7.2-2.2v4.3l2.2 1.6v1.4L12 19.4l-3.5.9v-1.4l2.2-1.6V14l-7.2 2.2v-1.8l7.2-4.2V4.6C10.7 3.7 11.2 3 12 3z" />,
  hotel: <><rect x="5" y="3.5" width="14" height="17" rx="1" /><path d="M8.5 7.5h2M13.5 7.5h2M8.5 11h2M13.5 11h2M8.5 14.5h2M13.5 14.5h2M10.5 20.5v-3h3v3" /></>,
  venue: <><ellipse cx="12" cy="12" rx="9" ry="6" /><ellipse cx="12" cy="12" rx="5" ry="2.8" /><path d="M3 12v3c0 3.3 4 6 9 6s9-2.7 9-6v-3" /></>,
  dispatch: <><circle cx="12" cy="12" r="2.2" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" /></>,
  chart: <><path d="M4 20h16M6 16l4-5 3 3 5-7" /><circle cx="18" cy="7" r="1.4" /></>,
  food: <><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M16 3c-1.7 1-2.5 3-2.5 6s1 4 2.5 4v8" /></>,
  megaphone: <><path d="M4 10v4h3l8 4V6l-8 4H4z" /><path d="M18 9.5a3.5 3.5 0 0 1 0 5M8 14l1.5 5h2.5l-1.4-4.4" /></>,
  bell: <><path d="M5 17h14l-1.5-2V11a5.5 5.5 0 0 0-11 0v4L5 17z" /><path d="M10 20a2 2 0 0 0 4 0M3.5 20.5h17" /></>,
  voice: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></>,
  building: <><path d="M4 21V9l8-5 8 5v12" /><path d="M9 21v-6h6v6M8 11h.01M12 11h.01M16 11h.01" /></>,
  bike: <><circle cx="6" cy="16" r="3.5" /><circle cx="18" cy="16" r="3.5" /><path d="M6 16l4-6h5l3 6M10 10l-1.5-3H6M15 10l1-3h2.5" /></>,
  people: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9.5" r="2.4" /><path d="M3.5 19.5c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5M15 14.6c2.6-.3 4.8 1.2 5.5 4.4" /></>,
}

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  )
}
export type { IconName }

/* ------------------------------------------------- VIP transport map */
interface OpsCopy {
  nodes: string[] // airport, hotel, venue, dispatch, reporting
  before: string
  after: string
  legendRoute: string
  legendVehicle: string
  legendControl: string
  board: string
  boardRows: string[]
  statuses: string[]
}

// schematic positions in a 640x400 field
const P = { airport: [92, 92], hotel: [130, 300], venue: [540, 232], hub: [330, 190], report: [520, 70] } as const
const ROUTES = [
  'M92 92 C 160 150, 110 230, 130 300',
  'M130 300 C 280 340, 420 300, 540 232',
  'M92 92 C 260 40, 420 110, 540 232',
]

export function TransportMap({ t, ltr }: { t: OpsCopy; ltr: boolean }) {
  const [mode, setMode] = useState<'before' | 'after'>('after')
  const root = useRef<HTMLDivElement>(null)
  const after = mode === 'after'

  useEffect(() => {
    const el = root.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      if (el.querySelector('.om-route')) {
        gsap.fromTo('.om-route', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power3.inOut', stagger: 0.2 })
        gsap.fromTo('.om-spoke', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.6, stagger: 0.1 })
      }
      gsap.fromTo('.om-board li', { opacity: 0, x: ltr ? 12 : -12 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, delay: 0.4 })
    }, el)
    return () => ctx.revert()
  }, [mode, ltr])

  const node = (key: keyof typeof P, icon: IconName, label: string, hub = false) => {
    const [x, y] = P[key]
    return (
      <g className={`om-node${hub ? ' is-hub' : ''}`} transform={`translate(${x} ${y})`}>
        {hub && after && <circle className="om-pulse" r="26" />}
        <circle className="om-badge" r={hub ? 22 : 18} />
        <svg x={hub ? -11 : -9} y={hub ? -11 : -9} width={hub ? 22 : 18} height={hub ? 22 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="om-ico">{ICONS[icon]}</svg>
        <text y={hub ? 40 : 34} className="om-label">{label}</text>
      </g>
    )
  }

  return (
    <div className="opsmap" ref={root}>
      <div className="om-top">
        <div className="om-toggle" role="group">
          <button type="button" aria-pressed={!after} onClick={() => setMode('before')}>{t.before}</button>
          <button type="button" aria-pressed={after} onClick={() => setMode('after')}>{t.after}</button>
        </div>
      </div>
      <div className="om-body">
        <svg className="om-svg" viewBox="0 0 640 400" role="img" aria-label={after ? t.after : t.before}>
          <defs>
            <pattern id="om-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="rgba(160,170,172,0.07)" strokeWidth="1" />
            </pattern>
            <radialGradient id="om-fade" cx="50%" cy="50%" r="60%">
              <stop offset="0.55" stopColor="#0b1013" stopOpacity="0" />
              <stop offset="1" stopColor="#0b1013" stopOpacity="1" />
            </radialGradient>
            {ROUTES.map((d, i) => <path key={i} id={`om-r${i}`} d={d} />)}
          </defs>
          <rect width="640" height="400" fill="url(#om-grid)" />
          {/* abstract city blocks */}
          {[[200, 120, 70, 40], [250, 250, 90, 34], [400, 140, 60, 54], [430, 300, 70, 40], [60, 180, 44, 60], [560, 120, 50, 40]].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3" className="om-block" />
          ))}
          <rect width="640" height="400" fill="url(#om-fade)" />

          {after ? (
            <>
              {(['airport', 'hotel', 'venue', 'report'] as const).map((k) => (
                <line key={k} className="om-spoke" x1={P.hub[0]} y1={P.hub[1]} x2={P[k][0]} y2={P[k][1]} />
              ))}
              {ROUTES.map((d, i) => <path key={i} d={d} className="om-route" pathLength={1} strokeDasharray="1" />)}
              {[0, 1, 2].map((i) => (
                <g key={i} className="om-vehicle">
                  <rect x="-5" y="-3" width="10" height="6" rx="2" />
                  <animateMotion dur={`${7 + i * 2}s`} repeatCount="indefinite" rotate="auto" begin={`${i * 1.3}s`}>
                    <mpath href={`#om-r${i}`} />
                  </animateMotion>
                </g>
              ))}
            </>
          ) : (
            <>
              {[['airport', 'venue'], ['hotel', 'airport'], ['venue', 'hotel'], ['report', 'hotel']].map(([a, b], i) => (
                <line key={i} className="om-loose" x1={P[a as keyof typeof P][0]} y1={P[a as keyof typeof P][1]} x2={P[b as keyof typeof P][0]} y2={P[b as keyof typeof P][1]} />
              ))}
              {[[210, 200], [380, 270], [300, 90]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`} className="om-warn">
                  <circle r="9" />
                  <text y="4">!</text>
                </g>
              ))}
            </>
          )}

          {node('airport', 'plane', t.nodes[0])}
          {node('hotel', 'hotel', t.nodes[1])}
          {node('venue', 'venue', t.nodes[2])}
          {node('report', 'chart', t.nodes[4])}
          {after ? node('hub', 'dispatch', t.nodes[3], true) : null}
        </svg>

        <aside className={`om-board${after ? '' : ' is-off'}`}>
          <p className="om-board-title"><span className="om-live" />{t.board}</p>
          <ul>
            {t.boardRows.map((r, i) => (
              <li key={r}>
                <span className="om-row-ico"><Icon name={(['plane', 'hotel', 'venue', 'dispatch'] as IconName[])[i % 4]} /></span>
                <span className="om-row-label">{r}</span>
                <span className={`om-status s${after ? i % 3 : 3}`}>{after ? t.statuses[i % 3] : t.statuses[3]}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <ul className="om-legend">
        <li><i className="lg-route" />{t.legendRoute}</li>
        <li><i className="lg-vehicle" />{t.legendVehicle}</li>
        <li><i className="lg-control" />{t.legendControl}</li>
      </ul>
    </div>
  )
}

/* ------------------------------------------------ WebAR composition */
const LAYERS: { icon: ReactNode; label: string }[] = [
  { icon: <><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M4 16l5-5 4 4 3-3 4 4" /></>, label: 'Image' },
  { icon: <><rect x="4" y="6" width="12" height="12" rx="1.5" /><path d="M16 10l4-2.5v9L16 14" /></>, label: 'Video' },
  { icon: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></>, label: '3D' },
  { icon: <path d="M6 6h12M12 6v13" />, label: 'Text' },
  { icon: <><rect x="4" y="8" width="16" height="8" rx="4" /><path d="M9 12h6" /></>, label: 'Button' },
]

function Cube({ className = '' }: { className?: string }) {
  return (
    <svg className={`ar-cube ${className}`} viewBox="0 0 60 64" aria-hidden="true">
      <path d="M30 4l24 13-24 13L6 17z" className="cf-top" />
      <path d="M6 17l24 13v30L6 47z" className="cf-left" />
      <path d="M54 17L30 30v30l24-13z" className="cf-right" />
    </svg>
  )
}

function Qr() {
  // decorative pattern only, not a scannable code
  const cells = [
    '1110111', '1010101', '1110111', '0001000', '1101011', '0110110', '1011101',
  ]
  return (
    <svg className="ar-qr-svg" viewBox="0 0 9 9" aria-hidden="true">
      {cells.flatMap((row, y) => row.split('').map((c, x) => (c === '1' ? <rect key={`${x}-${y}`} x={x + 1} y={y + 1} width="1" height="1" /> : null)))}
    </svg>
  )
}

export function WebArStudio({ caption }: { caption: { editor: string; scan: string; live: string } }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ry(((e.clientX - r.left) / r.width - 0.5) * 10)
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8)
    }
    const leave = () => { rx(0); ry(0) }
    const host = el.parentElement
    host?.addEventListener('pointermove', move)
    host?.addEventListener('pointerleave', leave)
    return () => { host?.removeEventListener('pointermove', move); host?.removeEventListener('pointerleave', leave) }
  }, [])

  return (
    <div className="ar-wrap">
      <div className="ar-scene" ref={ref} aria-hidden="true">
        {/* laptop: the no-code editor */}
        <div className="ar-laptop">
          <div className="ar-screen">
            <div className="ar-topbar"><i /><i /><i /><span>WebAR Studio</span><b>Publish</b></div>
            <div className="ar-editor">
              <ul className="ar-layers">
                {LAYERS.map((l, i) => (
                  <li key={l.label} className={i === 2 ? 'is-sel' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{l.icon}</svg>
                    {l.label}
                  </li>
                ))}
              </ul>
              <div className="ar-canvas">
                <div className="ar-target">
                  <span className="ar-target-tag">Image target</span>
                  <div className="ar-poster" />
                </div>
                <Cube className="on-canvas" />
                <span className="ar-btn-chip">Button</span>
              </div>
              <div className="ar-props">
                {[72, 46, 88].map((w, i) => (
                  <div key={i} className="ar-prop"><span /><div className="ar-slider"><i style={{ width: `${w}%` }} /></div></div>
                ))}
                <div className="ar-swatches"><i /><i /><i /></div>
              </div>
            </div>
          </div>
          <div className="ar-base" />
        </div>

        {/* QR hand-off */}
        <div className="ar-qr">
          <Qr />
        </div>
        <svg className="ar-link" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 30 C 40 0, 80 60, 118 30" />
        </svg>

        {/* phone: the live AR view in the mobile browser */}
        <div className="ar-phone">
          <div className="ar-phone-screen">
            <div className="ar-cam" />
            <div className="ar-url"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="11" width="12" height="9" rx="1.5" /><path d="M9 11V8a3 3 0 0 1 6 0v3" /></svg>Mobile web</div>
            <div className="ar-plane">
              <div className="ar-poster small" />
            </div>
            <Cube className="on-phone" />
            <span className="ar-btn-chip live">Button</span>
            <div className="ar-reticle" />
          </div>
        </div>
      </div>
      <ol className="ar-steps">
        <li><span dir="ltr">01</span>{caption.editor}</li>
        <li><span dir="ltr">02</span>{caption.scan}</li>
        <li><span dir="ltr">03</span>{caption.live}</li>
      </ol>
    </div>
  )
}
