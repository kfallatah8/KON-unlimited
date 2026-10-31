// Personalised onboarding: persona → persona questions (one screen at a time) → contact → a
// situation overview with recommended services. Runs fully client-side; where the brief goes is
// set in content/site.ts → contact, and the UI says plainly when nothing is connected yet.
// With consent, the finished brief is posted to /api/lead (alerts KON and files the CRM lead), and
// the visitor can rate the diagnosis 1–10 via /api/rating. The manual send buttons stay as a fallback.
import { useEffect, useMemo, useRef, useState } from 'react'
import { contact as inbox, type Lang, type Persona, type Question } from '../content/site'
import { leadRead, optionLabel, recommend, serviceNames, stepsFor, type Answers } from '../content/onboarding'
import { useContent } from '../content/useContent'
import { motion, useStore } from '../state/store'
import { scrollToHash } from './SmoothScroll'
import { GemMark } from './Icons'

interface Draft {
  persona: Persona | null
  support: boolean
  answers: Answers
  other: Record<string, string>
  who: { name: string; company: string; phone: string; email: string; city: string; prefer: string }
  consent: boolean
}
const EMPTY: Draft = { persona: null, support: false, answers: {}, other: {}, who: { name: '', company: '', phone: '', email: '', city: '', prefer: 'whatsapp' }, consent: false }
// Bump when the privacy notice changes materially; it is stored with each lead as proof of consent.
const CONSENT_VERSION = '2026-10-31'

type Sent = { state: 'idle' | 'sending' | 'sent' | 'failed'; ref?: string; token?: string }

async function post(path: string, body: unknown) {
  const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

function Rating({ sent, persona, primary }: { sent: Sent; persona: string; primary: string }) {
  const r = useContent().onboarding.summary.rate
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  if (!sent.ref || !sent.token) return null
  if (state === 'done') return <p className="ob-sent" role="status">{r.thanks}</p>
  const submit = async () => {
    if (!score) return
    setState('sending')
    try {
      await post('/api/rating', { ref: sent.ref, token: sent.token, score, comment, persona, primary })
    } catch {
      /* a lost rating is not worth bothering the visitor about */
    }
    setState('done')
  }
  return (
    <div className="ob-rate">
      <p className="ob-label" id="ob-rate-l">{r.title}</p>
      <div className="ob-scale ob-scale-10" role="radiogroup" aria-labelledby="ob-rate-l">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" role="radio" aria-checked={score === n} className={`ob-dot${score >= n ? ' is-on' : ''}`} onClick={() => setScore(n)}>
            <span dir="ltr">{n}</span>
          </button>
        ))}
      </div>
      <div className="ob-scale-ends"><span>{r.low}</span><span>{r.high}</span></div>
      {score > 0 && (
        <>
          <textarea className="ob-other" rows={2} maxLength={1000} value={comment} placeholder={r.comment} onChange={(e) => setComment(e.target.value)} />
          <button type="button" className="btn btn-ghost" disabled={state === 'sending'} onClick={submit}><span>{r.send}</span></button>
        </>
      )}
    </div>
  )
}
const KEY = 'kon-onboarding-draft'

function load(): Draft {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable */
  }
  return EMPTY
}

// Pain chips in the problem section are worded for people; map them onto question option ids.
const CHIP_TO_PAIN: Record<string, string> = {
  'الفكرة؟': 'start', 'The idea?': 'start', 'نموذج العمل؟': 'model', 'The business model?': 'model',
  'أول العملاء؟': 'customers', 'First customers?': 'customers', 'أول موظف؟': 'team', 'First hire?': 'team',
  'الموظفين؟': 'team', 'The team?': 'team', 'الخطة التشغيلية؟': 'ops', 'The operating plan?': 'ops',
  'التوسّع؟': 'expand', 'Expansion?': 'expand', 'المبيعات؟': 'sales', 'Sales?': 'sales', 'التكاليف؟': 'costs', 'Costs?': 'costs',
  'فرص جديدة؟': 'sourcing', 'New deals?': 'sourcing', 'قراءة الفرصة؟': 'read', 'Reading a deal?': 'read',
  'أداء الاستثمار؟': 'under', 'Underperformance?': 'under', 'التقارير؟': 'report', 'Reporting?': 'report',
}
export const chipPain = (chip: string) => CHIP_TO_PAIN[chip]

