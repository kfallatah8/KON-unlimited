// KON Masterpiece (2026-11-27): the story chapters. One idea per screen, calm motion, plain white dialect.
// Motion is CSS (driven by [data-reveal] → .is-in) except the gap ring, which turns with scroll and drag.
import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { useStory, STORY_TERMS, TEAM_COST, MONTH_DAYS, type StoryTier } from '../content/story'
import { BOOKING_URL, contact } from '../content/site'
import { startOnboarding, useStore } from '../state/store'
import { Rich } from './Rich'
import { SplitReveal } from './SplitReveal'
import { lenis } from './SmoothScroll'
import { Icon } from './Icons'

function Head({ id, eyebrow, title, lede }: { id: string; eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="ch-head">
      <p className="eyebrow centered" data-reveal>{eyebrow}</p>
      <SplitReveal as="h2" id={id} className="display ch-title" text={title} />
      {lede && <p className="ch-lede" data-reveal><Rich text={lede} /></p>}
    </div>
  )
}

export function Idea() {
  const s = useStory().idea
  return (
    <section id="idea" className="band ch st-idea" aria-labelledby="idea-title">
      <div className="wrap">
        <Head id="idea-title" eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
        <ol className="myths">
          {s.myths.map((m, i) => (
            <li key={m.myth} className="myth" data-reveal style={{ ['--i' as string]: i }}>
              <span className="myth-k">{s.mythK}</span>
              <p className="myth-old"><span>{m.myth}</span></p>
              <span className="myth-k is-truth">{s.truthK}</span>
              <p className="myth-new">{m.truth}</p>
            </li>
          ))}
        </ol>
        <div className="def" data-reveal>
          <span className="def-k">{s.defK}</span>
          <p className="def-t"><Rich text={s.def} /></p>
        </div>
        <p className="ch-close" data-reveal>{s.close}</p>
      </div>
    </section>
  )
}

const STEP = 45

