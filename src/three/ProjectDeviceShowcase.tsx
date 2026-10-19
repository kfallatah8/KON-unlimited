// Case-study stages: a premium phone (field-operations app) and an architectural massing model
// (real-estate tours). Same materials and lighting as the main system.
// Mounted only while near the viewport; R3F disposes everything on unmount.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { SceneLighting } from './SceneLighting'
import { materials, palette } from './materials'

export interface ShowcaseState {
  /** 0..1 scroll progress through the case study */
  progress: number
  /** active screen (phone) */
  screen: number
  /** 0..1 dolly into the property (tour transition) */
  enter: number
}

// ---------- schematic screens (field-operations scope; replaced by approved screenshots when supplied) ----------
const TEAL = '#5fd4cc'
const GOLD = '#cdb98f'
const AMBER = '#d39a55'
const TXT = 'rgba(217,222,223,0.85)'
const DIM = 'rgba(154,163,167,0.14)'
const LINE = 'rgba(160,170,172,0.16)'
// 24x24 line icons as SVG path data, drawn with Path2D
const IC = {
  camera: 'M4 8h3l2-2.5h6L17 8h3v11H4z M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  pin: 'M12 21s-6-5.6-6-10a6 6 0 0 1 12 0c0 4.4-6 10-6 10z M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  truck: 'M3 7h11v9H3z M14 10h4l3 3v3h-7z M7 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M17 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  user: 'M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  alert: 'M12 4l9 16H3z M12 10v4 M12 17v.01',
  chart: 'M4 20h16 M6 16l4-5 3 3 5-7',
  home: 'M4 11l8-6 8 6v9H4z',
  list: 'M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
}
function schematicScreen(n: number) {
  const c = document.createElement('canvas')
  c.width = 540
  c.height = 1170
  const W = c.width
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, c.height)
  grad.addColorStop(0, '#111a1d')
  grad.addColorStop(1, '#0a0f11')
  g.fillStyle = grad
  g.fillRect(0, 0, W, c.height)
  const box = (x: number, y: number, w: number, h: number, r = 18, fill: string | CanvasGradient = DIM, stroke?: string) => {
    g.beginPath()
    g.roundRect(x, y, w, h, r)
    g.fillStyle = fill
    g.fill()
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke() }
  }
  const dot = (x: number, y: number, r: number, fill: string) => { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill() }
  const icon = (name: keyof typeof IC, x: number, y: number, size: number, color: string, lw = 1.8) => {
    g.save(); g.translate(x, y); g.scale(size / 24, size / 24)
    g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'
    g.stroke(new Path2D(IC[name])); g.restore()
  }
  const text = (t: string, x: number, y: number, size: number, color = TXT, weight = 400, align: CanvasTextAlign = 'left') => {
    g.fillStyle = color; g.font = `${weight} ${size}px "IBM Plex Sans", sans-serif`; g.textAlign = align; g.fillText(t, x, y)
  }
  const bar = (x: number, y: number, w: number, h = 14, color = 'rgba(217,222,223,0.22)') => box(x, y, w, h, h / 2, color)

  // status bar + header
  text('9:41', 44, 70, 24, TXT, 500)
  ;[0, 1, 2].forEach((i) => box(W - 120 + i * 22, 52 + (2 - i) * 4, 14, 20 - (2 - i) * 4, 3, TXT))
  text(['New request', 'Assignments', 'Overview'][n % 3], 44, 160, 40, '#e6eaea', 300)
  text(['FIELD OPS · 01', 'FIELD OPS · 02', 'FIELD OPS · 03'][n % 3], 44, 112, 18, TEAL, 600)

  if (n % 3 === 0) {
    // captured photo with viewfinder corners and AI tag
    const pg = g.createLinearGradient(44, 200, W - 44, 560)
    pg.addColorStop(0, '#2a3a37'); pg.addColorStop(1, '#162024')
    box(44, 200, W - 88, 340, 26, pg)
    g.strokeStyle = 'rgba(217,222,223,0.6)'; g.lineWidth = 4
    ;[[80, 236, 1, 1], [W - 80, 236, -1, 1], [80, 504, 1, -1], [W - 80, 504, -1, -1]].forEach(([x, y, sx, sy]) => {
      g.beginPath(); g.moveTo(x, y + 36 * sy); g.lineTo(x, y); g.lineTo(x + 36 * sx, y); g.stroke()
    })
    icon('camera', W / 2 - 34, 336, 68, 'rgba(217,222,223,0.55)', 1.4)
    box(64, 470, 170, 46, 23, 'rgba(95,212,204,0.2)', 'rgba(95,212,204,0.6)')
    text('AI · detected', 86, 501, 20, TEAL, 500)
    // category chips
    ;['Category', 'Priority', 'Area'].forEach((l, i) => {
      box(44 + i * 152, 572, 140, 52, 26, i === 0 ? 'rgba(95,212,204,0.18)' : DIM, i === 0 ? 'rgba(95,212,204,0.5)' : undefined)
      text(l, 114 + i * 152, 606, 20, i === 0 ? TEAL : 'rgba(217,222,223,0.6)', 400, 'center')
    })
    // location card
    box(44, 650, W - 88, 120, 22, DIM)
    icon('pin', 70, 680, 50, GOLD)
    bar(140, 688, 220); bar(140, 722, 150, 12, 'rgba(154,163,167,0.2)')
    // mini map strip
    box(44, 790, W - 88, 120, 22, 'rgba(95,212,204,0.05)', LINE)
    g.strokeStyle = 'rgba(95,212,204,0.35)'; g.lineWidth = 3
    g.beginPath(); g.moveTo(70, 880); g.bezierCurveTo(180, 800, 300, 900, W - 70, 820); g.stroke()
    dot(300, 860, 9, GOLD)
    // submit
    box(44, 940, W - 88, 92, 46, TEAL)
    text('Submit request', W / 2, 996, 26, '#071012', 500, 'center')
  } else if (n % 3 === 1) {
    // shift switcher
    box(44, 196, W - 88, 64, 32, DIM)
    box(48, 200, (W - 96) / 2, 56, 28, 'rgba(95,212,204,0.2)')
    text('Morning', 48 + (W - 96) / 4, 237, 22, TEAL, 500, 'center')
    text('Evening', 48 + (W - 96) * 0.75, 237, 22, 'rgba(217,222,223,0.55)', 400, 'center')
    const rows = [['user', 'truck', 0], ['user', 'truck', 0], ['user', 'truck', 1], ['user', 'truck', 0], ['user', 'clock', 2]] as const
    rows.forEach(([a, b, st], i) => {
      const y = 290 + i * 132
      box(44, y, W - 88, 112, 22, DIM)
      dot(102, y + 56, 32, 'rgba(95,212,204,0.14)')
      icon(a, 84, y + 38, 36, TEAL)
      bar(152, y + 32, 160 - (i % 2) * 30, 16, 'rgba(217,222,223,0.35)')
      icon(b, 152, y + 62, 26, 'rgba(154,163,167,0.7)', 1.6)
      bar(188, y + 70, 90, 12, 'rgba(154,163,167,0.22)')
      const col = [TEAL, GOLD, AMBER][st]
      box(W - 158, y + 36, 96, 40, 20, 'rgba(0,0,0,0)', col)
      icon(st === 2 ? 'clock' : 'check', W - 124, y + 44, 24, col, 2)
    })
    box(44, 960, W - 88, 76, 38, 'rgba(95,212,204,0.12)', 'rgba(95,212,204,0.5)')
    text('Assign vehicle', W / 2, 1006, 24, TEAL, 500, 'center')
  } else {
    // indicator tiles
    const tiles = [['chart', TEAL], ['truck', TEAL], ['user', GOLD], ['clock', TEAL]] as const
    tiles.forEach(([ic, col], i) => {
      const x = 44 + (i % 2) * 234, y = 200 + Math.floor(i / 2) * 200
      box(x, y, 218, 182, 22, DIM)
      icon(ic, x + 24, y + 22, 36, col)
      bar(x + 24, y + 82, 110, 26, 'rgba(217,222,223,0.3)')
      // sparkline
      g.strokeStyle = col; g.lineWidth = 3; g.beginPath()
      for (let k = 0; k < 6; k++) { const px = x + 24 + k * 34, py = y + 150 - ((k * 37 + i * 23) % 40); k ? g.lineTo(px, py) : g.moveTo(px, py) }
      g.stroke()
    })
    text('Alerts', 44, 646, 26, TXT, 500)
    ;[['Maintenance due', AMBER], ['Licence renewal', GOLD], ['Specialist review', TEAL]].forEach(([l, col], i) => {
      const y = 672 + i * 104
      box(44, y, W - 88, 88, 20, DIM)
      icon('alert', 68, y + 26, 36, col as string, 2)
      text(l as string, 124, y + 54, 22, TXT)
      bar(W - 150, y + 38, 80, 12, 'rgba(154,163,167,0.25)')
    })
  }
  // tab bar
  g.fillStyle = 'rgba(9,12,14,0.9)'; g.fillRect(0, 1060, W, 110)
  g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 1060); g.lineTo(W, 1060); g.stroke()
  ;(['home', 'camera', 'list', 'chart'] as const).forEach((ic, i) => {
    const on = (n % 3 === 0 && i === 1) || (n % 3 === 1 && i === 2) || (n % 3 === 2 && i === 3)
    icon(ic, 66 + i * 120, 1088, 36, on ? TEAL : 'rgba(154,163,167,0.6)', 1.8)
  })
  text('SCHEMATIC VIEW', W / 2, 1150, 14, 'rgba(217,222,223,0.35)', 500, 'center')
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function useScreens(urls: string[] | undefined, count: number) {
  const textures = useMemo(() => {
    if (urls?.length) {
      const loader = new THREE.TextureLoader()
      return urls.map((u) => {
        const t = loader.load(u)
        t.colorSpace = THREE.SRGBColorSpace
        return t
      })
    }
    return Array.from({ length: count }, (_, i) => schematicScreen(i))
  }, [urls, count])
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])
  return textures
}

