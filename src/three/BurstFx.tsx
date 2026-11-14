// The break, framed: the heat that gathers in the compressed core of coal, the shockwave and the
// flash when it gives way, and the black shell that shatters into embers and falls away.
// Reads the moment from `burst` (written by the gems every frame); allocates nothing per frame.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { bakedTexture } from './texUtil'
import gemGlowUrl from '../assets/gem-glow.png'

/** Written by the gem field each frame: pressure (eased), heartbeat, seconds since the break (-1 before), core radius and height. */
export const burst = { press: 0, hb: 0, age: -1, R: 1.7, y: 0 }

const SHARDS = 150
const HOT = new THREE.Color('#d9fffa')
const EMBER = new THREE.Color('#2fe0cb')

function smooth(x: number) {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

export default function BurstFx({ narrow }: { narrow: boolean }) {
  const glowTex = useMemo(() => bakedTexture(gemGlowUrl), [])
  const core = useRef<THREE.Mesh>(null)
  const flash = useRef<THREE.Mesh>(null)
  const rings = useRef<(THREE.Mesh | null)[]>([])
  const shards = useRef<THREE.InstancedMesh>(null)
  const flashEl = useRef<HTMLElement | null>(null)
  const st = useMemo(() => ({ seen: -2, fv: -1, m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color() }), [])
  const parts = useMemo(() => {
    let x = 3.7
    const r = () => { x = (x * 9301 + 49297) % 233280; return x / 233280 }
    return Array.from({ length: SHARDS }, () => {
      const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1)
      return {
        dir: new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th) * 0.6 + 0.25),
        speed: 4 + Math.pow(r(), 0.7) * 13,
        size: 0.025 + Math.pow(r(), 2.2) * 0.11,
        axis: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
        spin: 3 + r() * 9,
        hot: r(),
        p: new THREE.Vector3(),
        v: new THREE.Vector3(),
      }
    })
  }, [])
  const shardGeo = useMemo(() => new THREE.TetrahedronGeometry(1, 0), [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const { press, hb, age, R, y } = burst
    const cam = state.camera
    // Heat gathering in the core: a held breath of light behind the coal, beating with the heart.
    if (core.current) {
      const pre = age < 0 ? press : press * Math.exp(-age * 3)
      const m = core.current.material as THREE.MeshBasicMaterial
      m.opacity = Math.min(1, pre * pre * (0.55 + hb * 0.6))
      core.current.visible = m.opacity > 0.004
      core.current.position.set(0, y, 0.6)
      core.current.quaternion.copy(cam.quaternion)
      core.current.scale.setScalar(R * (3.0 + hb * 0.7))
    }
    // The flash: one white-teal bloom that swallows the core and fades as the shards fly.
    if (flash.current) {
      const a = age >= 0 ? Math.exp(-age * 2.3) * smooth(age / 0.06) : 0
      const m = flash.current.material as THREE.MeshBasicMaterial
      m.opacity = a * 1.1
      flash.current.visible = a > 0.004
      flash.current.position.set(0, y, 1.5)
      flash.current.quaternion.copy(cam.quaternion)
      flash.current.scale.setScalar(R * (3 + (1 - Math.exp(-age * 4)) * 9))
    }
    // The same flash on the page itself, so the copy is lit by it too.
    const fe = (flashEl.current ??= document.querySelector<HTMLElement>('.stage-burst'))
    const fv = age >= 0 ? Math.round(Math.exp(-age * 2.6) * smooth(age / 0.05) * 40) / 40 : 0
    if (fe && fv !== st.fv) { st.fv = fv; fe.style.opacity = String(fv) }
    // Shockwaves: two rings of light racing out, the second a beat behind and softer.
    rings.current.forEach((ring, i) => {
      if (!ring) return
      const a = age - i * 0.16
      const on = a >= 0 && a < 2.4
      ring.visible = on
      if (!on) return
      const m = ring.material as THREE.MeshBasicMaterial
      m.opacity = Math.exp(-a * 1.9) * (i ? 0.45 : 0.85)
      ring.position.set(0, y, 1.2)
      ring.quaternion.copy(cam.quaternion)
      ring.scale.setScalar(R * 0.9 + (1 - Math.exp(-a * 1.7)) * (narrow ? 9 : 16) * (i ? 0.8 : 1))
    })
    // The shell: shards of coal, white-hot at the break, cooling to teal embers, then to ash, falling.
    const sh = shards.current
    if (sh) {
      if (age >= 0 && st.seen < 0) {
        parts.forEach((p) => {
          p.p.copy(p.dir).multiplyScalar(R * 0.8).setY(p.p.y + y)
          p.v.copy(p.dir).multiplyScalar(p.speed * (narrow ? 0.6 : 1))
        })
      }
      st.seen = age
      const live = age >= 0 && age < 3.4
      sh.visible = live
      if (live) {
        const drag = Math.exp(-dt * 1.5)
        parts.forEach((p, i) => {
          p.v.multiplyScalar(drag)
          p.v.y -= 2.6 * dt
          p.p.addScaledVector(p.v, dt)
          st.q.setFromAxisAngle(p.axis, age * p.spin)
          // Clean cut: embers stay light and simply shrink away, never cooling to dark ash.
          const s = p.size * (1 - smooth((age - 0.5 - p.hot * 0.8) / 1.3)) * (narrow ? 0.8 : 1)
          st.s.set(s, s * 1.6, s)
          st.m.compose(p.p, st.q, st.s)
          sh.setMatrixAt(i, st.m)
          const cool = smooth(age / (0.35 + p.hot * 0.6))
          st.c.copy(HOT).lerp(EMBER, cool).multiplyScalar(cool < 1 ? 1.6 - cool * 0.6 : 1)
          sh.setColorAt(i, st.c)
        })
        sh.instanceMatrix.needsUpdate = true
        if (sh.instanceColor) sh.instanceColor.needsUpdate = true
      }
    }
  })

  return (
    <>
      <mesh ref={core} visible={false} renderOrder={3}>
        <planeGeometry />
        <meshBasicMaterial map={glowTex} color="#7ff3e6" transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} ref={(m) => { rings.current[i] = m }} visible={false} renderOrder={4}>
          <ringGeometry args={[0.97, 1, 96]} />
          <meshBasicMaterial color={i ? '#5fe3d2' : '#e9fffb'} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <instancedMesh
        ref={(m) => { shards.current = m; if (m && !m.instanceColor) { for (let i = 0; i < SHARDS; i++) m.setColorAt(i, HOT) } }}
        args={[shardGeo, undefined, SHARDS]}
        visible={false}
        frustumCulled={false}
      >
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh ref={flash} visible={false} renderOrder={5}>
        <planeGeometry />
        <meshBasicMaterial map={glowTex} color="#e9fffb" transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </>
  )
}
