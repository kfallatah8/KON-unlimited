import { lazy, Suspense, useEffect, useMemo, useRef, useState, type PointerEvent as RPE, type ReactElement } from 'react'
import { CloudSky } from '../components/CloudSky'
import { KonGlass } from '../components/KonGlass'
import { COMPANY, currentSlug, findPerson } from './people'
import { contactPhoto, downloadVcard } from './vcard'
import { askMotion, needsMotionPermission, recentre, startTilt } from './tilt'
import { ripple } from './CardGems'
import { qrSvg } from './qr'
import { track } from './track'

const CardGems = lazy(() => import('./CardGems'))
const PREVIEW = import.meta.env.MODE === 'card'

type Lang = 'ar' | 'en'
const T = {
  ar: {
    flip: 'اضغط البطاقة لتقلبها', flipBack: 'اضغط لتعود', scan: 'امسح الرمز لحفظ البطاقة',
    save: 'احفظ جهة الاتصال', whatsapp: 'واتساب', call: 'اتصال', email: 'البريد', book: 'احجز لقاء',
    share: 'شارك البطاقة', site: 'الموقع', apple: 'أضف إلى Apple Wallet', google: 'أضف إلى Google Wallet', addTo: 'أضف إلى',
    intro: 'عرّفني بنفسك', introSub: 'اترك اسمك، ويصلني تعريفك مباشرة على واتساب',
    yourName: 'اسمك', yourCo: 'جهتك أو شركتك', yourPhone: 'رقمك (اختياري)', send: 'أرسل عبر واتساب', sendMail: 'أو عبر البريد',
    close: 'إغلاق', copied: 'تم نسخ رابط البطاقة', saved: 'افتح الملف لإضافة جهة الاتصال',
    walletSoon: 'بطاقة المحفظة تعمل بمجرد ربط حساب KON في Apple و Google',
    motion: 'حرّك جوالك، والبطاقة تتحرك معك', motionGo: 'فعّل الحركة',
    hello: (n: string, co: string, ph: string) => `مرحبًا، أنا ${n}${co ? ` من ${co}` : ''}. تشرفت بالتعرف عليك${ph ? `\nرقمي: ${ph}` : ''}`,
  },
  en: {
    flip: 'Tap the card to flip it', flipBack: 'Tap to flip back', scan: 'Scan to save this card',
    save: 'Save contact', whatsapp: 'WhatsApp', call: 'Call', email: 'Email', book: 'Book a meeting',
    share: 'Share card', site: 'Website', apple: 'Add to Apple Wallet', google: 'Add to Google Wallet', addTo: 'Add to',
    intro: 'Introduce yourself', introSub: 'Leave your name and it reaches me straight on WhatsApp',
    yourName: 'Your name', yourCo: 'Your company', yourPhone: 'Your number (optional)', send: 'Send on WhatsApp', sendMail: 'or by email',
    close: 'Close', copied: 'Card link copied', saved: 'Open the file to add the contact',
    walletSoon: 'Wallet passes switch on once KON’s Apple and Google accounts are connected',
    motion: 'Move your phone and the card moves with you', motionGo: 'Turn on motion',
    hello: (n: string, co: string, ph: string) => `Hello, I'm ${n}${co ? ` from ${co}` : ''}. Great to meet you${ph ? `\nMy number: ${ph}` : ''}`,
  },
}

const I = {
  save: <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />,
  wa: <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20Zm5-11.5c0 3.6 2.9 6.5 6.5 6.5l1.2-1.5-2-1-1 .8a4.6 4.6 0 0 1-2.9-2.9l.8-1-1-2L9 8.5Z" />,
  call: <path d="M5 4h3.5l1.5 4-2 1.3a10 10 0 0 0 6.7 6.7L16 14l4 1.5V19a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  cal: <path d="M5 6h14v14H5zM5 10h14M9 3v4m6-4v4m-6 7h2m2 0h2m-6 3h2" />,
  share: <path d="M12 15V3m0 0L8 7m4-4 4 4M6 11H5v9h14v-9h-1" />,
  site: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z" />,
  hand: <path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11m0-1.5v-5a1.5 1.5 0 0 1 3 0v5m0 0V6a1.5 1.5 0 0 1 3 0v6m0-2.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 6 17l-2.3-4a1.5 1.5 0 0 1 2.6-1.5L7 13" />,
  flip: <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5" />,
}
const Ico = ({ d }: { d: ReactElement }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)

