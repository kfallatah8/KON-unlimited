// Per-frame values shared between 3D components without React state.
import type * as THREE from 'three'

export const runtime = {
  /** Damped scene index actually rendered. */
  scene: 0,
  /** True when the diagnostic ring accepts pointer input. */
  interactive: false,
  majors: [] as THREE.Vector3[],
}
