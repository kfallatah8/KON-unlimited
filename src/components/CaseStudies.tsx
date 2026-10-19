import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { media, type CaseStatus, type MiniCase } from '../content/site'
import { useContent } from '../content/useContent'
import { SplitReveal } from './SplitReveal'
import { Icon, TransportMap, WebArStudio } from './CaseVisuals'
import type { Capabilities } from '../lib/capabilities'
import { sectionProgress, useInView } from '../lib/useInView'
import type { ShowcaseState } from '../three/ProjectDeviceShowcase'
import { SCENE } from '../three/formations'

// The single-file preview runs inside a sandbox that refuses third-party frames,
// so there the tour opens on its own page; a self-hosted build embeds it.
const LINK_OUT = import.meta.env.MODE === 'single'

const ProjectDeviceShowcase = lazy(() => import('../three/ProjectDeviceShowcase'))
const PanoramaViewer = lazy(() => import('../three/PanoramaViewer'))

function useShowcaseState(ref: React.RefObject<HTMLElement | null>, screens = 0) {
  const state = useRef<ShowcaseState>({ progress: 0, screen: 0, enter: 0 })
  const [screen, setScreen] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return
      const p = sectionProgress(ref.current)
      state.current.progress = p
      if (screens) {
        const s = Math.min(screens - 1, Math.max(0, Math.floor((p - 0.2) * screens * 1.6)))
        if (s !== state.current.screen) {
          state.current.screen = s
          setScreen(s)
        }
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ref, screens])
  const pick = (s: number) => {
    state.current.screen = s
    setScreen(s)
  }
  return { state, screen, pick }
}

function Missing({ children }: { children: string }) {
  return <p className="missing"><span aria-hidden="true">◌</span> {children}</p>
}

function Status({ status, founder }: { status: CaseStatus; founder?: boolean }) {
  const t = useContent().work
  return (
    <p className="status-line">
      <span className={`status status-${status}`}>{t.status[status]}</span>
      {founder && <span className="status-credit">{t.founder}</span>}
    </p>
  )
}

