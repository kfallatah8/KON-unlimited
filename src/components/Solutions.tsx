// KON Solutions: one sector at a time. Free tools give a real number now (reciprocity first),
// systems KON sets up on request show what the number could become, and every request lands in
// the same inbox as the diagnosis (WhatsApp / email / copy). Each request names the exact
// solution and sector, so demand can be read before anything is installed.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { apps } from '../content/apps'
import { contact as inbox } from '../content/site'
import { reqCopy, solCopy, solSectors, type Extra, type Pick, type SolSector, type ToolId } from '../content/solutions'
import { useContent } from '../content/useContent'
import { startOnboarding, useStore } from '../state/store'
import { lenis } from './SmoothScroll'
import { Icon, GemMark } from './Icons'
import { SplitReveal } from './SplitReveal'
import { Rich } from './Rich'
import { toolHelp } from '../content/toolHelp'
import { Tool, toolMeta } from './Tools'

type Tab = 'tools' | 'picks' | 'extras'
interface Req { title: string; sector: string; tech?: string; kind: 'setup' | 'service'; result?: string }

const WHO_KEY = 'kon-req-who'
type Who = { name: string; phone: string; business: string; city: string; note: string }
const EMPTY_WHO: Who = { name: '', phone: '', business: '', city: '', note: '' }
function loadWho(): Who {
  try {
    const raw = localStorage.getItem(WHO_KEY)
    if (raw) return { ...EMPTY_WHO, ...JSON.parse(raw), note: '' }
  } catch {
    /* storage unavailable */
  }
  return EMPTY_WHO
}

/** The request sheet: feels like ordering a service that exists, because it does, on demand. */
function RequestSheet({ req, onClose }: { req: Req; onClose: () => void }) {
  const lang = useStore((s) => s.lang)
  const r = reqCopy[lang]
  const [who, setWho] = useState<Who>(loadWho)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const back = useRef<Element | null>(null)

  useEffect(() => {
    back.current = document.activeElement
    document.documentElement.classList.add('sheet-open')
    lenis?.stop()
    box.current?.querySelector<HTMLElement>('input')?.focus({ preventScroll: true })
    const esc = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('keydown', esc)
      document.documentElement.classList.remove('sheet-open')
      lenis?.start()
      ;(back.current as HTMLElement | null)?.focus?.({ preventScroll: true })
    }
  }, [onClose])
  useEffect(() => {
    try {
      localStorage.setItem(WHO_KEY, JSON.stringify({ ...who, note: '' }))
    } catch {
      /* storage unavailable */
    }
  }, [who])

  // Keep keyboard focus inside the sheet.
  const trap = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !box.current) return
    const f = [...box.current.querySelectorAll<HTMLElement>('a[href], button, input, textarea')].filter((x) => !x.hasAttribute('disabled'))
    if (!f.length) return
    const first = f[0], last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  const brief = () => [
    r.head,
    '—',
    `${r.lSolution}: ${req.title}${req.tech ? ` (${req.tech})` : ''}`,
    `${r.lSector}: ${req.sector}`,
    ...(req.result ? [`${r.lResult}: ${req.result}`] : []),
    '—',
    `${r.name}: ${who.name.trim()}`,
    `${r.phone}: ${who.phone.trim()}`,
    ...(who.business.trim() ? [`${r.business}: ${who.business.trim()}`] : []),
    ...(who.city.trim() ? [`${r.city}: ${who.city.trim()}`] : []),
    ...(who.note.trim() ? [`${r.note} ${who.note.trim()}`] : []),
  ].join('\n')
  const valid = () => {
    if (!who.name.trim() || who.phone.replace(/\D/g, '').length < 8) {
      setErr(r.need)
      return false
    }
    setErr('')
    return true
  }
  const copy = async () => {
    if (!valid()) return
    try {
      await navigator.clipboard.writeText(brief())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked: the WhatsApp and email buttons still work */
    }
  }
  const field = (k: keyof Who, label: string, opt?: boolean, type = 'text') => (
    <label className="rq-field">
      <span>{label}{opt && <em> · {r.optional}</em>}</span>
      {k === 'note'
        ? <textarea rows={2} value={who[k]} onChange={(e) => setWho((w) => ({ ...w, [k]: e.target.value }))} />
        : <input type={type} inputMode={k === 'phone' ? 'tel' : undefined} dir={k === 'phone' ? 'ltr' : undefined} autoComplete={k === 'name' ? 'name' : k === 'phone' ? 'tel' : k === 'business' ? 'organization' : 'address-level2'} value={who[k]} onChange={(e) => setWho((w) => ({ ...w, [k]: e.target.value }))} />}
    </label>
  )
  const steps = req.kind === 'setup' ? r.stepsSetup : r.stepsService
  return (
    <div className="rq-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rq-sheet" role="dialog" aria-modal="true" aria-labelledby="rq-title" ref={box} onKeyDown={trap}>
        <button type="button" className="rq-close" onClick={onClose} aria-label={r.close}>×</button>
        <p className="rq-kicker"><GemMark className="li-gem" />{req.sector}</p>
        <h3 id="rq-title">{req.title}</h3>
        <p className="rq-lede">{req.kind === 'setup' ? r.titleSetup : r.titleService}. {r.lede}</p>
        <ol className="rq-steps">
          {steps.map((s, i) => <li key={s}><b dir="ltr">{i + 1}</b>{s}</li>)}
        </ol>
        {req.result && <p className="rq-result"><span>{r.lResult}</span>{req.result}</p>}
        <div className="rq-form">
          {field('name', r.name)}
          {field('phone', r.phone, false, 'tel')}
          {field('business', r.business, true)}
          {field('city', r.city, true)}
          {field('note', r.note, true)}
        </div>
        {err && <p className="rq-err" role="alert">{err}</p>}
        <div className="rq-actions">
          {inbox.whatsapp && (
            <a className="btn btn-primary" target="_blank" rel="noreferrer" href={`https://wa.me/${inbox.whatsapp}?text=${encodeURIComponent(brief())}`} onClick={(e) => { if (!valid()) e.preventDefault() }}><span>{r.sendWa}</span></a>
          )}
          {inbox.email && (
            <a className="btn btn-ghost" href={`mailto:${inbox.email}?subject=${encodeURIComponent('KON · ' + req.title)}&body=${encodeURIComponent(brief())}`} onClick={(e) => { if (!valid()) e.preventDefault() }}><span>{r.sendMail}</span></a>
          )}
          <button type="button" className="link-btn" onClick={copy}>{copied ? r.copied : r.copy}</button>
        </div>
        <p className="fine rq-privacy">{r.privacy}</p>
      </div>
    </div>
  )
}

