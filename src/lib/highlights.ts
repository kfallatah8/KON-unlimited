/** Highlights v5: a liquid ink marker that follows the scroll.
 *  Every highlighted phrase (** **, ++ ++, the dedication, the founder's name) rests as plain text.
 *  As it rises through the reading zone, a translucent teal glass band pours in behind it from
 *  the reading start, tied directly to the scroll position (--p, 0..1), and the text brightens to
 *  white with it. Scroll back and the ink drains out the same way. Once full it carries a slow sheen.
 *  One rAF loop, only for phrases on screen; nothing is split, so Arabic joining stays intact. */
const SEL = '.kw, .lux, .dedication .ded-line, .fd-name'

export function initHighlights() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  const seen = new WeakSet<Element>()
  const live = new Set<HTMLElement>()
  let raf = 0

  const tick = () => {
    raf = 0
    const vh = innerHeight
    // the zone: the ink starts at 90% of the screen height and is full by 58%
    const a = vh * 0.9, b = vh * 0.58
    for (const el of live) {
      const r = el.getBoundingClientRect()
      const y = r.top + r.height / 2
      // the hero fills itself once its entrance has played; everything else follows the scroll
      const p = el.classList.contains('hlx-hero')
        ? (document.documentElement.classList.contains('is-ready') && performance.now() > 1800 ? 1 : 0)
        : Math.max(0, Math.min(1, (a - y) / (a - b)))
      const q = Math.round(p * 1000) / 1000
      if (el.dataset.p !== String(q)) { el.dataset.p = String(q); el.style.setProperty('--p', String(q)) }
      el.classList.toggle('is-full', q >= 1)
    }
  }
  const ask = () => { if (!raf) raf = requestAnimationFrame(tick) }

  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const el = en.target as HTMLElement
      if (en.isIntersecting) live.add(el)
      else live.delete(el)
    }
    ask()
  }, { rootMargin: '10% 0px 10% 0px' })

  const prep = (el: HTMLElement) => {
    if (seen.has(el)) return
    seen.add(el)
    const inline = el.classList.contains('kw') || el.classList.contains('lux')
    const host = inline ? el.parentElement ?? el : el
    el.style.setProperty('--ink', getComputedStyle(host).color)
    el.classList.add('hlx', inline ? 'hlx-in' : 'hlx-lg')
    if (el.closest('.hero')) el.classList.add('hlx-hero')
    if (still) { el.style.setProperty('--p', '1'); el.classList.add('is-full'); return }
    io.observe(el)
  }
  let t = 0
  const scan = () => { t = 0; document.querySelectorAll<HTMLElement>(SEL).forEach(prep); ask() }
  scan()
  new MutationObserver(() => { if (!t) t = window.setTimeout(scan, 120) }).observe(document.body, { childList: true, subtree: true })
  addEventListener('scroll', ask, { passive: true })
  addEventListener('resize', ask, { passive: true })
  ;[1900, 2600, 3600].forEach((ms) => setTimeout(ask, ms))
}
