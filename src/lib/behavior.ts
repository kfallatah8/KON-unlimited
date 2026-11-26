// KON behaviour layer: what a visitor read, for how long, how far, in which language, from which
// campaign, and how attentive they were. Everything is sent to PostHog as plain events so it can be
// queried, scored and later used to personalise the page per visitor.
import { isPostHogConfigured, posthog } from './posthog'
import { store } from '../state/store'

const T0 = performance.now()
const now = () => Math.round(performance.now() - T0)

interface SectionStat { order: number; firstSeenMs: number; dwellMs: number; enteredAt: number | null }
const sections = new Map<string, SectionStat>()
let maxDepth = 0
let activeMs = 0
let lastInput = performance.now()
let lastTick = performance.now()
let sent = false
let summaries = 0

function device() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; saveData?: boolean } }
  return {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixel_ratio: Math.round((window.devicePixelRatio || 1) * 10) / 10,
    touch: window.matchMedia('(pointer: coarse)').matches,
    reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    dark_scheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
    device_memory: nav.deviceMemory ?? null,
    cpu_cores: nav.hardwareConcurrency ?? null,
    network: nav.connection?.effectiveType ?? null,
    save_data: !!nav.connection?.saveData,
    browser_lang: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

function campaign() {
  const q = new URLSearchParams(location.search)
  const out: Record<string, string> = {}
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'src']) {
    const v = q.get(k)
    if (v) out[k] = v.slice(0, 120)
  }
  return out
}

function depth() {
  const h = document.documentElement.scrollHeight - window.innerHeight
  return h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 100
}

function summary() {
  const read = [...sections.entries()].sort((a, b) => a[1].order - b[1].order)
  const dwell: Record<string, number> = {}
  for (const [id, s] of read) dwell[id] = Math.round((s.dwellMs + (s.enteredAt != null ? performance.now() - s.enteredAt : 0)) / 100) / 10
  return {
    time_on_page_s: Math.round(now() / 1000),
    active_time_s: Math.round(activeMs / 1000),
    max_scroll_depth: maxDepth,
    sections_seen: read.length,
    section_path: read.map(([id]) => id).join(' > ').slice(0, 400),
    section_dwell_s: dwell,
    deepest_section: read.length ? read[read.length - 1][0] : null,
    lang: store.get().lang,
  }
}

function flush() {
  if (sent || !isPostHogConfigured) return
  sent = true
  summaries += 1
  posthog.capture('visit_summary', { ...summary(), summary_n: summaries }, { transport: 'sendBeacon' })
}

export function initBehavior() {
  if (!isPostHogConfigured) return

  // Properties carried on every event from this visitor.
  posthog.register({ lang: store.get().lang, site_version: 'glass', ...device() })
  const camp = campaign()
  if (Object.keys(camp).length) {
    posthog.register(camp)
    posthog.setPersonProperties({ last_campaign: camp.utm_campaign ?? camp.ref ?? camp.src ?? null }, { first_campaign: camp.utm_campaign ?? camp.ref ?? camp.src ?? null, first_utm_source: camp.utm_source ?? null })
  }
  posthog.setPersonProperties({ last_lang: store.get().lang }, { first_lang: store.get().lang, first_seen_device: device().touch ? 'touch' : 'pointer' })

  // Language switches.
  let lang = store.get().lang
  store.subscribe(() => {
    const next = store.get().lang
    if (next === lang) return
    posthog.capture('language_switched', { from: lang, to: next, at_s: Math.round(now() / 1000), max_scroll_depth: maxDepth })
    posthog.register({ lang: next })
    posthog.setPersonProperties({ last_lang: next })
    lang = next
  })

  // Attention: a second counts as active when the tab is visible and there was input in the last 15s.
  const mark = () => { lastInput = performance.now() }
  for (const ev of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'scroll']) window.addEventListener(ev, mark, { passive: true })
  setInterval(() => {
    const t = performance.now()
    if (document.visibilityState === 'visible' && t - lastInput < 15000) activeMs += t - lastTick
    lastTick = t
  }, 1000)

  // Scroll depth milestones.
  const hit = new Set<number>()
  const onScroll = () => {
    const d = depth()
    if (d > maxDepth) maxDepth = d
    for (const m of [25, 50, 75, 90, 100]) {
      if (d >= m && !hit.has(m)) {
        hit.add(m)
        posthog.capture('scroll_depth_reached', { depth: m, at_s: Math.round(now() / 1000) })
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  // Sections: first view (with reading order and time to reach) and dwell time.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const id = (e.target as HTMLElement).id
      if (!id) continue
      let s = sections.get(id)
      if (e.isIntersecting) {
        if (!s) {
          s = { order: sections.size + 1, firstSeenMs: now(), dwellMs: 0, enteredAt: null }
          sections.set(id, s)
          posthog.capture('section_viewed', { section: id, order: s.order, at_s: Math.round(s.firstSeenMs / 1000), lang: store.get().lang })
        }
        if (s.enteredAt == null) s.enteredAt = performance.now()
      } else if (s && s.enteredAt != null) {
        s.dwellMs += performance.now() - s.enteredAt
        s.enteredAt = null
      }
    }
  }, { threshold: 0.35 })
  const watch = () => document.querySelectorAll('section[id]').forEach((el) => io.observe(el))
  watch()
  // Lazy sections (Solutions, Talent) mount later.
  new MutationObserver(() => watch()).observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })

  // Calculators: first interaction per tool, inside any .tl-* control.
  const toolsTouched = new Set<string>()
  document.addEventListener('pointerdown', (ev) => {
    const el = (ev.target as HTMLElement | null)?.closest?.('.tl-field, .tl-toggle, [role="radio"]')
    if (!el) return
    const sec = el.closest('section[id]')?.id ?? 'unknown'
    const label = (el.querySelector('.tl-label')?.textContent || el.textContent || '').trim().slice(0, 60)
    const key = `${sec}:${label}`
    if (toolsTouched.has(key)) return
    toolsTouched.add(key)
    posthog.capture('tool_interacted', { section: sec, control: label })
  }, { passive: true, capture: true })

  // Calendly booking inside the onboarding (the embed posts messages to the page).
  window.addEventListener('message', (ev) => {
    if (typeof ev.origin !== 'string' || !ev.origin.includes('calendly.com')) return
    const name = (ev.data as { event?: string } | null)?.event
    if (name === 'calendly.date_and_time_selected') posthog.capture('booking_time_selected')
    if (name === 'calendly.event_scheduled') {
      posthog.capture('booking_scheduled')
      posthog.setPersonProperties({ booked_call: true })
    }
  })

  // One summary per visit, sent when the visitor leaves or hides the tab.
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
    else sent = false
  })
}
