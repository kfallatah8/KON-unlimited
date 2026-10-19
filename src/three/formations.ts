// Animation logic, separated from rendering: every "formation" is a full pose
// of the business system. Scroll moves a continuous index between formations;
// BusinessSystemModel interpolates. Pure data + math, no React, no three.js objects.

export type V3 = [number, number, number]

export const SCENE = {
  hero: 0,
  system: 1,
  diagnosis: 2,
  discovery: 3,
  transformation: 4,
  potential: 5,
  diagnostic: 6,
  humanApart: 7,
  humanJoined: 8,
  rest: 9,
} as const
export const SCENE_COUNT = 10

export const MAJOR_COUNT = 8
export const CORE = 8 // link endpoint index for the central core

/** Human-expertise vs AI-workflow grouping used by the Human + AI chapter. */
export const HUMAN = [0, 2, 4, 6]
export const AI = [1, 3, 5, 7]

export interface MajorPose {
  p: V3
  r: V3
  s: number
  glow: number // teal inset intensity 0..1
  label: number // HTML label visibility 0..1
  tint: number // 0 titanium, +1 warm (human), -1 cool glass (AI)
}

export interface Formation {
  majors: MajorPose[]
  links: number[] // visibility per LINKS entry
  warn: number[] // amber "bottleneck" amount per LINKS entry
  ghost: number // missed-opportunity outline
  core: number // central core visibility
  cam: { pos: V3; target: V3 }
  canvasOpacity: number
}

const ring: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]]
const cross: [number, number][] = [[0, 3], [1, 5], [2, 6], [3, 7], [4, 6], [0, 5]]
const spokes: [number, number][] = Array.from({ length: 8 }, (_, i) => [CORE, i] as [number, number])
export const LINKS: [number, number][] = [...ring, ...cross, ...spokes]
const R = ring.length
const C = cross.length

// Deterministic PRNG so every visitor sees the same composition.
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const base: V3[] = [
  [0.1, 1.55, 0.1], // strategy
  [1.65, 0.65, 0.35], // revenue
  [-1.55, 0.75, 0.55], // marketing
  [0.85, -0.55, -0.75], // operations
  [-1.05, -0.65, -0.55], // people
  [1.85, -1.15, 0.8], // finance
  [-1.8, -0.75, 1.0], // customer experience
  [0.05, -1.75, 0.25], // technology
]

function jitterRot(i: number, amt: number): V3 {
  const r = rng(100 + i)
  return [(r() - 0.5) * amt, (r() - 0.5) * amt * 2, (r() - 0.5) * amt]
}

const pose = (p: V3, r: V3 = [0, 0, 0], extra: Partial<MajorPose> = {}): MajorPose => ({
  p, r, s: 1, glow: 0.35, label: 0, tint: 0, ...extra,
})

const fill = (v: number, n = LINKS.length) => Array(n).fill(v) as number[]
const linkIdx = (a: number, b: number) =>
  LINKS.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a))

function linksTouching(ids: number[], v: number, arr: number[]) {
  LINKS.forEach(([a, b], i) => {
    if (ids.includes(a) || ids.includes(b)) arr[i] = Math.min(arr[i], v)
  })
  return arr
}

const DIAG_LABELS = [3, 2, 5, 4, 6, 7] // operations, marketing, finance, people, cx, technology

