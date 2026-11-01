// Renders copy with **keyword** marks as highlighted <strong> spans, and ++keyword++ as the rarer
// champagne-gold "signature" highlight (one or two per section at most, so it keeps its weight).
import { Fragment } from 'react'

export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*|\+\+.+?\+\+)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i} className="kw">{p.slice(2, -2)}</strong>
        if (p.startsWith('++') && p.endsWith('++') && p.length > 4) return <strong key={i} className="lux">{p.slice(2, -2)}</strong>
        return <Fragment key={i}>{p}</Fragment>
      })}
    </>
  )
}

/** Plain text (for aria labels, briefs). */
export const plain = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\+\+(.+?)\+\+/g, '$1')
