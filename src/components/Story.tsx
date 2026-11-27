// KON Story chapters: the idea, the gaps, the blend, the measure, and the company packages.
// Motion is CSS only (driven by [data-reveal] → .is-in), so it costs nothing on phones.
import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { useStory, STORY_TERMS, TEAM_COST, MONTH_HOURS, MONTH_DAYS, type StoryTier } from '../content/story'
import { BOOKING_URL, contact } from '../content/site'
import { startOnboarding, useStore } from '../state/store'
import { Rich } from './Rich'
import { SplitReveal } from './SplitReveal'
import { lenis } from './SmoothScroll'
import { Icon } from './Icons'

/** The plain-words line every chapter ends on, so any reader leaves with the point. */
export function Plain({ text }: { text: string }) {
  const k = useStory().plainK
  return (
    <p className="plain" data-reveal>
      <span className="plain-k">{k}</span>
      <span className="plain-t">{text}</span>
    </p>
  )
}

export function Idea() {
  const s = useStory().idea
  return (
    <section id="idea" className="band st-idea" aria-labelledby="idea-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{s.eyebrow}</p>
          <SplitReveal as="h2" id="idea-title" className="display" text={s.title} />
          <p className="body-lg" data-reveal>{s.lede}</p>
        </div>
        <ol className="myths">
          {s.myths.map((m, i) => (
            <li key={m.myth} className="myth glass" data-reveal style={{ ['--i' as string]: i }}>
              <span className="myth-k">{s.mythK}</span>
              <p className="myth-old"><s>{m.myth}</s></p>
              <span className="myth-turn" aria-hidden="true" />
              <span className="myth-k is-truth">{s.truthK}</span>
              <p className="myth-new">{m.truth}</p>
            </li>
          ))}
        </ol>
        <div className="def" data-reveal>
          <span className="def-k">{s.defK}</span>
          <p className="def-t"><Rich text={s.def} /></p>
        </div>
        <Plain text={s.plain} />
      </div>
    </section>
  )
}

