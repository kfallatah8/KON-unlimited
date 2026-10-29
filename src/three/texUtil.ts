// Textures built from plain pixel arrays, never read back from a <canvas>.
// Safari and privacy-focused browsers add random coloured noise to canvas readback
// (toDataURL / getImageData) as anti-fingerprinting, which showed up as speckles in the clouds.
import * as THREE from 'three'

const CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(b: Uint8Array) {
  let c = 0xffffffff
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** A white sprite whose alpha is `alpha` (0..1, n×n), encoded as an uncompressed PNG data URL. */
export function alphaPngUrl(alpha: Float32Array, n: number) {
  // Raw scanlines: filter byte 0, then gray+alpha pairs (colour type 4).
  const row = 1 + n * 2
  const raw = new Uint8Array(row * n)
  for (let y = 0; y < n; y++) {
    raw[y * row] = 0
    for (let x = 0; x < n; x++) {
      const o = y * row + 1 + x * 2
      raw[o] = 255
      raw[o + 1] = Math.round(Math.min(1, Math.max(0, alpha[y * n + x])) * 255)
    }
  }
  // zlib wrapper with stored (uncompressed) deflate blocks.
  const blocks = Math.ceil(raw.length / 65535)
  const z = new Uint8Array(2 + raw.length + blocks * 5 + 4)
  z[0] = 0x78; z[1] = 0x01
  let p = 2
  for (let i = 0; i < blocks; i++) {
    const len = Math.min(65535, raw.length - i * 65535)
    z[p++] = i === blocks - 1 ? 1 : 0
    z[p++] = len & 255; z[p++] = len >>> 8
    z[p++] = ~len & 255; z[p++] = (~len >>> 8) & 255
    z.set(raw.subarray(i * 65535, i * 65535 + len), p)
    p += len
  }
  let a = 1, b = 0
  for (let i = 0; i < raw.length; i++) { a = (a + raw[i]) % 65521; b = (b + a) % 65521 }
  const ad = ((b << 16) | a) >>> 0
  z[p++] = ad >>> 24; z[p++] = (ad >>> 16) & 255; z[p++] = (ad >>> 8) & 255; z[p++] = ad & 255

  const chunk = (type: string, data: Uint8Array) => {
    const c = new Uint8Array(12 + data.length)
    const dv = new DataView(c.buffer)
    dv.setUint32(0, data.length)
    for (let i = 0; i < 4; i++) c[4 + i] = type.charCodeAt(i)
    c.set(data, 8)
    dv.setUint32(8 + data.length, crc32(c.subarray(4, 8 + data.length)))
    return c
  }
  const ihdr = new Uint8Array(13)
  const hv = new DataView(ihdr.buffer)
  hv.setUint32(0, n); hv.setUint32(4, n)
  ihdr[8] = 8; ihdr[9] = 4; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', z), chunk('IEND', new Uint8Array(0))]
  // A data URL (not a blob URL): it works inside sandboxed previews too.
  let bin = ''
  for (const part of parts) for (let i = 0; i < part.length; i += 0x8000) bin += String.fromCharCode(...part.subarray(i, i + 0x8000))
  return 'data:image/png;base64,' + btoa(bin)
}

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
