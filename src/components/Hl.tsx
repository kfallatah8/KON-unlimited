// Kept apart from SplitReveal so pages that only need Hl don't pull in GSAP.
/** A short headline without its commas: each clause sits on its own line, so the break does the comma's job. */
export function Hl({ text }: { text: string }) {
  const parts = text.split(/(?<=[.،,])\s+/).map((x) => x.replace(/[.،,]$/, '')).filter(Boolean)
  if (parts.length < 2) return <>{parts[0] ?? text}</>
  return <>{parts.map((x, i) => <span key={i} className="hl-line">{x}{i < parts.length - 1 ? ' ' : ''}</span>)}</>
}
