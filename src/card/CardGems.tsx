// The card's living backdrop: the homepage's own gemstones (same cuts, same shader, same jeweller's
// light box), flying slowly toward you through the clouds and past the card.
// Every stone opens as raw coal and burns into a cut gem in the first seconds (the KON story in
// one breath). Tilt the phone (or move the pointer) and the whole field leans with you; tap the
// sky and a ripple of light runs through the stones.
// Cost: about 70 stones in three instanced meshes, 30 fps on phones, paused when the tab hides.
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { gemUniforms, makeGemMaterial } from '../three/gemMaterial'
import { CUTS } from '../three/cuts'
import { tilt } from './tilt'

const TEALS = ['#012f2e', '#023f3c', '#04524d', '#066560', '#087a72', '#0b9184', '#034a52', '#056470']
const AQUAS = ['#14ab9a', '#2cc4b2', '#3fd0bd', '#5fe3d2']
const CLEAR = ['#bff5ec', '#d9fbf6', '#eefcf9', '#e9dcb8']
const PHI = 0.6180339887
const NEAR = 9, FAR = -34 // z range the stones travel through (camera at z = 12)

function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Stone { cut: number; idx: number; r: number; a: number; z: number; v: number; size: number; axis: THREE.Vector3; spin: number; delay: number; drift: number }

/** Shared with the page: a tap anywhere sends a ripple of light through the field. */
export const ripple = { t: -10, x: 0, y: 0 }

function Field({ count, reduced }: { count: number; reduced: boolean }) {
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([])
  const { scene, camera } = useThree()
  const geos = useMemo(() => CUTS.map((f) => f()), [])
  const mats = useMemo(() => CUTS.map(() => makeGemMaterial()), [])
  const stones = useMemo(() => {
    const rnd = mulberry(1618)
    const per = [0, 0, 0]
    return Array.from({ length: count }, (): Stone => {
      const cut = rnd() < 0.5 ? 0 : rnd() < 0.6 ? 1 : 2
      // An open tunnel: the stones keep clear of the card's centre and stream around it.
      const r = rnd() < 0.22 ? 0.4 + rnd() * 2 : 2.6 + Math.pow(rnd(), 0.8) * 6.5
      return {
        cut, idx: per[cut]++, r, a: rnd() * Math.PI * 2, z: FAR + rnd() * (NEAR - FAR), v: 0.55 + rnd() * 0.7,
        size: 0.16 + Math.pow(rnd(), 2.2) * 0.42, axis: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(),
        spin: (rnd() - 0.5) * 0.9, delay: rnd() * 1.4, drift: (rnd() - 0.5) * 0.05,
      }
    })
  }, [count])
  const counts = useMemo(() => [0, 1, 2].map((c) => stones.filter((s) => s.cut === c).length), [stones])
  const states = useMemo(() => counts.map((n, i) => {
    const a = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, n) * 2), 2)
    a.setUsage(THREE.DynamicDrawUsage)
    geos[i].setAttribute('aState', a)
    return a
  }), [counts, geos])

  const paint = (m: THREE.InstancedMesh | null, i: number) => {
    meshes.current[i] = m
    if (!m || m.instanceColor) return
    const rnd = mulberry(77 + i)
    const c = new THREE.Color()
    for (let k = 0; k < m.count; k++) {
      const x = rnd()
      const set = x < PHI ? TEALS : x < PHI + (1 - PHI) * PHI ? AQUAS : CLEAR
      m.setColorAt(k, c.set(set[Math.floor(rnd() * set.length)]))
    }
    m.instanceColor!.needsUpdate = true
  }

  const o = useMemo(() => new THREE.Object3D(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const t0 = useRef(-1)
  const cam = useRef({ x: 0, y: 0 })
  useFrame((st, dt) => {
    const now = st.clock.elapsedTime
    if (t0.current < 0) t0.current = now
    const t = now - t0.current
    const d = Math.min(dt, 1 / 20)
    gemUniforms.uTime.value = now
    gemUniforms.uBreath.value = 0.5 + 0.5 * Math.sin(now * ((2 * Math.PI) / 11))
    if (scene.environment && gemUniforms.uEnv.value !== scene.environment) gemUniforms.uEnv.value = scene.environment
    // the camera leans with the phone, softly, so the card seems to float in front of the field
    cam.current.x += (tilt.x * 1.4 - cam.current.x) * Math.min(1, d * 3)
    cam.current.y += (-tilt.y * 1.0 - cam.current.y) * Math.min(1, d * 3)
    camera.position.set(cam.current.x, cam.current.y, 12)
    camera.lookAt(0, 0, -6)
    const flow = reduced ? 0 : 1
    const sinceRipple = now - ripple.t
    for (const s of stones) {
      if (!reduced) { s.z += s.v * d * 1.6 * flow; s.a += s.drift * d * (1 + tilt.x * 0.6) }
      if (s.z > NEAR) { s.z = FAR; s.a += 1.3 }
      const x = Math.cos(s.a) * s.r, y = Math.sin(s.a) * s.r * 0.9
      // fade in from the far clouds, shrink away just before the lens
      const life = THREE.MathUtils.smoothstep(s.z, FAR, FAR + 6) * (1 - THREE.MathUtils.smoothstep(s.z, NEAR - 2.5, NEAR))
      o.position.set(x, y, s.z)
      q.setFromAxisAngle(s.axis, now * s.spin + s.idx)
      o.quaternion.copy(q)
      o.scale.setScalar(Math.max(0.0001, s.size * life))
      o.updateMatrix()
      const m = meshes.current[s.cut]
      if (!m) continue
      m.setMatrixAt(s.idx, o.matrix)
      // coal to gem: each stone burns through its shell at its own moment in the opening
      const rock = reduced ? 0 : 1 - THREE.MathUtils.smoothstep(t, 0.6 + s.delay, 2.4 + s.delay)
      const dist = Math.hypot(x - ripple.x * 6, y - ripple.y * 5)
      const ring = Math.exp(-Math.pow((sinceRipple * 9 - dist) / 1.4, 2)) * Math.exp(-sinceRipple * 1.2)
      states[s.cut].setXY(s.idx, rock, ring)
    }
    meshes.current.forEach((m, i) => { if (m) { m.instanceMatrix.needsUpdate = true; states[i].needsUpdate = true } })
  })

  return (
    <>
      {geos.map((g, i) => (
        <instancedMesh key={i} ref={(m) => paint(m, i)} args={[g, mats[i], Math.max(1, counts[i])]} frustumCulled={false} />
      ))}
    </>
  )
}

function Pace({ fps }: { fps: number }) {
  const { invalidate } = useThree()
  useEffect(() => {
    let raf = 0, last = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden || now - last < 1000 / fps - 2) return
      last = now
      invalidate()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [fps, invalidate])
  return null
}

export default function CardGems({ coarse, reduced }: { coarse: boolean; reduced: boolean }) {
  return (
    <Canvas
      className="cg-canvas"
      frameloop="demand"
      dpr={coarse ? [1, 1.6] : [1, 2]}
      camera={{ position: [0, 0, 12], fov: 38, near: 0.1, far: 70 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
    >
      <Pace fps={coarse ? 30 : 60} />
      <Environment resolution={256} frames={1}>
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
      <Field count={coarse ? 64 : 90} reduced={reduced} />
    </Canvas>
  )
}
