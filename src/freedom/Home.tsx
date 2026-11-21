// KON · «من السطح إلى الجوهر» — From the surface to the core.
// The page is one descent: the surface (what everyone sees: numbers), the question, the pressure
// that reveals, the method, the proof, and at the core the person, then a single way in.
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { contact, type Persona } from '../content/site'
import { useContent } from '../content/useContent'
import { Rich } from '../components/Rich'
import { KonGlass } from '../components/KonGlass'
import { setLang, startOnboarding, useStore } from '../state/store'
import { Depth } from './Depth'
import { depthState } from './depthState'
import { Book } from './Book'
import { fcopy } from './copy'

let lenis: Lenis | null = null
function glide(hash: string) {
  const el = document.querySelector<HTMLElement>(hash)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: hash === '#book' ? -90 : hash === '#start' ? -24 : 0, duration: 1.5 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
function toBook(p?: { persona: Persona; pains?: string[]; support?: boolean }) {
  if (p) startOnboarding(p)
  requestAnimationFrame(() => glide(p ? '#book' : '#start'))
}

/** Headline: each comma-separated phrase is its own masked line, and the comma itself is not shown. */
function Lines({ text, as: Tag = 'h2', className = '' }: { text: string | string[]; as?: 'h1' | 'h2' | 'p'; className?: string }) {
  const parts = Array.isArray(text) ? text : text.split(/[،,]\s*/).filter(Boolean)
  return (
    <Tag className={`fd-lines ${className}`} data-r>
      {parts.map((p, i) => (
        <span key={i} className="ln" style={{ ['--i' as string]: i }}><span>{p}</span></span>
      ))}
    </Tag>
  )
}

function Eyebrow({ n, children }: { n: string; children: ReactNode }) {
  return <p className="fd-eyebrow" data-r><b dir="ltr">{n}</b><span>{children}</span></p>
}

function Header() {
  const lang = useStore((s) => s.lang)
  const c = useContent()
  const f = fcopy[lang]
  const [open, setOpen] = useState(false)
  useEffect(() => { document.body.classList.toggle('fd-menu-open', open) }, [open])
  return (
    <header className="fd-head">
      <a href="#top" className="fd-logo" aria-label="KON Unlimited" dir="ltr"><b>KON</b><span>Unlimited</span></a>
      <nav className="fd-nav" aria-label={f.menu}>
        {f.nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
      </nav>
      <div className="fd-head-end">
        <button type="button" className="fd-lang" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={c.meta.switchLabel}>{c.meta.switchTo}</button>
        <a href="#start" className="fd-btn fd-btn-sm">{c.headerCta}</a>
        <button type="button" className="fd-burger" aria-expanded={open} aria-label={open ? f.close : f.menu} onClick={() => setOpen(!open)}><i /><i /></button>
      </div>
      <div className="fd-sheet" hidden={!open} onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false) }}>
        {f.nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
        <a href="#founder">{c.founder.eyebrow}</a>
        <a href="#start" className="fd-btn">{c.hero.primary}</a>
      </div>
    </header>
  )
}

function Rail({ active }: { active: number }) {
  const lang = useStore((s) => s.lang)
  const ch = fcopy[lang].chapters
  return (
    <ol className="fd-rail" aria-hidden="true">
      {ch.map((x, i) => <li key={x} className={i === active ? 'on' : i < active ? 'past' : ''}><span>{x}</span></li>)}
    </ol>
  )
}

function Hero() {
  const c = useContent()
  const h = c.hero
  return (
    <section className="fd-hero" id="top" data-ch="0">
      <div className="fd-wrap fd-hero-in">
        <p className="fd-hero-eyebrow" data-r>{h.eyebrow}</p>
        <Lines as="h1" className="fd-h1" text={h.statement} />
        <div className="fd-hero-side">
          <p className="fd-lede" data-r><Rich text={h.lede} /></p>
          <div className="fd-ctas" data-r>
            <a href="#start" className="fd-btn" onClick={(e) => { e.preventDefault(); toBook() }}>{h.primary}</a>
            <a href="#work" className="fd-link">{h.secondary}</a>
          </div>
          <p className="fd-micro" data-r>{h.micro}</p>
        </div>
      </div>
      <div className="fd-wrap">
        <ul className="fd-proof" data-r>
          {h.proof.map((p) => (
            <li key={p.n}><b dir="ltr">{p.n}</b><span>{p.l}</span><small>{p.s}</small></li>
          ))}
        </ul>
      </div>
      <p className="fd-slogan" dir="ltr" data-r>{h.slogan}</p>
    </section>
  )
}

