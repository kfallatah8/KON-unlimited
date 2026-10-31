// The gem stream: faceted teal gemstones that orbit the hero, drift with the scroll, part around
// the pointer, and gather into the word "KON" at the end of the page.
// One InstancedMesh per cut; all motion is computed per frame from scroll + time (no React state).
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { Tier } from '../lib/capabilities'
import { introElapsed, motion } from '../state/store'
import { drawKon, konLayout, KON, measureKon } from './konGlyphs'
import CloudLayer from './CloudLayer'
import { SafeBoundary } from '../components/SafeBoundary'
import { bakedTexture } from './texUtil'
import gemGlowUrl from '../assets/gem-glow.png'

const CAM_Z = 14
const FOV = 34
const TEALS = ['#012f2e', '#023f3c', '#04524d', '#066560', '#087a72', '#0b9184', '#14ab9a', '#3fd0bd', '#034a52', '#056470']

/** Lathe profile (radius, height) from culet to table → faceted gem. */
function cut(profile: [number, number][], segments: number, rot = 0) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments, rot)
  const flat = g.toNonIndexed()
  flat.computeVertexNormals()
  g.dispose()
  return flat
}
const CUTS = [
  // round brilliant
  () => cut([[0, -0.95], [1, 0], [1, 0.08], [0.6, 0.42], [0, 0.42]], 8),
  // emerald / square step cut
  () => cut([[0, -0.62], [0.55, -0.32], [1, 0], [1, 0.12], [0.72, 0.36], [0, 0.36]], 4, Math.PI / 4),
  // tall pear / marquise
  () => cut([[0, -1.35], [0.72, 0], [0.72, 0.07], [0.42, 0.34], [0, 0.34]], 6),
]

