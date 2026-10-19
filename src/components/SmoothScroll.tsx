// Inertial scrolling (Lenis) synced with GSAP ScrollTrigger. Native scroll position is kept,
// so keyboard, find-in-page and assistive tech behave normally. Off for reduced motion.
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export let lenis: Lenis | null = null

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function SmoothScroll({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (enabled) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true })
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (t: number) => lenis?.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      return () => {
        gsap.ticker.remove(tick)
        lenis?.destroy()
        lenis = null
      }
    }
  }, [enabled])

  // In-page anchors glide instead of jumping.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a || a.getAttribute('href') === '#') return
      const hash = a.getAttribute('href')!
      if (!document.querySelector(hash)) return
      e.preventDefault()
      scrollToHash(hash)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
