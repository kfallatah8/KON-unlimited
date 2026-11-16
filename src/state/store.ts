// Tiny external store shared by the DOM layer and the 3D layer.
import { useSyncExternalStore } from 'react'
import type { Lang, Persona } from '../content/site'

export interface Preset {
  persona: Persona
  pains?: string[]
  support?: boolean
  /** Bumped on every request so the same preset can be applied twice. */
  n: number
}

export interface ExperienceState {
  lang: Lang
  preset: Preset | null
}

type Listener = () => void

function initialLang(): Lang {
  // Each language has its own crawlable address: / (Arabic) and /en/ (English).
  if (/^\/en(\/|$)/.test(location.pathname)) return 'en'
  if (location.hash === '#en') return 'en'
  if (location.hash === '#ar') return 'ar'
  try {
    const saved = localStorage.getItem('kon-lang')
    if (saved === 'ar' || saved === 'en') return saved
  } catch {
    /* storage unavailable */
  }
  return 'ar'
}

const state: ExperienceState = { lang: initialLang(), preset: null }
const listeners = new Set<Listener>()

export const store = {
  get: () => state,
  set(patch: Partial<ExperienceState>) {
    Object.assign(state, patch)
    listeners.forEach((l) => l())
  },
  subscribe(l: Listener) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function setLang(lang: Lang) {
  store.set({ lang })
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  // keep the address in step with the language, so a shared link opens the same language
  const want = lang === 'en' ? '/en/' : '/'
  if (/^\/(en\/?)?$/.test(location.pathname) && location.pathname !== want) {
    history.replaceState(history.state, '', want + location.search + location.hash)
  }
  try {
    localStorage.setItem('kon-lang', lang)
  } catch {
    /* storage unavailable */
  }
}

let presetN = 0
/** Opens the onboarding with a persona (and optional pains) already chosen, then scrolls to it. */
export function startOnboarding(p: Omit<Preset, 'n'>) {
  store.set({ preset: { ...p, n: ++presetN } })
}

export function useStore<T>(select: (s: ExperienceState) => T): T {
  const get = () => select(store.get())
  return useSyncExternalStore(store.subscribe, get, get)
}

/** Per-frame values shared with the 3D layer without React. */
export const motion = {
  /** Pointer in normalised device coords (-1..1). */
  px: 0,
  py: 0,
  /** 0..1 progress of the closing "KON" formation. */
  finale: 0,
  /** 0..1, how far past the finale we've scrolled (into the onboarding). */
  post: 0,
  /** 0..1, how far we've left the hero. */
  heroOut: 0,
  /** Signed scroll velocity, px per frame, smoothed. */
  vel: 0,
  /** performance.now() when the 3D scene had compiled and was shown (0 = not yet). */
  live: 0,
  /** performance.now() when the page opening started (fonts in). */
  readyAt: 0,
  /** Element under the pointer wants extra glow (CTA hover). */
  glow: 0,
  /** Last tap / click on empty page: NDC position and performance.now() time (0 = none). */
  breath: 0.5,
  rx: 0,
  ry: 0,
  rt: 0,
  /** 0..1, the gathering storm (tension). Already multiplied by (1 - calm). */
  storm: 0,
  /** 0..1, the release: the storm passes and everything settles. */
  calm: 0,
  /** 0..1, current lightning glow inside the clouds (written by the 3D layer). */
  bolt: 0,
  /** 0..1, the pressure: every stone is drawn into one compressed core of coal. */
  press: 0,
  /** performance.now() when the core broke open (0 = not yet, or scrolled back above it). */
  burstAt: 0,
  /** Which of the three winners is lit (0 talent, 1 company, 2 KON). */
  trioOn: 0,
}

/** Milliseconds since both the 3D scene and the page opening were ready (0 until then). */
export function introElapsed() {
  if (!motion.live || !motion.readyAt) return 0
  return Math.max(0, performance.now() - Math.max(motion.live, motion.readyAt))
}
