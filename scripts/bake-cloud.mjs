// Bakes the cloud sprite to src/assets/cloud.png (white, alpha = cloud density).
// Run: node scripts/bake-cloud.mjs
import { build } from 'esbuild'
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { createRequire } from 'node:module'

const out = await build({ entryPoints: ['src/three/texUtil.ts'], bundle: true, write: false, format: 'cjs', platform: 'node', external: ['three'] })
const mod = { exports: {} }
new Function('module', 'exports', 'require', out.outputFiles[0].text)(mod, mod.exports, createRequire(import.meta.url))

const n = 384
const alpha = mod.exports.puffAlpha(n)
const raw = Buffer.alloc((1 + n * 2) * n)
for (let y = 0; y < n; y++) {
  raw[y * (1 + n * 2)] = 0
  for (let x = 0; x < n; x++) {
    const o = y * (1 + n * 2) + 1 + x * 2
    raw[o] = 255
    raw[o + 1] = Math.round(Math.min(1, Math.max(0, alpha[y * n + x])) * 255)
  }
}
const crcTable = Array.from({ length: 256 }, (_, k) => { let c = k; for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
  return Buffer.concat([len, td, c])
}
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(n, 0); ihdr.writeUInt32BE(n, 4); ihdr[8] = 8; ihdr[9] = 4
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
writeFileSync('src/assets/cloud.png', png)
console.log('cloud.png', png.length, 'bytes')
