// The gem stream: faceted teal gemstones that orbit the hero, drift with the scroll, part around
// the pointer, and gather into the word "KON" at the end of the page.
// One InstancedMesh per cut; all motion is computed per frame from scroll + time (no React state).
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { Tier } from '../lib/capabilities'
import { introElapsed, motion } from '../state/store'
import { drawKon, konLayout, KON, measureKon } from './konGlyphs'
import { bakedTexture } from './texUtil'
import gemGlowUrl from '../assets/gem-glow.png'
import { gemUniforms, makeGemMaterial } from './gemMaterial'
import { CUTS } from './cuts'
import Trio from './Trio'
import BurstFx, { burst } from './BurstFx'

// QA: ?hold=2.5 freezes the opening clock at 2.5 s (to inspect the rock stage).
const HOLD = typeof location !== 'undefined' ? parseFloat(new URLSearchParams(location.search).get('hold') ?? '-1') : -1
const CAM_Z = 14
const FOV = 34
// KON Tempest, teal only: one family of stones in golden-ratio layers. Deep teal leads (61.8%),
// bright aqua answers (23.6%), and clear "diamond" stones (14.6%) carry the light: the coal's
// promise kept. A thread of champagne runs through the clear stones, the brand's own gold.
const TEALS = ['#012f2e', '#023f3c', '#04524d', '#066560', '#087a72', '#0b9184', '#034a52', '#056470']
const AQUAS = ['#14ab9a', '#2cc4b2', '#3fd0bd', '#5fe3d2']
const CLEAR = ['#bff5ec', '#d9fbf6', '#eefcf9', '#e9dcb8']
const PHI = 0.6180339887
function stoneColor(r: () => number) {
  const x = r()
  const set = x < PHI ? TEALS : x < PHI + (1 - PHI) * PHI ? AQUAS : CLEAR
  return set[Math.floor(r() * set.length)]
}

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

/** Evenly spread points inside the glyphs of "KON", normalised so width = 1, plus their spacing. */
function konPoints(n: number): { pts: [number, number][]; gap: number } {
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
  const E = 9, D = 6
  for (let y = 12; y < H - 12; y += 3) for (let x = 12; x < W - 12; x += 3)
    if (inside(x, y) && inside(x - E, y) && inside(x + E, y) && inside(x, y - E) && inside(x, y + E) && inside(x - D, y - D) && inside(x + D, y + D) && inside(x - D, y + D) && inside(x + D, y - D)) cand.push([x, y])
  if (!cand.length) return { pts: Array.from({ length: n }, () => [0, 0]), gap: 0.02 }
  // Farthest-point sampling: even coverage with few points.
  const picked: [number, number][] = [cand[0]]
  const dist = new Float32Array(cand.length).fill(Infinity)
  let gap = 0
  for (let k = 1; k < n; k++) {
    const [lx, ly] = picked[k - 1]
    let best = 0, bestD = -1
    for (let i = 0; i < cand.length; i++) {
      const d = (cand[i][0] - lx) ** 2 + (cand[i][1] - ly) ** 2
      if (d < dist[i]) dist[i] = d
      if (dist[i] > bestD) { bestD = dist[i]; best = i }
    }
    gap = Math.sqrt(bestD)
    picked.push(cand[best])
  }
  return { pts: picked.map(([px, py]) => [(px - W / 2) / total, -(py - H / 2) / total]), gap: gap / total }
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
  /** Hero stones: a few large, slow stones that frame the headline, then join the stream. */
  anchor?: [number, number, number, number]
  ox: number
  oy: number
  /** Depth stratum: 0 far (deep among the distant clouds), 1 the main stream, 2 near (close to the lens). */
  layer: 0 | 1 | 2
  /** Its place inside the compressed core of coal (unit ball), and how far it flies when the core breaks. */
  cx: number
  cy: number
  cz: number
  fly: number
  /** Filtered position, so a change of state (core, burst, back) is always a glide, never a jump. */
  fx: number
  fy: number
  fz: number
  wordOnly?: boolean
}

const rimUniform = gemUniforms.uRim


const HALO = new THREE.Color('#2fe0cb')

