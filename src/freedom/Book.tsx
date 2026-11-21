// One short path from "this is me" to a booked session: who → what's on your mind → contact →
// Calendly, prefilled with a written brief so the session starts already informed.
import { useEffect, useMemo, useRef, useState } from 'react'
import { BOOKING_URL, contact, type Persona } from '../content/site'
import { useContent } from '../content/useContent'
import { useStore } from '../state/store'
import { fcopy } from './copy'

interface Draft { persona: Persona | null; pains: string[]; note: string; name: string; phone: string; email: string; support: boolean }
const EMPTY: Draft = { persona: null, pains: [], note: '', name: '', phone: '', email: '', support: false }
const KEY = 'kon-freedom-book'
const load = (): Draft => { try { const r = localStorage.getItem(KEY); if (r) return { ...EMPTY, ...JSON.parse(r) } } catch { /* storage unavailable */ } return EMPTY }

export function Book() {
  const lang = useStore((s) => s.lang)
  const preset = useStore((s) => s.preset)
  const c = useContent()
  const t = fcopy[lang].book
  const paths = c.problem.paths
  const [d, setD] = useState<Draft>(load)
  const [step, setStep] = useState(0)
  const [err, setErr] = useState('')
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* storage unavailable */ } }, [d])

  // A chip or persona picked anywhere on the page lands here, already chosen.
  useEffect(() => {
    if (!preset) return
    setD((o) => ({ ...o, persona: preset.persona, pains: preset.pains ?? o.pains, support: !!preset.support || o.support }))
    setStep(preset.pains && preset.pains.length ? 2 : 1)
  }, [preset])

  const path = paths.find((p) => p.persona === d.persona)
  const set = (p: Partial<Draft>) => setD((o) => ({ ...o, ...p }))
  const go = (n: number) => {
    setErr('')
    setStep(n)
    const el = box.current
    if (el && el.getBoundingClientRect().top < 70) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const brief = useMemo(() => {
    const lines = [
      `${t.briefWho}: ${path?.label ?? ''}`,
      d.pains.length ? `${t.briefPains}: ${d.pains.join(lang === 'ar' ? '، ' : ', ')}` : '',
      d.note.trim() ? `${t.briefNote}: ${d.note.trim()}` : '',
      d.phone.trim() ? `${t.briefPhone}: ${d.phone.trim()}` : '',
      d.support ? t.briefSupport : '',
    ]
    return lines.filter(Boolean).join('\n')
  }, [d, path, t, lang])

  const calUrl = useMemo(() => {
    if (!BOOKING_URL) return ''
    const u = new URL(BOOKING_URL)
    if (d.name.trim()) u.searchParams.set('name', d.name.trim())
    if (d.email.trim()) u.searchParams.set('email', d.email.trim())
    u.searchParams.set('a1', brief)
    u.searchParams.set('hide_gdpr_banner', '1')
    return u.toString()
  }, [d.name, d.email, brief])
  const embedUrl = useMemo(() => {
    if (!calUrl) return ''
    const u = new URL(calUrl)
    u.searchParams.set('embed_domain', location.hostname || 'kon-unlimited.com')
    u.searchParams.set('embed_type', 'Inline')
    return u.toString()
  }, [calUrl])
  const waUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`${d.name.trim()}\n${brief}`)}`

  const toCal = () => {
    if (!d.name.trim() || (!d.phone.trim() && !d.email.trim())) { setErr(t.needOne); return }
    go(3)
  }

  return (
    <div className="bk" ref={box} id="book">
      <ol className="bk-rail" aria-label={t.steps.join(' · ')}>
        {t.steps.map((s, i) => (
          <li key={s} className={i === step ? 'is-now' : i < step ? 'is-done' : ''}>
            <button type="button" disabled={i > step} onClick={() => go(i)}><b>{i + 1}</b><span>{s}</span></button>
          </li>
        ))}
      </ol>

      <div className="bk-stage" key={step}>
        {step === 0 && (
          <fieldset>
            <legend className="bk-q">{t.who}</legend>
            <div className="bk-personas">
              {paths.map((p) => (
                <button key={p.persona} type="button" aria-pressed={d.persona === p.persona} className="bk-persona"
                  onClick={() => { set({ persona: p.persona, pains: d.persona === p.persona ? d.pains : [] }); go(1) }}>
                  <span>{p.label}</span>
                  <i aria-hidden="true">{lang === 'ar' ? '←' : '→'}</i>
                </button>
              ))}
            </div>
            <label className="bk-check">
              <input type="checkbox" checked={d.support} onChange={(e) => set({ support: e.target.checked })} />
              <span>{t.support}</span>
            </label>
          </fieldset>
        )}

        {step === 1 && path && (
          <fieldset>
            <legend className="bk-q">{t.pains}</legend>
            <p className="bk-hint">{t.painsHint}</p>
            <div className="bk-chips">
              {path.q.map((q) => {
                const on = d.pains.includes(q)
                return (
                  <button key={q} type="button" className="bk-chip" aria-pressed={on}
                    onClick={() => set({ pains: on ? d.pains.filter((x) => x !== q) : [...d.pains, q] })}>{q}</button>
                )
              })}
            </div>
            <textarea className="bk-note" rows={2} placeholder={t.note} value={d.note} onChange={(e) => set({ note: e.target.value })} />
            <div className="bk-nav">
              <button type="button" className="fd-btn" onClick={() => go(2)} disabled={!d.pains.length && !d.note.trim()}>{t.next}</button>
              <button type="button" className="fd-link" onClick={() => go(0)}>{t.back}</button>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="bk-q">{t.contact}</legend>
            <p className="bk-hint">{t.contactHint}</p>
            <div className="bk-fields">
              <label><span>{t.name}</span><input autoComplete="name" value={d.name} onChange={(e) => set({ name: e.target.value })} /></label>
              <label><span>{t.phone}</span><input type="tel" dir="ltr" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set({ phone: e.target.value })} /></label>
              <label><span>{t.email}</span><input type="email" dir="ltr" autoComplete="email" value={d.email} onChange={(e) => set({ email: e.target.value })} /></label>
            </div>
            {err && <p className="bk-err" role="alert">{err}</p>}
            <div className="bk-nav">
              <button type="button" className="fd-btn" onClick={toCal}>{t.show}</button>
              <button type="button" className="fd-link" onClick={() => go(1)}>{t.back}</button>
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <div>
            <p className="bk-q">{t.cal}</p>
            <p className="bk-hint">{t.calLede}</p>
            {embedUrl && <iframe className="bk-cal" src={embedUrl} title={t.cal} loading="lazy" />}
            <div className="bk-after">
              {calUrl && <a className="fd-link" href={calUrl} target="_blank" rel="noopener">{t.open} ↗</a>}
              <a className="fd-link" href={waUrl} target="_blank" rel="noopener">{t.wa}</a>
              <button type="button" className="fd-link" onClick={() => go(0)}>{t.edit}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
