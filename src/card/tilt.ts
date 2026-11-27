// One shared tilt for the whole card: the phone's own orientation, or the pointer on a desktop.
// x, y in -1..1 (smoothed). Read every frame by the gems, the card and the CSS light.
export const tilt = { x: 0, y: 0, tx: 0, ty: 0, live: false }

type DOE = { requestPermission?: () => Promise<string> }
const D = (typeof window !== 'undefined' ? window.DeviceOrientationEvent : undefined) as unknown as DOE | undefined

let base: { b: number; g: number } | null = null
function onOrient(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return
  // the way the phone is held when the card opens counts as "level"
  if (!base) base = { b: Math.max(10, Math.min(70, e.beta)), g: e.gamma }
  const ang = (screen.orientation?.angle ?? 0) as number
  let gx = e.gamma - base.g, by = e.beta - base.b
  if (ang === 90) [gx, by] = [by, -gx]
  else if (ang === 270 || ang === -90) [gx, by] = [-by, gx]
  tilt.tx = Math.max(-1, Math.min(1, gx / 28))
  tilt.ty = Math.max(-1, Math.min(1, by / 24))
  tilt.live = true
}
function onPointer(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  tilt.tx = Math.max(-1, Math.min(1, (e.clientX / innerWidth) * 2 - 1))
  tilt.ty = Math.max(-1, Math.min(1, (e.clientY / innerHeight) * 2 - 1))
}

export function needsMotionPermission() {
  return !!D && typeof D.requestPermission === 'function' && matchMedia('(pointer: coarse)').matches
}
export async function askMotion(): Promise<boolean> {
  try { return (await D?.requestPermission?.()) === 'granted' } catch { return false }
}
export function recentre() { base = null }

export function startTilt(onFrame: (x: number, y: number) => void) {
  addEventListener('deviceorientation', onOrient)
  addEventListener('pointermove', onPointer, { passive: true })
  let raf = 0, last = performance.now()
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    const k = Math.min(1, dt * 6)
    tilt.x += (tilt.tx - tilt.x) * k
    tilt.y += (tilt.ty - tilt.y) * k
    onFrame(tilt.x, tilt.y)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); removeEventListener('deviceorientation', onOrient); removeEventListener('pointermove', onPointer) }
}
