// KON Talent: a section that invites people whose ability is bigger than their paperwork, and
// companies looking for them. Two short flows share the onboarding UI; a person gets a first
// "talent read" (archetypes + where they add value), a company gets a summary of its request.
// Everything stays client-side; sending works like the main onboarding (WhatsApp / email / copy).
import { useEffect, useMemo, useRef, useState } from 'react'
import { contact as inbox } from '../content/site'
import { archetypes, dims, talentOption, talentRead, talentSteps, type Archetype, type TalentSide } from '../content/talent'
import { useContent } from '../content/useContent'
import { motion, useStore } from '../state/store'
import { scrollToHash } from './SmoothScroll'
import { QuestionField } from './Onboarding'
import { GemMark } from './Icons'
import { SplitReveal } from './SplitReveal'
import { Rich } from './Rich'
import type { Answers } from '../content/onboarding'

type Field = 'name' | 'company' | 'job' | 'phone' | 'email' | 'city'
interface Draft {
  side: TalentSide | null
  answers: Answers
  other: Record<string, string>
  who: Record<Field, string>
}
const EMPTY: Draft = { side: null, answers: {}, other: {}, who: { name: '', company: '', job: '', phone: '', email: '', city: '' } }
const KEY = 'kon-talent-draft'
const FIELDS: Record<TalentSide, Field[]> = {
  talent: ['name', 'phone', 'email', 'city'],
  company: ['name', 'company', 'job', 'phone', 'email', 'city'],
}

function load(): Draft {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw)
      return { ...EMPTY, ...d, who: { ...EMPTY.who, ...(d.who ?? {}) } }
    }
  } catch {
    /* storage unavailable */
  }
  return EMPTY
}

