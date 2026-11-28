// KON Masterpiece round 2 (2026-11-28): chapter breaks and the "how we work with you" chapters.
// Same motion language as the story: [data-reveal] → .is-in, nothing moves unless it explains something.
import { useState } from 'react'
import { useJourney } from '../content/journey'
import { contact } from '../content/site'
import { startOnboarding, useStore } from '../state/store'
import { SplitReveal } from './SplitReveal'
import { Icon } from './Icons'

type ActId = 'one' | 'two' | 'three' | 'four'

/** A full-width pause between chapters, so the page reads as four clear parts instead of one long scroll. */
export function Act({ id }: { id: ActId }) {
  const a = useJourney().acts[id]
  return (
    <div className="act" role="presentation">
      <span className="act-line" aria-hidden="true" />
      <p className="act-n" data-reveal>{a.n}</p>
      <p className="act-t" data-reveal>{a.t}</p>
      <p className="act-s" data-reveal>{a.s}</p>
    </div>
  )
}

function Head({ id, eyebrow, title, lede }: { id: string; eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="ch-head">
      <p className="eyebrow centered" data-reveal>{eyebrow}</p>
      <SplitReveal as="h2" id={id} className="display ch-title" text={title} />
      {lede && <p className="ch-lede" data-reveal>{lede}</p>}
    </div>
  )
}

