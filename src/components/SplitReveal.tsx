// Word-by-word masked reveal. Splits on spaces only, so Arabic letter joining is never broken.
import { createElement, Fragment, useEffect, useRef, type ElementType } from 'react'
import gsap from 'gsap'

interface Props {
  as?: ElementType
  text: string | string[] // array = forced lines
  className?: string
  id?: string
  /** play immediately when true (hero); otherwise on scroll */
  play?: boolean
  delay?: number
}

export function SplitReveal({ as = 'h2', text, className, id, play, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null)
  const lines = Array.isArray(text) ? text : [text]

  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const words = el.querySelectorAll('.wi')
    const quick = matchMedia('(pointer: coarse)').matches
    if (play === false) {
      gsap.set(words, { yPercent: 110 })
      return
    }
    const tween = gsap.fromTo(
      words,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: quick ? 0.9 : 1.25,
        ease: 'expo.out',
        stagger: quick ? 0.04 : 0.06,
        delay,
        scrollTrigger: play ? undefined : { trigger: el, start: quick ? 'top 98%' : 'top 88%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [play, delay, text])

  return createElement(
    as,
    { ref, className, id, 'aria-label': lines.join(' ') },
    lines.map((line, li) => (
      <span key={li} className="line" aria-hidden="true">
        {line.split(' ').map((w, wi, all) => (
          <Fragment key={wi}>
            <span className="w">
              <span className="wi">{w}</span>
            </span>
            {wi < all.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    )),
  )
}
