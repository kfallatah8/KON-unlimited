import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent } from './content/useContent'
import type { CaseItem } from './content/site'
import { contact } from './content/site'
import { detectCapabilities } from './lib/capabilities'
import { motion, setLang, startOnboarding, useStore } from './state/store'
import { Cursor } from './components/Cursor'
import { Icon, GemMark } from './components/Icons'
import { MagneticButton } from './components/MagneticButton'
import { chipPain, Onboarding } from './components/Onboarding'
import { lenis, SmoothScroll } from './components/SmoothScroll'
import { SplitReveal } from './components/SplitReveal'
import { Rich } from './components/Rich'
import { KonMark } from './components/KonMark'
import { ReadyServices } from './components/ReadyServices'

// The WebGL stage is its own chunk: copy and layout never wait for it.
const GemField = lazy(() => import('./three/GemField'))

gsap.registerPlugin(ScrollTrigger)

const pad = (n: number) => String(n).padStart(2, '0')

/** Adds .is-in to [data-reveal] elements once they enter the viewport (CSS does the motion). */
function useReveal(lang: string) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]:not(.is-in)')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [lang])
}

function LangSwitch() {
  const c = useContent()
  const lang = useStore((s) => s.lang)
  return (
    <button
      type="button"
      className="lang-switch"
      lang={lang === 'ar' ? 'en' : 'ar'}
      aria-label={c.meta.switchLabel}
      onClick={() => {
        setLang(lang === 'ar' ? 'en' : 'ar')
        requestAnimationFrame(() => ScrollTrigger.refresh())
      }}
    >
      {c.meta.switchTo}
    </button>
  )
}

function Header() {
  const c = useContent()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const bar = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const paint = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
    }
    const on = () => {
      setScrolled(window.scrollY > 40)
      if (!frame) frame = requestAnimationFrame(paint)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      window.removeEventListener('scroll', on)
      cancelAnimationFrame(frame)
    }
  }, [])
  // Lock the page behind the open menu (Lenis too), and unlock synchronously on close so
  // the link's smooth scroll starts from an unlocked page.
  const lock = (on: boolean) => {
    document.documentElement.classList.toggle('menu-open', on)
    if (on) lenis?.stop()
    else lenis?.start()
  }
  const close = () => {
    lock(false)
    setOpen(false)
  }
  useEffect(() => {
    if (!open) return
    lock(true)
    menuRef.current?.querySelector('a')?.focus({ preventScroll: true })
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close()
    // Rotating a tablet past the breakpoint shows the desktop nav; don't leave the page locked.
    const wide = window.matchMedia('(min-width: 901px)')
    const onWide = () => wide.matches && close()
    window.addEventListener('keydown', esc)
    wide.addEventListener('change', onWide)
    return () => {
      window.removeEventListener('keydown', esc)
      wide.removeEventListener('change', onWide)
      lock(false)
    }
  }, [open])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <span className="page-progress" ref={bar} aria-hidden="true" />
      <a href="#top" className="logo" aria-label="KON Unlimited">
        <span dir="ltr"><b>KON</b> Unlimited</span>
      </a>
      <nav aria-label="Primary" className="nav-desktop">
        {c.nav.map((n) => <a key={n.href} href={n.href} className="nav-link"><span>{n.label}</span></a>)}
      </nav>
      <div className="header-actions">
        <LangSwitch />
        <a href="#start" className="header-cta">{c.headerCta}</a>
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => (open ? close() : setOpen(true))}>
          <span className="sr-only">{open ? c.meta.close : c.meta.menu}</span>
          <i /><i />
        </button>
      </div>
      <div id="mobile-menu" ref={menuRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          {c.nav.map((n, i) => (
            <a key={n.href} href={n.href} onClick={close}>
              <span dir="ltr">{pad(i + 1)}</span>{n.label}
            </a>
          ))}
          <a href="#start" onClick={close}><span dir="ltr">{pad(c.nav.length + 1)}</span>{c.headerCta}</a>
        </nav>
      </div>
    </header>
  )
}

