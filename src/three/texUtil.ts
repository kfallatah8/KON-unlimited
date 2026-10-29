// Textures built from plain pixel arrays, never read back from a <canvas>.
// Safari and privacy-focused browsers add random coloured noise to canvas readback
// (toDataURL / getImageData) as anti-fingerprinting, which showed up as speckles in the clouds.
// puffAlpha is only run at build time by scripts/bake-cloud.mjs.
import * as THREE from 'three'

/** Separable box blur on an n×n field, repeated for a near-Gaussian softening. */
export function blur(src: Float32Array, n: number, r: number, passes = 2) {
  let a = src
  let b = new Float32Array(n * n)
  for (let pass = 0; pass < passes; pass++) {
    for (const horiz of [true, false]) {
      for (let j = 0; j < n; j++) {
        let s = 0, c = 0
        const at = (i: number) => (horiz ? a[j * n + i] : a[i * n + j])
        for (let i = 0; i <= r && i < n; i++) { s += at(i); c++ }
        for (let i = 0; i < n; i++) {
          if (horiz) b[j * n + i] = s / c; else b[i * n + j] = s / c
          const add = i + r + 1, rem = i - r
          if (add < n) { s += at(add); c++ }
          if (rem >= 0) { s -= at(rem); c-- }
        }
      }
      const t = a === src ? new Float32Array(n * n) : a
      a = b
      b = t
    }
  }
  return a
}

/** A soft radial glow (Gaussian-like falloff) as a GPU texture, with no canvas involved. */
export function glowDataTexture(n: number, k: number) {
  const d = new Uint8Array(n * n * 4)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const t = Math.min(1, Math.hypot(x + 0.5 - n / 2, y + 0.5 - n / 2) / (n / 2))
      const v = Math.exp(-t * t * k) * (1 - t * t)
      const i = (y * n + x) * 4
      d[i] = d[i + 1] = d[i + 2] = 255
      d[i + 3] = Math.round(v * 255)
    }
  }
  const tex = new THREE.DataTexture(d, n, n, THREE.RGBAFormat)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.needsUpdate = true
  return tex
}

/** A cloud sprite: fractal noise (fbm) inside a soft round mask, so every puff has wisps and
 *  dense lumps like a real cumulus instead of reading as a flat disc. */
export function puffAlpha(n = 384) {
  // Value noise on a small lattice, smoothly interpolated, summed over five octaves.
  const G = 64
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const lat = Float32Array.from({ length: G * G }, rnd)
  const at = (x: number, y: number) => lat[((y % G) + G) % G * G + (((x % G) + G) % G)]
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y)
    const xf = x - xi, yf = y - yi
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
    const a = at(xi, yi), b = at(xi + 1, yi), cc = at(xi, yi + 1), d = at(xi + 1, yi + 1)
    return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v
  }
  const fbm = (x: number, y: number, oct: number) => {
    let f = 0, amp = 0.5, fr = 1
    for (let o = 0; o < oct; o++) {
      f += amp * noise(x * fr, y * fr)
      amp *= 0.5
      fr *= 2
    }
    return f
  }
  const alpha = new Float32Array(n * n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      // Domain warp: the lookup is pushed around by a second noise field, which turns blobs
      // into the curls and billows of real cumulus.
      const u = (x / n) * 4, v = (y / n) * 4
      const wx = fbm(u + 3.1, v + 1.7, 3), wy = fbm(u + 8.3, v + 2.8, 3)
      const f = fbm(u + wx * 1.6, v + wy * 1.6, 4)
      const dx = (x - n / 2) / (n / 2), dy = (y - n / 2) / (n / 2)
      const r = Math.sqrt(dx * dx + dy * dy * 1.15)
      // Smoothstep falloff to the rim: no visible sprite edge, the puff just dissolves.
      const m = Math.max(0, Math.min(1, 1 - r))
      const mask = Math.pow(m * m * (3 - 2 * m), 1.6)
      // Dense where noise and mask agree; a soft ramp (no hard threshold) keeps wisps feathered.
      const k = Math.max(0, Math.min(1, (f - 0.22) / 0.5))
      const a = k * k * (3 - 2 * k) * mask
      alpha[y * n + x] = a * 0.92
    }
  }
  // A soft blur irons out pixel grain, so the puffs read as smooth vapour, never dots.
  return blur(alpha, n, 2)
}
