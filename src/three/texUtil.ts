import * as THREE from 'three'

/** A texture from a baked image. Returned at once and filled in when the image arrives,
 *  so materials can be built synchronously. */
export function bakedTexture(url: string) {
  const t = new THREE.TextureLoader().load(url)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