/** Hero headline that cycles through the taglines with a masked rise. */
function Rotator({ lines, ready }: { lines: string[]; ready: boolean }) {
  const [i, setI] = useState(-1)
  useEffect(() => {
    if (!ready) return
    // The first line rises in with the rest of the opening, then the lines take turns.
    const first = window.setTimeout(() => setI(0), 250)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => window.clearTimeout(first)
    const id = setInterval(() => setI((x) => (x + 1) % lines.length), 3400)
    return () => {
      window.clearTimeout(first)
      clearInterval(id)
    }
  }, [lines, ready])
  return (
    <span className="rotator" aria-hidden="true">
      {lines.map((l, k) => (
        <span key={l} className={`rot-line${k === i ? ' is-on' : ''}${i >= 0 && k === (i - 1 + lines.length) % lines.length ? ' is-out' : ''}`}>{l}</span>
      ))}
    </span>
  )
}

function Hero({ ready }: { ready: boolean }) {
  const c = useContent()
  const h = c.hero
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow hero-fade">{h.eyebrow}</p>
        <h1 id="hero-title" className="hero-title">
          <span className="sr-only">{h.rotating.join(' ')}</span>
          <Rotator lines={h.rotating} ready={ready} />
        </h1>
        <p className="hero-promise hero-fade"><Rich text={h.promise} /></p>
        <p className="hero-lede hero-fade"><Rich text={h.lede} /></p>
        <div className="hero-ctas hero-fade">
          <MagneticButton href="#start">{h.primary}</MagneticButton>
          <MagneticButton href="#work" variant="ghost">{h.secondary}</MagneticButton>
        </div>
      </div>
      <ul className="proof hero-fade" aria-label="KON">
        {h.proof.map((p) => (
          <li key={p.l}><b dir="ltr">{p.n}</b><span>{p.l}</span></li>
        ))}
      </ul>
      <p className="hero-slogan hero-fade">{h.slogan}</p>
      <a href="#problem" className="scroll-cue"><span>{h.scroll}</span><i aria-hidden="true" /></a>
    </section>
  )
}

