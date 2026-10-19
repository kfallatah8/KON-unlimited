// KON Diagnostic Framework. The HTML here is the complete, accessible interface;
// the 3D ring behind it mirrors the same state (hover/select) and can also be clicked.
import { useEffect, useRef } from 'react'
import { useContent } from '../content/useContent'
import { SplitReveal } from './SplitReveal'
import { store, useStore } from '../state/store'
import { SCENE } from '../three/formations'

export function DiagnosticVisualization() {
  const c = useContent()
  const t = c.framework
  const dimensions = c.dimensions
  const selected = useStore((s) => s.selected)
  const hovered = useStore((s) => s.hovered)
  const panelRef = useRef<HTMLDivElement>(null)
  const active = dimensions.find((d) => d.id === selected)

  // Clear selection when the visitor leaves the section.
  useEffect(() => {
    const el = document.getElementById('framework')
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) store.set({ selected: null, hovered: null })
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (selected) panelRef.current?.focus({ preventScroll: true })
  }, [selected])

  return (
    <section id="framework" className="framework" aria-labelledby="framework-title">
      <div className="framework-sticky" data-scene={SCENE.diagnostic}>
        <div className="framework-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <SplitReveal id="framework-title" text={t.title} />
          <p className="lede">{t.lede}</p>

          <div className="dim-list" role="group" aria-label={t.groupLabel}>
            {dimensions.map((d, i) => (
              <button
                key={d.id}
                type="button"
                className="dim-chip"
                aria-pressed={selected === d.id}
                data-hover={hovered === d.id}
                aria-controls="dim-panel"
                onClick={() => store.set({ selected: selected === d.id ? null : d.id })}
                onPointerEnter={() => store.set({ hovered: d.id })}
                onPointerLeave={() => store.set({ hovered: null })}
                onFocus={() => store.set({ hovered: d.id })}
                onBlur={() => store.set({ hovered: null })}
              >
                <span className="dim-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="dim-name">{d.name}</span>
                {d.latin !== d.name && <span className="dim-latin">{d.latin}</span>}
              </button>
            ))}
          </div>

          <div id="dim-panel" className="dim-panel" ref={panelRef} tabIndex={-1} aria-live="polite">
            {active ? (
              <article key={active.id} className="dim-detail">
                <header>
                  <p className="dim-detail-latin">{active.latin}</p>
                  <h3>{active.question}</h3>
                </header>
                <div className="dim-cols">
                  <div>
                    <h4>{t.challenges}</h4>
                    <ul>{active.challenges.map((c) => <li key={c}>{c}</li>)}</ul>
                  </div>
                  <div>
                    <h4>{t.kpis}</h4>
                    <ul className="kpis" dir="ltr">{active.kpis.map((k) => <li key={k}>{k}</li>)}</ul>
                  </div>
                  <div>
                    <h4>{t.opportunities}</h4>
                    <ul>{active.opportunities.map((o) => <li key={o}>{o}</li>)}</ul>
                  </div>
                </div>
                <button type="button" className="link-btn" onClick={() => store.set({ selected: null })}>
                  {t.back}
                </button>
              </article>
            ) : (
              <p className="dim-hint">
                {hovered ? dimensions.find((d) => d.id === hovered)?.summary : t.hint}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
