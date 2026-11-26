// Personalised onboarding: persona → persona questions (one screen at a time) → contact → a
// situation overview with recommended services. Runs fully client-side; where the brief goes is
// set in content/site.ts → contact, and the UI says plainly when nothing is connected yet.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Hl } from './SplitReveal'
import { BOOKING_URL, contact as inbox, type Lang, type Persona, type Question } from '../content/site'
import { leadRead, optionLabel, recommend, serviceNames, stepsFor, type Answers } from '../content/onboarding'
import { useContent } from '../content/useContent'
import { motion, useStore } from '../state/store'
import { lenis } from './SmoothScroll'
import { GemMark, Icon } from './Icons'
import { isPostHogConfigured, posthog } from '../lib/posthog'

interface Draft {
  persona: Persona | null
  support: boolean
  answers: Answers
  other: Record<string, string>
  who: { name: string; company: string; phone: string; email: string; city: string; prefer: string }
}
const EMPTY: Draft = { persona: null, support: false, answers: {}, other: {}, who: { name: '', company: '', phone: '', email: '', city: '', prefer: 'whatsapp' } }
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

export function QuestionField({ q, value, other, onChange, onOther, lang }: {
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
      <legend className="ob-label">
        {q.label}
        {q.optional && <em> · {lang === 'ar' ? 'اختياري' : 'optional'}</em>}
        {multi && q.max && <em> · {lang === 'ar' ? `${q.max} على الأكثر` : `up to ${q.max}`}</em>}
      </legend>
      <div className="ob-chips">
        {q.options?.map((op) => {
          const on = sel.includes(op.id)
          const full = multi && !!q.max && !on && sel.length >= q.max
          return (
            <button
              key={op.id}
              type="button"
              aria-pressed={on}
              aria-disabled={full || undefined}
              className={`chip${on ? ' is-on' : ''}${full ? ' is-full' : ''}`}
              onClick={() => {
                if (full) return
                if (multi) onChange(on ? sel.filter((x) => x !== op.id) : [...sel, op.id])
                else onChange(on ? undefined : op.id)
              }}
            >
              {op.label}
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

function keepInView(force: boolean) {
  const el = document.querySelector<HTMLElement>('.ob')
  if (!el) return
  const top = el.getBoundingClientRect().top
  const head = window.innerWidth < 700 ? 72 : 96
  // Never move the page while the card's top is on screen: only bring it back when it has
  // scrolled out above the header (a long step, then Next).
  if (!force && top >= head - 4) return
  const y = window.scrollY + top - head
  if (lenis) lenis.scrollTo(y, { duration: 0.7 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
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
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(d))
    } catch {
      /* storage unavailable */
    }
  }, [d])

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
    requestAnimationFrame(() => keepInView(true))
  }, [preset])

  const steps = useMemo(() => (d.persona ? stepsFor(d.persona, lang) : []), [d.persona, lang])
  const n = steps.length
  const total = n + 2
  const pos = step + 2 // 1-based for display

  // Keep the form where the visitor is: only scroll when the card's top has left the screen,
  // and then bring just the card (not the whole section) back under the header.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (step === -1 && !d.persona) return
    card.current?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true })
    requestAnimationFrame(() => keepInView(false))
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
    }
    setError('')
    if (step === n && d.persona && isPostHogConfigured) {
      posthog.capture('onboarding_completed', {
        persona: d.persona,
        support_requested: d.support,
        lead_fit: lead.fit,
        lead_urgency: lead.urgency,
        recommended_service: rec?.primary ?? null,
        also_services: rec?.also ?? [],
        pains: (d.answers.pains as string[] | undefined) ?? [],
        prefers: d.who.prefer,
        has_company: !!d.who.company.trim(),
        has_email: !!d.who.email.trim(),
        has_phone: !!d.who.phone.trim(),
      })
      posthog.setPersonProperties({ persona: d.persona, lead_fit: lead.fit, lead_urgency: lead.urgency, recommended_service: rec?.primary ?? null, onboarding_completed: true })
    }
    setStep((s) => Math.min(s + 1, n + 1))
  }
  const back = () => { setError(''); setStep((s) => Math.max(-1, s - 1)) }

  const rec = d.persona ? recommend(d.persona, d.answers) : null
  const lead = leadRead(d.answers)

  // Funnel: which onboarding screen each visitor reaches (persona, each question, contact, summary).
  const firstStep = useRef(true)
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; if (step === -1) return }
    if (!isPostHogConfigured) return
    const name = step === -1 ? 'persona' : step < n ? (steps[step]?.questions?.map((q) => q.id).join('+') || `q${step}`) : step === n ? 'contact' : 'summary'
    posthog.capture('onboarding_step_viewed', { step_index: step, step_name: name, total_steps: n, persona: d.persona })
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps
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

  // Calendly: dark theme where the plan allows it, plus name, email and a short brief prefilled
  // into the booking's first question, so the answers travel with the appointment.
  const calSrc = () => {
    const short = [
      d.persona ? ob.personas[d.persona].label : '',
      d.who.company,
      list('pains').join('، '),
      rec ? `${ob.summary.primary} ${serviceNames[rec.primary][lang]}` : '',
      d.who.phone,
      d.support ? ob.summary.supportBadge : '',
    ].filter(Boolean).join(' · ').slice(0, 600)
    const q = new URLSearchParams({
      embed_type: 'Inline', embed_domain: location.hostname || 'kon', hide_gdpr_banner: '1', hide_landing_page_details: '1', hide_event_type_details: '1',
      background_color: '03191c', text_color: 'eaf4f1', primary_color: '5fe3d2', locale: lang,
      name: d.who.name, email: d.who.email, a1: short,
    })
    return `${BOOKING_URL}${BOOKING_URL.includes('?') ? '&' : '?'}${q.toString()}`
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
    if (isPostHogConfigured) posthog.capture('onboarding_persona_selected', { persona: p })
    setD((prev) => ({ ...prev, persona: p, answers: prev.persona === p ? prev.answers : {} }))
    setError('')
    setStep(0)
  }

  return (
    <div className="ob" ref={card}>
      <div className="ob-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${step < 0 ? 0.04 : Math.min(1, pos / total)})` }} />
      </div>
      <ol className="ob-rail" aria-label={ob.stepOf(pos, total)}>
        {ob.stages.map((label, i) => {
          const at = step < 0 ? 0 : step < n ? 1 : step === n ? 2 : 3
          return <li key={label} className={i < at ? 'is-done' : i === at ? 'is-now' : ''} aria-current={i === at ? 'step' : undefined}><i dir="ltr">{i + 1}</i><span>{label}</span></li>
        })}
      </ol>

      {step === -1 && (
        <div className="ob-screen" key="persona">
          <h3 tabIndex={-1}><Hl text={ob.personaQ} /></h3>
          <p className="ob-lede">{ob.intro}</p>
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
                <Icon id={p === 'founder' ? 'seed' : p === 'investor' ? 'compass' : 'company'} className="icon persona-gem" />
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
          <h3 tabIndex={-1}><Hl text={steps[step].title} /></h3>
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
          <h3 tabIndex={-1}><Hl text={ob.contact.title} /></h3>
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
          <fieldset className="ob-q">
            <legend className="ob-label">{ob.contact.prefer}</legend>
            <div className="ob-chips">
              {ob.contact.preferOpts.map((op) => (
                <button key={op.id} type="button" aria-pressed={d.who.prefer === op.id} className={`chip${d.who.prefer === op.id ? ' is-on' : ''}`} onClick={() => setD((p) => ({ ...p, who: { ...p.who, prefer: op.id } }))}>{op.label}</button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === n + 1 && d.persona && rec && (
        <div className="ob-screen ob-final" key="book">
          <h3 tabIndex={-1}><Hl text={BOOKING_URL ? ob.book.title : ob.summary.title} /></h3>
          <p className="ob-lede">{ob.book.lede}</p>
          <div className="ob-rec-line">
            <span className="ob-rec-k">{ob.summary.primary}</span>
            <b>{serviceNames[rec.primary][lang]}</b>
            {d.support && <em className="ob-badge">{ob.summary.supportBadge}</em>}
          </div>
          {BOOKING_URL && <CalFrame src={calSrc()} lang={lang} copy={ob.book} />}
          <details className="ob-more">
            <summary>{ob.book.details}</summary>
            <dl className="ob-overview">
              <div><dt>{ob.summary.persona}</dt><dd>{ob.personas[d.persona].label}</dd></div>
              {d.answers.stage && <div><dt>{ob.summary.stage}</dt><dd>{L('stage', d.answers.stage)}</dd></div>}
              {list('pains').length > 0 && <div className="wide"><dt>{ob.summary.pains}</dt><dd className="tags">{list('pains').map((x) => <span key={x}>{x}</span>)}</dd></div>}
              {list('goals').length > 0 && <div className="wide"><dt>{ob.summary.goals}</dt><dd className="tags">{list('goals').map((x) => <span key={x}>{x}</span>)}</dd></div>}
              <div className="wide"><dt>{ob.summary.urgency}</dt><dd><span className="urg" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= urg ? 'on' : ''} />)}</span>{urgLabel}</dd></div>
              {rec.also.length > 0 && <div className="wide"><dt>{ob.summary.also}</dt><dd className="tags">{rec.also.map((x) => <span key={x}>{serviceNames[x][lang]}</span>)}</dd></div>}
            </dl>
          </details>
          <div className="ob-alt">
            <span>{ob.book.alt}</span>
            {inbox.whatsapp && <a className="ob-link" target="_blank" rel="noreferrer" href={`https://wa.me/${inbox.whatsapp}?text=${encodeURIComponent(brief())}`}>{ob.summary.sendWhatsapp}</a>}
            {inbox.email && <a className="ob-link" href={`mailto:${inbox.email}?subject=${encodeURIComponent('KON · ' + d.who.name)}&body=${encodeURIComponent(brief())}`}>{ob.summary.sendEmail}</a>}
            <button type="button" className="ob-link" onClick={copy}>{copied ? ob.summary.copied : ob.summary.copy}</button>
            <button type="button" className="ob-link" onClick={() => setStep(0)}>{ob.summary.edit}</button>
          </div>
          <details className="ob-raw">
            <summary>{ob.summary.raw}</summary>
            <textarea readOnly rows={10} value={brief()} onFocus={(e) => e.currentTarget.select()} />
          </details>
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

function CalFrame({ src, lang, copy }: { src: string; lang: Lang; copy: { loading: string; open: string } }) {
  const u = new URL(src)
  ;['embed_type', 'embed_domain', 'hide_gdpr_banner', 'background_color', 'text_color', 'primary_color'].forEach((k) => u.searchParams.delete(k))
  const full = u.toString()
  const [ready, setReady] = useState(false)
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 7000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="cal">
      <div className={`cal-frame${ready ? ' is-ready' : ''}`} data-lenis-prevent>
        <div className="cal-skel" aria-hidden={ready}>
          <span className="cal-spin" />
          <p>{copy.loading}</p>
          <div className="cal-ghost">{Array.from({ length: 35 }, (_, i) => <i key={i} />)}</div>
        </div>
        <iframe src={src} title={lang === 'ar' ? 'اختر موعد الجلسة' : 'Pick your session time'} onLoad={() => setReady(true)} />
      </div>
      <a className={`ob-link cal-open${slow && !ready ? ' is-loud' : ''}`} href={full} target="_blank" rel="noreferrer">{copy.open} ↗</a>
    </div>
  )
}