export function Gaps() {
  const s = useStory().gaps
  const side = (g: typeof s.inside, cls: string) => (
    <div className={`gap-side ${cls}`}>
      <p className="gap-k" data-reveal>{g.k}</p>
      <ul>
        {g.items.map((it, i) => (
          <li key={it.t} className="gap-item" data-reveal style={{ ['--i' as string]: i }}>
            <span className="gap-dot" aria-hidden="true" />
            <div><h3>{it.t}</h3><p>{it.b}</p></div>
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <section id="gaps" className="band st-gaps" aria-labelledby="gaps-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{s.eyebrow}</p>
          <SplitReveal as="h2" id="gaps-title" className="display" text={s.title} />
          <p className="body-lg" data-reveal><Rich text={s.lede} /></p>
        </div>
        <div className="gap-map">
          {side(s.inside, 'is-in-side')}
          <div className="gap-wall" data-reveal aria-hidden="true"><span>{s.wall}</span></div>
          {side(s.outside, 'is-out-side')}
        </div>
        <Plain text={s.plain} />
      </div>
    </section>
  )
}

export function Mix() {
  const s = useStory().mix
  return (
    <section id="mix" className="band st-mix" aria-labelledby="mix-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{s.eyebrow}</p>
          <SplitReveal as="h2" id="mix-title" className="display" text={s.title} />
          <p className="body-lg" data-reveal><Rich text={s.lede} /></p>
        </div>
        <div className="mix-stage">
          <div className="venn" data-reveal aria-hidden="true">
            <svg viewBox="0 0 300 280">
              <defs>
                <radialGradient id="vg" cx="50%" cy="50%" r="50%">
                  <stop offset="0" stopColor="#5fe3d2" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#12a596" stopOpacity="0.03" />
                </radialGradient>
              </defs>
              <circle className="vc vc-1" cx="150" cy="98" r="82" />
              <circle className="vc vc-2" cx="102" cy="180" r="82" />
              <circle className="vc vc-3" cx="198" cy="180" r="82" />
            </svg>
            <b className="venn-core">{s.center}</b>
            {s.lenses.map((l, i) => <span key={l.k} className={`venn-l venn-l${i + 1}`}>{l.k}</span>)}
          </div>
          <ol className="lenses">
            {s.lenses.map((l, i) => (
              <li key={l.k} className="lens" data-reveal style={{ ['--i' as string]: i }}>
                <span className="lens-n" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                <h3>{l.k}</h3>
                <p>{l.b}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="out-k" data-reveal>{s.outK}</p>
        <ul className="outcomes">
          {s.outcomes.map((o, i) => (
            <li key={o.t} className="outcome glass" data-reveal style={{ ['--i' as string]: i }}>
              <h3>{o.t}</h3>
              <p>{o.b}</p>
            </li>
          ))}
        </ul>
        <Plain text={s.plain} />
      </div>
    </section>
  )
}

/** Sits under the three steps: how the impact is counted. */
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
      <Plain text={s.plain} />
    </div>
  )
}

const round100 = (n: number) => Math.round(n / 100) * 100
const fmt = (n: number) => n.toLocaleString('en-US')

export function StoryPlans() {
  const p = useStory().plans
  const lang = useStore((s) => s.lang)
  const [tab, setTab] = useState<'monthly' | 'results'>('monthly')
  const [ti, setTi] = useState(1)
  const [buy, setBuy] = useState<StoryTier | null>(null)
  const term = STORY_TERMS[ti]
  const arrow = lang === 'ar' ? '←' : '→'
  return (
    <section id="plans" className="band plans st-plans" aria-labelledby="plans-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{p.eyebrow}</p>
          <SplitReveal as="h2" id="plans-title" className="display" text={p.title} />
          <p className="body-lg" data-reveal><Rich text={p.lede} /></p>
        </div>

        <div className="pl-tabs" role="tablist" aria-label={p.eyebrow} data-reveal>
          {(['monthly', 'results'] as const).map((k) => (
            <button key={k} type="button" role="tab" id={`pt-${k}`} aria-selected={tab === k} aria-controls="pl-panel" className={`pl-tab${tab === k ? ' is-on' : ''}`} onClick={() => setTab(k)}>
              {p.tabs[k]}
            </button>
          ))}
        </div>

        {tab === 'monthly' ? (
          <div role="tabpanel" id="pl-panel" aria-labelledby="pt-monthly" className="pl-panel">
            <div className="pl-terms" role="radiogroup" aria-label={p.term}>
              <span className="pl-terms-k">{p.term}</span>
              {STORY_TERMS.map((t, i) => (
                <button key={t.months} type="button" role="radio" aria-checked={ti === i} className={`pl-term${ti === i ? ' is-on' : ''}`} onClick={() => setTi(i)}>
                  <b>{p.months(t.months)}</b>
                  <small>{p.termNotes[i]}</small>
                </button>
              ))}
            </div>

            <ol className="pl-grid">
              {p.tiers.map((t) => {
                const off = (t.minMonths ?? 0) > term.months
                const monthly = round100(t.price * term.mult)
                return (
                  <li key={t.id} className={`pl-card glass${t.tag ? ' is-pick' : ''}${off ? ' is-off' : ''}`}>
                    {t.tag && <span className="pl-tag">{t.tag}</span>}
                    <p className="pl-mode"><Icon id={t.id === 'core' ? 'web' : t.id === 'growth' ? 'flow' : 'company'} className="icon" />{t.mode}</p>
                    <h3 className="pl-name">{t.name}</h3>
                    <p className="pl-line">{t.line}</p>
                    {off ? (
                      <p className="pl-price pl-na"><b>{p.notOn3}</b></p>
                    ) : (
                      <p className="pl-price"><b dir="ltr">{fmt(monthly)}</b><span>{p.perMonth}</span></p>
                    )}
                    {t.plus && <p className="pl-plus">{t.plus}</p>}
                    {!off && (
                      <div className="pl-value">
                        <p className="pl-hour">{p.perHour(String(Math.round(monthly / MONTH_HOURS)), fmt(Math.round(monthly / MONTH_DAYS / 10) * 10))}</p>
                        <p className="pl-vs">{p.vsTeam(String(Math.round(TEAM_COST / MONTH_HOURS)))}</p>
                        <span className="pl-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (monthly / TEAM_COST) * 100)}%` }} /></span>
                        <p className="pl-save">{p.save(fmt(round100(TEAM_COST - monthly)), Math.round((1 - monthly / TEAM_COST) * 100))}</p>
                      </div>
                    )}
                    {!off && <p className="pl-total">{p.total(fmt(monthly * term.months), term.months)}</p>}
                    <p className="pl-hours">{t.hours}</p>
                    <p className="pl-k">{p.forWho}</p>
                    <p className="pl-for">{t.forWho}</p>
                    <p className="pl-k">{p.pains}</p>
                    <ul className="pl-pains">{t.pains.map((x) => <li key={x}>{x}</li>)}</ul>
                    <p className="pl-k">{p.gets}</p>
                    <ul className="pl-gets">{t.gets.map((x) => <li key={x}>{x}</li>)}</ul>
                    <button type="button" disabled={off} className={`btn ${t.tag ? 'btn-primary' : 'btn-ghost'} pl-cta`} onClick={() => setBuy(t)}><span>{p.pick(t.name)}</span></button>
                  </li>
                )
              })}
            </ol>
            <div className="pl-every glass" data-reveal>
              <p className="pl-k">{p.every}</p>
              <ul>{p.everyItems.map((x) => <li key={x}><Icon id="check" className="icon" />{x}</li>)}</ul>
            </div>
            {term.months === 12 && <p className="pl-perks glass">{p.perks12}</p>}
            <p className="pl-seats">{p.seats}</p>
            <div className="pl-team glass">
              <div className="pl-team-head"><p className="pl-k">{p.team.k}</p><b>{p.team.total}</b></div>
              <ul>{p.team.roles.map((r) => <li key={r.r}><span>{r.r}</span><b dir="ltr">{r.n}</b></li>)}</ul>
              <p className="pl-team-foot">{p.team.foot}</p>
              <p className="fine">{p.team.src}</p>
            </div>
            <p className="fine pl-note">{p.payNote}</p>
          </div>
        ) : (
          <div role="tabpanel" id="pl-panel" aria-labelledby="pt-results" className="pl-panel">
            <div className="narrow center pl-rhead">
              <h3 className="pl-rtitle">{p.results.title}</h3>
              <p className="body-lg"><Rich text={p.results.lede} /></p>
            </div>
            <ol className="pl-steps">
              {p.results.steps.map((s, i) => (
                <li key={s.title} className="pl-step glass">
                  <span className="pl-num" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
            <ul className="pl-offers">
              {p.results.offers.map((o) => (
                <li key={o.title} className="pl-offer glass">
                  <h4>{o.title}</h4>
                  <p>{o.body}</p>
                  <p className="pl-share"><b>{o.share}</b><span>{o.period}</span></p>
                </li>
              ))}
            </ul>
            <div className="pl-clear glass">
              <p className="pl-k">{p.results.clear}</p>
              <ul>{p.results.clearItems.map((x) => <li key={x}>{x}</li>)}</ul>
              <p className="fine">{p.results.floor}</p>
              <button type="button" className="btn btn-primary" onClick={() => startOnboarding({ persona: 'business' })}><span>{p.results.cta}</span></button>
            </div>
          </div>
        )}
        <Plain text={p.plain} />
        <p className="pl-unsure">{p.unsure} <a href="#start" className="link-btn">{p.unsureCta} <span aria-hidden="true">{arrow}</span></a></p>
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

        <Plain text={s.plain} />
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