function Phone({ state, screens, motion }: { state: React.RefObject<ShowcaseState>; screens?: string[]; motion: boolean }) {
  const mats = materials()
  const group = useRef<THREE.Group>(null)
  const textures = useScreens(screens, 3)
  const screenA = useRef<THREE.MeshBasicMaterial>(null)
  const screenB = useRef<THREE.MeshBasicMaterial>(null)
  const shown = useRef({ current: 0, fade: 1 })

  useFrame((s, dt) => {
    const st = state.current
    if (!group.current || !st) return
    const p = st.progress
    const k = motion ? 1 - Math.exp(-dt * 4) : 1
    const targetY = -0.55 + p * 1.1 + (motion ? s.pointer.x * 0.25 : 0)
    const targetX = 0.12 - (motion ? s.pointer.y * 0.12 : 0)
    group.current.rotation.y += (targetY - group.current.rotation.y) * k
    group.current.rotation.x += (targetX - group.current.rotation.x) * k
    if (motion) group.current.position.y = Math.sin(s.clock.elapsedTime * 0.8) * 0.03

    // cross-fade: bottom plane keeps the previous screen, top plane fades in the new one
    const sh = shown.current
    if (st.screen !== sh.current && screenA.current && screenB.current) {
      screenB.current.map = screenA.current.map
      screenB.current.needsUpdate = true
      screenA.current.map = textures[st.screen % textures.length]
      screenA.current.needsUpdate = true
      sh.current = st.screen
      sh.fade = motion ? 0 : 1
    }
    sh.fade = Math.min(1, sh.fade + dt * 2.5)
    if (screenA.current) screenA.current.opacity = sh.fade
  })

  return (
    <group ref={group}>
      <RoundedBox args={[0.78, 1.6, 0.085]} radius={0.11} smoothness={6} material={mats.titanium} />
      <RoundedBox args={[0.745, 1.565, 0.09]} radius={0.095} smoothness={6}>
        <meshPhysicalMaterial color="#050708" roughness={0.05} metalness={0.1} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0462]}>
        <planeGeometry args={[0.69, 1.5]} />
        <meshBasicMaterial ref={screenB} map={textures[0]} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.0466]}>
        <planeGeometry args={[0.69, 1.5]} />
        <meshBasicMaterial ref={screenA} map={textures[0]} transparent toneMapped={false} />
      </mesh>
      {/* dynamic island */}
      <mesh position={[0, 0.68, 0.047]}>
        <planeGeometry args={[0.15, 0.038]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* camera plateau */}
      <RoundedBox args={[0.3, 0.3, 0.03]} radius={0.06} position={[0.18, 0.56, -0.055]} material={mats.titanium} />
      <mesh position={[0.24, 0.62, -0.072]} rotation={[Math.PI / 2, 0, 0]} material={mats.glass}>
        <cylinderGeometry args={[0.052, 0.052, 0.02, 32]} />
      </mesh>
      <mesh position={[0.12, 0.5, -0.072]} rotation={[Math.PI / 2, 0, 0]} material={mats.glass}>
        <cylinderGeometry args={[0.052, 0.052, 0.02, 32]} />
      </mesh>
      {/* side buttons */}
      <mesh position={[0.395, 0.3, 0]} material={mats.titanium}>
        <boxGeometry args={[0.012, 0.18, 0.03]} />
      </mesh>
      <mesh position={[-0.395, 0.38, 0]} material={mats.titanium}>
        <boxGeometry args={[0.012, 0.1, 0.03]} />
      </mesh>
    </group>
  )
}