function Problem() {
  const lang = useStore((s) => s.lang)
  const p = useContent().problem
  return (
    <section className="fd-sec fd-problem" id="problem" data-ch="1">
      <div className="fd-wrap">
        <Lines className="fd-h2 fd-xl" text={p.title} />
        <p className="fd-sub" data-r>{p.lines[0]}</p>
        <div className="fd-paths">
          {p.paths.map((x, i) => (
            <div className="fd-path" key={x.persona} data-r style={{ ['--d' as string]: i }}>
              <button type="button" className="fd-path-h" onClick={() => toBook({ persona: x.persona })}>{x.label}<i aria-hidden="true">{lang === 'ar' ? '←' : '→'}</i></button>
              <div className="fd-path-q">
                {x.q.map((q) => <button key={q} type="button" className="fd-chip" onClick={() => toBook({ persona: x.persona, pains: [q] })}>{q}</button>)}
              </div>
            </div>
          ))}
        </div>
        <p className="fd-hint" data-r>{p.hint}</p>
        <p className="fd-closing" data-r>{p.closing}</p>
      </div>
    </section>
  )
}

function Pressure({ refEl }: { refEl: React.RefObject<HTMLElement | null> }) {
  const lang = useStore((s) => s.lang)
  const t = fcopy[lang].pressure
  return (
    <section className="fd-pressure" id="pressure" data-ch="2" ref={refEl} aria-label={t.label} data-beat="0">
      <div className="fd-press-stage">
        <div className="pb pb-0"><p className="pb-big">{t.press}</p><p className="pb-key">{t.reveal}</p></div>
        <div className="pb pb-1">
          <p className="pb-kick">{t.kick}</p>
          <p className="pb-key">{t.key}</p>
          <p className="pb-q">{t.q}</p>
          <p className="pb-pair"><span>{t.a1}</span><i aria-hidden="true" /><span>{t.a2}</span></p>
        </div>
        <div className="pb pb-2"><p className="pb-kick">{t.vKick}</p><p className="pb-lead">{t.vLead}</p><p className="pb-key">{t.vKey}</p></div>
        <div className="pb pb-3"><p className="pb-lead">{t.wLead}</p><p className="pb-key pb-core">{t.wKey}</p></div>
        <div className="fd-press-meter" aria-hidden="true"><i /></div>
      </div>
    </section>
  )
}

function Approach() {
  const a = useContent().approach
  return (
    <section className="fd-sec" id="approach" data-ch="3">
      <div className="fd-wrap">
        <Eyebrow n="01">{a.eyebrow}</Eyebrow>
        <Lines className="fd-h2" text={a.title} />
        <ol className="fd-pillars">
          {a.pillars.map((p, i) => (
            <li key={p.title} data-r style={{ ['--d' as string]: i }}>
              <span className="fd-num" dir="ltr">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p><Rich text={p.body} /></p>
              <blockquote>{p.idea}</blockquote>
            </li>
          ))}
        </ol>
        <p className="fd-foot" data-r>{a.foot}</p>
      </div>
    </section>
  )
}

function Work() {
  const lang = useStore((s) => s.lang)
  const w = useContent().work
  return (
    <section className="fd-sec" id="work" data-ch="4">
      <div className="fd-wrap">
        <Eyebrow n="02">{w.eyebrow}</Eyebrow>
        <Lines className="fd-h2" text={w.title} />
        <p className="fd-sub" data-r>{w.lede}</p>
        <div className="fd-ledger">
          {w.featured.map((it, i) => (
            <article key={it.title} className="fd-case" data-r style={{ ['--d' as string]: i % 2 }}>
              <div className="fd-case-n"><b dir="ltr">{it.metric}</b><span>{it.metricLabel}</span>{it.extra && <small dir="auto">{it.extra}</small>}</div>
              <div className="fd-case-t">
                <p className="fd-tag">{it.sector} · {it.tag}</p>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            </article>
          ))}
        </div>
        <h3 className="fd-minor" data-r>{fcopy[lang].workMore}</h3>
        <ul className="fd-more">
          {w.more.map((it) => (
            <li key={it.title} data-r>
              <p className="fd-tag">{it.sector}</p>
              <h4>{it.title}</h4>
              <p>{it.body}</p>
              {it.metric && <p className="fd-more-n"><b dir="ltr">{it.metric}</b> {it.metricLabel}</p>}
            </li>
          ))}
        </ul>
        <p className="fd-foot" data-r>{w.tail}</p>
        <p data-r><a href="#/work" className="fd-link">{w.all} <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span></a></p>
      </div>
    </section>
  )
}

