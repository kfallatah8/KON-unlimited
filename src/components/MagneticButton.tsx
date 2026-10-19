// Magnetic CTA: follows the pointer within a small radius. Disabled for touch and reduced motion.
import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'

interface Props {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
}

export function MagneticButton({ href, children, variant = 'primary' }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * 0.28)
      y((e.clientY - (r.top + r.height / 2)) * 0.35)
    }
    const leave = () => { x(0); y(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])
  return (
    <a ref={ref} href={href} className={`btn btn-${variant}`}>
      <span>{children}</span>
    </a>
  )
}
