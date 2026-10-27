// Volumetric-looking clouds: drei's instanced cloud sprites with a puff texture painted at
// runtime (no network fetch). Three depth layers sit around the gem stream, so gems drift in
// front of some banks and behind others. They part and dim for the closing "KON".
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cloud, Clouds, Sparkles } from '@react-three/drei'
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
  const fbm = (x: number, y: number, oct: number) => {
    let f = 0, amp = 0.5, fr = 1
    for (let o = 0; o < oct; o++) {
      f += amp * noise(x * fr, y * fr)
      amp *= 0.5
      fr *= 2
    }
    return f
  }
  // Fluffy cumulus: a cluster of soft round billows (bigger in the middle, bumps on top),
  // lightly broken up by noise so the edges stay soft without turning into wisps.
  const blobs: [number, number, number][] = [[0.5, 0.56, 0.3]]
  for (let k = 0; k < 13; k++) {
    const a = Math.PI * (1.05 + rnd() * 0.9) // mostly the upper half
    const d = 0.12 + rnd() * 0.16
    blobs.push([0.5 + Math.cos(a) * d * 1.25, 0.56 + Math.sin(a) * d * 0.9, 0.12 + rnd() * 0.12])
  }
  const img = ctx.createImageData(n, n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const px = x / n, py = y / n
      let d = 0
      for (const [bx, by, br] of blobs) {
        const r = Math.hypot(px - bx, py - by) / br
        if (r < 1) d = Math.max(d, 1 - r * r)
      }
      const f = fbm(px * 6, py * 6, 4)
      // Flat-ish base, soft rounded rim, gentle internal texture.
      const base = Math.min(1, Math.max(0, (0.78 - py) * 6 + 0.6))
      const a = Math.pow(d, 1.25) * (0.7 + 0.3 * f) * base
      const i = (y * n + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255
      img.data[i + 3] = Math.round(Math.min(1, a * 1.3) * 240)
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL('image/png')
}

/** A soft radial glow: the moonlit sky behind the far banks, so the clouds silhouette against light. */
function glowTexture() {
  const n = 256
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.1)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, n, n)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
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
    { fx: -0.42, fy: 0.3, z: -24, seed: 1, segments: 26, bounds: [12, 3, 3], volume: 9, color: '#2a7f78', opacity: 0.72, speed: 0.08, drift: 0.5 },
    { fx: 0.45, fy: -0.15, z: -26, seed: 2, segments: 26, bounds: [13, 3, 3], volume: 10, color: '#26766f', opacity: 0.68, speed: 0.07, drift: 0.4 },
    { fx: 0.05, fy: -0.48, z: -22, seed: 3, segments: 22, bounds: [16, 2, 3], volume: 8, color: '#226c66', opacity: 0.66, speed: 0.06, drift: 0.35 },
  ]
  const mid: Bank[] = [
    { fx: -0.5, fy: -0.2, z: -6, seed: 4, segments: 18, bounds: [3.5, 2, 2], volume: 3.6, color: '#5cc4b8', opacity: 0.7, speed: 0.12, drift: 0.7 },
    { fx: 0.52, fy: 0.25, z: -4.5, seed: 5, segments: 18, bounds: [3.5, 2, 2], volume: 3.4, color: '#66cbbf', opacity: 0.65, speed: 0.1, drift: 0.6 },
    { fx: 0.48, fy: -0.42, z: -8, seed: 6, segments: 16, bounds: [4, 1.6, 2], volume: 3.6, color: '#4fb2a7', opacity: 0.62, speed: 0.1, drift: 0.5 },
  ]
  const near: Bank[] = [
    { fx: -0.55, fy: -0.5, z: 2.5, seed: 7, segments: 10, bounds: [2.4, 1, 1], volume: 2.2, color: '#5bbcb1', opacity: 0.22, speed: 0.15, drift: 0.9 },
    { fx: 0.56, fy: 0.48, z: 2, seed: 8, segments: 10, bounds: [2.4, 1, 1], volume: 2.2, color: '#5bbcb1', opacity: 0.2, speed: 0.15, drift: 0.8 },
  ]
  // More, smaller puffs in wide, flat banks read as cloud; few big ones read as bokeh.
  const shape = (b: Bank): Bank => ({ ...b, segments: Math.round(b.segments * 1.2), volume: b.volume * 0.85, bounds: [b.bounds[0] * 1.25, b.bounds[1] * 0.75, b.bounds[2]] })
  // Phones: fewer puffs, but brighter and fuller, since the reading veil darkens the middle.
  if (tier === 'low') return [far[0], far[2], mid[0], mid[1]].map(shape).map((b) => ({ ...b, segments: Math.round(b.segments * 0.7), opacity: Math.min(0.9, b.opacity * 1.25), color: lighten(b.color) }))
  if (tier === 'mid') return [...far, ...mid].map(shape)
  return [...far, ...mid, ...near].map(shape)
}

