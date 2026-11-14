import * as THREE from 'three'

/** Lathe profile (radius, height) from culet to table → faceted gem.
 *  Normals are part facet, part rounded: the facets still read crisply, but light glides across
 *  each face as the gem turns instead of switching on and off one face at a time. */
export function cut(profile: [number, number][], segments: number, rot = 0) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments, rot)
  const flat = g.toNonIndexed()
  g.dispose()
  flat.computeVertexNormals() // per-face (non-indexed)
  const pos = flat.attributes.position as THREE.BufferAttribute
  const nor = flat.attributes.normal as THREE.BufferAttribute
  // Rounded normals: average the face normals of every corner that shares a position.
  const key = (i: number) => `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`
  const sum = new Map<string, THREE.Vector3>()
  for (let i = 0; i < pos.count; i++) {
    const k = key(i)
    const v = sum.get(k) ?? new THREE.Vector3()
    sum.set(k, v.add(new THREE.Vector3(nor.getX(i), nor.getY(i), nor.getZ(i))))
  }
  const f = new THREE.Vector3(), r = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    f.set(nor.getX(i), nor.getY(i), nor.getZ(i))
    r.copy(sum.get(key(i))!).normalize()
    f.lerp(r, 0.22).normalize()
    nor.setXYZ(i, f.x, f.y, f.z)
  }
  nor.needsUpdate = true
  return flat
}
export const CUTS = [
  // round brilliant: pavilion, girdle, crown and table, sixteen sides
  () => cut([[0, -0.86], [0.56, -0.4], [1, 0], [1, 0.05], [0.8, 0.22], [0.56, 0.34], [0, 0.34]], 16),
  // emerald / step cut: stepped pavilion and crown
  () => cut([[0, -0.6], [0.42, -0.42], [0.78, -0.18], [1, 0], [1, 0.1], [0.86, 0.22], [0.68, 0.32], [0, 0.32]], 8, Math.PI / 8),
  // tall pear / marquise with a faceted crown
  () => cut([[0, -1.3], [0.46, -0.5], [0.72, 0], [0.72, 0.06], [0.54, 0.22], [0.38, 0.3], [0, 0.3]], 10),
]