function useLang(): [Lang, (l: Lang) => void] {
  const first: Lang = location.hash.includes('en') || new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ar'
  const [lang, set] = useState<Lang>(first)
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])
  return [lang, set]
}

export default function CardApp() {
  const person = useMemo(() => findPerson(currentSlug()), [])
  const [lang, setLang] = useLang()
  const t = T[lang]
  const [flipped, setFlipped] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [toast, setToast] = useState('')
  const [ask, setAsk] = useState(false)
  const [ready, setReady] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const coarse = useMemo(() => matchMedia('(pointer: coarse)').matches, [])
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const webgl = useMemo(() => { try { return !!document.createElement('canvas').getContext('webgl') } catch { return false } }, [])
  const ua = navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)
  const android = /Android/.test(ua)

  const name = lang === 'ar' ? person.nameAr : person.nameEn
  const title = lang === 'ar' ? person.titleAr : person.titleEn
  const wa = person.whatsapp || COMPANY.whatsapp
  const tel = person.phone || person.whatsapp
  const mail = person.email || COMPANY.email
  const booking = person.booking || COMPANY.booking
  const url = COMPANY.cardBase + person.slug
  const qr = useMemo(() => qrSvg(url + '?src=qr'), [url])

  useEffect(() => {
    document.title = `${person.nameEn} · KON Unlimited`
    track('card_view', { person: person.slug })
    const id = setTimeout(() => setReady(true), 60)
    if (needsMotionPermission()) setAsk(true)
    const root = document.documentElement
    const stop = startTilt((x, y) => {
      root.style.setProperty('--tx', x.toFixed(4))
      root.style.setProperty('--ty', y.toFixed(4))
    })
    return () => { clearTimeout(id); stop() }
  }, [person])

  const say = (s: string) => { setToast(s); window.clearTimeout((say as unknown as { h: number }).h); (say as unknown as { h: number }).h = window.setTimeout(() => setToast(''), 3200) }
  const act = (what: string) => track('card_action', { person: person.slug, action: what })

  const save = () => { act('save_contact'); downloadVcard(person, contactPhoto()); if (!ios) say(t.saved) }
  const share = async () => {
    act('share')
    const data = { title: `${person.nameEn} · KON Unlimited`, text: `${name} · KON Unlimited`, url }
    try { if (navigator.share) { await navigator.share(data); return } } catch { return }
    try { await navigator.clipboard.writeText(url); say(t.copied) } catch { say(url) }
  }
  const wallet = async (kind: 'apple' | 'google') => {
    act('wallet_' + kind)
    if (PREVIEW) { say(t.walletSoon); return }
    try {
      const r = await fetch(`/api/wallet?kind=${kind}&p=${person.slug}`, { method: kind === 'apple' ? 'HEAD' : 'GET' })
      if (!r.ok) throw new Error(String(r.status))
      if (kind === 'apple') location.href = `/api/wallet?kind=apple&p=${person.slug}`
      else { const j = await r.json(); location.href = j.url }
    } catch { say(t.walletSoon) }
  }
  const tapSky = (e: RPE) => {
    if (e.target !== e.currentTarget) return
    ripple.t = performance.now() / 1000
    ripple.x = (e.clientX / innerWidth) * 2 - 1
    ripple.y = -((e.clientY / innerHeight) * 2 - 1)
  }
  const enableMotion = async () => { await askMotion(); recentre(); setAsk(false) }

  const [f, setF] = useState({ n: '', c: '', p: '' })
  const hello = t.hello(f.n.trim(), f.c.trim(), f.p.trim())
  const sendWa = () => { act('intro_whatsapp'); window.open(`https://wa.me/${wa}?text=${encodeURIComponent(hello)}`, '_blank', 'noopener') }

  // ?art=strip|hero|logo: the wallet pass artwork, rendered from this same scene (see scripts/wallet-art.cjs)
  const art = new URLSearchParams(location.search).get('art')
  if (art) return (
    <div className={`kc kc-art kc-art-${art} is-ready`}>
      <div className="kc-sky" aria-hidden="true"><CloudSky tier="mid" reduced={false} /></div>
      {art !== 'logo' && <div className="kc-gems" aria-hidden="true"><Suspense fallback={null}><CardGems coarse={false} reduced={false} /></Suspense></div>}
      {art !== 'strip' && <div className="kc-art-mark"><KonGlass /></div>}
    </div>
  )

  return (
    <div className={`kc${ready ? ' is-ready' : ''}${flipped ? ' is-flipped' : ''}`} onPointerDown={tapSky}>
      <div className="kc-sky" aria-hidden="true">
        {webgl && <CloudSky tier={coarse ? 'low' : 'mid'} reduced={reduced} />}
      </div>
      {webgl && (
        <div className="kc-gems" aria-hidden="true">
          <Suspense fallback={null}><CardGems coarse={coarse} reduced={reduced} /></Suspense>
        </div>
      )}
      <div className="kc-sky kc-sky-front" aria-hidden="true">
        {webgl && !coarse && <CloudSky tier="mid" reduced={reduced} front />}
      </div>

      <header className="kc-top">
        <a className="kc-brand" href={COMPANY.site} onClick={() => act('brand')} dir="ltr"><b>KON</b> Unlimited</a>
        <button type="button" className="kc-lang" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={lang === 'ar' ? 'English' : 'العربية'}>
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
      </header>

      <main className="kc-main">
        <div className="kc-stage" ref={stage}>
          <div role="button" tabIndex={0} className="kc-card" onClick={() => { setFlipped((v) => !v); act('flip') }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((v) => !v) } }}
            aria-label={flipped ? t.flipBack : t.flip}>
            <span className="kc-face kc-front">
              <span className="kc-holo" aria-hidden="true" />
              <span className="kc-grain" aria-hidden="true" />
              <span className="kc-mark" onClick={(e) => e.stopPropagation()}><KonGlass /></span>
              <span className="kc-who">
                <span className="kc-name">{name}</span>
                {title && <span className="kc-title">{title}</span>}
              </span>
              <span className="kc-lines" dir="ltr">
                {person.email && <span>{person.email}</span>}
                <span>{COMPANY.siteLabel}</span>
              </span>
              <span className="kc-rule" aria-hidden="true" />
              <span className="kc-slogan" dir="ltr">{COMPANY.slogan}</span>
              <span className="kc-corner" aria-hidden="true"><Ico d={I.flip} /></span>
            </span>
            <span className="kc-face kc-back">
              <span className="kc-holo" aria-hidden="true" />
              <span className="kc-qr" dangerouslySetInnerHTML={{ __html: qr }} />
              <span className="kc-scan">{t.scan}</span>
              <span className="kc-url" dir="ltr">{COMPANY.siteLabel}/card/{person.slug}</span>
              <span className="kc-back-name">{name}</span>
            </span>
          </div>
        </div>
        {ask ? (
          <button type="button" className="kc-motion" onClick={enableMotion}>
            <span>{t.motion}</span><b>{t.motionGo}</b>
          </button>
        ) : <p className="kc-hint">{flipped ? t.flipBack : t.flip}</p>}

        <section className="kc-actions" aria-label={name}>
          <button type="button" className="kc-primary" onClick={save}><Ico d={I.save} />{t.save}</button>
          <div className="kc-grid">
            {wa && <a className="kc-act" href={`https://wa.me/${wa}`} target="_blank" rel="noopener" onClick={() => act('whatsapp')}><Ico d={I.wa} /><span>{t.whatsapp}</span></a>}
            {tel && <a className="kc-act" href={`tel:+${tel}`} onClick={() => act('call')}><Ico d={I.call} /><span>{t.call}</span></a>}
            <a className="kc-act" href={`mailto:${mail}`} onClick={() => act('email')}><Ico d={I.mail} /><span>{t.email}</span></a>
            <a className="kc-act" href={booking} target="_blank" rel="noopener" onClick={() => act('book')}><Ico d={I.cal} /><span>{t.book}</span></a>
            <button type="button" className="kc-act" onClick={share}><Ico d={I.share} /><span>{t.share}</span></button>
            <a className="kc-act" href={COMPANY.site + (lang === 'en' ? '/#en' : '')} onClick={() => act('site')}><Ico d={I.site} /><span>{t.site}</span></a>
          </div>
          <div className="kc-wallets">
            {(!android || ios) && (
              <button type="button" className="kc-wallet kc-apple" aria-label={t.apple} onClick={() => wallet('apple')}>
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="2" y="5" width="20" height="15" rx="3" fill="#1c1c1e" stroke="#fff" strokeOpacity=".5" /><rect x="2" y="5" width="20" height="4" rx="2" fill="#3fd0bd" /><rect x="2" y="8" width="20" height="4" rx="2" fill="#e9dcb8" /><rect x="2" y="11" width="20" height="4" rx="2" fill="#14ab9a" /></svg>
                <span className="kc-wl"><small>{t.addTo}</small><b>Apple Wallet</b></span>
              </button>
            )}
            {(!ios || android) && (
              <button type="button" className="kc-wallet kc-google" aria-label={t.google} onClick={() => wallet('google')}>
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="3" fill="#fff" /><path d="M3 10h18" stroke="#4285f4" strokeWidth="2" /><path d="M3 13h18" stroke="#34a853" strokeWidth="2" /><path d="M3 16h18" stroke="#fbbc04" strokeWidth="2" /></svg>
                <span className="kc-wl"><small>{t.addTo}</small><b>Google Wallet</b></span>
              </button>
            )}
          </div>
          <button type="button" className="kc-intro" onClick={() => { setSheet(true); act('intro_open') }}><Ico d={I.hand} />{t.intro}</button>
        </section>
        <p className="kc-foot" dir="ltr">KON Unlimited · {COMPANY.siteLabel}</p>
      </main>

      {sheet && (
        <div className="kc-sheet-wrap" role="dialog" aria-modal="true" aria-label={t.intro} onClick={(e) => e.target === e.currentTarget && setSheet(false)}>
          <form className="kc-sheet" onSubmit={(e) => { e.preventDefault(); if (f.n.trim()) sendWa() }}>
            <h2>{t.intro}</h2>
            <p>{t.introSub}</p>
            <label><span>{t.yourName}</span><input required autoComplete="name" value={f.n} onChange={(e) => setF({ ...f, n: e.target.value })} /></label>
            <label><span>{t.yourCo}</span><input autoComplete="organization" value={f.c} onChange={(e) => setF({ ...f, c: e.target.value })} /></label>
            <label><span>{t.yourPhone}</span><input type="tel" autoComplete="tel" dir="ltr" value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })} /></label>
            <button type="submit" className="kc-primary" disabled={!f.n.trim()}><Ico d={I.wa} />{t.send}</button>
            <a className="kc-mail" href={`mailto:${mail}?subject=${encodeURIComponent('KON · ' + (f.n || ''))}&body=${encodeURIComponent(hello)}`} onClick={() => act('intro_email')}>{t.sendMail}</a>
            <button type="button" className="kc-x" onClick={() => setSheet(false)} aria-label={t.close}>×</button>
          </form>
        </div>
      )}

      <div className={`kc-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}
