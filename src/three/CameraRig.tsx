// Camera controls: formation camera + pointer parallax + diagnostic focus.
import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { DIMENSION_IDS } from '../content/site'
import { store } from '../state/store'
import { FORMATIONS, SCENE, lerp, sceneBlend } from './formations'
import { runtime } from './runtime'

interface Props {
  parallax: boolean
  /** Phones: content stacks over the scene, so centre it and pull back. */
  centered: boolean
  motion: boolean
}

export function CameraRig({ parallax, centered, motion }: Props) {
  const desiredPos = useMemo(() => new THREE.Vector3(), [])
  const desiredTarget = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(2, 0, 0), [])
  const focus = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const { a, b, t } = sceneBlend(runtime.scene)
    const A = FORMATIONS[a].cam
    const B = FORMATIONS[b].cam
    desiredPos.set(lerp(A.pos[0], B.pos[0], t), lerp(A.pos[1], B.pos[1], t), lerp(A.pos[2], B.pos[2], t))
    desiredTarget.set(lerp(A.target[0], B.target[0], t), lerp(A.target[1], B.target[1], t), lerp(A.target[2], B.target[2], t))

    // LTR reading column sits on the left, so the system moves to the right
    const mirror = store.get().lang === 'en' ? -1 : 1
    desiredPos.x *= mirror
    desiredTarget.x *= mirror

    if (centered) {
      const shift = desiredTarget.x
      desiredTarget.x -= shift
      desiredPos.x -= shift
      desiredPos.multiplyScalar(1.32)
      // phones: lift the system into the upper half, copy sits below it
      desiredTarget.y -= runtime.scene < 0.5 ? 2.2 : 0.6
    }

    // Diagnostic: move toward the selected dimension.
    const s = store.get()
    const sel = DIMENSION_IDS.indexOf(s.selected as never)
    const diagW = Math.max(0, 1 - Math.abs(runtime.scene - SCENE.diagnostic) * 2)
    if (sel >= 0 && diagW > 0 && runtime.majors[sel]) {
      focus.copy(runtime.majors[sel])
      focus.x *= mirror // majors are in the (possibly mirrored) model's local space
      const out = focus.clone().setY(0).normalize()
      const camFocus = focus.clone().addScaledVector(out, centered ? 6 : 5.2).add(new THREE.Vector3(0, 2.4, 0))
      const tgtFocus = focus.clone()
      if (!centered) {
        // keep the text column clear: offset the look-at to the reading side
        const right = new THREE.Vector3().subVectors(tgtFocus, camFocus).cross(new THREE.Vector3(0, 1, 0)).normalize()
        tgtFocus.addScaledVector(right, 2.3 * mirror)
      }
      // a measured approach: the ring stays in view while the selection comes forward
      desiredPos.lerp(camFocus, diagW * 0.6)
      desiredTarget.lerp(tgtFocus, diagW * 0.6)
    }

    if (parallax && motion) {
      desiredPos.x += state.pointer.x * 0.45
      desiredPos.y += state.pointer.y * 0.28
    }

    const k = motion ? 1 - Math.exp(-dt * 2.6) : 1
    state.camera.position.lerp(desiredPos, k)
    target.lerp(desiredTarget, k)
    state.camera.lookAt(target)
  })
  return null
}
