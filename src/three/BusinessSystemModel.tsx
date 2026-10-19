// Rendering of the business system: eight dimension modules, instanced architectural
// elements, connection paths, flow pulses, the core and the "missed opportunity" slot.
// It only reads poses from formations.ts and interaction state from the store.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { DIMENSION_IDS, content } from '../content/site'
import { store, useStore } from '../state/store'
import {
  CORE, FORMATIONS, LINKS, MAJOR_COUNT, SCENE, buildMinors, lerp, sceneBlend, type V3,
} from './formations'
import { materials, palette } from './materials'
import { runtime } from './runtime'

const tmpObj = new THREE.Object3D()
const tmpColor = new THREE.Color()
const teal = new THREE.Color(palette.tealBright)
const amber = new THREE.Color(palette.amber)
const warm = new THREE.Color(palette.titaniumWarm)
const cool = new THREE.Color('#7fa7ab')
const titaniumC = new THREE.Color(palette.titanium)

interface Props {
  minorCount: number
  motion: boolean
  flow: boolean
  labels: boolean
  /** DOM layer for labels (inside the stage, so they never affect page layout). */
  labelPortal: React.RefObject<HTMLDivElement | null>
}

export function BusinessSystemModel({ minorCount, motion, flow, labels, labelPortal }: Props) {
  const mats = materials()
  const dimensions = content[useStore((st) => st.lang)].dimensions
  const minors = useMemo(() => buildMinors(minorCount), [minorCount])

  // Per-module material variants (tint + glow), disposed on unmount.
  const moduleMats = useMemo(
    () =>
      Array.from({ length: MAJOR_COUNT }, () => ({
        body: mats.titanium.clone(),
        line: mats.tealLine.clone(),
      })),
    [mats],
  )
  useEffect(() => () => moduleMats.forEach((m) => { m.body.dispose(); m.line.dispose() }), [moduleMats])

  const majorRefs = useRef<(THREE.Group | null)[]>([])
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const minorRef = useRef<THREE.InstancedMesh>(null)
  const coreRef = useRef<THREE.Group>(null)
  const ghostRef = useRef<THREE.LineSegments>(null)
  const rootRef = useRef<THREE.Group>(null)

  // Links + flow pulses share endpoint positions.
  const linkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINKS.length * 6), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(LINKS.length * 6), 3))
    return g
  }, [])
  const pulseGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINKS.length * 3), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(LINKS.length * 3), 3))
    return g
  }, [])
  const ghostGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.0, 0.5, 0.62)), [])
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  useEffect(() => () => { linkGeo.dispose(); pulseGeo.dispose(); ghostGeo.dispose(); boxGeo.dispose() }, [linkGeo, pulseGeo, ghostGeo, boxGeo])

  const ends = useMemo(() => Array.from({ length: MAJOR_COUNT + 1 }, () => new THREE.Vector3()), [])

  useFrame((state, dt) => {
    const s = store.get()
    // Damped scene index: continuous, never jumps (except in reduced motion).
    const target = s.scene
    runtime.scene = motion ? runtime.scene + (target - runtime.scene) * (1 - Math.exp(-dt * 3.2)) : Math.round(target)
    const { a, b, t } = sceneBlend(runtime.scene)
    const A = FORMATIONS[a]
    const B = FORMATIONS[b]
    const time = state.clock.elapsedTime
    const diagW = Math.max(0, 1 - Math.abs(runtime.scene - SCENE.diagnostic) * 2)
    runtime.interactive = diagW > 0.6

    const focusIdx = DIMENSION_IDS.indexOf((s.hovered ?? s.selected) as never)
    const selIdx = DIMENSION_IDS.indexOf(s.selected as never)

    if (rootRef.current && motion) rootRef.current.rotation.y = Math.sin(time * 0.08) * 0.12 * (1 - diagW)
    // English reads left-to-right: mirror the whole composition so it sits opposite the text
    if (rootRef.current) rootRef.current.scale.x = s.lang === 'en' ? -1 : 1

    // --- majors ---
    for (let i = 0; i < MAJOR_COUNT; i++) {
      const g = majorRefs.current[i]
      if (!g) continue
      const ma = A.majors[i]
      const mb = B.majors[i]
      const drift = motion ? 1 : 0
      const px = lerp(ma.p[0], mb.p[0], t)
      const py = lerp(ma.p[1], mb.p[1], t) + Math.sin(time * 0.5 + i * 1.7) * 0.05 * drift
      const pz = lerp(ma.p[2], mb.p[2], t)
      g.position.set(px, py, pz)
      g.rotation.set(
        lerp(ma.r[0], mb.r[0], t),
        lerp(ma.r[1], mb.r[1], t) + Math.sin(time * 0.3 + i) * 0.04 * drift,
        lerp(ma.r[2], mb.r[2], t),
      )
      const focused = diagW > 0 && i === focusIdx
      const sc = lerp(ma.s, mb.s, t) * (1 + (focused ? 0.1 * diagW : 0))
      g.scale.setScalar(sc)
      ends[i].copy(g.position)

      const m = moduleMats[i]
      let glow = lerp(ma.glow, mb.glow, t)
      if (diagW > 0 && focusIdx >= 0) glow = focused ? 1 : lerp(glow, glow * 0.35, diagW)
      m.line.color.copy(teal).multiplyScalar(0.15 + glow * 1.1)
      const tint = lerp(ma.tint, mb.tint, t)
      m.body.color.copy(titaniumC).lerp(tint > 0 ? warm : cool, Math.abs(tint))
      m.body.roughness = tint < 0 ? lerp(0.34, 0.18, -tint) : 0.34

      const label = labelRefs.current[i]
      if (label) {
        const lv = labels ? lerp(ma.label, mb.label, t) : 0
        label.style.opacity = String(lv * (focusIdx >= 0 && diagW > 0.5 && !focused ? 0.45 : 1))
        label.dataset.active = focused ? 'true' : 'false'
      }
    }
    runtime.majors = ends

    // --- core ---
    const coreV = lerp(A.core, B.core, t)
    ends[CORE].set(0, 0, 0)
    if (coreRef.current) {
      coreRef.current.visible = coreV > 0.01
      coreRef.current.scale.setScalar(Math.max(coreV, 0.001))
      if (motion) coreRef.current.rotation.y = time * 0.15
    }

    // --- ghost slot (missed opportunity) ---
    const gv = lerp(A.ghost, B.ghost, t)
    if (ghostRef.current) {
      ghostRef.current.visible = gv > 0.01
      const mat = ghostRef.current.material as THREE.LineBasicMaterial
      mat.opacity = gv * (motion ? 0.45 + Math.sin(time * 2) * 0.25 : 0.6)
    }

    // --- minors ---
    const inst = minorRef.current
    if (inst) {
      const { shape, p, r, k } = minors
      const PA = p[a], PB = p[b], RA = r[a], RB = r[b], KA = k[a], KB = k[b]
      for (let i = 0; i < minors.count; i++) {
        const j = i * 3
        const wob = motion ? Math.sin(time * 0.4 + i) * 0.03 : 0
        tmpObj.position.set(lerp(PA[j], PB[j], t), lerp(PA[j + 1], PB[j + 1], t) + wob, lerp(PA[j + 2], PB[j + 2], t))
        tmpObj.rotation.set(lerp(RA[j], RB[j], t), lerp(RA[j + 1], RB[j + 1], t), lerp(RA[j + 2], RB[j + 2], t))
        const vis = lerp(KA[i], KB[i], t)
        tmpObj.scale.set(shape[j] * vis, shape[j + 1] * vis, shape[j + 2] * vis)
        tmpObj.updateMatrix()
        inst.setMatrixAt(i, tmpObj.matrix)
      }
      inst.instanceMatrix.needsUpdate = true
    }

    // --- links + flow pulses ---
    const pos = linkGeo.attributes.position.array as Float32Array
    const col = linkGeo.attributes.color.array as Float32Array
    const ppos = pulseGeo.attributes.position.array as Float32Array
    const pcol = pulseGeo.attributes.color.array as Float32Array
    for (let l = 0; l < LINKS.length; l++) {
      const [ia, ib] = LINKS[l]
      const e1 = ends[ia]
      const e2 = ends[ib]
      pos.set([e1.x, e1.y, e1.z, e2.x, e2.y, e2.z], l * 6)
      let vis = lerp(A.links[l], B.links[l], t)
      if (ia === CORE || ib === CORE) vis *= coreV
      const w = lerp(A.warn[l], B.warn[l], t)
      if (selIdx >= 0 && diagW > 0) {
        const touches = ia === selIdx || ib === selIdx
        vis = touches ? Math.max(vis, diagW) : vis * (1 - 0.7 * diagW)
      }
      tmpColor.copy(teal).lerp(amber, w).multiplyScalar(vis * 0.75)
      col.set([tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.r, tmpColor.g, tmpColor.b], l * 6)

      if (flow) {
        // Pulses travel along each path; bottlenecks crawl.
        const speed = 0.18 * (1 - w * 0.75)
        const u = (time * speed + l * 0.137) % 1
        ppos.set([lerp(e1.x, e2.x, u), lerp(e1.y, e2.y, u), lerp(e1.z, e2.z, u)], l * 3)
        tmpColor.multiplyScalar(1.6 * Math.sin(u * Math.PI))
        pcol.set([tmpColor.r, tmpColor.g, tmpColor.b], l * 3)
      }
    }
    linkGeo.attributes.position.needsUpdate = true
    linkGeo.attributes.color.needsUpdate = true
    linkGeo.computeBoundingSphere()
    if (flow) {
      pulseGeo.attributes.position.needsUpdate = true
      pulseGeo.attributes.color.needsUpdate = true
      pulseGeo.computeBoundingSphere()
    }
  })

  const onOver = (i: number) => (e: { stopPropagation: () => void }) => {
    if (!runtime.interactive) return
    e.stopPropagation()
    store.set({ hovered: DIMENSION_IDS[i] })
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    store.set({ hovered: null })
    document.body.style.cursor = ''
  }
  const onClick = (i: number) => (e: { stopPropagation: () => void }) => {
    if (!runtime.interactive) return
    e.stopPropagation()
    const id = DIMENSION_IDS[i]
    store.set({ selected: store.get().selected === id ? null : id })
  }

  return (
    <group ref={rootRef}>
      {dimensions.map((d, i) => (
        <group key={d.id} ref={(el) => { majorRefs.current[i] = el }}>
          {/* titanium chassis */}
          <RoundedBox args={[1.02, 0.09, 0.64]} radius={0.03} smoothness={3} position={[0, 0.22, 0]} material={moduleMats[i].body} />
          <RoundedBox args={[1.02, 0.09, 0.64]} radius={0.03} smoothness={3} position={[0, -0.22, 0]} material={moduleMats[i].body} />
          {/* smoked glass volume (hit target) */}
          <mesh
            material={mats.glass}
            onPointerOver={onOver(i)}
            onPointerOut={onOut}
            onClick={onClick(i)}
          >
            <boxGeometry args={[0.94, 0.36, 0.58]} />
          </mesh>
          {/* Royal Teal signal line */}
          <mesh position={[0, 0, 0.3]} material={moduleMats[i].line}>
            <boxGeometry args={[0.8, 0.018, 0.018]} />
          </mesh>
          <mesh position={[-0.47, 0, 0]} material={mats.darkMetal}>
            <boxGeometry args={[0.04, 0.36, 0.6]} />
          </mesh>
          {labels && (
            <Html position={[0, 0.5, 0]} center zIndexRange={[4, 0]} portal={labelPortal as React.RefObject<HTMLElement>} style={{ pointerEvents: 'none' }}>
              <div className="scene-label" ref={(el) => { labelRefs.current[i] = el }} style={{ opacity: 0 }} aria-hidden="true">
                <span>{d.name}</span>
                {d.latin !== d.name && <small>{d.latin}</small>}
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* decision core */}
      <group ref={coreRef} visible={false}>
        <mesh material={mats.titanium}>
          <cylinderGeometry args={[0.55, 0.55, 0.12, 8]} />
        </mesh>
        <mesh material={mats.glass} position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.5, 8]} />
        </mesh>
        <mesh material={mats.tealLine} position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.43, 0.012, 6, 8]} />
        </mesh>
        <mesh material={mats.titanium} position={[0, 0.64, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.08, 8]} />
        </mesh>
      </group>

      {/* missed-opportunity slot: an empty, outlined position in the system */}
      <lineSegments ref={ghostRef} geometry={ghostGeo} position={[-0.35, 0.35, 2.1] as V3} visible={false}>
        <lineBasicMaterial color={palette.tealBright} transparent opacity={0} toneMapped={false} />
      </lineSegments>

      <instancedMesh ref={minorRef} args={[boxGeo, mats.darkMetal, minors.count]} frustumCulled={false} />

      <lineSegments geometry={linkGeo} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </lineSegments>
      {flow && (
        <points geometry={pulseGeo} frustumCulled={false}>
          <pointsMaterial vertexColors size={0.07} sizeAttenuation transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </points>
      )}
    </group>
  )
}
