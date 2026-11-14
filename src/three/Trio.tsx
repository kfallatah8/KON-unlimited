// "Nobody wins unless everyone wins": three stones (the talent, the company, KON) in one shared orbit,
// always 120° apart, so none can move without the others. Light flows from each of them into a
// fourth stone at the centre (impact), which only fully ignites when the three lean in together.
// Drawn inside the main canvas, placed over the page's .trio-stage box, so it costs no second
// WebGL context and shares the same studio light as every other gem on the page.
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from '../state/store'
import { CUTS } from './cuts'
import { makeGemMaterial } from './gemMaterial'
import { bakedTexture } from './texUtil'
import gemGlowUrl from '../assets/gem-glow.png'

const CAM_Z = 14
const FOV = 34
/** Talent (aqua, pear cut), company (deep teal, step cut), KON (champagne-clear, brilliant). */
const STONES = [
  { cut: 2, color: '#2cc4b2' },
  { cut: 1, color: '#0b9184' },
  { cut: 0, color: '#8a6a2a' },
]
const BEADS = 18
const TRAIL = 26
const PERIOD = 9.5
const WHITE = new THREE.Color('#e9fffb')
const TILT = new THREE.Euler(-0.42, 0, 0.12)

function smooth(x: number) {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

export default function Trio() {
  const { size, camera } = useThree()
  const group = useRef<THREE.Group>(null)
  const gems = useRef<(THREE.InstancedMesh | null)[]>([])
  const core = useRef<THREE.InstancedMesh>(null)
  const beads = useRef<THREE.InstancedMesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const coreGlow = useRef<THREE.Mesh>(null)
  const st = useMemo(() => ({
    el: null as HTMLElement | null, labels: [] as HTMLElement[], look: 0, t: 0, sc: [1, 1, 1],
    m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color(),
    pos: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], w: new THREE.Vector3(), tilt: new THREE.Quaternion(),
  }), [])
  const parts = useMemo(() => {
    // Each stone gets its own geometry copy, with a one-instance state attribute (cut gem, no rock).
    const mk = (cut: number) => {
      const g = CUTS[cut]()
      const a = new THREE.InstancedBufferAttribute(new Float32Array(2), 2)
      a.setUsage(THREE.DynamicDrawUsage)
      g.setAttribute('aState', a)
      return { geo: g, state: a, mat: makeGemMaterial() }
    }
    return { stones: STONES.map((x) => mk(x.cut)), core: mk(0) }
  }, [])
  const glowTex = useMemo(() => bakedTexture(gemGlowUrl), [])
  const beadGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const g = group.current
    if (!g) return
    // Find the stage box (it mounts with the talent section; look again now and then if missing).
    if (!st.el || !st.el.isConnected) {
      if (st.look-- > 0) { g.visible = false; return }
      st.look = 30
      st.el = document.querySelector<HTMLElement>('.trio-stage')
      st.labels = st.el ? Array.from(st.el.querySelectorAll<HTMLElement>('[data-trio]')) : []
      if (!st.el) { g.visible = false; return }
    }
    const r = st.el.getBoundingClientRect()
    const W = window.innerWidth, H = window.innerHeight
    const vis = r.bottom > -40 && r.top < H + 40 && r.height > 0
    g.visible = vis
    if (!vis) return
    st.t += dt
    const t = st.t
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z
    const vw = vh * (size.width / size.height)
    // Screen box → world box on the z = 0 plane (the camera only drifts a little here).
    const cx = ((r.left + r.width / 2) / W) * 2 - 1
    const cy = -(((r.top + r.height / 2) / H) * 2 - 1)
    g.position.set((cx * vw) / 2, (cy * vh) / 2, 0)
    const S = Math.min((r.height / H) * vh * 0.36, (r.width / W) * vw * 0.2)
    g.scale.setScalar(S)

    // The cycle: a calm orbit, then all three lean in together, the centre ignites, and they release.
    const ph = (t % PERIOD) / PERIOD
    const lean = smooth((ph - 0.56) / 0.16) * (1 - smooth((ph - 0.8) / 0.18))
    const ignite = ph > 0.7 ? Math.exp(-((ph - 0.72) * PERIOD) * 1.8) * smooth((ph - 0.7) / 0.02) : 0
    const on = motion.trioOn
    const A = t * 0.32
    st.tilt.setFromEuler(TILT)
    STONES.forEach((x, i) => {
      const a = A + (i * Math.PI * 2) / 3 + Math.PI / 2
      const R = 1.55 - 0.55 * lean
      const p = st.pos[i].set(Math.cos(a) * R * 1.25, 0, Math.sin(a) * R).applyQuaternion(st.tilt)
      p.y += Math.sin(t * 0.9 + i * 2) * 0.05
      // The lit stone grows a little and burns brighter.
      st.sc[i] += ((on === i ? 1.28 : 1) - st.sc[i]) * (1 - Math.exp(-dt * 4))
      const m = gems.current[i]
      if (m) {
        st.q.setFromEuler(new THREE.Euler(0.5 + Math.sin(t * 0.5 + i) * 0.3, t * (0.45 + i * 0.12), 0.2))
        const sz = 0.3 * st.sc[i]
        st.s.set(sz, sz * 1.05, sz)
        st.m.compose(p, st.q, st.s)
        m.setMatrixAt(0, st.m)
        m.instanceMatrix.needsUpdate = true
        parts.stones[i].state.setXY(0, 0, (on === i ? 0.18 : 0) + ignite * 0.5 + lean * 0.12)
        parts.stones[i].state.needsUpdate = true
      }
      // Labels follow their stone on the page.
      const lab = st.labels[i]
      if (lab) {
        st.w.copy(p).multiplyScalar(S).add(g.position).project(camera)
        const lx = (st.w.x * 0.5 + 0.5) * W - r.left
        const ly = (0.5 - st.w.y * 0.5) * H - r.top
        lab.style.transform = `translate3d(${lx.toFixed(1)}px, ${(ly + 0.46 * S * (H / vh) * st.sc[i]).toFixed(1)}px, 0) translate(-50%, 0)`
        lab.classList.toggle('is-on', on === i)
      }
    })
    const cl = st.labels[3]
    if (cl) cl.style.opacity = String(0.55 + lean * 0.45 + ignite * 0.3)
    // The centre: impact. Small and quiet until the three lean in; then it catches fire.
    if (core.current) {
      st.q.setFromEuler(new THREE.Euler(0.7, t * 0.6, 0))
      const sz = 0.15 + lean * 0.12 + ignite * 0.1
      st.s.set(sz, sz, sz)
      st.m.compose(st.p.set(0, 0, 0), st.q, st.s)
      core.current.setMatrixAt(0, st.m)
      core.current.instanceMatrix.needsUpdate = true
      parts.core.state.setXY(0, 0, 0.1 + lean * 0.35 + ignite * 1.4)
      parts.core.state.needsUpdate = true
    }
    if (coreGlow.current) {
      coreGlow.current.quaternion.copy(camera.quaternion)
      coreGlow.current.scale.setScalar(1.3 + lean * 0.9 + ignite * 2.2)
      ;(coreGlow.current.material as THREE.MeshBasicMaterial).opacity = 0.22 + lean * 0.3 + ignite * 0.6
    }
    if (ring.current) {
      const age = ph > 0.72 ? (ph - 0.72) * PERIOD : 99
      ring.current.visible = age < 2.2
      ring.current.quaternion.copy(camera.quaternion)
      ring.current.scale.setScalar(0.4 + (1 - Math.exp(-age * 2)) * 2.6)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = Math.exp(-age * 2) * 0.7
    }
    // Light flowing from each stone to the centre (beads on a gentle arc), and a fading orbit trail.
    const b = beads.current
    if (b) {
      let k = 0
      STONES.forEach((x, i) => {
        const p = st.pos[i]
        const lit = on === i ? 1.6 : 1
        for (let j = 0; j < BEADS; j++) {
          const u = (j / BEADS + t * (0.22 + lean * 0.5)) % 1
          const arc = Math.sin(Math.PI * u) * 0.18
          st.p.set(p.x * (1 - u) - p.z * arc * 0.4, p.y * (1 - u) + arc, p.z * (1 - u))
          const sz = (0.05 + 0.07 * Math.sin(Math.PI * u)) * (0.8 + lean * 0.6)
          st.m.compose(st.p, camera.quaternion, st.s.set(sz, sz, sz))
          b.setMatrixAt(k, st.m)
          st.c.set(x.color).lerp(WHITE, u * 0.6).multiplyScalar((0.5 + u * 0.8) * lit * (0.6 + lean * 0.8 + ignite))
          b.setColorAt(k, st.c)
          k++
        }
        for (let j = 0; j < TRAIL; j++) {
          const a = A + (i * Math.PI * 2) / 3 + Math.PI / 2 - (j + 1) * 0.055
          const R = 1.55 - 0.55 * lean
          st.p.set(Math.cos(a) * R * 1.25, 0, Math.sin(a) * R).applyQuaternion(st.tilt)
          const fade = 1 - j / TRAIL
          const sz = 0.09 * fade * (on === i ? 1.3 : 1)
          st.m.compose(st.p, camera.quaternion, st.s.set(sz, sz, sz))
          b.setMatrixAt(k, st.m)
          st.c.set(x.color).multiplyScalar(fade * fade * 0.8 * lit)
          b.setColorAt(k, st.c)
          k++
        }
      })
      b.instanceMatrix.needsUpdate = true
      if (b.instanceColor) b.instanceColor.needsUpdate = true
    }
  })

  const paint = (m: THREE.InstancedMesh | null, color: string) => {
    if (m && !m.instanceColor) m.setColorAt(0, new THREE.Color(color))
  }
  const count = STONES.length * (BEADS + TRAIL)
  return (
    <group ref={group} visible={false}>
      {STONES.map((x, i) => (
        <instancedMesh key={i} ref={(m) => { gems.current[i] = m; paint(m, x.color) }} args={[parts.stones[i].geo, parts.stones[i].mat, 1]} frustumCulled={false} />
      ))}
      <instancedMesh ref={(m) => { core.current = m; paint(m, '#eefcf9') }} args={[parts.core.geo, parts.core.mat, 1]} frustumCulled={false} />
      <mesh ref={coreGlow} renderOrder={2}>
        <planeGeometry />
        <meshBasicMaterial map={glowTex} color="#7ff3e6" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={ring} visible={false} renderOrder={3}>
        <ringGeometry args={[0.95, 1, 80]} />
        <meshBasicMaterial color="#d9fffa" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <instancedMesh
        ref={(m) => { beads.current = m; if (m && !m.instanceColor) { const c = new THREE.Color(0, 0, 0); for (let i = 0; i < count; i++) m.setColorAt(i, c) } }}
        args={[beadGeo, undefined, count]}
        frustumCulled={false}
        renderOrder={2}
      >
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
