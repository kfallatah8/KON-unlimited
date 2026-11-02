// KON Talent: a section that invites people whose ability is bigger than their paperwork, and
// companies looking for them. Two short flows share the onboarding UI; a person gets a first
// "talent read" (archetypes + where they add value), a company gets a summary of its request.
// Everything stays client-side; sending works like the main onboarding (WhatsApp / email / copy).
import { useEffect, useMemo, useRef, useState } from 'react'
import { contact as inbox } from '../content/site'
import { archetypes, dims, talentOption, talentRead, talentSteps, type TalentSide } from '../content/talent'
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

function TalentFlow() {
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

      {step === n + 1 && d.side === 'talent' && read && (
        <div className="ob-screen ob-summary" key="read">
          <h3 tabIndex={-1}>{t.read.title}</h3>
          <p className="ob-lede">{t.read.lede}</p>
          <div className="ob-rec talent-read">
            <p className="ob-rec-k">{t.read.you}</p>
            {read.top.map((k) => (
              <div key={k} className="talent-arch">
                <p className="ob-rec-v">{archetypes[k].name[lang]}</p>
                <p className="talent-where">{archetypes[k].where[lang]}</p>
              </div>
            ))}
            {read.dims.length > 0 && (
              <>
                <p className="ob-rec-k">{t.read.where}</p>
                <p className="tags">{read.dims.map((x) => <span key={x}>{dims[x][lang]}</span>)}</p>
              </>
            )}
          </div>
          <dl className="ob-overview">
            {list('strengths').length > 0 && <div className="wide"><dt>{t.read.strengths}</dt><dd className="tags">{list('strengths').map((x) => <span key={x}>{x}</span>)}</dd></div>}
            {list('intent').length > 0 && <div className="wide"><dt>{t.read.want}</dt><dd className="tags">{list('intent').map((x) => <span key={x}>{x}</span>)}</dd></div>}
          </dl>
          <div className="ob-next">
            <p className="ob-rec-k">{t.read.next}</p>
            <p>{t.read.nextBody}</p>
            <p className="talent-promise">{t.read.promise}</p>
          </div>
          <Actions brief={brief} subject={subject} copy={copy} copied={copied} />
          <button type="button" className="ob-link" onClick={() => go(0)}>{t.edit}</button>
        </div>
      )}

      {step === n + 1 && d.side === 'company' && (
        <div className="ob-screen ob-summary" key="brief">
          <h3 tabIndex={-1}>{t.brief.title}</h3>
          <p className="ob-lede">{t.brief.lede}</p>
          <dl className="ob-overview">
            {list('areas').length > 0 && <div className="wide"><dt>{t.brief.areas}</dt><dd className="tags">{list('areas').map((x) => <span key={x}>{x}</span>)}</dd></div>}
            {d.answers.type && <div><dt>{t.brief.type}</dt><dd>{L('type', d.answers.type)}</dd></div>}
            {list('traits').length > 0 && <div><dt>{t.brief.traits}</dt><dd className="tags">{list('traits').map((x) => <span key={x}>{x}</span>)}</dd></div>}
            {list('pains').length > 0 && <div className="wide"><dt>{t.brief.pains}</dt><dd className="tags">{list('pains').map((x) => <span key={x}>{x}</span>)}</dd></div>}
          </dl>
          {(d.answers.open === 'yes' || pains.includes('unclear')) && (
            <div className="ob-rec">
              {d.answers.open === 'yes' && <p className="talent-where">{t.brief.openYes}</p>}
              {pains.includes('unclear') && <p className="talent-where">{t.brief.unclear}</p>}
            </div>
          )}
          <div className="ob-next">
            <p className="ob-rec-k">{t.brief.next}</p>
            <p>{t.brief.nextBody}</p>
          </div>
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

export function Talent() {
  const t = useContent().talent
  return (
    <section id="talent" className="band talent" aria-labelledby="talent-title">
      <div className="wrap">
        <div className="narrow center sec-head">
          <p className="eyebrow centered" data-reveal>{t.eyebrow}</p>
          <SplitReveal as="h2" id="talent-title" className="display" text={t.title} />
          <p className="body-lg" data-reveal><Rich text={t.lede} /></p>
        </div>
        <ul className="talent-wins">
          {t.wins.map((w, i) => (
            <li key={w.k} className="talent-win glass" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="talent-k"><GemMark className="li-gem" />{w.k}</span>
              <h3>{w.title}</h3>
              <p><Rich text={w.body} /></p>
            </li>
          ))}
        </ul>
        <div className="talent-flow-wrap" data-reveal>
          <TalentFlow />
        </div>
      </div>
    </section>
  )
}