function Problem() {
  const p = useContent().problem
  return (
    <section id="problem" className="band problem" aria-labelledby="problem-title">
      <div className="wrap narrow center">
        <SplitReveal as="h2" id="problem-title" className="display" text={p.title} />
        {p.lines.map((l) => <p key={l} className="problem-line" data-reveal>{l}</p>)}
        <p className="problem-close" data-reveal>{p.closing}</p>
      </div>
      <div className="wrap paths">
        {p.paths.map((path) => (
          <div key={path.persona} className="path glass" data-reveal>
            <button type="button" className="path-head" onClick={() => startOnboarding({ persona: path.persona })}>
              <GemMark className="path-gem" /><span>[ {path.label} ]</span><i aria-hidden="true">↵</i>
            </button>
            <div className="path-chips">
              {path.q.map((q) => (
                <button key={q} type="button" className="chip" onClick={() => startOnboarding({ persona: path.persona, pains: [chipPain(q)].filter(Boolean) })}>{q}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="wrap center investor-line" data-reveal>
        <p className="hint">{p.hint}</p>
      </div>
    </section>
  )
}

function Loops() {
  const l = useContent().loops
  const [tab, setTab] = useState(0)
  const g = l.groups[tab]
  return (
    <section id="loops" className="band loops" aria-labelledby="loops-title">
      <div className="wrap narrow center">
        <p className="eyebrow" data-reveal>{l.eyebrow}</p>
        <SplitReveal as="h2" id="loops-title" className="display" text={l.title} />
        <p className="loops-pick" data-reveal>{l.pick}</p>
        <div className="seg-tabs" role="tablist" aria-label={l.pick} data-reveal>
          {l.groups.map((x, i) => (
            <button key={x.persona} type="button" role="tab" id={`lt-${x.persona}`} aria-selected={i === tab} aria-controls="loops-panel" className={i === tab ? 'is-on' : ''} onClick={() => setTab(i)}>
              {x.label}
            </button>
          ))}
        </div>
        <div id="loops-panel" role="tabpanel" aria-labelledby={`lt-${g.persona}`} className="loops-panel" key={g.persona}>
          {g.qs.map((q) => <p key={q} className="loop-q">{q}</p>)}
        </div>
        <p className="loop-tail" data-reveal><Rich text={l.tail} /></p>
        <button type="button" className="btn btn-ghost" data-reveal onClick={() => startOnboarding({ persona: g.persona })}><span>{l.cta}</span></button>
      </div>
    </section>
  )
}

function Who() {
  const w = useContent().who
  return (
    <section id="who" className="band who" aria-labelledby="who-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>{w.eyebrow}</p>
        <SplitReveal as="h2" id="who-title" className="display" text={w.title} />
        <div className="who-grid">
          {w.groups.map((g, i) => (
            <article key={g.title} className="who-card glass" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
              <Icon id={g.icon} className="icon icon-lg" />
              <h3>{g.title}</h3>
              <p className="who-line">{g.line}</p>
              <p><Rich text={g.body} /></p>
              <button type="button" className="link-btn" onClick={() => startOnboarding({ persona: g.persona })}>{w.cta} <span className="arr" aria-hidden="true">←</span></button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Commit() {
  const c = useContent().commit
  return (
    <section id="commit" className="band commit" aria-labelledby="commit-title">
      <div className="wrap narrow center">
        <p className="eyebrow" data-reveal>{c.eyebrow}</p>
        <p className="paid-badge" data-reveal><GemMark className="paid-gem" /><span>{c.badge}</span></p>
        <SplitReveal as="h2" id="commit-title" className="display" text={c.title} />
        <div className="split-bar" data-reveal aria-hidden="true">
          <span className="seg seg-80"><b dir="ltr">{c.work.n}</b><em>{c.work.label}</em></span>
          <span className="seg seg-20"><b dir="ltr">{c.you.n}</b><em>{c.you.label}</em></span>
        </div>
        <p className="body-lg" data-reveal><Rich text={c.body} /></p>
        <p className="fine" data-reveal>{c.fine}</p>
      </div>
    </section>
  )
}

function Why() {
  const w = useContent().why
  return (
    <section id="why" className="band why" aria-labelledby="why-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>{w.eyebrow}</p>
        <SplitReveal as="h2" id="why-title" className="display" text={w.title} />
        <ul className="why-grid">
          {w.items.map((it, i) => (
            <li key={it.title} className="why-item" data-reveal style={{ transitionDelay: `${(i % 2) * 80}ms` }}>
              <span className="why-icon"><Icon id={it.icon} /></span>
              <div>
                <h3>{it.title}</h3>
                <p><Rich text={it.body} /></p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Human() {
  const h = useContent().human
  return (
    <section className="band human" aria-labelledby="human-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow" data-reveal>{h.eyebrow}</p>
          <SplitReveal as="h2" id="human-title" className="display" text={h.title} />
          <p className="body-lg" data-reveal><Rich text={h.lede} /></p>
        </div>
        <div className="pillars">
          {h.pillars.map((p, i) => (
            <article key={p.title} className="pillar glass" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
              <Icon id={p.icon} className="icon icon-lg" />
              <div>
                <h3>{p.title}</h3>
                <p><Rich text={p.body} /></p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Offer() {
  const o = useContent().offer
  return (
    <section id="offer" className="band offer" aria-labelledby="offer-title">
      <div className="wrap">
        <div className="offer-card" data-reveal>
          <div className="offer-shine" aria-hidden="true" />
          <p className="eyebrow">{o.eyebrow}</p>
          <SplitReveal as="h2" id="offer-title" className="display" text={o.title} />
          <p className="body-lg"><Rich text={o.lede} /></p>
          <ul className="offer-list">
            {o.includes.map((x) => <li key={x}><GemMark className="li-gem" />{x}</li>)}
          </ul>
          <p className="offer-value">{o.value}</p>
          <p className="offer-guarantee"><Rich text={o.guarantee} /></p>
          <div className="offer-cta">
            <MagneticButton href="#start">{o.cta}</MagneticButton>
            <span className="fine">{o.note}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function CaseCard({ it, mark, big }: { it: CaseItem; mark: string; big?: boolean }) {
  return (
    <article className={`case glass${big ? ' case-big' : ''}`} data-reveal>
      <p className="case-meta"><span>{it.sector}</span><span>{it.tag}</span></p>
      {it.metric && (
        <p className="case-metric"><b dir="ltr">{it.metric}</b><span>{it.metricLabel}</span></p>
      )}
      <h3>{it.title}</h3>
      <p>{it.body}</p>
      {it.extra && (
        // Keep the signed figure in one LTR run so "+511.11%" never flips its sign in Arabic.
        <p className="case-extra"><bdi dir="ltr">{it.extra.split(' ')[0]}</bdi> {it.extra.split(' ').slice(1).join(' ')}</p>
      )}
      {it.confirm && <p className="case-confirm" title={mark}>{mark}</p>}
    </article>
  )
}

function Work() {
  const w = useContent().work
  return (
    <section id="work" className="band work" aria-labelledby="work-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>{w.eyebrow}</p>
        <SplitReveal as="h2" id="work-title" className="display" text={w.title} />
        <p className="body-lg" data-reveal>{w.lede}</p>
        <div className="case-grid">
          {w.featured.map((it) => <CaseCard key={it.title} it={it} mark={w.confirmMark} big />)}
        </div>
        <div className="case-grid small">
          {w.more.map((it) => <CaseCard key={it.title} it={it} mark={w.confirmMark} />)}
        </div>
        <p className="work-tail" data-reveal>{w.tail}</p>
      </div>
    </section>
  )
}

function Support() {
  const s = useContent().support
  return (
    <section id="support" className="band support" aria-labelledby="support-title">
      <div className="wrap narrow center">
        <p className="eyebrow centered" data-reveal>{s.eyebrow}</p>
        <SplitReveal as="h2" id="support-title" className="display" text={s.title} />
        <p className="body-lg" data-reveal><Rich text={s.body} /></p>
        <p className="dedication" data-reveal>{s.dedication}</p>
        <button type="button" className="btn btn-ghost" data-reveal onClick={() => startOnboarding({ persona: 'business', support: true })}><span>{s.cta}</span></button>
        <p className="fine" data-reveal>{s.note}</p>
      </div>
    </section>
  )
}

function Founder() {
  const f = useContent().founder
  return (
    <section id="founder" className="band founder" aria-labelledby="founder-title">
      <div className="wrap narrow">
        <p className="eyebrow" id="founder-title" data-reveal>{f.eyebrow}</p>
        <div className="founder-text">
          {f.paragraphs.map((p) => <p key={p} data-reveal><Rich text={p} /></p>)}
        </div>
        <p className="founder-punch" data-reveal>{f.punch}</p>
        <div data-reveal><MagneticButton href="#start">{f.cta}</MagneticButton></div>
      </div>
    </section>
  )
}

function Start() {
  const o = useContent().onboarding
  return (
    <section id="start" className="band start" aria-labelledby="start-title">
      <div className="wrap start-stack">
        <div className="start-intro center">
          <p className="eyebrow" data-reveal>{o.eyebrow}</p>
          <SplitReveal as="h2" id="start-title" className="display" text={o.title} />
          <p className="body-lg" data-reveal><Rich text={o.lede} /></p>
        </div>
        <Onboarding />
      </div>
    </section>
  )
}

function Finale({ fallback }: { fallback: boolean }) {
  const f = useContent().finale
  return (
    <section id="finale" className="finale" aria-label="KON">
      <div className="finale-sticky">
        <div className="kon-stage">
          <div className="kon-halo" aria-hidden="true" />
          <KonMark solid={fallback} />
        </div>
        <div className="finale-copy">
          <p className="finale-line">{f.line}</p>
          <p className="finale-line2">{f.line2}</p>
          <MagneticButton href="#start">{f.cta}</MagneticButton>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const c = useContent()
  const f = c.footer
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <p className="footer-word" dir="ltr">KON<span>Unlimited</span></p>
          <p className="footer-slogan">{f.slogan}</p>
          <p className="footer-contact" dir="ltr">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
        </div>
        <nav aria-label="Footer" className="footer-nav">
          {c.nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          <a href="#start">{c.headerCta}</a>
        </nav>
      </div>
      <div className="wrap footer-base">
        <span>{f.rights}</span>
        <a href="#top">{f.top} ↑</a>
      </div>
    </footer>
  )
}

/** Phone-only call to action that rides along after the hero and steps aside at the form. */
function DockCta() {
  const c = useContent()
  const [show, setShow] = useState(false)
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const start = document.getElementById('start')
      const atForm = start ? start.getBoundingClientRect().top < window.innerHeight * 0.9 : false
      const fin = document.getElementById('finale')?.getBoundingClientRect()
      const atFinale = fin ? fin.top < window.innerHeight * 0.5 : false
      setShow(window.scrollY > window.innerHeight * 0.9 && !atForm && !atFinale)
    }
    const on = () => { if (!frame) frame = requestAnimationFrame(check) }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <a href="#start" className={`dock-cta${show ? ' is-on' : ''}`} tabIndex={show ? 0 : -1} aria-hidden={!show}>
      <GemMark className="dock-gem" />{c.headerCta}
    </a>
  )
}

/** Feeds scroll and pointer into the shared motion object read by the 3D layer.
 *  Writes only to the few elements that react, and only when a value changes, so scrolling
 *  never forces the whole page to restyle. */
function useMotionInputs() {
  useEffect(() => {
    let finTop = 0, finH = 1, last = window.scrollY, raf = 0, lastFin = -1, lastVeil = -1
    let finEl: HTMLElement | null = null, veilEl: HTMLElement | null = null
    const narrow = () => window.innerWidth < 700
    const measure = () => {
      finEl = document.getElementById('finale')
      veilEl = document.querySelector('.stage-veil')
      if (finEl) {
        finTop = finEl.getBoundingClientRect().top + window.scrollY
        finH = finEl.offsetHeight
      }
    }
    const tick = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      motion.heroOut = Math.min(1, Math.max(0, y / (vh * 0.85)))
      // Gather begins as the finale enters and completes ~65% through its sticky run.
      const p = (y + vh * 0.55 - finTop) / Math.max(1, (finH - vh) * 0.65 + vh * 0.55)
      motion.finale = Math.min(1, Math.max(0, p))
      motion.post = Math.min(1, Math.max(0, (y - (finTop + finH - vh)) / vh))
      motion.vel += (y - last - motion.vel) * 0.2
      last = y
      const fin = Math.round(motion.finale * 200) / 200
      if (fin !== lastFin && finEl) {
        finEl.style.setProperty('--fin', String(fin))
        lastFin = fin
      }
      const mid = motion.heroOut * (1 - motion.finale)
      const veil = Math.round(Math.max(narrow() ? Math.max(mid, 0.62 * (1 - motion.finale)) : mid, motion.post * 0.8) * 100) / 100
      if (veil !== lastVeil && veilEl) {
        veilEl.style.opacity = String(veil)
        lastVeil = veil
      }
      raf = requestAnimationFrame(tick)
    }
    const move = (e: PointerEvent) => {
      motion.px = (e.clientX / window.innerWidth) * 2 - 1
      motion.py = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    measure()
    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [])
}

export default function App() {
  const caps = useMemo(detectCapabilities, [])
  const c = useContent()
  const lang = useStore((s) => s.lang)
  const [ready, setReady] = useState(false)
  useMotionInputs()
  useReveal(lang)

  useEffect(() => {
    document.title = c.meta.title
  }, [c])
  useEffect(() => {
    document.documentElement.classList.add(`tier-${caps.tier}`)
    // Start the opening only once the web fonts are in, so no line re-wraps or swaps typeface
    // mid-animation. Never wait longer than 1.2s on a slow connection.
    let done = false
    let id = 0
    const go = () => {
      if (done) return
      done = true
      id = requestAnimationFrame(() => requestAnimationFrame(() => {
        setReady(true)
        document.documentElement.classList.add('is-ready')
      }))
    }
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    fonts?.ready.then(go, go)
    const timer = window.setTimeout(go, 1200)
    if (!fonts) go()
    return () => {
      done = true
      cancelAnimationFrame(id)
      window.clearTimeout(timer)
    }
  }, [caps.tier])

  const webgl = caps.tier !== 'none'
  return (
    <div className={`app${ready ? ' is-ready' : ''}`}>
      <a href="#main" className="skip">{c.meta.skip}</a>
      <SmoothScroll enabled={!caps.reducedMotion && !caps.touch} />
      <Cursor />
      <div className="stage" aria-hidden="true">
        <div className="stage-glow" />
        {webgl && (
          <Suspense fallback={null}>
            <GemField tier={caps.tier} reduced={caps.reducedMotion} />
          </Suspense>
        )}
        <div className="stage-veil" />
        <div className="stage-vignette" />
      </div>
      <Header />
      <main id="main">
        <Hero ready={ready} />
        <Problem />
        <Loops />
        <Who />
        <Commit />
        <Why />
        <Human />
        <Offer />
        <Work />
        <ReadyServices />
        <Support />
        <Founder />
        <Finale fallback={!webgl} />
        <Start />
      </main>
      <Footer />
      <DockCta />
    </div>
  )
}
