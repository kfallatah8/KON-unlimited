// «شيفرة كُن»: a leather-bound book drawn in CSS 3D. Tap to open, then turn pages by tapping a page,
// swiping, or the arrows. Arabic opens right-to-left (spine on the right), English left-to-right.
// Desktop shows a two-page spread; phones show one page at a time and pan across the spread, so a
// real page turn happens every other step. Text stays real DOM text: crisp, selectable, translatable.
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { useStore } from '../state/store'
import { codex, type Face } from '../content/codex'
import { contact, content } from '../content/site'
import { Rich } from './Rich'
import { SplitReveal } from './SplitReveal'

const Orn = () => (
  <svg className="cx-orn" viewBox="0 0 120 16" aria-hidden="true">
    <path d="M2 8h40M78 8h40" />
    <path d="M60 1.5l6.5 6.5-6.5 6.5-6.5-6.5z" />
    <path d="M60 4.6l3.4 3.4-3.4 3.4-3.4-3.4z" className="is-in" />
    <circle cx="48" cy="8" r="1.5" />
    <circle cx="72" cy="8" r="1.5" />
    <circle cx="42" cy="8" r="0.9" />
    <circle cx="78" cy="8" r="0.9" />
  </svg>
)

const Corner = ({ c }: { c: string }) => (
  <svg className={`cx-corner ${c}`} viewBox="0 0 40 40" aria-hidden="true">
    <path className="cap" d="M-2 -2H17L-2 17Z" />
    <path d="M2 38V14C2 7 7 2 14 2h24" />
    <path d="M8 38V18c0-6 4-10 10-10h20" />
    <path d="M14 14l5 5M14 14h6M14 14v6" />
  </svg>
)

// Abjad order (أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ): the old Arabic way of writing numbers with letters.
const ABJAD = 'ابجدهوزحطيكلمنسعفصقرشتثخذضظغ'
const ONES = ['', 'ا', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط']
const TENS = ['', 'ي', 'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص']
const abjad = (n: number) => [TENS[Math.floor(n / 10) % 10], ONES[n % 10]].filter(Boolean).join('‌')
const roman = (n: number) => {
  const m: [number, string][] = [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']]
  let out = ''
  for (const [v, r] of m) while (n >= v) { out += r; n -= v }
  return out
}
const RUNE = 'ABCDEFGHIKLMNOPQRSTVXYZ'

// Letters that start as cipher and settle into the real words, left to right in reading order.
function Decode({ text, on, className, as: Tag = 'span' }: { text: string; on: boolean; className?: string; as?: 'span' | 'h3' | 'h4' | 'p' }) {
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (!on) { setOut(text); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOut(text); return }
    const gl = /[؀-ۿ]/.test(text) ? ABJAD : RUNE
    const chars = Array.from(text)
    const T = 650 + chars.length * 22
    const t0 = performance.now()
    let id = 0
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / T)
      const n = Math.floor(p * p * (chars.length + 1))
      setOut(chars.map((c, j) => (j < n || /[\s،,.…:·ً-ْ]/.test(c) ? c : gl[(Math.random() * gl.length) | 0])).join(''))
      if (p < 1) id = window.setTimeout(tick, 60)
    }
    id = window.setTimeout(tick, 260)
    return () => window.clearTimeout(id)
  }, [on, text])
  return <Tag className={className} aria-label={text}><span aria-hidden="true">{out}</span></Tag>
}

// A faint column of cipher in the outer margin, different on every page.
const Marg = ({ i }: { i: number }) => {
  const g = Array.from({ length: 6 }, (_, j) => ABJAD[(i * 7 + j * 11) % ABJAD.length])
  return (
    <span className="cx-marg" aria-hidden="true">
      {g.map((c, j) => <i key={j}>{c}<b>{'·'.repeat(((i + j) % 3) + 1)}</b></i>)}
    </span>
  )
}

