// A quiet hairline cursor ring that grows over interactive elements. Fine pointers only.
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = ring.current!
    const d = dot.current!
    document.documentElement.classList.add('has-cursor')
    const rx = gsap.quickTo(r, 'x', { duration: 0.55, ease: 'power3.out' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.55, ease: 'power3.out' })
    const dx = gsap.quickTo(d, 'x', { duration: 0.12 })
    const dy = gsap.quickTo(d, 'y', { duration: 0.12 })
    const move = (e: PointerEvent) => {
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY)
      const t = e.target as HTMLElement
      const hot = !!t.closest('a, button, select, input, label, [role="button"]')
      r.classList.toggle('is-hot', hot)
    }
    const leave = () => r.classList.add('is-out')
    const enter = () => r.classList.remove('is-out')
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
    }
  }, [])
  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  )
}