/** «حلول أعمال»: the three pillars, then five doors. Ready solutions exist, but most work is custom. */
export function Solutions() {
  const s = useJourney().solutions
  const lang = useStore((x) => x.lang)
  return (
    <section id="solutions" className="band ch jn-sol" aria-labelledby="sol-title">
      <div className="wrap">
        <Head id="sol-title" eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
        <ol className="sol-pillars">
          {s.pillars.map((p, i) => (
            <li key={p.k} data-reveal style={{ ['--i' as string]: i }}>
              <span className="sol-gem" aria-hidden="true" />
              <b>{p.k}</b>
              <p>{p.b}</p>
            </li>
          ))}
        </ol>
        <p className="sol-doors-k" data-reveal>{s.doorsK}</p>
        <ul className="sol-doors">
          {s.doors.map((d, i) => (
            <li key={d.t} data-reveal style={{ ['--i' as string]: i }}>
              <a href={d.href} className={`sol-door${d.tag ? ' is-main' : ''}`}>
                {d.tag && <span className="sol-tag">{d.tag}</span>}
                <b>{d.t}</b>
                <span className="sol-b">{d.b}</span>
                <span className="sol-go">{d.cta} <i aria-hidden="true">{lang === 'ar' ? '←' : '→'}</i></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function QuickWins() {
  const q = useJourney().quick
  return (
    <section id="quick-wins" className="band ch jn-quick split" aria-labelledby="qw-title">
      <div className="wrap">
        <Head id="qw-title" eyebrow={q.eyebrow} title={q.title} lede={q.lede} />
        <ol className="qw-list">
          {q.items.map((it, i) => (
            <li key={it.t} data-reveal style={{ ['--i' as string]: i }}>
              <b>{it.t}</b>
              <p>{it.b}</p>
            </li>
          ))}
        </ol>
        <p className="qw-note" data-reveal>{q.secret}</p>
        <div className="center" data-reveal>
          <button type="button" className="btn btn-ghost" onClick={() => startOnboarding({ persona: 'business' })}><span>{q.cta}</span></button>
        </div>
      </div>
    </section>
  )
}

export function Partnership() {
  const p = useJourney().partner
  return (
    <section id="partnership" className="band ch jn-partner split" aria-labelledby="pt-title">
      <div className="wrap">
        <Head id="pt-title" eyebrow={p.eyebrow} title={p.title} lede={p.lede} />
        <div className="pt-grid">
          <div className="pt-card" data-reveal>
            <p className="pt-k">{p.critK}</p>
            <ul className="pt-crit">{p.criteria.map((c) => <li key={c}><Icon id="check" className="icon li-check" />{c}</li>)}</ul>
          </div>
          <div className="pt-card" data-reveal>
            <p className="pt-k">{p.stepsK}</p>
            <ol className="pt-steps">
              {p.steps.map((s, i) => (
                <li key={s.t}><span dir="ltr">{i + 1}</span><div><b>{s.t}</b><small>{s.b}</small></div></li>
              ))}
            </ol>
          </div>
        </div>
        <p className="ch-close" data-reveal>{p.honest}</p>
        <div className="center" data-reveal>
          <button type="button" className="btn btn-primary" onClick={() => startOnboarding({ persona: 'business' })}><span>{p.cta}</span></button>
        </div>
      </div>
    </section>
  )
}

export function ReadyMenu() {
  const r = useJourney().ready
  const [i, setI] = useState(0)
  const it = r.items[i]
  return (
    <section id="ready-menu" className="band ch jn-ready" aria-labelledby="rm-title">
      <div className="wrap">
        <Head id="rm-title" eyebrow={r.eyebrow} title={r.title} lede={r.lede} />
        <div className="rm-tabs" role="tablist" aria-label={r.pick} data-reveal>
          {r.items.map((x, k) => (
            <button key={x.id} type="button" role="tab" id={`rm-${x.id}`} aria-selected={k === i} aria-controls="rm-panel" className={k === i ? 'is-on' : ''} onClick={() => setI(k)}>{x.tab}</button>
          ))}
        </div>
        <div id="rm-panel" role="tabpanel" aria-labelledby={`rm-${it.id}`} className="rm-panel" key={it.id}>
          <div className="rm-main">
            <p className="rm-name">{it.name}</p>
            <p className="rm-line">{it.line}</p>
            <p className="rm-price"><small>{r.fromK}</small><b dir="ltr">{it.from}</b><small>{r.sar}</small></p>
            <p className="rm-monthly">{it.monthly}</p>
            <p className="rm-for"><span>{r.forK}</span>{it.for}</p>
          </div>
          <div className="rm-inc">
            <p className="pt-k">{r.incK}</p>
            <ul>{it.inc.map((x) => <li key={x}><Icon id="check" className="icon li-check" />{x}</li>)}</ul>
          </div>
        </div>
        <div className="rm-add" data-reveal>
          <p className="pt-k">{r.addK}</p>
          <ul>{r.addons.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
        <p className="ch-close" data-reveal>{r.custom}</p>
        <div className="center" data-reveal>
          <button type="button" className="btn btn-primary" onClick={() => startOnboarding({ persona: 'business' })}><span>{r.cta}</span></button>
        </div>
      </div>
    </section>
  )
}

export function Ops() {
  const o = useJourney().ops
  return (
    <section id="ops" className="band ch jn-ops split" aria-labelledby="ops-title">
      <div className="wrap">
        <Head id="ops-title" eyebrow={o.eyebrow} title={o.title} lede={o.lede} />
        <ul className="ops-grid">
          {o.items.map((it, i) => (
            <li key={it.t} data-reveal style={{ ['--i' as string]: i }}>
              <b>{it.t}</b>
              <p>{it.b}</p>
            </li>
          ))}
        </ul>
        <div className="center" data-reveal>
          <button type="button" className="btn btn-ghost" onClick={() => startOnboarding({ persona: 'business' })}><span>{o.cta}</span></button>
        </div>
      </div>
    </section>
  )
}

export function Network() {
  const n = useJourney().network
  return (
    <section id="network" className="band ch jn-net split" aria-labelledby="net-title">
      <div className="wrap">
        <Head id="net-title" eyebrow={n.eyebrow} title={n.title} lede={n.lede} />
        <ul className="net-pairs">
          {n.pairs.map((p, i) => (
            <li key={p.a} data-reveal style={{ ['--i' as string]: i }}>
              <span>{p.a}</span>
              <i aria-hidden="true" />
              <span>{p.b}</span>
            </li>
          ))}
        </ul>
        <p className="ch-close" data-reveal>{n.close}</p>
        <div className="center" data-reveal>
          <button type="button" className="btn btn-ghost" onClick={() => startOnboarding({ persona: 'business' })}><span>{n.cta}</span></button>
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  const f = useJourney().faq
  const lang = useStore((s) => s.lang)
  const wa = `https://wa.me/${contact.whatsapp}`
  return (
    <section id="faq" className="band ch jn-faq split" aria-labelledby="faq-title">
      <div className="wrap">
        <Head id="faq-title" eyebrow={f.eyebrow} title={f.title} />
        <div className="faq-groups">
          {f.groups.map((g) => (
            <div key={g.k} className="faq-g" data-reveal>
              <p className="pt-k">{g.k}</p>
              {g.qs.map((x) => (
                <details key={x.q} className="faq-i">
                  <summary>{x.q}</summary>
                  <p>{x.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
        <p className="faq-more" data-reveal>{f.more} <a className="link-btn" href={wa} target="_blank" rel="noopener noreferrer">{f.moreCta} <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span></a></p>
      </div>
    </section>
  )
}