function Services() {
  const lang = useStore((s) => s.lang)
  const s = useContent().services
  return (
    <section className="fd-sec" id="services" data-ch="5">
      <div className="fd-wrap">
        <Eyebrow n="03">{s.eyebrow}</Eyebrow>
        <Lines className="fd-h2" text={s.title} />
        <p className="fd-sub" data-r><Rich text={fcopy[lang].servicesLede} /></p>
        <ul className="fd-services">
          {s.items.map((it, i) => (
            <li key={it.title} data-r style={{ ['--d' as string]: i % 3 }}
              onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`) }}>
              <span className="fd-num" dir="ltr">0{i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Talent() {
  const lang = useStore((s) => s.lang)
  const c = useContent()
  const m = c.more
  return (
    <section className="fd-sec fd-talent" id="talent" data-ch="6">
      <div className="fd-wrap">
        <Eyebrow n="04">{m.eyebrow}</Eyebrow>
        <Lines className="fd-h2" text={c.talent.title} />
        <p className="fd-sub" data-r>{fcopy[lang].talentLede}</p>
        <p className="fd-body" data-r><Rich text={m.lede} /></p>
        <div className="fd-doors">
          {m.items.map((it, i) => (
            <a key={it.side} href={it.href} className="fd-door" data-r style={{ ['--d' as string]: i }}>
              <span className="fd-tag">{it.k}</span>
              <h3>{it.title}</h3>
              <p><Rich text={it.body} /></p>
              <span className="fd-link">{it.cta} <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Founder() {
  const f = useContent().founder
  const [first, ...rest] = f.paragraphs
  return (
    <section className="fd-sec fd-founder" id="founder" data-ch="7">
      <div className="fd-wrap fd-narrow">
        <Eyebrow n="05">{f.eyebrow}</Eyebrow>
        <p className="fd-founder-first" data-r><Rich text={first} /></p>
        {rest.map((p) => <p key={p} className="fd-founder-p" data-r><Rich text={p} /></p>)}
        <Lines as="p" className="fd-punch" text={f.punch} />
      </div>
    </section>
  )
}

function Start() {
  const c = useContent()
  const o = c.offer
  return (
    <section className="fd-sec fd-start" id="start" data-ch="8">
      <div className="fd-wrap fd-start-grid">
        <div className="fd-offer">
          <Eyebrow n="06">{o.eyebrow}</Eyebrow>
          <Lines className="fd-h2" text={o.title} />
          <p className="fd-body" data-r><Rich text={o.lede} /></p>
          <ul className="fd-checks" data-r>{o.includes.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="fd-value" data-r>{o.value}</p>
          <p className="fd-note" data-r>{o.note}</p>
        </div>
        <Book />
      </div>
    </section>
  )
}

function Support() {
  const s = useContent().support
  return (
    <section className="fd-support" id="support">
      <div className="fd-wrap fd-narrow">
        <p className="fd-tag" data-r>{s.eyebrow}</p>
        <h2 className="fd-support-t" data-r>{s.title}</h2>
        <p className="fd-body" data-r><Rich text={s.body} /></p>
        <p className="fd-dedication" data-r>{s.dedication}</p>
        <p data-r><button type="button" className="fd-link" onClick={() => toBook({ persona: 'business', support: true })}>{s.cta}</button></p>
      </div>
    </section>
  )
}

function Footer() {
  const lang = useStore((s) => s.lang)
  const c = useContent()
  const f = c.footer
  const i = f.slogan.lastIndexOf('…')
  return (
    <footer className="fd-footer" id="footer">
      <div className="fd-wrap">
        <KonGlass />
        <p className="fd-foot-slogan" dir="ltr">
          {i < 0 ? f.slogan : <><span>{f.slogan.slice(0, i)}</span><span>{f.slogan.slice(i + 1)}</span></>}
        </p>
        <p className="fd-foot-mail" dir="ltr"><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
        <nav className="fd-foot-nav" aria-label="Footer">
          {fcopy[lang].nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          <a href="#founder">{c.founder.eyebrow}</a>
        </nav>
        <div className="fd-foot-base"><span>{f.rights}</span><a href="#top">{fcopy[lang].top} ↑</a></div>
      </div>
    </footer>
  )
}

function Dock({ show }: { show: boolean }) {
  const lang = useStore((s) => s.lang)
  return (
    <div className={`fd-dock${show ? ' on' : ''}`} aria-hidden={!show}>
      <a href="#start" className="fd-btn" tabIndex={show ? 0 : -1} onClick={(e) => { e.preventDefault(); toBook() }}>{fcopy[lang].dock}</a>
    </div>
  )
}

export function Home() {
  const lang = useStore((s) => s.lang)
  const pressRef = useRef<HTMLElement>(null)
  const [chapter, setChapter] = useState(0)
  const [dock, setDock] = useState(false)

  useEffect(() => { document.title = titleFor(lang) }, [lang])

  // Smooth scrolling (off for reduced motion) and in-page anchors that glide.
  useEffect(() => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!still) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
      let id = 0
      const raf = (t: number) => { lenis?.raf(t); id = requestAnimationFrame(raf) }
      id = requestAnimationFrame(raf)
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
        if (!a) return
        const h = a.getAttribute('href')!
        if (h === '#' || h.startsWith('#/')) return
        if (!document.querySelector(h)) return
        e.preventDefault()
        glide(h)
      }
      document.addEventListener('click', onClick)
      return () => { cancelAnimationFrame(id); document.removeEventListener('click', onClick); lenis?.destroy(); lenis = null }
    }
  }, [])

  // Reveal on view.
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    document.querySelectorAll('[data-r]:not(.in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [lang])

  // Scroll → the light world, the chapter rail, the dock, the pressure beats.
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>('[data-ch]'))
    const start = document.getElementById('start')
    const footer = document.getElementById('footer')
    const head = document.querySelector<HTMLElement>('.fd-head')
    let lastY = scrollY
    let ticking = false
    const update = () => {
      ticking = false
      const y = scrollY
      const vh = innerHeight
      const max = Math.max(1, document.documentElement.scrollHeight - vh)
      depthState.depth = y / max
      // pressure chapter
      const pe = pressRef.current
      if (pe) {
        const r = pe.getBoundingClientRect()
        const travel = Math.max(1, r.height - vh)
        const p = Math.min(1, Math.max(0, -r.top / travel))
        const inView = Math.min(1, Math.max(0, Math.min((vh - r.top) / (vh * 0.7), (r.bottom - vh * 0.45) / (vh * 0.4))))
        depthState.press = p
        depthState.pv = inView
        const beat = p < 0.24 ? 0 : p < 0.5 ? 1 : p < 0.74 ? 2 : 3
        pe.dataset.beat = String(beat)
        pe.style.setProperty('--pp', p.toFixed(3))
        pe.classList.toggle('is-revealed', p > 0.1)
      }
      // finale light
      if (footer) {
        const fr = footer.getBoundingClientRect()
        depthState.rise = Math.min(1, Math.max(0, (vh - fr.top) / vh))
      }
      // chapter
      let ch = 0
      for (const s of secs) if (s.getBoundingClientRect().top < vh * 0.5) ch = Number(s.dataset.ch)
      setChapter(ch)
      // dock: after the hero, away from the booking card and footer
      const sr = start?.getBoundingClientRect()
      const fr2 = footer?.getBoundingClientRect()
      const nearStart = !!sr && sr.top < vh && sr.bottom > 0
      const nearFoot = !!fr2 && fr2.top < vh
      setDock(y > vh * 0.8 && !nearStart && !nearFoot)
      // header hides while reading down, returns on the way up
      if (head) { head.classList.toggle('is-hidden', y > vh * 0.6 && y > lastY + 2); if (y < lastY - 2 || y < 40) head.classList.remove('is-hidden'); head.classList.toggle('is-solid', y > 40) }
      lastY = y
      depthState.onChange?.()
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    update()
    // honour a #section in the address bar
    const h = location.hash
    if (h && !h.startsWith('#/') && h.length > 1 && !/^#(en|ar)$/.test(h)) setTimeout(() => document.querySelector(h)?.scrollIntoView(), 60)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll) }
  }, [lang])

  return (
    <Fragment key={lang}>
      <Depth />
      <a className="fd-skip" href="#problem">{lang === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'}</a>
      <Header />
      <Rail active={chapter} />
      <main>
        <Hero />
        <Problem />
        <Pressure refEl={pressRef} />
        <Approach />
        <Work />
        <Services />
        <Talent />
        <Founder />
        <Start />
        <Support />
      </main>
      <Footer />
      <Dock show={dock} />
    </Fragment>
  )
}

function titleFor(lang: string) {
  return lang === 'ar' ? 'KON Unlimited · من السطح إلى الجوهر' : 'KON Unlimited · From the surface to the core'
}