/** The wall of the company as a ring: eight gaps, four inside and four outside, turning with the scroll. */
export function Gaps() {
  const s = useStory().gaps
  const items = s.inside.items.flatMap((x, i) => [{ ...x, side: s.inside.k, out: false }, { ...s.outside.items[i], side: s.outside.k, out: true }])
  const sec = useRef<HTMLElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const st = useRef({ base: 0, drag: 0, shown: 0, raf: 0, down: false, x0: 0, d0: 0 })
  const [active, setActive] = useState(0)

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const o = st.current
    const paint = () => {
      o.raf = 0
      const target = o.base + o.drag
      o.shown += (target - o.shown) * 0.12
      if (Math.abs(target - o.shown) > 0.05) o.raf = requestAnimationFrame(paint)
      const el = ring.current
      if (!el) return
      el.style.setProperty('--a', `${o.shown}deg`)
      el.querySelectorAll<HTMLElement>('.rf').forEach((f, i) => {
        const rel = ((i * STEP + o.shown) % 360 + 360) % 360
        const c = Math.cos((rel * Math.PI) / 180)
        f.style.opacity = String(0.18 + 0.82 * Math.max(0, c) ** 1.6)
      })
      const idx = ((Math.round(-o.shown / STEP) % 8) + 8) % 8
      setActive((a) => (a === idx ? a : idx))
    }
    const kick = () => { if (!o.raf) o.raf = requestAnimationFrame(paint) }
    const onScroll = () => {
      if (reduced || o.down) return
      const r = sec.current?.getBoundingClientRect()
      if (!r) return
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.2)))
      o.base = -p * STEP * 7
      kick()
    }
    onScroll()
    kick()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(o.raf) }
  }, [])

  const turn = (d: number) => {
    const o = st.current
    o.drag += d * STEP
    if (!o.raf) o.raf = requestAnimationFrame(function f() {
      o.raf = 0
      const target = o.base + o.drag
      o.shown += (target - o.shown) * 0.14
      ring.current?.style.setProperty('--a', `${o.shown}deg`)
      ring.current?.querySelectorAll<HTMLElement>('.rf').forEach((el, i) => {
        const rel = ((i * STEP + o.shown) % 360 + 360) % 360
        el.style.opacity = String(0.18 + 0.82 * Math.max(0, Math.cos((rel * Math.PI) / 180)) ** 1.6)
      })
      const idx = ((Math.round(-o.shown / STEP) % 8) + 8) % 8
      setActive((a) => (a === idx ? a : idx))
      if (Math.abs(target - o.shown) > 0.05) o.raf = requestAnimationFrame(f)
    })
  }
  const down = (e: React.PointerEvent) => {
    const o = st.current
    o.down = true; o.x0 = e.clientX; o.d0 = o.drag
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const move = (e: React.PointerEvent) => {
    const o = st.current
    if (!o.down) return
    const dir = document.documentElement.dir === 'rtl' ? -1 : 1
    o.drag = o.d0 + (e.clientX - o.x0) * 0.35 * dir
    turn(0)
  }
  const up = () => {
    const o = st.current
    if (!o.down) return
    o.down = false
    // Settle on the nearest face so one gap is always squarely in front.
    const total = o.base + o.drag
    o.drag += Math.round(total / STEP) * STEP - total
    turn(0)
  }
  const it = items[active]
  return (
    <section id="gaps" ref={sec} className="band ch st-gaps" aria-labelledby="gaps-title">
      <div className="wrap">
        <Head id="gaps-title" eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
        <div className="ring-wrap" data-reveal>
          <p className="ring-k">{s.ring}</p>
          <div className="ring-stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-hidden="true">
            <div className="ring" ref={ring}>
              {items.map((x, i) => (
                <div key={x.t} className={`rf${x.out ? ' is-out' : ''}`} style={{ ['--i' as string]: i }}>
                  <small>{x.side}</small>
                  <b>{x.t}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="ring-ctrl">
            <button type="button" className="ring-btn" aria-label={s.prev} onClick={() => turn(1)}><span aria-hidden="true">‹</span></button>
            <span className="ring-hint">{s.hint}</span>
            <button type="button" className="ring-btn" aria-label={s.next} onClick={() => turn(-1)}><span aria-hidden="true">›</span></button>
          </div>
          <div className="ring-say" aria-live="polite" key={active}>
            <span className={`ring-side${it.out ? ' is-out' : ''}`}>{it.side}</span>
            <p className="ring-t">{it.t}</p>
            <p className="ring-b">{it.b}</p>
          </div>
        </div>
        <p className="ch-close" data-reveal>{s.close}</p>
      </div>
    </section>
  )
}

export function Mix() {
  const s = useStory().mix
  return (
    <section id="mix" className="band ch st-mix" aria-labelledby="mix-title">
      <div className="wrap">
        <Head id="mix-title" eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
        <ol className="lenses">
          {s.lenses.map((l, i) => (
            <li key={l.k} className="lens" data-reveal style={{ ['--i' as string]: i }}>
              <span className="lens-n" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
              <b className="lens-k">{l.k}</b>
              <p className="lens-q">{l.q}</p>
              <p className="lens-b">{l.b}</p>
            </li>
          ))}
        </ol>
        <div className="merge" data-reveal aria-hidden="true">
          <svg viewBox="0 0 600 120" preserveAspectRatio="none">
            <path d="M100 0 C100 70 300 60 300 120" />
            <path d="M300 0 L300 120" />
            <path d="M500 0 C500 70 300 60 300 120" />
          </svg>
        </div>
        <p className="merge-t" data-reveal>{s.close}</p>
        <p className="out-k" data-reveal>{s.outK}</p>
        <ul className="outs" data-reveal>
          {s.outcomes.map((o) => <li key={o}>{o}</li>)}
        </ul>
      </div>
    </section>
  )
}

export function Measure() {
  const s = useStory().how
  return (
    <div className="measure">
      <p className="out-k" data-reveal>{s.measureK}</p>
      <h3 className="measure-t" data-reveal>{s.measureTitle}</h3>
      <ol className="measure-row">
        {s.measure.map((m, i) => (
          <li key={m.n} data-reveal style={{ ['--i' as string]: i }}>
            <span dir="ltr">{m.n}</span><b>{m.t}</b>
          </li>
        ))}
      </ol>
      <p className="measure-foot" data-reveal>{s.measureFoot}</p>
    </div>
  )
}

const round100 = (n: number) => Math.round(n / 100) * 100
const fmt = (n: number) => n.toLocaleString('en-US')

export function StoryPlans() {
  const p = useStory().plans
  const lang = useStore((s) => s.lang)
  const [ti, setTi] = useState(1)
  const [buy, setBuy] = useState<StoryTier | null>(null)
  const term = STORY_TERMS[ti]
  const arrow = lang === 'ar' ? '←' : '→'
  return (
    <section id="plans" className="band ch st-plans" aria-labelledby="plans-title">
      <div className="wrap">
        <Head id="plans-title" eyebrow={p.eyebrow} title={p.title} lede={p.lede} />

        <div className="term" data-reveal>
          <p className="term-k" id="term-k">{p.term}</p>
          <div className="term-seg" role="radiogroup" aria-labelledby="term-k">
            {STORY_TERMS.map((t, i) => (
              <button key={t.months} type="button" role="radio" aria-checked={ti === i} className={ti === i ? 'is-on' : ''} onClick={() => setTi(i)}>{p.months(t.months)}</button>
            ))}
          </div>
          <p className="term-note">{p.termNotes[ti]}</p>
        </div>

        <ul className="pk-grid">
          {p.tiers.map((t, i) => {
            const locked = !!t.minMonths && term.months < t.minMonths
            const monthly = round100(t.price * term.mult)
            return (
              <li key={t.id} className={`pk${t.tag ? ' is-featured' : ''}${locked ? ' is-locked' : ''}`} data-reveal style={{ ['--i' as string]: i }}>
                {t.tag && <span className="pk-tag">{t.tag}</span>}
                <p className="pk-name">{t.name}</p>
                <p className="pk-line">{t.line}</p>
                <p className="pk-price"><b dir="ltr">{fmt(monthly)}</b><span>{p.perMonth}</span></p>
                {t.plus && <p className="pk-plus">{t.plus}</p>}
                <p className="pk-day">{p.perDay(fmt(Math.round(monthly / MONTH_DAYS / 10) * 10))} · {t.mode}</p>
                <p className="pk-gets-k">{p.gets}</p>
                <ul className="pk-gets">{t.gets.map((g) => <li key={g}><Icon id="check" className="icon li-check" />{g}</li>)}</ul>
                {locked
                  ? <p className="pk-locked">{p.notOn3}</p>
                  : <button type="button" className={`btn ${t.tag ? 'btn-primary' : 'btn-ghost'} pk-cta`} onClick={() => setBuy(t)}><span>{p.pick(t.name)}</span></button>}
              </li>
            )
          })}
        </ul>

        <div className="cmp" data-reveal>
          <p className="cmp-k">{p.compare.k}</p>
          <div className="cmp-row">
            <div className="cmp-side">
              <span>{p.compare.you}</span>
              <b dir="ltr">{fmt(TEAM_COST)}</b>
              <small>{p.compare.youNote}</small>
            </div>
            <div className="cmp-side is-kon">
              <span>{p.compare.kon}</span>
              <b dir="ltr">{p.compare.konN}</b>
              <small>{p.compare.konNote}</small>
            </div>
          </div>
          <p className="fine center">{p.compare.src}</p>
        </div>

        <div className="promise" data-reveal>
          <span>{p.promise.k}</span>
          <p>{p.promise.t}</p>
        </div>
        <p className="fine center">{p.payNote}</p>

        <div className="res" data-reveal>
          <p className="res-k">{p.results.k}</p>
          <h3 className="res-t">{p.results.title}</h3>
          <p className="res-l">{p.results.lede}</p>
          <ul className="res-offers">
            {p.results.offers.map((o) => <li key={o.title}><b>{o.title}</b><span>{o.share}</span></li>)}
          </ul>
          <p className="fine center">{p.results.floor}</p>
          <button type="button" className="btn btn-ghost" onClick={() => startOnboarding({ persona: 'business' })}><span>{p.results.cta}</span></button>
        </div>

        <p className="pl-unsure" data-reveal>{p.unsure} <a href="#start" className="link-btn">{p.unsureCta} <span aria-hidden="true">{arrow}</span></a></p>
      </div>
      {buy && <BuySheet tier={buy} months={term.months} monthly={round100(buy.price * term.mult)} onClose={() => setBuy(null)} />}
    </section>
  )
}

/** Subscription request: a short form that opens WhatsApp with everything filled in.
 *  Payment follows as a private DigetPay link (khalid's chosen flow), so no card data touches the site. */
function BuySheet({ tier, months, monthly, onClose }: { tier: StoryTier; months: number; monthly: number; onClose: () => void }) {
  const b = useStory().buy
  const p = useStory().plans
  const ref = useRef<HTMLDialogElement>(null)
  const [err, setErr] = useState(false)
  const [size, setSize] = useState('')
  const [mode, setMode] = useState('')
  useEffect(() => {
    const d = ref.current
    d?.showModal()
    lenis?.stop()
    document.documentElement.classList.add('menu-open')
    try { posthog.capture('plan_subscribe_open', { tier: tier.id, months }) } catch { /* analytics never blocks */ }
    return () => {
      lenis?.start()
      document.documentElement.classList.remove('menu-open')
    }
  }, [tier.id, months])
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') || '').trim()
    const phone = String(f.get('phone') || '').trim()
    if (!name || phone.replace(/\D/g, '').length < 9) { setErr(true); return }
    const text = b.wa({ tier: tier.name, term: p.months(months), price: fmt(monthly), name, company: String(f.get('company') || '').trim(), phone, size, mode })
    try { posthog.capture('plan_subscribe_request', { tier: tier.id, months, monthly }) } catch { /* ignore */ }
    window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
  return (
    <dialog ref={ref} className="buy" aria-labelledby="buy-title" onClose={onClose} onCancel={onClose} onClick={(e) => { if (e.target === ref.current) ref.current?.close() }}>
      <form className="buy-in" onSubmit={submit} noValidate>
        <button type="button" className="buy-x" aria-label={b.close} onClick={() => ref.current?.close()}>×</button>
        <p className="buy-k">{b.sum(tier.name, p.months(months))}</p>
        <h3 id="buy-title" className="buy-title">{b.title}</h3>
        <p className="buy-price"><b dir="ltr">{fmt(monthly)}</b> {p.perMonth}</p>
        <label className="buy-f"><span>{b.name}</span><input name="name" autoComplete="name" required /></label>
        <label className="buy-f"><span>{b.company}</span><input name="company" autoComplete="organization" /></label>
        <label className="buy-f"><span>{b.phone}</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={b.phoneHint} required /></label>
        <fieldset className="buy-g"><legend>{b.size}</legend>
          {b.sizes.map((x) => <button key={x} type="button" aria-pressed={size === x} className={`chip${size === x ? ' is-on' : ''}`} onClick={() => setSize(x)}>{x}</button>)}
        </fieldset>
        <fieldset className="buy-g"><legend>{b.mode}</legend>
          {b.modes.map((x) => <button key={x} type="button" aria-pressed={mode === x} className={`chip${mode === x ? ' is-on' : ''}`} onClick={() => setMode(x)}>{x}</button>)}
        </fieldset>
        {err && <p className="buy-err" role="alert">{b.need}</p>}
        <button type="submit" className="btn btn-primary buy-send"><span>{b.send}</span></button>
        <p className="buy-how">{b.how}</p>
        <a className="link-btn buy-alt" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">{b.alt}</a>
      </form>
    </dialog>
  )
}

/* ---------- high-ticket studies: Highest & Best Use, opportunity comparison, market entry ---------- */
const DECISION_STEPS = [5, 10, 20, 50, 100, 200, 500] // decision value, million SAR
const HBU_PRICE = 85000

export function Big() {
  const s = useStory().big
  const lang = useStore((st) => st.lang)
  const [sel, setSel] = useState(0)
  const [vi, setVi] = useState(2)
  const st = s.studies[sel]
  const value = DECISION_STEPS[vi] * 1_000_000
  const share = (HBU_PRICE / value) * 100
  const mistake = value * 0.05
  const times = Math.round(mistake / HBU_PRICE)
  const ask = (name: string) => {
    posthog.capture('study_request', { study: name })
    const text = lang === 'ar' ? `السلام عليكم، أبغى أعرف أكثر عن ${name}` : `Hello, I would like to know more about the ${name}`
    window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
  return (
    <section id="big" className="band st-big" aria-labelledby="big-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{s.eyebrow}</p>
          <SplitReveal as="h2" id="big-title" className="display" text={s.title} />
          <p className="body-lg" data-reveal><Rich text={s.lede} /></p>
        </div>

        <div className="bg-tabs" role="tablist" aria-label={s.pick} data-reveal>
          {s.studies.map((x, i) => (
            <button key={x.id} type="button" role="tab" aria-selected={sel === i} className={`bg-tab${sel === i ? ' is-on' : ''}`} onClick={() => setSel(i)}>
              <span className="bg-tab-k">{x.k}</span>
              <span className="bg-tab-n">{x.name}</span>
            </button>
          ))}
        </div>

        <article className="bg-card glass" key={st.id} role="tabpanel">
          <div className="bg-main">
            <p className="bg-k">{st.k}</p>
            <h3 className="bg-name">{st.name}</h3>
            <p className="bg-line">{st.line}</p>
            <p className="bg-price">
              {st.from && <span className="bg-from">{s.fromK}</span>}
              <b dir="ltr">{fmt(st.price)}</b><span>{s.priceK}</span>
            </p>
            <button type="button" className="btn btn-primary" onClick={() => ask(st.name)}><span>{s.cta}</span></button>
          </div>
          <div className="bg-side">
            <ul className="bg-gets">
              {st.gets.map((g) => <li key={g}><Icon id="check" className="icon li-check" />{g}</li>)}
            </ul>
            <p className="bg-example">{st.example}</p>
          </div>
        </article>

        <div className="bg-why">
          <div className="bg-why-head" data-reveal>
            <p className="out-k">{s.why.k}</p>
            <h3 className="measure-t">{s.why.title}</h3>
          </div>
          <ol className="bg-points">
            {s.why.points.map((p, i) => (
              <li key={p.t} className="glass" data-reveal style={{ ['--i' as string]: i }}>
                <span className="bg-pn" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                <b>{p.t}</b>
                <p>{p.b}</p>
              </li>
            ))}
          </ol>

          <div className="bg-calc glass" data-reveal>
            <p className="pl-k">{s.calc.k}</p>
            <label className="bg-range">
              <span>{s.calc.value}</span>
              <b><span dir="ltr">{fmt(DECISION_STEPS[vi])}</span> {s.calc.million}</b>
              <input type="range" min={0} max={DECISION_STEPS.length - 1} step={1} value={vi}
                onChange={(e) => setVi(Number(e.target.value))} aria-valuetext={`${DECISION_STEPS[vi]} ${s.calc.million}`} />
            </label>
            <div className="bg-out">
              <p><span>{s.calc.share}</span><b dir="ltr">{share < 0.1 ? share.toFixed(2) : share.toFixed(1)}%</b></p>
              <p className="is-hot"><span>{s.calc.mistake}</span><b><span dir="ltr">{fmt(mistake)}</span> {s.priceK}</b></p>
            </div>
            <p className="bg-times">{s.calc.times(fmt(times))}</p>
          </div>
        </div>

        <p className="ch-close" data-reveal>{s.close}</p>
        <p className="fine center bg-note">{s.note}</p>
      </div>
    </section>
  )
}

export function Team() {
  const s = useStory().team
  return (
    <section id="team" className="band st-team" aria-labelledby="team-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{s.eyebrow}</p>
          <SplitReveal as="h2" id="team-title" className="display" text={s.title} />
          <p className="body-lg" data-reveal>{s.lede}</p>
        </div>
        <ul className="tm-row">
          {s.people.map((p, i) => (
            <li key={p.name} className="tm glass" data-reveal style={{ ['--i' as string]: i }}>
              <span className="tm-mark" aria-hidden="true">{p.name.slice(0, 1)}</span>
              <b className="tm-name">{p.name}</b>
              <span className="tm-role">{p.role}</span>
              <p>{p.b}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
