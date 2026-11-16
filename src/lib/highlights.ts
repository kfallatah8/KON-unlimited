/** One highlight voice for the whole site.
 *  Every highlighted phrase (** **, ++ ++, the dedication, the founder's name) sits in the page
 *  as ordinary text. As the reader scrolls down and the phrase crosses the reading line (72% of
 *  the viewport), a soft band of light writes it in letter by letter in the reading direction,
 *  a hairline draws under it, and it keeps breathing gently. Scroll back up past it and the
 *  effect lets go; scroll down again and it writes itself again.
 *  No letters are split into spans, so Arabic joining stays intact on every browser. */
const SEL = '.kw, .lux, .dedication .ded-line, .fd-name'

export function initHighlights() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  const seen = new WeakSet<Element>()
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const el = en.target as HTMLElement
      if (en.isIntersecting) el.classList.add('is-hl')
      else if (en.boundingClientRect.top > (en.rootBounds?.bottom ?? innerHeight * 0.72)) el.classList.remove('is-hl')
    }
  }, { rootMargin: '0px 0px -28% 0px', threshold: 0 })

  const prep = (el: HTMLElement) => {
    if (seen.has(el)) return
    seen.add(el)
    // the resting ink is whatever the surrounding text uses, so a phrase reads as plain text until it is read
    const inline = el.classList.contains('kw') || el.classList.contains('lux')
    const host = inline ? el.parentElement ?? el : el
    el.style.setProperty('--ink', getComputedStyle(host).color)
    el.classList.add('hlx')
    const n = (el.textContent ?? '').trim().length
    el.style.setProperty('--hl-dur', `${Math.min(1800, Math.max(700, n * 45))}ms`)
    if (still) { el.classList.add('is-hl'); return }
    io.observe(el)
  }
  let t = 0
  const scan = () => { t = 0; document.querySelectorAll<HTMLElement>(SEL).forEach(prep) }
  scan()
  new MutationObserver(() => { if (!t) t = window.setTimeout(scan, 120) }).observe(document.body, { childList: true, subtree: true })
}
