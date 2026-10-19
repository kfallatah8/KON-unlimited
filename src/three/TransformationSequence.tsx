// Scroll → formation index. Every element with data-scene="n" is an anchor; the
// visitor's viewport centre between two anchors gives a continuous index.
// No scroll-jacking: native scrolling drives everything, the 3D just follows.
// Anchor positions are measured once (and on resize), so scrolling never forces a
// layout read; the per-frame work is a few additions against window.scrollY.
import { useEffect } from 'react'
import { store } from '../state/store'

interface Anchor { y: number; s: number }
interface Band { top: number; bottom: number }

export function TransformationSequence() {
  useEffect(() => {
    let anchors: Anchor[] = []
    let bands: Band[] = []
    let vh = window.innerHeight
    let frame = 0

    const measure = () => {
      vh = window.innerHeight
      const sy = window.scrollY
      anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]')).map((el) => {
        const r = el.getBoundingClientRect()
        // anchor point: the element's centre, capped so tall sections settle early
        return { y: r.top + sy + Math.min(r.height / 2, vh * 0.55), s: Number(el.dataset.scene) }
      })
      // opaque bands: while one fills the viewport the WebGL stage is hidden behind it
      bands = Array.from(document.querySelectorAll<HTMLElement>('.solid, .cases')).map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top + sy, bottom: r.bottom + sy }
      })
      compute()
    }

    const compute = () => {
      frame = 0
      if (!anchors.length) return
      const sy = window.scrollY
      const v = sy + vh / 2
      let scene = anchors[0].s
      if (v >= anchors[anchors.length - 1].y) scene = anchors[anchors.length - 1].s
      else {
        for (let i = 0; i < anchors.length - 1; i++) {
          const a = anchors[i]
          const b = anchors[i + 1]
          if (v >= a.y && v < b.y) {
            scene = a.s + ((v - a.y) / (b.y - a.y)) * (b.s - a.s)
            break
          }
        }
      }
      // keep a small margin so the stage wakes a moment before it is revealed
      const covered = bands.some((b) => b.top <= sy - 40 && b.bottom >= sy + vh + 40)
      store.setSilent({ scene, covered })
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute)
    }
    let resizeFrame = 0
    const onResize = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(measure)
    }
    measure()
    // content above the anchors can change height (fonts, lazy 3D, language switch)
    const ro = new ResizeObserver(onResize)
    ro.observe(document.body)
    document.fonts?.ready.then(onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
    }
  }, [])
  return null
}