function Gems({ count: streamCount, word, reduced }: { count: number; word: number; reduced: boolean }) {
  // The stream stays sparse; extra stones appear only as the word forms, so the letters read crisply.
  const count = Math.max(streamCount, word)
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([])
  const light = useRef<THREE.PointLight>(null)
  const { camera, size, scene } = useThree()
  const geos = useMemo(() => CUTS.map((f) => f()), [])
  const states = useRef<THREE.InstancedBufferAttribute[]>([])
  const mats = useMemo(() => CUTS.map(() => makeGemMaterial()), [])
  const halo = useRef<THREE.InstancedMesh>(null)
  const haloGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const haloMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: bakedTexture(gemGlowUrl), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), [])
  const hc = useMemo(() => new THREE.Color(), [])
  const counts = useMemo(() => [Math.round(count * 0.5), Math.round(count * 0.3), count - Math.round(count * 0.5) - Math.round(count * 0.3)], [count])

  useMemo(() => {
    states.current = counts.map((c, i) => {
      const a = new THREE.InstancedBufferAttribute(new Float32Array(c * 2).fill(0), 2)
      for (let k = 0; k < c; k++) a.setX(k, 1)
      a.setUsage(THREE.DynamicDrawUsage)
      geos[i].setAttribute('aState', a)
      return a
    })
  }, [counts, geos])

  const wordGap = useRef(0.02)
  const gems = useMemo(() => {
    const r = mulberry(7)
    const { pts, gap } = konPoints(count)
    wordGap.current = gap
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
        // Depth of field: about a fifth of the stones sit far back among the distant banks, a few
        // drift close to the lens at the edges, the rest form the main stream. Clouds sit between.
        const lr = r()
        const layer: 0 | 1 | 2 = lr < 0.22 ? 0 : lr > 0.9 ? 2 : 1
        const lane0 = side * (0.28 + 0.72 * Math.pow(r(), 0.8))
        list.push({
          layer,
          cut: cutI,
          idx: i,
          seed: r(),
          lane: layer === 2 ? side * (0.78 + 0.22 * Math.abs(lane0)) : layer === 0 ? side * (0.1 + 0.9 * Math.abs(lane0)) : lane0,
          baseY: r(),
          depth: layer === 0 ? -24 + r() * 12 : layer === 2 ? 2.6 + r() * 3 : -7 + r() * 8.5,
          speed: 0.55 + r() * 0.9,
          size: 0.1 + Math.pow(r(), 2.6) * 0.44,
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
          cx: 0, cy: 0, cz: 0,
          fly: r(),
          fx: NaN, fy: 0, fz: 0,
        })
      }
    })
    // Four hero stones (two brilliants, a step cut, a pear): x, y as a fraction of the view, z, size.
    const anchors: [number, number, number, number][] = [
      [-0.44, 0.3, 1.6, 0.86], [0.43, -0.3, 0.9, 0.8], [0.35, 0.33, -3.5, 0.62], [-0.31, -0.36, -2.4, 0.56],
    ]
    const picks = [list.find((g) => g.cut === 0 && g.idx === 0), list.find((g) => g.cut === 1 && g.idx === 0), list.find((g) => g.cut === 2 && g.idx === 0), list.find((g) => g.cut === 0 && g.idx === 1)]
    picks.forEach((g, i) => { if (g) { g.anchor = anchors[i]; g.seed = 0.05 + i * 0.03 } })
    // Word-only stones: hidden in the stream, they grow in as they settle into a letter.
    const pool = list.filter((g) => !g.anchor)
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
    pool.slice(0, count - streamCount).forEach((g) => { g.wordOnly = true })
    // The core: a Fibonacci ball, denser toward the middle, so the coal reads as one solid mass.
    const N = list.length
    list.forEach((g, i) => {
      const yy = 1 - (2 * (i + 0.5)) / N
      const rr = Math.sqrt(1 - yy * yy)
      const th = i * 2.399963
      const rad = Math.cbrt(0.18 + 0.82 * r())
      g.cx = Math.cos(th) * rr * rad
      g.cy = yy * rad
      g.cz = Math.sin(th) * rr * rad
    })
    return list
  }, [count, counts, streamCount])

  // Colours are attached before the first render so the shader compiles with instance colours.
  const base = useRef<Float32Array[]>([])
  const paint = (m: THREE.InstancedMesh | null, i: number) => {
    meshes.current[i] = m
    if (!m || m.instanceColor) return
    const c = new THREE.Color()
    const r = mulberry((i + 1) * 131)
    for (let k = 0; k < m.count; k++) m.setColorAt(k, c.set(stoneColor(r)))
    base.current[i] = Float32Array.from(m.instanceColor!.array as Float32Array)
  }

  const tmp = useMemo(() => ({
    m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), qa: new THREE.Quaternion(),
    face: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.42, 0, 0)), s: new THREE.Vector3(), t: 0, sy: 0, fin: 0, hero: 0, post: 0, intro: 0, wt: 0, st: 0, cl: 0, gust: 0, pr: 0, cr: 0, burst: 0, shardsAt: 0, cz: CAM_Z,
  }), [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    if (!reduced) tmp.t += dt
    const t = tmp.t
    // The storm: tension winds the field up (faster, restless, pressed together); the release lets
    // it go. Both are damped so the change of mood is a long exhale, never a cut.
    tmp.st += (motion.storm - tmp.st) * (1 - Math.exp(-dt * 1.6))
    tmp.cl += (motion.calm - tmp.cl) * (1 - Math.exp(-dt * 1.1))
    // The pressure: every stone is drawn into one core of coal. Damped so the pull feels heavy.
    tmp.pr += ((reduced ? 0 : motion.press) - tmp.pr) * (1 - Math.exp(-dt * 2.4))
    const press = tmp.pr
    const pe = smooth(press)
    // The break: time-based, so the moment lands with full force however fast the visitor scrolls.
    const bAge = motion.burstAt ? (performance.now() - motion.burstAt) / 1000 : -1
    // The core spins faster as it is squeezed: a vortex, not a pile.
    if (!reduced) tmp.cr += dt * (0.15 + pe * 1.5) * (bAge < 0 ? 1 : 0)
    // Heartbeat at the peak: lub-dub, quickening as the pressure holds.
    const hbp = (tmp.t * (0.9 + pe * 0.5)) % 1
    const hb = press > 0.8 && bAge < 0 ? (Math.exp(-(((hbp - 0.05) / 0.05) ** 2)) + 0.65 * Math.exp(-(((hbp - 0.26) / 0.05) ** 2))) * smooth((press - 0.8) / 0.2) : 0
    // Slow motion after the break: the world exhales, then time returns to normal.
    const slow = bAge >= 0 ? 0.22 + 0.78 * smooth((bAge - 0.4) / 3.6) : 1
    const storm = reduced ? 0 : tmp.st
    const calm = tmp.cl
    if (!reduced) tmp.wt += dt * (1 + storm * storm * 0.9) * slow
    const wt = tmp.wt
    tmp.gust = Math.sin(wt * 0.9) * Math.sin(wt * 0.37 + 1.3)
    gemUniforms.uStorm.value = storm
    gemUniforms.uBolt.value = motion.bolt
    // The moment of release: a single, slow outward bloom as the pressure lets go.
    const release = Math.sin(Math.PI * Math.min(1, calm)) * (calm < 1 ? 1 : 0)
    gemUniforms.uTime.value = t
    // One shared breath, ~5.5 per minute (the slow, coherent rhythm that calms the body).
    // No idle breathing: the stones pulse once, only when a CTA is clicked (motion.rt).
    const cAge = motion.rt ? (performance.now() - motion.rt) / 1000 : 99
    const breath = reduced ? 0.5 : cAge < 1.8 ? 0.5 + 0.5 * Math.sin(Math.PI * (cAge / 1.8)) : 0.5
    gemUniforms.uBreath.value = breath
    motion.breath = breath
    const introSec = reduced ? 99 : HOLD >= 0 ? HOLD : introElapsed() / 1000
    // Ripple: a ring of light that travels out from the last tap.
    const rAge = motion.rt ? (performance.now() - motion.rt) / 1000 : 99
    if (scene.environment && gemUniforms.uEnv.value !== scene.environment) gemUniforms.uEnv.value = scene.environment
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
    // Each stone's girdle just meets its neighbours', so the letters read as solid, crisp strokes.
    const konScale = konW * wordGap.current * 0.7
    // A light sweep that travels across the finished word.
    const sweepX = ((t * 0.22) % 1.7) - 0.85
    const shimmer = fin > 0.6 && !reduced
    const R = narrow ? 1.4 : 2.1
    // Dense words overlap halos, so each one gives a little less as the count grows.
    const hGain = Math.sqrt(210 / streamCount) * (narrow ? 0.9 : 1)
    const wordGain = Math.sqrt(streamCount / gems.length)
    let gi = 0
    // The core of coal: centred under the opening line, tightening as the pressure peaks.
    const CR = (narrow ? 1.35 : 2.05) * (1 - 0.16 * pe) * (1 - 0.05 * hb)
    gemUniforms.uPress.value = bAge < 0 ? pe : pe * Math.exp(-bAge * 4)
    const coreY = narrow ? -0.35 : -0.25
    const cc = Math.cos(tmp.cr), cs = Math.sin(tmp.cr)
    const lpk = 1 - Math.exp(-dt * (bAge >= 0 && bAge < 1.4 ? 26 : 8))

    for (const g of gems) {
      // 1 · stream: lanes either side of the reading column, wrapping vertically.
      // Far and near strata are laid out in screen space, then pushed to their depth, so they fill
      // the frame at any distance; scroll parallax is slower far away and faster near the lens.
      const P = g.layer === 1 ? 1 : (CAM_Z - g.depth) / CAM_Z
      const par = g.layer === 0 ? 0.42 : g.layer === 2 ? 1.7 : 1
      const span = vh * 1.5 * P
      let y = ((g.baseY * span + tmp.sy * vh * 0.32 * g.speed * par * P + wt * 0.055 * g.speed * P) % span) - span / 2
      if (y < -span / 2) y += span
      // Mid-page the stream hugs the edges and sinks back so the copy has a calm centre.
      const laneW = (narrow ? vw * 0.6 : vw * 0.5) * (1 + mid * 0.18)
      const lane = Math.sign(g.lane) * (Math.abs(g.lane) + (1 - Math.abs(g.lane)) * mid * (narrow ? 0.2 : 0.45))
      let x = (g.layer === 1 ? lane * laneW : g.lane * vw * 0.52) * P + Math.sin(wt * 0.22 + g.seed * 9) * 0.35 + (Math.sin(wt * 0.8 + g.seed * 31) * 0.14 + tmp.gust * 0.3 * Math.sign(g.lane)) * storm
      let z = g.depth - (g.layer === 1 ? mid * 2.2 : 0) + Math.sin(wt * 0.3 + g.seed * 5) * 0.4 + Math.sin(wt * 0.6 + g.seed * 17) * 0.35 * storm
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
        // The far and near strata keep their depth around the headline: the orbit is layered.
        const HP = g.layer === 1 ? 1 : (CAM_Z - g.depth) / (CAM_Z - hz)
        const hk = g.layer === 1 ? 1 : g.layer === 0 ? 1.15 : 1.25
        x += (hx * HP * hk - x) * hero
        y += (hy * HP * hk - y) * hero
        z += ((g.layer === 1 ? hz : g.depth) - z) * hero
        if (g.anchor) {
          // Phones: the stones sit at the corners, half off screen, so the copy keeps the middle.
          const ax = g.anchor[0] * (narrow ? 1.18 : 1), ay = g.anchor[1] * (narrow ? 1.25 : 1)
          const persp = (CAM_Z - g.anchor[2]) / CAM_Z
          const drift = Math.sin(t * 0.3 + g.seed * 20) * 0.12
          x += (ax * vw * persp + drift - x) * hero
          y += (ay * vh * persp + Math.cos(t * 0.25 + g.seed * 9) * 0.1 - y) * hero
          z += (g.anchor[2] - z) * hero
        }
      }
      // 2b · pressure, then the break. Each stone spirals into the core on its own beat; at the
      // break they fly out as shards of light, open into gems mid-flight, and drift home in slow motion.
      const pg = smooth(press * 1.4 - g.seed * 0.4)
      let pushK = 1
      if (pg > 0.001 || bAge >= 0) {
        const tilt = 0.35
        const lx = (g.cx * cc - g.cz * cs) * CR
        const lz0 = (g.cx * cs + g.cz * cc) * CR
        const ly = g.cy * CR * Math.cos(tilt) - lz0 * Math.sin(tilt)
        const lz = g.cy * CR * Math.sin(tilt) + lz0 * Math.cos(tilt)
        // Tremor at the peak: the mass is holding more than it can.
        const tr = press > 0.85 && bAge < 0 ? Math.pow((press - 0.85) / 0.15, 2) * (0.03 + hb * 0.05) : 0
        const kx = lx + Math.sin(t * 41 + g.seed * 90) * tr
        const ky = ly + coreY + Math.cos(t * 37 + g.seed * 70) * tr
        const kz = lz + 1
        if (bAge < 0) {
          // Spiral in: rotate around the centre while travelling, so the pull reads as a vortex.
          const sw = pg * (1 - pg) * 2.6 * Math.sign(g.lane || 1)
          const nx = x + (kx - x) * pg, ny = y + (ky - y) * pg
          const c2 = Math.cos(sw), s2 = Math.sin(sw)
          x = nx * c2 - ny * s2
          y = nx * s2 + ny * c2
          z += (kz - z) * pg
          pushK = 1 - pg
        } else {
          // Out along its own line from the centre, a little toward the viewer, then home.
          const dl = Math.hypot(g.cx, g.cy, g.cz) + 1e-3
          const D = (5 + g.fly * 9) * (narrow ? 0.62 : 1)
          const fl = 1 - Math.exp(-bAge * 3.4)
          const home = smooth((bAge - 0.5) / 2.8)
          const sx = kx + (g.cx / dl) * D * fl * (narrow ? 0.75 : 1.25)
          const sy = ky + (g.cy / dl) * D * fl
          const sz0 = kz + ((g.cz / dl) * 0.5 + (g.fly - 0.35) * 0.9) * D * fl * 0.7
          x = sx + (x - sx) * home
          y = sy + (y - sy) * home
          z = sz0 + (z - sz0) * home
          pushK = home
        }
      }
      // 3 · finale: each gem leaves on its own beat and settles into a letter.
      // Every gem has landed by ~85% of the finale, so the resting word is always complete.
      const f = easeInOut(fin * 1.9 - g.seed * 0.6)
      if (f > 0) {
        x += (g.target[0] * konW - x) * f
        y += (g.target[1] * konW + centerY + post * vh * 0.32 - y) * f
        z += (Math.sin(t * 0.8 + g.seed * 12) * 0.08 - post * 5 - z) * f
      }
      // Glide between states. A stone that wraps around the stream edge snaps instead of crossing the screen.
      if (Number.isNaN(g.fx) || Math.abs(y - g.fy) > vh * 0.6 * (g.layer === 1 ? 1 : (CAM_Z - g.depth) / CAM_Z) || reduced) { g.fx = x; g.fy = y; g.fz = z }
      else { g.fx += (x - g.fx) * lpk; g.fy += (y - g.fy) * lpk; g.fz += (z - g.fz) * lpk }
      x = g.fx; y = g.fy; z = g.fz
      // Pointer parts the stream (projected onto the z=0 plane so depth feels right).
      const persp = CAM_Z / (CAM_Z - z)
      const dx = x * persp - px
      const dy = y * persp - py
      const d = Math.hypot(dx, dy) + 1e-4
      const push = d < R ? Math.pow(1 - d / R, 2) * (1.5 - f * 1.4) * pushK : 0
      const kk = 1 - Math.exp(-dt * 5)
      g.ox += ((dx / d) * push - g.ox) * kk
      g.oy += ((dy / d) * push - g.oy) * kk
      // Ripple of light from a tap: the ring passes, each stone flashes, spins and leans outward.
      const rdx = x * persp - (motion.rx * vw) / 2
      const rdy = y * persp - (motion.ry * vh) / 2
      const rd = Math.hypot(rdx, rdy) + 1e-4
      const flash = rAge < 3.2 ? Math.exp(-((rd - rAge * 7) ** 2) * 0.9) * (1 - rAge / 3.2) : 0
      // Breathing: the whole field opens a little on the in-breath and settles on the out-breath.
      const bre = (1 + (breath - 0.5) * 0.03 * (1 - f)) * (1 - storm * 0.07 * (1 - f) + release * 0.06 * (1 - f))
      tmp.p.set((x + g.ox / persp + (rdx / rd) * flash * 0.45) * bre, (y + g.oy / persp + (rdy / rd) * flash * 0.45) * bre, z)
      g.angle += flash * dt * 5
      // Pressure makes the diamond: every stone is coal while the storm gathers, its veins of light
      // burning brighter as the pressure rises. When the storm breaks, each one opens into a gem
      // on its own beat (the hero stones last). ?hold= pins it for QA.
      // The shell cracks open mid-flight, every stone within half a second of the break.
      // Clean cut: stones are gems by default and turn to coal only while the pressure builds.
      const rock = HOLD >= 0 ? 1 - smooth((HOLD * 1.7 - g.seed * 0.7) / 0.55) : bAge < 0 ? smooth((press - 0.15) / 0.5) : 1 - smooth((bAge * 2.6 - g.seed * 0.55) / 0.32)
      // Born in light: each gem flashes as its shell falls away, then settles to its own colour.
      const born = bAge >= 0 ? Math.exp(-Math.max(0, bAge * 2.6 - g.seed * 0.55) * 2.2) * (1 - rock) * 1.1 : 0
      states.current[g.cut]?.setXY(g.idx, rock, flash + born + hb * pg * 0.12)

      // Rotation: tumbling in the stream, turning its table to the viewer in the word.
      if (bAge >= 0 && bAge < 3) g.angle += dt * 9 * Math.exp(-bAge * 1.6) * Math.sign(g.spin)
      g.angle += dt * (g.spin * (1 + storm * 0.8) + Math.min(Math.abs(motion.vel) * 0.008, 0.8) * Math.sign(g.spin)) * (reduced ? 0 : 1) * (g.anchor ? 1 - hero * 0.6 : 1)
      tmp.qa.setFromAxisAngle(g.axis, g.angle)
      if (f > 0) {
        tmp.q.copy(tmp.face).multiply(g.tilt).multiply(tmp.q2.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, t * 0.22 + g.seed * 6))
        tmp.qa.slerp(tmp.q, f)
      }
      const grow = smooth((tmp.intro - g.seed * 0.6) / 0.7)
      const heroSize = g.anchor ? THREE.MathUtils.lerp(g.size, g.anchor[3] * (narrow ? 0.7 : 1), hero) : g.size
      const layerSize = g.anchor ? 1 : g.layer === 0 ? 1.55 : g.layer === 2 ? 0.62 : 1
      // Squeezed small inside the core; a breath bigger the instant it is freed.
      const squeeze = bAge < 0 ? 1 - 0.3 * pg : 1 - 0.3 * (1 - smooth(bAge / 0.5)) + 0.25 * Math.exp(-bAge * 1.3) * smooth(bAge / 0.3)
      const sz = grow * THREE.MathUtils.lerp(heroSize * (pg > 0.5 && bAge < 0 ? 1 : layerSize) * (narrow ? 0.8 : 1), konScale, f) * (1 - (g.anchor ? 0 : hero * 0.1)) * (1 - post * 0.97) * squeeze
      const szw = g.wordOnly ? Math.max(1e-4, sz * f) : sz
      tmp.s.set(szw, szw * THREE.MathUtils.lerp(g.stretch, 1, f), szw)
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
        const glow = (0.05 + mid * 0.02 + f * (0.16 + sweepH * 0.3) + motion.glow * 0.08 + flash * 0.5 + breath * 0.025 + motion.bolt * 0.12 + release * 0.12 * (1 - rock * 0.5) + born * 0.55 + pg * hb * 0.05) * (1 - post * 0.9) * hGain * THREE.MathUtils.lerp(1, wordGain, f) * (g.wordOnly ? f : 1)
        tmp.p.z -= 0.05
        const bokeh = g.layer === 2 ? 1.9 - f * 0.9 : g.layer === 0 ? 1.25 - f * 0.25 : 1
        tmp.s.setScalar(Math.max(1e-4, (g.wordOnly ? szw : sz) * (4.2 + f * 1.4) * bokeh))
        tmp.m.compose(tmp.p, camera.quaternion, tmp.s)
        h.setMatrixAt(gi, tmp.m)
        const bc = base.current[g.cut]
        if (bc) {
          const o3 = g.idx * 3
          const mx = Math.max(bc[o3], bc[o3 + 1], bc[o3 + 2], 1e-4)
          hc.setRGB(bc[o3] / mx, bc[o3 + 1] / mx, bc[o3 + 2] / mx).lerp(HALO, 0.3)
        } else hc.copy(HALO)
        h.setColorAt(gi, hc.multiplyScalar(glow * (g.layer === 2 ? 0.75 + f * 0.25 : g.layer === 0 ? 0.8 + f * 0.2 : 1)))
      }
      gi++
    }
    if (halo.current) {
      halo.current.instanceMatrix.needsUpdate = true
      if (halo.current.instanceColor) halo.current.instanceColor.needsUpdate = true
    }
    states.current.forEach((a) => { a.needsUpdate = true })
    meshes.current.forEach((m) => {
      if (!m) return
      m.instanceMatrix.needsUpdate = true
      if (m.instanceColor && (shimmer || fin > 0.01)) m.instanceColor.needsUpdate = true
    })
    // A breath of parallax, switched off as the word forms so it lines up with its outline.
    camera.position.x += (motion.px * 0.6 * (1 - fin) - camera.position.x) * k
    camera.position.y += (motion.py * 0.35 * (1 - fin) - camera.position.y) * k
    // The lens leans in as the pressure builds, is punched back by the break, then settles.
    const punch = bAge >= 0 ? (1 - Math.exp(-bAge * 14)) * Math.exp(-bAge * 1.1) : 0
    const camZ = CAM_Z - 0.9 * pe * (bAge < 0 ? 1 : Math.exp(-bAge * 1.8)) + 1.6 * punch
    tmp.cz += (camZ - tmp.cz) * (1 - Math.exp(-dt * (bAge >= 0 && bAge < 0.5 ? 20 : 5)))
    camera.position.z = tmp.cz
    const shake = reduced ? 0 : (bAge < 0 ? hb * 0.012 * pe : 0.16 * Math.exp(-bAge * 5.5))
    if (shake > 0.0005) {
      camera.position.x += Math.sin(t * 61) * shake
      camera.position.y += Math.cos(t * 53) * shake
    }
    camera.lookAt(0, 0, 0)
    // Hand the moment to the rest of the scene (core glow, shockwave, shards).
    burst.press = pe
    burst.hb = hb
    burst.age = bAge
    burst.R = CR
    burst.y = coreY
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