function PickCard({ p, onRequest, hot }: { p: Pick; onRequest: () => void; hot?: boolean }) {
  const lang = useStore((s) => s.lang)
  const s = solCopy[lang]
  return (
    <li className={`sol-pick${hot ? ' is-hot' : ''}`} id={`pick-${p.id}`}>
      <span className="sol-badge"><i aria-hidden="true" />{s.ready}</span>
      <h4>{p.title[lang]}</h4>
      <p className="sol-pain">{p.pain[lang]}</p>
      <button type="button" className="sol-req" onClick={onRequest}><span>{s.request}</span><i aria-hidden="true">{lang === 'ar' ? '←' : '→'}</i></button>
    </li>
  )
}

function ExtraCard({ x, onRequest }: { x: Extra; onRequest: (title: string) => void }) {
  const lang = useStore((s) => s.lang)
  const items = useContent().ready.items
  const s = solCopy[lang]
  const svc = x.service ? items.find((i) => i.id === x.service) : undefined
  const title = svc?.title ?? x.title?.[lang] ?? ''
  const line = svc?.line ?? x.line?.[lang] ?? ''
  return (
    <li className={`sol-extra is-${x.kind}`}>
      <span className="sol-extra-tag">{x.kind === 'studio' ? s.studioTag : s.serviceTag}</span>
      {svc ? <Icon id={svc.icon} className="icon" /> : <GemMark className="sol-extra-gem" />}
      <h4>{title}</h4>
      <p>{line}</p>
      <button type="button" className="link-btn" onClick={() => onRequest(title)}><span>{s.requestService}</span> <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span></button>
    </li>
  )
}

