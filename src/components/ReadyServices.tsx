// "Ready-made services": one tab per service, each with its scope and live demos.
// Copy lives in content/site.ts (ready), demos in content/ready.ts.
import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useContent } from '../content/useContent'
import { demos } from '../content/ready'
import type { Demo } from '../content/ready'
import { startOnboarding, useStore } from '../state/store'
import { Icon, GemMark } from './Icons'
import { SplitReveal } from './SplitReveal'
import { Rich } from './Rich'

// The single-file preview runs in a sandbox: no third-party frames, and no self-hosted demo paths.
const SINGLE = import.meta.env.MODE === 'single'
const hrefOf = (d: Demo) => (SINGLE && d.previewUrl ? d.previewUrl : d.url)

function DemoCard({ d, onEmbed }: { d: Demo; onEmbed?: () => void }) {
  const lang = useStore((s) => s.lang)
  const r = useContent().ready
  const body = (
    <>
      <span className="demo-thumb">
        {d.thumb ? (
          <img src={d.thumb} alt="" loading="lazy" decoding="async" />
        ) : d.embed ? (
          <span className="demo-360" dir="ltr"><Icon id="tour" className="icon" />360°</span>
        ) : (
          <GemMark className="demo-gem" />
        )}
      </span>
      <span className="demo-text">
        <b>{d.title[lang]}</b>
        {d.note && <small>{d.note[lang]}</small>}
        <em>{r.open} <span aria-hidden="true">{onEmbed ? '◎' : '↗'}</span></em>
      </span>
    </>
  )
  return onEmbed ? (
    <button type="button" className="demo" onClick={onEmbed}>{body}</button>
  ) : (
    <a className="demo" href={hrefOf(d)} target="_blank" rel="noopener noreferrer">{body}</a>
  )
}

export function ReadyServices() {
  const r = useContent().ready
  const t = useContent().work.tour
  const lang = useStore((s) => s.lang)
  const [tab, setTab] = useState(0)
  const [embed, setEmbed] = useState<Demo | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const it = r.items[tab]
  const list = demos.filter((d) => d.service === it.id)

  const pick = (i: number) => {
    setTab(i)
    setEmbed(null)
  }
  // Arrow keys move between tabs, following reading direction.
  const onKey = (e: KeyboardEvent) => {
    const fwd = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
    const back = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'
    if (e.key !== fwd && e.key !== back) return
    e.preventDefault()
    const n = (tab + (e.key === fwd ? 1 : -1) + r.items.length) % r.items.length
    pick(n)
    tabs.current[n]?.focus()
  }

  return (
    <section id="ready" className="band ready" aria-labelledby="ready-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow" data-reveal>{r.eyebrow}</p>
          <SplitReveal as="h2" id="ready-title" className="display" text={r.title} />
          <p className="body-lg" data-reveal><Rich text={r.lede} /></p>
        </div>

        <div className="ready-tabs" role="tablist" aria-label={r.eyebrow} onKeyDown={onKey} data-reveal>
          {r.items.map((x, i) => (
            <button
              key={x.id} ref={(el) => { tabs.current[i] = el }} type="button" role="tab" id={`rt-${x.id}`}
              aria-selected={i === tab} aria-controls="ready-panel" tabIndex={i === tab ? 0 : -1}
              className={i === tab ? 'is-on' : ''} onClick={() => pick(i)}
            >
              <Icon id={x.icon} className="icon" />
              <span>{x.title}</span>
            </button>
          ))}
        </div>

        <div id="ready-panel" role="tabpanel" aria-labelledby={`rt-${it.id}`} className="ready-panel glass" key={it.id}>
          <div className="ready-info">
            <Icon id={it.icon} className="icon icon-lg" />
            <h3>{it.title}</h3>
            <p className="ready-line">{it.line}</p>
            <p className="ready-label">{r.includes}</p>
            <ul className="ready-list">
              {it.includes.map((x) => <li key={x}><GemMark className="li-gem" />{x}</li>)}
            </ul>
            {'proof' in it && it.proof && (
              <a className="ready-proof" href={it.proof.href}><span>{r.proof}</span> {it.proof.label}</a>
            )}
            <button type="button" className="btn btn-primary" onClick={() => startOnboarding({ persona: 'business' })}><span>{r.cta}</span></button>
          </div>

          <div className="ready-demos">
            {list.length > 0 && <p className="ready-label">{r.demos}</p>}
            {embed ? (
              <div className="tour-frame">
                <iframe src={embed.url} title={embed.title[lang]} allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen loading="lazy" />
              </div>
            ) : null}
            {embed ? (
              <div className="tour-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEmbed(null)}><span>{t.close}</span></button>
                <a className="link-btn" href={embed.url} target="_blank" rel="noopener noreferrer"><span>{t.open}</span></a>
              </div>
            ) : list.length ? (
              <div className={`demo-grid n${Math.min(list.length, 3)}`}>
                {list.map((d) => (
                  <DemoCard key={d.url} d={d} onEmbed={d.embed && !SINGLE ? () => setEmbed(d) : undefined} />
                ))}
              </div>
            ) : (
              <div className="demo-empty"><GemMark className="demo-gem" /><p>{r.noDemo}</p></div>
            )}
          </div>
        </div>

        <p className="ready-tail" data-reveal><Rich text={r.tail} /></p>
      </div>
    </section>
  )
}