/** Starts shader compiles in parallel (where the browser supports it) without blocking the main
 *  thread, and shows the canvas from its first frame, so the opening never waits on the GPU. */
function Warmup() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    gl.compileAsync(scene, camera).catch(() => {})
    const id = requestAnimationFrame(() => {
      motion.live = performance.now()
      gl.domElement.closest('.gem-canvas')?.classList.add('is-live')
    })
    return () => cancelAnimationFrame(id)
  }, [gl, scene, camera])
  return null
}

// Safari composites post-processed WebGL frames less reliably (brief black frames under load),
// so it renders without the bloom pass; the fresnel rim and halos carry the glow there.
const SAFARI = typeof navigator !== 'undefined' && /^((?!chrome|chromium|crios|android|edg).)*safari/i.test(navigator.userAgent)

/** Blank-proofing: if the browser drops the WebGL context (memory pressure on phones), fade the
 *  canvas out instead of showing a hard black cut, and fade it back once the context returns. */
function ContextGuard() {
  const { gl } = useThree()
  useEffect(() => {
    const el = gl.domElement
    const wrap = el.closest('.gem-canvas')
    const lost = (e: Event) => { e.preventDefault(); wrap?.classList.add('is-lost') }
    const back = () => requestAnimationFrame(() => requestAnimationFrame(() => wrap?.classList.remove('is-lost')))
    el.addEventListener('webglcontextlost', lost)
    el.addEventListener('webglcontextrestored', back)
    return () => {
      el.removeEventListener('webglcontextlost', lost)
      el.removeEventListener('webglcontextrestored', back)
    }
  }, [gl])
  return null
}