function SectorPanel({ sec, onRequest }: { sec: SolSector; onRequest: (r: Req) => void }) {
  const lang = useStore((s) => s.lang)
  const s = solCopy[lang]
  const [tab, setTab] = useState<Tab>('tools')
  const [tool, setTool] = useState<ToolId>(sec.tools[0])
  const [hot, setHot] = useState('')
  const summary = useRef('')
  const nextPick = sec.picks.find((p) => p.id === sec.next[tool])
  const sector = sec.name[lang]

  const showPick = (id: string) => {
    setTab('picks')
    setHot(id)
    requestAnimationFrame(() => document.getElementById(`pick-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
    window.setTimeout(() => setHot(''), 2600)
  }
  const tabs: [Tab, string, number?][] = [['tools', s.tabs.tools, sec.tools.length], ['picks', s.tabs.picks, sec.picks.length], ['extras', s.tabs.extras]]
  return (
    <div className="sol-panel glass" id="sol-panel" role="tabpanel" aria-labelledby={`sol-s-${sec.id}`}>
      <p className="sol-hook">{sec.hook[lang]}</p>
      <div className="sol-subtabs" role="tablist" aria-label={sector}>
        {tabs.map(([id, label, n]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-on' : ''} onClick={() => setTab(id)}>
            {label}{n ? <b dir="ltr">{n}</b> : null}
          </button>
        ))}
      </div>

      {tab === 'tools' && (
        <div className="sol-tools">
          <div className="sol-toolpick" role="radiogroup" aria-label={s.tabs.tools}>
            {sec.tools.map((id) => (
              <button key={id} type="button" role="radio" aria-checked={tool === id} className={`${tool === id ? 'is-on' : ''}${toolMeta[id].kon ? ' is-kon' : ''}`} onClick={() => setTool(id)}>
                {toolMeta[id].kon && <em className="sol-lens">{s.lens}</em>}
                <b>{toolMeta[id].name[lang]}</b>
                <span>{toolMeta[id].sub[lang]}</span>
              </button>
            ))}
          </div>
          <p className="sol-toolsub">{toolMeta[tool].sub[lang]}</p>
          <details className="sol-how" key={`how-${tool}`} open>
            <summary>{lang === 'ar' ? 'كيف تعمل هذه الأداة؟' : 'How does this tool work?'}</summary>
            <ol>
              <li><b>{lang === 'ar' ? 'السؤال' : 'The question'}</b><span>{toolHelp[tool][lang].q}</span></li>
              <li><b>{lang === 'ar' ? 'ماذا تكتب' : 'What to enter'}</b><span>{toolHelp[tool][lang].fill}</span></li>
              <li><b>{lang === 'ar' ? 'كيف تقرأ النتيجة' : 'Reading the result'}</b><span>{toolHelp[tool][lang].read}</span></li>
            </ol>
          </details>
          <Tool id={tool} lang={lang} report={(x) => { summary.current = x }} />
          <p className="fine sol-note">{s.toolsNote}</p>
          {toolMeta[tool].kon && (
            <div className="sol-next sol-next-kon">
              <p>{s.konLabel}</p>
              <button type="button" className="btn btn-primary" onClick={() => onRequest({ title: `${s.konTitle}: ${toolMeta[tool].name[lang]}`, sector, kind: 'service', result: summary.current })}><span>{s.konCta}</span></button>
            </div>
          )}
          {nextPick && (
            <div className="sol-next">
              <p>{s.nextLabel}</p>
              <button type="button" className="btn btn-ghost" onClick={() => showPick(nextPick.id)}><span>{s.nextCta}: {nextPick.title[lang]}</span></button>
              <button type="button" className="link-btn" onClick={() => onRequest({ title: nextPick.title[lang], tech: apps[nextPick.app]?.name, sector, kind: 'setup', result: summary.current })}>{s.request} <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span></button>
            </div>
          )}
        </div>
      )}

      {tab === 'picks' && (
        <div className="sol-picks-wrap">
          <p className="sol-lede">{s.picksLede}</p>
          <ul className="sol-picks">
            {sec.picks.map((p) => (
              <PickCard key={p.id} p={p} hot={hot === p.id} onRequest={() => onRequest({ title: p.title[lang], tech: apps[p.app]?.name, sector, kind: 'setup', result: sec.next[tool] === p.id ? summary.current : undefined })} />
            ))}
          </ul>
        </div>
      )}

      {tab === 'extras' && (
        <div className="sol-extras-wrap">
          <p className="sol-lede">{s.extrasLede}</p>
          <ul className="sol-extras">
            {sec.extras.map((x) => <ExtraCard key={x.id} x={x} onRequest={(title) => onRequest({ title, sector, kind: 'service' })} />)}
          </ul>
        </div>
      )}
    </div>
  )
}

export function Solutions() {
  const lang = useStore((s) => s.lang)
  const s = solCopy[lang]
  const [sec, setSec] = useState(0)
  const [req, setReq] = useState<Req | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent) => {
    const fwd = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
    const back = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'
    if (e.key !== fwd && e.key !== back) return
    e.preventDefault()
    const n = (sec + (e.key === fwd ? 1 : -1) + solSectors.length) % solSectors.length
    setSec(n)
    tabs.current[n]?.focus()
  }
  const cur = solSectors[sec]
  const close = useCallback(() => setReq(null), [])
  return (
    <section id="solutions" className="band solutions" aria-labelledby="sol-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{s.eyebrow}</p>
          <SplitReveal as="h2" id="sol-title" className="display" text={s.title} />
          <p className="body-lg" data-reveal><Rich text={s.lede} /></p>
        </div>
        <div className="sol-sectors" role="tablist" aria-label={s.pickSector} onKeyDown={onKey} data-reveal>
          {solSectors.map((x, i) => (
            <button
              key={x.id} ref={(el) => { tabs.current[i] = el }} type="button" role="tab" id={`sol-s-${x.id}`}
              aria-selected={i === sec} aria-controls="sol-panel" tabIndex={i === sec ? 0 : -1}
              className={i === sec ? 'is-on' : ''} onClick={() => setSec(i)}
            >
              <GemMark className="sol-gem" /><span>{x.name[lang]}</span>
            </button>
          ))}
        </div>
        <SectorPanel key={cur.id} sec={cur} onRequest={setReq} />
        <p className="ready-tail sol-tail" data-reveal>
          <Rich text={s.tail} />{' '}
          <button type="button" className="link-btn" onClick={() => startOnboarding({ persona: 'business' })}>{s.tailCta} <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span></button>
        </p>
      </div>
      {req && <RequestSheet req={req} onClose={close} />}
    </section>
  )
}
