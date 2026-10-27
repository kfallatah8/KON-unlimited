// Volumetric-looking clouds: drei's instanced cloud sprites with a puff texture painted at
// runtime (no network fetch). Three depth layers sit around the gem stream, so gems drift in
// front of some banks and behind others. They part and dim for the closing "KON".
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cloud, Clouds } from '@react-three/drei'
import * as THREE from 'three'
import type { Tier } from '../lib/capabilities'
import { motion } from '../state/store'

/** A cloud sprite: fractal noise (fbm) inside a soft round mask, so every puff has wisps and
 *  dense lumps like a real cumulus instead of reading as a flat disc. */
function puffTexture() {
  const n = 256
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  // Value noise on a small lattice, smoothly interpolated, summed over five octaves.
  const G = 64
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const lat = Float32Array.from({ length: G * G }, rnd)
  const at = (x: number, y: number) => lat[((y % G) + G) % G * G + (((x % G) + G) % G)]
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y)
    const xf = x - xi, yf = y - yi
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
    const a = at(xi, yi), b = at(xi + 1, yi), cc = at(xi, yi + 1), d = at(xi + 1, yi + 1)
    return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v
  }
  const img = ctx.createImageData(n, n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let f = 0, amp = 0.5, fr = 4 / n
      for (let o = 0; o < 5; o++) {
        f += amp * noise(x * fr, y * fr)
        amp *= 0.5
        fr *= 2
      }
      const dx = (x - n / 2) / (n / 2), dy = (y - n / 2) / (n / 2)
      const r = Math.sqrt(dx * dx + dy * dy * 1.15)
      const mask = Math.max(0, 1 - r)
      // Dense where noise and mask agree; wispy toward the rim.
      const a = Math.max(0, Math.min(1, (f * 1.35 - 0.38) * 1.6)) * Math.pow(mask, 1.3)
      const i = (y * n + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255
      img.data[i + 3] = Math.round(a * 235)
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL('image/png')
}

interface Bank {
  /** Position as a fraction of the visible width/height at its depth. */
  fx: number
  fy: number
  z: number
  seed: number
  segments: number
  bounds: [number, number, number]
  volume: number
  color: string
  opacity: number
  speed: number
  drift: number
}

function banks(tier: Tier): Bank[] {
  const far: Bank[] = [
    { fx: -0.42, fy: 0.3, z: -24, seed: 1, segments: 26, bounds: [12, 3, 3], volume: 9, color: '#1d6b66', opacity: 0.75, speed: 0.08, drift: 0.5 },
    { fx: 0.45, fy: -0.15, z: -26, seed: 2, segments: 26, bounds: [13, 3, 3], volume: 10, color: '#17605b', opacity: 0.7, speed: 0.07, drift: 0.4 },
    { fx: 0.05, fy: -0.48, z: -22, seed: 3, segments: 22, bounds: [16, 2, 3], volume: 8, color: '#145551', opacity: 0.7, speed: 0.06, drift: 0.35 },
  ]
  const mid: Bank[] = [
    { fx: -0.5, fy: -0.2, z: -6, seed: 4, segments: 18, bounds: [3.5, 2, 2], volume: 3.6, color: '#4fb3a8', opacity: 0.7, speed: 0.12, drift: 0.7 },
    { fx: 0.52, fy: 0.25, z: -4.5, seed: 5, segments: 18, bounds: [3.5, 2, 2], volume: 3.4, color: '#57bbb0', opacity: 0.65, speed: 0.1, drift: 0.6 },
    { fx: 0.48, fy: -0.42, z: -8, seed: 6, segments: 16, bounds: [4, 1.6, 2], volume: 3.6, color: '#3f9f96', opacity: 0.62, speed: 0.1, drift: 0.5 },
  ]
  const near: Bank[] = [
    { fx: -0.55, fy: -0.5, z: 2.5, seed: 7, segments: 10, bounds: [2.4, 1, 1], volume: 2.2, color: '#5bbcb1', opacity: 0.22, speed: 0.15, drift: 0.9 },
    { fx: 0.56, fy: 0.48, z: 2, seed: 8, segments: 10, bounds: [2.4, 1, 1], volume: 2.2, color: '#5bbcb1', opacity: 0.2, speed: 0.15, drift: 0.8 },
  ]
  // More, smaller puffs in wide, flat banks read as cloud; few big ones read as bokeh.
  const shape = (b: Bank): Bank => ({ ...b, segments: Math.round(b.segments * 1.5), volume: b.volume * 0.62, bounds: [b.bounds[0] * 1.25, b.bounds[1] * 0.75, b.bounds[2]] })
  // Phones: fewer puffs, but brighter and fuller, since the reading veil darkens the middle.
  if (tier === 'low') return [far[0], far[2], mid[0], mid[1]].map(shape).map((b) => ({ ...b, segments: Math.round(b.segments * 0.7), opacity: Math.min(0.9, b.opacity * 1.25), color: lighten(b.color) }))
  if (tier === 'mid') return [...far, ...mid].map(shape)
  return [...far, ...mid, ...near].map(shape)
}

/** The sunlit tone of a bank: lifted toward a pale aqua. */
function lighten(hex: string) {
  return '#' + new THREE.Color(hex).lerp(new THREE.Color('#bff3ea'), 0.38).getHexString()
}

function easeOut(x: number) {
  const t = Math.min(1, Math.max(0, x))
  return 1 - Math.pow(1 - t, 3)
}

export default function CloudLayer({ tier, reduced, camZ, fov }: { tier: Tier; reduced: boolean; camZ: number; fov: number }) {
  const texture = useMemo(puffTexture, [])
  const list = useMemo(() => banks(tier), [tier])
  const refs = useRef<(THREE.Group | null)[]>([])
  const { size } = useThree()
  const st = useRef({ t: 0, sy: 0, fin: 0, post: 0, intro: 0 })
  const limit = list.reduce((a, b) => a + Math.ceil(b.segments * 0.6) + Math.ceil(b.segments * 0.4), 0)

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = st.current
    if (!reduced) s.t += dt
    s.intro = Math.min(1, state.clock.elapsedTime / 2.6)
    const k = 1 - Math.exp(-dt * 4)
    s.sy += (window.scrollY / window.innerHeight - s.sy) * k
    s.fin += (motion.finale - s.fin) * (1 - Math.exp(-dt * 3))
    s.post += (motion.post - s.post) * k
    const aspect = size.width / size.height
    const narrow = size.width < 700
    const intro = easeOut(s.intro)
    list.forEach((b, i) => {
      const g = refs.current[i]
      if (!g) return
      const depth = camZ - b.z
      const vh = 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * depth
      const vw = vh * aspect
      // Closer banks travel faster with the scroll: real parallax between the layers.
      const par = 0.12 + Math.max(0, 1 - depth / 40) * 0.5
      const span = vh * 1.6
      let y = ((b.fy * vh + s.sy * vh * par + span * 4) % span) - span / 2
      if (narrow) y *= 0.9
      // Slow wind across the sky, and the banks part to the sides for the closing word.
      const wind = Math.sin(s.t * 0.05 * b.drift + b.seed * 2) * vw * 0.06
      const part = Math.sign(b.fx || 1) * vw * 0.35 * easeOut(s.fin * 1.4)
      g.position.set(b.fx * vw * (narrow ? 0.85 : 1) + wind + part, y, b.z - (1 - intro) * 6)
      const sc = (narrow ? 0.95 : 1) * (1 - s.post * 0.4)
      g.scale.setScalar(sc)
      g.visible = s.post < 0.98
    })
  })

  return (
    <Clouds material={THREE.MeshLambertMaterial} texture={texture} limit={limit} frustumCulled={false}>
      {list.map((b, i) => (
        <group key={b.seed} ref={(g) => { refs.current[i] = g }}>
          {/* Shadowed base, then a lit crown above it: the two tones read as volume. */}
          <Cloud
            seed={b.seed}
            segments={Math.ceil(b.segments * 0.6)}
            bounds={b.bounds}
            position={[0, -b.bounds[1] * 0.3, 0]}
            volume={b.volume}
            color={b.color}
            opacity={b.opacity}
            speed={reduced ? 0 : b.speed}
            growth={3}
            fade={12}
            concentrate="inside"
          />
          <Cloud
            seed={b.seed + 50}
            segments={Math.ceil(b.segments * 0.4)}
            bounds={[b.bounds[0] * 0.8, b.bounds[1] * 0.6, b.bounds[2]]}
            position={[0, b.bounds[1] * 0.35, 0.4]}
            volume={b.volume * 0.75}
            color={lighten(b.color)}
            opacity={b.opacity * 0.7}
            speed={reduced ? 0 : b.speed * 1.3}
            growth={2.5}
            fade={12}
            concentrate="inside"
          />
        </group>
      ))}
    </Clouds>
  )
}
