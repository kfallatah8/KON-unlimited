/** Values the page writes on scroll and the light world reads every frame (no React re-renders). */
export const depthState = {
  /** 0 top of the page .. 1 bottom */
  depth: 0,
  /** 0..1 progress through the pressure chapter */
  press: 0,
  /** 0..1 how much of the pressure chapter is on screen */
  pv: 0,
  /** 0..1 the finale light */
  rise: 0,
  px: 0.5,
  py: 0.6,
  onChange: null as null | (() => void),
}
