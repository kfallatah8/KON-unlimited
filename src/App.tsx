import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent } from './content/useContent'
import { detectCapabilities } from './lib/capabilities'
import { setLang, useStore } from './state/store'
import { CaseStudies } from './components/CaseStudies'
import { Cursor } from './components/Cursor'
import { DiagnosticVisualization } from './components/DiagnosticVisualization'
import { Intro } from './components/Intro'
import { MagneticButton } from './components/MagneticButton'
import { SceneFallback } from './components/SceneFallback'
import { lenis, SmoothScroll } from './components/SmoothScroll'
import { SplitReveal } from './components/SplitReveal'
import { SCENE } from './three/formations'
import { TransformationSequence } from './three/TransformationSequence'

// The WebGL stage is a separate chunk: copy and layout never wait for it.
const Hero3DScene = lazy(() => import('./three/Hero3DScene'))

gsap.registerPlugin(ScrollTrigger)

const pad = (n: number) => String(n).padStart(2, '0')

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
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <span className="page-progress" ref={bar} aria-hidden="true" />
      <a href="#top" className="logo" aria-label="KON Unlimited">
        <span className="logo-mark" aria-hidden="true"><i /><i /><i /></span>
        <span dir="ltr"><b>KON</b> Unlimited</span>
      </a>
      <nav aria-label="Primary" className="nav-desktop">
        {c.nav.map((n) => <a key={n.href} href={n.href} className="nav-link"><span>{n.label}</span></a>)}
      </nav>
      <div className="header-actions">
        <LangSwitch />
        <a href="#contact" className="header-cta">{c.headerCta}</a>
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
          <span className="sr-only">{open ? c.meta.close : c.meta.menu}</span>
          <i /><i />
        </button>
      </div>
      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          {c.nav.map((n, i) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              <span dir="ltr">{pad(i + 1)}</span>{n.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)}><span dir="ltr">{pad(c.nav.length + 1)}</span>{c.headerCta}</a>
        </nav>
      </div>
    </header>
  )
}

function Hero({ play }: { play: boolean }) {
  const c = useContent()
  const h = c.hero
  return (
    <section id="top" className="hero" data-scene={SCENE.hero} aria-labelledby="hero-title">
      <div className="hero-frame" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="hero-copy">
        <p className="eyebrow hero-fade">{h.eyebrow}</p>
        <SplitReveal as="h1" id="hero-title" className="hero-title" text={h.title} play={play} delay={0.1} />
        <p className="hero-lede hero-fade">{h.lede}</p>
        <div className="hero-ctas hero-fade">
          <MagneticButton href="#contact">{h.primary}</MagneticButton>
          <MagneticButton href="#story" variant="ghost">{h.secondary}</MagneticButton>
        </div>
      </div>
      <div className="hero-foot hero-fade">
        <ol className="stages" aria-label={c.stagesLabel}>
          {c.stages.map((s, i) => (
            <li key={s}><span dir="ltr">{pad(i + 1)}</span>{s}</li>
          ))}
        </ol>
        <div className="hero-meta">
          {h.meta.map((m) => <span key={m}>{m}</span>)}
        </div>
        <a href="#story" className="scroll-cue"><span>{h.scroll}</span><i aria-hidden="true" /></a>
      </div>
    </section>
  )
}

