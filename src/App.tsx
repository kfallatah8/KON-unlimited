import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent } from './content/useContent'
import type { CaseItem } from './content/site'
import { BOOKING_URL, contact, SHOW_SOLUTIONS, SHOW_TALENT, tourUrl, type IconId } from './content/site'
import { Talent } from './components/Talent'
import { Solutions } from './components/Solutions'
import { KonFooterMark } from './components/KonFooterMark'
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
import { SafeBoundary } from './components/SafeBoundary'
import { ChapterRail, CountUp, useCardLight, useHeaderAutoHide } from './components/Elevate'

// The WebGL stage is its own chunk: copy and layout never wait for it.
const GemField = lazy(() => import('./three/GemField'))


gsap.registerPlugin(ScrollTrigger)

const pad = (n: number) => String(n).padStart(2, '0')

/** Hash routes for the inner pages (#/solutions, #/talent, #/code, #/work). Any other hash is the
 *  homepage, and after switching back we land on the section it names. */
const readRoute = () => (location.hash.startsWith('#/') ? location.hash.slice(2) : '')
function useRoute() {
  const [r, setR] = useState(readRoute)
  const first = useRef(true)
  useEffect(() => {
    const on = () => setR(readRoute())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      const h = location.hash
      const el = !r && h.length > 1 && !h.startsWith('#/') ? document.querySelector<HTMLElement>(h) : null
      const y = el ? el.getBoundingClientRect().top + window.scrollY : 0
      lenis?.scrollTo(y, { immediate: true, force: true })
      window.scrollTo(0, y)
    }))
    return () => cancelAnimationFrame(id)
  }, [r])
  return r
}

/** Adds .is-in to [data-reveal] elements just before they scroll into view (CSS does the motion).
 *  Content starts its fade while still below the fold, so a fast flick on a phone never lands on
 *  an empty screen, and anything the scroll skipped over (anchor jumps, flicks) is shown at once. */
function useReveal(lang: string, route = '') {
  useEffect(() => {
    const show = (el: Element) => {
      el.classList.add('is-in')
      io.unobserve(el)
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) show(e.target) }),
      { rootMargin: '0px 0px 12% 0px' },
    )
    const watch = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el))
    watch()
    // Sections that mount later (forms, cards opened by a CTA) are picked up too.
    const mo = new MutationObserver(() => watch())
    mo.observe(document.body, { childList: true, subtree: true })
    let frame = 0
    const sweep = () => {
      frame = 0
      const limit = window.innerHeight * 1.12
      // Anything at or above the fold is shown, including what an anchor jump skipped over.
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => { if (el.getBoundingClientRect().top < limit) show(el) })
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(sweep) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', onScroll)
    window.addEventListener('hashchange', onScroll)
    window.addEventListener('kon:onboarding', onScroll)
    const settle = window.setInterval(sweep, 700)
    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(frame)
      window.clearInterval(settle)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onScroll)
      window.removeEventListener('hashchange', onScroll)
      window.removeEventListener('kon:onboarding', onScroll)
    }
  }, [lang, route])
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

// One provocation per ICP, cycling slowly: a question the visitor already asks themselves.
function HeroAsk({ asks }: { asks: { who: string; q: string }[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) setI((x) => (x + 1) % asks.length) }, 4200)
    return () => clearInterval(t)
  }, [asks.length])
  const a = asks[i % asks.length]
  return (
    <div className="hero-ask hero-fade">
      <p className="ha-stage" key={i} aria-hidden="true">
        <span className="ha-who">{a.who}</span>
        <span className="ha-q">{a.q}</span>
      </p>
      <ol className="ha-dots" aria-hidden="true">{asks.map((x, j) => <li key={x.who} className={j === i ? 'is-on' : ''} />)}</ol>
      <ul className="sr-only">{asks.map((x) => <li key={x.who}>{x.who}: {x.q}</li>)}</ul>
    </div>
  )
}

