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
  return useSyncExternalStore(store.subscribe, () => select(store.get()))
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
  /** Element under the pointer wants extra glow (CTA hover). */
  glow: 0,
}
