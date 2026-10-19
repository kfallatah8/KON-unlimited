// In-page 360° viewer for equirectangular photos (2:1 JPG). Drag or swipe to look around,
// wheel or pinch to zoom, room chips to move between scenes. Used where third-party
// tour embeds cannot load (the single-file preview), and works on any host.
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export interface PanoScene {
  src: string
  label: string
}

export default function PanoramaViewer({ scenes, motion, label }: { scenes: PanoScene[]; motion: boolean; label: string }) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ load: (i: number) => void } | null>(null)
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100)
    const geo = new THREE.SphereGeometry(10, 64, 40)
    geo.scale(-1, 1, 1)
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    scene.add(new THREE.Mesh(geo, mat))
    const loader = new THREE.TextureLoader()
    const maxAniso = renderer.capabilities.getMaxAnisotropy()

    let lon = 0, lat = 0, tLon = 0, tLat = 0, fov = 75, tFov = 75, fade = 0
    let idle = 0
    let last = performance.now()
    let raf = 0
    let current = -1

    const load = (i: number) => {
      if (i === current) return
      current = i
      setLoading(true)
      loader.load(scenes[i].src, (tex) => {
        if (current !== i) return tex.dispose()
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = maxAniso
        mat.map?.dispose()
        mat.map = tex
        mat.needsUpdate = true
        fade = 0
        setLoading(false)
      })
    }
    api.current = { load }
    load(0)

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(1, height)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    // pointer drag (mouse and touch), two-finger pinch zoom
    const pts = new Map<number, { x: number; y: number }>()
    let pinch = 0
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId)
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      idle = 0
    }
    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId)
      if (!p) return
      if (pts.size === 2) {
        const [a, b] = [...pts.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        p.x = e.clientX; p.y = e.clientY
        const [a2, b2] = [...pts.values()]
        const d2 = Math.hypot(a2.x - b2.x, a2.y - b2.y)
        if (pinch) tFov = THREE.MathUtils.clamp(tFov - (d2 - d) * 0.12, 35, 90)
        pinch = 1
        return
      }
      const k = (fov / 75) * 0.12
      tLon -= (e.clientX - p.x) * k
      tLat += (e.clientY - p.y) * k
      tLat = THREE.MathUtils.clamp(tLat, -80, 80)
      p.x = e.clientX; p.y = e.clientY
    }
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId)
      if (pts.size < 2) pinch = 0
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      tFov = THREE.MathUtils.clamp(tFov + e.deltaY * 0.03, 35, 90)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = performance.now()
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      idle += dt
      if (motion && idle > 4 && pts.size === 0) tLon += dt * 1.8
      lon += (tLon - lon) * 0.12
      lat += (tLat - lat) * 0.12
      fov += (tFov - fov) * 0.12
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov
        camera.updateProjectionMatrix()
      }
      if (mat.map && fade < 1) {
        fade = Math.min(1, fade + (motion ? dt * 2.5 : 1))
        mat.opacity = fade
      }
      const phi = THREE.MathUtils.degToRad(90 - lat)
      const theta = THREE.MathUtils.degToRad(lon)
      camera.lookAt(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta))
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      mat.map?.dispose()
      mat.dispose()
      geo.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      api.current = null
    }
  }, [scenes, motion])

  const go = (i: number) => {
    setActive(i)
    api.current?.load(i)
  }

  return (
    <div className="pano" role="region" aria-label={label}>
      <div className="pano-canvas" ref={host} />
      {loading && <div className="pano-loading" aria-hidden="true" />}
      {scenes.length > 1 && (
        <div className="pano-rooms" role="group">
          {scenes.map((s, i) => (
            <button key={s.src} type="button" aria-pressed={active === i} onClick={() => go(i)}>{s.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}
