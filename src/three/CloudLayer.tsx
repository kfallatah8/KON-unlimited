// Volumetric-looking clouds: drei's instanced cloud sprites with a baked puff texture
// (src/assets/cloud.png, generated once, so nothing is computed on the main thread at load). Three depth layers sit around the gem stream, so gems drift in
// front of some banks and behind others. They part and dim for the closing "KON".
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cloud, Clouds } from '@react-three/drei'
import * as THREE from 'three'
import type { Tier } from '../lib/capabilities'
import { introElapsed, motion } from '../state/store'
import { burst } from './BurstFx'
import { bakedTexture } from './texUtil'
// Baked once from the original canvas generators: no work at load, and no canvas readback,
// which Safari salts with noise (that was the source of the coloured speckles).
import cloudUrl from '../assets/cloud.png'
import cloudGlowUrl from '../assets/cloud-glow.png'

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
    { fx: -0.1, fy: 0.52, z: -28, seed: 11, segments: 22, bounds: [18, 2.4, 3], volume: 9, color: '#24706a', opacity: 0.6, speed: 0.05, drift: 0.3 },
  ]
  const mid: Bank[] = [
    { fx: -0.5, fy: -0.2, z: -6, seed: 4, segments: 18, bounds: [3.5, 2, 2], volume: 3.6, color: '#5cc4b8', opacity: 0.7, speed: 0.12, drift: 0.7 },
    { fx: 0.52, fy: 0.25, z: -4.5, seed: 5, segments: 18, bounds: [3.5, 2, 2], volume: 3.4, color: '#66cbbf', opacity: 0.65, speed: 0.1, drift: 0.6 },
    { fx: 0.48, fy: -0.42, z: -8, seed: 6, segments: 16, bounds: [4, 1.6, 2], volume: 3.6, color: '#4fb2a7', opacity: 0.62, speed: 0.1, drift: 0.5 },
    { fx: -0.46, fy: 0.46, z: -10, seed: 12, segments: 16, bounds: [4.5, 1.6, 2], volume: 3.8, color: '#4aa89e', opacity: 0.6, speed: 0.09, drift: 0.45 },
    { fx: 0.0, fy: -0.62, z: -12, seed: 13, segments: 14, bounds: [6, 1.4, 2], volume: 3.8, color: '#3f9a91', opacity: 0.55, speed: 0.08, drift: 0.4 },
  ]
  // Between the far stones (z -24 to -12): banks the deep gems drift in and out of.
  const between: Bank[] = [
    { fx: -0.56, fy: -0.05, z: -16, seed: 21, segments: 18, bounds: [7, 2.2, 2.5], volume: 6, color: '#2f8a82', opacity: 0.6, speed: 0.07, drift: 0.45 },
    { fx: 0.6, fy: 0.42, z: -18, seed: 22, segments: 18, bounds: [7.5, 2.2, 2.5], volume: 6.2, color: '#2b837b', opacity: 0.58, speed: 0.06, drift: 0.4 },
    { fx: 0.3, fy: -0.66, z: -14, seed: 23, segments: 16, bounds: [8, 1.8, 2.5], volume: 5.5, color: '#338f86', opacity: 0.55, speed: 0.07, drift: 0.5 },
  ]
  // The deepest sky: wide, faint banks by the moonlight that give the scene its horizon.
  const deep: Bank[] = [
    { fx: 0.25, fy: 0.12, z: -40, seed: 31, segments: 20, bounds: [22, 3, 4], volume: 12, color: '#1d5f5a', opacity: 0.5, speed: 0.04, drift: 0.25 },
    { fx: -0.35, fy: -0.32, z: -38, seed: 32, segments: 18, bounds: [20, 2.6, 4], volume: 11, color: '#1b5853', opacity: 0.46, speed: 0.04, drift: 0.22 },
  ]
  // Close to the lens: thin, soft veils that slide past faster than everything else.
  const veil: Bank[] = [
    { fx: -0.62, fy: 0.22, z: 5.2, seed: 41, segments: 9, bounds: [2.2, 0.9, 0.8], volume: 2, color: '#7fd8cc', opacity: 0.16, speed: 0.18, drift: 1 },
    { fx: 0.64, fy: -0.3, z: 6, seed: 42, segments: 9, bounds: [2.2, 0.9, 0.8], volume: 2, color: '#7fd8cc', opacity: 0.15, speed: 0.18, drift: 1.1 },
  ]
  const near: Bank[] = [
    { fx: -0.55, fy: -0.5, z: 2.5, seed: 7, segments: 10, bounds: [2.4, 1, 1], volume: 2.2, color: '#5bbcb1', opacity: 0.22, speed: 0.15, drift: 0.9 },
    { fx: 0.56, fy: 0.48, z: 2, seed: 8, segments: 10, bounds: [2.4, 1, 1], volume: 2.2, color: '#5bbcb1', opacity: 0.2, speed: 0.15, drift: 0.8 },
  ]
  // More, smaller puffs in wide, flat banks read as cloud; few big ones read as bokeh.
  // Sprite count is the main cost of the sky (every puff is a transparent, lit layer), so each bank
  // gets just enough puffs to read as cloud.
  const shape = (b: Bank): Bank => ({ ...b, segments: Math.round(b.segments * 1.05), volume: b.volume * 0.7, bounds: [b.bounds[0] * 1.25, b.bounds[1] * 0.75, b.bounds[2]] })
  // Phones: fewer puffs, but brighter and fuller, since the reading veil darkens the middle.
  if (tier === 'low') return [deep[0], far[0], far[2], between[0], between[1], mid[0], mid[1], mid[3], veil[0]].map(shape).map((b) => ({ ...b, segments: Math.round(b.segments * 0.62), opacity: Math.min(0.9, b.opacity * 1.25), color: lighten(b.color) }))
  if (tier === 'mid') return [...deep, ...far, ...between, ...mid, ...veil].map(shape)
  return [...deep, ...far, ...between, ...mid, ...near, ...veil].map(shape)
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