// The cover emblem: a ring of the abjad turning slowly around a khatam star, and at its heart a stone
// that is coal above and teal gem below, with light leaking through the cracks (pressure makes the gem).
const STAR_A = 'M-23 -23H23V23H-23Z'
const STAR_B = 'M0 -32.5L32.5 0L0 32.5L-32.5 0Z'
const RING = 'ا ب ج د · ه و ز · ح ط ي · ك ل م ن · س ع ف ص · ق ر ش ت · ث خ ذ · ض ظ غ ·'
const Stone = () => (
  <g className="cx-stone">
    <polygon points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5" fill="url(#cxGemG)" />
    <polygon points="0,-15 13,-7.5 6,-1 -4,-3 -13,-7.5" fill="#15191a" />
    <polygon points="0,-15 -13,-7.5 -4,-3" fill="#262b2c" />
    <polygon points="13,-7.5 13,1 6,-1" fill="#0c0f10" />
    <polygon points="-13,-7.5 -4,-3 -13,2" fill="#1d2223" />
    <polygon points="0,-15 6,-1 -4,-3" fill="#30373a" />
    <path className="cx-crack" d="M-13 2L-4 -3L6 -1L13 1M-4 -3L-1 6M6 -1L4 9" />
    <polygon points="0,4 5,7 0,12 -5,7" fill="#c9fff6" opacity="0.5" />
  </g>
)
const Emblem = ({ small }: { small?: boolean }) => {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={`cx-emblem${small ? ' is-small' : ''}`} viewBox="-50 -50 100 100" aria-hidden="true">
      <defs>
        <path id={`r${id}`} d="M0 -42a42 42 0 1 1 0 84a42 42 0 1 1 0 -84" />
      </defs>
      <circle r="48" className="cx-em-ring" />
      <circle r="37" className="cx-em-ring is-dots" />
      <g className="cx-em-turn">
        <text className="cx-em-text"><textPath href={`#r${id}`} textLength="262">{RING}</textPath></text>
      </g>
      <path d={STAR_A} className="cx-em-star" />
      <path d={STAR_B} className="cx-em-star" />
      <path d={STAR_A} className="cx-em-light" pathLength={100} />
      <path d={STAR_B} className="cx-em-light is-b" pathLength={100} />
      <circle r="19" className="cx-em-bezel" />
      <Stone />
    </svg>
  )
}
const Sigil = () => (
  <svg className="cx-sigil" viewBox="-24 -24 48 48" aria-hidden="true">
    <circle r="22" className="cx-em-ring is-dots" />
    <path d="M0 -22V-16M0 22V16M-22 0H-16M22 0H16" className="cx-sig-tick" />
    <Stone />
  </svg>
)

