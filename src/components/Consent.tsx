// One-time privacy choice. A small glass note that rises in the corner after the visitor has started
// reading (never over the hero, never a blocking wall). Reopens from "Privacy settings" in the footer.
import { useEffect, useRef, useState } from 'react'
import { readChoice, saveChoice, type Choice } from '../lib/analytics'
import { motion, useStore } from '../state/store'

const copy = {
  ar: {
    label: 'خصوصيتك',
    title: 'نطوّر الموقع على تجربتك',
    body: 'نستخدم أدوات قياس تساعدنا نفهم كيف تتنقل في الموقع، عشان نحسّنه لك. أي حقل تكتب فيه بياناتك يبقى مخفيًا عنها دائمًا',
    accept: 'موافق',
    essential: 'الضروري فقط',
    more: 'التفاصيل',
    less: 'إخفاء التفاصيل',
    details: [
      ['الضروري', 'يحفظ في جهازك لغتك واختياراتك ومسودة نماذجك، ويعمل دائمًا'],
      ['القياس', 'خرائط النقر وتسجيل مجهول لطريقة التصفح عبر PostHog (خوادم في الاتحاد الأوروبي)، ويعمل فقط بموافقتك'],
      ['الإحصاءات العامة', 'عدد الزيارات وسرعة الصفحات بدون أي ملفات تعريف في جهازك'],
    ],
    change: 'تقدر تغيّر اختيارك متى ما تبي من «إعدادات الخصوصية» أسفل الصفحة',
    thanks: 'شكرًا لثقتك',
    saved: 'تم حفظ اختيارك',
  },
  en: {
    label: 'Your privacy',
    title: 'We improve the site around you',
    body: 'We use measurement tools to understand how people move through the site, so we can make it better. Any field where you type your details always stays hidden from them',
    accept: 'Accept',
    essential: 'Essentials only',
    more: 'Details',
    less: 'Hide details',
    details: [
      ['Essential', 'Keeps your language, choices and form drafts on your device. Always on'],
      ['Measurement', 'Click heatmaps and anonymous browsing replays via PostHog (EU servers). Only with your consent'],
      ['General stats', 'Visit counts and page speed, with nothing stored on your device'],
    ],
    change: 'You can change this anytime from “Privacy settings” at the bottom of the page',
    thanks: 'Thank you for your trust',
    saved: 'Your choice is saved',
  },
}

export function openPrivacySettings() {
  window.dispatchEvent(new Event('kon-privacy-open'))
}

export function Consent() {
  const lang = useStore((s) => s.lang)
  const t = copy[lang]
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState(false)
  const [done, setDone] = useState<Choice | null>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const show = () => { setDone(null); setDetails(false); setOpen(true) }
    window.addEventListener('kon-privacy-open', show)
    if (readChoice()) return () => window.removeEventListener('kon-privacy-open', show)
    // First visit: appear once the visitor has engaged (scrolled past the hero) or after 9s.
    let fired = false
    const fire = () => { if (fired) return; fired = true; cleanup(); setOpen(true) }
    const onScroll = () => { if (window.scrollY > window.innerHeight * 0.6) fire() }
    const timer = setTimeout(fire, 9000)
    window.addEventListener('scroll', onScroll, { passive: true })
    const cleanup = () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
    return () => { cleanup(); window.removeEventListener('kon-privacy-open', show) }
  }, [])

  const choose = (c: Choice) => {
    saveChoice(c)
    setDone(c)
    if (c === 'all') {
      // A small thank-you: the gems answer with one soft pulse.
      motion.glow = 1
      document.documentElement.classList.remove('cta-pulse')
      void document.documentElement.offsetWidth
      document.documentElement.classList.add('cta-pulse')
      setTimeout(() => { motion.glow = 0 }, 1200)
    }
    setTimeout(() => setOpen(false), 1600)
  }

  if (!open) return null
  return (
    <div ref={box} data-lenis-prevent className={`kc${done ? ' is-done' : ''}`} role="region" aria-label={t.label} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {done ? (
        <p className="kc-done" role="status"><span className="kc-gem" aria-hidden="true" />{done === 'all' ? t.thanks : t.saved}</p>
      ) : (
        <>
          <p className="kc-label"><span className="kc-gem" aria-hidden="true" />{t.label}</p>
          <p className="kc-title">{t.title}</p>
          <p className="kc-body">{t.body}</p>
          {details && (
            <dl className="kc-details">
              {t.details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              <p className="kc-change">{t.change}</p>
            </dl>
          )}
          <div className="kc-actions">
            <button type="button" className="kc-btn kc-accept" onClick={() => choose('all')}>{t.accept}</button>
            <button type="button" className="kc-btn" onClick={() => choose('essential')}>{t.essential}</button>
            <button type="button" className="kc-more" aria-expanded={details} onClick={() => setDetails((x) => !x)}>{details ? t.less : t.more}</button>
          </div>
        </>
      )}
    </div>
  )
}

export const privacyLabel = { ar: 'إعدادات الخصوصية', en: 'Privacy settings' }
