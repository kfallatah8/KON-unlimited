// Renders copy with **keyword** marks as highlighted <strong> spans.
import { Fragment } from 'react'

export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i} className="kw">{p}</strong> : <Fragment key={i}>{p}</Fragment>))}</>
}

/** Plain text (for aria labels, briefs). */
export const plain = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1')