export function Codex() {
  const lang = useStore((s) => s.lang)
  const b = codex[lang]
  const rtl = lang === 'ar'
  const N = b.faces.length / 2
  const [k, setK] = useState(0)
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches)
  const moved = useRef<{ from: number; at: number }>({ from: 0, at: 0 })
  const down = useRef<{ x: number; y: number } | null>(null)
  const [, force] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  const slogan = content[lang].hero.slogan

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  useEffect(() => setK(0), [lang])

  const f = Math.ceil(k / 2) // leaves turned
  const go = useCallback((nk: number) => {
    setK((cur) => {
      const c = Math.max(0, Math.min(2 * N - 1, nk))
      if (c !== cur) {
        moved.current = { from: Math.ceil(cur / 2), at: performance.now() }
        window.setTimeout(() => force((x) => x + 1), 1300)
      }
      return c
    })
  }, [N])
  const next = useCallback(() => {
    if (narrow) go(k + 1)
    else { const nf = Math.min(N, f + 1); go(2 * nf - 1) }
  }, [narrow, k, f, N, go])
  const prev = useCallback(() => {
    if (narrow) go(k - 1)
    else { const nf = Math.max(0, f - 1); go(nf === 0 ? 0 : 2 * nf - 1) }
  }, [narrow, f, go, k])

  // Which half is centred: the closed book sits in the middle; phones always centre the page being read.
  const s = rtl ? 1 : -1
  const side = narrow ? (k % 2 === 0 ? 'unread' : 'read') : f === 0 ? 'unread' : f === N ? 'read' : 'both'
  const shift = side === 'unread' ? s * 25 : side === 'read' ? -s * 25 : 0
  const closed = f === 0 || f === N
  const visible = new Set(narrow ? [k] : [2 * f - 1, 2 * f])

  const onKey = (e: KeyboardEvent) => {
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight'
    const back = rtl ? 'ArrowRight' : 'ArrowLeft'
    if (e.key === fwd) { e.preventDefault(); next() }
    else if (e.key === back) { e.preventDefault(); prev() }
  }
  const onDown = (e: PointerEvent) => { down.current = { x: e.clientX, y: e.clientY } }
  const onUp = (e: PointerEvent) => {
    const d = down.current
    down.current = null
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx * (rtl ? 1 : -1) > 0) next()
      else prev()
      return
    }
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) return
    const t = e.target as HTMLElement
    if (t.closest('button, a')) return
    // Decide by where the tap landed, not by which 3D face the browser hit-tests (Safari is unreliable
    // with rotated layers): the unread half turns forward, the read half turns back.
    if (f === 0) return next()
    if (f === N) return prev()
    if (narrow) {
      const w = window.innerWidth
      const backZone = rtl ? e.clientX > w * 0.75 : e.clientX < w * 0.25
      return backZone ? prev() : next()
    }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const unread = rtl ? e.clientX < r.left + r.width / 2 : e.clientX > r.left + r.width / 2
    if (unread) next()
    else prev()
  }

  const since = performance.now() - moved.current.at
  const stamp = since < 1300 ? moved.current.from : f
  const lo = Math.min(stamp, f)
  const hi = Math.max(stamp, f)

  const pageNo = (i: number) => (i >= 2 && i <= 2 * N - 2 ? i - 1 : 0)
  const total = 2 * N - 3
  const shown = Math.max(1, Math.min(total, pageNo(narrow ? k : Math.max(2, 2 * f - 1))))
  const waHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(b.printMsg)}`

  const renderFace = (face: Face, i: number) => {
    const n = pageNo(i)
    const num = n ? (rtl ? abjad(n) : roman(n)) : ''
    const live = seen && visible.has(i)
    switch (face.k) {
      case 'cover':
      case 'back':
        return (
          <div className={`cx-leather${face.k === 'back' ? ' is-back' : ''}`}>
            <Corner c="tl" /><Corner c="tr" /><Corner c="bl" /><Corner c="br" />
            <div className="cx-frame" />
            {face.k === 'cover' ? (
              <div className="cx-cover-in">
                <Emblem />
                <Decode as="h3" className="cx-gold cx-name" text={b.name} on={live} />
                <Orn />
                <p className="cx-cover-sub">{b.sub}</p>
                <p className="cx-cover-by">{b.author}</p>
              </div>
            ) : (
              <div className="cx-cover-in">
                <Emblem small />
                <Decode as="p" className="cx-back-line" text={slogan} on={live} />
                <p className="cx-cover-by">KON Unlimited</p>
              </div>
            )}
            <p className="cx-band is-top" aria-hidden="true">أبجد · هوز · حطي · كلمن</p>
            <p className="cx-band is-bottom" aria-hidden="true">سعفص · قرشت · ثخذ · ضظغ</p>
            <i className="cx-sheen" aria-hidden="true" />
          </div>
        )
      case 'endpaper':
        return <div className="cx-endpaper"><p className="cx-exlibris"><span>{face.text}</span></p></div>
      case 'title':
        return (
          <div className="cx-paper cx-titlepage">
            <p className="cx-small">{b.draft}</p>
            <Decode as="h3" className="cx-h-title" text={b.name} on={live} />
            <Orn />
            <p className="cx-sub">{b.sub}</p>
            <p className="cx-by">{b.author}</p>
            <span className="cx-wax" aria-hidden="true"><b>كُن</b></span>
          </div>
        )
      case 'epigraph':
        return (
          <div className="cx-paper cx-epi-page">
            <blockquote className="cx-quote">«{face.text}»</blockquote>
            <p className="cx-by">— {face.by}</p>
            <span className="cx-pn">{num}</span>
            <Marg i={i} />
          </div>
        )
      case 'toc':
        return (
          <div className="cx-paper">
            <Decode as="h4" className="cx-head" text={b.toc} on={live} />
            <Orn />
            <ol className="cx-toc">
              {b.tocItems.map((it) => (
                <li key={it.label}>
                  <button type="button" onClick={() => go(narrow || it.face % 2 ? it.face : it.face - 1)}>
                    <span>{it.label}</span><i /><em>{rtl ? abjad(it.face - 1) : roman(it.face - 1)}</em>
                  </button>
                </li>
              ))}
            </ol>
            <span className="cx-pn">{num}</span>
          </div>
        )
      case 'text':
        return (
          <div className="cx-paper">
            {face.head && <><Decode as="h4" className="cx-head" text={face.head} on={live} /><Orn /></>}
            {face.paras.map((p, j) => <p key={j} className={`cx-p${j === 0 && face.head ? ' is-lead' : ''}${j === 0 && !face.head && i % 4 === 1 ? ' has-drop' : ''}`}><Rich text={p} /></p>)}
            <span className="cx-pn">{num}</span>
            <Marg i={i} />
          </div>
        )
      case 'opener':
        return (
          <div className="cx-paper cx-opener">
            <Sigil />
            <p className="cx-num">{face.num}</p>
            <Decode as="h4" className="cx-ch" text={face.title} on={live} />
            <Orn />
            <p className="cx-epi">{face.epi}</p>
            {face.body && <p className="cx-p cx-centre">{face.body}</p>}
            {face.wip && <p className="cx-wip">{b.wip}</p>}
            <span className="cx-pn">{num}</span>
            <Marg i={i} />
          </div>
        )
      case 'exercise':
        return (
          <div className="cx-paper">
            <Decode as="h4" className="cx-head" text={face.title} on={live} />
            <Orn />
            <ol className="cx-steps">{face.steps.map((x) => <li key={x}>{x}</li>)}</ol>
            <p className="cx-end">{face.end}</p>
            <span className="cx-pn">{num}</span>
          </div>
        )
      case 'closing':
        return (
          <div className="cx-paper cx-opener">
            <Sigil />
            <Decode as="h4" className="cx-ch" text={face.title} on={live} />
            <Orn />
            {face.paras.map((p, j) => <p key={j} className={j ? 'cx-epi' : 'cx-p cx-centre'}>{p}</p>)}
            <a className="cx-print" href={waHref} target="_blank" rel="noreferrer">{b.printCta}</a>
            <span className="cx-pn">{num}</span>
          </div>
        )
    }
  }

  const leaves = Array.from({ length: N }, (_, i) => i)
  const bookStyle = {
    '--shift': `${shift}%`,
    '--ul': N - f,
    '--rl': f,
  } as CSSProperties

  return (
    <section id="codex" className="band codex" aria-labelledby="codex-title">
      <div className="wrap center">
        <p className="eyebrow centered" data-reveal>{b.eyebrow}</p>
        <SplitReveal as="h2" id="codex-title" className="display" text={b.title} />
        <p className="body-lg" data-reveal><Rich text={b.lede} /></p>
      </div>

      <svg className="cx-defs" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="cxGemG" cx="45%" cy="70%" r="75%"><stop offset="0" stopColor="#d6fff8" /><stop offset="0.3" stopColor="#5fe3d2" /><stop offset="0.7" stopColor="#0f8f82" /><stop offset="1" stopColor="#033a35" /></radialGradient>
          <linearGradient id="cxFoil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e2a6" /><stop offset="0.45" stopColor="#c99f4e" /><stop offset="1" stopColor="#7d5e22" /></linearGradient>
          <linearGradient id="cxBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3c27a" /><stop offset="0.5" stopColor="#a07a32" /><stop offset="1" stopColor="#6e521e" /></linearGradient>
        </defs>
      </svg>
      <div
        ref={stageRef}
        className={`cx-stage${closed ? ' is-closed' : ' is-open'}${narrow ? ' is-narrow' : ''}`}
        dir={rtl ? 'rtl' : 'ltr'}
        tabIndex={0}
        role="region"
        aria-roledescription={rtl ? 'كتاب' : 'book'}
        aria-label={b.name}
        onKeyDown={onKey}
      >
        <div className="cx-aura" aria-hidden="true">
          <i className="cx-mist is-a" /><i className="cx-mist is-b" />
          <svg className="cx-aura-ring" viewBox="-50 -50 100 100">
            <defs><path id="cxAuraP" d="M0 -46a46 46 0 1 1 0 92a46 46 0 1 1 0 -92" /></defs>
            <circle r="49" /><circle r="42" className="is-dots" />
            <text><textPath href="#cxAuraP" textLength="288">{RING} {RING}</textPath></text>
          </svg>
        </div>
        <div className="cx-float">
          <div
            className={`cx-book is-${side}${f === 0 ? ' at-front' : ''}${f === N ? ' at-back' : ''}`}
            style={bookStyle}
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerCancel={() => { down.current = null }}
          >
            <div className="cx-stack is-unread" aria-hidden="true" />
            <div className="cx-stack is-read" aria-hidden="true" />
            <span className="cx-ribbon" aria-hidden="true" />
            {leaves.map((i) => {
              const turned = i < f
              const moving = i >= lo && i < hi
              const order = turned ? i + 1 : N - i
              const delay = moving ? Math.abs(i - (f > stamp ? lo : hi - 1)) * 70 : 0
              return (
                <div
                  key={i}
                  className={`cx-leaf${turned ? ' is-turned' : ''}${moving ? ' is-moving' : ''}`}
                  style={{ zIndex: moving ? 200 + (f > stamp ? i : N - i) : order, transitionDelay: `${delay}ms` }}
                >
                  {[0, 1].map((sd) => {
                    const fi = 2 * i + sd
                    return (
                      <div
                        key={sd}
                        className={`cx-face ${sd ? 'is-backside' : 'is-front'}${fi === 0 ? ' is-cover' : ''}${fi === 2 * N - 1 ? ' is-backcover' : ''}`}
                        data-face={fi}
                        data-side={sd ? 'back' : 'front'}
                        aria-hidden={!visible.has(fi)}
                      >
                        {renderFace(b.faces[fi], fi)}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <div className="cx-shadow" aria-hidden="true" />
        </div>
      </div>

      <div className="wrap center cx-bar" dir={rtl ? 'rtl' : 'ltr'}>
        {f === 0 ? (
          <button type="button" className="btn btn-primary" onClick={next}><span>{b.open}</span></button>
        ) : (
          <div className="cx-nav">
            <button type="button" className="cx-arrow" onClick={prev} aria-label={b.prev}>{rtl ? '→' : '←'}</button>
            <span className="cx-count" aria-live="polite">{f === N ? b.name : b.page(shown, total)}</span>
            <button type="button" className="cx-arrow" onClick={next} disabled={k >= 2 * N - 1} aria-label={b.next}>{rtl ? '←' : '→'}</button>
            <button type="button" className="cx-closebtn" onClick={() => go(0)}>{b.close}</button>
          </div>
        )}
        <p className="cx-hint">{f === 0 ? b.hint : ''}</p>
        <a className="btn btn-ghost cx-reserve" href={waHref} target="_blank" rel="noreferrer"><span>{b.printCta}</span></a>
      </div>
    </section>
  )
}