function buildFormations(): Formation[] {
  const structural = () => [...fill(1, R + C), ...fill(0, 8)]

  // 0 hero — the living system, slightly irregular
  const hero: Formation = {
    majors: base.map((p, i) => pose(p, jitterRot(i, 0.5))),
    links: linksTouching([2, 5], 0.35, structural()),
    warn: fill(0), ghost: 0, core: 0,
    cam: { pos: [2.3, 0.5, 9.2], target: [2.1, 0, 0] },
    canvasOpacity: 1,
  }

  // 1 system — some components drift out of place, connections thin out
  const sysMajors = base.map((p, i) => pose(p, jitterRot(i, 0.7)))
  sysMajors[2] = pose([-2.75, 1.35, 1.3], [0.4, 0.9, -0.3])
  sysMajors[5] = pose([2.9, -1.7, 1.2], [-0.3, -0.7, 0.35])
  sysMajors[7] = pose([0.3, -2.45, 0.9], [0.2, 0.5, 0.25])
  const system: Formation = {
    ...hero,
    majors: sysMajors,
    links: linksTouching([2, 5, 7], 0.08, structural()),
    cam: { pos: [1.9, 1.2, 8.2], target: [1.7, 0, 0] },
  }

  // 2 diagnosis — exploded view, closer, labels on the six systems
  const diagnosis: Formation = {
    ...hero,
    majors: base.map((p, i) =>
      pose([p[0] * 1.22, p[1] * 1.2, p[2] * 1.1], jitterRot(i, 0.25), {
        label: DIAG_LABELS.includes(i) ? 1 : 0,
        glow: DIAG_LABELS.includes(i) ? 0.55 : 0.2,
      }),
    ),
    links: fill(0.55).map((v, i) => (i >= R + C ? 0 : v)),
    cam: { pos: [2.5, 0.8, 8.6], target: [2.45, -0.05, 0] },
  }

  // 3 discovery — bottlenecks (amber), disconnected processes, underused parts, a missed opportunity
  const discoveryLinks = diagnosis.links.slice()
  discoveryLinks[linkIdx(5, 6)] = 0.06 // disconnected process
  discoveryLinks[linkIdx(4, 6)] = 0.06
  const warn = fill(0)
  warn[linkIdx(1, 2)] = 1 // bottleneck revenue ↔ marketing
  warn[linkIdx(3, 7)] = 1 // bottleneck operations ↔ technology
  const discovery: Formation = {
    ...diagnosis,
    majors: diagnosis.majors.map((m, i) => ({
      ...m,
      label: 0,
      glow: i === 7 || i === 4 ? 0.04 : 0.45, // underutilised resources
    })),
    links: discoveryLinks,
    warn,
    ghost: 1,
    cam: { pos: [1.2, 1.2, 8.8], target: [2.4, -0.1, 0] },
  }

  // 4 transformation — the structure reorganises into an aligned grid
  const gridX = [-2.05, -0.68, 0.68, 2.05]
  const transformation: Formation = {
    ...hero,
    majors: base.map((_, i) => pose([gridX[i % 4], i < 4 ? 0.8 : -0.8, 0], [0, 0, 0], { glow: 0.6 })),
    links: structural(),
    cam: { pos: [3.0, 0.7, 10.6], target: [2.9, 0, 0] },
  }

  // 5 potential — the optimised system expands and rises
  const potential: Formation = {
    ...hero,
    majors: base.map((_, i) => {
      const a = (i / 8) * Math.PI * 2
      return pose([Math.cos(a) * 2.7, -1.5 + i * 0.45, Math.sin(a) * 2.7], [0, -a, 0], { glow: 0.95, s: 1.08 })
    }),
    links: [...fill(1, R), ...fill(0.35, C), ...fill(0.6, 8)],
    core: 0.6,
    cam: { pos: [2.8, 3.0, 13.2], target: [2.9, 0.3, 0] },
  }

  // 6 diagnostic framework — eight dimensions around a central core
  const diagnostic: Formation = {
    ...hero,
    majors: base.map((_, i) => {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2
      return pose([Math.cos(a) * 3.1, 0, Math.sin(a) * 3.1], [0, -a + Math.PI / 2, 0], { label: 1, glow: 0.5 })
    }),
    links: [...fill(0.8, R), ...fill(0.2, C), ...fill(1, 8)],
    core: 1,
    cam: { pos: [3.6, 6.0, 10.6], target: [3.4, -0.4, 0] },
  }

  // 7 human + AI, apart — organic expertise (warm) vs precise analytical grid (cool glass)
  const r7 = rng(7)
  const apartMajors = base.map((_, i) => {
    const h = HUMAN.indexOf(i)
    if (h >= 0) {
      return pose([-2.0 + (r7() - 0.5) * 1.0, 1.1 - h * 0.75 + (r7() - 0.5) * 0.4, (r7() - 0.5) * 1.4],
        [(r7() - 0.5) * 0.8, (r7() - 0.5) * 1.4, (r7() - 0.5) * 0.6], { tint: 1, glow: 0.3 })
    }
    const a = AI.indexOf(i)
    return pose([0.3 + (a % 2) * 1.2, 0.6 - Math.floor(a / 2) * 1.25, 0], [0, 0, 0], { tint: -1, glow: 0.8 })
  })
  const apartLinks = fill(0)
  LINKS.forEach(([a, b], i) => {
    if (a === CORE) return
    const sameH = HUMAN.includes(a) && HUMAN.includes(b)
    const sameA = AI.includes(a) && AI.includes(b)
    if (sameH || sameA) apartLinks[i] = 0.8
  })
  const humanApart: Formation = {
    ...hero,
    majors: apartMajors,
    links: apartLinks,
    cam: { pos: [1.5, 0.6, 11.4], target: [1.6, 0, 0] },
  }

  // 8 human + AI, joined — interlocking tiers around a decision-support core
  const humanJoined: Formation = {
    ...hero,
    majors: base.map((_, i) => {
      const h = HUMAN.indexOf(i)
      const k = h >= 0 ? h : AI.indexOf(i)
      const a = (k / 4) * Math.PI * 2 + (h >= 0 ? 0 : Math.PI / 4)
      return pose([Math.cos(a) * 2.0, h >= 0 ? 0.75 : -0.75, Math.sin(a) * 2.0], [0, -a, 0], {
        tint: h >= 0 ? 0.5 : -0.5,
        glow: 0.85,
      })
    }),
    links: [...fill(1, R), ...fill(0.4, C), ...fill(0.9, 8)],
    core: 1,
    cam: { pos: [1.8, 2.0, 9.4], target: [2.0, 0, 0] },
  }

  // 9 rest — a calm compact monolith behind case studies and footer
  const rest: Formation = {
    ...hero,
    majors: base.map((_, i) => pose([(i % 2) * 1.05 - 0.52, Math.floor(i / 2) * 0.72 - 1.08, 0], [0, 0, 0], { glow: 0.5 })),
    links: [...fill(0.4, R), ...fill(0, C), ...fill(0, 8)],
    cam: { pos: [5.2, 1, 13], target: [5.2, 0, 0] },
    canvasOpacity: 0.16,
  }

  return [hero, system, diagnosis, discovery, transformation, potential, diagnostic, humanApart, humanJoined, rest]
}

