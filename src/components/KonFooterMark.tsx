// KON footer mark: three glass vessels shaped like the letters, each holding deep royal teal
// liquid that behaves like liquid. Tilt the phone and the surface in every letter stays level
// with the real horizon, overshoots, sloshes and settles; on a desktop the pointer tilts it.
//
// Physics, per letter (each letter is its own vessel, so volume stays inside it):
//  - the surface angle is a damped spring chasing the true gravity angle (so it overshoots)
//  - the surface itself is a row of spring columns coupled to their neighbours (ripples travel,
//    reflect off the letter's walls and die out); angular velocity pushes the ends, which is
//    what makes a slosh
// Rendering is SVG: the liquid is a path rebuilt each frame and clipped to the glyphs, under the
// same lit-glass filter as before. Nothing runs while the mark is off screen.
import React, { useEffect, useRef, useState } from 'react'

const COLS = 26
const FILL = 0.56 // how full each letter is
const MAX_TILT = 0.62 // radians

const T = (props: React.SVGProps<SVGTextElement>) => (
  <text x="500" y="236" textAnchor="middle" className="kg-glyphs" {...props}>KON</text>
)

interface Vessel { x0: number; x1: number; y0: number; y1: number; h: Float32Array; v: Float32Array }

export function KonFooterMark() {
  const svg = useRef<SVGSVGElement>(null)
  const measure = useRef<SVGTextElement>(null)
  const body = useRef<(SVGPathElement | null)[]>([])
  const back = useRef<(SVGPathElement | null)[]>([])
  const line = useRef<(SVGPathElement | null)[]>([])
  const [needAsk, setNeedAsk] = useState(false)
  const target = useRef(0)
  const live = useRef(false)

  useEffect(() => {
    const el = svg.current
    if (!el || !measure.current) return
    let vessels: Vessel[] = []
    let raf = 0, visible = false, last = 0
    let ang = 0, angV = 0, idle = 0
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches

    const build = () => {
      try {
        const text = measure.current
        if (!text || !text.isConnected) return
        const next = [0, 1, 2].map((i) => {
          const r = text.getExtentOfChar(i)
          return { x0: r.x - 2, x1: r.x + r.width + 2, y0: 52, y1: 240, h: new Float32Array(COLS), v: new Float32Array(COLS) }
        })
        if (next.every((w) => w.x1 - w.x0 > 20)) vessels = next
      } catch { /* keep the last good measure */ }
    }
    build()
    document.fonts?.ready.then(() => { build(); draw(0) })

    const draw = (t: number) => {
      vessels.forEach((w, k) => {
        const cx = (w.x0 + w.x1) / 2, level = w.y1 - (w.y1 - w.y0) * FILL, slope = Math.tan(ang)
        let d = '', d2 = '', top = ''
        for (let i = 0; i < COLS; i++) {
          const x = w.x0 + ((w.x1 - w.x0) * i) / (COLS - 1)
          const y = level + slope * (x - cx) + w.h[i]
          const yb = level + slope * (x - cx) * 0.86 - w.h[COLS - 1 - i] * 0.7 - 5 + Math.sin(t * 0.0011 + i * 0.5 + k) * 1.6
          d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
          d2 += `${i ? 'L' : 'M'}${x.toFixed(1)} ${yb.toFixed(1)}`
          top += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
        }
        const close = `L${w.x1} ${w.y1 + 30}L${w.x0} ${w.y1 + 30}Z`
        body.current[k]?.setAttribute('d', d + close)
        back.current[k]?.setAttribute('d', d2 + close)
        line.current[k]?.setAttribute('d', top)
      })
    }

    const step = (t: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min(0.033, last ? (t - last) / 1000 : 0.016)
      last = t
      // a slow breath when nothing is tilting it, so the liquid never looks frozen
      idle = live.current ? 0 : Math.sin(t * 0.00055) * 0.045
      const goal = Math.max(-MAX_TILT, Math.min(MAX_TILT, target.current + idle))
      const acc = (goal - ang) * 38 - angV * 5.2
      angV += acc * dt
      ang += angV * dt
      for (const w of vessels) {
        const { h, v } = w
        const push = angV * (w.x1 - w.x0) * 0.5
        for (let i = 0; i < COLS; i++) {
          const l = h[i ? i - 1 : 0], r = h[i < COLS - 1 ? i + 1 : COLS - 1]
          const edge = (i / (COLS - 1) - 0.5) * 2
          const a = (l + r - 2 * h[i]) * 320 - h[i] * 26 - v[i] * 2.6 + push * edge * 9
          v[i] += a * dt
        }
        for (let i = 0; i < COLS; i++) h[i] = Math.max(-34, Math.min(34, h[i] + v[i] * dt))
      }
      draw(t)
      raf = requestAnimationFrame(step)
    }
    const wake = () => { if (visible && !raf && !still) { last = 0; raf = requestAnimationFrame(step) } }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake() }, { rootMargin: '80px' })
    io.observe(el)

    // phone: real gravity. gamma is the left/right tilt in portrait, beta in landscape.
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return
      live.current = true
      const o = (screen.orientation?.angle ?? 0) as number
      const deg = o === 90 ? (e.beta ?? 0) : o === 270 || o === -90 ? -(e.beta ?? 0) : e.gamma
      target.current = (Math.max(-45, Math.min(45, deg)) * Math.PI) / 180
      wake()
    }
    // desktop: the pointer stands in for gravity
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect()
      const k = ((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))
      live.current = true
      target.current = Math.max(-1, Math.min(1, k)) * 0.42
    }
    const onLeave = () => { live.current = false; target.current = 0 }
    // scrolling gives the vessels a nudge, like carrying a glass
    let sy = window.scrollY
    const onScroll = () => { const dy = window.scrollY - sy; sy = window.scrollY; if (visible) for (const w of vessels) for (let i = 0; i < COLS; i++) w.v[i] += Math.max(-60, Math.min(60, dy)) * 0.5 * Math.sin(i * 0.7) }

    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined
    const listen = () => window.addEventListener('deviceorientation', onTilt)
    if (D && typeof D.requestPermission === 'function' && matchMedia('(pointer: coarse)').matches) { setNeedAsk(true); listen() }
    else if (D) listen()
    ;(el as unknown as { __grant?: () => void }).__grant = () => {
      D?.requestPermission?.().then((s) => { if (s === 'granted') listen() }).catch(() => {}).finally(() => setNeedAsk(false))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    draw(0)
    return () => {
      io.disconnect(); cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onTilt)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'ar'
  return (
    <div className="kon-foot kon-glass" dir="ltr">
      <svg ref={svg} viewBox="0 0 1000 380" role="img" aria-label="KON Unlimited">
        <defs>
          <linearGradient id="kl-liquid" gradientUnits="userSpaceOnUse" x1="0" y1="110" x2="0" y2="250">
            <stop offset="0" stopColor="#1fb8a6" />
            <stop offset="0.1" stopColor="#0a7f74" />
            <stop offset="0.5" stopColor="#054d48" />
            <stop offset="1" stopColor="#022b29" />
          </linearGradient>
          <linearGradient id="kl-back" gradientUnits="userSpaceOnUse" x1="0" y1="110" x2="0" y2="250">
            <stop offset="0" stopColor="#0a5f57" />
            <stop offset="1" stopColor="#02211f" />
          </linearGradient>
          <linearGradient id="kl-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8fffb" stopOpacity="0.13" />
            <stop offset="1" stopColor="#7eeedd" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="kl-gloss" gradientUnits="userSpaceOnUse" x1="0" y1="58" x2="0" y2="128">
            <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kl-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.3" /><stop offset="0.7" stopColor="#fff" stopOpacity="0" /></linearGradient>
          {/* thick cast glass, lit from the letters' own shape: no strokes anywhere */}
          <filter id="kl-lit" x="-6%" y="-12%" width="112%" height="130%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="h" />
            <feSpecularLighting in="h" surfaceScale="10" specularConstant="1.3" specularExponent="36" lightingColor="#ffffff" result="s1">
              <fePointLight x="180" y="-160" z="260" />
            </feSpecularLighting>
            <feComposite in="s1" in2="SourceAlpha" operator="in" result="spec" />
            <feSpecularLighting in="h" surfaceScale="8" specularConstant="0.8" specularExponent="16" lightingColor="#58e6d2" result="s2">
              <fePointLight x="860" y="520" z="160" />
            </feSpecularLighting>
            <feComposite in="s2" in2="SourceAlpha" operator="in" result="backl" />
            <feMorphology in="SourceAlpha" operator="erode" radius="6" result="er" />
            <feComposite in="SourceAlpha" in2="er" operator="out" result="band" />
            <feGaussianBlur in="band" stdDeviation="3" result="bandB" />
            <feComposite in="bandB" in2="SourceAlpha" operator="in" result="bandIn" />
            <feFlood floodColor="#d6fff8" floodOpacity="0.42" />
            <feComposite in2="bandIn" operator="in" result="rim" />
            <feMerge><feMergeNode in="rim" /><feMergeNode in="backl" /><feMergeNode in="spec" /></feMerge>
          </filter>
          <filter id="kl-glow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="20" /></filter>
          <filter id="kl-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="kl-line" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="2.2" /></filter>
          <clipPath id="kl-clip"><T /></clipPath>
          <mask id="kl-refl" maskUnits="userSpaceOnUse" x="0" y="262" width="1000" height="118">
            <rect x="0" y="262" width="1000" height="118" fill="url(#kl-fade)" />
          </mask>
        </defs>

        <T ref={measure} fill="none" aria-hidden="true" />

        {/* the teal light the liquid throws on the floor */}
        <ellipse cx="500" cy="276" rx="350" ry="10" fill="#000" opacity="0.6" filter="url(#kl-shadow)" />
        <g transform="translate(0 524) scale(1 -0.34) translate(0 -240)" opacity="0.55" filter="url(#kl-glow)"><T fill="#1fc4ae" /></g>

        <g id="kl-vessel">
          <T fill="#021a19" opacity="0.55" />
          <T fill="url(#kl-glass)" />
          <g clipPath="url(#kl-clip)">
            {[0, 1, 2].map((k) => <path key={`b${k}`} ref={(n) => { back.current[k] = n }} fill="url(#kl-back)" opacity="0.85" />)}
            {[0, 1, 2].map((k) => <path key={`f${k}`} ref={(n) => { body.current[k] = n }} fill="url(#kl-liquid)" />)}
            {[0, 1, 2].map((k) => <path key={`g${k}`} ref={(n) => { line.current[k] = n }} fill="none" stroke="#b9fff4" strokeWidth="5" opacity="0.75" filter="url(#kl-line)" />)}
            <rect x="0" y="56" width="1000" height="74" fill="url(#kl-gloss)" transform="skewY(-3)" opacity="0.45" />
          </g>
          <g filter="url(#kl-lit)"><T fill="#fff" /></g>
        </g>

        <g mask="url(#kl-refl)" opacity="0.45">
          <use href="#kl-vessel" transform="translate(0 532) scale(1 -1)" />
        </g>
      </svg>
      <p className="kf-sub"><span>Unlimited</span></p>
      {needAsk && (
        <button type="button" className="kl-ask" onClick={() => (svg.current as unknown as { __grant?: () => void })?.__grant?.()}>
          {lang === 'ar' ? 'حرّك جوالك، والسائل يتحرك معك' : 'Tilt your phone and the liquid follows'}
        </button>
      )}
    </div>
  )
}