function CaseHeader({ i }: { i: number }) {
  const t = useContent().work
  const c = t.cases[i]
  return (
    <header className="case-head">
      <p className="case-index"><span dir="ltr">{c.index}</span>{c.sector}</p>
      <SplitReveal as="h3" text={c.title} />
      <Status status={c.status} founder={c.founder} />
      <p>{c.body}</p>
      <p className="deliv-label">{t.delivers}</p>
      <ul className="deliverables">{c.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
    </header>
  )
}

function FieldOpsCase({ caps }: { caps: Capabilities }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const { state, screen, pick } = useShowcaseState(ref, 3)
  const use3D = caps.tier !== 'none'
  const t = useContent().work
  const labels = t.cases[2].screens ?? []
  return (
    <article className="case case-field case-flip" ref={ref}>
      <CaseHeader i={2} />
      <div className="case-stage stage-phone">
        {use3D && inView ? (
          <Suspense fallback={<div className="stage-loading" />}>
            <ProjectDeviceShowcase variant="phone" state={state} screens={media.fieldScreens} motion={!caps.reducedMotion} quality={caps.tier === 'high' ? 'high' : 'low'} />
          </Suspense>
        ) : (
          <div className="css-phone" aria-hidden="true"><div className="css-screen">FIELD OPS</div></div>
        )}
        <div className="screen-steps" role="group" aria-label={t.screens}>
          {labels.map((l, s) => (
            <button key={l} type="button" aria-pressed={screen === s} onClick={() => pick(s)}>{l}</button>
          ))}
        </div>
        {!media.fieldScreens.length && <p className="stage-note">{t.schematic}</p>}
      </div>
    </article>
  )
}

function EstateCase({ caps }: { caps: Capabilities }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const { state } = useShowcaseState(ref)
  const [tourOpen, setTourOpen] = useState(false)
  const use3D = caps.tier !== 'none'
  const t = useContent().work

  const openTour = () => {
    if (caps.reducedMotion || !use3D) {
      state.current.enter = 1
      setTourOpen(true)
      return
    }
    gsap.to(state.current, { enter: 1, duration: 1.4, ease: 'power3.inOut', onComplete: () => setTourOpen(true) })
  }
  const closeTour = () => {
    setTourOpen(false)
    gsap.to(state.current, { enter: 0, duration: caps.reducedMotion ? 0 : 1, ease: 'power2.out' })
  }

  return (
    <article className="case case-estate" ref={ref}>
      <CaseHeader i={0} />
      <div className="case-stage stage-estate">
        {use3D && inView ? (
          <Suspense fallback={<div className="stage-loading" />}>
            <ProjectDeviceShowcase variant="property" state={state} motion={!caps.reducedMotion} quality={caps.tier === 'high' ? 'high' : 'low'} />
          </Suspense>
        ) : (
          <div className="css-building" aria-hidden="true" />
        )}
        {!tourOpen && (
          <button type="button" className="btn btn-primary tour-btn" onClick={openTour}>
            <span>{t.tourCta}</span>
          </button>
        )}
        {tourOpen && (
          <div className="tour" role="region" aria-label={t.tourRegion}>
            {media.tourScenes.length ? (
              <Suspense fallback={<div className="stage-loading" />}>
                <PanoramaViewer scenes={media.tourScenes} motion={!caps.reducedMotion} label={t.tourRegion} />
              </Suspense>
            ) : media.tourUrl && LINK_OUT ? (
              <div className="tour-placeholder tour-out">
                <p className="eyebrow" dir="ltr">360° VIRTUAL TOUR</p>
                <p>{t.tourOutBody}</p>
                <a className="btn btn-primary" href={media.tourUrl} target="_blank" rel="noopener noreferrer"><span>{t.tourOutCta}</span></a>
              </div>
            ) : media.tourUrl ? (
              <iframe src={media.tourUrl} title={t.tourRegion} allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen />
            ) : (
              <div className="tour-placeholder">
                <p className="eyebrow" dir="ltr">360° VIRTUAL TOUR</p>
                <p>{t.tourBody}</p>
                <Missing>{t.tourMissing}</Missing>
              </div>
            )}
            <div className="tour-bar">
              {media.tourUrl && !LINK_OUT && !media.tourScenes.length && <a className="tour-pill" href={media.tourUrl} target="_blank" rel="noopener noreferrer">{t.tourOpen}</a>}
              <button type="button" className="tour-pill" onClick={closeTour}>{t.tourBack}</button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

/** Before/after view of the transport operation, plus the SOP phases. No figures are shown. */
function TransportCase() {
  const t = useContent().work
  const ltr = useContent().dir === 'ltr'
  return (
    <article className="case case-transport">
      <CaseHeader i={1} />
      <div className="transport-visual">
        <TransportMap t={t.ops} ltr={ltr} />
        <figure className="phases">
          <figcaption>{t.phasesLabel}</figcaption>
          <ol>
            {t.phases.map((p, i) => (
              <li key={p}><span dir="ltr">{String(i + 1).padStart(2, '0')}</span>{p}</li>
            ))}
          </ol>
        </figure>
      </div>
    </article>
  )
}

function WebArCase() {
  const t = useContent().work
  return (
    <article className="case case-digital case-flip">
      <CaseHeader i={3} />
      <div className="devices-wrap">
        <WebArStudio caption={t.arSteps} />
      </div>
    </article>
  )
}

function MiniGrid({ items }: { items: MiniCase[] }) {
  return (
    <ul className="mini-grid">
      {items.map((m) => (
        <li key={m.title} className="mini reveal">
          <div className="mini-top">
            <span className="mini-ico"><Icon name={m.icon} /></span>
            <p className="mini-sector">{m.sector}</p>
          </div>
          <h4>{m.title}</h4>
          <p>{m.body}</p>
          <Status status={m.status} founder={m.founder} />
        </li>
      ))}
    </ul>
  )
}

export function CaseStudies({ caps }: { caps: Capabilities }) {
  const t = useContent().work
  return (
    <section id="work" className="cases" aria-labelledby="work-title" data-scene={SCENE.rest}>
      <div className="section-head">
        <p className="eyebrow">{t.eyebrow}</p>
        <SplitReveal id="work-title" text={t.title} />
        <p className="section-intro">{t.intro}</p>
        <ul className="sectors" aria-label={t.sectorsLabel}>
          {t.sectors.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>
      <EstateCase caps={caps} />
      <TransportCase />
      <FieldOpsCase caps={caps} />
      <WebArCase />
      <div className="more-work">
        <h3 className="sub-head">{t.moreTitle}</h3>
        <MiniGrid items={t.more} />
      </div>
      <div className="more-work lab">
        <h3 className="sub-head">{t.labTitle}</h3>
        <p className="lab-intro">{t.labIntro}</p>
        <MiniGrid items={t.lab} />
      </div>
      <p className="evidence-note">{t.note}</p>
    </section>
  )
}