/** The sunlit tone of a bank: lifted toward a pale aqua. */
function lighten(hex: string, k = 0.45) {
  return '#' + new THREE.Color(hex).lerp(new THREE.Color('#c8f6ee'), k).getHexString()
}
/** The shadowed underside: deeper and a little bluer. */
function deepen(hex: string) {
  return '#' + new THREE.Color(hex).lerp(new THREE.Color('#0a3b39'), 0.15).getHexString()
}
/** A faint champagne edge where the light catches the top, echoing the brand's gold. */
function rim(hex: string) {
  return '#' + new THREE.Color(hex).lerp(new THREE.Color('#f1e3bf'), 0.6).getHexString()
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
  const glow = useMemo(glowTexture, [])
  const moon = useRef<THREE.Mesh>(null)
  const dust = useRef<THREE.Group>(null)
  const dustCount = tier === 'high' ? 380 : tier === 'mid' ? 240 : 140
  const limit = list.reduce((a, b) => a + Math.ceil(b.segments * 0.6) + Math.ceil(b.segments * 0.4) + (b.z > -12 ? Math.max(3, Math.ceil(b.segments * 0.15)) : 0), 0)

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
      const bob = Math.sin(s.t * 0.11 * b.drift + b.seed * 5) * vh * 0.012
      g.position.set(b.fx * vw * (narrow ? 0.85 : 1) + wind + part, y + bob, b.z - (1 - intro) * 6)
      const sc = (narrow ? 0.95 : 1) * (1 - s.post * 0.4)
      g.scale.setScalar(sc)
      g.visible = s.post < 0.98
    })
    const fade = (1 - s.post) * intro
    const mz = -34
    const mvh = 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * (camZ - mz)
    if (moon.current) {
      // Slow scroll drift and a faint breath, so the light feels alive behind the banks.
      moon.current.position.set(mvh * aspect * (narrow ? 0.05 : -0.12), mvh * (0.22 - s.sy * 0.03), mz)
      const br = 1 + Math.sin(s.t * 0.2) * 0.03
      moon.current.scale.set(mvh * aspect * (narrow ? 1.2 : 0.95) * br, mvh * (narrow ? 0.55 : 0.6) * br, 1)
      ;(moon.current.material as THREE.MeshBasicMaterial).opacity = 0.2 * fade * (1 - s.fin * 0.6)
    }
    if (dust.current) {
      dust.current.position.y = -s.sy * 1.2
      dust.current.rotation.z = s.t * 0.004
      dust.current.visible = s.post < 0.98
    }
  })

  return (
    <>
    <mesh ref={moon} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={glow} color="#bfeee4" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
    {/* Fine champagne and aqua dust drifting through the sky: the "magic" between the banks. */}
    <group ref={dust}>
      <Sparkles count={Math.round(dustCount * 0.6)} scale={[34, 30, 14]} position={[0, 0, -6]} size={4.5} speed={reduced ? 0 : 0.18} opacity={0.55} noise={1.2} color="#f1e3bf" />
      <Sparkles count={Math.round(dustCount * 0.4)} scale={[30, 26, 10]} position={[0, 0, -3]} size={3.2} speed={reduced ? 0 : 0.24} opacity={0.45} noise={1.5} color="#a8f5ea" />
    </group>
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
            color={deepen(b.color)}
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
            opacity={Math.min(0.92, b.opacity * 0.95)}
            speed={reduced ? 0 : b.speed * 1.3}
            growth={2.5}
            fade={12}
            concentrate="inside"
          />
          {b.z > -12 && (
            <Cloud
              seed={b.seed + 90}
              segments={Math.max(3, Math.ceil(b.segments * 0.15))}
              bounds={[b.bounds[0] * 0.6, b.bounds[1] * 0.3, b.bounds[2] * 0.5]}
              position={[0, b.bounds[1] * 0.6, 0.7]}
              volume={b.volume * 0.5}
              color={rim(b.color)}
              opacity={b.opacity * 0.35}
              speed={reduced ? 0 : b.speed * 1.6}
              growth={1.5}
              fade={12}
              concentrate="inside"
            />
          )}
        </group>
      ))}
    </Clouds>
    </>
  )
}
