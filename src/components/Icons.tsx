// Hairline icons drawn for KON (24px grid, 1.4 stroke). Each one illustrates its reason literally.
import type { ReactElement } from 'react'
import type { IconId } from '../content/site'

const paths: Record<IconId, ReactElement> = {
  // a path bending around an obstacle
  flex: (<><circle cx="12" cy="12" r="2.6" /><path d="M3 18c4 0 5-3 6-6s2-6 6-6h6" /><path d="M18 3l3 3-3 3" /></>),
  // two lines rising together
  aligned: (<><path d="M3 20l6-6 4 3 8-9" /><path d="M3 16l6-6 4 3 8-9" opacity=".55" /><path d="M17 4h4v4" /></>),
  // a faceted spark
  spark: (<><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" /></>),
  // stacked planes = many sectors
  layers: (<><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 12.5l9 5 9-5" /><path d="M3 17l9 5 9-5" opacity=".55" /></>),
  // one node fanning out to many
  ai: (<><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="5" r="1.5" /><circle cx="19" cy="12" r="1.5" /><circle cx="18" cy="19" r="1.5" /><path d="M8.3 11l8.3-5.3M8.4 12h9.1M8.3 13l8.3 5.3" /></>),
  // a closed loop
  cycle: (<><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v4h-4" /><path d="M9 12.5l2 2 4-4.5" /></>),
  // head with a gem inside
  mind: (<><path d="M14 21v-3h2a2 2 0 0 0 2-2v-2l2-1-2-4a7 7 0 1 0-11 6.3V21" /><path d="M11 7.5l2 0 1.2 1.6L12 12l-2.2-2.9z" /></>),
  // flag planted on ground
  field: (<><path d="M6 21V4" /><path d="M6 4h11l-2.5 3.5L17 11H6" /><path d="M3 21h18" /></>),
  storm: (<><path d="M7 16a4.5 4.5 0 1 1 1-8.9A6 6 0 0 1 19.5 9 3.6 3.6 0 0 1 18 16" /><path d="M12.5 13l-2 4h3l-2 4" /></>),
  anchor: (<><circle cx="12" cy="5" r="2" /><path d="M12 7v14" /><path d="M5 13a7 7 0 0 0 14 0" /><path d="M8.5 10h7" /></>),
  rise: (<><path d="M3 21h18" /><path d="M6 17v-4M10.5 17V9M15 17v-6M19.5 17V5" /></>),
  seed: (<><path d="M12 21v-8" /><path d="M12 13c0-4 3-7 8-7 0 5-3 7-8 7z" /><path d="M12 15c0-3-2.4-5.5-7-5.5 0 4 2.6 5.5 7 5.5z" /></>),
  compass: (<><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>),
  eye: (<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>),
  people: (<><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M2.5 20a5.5 5.5 0 0 1 11 0" /><path d="M14 15.2A4.5 4.5 0 0 1 21.5 19" /></>),
  train: (<><path d="M3 9l9-5 9 5-9 5z" /><path d="M7 11.3V16c3 2 7 2 10 0v-4.7" /><path d="M21 9v5" /></>),
  // a sphere with an orbit = 360° tour
  tour: (<><circle cx="12" cy="12" r="8.5" /><ellipse cx="12" cy="12" rx="8.5" ry="3.2" /><path d="M17.5 9.3l2.3 1.4-2.6.9" /></>),
  // a map pin inside a 360° ring
  pin: (<><path d="M12 15.5s-4.2-4-4.2-7a4.2 4.2 0 0 1 8.4 0c0 3-4.2 7-4.2 7z" /><circle cx="12" cy="8.5" r="1.4" /><ellipse cx="12" cy="17.5" rx="8.5" ry="3" /></>),
  // a browser window
  web: (<><rect x="3" y="4.5" width="18" height="15" rx="2" /><path d="M3 8.5h18" /><path d="M6 6.5h.01M8.2 6.5h.01" /><path d="M7 13h6M7 16h10" opacity=".6" /></>),
  // a pen nib drawing a mark
  brand: (<><path d="M12 3l5 6-5 9-5-9z" /><path d="M12 11v7" /><circle cx="12" cy="10" r="1.2" /><path d="M5 21h14" /></>),
  // a service bell
  guest: (<><path d="M4 17a8 8 0 0 1 16 0z" /><path d="M2.5 20h19" /><path d="M12 9V6.5M10.5 6.5h3" /></>),
  // a target with an arrow home
  sales: (<><circle cx="11" cy="13" r="8" /><circle cx="11" cy="13" r="4" /><path d="M11 13l9-9M16.5 4H20v3.5" /></>),
  // a stepped path climbing to a flag
  growth: (<><path d="M3 20h5v-5h5v-5h5" /><path d="M18 10V3l3 1.5-3 1.5" /></>),
  // a 2×2 grid of modules
  systems: (<><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" opacity=".55" /></>),
  bulb: (<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" /></>),
}

export function Icon({ id, className }: { id: IconId; className?: string }) {
  return (
    <svg className={className ?? 'icon'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[id]}
    </svg>
  )
}

/** A small faceted gem used as a bullet and brand mark. */
export function GemMark({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'gem-mark'} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10l4 5-9 11L3 9z" fill="currentColor" opacity=".18" />
      <path d="M7 4h10l4 5-9 11L3 9z M3 9h18 M9 9l3 11 3-11 M7 4l2 5 3-5 3 5 2-5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}