// The storm's palette for the clouds (material tint multiplies each bank's own teal).
const TINT_STORM = new THREE.Color(0.24, 0.3, 0.36)
const TINT_CALM = new THREE.Color(1.12, 1.1, 1.06)
const WHITE = new THREE.Color(1, 1, 1)
// Inner glow: deep burgundy that pulses under tension, a soft teal breath once it is calm.
const EM_STORM = new THREE.Color('#0e6f8a')
const EM_CALM = new THREE.Color('#1a6e64')
const EM_BASE = new THREE.Color('#062a28')
const cloudPhase = { value: 0 }
// Radiating glow pulses: soft light that swells inside a bank and spreads outward as it fades,
// one after another, never in step. Cold storm-blue leads under the storm, teal returns in the calm.
const PULSE_BURG = new THREE.Color('#2fb6d6')
const PULSE_TEAL = new THREE.Color('#3fe0cf')
const PULSE_CHAMP = new THREE.Color('#f3d9b0')
const BOLT_COLORS = [new THREE.Color('#e6fbff'), new THREE.Color('#d8fff8'), new THREE.Color('#fff3dc')]
const NO_BOLT = typeof location !== 'undefined' && new URLSearchParams(location.search).has('nobolt')
const PIN_BOLT = typeof location !== 'undefined' ? Number(new URLSearchParams(location.search).get('bolt') ?? 0) : 0