function Hero({ ready }: { ready: boolean }) {
  const c = useContent()
  const h = c.hero
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow hero-fade"><span className="eyebrow-text"><Rich text={h.eyebrow} /></span></p>
        <h1 id="hero-title" className="hero-title hero-statement">
          {h.statement.map((l, i) => <span key={l} className="hs-line" style={{ transitionDelay: `${0.15 + i * 0.22}s` }}>{l}</span>)}
        </h1>
        <HeroAsk asks={h.asks} />
        <p className="hero-lede hero-fade"><Rich text={h.lede} /></p>
        <div className="hero-ctas hero-fade">
          <MagneticButton href="#start">{h.primary}</MagneticButton>
          <MagneticButton href="#work" variant="ghost">{h.secondary}</MagneticButton>
        </div>
      </div>
      <ul className="proof hero-fade" aria-label="KON">
        {h.proof.map((p) => (
          <li key={p.l}><b dir="ltr"><CountUp value={p.n} play={ready} /></b><span>{p.l}</span></li>
        ))}
      </ul>
      <a href="#problem" className="scroll-cue"><b className="breath-ring" aria-hidden="true" /><span>{h.scroll}</span><i aria-hidden="true" /></a>
    </section>
  )
}

function Problem() {
  const p = useContent().problem
  const lang = useStore((s) => s.lang)
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
              <Icon id={path.persona === 'founder' ? 'seed' : path.persona === 'investor' ? 'compass' : 'company'} className="icon path-gem" /><span>{path.label}</span><i aria-hidden="true">{lang === 'ar' ? '←' : '→'}</i>
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

/** The turn of the story. The page has been gathering a storm since the first screen; here every
 *  stone is pulled into one core of coal, it holds, trembles, and breaks open into light. The words
 *  land one beat at a time, each one on its own moment of the scroll (--ip, 0..1 through the section).
 *  (Draft copy, awaiting khalid's approval.) */
const INTERLUDE = {
  ar: {
    press: 'الضغط لا يكسرك…',
    reveal: 'يكشفك',
    fact: { kick: 'الألماس والفحم من', key: 'عنصر واحد', q: 'الفرق؟', a1: 'ضغطٌ هائل', a2: 'ووقتٌ طويل' },
    value: { kick: 'منحنا الحجرَ قيمةً عالية…', lead: 'ونسينا أن نمنحها', key: 'لأنفسنا' },
    within: { lead: 'التغيير يبدأ', key: 'من الداخل', label: 'التغيير يبدأ من الداخل' },
  },
  en: {
    press: "Pressure doesn't break you…",
    reveal: 'It reveals you',
    fact: { kick: 'Diamond and coal are', key: 'one element', q: 'The difference?', a1: 'Immense pressure', a2: 'and time' },
    value: { kick: 'We gave a stone priceless value…', lead: 'and forgot to give it to', key: 'ourselves' },
    within: { lead: 'Change begins', key: 'within', label: 'Change begins within' },
  },
}

function Interlude() {
  const lang = useStore((s) => s.lang)
  const t = INTERLUDE[lang]
  return (
    <section id="interlude" className="interlude" aria-label={t.within.label}>
      <div className="interlude-sticky">
        <p className="il-line il-press">{t.press}</p>
        <p className="il-reveal"><span>{t.reveal}</span></p>
        <div className="il-fact">
          <p className="il-kick" style={{ ['--d' as string]: 0 }}>{t.fact.kick}</p>
          <p className="il-key" style={{ ['--d' as string]: 0.01 }}><span>{t.fact.key}</span></p>
          <p className="il-q" style={{ ['--d' as string]: 0.022 }}>{t.fact.q}</p>
          <p className="il-pair" style={{ ['--d' as string]: 0.03 }}><strong>{t.fact.a1}</strong><i aria-hidden="true" /><strong>{t.fact.a2}</strong></p>
        </div>
        <div className="il-calm">
          <p className="il-kick" style={{ ['--d' as string]: 0 }}>{t.value.kick}</p>
          <p className="il-lead" style={{ ['--d' as string]: 0.008 }}>{t.value.lead}</p>
          <p className="il-key" style={{ ['--d' as string]: 0.016 }}><span>{t.value.key}</span></p>
          <p className="il-within" style={{ ['--d' as string]: 0.03 }}>{t.within.lead} <em>{t.within.key}</em></p>
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

function Approach() {
  const c = useContent()
  const a = c.approach
  const m = c.commit
  return (
    <section id="approach" className="band approach" aria-labelledby="approach-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{a.eyebrow}</p>
          <SplitReveal as="h2" id="approach-title" className="display" text={a.title} />
        </div>
        <ol className="ap-grid">
          {a.pillars.map((p, i) => (
            <li key={p.title} className="ap-card glass" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="ap-num" dir="ltr">{pad(i + 1)}</span>
              <Icon id={p.icon} className="icon icon-lg" />
              <h3>{p.title}</h3>
              <p><Rich text={p.body} /></p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const SV_ICONS: IconId[] = ['scan', 'compass', 'flow', 'mask', 'web', 'ai']
const FR_ICONS: IconId[] = ['calc', 'session', 'care']

function Services() {
  const v = useContent().services
  return (
    <section id="services" className="band services-band" aria-labelledby="services-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{v.eyebrow}</p>
          <SplitReveal as="h2" id="services-title" className="display" text={v.title} />
        </div>
        <ol className="sv-grid">
          {v.items.map((it, i) => (
            <li key={it.title} className="sv-card" data-reveal style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
              <span className="sv-num" dir="ltr">{pad(i + 1)}</span>
              <Icon id={SV_ICONS[i] ?? 'spark'} className="icon sv-icon" />
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Freebies() {
  const f = useContent().freebies
  const lang = useStore((s) => s.lang)
  const go = (href: string) => (e: { preventDefault(): void }) => {
    if (href === '#support') { e.preventDefault(); startOnboarding({ persona: 'business', support: true }) }
  }
  return (
    <section id="free" className="band freebies" aria-labelledby="free-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{f.eyebrow}</p>
          <SplitReveal as="h2" id="free-title" className="display" text={f.title} />
        </div>
        <div className="fr-grid">
          {f.items.map((it, i) => (
            <a key={it.k} href={it.href} onClick={go(it.href)} className={`fr-card is-${i}`} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <Icon id={FR_ICONS[i] ?? 'spark'} className="icon icon-lg card-icon" />
              <span className="fr-tag">{it.k}</span>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
              <ul className="fr-points">{it.points.map((x) => <li key={x}>{x}</li>)}</ul>
              <span className="fr-price"><b dir="ltr">0</b><em>{lang === 'ar' ? 'ر.س' : 'SAR'}</em></span>
              <span className="fr-cta">{it.cta} <i aria-hidden="true" className="fr-arr">{lang === 'ar' ? '←' : '→'}</i></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function More() {
  const m = useContent().more
  const lang = useStore((s) => s.lang)
  return (
    <section id="more" className="band more" aria-labelledby="more-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{m.eyebrow}</p>
          <SplitReveal as="h2" id="more-title" className="display" text={m.title} />
          {m.lede && <p className="body-lg" data-reveal><Rich text={m.lede} /></p>}
        </div>
        <div className="more-grid more-duo">
          {m.items.map((it, i) => (
            <a key={it.side} href={it.href} onClick={() => { (window as unknown as { __konTalentSide?: string }).__konTalentSide = it.side }} className={`more-card glass is-${i}`} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <Icon id={it.side === 'company' ? 'company' : 'talent'} className="icon icon-lg card-icon" />
              <span className="more-k">{it.k}</span>
              <h3>{it.title}</h3>
              <p><Rich text={it.body} /></p>
              <span className="more-cta">{it.cta} <i aria-hidden="true">{lang === 'ar' ? '←' : '→'}</i></span>
            </a>
          ))}
        </div>
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

function Work({ full }: { full?: boolean }) {
  const w = useContent().work
  if (!full) {
    return (
      <section id="work" className="band work" aria-labelledby="work-title">
        <div className="wrap">
          <p className="eyebrow" data-reveal>{w.eyebrow}</p>
          <SplitReveal as="h2" id="work-title" className="display" text={w.title} />
          <p className="body-lg" data-reveal>{w.lede}</p>
          <div className="case-grid">
            {w.featured.map((it) => <CaseCard key={it.title} it={it} mark={w.confirmMark} big />)}
          </div>
          <p className="work-all" data-reveal><a href="#/work" className="btn btn-ghost"><span>{w.all}</span></a></p>
        </div>
      </section>
    )
  }
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
        <Tour />
      </div>
    </section>
  )
}

// The single-file preview runs in a sandbox that blocks third-party frames, so there it links out.
const EMBED_TOUR = import.meta.env.MODE !== 'single'

function Tour() {
  const t = useContent().work.tour
  const [open, setOpen] = useState(false)
  return (
    <div className="tour-card glass" data-reveal>
      <p className="eyebrow centered">{t.eyebrow}</p>
      <h3>{t.title}</h3>
      <p className="tour-body">{t.body}</p>
      {open ? (
        <div className="tour-frame">
          <iframe src={tourUrl} title={t.eyebrow} allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen loading="lazy" />
        </div>
      ) : null}
      <div className="tour-actions">
        {EMBED_TOUR ? (
          <button type="button" className={open ? 'btn btn-ghost' : 'btn btn-primary'} onClick={() => setOpen((v) => !v)}><span>{open ? t.close : t.cta}</span></button>
        ) : null}
        <a className={EMBED_TOUR ? 'link-btn' : 'btn btn-primary'} href={tourUrl} target="_blank" rel="noopener noreferrer"><span>{EMBED_TOUR ? t.open : t.cta}</span></a>
      </div>
    </div>
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
  const c = useContent()
  const o = c.offer
  const s = c.support
  return (
    <section id="start" className="band start" aria-labelledby="offer-title">
      <div className="wrap start-stack">
        <div className="start-card" data-reveal>
          <div className="offer-shine" aria-hidden="true" />
          <div className="start-offer">
            <p className="eyebrow">{o.eyebrow}</p>
            <SplitReveal as="h2" id="offer-title" className="display" text={o.title} />
            <p className="body-lg"><Rich text={o.lede} /></p>
            <ul className="offer-list">
              {o.includes.map((x) => <li key={x}><GemMark className="li-gem" />{x}</li>)}
            </ul>
            <p className="offer-guarantee"><Rich text={o.guarantee} /></p>
            <p className="fine">{o.value} · {o.note}</p>
          </div>
          <div className="start-flow" id="book">
            <Onboarding />
          </div>
        </div>
        <div className="support-strip" id="support" data-reveal>
          <p className="ss-title">{s.title}</p>
          <p className="ss-body"><Rich text={s.body} /></p>
          <p className="dedication">{s.dedication.split(/(?<=،)\s|(?<=,)\s(?=and )/).map((part, i) => <span key={i} className="ded-line">{part}</span>)}</p>
          <button type="button" className="btn btn-ghost" onClick={() => startOnboarding({ persona: 'business', support: true })}><span>{s.cta}</span></button>
        </div>
      </div>
    </section>
  )
}

function Page({ route }: { route: string }) {
  const c = useContent()
  return (
    <div className="page-view">
      <div className="wrap page-back"><a href="#top" className="link-btn"><span className="arr" aria-hidden="true">→</span> {c.meta.home}</a></div>
      {route === 'solutions' && <Solutions />}
      {route === 'talent' && <Talent />}
      {route === 'work' && <><Work full /><Support /></>}
      <section className="band page-next">
        <div className="wrap narrow center">
          <p className="body-lg">{c.offer.title}</p>
          <MagneticButton href="#start">{c.offer.cta}</MagneticButton>
        </div>
      </section>
    </div>
  )
}

function Finale({ fallback }: { fallback: boolean }) {
  const f = useContent().finale
  return (
    <section id="finale" className={`finale${fallback ? ' is-static' : ''}`} aria-label="KON">
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
          <KonFooterMark />
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
      // The talent section has its own flow; a "start diagnosis" button over it only distracts.
      const tal = document.getElementById('talent')?.getBoundingClientRect()
      const atTalent = tal ? tal.top < window.innerHeight * 0.6 && tal.bottom > window.innerHeight * 0.4 : false
      // Same over the solutions tools: the visitor is already busy with a calculator there.
      const sol = document.getElementById('solutions')?.getBoundingClientRect()
      const atSol = sol ? sol.top < window.innerHeight * 0.6 && sol.bottom > window.innerHeight * 0.4 : false
      setShow(window.scrollY > window.innerHeight * 0.9 && !atForm && !atFinale && !atTalent && !atSol)
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
    let finEl: HTMLElement | null = null, veilEl: HTMLElement | null = null, trioEl: HTMLElement | null = null
    let intTop = 1e9, intH = 1, lastStorm = '', stageEl: HTMLElement | null = null, intEl: HTMLElement | null = null
    // QA: ?storm=0.8 or ?calm=1 pins the arc for screenshots.
    const q = new URLSearchParams(location.search)
    const pinStorm = q.has('storm') ? Number(q.get('storm')) : -1
    const pinCalm = q.has('calm') ? Number(q.get('calm')) : -1
    // QA: ?ip=0.3 pins the interlude's progress (0.3 = deep in the pressure, 0.45 = just after the break).
    const pinIp = q.has('ip') ? Number(q.get('ip')) : -1
    const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
    const narrow = () => window.innerWidth < 700
    const measure = () => {
      finEl = document.getElementById('finale')
      veilEl = document.querySelector('.stage-veil')
      stageEl = document.querySelector('.stage')
      intEl = document.getElementById('interlude')
      if (intEl) {
        intTop = intEl.getBoundingClientRect().top + window.scrollY
        intH = intEl.offsetHeight
      } else { intTop = 1e9; intH = 1 }
      if (finEl) {
        finTop = finEl.getBoundingClientRect().top + window.scrollY
        finH = finEl.offsetHeight
      } else { finTop = 1e9; finH = 1 }
    }
    const tick = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      motion.heroOut = Math.min(1, Math.max(0, y / (vh * 0.85)))
      // Gather begins as the finale enters and completes ~65% through its sticky run.
      const p = (y + vh * 0.55 - finTop) / Math.max(1, (finH - vh) * 0.65 + vh * 0.55)
      motion.finale = Math.min(1, Math.max(0, p))
      motion.post = Math.min(1, Math.max(0, (y - (finTop + finH - vh)) / vh))
      // The storm: it starts as a faint unease on the first screen and gathers (slowly, then faster).
      // In the interlude every stone is pulled into one core of coal (0 → 36%), the core holds and
      // trembles, and at 40% it breaks. Then the words, one beat at a time.
      const c = y + vh * 0.5
      const ip = pinIp >= 0 ? pinIp : (c - intTop) / Math.max(1, intH)
      const peak = intTop + intH * 0.36
      // Clean cut: no storm across the page; the tension gathers only inside the interlude.
      const build = sstep(-0.12, 0.36, ip) * (peak > 0 ? 1 : 0)
      const calm = pinCalm >= 0 ? pinCalm : sstep(0.4, 0.6, ip)
      motion.calm = calm
      motion.storm = pinStorm >= 0 ? pinStorm : build * (1 - calm)
      motion.press = sstep(0.0, 0.34, ip) * (ip < 1.2 ? 1 : 0)
      if (ip >= 0.4 && !motion.burstAt) {
        // Only play the break if the visitor is actually here; arriving further down, it has already happened.
        motion.burstAt = performance.now() - (ip < 0.75 ? 0 : 20000)
        intEl?.classList.add('is-burst')
      } else if (ip < 0.36 && motion.burstAt) {
        motion.burstAt = 0
        intEl?.classList.remove('is-burst')
      }
      const key = motion.storm.toFixed(2) + calm.toFixed(2) + Math.min(1.2, Math.max(-0.2, ip)).toFixed(3)
      if (key !== lastStorm) {
        lastStorm = key
        for (const el of [stageEl, intEl]) {
          el?.style.setProperty('--press', motion.press.toFixed(3))
          el?.style.setProperty('--storm', motion.storm.toFixed(2))
          el?.style.setProperty('--calm', calm.toFixed(2))
        }
        intEl?.style.setProperty('--ip', Math.min(1.2, Math.max(-0.2, ip)).toFixed(3))
        intEl?.style.setProperty('--press', motion.press.toFixed(3))
      }
      motion.vel += (y - last - motion.vel) * 0.2
      last = y
      const fin = Math.round(motion.finale * 200) / 200
      if (fin !== lastFin && finEl) {
        finEl.style.setProperty('--fin', String(fin))
        lastFin = fin
      }
      const mid = motion.heroOut * (1 - motion.finale)
      // The reading veil dims the 3D only where copy sits over it. Once the finale starts there is no
      // copy until the KON forms, so it lifts quickly and the gathering gems stay bright (on phones
      // a lingering veil read as a dark, empty screen).
      const lift = 1 - Math.min(1, motion.finale * 4)
      // Spotlights: where the 3D is the story (the coal-to-gem break, the three-stone orbit) the
      // reading veil lifts completely, so nothing dark ever sits over them.
      const intSpot = sstep(-0.12, 0.04, ip) * (1 - sstep(0.94, 1.04, ip))
      if (!trioEl || !trioEl.isConnected) trioEl = document.querySelector('.trio-stage')
      let trioSpot = 0
      if (trioEl) {
        const r = trioEl.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - vh / 2) / (vh * 0.62)
        trioSpot = 1 - sstep(0.45, 1, d)
      }
      const spot = Math.max(intSpot, trioSpot)
      const veil = Math.round(Math.max((narrow() ? Math.max(mid, 0.5 * (1 - motion.finale)) : mid) * lift * 0.8 * (1 - spot), motion.post * 0.8) * 100) / 100
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
        // Only a CTA sends the wave and the pulse through the stones; the rest of the page stays still.
    const down = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('.btn, .header-cta, .dock-cta, .fr-card, .more-card, .sol-req, .link-btn, .path-head')) return
      document.documentElement.classList.remove('cta-pulse')
      void document.documentElement.offsetWidth
      document.documentElement.classList.add('cta-pulse')
      window.setTimeout(() => document.documentElement.classList.remove('cta-pulse'), 1800)
      motion.rx = (e.clientX / window.innerWidth) * 2 - 1
      motion.ry = -((e.clientY / window.innerHeight) * 2 - 1)
      motion.rt = performance.now()
    }
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
    }
  }, [])
}

export default function App() {
  const caps = useMemo(detectCapabilities, [])
  const c = useContent()
  const lang = useStore((s) => s.lang)
  const [ready, setReady] = useState(false)
  const route = useRoute()
  useMotionInputs()
  useReveal(lang, route)
  useHeaderAutoHide()
  useCardLight()

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
        motion.readyAt = performance.now()
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
        <div className="stage-dream"><i /><i /></div>
        {webgl && (
          <SafeBoundary>
            <Suspense fallback={null}>
              <GemField tier={caps.tier} reduced={caps.reducedMotion} />
            </Suspense>
          </SafeBoundary>
        )}
        <div className="stage-flash" />
        <div className="stage-burst" />
        <div className="stage-veil" />
        <div className="stage-vignette" />
      </div>
      <Header />
      <ChapterRail />
      <div className="grain" aria-hidden="true" />
      <main id="main">
        {route && ['solutions', 'talent', 'work'].includes(route) ? (
          <Page key={route} route={route} />
        ) : (
          <>
            <Hero ready={ready} />
            <Problem />
            <Interlude />
            <Approach />
            <Services />
            <Freebies />
            <Solutions />
            <Work />
            <More />
            <Founder />
            <Finale fallback={!webgl} />
            <Start />
          </>
        )}
      </main>
      <Footer />
      <DockCta />
    </div>
  )
}
