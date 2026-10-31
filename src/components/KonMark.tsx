// The crisp "KON" outline the gems settle into. Drawn from the same glyphs and the same world
// layout as the 3D word, so the outline and the gem letters line up at every screen size.
import { useEffect, useRef } from 'react'
import { drawKon, KON, konLayout, measureKon } from '../three/konGlyphs'

const FOV = 34
const CAM_Z = 14

export function KonMark({ solid }: { solid?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!
    const paint = () => {
      // Measure the real WebGL canvas, not the window: on phones the browser bar changes the
      // viewport height, and desktop scrollbars change its width. Both would shift the outline.
      const gl = document.querySelector<HTMLElement>('.gem-canvas')
      const r = gl?.getBoundingClientRect()
      const w = r && r.width > 0 ? r.width : document.documentElement.clientWidth
      const h = r && r.height > 0 ? r.height : window.innerHeight
      const glMid = r && r.height > 0 ? r.top + h / 2 : h / 2
      const stage = cv.parentElement?.parentElement
      const stageH = stage?.getBoundingClientRect().height || h
      const vhW = 2 * Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z
      const pxPerUnit = h / vhW
      const { width, centerY } = konLayout(vhW * (w / h), vhW, w < 700, h < 520)
      const ctx0 = cv.getContext('2d')!
      const { total } = measureKon(ctx0)
      const scale = (width * pxPerUnit) / total
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      // Padding around the glyphs so the glow is never clipped by the canvas edge.
      const P = solid ? 0 : 120
      const cssW = (total + P * 2) * scale
      const cssH = (KON.H + P * 2) * scale
      cv.style.width = `${cssW}px`
      cv.style.height = `${cssH}px`
      cv.parentElement?.style.setProperty('--kon-y', `${glMid - stageH / 2 - centerY * pxPerUnit}px`)
      cv.width = Math.round(cssW * dpr)
      cv.height = Math.round(cssH * dpr)
      const ctx = cv.getContext('2d')!
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, P * scale * dpr, P * scale * dpr)
      // shadowBlur ignores the transform, so convert glyph units to device pixels.
      const blur = (u: number) => u * scale * dpr
      ctx.font = KON.font
      const g = ctx.createLinearGradient(0, 0, total, KON.H)
      g.addColorStop(0, '#a8f5ea')
      g.addColorStop(0.45, '#2fc9b5')
      g.addColorStop(0.75, '#0f8f86')
      g.addColorStop(1, '#d6c08f')
      if (solid) {
        ctx.fillStyle = g
        drawKon(ctx, 0, (l, x, y) => ctx.fillText(l, x, y))
        return
      }
      // Soft inner tint, then glow built up in layers from wide and faint to narrow, so it melts
      // into the night with a long, even falloff. The line itself is a soft light, not a hard
      // edge: no bright core stroke.
      ctx.fillStyle = 'rgba(63, 208, 189, 0.07)'
      drawKon(ctx, 0, (l, x, y) => ctx.fillText(l, x, y))
      ctx.strokeStyle = g
      const pass = (color: string, b: number, w: number, a: number) => {
        ctx.shadowColor = color
        ctx.shadowBlur = blur(b)
        ctx.lineWidth = w / scale
        ctx.globalAlpha = a
        drawKon(ctx, 0, (l, x, y) => ctx.strokeText(l, x, y))
      }
      pass('rgba(47, 224, 203, 0.35)', 46, 2.4, 0.22)
      pass('rgba(47, 224, 203, 0.45)', 24, 2, 0.32)
      pass('rgba(168, 245, 234, 0.55)', 10, 1.4, 0.5)
      pass('rgba(168, 245, 234, 0.5)', 4, 1, 0.42)
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    }
    paint()
    let id = 0
    const on = () => {
      cancelAnimationFrame(id)
      id = requestAnimationFrame(paint)
    }
    window.addEventListener('resize', on)
    // The canvas mounts lazily and can resize without a window resize (phone browser bars).
    const ro = new ResizeObserver(on)
    const watch = () => {
      const gl = document.querySelector('.gem-canvas')
      if (gl) ro.observe(gl)
      return !!gl
    }
    const poll = watch() ? 0 : window.setInterval(() => watch() && window.clearInterval(poll), 500)
    return () => {
      ro.disconnect()
      window.clearInterval(poll)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(id)
    }
  }, [solid])
  return <canvas ref={ref} className="kon-mark" aria-hidden="true" />
}