export default function CloudLayer({ tier, reduced, camZ, fov }: { tier: Tier; reduced: boolean; camZ: number; fov: number }) {
  const texture = cloudUrl
  const list = useMemo(() => banks(tier), [tier])
  const refs = useRef<(THREE.Group | null)[]>([])
  const { size } = useThree()
  const st = useRef({ t: 0, sy: 0, fin: 0, post: 0, intro: 0, storm: 0, calm: 0, ph: 0, boltAt: -9, next: 4, bank: 0, flick: 0, fv: -1, flashEl: null as HTMLElement | null })
  const clouds = useRef<THREE.Group>(null)
  const bolt = useRef<THREE.PointLight>(null)
  const tint = useMemo(() => new THREE.Color(), [])
  const pulses = useRef<THREE.InstancedMesh>(null)
  const perBank = tier === 'low' ? 2 : 3
  const pulseList = useMemo(() => {
    let x = 7.3
    const r = () => { x = (x * 9301 + 49297) % 233280; return x / 233280 }
    return list.flatMap((b, bi) => Array.from({ length: perBank }, (_, k) => ({
      bank: bi, ox: (r() * 2 - 1) * 0.55, oy: (r() * 2 - 1) * 0.5, phase: r(), period: 7 + r() * 7.8,
      size: 0.9 + r() * 0.8, hue: (bi * perBank + k) * 0.618 % 1,
    })))
  }, [list, perBank])
  const pm = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color() }), [])
  const glow = useMemo(() => bakedTexture(cloudGlowUrl), [])
  const moon = useRef<THREE.Mesh>(null)
  // The champagne rim is a detail layer: only where the GPU has headroom.
  const rimmed = (b: Bank) => b.z > -12 && tier === 'high'
  const limit = list.reduce((a, b) => a + Math.ceil(b.segments * 0.6) + Math.ceil(b.segments * 0.4) + (rimmed(b) ? Math.max(3, Math.ceil(b.segments * 0.15)) : 0), 0)

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = st.current
    s.storm += (motion.storm - s.storm) * (1 - Math.exp(-dt * 1.4))
    s.calm += (motion.calm - s.calm) * (1 - Math.exp(-dt * 1.0))
    const storm = reduced ? Math.min(s.storm, 0.4) : s.storm
    const calm = s.calm
    // The wind picks up with the tension and falls away completely after it.
    if (!reduced) s.t += dt * (1 + storm * storm * 0.8) * (1 - calm * 0.35)
    // The clouds' own pulse: the slow breath, quickening like a heartbeat as the storm gathers.
    s.ph += dt * (Math.PI * 2) / (10.9 * (1 - storm * 0.5))
    const pulse = 0.5 - 0.5 * Math.cos(s.ph)

    // Lightning, felt more than seen: light flickers inside a bank, never a bolt across the page.
    // It comes more often as the storm rises, and never once it has passed.
    const now = state.clock.elapsedTime
    if (!reduced && !NO_BOLT && storm > 0.32 && now > s.next) {
      s.boltAt = now
      s.bank = Math.floor(Math.random() * list.length)
      s.flick = Math.random()
      const g0 = refs.current[s.bank]
      const el = (s.flashEl ??= document.querySelector<HTMLElement>('.stage-flash'))
      if (g0 && el) {
        const v = g0.position.clone().project(state.camera)
        el.style.setProperty('--bx', `${Math.round((v.x * 0.5 + 0.5) * 100)}%`)
        el.style.setProperty('--by', `${Math.round((0.5 - v.y * 0.5) * 100)}%`)
      }
      const rate = 0.05 + Math.pow((storm - 0.32) / 0.68, 2) * 0.22
      s.next = now + 0.6 + (-Math.log(1 - Math.random()) / rate)
    }
    const a = now - s.boltAt
    let bl = a < 0 ? 0 : Math.exp(-a * 11) + (a > 0.13 ? 0.7 * Math.exp(-(a - 0.13) * 9) : 0) + (s.flick > 0.5 && a > 0.31 ? 0.45 * Math.exp(-(a - 0.31) * 12) : 0)
    if (PIN_BOLT) bl = PIN_BOLT
    bl *= Math.min(1, storm * 1.6) * (1 - calm)
    if (PIN_BOLT) bl = PIN_BOLT
    motion.bolt = bl
    // The same flash, seen through the sky (one composited opacity write, only when it changes).
    const fv = Math.round(bl * 40) / 40
    if (fv !== s.fv) {
      s.fv = fv
      const el = (s.flashEl ??= document.querySelector<HTMLElement>('.stage-flash'))
      if (el) el.style.opacity = String(fv)
    }
    const mat = (clouds.current?.children.find((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh | undefined)?.material as THREE.MeshLambertMaterial | undefined
    if (mat && !mat.userData.alive) {
      // Glow that rolls through the banks: each puff glows on its own phase, set by where it sits,
      // so light swells and travels inside the clouds like something breathing.
      mat.userData.alive = true
      const prev = mat.onBeforeCompile
      mat.onBeforeCompile = (shader, r) => {
        prev.call(mat, shader, r)
        shader.uniforms.uPT = cloudPhase
        shader.vertexShader = 'varying float vPk;\n' + shader.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>
          vec3 ip = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          vPk = dot(ip, vec3(0.19, 0.31, 0.07));`)
        shader.fragmentShader = 'uniform float uPT;\nvarying float vPk;\n' + shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          float pk = 0.5 + 0.5 * sin(uPT + vPk);
          totalEmissiveRadiance *= 0.2 + 1.7 * pk * pk;`)
      }
      mat.needsUpdate = true
    }
    cloudPhase.value = s.ph * 1.0 + s.t * 0.6
    if (mat) {
      tint.copy(WHITE).lerp(TINT_STORM, storm * 0.92).lerp(TINT_CALM, calm)
      mat.color.copy(tint)
      mat.emissive.copy(EM_BASE).lerp(EM_STORM, Math.min(1, storm * 1.2)).lerp(EM_CALM, calm)
      mat.emissiveIntensity = (0.25 + 0.75 * pulse) * (0.45 + storm * 1.6 + calm * 0.4) + bl * 1.4
      mat.opacity = 1 - calm * 0.12
    }
    s.intro = Math.min(1, introElapsed() / 2600)
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
      // The break blows the sky open: every bank is thrown outward, then drifts back.
      const blast = burst.age >= 0 ? (1 - Math.exp(-burst.age * 3)) * Math.exp(-burst.age * 0.45) : 0
      const part = Math.sign(b.fx || 1) * vw * (0.35 * easeOut(s.fin * 1.4) - 0.16 * storm - 0.1 * burst.press * (burst.age < 0 ? 1 : 0) + 0.07 * calm + 0.3 * blast)
      const bob = Math.sin(s.t * 0.11 * b.drift + b.seed * 5) * vh * 0.012
      g.position.set(b.fx * vw * (narrow ? 0.85 : 1) + wind + part, y + bob, b.z - (1 - intro) * 6)
      // Banks billow up and press in under the storm, and swell gently with the breath.
      const sc = (narrow ? 0.95 : 1) * (1 - s.post * 0.4) * (1 + storm * 0.28 + (pulse - 0.5) * 0.035 * (1 + storm) + blast * 0.18)
      g.scale.setScalar(sc)
      g.position.y -= Math.sign(b.fy || 1) * storm * vh * 0.05
      if (i === s.bank && bolt.current) bolt.current.position.set(g.position.x, g.position.y + bl * 0.4, g.position.z + 2.5)
      g.visible = s.post < 0.98
    })
    const fade = (1 - s.post) * intro
    const mz = -34
    const mvh = 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * (camZ - mz)
    // Each pulse: born small and bright inside its bank, it widens and dims as it radiates out.
    const ph = pulses.current
    if (ph) {
      const amp = (0.13 + storm * 0.3 + calm * 0.08) * fade
      pulseList.forEach((pu, i) => {
        const g = refs.current[pu.bank]
        const bk = list[pu.bank]
        if (!g || !bk) return
        const life = (s.t / (pu.period * (1 - storm * 0.3)) + pu.phase) % 1
        const env = Math.pow(Math.sin(Math.PI * life), 2) * (1 - life * 0.35)
        const sc = g.scale.x * bk.bounds[0] * pu.size * (0.35 + life * 0.95) * (bk.z > -15 ? 0.75 : 1)
        pm.p.set(g.position.x + pu.ox * bk.bounds[0] * g.scale.x, g.position.y + pu.oy * bk.bounds[1] * 2 * g.scale.x, g.position.z + 0.6)
        pm.s.set(sc, sc * 0.62, 1)
        pm.m.compose(pm.p, state.camera.quaternion, pm.s)
        ph.setMatrixAt(i, pm.m)
        // Burgundy share rises with the storm; the calm hands the light back to teal, with a warm champagne thread.
        const burg = pu.hue < 0.382 + storm * 0.45 - calm * 0.3
        pm.c.copy(burg ? PULSE_BURG : pu.hue > 0.9 ? PULSE_CHAMP : PULSE_TEAL).multiplyScalar(env * amp * (bk.z > -15 ? 0.6 : 1) + (i % 5 === s.bank % 5 ? bl * 0.3 : 0))
        ph.setColorAt(i, pm.c)
      })
      ph.instanceMatrix.needsUpdate = true
      if (ph.instanceColor) ph.instanceColor.needsUpdate = true
    }
    if (bolt.current) {
      bolt.current.intensity = bl * 1500
      bolt.current.color.copy(BOLT_COLORS[s.bank % 3])
    }
    if (moon.current) {
      // Slow scroll drift and a faint breath, so the light feels alive behind the banks.
      moon.current.position.set(mvh * aspect * (narrow ? 0.05 : -0.12), mvh * (0.22 - s.sy * 0.03), mz)
      const br = 1 + Math.sin(s.t * 0.2) * 0.03
      moon.current.scale.set(mvh * aspect * (narrow ? 1.2 : 0.95) * br, mvh * (narrow ? 0.55 : 0.6) * br, 1)
      // The storm hides the light; the calm brings it back brighter than before.
      ;(moon.current.material as THREE.MeshBasicMaterial).opacity = (0.2 * (1 - storm * 0.75) + calm * 0.12 + bl * 0.25) * fade * (1 - s.fin * 0.6)
    }
  })

  return (
    <>
    <mesh ref={moon} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={glow} color="#bfeee4" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
    <instancedMesh ref={(m) => { pulses.current = m; if (m && !m.instanceColor) { const k = new THREE.Color(0, 0, 0); for (let i = 0; i < m.count; i++) m.setColorAt(i, k) } }} args={[undefined, undefined, pulseList.length]} frustumCulled={false} renderOrder={1}>
      <planeGeometry />
      <meshBasicMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </instancedMesh>
    <pointLight ref={bolt} intensity={0} distance={34} decay={1.6} />
    <Clouds ref={clouds} material={THREE.MeshLambertMaterial} texture={texture} limit={limit} frustumCulled={false}>
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
            fade={18}
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
            fade={18}
            concentrate="inside"
          />
          {rimmed(b) && (
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
              fade={18}
              concentrate="inside"
            />
          )}
        </group>
      ))}
    </Clouds>
    </>
  )
}