export const FORMATIONS = buildFormations()

// ---- Minor architectural elements (instanced) ----

export interface MinorPoses {
  count: number
  shape: Float32Array // per-instance base dimensions (constant)
  p: Float32Array[] // per formation, 3 per instance
  r: Float32Array[]
  k: Float32Array[] // per formation, scale multiplier / visibility
}

export function buildMinors(count: number): MinorPoses {
  const rand = rng(42)
  const shape = new Float32Array(count * 3)
  const cells: V3[] = []
  for (let i = 0; i < count; i++) {
    const kind = i % 3
    const dims: V3 = kind === 0 ? [0.5, 0.035, 0.5] : kind === 1 ? [0.03, 0.8, 0.03] : [0.8, 0.03, 0.03]
    shape.set(dims, i * 3)
    // lattice cell inside an ellipsoid around the system, spacing 0.9
    let c: V3
    do {
      c = [Math.round((rand() - 0.5) * 7), Math.round((rand() - 0.5) * 5), Math.round((rand() - 0.5) * 4)]
    } while ((c[0] / 3.6) ** 2 + (c[1] / 2.6) ** 2 + (c[2] / 2.2) ** 2 > 1)
    cells.push(c)
  }
  const jitter = Array.from({ length: count }, () => [rand() - 0.5, rand() - 0.5, rand() - 0.5, rand(), rand()])

  const p: Float32Array[] = []
  const r: Float32Array[] = []
  const k: Float32Array[] = []
  for (let f = 0; f < SCENE_COUNT; f++) {
    const P = new Float32Array(count * 3)
    const Rr = new Float32Array(count * 3)
    const K = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const [cx, cy, cz] = cells[i]
      const [jx, jy, jz, j1, j2] = jitter[i]
      let pos: V3 = [cx * 0.9, cy * 0.9, cz * 0.9]
      let rot: V3 = [0, 0, 0]
      let vis = 1
      const angle = (i / count) * Math.PI * 2
      switch (f) {
        case SCENE.hero:
        case SCENE.system:
        case SCENE.diagnosis:
        case SCENE.discovery: {
          const loose = f === SCENE.system ? 0.55 : f >= SCENE.diagnosis ? 0.3 : 0.38
          const spread = f >= SCENE.diagnosis ? 1.2 : 1
          pos = [(cx * 0.9 + jx * loose * 2) * spread, (cy * 0.9 + jy * loose * 2) * spread, cz * 0.9 + jz * loose * 2]
          rot = [jx * loose * 1.6, jy * loose * 2.2, jz * loose * 1.6]
          vis = f >= SCENE.diagnosis ? 0.55 : 1
          break
        }
        case SCENE.transformation:
          pos = [cx * 0.9, cy * 0.9, cz * 0.9]
          break
        case SCENE.potential:
          pos = [cx * 1.45, cy * 1.15 + 0.4 + Math.abs(cx) * 0.12, cz * 1.45]
          break
        case SCENE.diagnostic:
          pos = [Math.cos(angle) * (4.4 + (i % 3) * 0.32), -1.25 + (i % 2) * 0.12, Math.sin(angle) * (4.4 + (i % 3) * 0.32)]
          rot = [0, -angle, 0]
          vis = 0.8
          break
        case SCENE.humanApart:
          if (i % 2 === 0) {
            pos = [-2.0 + jx * 2.2, jy * 3.0, jz * 2.2]
            rot = [j1 * 1.6, j2 * 2.4, jx * 1.2]
          } else {
            pos = [0.15 + (i % 4) * 0.42, 1.5 - (Math.floor(i / 4) % 6) * 0.6, -0.9 + (i % 3) * 0.6]
          }
          break
        case SCENE.humanJoined: {
          const ring = i % 4
          pos = [Math.cos(angle) * (2.8 + ring * 0.25), -1.6 + ring * 1.05, Math.sin(angle) * (2.8 + ring * 0.25)]
          rot = [0, -angle, 0]
          break
        }
        case SCENE.rest:
          pos = [cx * 0.55 - 0.3, cy * 0.6, cz * 0.5 - 1.2]
          vis = 0.7
          break
      }
      P.set(pos, i * 3)
      Rr.set(rot, i * 3)
      K[i] = vis
    }
    p.push(P)
    r.push(Rr)
    k.push(K)
  }
  return { count, shape, p, r, k }
}

export const ease = (t: number) => t * t * (3 - 2 * t)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Split a continuous scene index into neighbouring formations + eased blend. */
export function sceneBlend(scene: number) {
  const s = Math.min(Math.max(scene, 0), SCENE_COUNT - 1)
  const a = Math.floor(s)
  const b = Math.min(a + 1, SCENE_COUNT - 1)
  return { a, b, t: ease(s - a) }
}
