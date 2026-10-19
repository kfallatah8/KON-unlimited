// Device capability detection → rendering tier.
// high: desktop, full scene + post-processing
// mid: tablet / modest GPU, full scene, no post-processing, lower DPR
// low: phones, simplified scene, no parallax, DPR 1
// none: no WebGL, or explicitly constrained device → static SceneFallback
export type Tier = 'high' | 'mid' | 'low' | 'none'

export interface Capabilities {
  tier: Tier
  reducedMotion: boolean
  touch: boolean
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function detectCapabilities(): Capabilities {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const touch = window.matchMedia('(pointer: coarse)').matches
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  const saveData = !!nav.connection?.saveData
  const width = Math.min(window.innerWidth, window.screen?.width ?? window.innerWidth)

  let tier: Tier
  if (!hasWebGL() || saveData || memory <= 2 || cores <= 2) tier = 'none'
  else if (width < 700) tier = 'low'
  else if (touch || width < 1100 || cores <= 4) tier = 'mid'
  else tier = 'high'

  // Manual override for QA: ?tier=low etc.
  const forced = new URLSearchParams(location.search).get('tier') as Tier | null
  if (forced && ['high', 'mid', 'low', 'none'].includes(forced)) tier = forced

  return { tier, reducedMotion, touch }
}
