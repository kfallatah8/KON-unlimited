// Ways to work with KON: monthly plans (3/6/12-month terms, monthly instalments) and the
// results partnership. All copy lives in content/site.ts (plans), prices are SAR/month before VAT.
import { useState } from 'react'
import { useContent } from '../content/useContent'
import { PLAN_TERMS } from '../content/site'
import { startOnboarding, useStore } from '../state/store'
import { Rich } from './Rich'
import { SplitReveal } from './SplitReveal'
import '../styles/plans.css'

const round100 = (n: number) => Math.round(n / 100) * 100

export function Plans() {
  const p = useContent().plans
  const lang = useStore((s) => s.lang)
  const [tab, setTab] = useState<'monthly' | 'results'>('monthly')
  const [ti, setTi] = useState(1)
  const notes = [p.note3, p.note6, p.note12]
  const term = PLAN_TERMS[ti]
  const fmt = (n: number) => n.toLocaleString('en-US')
  const arrow = lang === 'ar' ? '←' : '→'

  return (
    <section id="plans" className="band plans" aria-labelledby="plans-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{p.eyebrow}</p>
          <SplitReveal as="h2" id="plans-title" className="display" text={p.title} />
          <p className="body-lg" data-reveal><Rich text={p.lede} /></p>
        </div>

        <div className="pl-tabs" role="tablist" aria-label={p.eyebrow} data-reveal>
          {(['monthly', 'results'] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={`pl-tab${tab === k ? ' is-on' : ''}`} onClick={() => setTab(k)}>
              {p.tabs[k]}
            </button>
          ))}
        </div>

        {tab === 'monthly' ? (
          <div role="tabpanel" className="pl-panel">
            <div className="pl-terms" role="radiogroup" aria-label={p.term}>
              <span className="pl-terms-k">{p.term}</span>
              {PLAN_TERMS.map((t, i) => (
                <button key={t.months} type="button" role="radio" aria-checked={ti === i} className={`pl-term${ti === i ? ' is-on' : ''}`} onClick={() => setTi(i)}>
                  <b>{p.months(t.months)}</b>
                  <small>{notes[i]}</small>
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
                    <h3 className="pl-name">{t.name}</h3>
                    {off ? (
                      <p className="pl-price pl-na"><b>{p.notOn3}</b></p>
                    ) : (
                      <p className="pl-price"><b dir="ltr">{fmt(monthly)}</b><span>{p.perMonth}</span></p>
                    )}
                    {t.plus && <p className="pl-plus">{t.plus}</p>}
                    {!off && <p className="pl-total">{p.total(fmt(monthly * term.months), term.months)}</p>}
                    <p className="pl-hours">{t.hours}</p>
                    <p className="pl-k">{p.forWho}</p>
                    <p className="pl-for">{t.forWho}</p>
                    <p className="pl-k">{p.pains}</p>
                    <ul className="pl-pains">{t.pains.map((x) => <li key={x}>{x}</li>)}</ul>
                    <p className="pl-k">{p.gets}</p>
                    <ul className="pl-gets">{t.gets.map((x) => <li key={x}>{x}</li>)}</ul>
                    <button type="button" className={`btn ${t.tag ? 'btn-primary' : 'btn-ghost'} pl-cta`} onClick={() => startOnboarding({ persona: 'business' })}><span>{p.pick}</span></button>
                  </li>
                )
              })}
            </ol>
            {term.months === 12 && <p className="pl-perks glass">{p.perks12}</p>}
            <p className="pl-anchor"><Rich text={p.anchor} /></p>
            <p className="fine pl-note">{p.payNote}</p>
          </div>
        ) : (
          <div role="tabpanel" className="pl-panel">
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

        <p className="pl-unsure">{p.unsure} <a href="#start" className="link-btn">{p.unsureCta} <span aria-hidden="true">{arrow}</span></a></p>
      </div>
    </section>
  )
}
