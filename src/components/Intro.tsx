// Opening sequence: "the lattice assembles". Eight dimension nodes light up around a ring
// that tracks real loading, threads draw between them, the wordmark resolves from blur,
// then the lattice collapses to a point and the page opens from a horizon line.
// Never holds the page longer than ~3.2s; skipped entirely for reduced motion.
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface Props {
  ready: boolean
  label: string
  tagline: string
  dims: string[]
  onDone: () => void
}

const N = 8
const R = 84
const node = (i: number) => {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2
  return [100 + Math.cos(a) * R, 100 + Math.sin(a) * R] as const
}
// threads: ring neighbours plus a few cross links, like the site's business system
const THREADS: [number, number][] = [[0, 3], [1, 5], [2, 6], [3, 7], [4, 0], [5, 2], [6, 1], [7, 4]]
const CIRC = 2 * Math.PI * 96

export function Intro({ ready, label, tagline, dims, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const ring = useRef<SVGCircleElement>(null)
  const dimEl = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(false)
  const started = useRef(performance.now())
  const finished = useRef(false)
  const prog = useRef({ v: 0 })
  const progTween = useRef<gsap.core.Tween | null>(null)

  const paint = () => {
    const v = prog.current.v
    if (count.current) count.current.textContent = String(Math.round(v)).padStart(3, '0')
    if (ring.current) ring.current.style.strokeDashoffset = String(CIRC * (1 - v / 100))
  }

  useEffect(() => {
    const el = root.current
    if (!el) return
    const q = (s: string) => el.querySelectorAll(s)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.fromTo(q('.il-node'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, stagger: 0.07, transformOrigin: 'center' }, 0.1)
      .fromTo(q('.il-thread'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, stagger: 0.06, ease: 'power3.inOut' }, 0.35)
      .fromTo(q('.il-core'), { scale: 0 }, { scale: 1, duration: 1, transformOrigin: 'center' }, 0.5)
      .fromTo(q('.intro-mark i'), { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: 0.08, transformOrigin: 'bottom' }, 0.55)
      .fromTo(q('.intro-word .ch'), { opacity: 0, filter: 'blur(12px)', yPercent: 40 }, { opacity: 1, filter: 'blur(0px)', yPercent: 0, duration: 1.1, stagger: 0.035 }, 0.6)
      .fromTo(q('.intro-tag'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, 1.1)
      .fromTo(q('.intro-foot'), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.4)
    // slow drift of the whole lattice
    const spin = gsap.to(q('.il-lattice'), { rotation: 45, duration: 6, ease: 'none', transformOrigin: '100px 100px' })
    // progress creeps toward 90 until the 3D scene reports ready
    progTween.current = gsap.to(prog.current, { v: 90, duration: 2.2, ease: 'power2.out', onUpdate: paint })
    // cycle the dimension names under the counter, lighting the matching node
    let i = 0
    const nodes = q('.il-node')
    const cycle = window.setInterval(() => {
      nodes.forEach((n, k) => n.classList.toggle('is-on', k === i % N))
      if (dimEl.current) {
        const d = dimEl.current
        gsap.fromTo(d, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
        d.textContent = dims[i % dims.length] ?? ''
      }
      i++
    }, 260)
    return () => { tl.kill(); spin.kill(); progTween.current?.kill(); clearInterval(cycle) }
  }, [dims])

  useEffect(() => {
    const elapsed = performance.now() - started.current
    const finish = () => {
      if (finished.current || !root.current) return
      finished.current = true
      const el = root.current
      const q = (s: string) => el.querySelectorAll(s)
      progTween.current?.kill()
      gsap.timeline({ onComplete: () => setGone(true) })
        .to(prog.current, { v: 100, duration: 0.45, ease: 'power2.out', onUpdate: paint })
        .to(q('.il-node, .il-thread'), { opacity: 0, duration: 0.5, ease: 'power2.in', stagger: 0.02 }, '>-0.05')
        .to(q('.il-lattice'), { scale: 0.2, duration: 0.7, ease: 'power3.in', transformOrigin: '100px 100px' }, '<')
        .to(q('.il-ring, .il-track'), { opacity: 0, duration: 0.4 }, '<0.2')
        .to(q('.intro-copy, .intro-foot'), { opacity: 0, y: -14, duration: 0.55, ease: 'power3.in' }, '<')
        .to(q('.intro-horizon'), { scaleX: 1, duration: 0.6, ease: 'expo.inOut' }, '>-0.15')
        .add(onDone, '>-0.1')
        .to(q('.intro-half.top'), { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, '>-0.05')
        .to(q('.intro-half.bottom'), { yPercent: 100, duration: 1.15, ease: 'expo.inOut' }, '<')
        .to(q('.intro-horizon'), { opacity: 0, duration: 0.5 }, '<0.3')
        .to(q('.intro-stage'), { opacity: 0, duration: 0.3 }, '<-0.3')
    }
    const wait = ready ? Math.max(0, 2000 - elapsed) : 3200 - elapsed
    const t = setTimeout(finish, Math.max(0, wait))
    return () => clearTimeout(t)
  }, [ready, onDone])

  if (gone) return null
  return (
    <div className="intro" ref={root} aria-hidden="true">
      <div className="intro-half top" />
      <div className="intro-half bottom" />
      <div className="intro-horizon" />
      <div className="intro-stage">
        <svg className="il" viewBox="0 0 200 200">
          <defs>
            <radialGradient id="il-glow">
              <stop offset="0" stopColor="#5fd4cc" stopOpacity="0.35" />
              <stop offset="1" stopColor="#5fd4cc" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="il-track" cx="100" cy="100" r="96" />
          <circle ref={ring} className="il-ring" cx="100" cy="100" r="96" strokeDasharray={CIRC} strokeDashoffset={CIRC} transform="rotate(-90 100 100)" />
          <g className="il-lattice">
            <circle className="il-glow" cx="100" cy="100" r="60" fill="url(#il-glow)" />
            {THREADS.map(([a, b], k) => {
              const [x1, y1] = node(a), [x2, y2] = node(b)
              return <line key={k} className="il-thread" x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} strokeDasharray="1" />
            })}
            {Array.from({ length: N }, (_, i) => {
              const [x, y] = node(i)
              return <rect key={i} className="il-node" x={x - 4} y={y - 4} width="8" height="8" transform={`rotate(45 ${x} ${y})`} />
            })}
            <rect className="il-core" x="94" y="94" width="12" height="12" transform="rotate(45 100 100)" />
          </g>
        </svg>
        <div className="intro-copy">
          <div className="intro-brand" dir="ltr">
            <div className="intro-mark"><i /><i /><i /></div>
            <div className="intro-word">
              <b>{'KON'.split('').map((c, i) => <span key={i} className="ch">{c}</span>)}</b>
              <span className="sp" />
              {'Unlimited'.split('').map((c, i) => <span key={i} className="ch">{c}</span>)}
            </div>
          </div>
          <p className="intro-tag">{tagline}</p>
        </div>
      </div>
      <div className="intro-foot">
        <span className="intro-label">{label}</span>
        <span ref={dimEl} className="intro-dim" />
        <span ref={count} className="intro-count" dir="ltr">000</span>
      </div>
    </div>
  )
}