function Property({ state, motion }: { state: React.RefObject<ShowcaseState>; motion: boolean }) {
  const mats = materials()
  const group = useRef<THREE.Group>(null)
  const floors = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        y: 0.12 + i * 0.26,
        w: i < 2 ? 2.4 : i < 6 ? 1.9 : 1.5,
        d: i < 2 ? 1.6 : i < 6 ? 1.3 : 1.1,
        x: i >= 6 ? -0.2 : 0,
      })),
    [],
  )
  useFrame((s, dt) => {
    const st = state.current
    if (!group.current || !st) return
    const k = motion ? 1 - Math.exp(-dt * 3) : 1
    const targetRot = -0.8 + st.progress * 1.2 + (motion ? s.pointer.x * 0.15 : 0)
    group.current.rotation.y += (targetRot * (1 - st.enter) - group.current.rotation.y) * k
    // dolly toward the entrance when the tour opens
    const camZ = 7.2 - st.enter * 4.6
    const camY = 2.4 - st.enter * 1.9
    s.camera.position.z += (camZ - s.camera.position.z) * k
    s.camera.position.y += (camY - s.camera.position.y) * k
    s.camera.lookAt(0, 1.0 - st.enter * 0.6, 0)
  })
  return (
    <group ref={group} position={[0, -0.6, 0]}>
      <mesh position={[0, -0.04, 0]} material={mats.darkMetal}>
        <boxGeometry args={[3.6, 0.08, 2.6]} />
      </mesh>
      {floors.map((f, i) => (
        <group key={i} position={[f.x, f.y, 0]}>
          <mesh material={mats.titanium}>
            <boxGeometry args={[f.w, 0.035, f.d]} />
          </mesh>
          <mesh position={[0, 0.12, 0]} material={mats.glass}>
            <boxGeometry args={[f.w - 0.12, 0.2, f.d - 0.12]} />
          </mesh>
          {i % 3 === 1 && (
            <mesh position={[0, 0.12, f.d / 2 - 0.05]}>
              <boxGeometry args={[f.w - 0.3, 0.008, 0.008]} />
              <meshBasicMaterial color={palette.tealBright} toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
      {/* vertical fins */}
      {[-0.7, -0.23, 0.23, 0.7].map((x) => (
        <mesh key={x} position={[x, 1.2, 0.66]} material={mats.titanium}>
          <boxGeometry args={[0.025, 2.4, 0.025]} />
        </mesh>
      ))}
    </group>
  )
}

interface ShowcaseProps {
  variant: 'phone' | 'property'
  state: React.RefObject<ShowcaseState>
  screens?: string[]
  motion: boolean
  quality: 'high' | 'low'
}

export default function ProjectDeviceShowcase({ variant, state, screens, motion, quality }: ShowcaseProps) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 1.75] : 1}
      camera={variant === 'phone' ? { position: [0, 0, 3.4], fov: 30 } : { position: [0, 2.4, 7.2], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneLighting quality={quality} />
      {variant === 'phone' ? <Phone state={state} screens={screens} motion={motion} /> : <Property state={state} motion={motion} />}
    </Canvas>
  )
}