function Story() {
  const c = useContent()
  const [active, setActive] = useState(0)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.chapter'))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.index))),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="story" className="story" aria-label={c.stagesLabel}>
      <nav className="rail" aria-label={c.chaptersLabel}>
        <span className="rail-progress" style={{ ['--p' as string]: (active + 1) / c.chapters.length }} aria-hidden="true" />
        {c.chapters.map((ch, i) => (
          <a key={ch.id} href={`#ch-${ch.id}`} aria-current={active === i ? 'step' : undefined}>
            <span dir="ltr">{pad(i + 1)}</span>
            <em>{ch.step}</em>
          </a>
        ))}
      </nav>
      <div className="chapters">
        {c.chapters.map((ch, i) => (
          <article key={ch.id} id={`ch-${ch.id}`} className={`chapter chapter-${ch.id}`} data-index={i} data-scene={i + 1}>
            <div className="panel">
              <p className="chapter-num" aria-hidden="true">{pad(i + 1)}</p>
              <p className="eyebrow reveal">{ch.step}</p>
              <SplitReveal text={ch.title} />
              <p className="reveal">{ch.body}</p>
              {'note' in ch && ch.note && <p className="note reveal">{ch.note}</p>}
              {'list' in ch && ch.list && (
                <ul className="pill-list reveal">{ch.list.map((l) => <li key={l}>{l}</li>)}</ul>
              )}
              {'findings' in ch && ch.findings && (
                <dl className="findings reveal">
                  {ch.findings.map((f, j) => (
                    <div key={f.k} className={j < 2 ? 'is-warn' : ''}>
                      <dt>{f.k}</dt>
                      <dd>{f.v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {'cta' in ch && ch.cta && (
                <div className="hero-ctas reveal">
                  <MagneticButton href="#framework">{ch.cta}</MagneticButton>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/** Drifts on its own and speeds up with the visitor's scroll, then eases back. */
function Marquee() {
  const items = useContent().marquee
  const row = [...items, ...items]
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!track.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tw = gsap.to(track.current, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 })
    // Read Lenis velocity every tick (Lenis may mount after this effect), easing the
    // drift speed toward it so the strip never jerks.
    let ts = 1
    const tick = () => {
      const target = 1 + Math.min(Math.abs(lenis?.velocity ?? 0) * 0.35, 6)
      ts += (target - ts) * (target > ts ? 0.2 : 0.04)
      tw.timeScale(ts)
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      tw.kill()
    }
  }, [])
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={track}>
        {[0, 1].map((k) => (
          <div key={k} className="marquee-row">
            {row.map((m, i) => <span key={i}>{m}<i /></span>)}
          </div>
        ))}
      </div>
    </div>
  )
}

function Services() {
  const c = useContent()
  return (
    <section id="services" className="solid services" aria-labelledby="services-title">
      <Marquee />
      <div className="solid-inner">
        <div className="section-head">
          <p className="eyebrow">{c.services.eyebrow}</p>
          <SplitReveal id="services-title" text={c.services.title} />
        </div>
        <ol className="service-list">
          {c.services.items.map((s, i) => (
            <li key={s.k} className="reveal">
              <span className="svc-num" dir="ltr">{pad(i + 1)}</span>
              <h3>{s.k}</h3>
              <p>{s.v}</p>
              <span className="svc-arrow" aria-hidden="true" />
            </li>
          ))}
        </ol>

        <div className="section-head process-head">
          <p className="eyebrow">{c.process.eyebrow}</p>
          <SplitReveal text={c.process.title} />
        </div>
        <ol className="process">
          {c.process.steps.map((s, i) => (
            <li key={s.k} className="reveal">
              <span className="proc-num" dir="ltr">{pad(i + 1)}</span>
              <h3>{s.k}</h3>
              <p>{s.v}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function HumanAI() {
  const h = useContent().humanAI
  return (
    <section id="human-ai" className="human-ai" aria-labelledby="hai-title">
      <div className="hai-block" data-scene={SCENE.humanApart}>
        <div className="panel">
          <p className="eyebrow reveal">{h.eyebrow}</p>
          <SplitReveal id="hai-title" text={h.title} />
          <p className="reveal">{h.body}</p>
          <div className="hai-legend reveal" aria-hidden="true">
            <span className="lg-human">{h.legend[0]}</span>
            <span className="lg-ai">{h.legend[1]}</span>
          </div>
        </div>
      </div>
      <div className="hai-block" data-scene={SCENE.humanJoined}>
        <div className="panel">
          <p className="eyebrow reveal">{h.joinedEyebrow}</p>
          <dl className="hai-parts">
            {h.parts.map((p, i) => (
              <div key={p.k} className="reveal">
                <dt>{i > 0 && <span aria-hidden="true">+ </span>}{p.k}</dt>
                <dd>{p.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const c = useContent()
  const f = c.contact
  const [sent, setSent] = useState(false)
  return (
    <section id="contact" className="solid contact" data-scene={SCENE.rest} aria-labelledby="contact-title">
      <div className="solid-inner contact-grid">
        <div className="contact-copy">
          <p className="eyebrow">{f.eyebrow}</p>
          <SplitReveal id="contact-title" text={f.title} />
          <p className="reveal">{f.body}</p>
        </div>
        <form
          className="contact-form reveal"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          {sent ? (
            <p className="form-done" role="status">{f.done}</p>
          ) : (
            <>
              <div className="field">
                <input id="f-name" name="name" autoComplete="name" required placeholder=" " />
                <label htmlFor="f-name">{f.name}</label>
              </div>
              <div className="field">
                <input id="f-company" name="company" autoComplete="organization" placeholder=" " />
                <label htmlFor="f-company">{f.company}</label>
              </div>
              <div className="field">
                <input id="f-email" name="email" type="email" dir="ltr" autoComplete="email" required placeholder=" " />
                <label htmlFor="f-email">{f.email}</label>
              </div>
              <div className="field field-select">
                <label htmlFor="f-dim" className="static">{f.challenge}</label>
                <select id="f-dim" name="dimension" defaultValue="">
                  <option value="" disabled>{f.choose}</option>
                  {c.dimensions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  <option value="unsure">{f.unsure}</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary"><span>{f.cta}</span></button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}

function Footer() {
  const c = useContent()
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <p className="footer-tagline">{c.footer.tagline}</p>
        <a href="#top" className="footer-top-link">{c.footer.top}</a>
      </div>
      <p className="wordmark" dir="ltr" aria-hidden="true"><b>KON</b> Unlimited</p>
      <div className="footer-bottom">
        <span dir="ltr">© {new Date().getFullYear()} KON Unlimited</span>
      </div>
    </footer>
  )
}

export default function App() {
  const caps = useMemo(detectCapabilities, [])
  const c = useContent()
  const lang = useStore((s) => s.lang)
  const ready = useStore((s) => s.ready)
  const root = useRef<HTMLDivElement>(null)
  const useIntro = !caps.reducedMotion
  const [introDone, setIntroDone] = useState(!useIntro)
  const onIntroDone = useCallback(() => setIntroDone(true), [])
  const introDims = useMemo(() => c.dimensions.map((d) => d.name), [c])

  // Secondary reveals: short, quiet fades. The 3D transformations carry the strongest motion.
  useEffect(() => {
    document.documentElement.dataset.tier = caps.tier
    if (caps.reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.from(el, {
          y: 28, opacity: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      })
      // case visuals open like a curtain as they arrive
      gsap.utils.toArray<HTMLElement>('.case-stage, .devices-wrap, .opsmap').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(14% 10% 14% 10% round 2px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 2px)', ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 0.8 },
        })
      })
      // chapter numerals drift slower than the copy: quiet depth
      gsap.utils.toArray<HTMLElement>('.chapter-num').forEach((el) => {
        gsap.fromTo(el, { yPercent: 40 }, {
          yPercent: -40, ease: 'none',
          scrollTrigger: { trigger: el.closest('.chapter'), start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [caps, lang])

  useEffect(() => {
    if (!introDone || caps.reducedMotion) return
    const tw = gsap.fromTo('.hero-fade', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.45 })
    return () => { tw.kill() }
  }, [introDone, caps])

  return (
    <div ref={root} className={`app${introDone ? ' is-in' : ''}`}>
      <a href="#main" className="skip">{c.meta.skip}</a>
      {caps.tier === 'none' ? (
        <SceneFallback />
      ) : (
        <Suspense fallback={null}>
          <Hero3DScene caps={caps} />
        </Suspense>
      )}
      {useIntro && <Intro ready={ready || caps.tier === 'none'} label={c.intro} tagline={c.footer.tagline} dims={introDims} onDone={onIntroDone} />}
      <div className="scrim" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <SmoothScroll enabled={!caps.reducedMotion && !caps.touch} />
      <Cursor />
      <TransformationSequence />
      <Header />
      <main id="main" key={lang}>
        <Hero play={introDone} />
        <Story />
        <Services />
        <DiagnosticVisualization />
        <HumanAI />
        <CaseStudies caps={caps} />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