function smooth(x: number) {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}
function easeInOut(x: number) {
  const t = Math.min(1, Math.max(0, x))
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Evenly spread points inside the glyphs of "KON", normalised so width = 1. */
function konPoints(n: number): [number, number][] {
  const { W, H } = KON
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#fff'
  const { total } = measureKon(ctx)
  drawKon(ctx, (W - total) / 2, (l, x, y) => ctx.fillText(l, x, y))
  const data = ctx.getImageData(0, 0, W, H).data
  const cand: [number, number][] = []
  // Inset from the glyph edge a little, so gems sit inside the drawn outline.
  const inside = (x: number, y: number) => data[(y * W + x) * 4 + 3] > 140
  for (let y = 12; y < H - 12; y += 4) for (let x = 12; x < W - 12; x += 4)
    if (inside(x, y) && inside(x - 12, y) && inside(x + 12, y) && inside(x, y - 12) && inside(x, y + 12) && inside(x - 9, y - 9) && inside(x + 9, y + 9) && inside(x - 9, y + 9) && inside(x + 9, y - 9)) cand.push([x, y])
  if (!cand.length) return Array.from({ length: n }, () => [0, 0])
  // Farthest-point sampling: even coverage with few points.
  const picked: [number, number][] = [cand[0]]
  const dist = new Float32Array(cand.length).fill(Infinity)
  for (let k = 1; k < n; k++) {
    const [lx, ly] = picked[k - 1]
    let best = 0, bestD = -1
    for (let i = 0; i < cand.length; i++) {
      const d = (cand[i][0] - lx) ** 2 + (cand[i][1] - ly) ** 2
      if (d < dist[i]) dist[i] = d
      if (dist[i] > bestD) { bestD = dist[i]; best = i }
    }
    picked.push(cand[best])
  }
  return picked.map(([px, py]) => [(px - W / 2) / total, -(py - H / 2) / total])
}

interface Gem {
  cut: number
  idx: number
  seed: number
  lane: number
  baseY: number
  depth: number
  speed: number
  size: number
  stretch: number
  axis: THREE.Vector3
  spin: number
  angle: number
  ring: number
  ringA: number
  target: [number, number]
  /** Small personal tilt in the word, so each gem catches the light at its own angle. */
  tilt: THREE.Quaternion
  twinkle: number
  ox: number
  oy: number
}

const rimUniform = { value: 0.9 }

const HALO = new THREE.Color('#2fe0cb')

function makeMaterial() {
  const m = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0.45,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.4,
    iridescenceIOR: 1.35,
    ior: 2.2,
    specularIntensity: 1,
    envMapIntensity: 2.1,
    emissive: '#03302e',
    emissiveIntensity: 0.5,
    flatShading: true,
  })
  // Fresnel rim in each gem's own shade: the "glow from inside" read, cheap enough for phones.
  m.onBeforeCompile = (s) => {
    s.uniforms.uRim = rimUniform
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uRim;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float fr = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 2.2);
        #ifdef USE_INSTANCING_COLOR
          vec3 gemTint = vColor.rgb;
        #else
          vec3 gemTint = vec3(0.07, 0.65, 0.59);
        #endif
        totalEmissiveRadiance += gemTint * (0.18 + fr * 1.7) * uRim;`,
      )
  }
  return m
}

function Gems({ count, reduced }: { count: number; reduced: boolean }) {
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([])
  const light = useRef<THREE.PointLight>(null)
  const { camera, size } = useThree()
  const geos = useMemo(() => CUTS.map((f) => f()), [])
  const mats = useMemo(() => CUTS.map(() => makeMaterial()), [])
  const halo = useRef<THREE.InstancedMesh>(null)
  const haloGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const haloMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: bakedTexture(gemGlowUrl), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), [])
  const hc = useMemo(() => new THREE.Color(), [])
  const counts = useMemo(() => [Math.round(count * 0.5), Math.round(count * 0.3), count - Math.round(count * 0.5) - Math.round(count * 0.3)], [count])

  const gems = useMemo(() => {
    const r = mulberry(7)
    const pts = konPoints(count)
    // Shuffle targets so neighbours in the stream don't land as neighbours in the word.
    for (let i = pts.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[pts[i], pts[j]] = [pts[j], pts[i]]
    }
    const list: Gem[] = []
    let k = 0
    counts.forEach((c, cutI) => {
      for (let i = 0; i < c; i++) {
        const side = r() < 0.5 ? -1 : 1
        list.push({
          cut: cutI,
          idx: i,
          seed: r(),
          lane: side * (0.28 + 0.72 * Math.pow(r(), 0.8)),
          baseY: r(),
          depth: -7 + r() * 8.5,
          speed: 0.55 + r() * 0.9,
          size: 0.12 + Math.pow(r(), 2.4) * 0.36,
          stretch: 0.85 + r() * 0.3,
          axis: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
          spin: (0.15 + r() * 0.5) * (r() < 0.5 ? -1 : 1),
          angle: r() * Math.PI * 2,
          ring: 0.7 + r() * 0.45,
          ringA: r() * Math.PI * 2,
          target: pts[k++] ?? [0, 0],
          tilt: new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.9, (r() - 0.5) * 0.9, (r() - 0.5) * 1.2)),
          twinkle: 0.8 + r() * 1.6,
          ox: 0,
          oy: 0,
        })
      }
    })
    return list
  }, [count, counts])

  // Colours are attached before the first render so the shader compiles with instance colours.
  const base = useRef<Float32Array[]>([])
  const paint = (m: THREE.InstancedMesh | null, i: number) => {
    meshes.current[i] = m
    if (!m || m.instanceColor) return
    const c = new THREE.Color()
    const r = mulberry((i + 1) * 131)
    for (let k = 0; k < m.count; k++) m.setColorAt(k, c.set(TEALS[Math.floor(r() * TEALS.length)]))
    base.current[i] = Float32Array.from(m.instanceColor!.array as Float32Array)
  }

  const tmp = useMemo(() => ({
    m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), qa: new THREE.Quaternion(),
    face: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.42, 0, 0)), s: new THREE.Vector3(), t: 0, sy: 0, fin: 0, hero: 0, post: 0, intro: 0,
  }), [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    if (!reduced) tmp.t += dt
    const t = tmp.t
    // Opening: gems bloom in one by one over ~2.5s instead of popping into place. The clock starts
    // once shaders are compiled and the page opening has begun, so the two move together and no
    // compile stall eats into the animation. Wall-clock based, so slow frames can't stretch it.
    tmp.intro = reduced ? 1.6 : Math.min(1.6, introElapsed() / 2400)
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z
    const vw = vh * (size.width / size.height)
    const narrow = size.width < 700

    // Damped inputs so the stream glides even with discrete wheel steps.
    const k = 1 - Math.exp(-dt * 6)
    tmp.sy += (window.scrollY / window.innerHeight - tmp.sy) * k
    tmp.fin += (motion.finale - tmp.fin) * (1 - Math.exp(-dt * 3.2))
    tmp.hero += (motion.heroOut - tmp.hero) * k
    tmp.post += (motion.post - tmp.post) * k
    const post = easeInOut(tmp.post)
    const hero = 1 - easeInOut(tmp.hero)
    const fin = tmp.fin
    const mid = Math.min(tmp.hero, 1) * (1 - fin)
    rimUniform.value = 0.75 - mid * 0.05 + fin * 0.3 - post * 0.35 + motion.glow * 0.3

    const px = (motion.px * vw) / 2
    const py = (motion.py * vh) / 2
    if (light.current) {
      light.current.position.set(px, py, 3.2)
      light.current.intensity = 60 + fin * 40
    }
    const { width: konW, centerY } = konLayout(vw, vh, narrow, size.height < 520)
    const konScale = konW * 0.02 * Math.sqrt(210 / gems.length)
    // A light sweep that travels across the finished word.
    const sweepX = ((t * 0.22) % 1.7) - 0.85
    const shimmer = fin > 0.6 && !reduced
    const R = narrow ? 1.4 : 2.1
    // Dense words overlap halos, so each one gives a little less as the count grows.
    const hGain = Math.sqrt(210 / gems.length) * (narrow ? 0.9 : 1)
    let gi = 0

    for (const g of gems) {
      // 1 · stream: lanes either side of the reading column, wrapping vertically.
      const span = vh * 1.5
      let y = ((g.baseY * span + tmp.sy * vh * 0.32 * g.speed + t * 0.055 * g.speed) % span) - span / 2
      if (y < -span / 2) y += span
      // Mid-page the stream hugs the edges and sinks back so the copy has a calm centre.
      const laneW = (narrow ? vw * 0.6 : vw * 0.5) * (1 + mid * 0.18)
      const lane = Math.sign(g.lane) * (Math.abs(g.lane) + (1 - Math.abs(g.lane)) * mid * (narrow ? 0.2 : 0.45))
      let x = lane * laneW + Math.sin(t * 0.22 + g.seed * 9) * 0.35
      let z = g.depth - mid * 2.2 + Math.sin(t * 0.3 + g.seed * 5) * 0.4
      // 2 · hero: a slow elliptical orbit framing the headline.
      if (hero > 0.001) {
        const a = g.ringA + t * 0.045 * (g.seed < 0.5 ? 1 : -0.7)
        // Phones: the text fills the middle, so the orbit runs along the screen edges instead.
        // Portrait tablets too: their headline is as wide as the screen.
        const edge = narrow || size.width / size.height < 0.9
        const rr = 0.25 + g.ring
        const hx = Math.cos(a) * rr * (edge ? vw * 0.5 : Math.min(vw * 0.46, vh * 0.72) * 1.15)
        const hy = Math.sin(a) * rr * (edge ? vh * 0.42 : Math.min(vw * 0.46, vh * 0.72) * 0.62)
        const hz = Math.sin(a * 2 + g.seed * 6) * 1.8 - (edge ? 3.4 : 2.6)
        x += (hx - x) * hero
        y += (hy - y) * hero
        z += (hz - z) * hero
      }
      // 3 · finale: each gem leaves on its own beat and settles into a letter.
      // Every gem has landed by ~85% of the finale, so the resting word is always complete.
      const f = easeInOut(fin * 1.9 - g.seed * 0.6)
      if (f > 0) {
        x += (g.target[0] * konW - x) * f
        y += (g.target[1] * konW + centerY + post * vh * 0.32 - y) * f
        z += (Math.sin(t * 0.8 + g.seed * 12) * 0.08 - post * 5 - z) * f
      }
      // Pointer parts the stream (projected onto the z=0 plane so depth feels right).
      const persp = CAM_Z / (CAM_Z - z)
      const dx = x * persp - px
      const dy = y * persp - py
      const d = Math.hypot(dx, dy) + 1e-4
      const push = d < R ? Math.pow(1 - d / R, 2) * (1.5 - f * 1.4) : 0
      const kk = 1 - Math.exp(-dt * 5)
      g.ox += ((dx / d) * push - g.ox) * kk
      g.oy += ((dy / d) * push - g.oy) * kk
      tmp.p.set(x + g.ox / persp, y + g.oy / persp, z)

      // Rotation: tumbling in the stream, turning its table to the viewer in the word.
      g.angle += dt * (g.spin + Math.min(Math.abs(motion.vel) * 0.012, 1.2) * Math.sign(g.spin)) * (reduced ? 0 : 1)
      tmp.qa.setFromAxisAngle(g.axis, g.angle)
      if (f > 0) {
        tmp.q.copy(tmp.face).multiply(g.tilt).multiply(tmp.q2.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, t * 0.22 + g.seed * 6))
        tmp.qa.slerp(tmp.q, f)
      }
      const grow = smooth((tmp.intro - g.seed * 0.6) / 0.7)
      const sz = grow * THREE.MathUtils.lerp(g.size * (narrow ? 0.8 : 1), konScale, f) * (1 - hero * 0.1) * (1 - post * 0.97)
      tmp.s.set(sz, sz * g.stretch, sz)
      tmp.m.compose(tmp.p, tmp.qa, tmp.s)
      const mesh = meshes.current[g.cut]
      mesh?.setMatrixAt(g.idx, tmp.m)
      if (mesh?.instanceColor && base.current[g.cut]) {
        const b = base.current[g.cut]
        const a = mesh.instanceColor.array as Float32Array
        const o = g.idx * 3
        // Light sweep across the word, plus an occasional facet catching the light.
        const sweep = shimmer ? Math.exp(-((g.target[0] - sweepX) ** 2) * 60) * 1.3 : 0
        const spark = shimmer ? Math.pow(Math.max(0, Math.sin(t * g.twinkle + g.seed * 40)), 28) * 2.2 : 0
        const sw = (sweep + spark) * f
        a[o] = b[o] * (1 + sw); a[o + 1] = b[o + 1] * (1 + sw); a[o + 2] = b[o + 2] * (1 + sw)
      }
      // Halo: faint around the stream, a warm bloom around each gem of the finished word.
      const h = halo.current
      if (h) {
        const sweepH = shimmer ? Math.exp(-((g.target[0] - sweepX) ** 2) * 40) : 0
        const glow = (0.05 + mid * 0.02 + f * (0.16 + sweepH * 0.3) + motion.glow * 0.08) * (1 - post * 0.9) * hGain
        tmp.p.z -= 0.05
        tmp.s.setScalar(sz * (4.2 + f * 1.4))
        tmp.m.compose(tmp.p, camera.quaternion, tmp.s)
        h.setMatrixAt(gi, tmp.m)
        h.setColorAt(gi, hc.copy(HALO).multiplyScalar(glow))
      }
      gi++
    }
    if (halo.current) {
      halo.current.instanceMatrix.needsUpdate = true
      if (halo.current.instanceColor) halo.current.instanceColor.needsUpdate = true
    }
    meshes.current.forEach((m) => {
      if (!m) return
      m.instanceMatrix.needsUpdate = true
      if (m.instanceColor && (shimmer || fin > 0.01)) m.instanceColor.needsUpdate = true
    })
    // A breath of parallax, switched off as the word forms so it lines up with its outline.
    camera.position.x += (motion.px * 0.6 * (1 - fin) - camera.position.x) * k
    camera.position.y += (motion.py * 0.35 * (1 - fin) - camera.position.y) * k
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      {counts.map((c, i) => (
        <instancedMesh key={i} ref={(m) => paint(m, i)} args={[geos[i], mats[i], c]} frustumCulled={false} />
      ))}
      <instancedMesh ref={halo} args={[haloGeo, haloMat, gems.length]} frustumCulled={false} renderOrder={2} />
      {/* Reaches the nearer cloud banks too, so they glow softly where the pointer passes. */}
      <pointLight ref={light} color="#7ff3e6" distance={13} decay={2} />
    </>
  )
}

/** Compiles every shader up front, then fades the canvas in two frames later, so the entrance
 *  never stutters on first-use shader compiles. */
function Warmup() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    gl.compile(scene, camera)
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => {
        motion.live = performance.now()
        gl.domElement.closest('.gem-canvas')?.classList.add('is-live')
      })
    })
    return () => cancelAnimationFrame(id)
  }, [gl, scene, camera])
  return null
}

export default function GemField({ tier, reduced }: { tier: Tier; reduced: boolean }) {
  const count = tier === 'high' ? 330 : tier === 'mid' ? 250 : 170
  // Bloom only where the GPU has headroom; the fresnel rim carries the glow elsewhere.
  const [rich, setRich] = useState(tier === 'high')
  const [dpr, setDpr] = useState(tier === 'high' ? 1.5 : tier === 'mid' ? 1.25 : 1.25)
  return (
    <Canvas
      className="gem-canvas"
      dpr={dpr}
      camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: !rich, alpha: true, powerPreference: 'high-performance', stencil: false }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Drop resolution, then bloom, if frames start to slip: smoothness beats sparkle. */}
      <PerformanceMonitor
        onDecline={() => {
          setDpr((d) => Math.max(1, d - 0.25))
          if (dpr <= 1.25) setRich(false)
        }}
      />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 8]} intensity={1.6} color="#dffcf7" />
      <directionalLight position={[-6, -3, 4]} intensity={0.8} color="#2bd1c0" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={4} color="#ffffff" position={[0, 5, -6]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={3} color="#9ff7ec" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#e9d9b0" position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={3} color="#3fe0cf" position={[0, -4, 4]} scale={4} />
      </Environment>
      <SafeBoundary>
        <Suspense fallback={null}>
          <CloudLayer tier={tier} reduced={reduced} camZ={CAM_Z} fov={FOV} />
        </Suspense>
      </SafeBoundary>
      <Gems count={count} reduced={reduced} />
      <Warmup />
      {rich && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.72} luminanceThreshold={0.55} luminanceSmoothing={0.25} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
