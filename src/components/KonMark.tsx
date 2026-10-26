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
      const w = window.innerWidth
      const h = window.innerHeight
      const vhW = 2 * Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z
      const pxPerUnit = h / vhW
      const { width, centerY } = konLayout(vhW * (w / h), vhW, w < 700)
      const ctx0 = cv.getContext('2d')!
      const { total } = measureKon(ctx0)
      const scale = (width * pxPerUnit) / total
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      // Padding around the glyphs so the glow is never clipped by the canvas edge.
      const P = solid ? 0 : 70
      const cssW = (total + P * 2) * scale
      const cssH = (KON.H + P * 2) * scale
      cv.style.width = `${cssW}px`
      cv.style.height = `${cssH}px`
      cv.parentElement?.style.setProperty('--kon-y', `${-centerY * pxPerUnit}px`)
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
      // Soft inner tint, a wide teal bloom, then a fine bright outline with a tight glow.
      ctx.fillStyle = 'rgba(63, 208, 189, 0.08)'
      drawKon(ctx, 0, (l, x, y) => ctx.fillText(l, x, y))
      ctx.strokeStyle = g
      ctx.shadowColor = 'rgba(47, 224, 203, 0.5)'
      ctx.shadowBlur = blur(34)
      ctx.lineWidth = 3 / scale
      ctx.globalAlpha = 0.55
      drawKon(ctx, 0, (l, x, y) => ctx.strokeText(l, x, y))
      ctx.globalAlpha = 1
      ctx.shadowColor = 'rgba(168, 245, 234, 0.8)'
      ctx.shadowBlur = blur(8)
      ctx.lineWidth = 1.8 / scale
      drawKon(ctx, 0, (l, x, y) => ctx.strokeText(l, x, y))
      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(244, 252, 250, 0.5)'
      ctx.lineWidth = 0.7 / scale
      drawKon(ctx, 0, (l, x, y) => ctx.strokeText(l, x, y))
    }
    paint()
    let id = 0
    const on = () => {
      cancelAnimationFrame(id)
      id = requestAnimationFrame(paint)
    }
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      cancelAnimationFrame(id)
    }
  }, [solid])
  return <canvas ref={ref} className="kon-mark" aria-hidden="true" />
}
