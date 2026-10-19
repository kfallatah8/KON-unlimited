import { useEffect, useState, type RefObject } from 'react'

/** True while the element is within `margin` of the viewport. Used to mount/unmount 3D. */
export function useInView(ref: RefObject<Element | null>, margin = '200px') {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return inView
}

/** 0..1 progress of an element moving through the viewport. */
export function sectionProgress(el: Element) {
  const r = el.getBoundingClientRect()
  const total = r.height + window.innerHeight
  return Math.min(1, Math.max(0, (window.innerHeight - r.top) / total))
}
