// Elevated-edition UI details: animated proof figures, a chapter rail, a header that steps aside
// while reading, and a soft light that follows the pointer across cards.
import { useEffect, useRef, useState } from 'react'
import { useContent } from '../content/useContent'

/** "+4,200" → counts up from zero once the opening plays, keeping prefix, separators and suffix. */
export function CountUp({ value, play }: { value: string; play: boolean }) {
  const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/)
  const [shown, setShown] = useState(m ? m[1] + '0' + m[3] : value)
  useEffect(() => {
    if (!m || !play) return
    const target = parseFloat(m[2].replace(/,/g, ''))
    const comma = m[2].includes(',')
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(value); return }
    let raf = 0
    const t0 = performance.now() + 500
    const dur = 1900
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur))
      const e = 1 - Math.pow(1 - p, 4)
      const n = Math.round(target * e)
      setShown(m[1] + (comma ? n.toLocaleString('en-US') : String(n)) + m[3])
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [play, value])
  return <>{shown}</>
}

/** Fixed chapter rail (wide screens): where you are in the story, one tap to any chapter. */
export function ChapterRail() {
  const c = useContent()
  const [active, setActive] = useState('')
  const [on, setOn] = useState(false)
  const items = c.nav
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const mid = window.innerHeight * 0.45
      let cur = ''
      for (const n of items) {
        if (n.href.startsWith('#/')) continue
        const el = document.querySelector(n.href)
        if (el && el.getBoundingClientRect().top < mid) cur = n.href
      }
      const fin = document.getElementById('finale')?.getBoundingClientRect()
      setActive(cur)
      setOn(window.scrollY > window.innerHeight * 0.8 && !(fin && fin.top < window.innerHeight * 0.6))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check) }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [items])
  return (
    <nav className={`chapter-rail${on ? ' is-on' : ''}`} aria-label="Chapters">
      {items.filter((n) => !n.href.startsWith('#/')).map((n) => (
        <a key={n.href} href={n.href} className={active === n.href ? 'is-active' : ''} aria-current={active === n.href ? 'true' : undefined}>
          <span className="cr-label">{n.label}</span>
          <i aria-hidden="true" />
        </a>
      ))}
    </nav>
  )
}

/** Header slides away while reading down, returns the moment you scroll up. */
export function useHeaderAutoHide() {
  useEffect(() => {
    let last = window.scrollY, frame = 0, hidden = false
    const root = document.documentElement
    const check = () => {
      frame = 0
      const y = window.scrollY
      const d = y - last
      if (Math.abs(d) < 6) return
      const hide = d > 0 && y > window.innerHeight * 0.9 && !root.classList.contains('menu-open')
      if (hide !== hidden) { hidden = hide; root.classList.toggle('header-away', hide) }
      last = y
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); root.classList.remove('header-away') }
  }, [])
}

/** One pointer listener for the whole page: the card under the pointer gets a soft light at the
 *  pointer, painted by CSS from two custom properties. Fine pointers only. */
export function useCardLight() {
  const last = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    let frame = 0, ev: PointerEvent | null = null
    const paint = () => {
      frame = 0
      if (!ev) return
      const el = (ev.target as HTMLElement).closest?.<HTMLElement>('.glass, .why-item, .offer-card')
      if (last.current && last.current !== el) last.current.classList.remove('is-lit')
      last.current = el
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${ev.clientX - r.left}px`)
      el.style.setProperty('--my', `${ev.clientY - r.top}px`)
      el.classList.add('is-lit')
    }
    const move = (e: PointerEvent) => { ev = e; if (!frame) frame = requestAnimationFrame(paint) }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(frame) }
  }, [])
}
