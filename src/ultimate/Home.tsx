// KON Ultimate: the homepage as a diagnosis. Thesis "beneath the number" (see docs/ULTIMATE.md).
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useContent } from '../content/useContent'
import { contact } from '../content/site'
import type { CaseItem, Persona } from '../content/site'
import { setLang, startOnboarding, useStore } from '../state/store'
import { Rich } from '../components/Rich'
import { Onboarding, chipPain } from '../components/Onboarding'
import { KonGlass } from '../components/KonGlass'
import { ucopy } from './copy'
import { Lens } from './Lens'

const useU = () => ucopy[useStore((s) => s.lang)]
const arrow = (lang: string) => (lang === 'ar' ? '←' : '→')

/** Section reveal (once) for [data-r]; anything at or above the fold shows at once. */
function useReveal(dep: string) {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -6% 0px' })
    const scan = () => document.querySelectorAll('[data-r]:not(.is-in)').forEach((el) => {
      if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in')
      else io.observe(el)
    })
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.getElementById('main')!, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [dep])
}

/** Brings the onboarding into view with a persona already chosen. */
function openForm(persona: Persona, pains?: string[], support?: boolean) {
  startOnboarding({ persona, pains: pains?.filter(Boolean), support })
  requestAnimationFrame(() => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function Cta({ children, ghost, href = '#start' }: { children: ReactNode; ghost?: boolean; href?: string }) {
  return <a href={href} className={`u-btn${ghost ? ' u-btn-ghost' : ''}`}><span>{children}</span></a>
}

function LangSwitch() {
  const c = useContent()
  const lang = useStore((s) => s.lang)
  return (
    <button type="button" className="u-lang" lang={lang === 'ar' ? 'en' : 'ar'} aria-label={c.meta.switchLabel}
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{c.meta.switchTo}</button>
  )
}

function Header() {
  const c = useContent()
  const u = useU()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('u-menu-open', open)
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])
  return (
    <header className={`u-head${solid ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
      <a href="#top" className="u-logo" aria-label="KON Unlimited" dir="ltr"><b>KON</b> Unlimited</a>
      <nav className="u-nav" aria-label="Primary">
        {c.nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
      </nav>
      <div className="u-head-act">
        <LangSwitch />
        <a href="#start" className="u-head-cta">{u.cta}</a>
        <button type="button" className="u-burger" aria-expanded={open} aria-controls="u-menu" onClick={() => setOpen(!open)}>
          <span className="sr-only">{open ? c.meta.close : u.menu}</span><i /><i />
        </button>
      </div>
      <div id="u-menu" className="u-menu" hidden={!open}>
        <nav aria-label="Mobile">
          {c.nav.map((n) => <a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>)}
        </nav>
        <a href="#start" className="u-btn" onClick={() => setOpen(false)}><span>{u.cta}</span></a>
      </div>
    </header>
  )
}

function Hero() {
  const c = useContent()
  const u = useU()
  const lang = useStore((s) => s.lang)
  const h = c.hero
  return (
    <section id="top" className="u-hero" aria-labelledby="u-hero-title">
      <Lens rtl={lang === 'ar'} />
      <div className="u-hero-veil" aria-hidden="true" />
      <div className="u-wrap u-hero-in">
        <p className="u-eyebrow u-rise" style={{ ['--i' as string]: 0 }}>{h.eyebrow}</p>
        <h1 id="u-hero-title" className="u-h1">
          {h.statement.map((l, i) => <span key={l} className="u-rise" style={{ ['--i' as string]: i + 1 }}>{l}</span>)}
        </h1>
        <p className="u-hero-lede u-rise" style={{ ['--i' as string]: 3 }}><Rich text={u.hero.lede} /></p>
        <p className="u-hero-sub u-rise" style={{ ['--i' as string]: 4 }}>{u.hero.sub}</p>
        <div className="u-hero-cta u-rise" style={{ ['--i' as string]: 5 }}>
          <Cta>{u.cta}</Cta>
          <Cta ghost href="#work">{u.hero.secondary}</Cta>
        </div>
        <p className="u-micro u-rise" style={{ ['--i' as string]: 6 }}>{h.micro}</p>
      </div>
      <ul className="u-proof u-wrap" aria-label="KON">
        {h.proof.map((p) => <li key={p.l}><b dir="ltr">{p.n}</b><span>{p.l}</span><small>{p.s}</small></li>)}
      </ul>
      <p className="u-lens-hint" aria-hidden="true">{u.hero.lens}</p>
    </section>
  )
}

function Problem() {
  const p = useContent().problem
  const lang = useStore((s) => s.lang)
  return (
    <section id="problem" className="u-sec u-problem" aria-labelledby="u-problem-title">
      <div className="u-wrap">
        <div className="u-center" data-r>
          <h2 id="u-problem-title" className="u-h2">{p.title}</h2>
          {p.lines.map((l) => <p key={l} className="u-problem-line">{l}</p>)}
          <p className="u-problem-close">{p.closing}</p>
        </div>
        <div className="u-paths">
          {p.paths.map((path, i) => (
            <div key={path.persona} className="u-path" data-r style={{ ['--i' as string]: i }}>
              <button type="button" className="u-path-head" onClick={() => openForm(path.persona)}>
                <span>{path.label}</span><i aria-hidden="true">{arrow(lang)}</i>
              </button>
              <div className="u-chips">
                {path.q.map((q) => <button key={q} type="button" className="u-chip" onClick={() => openForm(path.persona, [chipPain(q)])}>{q}</button>)}
              </div>
            </div>
          ))}
        </div>
        <p className="u-hint" data-r>{p.hint}</p>
      </div>
    </section>
  )
}

/** One symptom card: the surface lifts as it crosses the reading line and shows the cause
 *  beneath. It closes again when scrolled back above, so it replays on the way down. */
function XCard({ card, labels, i }: { card: (typeof ucopy)['ar']['beneath']['cards'][number]; labels: { surface: string; below: string; fix: string; tap: string }; i: number }) {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const el = ref.current!
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setOpen(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setOpen(true)
      else if (e.boundingClientRect.top > (e.rootBounds?.bottom ?? innerHeight * 0.6)) setOpen(false)
    }, { rootMargin: '0px 0px -38% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <article ref={ref} className={`u-x${open ? ' is-open' : ''}`} style={{ ['--i' as string]: i }}>
      <p className="u-x-who">{card.who}</p>
      <p className="u-x-sym"><span className="u-x-k">{labels.surface}</span>{card.surface}</p>
      <div className="u-x-below">
        <span className="u-x-k">{labels.below}</span>
        <p className="u-x-cause">{card.below}</p>
        <p className="u-x-fix"><span>{labels.fix}</span>{card.fix}</p>
      </div>
      <button type="button" className="u-x-tap" aria-expanded={open} onClick={() => setOpen(!open)}>{labels.tap}</button>
    </article>
  )
}

function Beneath() {
  const b = useU().beneath
  return (
    <section id="beneath" className="u-sec u-beneath" aria-labelledby="u-beneath-title">
      <div className="u-wrap">
        <div className="u-head2" data-r>
          <p className="u-eyebrow">{b.eyebrow}</p>
          <h2 id="u-beneath-title" className="u-h2">{b.title.map((l) => <span key={l}>{l}</span>)}</h2>
          <p className="u-lede">{b.lede}</p>
        </div>
        <div className="u-xgrid">
          {b.cards.map((card, i) => <XCard key={card.who} card={card} labels={b} i={i} />)}
        </div>
        <p className="u-note" data-r>{b.note}</p>
        <p className="u-close" data-r><Rich text={b.close} /></p>
      </div>
    </section>
  )
}

function Method() {
  const u = useU()
  const c = useContent()
  const m = u.method
  return (
    <section id="approach" className="u-sec u-method" aria-labelledby="u-method-title">
      <div className="u-wrap">
        <div className="u-head2" data-r>
          <p className="u-eyebrow">{m.eyebrow}</p>
          <h2 id="u-method-title" className="u-h2">{m.title.map((l) => <span key={l}>{l}</span>)}</h2>
        </div>
        <ol className="u-steps">
          {m.steps.map((s, i) => (
            <li key={s.k} className="u-step" data-r style={{ ['--i' as string]: i }}>
              <span className="u-step-n" dir="ltr">0{i + 1}</span>
              <span className="u-step-k">{s.k}</span>
              <h3>{s.title}</h3>
              <p><Rich text={s.body} /></p>
            </li>
          ))}
        </ol>
        <p className="u-foot" data-r>{c.approach.foot}</p>
      </div>
    </section>
  )
}

const tidy = (m?: string) => (m === '+161.11%' ? '+161%' : m)
function Case({ it, i }: { it: CaseItem; i: number }) {
  const extra = it.extra?.replace('+511.11%', '+511%')
  return (
    <article className="u-case" data-r style={{ ['--i' as string]: i }}>
      <p className="u-case-meta"><span>{it.sector}</span><span>{it.tag}</span></p>
      {it.metric && <p className="u-case-num"><b dir="ltr">{tidy(it.metric)}</b><span>{it.metricLabel}</span></p>}
      <h3>{it.title}</h3>
      <p className="u-case-body">{it.body}</p>
      {extra && <p className="u-case-extra"><bdi dir="ltr">{extra.split(' ')[0]}</bdi> {extra.split(' ').slice(1).join(' ')}</p>}
    </article>
  )
}

function Work() {
  const w = useContent().work
  const u = useU()
  const lang = useStore((s) => s.lang)
  return (
    <section id="work" className="u-sec u-work" aria-labelledby="u-work-title">
      <div className="u-wrap">
        <div className="u-head2" data-r>
          <p className="u-eyebrow">{w.eyebrow}</p>
          <h2 id="u-work-title" className="u-h2">{w.title.replace(/،\s*/, ' ')}</h2>
          <p className="u-lede">{w.lede}</p>
        </div>
        <div className="u-cases">{w.featured.map((it, i) => <Case key={it.title} it={it} i={i} />)}</div>
        <div className="u-more" data-r>
          <details open={typeof window !== 'undefined' && window.innerWidth >= 760}>
          <summary className="u-more-k">{u.work.more} <span dir="ltr">({w.more.length})</span></summary>
          <ul>{w.more.map((it) => <li key={it.title}><b>{it.title}</b><span>{it.tag}</span></li>)}</ul>
          </details>
          <a href="#/work" className="u-link">{u.work.all} <span aria-hidden="true">{arrow(lang)}</span></a>
        </div>
      </div>
    </section>
  )
}

/** Coal becomes a teal diamond as the section crosses the screen (scroll-linked, one CSS variable). */
function Pressure() {
  const p = useU().pressure
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.style.setProperty('--p', '1'); return }
    let raf = 0, on = false, last = -1
    const tick = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = innerHeight
      const v = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.75)))
      const q = Math.round(v * 300) / 300
      if (q !== last) { el.style.setProperty('--p', String(q)); last = q }
    }
    const onScroll = () => { if (on && !raf) raf = requestAnimationFrame(tick) }
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; onScroll() })
    io.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })
    tick()
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return (
    <section ref={ref} className="u-pressure" aria-label={p.l5}>
      <div className="u-wrap u-pressure-in">
        <div className="u-gem" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="u-coal">
            <defs><radialGradient id="ucg" cx="40%" cy="35%"><stop offset="0" stopColor="#3a4242" /><stop offset="1" stopColor="#0c1010" /></radialGradient></defs>
            <path d="M58 46 92 30l46 12 28 36-6 44-30 40-46 10-40-24-14-44 10-40Z" fill="url(#ucg)" />
            <path d="M92 30 84 78l52-36M84 78 38 64M84 78l18 44 58 0M102 122l-12 58M102 122 48 150" stroke="#000" strokeOpacity=".5" fill="none" />
          </svg>
          <svg viewBox="0 0 200 200" className="u-diamond">
            <defs>
              <linearGradient id="udg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e9fffb" /><stop offset=".5" stopColor="#5fe3d2" /><stop offset="1" stopColor="#087a72" /></linearGradient>
              <linearGradient id="udg2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8f5ea" /><stop offset="1" stopColor="#04524d" /></linearGradient>
            </defs>
            <g stroke="#eafffb" strokeOpacity=".55" strokeWidth=".8" strokeLinejoin="round">
              <path d="M20 82 60 46 48 82Z" fill="url(#udg2)" />
              <path d="M48 82 60 46 100 82Z" fill="url(#udg1)" />
              <path d="M60 46h80l-40 36Z" fill="#c9fbf3" fillOpacity=".9" />
              <path d="M100 82 140 46 152 82Z" fill="url(#udg1)" />
              <path d="M152 82 140 46 180 82Z" fill="url(#udg2)" />
              <path d="M20 82h28l52 96Z" fill="#06615b" />
              <path d="M48 82h52v96Z" fill="url(#udg2)" />
              <path d="M100 82h52l-52 96Z" fill="url(#udg1)" />
              <path d="M152 82h28l-80 96Z" fill="#04524d" />
            </g>
            <path className="u-glint" d="M70 52l6-2-2 6Z" fill="#fff" />
          </svg>
        </div>
        <div className="u-pressure-copy">
          <p className="u-pr-1">{p.l1.map((l) => <span key={l}>{l}</span>)}</p>
          <p className="u-pr-2">{p.l2}</p>
          <p className="u-pr-3">{p.l3}</p>
          <p className="u-pr-4">{p.l4}</p>
          <p className="u-pr-5">{p.l5}</p>
        </div>
      </div>
    </section>
  )
}

function Services() {
  const s = useContent().services
  return (
    <section id="services" className="u-sec u-services" aria-labelledby="u-services-title">
      <div className="u-wrap">
        <div className="u-head2" data-r>
          <p className="u-eyebrow">{s.eyebrow}</p>
          <h2 id="u-services-title" className="u-h2">{s.title.replace(/،\s*/, ' ')}</h2>
        </div>
        <ol className="u-svc">
          {s.items.map((it, i) => (
            <li key={it.title} data-r style={{ ['--i' as string]: i % 3 }}>
              <span dir="ltr">0{i + 1}</span><h3>{it.title}</h3><p>{it.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Tools() {
  const q = useContent().quick
  const u = useU()
  const lang = useStore((s) => s.lang)
  return (
    <section id="tools" className="u-sec u-tools" aria-labelledby="u-tools-title">
      <div className="u-wrap">
        <div className="u-tools-card" data-r>
          <div>
            <p className="u-eyebrow">{q.eyebrow}</p>
            <h2 id="u-tools-title" className="u-h3">{q.title.replace(/،\s*/, ' ')}</h2>
            <p className="u-lede"><Rich text={q.lede} /></p>
          </div>
          <ul className="u-tools-list">
            {q.items.map((it) => <li key={it.id}><a href="#/solutions"><span>{it.k}</span><b>{it.q}</b><i aria-hidden="true">{arrow(lang)}</i></a></li>)}
          </ul>
          <a href="#/solutions" className="u-link">{u.tools.cta} <span aria-hidden="true">{arrow(lang)}</span></a>
        </div>
      </div>
    </section>
  )
}

function Founder() {
  const f = useContent().founder
  const [intro, roles, ...rest] = f.paragraphs
  const cut = intro.search(/[،,.]\s/)
  const name = cut > 0 ? intro.slice(0, cut) : ''
  const since = cut > 0 ? intro.slice(cut + 2) : intro
  return (
    <section id="founder" className="u-sec u-founder" aria-labelledby="u-founder-title">
      <div className="u-wrap u-founder-in" data-r>
        <p className="u-eyebrow" id="u-founder-title">{f.eyebrow}</p>
        {name && <p className="u-fd-name fd-name">{name}</p>}
        <p className="u-fd-intro"><Rich text={since} /></p>
        <p className="u-fd-roles">{roles}</p>
        {rest.map((p) => <p key={p} className="u-fd-p"><Rich text={p} /></p>)}
        <p className="u-fd-punch">{f.punch.replace(/[،,]\s*/, ' ').split(/\s(?=لكن|But)/).map((x) => <span key={x}>{x.replace(/\.$/, '')}</span>)}</p>
      </div>
    </section>
  )
}

function Start() {
  const c = useContent()
  const u = useU()
  const o = c.offer
  return (
    <section id="start" className="u-sec u-start" aria-labelledby="u-start-title">
      <div className="u-wrap u-start-grid">
        <div className="u-offer" data-r>
          <p className="u-eyebrow">{o.eyebrow}</p>
          <h2 id="u-start-title" className="u-h2">{o.title.replace(/،\s*/, ' ')}</h2>
          <p className="u-lede"><Rich text={o.lede} /></p>
          <ul className="u-incl">{o.includes.map((x) => <li key={x}>{x.replace(/،\s*/g, ' · ')}</li>)}</ul>
          <p className="u-value">{o.value.replace(/[،.]\s*/g, ' · ')}</p>
          <div className="u-promise"><span>{u.start.guaranteeK}</span><p><Rich text={o.guarantee} /></p></div>
          <p className="u-note">{o.note}</p>
        </div>
        <div className="u-form" id="book">
          <Onboarding />
        </div>
      </div>
    </section>
  )
}

function Support() {
  const s = useContent().support
  return (
    <section id="support" className="u-sec u-support" aria-labelledby="u-support-title">
      <div className="u-wrap u-support-in" data-r>
        <p className="u-eyebrow">{s.eyebrow}</p>
        <h2 id="u-support-title" className="u-h3">{s.title.split(/[،,]\s*/).map((x) => <span key={x}>{x}</span>)}</h2>
        <p className="u-lede"><Rich text={s.body} /></p>
        <p className="u-dedication dedication">{s.dedication.split(/\s(?=وعن )|(?<=,)\s(?=and )/).map((part, i) => <span key={i} className="ded-line">{part}</span>)}</p>
        <button type="button" className="u-btn u-btn-ghost" onClick={() => openForm('business', [], true)}><span>{s.cta}</span></button>
        <p className="u-note">{s.note}</p>
      </div>
    </section>
  )
}

function TalentBand() {
  const m = useContent().more
  const u = useU()
  const lang = useStore((s) => s.lang)
  return (
    <section className="u-sec u-talent" aria-labelledby="u-talent-title">
      <div className="u-wrap">
        <div className="u-talent-card" data-r>
          <div>
            <p className="u-eyebrow">{u.talent.eyebrow}</p>
            <h2 id="u-talent-title" className="u-h3">{u.talent.title}</h2>
          </div>
          <div className="u-talent-links">
            {m.items.map((it) => (
              <a key={it.side} href={it.href}><span className="u-x-k">{it.k}</span><b>{it.cta}</b><i aria-hidden="true">{arrow(lang)}</i></a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const c = useContent()
  const f = c.footer
  const i = f.slogan.lastIndexOf('…')
  return (
    <footer className="u-footer">
      <div className="u-wrap">
        <div className="u-foot-glass"><KonGlass /></div>
        <p className="u-slogan" lang="en" dir="ltr">
          <span>{i < 0 ? f.slogan : f.slogan.slice(0, i)}</span>
          {i >= 0 && <span className="u-slogan-2">{f.slogan.slice(i + 1)}</span>}
        </p>
        <p className="u-mail" dir="ltr"><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
        <nav className="u-foot-nav" aria-label="Footer">
          {c.nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
        </nav>
        <div className="u-foot-base"><span>{f.rights}</span><a href="#top">{f.top} ↑</a></div>
      </div>
    </footer>
  )
}

/** Phone-only booking bar. The page reserves its height at the bottom, it waits until the hero
 *  CTA has scrolled away, and it steps aside at the form and the footer. */
function Dock() {
  const u = useU()
  const [show, setShow] = useState(false)
  useEffect(() => {
    let f = 0
    const check = () => {
      f = 0
      const vh = innerHeight
      const s = document.getElementById('start')?.getBoundingClientRect()
      const ft = document.querySelector('.u-footer')?.getBoundingClientRect()
      const atForm = s ? s.top < vh * 0.9 && s.bottom > vh * 0.2 : false
      const atFoot = ft ? ft.top < vh : false
      setShow(scrollY > vh * 0.8 && !atForm && !atFoot)
    }
    const on = () => { if (!f) f = requestAnimationFrame(check) }
    on()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  return (
    <div className={`u-dock${show ? ' is-on' : ''}`} aria-hidden={!show}>
      <a href="#start" className="u-btn" tabIndex={show ? 0 : -1}><span>{u.cta}</span></a>
    </div>
  )
}

export default function Home() {
  const c = useContent()
  const lang = useStore((s) => s.lang)
  useReveal(lang)
  useEffect(() => { document.title = c.meta.title }, [c])
  useEffect(() => {
    requestAnimationFrame(() => document.documentElement.classList.add('u-ready'))
  }, [])
  return (
    <div className="u">
      <a href="#main" className="u-skip">{c.meta.skip}</a>
      <Header />
      <main id="main">
        <Hero />
        <Problem />
        <Beneath />
        <Method />
        <Work />
        <Pressure />
        <Services />
        <Founder />
        <Start />
        <Support />
        <Tools />
        <TalentBand />
      </main>
      <Footer />
      <Dock />
    </div>
  )
}