function TalentFlow({ preset }: { preset: { side: TalentSide; n: number } | null }) {
  const t = useContent().talent
  const lang = useStore((s) => s.lang)
  const [d, setD] = useState<Draft>(load)
  // -1 = choose a door, 0..n-1 = questions, n = contact, n+1 = result
  const [step, setStep] = useState(-1)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(d))
    } catch {
      /* storage unavailable */
    }
  }, [d])

  const steps = useMemo(() => (d.side ? talentSteps(d.side, lang) : []), [d.side, lang])
  const n = steps.length
  const total = n + 2
  const pos = step + 2

  useEffect(() => {
    if (step === -1 && !d.side) return
    card.current?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true })
  }, [step])

  const go = (s: number) => {
    setError('')
    setStep(s)
    scrollToHash('#talent-flow')
  }
  const pick = (side: TalentSide) => {
    setD((p) => ({ ...p, side, answers: p.side === side ? p.answers : {}, other: p.side === side ? p.other : {} }))
    go(0)
  }
  useEffect(() => {
    if (preset) pick(preset.side)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])
  const setAnswer = (id: string, v: Answers[string]) => setD((p) => ({ ...p, answers: { ...p.answers, [id]: v } }))

  const validStep = (i: number) => steps[i].questions.every((q) => {
    if (q.optional || q.kind === 'scale') return true
    const v = d.answers[q.id]
    if (q.kind === 'text') return typeof v === 'string' && v.trim().length > 0
    if (q.id === 'pains' && d.other.pains?.trim()) return true
    return Array.isArray(v) ? v.length > 0 : !!v
  })
  const next = () => {
    if (step >= 0 && step < n && !validStep(step)) return setError(t.required)
    if (step === n && (!d.who.name.trim() || !(d.who.phone.trim() || d.who.email.trim()))) return setError(t.contact.needOne)
    go(Math.min(step + 1, n + 1))
  }

  const L = (qid: string, v: unknown) => (d.side ? talentOption(d.side, qid, String(v), lang) : String(v))
  const list = (qid: string) => {
    const v = d.answers[qid]
    const arr = (Array.isArray(v) ? v : v ? [v] : []).map((x) => L(qid, x))
    if (d.other[qid]?.trim()) arr.push(d.other[qid].trim())
    return arr
  }
  const read = d.side === 'talent' ? talentRead(d.answers) : null
  const pains = (d.answers.pains as string[] | undefined) ?? []

  const brief = () => {
    if (!d.side) return ''
    const lines: string[] = []
    lines.push(`KON Talent · ${d.side === 'talent' ? (lang === 'ar' ? 'ملف موهبة' : 'Talent profile') : (lang === 'ar' ? 'طلب مواهب' : 'Talent request')}`)
    lines.push('—')
    FIELDS[d.side].forEach((f) => d.who[f].trim() && lines.push(`${t.contact[f]}: ${d.who[f].trim()}`))
    lines.push('—')
    steps.forEach((s) => s.questions.forEach((q) => {
      const v = d.answers[q.id]
      const extra = d.other[q.id]?.trim()
      if ((v === undefined || v === '' || (Array.isArray(v) && !v.length)) && !extra) return
      const txt = q.kind === 'text' ? String(v) : q.kind === 'scale' ? `${v}/5` : list(q.id).join('، ')
      lines.push(`${q.label}: ${txt}`)
    }))
    if (read && read.top.length) {
      lines.push('—')
      lines.push(`${t.read.you}: ${read.top.map((k) => archetypes[k].name[lang]).join('، ')}`)
      lines.push(`${t.read.where}: ${read.dims.map((x) => dims[x][lang]).join('، ')}`)
    }
    return lines.join('\n')
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      const det = card.current?.querySelector('details.ob-raw') as HTMLDetailsElement | null
      if (det) {
        det.open = true
        det.querySelector('textarea')?.select()
      }
    }
  }
  const subject = `KON Talent · ${d.who.name}${d.who.company ? ' · ' + d.who.company : ''}`

  return (
    <div className="ob talent-ob" ref={card} id="talent-flow">
      <div className="ob-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${step < 0 ? 0.04 : Math.min(1, pos / total)})` }} />
      </div>
      {step >= 0 && step <= n && <p className="ob-step" aria-live="polite">{t.stepOf(pos, total)}</p>}

      {step === -1 && (
        <div className="ob-screen" key="doors">
          <h3 tabIndex={-1}>{t.doorsQ}</h3>
          <p className="ob-lede">{t.doorsTime}</p>
          <div className="ob-personas talent-doors">
            {(['talent', 'company'] as TalentSide[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`persona${d.side === s ? ' is-on' : ''}`}
                onClick={() => pick(s)}
                onPointerEnter={() => (motion.glow = 1)}
                onPointerLeave={() => (motion.glow = 0)}
              >
                <GemMark className="persona-gem" />
                <b>{t.doors[s].label}</b>
                <span>{t.doors[s].sub}</span>
              </button>
            ))}
          </div>
          <p className="talent-free"><GemMark className="li-gem" />{t.free}</p>
        </div>
      )}

      {step >= 0 && step < n && (
        <div className="ob-screen" key={`${d.side}-${step}`}>
          <h3 tabIndex={-1}>{steps[step].title}</h3>
          {steps[step].lede && <p className="ob-lede">{steps[step].lede}</p>}
          {steps[step].questions.map((q) => (
            <QuestionField
              key={q.id}
              q={q}
              lang={lang}
              value={d.answers[q.id]}
              other={d.other[q.id] ?? ''}
              onChange={(v) => setAnswer(q.id, v)}
              onOther={(v) => setD((p) => ({ ...p, other: { ...p.other, [q.id]: v } }))}
            />
          ))}
        </div>
      )}

      {step === n && d.side && (
        <div className="ob-screen" key="contact">
          <h3 tabIndex={-1}>{t.contact.title}</h3>
          <p className="ob-lede">{d.side === 'talent' ? t.contact.lede : t.contact.ledeCompany}</p>
          <div className="ob-grid">
            {FIELDS[d.side].map((f) => (
              <label key={f} className="ob-field">
                <span>{t.contact[f]}</span>
                <input
                  value={d.who[f]}
                  type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'}
                  inputMode={f === 'phone' ? 'tel' : undefined}
                  dir={f === 'email' || f === 'phone' ? 'ltr' : undefined}
                  autoComplete={f === 'name' ? 'name' : f === 'email' ? 'email' : f === 'phone' ? 'tel' : f === 'company' ? 'organization' : f === 'job' ? 'organization-title' : 'address-level2'}
                  onChange={(e) => setD((p) => ({ ...p, who: { ...p.who, [f]: e.target.value } }))}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {step === n + 1 && d.side === 'talent' && read && read.top.length > 0 && (
        <div className="ob-screen ob-summary" key="read">
          <h3 tabIndex={-1}>{t.read.title}</h3>
          <p className="ob-lede">{t.read.lede}</p>
          <div className="ob-rec talent-read">
            <GemMark className="talent-read-gem" />
            <p className="ob-rec-k">{t.read.you}</p>
            <p className="ob-rec-v">{archetypes[read.top[0]].name[lang]}</p>
            <p className="talent-power">{archetypes[read.top[0]].power[lang]}</p>
            <p className="talent-where">{archetypes[read.top[0]].where[lang]}</p>
            {read.top[1] && (
              <p className="talent-also"><span>{t.read.also}</span> <b>{archetypes[read.top[1]].name[lang]}</b>: {archetypes[read.top[1]].power[lang]}</p>
            )}
          </div>
          <dl className="ob-overview">
            <div className="wide"><dt>{t.read.roles}</dt><dd className="tags">{rolesOf(read.top, lang).map((x) => <span key={x}>{x}</span>)}</dd></div>
            <div className="wide"><dt>{t.read.where}</dt><dd className="tags">{read.dims.map((x) => <span key={x}>{dims[x][lang]}</span>)}</dd></div>
            {typeof d.answers.proof === 'string' && d.answers.proof.trim() && (
              <div className="wide"><dt>{t.read.story}</dt><dd><blockquote className="talent-story">{clip(d.answers.proof.trim(), 240)}</blockquote></dd></div>
            )}
          </dl>
          <NextSteps title={t.read.next} steps={t.read.steps} />
          <p className="talent-promise">{t.read.promise}</p>
          <Actions brief={brief} subject={subject} copy={copy} copied={copied} />
          <button type="button" className="ob-link" onClick={() => go(0)}>{t.edit}</button>
        </div>
      )}

      {step === n + 1 && d.side === 'company' && (
        <div className="ob-screen ob-summary" key="brief">
          <h3 tabIndex={-1}>{t.brief.title}</h3>
          <p className="ob-lede">{t.brief.lede}</p>
          <dl className="ob-overview">
            {typeof d.answers.role === 'string' && d.answers.role.trim() && <div className="wide"><dt>{t.brief.role}</dt><dd>{d.answers.role.trim()}</dd></div>}
            {list('areas').length > 0 && <div className="wide"><dt>{t.brief.areas}</dt><dd className="tags">{list('areas').map((x) => <span key={x}>{x}</span>)}</dd></div>}
            {d.answers.type && <div><dt>{t.brief.type}</dt><dd>{L('type', d.answers.type)}</dd></div>}
            {list('traits').length > 0 && <div><dt>{t.brief.traits}</dt><dd className="tags">{list('traits').map((x) => <span key={x}>{x}</span>)}</dd></div>}
            {list('pains').length > 0 && <div className="wide"><dt>{t.brief.pains}</dt><dd className="tags">{list('pains').map((x) => <span key={x}>{x}</span>)}</dd></div>}
          </dl>
          {(d.answers.open === 'yes' || pains.includes('unclear')) && (
            <div className="ob-rec">
              {d.answers.open === 'yes' && <p className="talent-where"><Rich text={t.brief.openYes} /></p>}
              {pains.includes('unclear') && <p className="talent-where">{t.brief.unclear}</p>}
            </div>
          )}
          <NextSteps title={t.brief.next} steps={t.brief.steps} />
          <Actions brief={brief} subject={subject} copy={copy} copied={copied} />
          <button type="button" className="ob-link" onClick={() => go(0)}>{t.edit}</button>
        </div>
      )}

      {error && <p className="ob-error" role="alert">{error}</p>}

      {step >= 0 && step <= n && (
        <div className="ob-nav">
          <button type="button" className="ob-back" onClick={() => go(step - 1)}>{t.back}</button>
          <button type="button" className="btn btn-primary" onClick={next}><span>{step === n ? t.finish : t.next}</span></button>
        </div>
      )}
      {step === n + 1 && (
        <button type="button" className="ob-link talent-restart" onClick={() => go(-1)}>{t.restart}</button>
      )}
    </div>
  )
}

function Actions({ brief, subject, copy, copied }: { brief: () => string; subject: string; copy: () => void; copied: boolean }) {
  const t = useContent().talent
  const ob = useContent().onboarding
  return (
    <>
      <div className="ob-actions">
        {inbox.whatsapp && (
          <a className="btn btn-primary" target="_blank" rel="noreferrer" href={`https://wa.me/${inbox.whatsapp}?text=${encodeURIComponent(brief())}`}><span>{t.sendWhatsapp}</span></a>
        )}
        {inbox.email && (
          <a className={`btn ${inbox.whatsapp ? 'btn-ghost' : 'btn-primary'}`} href={`mailto:${inbox.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief())}`}><span>{t.sendEmail}</span></a>
        )}
        <button type="button" className="btn btn-ghost" onClick={copy}><span>{copied ? t.copied : t.copy}</span></button>
      </div>
      {!inbox.whatsapp && !inbox.email && <p className="ob-note" role="note">{ob.summary.notConnected}</p>}
      <details className="ob-raw">
        <summary>{t.raw}</summary>
        <textarea readOnly rows={10} value={brief()} onFocus={(e) => e.currentTarget.select()} />
      </details>
    </>
  )
}

const clip = (x: string, n: number) => (x.length > n ? x.slice(0, n).trimEnd() + '…' : x)
function rolesOf(top: Archetype[], lang: 'ar' | 'en') {
  const out: string[] = []
  top.forEach((k) => archetypes[k].roles[lang].forEach((r) => !out.includes(r) && out.push(r)))
  return out.slice(0, 5)
}

function NextSteps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="ob-next">
      <p className="ob-rec-k">{title}</p>
      <ol className="talent-next">
        {steps.map((x, i) => <li key={x}><span dir="ltr">{String(i + 1).padStart(2, '0')}</span>{x}</li>)}
      </ol>
    </div>
  )
}

// Three winners on a triangle (talent, company, KON) meeting at "impact" in the middle.
// The lit corner follows the card being read; it cycles gently on its own until someone hovers.
const VERTS: [number, number][] = [[160, 34], [282, 236], [38, 236]]
function WinTriangle({ on, labels, center }: { on: number; labels: string[]; center: string }) {
  return (
    <svg className="win-tri" viewBox="0 0 320 290" aria-hidden="true">
      <defs>
        <linearGradient id="wt-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5fe3d2" stopOpacity="0.85" />
          <stop offset="1" stopColor="#d6c08f" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="wt-glow">
          <stop offset="0" stopColor="#5fe3d2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#5fe3d2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={`M${VERTS[0]} L${VERTS[1]} L${VERTS[2]} Z`} fill="rgba(30,194,176,0.04)" stroke="url(#wt-line)" strokeWidth="1.2" />
      {VERTS.map(([x, y], i) => (
        <path key={`l${i}`} className={`wt-spoke${on === i ? ' is-on' : ''}`} d={`M${x} ${y} L160 168`} />
      ))}
      {VERTS.map(([x, y], i) => (
        <g key={`v${i}`} className={`wt-node${on === i ? ' is-on' : ''}`}>
          <circle cx={x} cy={y} r="26" fill="url(#wt-glow)" className="wt-halo" />
          <path d={`M${x} ${y - 14} L${x + 12} ${y - 3} L${x} ${y + 14} L${x - 12} ${y - 3} Z`} className="wt-gem" />
          <text x={x} y={i === 0 ? y - 22 : y + 32} textAnchor="middle" className="wt-label">{labels[i]}</text>
        </g>
      ))}
      <circle cx="160" cy="168" r="27" fill="rgba(2,24,26,0.92)" stroke="#d6c08f" strokeWidth="1" />
      <text x="160" y="173" textAnchor="middle" className="wt-center">{center}</text>
    </svg>
  )
}

function Wins() {
  const w = useContent().talent.wins
  const [on, setOn] = useState(0)
  const [held, setHeld] = useState(false)
  useEffect(() => {
    if (held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setOn((x) => (x + 1) % 3), 3200)
    return () => window.clearInterval(id)
  }, [held])
  return (
    <div className="talent-wins-block">
      <div className="center">
        <p className="talent-sub" data-reveal>{w.title}</p>
        <p className="talent-wins-lede" data-reveal>{w.lede}</p>
      </div>
      <div className="win-tri-wrap" data-reveal><WinTriangle on={on} labels={w.items.map((x) => x.k)} center={w.center} /></div>
      {/* data-reveal sits on the list: the cards' own className changes with the lit corner,
          and React would wipe a reveal class added to them. */}
      <ul className="talent-wins" data-reveal onPointerLeave={() => setHeld(false)}>
        {w.items.map((x, i) => (
          <li
            key={x.k}
            className={`talent-win${on === i ? ' is-on' : ''}`}
            tabIndex={0}
            onPointerEnter={() => { setHeld(true); setOn(i) }}
            onFocus={() => { setHeld(true); setOn(i) }}
            onBlur={() => setHeld(false)}
          >
            <span className="talent-win-n" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
            <b>{x.k}</b>
            <h3>{x.gain}</h3>
            <p><Rich text={x.body} /></p>
          </li>
        ))}
      </ul>
      <p className="talent-sum" data-reveal>{w.sum}</p>
    </div>
  )
}

export function Talent() {
  const t = useContent().talent
  const lang = useStore((s) => s.lang)
  const [preset, setPreset] = useState<{ side: TalentSide; n: number } | null>(null)
  const open = (side: TalentSide) => setPreset((p) => ({ side, n: (p?.n ?? 0) + 1 }))
  return (
    <section id="talent" className="band talent" aria-labelledby="talent-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{t.eyebrow}</p>
          <SplitReveal as="h2" id="talent-title" className="display" text={t.title} />
          <p className="body-lg" data-reveal><Rich text={t.lede} /></p>
        </div>

        <div className="talent-teaser" data-reveal>
          <p className="talent-teaser-q">{t.teaserQ}</p>
          <ul className="talent-arches">
            {(Object.keys(archetypes) as Archetype[]).map((k) => <li key={k}><GemMark className="chip-gem" />{archetypes[k].name[lang]}</li>)}
          </ul>
          <button type="button" className="btn btn-primary" onClick={() => open('talent')}><span>{t.teaserCta}</span></button>
        </div>

        <div className="talent-mirror">
          <p className="talent-sub center" data-reveal>{t.mirror.title}</p>
          <div className="talent-mirror-grid">
            {(['talent', 'company'] as TalentSide[]).map((side) => {
              const m = t.mirror[side]
              return (
                <article key={side} className={`talent-side glass is-${side}`} data-reveal>
                  <p className="talent-k"><GemMark className="li-gem" />{m.k}</p>
                  <ul>{m.lines.map((x) => <li key={x}>{x}</li>)}</ul>
                  <button type="button" className="link-btn" onClick={() => open(side)}><span>{m.cta}</span> <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span></button>
                </article>
              )
            })}
          </div>
        </div>

        <div className="talent-journey">
          <p className="talent-sub center" data-reveal>{t.journey.title}</p>
          <ol className="journey">
            {t.journey.steps.map((st, i) => (
              <li key={st.title} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="journey-n" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <Wins />

        <div className="talent-flow-wrap" data-reveal>
          <TalentFlow preset={preset} />
        </div>
      </div>
    </section>
  )
}