/** Speed guard: watches real frame times once the opening has settled. If this device can't hold
 *  a smooth rate, it steps down once, quietly (sharper pixels and bloom are the first to go), while
 *  the page is still early, so the visitor never feels the change mid-story. */
function Governor({ onSlow }: { onSlow: () => void }) {
  const st = useRef({ n: 0, sum: 0, done: false })
  useFrame((_, dt) => {
    const s = st.current
    if (s.done || !motion.live) return
    const since = performance.now() - motion.live
    if (since < 2500) return
    s.n++
    s.sum += Math.min(dt, 0.2)
    if (s.n >= 90) {
      s.done = true
      // Below ~42 fps on average: lighten the load.
      if (s.sum / s.n > 1 / 50) onSlow()
    }
  })
  return null
}

export default function GemField({ tier, reduced }: { tier: Tier; reduced: boolean }) {
  const narrowView = typeof window !== 'undefined' && window.innerWidth < 700
  const count = narrowView ? (tier === 'high' ? 54 : 42) : tier === 'high' ? 82 : tier === 'mid' ? 64 : 48
  const [lite, setLite] = useState(false)
  // Bloom only on desktop GPUs outside Safari; elsewhere the fresnel rim carries the glow.
  // Pixel density is capped: past 1.5 the gems look the same and cost twice the fill.
  const rich = tier === 'high' && !SAFARI && !lite
  const dpr = lite || narrowView ? 1 : tier === 'high' && !SAFARI ? 1.35 : tier === 'low' ? 1 : 1.15
  const narrow = typeof window !== 'undefined' && window.innerWidth < 700
  return (
    <Canvas
      className={rich ? "gem-canvas is-rich" : "gem-canvas"}
      dpr={dpr}
      // The stage never changes size on scroll; ignore scroll for measuring, and settle window
      // resizes before reallocating (meanwhile the last frame just stretches, never blanks).
      resize={{ scroll: false, debounce: { scroll: 0, resize: 180 } }}
      camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: !rich, alpha: true, powerPreference: 'high-performance', stencil: false }}
      style={{ pointerEvents: 'none' }}
    >
      <ContextGuard />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 8]} intensity={1.6} color="#dffcf7" />
      <directionalLight position={[-6, -3, 4]} intensity={0.8} color="#2bd1c0" />
      <Environment resolution={256} frames={1}>
        {/* A jeweller's light box: a broad soft key above, crisp strip lights that become the
            sharp facet flashes, a champagne side light for warmth, and teal bounce from below.
            Read directly by the gem shader as a cube map. */}
        <color attach="background" args={['#032526']} />
        <Lightformer form="circle" intensity={2.6} color="#ffffff" position={[0, 6, -4]} scale={[12, 5, 1]} />
        <Lightformer form="rect" intensity={7} color="#ffffff" position={[-4, 2.5, 4]} rotation-y={Math.PI / 4} scale={[0.5, 7, 1]} />
        <Lightformer form="rect" intensity={6} color="#e8fffb" position={[4.5, 1, 3.5]} rotation-y={-Math.PI / 4} scale={[0.4, 6, 1]} />
        <Lightformer form="rect" intensity={4} color="#f3e2b8" position={[0, -1, 6]} scale={[7, 0.35, 1]} />
        <Lightformer form="circle" intensity={2.2} color="#9ff7ec" position={[-6, 0, -2]} rotation-y={Math.PI / 2} scale={[8, 5, 1]} />
        <Lightformer form="circle" intensity={1.8} color="#e9d9b0" position={[6, -1, -2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={3} color="#3fe0cf" position={[0, -5, 2]} rotation-x={Math.PI / 2} scale={4} />
        <Lightformer form="circle" intensity={1.8} color="#f3e2b8" position={[5, 4, -6]} scale={[5, 3, 1]} />
        <Lightformer form="circle" intensity={1.8} color="#7ff3e6" position={[-5, -3, -6]} scale={[5, 3, 1]} />
        <Lightformer form="circle" intensity={0.9} color="#2bbfae" position={[0, -6, -3]} rotation-x={-Math.PI / 2} scale={[16, 16, 1]} />
      </Environment>
      <Gems count={count} word={narrowView ? 120 : 170} reduced={reduced} />
      <BurstFx narrow={narrow} />
      <Trio />
      <Warmup />
      {!lite && <Governor onSlow={() => setLite(true)} />}
      {rich && (
        <EffectComposer multisampling={2} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.72} luminanceThreshold={0.55} luminanceSmoothing={0.25} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
