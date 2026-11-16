// «دائرة كُن» (KON Circle) on the test site: a home teaser + the full #/circle page.
// Copy lives in content/circle.ts; numbers are proposals from the 2026-11-09 plan (test only).
import { useMemo, useState } from 'react'
import type React from 'react'
import { circleContent, type Access } from '../content/circle'
import { useStore } from '../state/store'
import { MagneticButton } from './MagneticButton'
import { Rich } from './Rich'
import { Hl } from './SplitReveal'
import { scrollToHash } from './SmoothScroll'

const useCircle = () => circleContent[useStore((s) => s.lang)]

/** Payment split for a monthly amount: card fee (2.5% + 1), the payer's own usage (~6), then 70/30. */
function split(a: number) {
  const fee = a > 0 ? a * 0.025 + 1 : 0
  const own = Math.min(6, Math.max(0, a - fee))
  const rest = Math.max(0, a - fee - own)
  return { fee, own, circle: rest * 0.7, growth: rest * 0.3, runs: Math.round((rest * 0.7) / 0.08) }
}

/** In-page jump that keeps the #/circle route (a plain #id would send the router home). */
const jump = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault()
  scrollToHash(`#${id}`)
}

const ACCESS_ORDER: Access[] = ['f', 'p', 'w']

export function CircleTeaser() {
  const c = useCircle()
  const t = c.teaser
  return (
    <section id="circle" className="band circle-teaser" aria-labelledby="circle-teaser-title">
      <div className="wrap">
        <div className="ct-card glass" data-reveal>
          <div className="ct-copy">
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 id="circle-teaser-title" className="display ct-title"><Rich text={t.title} /></h2>
            <p className="body-lg"><Rich text={t.lede} /></p>
            <a href="#/circle" className="btn btn-primary ct-cta"><span>{t.cta}</span></a>
          </div>
          <ul className="ct-stats">
            {t.stats.map((s) => (
              <li key={s.l}><b dir="ltr">{s.n}</b><span>{s.l}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function PoolCard() {
  const p = useCircle().pool
  const total = 1240
  const left = 612
  return (
    <div className="cp-pool glass" aria-label={p.title}>
      <div className="cp-pool-top">
        <b>{p.title}</b>
        <span className="cp-tag">{p.sample}</span>
      </div>
      <p className="cp-pool-num"><span dir="ltr">{left.toLocaleString('en-US')}</span> <small>{p.left}</small></p>
      <div className="cp-bar" role="img" aria-label={`${left} / ${total}`}>
        <i style={{ inlineSize: `${(left / total) * 100}%` }} />
      </div>
      <ul className="cp-waves">
        {p.waves.map((w) => (
          <li key={w.t}><b dir="ltr">{w.p}</b><span>{w.t}</span></li>
        ))}
      </ul>
      <p className="cp-by">{p.by} <b dir="ltr">37</b> {p.supporters}</p>
      <p className="cp-fine">{p.reserved}</p>
    </div>
  )
}

function Catalog() {
  const c = useCircle()
  const h = c.catsHead
  const [cat, setCat] = useState(c.cats[0].id)
  const [acc, setAcc] = useState<Access | 'all'>('all')
  const current = c.cats.find((x) => x.id === cat) ?? c.cats[0]
  const tools = current.tools.filter((t) => acc === 'all' || t[2] === acc)
  const all = useMemo(() => c.cats.reduce((n, x) => n + x.tools.length, 0), [c])
  return (
    <section id="circle-tools" className="band cp-cat" aria-labelledby="cp-cat-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{h.eyebrow}</p>
          <h2 id="cp-cat-title" className="display" data-reveal><Hl text={h.title} /></h2>
          <p className="body-lg" data-reveal><Rich text={h.lede} /></p>
        </div>
        <div className="cp-tabs" role="tablist" aria-label={h.eyebrow}>
          {c.cats.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={cat === x.id} className={`cp-tab${cat === x.id ? ' is-on' : ''}`} onClick={() => setCat(x.id)}>
              <span>{x.name}</span><small dir="ltr">{x.tools.length}</small>
            </button>
          ))}
        </div>
        <div className="cp-panel glass" role="tabpanel">
          <div className="cp-panel-head">
            <div>
              <h3>{current.name}</h3>
              <p>{current.note}</p>
            </div>
            <div className="cp-filter" role="group">
              <button type="button" aria-pressed={acc === 'all'} className={acc === 'all' ? 'is-on' : ''} onClick={() => setAcc('all')}><span dir="ltr">{all}</span> {h.count}</button>
              {ACCESS_ORDER.map((a) => (
                <button key={a} type="button" aria-pressed={acc === a} className={`acc-${a}${acc === a ? ' is-on' : ''}`} onClick={() => setAcc(a)}>{h.access[a]}</button>
              ))}
            </div>
          </div>
          <ul className="cp-tools">
            {tools.map(([name, does, a, ph]) => (
              <li key={name} className={`cp-tool${ph > 1 ? ' is-soon' : ''}`}>
                <div className="cp-tool-tags">
                  <span className={`cp-acc acc-${a}`}>{h.access[a]}</span>
                  <span className="cp-ph">{h.phase[ph]}</span>
                </div>
                <b>{name}</b>
                <p>{does}</p>
              </li>
            ))}
            {tools.length === 0 && <li className="cp-none">—</li>}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Pay() {
  const p = useCircle().pay
  const [amt, setAmt] = useState(49)
  const s = split(amt)
  const f = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: n < 10 ? 1 : 0 })
  const parts: [keyof typeof p.split, number][] = [['fee', s.fee], ['own', s.own], ['circle', s.circle], ['growth', s.growth]]
  return (
    <section id="circle-pay" className="band cp-pay" aria-labelledby="cp-pay-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{p.eyebrow}</p>
          <h2 id="cp-pay-title" className="display" data-reveal><Hl text={p.title} /></h2>
          <p className="body-lg" data-reveal><Rich text={p.lede} /></p>
        </div>
        <ul className="cp-tiers">
          {p.tiers.map((t) => (
            <li key={t.n} className={`cp-tier glass${t.pick ? ' is-pick' : ''}`} data-reveal>
              {t.pick && <span className="cp-pick">{p.picked}</span>}
              <b className="cp-tier-n">{t.n}</b>
              <p className="cp-price"><span dir="ltr">{t.p}</span> <small>{t.u || p.sar}</small></p>
              <p className="cp-tier-b">{t.b}</p>
              <p className="cp-tier-for">{t.for}</p>
            </li>
          ))}
        </ul>
        <div className="cp-split glass" data-reveal>
          <label className="cp-split-label" htmlFor="cp-amt">{p.slider}</label>
          <div className="cp-split-row">
            <input id="cp-amt" type="range" min={19} max={500} step={1} value={amt} onChange={(e) => setAmt(+e.target.value)} />
            <output htmlFor="cp-amt"><span dir="ltr">{amt}</span> {p.sar}</output>
          </div>
          <div className="cp-stack" aria-hidden="true">
            {parts.map(([k, v]) => <i key={k} className={`sp-${k}`} style={{ flexGrow: Math.max(v, 0.01) }} />)}
          </div>
          <ul className="cp-legend">
            {parts.map(([k, v]) => (
              <li key={k}><i className={`sp-${k}`} /><span>{p.split[k]}</span><b dir="ltr">{f(v)}</b></li>
            ))}
          </ul>
          <p className="cp-runs">{p.runs(s.runs)}</p>
          <p className="cp-fine">{p.note}</p>
        </div>
      </div>
    </section>
  )
}

export function CirclePage() {
  const c = useCircle()
  return (
    <div className="circle-page">
      <section className="band cp-head" aria-labelledby="cp-title">
        <div className="wrap cp-head-grid">
          <div className="cp-head-copy">
            <p className="eyebrow" data-reveal>{c.head.eyebrow}</p>
            <h1 id="cp-title" className="display cp-title" data-reveal><Hl text={c.head.title} /></h1>
            <p className="body-lg" data-reveal><Rich text={c.head.lede} /></p>
            <div className="cp-head-ctas" data-reveal>
              <a href="#circle-tools" onClick={jump('circle-tools')} className="btn btn-primary"><span>{c.head.tools}</span></a>
              <a href="#circle-app" onClick={jump('circle-app')} className="link-btn">{c.head.install}</a>
            </div>
          </div>
          <div data-reveal><PoolCard /></div>
        </div>
        <p className="wrap cp-empty" data-reveal>{c.pool.empty}</p>
      </section>

      <section className="band cp-how" aria-labelledby="cp-how-title">
        <div className="wrap">
          <div className="narrow center sec-head">
            <p className="eyebrow centered" data-reveal>{c.how.eyebrow}</p>
            <h2 id="cp-how-title" className="display" data-reveal><Hl text={c.how.title} /></h2>
          </div>
          <ol className="cp-steps">
            {c.how.steps.map((s) => (
              <li key={s.k} className="glass" data-reveal>
                <span className="cp-k" dir="ltr">{s.k}</span>
                <h3>{s.t}</h3>
                <p>{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Catalog />
      <Pay />

      <section className="band cp-next" aria-labelledby="cp-next-title">
        <div className="wrap">
          <div className="narrow center sec-head">
            <p className="eyebrow centered" data-reveal>{c.next.eyebrow}</p>
            <h2 id="cp-next-title" className="display" data-reveal><Hl text={c.next.title} /></h2>
          </div>
          <ul className="cp-ideas">
            {c.next.items.map((x) => (
              <li key={x.t} data-reveal><span className="cp-star" aria-hidden="true">✦</span><div><b>{x.t}</b><p>{x.b}</p></div></li>
            ))}
          </ul>
        </div>
      </section>

      <section id="circle-app" className="band cp-app" aria-labelledby="cp-app-title">
        <div className="wrap cp-app-grid">
          <div>
            <p className="eyebrow" data-reveal>{c.app.eyebrow}</p>
            <h2 id="cp-app-title" className="display" data-reveal><Hl text={c.app.title} /></h2>
            <p className="body-lg" data-reveal><Rich text={c.app.lede} /></p>
            <p className="cp-gem" data-reveal><Rich text={c.app.gem} /></p>
          </div>
          <div className="cp-os">
            {[c.app.ios, c.app.android].map((o) => (
              <div key={o.t} className="glass cp-os-card" data-reveal>
                <b>{o.t}</b>
                <ol>{o.s.map((s, i) => <li key={s}><span dir="ltr">{i + 1}</span>{s}</li>)}</ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band cp-trust" aria-labelledby="cp-trust-title">
        <div className="wrap narrow center">
          <h2 id="cp-trust-title" className="display" data-reveal><Hl text={c.trust.title} /></h2>
          <ul className="cp-trust-list">
            {c.trust.items.map((x) => <li key={x} data-reveal><span aria-hidden="true">✓</span>{x}</li>)}
          </ul>
          <div data-reveal><MagneticButton href="#start">{c.trust.cta}</MagneticButton></div>
          <p className="cp-fine" data-reveal>{c.trust.sub}</p>
        </div>
      </section>
    </div>
  )
}
