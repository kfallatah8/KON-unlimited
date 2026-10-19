// Tiny external store shared by the DOM layer and the 3D layer.
// Keeps interaction state decoupled from rendering (no React re-render per frame).
import { useSyncExternalStore } from 'react'
import type { DimensionId, Lang } from '../content/site'

export interface ExperienceState {
  /** Continuous formation index driven by scroll (see formations.ts). */
  scene: number
  hovered: DimensionId | null
  selected: DimensionId | null
  ready: boolean
  lang: Lang
  /** True while an opaque section covers the whole viewport: the 3D stage can stop rendering. */
  covered: boolean
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
  return 'ar' // Arabic-first
}

const state: ExperienceState = { scene: 0, hovered: null, selected: null, ready: false, lang: initialLang(), covered: false }
const listeners = new Set<Listener>()

export const store = {
  get: () => state,
  /** Per-frame values read by the render loop only: updated without notifying React. */
  setSilent(patch: Pick<Partial<ExperienceState>, 'scene' | 'covered'>) {
    Object.assign(state, patch)
  },
  set(patch: Partial<ExperienceState>) {
    let changed = false
    for (const k in patch) {
      const key = k as keyof ExperienceState
      if (state[key] !== patch[key]) {
        ;(state as unknown as Record<string, unknown>)[key] = patch[key]
        changed = true
      }
    }
    // `scene` changes every scroll frame; 3D reads it imperatively, so don't notify React for it.
    if (changed && !(Object.keys(patch).length === 1 && 'scene' in patch)) listeners.forEach((l) => l())
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

export function useStore<T>(select: (s: ExperienceState) => T): T {
  return useSyncExternalStore(store.subscribe, () => select(store.get()))
}
