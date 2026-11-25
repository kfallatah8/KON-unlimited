// Visitor analytics with consent (Saudi PDPL: tracking that stores data on the device or records the
// session waits for the visitor's choice).
//
// - Before a choice, and after "essentials only": PostHog runs in cookieless mode. Nothing is stored on
//   the device, no session replay; it only counts visits, pages and clicks anonymously.
// - After "accept": full PostHog: heatmaps, session replay (every typed field masked), funnels, live users.
// - Vercel Web Analytics + Speed Insights are cookieless and always on (aggregate counts, page speed).
//
// The project key is public by design (it can only send events). Set VITE_POSTHOG_KEY in Vercel.
import type { PostHog } from 'posthog-js'

export type Choice = 'all' | 'essential'
const KEY = 'kon-consent'
const VERSION = 1

const PH_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const PH_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com'

let ph: PostHog | null = null
const queue: [string, Record<string, unknown> | undefined][] = []

export function readChoice(): Choice | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null')
    return v && v.v === VERSION && (v.c === 'all' || v.c === 'essential') ? v.c : null
  } catch { return null }
}

export function saveChoice(c: Choice) {
  try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, c, at: new Date().toISOString() })) } catch { /* private mode */ }
  if (c === 'all') ph?.opt_in_capturing()
  else ph?.opt_out_capturing()
  track('consent_choice', { choice: c })
  window.dispatchEvent(new CustomEvent('kon-consent', { detail: c }))
}

/** Funnel / interaction events. Never pass names, phones or emails here. */
export function track(event: string, props?: Record<string, unknown>) {
  if (ph) ph.capture(event, props)
  else if (queue.length < 50) queue.push([event, props])
}

function vercelScripts() {
  if (!/kon-unlimited\.com|kon\.sa|vercel\.app$/.test(location.hostname)) return
  for (const src of ['/_vercel/insights/script.js', '/_vercel/speed-insights/script.js']) {
    const s = document.createElement('script')
    s.src = src
    s.defer = true
    document.head.appendChild(s)
  }
}

async function startPostHog() {
  if (!PH_KEY || ph) return
  const { default: posthog } = await import('posthog-js')
  const choice = readChoice()
  posthog.init(PH_KEY, {
    api_host: PH_HOST,
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-05-24',
    person_profiles: 'identified_only',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    autocapture: true,
    enable_heatmaps: true,
    // Cookieless until the visitor accepts, and when they choose essentials only.
    cookieless_mode: 'on_reject',
    opt_out_capturing_by_default: choice !== 'all',
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '.ob-field, .rq-form, .ob-raw, input, textarea',
    },
    loaded: (p) => {
      if (choice === 'all') p.opt_in_capturing()
      p.register({ site_lang: document.documentElement.lang || 'ar' })
    },
  })
  ph = posthog
  queue.splice(0).forEach(([e, p]) => posthog.capture(e, p))
}

export function initAnalytics() {
  vercelScripts()
  // Load after the page is interactive so it never slows the first paint.
  const go = () => { startPostHog().catch(() => { /* analytics must never break the site */ }) }
  if ('requestIdleCallback' in window) (window as Window & { requestIdleCallback: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback(go, { timeout: 4000 })
  else setTimeout(go, 2500)
}