function QuestionField({ q, value, other, onChange, onOther, lang }: {
  q: Question; value: Answers[string]; other: string; lang: Lang
  onChange: (v: Answers[string]) => void; onOther: (v: string) => void
}) {
  const c = useContent().onboarding
  if (q.kind === 'text') {
    return (
      <label className="ob-q">
        <span className="ob-label">{q.label}{q.optional && <em> · {lang === 'ar' ? 'اختياري' : 'optional'}</em>}</span>
        <textarea rows={2} value={(value as string) ?? ''} placeholder={q.placeholder} onChange={(e) => onChange(e.target.value)} />
      </label>
    )
  }
  if (q.kind === 'scale') {
    const v = typeof value === 'number' ? value : 3
    return (
      <div className="ob-q">
        <span className="ob-label" id={`l-${q.id}`}>{q.label}</span>
        <div className="ob-scale" role="radiogroup" aria-labelledby={`l-${q.id}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={v === n} className={`ob-dot${v >= n ? ' is-on' : ''}`} onClick={() => onChange(n)}>
              <span dir="ltr">{n}</span>
            </button>
          ))}
        </div>
        <div className="ob-scale-ends"><span>{c.scaleLow}</span><span>{c.scaleHigh}</span></div>
      </div>
    )
  }
  const multi = q.kind === 'multi'
  const sel = multi ? ((value as string[]) ?? []) : [value as string].filter(Boolean)
  return (
    <fieldset className="ob-q">
      <legend className="ob-label">{q.label}{q.optional && <em> · {lang === 'ar' ? 'اختياري' : 'optional'}</em>}</legend>
      <div className="ob-chips">
        {q.options?.map((op) => {
          const on = sel.includes(op.id)
          return (
            <button
              key={op.id}
              type="button"
              aria-pressed={on}
              className={`chip${on ? ' is-on' : ''}`}
              onClick={() => {
                if (multi) onChange(on ? sel.filter((x) => x !== op.id) : [...sel, op.id])
                else onChange(on ? undefined : op.id)
              }}
            >
              {on && <GemMark className="chip-gem" />}{op.label}
            </button>
          )
        })}
      </div>
      {multi && q.id === 'pains' && (
        <input className="ob-other" value={other} placeholder={c.otherPlaceholder} onChange={(e) => onOther(e.target.value)} />
      )}
    </fieldset>
  )
}

export function Onboarding() {
  const c = useContent()
  const ob = c.onboarding
  const lang = useStore((s) => s.lang)
  const preset = useStore((s) => s.preset)
  const [d, setD] = useState<Draft>(load)
  // -1 = persona screen, 0..n-1 = persona steps, n = contact, n+1 = summary
  const [step, setStep] = useState(-1)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState<Sent>({ state: 'idle' })
  const [trap, setTrap] = useState('')
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Once the brief has been delivered, keep no copy of the visitor's details on this device.
    if (sent.state === 'sent') return
    try {
      localStorage.setItem(KEY, JSON.stringify(d))
    } catch {
      /* storage unavailable */
    }
  }, [d, sent.state])

  // Entry from anywhere on the page (problem chips, who-we-help cards, support CTA).
  useEffect(() => {
    if (!preset) return
    setD((prev) => ({
      ...prev,
      persona: preset.persona,
      support: preset.support ?? prev.support,
      answers: preset.pains?.length
        ? { ...prev.answers, pains: Array.from(new Set([...(((prev.persona === preset.persona && prev.answers.pains) as string[]) || []), ...preset.pains])) }
        : prev.persona === preset.persona ? prev.answers : {},
    }))
    setStep(0)
    setError('')
    requestAnimationFrame(() => scrollToHash('#start'))
  }, [preset])

  const steps = useMemo(() => (d.persona ? stepsFor(d.persona, lang) : []), [d.persona, lang])
  const n = steps.length
  const total = n + 2
  const pos = step + 2 // 1-based for display

  // Move focus to the new screen's heading for keyboard and screen-reader users.
  useEffect(() => {
    if (step === -1 && !d.persona) return
    card.current?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true })
  }, [step])

  const setAnswer = (id: string, v: Answers[string]) => setD((p) => ({ ...p, answers: { ...p.answers, [id]: v } }))

  const validStep = (i: number) => steps[i].questions.every((q) => {
    if (q.optional || q.kind === 'text' || q.kind === 'scale') return true
    const v = d.answers[q.id]
    if (q.id === 'pains' && d.other.pains?.trim()) return true
    return Array.isArray(v) ? v.length > 0 : !!v
  })

  const next = () => {
    if (step >= 0 && step < n && !validStep(step)) return setError(ob.required)
    if (step === n) {
      const w = d.who
      if (!w.name.trim() || !(w.phone.trim() || w.email.trim())) return setError(ob.contact.needOne)
      if (!d.consent) return setError(ob.contact.needConsent)
      submit()
    }
    setError('')
    setStep((s) => Math.min(s + 1, n + 1))
    scrollToHash('#start')
  }
  const back = () => { setError(''); setStep((s) => Math.max(-1, s - 1)) }

  const rec = d.persona ? recommend(d.persona, d.answers) : null
  const lead = leadRead(d.answers)
  const L = (qid: string, v: unknown) => (d.persona ? optionLabel(d.persona, qid, String(v), lang) : String(v))
  const list = (qid: string) => {
    const v = d.answers[qid]
    const arr = (Array.isArray(v) ? v : v ? [v] : []).map((x) => L(qid, x))
    if (qid === 'pains' && d.other.pains?.trim()) arr.push(d.other.pains.trim())
    return arr
  }
  const urg = typeof d.answers.urgency === 'number' ? d.answers.urgency : 3
  const urgLabel = ob.summary.urgencyLevels[urg <= 2 ? 0 : urg <= 3 ? 1 : 2]

  const brief = () => {
    if (!d.persona) return ''
    const lines: string[] = []
    lines.push(`KON Unlimited · ${lang === 'ar' ? 'ملخص طلب' : 'Onboarding brief'}`)
    lines.push('—')
    lines.push(`${ob.contact.name}: ${d.who.name}`)
    if (d.who.company) lines.push(`${ob.contact.company}: ${d.who.company}`)
    if (d.who.phone) lines.push(`${ob.contact.phone}: ${d.who.phone}`)
    if (d.who.email) lines.push(`${ob.contact.email}: ${d.who.email}`)
    if (d.who.city) lines.push(`${ob.contact.city}: ${d.who.city}`)
    lines.push(`${ob.contact.prefer} ${ob.contact.preferOpts.find((x) => x.id === d.who.prefer)?.label ?? ''}`)
    lines.push('—')
    lines.push(`${ob.summary.persona}: ${ob.personas[d.persona].label}${d.support ? ` · ${ob.summary.supportBadge}` : ''}`)
    steps.forEach((s) => s.questions.forEach((q) => {
      const v = d.answers[q.id]
      if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) return
      const txt = q.kind === 'text' ? String(v) : q.kind === 'scale' ? `${v}/5` : list(q.id).join('، ')
      lines.push(`${q.label}: ${txt}`)
    }))
    if (rec) {
      lines.push('—')
      lines.push(`${ob.summary.primary}: ${serviceNames[rec.primary][lang]}`)
      if (rec.also.length) lines.push(`${ob.summary.also}: ${rec.also.map((s) => serviceNames[s][lang]).join('، ')}`)
      lines.push(`Lead fit (internal): ${lead.fit} · urgency ${lead.urgency}/5`)
    }
    return lines.join('\n')
  }

  const submit = async () => {
    if (!d.persona || !rec || sent.state === 'sending' || sent.state === 'sent') return
    setSent({ state: 'sending' })
    try {
      const r = await post('/api/lead', {
        who: d.who, persona: d.persona, support: d.support, lang, report: brief(),
        fit: lead.fit, urgency: lead.urgency, primary: serviceNames[rec.primary].en,
        consent: d.consent, consentVersion: CONSENT_VERSION, website: trap,
      })
      if (!r.ok || !r.delivered) throw new Error('not delivered')
      setSent({ state: 'sent', ref: r.ref, token: r.token })
      try { localStorage.removeItem(KEY) } catch { /* storage unavailable */ }
    } catch {
      setSent({ state: 'failed' })
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard refused (some app views): open the raw text and select it instead.
      const det = card.current?.querySelector('details.ob-raw') as HTMLDetailsElement | null
      if (det) {
        det.open = true
        det.querySelector('textarea')?.select()
      }
    }
  }
  const pickPersona = (p: Persona) => {
    setD((prev) => ({ ...prev, persona: p, answers: prev.persona === p ? prev.answers : {} }))
    setError('')
    setStep(0)
  }

  return (
    <div className="ob" ref={card}>
      <div className="ob-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${step < 0 ? 0.04 : Math.min(1, pos / total)})` }} />
      </div>
      {step >= 0 && step <= n && <p className="ob-step" aria-live="polite">{ob.stepOf(pos, total)}</p>}

      {step === -1 && (
        <div className="ob-screen" key="persona">
          <h3 tabIndex={-1}>{ob.personaQ}</h3>
          <div className="ob-personas">
            {(['founder', 'business', 'investor'] as Persona[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`persona${d.persona === p ? ' is-on' : ''}`}
                onClick={() => pickPersona(p)}
                onPointerEnter={() => (motion.glow = 1)}
                onPointerLeave={() => (motion.glow = 0)}
              >
                <GemMark className="persona-gem" />
                <b>{ob.personas[p].label}</b>
                <span>{ob.personas[p].sub}</span>
              </button>
            ))}
          </div>
          <label className="ob-toggle">
            <input type="checkbox" checked={d.support} onChange={(e) => setD((p) => ({ ...p, support: e.target.checked }))} />
            <span>{ob.supportToggle}</span>
          </label>
        </div>
      )}

      {step >= 0 && step < n && (
        <div className="ob-screen" key={`s${step}`}>
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

      {step === n && d.persona && (
        <div className="ob-screen" key="contact">
          <h3 tabIndex={-1}>{ob.contact.title}</h3>
          <p className="ob-lede">{ob.contact.lede}</p>
          <div className="ob-grid">
            {(['name', 'company', 'phone', 'email', 'city'] as const).map((f) => (
              <label key={f} className="ob-field">
                <span>{ob.contact[f]}</span>
                <input
                  value={d.who[f]}
                  type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'}
                  inputMode={f === 'phone' ? 'tel' : undefined}
                  dir={f === 'email' || f === 'phone' ? 'ltr' : undefined}
                  autoComplete={f === 'name' ? 'name' : f === 'email' ? 'email' : f === 'phone' ? 'tel' : f === 'company' ? 'organization' : 'address-level2'}
                  onChange={(e) => setD((p) => ({ ...p, who: { ...p.who, [f]: e.target.value } }))}
                />
              </label>
            ))}
          </div>
          <input className="ob-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} />
          <fieldset className="ob-q">
            <legend className="ob-label">{ob.contact.prefer}</legend>
            <div className="ob-chips">
              {ob.contact.preferOpts.map((op) => (
                <button key={op.id} type="button" aria-pressed={d.who.prefer === op.id} className={`chip${d.who.prefer === op.id ? ' is-on' : ''}`} onClick={() => setD((p) => ({ ...p, who: { ...p.who, prefer: op.id } }))}>{op.label}</button>
              ))}
            </div>
          </fieldset>
          <label className="ob-toggle">
            <input type="checkbox" checked={d.consent} onChange={(e) => setD((p) => ({ ...p, consent: e.target.checked }))} />
            <span>{ob.contact.consent} <a href={`/privacy.html${lang === 'en' ? '#en' : ''}`} target="_blank" rel="noreferrer">{ob.contact.consentLink}</a></span>
          </label>
        </div>
      )}

      {step === n + 1 && d.persona && rec && (
        <div className="ob-screen ob-summary" key="summary">
          <h3 tabIndex={-1}>{ob.summary.title}</h3>
          <p className="ob-lede">{ob.summary.lede}</p>
          {d.support && <p className="ob-badge">{ob.summary.supportBadge}</p>}
          <dl className="ob-overview">
            <div><dt>{ob.summary.persona}</dt><dd>{ob.personas[d.persona].label}</dd></div>
            {d.answers.stage && <div><dt>{ob.summary.stage}</dt><dd>{L('stage', d.answers.stage)}</dd></div>}
            {list('pains').length > 0 && <div className="wide"><dt>{ob.summary.pains}</dt><dd className="tags">{list('pains').map((x) => <span key={x}>{x}</span>)}</dd></div>}
            {list('goals').length > 0 && <div className="wide"><dt>{ob.summary.goals}</dt><dd className="tags">{list('goals').map((x) => <span key={x}>{x}</span>)}</dd></div>}
            <div className="wide"><dt>{ob.summary.urgency}</dt><dd><span className="urg" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= urg ? 'on' : ''} />)}</span>{urgLabel}</dd></div>
          </dl>
          <div className="ob-rec">
            <p className="ob-rec-k">{ob.summary.primary}</p>
            <p className="ob-rec-v">{serviceNames[rec.primary][lang]}</p>
            {rec.also.length > 0 && (
              <>
                <p className="ob-rec-k">{ob.summary.also}</p>
                <p className="tags">{rec.also.map((s) => <span key={s}>{serviceNames[s][lang]}</span>)}</p>
              </>
            )}
          </div>
          <div className="ob-next">
            <p className="ob-rec-k">{ob.summary.next}</p>
            <p>{ob.summary.nextBody}</p>
          </div>
          {sent.state !== 'idle' && (
            <p className={sent.state === 'failed' ? 'ob-note' : 'ob-sent'} role="status">{ob.summary[sent.state]}</p>
          )}
          {d.persona && <Rating key={sent.ref} sent={sent} persona={d.persona} primary={serviceNames[rec.primary].en} />}
          <div className="ob-actions">
            {inbox.whatsapp && (
              <a className={`btn ${sent.state === 'sent' ? 'btn-ghost' : 'btn-primary'}`} target="_blank" rel="noreferrer" href={`https://wa.me/${inbox.whatsapp}?text=${encodeURIComponent(brief())}`}><span>{ob.summary.sendWhatsapp}</span></a>
            )}
            {inbox.email && (
              <a className={`btn ${sent.state === 'sent' ? 'btn-ghost' : 'btn-primary'}`} href={`mailto:${inbox.email}?subject=${encodeURIComponent('KON · ' + d.who.name)}&body=${encodeURIComponent(brief())}`}><span>{ob.summary.sendEmail}</span></a>
            )}
            <button type="button" className={`btn ${inbox.whatsapp || inbox.email ? 'btn-ghost' : 'btn-primary'}`} onClick={copy}><span>{copied ? ob.summary.copied : ob.summary.copy}</span></button>
          </div>
          {!inbox.whatsapp && !inbox.email && <p className="ob-note" role="note">{ob.summary.notConnected}</p>}
          <details className="ob-raw">
            <summary>{ob.summary.raw}</summary>
            <textarea readOnly rows={10} value={brief()} onFocus={(e) => e.currentTarget.select()} />
          </details>
          <button type="button" className="ob-link" onClick={() => setStep(0)}>{ob.summary.edit}</button>
        </div>
      )}

      {error && <p className="ob-error" role="alert">{error}</p>}

      {step >= 0 && step <= n && (
        <div className="ob-nav">
          <button type="button" className="ob-back" onClick={back}>{ob.back}</button>
          <button type="button" className="btn btn-primary" onClick={next}><span>{step === n ? ob.finish : ob.next}</span></button>
        </div>
      )}
    </div>
  )
}
